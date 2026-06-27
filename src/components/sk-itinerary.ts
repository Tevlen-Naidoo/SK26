import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared.js';
import { EVENTS } from '../data/itinerary.js';
import { SEGMENTS } from '../data/cities.js';
import type { City, TripEvent } from '../types.js';
import './sk-day-card.js';

interface DayGroup {
  date: string;
  city: City;
  events: TripEvent[];
}

@customElement('sk-itinerary')
export class SkItinerary extends LitElement {
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
      section.city {
        margin-bottom: var(--space-4);
      }
      h2.city-head {
        font-size: var(--step-2);
        color: var(--city-accent);
        padding-bottom: var(--space-1);
        border-bottom: 2px solid color-mix(in srgb, var(--city-accent) 40%, transparent);
        margin-bottom: var(--space-3);
        display: flex;
        gap: 0.5em;
        align-items: baseline;
      }
      dl.hotel {
        margin: 0 0 var(--space-3);
        font-size: var(--step--1);
        color: var(--ink-soft);
      }
      dl.hotel dt {
        font-weight: 600;
        color: var(--ink);
      }
    `,
  ];

  private groupsByCity(): { city: City; days: DayGroup[] }[] {
    const byDate = new Map<string, TripEvent[]>();
    for (const e of EVENTS) {
      const arr = byDate.get(e.date) ?? [];
      arr.push(e);
      byDate.set(e.date, arr);
    }
    const days: DayGroup[] = [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, events]) => ({
        date,
        city: events[0].city,
        events: events.sort((a, b) => (a.start ?? '').localeCompare(b.start ?? '')),
      }));

    const out: { city: City; days: DayGroup[] }[] = [];
    for (const d of days) {
      const last = out[out.length - 1];
      if (last && last.city === d.city) last.days.push(d);
      else out.push({ city: d.city, days: [d] });
    }
    return out;
  }

  override render() {
    const groups = this.groupsByCity();
    return html`
      <header class="intro">
        <p class="ko">일정 · Itinerary</p>
        <h1>Seoul → Jeju → Busan</h1>
        <p class="lead">
          18 July – 2 August 2026. Times are local (Asia/Seoul). Costs are per person
          (₩ and R). Tap a map chip for directions.
        </p>
      </header>
      ${groups.map((grp) => {
        const seg = SEGMENTS.find((s) => s.city === grp.city);
        return html`
          <section class="city">
            <h2 class="city-head">
              <data lang="ko">${seg?.nameKo ?? ''}</data>
              ${seg?.nameEn ?? grp.city}
            </h2>
            ${seg?.hotel
              ? html`<dl class="hotel">
                  <dt>${seg.hotel.name}</dt>
                  <dd>${seg.hotel.address}</dd>
                </dl>`
              : ''}
            ${grp.days.map(
              (d) => html`<sk-day-card .date=${d.date} .events=${d.events}></sk-day-card>`,
            )}
          </section>
        `;
      })}
    `;
  }
}
