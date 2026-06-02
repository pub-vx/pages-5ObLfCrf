// 해외투어 프로토타입 Mock 데이터
// 환율: 1 JPY ≈ 9.3 KRW (고정 mock)

import { buildOverseasCourses } from './overseasCourses';

export const EXCHANGE_RATE = 9.3;
export const EXCHANGE_RATE_DATE = '2026.04.09';

// ========== 공항 데이터 (지도 마커용) ==========
export interface Airport {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  /** 1차 권역 (지역 필터링용) */
  region: string;
  /** 2차 권역(현·도·부) — 카드/상세 표기용. 1차 권역과 동일하면 UI에서 중복 표기 안 함. */
  prefecture: string;
  tier: 'hub' | 'regional'; // hub: 항상 노출 / regional: 줌인/지역 단일 선택 시 노출
}

export const airports: Airport[] = [
  // ====== 허브 공항 (항상 노출) ======
  { id: 'fukuoka',      name: '후쿠오카 공항',    code: 'FUK', latitude: 33.5859, longitude: 130.4505, region: '규슈',     prefecture: '후쿠오카', tier: 'hub' },
  { id: 'narita',       name: '나리타 공항',      code: 'NRT', latitude: 35.7720, longitude: 140.3929, region: '간토',     prefecture: '치바',     tier: 'hub' },
  { id: 'haneda',       name: '하네다 공항',      code: 'HND', latitude: 35.5494, longitude: 139.7798, region: '간토',     prefecture: '도쿄',     tier: 'hub' },
  { id: 'kansai',       name: '간사이 공항',      code: 'KIX', latitude: 34.4347, longitude: 135.2440, region: '간사이',   prefecture: '오사카',   tier: 'hub' },
  { id: 'chubu',        name: '중부 국제공항',    code: 'NGO', latitude: 34.8584, longitude: 136.8053, region: '주부',     prefecture: '아이치',   tier: 'hub' },
  { id: 'shin-chitose', name: '신치토세 공항',    code: 'CTS', latitude: 42.7752, longitude: 141.6923, region: '홋카이도', prefecture: '홋카이도', tier: 'hub' },
  { id: 'naha',         name: '나하 공항',        code: 'OKA', latitude: 26.1958, longitude: 127.6458, region: '오키나와', prefecture: '오키나와', tier: 'hub' },

  // ====== 지방공항 (줌인 또는 단일 지역 선택 시 노출) ======
  // 규슈
  { id: 'kitakyushu', name: '키타큐슈 공항', code: 'KKJ', latitude: 33.8456, longitude: 131.0350, region: '규슈', prefecture: '후쿠오카',   tier: 'regional' },
  { id: 'kagoshima',  name: '가고시마 공항', code: 'KOJ', latitude: 31.8034, longitude: 130.7196, region: '규슈', prefecture: '가고시마',   tier: 'regional' },
  { id: 'miyazaki',   name: '미야자키 공항', code: 'KMI', latitude: 31.8772, longitude: 131.4486, region: '규슈', prefecture: '미야자키',   tier: 'regional' },
  { id: 'kumamoto',   name: '구마모토 공항', code: 'KMJ', latitude: 32.8373, longitude: 130.8550, region: '규슈', prefecture: '구마모토',   tier: 'regional' },
  { id: 'oita',       name: '오이타 공항',   code: 'OIT', latitude: 33.4794, longitude: 131.7372, region: '규슈', prefecture: '오이타',     tier: 'regional' },
  { id: 'nagasaki',   name: '나가사키 공항', code: 'NGS', latitude: 32.9169, longitude: 129.9136, region: '규슈', prefecture: '나가사키',   tier: 'regional' },
  { id: 'saga',       name: '사가 공항',     code: 'HSG', latitude: 33.1497, longitude: 130.3025, region: '규슈', prefecture: '사가',       tier: 'regional' },
  // 간토
  { id: 'ibaraki',    name: '이바라키 공항', code: 'IBR', latitude: 36.1811, longitude: 140.4147, region: '간토', prefecture: '이바라키',   tier: 'regional' },
  // 주부
  { id: 'shizuoka',   name: '시즈오카 공항', code: 'FSZ', latitude: 34.7961, longitude: 138.1878, region: '주부', prefecture: '시즈오카',   tier: 'regional' },
  { id: 'komatsu',    name: '코마츠 공항',   code: 'KMQ', latitude: 36.3947, longitude: 136.4067, region: '주부', prefecture: '이시카와',   tier: 'regional' },
  { id: 'toyama',     name: '토야마 공항',   code: 'TOY', latitude: 36.6483, longitude: 137.1881, region: '주부', prefecture: '도야마',     tier: 'regional' },
  // 주고쿠
  { id: 'hiroshima',  name: '히로시마 공항', code: 'HIJ', latitude: 34.4361, longitude: 132.9197, region: '주고쿠', prefecture: '히로시마', tier: 'regional' },
  { id: 'okayama',    name: '오카야마 공항', code: 'OKJ', latitude: 34.7569, longitude: 133.8556, region: '주고쿠', prefecture: '오카야마', tier: 'regional' },
  { id: 'yonago',     name: '요나고 공항',   code: 'YGJ', latitude: 35.4922, longitude: 133.2364, region: '주고쿠', prefecture: '돗토리',   tier: 'regional' },
  // 시코쿠
  { id: 'takamatsu',  name: '다카마쓰 공항', code: 'TAK', latitude: 34.2142, longitude: 134.0156, region: '시코쿠', prefecture: '카가와',   tier: 'regional' },
  { id: 'matsuyama',  name: '마쓰야마 공항', code: 'MYJ', latitude: 33.8272, longitude: 132.6997, region: '시코쿠', prefecture: '에히메',   tier: 'regional' },
  // 도호쿠
  { id: 'sendai',     name: '센다이 공항',   code: 'SDJ', latitude: 38.1397, longitude: 140.9170, region: '도호쿠', prefecture: '미야기',   tier: 'regional' },
  { id: 'aomori',     name: '아오모리 공항', code: 'AOJ', latitude: 40.7347, longitude: 140.6906, region: '도호쿠', prefecture: '아오모리', tier: 'regional' },
  { id: 'akita',      name: '아키타 공항',   code: 'AXT', latitude: 39.6156, longitude: 140.2186, region: '도호쿠', prefecture: '아키타',   tier: 'regional' },
  // 홋카이도
  { id: 'hakodate',   name: '하코다테 공항', code: 'HKD', latitude: 41.7700, longitude: 140.8222, region: '홋카이도', prefecture: '홋카이도', tier: 'regional' },
  { id: 'asahikawa',  name: '아사히카와 공항', code: 'AKJ', latitude: 43.6708, longitude: 142.4475, region: '홋카이도', prefecture: '홋카이도', tier: 'regional' },
  // 오키나와
  { id: 'miyako',     name: '미야코 공항',   code: 'MMY', latitude: 24.7828, longitude: 125.2950, region: '오키나와', prefecture: '오키나와', tier: 'regional' },
  { id: 'ishigaki',   name: '이시가키 공항', code: 'ISG', latitude: 24.3964, longitude: 124.2450, region: '오키나와', prefecture: '오키나와', tier: 'regional' },
];

export function getAirportById(id: string): Airport | undefined {
  return airports.find(a => a.id === id);
}

// ========== 거리 계산 (km, Haversine) ==========
export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function jpyToKrw(jpy: number): number {
  return Math.round(jpy * EXCHANGE_RATE / 100) * 100; // 100원 단위 반올림
}

export function formatKrw(krw: number): string {
  return `₩${krw.toLocaleString()}`;
}

export function formatJpy(jpy: number): string {
  return `¥${jpy.toLocaleString()}`;
}


export interface Plan {
  id: string;
  name: string;
  nameLocal?: string;
  badges: string[];
  includes: string[];
  excludes: string[];
  basePrice: number;
  twoPlayerSurcharge: number;
  threePlayerSurcharge: number;
  times: string[];
  minPlayer: number;
  maxPlayer: number;
  courseName: string;
  roundCode: string;
  paymentType: 'prepay' | 'onsite';
  cancellationPolicy: {
    label: string;
    fee: string;
  }[];
}

/** 코스별 유의사항 본문(자동 번역 한국어 + 원문). 미지정 코스는 DEFAULT_COURSE_NOTICE 사용 */
export interface CourseNotice {
  /** 자동 번역(한국어) */
  translated: string;
  /** 원문(현지어) */
  original: string;
}

