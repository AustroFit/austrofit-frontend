<!-- src/routes/profil/+page.svelte -->
<!-- Profil: Persönliche Daten, Health-Verbindung, Benachrichtigungen, Datenschutz & Account -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { getAccessToken, logout } from '$lib/utils/auth';

  // ── State ─────────────────────────────────────────────────────────────────
  let loading = $state(true);
  let errorMsg = $state('');

  // Schnellzugriff: Anzahl aktiver Gutscheine (für Badge)
  let aktiveGutscheine = $state(0);

  // Profil
  let benutzername = $state('');
  let userId = $state('');
  let email = $state('');
  let dateCreated = $state<string | null>(null);
  let healthConnected = $state(false);
  let testModeActive = $state(false);

  // Name-Formular
  let editBenutzername = $state('');
  let saving = $state(false);
  let saveSuccess = $state(false);
  let saveError = $state('');

  // Account löschen
  let showDeleteDialog = $state(false);
  let deleteConfirmInput = $state('');
  let deleting = $state(false);
  let deleteError = $state('');

  const deleteConfirmed = $derived(deleteConfirmInput.trim() === 'LÖSCHEN');

  const memberSince = $derived(
    dateCreated
      ? new Date(dateCreated).toLocaleDateString('de-AT', { month: 'long', year: 'numeric' })
      : ''
  );

  function getInitials(name: string, mail: string): string {
    if (name.trim()) return name.trim()[0].toUpperCase();
    if (mail) return mail[0].toUpperCase();
    return 'A';
  }
  const initials = $derived(getInitials(benutzername, email));

  // ── Load ──────────────────────────────────────────────────────────────────
  onMount(async () => {
    const token = getAccessToken();
    if (!token) { goto('/login?next=/profil'); return; }

    try {
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) { goto('/login?next=/profil'); return; }
      const body = await res.json();
      const user = body?.data;
      if (!user?.id) { goto('/login?next=/profil'); return; }

      benutzername    = user.first_name  ?? '';
      userId          = user.id          ?? '';
      email           = user.email       ?? '';
      dateCreated     = user.date_created ?? null;
      healthConnected = Boolean(user.health_connected);
      testModeActive  = localStorage.getItem('austrofit_test_mode') === 'true';

      editBenutzername = benutzername;

      // Gutschein-Anzahl nicht-blockend nachladen (für Badge im Schnellzugriff)
      fetch('/api/gutscheine', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((r) => r.json())
        .then((d) => { aktiveGutscheine = (d.aktiv ?? []).length; })
        .catch((e) => console.error('[profil] gutscheine count failed:', e));
    } catch (e: unknown) {
      errorMsg = e instanceof Error ? e.message : 'Fehler beim Laden.';
    } finally {
      loading = false;
    }
  });

  // ── Name speichern ────────────────────────────────────────────────────────
  async function saveName() {
    if (saving) return;
    saving = true;
    saveSuccess = false;
    saveError = '';
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify({ first_name: editBenutzername })
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        if (res.status === 401) { goto('/login?next=/profil'); return; }
        throw new Error(b?.error ?? `Fehler (${res.status})`);
      }
      benutzername = editBenutzername;
      saveSuccess = true;
      setTimeout(() => (saveSuccess = false), 3000);
    } catch (e: unknown) {
      saveError = e instanceof Error ? e.message : 'Speichern fehlgeschlagen.';
    } finally {
      saving = false;
    }
  }

  // ── Health-Verbindung ─────────────────────────────────────────────────────
  async function toggleHealth() {
    if (!browser) return;
    const newStatus = !healthConnected;
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify({ health_connected: newStatus })
      });
      healthConnected = newStatus;
      localStorage.setItem('austrofit_health_permission', newStatus ? 'granted' : 'denied');
    } catch {
      // Health ist kein kritisches Feature
    }
  }

  // ── Testmodus ─────────────────────────────────────────────────────────────
  function toggleTestMode() {
    if (!browser) return;
    testModeActive = !testModeActive;
    localStorage.setItem('austrofit_test_mode', testModeActive ? 'true' : 'false');
  }

  // ── Account löschen ───────────────────────────────────────────────────────
  async function deleteAccount() {
    if (!deleteConfirmed || deleting) return;
    deleting = true;
    deleteError = '';
    try {
      const res = await fetch('/api/profile/delete', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getAccessToken()}` }
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.error ?? `Fehler (${res.status})`);
      }
      logout();
      goto('/');
    } catch (e: unknown) {
      deleteError = e instanceof Error ? e.message : 'Löschen fehlgeschlagen.';
      deleting = false;
    }
  }
</script>

<svelte:head><title>Profil – AustroFit</title></svelte:head>

<main class="min-h-[calc(100vh-75px)] bg-gray-50 pb-24">
  {#if loading}
    <div class="flex items-center justify-center py-32">
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600"></div>
        <p class="text-sm text-gray-500">Profil wird geladen…</p>
      </div>
    </div>

  {:else if errorMsg}
    <div class="mx-auto max-w-lg px-4 py-16">
      <div class="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">{errorMsg}</div>
    </div>

  {:else}

    <!-- ── Header ──────────────────────────────────────────────────────────── -->
    <div class="text-white" style="background:#5EA500;">
      <div class="mx-auto max-w-2xl px-4 pt-8 pb-14">
        <div class="flex items-center gap-4">
          <div
            class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white shadow"
            style="background:rgba(255,255,255,0.25);"
          >
            {initials}
          </div>
          <div class="min-w-0 flex-1">
            <div class="truncate text-xl font-bold" style="font-family: 'Jost', sans-serif;">
              {benutzername || email || 'Nutzer'}
            </div>
            <div class="truncate text-sm opacity-80">{email}</div>
            {#if memberSince}
              <div class="mt-0.5 text-xs opacity-60">Mitglied seit {memberSince}</div>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <div class="mx-auto -mt-8 flex max-w-2xl flex-col gap-4 px-4">

      <!-- ── Schnellzugriff ──────────────────────────────────────────────── -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Punkte & Badges -->
        <a
          href="/profil/punkte"
          class="flex flex-col gap-1.5 rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div class="text-2xl">🏆</div>
          <div class="text-sm font-semibold text-gray-900">Punkte &amp; Badges</div>
          <div class="text-xs text-gray-400">Level &amp; Verlauf</div>
        </a>

        <!-- Meine Gutscheine (mit optionalem Badge) -->
        <a
          href="/profil/gutscheine"
          class="relative flex flex-col gap-1.5 rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          {#if aktiveGutscheine > 0}
            <div
              class="absolute right-3 top-3 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold text-white"
              style="background:#5EA500;"
            >
              {aktiveGutscheine}
            </div>
          {/if}
          <div class="text-2xl">🎟️</div>
          <div class="text-sm font-semibold text-gray-900">Meine Gutscheine</div>
          <div class="text-xs text-gray-400">Codes &amp; Aktionen</div>
        </a>
      </div>

      <!-- ── 1. Persönliche Daten ─────────────────────────────────────────── -->
      <section class="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-base font-semibold">Persönliche Daten</h2>

        <div class="flex flex-col gap-3">
          <!-- Benutzer-ID (read-only) -->
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600" for="user_id">
              Benutzer-ID
            </label>
            <input
              id="user_id"
              type="text"
              value={userId}
              readonly
              class="w-full rounded-xl border border-black/10 bg-gray-100 px-3 py-2.5 text-xs text-gray-400 cursor-not-allowed font-mono"
            />
          </div>

          <!-- Benutzername -->
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600" for="benutzername">
              Benutzername
            </label>
            <input
              id="benutzername"
              type="text"
              bind:value={editBenutzername}
              class="w-full rounded-xl border border-black/15 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-black focus:bg-white"
              placeholder="Dein Benutzername"
            />
          </div>

          <!-- E-Mail -->
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600" for="email">
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              readonly
              class="w-full rounded-xl border border-black/10 bg-gray-100 px-3 py-2.5 text-sm text-gray-500 cursor-not-allowed"
            />
          </div>

          {#if saveError}
            <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
              {saveError}
            </div>
          {/if}

          <div class="flex items-center gap-3">
            <button
              onclick={saveName}
              disabled={saving}
              class="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
              style="background:#5EA500;"
            >
              {saving ? 'Wird gespeichert…' : 'Speichern'}
            </button>
            {#if saveSuccess}
              <span class="text-sm text-emerald-600">✓ Gespeichert</span>
            {/if}
          </div>
        </div>
      </section>

      <!-- ── 2. Health-Verbindung ───────────────────────────────────────────── -->
      <section class="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 class="mb-1 text-base font-semibold">Health-Verbindung</h2>
        <p class="mb-4 text-sm text-gray-500">
          Wir nutzen deine Gesundheitsdaten ausschließlich zur Punkte-Berechnung.
          Keine Weitergabe an Dritte.
        </p>

        <div class="flex items-center justify-between gap-4 rounded-xl bg-gray-50 p-4">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full text-xl
                {healthConnected ? 'bg-emerald-100' : 'bg-gray-200'}"
            >
              {healthConnected ? '🟢' : '⚪'}
            </div>
            <div>
              <div class="text-sm font-semibold">
                {healthConnected ? 'Verbunden' : 'Nicht verbunden'}
              </div>
              <div class="text-xs text-gray-400">
                {healthConnected
                  ? 'Schritte werden automatisch synchronisiert'
                  : 'Google Health Connect / Apple HealthKit'}
              </div>
            </div>
          </div>
          <button
            onclick={toggleHealth}
            class="shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition-colors
              {healthConnected
                ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                : 'border-black/15 hover:bg-black/5'}"
          >
            {healthConnected ? 'Trennen' : 'Verbinden'}
          </button>
        </div>

        <!-- Testmodus Toggle -->
        <div class="mt-3 flex items-center justify-between gap-4 rounded-xl bg-gray-50 p-4">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full text-xl
                {testModeActive ? 'bg-amber-100' : 'bg-gray-200'}"
            >
              🧪
            </div>
            <div>
              <div class="text-sm font-semibold">Manuelle Schritt-Eingabe (Testmodus)</div>
              <div class="text-xs text-gray-400">
                {testModeActive
                  ? 'Aktiv – Schritte im Dashboard manuell eintragen'
                  : 'Nützlich für Tests oder ohne Health-App'}
              </div>
            </div>
          </div>
          <button
            onclick={toggleTestMode}
            class="shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition-colors
              {testModeActive
                ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                : 'border-black/15 hover:bg-black/5'}"
          >
            {testModeActive ? 'Deaktivieren' : 'Aktivieren'}
          </button>
        </div>
      </section>

      <!-- ── 3. Benachrichtigungen (Phase 2 – Platzhalter) ─────────────────── -->
      <section class="rounded-2xl border border-black/10 bg-white p-6 shadow-sm opacity-60">
        <div class="mb-3 flex items-center gap-2">
          <h2 class="text-base font-semibold">Benachrichtigungen</h2>
          <span class="rounded-full border border-gray-300 bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            Kommt bald
          </span>
        </div>
        <div class="flex flex-col gap-2">
          {#each ['Streak-Reminder', 'Challenge-Einladungen', 'Neue Partnerangebote'] as opt}
            <div class="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
              <span class="text-sm text-gray-600">{opt}</span>
              <div class="h-5 w-9 rounded-full bg-gray-300"></div>
            </div>
          {/each}
        </div>
      </section>

      <!-- ── 4. Datenschutz & Account ──────────────────────────────────────── -->
      <section class="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-base font-semibold">Datenschutz &amp; Account</h2>

        <div class="flex flex-col gap-3">
          <a
            href="https://austrofit.at/datenschutz"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-between rounded-xl border border-black/10 px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
          >
            <span>Datenschutzerklärung</span>
            <span class="text-gray-400">→</span>
          </a>

          <button
            onclick={() => { showDeleteDialog = true; deleteConfirmInput = ''; deleteError = ''; }}
            class="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            <span>Account löschen</span>
            <span>🗑</span>
          </button>
        </div>
      </section>

    </div>
  {/if}
</main>

<!-- ── Account-löschen-Dialog ─────────────────────────────────────────────── -->
{#if showDeleteDialog}
  <div
    class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
    role="dialog"
    aria-modal="true"
    aria-labelledby="delete-dialog-title"
  >
    <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <h3 id="delete-dialog-title" class="mb-2 text-lg font-bold text-red-700">
        Account wirklich löschen?
      </h3>
      <p class="mb-4 text-sm text-gray-600">
        Alle deine Daten (Punkte, Buchungen, Quiz-Verläufe) werden
        <strong>unwiderruflich gelöscht</strong>.
        Diese Aktion kann nicht rückgängig gemacht werden.
      </p>

      <label class="mb-1 block text-xs font-medium text-gray-600" for="delete-confirm">
        Zur Bestätigung bitte <strong>LÖSCHEN</strong> eintippen:
      </label>
      <input
        id="delete-confirm"
        type="text"
        bind:value={deleteConfirmInput}
        class="mb-4 w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition
          {deleteConfirmed ? 'border-red-400 bg-red-50' : 'border-black/15 bg-gray-50 focus:border-black'}"
        placeholder="LÖSCHEN"
        autocomplete="off"
      />

      {#if deleteError}
        <div class="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
          {deleteError}
        </div>
      {/if}

      <div class="flex gap-3">
        <button
          onclick={() => (showDeleteDialog = false)}
          class="flex-1 rounded-xl border border-black/15 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
        >
          Abbrechen
        </button>
        <button
          onclick={deleteAccount}
          disabled={!deleteConfirmed || deleting}
          class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition disabled:opacity-40"
          style="background:#5EA500;"
        >
          {deleting ? 'Wird gelöscht…' : 'Endgültig löschen'}
        </button>
      </div>
    </div>
  </div>
{/if}
