import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared.js';
import { DOCUMENTS } from '../data/documents.generated.js';
import { fuzzyFilter } from '../lib/fuzzy.js';
import type { DocItem } from '../types.js';

const KIND_ICON: Record<DocItem['kind'], string> = {
	pdf: '📄',
	image: '🖼️',
	other: '📎',
};

function fmtSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

@customElement('sk-documents')
export class SkDocuments extends LitElement {
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
      .search {
        margin: var(--space-4) 0;
        display: flex;
        align-items: center;
        gap: var(--space-2);
        border: 1px solid var(--line);
        border-radius: 999px;
        background: var(--paper-raised);
        padding: 0.5em 1em;
        box-shadow: var(--shadow);
      }
      .search input {
        font: inherit;
        border: 0;
        background: transparent;
        color: var(--ink);
        width: 100%;
      }
      .search input:focus {
        outline: none;
      }
      ul.docs {
        display: grid;
        gap: var(--space-2);
      }
      a.row {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3);
        background: var(--paper-raised);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        text-decoration: none;
        color: var(--ink);
      }
      a.row:hover {
        border-color: var(--city-accent);
      }
      a.row .kind {
        font-size: var(--step-2);
        line-height: 1;
      }
      a.row .info {
        flex: 1;
        min-width: 0;
      }
      a.row .name {
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      a.row .sub {
        color: var(--ink-soft);
        font-size: var(--step--1);
      }
      a.row .dl {
        color: var(--ink-soft);
        font-size: var(--step-1);
      }
      a.row:hover .dl {
        color: var(--city-accent);
      }
      p.empty {
        color: var(--ink-soft);
        background: var(--paper-raised);
        border: 1px dashed var(--line);
        border-radius: var(--radius);
        padding: var(--space-4);
      }
      p.empty code {
        background: color-mix(in srgb, var(--ink) 8%, transparent);
        padding: 0.1em 0.4em;
        border-radius: 4px;
      }
    `,
	];

	@state() private query = '';

	private onInput(e: Event): void {
		this.query = (e.target as HTMLInputElement).value;
	}

	private docRow(d: DocItem) {
		return html`<li>
      <a class="row" href=${d.url} download=${d.filename}>
        <i class="kind" aria-hidden="true">${KIND_ICON[d.kind]}</i>
        <b class="info">
          <b class="name">${d.name}</b>
          <small class="sub">
            ${d.ext.replace('.', '').toUpperCase()} · ${fmtSize(d.size)}
          </small>
        </b>
        <i class="dl" aria-hidden="true" title="Download">⬇︎</i>
      </a>
    </li>`;
	}

	private renderList() {
		const results = this.query.trim()
			? fuzzyFilter(this.query, DOCUMENTS, (d) => [d.name, d.filename])
			: [...DOCUMENTS].sort((a, b) => a.name.localeCompare(b.name));
		if (!results.length)
			return html`<p class="empty">No documents match “${this.query}”.</p>`;
		return html`<ul class="docs">${results.map((d) => this.docRow(d))}</ul>`;
	}

	override render() {
		const hasDocs = DOCUMENTS.length > 0;
		return html`
      <header class="intro">
        <p class="ko">서류 · Documents</p>
        <h1>Tickets & confirmations</h1>
        <p class="lead">
          Flight tickets, hotel bookings, insurance and more. Tap any document to
          download it to your device — handy offline at the airport.
        </p>
      </header>

      ${hasDocs
				? html`
            <label class="search">
              <i aria-hidden="true">🔎</i>
              <input
                type="search"
                placeholder="Search documents…"
                aria-label="Search documents"
                .value=${this.query}
                @input=${this.onInput}
              />
            </label>
            ${this.renderList()}
          `
				: html`<p class="empty">
            No documents yet. Drop PDFs or images into
            <code>public/documents/</code> and run
            <code>npm run documents</code> — they'll appear here automatically.
          </p>`}
    `;
	}
}
