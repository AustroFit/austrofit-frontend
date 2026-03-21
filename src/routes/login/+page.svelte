<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { login, getAccessToken } from '$lib/utils/auth';
  import { identifyUser, track } from '$lib/utils/mixpanel';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  async function onLogin() {
    error = '';
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

      const next = page.url.searchParams.get('next') ?? '/dashboard';
      await goto(next);
    } catch (e: any) {
      error = e?.message ?? String(e);
    } finally {
      loading = false;
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
