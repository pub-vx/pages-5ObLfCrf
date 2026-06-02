// 패키지 슬롯(광고) 시드 데이터 — PackagesSearchPage 와 SearchModal 자동완성에서 공용 사용.
//
// 카드 표시 항목 (PackagesSearchPage.PackageCard)
//  · 제휴사명: advertiser (+ partnerLogo emoji)
//  · 상품명: title  → "[지역] 상품 베이스명 N박N일 #해시태그…" 형태 (해시태그 인라인 포함)
//  · 상품 속성: attributes  → 골프 · 송영 · 숙박 · 캐디 등 dot-separated 5개 내외
//  · 금액: originalPrice (취소선) / discount (할인%) / price (~ 붙은 최종가)
//
// SearchModal 자동완성용 보조 메타: emoji / region / nights / rounds / sub — 표시는 안 하지만 검색 매칭/요약에 사용

export interface AdSlot {
  id: string;
  tier: 'premium' | 'standard';
  /** Country code matching lib/countries.ts */
  country: 'jp' | 'vn' | 'hi' | 'tw' | 'my';
  region: string;
  emoji: string;
  partnerLogo: string;
  advertiser: string;
  title: string;
  /** 상품 속성 — 카드에서 "골프 · 송영 · 숙박(2인1실) · …" 형태로 노출 */
  attributes: string[];
  /** 자동완성용 부제 — 카드에는 미노출 */
  sub: string;
  rounds: number;
  nights: number;
  /** 금액 — '₩X,XXX,XXX' 또는 '₩X,XXX,XXX~' 형식 */
  originalPrice: string;
  price: string;
  /** 할인율 — '27%' 형식 */
  discount: string;
  image: string;
  tagline?: string;
  badge?: string;
}

