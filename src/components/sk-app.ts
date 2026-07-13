import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared.js';
import { SEGMENTS, CITY_THEME } from '../data/cities.js';
import { currentPhase, resolveNow, themeCity } from '../lib/dates.js';
import { ALL_TABS, onHashChange, tabFromHash } from '../lib/router.js';
import type { Phase, TabId } from '../types.js';

import './sk-canvas-bg.js';
import './sk-now-banner.js';
import './sk-city-badge.js';
import './sk-home.js';
import './sk-itinerary.js';
import './sk-calendar.js';
import './sk-weather.js';
import './sk-cuisine.js';
import './sk-inspiration.js';
import './sk-apps.js';
import './sk-convert.js';
import './sk-documents.js';
import './sk-tips.js';
import './sk-clocks.js';

const TABS: { id: TabId; en: string; ko: string }[] = [
	{ id: 'home', en: 'Home', ko: '홈' },
	{ id: 'itinerary', en: 'Itinerary', ko: '일정' },
	{ id: 'calendar', en: 'Calendar', ko: '달력' },
	{ id: 'weather', en: 'Weather', ko: '날씨' },
	{ id: 'cuisine', en: 'Cuisine', ko: '음식' },
	{ id: 'inspo', en: 'Photos', ko: '사진' },
	{ id: 'apps', en: 'Apps', ko: '앱' },
	{ id: 'money', en: 'Convert', ko: '환전' },
	{ id: 'documents', en: 'Docs', ko: '서류' },
	{ id: 'tips', en: 'Tips', ko: '꿀팁' },
	{ id: 'clocks', en: 'Clocks', ko: '시계' },
];

@customElement('sk-app')
export class SkApp extends LitElement {
	static override styles = [
		sharedStyles,
		css`
      :host {
        display: block;
        min-height: 100vh;
      }
      main,
      header.top,
      footer {
        max-width: var(--maxw);
        margin-inline: auto;
        padding-inline: var(--space-3);
      }
      header.top {
        padding-top: var(--space-4);
        display: grid;
        gap: var(--space-3);
      }
      .titlebar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-3);
        flex-wrap: wrap;
      }
      hgroup h1 {
        font-size: var(--step-3);
        letter-spacing: 0.02em;
      }
      hgroup p {
        color: var(--ink-soft);
        font-size: var(--step--1);
      }
      nav[role='tablist'] {
        position: sticky;
        top: var(--space-2);
        z-index: 5;
        max-width: min(var(--maxw), calc(100% - 2 * var(--space-3)));
        margin: var(--space-4) auto var(--space-2);
        padding: var(--space-2);
        display: flex;
        gap: var(--space-2);
        overflow-x: auto;
        scrollbar-width: none;
        background: color-mix(in srgb, var(--paper) 55%, transparent);
        -webkit-backdrop-filter: blur(16px) saturate(150%);
        backdrop-filter: blur(16px) saturate(150%);
        border: 1px solid color-mix(in srgb, var(--ink) 8%, transparent);
        border-radius: 999px;
        box-shadow: var(--shadow);
      }
      nav[role='tablist']::-webkit-scrollbar {
        display: none;
      }
      a[role='tab'] {
        flex: 1 0 auto;
        min-width: 4.2rem;
        text-align: center;
        text-decoration: none;
        color: var(--ink-soft);
        padding: 0.5em 0.7em;
        border-radius: 999px;
        display: flex;
        flex-direction: column;
        gap: 0.1em;
        line-height: 1.1;
      }
      a[role='tab'] b {
        font-size: var(--step-0);
      }
      a[role='tab'] small {
        font-family: var(--font-display);
      }
      a[role='tab'][aria-selected='true'] {
        background: var(--city-accent);
        color: #fff;
      }
      a[role='tab'][aria-selected='true'] small {
        color: rgba(255, 255, 255, 0.85);
      }
      a[role='tab']:hover {
        color: var(--city-accent);
      }
      a[role='tab'][aria-selected='true']:hover {
        color: #fff;
      }
      main {
        padding-top: var(--space-4);
        padding-bottom: var(--space-5);
      }
      section[role='tabpanel'] {
        animation: fade 0.25s ease;
      }
      @keyframes fade {
        from {
          opacity: 0;
          transform: translateY(6px);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        section[role='tabpanel'] {
          animation: none;
        }
      }
      footer {
        padding-block: var(--space-5);
        color: var(--ink-soft);
        font-size: var(--step--1);
        text-align: center;
      }
      @media (max-width: 32rem) {
        header.top {
          padding-top: var(--space-3);
        }
        hgroup h1 {
          font-size: var(--step-2);
        }
        a[role='tab'] {
          min-width: 3.6rem;
          padding: 0.4em 0.55em;
        }
        a[role='tab'] b {
          font-size: var(--step--1);
        }
      }
    `,
	];

