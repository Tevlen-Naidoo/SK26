import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared.js';
import { getRate, type FxRate } from '../lib/fx.js';

const KRW_CHIPS = [10000, 30000, 50000, 100000];
const ZAR_CHIPS = [100, 250, 500, 1000];

@customElement('sk-convert')
export class SkConvert extends LitElement {
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
      .board {
        background: var(--paper-raised);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        padding: var(--space-4);
        display: grid;
        gap: var(--space-3);
        max-width: 32rem;
      }
      label {
        display: grid;
        gap: var(--space-1);
      }
      label > small {
        color: var(--ink-soft);
      }
      .field {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--paper);
        padding: 0.4em 0.8em;
      }
      .field .cur {
        font-family: var(--font-display);
        font-size: var(--step-2);
        color: var(--city-accent);
      }
      input {
        font: inherit;
        font-size: var(--step-2);
        font-variant-numeric: tabular-nums;
        border: 0;
        background: transparent;
        color: var(--ink);
        width: 100%;
        text-align: right;
      }
      input:focus {
        outline: none;
      }
      .swap {
        justify-self: center;
        color: var(--ink-soft);
        font-size: var(--step-1);
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
      }
      .chips button {
        border: 1px solid var(--line);
        background: var(--paper);
        border-radius: 999px;
        padding: 0.25em 0.7em;
        font-size: var(--step--1);
        color: var(--ink-soft);
      }
      .chips button:hover {
        border-color: var(--city-accent);
        color: var(--city-accent);
      }
      p.rate {
        color: var(--ink-soft);
        font-size: var(--step--1);
      }
      p.rate strong {
        color: var(--ink);
      }
    `,
	];

	@state() private rate?: FxRate;
	@state() private krw = 50000;
	@state() private zar = 0;

	override connectedCallback(): void {
		super.connectedCallback();
		void this.load();
	}

	private async load(): Promise<void> {
		this.rate = await getRate();
		this.fromKrw(this.krw);
	}

	private get perZar(): number {
		return this.rate?.krwPerZar ?? 93;
	}

	private fromKrw(krw: number): void {
		this.krw = krw;
		this.zar = Math.round((krw / this.perZar) * 100) / 100;
	}

	private fromZar(zar: number): void {
		this.zar = zar;
		this.krw = Math.round(zar * this.perZar);
	}

	private onKrwInput(e: Event): void {
		this.fromKrw(Number((e.target as HTMLInputElement).value) || 0);
	}

	private onZarInput(e: Event): void {
		this.fromZar(Number((e.target as HTMLInputElement).value) || 0);
	}

	override render() {
		const r = this.rate;
		return html`
      <header class="intro">
        <p class="ko">환전 · Currency</p>
        <h1>Won ↔ Rand</h1>
        <p class="lead">Type in either box — the other updates live.</p>
      </header>

      <section class="board" aria-label="Currency converter">
        <label>
          <small>South Korean Won</small>
          <i class="field">
            <b class="cur">₩</b>
            <input
              inputmode="decimal"
              aria-label="Korean Won"
              .value=${String(this.krw)}
              @input=${this.onKrwInput}
            />
          </i>
        </label>
        <p class="chips" aria-label="Quick won amounts">
          ${KRW_CHIPS.map(
			(v) => html`<button type="button" @click=${() => this.fromKrw(v)}>
                ₩${v.toLocaleString()}
              </button>`,
		)}
        </p>

        <p class="swap" aria-hidden="true">⇅</p>

        <label>
          <small>South African Rand</small>
          <i class="field">
            <b class="cur">R</b>
            <input
              inputmode="decimal"
              aria-label="South African Rand"
              .value=${String(this.zar)}
              @input=${this.onZarInput}
            />
          </i>
        </label>
        <p class="chips" aria-label="Quick rand amounts">
          ${ZAR_CHIPS.map(
			(v) => html`<button type="button" @click=${() => this.fromZar(v)}>
                R${v.toLocaleString()}
              </button>`,
		)}
        </p>

        <p class="rate">
          ${r
				? html`<strong>R1 ≈ ₩${r.krwPerZar.toFixed(2)}</strong> ·
                  ${r.live && r.date !== 'fallback'
						? html`live rate, ${r.date}`
						: html`offline — using fixed R1 ≈ ₩93`}`
				: html`Loading rate…`}
        </p>
      </section>
    `;
	}
}
