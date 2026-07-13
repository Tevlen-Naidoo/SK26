import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared.js';
import { EVENTS } from '../data/itinerary.js';
import { formatDateLong, seoulYMD } from '../lib/dates.js';
import type { TripEvent } from '../types.js';
import './sk-now-banner.js';
import './sk-event-item.js';

const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
	{ y: 2026, m: 6, label: 'July 2026' },
	{ y: 2026, m: 7, label: 'August 2026' },
];

@customElement('sk-calendar')
export class SkCalendar extends LitElement {
	static override styles = [
		sharedStyles,
		css`
      :host {
        display: block;
      }
      header.intro {
        margin-bottom: var(--space-4);
      }
      h1 {
        font-size: var(--step-3);
      }
      sk-now-banner {
        display: block;
        margin: var(--space-4) 0;
      }
      .months {
        display: grid;
        gap: var(--space-4);
        grid-template-columns: 1fr;
      }
      @media (min-width: 40rem) {
        .months {
          grid-template-columns: 1fr 1fr;
        }
      }
      table {
        width: 100%;
        border-collapse: collapse;
        background: var(--paper-raised);
        border-radius: var(--radius);
        overflow: hidden;
        box-shadow: var(--shadow);
      }
      caption {
        font-family: var(--font-display);
        font-size: var(--step-1);
        text-align: left;
        padding: var(--space-2) var(--space-3);
        color: var(--city-accent);
      }
      th[scope='col'] {
        font-size: var(--step--1);
        color: var(--ink-soft);
        font-weight: 600;
        padding: var(--space-1);
      }
      td {
        text-align: center;
        vertical-align: top;
        height: 3rem;
        border: 1px solid var(--line);
        padding: 0;
      }
      td time {
        display: block;
        padding: var(--space-1);
        color: var(--ink-soft);
        font-size: var(--step--1);
      }
      button.day {
        width: 100%;
        height: 100%;
        min-height: 3rem;
        border: 0;
        background: transparent;
        color: var(--ink);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: var(--space-1);
        font-variant-numeric: tabular-nums;
      }
      button.day:hover {
        background: color-mix(in srgb, var(--city-accent) 12%, transparent);
      }
      button.day[aria-pressed='true'] {
        background: var(--city-accent);
        color: #fff;
      }
      button.day b.today {
        outline: 2px solid var(--taeguk-red);
        border-radius: 50%;
        width: 1.6em;
        height: 1.6em;
        display: grid;
        place-items: center;
      }
      i.dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--taeguk-red);
      }
      button.day[aria-pressed='true'] i.dot {
        background: #fff;
      }
      section.day-panel {
        margin-top: var(--space-4);
      }
      section.day-panel h2 {
        font-size: var(--step-2);
        margin-bottom: var(--space-3);
      }
      ul {
        display: grid;
        gap: var(--space-3);
      }
      p.empty {
        color: var(--ink-soft);
        font-style: italic;
      }
    `,
	];

	@property({ attribute: false }) now?: Date;
	@state() private selected = '';

	private eventsByDate(): Map<string, TripEvent[]> {
		const map = new Map<string, TripEvent[]>();
		for (const e of EVENTS) {
			const arr = map.get(e.date) ?? [];
			arr.push(e);
			map.set(e.date, arr);
		}
		return map;
	}

	private get effectiveSelected(): string {
		if (this.selected) return this.selected;
		const today = seoulYMD(this.now ?? new Date());
		return this.eventsByDate().has(today) ? today : '2026-07-19';
	}

	private iso(y: number, m: number, day: number): string {
		return `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
	}

	private renderMonth(y: number, m: number, label: string, byDate: Map<string, TripEvent[]>, today: string) {
		const firstWd = new Date(Date.UTC(y, m, 1)).getUTCDay();
		const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
		const cells: (number | null)[] = [];
		for (let i = 0; i < firstWd; i++) cells.push(null);
		for (let d = 1; d <= days; d++) cells.push(d);
		while (cells.length % 7 !== 0) cells.push(null);
		const weeks: (number | null)[][] = [];
		for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
		const sel = this.effectiveSelected;

		return html`
      <table>
        <caption>
          ${label}
        </caption>
        <thead>
          <tr>
            ${WD.map((w) => html`<th scope="col" abbr=${w}>${w[0]}</th>`)}
          </tr>
        </thead>
        <tbody>
          ${weeks.map(
			(week) => html`<tr>
              ${week.map((d) => {
				if (d === null) return html`<td></td>`;
				const iso = this.iso(y, m, d);
				const evs = byDate.get(iso);
				if (!evs) return html`<td><time datetime=${iso}>${d}</time></td>`;
				const isToday = iso === today;
				return html`<td>
                  <button
                    class="day"
                    aria-pressed=${iso === sel ? 'true' : 'false'}
                    aria-label=${`${formatDateLong(iso)}, ${evs.length} events`}
                    @click=${() => (this.selected = iso)}
                  >
                    ${isToday
						? html`<b class="today">${d}</b>`
						: html`<b>${d}</b>`}
                    <i class="dot" aria-hidden="true"></i>
                  </button>
                </td>`;
			})}
            </tr>`,
		)}
        </tbody>
      </table>
    `;
	}

	override render() {
		const byDate = this.eventsByDate();
		const today = seoulYMD(this.now ?? new Date());
		const sel = this.effectiveSelected;
		const dayEvents = (byDate.get(sel) ?? []).sort((a, b) =>
			(a.start ?? '').localeCompare(b.start ?? ''),
		);

		return html`
      <header class="intro">
        <p class="ko">달력 · Calendar</p>
        <h1>Where to be, when</h1>
      </header>

      <sk-now-banner .now=${this.now}></sk-now-banner>

      <section class="months" aria-label="Trip calendar">
        ${MONTHS.map((mo) => this.renderMonth(mo.y, mo.m, mo.label, byDate, today))}
      </section>

      <section class="day-panel" aria-live="polite">
        <h2><time datetime=${sel}>${formatDateLong(sel)}</time></h2>
        ${dayEvents.length
				? html`<ul>
              ${dayEvents.map(
					(e) => html`<li><sk-event-item .event=${e}></sk-event-item></li>`,
				)}
            </ul>`
				: html`<p class="empty">Nothing planned — pick a highlighted day above.</p>`}
      </section>
    `;
	}
}
