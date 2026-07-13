import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared.js';
import { EVENTS } from '../data/itinerary.js';
import { CITY_NAME_EN } from '../data/cities.js';
import {
	CITY_COORDS,
	describeCode,
	fetchCurrent,
	fetchForecast,
	type CurrentWx,
	type DailyWx,
} from '../lib/weather.js';
import type { City } from '../types.js';

type Status = 'idle' | 'loading' | 'ok' | 'error' | 'denied';

interface TripDay {
	date: string;
	city: City;
}

@customElement('sk-weather')
export class SkWeather extends LitElement {
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
      h2 {
        font-size: var(--step-2);
        color: var(--city-accent);
        margin-bottom: var(--space-3);
      }
      section {
        margin-bottom: var(--space-5);
      }
      button {
        padding: 0.55em 1.1em;
        border: 0;
        border-radius: 999px;
        background: var(--city-accent);
        color: #fff;
        font-weight: 600;
        box-shadow: var(--shadow);
      }
      button:hover {
        filter: brightness(1.08);
      }
      .card {
        background: var(--paper-raised);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        padding: var(--space-3);
      }
      .current-top {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        flex-wrap: wrap;
      }
      .big {
        font-size: var(--step-4);
        line-height: 1;
      }
      .temp {
        font-size: var(--step-4);
        font-variant-numeric: tabular-nums;
        font-family: var(--font-display);
      }
      dl.metrics {
        margin-top: var(--space-3);
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
        gap: var(--space-2);
      }
      dl.metrics dt {
        color: var(--ink-soft);
        font-size: var(--step--1);
      }
      dl.metrics dd {
        font-size: var(--step-1);
        font-variant-numeric: tabular-nums;
      }
      ul.days {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
        gap: var(--space-3);
      }
      li.day {
        background: var(--paper-raised);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        padding: var(--space-3);
        display: grid;
        gap: 0.35em;
        text-align: center;
      }
      li.day.pending {
        opacity: 0.7;
      }
      li.day .date {
        font-size: var(--step--1);
        color: var(--ink-soft);
      }
      li.day .icon {
        font-size: var(--step-3);
      }
      li.day .hilo {
        font-variant-numeric: tabular-nums;
        font-weight: 600;
      }
      li.day .lo {
        color: var(--ink-soft);
      }
      li.day .sub {
        font-size: var(--step--1);
        color: var(--ink-soft);
      }
      li.day .city {
        font-size: var(--step--1);
        color: var(--city-accent);
      }
      p.status {
        color: var(--ink-soft);
      }
    `,
	];

	@property() city: City = 'seoul';

	@state() private curStatus: Status = 'idle';
	@state() private current?: CurrentWx;
	@state() private curPlace = '';
	@state() private fcStatus: Status = 'idle';
	@state() private forecasts = new Map<City, Map<string, DailyWx>>();

	override connectedCallback(): void {
		super.connectedCallback();
		this.loadForecasts();
	}

	private tripDays(): TripDay[] {
		const seen = new Map<string, City>();
		for (const e of EVENTS) if (!seen.has(e.date)) seen.set(e.date, e.city);
		return [...seen.entries()]
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([date, c]) => ({ date, city: c }));
	}

	private async loadForecasts(): Promise<void> {
		this.fcStatus = 'loading';
		try {
			const cities: City[] = ['seoul', 'jeju', 'busan'];
			const results = await Promise.all(cities.map((c) => fetchForecast(CITY_COORDS[c])));
			const map = new Map<City, Map<string, DailyWx>>();
			cities.forEach((c, i) => map.set(c, results[i]));
			this.forecasts = map;
			this.fcStatus = 'ok';
		} catch {
			this.fcStatus = 'error';
		}
	}

	private useLocation(): void {
		if (!('geolocation' in navigator)) {
			this.loadCurrentForCity(this.city, `${CITY_NAME_EN[this.city]} (no geolocation)`);
			return;
		}
		this.curStatus = 'loading';
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				this.loadCurrent(
					{ lat: pos.coords.latitude, lng: pos.coords.longitude },
					'Your location',
				);
			},
			() => {
				// Denied / unavailable → fall back to the current trip city.
				this.loadCurrentForCity(
					this.city,
					`${CITY_NAME_EN[this.city]} (location off)`,
				);
			},
			{ timeout: 8000 },
		);
	}

	private loadCurrentForCity(c: City, label: string): void {
		this.loadCurrent(CITY_COORDS[c], label);
	}

	private async loadCurrent(coord: { lat: number; lng: number }, label: string): Promise<void> {
		this.curStatus = 'loading';
		try {
			this.current = await fetchCurrent(coord);
			this.curPlace = label;
			this.curStatus = 'ok';
		} catch {
			this.curStatus = 'error';
		}
	}

	private renderCurrent() {
		if (this.curStatus === 'idle')
			return html`<p class="card">
				<button type="button" @click=${this.useLocation}>📍 Use my location</button>
				<br /><br /><small
					>Or check <a href="#" @click=${this.cityFallback}>
						${CITY_NAME_EN[this.city]}</a
					>
					right now. We only read your location to fetch local weather — nothing is
					stored.</small
				>
			</p>`;
		if (this.curStatus === 'loading') return html`<p class="status">Fetching conditions…</p>`;
		if (this.curStatus === 'error')
			return html`<p class="status">
				Couldn't load weather right now.
				<button type="button" @click=${this.useLocation}>Retry</button>
			</p>`;
		const w = this.current!;
		const d = describeCode(w.code);
		return html`
      <article class="card">
        <p class="current-top">
          <i class="big" aria-hidden="true">${d.icon}</i>
          <data class="temp">${Math.round(w.temp)}°</data>
          <small>${d.label} · ${this.curPlace}</small>
        </p>
        <dl class="metrics">
          <dt>Feels like</dt>
          <dd>${Math.round(w.feels)}°C</dd>
          <dt>Humidity</dt>
          <dd>${Math.round(w.humidity)}%</dd>
          <dt>Rain chance</dt>
          <dd>${w.rainProb ?? '—'}${w.rainProb == null ? '' : '%'}</dd>
          <dt>UV index</dt>
          <dd>${w.uv == null ? '—' : w.uv.toFixed(1)}</dd>
          <dt>Wind</dt>
          <dd>${Math.round(w.wind)} km/h</dd>
        </dl>
      </article>
    `;
	}

	private cityFallback(e: Event): void {
		e.preventDefault();
		this.loadCurrentForCity(this.city, CITY_NAME_EN[this.city]);
	}

	private renderForecast() {
		if (this.fcStatus === 'loading') return html`<p class="status">Loading forecast…</p>`;
		if (this.fcStatus === 'error')
			return html`<p class="status">
				Forecast unavailable right now.
				<button type="button" @click=${() => this.loadForecasts()}>Retry</button>
			</p>`;
		const days = this.tripDays();
		return html`
      <ul class="days">
        ${days.map((td) => {
			const wx = this.forecasts.get(td.city)?.get(td.date);
			const [, mm, dd] = td.date.split('-');
			if (!wx) {
				return html`<li class="day pending">
                <p class="date">${dd}/${mm}</p>
                <p class="city">${CITY_NAME_EN[td.city]}</p>
                <p class="icon" aria-hidden="true">🗓️</p>
                <p class="sub">Forecast closer to the date</p>
              </li>`;
			}
			const d = describeCode(wx.code);
			return html`<li class="day">
              <p class="date">${dd}/${mm}</p>
              <p class="city">${CITY_NAME_EN[td.city]}</p>
              <p class="icon" aria-hidden="true" title=${d.label}>${d.icon}</p>
              <p class="hilo">
                ${Math.round(wx.tMax)}° <small class="lo">/ ${Math.round(wx.tMin)}°</small>
              </p>
              <p class="sub">
                🌧️ ${wx.rainProb ?? 0}% ${wx.uvMax == null ? '' : `· UV ${Math.round(wx.uvMax)}`}
              </p>
            </li>`;
		})}
      </ul>
    `;
	}

	override render() {
		return html`
      <header class="intro">
        <p class="ko">날씨 · Weather</p>
        <h1>Rain shell or shades?</h1>
      </header>

      <section aria-label="Current conditions">
        <h2>Right now</h2>
        ${this.renderCurrent()}
      </section>

      <section aria-label="Trip forecast">
        <h2>Trip forecast</h2>
        <p class="status">
          Live 16-day outlook per city (Open-Meteo). Late July is hot and humid with
          monsoon showers — days beyond the forecast window fill in nearer the time.
        </p>
        <br />
        ${this.renderForecast()}
      </section>
    `;
	}
}
