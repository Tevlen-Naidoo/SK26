import type { CitySegment, NowState, Phase, TripEvent } from '../types.js';

const SEOUL = 'Asia/Seoul';

/** Resolve "now", honouring a ?now= override string (any Date-parseable form). */
export function resolveNow(override?: string | null): Date {
	if (override) {
		const d = new Date(override);
		if (!Number.isNaN(d.getTime())) return d;
	}
	return new Date();
}

/** Absolute instant of an Asia/Seoul wall-clock date + time. */
export function eventInstant(date: string, time = '00:00'): Date {
	return new Date(`${date}T${time.length === 5 ? time : '00:00'}:00+09:00`);
}

/** "YYYY-MM-DD" for the given instant, as seen in Seoul. */
export function seoulYMD(d: Date): string {
	return new Intl.DateTimeFormat('en-CA', {
		timeZone: SEOUL,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).format(d);
}

/** Whole days from now's Seoul date to an ISO date (can be negative). */
export function daysUntil(now: Date, isoDate: string): number {
	const a = eventInstant(seoulYMD(now)).getTime();
	const b = eventInstant(isoDate).getTime();
	return Math.round((b - a) / 86_400_000);
}

/** Which city (or pre/post) are we in for the given instant. */
export function currentPhase(now: Date, segments: CitySegment[]): Phase {
	const t = now.getTime();
	if (segments.length === 0) return 'pre';
	if (t < new Date(segments[0].arrive).getTime()) return 'pre';
	const last = segments[segments.length - 1];
	if (t >= new Date(last.depart).getTime()) return 'post';
	let phase: Phase = segments[0].city;
	for (const seg of segments) {
		if (t >= new Date(seg.arrive).getTime()) phase = seg.city;
	}
	return phase;
}

/** Pick a sensible city for theming when between/around the trip. */
export function themeCity(phase: Phase): 'seoul' | 'jeju' | 'busan' {
	if (phase === 'pre') return 'seoul';
	if (phase === 'post') return 'busan';
	return phase;
}

interface Timed {
	ev: TripEvent;
	start: number;
	end: number;
}

function timeline(events: TripEvent[]): Timed[] {
	return events
		.map((ev) => {
			const start = eventInstant(ev.date, ev.start ?? '08:00').getTime();
			const end = ev.end
				? eventInstant(ev.date, ev.end).getTime()
				: start + 60 * 60 * 1000;
			return { ev, start, end };
		})
		.sort((a, b) => a.start - b.start);
}

/** What we should be doing now (or next). */
export function nowOrNext(now: Date, events: TripEvent[]): NowState {
	const tl = timeline(events);
	if (tl.length === 0) return { state: 'pre' };
	const t = now.getTime();

	if (t < tl[0].start) return { state: 'pre', event: tl[0].ev };

	const active = tl.find((x) => t >= x.start && t < x.end);
	if (active) return { state: 'now', event: active.ev };

	const upcoming = tl.find((x) => x.start > t);
	if (upcoming) return { state: 'next', event: upcoming.ev };

	return { state: 'post', event: tl[tl.length - 1].ev };
}

const WD_FULL = [
	'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];
const MO_FULL = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December',
];

/** "Sunday, 19 July" from an ISO date string (no timezone math needed — date is fixed). */
export function formatDateLong(isoDate: string): string {
	const [y, m, d] = isoDate.split('-').map(Number);
	const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
	return `${WD_FULL[wd]}, ${d} ${MO_FULL[m - 1]}`;
}

export function weekdayIndex(isoDate: string): number {
	const [y, m, d] = isoDate.split('-').map(Number);
	return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function formatTimeRange(ev: TripEvent): string {
	if (!ev.start) return '';
	return ev.end ? `${ev.start}–${ev.end}` : ev.start;
}
