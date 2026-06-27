import type { Tip } from '../types.js';

export const TIPS: Tip[] = [
  // Global
  {
    id: 'g-tmoney',
    scope: 'global',
    category: 'transport',
    title: 'Get a T-money card',
    body: 'Works on all Seoul & Busan metro, buses and many taxis. Buy and top up at any convenience store (CU, GS25, 7-Eleven).',
  },
  {
    id: 'g-maps',
    scope: 'global',
    category: 'connectivity',
    title: 'Use KakaoMap & Naver Map',
    body: 'Google Maps directions are limited in Korea. Install KakaoMap and Naver Map for navigation, plus Papago for translation and KakaoT for taxis.',
  },
  {
    id: 'g-money',
    scope: 'global',
    category: 'money',
    title: 'Cards everywhere, cash for markets',
    body: 'Card is widely accepted. Keep some cash for traditional markets and small Jeju spots. Tipping is not customary — no need.',
  },
  {
    id: 'g-weather',
    scope: 'global',
    category: 'weather',
    title: 'Late July = hot, humid, monsoon',
    body: 'Pack a light rain shell and a compact umbrella. Outdoor shows (Banpo fountain, etc.) can be cancelled for weather — have a backup plan.',
  },
  {
    id: 'g-emergency',
    scope: 'global',
    category: 'safety',
    title: 'Emergency numbers',
    body: '112 = police, 119 = fire / ambulance. The 1330 Korea Travel Hotline gives 24/7 tourist help in English.',
  },
  {
    id: 'g-prebook',
    scope: 'global',
    category: 'booking',
    title: 'Pre-book the time-sensitive things',
    body: 'Everland tickets (Klook), Haeundae Sky Capsule, the 1 Aug KTX, and the Jeju rental car. Check the Lotte Giants home schedule.',
  },

  // Seoul
  {
    id: 's-free',
    scope: 'seoul',
    category: 'money',
    title: 'The big museums are free',
    body: 'National Museum of Korea, National Folk Museum, War Memorial and Seoul Museum of History all have free admission.',
  },
  {
    id: 's-closures',
    scope: 'seoul',
    category: 'booking',
    title: 'Mind the closing days',
    body: 'Gyeongbokgung is closed Tuesdays. MMCA, War Memorial, Leeum and Seoul Museum of History are closed Mondays — the itinerary already routes around this.',
  },
  {
    id: 's-hanbok',
    scope: 'seoul',
    category: 'money',
    title: 'Hanbok = free palace entry',
    body: 'Rent a hanbok near Gyeongbokgung and you enter the palace free (and get great photos).',
  },
  {
    id: 's-bukchon',
    scope: 'seoul',
    category: 'etiquette',
    title: 'Bukchon is residential',
    body: 'Visit Mon–Sat 10:00–17:00 only (closed to tourists Sundays). Keep your voice down — people live there.',
  },

  // Jeju
  {
    id: 'j-car',
    scope: 'jeju',
    category: 'transport',
    title: 'Rent a car — and bring your IDP',
    body: 'Jeju buses are slow; a car makes the trip. You MUST carry an International Driving Permit obtained in South Africa before you fly. Car cost is per car — split between 2 it’s about ₩30,000pp/day.',
  },
  {
    id: 'j-ferry',
    scope: 'jeju',
    category: 'transport',
    title: 'Check the last Udo ferry',
    body: 'Ferries from Seongsan Port run roughly 09:00–17:00. Confirm the final return time before you cross so you’re not stranded.',
  },
  {
    id: 'j-unesco',
    scope: 'jeju',
    category: 'booking',
    title: 'UNESCO site closing days',
    body: 'Seongsan Ilchulbong closes the 1st Monday monthly; Manjanggul the 1st Wednesday. Neither falls on your dates — you’re clear.',
  },

  // Busan
  {
    id: 'b-departure',
    scope: 'busan',
    category: 'transport',
    title: '1 Aug flight leaves from Incheon',
    body: 'Not Busan! It’s a travel day: KTX → AREX takes ~3.5–4 hrs to ICN. Your hotel is by Busan Station, which helps.',
  },
  {
    id: 'b-drone',
    scope: 'busan',
    category: 'booking',
    title: 'Gwangalli drone show is Saturday-only',
    body: 'Your only Busan Saturday is your departure day, so it isn’t feasible this trip. The Bay 101 night view is the swap.',
  },
  {
    id: 'b-baseball',
    scope: 'busan',
    category: 'booking',
    title: 'Confirm the baseball',
    body: 'Check koreabaseball.com for the Lotte Giants home dates (28–31 Jul) and slot the game into whichever evening they’re at Sajik.',
  },
  {
    id: 'b-skycapsule',
    scope: 'busan',
    category: 'booking',
    title: 'Book the Sky Capsule ahead',
    body: 'The pastel capsules sell out — reserve online for your preferred time slot rather than queuing on the day.',
  },
];
