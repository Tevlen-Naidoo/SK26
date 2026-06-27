import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared.js';
import { TIPS } from '../data/tips.js';
import { CITY_NAME_EN, CITY_NAME_KO } from '../data/cities.js';
import type { City, Tip } from '../types.js';

const CAT_ICON: Record<Tip['category'], string> = {
  money: '💵',
  transport: '🚇',
  etiquette: '🙇',
  safety: '🚨',
  food: '🍴',
  connectivity: '📶',
  weather: '🌦️',
  booking: '🎟️',
};

@customElement('sk-tips')
export class SkTips extends LitElement {
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
      section {
        margin-bottom: var(--space-5);
      }
      h2 {
        font-size: var(--step-2);
        color: var(--city-accent);
        padding-bottom: var(--space-1);
        border-bottom: 2px solid color-mix(in srgb, var(--city-accent) 40%, transparent);
        margin-bottom: var(--space-3);
        display: flex;
        gap: 0.4em;
        align-items: baseline;
      }
      ul {
        display: grid;
        gap: var(--space-2);
      }
      details {
        background: var(--paper-raised);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        padding: var(--space-2) var(--space-3);
        box-shadow: var(--shadow);
      }
      summary {
        cursor: pointer;
        font-weight: 600;
        display: flex;
        gap: 0.5em;
        align-items: center;
        list-style: none;
      }
      summary::-webkit-details-marker {
        display: none;
      }
      summary::after {
        content: '+';
        margin-left: auto;
        color: var(--ink-soft);
        font-size: var(--step-1);
      }
      details[open] summary::after {
        content: '–';
      }
      details p {
        margin-top: var(--space-2);
        color: var(--ink-soft);
      }
    `,
  ];

  @property() city: City = 'seoul';

  private renderList(tips: Tip[]) {
    return html`<ul>
      ${tips.map(
        (t) => html`<li>
          <details>
            <summary>
              <i aria-hidden="true">${CAT_ICON[t.category]}</i> ${t.title}
            </summary>
            <p>${t.body}</p>
          </details>
        </li>`,
      )}
    </ul>`;
  }

  override render() {
    const global = TIPS.filter((t) => t.scope === 'global');
    const local = TIPS.filter((t) => t.scope === this.city);
    return html`
      <header class="intro">
        <p class="ko">꿀팁 · Good to know</p>
        <h1>Things to look out for</h1>
      </header>

      <section aria-label="Tips for ${CITY_NAME_EN[this.city]}">
        <h2>
          <data lang="ko">${CITY_NAME_KO[this.city]}</data> In ${CITY_NAME_EN[this.city]}
        </h2>
        ${this.renderList(local)}
      </section>

      <section aria-label="Tips for everywhere">
        <h2>Everywhere</h2>
        ${this.renderList(global)}
      </section>
    `;
  }
}
