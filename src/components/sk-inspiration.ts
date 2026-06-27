import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared.js';
import { INSPIRATION } from '../data/inspiration.js';
import { CITY_NAME_EN, CITY_NAME_KO } from '../data/cities.js';
import type { City } from '../types.js';

const PLACEHOLDER = '/inspo/_placeholder.svg';
const CITIES: City[] = ['seoul', 'jeju', 'busan'];

@customElement('sk-inspiration')
export class SkInspiration extends LitElement {
  static override styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      header.intro {
        margin-bottom: var(--space-3);
      }
      h1 {
        font-size: var(--step-3);
      }
      form {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        margin: var(--space-3) 0 var(--space-4);
      }
      label {
        font-size: var(--step--1);
        color: var(--ink-soft);
      }
      select {
        font: inherit;
        padding: 0.4em 0.7em;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: var(--paper-raised);
        color: var(--ink);
      }
      ul {
        display: grid;
        gap: var(--space-4);
        grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
      }
      figure {
        margin: 0;
        background: var(--paper-raised);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        overflow: hidden;
        box-shadow: var(--shadow);
        display: flex;
        flex-direction: column;
      }
      img {
        width: 100%;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        background: var(--line);
        display: block;
      }
      figcaption {
        padding: var(--space-3);
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
      }
      h2 {
        font-size: var(--step-1);
      }
      .spot {
        color: var(--city-accent);
        font-weight: 600;
        font-size: var(--step--1);
      }
      .tip {
        color: var(--ink-soft);
        font-size: var(--step--1);
      }
      .when {
        margin-top: var(--space-1);
        font-size: var(--step--1);
      }
      .when b {
        color: var(--taeguk-red);
      }
    `,
  ];

  /** Current location (from <sk-app>); the gallery defaults to this. */
  @property() city: City = 'seoul';
  @state() private chosen?: City;

  private get active(): City {
    return this.chosen ?? this.city;
  }

  private onSelect(e: Event) {
    this.chosen = (e.target as HTMLSelectElement).value as City;
  }

  private onImgError(e: Event) {
    const img = e.target as HTMLImageElement;
    if (!img.src.endsWith(PLACEHOLDER)) img.src = PLACEHOLDER;
  }

  override render() {
    const active = this.active;
    const items = INSPIRATION.filter((i) => i.city === active);
    return html`
      <header class="intro">
        <p class="ko">사진 · Photo inspiration</p>
        <h1>Shots to chase in ${CITY_NAME_EN[active]}</h1>
      </header>

      <form @submit=${(e: Event) => e.preventDefault()}>
        <label for="city-pick">Show ideas for</label>
        <select id="city-pick" @change=${this.onSelect} .value=${active}>
          ${CITIES.map(
            (c) =>
              html`<option value=${c} ?selected=${c === active}>
                ${CITY_NAME_KO[c]} ${CITY_NAME_EN[c]}
              </option>`,
          )}
        </select>
      </form>

      <ul>
        ${items.map(
          (i) => html`
            <li>
              <figure>
                <img
                  src=${i.image ?? PLACEHOLDER}
                  alt=${`${i.title} — ${i.spot}`}
                  loading="lazy"
                  @error=${this.onImgError}
                />
                <figcaption>
                  <h2>${i.title}</h2>
                  <p class="spot">${i.spot}</p>
                  <p class="tip">${i.tip}</p>
                  ${i.bestTime
                    ? html`<p class="when"><b>Best:</b> ${i.bestTime}</p>`
                    : ''}
                </figcaption>
              </figure>
            </li>
          `,
        )}
      </ul>
    `;
  }
}
