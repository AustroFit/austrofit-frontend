<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { login, getAccessToken } from '$lib/utils/auth';
  import { identifyUser, track } from '$lib/utils/mixpanel';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);
  let isUnverified = $state(false);
  let resendLoading = $state(false);
  let resendDone = $state(false);

  async function onLogin() {
    error = '';
    isUnverified = false;
    resendDone = false;
    loading = true;
    try {
      await login(email, password);

      // Analytics: User-ID auflösen und Session verknüpfen
      try {
        const meRes = await fetch('/api/me', {
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
        await fetch('/api/auth/init-onboarding', {
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
      const msg: string = e?.message ?? String(e);
      if (msg.toLowerCase().includes('unverified') || msg.toLowerCase().includes('not verified')) {
        isUnverified = true;
      } else {
        error = msg;
      }
    } finally {
      loading = false;
    }
  }

  async function resendVerification() {
    resendLoading = true;
    resendDone = false;
    try {
      await fetch('/api/auth/resend-verification', {
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
