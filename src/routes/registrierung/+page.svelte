<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { register, login, getAccessToken } from '$lib/utils/auth';
  import { track, identifyUser } from '$lib/utils/mixpanel';

  let email = $state('');
  let password = $state('');
  let firstName = $state('');
  let error = $state('');
  let loading = $state(false);

  async function onSubmit() {
    error = '';
    loading = true;
    try {
      await register(email, password, firstName, '');
      await login(email, password);

      // Analytics: identify user + track registration
      try {
        const meRes = await fetch('/api/me', {
          headers: { Authorization: `Bearer ${getAccessToken()}` }
        });
        if (meRes.ok) {
          const me = await meRes.json();
          if (me?.data?.id) identifyUser(me.data.id);
        }
      } catch { /* non-blocking */ }
      track('user_registered', {
        method: 'email_password',
        next_url: $page.url.searchParams.get('next') ?? null
      });

      const next = $page.url.searchParams.get('next') ?? '/dashboard';
      await goto(next);
    } catch (e: any) {
      error = e?.message ?? 'Registrierung fehlgeschlagen.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head><title>Registrieren – AustroFit</title></svelte:head>

<main class="min-h-[calc(100vh-75px)] bg-gray-50 flex items-center justify-center px-4 py-12">
  <div class="w-full max-w-md bg-white rounded-2xl shadow-sm border border-black/10 p-8">

    <div class="mb-8 text-center">
      <div
        class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl"
        style="background:#E8272A1A;"
      >
        🏃
      </div>
      <h1 class="text-2xl font-bold" style="font-family: 'Jost', sans-serif;">
        Punkte sammeln starten
      </h1>
      <p class="mt-2 text-sm text-gray-500">
        Erstelle dein kostenloses Konto und sichere deine verdienten Punkte.
      </p>
    </div>

    <form onsubmit={(e) => { e.preventDefault(); onSubmit(); }} class="flex flex-col gap-4">
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-gray-700">Benutzername</span>
        <input
          bind:value={firstName}
          type="text"
          required
          autocomplete="given-name"
          placeholder="Dein Benutzername"
          class="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
        />
      </label>

      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-gray-700">E-Mail-Adresse</span>
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
          autocomplete="new-password"
          placeholder="Mindestens 8 Zeichen"
          minlength="8"
          class="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
        />
      </label>

      {#if error}
        <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      {/if}

      <button
        type="submit"
        disabled={loading}
        class="mt-1 w-full rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
        style="background:#E8272A;"
      >
        {loading ? 'Konto wird erstellt…' : 'Jetzt registrieren & Punkte sichern'}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-gray-400">
      Bereits registriert?
      <a
        href="/login?next={$page.url.searchParams.get('next') ?? '/dashboard'}"
        class="font-medium text-gray-600 underline underline-offset-2 hover:text-gray-900"
      >
        Jetzt anmelden
      </a>
    </p>

    <p class="mt-3 text-center text-xs text-gray-400">
      Mit der Registrierung stimmst du unseren
      <a href="/datenschutz" class="underline hover:text-gray-600">Datenschutzbestimmungen</a> zu.
    </p>

  </div>
</main>
