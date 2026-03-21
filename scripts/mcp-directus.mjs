/**
 * Directus MCP Server für AustroFit
 *
 * Verbindet Claude Code direkt mit der Directus CMS API (read-only).
 * Start: node --env-file=.env scripts/mcp-directus.mjs
 *
 * Konfiguration via .env:
 *   PUBLIC_CMSURL        – Directus Base URL
 *   DIRECTUS_READ_TOKEN  – Read-only Static Token
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const BASE_URL = process.env.PUBLIC_CMSURL?.replace(/\/$/, '');
const TOKEN = process.env.DIRECTUS_READ_TOKEN;

if (!BASE_URL || !TOKEN) {
	console.error('Fehler: PUBLIC_CMSURL und DIRECTUS_READ_TOKEN müssen in .env gesetzt sein.');
	process.exit(1);
}

async function directusFetch(path, params = {}) {
	const url = new URL(`${BASE_URL}${path}`);
	for (const [k, v] of Object.entries(params)) {
		if (v !== undefined && v !== null && v !== '') {
			url.searchParams.set(k, String(v));
		}
	}
	const res = await fetch(url.toString(), {
		headers: { Authorization: `Bearer ${TOKEN}` }
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Directus ${res.status}: ${text}`);
	}
	return res.json();
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

// ── Start ──────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
