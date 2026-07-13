// tokens.css is loaded via <link> in index.html so styles apply without JS.
import './components/sk-app.js';
import { initReminders } from './lib/reminders.js';

// Default route
if (!location.hash) location.hash = '#/home';

// Re-arm any opted-in local reminders for this session.
initReminders();

// Register the service worker (production only) so the site is installable
// and works offline. Dev keeps the network fresh without SW caching.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/sw.js').catch(() => {
			/* offline support is best-effort */
		});
	});
}
