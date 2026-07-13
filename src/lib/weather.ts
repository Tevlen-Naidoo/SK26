import type { City } from '../types.js';

/**
 * Open-Meteo weather client — no API key, CORS-enabled, free for non-commercial
 * use. https://open-meteo.com/ . Provides current conditions (from geolocation
 * or a trip city) and a per-day forecast for the trip window (~16 days out).
 */

export interface Coord {
	lat: number;
	lng: number;
}

export const CITY_COORDS: Record<City, Coord> = {
	seoul: { lat: 37.5665, lng: 126.978 },
	jeju: { lat: 33.4996, lng: 126.5312 },
	busan: { lat: 35.1796, lng: 129.0756 },
};

export interface CurrentWx {
	temp: number;
	feels: number;
	humidity: number;
	rainProb: number | null;
	uv: number | null;
	wind: number;
	code: number;
	time: string;
}

export interface DailyWx {
	date: string;
	tMax: number;
	tMin: number;
	rainProb: number | null;
	uvMax: number | null;
	code: number;
}

const BASE = 'https://api.open-meteo.com/v1/forecast';

/** WMO weather-code → emoji + short label. */
export function describeCode(code: number): { icon: string; label: string } {
	const m: Record<number, { icon: string; label: string }> = {
		0: { icon: '☀️', label: 'Clear' },
		1: { icon: '🌤️', label: 'Mainly clear' },
		2: { icon: '⛅', label: 'Partly cloudy' },
		3: { icon: '☁️', label: 'Overcast' },
		45: { icon: '🌫️', label: 'Fog' },
		48: { icon: '🌫️', label: 'Rime fog' },
		51: { icon: '🌦️', label: 'Light drizzle' },
		53: { icon: '🌦️', label: 'Drizzle' },
		55: { icon: '🌧️', label: 'Heavy drizzle' },
		61: { icon: '🌦️', label: 'Light rain' },
		63: { icon: '🌧️', label: 'Rain' },
		65: { icon: '🌧️', label: 'Heavy rain' },
		66: { icon: '🌧️', label: 'Freezing rain' },
		67: { icon: '🌧️', label: 'Freezing rain' },
		71: { icon: '🌨️', label: 'Light snow' },
		73: { icon: '🌨️', label: 'Snow' },
		75: { icon: '❄️', label: 'Heavy snow' },
		77: { icon: '🌨️', label: 'Snow grains' },
		80: { icon: '🌦️', label: 'Showers' },
		81: { icon: '🌧️', label: 'Showers' },
		82: { icon: '⛈️', label: 'Violent showers' },
		85: { icon: '🌨️', label: 'Snow showers' },
		86: { icon: '❄️', label: 'Snow showers' },
		95: { icon: '⛈️', label: 'Thunderstorm' },
		96: { icon: '⛈️', label: 'Storm + hail' },
		99: { icon: '⛈️', label: 'Storm + hail' },
	};
	return m[code] ?? { icon: '🌡️', label: 'Weather' };
}

async function getJson(url: string): Promise<any> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
	return res.json();
}

/** Current conditions at a point (geolocation or a city fallback). */
export async function fetchCurrent(c: Coord): Promise<CurrentWx> {
	const params = new URLSearchParams({
		latitude: String(c.lat),
		longitude: String(c.lng),
		current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
		hourly: 'precipitation_probability,uv_index',
		forecast_days: '1',
		timezone: 'auto',
	});
	const d = await getJson(`${BASE}?${params}`);
	const cur = d.current ?? {};
	// Match the current hour against the hourly arrays for rain% and UV.
	const times: string[] = d.hourly?.time ?? [];
	const idx = times.indexOf((cur.time ?? '').slice(0, 13) + ':00');
	const at = (arr?: number[]) => (idx >= 0 && arr ? arr[idx] : null);
	return {
		temp: cur.temperature_2m,
		feels: cur.apparent_temperature,
		humidity: cur.relative_humidity_2m,
		rainProb: at(d.hourly?.precipitation_probability),
		uv: at(d.hourly?.uv_index),
		wind: cur.wind_speed_10m,
		code: cur.weather_code,
		time: cur.time,
	};
}

/** Daily forecast for a city, keyed by ISO date (only ~16 days are available). */
export async function fetchForecast(c: Coord): Promise<Map<string, DailyWx>> {
	const params = new URLSearchParams({
		latitude: String(c.lat),
		longitude: String(c.lng),
		daily:
			'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max',
		forecast_days: '16',
		timezone: 'Asia/Seoul',
	});
	const d = await getJson(`${BASE}?${params}`);
	const day = d.daily ?? {};
	const dates: string[] = day.time ?? [];
	const out = new Map<string, DailyWx>();
	dates.forEach((date, i) => {
		out.set(date, {
			date,
			tMax: day.temperature_2m_max?.[i],
			tMin: day.temperature_2m_min?.[i],
			rainProb: day.precipitation_probability_max?.[i] ?? null,
			uvMax: day.uv_index_max?.[i] ?? null,
			code: day.weather_code?.[i],
		});
	});
	return out;
}
