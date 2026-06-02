import { useState, useEffect, useMemo, useRef } from 'react';
import { Check, Map, List, ChevronDown, RotateCcw } from 'lucide-react';
import { COUNTRIES } from '../../lib/countries';
import { RegionMapView } from './RegionMapView';
import { toggleInArray } from '../../lib/selection';
import { useAppState } from '../../data/store';
import { mockCourses } from '../../data/mockData';
import { buildOverseasCourses } from '../../data/overseasCourses';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 어디로(권역) 선택 바텀시트.
 *
 * UX 규칙:
 *  - 나라 추가: 그 나라의 모든 권역을 자동 선택 (사용자가 명시적으로 해제 가능)
 *  - 나라 해제: 그 나라의 권역/하위지역 자동 정리
 *  - 나라 추가 시 본문 스크롤이 해당 나라 섹션으로 자동 이동 (가시성 확보)
 *  - 2차 권역(현·도시) 필터는 본 시트에서 분리되어 FilterSheet "지역 선택" 탭에서 제공
 *
 * 레이아웃: DateSheet와 동일한 ui/Sheet 패턴 (X 자동 우상단, 좌측 타이틀, 풋터 CTA)
 */
export function RegionPickerA({ open, onOpenChange }: Props) {
  const {
    selectedCountries, setSelectedCountries,
    selectedRegions, setSelectedRegions,
    selectedSubRegions, setSelectedSubRegions,
  } = useAppState();

  const [pendingCountries, setPendingCountries] = useState<string[]>(selectedCountries);
  const [pendingRegions, setPendingRegions] = useState<string[]>(selectedRegions);
  const [pendingSubRegions, setPendingSubRegions] = useState<string[]>(selectedSubRegions);
  // 본문 보기 모드 — 리스트 ⇄ 지도 (같은 시트 안에서 전환)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  // 권역별 세부지역 펼침 상태 — 선택과 독립적으로 토글 가능 (체크박스 클릭 시 자동 펼침/접힘)
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const toggleExpand = (id: string) => {
    setExpandedRegions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 스크롤 컨테이너 + 각 나라 섹션 ref (나라 추가 시 자동 스크롤용)
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const countrySectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 시트 열릴 때마다 외부 store 값으로 동기화 (DateSheet 패턴)
  // selectedRegions 가 빈 배열이면 "필터 없음(전체)" 의미 — 시각화 시에는
  // 그 나라의 모든 권역을 체크된 상태로 노출해야 사용자가 현재 상태를 이해할 수 있음
  useEffect(() => {
    if (open) {
      setViewMode('list'); // 열 때마다 리스트 모드로 시작
      setPendingCountries(selectedCountries);
      if (selectedRegions.length === 0) {
        const country = COUNTRIES.find(c => c.code === (selectedCountries[0] ?? 'jp'));
        setPendingRegions(country ? country.regions.map(r => r.id) : []);
      } else {
        setPendingRegions(selectedRegions);
      }
      setPendingSubRegions(selectedSubRegions);
    }
  }, [open, selectedCountries, selectedRegions, selectedSubRegions]);

  // 지도 좌표는 일본만 제공 — 다른 나라 선택 시 리스트 모드로 강제 복귀
  useEffect(() => {
    if (pendingCountries[0] !== 'jp') setViewMode('list');
  }, [pendingCountries]);

  // (국가, 1차 권역) → 골프장 수 집계
  //  - 일본(mockCourses) 의 c.region 은 prefecture 명 (예: '후쿠오카')
  //  - 해외(overseasCourses) 의 c.region 은 "북부 · 하노이" 형태
  //  - 두 케이스 모두 c.region 또는 c.address 에 subRegion 문자열이 포함되어 있으면 매칭
  //    → 일본과 동일한 매칭 규칙(isCourseInCountryRegions)을 그대로 따른다
  const regionCounts = useMemo(() => {
    const all = [...mockCourses, ...buildOverseasCourses()];
    const map: Record<string, number> = {};
    for (const c of all) {
      const courseCountry = c.country ?? 'jp';
      const country = COUNTRIES.find(cc => cc.code === courseCountry);
      if (!country) continue;
      for (const r of country.regions) {
        // 해외 코스: c.region 이 곧 1차 권역 id ('북부' 등) → 직접 비교 우선
        // 일본 코스: c.region 이 prefecture → subRegions 포함 검사
        const matched = c.region === r.id
          || r.subRegions.some(sub =>
            (c.region && c.region.includes(sub))
            || (c.subRegion && c.subRegion.includes(sub))
            || (c.address && c.address.includes(sub))
          );
        if (matched) {
          // 키를 country.code:regionId 로 두면 동명(예: 베트남'북부' vs 대만'북부') 충돌을 막을 수 있음
          const key = `${country.code}:${r.id}`;
          map[key] = (map[key] || 0) + 1;
        }
      }
    }
    return map;
  }, []);

  // 단일 선택 — 칩 탭 시 그 나라로 교체. 동일 칩 재탭은 무시 (해제 없음 — 최소 1개 유지)
  //  · 나라 변경 시 그 나라의 모든 권역 자동 선택 + 2차 권역 초기화
  const selectCountry = (code: string) => {
    if (pendingCountries[0] === code) return;
    const country = COUNTRIES.find(c => c.code === code);
    if (!country) return;
    setPendingCountries([code]);
    setPendingRegions(country.regions.map(r => r.id)); // 그 나라의 모든 권역 자동 선택
    setPendingSubRegions([]); // 2차 권역 초기화
    // 다음 페인트 후 해당 나라 섹션으로 스크롤
    requestAnimationFrame(() => {
      const section = countrySectionRefs.current[code];
      const container = scrollContainerRef.current;
      if (section && container) {
        const sectionTop = section.offsetTop - container.offsetTop;
        container.scrollTo({ top: sectionTop - 12, behavior: 'smooth' });
      }
    });
  };

  const toggleRegion = (id: string) => {
    setPendingRegions(prev => {
      const next = toggleInArray(prev, id);
      const willSelect = next.includes(id);
      // 권역 해제 시 그 권역에 속한 2차 권역도 선택 해제
      if (!willSelect) {
        const region = COUNTRIES.flatMap(c => c.regions).find(r => r.id === id);
        if (region) {
          const subs = new Set<string>([...region.subRegions, ...(region.displaySubRegions ?? [])]);
          setPendingSubRegions(p => p.filter(s => !subs.has(s)));
        }
      }
      // 선택 시 자동 펼침, 해제 시 자동 접힘 (사용자가 chevron 으로 별도 제어 가능)
      setExpandedRegions(prevExp => {
        const nextExp = new Set(prevExp);
        if (willSelect) nextExp.add(id);
        else nextExp.delete(id);
        return nextExp;
      });
      return next;
    });
  };

  /**
   * 세부지역(2차 권역) 토글.
   *  - 1차 권역이 미선택 상태에서도 chevron 으로 펼쳐서 sub 선택 가능
   *  - sub 를 "추가" 할 때 부모 1차 권역이 미선택이면 자동 체크 (handleConfirm 에서
   *    미선택 부모의 sub 는 필터링되어 사라지기 때문에 정합성 확보 필요)
   *  - sub 를 "제거" 할 때는 부모 상태에 손대지 않음 (사용자 의도 보존)
   */
  const toggleSubRegion = (sub: string, parentRegionId?: string) => {
    const willAdd = !pendingSubRegions.includes(sub);
    setPendingSubRegions(prev => toggleInArray(prev, sub));
    if (willAdd && parentRegionId && !pendingRegions.includes(parentRegionId)) {
      setPendingRegions(prev => (prev.includes(parentRegionId) ? prev : [...prev, parentRegionId]));
    }
  };

  // 초기화 — 기본 나라(일본) + 그 나라 전체 권역 (디폴트 상태로 복귀)
  const resetAll = () => {
    const jp = COUNTRIES.find(c => c.code === 'jp');
    setPendingCountries(['jp']);
    setPendingRegions(jp ? jp.regions.map(r => r.id) : []);
    setPendingSubRegions([]);
  };

  // 현재 pending 상태가 default (JP 단독 + JP 전체 권역 + sub 0개) 와 동일한지 — 초기화 버튼 활성/비활성 판단
  const isDefaultState = useMemo(() => {
    const jp = COUNTRIES.find(c => c.code === 'jp');
    if (!jp) return false;
    const allJpRegionIds = jp.regions.map(r => r.id);
    return (
      pendingCountries.length === 1 &&
      pendingCountries[0] === 'jp' &&
      pendingRegions.length === allJpRegionIds.length &&
      allJpRegionIds.every(id => pendingRegions.includes(id)) &&
      pendingSubRegions.length === 0
    );
  }, [pendingCountries, pendingRegions, pendingSubRegions]);

  const handleConfirm = () => {
    setSelectedCountries(pendingCountries);
    setSelectedRegions(pendingRegions);
    // 선택된 2차 권역 중, 현재 선택된 1차 권역에 속하는 것만 유지
    if (pendingRegions.length === 0) {
      setSelectedSubRegions([]);
    } else {
      const allowedSubs = new Set(
        COUNTRIES.flatMap(c => c.regions.filter(r => pendingRegions.includes(r.id))
          .flatMap(r => [...r.subRegions, ...(r.displaySubRegions ?? [])]))
      );
      setSelectedSubRegions(pendingSubRegions.filter(s => allowedSubs.has(s)));
    }
    onOpenChange(false);
  };

  const selectedCountryData = COUNTRIES.filter(c => pendingCountries.includes(c.code));

  // CTA 라벨 — 단일 나라 모델
  let ctaLabel: string;
  if (selectedCountryData.length === 0) {
    ctaLabel = '나라를 선택해 주세요';
  } else {
    const country = selectedCountryData[0];
    const allRegionsForCountry = country.regions.map(r => r.id);
    const selInThis = pendingRegions.filter(r => allRegionsForCountry.includes(r));
    const isAllRegions = selInThis.length === 0 || selInThis.length === allRegionsForCountry.length;
    ctaLabel = isAllRegions
      ? `${country.name} 전체로 검색`
      : `${selInThis.length}개 권역으로 검색`;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-[#E6EBF0]">
          <SheetTitle className="text-[16px] font-bold text-[#272833] tracking-[-0.3px] text-left">어디로 떠나시나요?</SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* 나라 선택 칩 — 고정. 초기화 버튼은 푸터 CTA 좌측으로 이동됨 */}
          <div className="px-5 pt-4 pb-3 border-b border-[#F0F2F5] flex-shrink-0">
            <p className="text-[13px] font-bold text-[#272833] tracking-[-0.2px] mb-2">나라 선택</p>
            <div className="flex flex-wrap gap-1.5">
              {COUNTRIES.map(c => {
                const isSel = pendingCountries.includes(c.code);
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => selectCountry(c.code)}
                    className={`inline-flex items-center gap-1 px-3 h-9 rounded-full text-[13px] tracking-[-0.2px] border transition-colors ${
                      isSel
                        ? 'bg-white border-[#272833] text-[#272833] font-bold'
                        : 'bg-white border-[#D9E0E8] text-[#9EABBA] font-medium'
                    }`}
                  >
                    <span className="text-[14px] leading-none">{c.flag}</span>
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* [리스트 ⇄ 지도] 토글 — 좌측 고정.
              토글 프레임(리스트 버튼)은 항상 노출되어 나라 전환 시 레이아웃 덜컹 방지.
              [지도] 버튼은 현재 일본만 지원되므로 jp 일 때만 추가로 렌더. */}
          <div className="px-5 pt-3 pb-1.5 flex-shrink-0">
            <div className="inline-flex rounded-[8px] bg-[#F0F2F5] p-0.5 gap-0.5">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-1 px-2.5 h-7 rounded-[6px] text-[12px] font-bold tracking-[-0.2px] transition-colors ${
                  viewMode === 'list' ? 'bg-white text-[#272833] shadow-sm' : 'text-[#6A7683]'
                }`}
              >
                <List className="w-3.5 h-3.5" />리스트
              </button>
              {pendingCountries[0] === 'jp' && (
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`inline-flex items-center gap-1 px-2.5 h-7 rounded-[6px] text-[12px] font-bold tracking-[-0.2px] transition-colors ${
                    viewMode === 'map' ? 'bg-white text-[#272833] shadow-sm' : 'text-[#6A7683]'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />지도
                </button>
              )}
            </div>
          </div>

          {viewMode === 'map' ? (
            /* 지도 모드 — 같은 시트 본문에 인라인 렌더 (풀스크린 모달 아님) */
            <div className="flex-1 min-h-0">
              <RegionMapView
                selectedRegions={pendingRegions}
                onToggleRegion={toggleRegion}
                regionCounts={regionCounts}
                countryCode={pendingCountries[0] ?? 'jp'}
              />
            </div>
          ) : (
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pb-2">
            {selectedCountryData.length === 0 && (
              <p className="px-5 py-6 text-[12px] font-medium text-[#9EABBA] tracking-[-0.2px] text-center">
                먼저 나라를 1개 이상 선택해 주세요
              </p>
            )}

            {selectedCountryData.map(country => (
              <div
                key={country.code}
                ref={el => { countrySectionRefs.current[country.code] = el; }}
                className="mb-2 last:mb-0"
              >
                <p className="px-5 pt-3 pb-1.5 text-[12px] font-bold text-[#535D67] tracking-[-0.2px] flex items-center gap-1.5">
                  <span>{country.flag}</span>
                  <span>{country.name}</span>
                </p>
                {country.regions.map(r => {
                  const isSel = pendingRegions.includes(r.id);
                  const count = regionCounts[`${country.code}:${r.id}`] || 0;
                  const subList = r.displaySubRegions ?? r.subRegions;
                  const selSubCount = subList.filter(s => pendingSubRegions.includes(s)).length;
                  // [전체] 활성 조건: 부모 권역이 선택된 상태이면서, 세부 미선택(0) 또는 모두 선택 일 때만.
                  //  - 부모 미선택 시: 펼쳐서 sub 만 미리 보는 상태라 "전체" 가 의미를 갖지 않음 → 비활성
                  const isAllSub = isSel && (selSubCount === 0 || selSubCount === subList.length);
                  return (
                    <div key={`${country.code}:${r.id}`} className="border-b border-[#F0F2F5]">
                      <div
                        className={`flex items-stretch transition-colors ${
                          isSel ? 'bg-[#F2FDF7]' : 'hover:bg-[#F9FAFB]'
                        }`}
                      >
                        {/* 권역 선택(체크박스 + 라벨 + 카운트) */}
                        <button
                          type="button"
                          onClick={() => toggleRegion(r.id)}
                          className="flex-1 flex items-center gap-3 px-5 py-3.5 text-left min-w-0"
                        >
                          <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSel ? 'bg-[#1AB277]' : 'border-2 border-[#D9E0E8]'
                          }`}>
                            {isSel && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                          </div>
                          <span className={`flex-1 text-[14px] tracking-[-0.2px] truncate ${isSel ? 'font-bold text-[#272833]' : 'font-medium text-[#272833]'}`}>
                            {r.label}
                            {isSel && selSubCount > 0 && (
                              <span className="ml-1.5 text-[11px] font-bold text-[#1AB277]">세부 {selSubCount}</span>
                            )}
                          </span>
                          <span className="text-[12px] font-medium text-[#9EABBA] tracking-[-0.2px] flex-shrink-0">{count}개</span>
                        </button>
                        {/* 펼침/접힘 — 선택 여부와 무관하게 sub 가 있으면 항상 노출.
                            미선택 상태에서도 세부지역을 미리 펼쳐보고 일부만 골라 담는 동선 지원. */}
                        {subList.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(r.id)}
                            className="flex-shrink-0 px-4 flex items-center text-[#6A7683]"
                            aria-label={expandedRegions.has(r.id) ? '세부지역 접기' : '세부지역 펼치기'}
                            aria-expanded={expandedRegions.has(r.id)}
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${expandedRegions.has(r.id) ? 'rotate-180' : ''}`}
                              strokeWidth={2.2}
                            />
                          </button>
                        )}
                      </div>
                      {/* 2차 권역(현·도시) 칩 — 펼침 상태만으로 노출.
                          부모 선택 여부에 따라 영역 톤만 살짝 바뀌어 시각적 불일치 방지
                          (선택: 옅은 민트 / 미선택: 옅은 회색) */}
                      {expandedRegions.has(r.id) && subList.length > 0 && (
                        <div className={`px-5 pb-3 pt-2 ${isSel ? 'bg-[#F7FCF9]' : 'bg-[#F9FAFB]'}`}>
                          <div className="flex flex-wrap gap-1.5">
                            {/* 전체 칩 — 이 권역의 세부 지역을 모두 해제 = 권역 전체.
                                부모가 아직 미선택이면 함께 자동 체크 ("전체" 는 부모 선택 의미와 동일) */}
                            <button
                              type="button"
                              onClick={() => {
                                const subs = new Set(subList);
                                setPendingSubRegions(prev => prev.filter(s => !subs.has(s)));
                                if (!isSel) {
                                  setPendingRegions(prev => (prev.includes(r.id) ? prev : [...prev, r.id]));
                                }
                              }}
                              className={`inline-flex items-center px-2.5 h-7 rounded-full text-[12px] tracking-[-0.2px] border transition-colors ${
                                isAllSub
                                  ? 'bg-white border-[#272833] text-[#272833] font-bold'
                                  : 'bg-white border-[#D9E0E8] text-[#9EABBA] font-medium'
                              }`}
                            >
                              전체
                            </button>
                            {subList.map(sub => {
                              const subSel = pendingSubRegions.includes(sub);
                              return (
                                <button
                                  key={sub}
                                  type="button"
                                  onClick={() => toggleSubRegion(sub, r.id)}
                                  className={`inline-flex items-center px-2.5 h-7 rounded-full text-[12px] tracking-[-0.2px] border transition-colors ${
                                    subSel
                                      ? 'bg-white border-[#272833] text-[#272833] font-bold'
                                      : 'bg-white border-[#D9E0E8] text-[#9EABBA] font-medium'
                                  }`}
                                >
                                  {sub}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          )}
        </div>

        <div className="border-t border-[#E6EBF0] p-4 bg-white flex items-center gap-3">
          {/* 초기화 — CTA 좌측 보조 액션. default 상태일 땐 비활성(톤다운)으로 "초기화할 게 없다" 신호 */}
          <button
            type="button"
            onClick={resetAll}
            disabled={isDefaultState}
            className={`flex items-center gap-1 text-[13px] font-medium tracking-[-0.2px] transition-colors ${
              isDefaultState ? 'text-[#D9E0E8] cursor-not-allowed' : 'text-[#6A7683] hover:text-[#272833]'
            }`}
            aria-label="선택 초기화"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.2} />
            초기화
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={pendingCountries.length === 0}
            className={`flex-1 py-3.5 rounded-[8px] text-[14px] font-bold tracking-[-0.2px] transition-colors ${
              pendingCountries.length === 0
                ? 'bg-[#F0F2F5] text-[#9EABBA] cursor-not-allowed'
                : 'bg-[#1AB277] hover:bg-[#149867] text-white'
            }`}
          >
            {ctaLabel}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
