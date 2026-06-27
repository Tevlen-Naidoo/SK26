import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared.js';
import { CUISINE } from '../data/cuisine.js';
import type { CuisineItem } from '../types.js';

const STORE_KEY = 'sk26-cuisine-tried';

@customElement('sk-cuisine')
export class SkCuisine extends LitElement {
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
      section {
        margin-bottom: var(--space-5);
      }
      h2 {
        font-size: var(--step-2);
        margin-bottom: var(--space-3);
        display: flex;
        gap: 0.4em;
        align-items: baseline;
      }
      .count {
        font-size: var(--step--1);
        color: var(--ink-soft);
        font-family: var(--font-body);
      }
      ul {
        display: grid;
        gap: var(--space-3);
        grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
      }
      label.card {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: var(--space-3);
        align-items: start;
        padding: var(--space-3);
        background: var(--paper-raised);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        cursor: pointer;
        transition: border-color 0.15s ease;
      }
      label.card:hover {
        border-color: color-mix(in srgb, var(--city-accent) 50%, var(--line));
      }
      label.card.experience {
        background: color-mix(in srgb, var(--city-accent) 8%, var(--paper-raised));
        grid-column: 1 / -1;
      }
      input[type='checkbox'] {
        width: 1.3rem;
        height: 1.3rem;
        margin-top: 0.2rem;
        accent-color: var(--city-accent);
        cursor: pointer;
      }
      h3 {
        font-size: var(--step-1);
        display: flex;
        gap: 0.4em;
        align-items: baseline;
        flex-wrap: wrap;
      }
      h3 [lang='ko'] {
        color: var(--gold);
        font-size: var(--step-0);
      }
      p {
        color: var(--ink-soft);
        font-size: var(--step--1);
        margin-top: var(--space-1);
      }
      label.card[data-tried='true'] h3 i,
      label.card[data-tried='true'] h3 em {
        text-decoration: line-through;
        text-decoration-color: var(--city-accent);
        opacity: 0.7;
      }
    `,
  ];

  @state() private tried = new Set<string>();

  override connectedCallback(): void {
    super.connectedCallback();
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) this.tried = new Set(JSON.parse(raw) as string[]);
    } catch {
      /* ignore storage errors */
    }
  }

  private toggle(id: string): void {
    const next = new Set(this.tried);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.tried = next;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
  }

  private card(item: CuisineItem) {
    const done = this.tried.has(item.id);
    return html`<li>
      <label class=${item.kind === 'experience' ? 'card experience' : 'card'} data-tried=${String(done)}>
        <input
          type="checkbox"
          .checked=${done}
          @change=${() => this.toggle(item.id)}
          aria-label=${`Mark ${item.name} as tried`}
        />
        <article>
          <h3>
            <i aria-hidden="true">${item.emoji ?? '🍽️'}</i>
            <em>${item.name}</em>
            ${item.ko ? html`<small lang="ko">${item.ko}</small>` : ''}
          </h3>
          ${item.note ? html`<p>${item.note}</p>` : ''}
        </article>
      </label>
    </li>`;
  }

  override render() {
    const experiences = CUISINE.filter((c) => c.kind === 'experience');
    const dishes = CUISINE.filter((c) => c.kind === 'dish');
    const doneCount = dishes.filter((d) => this.tried.has(d.id)).length;

    return html`
      <header class="intro">
        <p class="ko">음식 · Cuisine to try</p>
        <h1>Eat your way through Korea</h1>
        <p class="lead">A bucket-list of dishes and one big night out. Tick things off as you go — it’s saved on this device.</p>
      </header>

      ${experiences.length
        ? html`<section aria-label="To book">
            <h2>Plan it 🗓️</h2>
            <ul>
              ${experiences.map((e) => this.card(e))}
            </ul>
          </section>`
        : ''}

      <section aria-label="Dishes to try">
        <h2>
          Dishes
          <small class="count">${doneCount}/${dishes.length} tried</small>
        </h2>
        <ul>
          ${dishes.map((d) => this.card(d))}
        </ul>
      </section>
    `;
  }
}
