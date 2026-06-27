import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared.js';
import { formatDateLong } from '../lib/dates.js';
import { CITY_NAME_EN } from '../data/cities.js';
import type { TripEvent } from '../types.js';
import './sk-event-item.js';

@customElement('sk-day-card')
export class SkDayCard extends LitElement {
  static override styles = [
    sharedStyles,
    css`
      article {
        margin-bottom: var(--space-5);
      }
      header {
        display: flex;
        align-items: baseline;
        gap: var(--space-3);
        padding: var(--space-2) 0;
        background: none;
      }
      h2 {
        font-size: var(--step-2);
      }
      header small {
        color: var(--city-accent);
        font-weight: 600;
      }
      ul {
        display: grid;
        gap: var(--space-3);
      }
    `,
  ];

  @property() date = '';
  @property({ attribute: false }) events: TripEvent[] = [];

  override render() {
    const city = this.events[0]?.city;
    return html`
      <article>
        <header>
          <h2><time datetime=${this.date}>${formatDateLong(this.date)}</time></h2>
          ${city ? html`<small>${CITY_NAME_EN[city]}</small>` : ''}
        </header>
        <ul>
          ${this.events.map(
            (e) => html`<li><sk-event-item .event=${e}></sk-event-item></li>`,
          )}
        </ul>
      </article>
    `;
  }
}
