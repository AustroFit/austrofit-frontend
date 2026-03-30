/**
 * Directus MCP Server für AustroFit
 *
 * Verbindet Claude Code direkt mit der Directus CMS API (read-only).
 * Start: node --env-file=.env scripts/mcp-directus.mjs
 *
 * Konfiguration via .env:
 *   PUBLIC_CMSURL              – Directus Base URL
 *   DIRECTUS_READ_TOKEN        – Read-only Static Token (public content)
 *   PRIVATE_CMS_STATIC_TOKEN   – Admin Token (user_profiles, points_ledger, quiz_attempts)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const BASE_URL = process.env.PUBLIC_CMSURL?.replace(/\/$/, '');
const TOKEN = process.env.DIRECTUS_READ_TOKEN;
const ADMIN_TOKEN = process.env.PRIVATE_CMS_STATIC_TOKEN;

if (!BASE_URL || !TOKEN) {
	console.error('Fehler: PUBLIC_CMSURL und DIRECTUS_READ_TOKEN müssen in .env gesetzt sein.');
	process.exit(1);
}

async function directusFetch(path, params = {}, token = TOKEN) {
	const url = new URL(`${BASE_URL}${path}`);
	for (const [k, v] of Object.entries(params)) {
		if (v !== undefined && v !== null && v !== '') {
			url.searchParams.set(k, String(v));
		}
	}
	const res = await fetch(url.toString(), {
		headers: { Authorization: `Bearer ${token}` }
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Directus ${res.status}: ${text}`);
	}
	return res.json();
}

function directusFetchAdmin(path, params = {}) {
	if (!ADMIN_TOKEN) throw new Error('PRIVATE_CMS_STATIC_TOKEN nicht gesetzt – dieses Tool benötigt Admin-Zugriff.');
	return directusFetch(path, params, ADMIN_TOKEN);
}

const server = new McpServer({
	name: 'directus-austrofit',
	version: '1.0.0'
});

// ── Tools ──────────────────────────────────────────────────────────────────

server.tool(
	'list_collections',
	'Listet alle Directus Collections mit Metadaten auf.',
	{},
	async () => {
		const data = await directusFetch('/collections');
		const collections = data.data.map((c) => ({
			collection: c.collection,
			note: c.meta?.note ?? null,
			singleton: c.meta?.singleton ?? false,
			hidden: c.meta?.hidden ?? false,
			icon: c.meta?.icon ?? null
		}));
		return {
			content: [{ type: 'text', text: JSON.stringify(collections, null, 2) }]
		};
	}
);

server.tool(
	'get_fields',
	'Gibt alle Felder einer Collection zurück (Name, Typ, Pflichtfeld, Relation).',
	{ collection: z.string().describe('Name der Collection, z.B. "articles"') },
	async ({ collection }) => {
		const data = await directusFetch(`/fields/${collection}`);
		const fields = data.data.map((f) => ({
			field: f.field,
			type: f.type,
			required: f.schema?.is_nullable === false,
			default: f.schema?.default_value ?? null,
			relation: f.meta?.interface ?? null,
			note: f.meta?.note ?? null
		}));
		return {
			content: [{ type: 'text', text: JSON.stringify(fields, null, 2) }]
		};
	}
);

server.tool(
	'read_items',
	'Liest Items aus einer Directus Collection. Unterstützt filter, fields, limit, sort, search.',
	{
		collection: z.string().describe('Name der Collection, z.B. "articles"'),
		fields: z
			.string()
			.optional()
			.describe('Kommagetrennte Felder, z.B. "id,title,slug". Default: alle'),
		filter: z
			.string()
			.optional()
			.describe('JSON-Filter-Objekt als String, z.B. {"status":{"_eq":"published"}}'),
		limit: z.number().optional().describe('Max. Anzahl Items (default: 25, max: 200)'),
		offset: z.number().optional().describe('Offset für Pagination'),
		sort: z.string().optional().describe('Sortierung, z.B. "-date_created" oder "title"'),
		search: z.string().optional().describe('Volltext-Suche')
	},
	async ({ collection, fields, filter, limit, offset, sort, search }) => {
		const params = {
			'meta': 'total_count',
			'limit': Math.min(limit ?? 25, 200),
			'fields': fields ?? '*',
			...(offset && { offset }),
			...(sort && { sort }),
			...(search && { search })
		};
		if (filter) {
			try {
				params['filter'] = filter;
			} catch {
				throw new Error('filter muss ein gültiges JSON-Objekt sein');
			}
		}
		const data = await directusFetch(`/items/${collection}`, params);
		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(
						{
							total: data.meta?.total_count ?? null,
							returned: data.data?.length ?? 0,
							items: data.data
						},
						null,
						2
					)
				}
			]
		};
	}
);

server.tool(
	'read_item',
	'Liest ein einzelnes Item aus einer Collection anhand der ID.',
	{
		collection: z.string().describe('Name der Collection'),
		id: z.string().describe('ID des Items'),
		fields: z.string().optional().describe('Kommagetrennte Felder. Default: alle')
	},
	async ({ collection, id, fields }) => {
		const data = await directusFetch(`/items/${collection}/${id}`, {
			fields: fields ?? '*'
		});
		return {
			content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }]
		};
	}
);

server.tool(
	'schema_snapshot',
	'Gibt den vollständigen Schema-Snapshot zurück (alle Collections + Fields + Relations). Nützlich für Überblick.',
	{},
	async () => {
		const data = await directusFetch('/schema/snapshot');
		return {
			content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }]
		};
	}
);

server.tool(
	'get_relations',
	'Listet alle Relations (Foreign Keys) – optional gefiltert auf eine Collection.',
	{
		collection: z
			.string()
			.optional()
			.describe('Optional: Nur Relations dieser Collection anzeigen')
	},
	async ({ collection }) => {
		const path = collection ? `/relations/${collection}` : '/relations';
		const data = await directusFetch(path);
		return {
			content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }]
		};
	}
);

server.tool(
	'read_user_profile',
	'Liest das user_profiles-Profil eines Nutzers (streak_days, activity_group, total_steps, etc.). Benötigt PRIVATE_CMS_STATIC_TOKEN.',
	{
		user_id: z.string().describe('Directus User-UUID, z.B. "abc123-..."')
	},
	async ({ user_id }) => {
		const data = await directusFetchAdmin('/items/user_profiles', {
			'filter': JSON.stringify({ user: { _eq: user_id } }),
			'fields': 'id,user,streak_days,longest_streak,quiz_streak_days,health_connected,onboarding_completed,activity_group,totalSteps',
			'limit': 1
		});
		const profile = data.data?.[0] ?? null;
		return {
			content: [{ type: 'text', text: JSON.stringify(profile, null, 2) }]
		};
	}
);

server.tool(
	'read_ledger_entries',
	'Liest Punkte-Buchungen aus points_ledger für einen Nutzer. Unterstützt Filter nach source_type, Limit und Offset. Benötigt PRIVATE_CMS_STATIC_TOKEN.',
	{
		user_id: z.string().describe('Directus User-UUID'),
		source_type: z
			.string()
			.optional()
			.describe('Filter auf source_type, z.B. "schritte", "cardio", "streak". Kommagetrennt für mehrere.'),
		limit: z.number().optional().describe('Max. Anzahl Einträge (default: 25, max: 200)'),
		offset: z.number().optional().describe('Offset für Pagination'),
		positive_only: z
			.boolean()
			.optional()
			.describe('Nur positive Buchungen (earnedPoints für Level). Default: false')
	},
	async ({ user_id, source_type, limit, offset, positive_only }) => {
		const filter = { user: { _eq: user_id } };
		if (positive_only) filter['points_delta'] = { _gt: 0 };
		if (source_type) {
			const types = source_type.split(',').map((s) => s.trim());
			filter['source_type'] = types.length === 1 ? { _eq: types[0] } : { _in: types };
		}
		const params = {
			'filter': JSON.stringify(filter),
			'fields': 'id,points_delta,source_type,source_ref,occurred_at,description,entry_date',
			'limit': Math.min(limit ?? 25, 200),
			'sort': '-occurred_at',
			'meta': 'total_count'
		};
		if (offset) params['offset'] = offset;
		const data = await directusFetchAdmin('/items/points_ledger', params);
		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(
						{
							total: data.meta?.total_count ?? null,
							returned: data.data?.length ?? 0,
							entries: data.data
						},
						null,
						2
					)
				}
			]
		};
	}
);

server.tool(
	'check_quiz_status',
	'Prüft den Quiz-Status eines Nutzers: ob ein Quiz bereits absolviert wurde, wann, und ob der Cooldown abgelaufen ist. Benötigt PRIVATE_CMS_STATIC_TOKEN.',
	{
		quiz_id: z.string().describe('ID des Quiz aus der quizzes Collection'),
		user_id: z
			.string()
			.optional()
			.describe('Directus User-UUID. Wird verwendet um points_claimed_at zu prüfen.'),
		anonymous_id: z
			.string()
			.optional()
			.describe('Anonyme ID (localStorage austrofit_anonymous_id) – alternativ zu user_id.')
	},
	async ({ quiz_id, user_id, anonymous_id }) => {
		if (!user_id && !anonymous_id) throw new Error('Entweder user_id oder anonymous_id muss angegeben werden.');

		// Quiz-Metadaten laden (cooldown_days)
		const quizData = await directusFetchAdmin(`/items/quizzes/${quiz_id}`, {
			fields: 'id,cooldown_days,status'
		});
		const quiz = quizData.data;

		// Attempts filtern
		const filter = { quiz: { _eq: quiz_id } };
		if (user_id) {
			// Attempts mit points_claimed_at (= einem eingeloggten User zugeordnet)
			filter['points_claimed_at'] = { _nnull: true };
		} else {
			filter['anonymous_id'] = { _eq: anonymous_id };
		}

		const attemptsData = await directusFetchAdmin('/items/quiz_attempts', {
			filter: JSON.stringify(filter),
			fields: 'id,anonymous_id,score,max_score,passed,eligible_points,points_claimed_at',
			sort: '-points_claimed_at',
			limit: 5
		});

		const attempts = attemptsData.data ?? [];
		const lastAttempt = attempts[0] ?? null;
		const cooldownDays = quiz?.cooldown_days ?? 30;
		let cooldownExpired = null;

		if (lastAttempt?.points_claimed_at) {
			const claimedAt = new Date(lastAttempt.points_claimed_at);
			const expiresAt = new Date(claimedAt.getTime() + cooldownDays * 86400000);
			cooldownExpired = new Date() >= expiresAt;
			lastAttempt._cooldown_expires_at = expiresAt.toISOString();
			lastAttempt._cooldown_expired = cooldownExpired;
		}

		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(
						{
							quiz: { id: quiz?.id, cooldown_days: cooldownDays, status: quiz?.status },
							attempts_found: attempts.length,
							last_attempt: lastAttempt,
							can_attempt: lastAttempt === null || cooldownExpired === true
						},
						null,
						2
					)
				}
			]
		};
	}
);

// ── Start ──────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
