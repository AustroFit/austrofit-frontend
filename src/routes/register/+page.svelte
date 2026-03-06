<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { register, login } from '$lib/utils/auth';

  let first_name = '';
  let last_name = '';
  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  async function onRegister() {
    error = '';
    loading = true;
    try {
      await register(email, password, first_name, last_name);
      await login(email, password);
      const next = $page.url.searchParams.get('next') ?? '/';
      await goto(next);
    } catch (e: any) {
      error = e?.message ?? String(e);
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head><title>Registrieren – AustroFit</title></svelte:head>

<main class="min-h-[calc(100vh-75px)] bg-light-grey flex items-center justify-center px-4 py-12">
  <div class="w-full max-w-md bg-white rounded-2xl shadow-sm border border-black/10 p-8">

    <div class="mb-8 text-center">
      <h1 class="text-2xl font-bold font-montserrat text-dark-blue-1">Konto erstellen</h1>
      <p class="mt-1 text-sm text-black/50">Registriere dich, um Punkte zu sammeln und deinen Fortschritt zu verfolgen.</p>
    </div>

    <form onsubmit={(e) => { e.preventDefault(); onRegister(); }} class="flex flex-col gap-4">
      <div class="grid grid-cols-2 gap-3">
        <label class="flex flex-col gap-1">
          <span class="text-sm font-medium text-dark-blue-1">Vorname</span>
          <input
            bind:value={first_name}
            type="text"
            required
            autocomplete="given-name"
            placeholder="Max"
            class="rounded-lg border border-black/20 px-4 py-2.5 text-sm outline-none focus:border-dark-blue-1 focus:ring-2 focus:ring-dark-blue-1/20 transition-colors"
          />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm font-medium text-dark-blue-1">Nachname</span>
          <input
            bind:value={last_name}
            type="text"
            required
            autocomplete="family-name"
            placeholder="Mustermann"
            class="rounded-lg border border-black/20 px-4 py-2.5 text-sm outline-none focus:border-dark-blue-1 focus:ring-2 focus:ring-dark-blue-1/20 transition-colors"
          />
        </label>
      </div>

      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium text-dark-blue-1">E-Mail</span>
        <input
          bind:value={email}
          type="email"
          required
          autocomplete="email"
          placeholder="deine@email.at"
          class="rounded-lg border border-black/20 px-4 py-2.5 text-sm outline-none focus:border-dark-blue-1 focus:ring-2 focus:ring-dark-blue-1/20 transition-colors"
        />
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium text-dark-blue-1">Passwort</span>
        <input
          bind:value={password}
          type="password"
          required
          autocomplete="new-password"
          placeholder="••••••••"
          class="rounded-lg border border-black/20 px-4 py-2.5 text-sm outline-none focus:border-dark-blue-1 focus:ring-2 focus:ring-dark-blue-1/20 transition-colors"
        />
      </label>

      {#if error}
        <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      {/if}

      <button
        type="submit"
        disabled={loading}
        class="mt-2 w-full rounded-lg bg-dark-blue-1 px-6 py-3 text-sm font-semibold font-montserrat text-white transition-colors hover:bg-dark-blue-1/90 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Wird geladen…' : 'Konto erstellen'}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-black/50">
      Schon registriert?
      <a
        href="/login?next={$page.url.searchParams.get('next') ?? '/'}"
        class="font-medium text-dark-blue-1 underline underline-offset-2 hover:text-dark-blue-1/70">
        Jetzt anmelden
      </a>
    </p>

  </div>
</main>
