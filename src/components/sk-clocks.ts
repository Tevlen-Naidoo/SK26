import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared.js';

interface Zone {
	flag: string;
	country: string;
	city: string;
	tz: string;
	abbr: string;
	offset: string;
	rel: string;
	home?: boolean;
	trip?: boolean;
}

const ZONES: Zone[] = [
	{
		flag: '🇿🇦',
		country: 'South Africa',
		city: 'Johannesburg',
		tz: 'Africa/Johannesburg',
		abbr: 'SAST',
		offset: 'UTC+2',
		rel: 'Home',
		home: true,
	},
	{
		flag: '🇦🇪',
		country: 'Dubai',
		city: 'Dubai (layover)',
		tz: 'Asia/Dubai',
		abbr: 'GST',
		offset: 'UTC+4',
		rel: '+2 h ahead of home',
	},
	{
		flag: '🇰🇷',
		country: 'South Korea',
		city: 'Seoul · Jeju · Busan',
		tz: 'Asia/Seoul',
		abbr: 'KST',
		offset: 'UTC+9',
		rel: '+7 h ahead of home',
		trip: true,
	},
];

@customElement('sk-clocks')
export class SkClocks extends LitElement {
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
      .lead {
        color: var(--ink-soft);
        margin-top: var(--space-2);
      }
      ul {
        display: grid;
        gap: var(--space-3);
        grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
      }
      article.clock {
        padding: var(--space-4);
        background: color-mix(in srgb, var(--paper-raised) 64%, transparent);
        -webkit-backdrop-filter: blur(12px) saturate(140%);
        backdrop-filter: blur(12px) saturate(140%);
        border: 1px solid color-mix(in srgb, var(--ink) 8%, transparent);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        text-align: center;
      }
      article.clock[data-trip] {
        border-color: var(--city-accent);
        box-shadow: 0 0 0 1px var(--city-accent), var(--shadow);
      }
      h2 {
        font-size: var(--step-1);
        display: flex;
        gap: 0.4em;
        align-items: baseline;
        justify-content: center;
        flex-wrap: wrap;
      }
      h2 i {
        font-size: 1.4em;
      }
      time.big {
        display: block;
        font-family: var(--font-display);
        font-variant-numeric: tabular-nums;
        font-size: clamp(2.2rem, 9vw, 3rem);
        letter-spacing: 0.02em;
        margin: var(--space-2) 0 var(--space-1);
        color: var(--ink);
      }
      time.big small {
        font-size: 0.45em;
        color: var(--ink-soft);
        vertical-align: 0.4em;
        margin-left: 0.1em;
      }
      p.date {
        color: var(--ink-soft);
      }
      dl.meta {
        display: flex;
        justify-content: center;
        gap: var(--space-1) var(--space-3);
        flex-wrap: wrap;
        margin-top: var(--space-3);
        padding-top: var(--space-2);
        border-top: 1px solid var(--line);
        font-size: var(--step--1);
      }
      dl.meta dt {
        color: var(--ink-soft);
      }
      dl.meta dd {
        margin: 0;
        font-weight: 600;
        color: var(--city-accent);
      }
      .rel {
        margin-top: var(--space-2);
        font-size: var(--step--1);
      }
      .rel b {
        color: var(--taeguk-red);
      }
    `,
	];

	@state() private now = new Date();
	private timer = 0;

	override connectedCallback(): void {
		super.connectedCallback();
		this.timer = window.setInterval(() => (this.now = new Date()), 1000);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		clearInterval(this.timer);
	}

	private time(tz: string): { hms: string; secs: string } {
		const parts = new Intl.DateTimeFormat('en-GB', {
			timeZone: tz,
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false,
		}).formatToParts(this.now);
		const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
		return { hms: `${get('hour')}:${get('minute')}`, secs: get('second') };
	}

	private date(tz: string): string {
		return new Intl.DateTimeFormat('en-GB', {
			timeZone: tz,
			weekday: 'long',
			day: 'numeric',
			month: 'long',
		}).format(this.now);
	}

	override render() {
		return html`
      <header class="intro">
        <p class="ko">시계 · World clocks</p>
        <h1>What time is it back there?</h1>
        <p class="lead">Live times across the trip. South Korea runs 7 hours ahead of home — handy for calling family.</p>
      </header>

      <ul>
        ${ZONES.map((z) => {
			const { hms, secs } = this.time(z.tz);
			return html`<li>
            <article class="clock" ?data-trip=${z.trip}>
              <h2>
                <i aria-hidden="true">${z.flag}</i> ${z.country}
                <small>${z.city}</small>
              </h2>
              <time class="big" datetime=${this.now.toISOString()}>
                ${hms}<small>${secs}</small>
              </time>
              <p class="date">${this.date(z.tz)}</p>
              <dl class="meta">
                <dt>Zone</dt>
                <dd>${z.abbr} · ${z.offset}</dd>
              </dl>
              <p class="rel">${z.home ? html`<b>${z.rel}</b>` : z.rel}</p>
            </article>
          </li>`;
		})}
      </ul>
    `;
	}
}