export const PACKAGE_SLOTS: AdSlot[] = [
  {
    id: 'pk-1', tier: 'premium', country: 'jp', region: '규슈', emoji: '🌋',
    advertiser: '하나투어', partnerLogo: '🌸',
    title: '[규슈] 후쿠오카 료칸 + 명문 골프 2박3일 #료칸 가이세키 #온천 무제한 #캐디 포함',
    attributes: ['골프 2R', '송영', '숙박(2인1실, 료칸)', '온천 무제한', '캐디 포함'],
    sub: '료칸 2박 가이세키 + 명문 코스 2R',
    rounds: 2, nights: 2,
    originalPrice: '₩1,890,000', price: '₩1,512,000~', discount: '20%',
    image: 'https://images.unsplash.com/photo-1714538247922-280698e0e20c?w=900&q=80',
    tagline: '5월 한정 단독 특가',
    badge: 'BEST',
  },
  {
    id: 'pk-2', tier: 'standard', country: 'jp', region: '오키나와', emoji: '🏝️',
    advertiser: '모두투어', partnerLogo: '🏝️',
    title: '[오키나와] 나하 비치 리조트 3박4일 #오션뷰 객실 #렌터카 포함 #카트 GPS',
    attributes: ['골프 3R', '렌터카', '숙박(2인1실)', '오션뷰 객실', '카트 GPS'],
    sub: '나하 직항 · 비치 리조트 3박',
    rounds: 3, nights: 3,
    originalPrice: '₩2,190,000', price: '₩1,686,300~', discount: '23%',
    image: 'https://images.unsplash.com/photo-1766288020088-4b95f5409376?w=900&q=80',
  },
  {
    id: 'pk-3', tier: 'standard', country: 'jp', region: '간토', emoji: '🗼',
    advertiser: '노랑풍선', partnerLogo: '🎈',
    title: '[도쿄] 도심 호텔 + 명문 2R 2박3일 #도쿄 시내 호텔 #공항 픽업 #클럽 렌탈',
    attributes: ['골프 2R', '송영', '숙박(2인1실)', '공항 픽업', '캐디 포함'],
    sub: '나리타/하네다 직항 · 도심 호텔 2박',
    rounds: 2, nights: 2,
    originalPrice: '₩1,690,000', price: '₩1,284,400~', discount: '24%',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=900&q=80',
  },
  {
    id: 'pk-4', tier: 'standard', country: 'jp', region: '간사이', emoji: '🏯',
    advertiser: '인터파크 투어', partnerLogo: '🎌',
    title: '[오사카] 오사카+교토 골프 3박4일 #시내 호텔 #교토 일정 포함 #셔틀 운영',
    attributes: ['골프 2R', '송영', '숙박(2인1실)', '시내 호텔', '셔틀 포함'],
    sub: '오사카 시내 3박 + 교토 당일치기 + 골프 2R',
    rounds: 2, nights: 3,
    originalPrice: '₩1,890,000', price: '₩1,417,500~', discount: '25%',
    image: 'https://images.unsplash.com/photo-1493997181344-712f2f19d87a?w=900&q=80',
  },
  {
    id: 'pk-5', tier: 'standard', country: 'jp', region: '주부', emoji: '🗻',
    advertiser: '하나투어', partnerLogo: '🌸',
    title: '[후지산] 후지산뷰 코스 + 료칸 2박3일 #후지산 뷰 #료칸 가이세키 #온천 무제한',
    attributes: ['골프 2R', '송영', '숙박(2인1실, 료칸)', '온천 무제한', '셔틀 포함'],
    sub: '후지산 인근 명문 2R + 료칸 2박',
    rounds: 2, nights: 2,
    originalPrice: '₩1,790,000', price: '₩1,396,200~', discount: '22%',
    image: 'https://images.unsplash.com/photo-1578637387939-43c525550085?w=900&q=80',
  },
  {
    id: 'pk-6', tier: 'standard', country: 'jp', region: '홋카이도', emoji: '❄️',
    advertiser: '하나투어', partnerLogo: '🌸',
    title: '[북해도] 치토세 다색골프 2박3일 #토마코마이72 골프 #치토세 시내호텔 #2인가능',
    attributes: ['골프', '송영', '숙박(2인1실)', '공항 근처', '캐디 포함'],
    sub: '치토세 직항 · 토마코마이 명문 코스',
    rounds: 2, nights: 2,
    originalPrice: '₩622,200', price: '₩457,000~', discount: '27%',
    image: 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=900&q=80',
  },
  // ── 비-일본 권역 ──
  {
    id: 'pk-7', tier: 'standard', country: 'my', region: '쿠알라룸푸르권', emoji: '🇲🇾',
    advertiser: '하나투어', partnerLogo: '🌴',
    title: '[쿠알라룸푸르] KL 5성 호텔 + 명문 코스 4박5일 #KL 5성 호텔 #명문 3R #캐디 포함',
    attributes: ['골프 3R', '송영', '숙박(2인1실)', '시내 5성', '캐디 포함'],
    sub: 'KL 시내 호텔 + 명문 코스 3R · 4박 5일',
    rounds: 3, nights: 4,
    originalPrice: '₩1,290,000', price: '₩993,300~', discount: '23%',
    image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=900&q=80',
  },
  {
    id: 'pk-8', tier: 'standard', country: 'vn', region: '중부', emoji: '🇻🇳',
    advertiser: '노랑풍선', partnerLogo: '🏝️',
    title: '[다낭] 빈펄 오션 리조트 4박5일 #빈펄 리조트 #오션뷰 #캐디 포함',
    attributes: ['골프 3R', '송영', '숙박(2인1실)', '오션뷰 객실', '캐디 포함'],
    sub: '다낭 직항 · 빈펄 리조트 4박 · 골프 3R',
    rounds: 3, nights: 4,
    originalPrice: '₩1,790,000', price: '₩1,288,800~', discount: '28%',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=900&q=80',
  },
  {
    id: 'pk-9', tier: 'standard', country: 'hi', region: '오아후', emoji: '🌴',
    advertiser: '인터파크 투어', partnerLogo: '🌺',
    title: '[하와이] 와이키키 명문 코스 5박6일 #와이키키 호텔 #렌터카 포함 #오션뷰',
    attributes: ['골프 3R', '렌터카', '숙박(2인1실)', '오션뷰 객실', '공항 픽업'],
    sub: '호놀룰루 와이키키 5박 · 명문 코스 3R',
    rounds: 3, nights: 5,
    originalPrice: '₩4,290,000', price: '₩3,517,800~', discount: '18%',
    image: 'https://images.unsplash.com/photo-1542259009477-d625272157b7?w=900&q=80',
  },
  {
    id: 'pk-10', tier: 'standard', country: 'tw', region: '북부', emoji: '🇹🇼',
    advertiser: '모두투어', partnerLogo: '🥟',
    title: '[타이베이] 시내 호텔 + 골프 + 미식 3박4일 #시내 호텔 #야시장 투어 #셔틀 포함',
    attributes: ['골프 2R', '송영', '숙박(2인1실)', '시내 호텔', '셔틀 포함'],
    sub: '타이베이 직항 · 골프 2R + 시내 관광',
    rounds: 2, nights: 3,
    originalPrice: '₩1,290,000', price: '₩890,100~', discount: '31%',
    image: 'https://images.unsplash.com/photo-1552083375-1447ce886485?w=900&q=80',
  },
];
