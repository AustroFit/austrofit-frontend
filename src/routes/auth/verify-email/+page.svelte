<script lang="ts">
  import { page } from '$app/state';
  import { onMount } from 'svelte';

  type VerifyState = 'loading' | 'success' | 'error';
  let verifyState: VerifyState = $state('loading');
  let errorMessage = $state('');

  onMount(async () => {
    const token = page.url.searchParams.get('token');
    if (!token) {
      verifyState = 'error';
      errorMessage = 'Kein Bestätigungstoken gefunden. Bitte verwende den Link aus deiner E-Mail.';
      return;
    }

    try {
      const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
      if (res.ok || res.status === 204) {
        verifyState = 'success';
      } else {
        const data = await res.json().catch(() => ({}));
        errorMessage = data?.errors?.[0]?.message ?? 'Der Link ist ungültig oder abgelaufen.';
        verifyState = 'error';
      }
    } catch {
      errorMessage = 'Verbindungsfehler. Bitte versuche es erneut.';
      verifyState = 'error';
    }
  });
</script>

<svelte:head><title>E-Mail bestätigen – AustroFit</title></svelte:head>

<main class="min-h-[calc(100vh-75px)] bg-light-grey flex items-center justify-center px-4 py-6">
  <div class="w-full max-w-md bg-white rounded-2xl shadow-sm border border-black/10 p-8 text-center">

    {#if verifyState === 'loading'}
      <div class="mx-auto mb-4 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
        <svg class="h-7 w-7 text-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>
      <h1 class="text-xl font-bold font-heading">E-Mail wird bestätigt…</h1>
      <p class="mt-2 text-sm text-gray-500">Einen Moment bitte.</p>

    {:else if verifyState === 'success'}
      <div class="mx-auto mb-4 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 class="text-xl font-bold font-heading">E-Mail bestätigt!</h1>
      <p class="mt-2 text-sm text-gray-500">Dein Konto ist aktiviert. Du kannst dich jetzt anmelden.</p>
      <a
        href="/login"
        class="mt-6 inline-block w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
      >
        Jetzt anmelden
      </a>

    {:else}
      <div class="mx-auto mb-4 h-14 w-14 rounded-full bg-error/10 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 class="text-xl font-bold font-heading">Link ungültig</h1>
      <p class="mt-2 text-sm text-gray-500">{errorMessage}</p>
      <a
        href="/registrierung"
        class="mt-6 inline-block w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
      >
        Neu registrieren
      </a>
    {/if}

  </div>
</main>