export interface GolfCourse {
  id: string;
  /** 나라 코드 (countries.ts COUNTRIES[].code 와 동일). 미지정 시 'jp' 로 간주 */
  country?: string;
  name: string;
  nameLocal: string;
  image: string;
  images: string[];
  address: string;
  addressLocal: string;
  lowestPrice: number;
  rating: number;
  reviewCount: number;
  /** 평점·후기 수집 출처 (예: 'Google', 'GolfNavi', '楽天GORA') */
  ratingSource?: string;
  distance: string;
  /**
   * 카드/상세에 노출되는 권역 라벨.
   * - 일본: prefecture(현·도시) 명. ex) '후쿠오카'
   * - 해외: 1차 권역(parentRegion) 명. ex) '북부'
   * 권역 필터링은 `isCourseInCountryRegions` 가 region/address/subRegion 셋 다 보고 매칭한다.
   */
  region: string;
  /**
   * 2차 권역(subRegion / 도시) 명 — 해외 코스용.
   * 노출에는 쓰지 않고 권역 필터링 매칭용. 일본 코스는 region 자체가 prefecture 라 미사용.
   */
  subRegion?: string;
  latitude: number;
  longitude: number;
  remainingTeams: number;
  holes: number;
  par: number;
  plans: Plan[];
  tags?: string[];
  brand?: string;
  foreignerOk: boolean;
  beginnerFriendly: boolean;
  dressCode?: string;
  dressCodeDetail?: string;
  courseDesigner?: string;
  courseGrade?: string;
  koreanSupport?: string;
  etiquette?: {
    dressCode: string[];
    dining: string;
    phrases: { label: string; text: string }[];
  };
  courseGuide?: {
    difficulty: string;
    signatureHole: string;
    description: string;
  };
  // 광고 상품 (투어팀 판촉)
  isAd?: boolean;
  // 외부 광고 (광고주 페이지로 랜딩)
  isExternalAd?: boolean;
  externalUrl?: string;
  // 가장 가까운 공항 ID (지도 마커 + 거리 표시용)
  nearestAirportId?: string;
  // ── 판매자/유의사항 데이터 분기 (미지정 시 기본값으로 폴백) ──
  /** 판매자(공급자) 현지 운영사명 — 미지정 시 brand 기반 기본값 또는 공통값 */
  operator?: string;
  /** 판매자 대표 연락처 — 미지정 시 공통 안내 문구 */
  operatorContact?: string;
  /** 코스별 유의사항(번역/원문) — 미지정 시 DEFAULT_COURSE_NOTICE */
  notice?: CourseNotice;
}

/** 공통(기본) 유의사항 — 코스가 자체 notice 를 지정하지 않으면 이 값을 사용 */
export const DEFAULT_COURSE_NOTICE: CourseNotice = {
  translated: `■ 예약·결제
· 본 상품의 이용요금은 현지(엔화) 결제입니다.
· 예약 확정 후 인원·일시 변경은 취소 후 재예약이 필요합니다.
· 표시 금액 외 세금·시설이용료 등 할증 요금이 발생할 수 있습니다.

■ 복장 규정(드레스코드)
· 칼라가 있는 셔츠를 착용해 주세요.
· 클럽하우스 입장 시 재킷 착용이 필요할 수 있습니다.
· 운동화·청바지는 입장이 제한될 수 있습니다.

■ 캐디·카트
· 캐디 동반 여부는 플랜에 따라 다릅니다.
· 카트피·캐디피는 현장 결제입니다.

■ 취소·환불
· 플레이 7일 전까지 무료 취소가 가능합니다.
· 우천 시에도 골프장 취소 규정이 적용되니 여행자 보험 가입을 권장합니다.`,
  original: `■ ご予約・お支払いについて
・本商品の利用料金は現地(円)でのお支払いです。
・予約確定後の人数・日時変更は、キャンセル後の再予約が必要です。
・表示金額のほか、税金・施設利用料などの追加料金が発生する場合があります。

■ ドレスコードについて
・襟付きのシャツを着用してください。
・クラブハウス入場時はジャケットの着用が必要な場合があります。
・スニーカー・ジーンズでの入場はお断りする場合があります。

■ キャディ・カートについて
・キャディ同伴の有無はプランにより異なります。
・カート代・キャディ代は現地でのお支払いです。

■ キャンセル・返金について
・プレー7日前まで無料キャンセルが可能です。
・雨天時もゴルフ場のキャンセル規定が適用されますので、旅行保険のご加入をおすすめします。`,
};

/** 코스의 유의사항을 해석(자체 notice → 없으면 공통 기본값) */
export function getCourseNotice(course?: Pick<GolfCourse, 'notice'>): CourseNotice {
  return course?.notice ?? DEFAULT_COURSE_NOTICE;
}

/** 브랜드 → 현지 운영사 기본 매핑 (코스가 operator 를 직접 지정하면 그 값이 우선) */
const BRAND_OPERATOR: Record<string, string> = {
  PGM: 'PGM (퍼시픽 골프 매니지먼트)',
  'Grand PGM': '그랜드 PGM',
  Accordia: '아코디아 골프 (Accordia Golf)',
};

/** 코스의 판매자(공급자) 정보를 해석. operator/contact 미지정 시 brand 기반·공통값으로 폴백 */
export function getCourseSeller(course: GolfCourse): { operator: string; contact: string } {
  const operator =
    course.operator ?? (course.brand ? BRAND_OPERATOR[course.brand] : undefined) ?? '현지 운영사';
  const contact = course.operatorContact ?? '제휴사 페이지 내 안내';
  return { operator, contact };
}

export interface Reservation {
  id: string;
  reservationCode: string;
  courseId: string;
  planId: string;
  playDate: string;
  teeTime: string;
  totalPlayer: number;
  name: string;
  nameEn: string;
  email: string;
  phone: string;
  players: { name: string; nameEn: string }[];
  status: 'PENDING' | 'ACTIVE' | 'CANCELLED' | 'FAILED';
  paidAmount: number;
  paidAmountKrw: number;
  currency: string;
  createdAt: string;
  /** 취소된 예약의 취소 처리 일시 (ISO) — CANCELLED 상태에서만 유효 */
  cancelledAt?: string;
}

// ========== 시나리오별 골프장 데이터 ==========

const courseImages = [
  'https://images.unsplash.com/photo-1737546240242-60d036c4fdfe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMGdvbGYlMjBjb3Vyc2UlMjBhZXJpYWx8ZW58MXx8fHwxNzczODgwNjAzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1714538247922-280698e0e20c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbiUyMGdvbGYlMjByZXNvcnQlMjBtb3VudGFpbnxlbnwxfHx8fDE3NzM4ODA2MDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1766288020088-4b95f5409376?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBnb2xmJTIwY291cnNlJTIwb2NlYW58ZW58MXx8fHwxNzczODgwNjA1fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1768396747921-5a18367415d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xmJTIwY291cnNlJTIwbGFuZHNjYXBlJTIwZ3JlZW58ZW58MXx8fHwxNzczODgwNjA1fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1762952078331-a680492cffe3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xmJTIwY2x1YiUyMGZhY2lsaXR5fGVufDF8fHx8MTc3Mzg4MDYwNXww&ixlib=rb-4.1.0&q=80&w=1080',
];

