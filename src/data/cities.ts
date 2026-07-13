import type { City, CitySegment } from '../types.js';

/** Number of people on the trip — used to show per-person share of per-car costs. */
export const TRAVELLERS = 2;

export const SEGMENTS: CitySegment[] = [
	{
		city: 'seoul',
		nameEn: 'Seoul',
		nameKo: '서울',
		arrive: '2026-07-19T18:00:00+09:00',
		depart: '2026-07-25T13:55:00+09:00',
		hotel: {
			name: 'Friendly DH Naissance Hotel',
			address: '39 Dongsomun-ro 20na-gil, Seongbuk-gu, Seoul',
			google:
				'https://www.google.com/maps/search/?api=1&query=Friendly+DH+Naissance+Hotel+Dongsomun-ro+Seoul',
			kakao: 'https://map.kakao.com/?q=' + encodeURIComponent('동소문로20나길 39'),
		},
	},
	{
		city: 'jeju',
		nameEn: 'Jeju',
		nameKo: '제주',
		arrive: '2026-07-25T15:10:00+09:00',
		depart: '2026-07-28T10:45:00+09:00',
		hotel: {
			name: 'Hotel Moon',
			address: '1 Seowang-ro 24-gil, Jeju City',
			google:
				'https://www.google.com/maps/search/?api=1&query=Hotel+Moon+Seowang-ro+Jeju',
			kakao: 'https://map.kakao.com/?q=' + encodeURIComponent('서왕로24길 1'),
		},
	},
	{
		city: 'busan',
		nameEn: 'Busan',
		nameKo: '부산',
		arrive: '2026-07-28T11:45:00+09:00',
		depart: '2026-08-01T23:55:00+09:00',
		hotel: {
			name: 'Ososo',
			address: '9-1 Busanjinseonggongwon-ro, Dong-gu, Busan',
			google:
				'https://www.google.com/maps/search/?api=1&query=Ososo+Busanjinseonggongwon-ro+Busan',
			kakao: 'https://map.kakao.com/?q=' + encodeURIComponent('부산진성공원로 9-1'),
		},
	},
];

export interface CityTheme {
	accent: string;
	/** petal tint [r,g,b] */
	petal: [number, number, number];
	/** mountain/mist tint [r,g,b] */
	ridge: [number, number, number];
}

export const CITY_THEME: Record<City, CityTheme> = {
	seoul: { accent: '#0047a0', petal: [248, 200, 216], ridge: [0, 71, 160] },
	jeju: { accent: '#c2334d', petal: [225, 120, 135], ridge: [194, 51, 77] },
	busan: { accent: '#0f8a8a', petal: [120, 200, 205], ridge: [15, 138, 138] },
};

export const CITY_NAME_KO: Record<City, string> = {
	seoul: '서울',
	jeju: '제주',
	busan: '부산',
};

export const CITY_NAME_EN: Record<City, string> = {
	seoul: 'Seoul',
	jeju: 'Jeju',
	busan: 'Busan',
};
