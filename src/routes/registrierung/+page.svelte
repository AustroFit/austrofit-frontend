<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { register, login, getAccessToken } from '$lib/utils/auth';
  import { track, identifyUser } from '$lib/utils/mixpanel';
  import { pwaPrompt } from '$lib/stores/pwa';

  let email = $state('');
  let password = $state('');
  let firstName = $state('');
  let error = $state('');
  let loading = $state(false);
  let showPassword = $state(false);

  let step = $state(1);
  let installing = $state(false);
  let pwaTab = $state<'android' | 'ios'>('android');
  let isInstalled = $state(false);

  type Strength = 'weak' | 'fair' | 'strong';

  function getStrength(pw: string): Strength | null {
    if (!pw) return null;
    const long = pw.length >= 12;
    const ok = pw.length >= 8;
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    const hasDigit = /[0-9]/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    const types = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;

    if (long && types >= 3) return 'strong';
    if (ok && types >= 2) return 'fair';
    return 'weak';
  }

  const strength = $derived(getStrength(password));

  const strengthLabel: Record<Strength, string> = {
    weak: 'Schwach',
    fair: 'Mittel',
    strong: 'Stark'
  };
  const strengthColor: Record<Strength, string> = {
    weak: 'bg-error',
    fair: 'bg-secondary',
    strong: 'bg-primary'
  };
  const strengthWidth: Record<Strength, string> = {
    weak: 'w-1/3',
    fair: 'w-2/3',
    strong: 'w-full'
  };

  onMount(() => {
    if (!browser) return;
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) pwaTab = 'ios';
    isInstalled = window.matchMedia('(display-mode: standalone)').matches;
  });

  async function onSubmit() {
    error = '';
    loading = true;
    try {
      await register(email, password, firstName, '');
      await login(email, password);

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
        next_url: page.url.searchParams.get('next') ?? null
      });

      const next = page.url.searchParams.get('next');
      const hasRealNext = next && next !== '/dashboard';
      if (hasRealNext || isInstalled) {
        await goto(next!);
      } else {
        step = 2;
      }
    } catch (e: any) {
      if (e?.status === 409 || e?.code === 'EMAIL_EXISTS') {
        const next = page.url.searchParams.get('next') ?? '/dashboard';
        await goto(`/login?next=${encodeURIComponent(next)}`);
        return;
      }
      error = e?.message ?? 'Registrierung fehlgeschlagen.';
    } finally {
      loading = false;
    }
  }

  async function installPWA() {
    const prompt = $pwaPrompt as any;
    if (!prompt) return;
    installing = true;
    try {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        pwaPrompt.set(null);
        await goto('/dashboard');
      }
    } catch (e) {
      console.warn('[PWA] Install prompt failed:', e);
    } finally {
      installing = false;
    }
  }

  async function skipPWA() {
    await goto('/dashboard');
  }
</script>

<svelte:head><title>Registrieren – AustroFit</title></svelte:head>

