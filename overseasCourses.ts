// ────────────────────────────────────────────────────────────────
// 해외(일본 외) 더미 골프장 데이터 — v3 프로토타입
// ────────────────────────────────────────────────────────────────
//
// 유지보수 가이드
// ─────────────────────
//  1) COUNTRY_COURSE_SEEDS[countryCode][subRegion] 에 CourseSeed 객체를 push.
//     - countryCode 는 lib/countries.ts COUNTRIES[].code 와 일치해야 함 (vn/hi/tw/my)
//     - subRegion 은 해당 country.regions[*].subRegions 안의 문자열과 일치해야 함
//  2) seed 의 필수 필드만 채우면 buildOverseasCourses() 가
//     - 1차 권역(`region` ← subRegion), 이미지, 기본 플랜, 환율 무관 ¥ 단위 mock 가격
//     을 보강해 GolfCourse[] 를 만들어 mockCourses 에 합쳐 줌.
//  3) 평균 권역당 2-3개 코스를 권장. 더 추가하려면 그냥 배열에 push.
//
// 가격 단위 노트
// ─────────────────────
//  - lowestPrice 는 JPY 환산값(prototype mock — 표시 컴포넌트가 ¥/₩ 듀얼로 보여줌).
//  - 실제 환율/현지통화 대응은 서비스화 시점에 도입.
// ────────────────────────────────────────────────────────────────

import type { GolfCourse, Plan } from './mockData';
import { COUNTRIES } from '../lib/countries';

/** 코스 시드 — 필수 필드 위주, 나머지는 빌더에서 보강 */
interface CourseSeed {
  /** 전역 고유 id. country prefix 권장 (예: 'vn-danang-bc') */
  id: string;
  name: string;
  nameLocal: string;
  /** lib/countries.ts country.regions[].subRegions 와 일치하는 문자열 */
  subRegion: string;
  address: string;
  addressLocal: string;
  latitude: number;
  longitude: number;
  /** JPY 환산 mock — 8000~32000 범위 권장 */
  lowestPrice: number;
  rating: number;
  reviewCount: number;
  remainingTeams?: number;
  holes?: number;
  par?: number;
  tags?: string[];
  beginnerFriendly?: boolean;
  /** ex: "다낭 시내에서 차량 25분" */
  distanceLabel?: string;
  /** OVERSEAS_IMAGES 인덱스 — 미지정 시 id 해시로 자동 분배 */
  imageIdx?: number;
  /** 기본 플랜 이름 커스터마이즈 (미지정 시 '18홀 카트 포함 플랜') */
  planName?: string;
  /** 기본 ratingSource 덮어쓰기 (default 'Google') */
  ratingSource?: string;
}

// 해외 코스용 풍경 이미지 풀 — mockData.ts courseImages 와 동일한 Unsplash 핫링크
// (별도 핫링크 시도해 broken 되는 케이스가 있어 검증된 URL 만 재사용)
const OVERSEAS_IMAGES: string[] = [
  'https://images.unsplash.com/photo-1737546240242-60d036c4fdfe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMGdvbGYlMjBjb3Vyc2UlMjBhZXJpYWx8ZW58MXx8fHwxNzczODgwNjAzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1714538247922-280698e0e20c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbiUyMGdvbGYlMjByZXNvcnQlMjBtb3VudGFpbnxlbnwxfHx8fDE3NzM4ODA2MDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1766288020088-4b95f5409376?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBnb2xmJTIwY291cnNlJTIwb2NlYW58ZW58MXx8fHwxNzczODgwNjA1fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1768396747921-5a18367415d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xmJTIwY291cnNlJTIwbGFuZHNjYXBlJTIwZ3JlZW58ZW58MXx8fHwxNzczODgwNjA1fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1762952078331-a680492cffe3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xmJTIwY2x1YiUyMGZhY2lsaXR5fGVufDF8fHx8MTc3Mzg4MDYwNXww&ixlib=rb-4.1.0&q=80&w=1080',
];

function pickImage(seed: CourseSeed): string {
  if (typeof seed.imageIdx === 'number') return OVERSEAS_IMAGES[seed.imageIdx % OVERSEAS_IMAGES.length];
  // id 문자열 합으로 결정적 분배
  let h = 0;
  for (let i = 0; i < seed.id.length; i++) h = (h * 31 + seed.id.charCodeAt(i)) | 0;
  return OVERSEAS_IMAGES[Math.abs(h) % OVERSEAS_IMAGES.length];
}

