<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { register, login } from '$lib/utils/auth';
  import { track } from '$lib/utils/mixpanel';
  import { env as dynPublicEnv } from '$env/dynamic/public';
  const PUBLIC_EMAIL_VERIFICATION = dynPublicEnv.PUBLIC_EMAIL_VERIFICATION;

  let email = $state('');
  let password = $state('');
  let firstName = $state('');
  let error = $state('');
  let loading = $state(false);
  let showPassword = $state(false);
  let resendLoading = $state(false);
  let resendDone = $state(false);

  let step = $state(1);
  let datenschutzAkzeptiert = $state(false);
  let isInstalled = $state(false);
  let selectedGroup = $state('adult');

  const ACTIVITY_GROUPS = [
    {
      value: 'adult',
      label: 'Erwachsene',
      sub: '18–64 Jahre',
      desc: '150 Min. moderat oder 75 Min. intensiv pro Woche',
      icon: '🚶'
    },
    {
      value: 'senior',
      label: 'Senioren',
      sub: '65+',
      desc: '150 Min. moderat pro Woche + Gleichgewichtsübungen',
      icon: '🧘'
    },
    {
      value: 'pregnant',
      label: 'Schwangere',
      sub: 'Moderat, kein Intensivtraining',
      desc: 'Bis zu 150 Min. moderates Training pro Woche',
      icon: '🤱'
    },
    {
      value: 'chronic',
      label: 'Chronisch krank',
      sub: 'Reduziertes Wochenziel',
      desc: 'Ca. 100 Min. moderates Training pro Woche',
      icon: '💙'
    }
  ];

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
    isInstalled = window.matchMedia('(display-mode: standalone)').matches;
  });

  async function onSubmit() {
    error = '';
    loading = true;
    try {
      await register(email, password, firstName, '');
      if (PUBLIC_EMAIL_VERIFICATION !== 'true') {
        await login(email, password);
      }

      track('user_registered', {
        method: 'email_password',
        next_url: page.url.searchParams.get('next') ?? null
      });

      step = 2; // → Gruppenauswahl
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

  function confirmGroup() {
    if (browser) localStorage.setItem('austrofit_activity_group', selectedGroup);
    if (PUBLIC_EMAIL_VERIFICATION === 'true') {
      step = 3;
    } else {
      const next = page.url.searchParams.get('next') ?? '/dashboard';
      goto(next);
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

<svelte:head><title>Registrieren – AustroFit</title></svelte:head>

<main class="min-h-[calc(100vh-75px)] bg-light-grey flex items-center justify-center px-4 py-6">
  <div class="w-full max-w-md bg-white rounded-2xl shadow-sm border border-black/10 p-6">

    <!-- Step Indicator -->
    <div class="flex items-center justify-center mb-6">
      <div class="flex items-center gap-1.5">
        <div class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold
          {step > 1 ? 'bg-primary text-white' : 'bg-primary text-white'}">
          {#if step > 1}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          {:else}1{/if}
        </div>
        <span class="text-xs font-semibold text-primary hidden sm:inline">Konto</span>
      </div>

      <div class="w-6 h-0.5 mx-2 {step >= 2 ? 'bg-primary' : 'bg-gray-200'}"></div>

      <div class="flex items-center gap-1.5">
        <div class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold
          {step > 2 ? 'bg-primary text-white' : step === 2 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}">
          {#if step > 2}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          {:else}2{/if}
        </div>
        <span class="text-xs font-semibold {step >= 2 ? 'text-primary' : 'text-gray-400'} hidden sm:inline">Ziel</span>
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

        <label class="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={datenschutzAkzeptiert}
            required
            class="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-primary cursor-pointer"
          />
          <span class="text-sm text-gray-500 leading-snug">
            Ich habe die
            <a href="/datenschutz" class="text-primary underline underline-offset-2 hover:text-primary-dark" target="_blank" rel="noopener">Datenschutzerklärung</a>
            gelesen und stimme der Verarbeitung meiner Daten zu.
          </span>
        </label>

        <button
          type="submit"
          disabled={loading || !datenschutzAkzeptiert}
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

    {:else if step === 2}
      <!-- ── Step 2: Bewegungsziel wählen ── -->
      <div class="mb-5 text-center">
        <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl">
          🏃
        </div>
        <h2 class="text-2xl font-bold font-heading">Dein Bewegungsziel</h2>
        <p class="mt-2 text-sm text-gray-500">
          Wähle deine Gruppe – sie bestimmt dein persönliches Wochenziel.<br>
          Du kannst das jederzeit in den Einstellungen ändern.
        </p>
      </div>

      <div class="flex flex-col gap-2.5 mb-5">
        {#each ACTIVITY_GROUPS as group}
          <button
            type="button"
            onclick={() => (selectedGroup = group.value)}
            class="flex items-center gap-4 rounded-xl border-2 px-4 py-3.5 text-left transition-colors w-full
              {selectedGroup === group.value
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'}"
          >
            <span class="text-3xl shrink-0 leading-none">{group.icon}</span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="font-semibold text-sm text-heading">{group.label}</span>
                <span class="text-xs text-primary/70 font-medium">{group.sub}</span>
              </div>
              <p class="text-xs text-gray-500 mt-0.5 leading-snug">{group.desc}</p>
            </div>
            <div class="shrink-0">
              {#if selectedGroup === group.value}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              {:else}
                <div class="h-5 w-5 rounded-full border-2 border-gray-200"></div>
              {/if}
            </div>
          </button>
        {/each}
      </div>

      <button
        type="button"
        onclick={confirmGroup}
        class="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
      >
        Weiter
      </button>
      <button
        type="button"
        onclick={() => { selectedGroup = 'adult'; confirmGroup(); }}
        class="mt-2 w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-2"
      >
        Überspringen (Standard: Erwachsene)
      </button>

    {:else}
      <!-- ── Step 3: E-Mail bestätigen ── -->
      <div class="mb-5 text-center">
        <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold font-heading">Bestätige deine E-Mail</h2>
        <p class="mt-2 text-sm text-gray-500">
          Wir haben eine Bestätigungs-E-Mail an <strong>{email}</strong> geschickt.<br>
          Klicke auf den Link in der E-Mail, um dein Konto zu aktivieren.
        </p>
      </div>

      <div class="rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 mb-5">
        <p class="text-sm font-medium text-gray-700 mb-1">Keine E-Mail erhalten?</p>
        <p class="text-xs text-gray-500 mb-3">Prüfe deinen Spam-Ordner oder fordere eine neue Bestätigungs-E-Mail an.</p>

        {#if resendDone}
          <p class="text-sm text-primary font-medium">E-Mail wurde erneut gesendet.</p>
        {:else}
          <button
            type="button"
            onclick={resendVerification}
            disabled={resendLoading}
            class="text-sm font-medium text-primary underline underline-offset-2 hover:text-primary-dark disabled:opacity-50"
          >
            {resendLoading ? 'Wird gesendet…' : 'Bestätigungsmail erneut senden'}
          </button>
        {/if}
      </div>

      <a
        href="/login"
        class="block w-full rounded-xl border border-gray-200 px-6 py-3 text-center text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
      >
        Zur Anmeldung
      </a>
    {/if}

  </div>
</main>
