/**
 * Tiny dependency-free fuzzy matcher. Returns a score (higher = better) when
 * every character of `query` appears in `text` in order, or null when it
 * doesn't match. Consecutive and word-start matches score higher.
 */
export function fuzzyScore(query: string, text: string): number | null {
	const q = query.toLowerCase().trim();
	if (!q) return 0;
	const t = text.toLowerCase();
	let score = 0;
	let ti = 0;
	let prevMatch = -2;
	for (let qi = 0; qi < q.length; qi++) {
		const ch = q[qi];
		if (ch === ' ') continue;
		const found = t.indexOf(ch, ti);
		if (found === -1) return null;
		score += 1;
		if (found === prevMatch + 1) score += 4; // contiguous run
		const before = found === 0 ? '' : t[found - 1];
		if (found === 0 || before === ' ' || before === '-' || before === '/') score += 3; // word start
		score -= Math.min(found - ti, 4) * 0.1; // small gap penalty
		prevMatch = found;
		ti = found + 1;
	}
	return score;
}

/** Filter + rank items by a query over one or more searchable strings. */
export function fuzzyFilter<T>(
	query: string,
	items: T[],
	keys: (item: T) => string[],
): T[] {
	const q = query.trim();
	if (!q) return items;
	const scored: { item: T; score: number }[] = [];
	for (const item of items) {
		let best: number | null = null;
		for (const field of keys(item)) {
			const s = fuzzyScore(q, field);
			if (s !== null && (best === null || s > best)) best = s;
		}
		if (best !== null) scored.push({ item, score: best });
	}
	scored.sort((a, b) => b.score - a.score);
	return scored.map((s) => s.item);
}
