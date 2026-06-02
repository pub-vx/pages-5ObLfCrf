// 큐레이션 / 테마 상수 - HomePage에서 분리된 공유 상수
// v3에서 HomePage 제거 후에도 MainPage, RecommendPage 등에서 참조 가능하도록 lib로 이동

/**
 * 큐레이션 칩 라벨 단축 — 긴 타이틀을 칩 한 줄에 들어가게 축약.
 * MainPage / RealtimeSearchPage 큐레이션 칩 공용.
 */
export function shortCurationLabel(title: string): string {
  return title
    .replace(/\?$/, '')
    .replace('일본 골프 처음이라면', '초보 추천')
    .replace('2인 예약 가능', '2인 라운드')
    .replace('3인 라운드 가능', '3인 라운드')
    .replace('식사 포함', '식사포함')
    .replace('공항 인근', '공항 근처')
    .replace('시내 인근', '시내 근처')
    .replace('셔틀버스 운영', '셔틀운영')
    .replace('쓰루 플레이', '쓰루플레이');
}

export interface TripTheme {
  id: string;
  title: string;
  hint: string;
  emoji: string;
  badge?: string;
  gradient: string;
  textColor: string;
  /** 자동으로 채워질 N박 — 0 = 당일치기 */
  nights: number;
}

export const TRIP_THEMES: TripTheme[] = [
  {
    id: '1n2d',
    title: '짬내서 1박 2일로',
    hint: '호다닥! 다녀오기',
    emoji: '🌙',
    gradient: 'from-[#E8F0FE] to-[#D4E4FC]',
    textColor: 'text-[#2B6FD0]',
    nights: 1,
  },
  {
    id: '2n3d',
    title: '적당히 놀고 쉬고',
    hint: '2박 3일!',
    emoji: '😎',
    badge: '인기',
    gradient: 'from-[#E0F7ED] to-[#C8F0DE]',
    textColor: 'text-[#149867]',
    nights: 2,
  },
  {
    id: '3n4d',
    title: '느긋하고 여유있게',
    hint: '3박 4일',
    emoji: '🌴',
    gradient: 'from-[#FFF8E1] to-[#FFECB3]',
    textColor: 'text-[#E08D10]',
    nights: 3,
  },
  {
    id: 'daytrip',
    title: '도전 당일치기 🔥',
    hint: '떴다 땡처리 항공!',
    emoji: '✈️',
    badge: 'CHALLENGE',
    gradient: 'from-[#FFE9EC] to-[#FCD0D7]',
    textColor: 'text-[#D6385A]',
    nights: 0,
  },
];

export interface CurationItem {
  id: string;
  title: string;
  sub: string;
  icon: string;
  gradient: string;
  textColor: string;
  playStyles?: string[];
  inclusions?: string[];
  sortBy?: 'recommended' | 'airport' | 'price' | 'teams';
}

export const CURATIONS: CurationItem[] = [
  {
    id: 'beginner',
    title: '일본 골프 처음이라면?',
    sub: '초보자 / 한국인 친화 구장',
    icon: '⛳',
    gradient: 'from-[#E0F7ED] to-[#C8F0DE]',
    textColor: 'text-[#149867]',
  },
  {
    id: 'twoplayer',
    title: '2인 예약 가능',
    sub: '추가 할증 없어요',
    icon: '👥',
    gradient: 'from-[#FFE9EC] to-[#FCD0D7]',
    textColor: 'text-[#D6385A]',
    playStyles: ['2인보장'],
  },
  {
    id: 'threeplayer',
    title: '3인 라운드 가능',
    sub: '작은 그룹도 OK',
    icon: '🤝',
    gradient: 'from-[#FFE4D1] to-[#FCCFA8]',
    textColor: 'text-[#D9651E]',
  },
  {
    id: 'meal',
    title: '식사 포함',
    sub: '조식 · 중식 모두 OK',
    icon: '🍱',
    gradient: 'from-[#FFF8E1] to-[#FFECB3]',
    textColor: 'text-[#E08D10]',
    inclusions: ['중식포함'],
  },
  {
    id: 'airport',
    title: '공항 인근',
    sub: '공항에서 1시간 이내',
    icon: '✈️',
    gradient: 'from-[#E8F0FE] to-[#D4E4FC]',
    textColor: 'text-[#2B6FD0]',
    sortBy: 'airport',
  },
  {
    id: 'downtown',
    title: '시내 인근',
    sub: '관광 · 쇼핑까지 가까워요',
    icon: '🏙️',
    gradient: 'from-[#E0F7F2] to-[#C5EDE3]',
    textColor: 'text-[#0E8F7D]',
  },
  {
    id: 'shuttle',
    title: '셔틀버스 운영',
    sub: '픽업 · 이동 편해요',
    icon: '🚌',
    gradient: 'from-[#E1F5FE] to-[#C9E9F8]',
    textColor: 'text-[#0277BD]',
    inclusions: ['셔틀버스운영'],
  },
  {
    id: 'through',
    title: '쓰루 플레이',
    sub: '18홀 논스톱 라운드',
    icon: '🏌️',
    gradient: 'from-[#F3E8FF] to-[#E4D0FC]',
    textColor: 'text-[#7C3AED]',
    playStyles: ['쓰루플레이'],
  },
];
