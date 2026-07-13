import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared.js';
import { SEGMENTS } from '../data/cities.js';
import { formatDateLong } from '../lib/dates.js';

const QUICK: { href: string; emoji: string; label: string }[] = [
	{ href: '#/itinerary', emoji: '📋', label: 'Itinerary' },
	{ href: '#/calendar', emoji: '📅', label: 'Calendar' },
	{ href: '#/cuisine', emoji: '🍜', label: 'Cuisine' },
	{ href: '#/inspo', emoji: '📷', label: 'Photos' },
	{ href: '#/tips', emoji: '💡', label: 'Tips' },
	{ href: '#/clocks', emoji: '🕑', label: 'Clocks' },
];

@customElement('sk-home')
export class SkHome extends LitElement {
	static override styles = [
		sharedStyles,
		css`
      :host {
        display: block;
      }
      section.hero {
        text-align: center;
        padding: var(--space-5) 0 var(--space-4);
      }
      .ko {
        display: block;
      }
      h1 {
        font-size: clamp(2.4rem, 8vw, 4rem);
        line-height: 1.05;
        margin: var(--space-2) 0;
      }
      p.sub {
        font-family: var(--font-display);
        font-size: var(--step-2);
        color: var(--city-accent);
      }
      p.intro {
        max-width: 42ch;
        margin: var(--space-4) auto 0;
        color: var(--ink-soft);
      }
      nav.quick {
        margin-top: var(--space-5);
      }
      nav.quick ul {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: var(--space-2);
      }
      nav.quick a {
        display: inline-flex;
        align-items: center;
        gap: 0.4em;
        padding: 0.5em 1em;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: var(--paper-raised);
        text-decoration: none;
        color: var(--ink);
        box-shadow: var(--shadow);
      }
      nav.quick a:hover {
        border-color: var(--city-accent);
        color: var(--city-accent);
      }
      section.route {
        max-width: 32rem;
        margin: var(--space-5) auto 0;
      }
      h2 {
        font-size: var(--step-1);
        text-align: center;
        color: var(--ink-soft);
        font-family: var(--font-body);
        font-weight: 600;
        margin-bottom: var(--space-3);
      }
      ol {
        display: grid;
        gap: var(--space-2);
      }
      ol li {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: var(--space-3);
        align-items: baseline;
        padding: var(--space-3);
        background: var(--paper-raised);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
      }
      ol li b {
        font-family: var(--font-display);
        font-size: var(--step-1);
      }
      ol li [lang='ko'] {
        color: var(--gold);
        margin-left: 0.4em;
      }
      ol li time {
        color: var(--ink-soft);
        font-size: var(--step--1);
        text-align: right;
      }
    `,
	];

	override render() {
		return html`
      <section class="hero">
        <small class="ko" lang="ko">대한민국 · Welcome</small>
        <h1>South Korea 2026</h1>
        <p class="sub">For da homies</p>
        <p class="intro">
          Our pocket trip companion.
	<br>
	Seoul → Jeju → Busan.
        </p>

        <nav class="quick" aria-label="Quick links">
          <ul>
            ${QUICK.map(
			(q) => html`<li>
                <a href=${q.href}><i aria-hidden="true">${q.emoji}</i> ${q.label}</a>
              </li>`,
		)}
          </ul>
        </nav>
      </section>

      <section class="route" aria-label="Trip route">
        <h2>The route · 18 Jul – 2 Aug</h2>
        <ol>
          ${SEGMENTS.map(
			(s) => html`<li>
              <b>${s.nameEn}<small lang="ko">${s.nameKo}</small></b>
              <small>${s.hotel?.name ?? ''}</small>
              <time datetime=${s.arrive.slice(0, 10)}
                >${formatDateLong(s.arrive.slice(0, 10))}</time
              >
            </li>`,
		)}
        </ol>
      </section>
    `;
	}
}