	@state() private tab: TabId = tabFromHash();
	@state() private phase: Phase = 'pre';
	private override?: string;
	private now!: Date;
	private offHash?: () => void;
	private clock = 0;

	override connectedCallback(): void {
		super.connectedCallback();
		this.override = new URLSearchParams(location.search).get('now') ?? undefined;
		this.recompute();
		this.offHash = onHashChange((t) => {
			this.tab = t;
		});
		if (!this.override) {
			this.clock = window.setInterval(() => this.recompute(), 60_000);
		}
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this.offHash?.();
		clearInterval(this.clock);
	}

	private recompute(): void {
		this.now = resolveNow(this.override);
		this.phase = currentPhase(this.now, SEGMENTS);
		const accent = CITY_THEME[themeCity(this.phase)].accent;
		document.documentElement.style.setProperty('--city-accent', accent);
		this.requestUpdate();
	}

	private onTabKey(e: KeyboardEvent): void {
		const i = ALL_TABS.indexOf(this.tab);
		let next = i;
		if (e.key === 'ArrowRight') next = (i + 1) % ALL_TABS.length;
		else if (e.key === 'ArrowLeft') next = (i - 1 + ALL_TABS.length) % ALL_TABS.length;
		else if (e.key === 'Home') next = 0;
		else if (e.key === 'End') next = ALL_TABS.length - 1;
		else return;
		e.preventDefault();
		location.hash = `#/${ALL_TABS[next]}`;
		requestAnimationFrame(() => {
			const el = this.renderRoot.querySelector<HTMLAnchorElement>(`#tab-${ALL_TABS[next]}`);
			el?.focus();
		});
	}

	private panel() {
		const city = themeCity(this.phase);
		switch (this.tab) {
			case 'itinerary':
				return html`<sk-itinerary></sk-itinerary>`;
			case 'calendar':
				return html`<sk-calendar .now=${this.override ? this.now : undefined}></sk-calendar>`;
			case 'weather':
				return html`<sk-weather city=${city}></sk-weather>`;
			case 'cuisine':
				return html`<sk-cuisine></sk-cuisine>`;
			case 'inspo':
				return html`<sk-inspiration city=${city}></sk-inspiration>`;
			case 'apps':
				return html`<sk-apps></sk-apps>`;
			case 'money':
				return html`<sk-convert></sk-convert>`;
			case 'documents':
				return html`<sk-documents></sk-documents>`;
			case 'tips':
				return html`<sk-tips city=${city}></sk-tips>`;
			case 'clocks':
				return html`<sk-clocks></sk-clocks>`;
			default:
				return html`<sk-home></sk-home>`;
		}
	}

	override render() {
		const themed = themeCity(this.phase);
		return html`
      <sk-canvas-bg city=${themed}></sk-canvas-bg>

      <header class="top">
        <section class="titlebar">
          <hgroup>
            <h1>SK26 · South Korea</h1>
            <p>TNT trip · 18 Jul – 2 Aug 2026</p>
          </hgroup>
          <sk-city-badge phase=${this.phase}></sk-city-badge>
        </section>
        <sk-now-banner .now=${this.override ? this.now : undefined}></sk-now-banner>
      </header>

      <nav role="tablist" aria-label="Sections" @keydown=${this.onTabKey}>
        ${TABS.map(
			(t) => html`<a
            id=${`tab-${t.id}`}
            role="tab"
            href=${`#/${t.id}`}
            aria-selected=${this.tab === t.id ? 'true' : 'false'}
            aria-controls=${`panel-${t.id}`}
            tabindex=${this.tab === t.id ? '0' : '-1'}
          >
            <small lang="ko">${t.ko}</small>
            <b>${t.en}</b>
          </a>`,
		)}
      </nav>

      <main>
        <section
          role="tabpanel"
          id=${`panel-${this.tab}`}
          aria-labelledby=${`tab-${this.tab}`}
          tabindex="0"
        >
          ${this.panel()}
        </section>
      </main>

      <footer>
        <p>
          Made for the SK26 trip
          ${this.override ? html`<mark>preview @ ${this.override}</mark>` : nothing}
        </p>
      </footer>
    `;
	}
}
