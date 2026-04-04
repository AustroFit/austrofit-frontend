<!-- src/routes/profil/+page.svelte -->
<!-- Profil: Persönliche Daten, Health-Verbindung, Benachrichtigungen, Datenschutz & Account -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { getValidAccessToken, logout } from '$lib/utils/auth';
  import { apiUrl } from '$lib/utils/api';

  // ── State ─────────────────────────────────────────────────────────────────
  let loading = $state(true);
  let errorMsg = $state('');
  let isNativePlatform = $state(false);

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

  // Daten-Export
  let exporting = $state(false);

  async function downloadExport() {
    if (!browser || exporting) return;
    exporting = true;
    try {
      const token = await getValidAccessToken();
      const res = await fetch(apiUrl('/api/export'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `austrofit-daten-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ } finally {
      exporting = false;
    }
  }

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
    // Capacitor-Detection parallel starten – blockiert Datenladen nicht
    const capacitorDetect = import('@capacitor/core')
      .then(({ Capacitor }) => { isNativePlatform = Capacitor.isNativePlatform(); })
      .catch(() => {});

    initDevToggles();

    const token = await getValidAccessToken();
    if (!token) { goto('/login?next=/profil'); return; }

    const authHeader = { Authorization: `Bearer ${token}` };

    try {
      const [meRes, profileRes] = await Promise.all([
        fetch(apiUrl('/api/me'), { headers: authHeader }),
        fetch(apiUrl('/api/profile'), { headers: authHeader })
      ]);

      if (!meRes.ok) { goto('/login?next=/profil'); return; }
      const me = await meRes.json();
      const user = me?.data;
      if (!user?.id) { goto('/login?next=/profil'); return; }

      benutzername = user.first_name   ?? '';
      userId       = user.id           ?? '';
      email        = user.email        ?? '';
      dateCreated  = user.date_created ?? null;

      if (profileRes.ok) {
        const profileBody = await profileRes.json();
        healthConnected  = Boolean(profileBody?.data?.health_connected);
        activityGroup    = profileBody?.data?.activity_group ?? 'adult';
        editGroup        = activityGroup;
      }

      editBenutzername = benutzername;
    } catch (e: unknown) {
      errorMsg = e instanceof Error ? e.message : 'Fehler beim Laden.';
    } finally {
      loading = false;
    }

    await capacitorDetect;
  });

  // ── Name speichern ────────────────────────────────────────────────────────
  async function saveName() {
    if (saving) return;
    saving = true;
    saveSuccess = false;
    saveError = '';
    try {
      const token = await getValidAccessToken();
      const res = await fetch(apiUrl('/api/profile'), {
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

  // ── Bewegungsziel ─────────────────────────────────────────────────────────
  let activityGroup = $state('adult');
  let editingGroup = $state(false);
  let editGroup = $state('adult');
  let savingGroup = $state(false);
  let saveGroupSuccess = $state(false);
  let saveGroupError = $state('');

  const ACTIVITY_GROUPS = [
    { value: 'adult',    label: 'Erwachsene (18–64)',   desc: '150 Min./Woche moderat od. 75 Min. intensiv', icon: '🚶' },
    { value: 'senior',   label: '65+',                  desc: '150 Min./Woche moderat',                      icon: '🧘' },
    { value: 'pregnant', label: 'Schwangere',            desc: '150 Min./Woche moderat, kein Intensivtraining', icon: '🤱' },
    { value: 'chronic',  label: 'Chronisch krank',      desc: 'Ca. 100 Min./Woche moderat',                  icon: '💙' }
  ] as const;

  const activityGroupLabel = $derived(
    ACTIVITY_GROUPS.find((g) => g.value === activityGroup)?.label ?? 'Erwachsene'
  );

  function startEditGroup() { editGroup = activityGroup; editingGroup = true; saveGroupError = ''; }
  function cancelEditGroup() { editingGroup = false; saveGroupError = ''; }

  async function saveGroup() {
    if (savingGroup) return;
    savingGroup = true; saveGroupSuccess = false; saveGroupError = '';
    try {
      const token = await getValidAccessToken();
      const res = await fetch(apiUrl('/api/profile'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ activity_group: editGroup })
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.error ?? `Fehler (${res.status})`);
      }
      activityGroup = editGroup;
      editingGroup = false;
      saveGroupSuccess = true;
      setTimeout(() => (saveGroupSuccess = false), 3000);
    } catch (e: unknown) {
      saveGroupError = e instanceof Error ? e.message : 'Speichern fehlgeschlagen.';
    } finally { savingGroup = false; }
  }

  // ── Entwickler-Toggles ────────────────────────────────────────────────────
  let testModeActive = $state(false);
  let cardioTestMode = $state(false);
  let devNativeMode  = $state(false);

  function initDevToggles() {
    if (!browser) return;
    testModeActive = localStorage.getItem('austrofit_test_mode')         === 'true';
    cardioTestMode = localStorage.getItem('austrofit_test_mode_cardio')  === 'true';
    devNativeMode  = localStorage.getItem('austrofit_dev_native')        === 'true';
  }

  function toggleTestMode() {
    testModeActive = !testModeActive;
    localStorage.setItem('austrofit_test_mode', testModeActive ? 'true' : 'false');
  }

  function toggleCardioTestMode() {
    cardioTestMode = !cardioTestMode;
    localStorage.setItem('austrofit_test_mode_cardio', cardioTestMode ? 'true' : 'false');
  }

  function toggleDevNative() {
    devNativeMode = !devNativeMode;
    localStorage.setItem('austrofit_dev_native', devNativeMode ? 'true' : 'false');
  }

  // ── Health-Verbindung ─────────────────────────────────────────────────────
  let showHealthConsentDialog = $state(false);

  function onHealthButtonClick() {
    if (!healthConnected) {
      showHealthConsentDialog = true;
    } else {
      doToggleHealth(false);
    }
  }

  async function doToggleHealth(newStatus: boolean) {
    showHealthConsentDialog = false;
    if (!browser) return;
    try {
      const token = await getValidAccessToken();
      await fetch(apiUrl('/api/profile'), {
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
  function openDeleteDialog() {
    showDeleteDialog = true;
    deleteConfirmInput = '';
    deleteError = '';
  }

  async function deleteAccount() {
    if (!deleteConfirmed || deleting) return;
    deleting = true;
    deleteError = '';
    try {
      const token = await getValidAccessToken();
      const res = await fetch(apiUrl('/api/profile/delete'), {
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
  {#if errorMsg}
    <div class="mx-auto max-w-lg px-4 py-16">
      <div class="rounded-[var(--radius-card)] border border-error/30 bg-error/5 p-6 text-sm text-error">{errorMsg}</div>
    </div>

  {:else}

    <!-- ── Header – sofort sichtbar ─────────────────────────────────────── -->
    <div class="bg-darkblue text-white">
      <div class="mx-auto max-w-2xl px-4 pt-4 pb-14">
        <a href="/dashboard" class="mb-4 inline-flex items-center text-xs text-white/60 hover:text-white/90 transition-colors">← Dashboard</a>
        {#if loading}
          <!-- Skeleton Avatar + Name -->
          <div class="flex items-center gap-4 animate-pulse">
            <div class="h-14 w-14 shrink-0 rounded-full bg-white/20"></div>
            <div class="flex-1">
              <div class="h-5 w-36 rounded bg-white/20 mb-2"></div>
              <div class="h-3 w-48 rounded bg-white/15"></div>
            </div>
          </div>
        {:else}
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
        {/if}
      </div>
    </div>

    <div class="mx-auto -mt-8 flex max-w-2xl flex-col gap-4 px-4">

    {#if loading}
      <!-- Skeleton-Karten -->
      <div class="rounded-[var(--radius-card)] border border-black/10 bg-white p-6 shadow-sm animate-pulse">
        <div class="h-4 w-40 rounded bg-gray-200 mb-5"></div>
        <div class="h-11 w-full rounded-xl bg-gray-200 mb-3"></div>
        <div class="h-11 w-full rounded-xl bg-gray-200 mb-3"></div>
        <div class="h-11 w-full rounded-xl bg-gray-200"></div>
      </div>
      <div class="rounded-[var(--radius-card)] border border-black/10 bg-white p-6 shadow-sm animate-pulse">
        <div class="h-4 w-36 rounded bg-gray-200 mb-5"></div>
        <div class="h-16 w-full rounded-xl bg-gray-200"></div>
      </div>

    {:else}

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

          <!-- Bewegungsziel -->
          <div>
            <div class="mb-1.5 text-xs font-medium text-gray-500">Bewegungsziel</div>
            {#if editingGroup}
              <div class="flex flex-col gap-2">
                {#each ACTIVITY_GROUPS as g}
                  <button
                    type="button"
                    onclick={() => (editGroup = g.value)}
                    class="flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-colors
                      {editGroup === g.value ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}"
                  >
                    <span class="text-lg shrink-0">{g.icon}</span>
                    <div class="min-w-0 flex-1">
                      <span class="text-sm font-medium">{g.label}</span>
                      <p class="text-xs text-gray-400 mt-0.5">{g.desc}</p>
                    </div>
                    {#if editGroup === g.value}
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                    {/if}
                  </button>
                {/each}
              </div>
              {#if saveGroupError}
                <div class="mt-2 rounded-xl border border-error/30 bg-error/5 px-4 py-2.5 text-sm text-error">{saveGroupError}</div>
              {/if}
              <div class="mt-3 flex items-center gap-2">
                <button
                  onclick={saveGroup}
                  disabled={savingGroup}
                  class="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
                >
                  {savingGroup ? 'Wird gespeichert…' : 'Speichern'}
                </button>
                <button
                  onclick={cancelEditGroup}
                  disabled={savingGroup}
                  class="rounded-xl border border-black/15 px-5 py-2 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-60"
                >
                  Abbrechen
                </button>
              </div>
            {:else}
              <div class="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <span class="text-sm text-gray-900">{activityGroupLabel}</span>
                <button
                  onclick={startEditGroup}
                  aria-label="Bewegungsziel ändern"
                  class="ml-2 shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
              {#if saveGroupSuccess}
                <p class="mt-2 text-sm text-primary">✓ Bewegungsziel gespeichert</p>
              {/if}
            {/if}
          </div>

        </div>
      </section>

      <!-- ── 2. Health-Verbindung ───────────────────────────────────────────── -->
      <section class="rounded-[var(--radius-card)] border border-black/10 bg-white p-6 shadow-sm">
        <div class="mb-1 flex items-center gap-2">
          <h2 class="text-base font-semibold text-heading">Health-Verbindung</h2>
          {#if !isNativePlatform}
            <span class="rounded-full border border-gray-300 bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              Kommt bald
            </span>
          {/if}
        </div>
        <p class="mb-4 text-sm text-gray-500">
          {#if isNativePlatform}
            Wir nutzen deine Gesundheitsdaten ausschließlich zur Punkte-Berechnung.
            Keine Weitergabe an Dritte.
          {:else}
            Automatisches Schritt-Tracking ist in der AustroFit Android App verfügbar –
            sie erscheint in Kürze im Play Store.
          {/if}
        </p>

        <div class="flex items-center justify-between gap-4 rounded-xl bg-gray-50 p-4">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full text-xl
                {healthConnected && isNativePlatform ? 'bg-primary/10' : 'bg-gray-200'}"
            >
              {healthConnected && isNativePlatform ? '🟢' : '⚪'}
            </div>
            <div>
              <div class="text-sm font-semibold">
                {#if isNativePlatform}
                  {healthConnected ? 'Verbunden' : 'Nicht verbunden'}
                {:else}
                  Nicht verfügbar
                {/if}
              </div>
              <div class="text-xs text-gray-400">
                {#if isNativePlatform}
                  {healthConnected
                    ? 'Schritte werden automatisch synchronisiert'
                    : 'Google Health Connect / Apple HealthKit'}
                {:else}
                  Nur in der nativen App verfügbar
                {/if}
              </div>
            </div>
          </div>
          {#if isNativePlatform}
            <button
              onclick={onHealthButtonClick}
              class="shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition-colors
                {healthConnected
                  ? 'border-error/30 bg-error/5 text-error hover:bg-error/10'
                  : 'border-black/15 hover:bg-black/5'}"
            >
              {healthConnected ? 'Trennen' : 'Verbinden'}
            </button>
          {/if}
        </div>

      </section>

      <!-- ── Entwickler-Tools (nur im Browser sichtbar) ─────────────────── -->
      {#if !isNativePlatform}
        <section class="rounded-[var(--radius-card)] border border-dashed border-gray-300 bg-gray-50 p-6 shadow-sm">
          <div class="mb-3 flex items-center gap-2">
            <h2 class="text-base font-semibold text-heading">Entwickler-Tools</h2>
            <span class="rounded-full border border-gray-300 bg-white px-2 py-0.5 text-xs font-medium text-gray-400">
              nur im Browser
            </span>
          </div>
          <div class="flex flex-col gap-3">

            <!-- Native-Features simulieren -->
            <div class="flex items-center justify-between gap-4 rounded-xl bg-white border border-black/8 p-4">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full text-xl
                  {devNativeMode ? 'bg-primary/10' : 'bg-gray-100'}">
                  📱
                </div>
                <div>
                  <div class="text-sm font-semibold">Native-Features simulieren</div>
                  <div class="text-xs text-gray-400">
                    {devNativeMode
                      ? 'Aktiv – Cardio, Schritte & Streaks im Dashboard sichtbar'
                      : 'Zeigt native App-Karten im Browser (ohne echte Health-Daten)'}
                  </div>
                </div>
              </div>
              <button
                onclick={toggleDevNative}
                class="shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition-colors
                  {devNativeMode
                    ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
                    : 'border-black/15 hover:bg-black/5'}"
              >
                {devNativeMode ? 'Deaktivieren' : 'Aktivieren'}
              </button>
            </div>

            <!-- Manuelle Cardio-Eingabe -->
            <div class="flex items-center justify-between gap-4 rounded-xl bg-white border border-black/8 p-4">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full text-xl
                  {cardioTestMode ? 'bg-secondary/20' : 'bg-gray-100'}">
                  🏃
                </div>
                <div>
                  <div class="text-sm font-semibold">Manuelle Cardio-Eingabe</div>
                  <div class="text-xs text-gray-400">
                    {cardioTestMode
                      ? 'Aktiv – Bewegung im Dashboard manuell eintragen'
                      : 'Cardio-Punkte ohne Health-App testen'}
                  </div>
                </div>
              </div>
              <button
                onclick={toggleCardioTestMode}
                class="shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition-colors
                  {cardioTestMode
                    ? 'border-secondary/30 bg-secondary/10 text-secondary hover:bg-secondary/20'
                    : 'border-black/15 hover:bg-black/5'}"
              >
                {cardioTestMode ? 'Deaktivieren' : 'Aktivieren'}
              </button>
            </div>

            <!-- Manuelle Schritt-Eingabe -->
            <div class="flex items-center justify-between gap-4 rounded-xl bg-white border border-black/8 p-4">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full text-xl
                  {testModeActive ? 'bg-secondary/20' : 'bg-gray-100'}">
                  🧪
                </div>
                <div>
                  <div class="text-sm font-semibold">Manuelle Schritt-Eingabe</div>
                  <div class="text-xs text-gray-400">
                    {testModeActive
                      ? 'Aktiv – Schritte im Dashboard manuell eintragen'
                      : 'Schritte ohne Health-App testen'}
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

          </div>
        </section>
      {/if}

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
            type="button"
            onclick={downloadExport}
            disabled={exporting}
            class="flex items-center justify-between rounded-xl border border-black/10 px-4 py-3 text-sm hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            <span>{exporting ? 'Wird exportiert…' : 'Meine Daten herunterladen'}</span>
            <span class="text-gray-400">↓</span>
          </button>

          <button
            type="button"
            onclick={openDeleteDialog}
            class="flex items-center justify-between rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm font-medium text-error transition-colors hover:bg-error/10"
          >
            <span>Account löschen</span>
            <span>🗑</span>
          </button>
        </div>
      </section>

    {/if}
    </div>
  {/if}
</main>

<!-- ── Account-löschen-Dialog ─────────────────────────────────────────────── -->
<!-- ── Gesundheitsdaten-Einwilligungs-Dialog (Art. 9 DSGVO) ─────────────── -->
{#if showHealthConsentDialog}
  <div
    class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
    role="dialog"
    aria-modal="true"
    aria-labelledby="health-consent-title"
  >
    <div class="w-full max-w-md rounded-[var(--radius-card)] bg-white p-6 shadow-xl">
      <h3 id="health-consent-title" class="mb-2 text-lg font-bold text-heading">
        Gesundheitsdaten verarbeiten
      </h3>
      <p class="mb-3 text-sm text-gray-600">
        AustroFit möchte deine Schritt- und Bewegungsdaten aus Google Health Connect lesen,
        um dir Punkte gutzuschreiben. Diese Daten gelten nach <strong>Art. 9 DSGVO</strong>
        als besonders schützenswerte Gesundheitsdaten.
      </p>
      <ul class="mb-4 flex flex-col gap-1 text-sm text-gray-500">
        <li>Verwendung ausschließlich zur Punkte-Berechnung</li>
        <li>Keine Weitergabe an Dritte</li>
        <li>Einwilligung jederzeit hier widerrufbar</li>
      </ul>
      <p class="mb-5 text-xs text-gray-400">
        Weitere Informationen in unserer
        <a href="/datenschutz" class="text-primary underline underline-offset-2">Datenschutzerklärung</a>.
      </p>
      <div class="flex gap-3">
        <button
          type="button"
          onclick={() => (showHealthConsentDialog = false)}
          class="flex-1 rounded-xl border border-black/15 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
        >
          Abbrechen
        </button>
        <button
          type="button"
          onclick={() => doToggleHealth(true)}
          class="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Einwilligen &amp; verbinden
        </button>
      </div>
    </div>
  </div>
{/if}

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
          type="button"
          onclick={() => (showDeleteDialog = false)}
          class="flex-1 rounded-xl border border-black/15 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
        >
          Abbrechen
        </button>
        <button
          type="button"
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
