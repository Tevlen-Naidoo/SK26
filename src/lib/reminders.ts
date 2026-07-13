import { EVENTS } from '../data/itinerary.js';
import { eventInstant } from './dates.js';
import type { TripEvent } from '../types.js';

/**
 * Opt-in *local* notifications. These fire from the browser/installed PWA while
 * it is running — there is no server, so true background push isn't possible on
 * this static host. The .ics calendar export is the reliable alarm; this is a
 * bonus for when the app is open. Preference is persisted in localStorage.
 */

const KEY = 'sk26-reminders';
/** setTimeout caps at ~24.8 days; don't try to schedule further out. */
const MAX_DELAY = 2 ** 31 - 1;

export interface ReminderPrefs {
	enabled: boolean;
	/** minutes before an event to notify */
	leadMin: number;
}

const DEFAULTS: ReminderPrefs = { enabled: false, leadMin: 30 };

let timers: ReturnType<typeof setTimeout>[] = [];

export function loadPrefs(): ReminderPrefs {
	try {
		const raw = localStorage.getItem(KEY);
		if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<ReminderPrefs>) };
	} catch {
		/* ignore */
	}
	return { ...DEFAULTS };
}

function savePrefs(p: ReminderPrefs): void {
	try {
		localStorage.setItem(KEY, JSON.stringify(p));
	} catch {
		/* ignore */
	}
}

export function permission(): NotificationPermission | 'unsupported' {
	if (typeof Notification === 'undefined') return 'unsupported';
	return Notification.permission;
}

function clearTimers(): void {
	timers.forEach(clearTimeout);
	timers = [];
}

function fire(e: TripEvent): void {
	if (permission() !== 'granted') return;
	const when = e.start ? ` at ${e.start}` : '';
	try {
		new Notification(e.title, {
			body: (e.summary ?? `Coming up${when}.`).slice(0, 180),
			tag: e.id,
			icon: '/favicon.svg',
		});
	} catch {
		/* ignore */
	}
}

/** (Re)schedule notifications for all upcoming events, given current prefs. */
export function reschedule(now = new Date(), events: TripEvent[] = EVENTS): number {
	clearTimers();
	const prefs = loadPrefs();
	if (!prefs.enabled || permission() !== 'granted') return 0;
	const nowMs = now.getTime();
	let scheduled = 0;
	for (const e of events) {
		if (!e.start) continue;
		const fireAt = eventInstant(e.date, e.start).getTime() - prefs.leadMin * 60_000;
		const delay = fireAt - nowMs;
		if (delay <= 0 || delay > MAX_DELAY) continue;
		timers.push(setTimeout(() => fire(e), delay));
		scheduled++;
	}
	return scheduled;
}

/** Ask for permission (if needed) and enable reminders. Returns final state. */
export async function enable(leadMin = loadPrefs().leadMin): Promise<ReminderPrefs> {
	if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
		try {
			await Notification.requestPermission();
		} catch {
			/* ignore */
		}
	}
	const granted = permission() === 'granted';
	const prefs: ReminderPrefs = { enabled: granted, leadMin };
	savePrefs(prefs);
	reschedule();
	return prefs;
}

export function disable(): ReminderPrefs {
	const prefs: ReminderPrefs = { ...loadPrefs(), enabled: false };
	savePrefs(prefs);
	clearTimers();
	return prefs;
}

export function setLead(leadMin: number): ReminderPrefs {
	const prefs: ReminderPrefs = { ...loadPrefs(), leadMin };
	savePrefs(prefs);
	reschedule();
	return prefs;
}

/** Call once on app start to re-arm timers if the user previously opted in. */
export function initReminders(): void {
	reschedule();
}
