<!-- src/routes/profil/+page.svelte -->
<!-- Profil: Persönliche Daten, Health-Verbindung, Benachrichtigungen, Datenschutz & Account -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { getValidAccessToken, logout } from '$lib/utils/auth';

  // ── State ─────────────────────────────────────────────────────────────────
  let loading = $state(true);
  let errorMsg = $state('');

  // Profil
  let benutzername = $state('');
  let userId = $state('');
  let email = $state('');
  let dateCreated = $state<string | null>(null);
  let healthConnected = $state(false);

  // Name-Formular
  let editingName = $state(false);
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

  // Konsistente Avatar-Farbe aus Design-Tokens (basierend auf Name-Hash)
  const AVATAR_COLORS = ['#1B7A44', '#2E7D32', '#F59E0B', '#E8593C', '#0D2E18'];
  function getAvatarColor(name: string, mail: string): string {
    const s = name || mail || 'A';
    let hash = 0;
    for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) & 0xffffffff;
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }
  const avatarColor = $derived(getAvatarColor(benutzername, email));

  // ── Load ──────────────────────────────────────────────────────────────────
  onMount(async () => {
    const token = await getValidAccessToken();
    if (!token) { goto('/login?next=/profil'); return; }

    const authHeader = { Authorization: `Bearer ${token}` };

    try {
      const [meRes, profileRes] = await Promise.all([
        fetch('/api/me', { headers: authHeader }),
        fetch('/api/profile', { headers: authHeader })
      ]);

      if (!meRes.ok) { goto('/login?next=/profil'); return; }
      const me = await meRes.json();
      const user = me?.data;
      if (!user?.id) { goto('/login?next=/profil'); return; }

      benutzername = user.first_name  ?? '';
      userId       = user.id          ?? '';
      email        = user.email       ?? '';
      dateCreated  = user.date_created ?? null;

      if (profileRes.ok) {
        const profileBody = await profileRes.json();
        healthConnected = Boolean(profileBody?.data?.health_connected);
      }

      editBenutzername = benutzername;
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
      const token = await getValidAccessToken();
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ first_name: editBenutzername })
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        if (res.status === 401) { goto('/login?next=/profil'); return; }
        throw new Error(b?.error ?? `Fehler (${res.status})`);
      }
      benutzername = editBenutzername;
      editingName = false;
      saveSuccess = true;
      setTimeout(() => (saveSuccess = false), 3000);
    } catch (e: unknown) {
      saveError = e instanceof Error ? e.message : 'Speichern fehlgeschlagen.';
    } finally {
      saving = false;
    }
  }

  function startEditName() {
    editBenutzername = benutzername;
    editingName = true;
    saveError = '';
  }

  function cancelEditName() {
    editBenutzername = benutzername;
    editingName = false;
    saveError = '';
  }

  // ── Health-Verbindung ─────────────────────────────────────────────────────
  async function toggleHealth() {
    if (!browser) return;
    const newStatus = !healthConnected;
    try {
      const token = await getValidAccessToken();
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ health_connected: newStatus })
      });
      healthConnected = newStatus;
      localStorage.setItem('austrofit_health_permission', newStatus ? 'granted' : 'denied');
    } catch {
      // Health ist kein kritisches Feature
    }
  }

  // ── Account löschen ───────────────────────────────────────────────────────
  async function deleteAccount() {
    if (!deleteConfirmed || deleting) return;
    deleting = true;
    deleteError = '';
    try {
      const token = await getValidAccessToken();
      const res = await fetch('/api/profile/delete', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
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
      <div class="rounded-[var(--radius-card)] border border-error/30 bg-error/5 p-6 text-sm text-error">{errorMsg}</div>
    </div>

  {:else}

    <!-- ── Header ──────────────────────────────────────────────────────────── -->
    <div class="bg-darkblue text-white">
      <div class="mx-auto max-w-2xl px-4 pt-4 pb-14">
        <a href="/dashboard" class="mb-4 inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white/90 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
          Dashboard
        </a>
        <div class="flex items-center gap-4">
          <div
            class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white shadow"
            style="background:{avatarColor}; box-shadow: 0 0 0 3px rgba(255,255,255,0.25);"
          >
            {initials}
          </div>
          <div class="min-w-0 flex-1">
            <div class="truncate text-xl font-bold font-heading">
              {benutzername || email || 'Mein Profil'}
            </div>
            <div class="truncate text-sm opacity-70">{email}</div>
            {#if memberSince}
              <div class="mt-0.5 text-xs opacity-50">Mitglied seit {memberSince}</div>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <div class="mx-auto -mt-8 flex max-w-2xl flex-col gap-4 px-4">

      <!-- ── 1. Persönliche Daten ─────────────────────────────────────────── -->
      <section class="rounded-[var(--radius-card)] border border-black/10 bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-base font-semibold text-heading">Persönliche Daten</h2>

        <div class="flex flex-col gap-4">

          <!-- Benutzername (inline edit) -->
          <div>
            <div class="mb-1.5 text-xs font-medium text-gray-500">Benutzername</div>
            {#if editingName}
              <input
                id="benutzername"
                type="text"
                bind:value={editBenutzername}
                class="w-full rounded-xl border border-primary/40 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:bg-white"
                placeholder="Dein Benutzername"
              />
              {#if saveError}
                <div class="mt-2 rounded-xl border border-error/30 bg-error/5 px-4 py-2.5 text-sm text-error">
                  {saveError}
                </div>
              {/if}
              <div class="mt-3 flex items-center gap-2">
                <button
                  onclick={saveName}
                  disabled={saving}
                  class="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
                >
                  {saving ? 'Wird gespeichert…' : 'Speichern'}
                </button>
                <button
                  onclick={cancelEditName}
                  disabled={saving}
                  class="rounded-xl border border-black/15 px-5 py-2 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-60"
                >
                  Abbrechen
                </button>
                {#if saveSuccess}
                  <span class="text-sm text-primary">✓ Gespeichert</span>
                {/if}
              </div>
            {:else}
              <div class="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <span class="text-sm {benutzername ? 'text-gray-900' : 'text-gray-400'}">
                  {benutzername || 'Noch kein Benutzername'}
                </span>
                <button
                  onclick={startEditName}
                  aria-label="Benutzername bearbeiten"
                  class="ml-2 shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
              {#if saveSuccess}
                <p class="mt-2 text-sm text-primary">✓ Benutzername gespeichert</p>
              {/if}
            {/if}
          </div>

          <!-- E-Mail (immer read-only) -->
          <div>
            <div class="mb-1.5 text-xs font-medium text-gray-500">E-Mail</div>
            <div class="flex items-center rounded-xl bg-gray-50 px-4 py-3">
              <span class="text-sm text-gray-500">{email}</span>
            </div>
          </div>

        </div>
      </section>

      <!-- ── 2. Health-Verbindung ───────────────────────────────────────────── -->
      <section class="rounded-[var(--radius-card)] border border-black/10 bg-white p-6 shadow-sm">
        <h2 class="mb-1 text-base font-semibold text-heading">Health-Verbindung</h2>
        <p class="mb-4 text-sm text-gray-500">
          Wir nutzen deine Gesundheitsdaten ausschließlich zur Punkte-Berechnung.
          Keine Weitergabe an Dritte.
        </p>

        <div class="flex items-center justify-between gap-4 rounded-xl bg-gray-50 p-4">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full text-xl
                {healthConnected ? 'bg-primary/10' : 'bg-gray-200'}"
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
                ? 'border-error/30 bg-error/5 text-error hover:bg-error/10'
                : 'border-black/15 hover:bg-black/5'}"
          >
            {healthConnected ? 'Trennen' : 'Verbinden'}
          </button>
        </div>

        <!-- Testmodus Toggle (vorerst deaktiviert) -->
        <!--
        <div class="mt-3 flex items-center justify-between gap-4 rounded-xl bg-gray-50 p-4">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full text-xl
                {testModeActive ? 'bg-secondary/20' : 'bg-gray-200'}"
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
                ? 'border-secondary/30 bg-secondary/10 text-secondary hover:bg-secondary/20'
                : 'border-black/15 hover:bg-black/5'}"
          >
            {testModeActive ? 'Deaktivieren' : 'Aktivieren'}
          </button>
        </div>
        -->
      </section>

      <!-- ── 3. Benachrichtigungen (Phase 2 – Platzhalter) ─────────────────── -->
      <section class="rounded-[var(--radius-card)] border border-black/10 bg-white p-6 shadow-sm opacity-60">
        <div class="mb-3 flex items-center gap-2">
          <h2 class="text-base font-semibold text-heading">Benachrichtigungen</h2>
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
      <section class="rounded-[var(--radius-card)] border border-black/10 bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-base font-semibold text-heading">Datenschutz &amp; Account</h2>

        <div class="flex flex-col gap-3">
          <a
            href="/datenschutz"
            class="flex items-center justify-between rounded-xl border border-black/10 px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
          >
            <span>Datenschutzerklärung</span>
            <span class="text-gray-400">→</span>
          </a>

          <button
            onclick={() => { showDeleteDialog = true; deleteConfirmInput = ''; deleteError = ''; }}
            class="flex items-center justify-between rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm font-medium text-error transition-colors hover:bg-error/10"
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
    <div class="w-full max-w-md rounded-[var(--radius-card)] bg-white p-6 shadow-xl">
      <h3 id="delete-dialog-title" class="mb-2 text-lg font-bold text-error">
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
          {deleteConfirmed ? 'border-error/50 bg-error/5' : 'border-black/15 bg-gray-50 focus:border-black'}"
        placeholder="LÖSCHEN"
        autocomplete="off"
      />

      {#if deleteError}
        <div class="mb-3 rounded-xl border border-error/30 bg-error/5 px-4 py-2.5 text-sm text-error">
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
          class="flex-1 rounded-xl bg-error py-2.5 text-sm font-semibold text-white transition disabled:opacity-40"
        >
          {deleting ? 'Wird gelöscht…' : 'Endgültig löschen'}
        </button>
      </div>
    </div>
  </div>
{/if}
