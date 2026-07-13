import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared.js';
import type { EventCategory, TripEvent } from '../types.js';
import './sk-map-links.js';

const ICON: Record<EventCategory, string> = {
	travel: '✈️',
	food: '🍜',
	sightseeing: '⛩️',
	museum: '🏛️',
	nature: '🌿',
	show: '🎆',
	shopping: '🛍️',
	relax: '🌙',
	sport: '⚾',
};

@customElement('sk-event-item')
export class SkEventItem extends LitElement {
	static override styles = [
		sharedStyles,
		css`
      article.event {
        display: grid;
        grid-template-columns: 4.5rem 1fr;
        gap: var(--space-3);
        padding: var(--space-3);
        background: color-mix(in srgb, var(--paper-raised) 64%, transparent);
        -webkit-backdrop-filter: blur(12px) saturate(140%);
        backdrop-filter: blur(12px) saturate(140%);
        border: 1px solid color-mix(in srgb, var(--ink) 8%, transparent);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
      }
      article.event[data-optional] {
        border-style: dashed;
        opacity: 0.9;
      }
      time {
        font-variant-numeric: tabular-nums;
        color: var(--ink-soft);
        font-size: var(--step--1);
        line-height: 1.3;
      }
      h3 {
        font-size: var(--step-1);
        display: flex;
        gap: 0.4em;
        align-items: baseline;
      }
      .body p {
        color: var(--ink-soft);
        margin-top: var(--space-1);
      }
      .meta {
        margin-top: var(--space-2);
        display: flex;
        flex-wrap: wrap;
        gap: 0.5em 1em;
        align-items: baseline;
      }
      data.price {
        color: var(--taeguk-red);
        font-weight: 600;
      }
      data.free {
        color: var(--ink-soft);
        font-weight: 600;
      }
      mark {
        background: color-mix(in srgb, var(--city-accent) 16%, transparent);
        color: inherit;
        padding: 0 0.35em;
        border-radius: 4px;
        font-size: var(--step--1);
      }
    `,
	];

	@property({ attribute: false }) event!: TripEvent;

	override render() {
		const e = this.event;
		const cost = e.cost;
		return html`
      <article class="event" ?data-optional=${e.optional}>
        <time datetime=${`${e.date}T${e.start ?? '00:00'}`}>
          ${e.start ?? '—'}${e.end ? html`<br />${e.end}` : nothing}
        </time>
        <section class="body">
          <h3>
            <i aria-hidden="true">${ICON[e.category]}</i>
            <em
              >${e.title}${e.optional
				? html` <small>(optional)</small>`
				: nothing}</em
            >
          </h3>
          ${e.summary ? html`<p>${e.summary}</p>` : nothing}
          <p class="meta">
            ${cost
				? cost.krw === 0
					? html`<data class="free" value="0">Free</data>`
					: html`<data class="price" value=${cost.krw}
                      >₩${cost.krw.toLocaleString()}</data
                    >
                    <small
                      >·
                      <data value=${cost.zar}>R${cost.zar.toLocaleString()}</data> pp</small
                    >`
				: nothing}
            ${cost?.note ? html`<mark>${cost.note}</mark>` : nothing}
          </p>
          ${e.location?.google || e.location?.kakao
				? html`<sk-map-links
                .google=${e.location.google}
                .kakao=${e.location.kakao}
              ></sk-map-links>`
				: nothing}
        </section>
      </article>
    `;
	}
}
