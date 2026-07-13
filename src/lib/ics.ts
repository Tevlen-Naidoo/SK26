import type { TripEvent } from '../types.js';
import { EVENTS } from '../data/itinerary.js';

/**
 * Build a valid iCalendar (.ics) file from the trip events. Times are pinned to
 * Asia/Seoul via a VTIMEZONE + TZID, so the phone's calendar always shows Korea
 * local time regardless of the device timezone. Each event gets a -30 min alarm.
 */

const PRODID = '-//SK26//Itinerary//EN';

/** "2026-07-20" + "13:00" → "20260720T130000" (local wall time, no Z). */
function localStamp(date: string, time: string): string {
	return `${date.replace(/-/g, '')}T${time.replace(':', '')}00`;
}

/** Current instant → "YYYYMMDDTHHMMSSZ" in UTC. */
function utcStamp(d = new Date()): string {
	return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Escape per RFC 5545 (order matters: backslash first). */
function esc(s: string): string {
	return s
		.replace(/\\/g, '\\\\')
		.replace(/;/g, '\\;')
		.replace(/,/g, '\\,')
		.replace(/\r?\n/g, '\\n');
}

/** Fold long content lines at 75 octets with a leading space (RFC 5545). */
function fold(line: string): string {
	if (line.length <= 75) return line;
	const parts: string[] = [];
	let rest = line;
	parts.push(rest.slice(0, 75));
	rest = rest.slice(75);
	while (rest.length > 74) {
		parts.push(' ' + rest.slice(0, 74));
		rest = rest.slice(74);
	}
	if (rest.length) parts.push(' ' + rest);
	return parts.join('\r\n');
}

const VTIMEZONE = [
	'BEGIN:VTIMEZONE',
	'TZID:Asia/Seoul',
	'BEGIN:STANDARD',
	'DTSTART:19700101T000000',
	'TZOFFSETFROM:+0900',
	'TZOFFSETTO:+0900',
	'TZNAME:KST',
	'END:STANDARD',
	'END:VTIMEZONE',
];

function vevent(e: TripEvent, stamp: string): string[] {
	const start = e.start ?? '00:00';
	const end = e.end ?? start;
	const descParts: string[] = [];
	if (e.summary) descParts.push(e.summary);
	if (e.cost && e.cost.krw > 0)
		descParts.push(`Cost: ₩${e.cost.krw.toLocaleString()} (≈ R${e.cost.zar.toLocaleString()}) pp`);
	if (e.booking) descParts.push(`Booking: ${e.booking}`);
	const lines = [
		'BEGIN:VEVENT',
		`UID:${e.id}@sk26.trip`,
		`DTSTAMP:${stamp}`,
		`DTSTART;TZID=Asia/Seoul:${localStamp(e.date, start)}`,
		`DTEND;TZID=Asia/Seoul:${localStamp(e.date, end)}`,
		`SUMMARY:${esc(e.title)}`,
	];
	if (descParts.length) lines.push(`DESCRIPTION:${esc(descParts.join('\n'))}`);
	if (e.location?.name) lines.push(`LOCATION:${esc(e.location.name)}`);
	lines.push(
		'BEGIN:VALARM',
		'ACTION:DISPLAY',
		`DESCRIPTION:${esc(e.title)}`,
		'TRIGGER:-PT30M',
		'END:VALARM',
		'END:VEVENT',
	);
	return lines;
}

export function buildIcs(events: TripEvent[] = EVENTS): string {
	const stamp = utcStamp();
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		`PRODID:${PRODID}`,
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'X-WR-CALNAME:SK26 · South Korea',
		'X-WR-TIMEZONE:Asia/Seoul',
		...VTIMEZONE,
		...events.flatMap((e) => vevent(e, stamp)),
		'END:VCALENDAR',
	];
	return lines.map(fold).join('\r\n');
}

/** Trigger a download of the whole itinerary as sk26-itinerary.ics. */
export function downloadIcs(events: TripEvent[] = EVENTS): void {
	const blob = new Blob([buildIcs(events)], { type: 'text/calendar;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'sk26-itinerary.ics';
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}
