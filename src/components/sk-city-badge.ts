import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared.js';
import { CITY_NAME_EN, CITY_NAME_KO } from '../data/cities.js';
import type { Phase } from '../types.js';

@customElement('sk-city-badge')
export class SkCityBadge extends LitElement {
	static override styles = [
		sharedStyles,
		css`
      p {
        display: inline-flex;
        align-items: center;
        gap: 0.5em;
        padding: 0.3em 0.8em;
        border-radius: 999px;
        background: color-mix(in srgb, var(--city-accent) 14%, var(--paper-raised));
        border: 1px solid color-mix(in srgb, var(--city-accent) 35%, transparent);
        font-size: var(--step--1);
        white-space: nowrap;
      }
      b {
        color: var(--city-accent);
      }
      data {
        font-family: var(--font-display);
        font-size: var(--step-0);
      }
    `,
	];

	@property() phase: Phase = 'pre';

	override render() {
		const label =
			this.phase === 'pre'
				? html`<b>Not started</b> · 곧 출발`
				: this.phase === 'post'
					? html`<b>Trip complete</b> · 여행 끝`
					: html`<data>${CITY_NAME_KO[this.phase]}</data> <b>${CITY_NAME_EN[this.phase]}</b>`;
		return html`<p title="Where we are now">📍 ${label}</p>`;
	}
}
