<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { login, getAccessToken } from '$lib/utils/auth';
  import { identifyUser, track } from '$lib/utils/mixpanel';
  import { apiUrl } from '$lib/utils/api';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);
  let isUnverified = $state(false);
  let resendLoading = $state(false);
  let resendDone = $state(false);

  const googleErrorMessages: Record<string, string> = {
    aborted: 'Google-Anmeldung abgebrochen.',
    state_mismatch: 'Sicherheitsfehler – bitte erneut versuchen.',
    not_configured: 'Google-Anmeldung ist momentan nicht verfügbar.',
    token_exchange: 'Fehler bei der Anmeldung mit Google.',
    userinfo: 'Google-Profil konnte nicht abgerufen werden.',
    no_email: 'Kein Google-Konto mit E-Mail-Adresse gefunden.',
    create_user: 'Konto konnte nicht erstellt werden.',
    directus_login: 'Anmeldung fehlgeschlagen – bitte erneut versuchen.',
    no_access_token: 'Anmeldung fehlgeschlagen – bitte erneut versuchen.'
  };

  const googleError = $derived.by(() => {
    const raw = page.url.searchParams.get('google_error') ?? '';
    return raw ? (googleErrorMessages[raw] ?? 'Google-Anmeldung fehlgeschlagen.') : '';
  });

  async function onLogin() {
    error = '';
    isUnverified = false;
    resendDone = false;
    loading = true;
    try {
      await login(email, password);

      // Analytics: User-ID auflösen und Session verknüpfen
      try {
        const meRes = await fetch(apiUrl('/api/me'), {
          headers: { Authorization: `Bearer ${getAccessToken()}` }
        });
        if (meRes.ok) {
          const me = await meRes.json();
          if (me?.data?.id) identifyUser(me.data.id);
        }
      } catch { /* non-blocking */ }
      track('user_logged_in', { method: 'email_password' });

      // Init-Onboarding (idempotent): Booster + activity_group setzen
      try {
        const activityGroup = localStorage.getItem('austrofit_activity_group') ?? 'adult';
        await fetch(apiUrl('/api/auth/init-onboarding'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAccessToken()}`
          },
          body: JSON.stringify({ activity_group: activityGroup })
        });
        localStorage.removeItem('austrofit_activity_group');
      } catch { /* non-blocking */ }

      const next = page.url.searchParams.get('next') ?? '/dashboard';
      await goto(next);
    } catch (e: any) {
      if (e?.code === 'USER_UNVERIFIED') {
        isUnverified = true;
      } else {
        error = e?.message ?? 'Anmeldung fehlgeschlagen. Bitte versuche es erneut.';
      }
    } finally {
      loading = false;
    }
  }

  async function resendVerification() {
    resendLoading = true;
    resendDone = false;
    try {
      await fetch(apiUrl('/api/auth/resend-verification'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      resendDone = true;
    } finally {
      resendLoading = false;
    }
  }
</script>

<svelte:head><title>Anmelden – AustroFit</title></svelte:head>

<main class="min-h-[calc(100vh-75px)] bg-light-grey flex items-center justify-center px-4 py-6">
  <div class="w-full max-w-md bg-white rounded-2xl shadow-sm border border-black/10 p-6">

    <div class="mb-5 text-center">
      <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full text-2xl bg-primary/10">
        🏃
      </div>
      <h1 class="text-2xl font-bold font-heading text-heading">Willkommen zurück</h1>
      <p class="mt-1 text-sm text-body">Melde dich an, um deinen Fortschritt zu sehen.</p>
    </div>

    <!-- Google OAuth -->
    <a
      href="/api/auth/google"
      class="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:border-gray-300"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="h-5 w-5 shrink-0">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      Mit Google anmelden
    </a>

    <div class="mt-4 flex items-center gap-3">
      <div class="h-px flex-1 bg-gray-200"></div>
      <span class="text-xs text-gray-400">oder</span>
      <div class="h-px flex-1 bg-gray-200"></div>
    </div>

    {#if googleError}
      <div class="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
        {googleError}
      </div>
    {/if}

    <form onsubmit={(e) => { e.preventDefault(); onLogin(); }} class="flex flex-col gap-4">
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-gray-700">E-Mail</span>
        <input
          bind:value={email}
          type="email"
          required
          autocomplete="email"
          placeholder="deine@email.at"
          class="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
        />
      </label>

      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-gray-700">Passwort</span>
        <input
          bind:value={password}
          type="password"
          required
          autocomplete="current-password"
          placeholder="••••••••"
          class="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
        />
      </label>

      {#if isUnverified}
        <div class="rounded-xl border border-secondary/30 bg-secondary/5 px-4 py-3 text-sm text-secondary">
          <p class="font-medium">Bitte bestätige zuerst deine E-Mail-Adresse.</p>
          <p class="mt-1 text-xs text-gray-500">Kein Link erhalten?
            {#if resendDone}
              <span class="font-medium text-primary">E-Mail wurde gesendet.</span>
            {:else}
              <button
                type="button"
                onclick={resendVerification}
                disabled={resendLoading}
                class="font-medium text-primary underline underline-offset-2 hover:text-primary-dark disabled:opacity-50"
              >{resendLoading ? 'Wird gesendet…' : 'Bestätigungsmail erneut senden'}</button>
            {/if}
          </p>
        </div>
      {/if}

      {#if error}
        <div class="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </div>
      {/if}

      <button
        type="submit"
        disabled={loading}
        class="mt-1 w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold font-heading text-white transition-colors hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Wird geladen…' : 'Anmelden'}
      </button>
    </form>

    <p class="mt-5 text-center text-sm text-gray-400">
      Noch kein Account?
      <a
        href="/registrierung?next={page.url.searchParams.get('next') ?? '/dashboard'}"
        class="font-medium text-gray-600 underline underline-offset-2 hover:text-gray-900">
        Jetzt registrieren
      </a>
    </p>

  </div>
</main>
