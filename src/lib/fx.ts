/**
 * KRW ↔ ZAR exchange rate via Frankfurter (frankfurter.dev) — no API key,
 * CORS-enabled, ECB data. Result is cached in localStorage for a day and falls
 * back to the itinerary's fixed rate (R1 ≈ ₩93) when offline.
 */

/** Fixed fallback used across the itinerary: 1 ZAR ≈ 93 KRW. */
export const FALLBACK_KRW_PER_ZAR = 93;

const KEY = 'sk26-fx';
const MAX_AGE = 24 * 60 * 60 * 1000; // 1 day

export interface FxRate {
	/** How many KRW per 1 ZAR. */
	krwPerZar: number;
	/** ISO date the rate is from (ECB reference date), or 'fallback'. */
	date: string;
	live: boolean;
}

interface Cached {
	krwPerZar: number;
	date: string;
	fetchedAt: number;
}

function readCache(): Cached | undefined {
	try {
		const raw = localStorage.getItem(KEY);
		if (raw) return JSON.parse(raw) as Cached;
	} catch {
		/* ignore */
	}
	return undefined;
}

function writeCache(c: Cached): void {
	try {
		localStorage.setItem(KEY, JSON.stringify(c));
	} catch {
		/* ignore */
	}
}

/** Fetch (or reuse a cached) KRW-per-ZAR rate; never throws. */
export async function getRate(now = Date.now()): Promise<FxRate> {
	const cached = readCache();
	if (cached && now - cached.fetchedAt < MAX_AGE) {
		return { krwPerZar: cached.krwPerZar, date: cached.date, live: true };
	}
	try {
		const res = await fetch('https://api.frankfurter.dev/v1/latest?base=ZAR&symbols=KRW');
		if (!res.ok) throw new Error(`fx ${res.status}`);
		const data = await res.json();
		const krwPerZar = data?.rates?.KRW;
		const date = data?.date ?? 'unknown';
		if (typeof krwPerZar === 'number' && krwPerZar > 0) {
			writeCache({ krwPerZar, date, fetchedAt: now });
			return { krwPerZar, date, live: true };
		}
		throw new Error('no rate');
	} catch {
		if (cached) return { krwPerZar: cached.krwPerZar, date: cached.date, live: true };
		return { krwPerZar: FALLBACK_KRW_PER_ZAR, date: 'fallback', live: false };
	}
}
