import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Reservation } from './mockData';
import { DEFAULT_FILTER, type FilterState } from '../components/FilterSheet';

export type SortOption = 'recommended' | 'airport' | 'price' | 'teams';

/** 라운드 인원수 — 1/2/3/4명 또는 단체(5인 이상). 기본 4 */
export type PlayerCount = 1 | 2 | 3 | 4 | 'group';

export const SORT_LABELS: Record<SortOption, string> = {
  recommended: '추천순',
  airport: '공항으로부터 가까운순',
  price: '가격순',
  teams: '잔여 티타임수 순',
};

/** 라운드 일자 기본 선택값을 결정하는 오늘 기준 오프셋(일). 예약 일정 잡기 좋은 적당한 미래 시점 */
export const DEFAULT_DATE_OFFSET_DAYS = 21;

/** sessionStorage 키 — 같은 탭 내 새로고침 시 사용자 선택 유지용 */
const SELECTED_DATE_SESSION_KEY = 'tour:selectedDate';

/** 오늘 0시 + DEFAULT_DATE_OFFSET_DAYS 의 Date 인스턴스를 만들어 반환 */
function makeDefaultSelectedDate(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + DEFAULT_DATE_OFFSET_DAYS);
  return d;
}

/** sessionStorage 에서 마지막 선택 일자를 복원. 없거나 손상되었으면 null */
function readPersistedSelectedDate(): Date | null {
  try {
    const v = typeof window !== 'undefined' ? window.sessionStorage.getItem(SELECTED_DATE_SESSION_KEY) : null;
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

/** 공항 기준 컨텍스트. 항공편 모드(Tab A) + 지도 모드 → 목록 전환 모두 사용 */
export interface ArrivalContext {
  airportId: string;
  airportName: string;
  flightCode?: string;   // 항공편 모드일 때만
  arrivalTime?: string;  // 'HH:mm', 항공편 모드일 때만
}

interface AppState {
  isLoggedIn: boolean;
  userName: string;
  reservations: Reservation[];
  availableOnly: boolean;
  setAvailableOnly: (v: boolean) => void;
  /** 한국 출발 공항 코드 (ICN/GMP/PUS/TAE/CJJ/CJU 등) */
  departureAirport: string;
  setDepartureAirport: (id: string) => void;
  filterState: FilterState;
  setFilterState: (s: FilterState) => void;
  /** 선택된 나라 코드들 — 다중 선택. 기본 ['jp'] */
  selectedCountries: string[];
  setSelectedCountries: (c: string[]) => void;
  selectedRegions: string[];
  setSelectedRegions: (r: string[]) => void;
  /** 2차 권역 (현·도시) 다중 선택. 비어있으면 1차 권역 전체로 간주 */
  selectedSubRegions: string[];
  setSelectedSubRegions: (s: string[]) => void;
  /** 라운드 인원수 — 1/2/3/4/단체(5인 이상). 기본 4 */
  playerCount: PlayerCount;
  setPlayerCount: (n: PlayerCount) => void;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  /** 사용자가 명시적으로 날짜를 선택했는지 — false면 SearchInputCard "언제"에 placeholder 노출 */
  dateTouched: boolean;
  arrivalContext: ArrivalContext | null;
  setArrivalContext: (a: ArrivalContext | null) => void;
  /** 홈 큐레이션("이런 골프장은 어때요?") 카드에서 진입한 퀵필터 */
  quickCuration: string | null;
  setQuickCuration: (id: string | null) => void;
  login: () => void;
  logout: () => void;
  addReservation: (reservation: Reservation) => void;
  cancelReservation: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: 'OT-2026-00000001',
      reservationCode: 'OT-2026-00000001',
      courseId: 'kasumigaseki',
      planId: 'kasu-p1',
      playDate: '2026-07-01',
      teeTime: '08:30',
      totalPlayer: 3,
      name: '김정우',
      nameEn: 'JEONGWOO KIM',
      email: 'test0001@example.com',
      phone: '010-1234-5678',
      players: [{ name: '이준호', nameEn: 'JUNHO LEE' }, { name: '박민수', nameEn: 'MINSU PARK' }],
      status: 'ACTIVE',
      paidAmount: 28500,
      paidAmountKrw: 285000,
      currency: 'JPY',
      createdAt: '2026-02-20T09:00:00Z',
    },
    {
      id: 'OT-2026-00000002',
      reservationCode: 'OT-2026-00000002',
      courseId: 'century',
      planId: 'cent-p1',
      playDate: '2026-07-22',
      teeTime: '09:00',
      totalPlayer: 4,
      name: '김정우',
      nameEn: 'JEONGWOO KIM',
      email: 'test0001@example.com',
      phone: '010-1234-5678',
      players: [{ name: '최영호', nameEn: 'YOUNGHO CHOI' }, { name: '정대현', nameEn: 'DAEHYUN JUNG' }, { name: '한지민', nameEn: 'JIMIN HAN' }],
      status: 'ACTIVE',
      paidAmount: 38000,
      paidAmountKrw: 380000,
      currency: 'JPY',
      createdAt: '2026-01-15T10:30:00Z',
    },
    {
      id: 'OT-2026-00000003',
      reservationCode: 'OT-2026-00000003',
      courseId: 'koga',
      planId: 'koga-p1',
      playDate: '2026-01-10',
      teeTime: '07:30',
      totalPlayer: 2,
      name: '김정우',
      nameEn: 'JEONGWOO KIM',
      email: 'test0001@example.com',
      phone: '010-1234-5678',
      players: [{ name: '이준호', nameEn: 'JUNHO LEE' }],
      status: 'CANCELLED',
      paidAmount: 19600,
      paidAmountKrw: 196000,
      currency: 'JPY',
      createdAt: '2025-12-28T14:00:00Z',
      cancelledAt: '2026-01-02T11:24:00Z',
    },
    {
      // 라운드 완료 (지난 일자 + ACTIVE) — 후기 작성/캐시백 가능
      id: 'OT-2026-00000004',
      reservationCode: 'OT-2026-00000004',
      courseId: 'koga',
      planId: 'koga-p1',
      playDate: '2026-04-12',
      teeTime: '08:00',
      totalPlayer: 4,
      name: '김정우',
      nameEn: 'JEONGWOO KIM',
      email: 'test0001@example.com',
      phone: '010-1234-5678',
      players: [
        { name: '이준호', nameEn: 'JUNHO LEE' },
        { name: '박민수', nameEn: 'MINSU PARK' },
        { name: '최영호', nameEn: 'YOUNGHO CHOI' },
      ],
      status: 'ACTIVE',
      paidAmount: 39200,
      paidAmountKrw: 392000,
      currency: 'JPY',
      createdAt: '2026-03-20T10:00:00Z',
    },
    {
      // 임박 예약 — 취소가능기한(라운드 5일 전) 지난 케이스 → "취소 신청" 분기
      id: 'OT-2026-00000006',
      reservationCode: 'OT-2026-00000006',
      courseId: 'kasumigaseki',
      planId: 'kasu-p1',
      playDate: '2026-05-13',
      teeTime: '07:00',
      totalPlayer: 2,
      name: '김정우',
      nameEn: 'JEONGWOO KIM',
      email: 'test0001@example.com',
      phone: '010-1234-5678',
      players: [{ name: '이준호', nameEn: 'JUNHO LEE' }],
      status: 'ACTIVE',
      paidAmount: 21000,
      paidAmountKrw: 195300,
      currency: 'JPY',
      createdAt: '2026-04-20T11:00:00Z',
    },
    {
      // 라운드 완료 — 다른 코스
      id: 'OT-2026-00000005',
      reservationCode: 'OT-2026-00000005',
      courseId: 'kasumigaseki',
      planId: 'kasu-p1',
      playDate: '2026-03-08',
      teeTime: '09:30',
      totalPlayer: 3,
      name: '김정우',
      nameEn: 'JEONGWOO KIM',
      email: 'test0001@example.com',
      phone: '010-1234-5678',
      players: [
        { name: '정대현', nameEn: 'DAEHYUN JUNG' },
        { name: '한지민', nameEn: 'JIMIN HAN' },
      ],
      status: 'ACTIVE',
      paidAmount: 24000,
      paidAmountKrw: 240000,
      currency: 'JPY',
      createdAt: '2026-02-10T08:00:00Z',
    },
  ]);
  const [availableOnly, setAvailableOnly] = useState(true);
  const [departureAirport, setDepartureAirport] = useState('ICN');
  const [filterState, setFilterState] = useState<FilterState>(DEFAULT_FILTER);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([
    '규슈', '간토', '간사이', '주부', '홋카이도', '오키나와', '도호쿠', '시코쿠', '주고쿠',
  ]);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  // 선택 일자 정책
  //  - 새 탭: sessionStorage 휘발 → 디폴트(오늘 + DEFAULT_DATE_OFFSET_DAYS)로 시작
  //  - 같은 탭 새로고침: sessionStorage 복원 → 사용자 선택 유지
  //  - 같은 탭 페이지 이동: React state 유지 → 사용자 선택 유지
  //  - 과거 일자(자정 경과 등): 디폴트로 자동 복구
  // 디폴트로 "조회일 + 21일"이 보이도록 dateTouched=true로 시작
  const [dateTouched, setDateTouched] = useState<boolean>(true);
  const [selectedDate, setSelectedDateInternal] = useState<Date>(() => {
    const persisted = readPersistedSelectedDate();
    if (persisted) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (persisted.getTime() >= today.getTime()) return persisted;
    }
    return makeDefaultSelectedDate();
  });
  // 변경 시마다 sessionStorage에 영속화 (탭 동안만 유지)
  useEffect(() => {
    try {
      window.sessionStorage.setItem(SELECTED_DATE_SESSION_KEY, selectedDate.toISOString());
    } catch {
      /* 사용자 환경에서 storage 접근 거부될 수 있음 — 조용히 무시 */
    }
  }, [selectedDate]);
  // 과거 일자 자동 복구
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate.getTime() < today.getTime()) {
      setSelectedDateInternal(makeDefaultSelectedDate());
    }
  }, [selectedDate]);
  // 외부 setter — 호출 시 dateTouched도 true로 마킹
  const setSelectedDate = (d: Date) => {
    setSelectedDateInternal(d);
    setDateTouched(true);
  };
  const [arrivalContext, setArrivalContext] = useState<ArrivalContext | null>(null);
  const [quickCuration, setQuickCuration] = useState<string | null>(null);
  const [selectedSubRegions, setSelectedSubRegions] = useState<string[]>([]);
  // 진입 시 기본 나라: 일본 (단일 선택). 권역은 전체 선택 → 타이틀 "일본 전체"
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['jp']);
  const [playerCount, setPlayerCount] = useState<PlayerCount>(4);

  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);

  const addReservation = (reservation: Reservation) => {
    setReservations(prev => [reservation, ...prev]);
  };

  const cancelReservation = (id: string) => {
    setReservations(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'CANCELLED' as const, cancelledAt: new Date().toISOString() } : r)
    );
  };

  return (
    <AppContext.Provider value={{
      isLoggedIn,
      userName: '김정우',
      reservations,
      availableOnly,
      setAvailableOnly,
      departureAirport,
      setDepartureAirport,
      filterState,
      setFilterState,
      selectedCountries,
      setSelectedCountries,
      selectedRegions,
      setSelectedRegions,
      selectedSubRegions,
      setSelectedSubRegions,
      playerCount,
      setPlayerCount,
      sortBy,
      setSortBy,
      selectedDate,
      setSelectedDate,
      dateTouched,
      arrivalContext,
      setArrivalContext,
      quickCuration,
      setQuickCuration,
      login,
      logout,
      addReservation,
      cancelReservation,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
