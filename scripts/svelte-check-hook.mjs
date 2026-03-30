/**
 * Claude Code PostToolUse Hook – svelte-check
 * Läuft nach jeder Bearbeitung einer .ts/.svelte-Datei in src/.
 * Gibt TypeFehler als additionalContext zurück → Claude sieht sie sofort.
 */
import { execSync } from 'child_process';

const chunks = [];
process.stdin.on('data', (d) => chunks.push(d));
process.stdin.on('end', () => {
	let input;
	try {
		input = JSON.parse(chunks.join(''));
	} catch {
		process.exit(0);
	}

	const filePath = (input.tool_input && input.tool_input.file_path) || '';
	const inSrc =
		filePath.includes('/src/') ||
		filePath.includes('\\src\\') ||
		filePath.includes('\\src/') ||
		filePath.includes('/src\\');
	const isSvelteOrTs = /\.(ts|svelte)$/.test(filePath);

	if (!inSrc || !isSvelteOrTs) process.exit(0);

	try {
		execSync('npx svelte-check --tsconfig ./jsconfig.json --threshold error', {
			stdio: ['pipe', 'pipe', 'pipe']
		});
		// Kein Fehler → kein Output, Hook endet lautlos
	} catch (e) {
		const raw = ((e.stdout || '').toString() + (e.stderr || '').toString());
		const clean = raw
			.replace(/\x1B\[[0-9;]*m/g, '') // ANSI-Codes entfernen
			.split('\n')
			.filter((l) => l.trim())
			.slice(0, 60)
			.join('\n');

		process.stdout.write(
			JSON.stringify({
				hookSpecificOutput: {
					hookEventName: 'PostToolUse',
					additionalContext: `svelte-check Typfehler:\n${clean}`
				}
			})
		);
	}
});
