import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared.js';

@customElement('sk-map-links')
export class SkMapLinks extends LitElement {
  static override styles = [
    sharedStyles,
    css`
      nav {
        margin-top: var(--space-2);
      }
      ul {
        display: flex;
        gap: var(--space-2);
        flex-wrap: wrap;
      }
      a {
        display: inline-flex;
        align-items: center;
        gap: 0.35em;
        padding: 0.2em 0.6em;
        border: 1px solid var(--line);
        border-radius: 999px;
        background: var(--paper);
        font-size: var(--step--1);
        text-decoration: none;
        color: var(--ink-soft);
      }
      a:hover {
        border-color: var(--city-accent);
        color: var(--city-accent);
      }
    `,
  ];

  @property() google?: string;
  @property() kakao?: string;

  override render() {
    if (!this.google && !this.kakao) return nothing;
    return html`
      <nav aria-label="Map links">
        <ul>
          ${this.google
            ? html`<li>
                <a href=${this.google} target="_blank" rel="noopener noreferrer">📍 Google</a>
              </li>`
            : nothing}
          ${this.kakao
            ? html`<li>
                <a href=${this.kakao} target="_blank" rel="noopener noreferrer">🗺️ Kakao</a>
              </li>`
            : nothing}
        </ul>
      </nav>
    `;
  }
}
