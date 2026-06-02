import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Search, X, MapPin, Flag, Plane, Gift } from 'lucide-react';
import { airports, mockCourses } from '../data/mockData';
import { PACKAGE_SLOTS } from '../data/packages';
import { useAppState } from '../data/store';
import { getParentRegion, JAPAN_REGIONS_DATA } from '../lib/regions';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

/** 일본 권역 데이터는 lib/regions 의 단일 source of truth 를 사용 */
const JAPAN_REGIONS = JAPAN_REGIONS_DATA;

/* 권역 → 대표 hub 공항 (공항 기준 검색 조건 자동 적용용) */
const REGION_TO_AIRPORT: Record<string, string> = {
  '규슈': 'fukuoka',
  '간토': 'narita',
  '간사이': 'kansai',
  '주부': 'chubu',
  '홋카이도': 'shin-chitose',
  '오키나와': 'naha',
};

export function SearchModal({ open, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const { setSelectedRegions, setArrivalContext } = useAppState();
  const [keyword, setKeyword] = useState('');

  // 키워드 입력 시 자동완성 추천 — 권역 + 공항 + 골프장(실시간) + 패키지 매칭
  type Suggestion =
    | { kind: 'region'; label: string; sub?: string; payload: string }
    | { kind: 'airport'; label: string; sub?: string; payload: string /* airport id */ }
    | { kind: 'course'; label: string; sub?: string; payload: string }
    | { kind: 'package'; label: string; sub?: string; payload: string /* package id */ };
  const suggestions = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return [] as Suggestion[];
    const list: Suggestion[] = [];
    // 1) 1차 권역 매칭
    for (const r of JAPAN_REGIONS) {
      if (r.id.toLowerCase().includes(q)) {
        list.push({ kind: 'region', label: r.label, sub: '권역', payload: r.id });
      }
    }
    // 2) 공항 매칭 — 이름·IATA 코드 모두 검사
    for (const a of airports) {
      const name = a.name.toLowerCase();
      const short = a.name.replace(/ ?공항$/, '').toLowerCase();
      const code = (a.code ?? '').toLowerCase();
      if (name.includes(q) || short.includes(q) || code.includes(q)) {
        list.push({
          kind: 'airport',
          label: a.name.replace(/ ?공항$/, ''),
          sub: `${a.code} 공항 · ${a.region}`,
          payload: a.id,
        });
      }
    }
    // 3) 골프장 이름(한글/현지명) 매칭 — 실시간 예약 상품
    for (const c of mockCourses) {
      const name = (c.name ?? '').toLowerCase();
      const local = (c.nameLocal ?? '').toLowerCase();
      if (name.includes(q) || local.includes(q)) {
        const parent = getParentRegion(c.region);
        const subLabel = parent && parent !== c.region ? `${parent} · ${c.region}` : c.region;
        list.push({ kind: 'course', label: c.name, sub: `실시간 · ${subLabel}`, payload: c.id });
      }
    }
    // 4) 패키지 상품 매칭 — 타이틀 / 부제 / 권역
    for (const p of PACKAGE_SLOTS) {
      const title = p.title.toLowerCase();
      const sub = p.sub.toLowerCase();
      const region = p.region.toLowerCase();
      if (title.includes(q) || sub.includes(q) || region.includes(q)) {
        list.push({ kind: 'package', label: p.title, sub: `패키지 · ${p.emoji} ${p.region} · ${p.nights}박 ${p.rounds}R`, payload: p.id });
      }
    }
    return list.slice(0, 30);
  }, [keyword]);

  if (!open) return null;

  const handleCourseClick = (courseId: string) => {
    // 골프장 항목 → 골프장 상세 페이지로 바로 이동
    setArrivalContext(null);
    onClose();
    navigate(`/course/${courseId}`);
  };

  const handleAirportClick = (airportId: string) => {
    // 공항 기준 탐색 — 지도 모드로 바로 진입 (MapPage가 ?airport= 파라미터를 처리해 권역/컨텍스트 자동 셋업)
    onClose();
    navigate(`/map?airport=${airportId}`);
  };

  const handlePackageClick = () => {
    // 패키지 상품 — 패키지 탭으로 진입 (현재는 단일 상세 라우트가 없어 목록으로 안내)
    onClose();
    navigate('/packages');
  };

  /**
   * 권역 추천 항목 클릭 핸들러.
   * (자유 검색어 submit은 비활성화되어 이 함수는 무조건 region.id 로만 호출됨)
   * 매칭된 권역의 hub 공항을 함께 컨텍스트로 설정 → 진입 후 거리 기반 정렬이 활성화됨.
   */
  const submitKeyword = (regionId: string) => {
    const matched = JAPAN_REGIONS.find(r => r.id === regionId);
    if (!matched) return;
    setSelectedRegions([matched.id]);
    const airportId = REGION_TO_AIRPORT[matched.id];
    const ap = airportId ? airports.find(a => a.id === airportId) : null;
    setArrivalContext(ap ? { airportId: ap.id, airportName: ap.name } : null);
    onClose();
    navigate('/search', { state: { fromMap: true } });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col" style={{ maxWidth: '430px', margin: '0 auto', boxShadow: '0 0 24px rgba(0,0,0,0.08)' }}>
      {/* 헤더 */}
      <div className="flex items-center h-12 px-4">
        <h1 className="text-[16px] font-bold text-[#272833] flex-1 text-center">해외 골프 상품 검색</h1>
        <button onClick={onClose} className="p-1 -mr-1" aria-label="닫기">
          <X className="w-5 h-5 text-[#272833]" />
        </button>
      </div>

      {/* 검색 입력 — 자유 검색어 submit은 비활성. 입력값은 추천 리스트 필터링 용도로만 사용 */}
      <div className="px-4 pb-3">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="relative"
        >
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search className="w-5 h-5 text-[#9EABBA]" />
          </span>
          <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="나라, 지역, 공항, 골프장명 검색"
            className="w-full pl-10 pr-10 py-3 bg-[#F0F2F5] rounded-[8px] text-[14px] text-[#272833] outline-none placeholder:text-[#9EABBA]"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-[#E6EBF0]"
              aria-label="입력 초기화"
            >
              <X className="w-4 h-4 text-[#9EABBA]" />
            </button>
          )}
        </form>
      </div>


      {keyword.trim() ? (
        /* 검색어 입력 중 — 자동완성 추천 목록 */
        <div className="flex-1 overflow-y-auto">
          {suggestions.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-[14px] text-[#9EABBA]">
                "<span className="text-[#272833] font-medium">{keyword}</span>"에 해당하는 검색 결과가 없어요
              </p>
              <p className="text-[12px] text-[#C5CDD5] mt-1">지역 또는 골프장명을 다시 입력해 보세요</p>
            </div>
          ) : (
            suggestions.map((s, idx) => (
              <button
                key={`${s.kind}-${s.payload}-${idx}`}
                onClick={() => {
                  if (s.kind === 'airport') handleAirportClick(s.payload);
                  else if (s.kind === 'course') handleCourseClick(s.payload);
                  else if (s.kind === 'package') handlePackageClick();
                  else submitKeyword(s.payload);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 border-b border-[#F0F2F5] text-left hover:bg-[#F9FAFB] transition-colors"
              >
                <span className="w-7 h-7 rounded-full bg-[#F0F2F5] flex items-center justify-center flex-shrink-0">
                  {s.kind === 'region' && <Flag className="w-3.5 h-3.5 text-[#6A7683]" />}
                  {s.kind === 'airport' && <Plane className="w-3.5 h-3.5 text-[#1AB277]" />}
                  {s.kind === 'course' && <MapPin className="w-3.5 h-3.5 text-[#1AB277]" />}
                  {s.kind === 'package' && <Gift className="w-3.5 h-3.5 text-[#D6385A]" />}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[14px] text-[#272833] truncate">{highlightMatch(s.label, keyword)}</span>
                  {s.sub && (
                    <span className="block text-[12px] text-[#9EABBA] mt-0.5 truncate">{s.sub}</span>
                  )}
                </span>
              </button>
            ))
          )}
        </div>
      ) : (
        /* 검색어 미입력 — 비어 있는 슬롯 */
        <div className="flex-1" />
      )}
    </div>
  );
}

/** 추천 라벨 안의 매칭 부분을 강조 (대소문자 무시) */
function highlightMatch(label: string, query: string) {
  const q = query.trim();
  if (!q) return label;
  const idx = label.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return label;
  const before = label.slice(0, idx);
  const hit = label.slice(idx, idx + q.length);
  const after = label.slice(idx + q.length);
  return (
    <>
      {before}
      <span className="text-[#1AB277] font-bold">{hit}</span>
      {after}
    </>
  );
}