function defaultPlan(seed: CourseSeed): Plan {
  return {
    id: `${seed.id}-p1`,
    name: seed.planName ?? '18홀 카트 포함 플랜',
    nameLocal: '18H w/ Cart',
    badges: ['카트포함', '18홀'],
    includes: ['카트비', '세금'],
    excludes: ['캐디', '식사'],
    basePrice: seed.lowestPrice,
    twoPlayerSurcharge: 2000,
    threePlayerSurcharge: 1200,
    times: ['07:30', '08:00', '08:30', '09:00', '13:00', '13:30'],
    minPlayer: 1,
    maxPlayer: 4,
    roundCode: '18H',
    courseName: 'Main Course',
    paymentType: 'onsite',
    cancellationPolicy: [
      { label: '7일 전까지', fee: '전액 환불' },
      { label: '3~6일 전', fee: '30% 위약금' },
      { label: '2일 전~당일', fee: '100% 위약금' },
    ],
  };
}

/** seed → GolfCourse */
function makeCourse(country: string, parentRegion: string, seed: CourseSeed): GolfCourse {
  const img = pickImage(seed);
  return {
    id: seed.id,
    country,
    name: seed.name,
    nameLocal: seed.nameLocal,
    image: img,
    images: [img, OVERSEAS_IMAGES[(OVERSEAS_IMAGES.indexOf(img) + 1) % OVERSEAS_IMAGES.length]],
    address: seed.address,
    addressLocal: seed.addressLocal,
    lowestPrice: seed.lowestPrice,
    rating: seed.rating,
    reviewCount: seed.reviewCount,
    ratingSource: seed.ratingSource ?? 'Google',
    distance: seed.distanceLabel ?? `${seed.subRegion} 중심부`,
    // 카드 region 라벨: 1차 권역만 노출 (e.g. '북부 · 하노이 시내에서 차량 70분')
    // 2차 권역(seed.subRegion)은 별도 필드에 저장하여 권역 필터에서만 사용
    region: parentRegion,
    subRegion: seed.subRegion,
    latitude: seed.latitude,
    longitude: seed.longitude,
    remainingTeams: seed.remainingTeams ?? 6,
    holes: seed.holes ?? 18,
    par: seed.par ?? 72,
    foreignerOk: true,
    beginnerFriendly: seed.beginnerFriendly ?? false,
    tags: seed.tags,
    plans: [defaultPlan(seed)],
  };
}

