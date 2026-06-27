export type City = 'seoul' | 'jeju' | 'busan';

export type Phase = City | 'pre' | 'post';

export type EventCategory =
  | 'travel'
  | 'food'
  | 'sightseeing'
  | 'museum'
  | 'nature'
  | 'show'
  | 'shopping'
  | 'relax'
  | 'sport';

export interface MapLinks {
  google?: string;
  kakao?: string;
}

export interface Cost {
  /** per person, in KRW; 0 = free */
  krw: number;
  /** per person, in ZAR (converted at R1 ≈ ₩93) */
  zar: number;
  note?: string;
}

export interface TripEvent {
  id: string;
  city: City;
  /** Asia/Seoul local date, "2026-07-20" */
  date: string;
  /** "10:00" (Asia/Seoul local) */
  start?: string;
  end?: string;
  title: string;
  summary?: string;
  category: EventCategory;
  location?: { name: string; area?: string } & MapLinks;
  cost?: Cost;
  optional?: boolean;
  tags?: string[];
}

export interface CitySegment {
  city: City;
  nameEn: string;
  nameKo: string;
  /** ISO datetime with +09:00 offset */
  arrive: string;
  depart: string;
  hotel?: { name: string; address: string } & MapLinks;
}

export interface PhotoInspiration {
  id: string;
  city: City;
  title: string;
  spot: string;
  tip: string;
  bestTime?: string;
  image?: string;
  credit?: string;
}

export interface Tip {
  id: string;
  scope: City | 'global';
  category:
    | 'money'
    | 'transport'
    | 'etiquette'
    | 'safety'
    | 'food'
    | 'connectivity'
    | 'weather'
    | 'booking';
  title: string;
  body: string;
}

export type TabId =
  | 'home'
  | 'itinerary'
  | 'calendar'
  | 'cuisine'
  | 'inspo'
  | 'tips'
  | 'clocks';

export interface CuisineItem {
  id: string;
  name: string;
  ko?: string;
  emoji?: string;
  note?: string;
  kind: 'dish' | 'experience';
}

export interface NowState {
  state: 'pre' | 'now' | 'next' | 'post';
  event?: TripEvent;
}
