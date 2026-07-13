import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared.js';
import {
	enable,
	disable,
	setLead,
	loadPrefs,
	permission,
	type ReminderPrefs,
} from '../lib/reminders.js';

const LEADS = [10, 15, 30, 60, 120];

@customElement('sk-reminders')
export class SkReminders extends LitElement {
	static override styles = [
		sharedStyles,
		css`
      article {
        background: var(--paper-raised);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        padding: var(--space-3);
        box-shadow: var(--shadow);
        display: grid;
        gap: var(--space-2);
      }
      h3 {
        font-size: var(--step-1);
        display: flex;
        gap: 0.4em;
        align-items: baseline;
      }
      .row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--space-2) var(--space-3);
      }
      button {
        padding: 0.5em 1em;
        border: 0;
        border-radius: 999px;
        background: var(--city-accent);
        color: #fff;
        font-weight: 600;
      }
      button.off {
        background: transparent;
        color: var(--city-accent);
        border: 1px solid var(--city-accent);
      }
      button:hover {
        filter: brightness(1.08);
      }
      label {
        display: inline-flex;
        gap: 0.4em;
        align-items: center;
        color: var(--ink-soft);
        font-size: var(--step--1);
      }
      select {
        font: inherit;
        padding: 0.3em 0.5em;
        border-radius: 8px;
        border: 1px solid var(--line);
        background: var(--paper);
        color: var(--ink);
      }
      p.note {
        color: var(--ink-soft);
        font-size: var(--step--1);
      }
      mark {
        background: color-mix(in srgb, var(--city-accent) 16%, transparent);
        color: inherit;
        padding: 0 0.35em;
        border-radius: 4px;
      }
    `,
	];

	@state() private prefs: ReminderPrefs = loadPrefs();
	@state() private perm = permission();

	private async onEnable(): Promise<void> {
		this.prefs = await enable(this.prefs.leadMin);
		this.perm = permission();
	}

	private onDisable(): void {
		this.prefs = disable();
	}

	private onLead(e: Event): void {
		const min = Number((e.target as HTMLSelectElement).value);
		this.prefs = setLead(min);
	}

	override render() {
		const unsupported = this.perm === 'unsupported';
		const denied = this.perm === 'denied';
		const on = this.prefs.enabled && this.perm === 'granted';
		return html`
      <article>
        <h3><i aria-hidden="true">🔔</i> Event reminders</h3>
        ${on
				? html`<p class="row">
                <mark>On</mark> You'll get a heads-up
                <label
                  >
                  <select @change=${this.onLead} .value=${String(this.prefs.leadMin)}>
                    ${LEADS.map(
					(m) => html`<option value=${m} ?selected=${m === this.prefs.leadMin}>
                        ${m < 60 ? `${m} min` : `${m / 60} hr`}
                      </option>`,
				)}
                  </select>
                  before each event.</label
                >
                <button class="off" type="button" @click=${this.onDisable}>
                  Turn off
                </button>
              </p>`
				: html`<p class="row">
                <button
                  type="button"
                  ?disabled=${unsupported || denied}
                  @click=${this.onEnable}
                >
                  Enable reminders
                </button>
                ${denied
						? html`<small
                        >Notifications are blocked — allow them for this site in your
                        browser settings.</small
                      >`
						: unsupported
							? html`<small>This browser doesn't support notifications.</small>`
							: nothing}
              </p>`}
        <p class="note">
          These fire while the site (or the installed app) is open — a static site
          can't push in the background. For alarms that always work, use
          <strong>Add all to my calendar</strong> on the Calendar tab.
        </p>
      </article>
    `;
	}
}