// ────────────────────────────────────────────────────────────────
// 시드 데이터
// ────────────────────────────────────────────────────────────────
const COUNTRY_COURSE_SEEDS: Record<string, Record<string, CourseSeed[]>> = {
  // ── 베트남 (vn) ─────────────────────────────────────────────
  vn: {
    하노이: [
      { id: 'vn-hn-skylake', name: '스카이레이크 골프클럽', nameLocal: 'Sky Lake Resort & Golf',
        subRegion: '하노이', address: '하노이 차이미 36 홀', addressLocal: 'Sky Lake, Chuong My, Hanoi',
        latitude: 20.9105, longitude: 105.6731, lowestPrice: 14500, rating: 4.5, reviewCount: 58,
        remainingTeams: 8, tags: ['추천'], distanceLabel: '하노이 시내에서 차량 70분' },
      { id: 'vn-hn-kings', name: '킹스 아일랜드 골프 리조트', nameLocal: "King's Island Golf Resort",
        subRegion: '하노이', address: '하노이 동모 호숫가 36홀', addressLocal: 'Dong Mo, Son Tay, Hanoi',
        latitude: 21.0590, longitude: 105.4760, lowestPrice: 16000, rating: 4.4, reviewCount: 41,
        remainingTeams: 5, distanceLabel: '하노이 시내에서 차량 50분' },
    ],
    하롱: [
      { id: 'vn-hl-flchalong', name: 'FLC 하롱베이 골프클럽', nameLocal: 'FLC Ha Long Bay Golf Club',
        subRegion: '하롱', address: '하롱시 푸드엉 언덕 위 18홀', addressLocal: 'Ha Long, Quang Ninh',
        latitude: 20.9430, longitude: 107.0510, lowestPrice: 15200, rating: 4.6, reviewCount: 47,
        remainingTeams: 4, tags: ['오션뷰'], distanceLabel: '하롱시내에서 차량 10분' },
      { id: 'vn-hl-tuanchau', name: '뚜언쩌우 골프클럽', nameLocal: 'Tuan Chau Golf Club',
        subRegion: '하롱', address: '뚜언쩌우섬 9홀', addressLocal: 'Tuan Chau Island, Ha Long',
        latitude: 20.9097, longitude: 107.0091, lowestPrice: 11800, rating: 4.1, reviewCount: 22,
        remainingTeams: 7, holes: 9, par: 36, beginnerFriendly: true, distanceLabel: '뚜언쩌우 입구 5분' },
    ],
    다낭: [
      { id: 'vn-dn-bana', name: '바나힐스 골프클럽', nameLocal: 'Ba Na Hills Golf Club',
        subRegion: '다낭', address: '다낭 바나힐 산자락 18홀', addressLocal: 'Ba Na Hills, Da Nang',
        latitude: 15.9853, longitude: 107.9967, lowestPrice: 22000, rating: 4.7, reviewCount: 73,
        remainingTeams: 6, tags: ['명문코스', '추천'], distanceLabel: '다낭 시내에서 차량 40분' },
      { id: 'vn-dn-bcountry', name: 'BRG 다낭 골프 리조트', nameLocal: 'BRG Da Nang Golf Resort',
        subRegion: '다낭', address: '다낭 미케 비치 인근', addressLocal: 'Hoa Hai, Ngu Hanh Son, Da Nang',
        latitude: 16.0044, longitude: 108.2614, lowestPrice: 18500, rating: 4.5, reviewCount: 65,
        remainingTeams: 9, distanceLabel: '다낭 공항에서 차량 25분' },
      { id: 'vn-dn-montgomerie', name: '몽고메리 링크스', nameLocal: 'Montgomerie Links Vietnam',
        subRegion: '다낭', address: '다낭 시내 남쪽 18홀 링크스', addressLocal: 'Dien Ngoc, Quang Nam',
        latitude: 15.9163, longitude: 108.3137, lowestPrice: 19800, rating: 4.6, reviewCount: 51,
        remainingTeams: 5, tags: ['링크스'], distanceLabel: '다낭 시내에서 차량 30분' },
    ],
    호이안: [
      { id: 'vn-ha-vinpearl', name: '빈펄 골프 남호이안', nameLocal: 'Vinpearl Golf Nam Hoi An',
        subRegion: '호이안', address: '호이안 빈펄 리조트 27홀', addressLocal: 'Binh Minh, Quang Nam',
        latitude: 15.7233, longitude: 108.4156, lowestPrice: 17000, rating: 4.4, reviewCount: 39,
        remainingTeams: 7, distanceLabel: '호이안 구시가에서 차량 20분' },
      { id: 'vn-ha-tnbeach', name: 'TN 호이안 비치 골프', nameLocal: 'TN Hoi An Beach Golf',
        subRegion: '호이안', address: '호이안 해변가 9홀', addressLocal: 'Cua Dai Beach, Hoi An',
        latitude: 15.9000, longitude: 108.3556, lowestPrice: 11500, rating: 4.0, reviewCount: 17,
        remainingTeams: 5, holes: 9, par: 36, beginnerFriendly: true, distanceLabel: '호이안 비치 인접' },
    ],
    나트랑: [
      { id: 'vn-nt-vinpearl', name: '빈펄 골프 나트랑', nameLocal: 'Vinpearl Golf Nha Trang',
        subRegion: '나트랑', address: '나트랑 혼째 섬 18홀', addressLocal: 'Hon Tre Island, Nha Trang',
        latitude: 12.2069, longitude: 109.2972, lowestPrice: 16500, rating: 4.5, reviewCount: 44,
        remainingTeams: 6, tags: ['오션뷰'], distanceLabel: '나트랑 케이블카로 진입' },
      { id: 'vn-nt-diamond', name: '다이아몬드 베이 나트랑', nameLocal: 'Diamond Bay Golf & Villas',
        subRegion: '나트랑', address: '나트랑 다이아몬드 베이 18홀', addressLocal: 'Phuoc Ha, Nha Trang',
        latitude: 12.1850, longitude: 109.1611, lowestPrice: 14000, rating: 4.3, reviewCount: 30,
        remainingTeams: 8, distanceLabel: '나트랑 공항에서 차량 35분' },
    ],
    호치민: [
      { id: 'vn-hc-twindoves', name: '트윈 도브스 골프클럽', nameLocal: 'Twin Doves Golf Club',
        subRegion: '호치민', address: '호치민 인근 빈즈엉성 36홀', addressLocal: 'Thu Dau Mot, Binh Duong',
        latitude: 11.0090, longitude: 106.6520, lowestPrice: 17500, rating: 4.5, reviewCount: 49,
        remainingTeams: 6, tags: ['추천'], distanceLabel: '호치민 시내에서 차량 50분' },
      { id: 'vn-hc-songbe', name: '송베 골프 리조트', nameLocal: 'Song Be Golf Resort',
        subRegion: '호치민', address: '호치민 송베 27홀', addressLocal: 'Lai Thieu, Binh Duong',
        latitude: 10.9220, longitude: 106.6810, lowestPrice: 13800, rating: 4.2, reviewCount: 28,
        remainingTeams: 7, distanceLabel: '호치민 시내에서 차량 40분' },
    ],
    푸꾸옥: [
      { id: 'vn-pq-vinpearl', name: '빈펄 골프 푸꾸옥', nameLocal: 'Vinpearl Golf Phu Quoc',
        subRegion: '푸꾸옥', address: '푸꾸옥 빈펄 리조트 27홀', addressLocal: 'Bai Dai, Phu Quoc',
        latitude: 10.3486, longitude: 103.8553, lowestPrice: 19500, rating: 4.6, reviewCount: 56,
        remainingTeams: 6, tags: ['오션뷰', '추천'], distanceLabel: '푸꾸옥 공항에서 차량 30분' },
      { id: 'vn-pq-flcphuquoc', name: 'FLC 푸꾸옥 골프링크스', nameLocal: 'FLC Phu Quoc Golf Links',
        subRegion: '푸꾸옥', address: '푸꾸옥 북부 18홀 링크스', addressLocal: 'Ganh Dau, Phu Quoc',
        latitude: 10.3680, longitude: 103.8400, lowestPrice: 17500, rating: 4.4, reviewCount: 33,
        remainingTeams: 5, tags: ['링크스'], distanceLabel: '푸꾸옥 공항에서 차량 40분' },
    ],
    달랏: [
      { id: 'vn-dl-palace', name: '달랏 팰리스 골프클럽', nameLocal: 'Dalat Palace Golf Club',
        subRegion: '달랏', address: '달랏 시내 흐엉씨엔 호숫가 18홀', addressLocal: '1 Phu Dong Thien Vuong, Da Lat',
        latitude: 11.9486, longitude: 108.4378, lowestPrice: 15500, rating: 4.5, reviewCount: 38,
        remainingTeams: 5, tags: ['시내근접'], distanceLabel: '달랏 시내 도보 5분' },
      { id: 'vn-dl-saminsky', name: 'SAM 투옌 르엄 골프', nameLocal: 'SAM Tuyen Lam Golf Club',
        subRegion: '달랏', address: '달랏 투옌람 호수 36홀', addressLocal: 'Tuyen Lam Lake, Da Lat',
        latitude: 11.8830, longitude: 108.3850, lowestPrice: 13200, rating: 4.3, reviewCount: 24,
        remainingTeams: 7, distanceLabel: '달랏 시내에서 차량 15분' },
    ],
  },

  // ── 하와이 (hi) ─────────────────────────────────────────────
  hi: {
    호놀룰루: [
      { id: 'hi-hn-aliwai', name: '알라와이 골프코스', nameLocal: 'Ala Wai Golf Course',
        subRegion: '호놀룰루', address: '와이키키 인근 시립 18홀', addressLocal: '404 Kapahulu Ave, Honolulu',
        latitude: 21.2837, longitude: -157.8260, lowestPrice: 18000, rating: 4.0, reviewCount: 62,
        remainingTeams: 9, tags: ['시내근접'], beginnerFriendly: true, distanceLabel: '와이키키 도보 10분' },
      { id: 'hi-hn-koolau', name: '코올라우 골프클럽', nameLocal: 'Koʻolau Golf Club',
        subRegion: '호놀룰루', address: '호놀룰루 카네오헤 산자락', addressLocal: '45-550 Kionaole Rd, Kaneohe',
        latitude: 21.3964, longitude: -157.8133, lowestPrice: 26500, rating: 4.7, reviewCount: 41,
        remainingTeams: 5, tags: ['난이도 高'], distanceLabel: '와이키키에서 차량 30분' },
    ],
    카일루아: [
      { id: 'hi-kl-olomana', name: '올로마나 골프링크스', nameLocal: 'Olomana Golf Links',
        subRegion: '카일루아', address: '카일루아 인근 18홀', addressLocal: '41-1801 Kalanianaole Hwy, Waimanalo',
        latitude: 21.3413, longitude: -157.7167, lowestPrice: 22000, rating: 4.3, reviewCount: 34,
        remainingTeams: 6, distanceLabel: '카일루아 시내 5분' },
      { id: 'hi-kl-mlbay', name: '미드퍼시픽 컨트리클럽', nameLocal: 'Mid Pacific Country Club',
        subRegion: '카일루아', address: '카일루아 라니카이 비치 인근', addressLocal: 'Lanikai, Kailua, HI',
        latitude: 21.3853, longitude: -157.7203, lowestPrice: 28000, rating: 4.6, reviewCount: 29,
        remainingTeams: 4, tags: ['오션뷰'], distanceLabel: '라니카이 비치 도보권' },
    ],
    카팔루아: [
      { id: 'hi-kp-plantation', name: '카팔루아 플랜테이션', nameLocal: 'Kapalua Plantation Course',
        subRegion: '카팔루아', address: '마우이 카팔루아 18홀 챔피언', addressLocal: '2000 Plantation Club Dr, Lahaina',
        latitude: 21.0028, longitude: -156.6481, lowestPrice: 32000, rating: 4.8, reviewCount: 58,
        remainingTeams: 4, tags: ['명문코스', '추천'], distanceLabel: '카훌루이 공항에서 차량 60분' },
      { id: 'hi-kp-bay', name: '카팔루아 베이 코스', nameLocal: 'Kapalua Bay Course',
        subRegion: '카팔루아', address: '마우이 카팔루아 베이 18홀', addressLocal: '300 Kapalua Dr, Lahaina',
        latitude: 21.0017, longitude: -156.6664, lowestPrice: 27500, rating: 4.6, reviewCount: 47,
        remainingTeams: 5, tags: ['오션뷰'], distanceLabel: '카훌루이 공항에서 차량 55분' },
    ],
    와일레아: [
      { id: 'hi-wl-gold', name: '와일레아 골드코스', nameLocal: 'Wailea Gold Course',
        subRegion: '와일레아', address: '마우이 와일레아 18홀', addressLocal: '100 Wailea Golf Club Dr, Wailea',
        latitude: 20.6878, longitude: -156.4322, lowestPrice: 28500, rating: 4.6, reviewCount: 52,
        remainingTeams: 5, tags: ['리조트'], distanceLabel: '카훌루이 공항에서 차량 30분' },
      { id: 'hi-wl-emerald', name: '와일레아 에메랄드', nameLocal: 'Wailea Emerald Course',
        subRegion: '와일레아', address: '마우이 와일레아 18홀', addressLocal: '100 Wailea Golf Club Dr, Wailea',
        latitude: 20.6889, longitude: -156.4361, lowestPrice: 25500, rating: 4.5, reviewCount: 38,
        remainingTeams: 6, distanceLabel: '카훌루이 공항에서 차량 30분' },
    ],
    코나: [
      { id: 'hi-kn-mauna', name: '마우나라니 사우스', nameLocal: 'Mauna Lani South Course',
        subRegion: '코나', address: '빅아일랜드 코할라 코스트 18홀', addressLocal: '68-1310 Mauna Lani Dr, Kohala Coast',
        latitude: 19.9494, longitude: -155.8703, lowestPrice: 29500, rating: 4.7, reviewCount: 49,
        remainingTeams: 5, tags: ['오션뷰', '명문코스'], distanceLabel: '코나 공항에서 차량 35분' },
      { id: 'hi-kn-hualalai', name: '훌랄라이 골프코스', nameLocal: 'Hualalai Golf Course',
        subRegion: '코나', address: '빅아일랜드 후알랄라이 18홀', addressLocal: '100 Kaupulehu Dr, Kailua-Kona',
        latitude: 19.8242, longitude: -155.9869, lowestPrice: 31000, rating: 4.7, reviewCount: 36,
        remainingTeams: 4, tags: ['리조트'], distanceLabel: '코나 공항에서 차량 15분' },
    ],
    힐로: [
      { id: 'hi-hl-naniloa', name: '나니로아 골프코스', nameLocal: 'Naniloa Golf Course',
        subRegion: '힐로', address: '빅아일랜드 힐로 9홀', addressLocal: '120 Banyan Way, Hilo',
        latitude: 19.7338, longitude: -155.0758, lowestPrice: 13500, rating: 4.0, reviewCount: 18,
        remainingTeams: 8, holes: 9, par: 35, beginnerFriendly: true, distanceLabel: '힐로 시내 도보권' },
      { id: 'hi-hl-hamakua', name: '하마쿠아 컨트리클럽', nameLocal: 'Hamakua Country Club',
        subRegion: '힐로', address: '빅아일랜드 호노카아 9홀', addressLocal: 'Honokaa, Hawaii',
        latitude: 20.0794, longitude: -155.4675, lowestPrice: 12000, rating: 3.9, reviewCount: 14,
        remainingTeams: 6, holes: 9, par: 33, beginnerFriendly: true, distanceLabel: '힐로에서 차량 50분' },
    ],
  },

  // ── 대만 (tw) ─────────────────────────────────────────────
  tw: {
    타이베이: [
      { id: 'tw-tp-linkou', name: '린코우 골프클럽', nameLocal: '林口高爾夫俱樂部',
        subRegion: '타이베이', address: '타이베이 린코우구 18홀', addressLocal: '新北市林口區',
        latitude: 25.0792, longitude: 121.3917, lowestPrice: 17500, rating: 4.5, reviewCount: 51,
        remainingTeams: 6, tags: ['추천'], distanceLabel: '타오위안 공항에서 차량 20분' },
      { id: 'tw-tp-tamsui', name: '담수이 골프클럽', nameLocal: '淡水高爾夫俱樂部',
        subRegion: '타이베이', address: '타이베이 담수구 18홀', addressLocal: '新北市淡水區',
        latitude: 25.1733, longitude: 121.4392, lowestPrice: 15000, rating: 4.3, reviewCount: 32,
        remainingTeams: 7, distanceLabel: '타이베이 시내에서 차량 40분' },
    ],
    신주: [
      { id: 'tw-hs-prince', name: '하이슈 프린스 골프', nameLocal: '海岸線王子高爾夫',
        subRegion: '신주', address: '신주 해변가 18홀', addressLocal: '新竹市海邊',
        latitude: 24.7825, longitude: 120.9342, lowestPrice: 14500, rating: 4.2, reviewCount: 28,
        remainingTeams: 6, tags: ['오션뷰'], distanceLabel: '신주 시내에서 차량 20분' },
      { id: 'tw-hs-evergreen', name: '에버그린 컨트리클럽', nameLocal: '長榮高爾夫鄉村俱樂部',
        subRegion: '신주', address: '신주현 산악지대 18홀', addressLocal: '新竹縣',
        latitude: 24.7242, longitude: 121.0353, lowestPrice: 13000, rating: 4.1, reviewCount: 21,
        remainingTeams: 8, distanceLabel: '신주 시내에서 차량 30분' },
    ],
    타이중: [
      { id: 'tw-tc-sunrise', name: '선라이즈 골프&컨트리클럽', nameLocal: '日昇高爾夫鄉村俱樂部',
        subRegion: '타이중', address: '타이중 산기슭 27홀', addressLocal: '台中市山區',
        latitude: 24.2178, longitude: 120.7944, lowestPrice: 16000, rating: 4.4, reviewCount: 36,
        remainingTeams: 7, tags: ['추천'], distanceLabel: '타이중 공항에서 차량 35분' },
      { id: 'tw-tc-pacific', name: '퍼시픽 골프 컨트리클럽', nameLocal: '太平洋高爾夫俱樂部',
        subRegion: '타이중', address: '타이중 18홀', addressLocal: '台中市',
        latitude: 24.1297, longitude: 120.6536, lowestPrice: 14500, rating: 4.2, reviewCount: 24,
        remainingTeams: 5, distanceLabel: '타이중 시내에서 차량 25분' },
      { id: 'tw-tc-tachia', name: '다자 골프장', nameLocal: '大甲高爾夫俱樂部',
        subRegion: '타이중', address: '타이중 다자구 9홀', addressLocal: '台中市大甲區',
        latitude: 24.3478, longitude: 120.6228, lowestPrice: 11000, rating: 4.0, reviewCount: 14,
        remainingTeams: 6, holes: 9, par: 36, beginnerFriendly: true, distanceLabel: '다자 시내 5분' },
    ],
    가오슝: [
      { id: 'tw-ks-changchi', name: '청치 골프 컨트리클럽', nameLocal: '昌期高爾夫鄉村俱樂部',
        subRegion: '가오슝', address: '가오슝 산악지역 18홀', addressLocal: '高雄市山區',
        latitude: 22.7300, longitude: 120.4283, lowestPrice: 15500, rating: 4.3, reviewCount: 33,
        remainingTeams: 6, distanceLabel: '가오슝 공항에서 차량 40분' },
      { id: 'tw-ks-pingtungchao', name: '핑둥 챠오 골프장', nameLocal: '屏東朝陽高爾夫',
        subRegion: '가오슝', address: '핑둥 인근 18홀', addressLocal: '屏東縣',
        latitude: 22.5503, longitude: 120.5483, lowestPrice: 13800, rating: 4.1, reviewCount: 22,
        remainingTeams: 7, distanceLabel: '가오슝 시내에서 차량 50분' },
    ],
    타이난: [
      { id: 'tw-tn-cypress', name: '사이프러스 골프 컨트리클럽', nameLocal: '南寶高爾夫鄉村俱樂部',
        subRegion: '타이난', address: '타이난 18홀', addressLocal: '台南市',
        latitude: 22.9897, longitude: 120.2925, lowestPrice: 14000, rating: 4.2, reviewCount: 26,
        remainingTeams: 6, distanceLabel: '타이난 시내에서 차량 20분' },
      { id: 'tw-tn-bluelake', name: '블루레이크 골프장', nameLocal: '藍湖高爾夫俱樂部',
        subRegion: '타이난', address: '타이난 호숫가 9홀', addressLocal: '台南市',
        latitude: 23.0431, longitude: 120.2417, lowestPrice: 10500, rating: 3.9, reviewCount: 15,
        remainingTeams: 8, holes: 9, par: 36, beginnerFriendly: true, distanceLabel: '타이난 시내 10분' },
    ],
  },

  // ── 말레이시아 (my) ─────────────────────────────────────────────
  my: {
    쿠알라룸푸르: [
      { id: 'my-kl-klgcc', name: 'KLGCC (구 KL Golf & Country)', nameLocal: 'TPC Kuala Lumpur',
        subRegion: '쿠알라룸푸르', address: 'KL 시내 36홀 챔피언 코스', addressLocal: '10 Jalan 1/70D, Bukit Kiara, KL',
        latitude: 3.1530, longitude: 101.6356, lowestPrice: 22500, rating: 4.7, reviewCount: 64,
        remainingTeams: 6, tags: ['명문코스', '추천'], distanceLabel: 'KL 시내 차량 20분' },
      { id: 'my-kl-saujana', name: '사우자나 골프 컨트리클럽', nameLocal: 'Saujana Golf & Country Club',
        subRegion: '쿠알라룸푸르', address: '쿠알라룸푸르 36홀 (Palm/Bunga Raya)', addressLocal: 'Saujana Resort, Shah Alam',
        latitude: 3.1083, longitude: 101.5494, lowestPrice: 19500, rating: 4.5, reviewCount: 47,
        remainingTeams: 5, distanceLabel: 'KL 시내 차량 30분' },
    ],
    셀랑고르: [
      { id: 'my-sg-glenmarie', name: '글렌마리 골프&컨트리클럽', nameLocal: 'Glenmarie Golf & Country Club',
        subRegion: '셀랑고르', address: '샤알람 36홀', addressLocal: 'Shah Alam, Selangor',
        latitude: 3.1067, longitude: 101.5400, lowestPrice: 18000, rating: 4.4, reviewCount: 39,
        remainingTeams: 6, distanceLabel: 'KL 시내 차량 25분' },
      { id: 'my-sg-bukitkemuning', name: '부킷 케무닝 골프', nameLocal: 'Bukit Kemuning Golf Country Resort',
        subRegion: '셀랑고르', address: '샤알람 인근 18홀', addressLocal: 'Shah Alam, Selangor',
        latitude: 2.9931, longitude: 101.5408, lowestPrice: 14500, rating: 4.1, reviewCount: 24,
        remainingTeams: 8, beginnerFriendly: true, distanceLabel: 'KL 시내 차량 30분' },
    ],
    페낭: [
      { id: 'my-pn-bukitjawi', name: '부킷 자위 골프 리조트', nameLocal: 'Bukit Jawi Golf Resort',
        subRegion: '페낭', address: '페낭 본토 36홀', addressLocal: 'Sungai Bakap, Penang',
        latitude: 5.2300, longitude: 100.4767, lowestPrice: 14000, rating: 4.3, reviewCount: 31,
        remainingTeams: 7, distanceLabel: '페낭 공항에서 차량 30분' },
      { id: 'my-pn-cintasayang', name: '신타사양 골프 리조트', nameLocal: 'Cinta Sayang Golf Resort',
        subRegion: '페낭', address: '수가이 페타니 18홀', addressLocal: 'Sungai Petani, Kedah',
        latitude: 5.6422, longitude: 100.4842, lowestPrice: 12500, rating: 4.0, reviewCount: 19,
        remainingTeams: 6, distanceLabel: '페낭 공항에서 차량 50분' },
    ],
    랑카위: [
      { id: 'my-lk-elsclub', name: '엘스 클럽 데사루', nameLocal: 'The Els Club Teluk Datai',
        subRegion: '랑카위', address: '랑카위 텔룩다타이 18홀', addressLocal: 'Teluk Datai, Langkawi',
        latitude: 6.4222, longitude: 99.6889, lowestPrice: 26000, rating: 4.6, reviewCount: 42,
        remainingTeams: 5, tags: ['리조트', '오션뷰'], distanceLabel: '랑카위 공항에서 차량 45분' },
      { id: 'my-lk-gunungraya', name: '구눙라야 골프', nameLocal: 'Gunung Raya Golf Resort',
        subRegion: '랑카위', address: '랑카위 산자락 18홀', addressLocal: 'Gunung Raya, Langkawi',
        latitude: 6.3914, longitude: 99.8278, lowestPrice: 17500, rating: 4.3, reviewCount: 28,
        remainingTeams: 6, distanceLabel: '랑카위 공항에서 차량 25분' },
    ],
    코타키나발루: [
      { id: 'my-kk-suteraharbour', name: '수테라 하버 골프&컨트리', nameLocal: 'Sutera Harbour Golf & CC',
        subRegion: '코타키나발루', address: '코타키나발루 27홀', addressLocal: 'Sutera Harbour, KK',
        latitude: 5.9700, longitude: 116.0625, lowestPrice: 21500, rating: 4.5, reviewCount: 53,
        remainingTeams: 6, tags: ['추천'], distanceLabel: 'KK 공항에서 차량 15분' },
      { id: 'my-kk-nexus', name: '넥서스 골프&CC 카람부나이', nameLocal: 'Nexus Golf Resort Karambunai',
        subRegion: '코타키나발루', address: '카람부나이 반도 18홀', addressLocal: 'Karambunai, KK',
        latitude: 6.1325, longitude: 116.1583, lowestPrice: 19000, rating: 4.4, reviewCount: 36,
        remainingTeams: 5, tags: ['오션뷰'], distanceLabel: 'KK 공항에서 차량 40분' },
      { id: 'my-kk-mountkk', name: '키나발루 골프클럽', nameLocal: 'Mount Kinabalu Golf Club',
        subRegion: '코타키나발루', address: '키나발루 산자락 18홀', addressLocal: 'Kundasang, Sabah',
        latitude: 6.0067, longitude: 116.5944, lowestPrice: 14500, rating: 4.2, reviewCount: 21,
        remainingTeams: 7, beginnerFriendly: true, distanceLabel: 'KK에서 차량 90분' },
    ],
  },
};

/**
 * COUNTRY_COURSE_SEEDS 를 GolfCourse[] 로 펼침.
 * - 1차 권역(parentRegion)은 lib/countries.ts 의 subRegions 매핑으로 자동 결정
 * - subRegion 이 어느 1차 권역에도 속하지 않으면 그 시드는 스킵(개발 경고)
 */
export function buildOverseasCourses(): GolfCourse[] {
  const courses: GolfCourse[] = [];
  for (const country of COUNTRIES) {
    const seedMap = COUNTRY_COURSE_SEEDS[country.code];
    if (!seedMap) continue; // 일본 등 별도 데이터 보유 국가
    for (const [subRegion, seeds] of Object.entries(seedMap)) {
      const parent = country.regions.find(r => r.subRegions.includes(subRegion));
      if (!parent) {
        if (typeof console !== 'undefined') {
          console.warn(`[overseasCourses] '${country.code}' 의 subRegion '${subRegion}' 가 countries.ts 권역 정의에 없습니다.`);
        }
        continue;
      }
      for (const seed of seeds) {
        courses.push(makeCourse(country.code, parent.id, seed));
      }
    }
  }
  return courses;
}
