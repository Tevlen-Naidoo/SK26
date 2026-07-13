import type { TabId } from '../types.js';

const TABS: TabId[] = [
	'home',
	'itinerary',
	'calendar',
	'cuisine',
	'inspo',
	'tips',
	'clocks',
];

export function tabFromHash(): TabId {
	const raw = location.hash.replace(/^#\/?/, '').split('?')[0];
	return (TABS as string[]).includes(raw) ? (raw as TabId) : 'home';
}

export function goToTab(tab: TabId): void {
	if (tabFromHash() !== tab) location.hash = `#/${tab}`;
}

export function onHashChange(cb: (tab: TabId) => void): () => void {
	const handler = () => cb(tabFromHash());
	window.addEventListener('hashchange', handler);
	return () => window.removeEventListener('hashchange', handler);
}

export const ALL_TABS = TABS;
