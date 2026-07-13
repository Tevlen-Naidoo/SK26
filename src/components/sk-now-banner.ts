import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared.js';
import { EVENTS } from '../data/itinerary.js';
import { daysUntil, formatDateLong, formatTimeRange, nowOrNext } from '../lib/dates.js';

@customElement('sk-now-banner')
export class SkNowBanner extends LitElement {
	static override styles = [
		sharedStyles,
		css`
      aside {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-4);
        background: color-mix(in srgb, var(--city-accent) 6%, var(--paper-raised));
        border: 1px solid var(--line);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
      }
      .kicker {
        font-family: var(--font-display);
        font-size: var(--step--1);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--city-accent);
      }
      h2 {
        font-size: var(--step-1);
        margin-top: 0.1em;
      }
      p {
        color: var(--ink-soft);
        font-size: var(--step--1);
        margin-top: 0.15em;
      }
      time {
        font-variant-numeric: tabular-nums;
      }
      i {
        font-size: 1.6rem;
        line-height: 1;
      }
    `,
	];

	/** Override "now"; when undefined the banner ticks live every minute. */
	@property({ attribute: false }) now?: Date;

	private timer = 0;

	override connectedCallback(): void {
		super.connectedCallback();
		this.timer = window.setInterval(() => {
			if (!this.now) this.requestUpdate();
		}, 60_000);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		clearInterval(this.timer);
	}

	override render() {
		const now = this.now ?? new Date();
		const { state, event } = nowOrNext(now, EVENTS);

		let kicker = '';
		let title = '';
		let sub: unknown = nothing;
		let icon = '🧭';

		if (state === 'pre' && event) {
			const d = daysUntil(now, event.date);
			kicker = '안녕하세요 · Annyeong';
			title =
				d <= 0 ? 'Departure day — let’s go!' : `Trip begins in ${d} day${d === 1 ? '' : 's'}`;
			sub = html`First up: ${event.title}`;
			icon = '🛫';
		} else if (state === 'now' && event) {
			kicker = 'Right now · 지금';
			title = event.title;
			sub = html`Until <time>${event.end ?? '—'}</time>${event.location
				? html` · ${event.location.name}`
				: nothing}`;
			icon = '📍';
		} else if (state === 'next' && event) {
			kicker = 'Up next · 다음';
			title = event.title;
			sub = html`<time>${formatDateLong(event.date)}</time>, ${formatTimeRange(event) || 'soon'}`;
			icon = '⏭️';
		} else {
			kicker = '여행 끝 · Done';
			title = 'Trip complete 🎉';
			sub = html`Hope it was unforgettable.`;
			icon = '🏠';
		}

		return html`
      <aside aria-live="polite" aria-label="What we should be doing now">
        <i aria-hidden="true">${icon}</i>
        <section>
          <p class="kicker">${kicker}</p>
          <h2>${title}</h2>
          <p>${sub}</p>
        </section>
      </aside>
    `;
	}
}
