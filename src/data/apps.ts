export interface AppInfo {
	id: string;
	name: string;
	ko?: string;
	/** One-sentence description of why it's useful. */
	blurb: string;
	/** Public path to the app's real icon (downloaded from the App Store). */
	icon: string;
	/** Google Play package id. */
	android?: string;
	/** Apple App Store numeric id. */
	ios?: string;
	/** Custom URL scheme to open the app if installed. */
	deepLink?: string;
}

const play = (pkg: string) => `https://play.google.com/store/apps/details?id=${pkg}`;
const apple = (id: string) => `https://apps.apple.com/app/id${id}`;

/** Store links resolved for a given app. */
export function androidUrl(a: AppInfo): string | undefined {
	return a.android ? play(a.android) : undefined;
}
export function iosUrl(a: AppInfo): string | undefined {
	return a.ios ? apple(a.ios) : undefined;
}

export const APPS: AppInfo[] = [
	{
		id: 'naver-map',
		name: 'Naver Map',
		ko: '네이버 지도',
		blurb:
			"Korea's default map — the most accurate navigation, transit and place search (Google Maps is limited here).",
		icon: '/icons/naver-map.png',
		android: 'com.nhn.android.nmap',
		ios: '311867728',
		deepLink: 'nmap://',
	},
	{
		id: 'kakaomap',
		name: 'KakaoMap',
		ko: '카카오맵',
		blurb:
			'The other big Korean map app — great for walking directions, bus/subway routing and street views.',
		icon: '/icons/kakaomap.png',
		android: 'net.daum.android.map',
		ios: '304608425',
		deepLink: 'kakaomap://',
	},
	{
		id: 'papago',
		name: 'Papago',
		ko: '파파고',
		blurb:
			"Naver's translator — text, voice, image and live conversation, and it handles Korean better than Google Translate.",
		icon: '/icons/papago.png',
		android: 'com.naver.labs.translator',
		ios: '1147874819',
	},
	{
		id: 'kakao-t',
		name: 'Kakao T',
		ko: '카카오 T',
		blurb:
			"Hail and pay for taxis (plus bikes and more) the way locals do — essential when there's a language gap. Covers k.ride too.",
		icon: '/icons/kakao-t.png',
		android: 'com.kakao.taxi',
		ios: '981110422',
		deepLink: 'kakaot://',
	},
	{
		id: 'tmoney',
		name: 'Mobile T-money',
		ko: '모바일티머니',
		blurb:
			'Top up and tap your phone for metro, buses and many taxis instead of carrying a plastic T-money card.',
		icon: '/icons/tmoney.png',
		android: 'com.lgt.tmoney',
		ios: '1470361790',
	},
	{
		id: 'catchtable',
		name: 'Catchtable',
		ko: '캐치테이블',
		blurb:
			'Reserve popular restaurants and join waitlists across Korea — the global version works in English.',
		icon: '/icons/catchtable.png',
		android: 'kr.co.catchtable.global.catchtable_global',
		ios: '1639046576',
	},
	{
		id: 'baemin',
		name: 'Baemin',
		ko: '배달의민족',
		blurb:
			"Korea's biggest food-delivery app — order in to your hotel when you don't feel like heading back out.",
		icon: '/icons/baemin.png',
		android: 'com.sampleapp',
		ios: '378084485',
	},
	{
		id: 'klook',
		name: 'Klook',
		blurb:
			'Book attraction tickets, tours and passes (Everland, cable cars, and more) — often cheaper than paying at the gate.',
		icon: '/icons/klook.png',
		android: 'com.klook',
		ios: '961850126',
		deepLink: 'klook://',
	},
];