<main class="min-h-[calc(100vh-75px)] bg-light-grey flex items-center justify-center px-4 py-6">
  <div class="w-full max-w-md bg-white rounded-2xl shadow-sm border border-black/10 p-6">

    <!-- Step Indicator -->
    <div class="flex items-center justify-center mb-6">
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold
          {step > 1 ? 'bg-primary text-white' : 'bg-primary text-white'}">
          {#if step > 1}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          {:else}
            1
          {/if}
        </div>
        <span class="text-sm font-semibold text-primary">Konto erstellen</span>
      </div>

      <div class="w-8 h-0.5 mx-3 {step >= 2 ? 'bg-primary' : 'bg-gray-200'}"></div>

      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold
          {step >= 2 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}">
          2
        </div>
        <span class="text-sm font-semibold {step >= 2 ? 'text-primary' : 'text-gray-400'}">App installieren</span>
      </div>
    </div>

    {#if step === 1}
      <!-- ── Step 1: Registrierungsformular ── -->
      <div class="mb-5 text-center">
        <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold font-heading">Konto erstellen</h1>
        <p class="mt-2 text-sm text-gray-500">
          Erstelle dein kostenloses Konto und starte deine AustroFit-Reise.
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
            placeholder="z. B. MaxMuster"
            class="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
          />
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-sm font-medium text-gray-700">E-Mail-Adresse</span>
          <input
            bind:value={email}
            type="email"
            required
            autocomplete="email"
            placeholder="name@beispiel.at"
            class="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
          />
        </label>

        <div class="flex flex-col gap-1.5">
          <span class="text-sm font-medium text-gray-700">Passwort</span>
          <div class="relative">
            <input
              bind:value={password}
              type={showPassword ? 'text' : 'password'}
              required
              autocomplete="new-password"
              minlength="8"
              class="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
            />
            <button
              type="button"
              onclick={() => (showPassword = !showPassword)}
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
            >
              {#if showPassword}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              {/if}
            </button>
          </div>
          <p class="text-xs text-gray-400">Mindestens 8 Zeichen</p>

          {#if strength}
            <div class="flex flex-col gap-1">
              <div class="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-300 {strengthColor[strength]} {strengthWidth[strength]}"></div>
              </div>
              <span class="text-xs text-gray-400">
                Passwortstärke: <span class="font-medium {strength === 'strong' ? 'text-primary' : strength === 'fair' ? 'text-secondary' : 'text-error'}">{strengthLabel[strength]}</span>
              </span>
            </div>
          {/if}
        </div>

        {#if error}
          <div class="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
            {error}
          </div>
        {/if}

        <button
          type="submit"
          disabled={loading}
          class="mt-1 w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Konto wird erstellt…' : 'Jetzt registrieren & belohnt werden'}
        </button>
      </form>

      <p class="mt-5 text-center text-sm text-gray-500">
        Bereits registriert?
        <a
          href="/login?next={page.url.searchParams.get('next') ?? '/dashboard'}"
          class="font-medium text-primary underline underline-offset-2 hover:text-primary-dark"
        >
          Jetzt anmelden
        </a>
      </p>

      <p class="mt-3 text-center text-xs text-gray-400">
        Mit der Registrierung stimmst du unseren
        <a href="/datenschutz" class="text-primary underline underline-offset-2 hover:text-primary-dark">Datenschutzbestimmungen</a> zu.
      </p>

    {:else}
      <!-- ── Step 2: App installieren ── -->
      <div class="mb-5 text-center">
        <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold font-heading">AustroFit am Homescreen</h2>
        <p class="mt-2 text-sm text-gray-500">
          Füge AustroFit zu deinem Homescreen hinzu – wie eine echte App, ganz ohne App Store.
        </p>
      </div>

      <!-- Vorteile -->
      <ul class="mb-5 flex flex-col gap-3">
        <li class="flex items-start gap-3 text-sm text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          <span>Blitzschneller Zugriff direkt vom Homescreen</span>
        </li>
        <li class="flex items-start gap-3 text-sm text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          <span>Immer automatisch auf dem neuesten Stand – keine manuellen Updates</span>
        </li>
        <li class="flex items-start gap-3 text-sm text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <span>Kein App-Download nötig – spart Speicherplatz auf deinem Gerät</span>
        </li>
      </ul>

      <!-- Tabs Android / iOS -->
      <div class="mb-4 flex rounded-xl border border-gray-200 overflow-hidden">
        <button
          type="button"
          onclick={() => (pwaTab = 'android')}
          class="flex-1 py-2.5 text-sm font-medium transition-colors
            {pwaTab === 'android' ? 'bg-primary text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}"
        >
          Android
        </button>
        <button
          type="button"
          onclick={() => (pwaTab = 'ios')}
          class="flex-1 py-2.5 text-sm font-medium transition-colors
            {pwaTab === 'ios' ? 'bg-primary text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}"
        >
          iPhone / iOS
        </button>
      </div>

      {#if pwaTab === 'android'}
        {#if $pwaPrompt}
          <button
            onclick={installPWA}
            disabled={installing}
            class="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed mb-3"
          >
            {installing ? 'Wird hinzugefügt…' : 'Zum Homescreen hinzufügen'}
          </button>
        {:else}
          <div class="rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 mb-3">
            <p class="text-sm font-medium text-gray-700 mb-2">So geht's in Chrome:</p>
            <ol class="text-sm text-gray-600 flex flex-col gap-1.5 list-decimal list-inside">
              <li>Öffne das Menü <span class="font-bold">⋮</span> oben rechts in Chrome</li>
              <li>Tippe auf <strong>„Zum Startbildschirm hinzufügen"</strong></li>
              <li>Bestätige mit <strong>„Hinzufügen"</strong></li>
            </ol>
          </div>
        {/if}
      {:else}
        <div class="rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 mb-3">
          <p class="text-sm font-medium text-gray-700 mb-2">So geht's in Safari:</p>
          <ol class="text-sm text-gray-600 flex flex-col gap-1.5 list-decimal list-inside">
            <li>Tippe auf das <strong>Teilen-Symbol</strong> (Pfeil nach oben) in der Safari-Leiste</li>
            <li>Wähle <strong>„Zum Home-Bildschirm"</strong></li>
            <li>Tippe auf <strong>„Hinzufügen"</strong></li>
          </ol>
        </div>
      {/if}

      <button
        type="button"
        onclick={skipPWA}
        class="w-full rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
      >
        Später
      </button>
    {/if}

  </div>
</main>
