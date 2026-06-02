/**
 * 한국 → 일본 직항 비행시간 매트릭스 (분 단위, 평균값)
 * - null = 직항 없음
 * - 데이터 출처: 항공사 시간표 평균 (실제 운항편/시즌별 변동 가능)
 */

export interface KoreanAirport {
  id: string;       // IATA 코드
  name: string;     // 정식명
  short: string;    // 짧은 이름 (UI 표시)
}

export const KOREAN_DEPARTURES: KoreanAirport[] = [
  { id: 'ICN', name: '인천국제공항', short: '인천' },
  { id: 'GMP', name: '김포국제공항', short: '김포' },
  { id: 'PUS', name: '김해국제공항', short: '부산(김해)' },
  { id: 'TAE', name: '대구국제공항', short: '대구' },
  { id: 'CJJ', name: '청주국제공항', short: '청주' },
  { id: 'CJU', name: '제주국제공항', short: '제주' },
];

/** 출발IATA → 일본공항ID(mockData 기준) → 비행시간(분) | null(직항없음) */
export const FLIGHT_DURATIONS: Record<string, Record<string, number | null>> = {
  ICN: { // 인천 — 모든 주요 공항 직항
    fukuoka: 85,
    narita: 150,
    haneda: 145,
    kansai: 110,
    chubu: 110,
    'shin-chitose': 170,
    naha: 150,
  },
  GMP: { // 김포 — 하네다(셔틀) + 간사이 일부
    fukuoka: null,
    narita: null,
    haneda: 130,
    kansai: 125,
    chubu: null,
    'shin-chitose': null,
    naha: null,
  },
  PUS: { // 부산(김해) — 큐슈/간사이 가까움
    fukuoka: 60,
    narita: 130,
    haneda: null,
    kansai: 80,
    chubu: 100,
    'shin-chitose': 160,
    naha: null,
  },
  TAE: { // 대구 — 제한적
    fukuoka: null,
    narita: null,
    haneda: null,
    kansai: 90,
    chubu: null,
    'shin-chitose': null,
    naha: 135,
  },
  CJJ: { // 청주 — 큐슈 일부
    fukuoka: 90,
    narita: null,
    haneda: null,
    kansai: null,
    chubu: null,
    'shin-chitose': null,
    naha: null,
  },
  CJU: { // 제주 — 큐슈/간사이 일부
    fukuoka: 75,
    narita: null,
    haneda: null,
    kansai: 100,
    chubu: null,
    'shin-chitose': null,
    naha: null,
  },
};

/** "1h 25m" 또는 "1시간 25분" 포맷 */
export function formatFlightDuration(minutes: number, style: 'short' | 'long' = 'long'): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (style === 'short') {
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

export function getFlightDuration(departureId: string, arrivalAirportId: string): number | null {
  const row = FLIGHT_DURATIONS[departureId];
  if (!row) return null;
  return row[arrivalAirportId] ?? null;
}

/** 일본 공항으로 직항 가능한 한국 출발지 (있는 것만 · ICN 우선 정렬) */
export interface DirectFlightInfo {
  koreanAirport: KoreanAirport;
  minutes: number;
}
export function getDirectKoreanDepartures(arrivalAirportId: string): DirectFlightInfo[] {
  const out: DirectFlightInfo[] = [];
  for (const k of KOREAN_DEPARTURES) {
    const m = FLIGHT_DURATIONS[k.id]?.[arrivalAirportId];
    if (typeof m === 'number') out.push({ koreanAirport: k, minutes: m });
  }
  // ICN 우선 → 그 외 KOREAN_DEPARTURES 정의 순서
  out.sort((a, b) => {
    if (a.koreanAirport.id === 'ICN' && b.koreanAirport.id !== 'ICN') return -1;
    if (b.koreanAirport.id === 'ICN' && a.koreanAirport.id !== 'ICN') return 1;
    return (
      KOREAN_DEPARTURES.findIndex(k => k.id === a.koreanAirport.id) -
      KOREAN_DEPARTURES.findIndex(k => k.id === b.koreanAirport.id)
    );
  });
  return out;
}

/** 카드/패널 직항 라벨 — "ICN 외 N공항 직항" / "ICN 직항" / "환승 필요" */
export function formatDirectLabel(arrivalAirportId: string): string {
  const directs = getDirectKoreanDepartures(arrivalAirportId);
  if (directs.length === 0) return '환승 필요';
  const primary = directs[0].koreanAirport;
  const others = directs.length - 1;
  return others > 0 ? `${primary.id} 외 ${others} 직항` : `${primary.id} 직항`;
}