export const mockCourses: GolfCourse[] = [
  // 시나리오 1: 코가 골프클럽 (후쿠오카, 1인 가성비)
  {
    id: 'koga',
    nearestAirportId: 'fukuoka',
    name: '코가 골프클럽',
    nameLocal: '古賀ゴルフ·クラブ',
    image: courseImages[0],
    images: [courseImages[0], courseImages[1], courseImages[2], courseImages[3], courseImages[4]],
    address: '후쿠오카현 코가시',
    addressLocal: '福岡県古賀市',
    operator: '코가 골프클럽 운영사무국',
    operatorContact: '+81-92-944-0000',
    lowestPrice: 8900,
    rating: 4.2,
    reviewCount: 32,
    ratingSource: "GolfNavi",
    distance: '후쿠오카공항에서 30분',
    region: '후쿠오카',
    latitude: 33.7294,
    longitude: 130.4764,
    remainingTeams: 3,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: false,
    dressCode: '카라 있는 상의, 긴바지 권장',
    tags: ['추천'],
    etiquette: {
      dressCode: ['클럽하우스: 카라 있는 상의 + 긴바지', '코스: 카라 있는 상의, 반바지 OK'],
      dining: '하프라운드(9홀) 후 클럽하우스에서 조식/중식',
      phrases: [
        { label: '체크인', text: 'よやくの〇〇です (예약한 〇〇입니다)' },
        { label: '감사', text: 'ありがとうございます' },
        { label: '화장실', text: 'トイレはどこですか' },
      ],
    },
    courseGuide: {
      difficulty: '중급',
      signatureHole: '7번 홀 (Par 3, 180yd) — 호수를 가로지르는 아일랜드 그린',
      description: '평탄한 지형의 전통 일본식 코스. 그린이 작고 빠르며, 정확한 아이언 샷이 중요합니다.',
    },
    plans: [
      {
        id: 'koga-p1',
        name: '조식 + 18홀 + 카트 플랜',
        nameLocal: '朝食付+カート付 18H',
        badges: ['식사포함', '카트포함', '18홀'],
        includes: ['조식', '카트비', '세금', '시설이용료'],
        excludes: ['캐디(셀프)', '락커비(¥330)'],
        basePrice: 8900,
        twoPlayerSurcharge: 2000,
        threePlayerSurcharge: 1500,
        times: ['07:30', '08:00', '08:30', '09:15'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'ウエストコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '그린피의 30% 위약금' },
          { label: '2일 전~당일', fee: '그린피의 100% 위약금' },
          { label: '노쇼', fee: '그린피의 100% 위약금' },
        ],
      },
      {
        id: 'koga-p2',
        name: '오후 트와일라잇 플랜',
        nameLocal: '午後トワイライトプラン',
        badges: ['카트포함', '18홀'],
        includes: ['카트비', '세금'],
        excludes: ['식사', '캐디(셀프)', '락커비(¥330)'],
        basePrice: 6800,
        twoPlayerSurcharge: 1500,
        threePlayerSurcharge: 1000,
        times: ['13:00', '13:30', '14:00'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'ウエストコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '그린피의 30% 위약금' },
          { label: '2일 전~당일', fee: '그린피의 100% 위약금' },
          { label: '노쇼', fee: '그린피의 100% 위약금' },
        ],
      },
    ],
  },

  // 시나리오 2: 카스미가세키 컨트리클럽 (도쿄 근교, 명문 4인)
  {
    id: 'kasumigaseki',
    nearestAirportId: 'narita',
    name: '카스미가세키 컨트리클럽',
    nameLocal: '霞ヶ関カンツリー倶楽部',
    image: courseImages[1],
    images: [courseImages[1], courseImages[0], courseImages[3], courseImages[4], courseImages[2]],
    address: '사이타마현 가와고에시',
    addressLocal: '埼玉県川越市',
    operatorContact: '+81-49-231-0000',
    notice: {
      translated: `■ 예약·결제
· 본 상품의 이용요금은 현지(엔화) 결제입니다.
· 예약 확정 후 인원·일시 변경은 취소 후 재예약이 필요합니다.
· 표시 금액 외 세금·시설이용료 등 할증 요금이 발생할 수 있습니다.

■ 복장 규정(드레스코드) — 본 코스는 규정이 엄격합니다
· 클럽하우스 입장 시 재킷 착용이 필수입니다(여름철 제외).
· 코스에서는 카라 있는 상의와 긴바지가 필수입니다.
· 모자는 클럽하우스 내에서 착용할 수 없습니다.

■ 캐디·카트
· 전 플랜 캐디 동반이 원칙입니다.
· 카트피·캐디피는 현장 결제입니다.

■ 취소·환불
· 플레이 14일 전까지 무료 취소가 가능합니다.
· 이후 취소 시 위약금이 발생하며, 우천 시에도 골프장 취소 규정이 적용됩니다.`,
      original: `■ ご予約・お支払いについて
・本商品の利用料金は現地(円)でのお支払いです。
・予約確定後の人数・日時変更は、キャンセル後の再予約が必要です。
・表示金額のほか、税金・施設利用料などの追加料金が発生する場合があります。

■ ドレスコードについて — 当コースは規定が厳格です
・クラブハウス入場時はジャケットの着用が必須です(夏季を除く)。
・コースでは襟付きシャツと長ズボンが必須です。
・帽子はクラブハウス内では着用できません。

■ キャディ・カートについて
・全プランキャディ同伴が原則です。
・カート代・キャディ代は現地でのお支払いです。

■ キャンセル・返金について
・プレー14日前まで無料キャンセルが可能です。
・以降のキャンセルは違約金が発生し、雨天時もゴルフ場の規定が適用されます。`,
    },
    lowestPrice: 21000,
    rating: 4.8,
    reviewCount: 18,
    ratingSource: "GolfNavi",
    distance: '도쿄역에서 차량 60분',
    region: '사이타마',
    latitude: 35.8619,
    longitude: 139.4858,
    remainingTeams: 1,
    holes: 36,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: false,
    dressCode: '재킷 필수(클럽하우스), 긴바지·카라셔츠(코스)',
    dressCodeDetail: '드레스코드 필수',
    courseDesigner: '톰 파지오',
    courseGrade: 'Championship Course',
    koreanSupport: '△ (프론트 영어 가능)',
    tags: ['추천'],
    brand: 'Grand PGM',
    etiquette: {
      dressCode: ['클럽하우스: 재킷 필수 (여름 제외)', '코스: 카라 있는 상의 + 긴바지 필수', '모자는 클럽하우스 내 착용 금지'],
      dining: '하프라운드 후 코스 레스토랑에서 정식 중식',
      phrases: [
        { label: '체크인', text: 'よやくの〇〇です' },
        { label: '캐디에게', text: 'お願いします (부탁합니다)' },
        { label: '감사', text: 'ありがとうございます' },
      ],
    },
    courseGuide: {
      difficulty: '상급',
      signatureHole: '10번 홀 (Par 4, 440yd) — 2021 도쿄 올림픽 개최 코스의 시그니처',
      description: '2021 도쿄 올림픽 골프 경기장. 톰 파지오 설계의 East Course는 전략적 벙커와 빠른 그린으로 유명합니다.',
    },
    plans: [
      {
        id: 'kasu-p1',
        name: '조식 + 캐디 + 카트 + 18홀 플랜',
        nameLocal: '朝食付+キャディ付+カート付 18H',
        badges: ['식사포함', '캐디포함', '카트포함', '18홀'],
        includes: ['조식', '캐디비', '카트비', '세금', '시설이용료'],
        excludes: ['석식', '락커비(¥550)'],
        basePrice: 21000,
        twoPlayerSurcharge: 5000,
        threePlayerSurcharge: 3000,
        times: ['07:00', '07:30', '08:00'],
        minPlayer: 2,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: '西コース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '10일 전까지', fee: '전액 환불' },
          { label: '7~9일 전', fee: '그린피의 20% 위약금' },
          { label: '3~6일 전', fee: '그린피의 50% 위약금' },
          { label: '2일 전~당일', fee: '그린피의 100% 위약금' },
          { label: '노쇼', fee: '그린피의 100% 위약금' },
        ],
      },
      {
        id: 'kasu-p2',
        name: '프리미엄 점심 포함 플랜',
        nameLocal: 'プレミアムランチ付プラン',
        badges: ['식사포함', '캐디포함', '카트포함', '18홀', '프리미엄'],
        includes: ['중식(코스 요리)', '캐디비', '카트비', '세금', '시설이용료', '온천 이용'],
        excludes: ['석식'],
        basePrice: 28000,
        twoPlayerSurcharge: 6000,
        threePlayerSurcharge: 4000,
        times: ['08:00', '08:30'],
        minPlayer: 2,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: '西コース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '10일 전까지', fee: '전액 환불' },
          { label: '7~9일 전', fee: '그린피의 20% 위약금' },
          { label: '3~6일 전', fee: '그린피의 50% 위약금' },
          { label: '2일 전~당일', fee: '그린피의 100% 위약금' },
          { label: '노쇼', fee: '그린피의 100% 위약금' },
        ],
      },
    ],
  },

  // 시나리오 3: 후쿠오카 센추리 골프클럽 (초보자 친화)
  {
    id: 'century',
    nearestAirportId: 'fukuoka',
    name: '후쿠오카 센추리 골프클럽',
    nameLocal: '福岡センチュリーゴルフクラブ',
    image: courseImages[3],
    images: [courseImages[3], courseImages[2], courseImages[0], courseImages[4], courseImages[1]],
    address: '후쿠오카현 이토시마시',
    addressLocal: '福岡県糸島市',
    lowestPrice: 7300,
    rating: 4.0,
    reviewCount: 45,
    ratingSource: "GolfNavi",
    distance: '후쿠오카공항에서 40분',
    region: '후쿠오카',
    latitude: 33.5578,
    longitude: 130.1972,
    remainingTeams: 8,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: true,
    dressCode: '카라 있는 상의, 반바지 OK',
    tags: ['초보자 추천'],
    etiquette: {
      dressCode: ['클럽하우스: 카라 있는 상의 + 긴바지', '코스: 카라 있는 상의 + 반바지 OK'],
      dining: '하프라운드(9홀) 후 클럽하우스에서 중식 (플랜 포함)',
      phrases: [
        { label: '체크인', text: 'よやくの〇〇です (예약한 〇〇입니다)' },
        { label: '감사', text: 'ありがとうございます' },
        { label: '죄송합니다', text: 'すみません' },
        { label: '화장실', text: 'トイレはどこですか' },
      ],
    },
    courseGuide: {
      difficulty: '초~중급',
      signatureHole: '15번 홀 (Par 5, 520yd) — 바다가 보이는 다운힐 롱홀',
      description: '평탄하고 넓은 페어웨이로 초보자도 편안하게 라운드 가능. 여성 전용 티가 잘 배치되어 있습니다.',
    },
    plans: [
      {
        id: 'cent-p1',
        name: '중식 + 카트 + 18홀 플랜',
        nameLocal: 'ランチ付+カート付 18H',
        badges: ['식사포함', '카트포함', '18홀', '초보자 추천'],
        includes: ['중식', '카트비', '세금', '시설이용료'],
        excludes: ['캐디(셀프)', '락커비(¥220)'],
        basePrice: 7300,
        twoPlayerSurcharge: 1800,
        threePlayerSurcharge: 1200,
        times: ['08:30', '09:00', '09:30', '10:00'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: '駿河コース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '그린피의 30% 위약금' },
          { label: '2일 전~당일', fee: '그린피의 100% 위약금' },
          { label: '노쇼', fee: '그린피의 100% 위약금' },
        ],
      },
      {
        id: 'cent-p2',
        name: '조식 + 중식 + 카트 풀패키지',
        nameLocal: '朝食+ランチ+カート付 フルパッケージ',
        badges: ['식사포함', '카트포함', '18홀', '풀패키지'],
        includes: ['조식', '중식', '카트비', '세금', '시설이용료'],
        excludes: ['캐디(셀프)'],
        basePrice: 9800,
        twoPlayerSurcharge: 2200,
        threePlayerSurcharge: 1500,
        times: ['07:00', '07:30', '08:00'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: '駿河コース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '그린피의 30% 위약금' },
          { label: '2일 전~당일', fee: '그린피의 100% 위약금' },
          { label: '노쇼', fee: '그린피의 100% 위약금' },
        ],
      },
    ],
  },

  // ========== 광고 상품 (투어팀 판촉) ==========
  {
    id: 'osaka-tower',
    nearestAirportId: 'kansai',
    name: '오사카 타워 골프장',
    nameLocal: '大阪タワーゴルフクラブ',
    image: courseImages[2],
    images: [courseImages[2], courseImages[1], courseImages[3]],
    address: '오사카부 사카이시',
    addressLocal: '大阪府堺市',
    lowestPrice: 8500,
    rating: 4.4,
    reviewCount: 21,
    ratingSource: "GolfNavi",
    distance: '간사이 공항에서 45km',
    region: '오사카',
    latitude: 34.5732,
    longitude: 135.4830,
    remainingTeams: 8,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: false,
    brand: 'Accordia',
    tags: ['추천'],
    isAd: true,
    plans: [
      {
        id: 'ot-p1',
        name: '[조식포함] 주말 프리미엄 플랜',
        badges: ['식사포함', '카트포함', '18홀'],
        includes: ['조식', '카트비', '세금', '시설이용료'],
        excludes: ['캐디(셀프)'],
        basePrice: 8500,
        twoPlayerSurcharge: 2000,
        threePlayerSurcharge: 1500,
        times: ['07:00', '07:30', '08:00'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'レイクコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '그린피의 30% 위약금' },
          { label: '2일 전~당일', fee: '그린피의 100% 위약금' },
        ],
      },
      {
        id: 'ot-p2',
        name: '[중식포함] 평일 알찬 플랜',
        badges: ['식사포함', '카트포함', '18홀'],
        includes: ['중식', '카트비', '세금'],
        excludes: ['캐디(셀프)'],
        basePrice: 7800,
        twoPlayerSurcharge: 1800,
        threePlayerSurcharge: 1200,
        times: ['09:00', '09:30', '10:00'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'レイクコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '그린피의 30% 위약금' },
          { label: '2일 전~당일', fee: '그린피의 100% 위약금' },
        ],
      },
    ],
  },

  // ========== 외부 광고 (광고주 페이지로 랜딩) ==========
  {
    id: 'hokkaido-ski',
    nearestAirportId: 'shin-chitose',
    name: '[홋카이도 3박4일] 스키&골프 올인원 패키지',
    nameLocal: '北海道スキー&ゴルフオールインワンパッケージ',
    image: courseImages[1],
    images: [courseImages[1], courseImages[3]],
    address: '홋카이도 삿포로시',
    addressLocal: '北海道札幌市',
    lowestPrice: 9000,
    rating: 4.6,
    reviewCount: 14,
    ratingSource: "GolfNavi",
    distance: '신치토세 공항에서 60km',
    region: '홋카이도',
    latitude: 43.0618,
    longitude: 141.3545,
    remainingTeams: 0,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: false,
    isAd: true,
    isExternalAd: true,
    externalUrl: 'https://example.com/hokkaido-ski-resort',
    plans: [],
  },

  // 추가 골프장 (리스트 볼륨용)
  {
    id: 'tokyo-bay',
    nearestAirportId: 'narita',
    name: '도쿄 베이 골프클럽',
    nameLocal: '東京ベイゴルフクラブ',
    image: courseImages[0],
    images: [courseImages[0], courseImages[2], courseImages[4]],
    address: '치바현 이치하라시',
    addressLocal: '千葉県市原市',
    lowestPrice: 12800,
    rating: 4.5,
    reviewCount: 28,
    ratingSource: "GolfNavi",
    distance: '나리타공항에서 32km',
    region: '치바',
    latitude: 35.4976,
    longitude: 140.1161,
    remainingTeams: 5,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: false,
    brand: 'PGM',
    tags: ['추천'],
    isAd: true,
    plans: [
      {
        id: 'tb-p1',
        name: '조식포함 주말 프리미엄 플랜',
        badges: ['식사포함', '카트포함', '18홀'],
        includes: ['조식', '카트비', '세금'],
        excludes: ['캐디(셀프)'],
        basePrice: 15800,
        twoPlayerSurcharge: 3000,
        threePlayerSurcharge: 2000,
        times: ['06:30', '07:00', '07:30'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'シーサイドコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '그린피의 30% 위약금' },
          { label: '2일 전~당일', fee: '그린피의 100% 위약금' },
        ],
      },
      {
        id: 'tb-p2',
        name: '얼리버드 셀프 라운드',
        badges: ['카트포함', '18홀'],
        includes: ['카트비', '세금'],
        excludes: ['식사', '캐디(셀프)'],
        basePrice: 12800,
        twoPlayerSurcharge: 2500,
        threePlayerSurcharge: 1500,
        times: ['05:30', '06:00'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'シーサイドコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '그린피의 30% 위약금' },
          { label: '2일 전~당일', fee: '그린피의 100% 위약금' },
        ],
      },
      {
        id: 'tb-p3',
        name: '점심포함 데이타임 플랜',
        badges: ['식사포함', '카트포함', '18홀'],
        includes: ['중식', '카트비', '세금'],
        excludes: ['캐디(셀프)'],
        basePrice: 16800,
        twoPlayerSurcharge: 3000,
        threePlayerSurcharge: 2000,
        times: ['10:00', '10:30', '11:00', '11:30'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'シーサイドコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '그린피의 30% 위약금' },
          { label: '2일 전~당일', fee: '그린피의 100% 위약금' },
        ],
      },
      {
        id: 'tb-p4',
        name: '주중 특가 풀라운드',
        badges: ['카트포함', '18홀'],
        includes: ['카트비', '세금'],
        excludes: ['식사', '캐디(셀프)'],
        basePrice: 11800,
        twoPlayerSurcharge: 2500,
        threePlayerSurcharge: 1500,
        times: ['08:00', '08:30', '09:00'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'シーサイドコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '그린피의 30% 위약금' },
          { label: '2일 전~당일', fee: '그린피의 100% 위약금' },
        ],
      },
      {
        id: 'tb-p5',
        name: '석식포함 트와일라잇 9홀',
        badges: ['식사포함', '카트포함', '9홀'],
        includes: ['석식', '카트비', '세금'],
        excludes: ['캐디(셀프)'],
        basePrice: 9800,
        twoPlayerSurcharge: 2000,
        threePlayerSurcharge: 1200,
        times: ['15:00', '15:30'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '9H',
        courseName: 'シーサイドコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '그린피의 30% 위약금' },
          { label: '2일 전~당일', fee: '그린피의 100% 위약금' },
        ],
      },
    ],
  },
  {
    id: 'fuji-cc',
    nearestAirportId: 'haneda',
    name: '후지산 컨트리클럽',
    nameLocal: '富士山カントリークラブ',
    image: courseImages[1],
    images: [courseImages[1], courseImages[3], courseImages[0]],
    address: '시즈오카현 고텐바시',
    addressLocal: '静岡県御殿場市',
    lowestPrice: 18500,
    rating: 4.8,
    reviewCount: 55,
    ratingSource: "GolfNavi",
    distance: '하네다공항에서 85km',
    region: '시즈오카',
    latitude: 35.3087,
    longitude: 138.9347,
    remainingTeams: 2,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: false,
    brand: 'Grand PGM',
    tags: ['특가'],
    plans: [
      {
        id: 'fuji-p1',
        name: '중식포함 후지뷰 플랜',
        badges: ['식사포함', '카트포함', '18홀'],
        includes: ['중식', '카트비', '세금'],
        excludes: ['캐디(셀프)'],
        basePrice: 22000,
        twoPlayerSurcharge: 4000,
        threePlayerSurcharge: 2500,
        times: ['07:00', '07:30', '08:00', '08:30'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'アウトコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '그린피의 30% 위약금' },
          { label: '2일 전~당일', fee: '그린피의 100% 위약금' },
        ],
      },
      {
        id: 'fuji-p2',
        name: '얼리버드 셀프 라운드',
        badges: ['카트포함', '18홀'],
        includes: ['카트비', '세금'],
        excludes: ['식사', '캐디(셀프)'],
        basePrice: 18500,
        twoPlayerSurcharge: 3500,
        threePlayerSurcharge: 2000,
        times: ['05:30', '06:00'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'アウトコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '그린피의 30% 위약금' },
          { label: '2일 전~당일', fee: '그린피의 100% 위약금' },
        ],
      },
      {
        id: 'fuji-p3',
        name: '주중 후지뷰 풀라운드',
        badges: ['식사포함', '카트포함', '18홀'],
        includes: ['중식', '카트비', '세금'],
        excludes: ['캐디(셀프)'],
        basePrice: 19800,
        twoPlayerSurcharge: 3500,
        threePlayerSurcharge: 2000,
        times: ['09:00', '09:30', '10:00'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'アウトコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '그린피의 30% 위약금' },
          { label: '2일 전~당일', fee: '그린피의 100% 위약금' },
        ],
      },
      {
        id: 'fuji-p4',
        name: '트와일라잇 9홀 셀프',
        badges: ['카트포함', '9홀'],
        includes: ['카트비', '세금'],
        excludes: ['식사', '캐디(셀프)'],
        basePrice: 12000,
        twoPlayerSurcharge: 2000,
        threePlayerSurcharge: 1200,
        times: ['14:30', '15:00'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '9H',
        courseName: 'アウトコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '그린피의 30% 위약금' },
          { label: '2일 전~당일', fee: '그린피의 100% 위약금' },
        ],
      },
    ],
  },
  // ========== 볼륨용 추가 골프장 (지역/공항 분포) ==========

  // 규슈 (fukuoka)
  {
    id: 'hakata-hills',
    nearestAirportId: 'fukuoka',
    name: '하카타 힐스 컨트리클럽',
    nameLocal: '博多ヒルズカントリークラブ',
    image: courseImages[2],
    images: [courseImages[2], courseImages[0]],
    address: '후쿠오카현 후쿠오카시',
    addressLocal: '福岡県福岡市',
    lowestPrice: 9600,
    rating: 4.1,
    reviewCount: 19,
    ratingSource: "GolfNavi",
    distance: '후쿠오카공항에서 25km',
    region: '후쿠오카',
    latitude: 33.6123,
    longitude: 130.6789,
    remainingTeams: 6,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: true,
    plans: [
      {
        id: 'hh-p1',
        name: '평일 셀프 플랜',
        badges: ['카트포함', '18홀'],
        includes: ['카트비', '세금'],
        excludes: ['식사', '캐디'],
        basePrice: 9600,
        twoPlayerSurcharge: 1500,
        threePlayerSurcharge: 1000,
        times: ['07:30', '08:00', '09:00'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'ヒルズコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '30% 위약금' },
          { label: '2일 전~당일', fee: '100% 위약금' },
        ],
      },
    ],
  },
  {
    id: 'kumamoto-green',
    nearestAirportId: 'fukuoka',
    name: '쿠마모토 그린 힐 골프장',
    nameLocal: '熊本グリーンヒルゴルフ場',
    image: courseImages[3],
    images: [courseImages[3], courseImages[1]],
    address: '쿠마모토현 쿠마모토시',
    addressLocal: '熊本県熊本市',
    lowestPrice: 7800,
    rating: 4.0,
    reviewCount: 24,
    ratingSource: "GolfNavi",
    distance: '후쿠오카공항에서 95km',
    region: '후쿠오카',
    latitude: 32.8032,
    longitude: 130.7079,
    remainingTeams: 10,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: true,
    tags: ['초보자 추천'],
    plans: [
      {
        id: 'km-p1',
        name: '중식포함 여유 라운드',
        badges: ['식사포함', '카트포함', '18홀'],
        includes: ['중식', '카트비', '세금'],
        excludes: ['캐디'],
        basePrice: 7800,
        twoPlayerSurcharge: 1600,
        threePlayerSurcharge: 1100,
        times: ['08:00', '08:30', '09:00', '10:00'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'グリーンコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '30% 위약금' },
          { label: '2일 전~당일', fee: '100% 위약금' },
        ],
      },
    ],
  },

  // 간토 (narita / haneda)
  {
    id: 'chiba-seaside',
    nearestAirportId: 'narita',
    name: '치바 시사이드 골프리조트',
    nameLocal: '千葉シーサイドゴルフリゾート',
    image: courseImages[4],
    images: [courseImages[4], courseImages[2]],
    address: '치바현 치바시',
    addressLocal: '千葉県千葉市',
    lowestPrice: 11200,
    rating: 4.3,
    reviewCount: 41,
    ratingSource: "GolfNavi",
    distance: '나리타공항에서 55km',
    region: '치바',
    latitude: 35.5931,
    longitude: 140.2519,
    remainingTeams: 4,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: false,
    plans: [
      {
        id: 'cs-p1',
        name: '조식포함 얼리버드',
        badges: ['식사포함', '카트포함', '18홀'],
        includes: ['조식', '카트비', '세금'],
        excludes: ['캐디'],
        basePrice: 11200,
        twoPlayerSurcharge: 2200,
        threePlayerSurcharge: 1600,
        times: ['06:30', '07:00', '07:30'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'シーサイドコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '30% 위약금' },
          { label: '2일 전~당일', fee: '100% 위약금' },
        ],
      },
    ],
  },
  {
    id: 'yokohama-royal',
    nearestAirportId: 'haneda',
    name: '요코하마 로열 컨트리클럽',
    nameLocal: '横浜ロイヤルカントリークラブ',
    image: courseImages[0],
    images: [courseImages[0], courseImages[3]],
    address: '가나가와현 요코하마시',
    addressLocal: '神奈川県横浜市',
    lowestPrice: 16500,
    rating: 4.6,
    reviewCount: 62,
    ratingSource: "GolfNavi",
    distance: '하네다공항에서 35km',
    region: '가나가와',
    latitude: 35.3606,
    longitude: 139.5497,
    remainingTeams: 3,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: false,
    brand: 'PGM',
    tags: ['추천'],
    plans: [
      {
        id: 'yr-p1',
        name: '캐디포함 프리미엄',
        badges: ['식사포함', '캐디포함', '카트포함', '18홀'],
        includes: ['중식', '캐디비', '카트비', '세금'],
        excludes: ['락커비'],
        basePrice: 16500,
        twoPlayerSurcharge: 3500,
        threePlayerSurcharge: 2200,
        times: ['07:30', '08:00', '08:30'],
        minPlayer: 2,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'ロイヤルコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '10일 전까지', fee: '전액 환불' },
          { label: '7~9일 전', fee: '20% 위약금' },
          { label: '3~6일 전', fee: '50% 위약금' },
          { label: '2일 전~당일', fee: '100% 위약금' },
        ],
      },
    ],
  },
  {
    id: 'ibaraki-park',
    nearestAirportId: 'narita',
    name: '이바라키 파크 골프클럽',
    nameLocal: '茨城パークゴルフクラブ',
    image: courseImages[1],
    images: [courseImages[1], courseImages[4]],
    address: '이바라키현 츠쿠바시',
    addressLocal: '茨城県つくば市',
    lowestPrice: 8800,
    rating: 4.2,
    reviewCount: 29,
    ratingSource: "GolfNavi",
    distance: '나리타공항에서 78km',
    region: '이바라키',
    latitude: 36.0834,
    longitude: 140.0767,
    remainingTeams: 9,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: true,
    plans: [
      {
        id: 'ib-p1',
        name: '평일 얼리버드 플랜',
        badges: ['카트포함', '18홀'],
        includes: ['카트비', '세금'],
        excludes: ['식사', '캐디'],
        basePrice: 8800,
        twoPlayerSurcharge: 1700,
        threePlayerSurcharge: 1200,
        times: ['06:30', '07:00', '07:30', '08:00'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'パークコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '30% 위약금' },
          { label: '2일 전~당일', fee: '100% 위약금' },
        ],
      },
    ],
  },

  // 간사이 (kansai)
  {
    id: 'kobe-bay',
    nearestAirportId: 'kansai',
    name: '고베 베이 힐 컨트리클럽',
    nameLocal: '神戸ベイヒルカントリークラブ',
    image: courseImages[2],
    images: [courseImages[2], courseImages[0]],
    address: '효고현 고베시',
    addressLocal: '兵庫県神戸市',
    lowestPrice: 13200,
    rating: 4.5,
    reviewCount: 37,
    ratingSource: "GolfNavi",
    distance: '간사이공항에서 60km',
    region: '효고',
    latitude: 34.6901,
    longitude: 135.1956,
    remainingTeams: 5,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: false,
    tags: ['추천'],
    plans: [
      {
        id: 'kb-p1',
        name: '베이뷰 프리미엄',
        badges: ['식사포함', '카트포함', '18홀'],
        includes: ['중식', '카트비', '세금'],
        excludes: ['캐디'],
        basePrice: 13200,
        twoPlayerSurcharge: 2800,
        threePlayerSurcharge: 1800,
        times: ['07:00', '07:30', '08:00'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'ベイコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '30% 위약금' },
          { label: '2일 전~당일', fee: '100% 위약금' },
        ],
      },
    ],
  },
  {
    id: 'kyoto-green',
    nearestAirportId: 'kansai',
    name: '교토 그린베어 골프장',
    nameLocal: '京都グリーンベアゴルフ場',
    image: courseImages[3],
    images: [courseImages[3], courseImages[1]],
    address: '교토부 가메오카시',
    addressLocal: '京都府亀岡市',
    lowestPrice: 10800,
    rating: 4.4,
    reviewCount: 31,
    ratingSource: "GolfNavi",
    distance: '간사이공항에서 90km',
    region: '교토',
    latitude: 35.0112,
    longitude: 135.5734,
    remainingTeams: 7,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: true,
    tags: ['초보자 추천'],
    plans: [
      {
        id: 'kg-p1',
        name: '중식포함 여유 플랜',
        badges: ['식사포함', '카트포함', '18홀'],
        includes: ['중식', '카트비', '세금'],
        excludes: ['캐디'],
        basePrice: 10800,
        twoPlayerSurcharge: 2200,
        threePlayerSurcharge: 1500,
        times: ['08:00', '08:30', '09:00'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'グリーンコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '30% 위약금' },
          { label: '2일 전~당일', fee: '100% 위약금' },
        ],
      },
    ],
  },

  // 주부 (chubu / 아이치·시즈오카)
  {
    id: 'nagoya-central',
    nearestAirportId: 'chubu',
    name: '나고야 센트럴 골프클럽',
    nameLocal: '名古屋セントラルゴルフクラブ',
    image: courseImages[4],
    images: [courseImages[4], courseImages[2]],
    address: '아이치현 세토시',
    addressLocal: '愛知県瀬戸市',
    lowestPrice: 9900,
    rating: 4.3,
    reviewCount: 26,
    ratingSource: "GolfNavi",
    distance: '중부국제공항에서 45km',
    region: '아이치',
    latitude: 35.2236,
    longitude: 137.0842,
    remainingTeams: 6,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: false,
    plans: [
      {
        id: 'nc-p1',
        name: '조식포함 주중 플랜',
        badges: ['식사포함', '카트포함', '18홀'],
        includes: ['조식', '카트비', '세금'],
        excludes: ['캐디'],
        basePrice: 9900,
        twoPlayerSurcharge: 2000,
        threePlayerSurcharge: 1400,
        times: ['07:00', '07:30', '08:00'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'セントラルコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '30% 위약금' },
          { label: '2일 전~당일', fee: '100% 위약금' },
        ],
      },
    ],
  },
  {
    id: 'gifu-mountain',
    nearestAirportId: 'chubu',
    name: '기후 마운틴 리조트',
    nameLocal: '岐阜マウンテンリゾート',
    image: courseImages[1],
    images: [courseImages[1], courseImages[3]],
    address: '기후현 타카야마시',
    addressLocal: '岐阜県高山市',
    lowestPrice: 8400,
    rating: 4.1,
    reviewCount: 17,
    ratingSource: "GolfNavi",
    distance: '중부국제공항에서 98km',
    region: '기후',
    latitude: 35.5512,
    longitude: 137.2586,
    remainingTeams: 11,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: true,
    plans: [
      {
        id: 'gm-p1',
        name: '산악뷰 풀패키지',
        badges: ['식사포함', '카트포함', '18홀'],
        includes: ['중식', '카트비', '세금'],
        excludes: ['캐디'],
        basePrice: 8400,
        twoPlayerSurcharge: 1700,
        threePlayerSurcharge: 1200,
        times: ['07:30', '08:00', '09:00'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'マウンテンコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '30% 위약금' },
          { label: '2일 전~당일', fee: '100% 위약금' },
        ],
      },
    ],
  },

  // 홋카이도 (shin-chitose)
  {
    id: 'sapporo-forest',
    nearestAirportId: 'shin-chitose',
    name: '삿포로 포레스트 골프클럽',
    nameLocal: '札幌フォレストゴルフクラブ',
    image: courseImages[2],
    images: [courseImages[2], courseImages[4]],
    address: '홋카이도 삿포로시',
    addressLocal: '北海道札幌市',
    lowestPrice: 8200,
    rating: 4.4,
    reviewCount: 22,
    ratingSource: "GolfNavi",
    distance: '신치토세공항에서 55km',
    region: '홋카이도',
    latitude: 42.9849,
    longitude: 141.3545,
    remainingTeams: 13,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: true,
    tags: ['초보자 추천'],
    plans: [
      {
        id: 'sf-p1',
        name: '여름 시즌 리조트 플랜',
        badges: ['식사포함', '카트포함', '18홀'],
        includes: ['중식', '카트비', '세금'],
        excludes: ['캐디'],
        basePrice: 8200,
        twoPlayerSurcharge: 1600,
        threePlayerSurcharge: 1100,
        times: ['07:00', '08:00', '09:00'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'フォレストコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '30% 위약금' },
          { label: '2일 전~당일', fee: '100% 위약금' },
        ],
      },
    ],
  },
  {
    id: 'niseko-royal',
    nearestAirportId: 'shin-chitose',
    name: '니세코 로열 리조트 골프',
    nameLocal: 'ニセコロイヤルリゾートゴルフ',
    image: courseImages[3],
    images: [courseImages[3], courseImages[0]],
    address: '홋카이도 니세코',
    addressLocal: '北海道ニセコ',
    lowestPrice: 15800,
    rating: 4.9,
    reviewCount: 48,
    ratingSource: "GolfNavi",
    distance: '신치토세공항에서 95km',
    region: '홋카이도',
    latitude: 42.8048,
    longitude: 140.6874,
    remainingTeams: 4,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: false,
    brand: 'Grand PGM',
    tags: ['추천'],
    plans: [
      {
        id: 'nr-p1',
        name: '리조트 프리미엄 라운드',
        badges: ['식사포함', '캐디포함', '카트포함', '18홀', '프리미엄'],
        includes: ['중식', '캐디비', '카트비', '세금', '온천'],
        excludes: [],
        basePrice: 15800,
        twoPlayerSurcharge: 3200,
        threePlayerSurcharge: 2000,
        times: ['07:30', '08:00', '08:30'],
        minPlayer: 2,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'ロイヤルコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '10일 전까지', fee: '전액 환불' },
          { label: '7~9일 전', fee: '20% 위약금' },
          { label: '3~6일 전', fee: '50% 위약금' },
          { label: '2일 전~당일', fee: '100% 위약금' },
        ],
      },
    ],
  },

  // 도호쿠 (narita 다소 멀지만 가장 가까운 공항으로 narita 할당)
  {
    id: 'sendai-green',
    nearestAirportId: 'narita',
    name: '센다이 그린 컨트리클럽',
    nameLocal: '仙台グリーンカントリークラブ',
    image: courseImages[0],
    images: [courseImages[0], courseImages[1]],
    address: '미야기현 센다이시',
    addressLocal: '宮城県仙台市',
    lowestPrice: 7600,
    rating: 4.0,
    reviewCount: 15,
    ratingSource: "GolfNavi",
    distance: '도호쿠 지역',
    region: '도호쿠',
    latitude: 38.2682,
    longitude: 140.8694,
    remainingTeams: 8,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: true,
    plans: [
      {
        id: 'sg-p1',
        name: '주중 셀프 플랜',
        badges: ['카트포함', '18홀'],
        includes: ['카트비', '세금'],
        excludes: ['식사', '캐디'],
        basePrice: 7600,
        twoPlayerSurcharge: 1500,
        threePlayerSurcharge: 1000,
        times: ['08:00', '08:30', '09:00'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'グリーンコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '30% 위약금' },
          { label: '2일 전~당일', fee: '100% 위약금' },
        ],
      },
    ],
  },

  // 주고쿠 (fukuoka가 가장 가까운 공항)
  {
    id: 'hiroshima-hills',
    nearestAirportId: 'fukuoka',
    name: '히로시마 힐스 골프클럽',
    nameLocal: '広島ヒルズゴルフクラブ',
    image: courseImages[4],
    images: [courseImages[4], courseImages[3]],
    address: '히로시마현 히로시마시',
    addressLocal: '広島県広島市',
    lowestPrice: 8700,
    rating: 4.2,
    reviewCount: 28,
    ratingSource: "GolfNavi",
    distance: '주고쿠 지역',
    region: '히로시마',
    latitude: 34.3853,
    longitude: 132.4553,
    remainingTeams: 9,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: true,
    plans: [
      {
        id: 'hi-p1',
        name: '평일 중식포함',
        badges: ['식사포함', '카트포함', '18홀'],
        includes: ['중식', '카트비', '세금'],
        excludes: ['캐디'],
        basePrice: 8700,
        twoPlayerSurcharge: 1700,
        threePlayerSurcharge: 1200,
        times: ['08:00', '08:30', '09:00'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'ヒルズコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '30% 위약금' },
          { label: '2일 전~당일', fee: '100% 위약금' },
        ],
      },
    ],
  },

  // 시코쿠 (fukuoka 인접)
  {
    id: 'matsuyama-ocean',
    nearestAirportId: 'kansai',
    name: '마쓰야마 오션 골프리조트',
    nameLocal: '松山オーシャンゴルフリゾート',
    image: courseImages[2],
    images: [courseImages[2], courseImages[1]],
    address: '에히메현 마쓰야마시',
    addressLocal: '愛媛県松山市',
    lowestPrice: 8100,
    rating: 4.3,
    reviewCount: 19,
    ratingSource: "GolfNavi",
    distance: '시코쿠 지역',
    region: '시코쿠',
    latitude: 33.8416,
    longitude: 132.7658,
    remainingTeams: 10,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: true,
    tags: ['초보자 추천'],
    plans: [
      {
        id: 'mo-p1',
        name: '오션뷰 여유 플랜',
        badges: ['식사포함', '카트포함', '18홀'],
        includes: ['중식', '카트비', '세금'],
        excludes: ['캐디'],
        basePrice: 8100,
        twoPlayerSurcharge: 1600,
        threePlayerSurcharge: 1100,
        times: ['08:00', '09:00'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'オーシャンコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '30% 위약금' },
          { label: '2일 전~당일', fee: '100% 위약금' },
        ],
      },
    ],
  },

  // 오키나와 추가
  {
    id: 'okinawa-blue',
    nearestAirportId: 'naha',
    name: '오키나와 블루 오션 골프클럽',
    nameLocal: '沖縄ブルーオーシャンゴルフクラブ',
    image: courseImages[2],
    images: [courseImages[2], courseImages[4], courseImages[1]],
    address: '오키나와현 나카가미군',
    addressLocal: '沖縄県中頭郡',
    operator: '오키나와 리조트 골프 매니지먼트',
    operatorContact: '+81-98-900-0000',
    notice: {
      translated: `■ 예약·결제
· 본 상품의 이용요금은 현지(엔화) 결제입니다.
· 예약 확정 후 인원·일시 변경은 취소 후 재예약이 필요합니다.
· 표시 금액 외 세금·시설이용료 등 할증 요금이 발생할 수 있습니다.

■ 복장 규정(드레스코드)
· 카라 있는 상의를 착용해 주세요. 리조트 코스로 반바지 라운드가 가능합니다.
· 클럽하우스는 비교적 자유로운 복장이 허용됩니다.

■ 캐디·카트
· 셀프 카트 플레이가 기본입니다.
· 카트피는 요금에 포함, 캐디는 선택(추가요금)입니다.

■ 취소·환불 — 태풍·기상 특이사항
· 플레이 7일 전까지 무료 취소가 가능합니다.
· 태풍 등 기상특보로 휴장 시 전액 환불되며, 항공·숙박 취소 규정은 별도 적용됩니다.`,
      original: `■ ご予約・お支払いについて
・本商品の利用料金は現地(円)でのお支払いです。
・予約確定後の人数・日時変更は、キャンセル後の再予約が必要です。
・表示金額のほか、税金・施設利用料などの追加料金が発生する場合があります。

■ ドレスコードについて
・襟付きシャツを着用してください。リゾートコースのため半ズボンでのラウンドが可能です。
・クラブハウスは比較的自由な服装が許可されています。

■ キャディ・カートについて
・セルフカートプレーが基本です。
・カート代は料金に含まれ、キャディはオプション(追加料金)です。

■ キャンセル・返金について — 台風・気象に関する特記事項
・プレー7日前まで無料キャンセルが可能です。
・台風など気象警報による休場の場合は全額返金となり、航空・宿泊のキャンセル規定は別途適用されます。`,
    },
    lowestPrice: 14800,
    rating: 4.7,
    reviewCount: 38,
    ratingSource: "GolfNavi",
    distance: '나하공항에서 25km',
    region: '오키나와',
    latitude: 26.3344,
    longitude: 127.7698,
    remainingTeams: 12,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: true,
    tags: ['초보자 추천'],
    plans: [
      {
        id: 'oki-p1',
        name: '리조트 오션뷰 플랜',
        badges: ['식사포함', '카트포함', '18홀', '초보자 추천'],
        includes: ['중식', '카트비', '세금'],
        excludes: ['캐디(셀프)'],
        basePrice: 14800,
        twoPlayerSurcharge: 2400,
        threePlayerSurcharge: 1800,
        times: ['07:00', '07:30', '08:00', '08:30'],
        minPlayer: 1,
        maxPlayer: 4,
        roundCode: '18H',
        courseName: 'ブルーオーシャンコース',
        paymentType: 'onsite',
        cancellationPolicy: [
          { label: '7일 전까지', fee: '전액 환불' },
          { label: '3~6일 전', fee: '그린피의 30% 위약금' },
          { label: '2일 전~당일', fee: '그린피의 100% 위약금' },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 예약 가능 플랜 0개 (마감) 케이스 — 프로토타입 안내용
  //  · 목록에서 availableOnly OFF 일 때만 노출되어 "이런 골프장도 있구나" 인지 유도
  //  · 클릭 시 코스 상세로 진입은 가능하나 티타임 탭에 플랜이 없음
  // ──────────────────────────────────────────────────────────
  {
    id: 'soldout-narita',
    nearestAirportId: 'narita',
    name: '나리타 컨트리클럽',
    nameLocal: '成田カントリークラブ',
    image: courseImages[1],
    images: [courseImages[1], courseImages[2], courseImages[3]],
    address: '치바현 나리타시',
    addressLocal: '千葉県成田市',
    lowestPrice: 12500,
    rating: 4.0,
    reviewCount: 18,
    ratingSource: "GolfNavi",
    distance: '나리타공항에서 15분',
    region: '치바',
    latitude: 35.7615,
    longitude: 140.3450,
    remainingTeams: 0,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: true,
    dressCode: '카라 있는 상의 권장',
    tags: [],
    plans: [],
  },
  {
    id: 'soldout-kobe',
    nearestAirportId: 'kansai',
    name: '고베 베이 골프클럽',
    nameLocal: '神戸ベイゴルフクラブ',
    image: courseImages[2],
    images: [courseImages[2], courseImages[3], courseImages[4]],
    address: '효고현 고베시',
    addressLocal: '兵庫県神戸市',
    lowestPrice: 15800,
    rating: 4.3,
    reviewCount: 41,
    ratingSource: "GolfNavi",
    distance: '간사이공항에서 50분',
    region: '효고',
    latitude: 34.6913,
    longitude: 135.1830,
    remainingTeams: 0,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: false,
    dressCode: '카라 있는 상의 + 긴바지',
    tags: [],
    plans: [],
  },
  {
    id: 'soldout-sapporo',
    nearestAirportId: 'shin-chitose',
    name: '삿포로 파크 골프장',
    nameLocal: '札幌パークゴルフ場',
    image: courseImages[3],
    images: [courseImages[3], courseImages[4], courseImages[0]],
    address: '홋카이도 삿포로시',
    addressLocal: '北海道札幌市',
    lowestPrice: 9800,
    rating: 4.1,
    reviewCount: 22,
    ratingSource: "GolfNavi",
    distance: '신치토세공항에서 40분',
    region: '홋카이도',
    latitude: 43.0220,
    longitude: 141.3540,
    remainingTeams: 0,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: true,
    dressCode: '카라 있는 상의 권장',
    tags: [],
    plans: [],
  },
  {
    id: 'soldout-okinawa',
    nearestAirportId: 'naha',
    name: '오키나와 리조트 골프',
    nameLocal: '沖縄リゾートゴルフ',
    image: courseImages[4],
    images: [courseImages[4], courseImages[0], courseImages[1]],
    address: '오키나와현 나하시',
    addressLocal: '沖縄県那覇市',
    lowestPrice: 18200,
    rating: 4.5,
    reviewCount: 67,
    ratingSource: "GolfNavi",
    distance: '나하공항에서 25분',
    region: '오키나와',
    latitude: 26.2123,
    longitude: 127.6792,
    remainingTeams: 0,
    holes: 18,
    par: 72,
    foreignerOk: true,
    beginnerFriendly: false,
    dressCode: '카라 있는 상의 + 긴바지',
    tags: [],
    plans: [],
  },
];

export function getCourseById(id: string): GolfCourse | undefined {
  const jp = mockCourses.find(c => c.id === id);
  if (jp) return jp.country ? jp : { ...jp, country: 'jp' };
  return buildOverseasCourses().find(c => c.id === id);
}

export function getPlanById(courseId: string, planId: string): Plan | undefined {
  const course = getCourseById(courseId);
  return course?.plans.find(p => p.id === planId);
}

// ────────────────────────────────────────────────────────────────
// 날짜별 가용성 (시드 기반 결정적 함수)
// ────────────────────────────────────────────────────────────────
// 관리 포인트: 이 함수 하나만 수정하면 전체 날짜별 잔여팀/플랜이 바뀝니다.
// courseId + dateKey 조합으로 해싱 → 재현 가능한 의사 랜덤.

function hashSeed(courseId: string, dateKey: string): number {
  let h = 0;
  const s = courseId + dateKey;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export interface DateAvailability {
  remainingTeams: number;
  /** 해당 날짜에 사용 가능한 플랜 인덱스 배열 */
  availablePlanIndices: number[];
  /** 해당 날짜의 최저가 (가용 플랜 기준) */
  lowestPrice: number;
}

/**
 * 특정 골프장 + 날짜에 대한 가용성을 반환.
 * - remainingTeams: 0~course.remainingTeams (날짜에 따라 변동)
 * - availablePlanIndices: 전체 플랜 중 해당 날짜에 열린 것
 * - lowestPrice: 가용 플랜 중 최저가
 *
 * 외부 광고(isExternalAd)는 날짜 필터링하지 않음 (항상 노출).
 */
export function getDateAvailability(course: GolfCourse, date: Date): DateAvailability {
  // 외부 광고는 항상 그대로
  if (course.isExternalAd) {
    return {
      remainingTeams: course.remainingTeams,
      availablePlanIndices: course.plans.map((_, i) => i),
      lowestPrice: course.lowestPrice,
    };
  }

  const key = toDateKey(date);
  const seed = hashSeed(course.id, key);

  // 플랜 가용성 먼저 결정 → 잔여팀은 가용 티타임에서 파생
  const planCount = course.plans.length;
  if (planCount === 0) {
    return { remainingTeams: 0, availablePlanIndices: [], lowestPrice: course.lowestPrice };
  }

  // 각 플랜별로 열림/닫힘 결정
  const availablePlanIndices: number[] = [];
  for (let i = 0; i < planCount; i++) {
    const planSeed = hashSeed(course.plans[i].id, key);
    // ~80% 확률로 플랜 오픈
    if (planSeed % 5 !== 0) {
      availablePlanIndices.push(i);
    }
  }

  // 매진 날짜: ~10% 확률
  const isSoldOut = seed % 10 === 0;

  if (isSoldOut) {
    return { remainingTeams: 0, availablePlanIndices: [], lowestPrice: course.lowestPrice };
  }

  // 플랜이 전부 닫혔으면 최소 1개 보장
  if (availablePlanIndices.length === 0) {
    availablePlanIndices.push(seed % planCount);
  }

  // 잔여팀 = 가용 플랜들의 전체 티타임 수 합산
  const remainingTeams = availablePlanIndices.reduce(
    (sum, i) => sum + course.plans[i].times.length, 0,
  );

  const lowestPrice = Math.min(...availablePlanIndices.map(i => course.plans[i].basePrice));

  return { remainingTeams, availablePlanIndices, lowestPrice };
}

/**
 * mockCourses + overseasCourses 를 합쳐 날짜 가용성을 적용해 반환.
 * - mockCourses 는 일본 코스만 들어 있어 country 미지정 → 'jp' 디폴트.
 * - 매진(remainingTeams===0) 코스는 제외하지 않고, remainingTeams=0으로 유지.
 * - overseasCourses 도 동일한 날짜 시드 알고리즘 적용 (id+date 해싱).
 */
export function getCoursesForDate(date: Date): GolfCourse[] {
  const all: GolfCourse[] = [
    ...mockCourses.map(c => (c.country ? c : { ...c, country: 'jp' })),
    ...buildOverseasCourses(),
  ];
  return all.map(course => {
    const avail = getDateAvailability(course, date);
    return {
      ...course,
      remainingTeams: avail.remainingTeams,
      lowestPrice: avail.lowestPrice,
      plans: avail.availablePlanIndices.map(i => course.plans[i]),
    };
  });
}
