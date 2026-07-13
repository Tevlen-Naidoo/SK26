import { LitElement, html, css, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared.js';
import { APPS, androidUrl, iosUrl, type AppInfo } from '../data/apps.js';
import { appleMark, ICON_URL } from '../lib/brand-icons.js';

@customElement('sk-apps')
export class SkApps extends LitElement {
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
      ul.grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
        gap: var(--space-3);
      }
      article {
        height: 100%;
        background: var(--paper-raised);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        padding: var(--space-3);
        display: grid;
        grid-template-rows: auto 1fr auto;
        gap: var(--space-2);
      }
      .head {
        display: flex;
        align-items: center;
        gap: var(--space-2);
      }
      img.tile {
        width: 2.9rem;
        height: 2.9rem;
        border-radius: 22%;
        object-fit: cover;
        border: 1px solid var(--line);
        flex: 0 0 auto;
      }
      hgroup h2 {
        font-size: var(--step-1);
      }
      hgroup small {
        font-family: var(--font-display);
      }
      p.blurb {
        color: var(--ink-soft);
        font-size: var(--step--1);
      }
      .stores {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
      }
      .stores a {
        display: inline-flex;
        align-items: center;
        gap: 0.4em;
        padding: 0.35em 0.7em;
        border: 1px solid var(--line);
        border-radius: 999px;
        background: var(--paper);
        font-size: var(--step--1);
        text-decoration: none;
        color: var(--ink-soft);
      }
      .stores a i {
        font-size: 1.15em;
        line-height: 0;
      }
      .stores a img {
        width: 1.15em;
        height: 1.15em;
        object-fit: contain;
      }
      .stores a:hover {
        border-color: var(--city-accent);
        color: var(--city-accent);
      }
      .stores a.open {
        background: var(--city-accent);
        color: #fff;
        border-color: var(--city-accent);
      }
    `,
	];

	private card(a: AppInfo) {
		const android = androidUrl(a);
		const ios = iosUrl(a);
		return html`
      <li>
        <article>
          <p class="head">
            <img class="tile" src=${a.icon} alt="" width="48" height="48" loading="lazy" />
            <hgroup>
              <h2>${a.name}</h2>
              ${a.ko ? html`<small lang="ko">${a.ko}</small>` : nothing}
            </hgroup>
          </p>
          <p class="blurb">${a.blurb}</p>
          <nav class="stores" aria-label=${`Get ${a.name}`}>
            ${a.deepLink
				? html`<a class="open" href=${a.deepLink}>▶ Open</a>`
				: nothing}
            ${android
				? html`<a href=${android} target="_blank" rel="noopener noreferrer">
                    <img src=${ICON_URL.googlePlay} alt="" /> Play</a
                  >`
				: nothing}
            ${ios
				? html`<a href=${ios} target="_blank" rel="noopener noreferrer">
                    <i aria-hidden="true">${appleMark}</i> App Store</a
                  >`
				: nothing}
          </nav>
        </article>
      </li>
    `;
	}

	override render() {
		return html`
      <header class="intro">
        <p class="ko">앱 · Apps</p>
        <h1>Install before you fly</h1>
        <p class="lead">
          The handful of Korean apps that make the trip smoother. Tap
          <strong>▶ Open</strong> to jump straight in if it's already installed,
          or grab it from your store.
        </p>
      </header>
      <ul class="grid">
        ${APPS.map((a) => this.card(a))}
      </ul>
    `;
	}
}
