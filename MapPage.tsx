import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'sonner';
import { Plus, Minus, Crosshair, Search } from 'lucide-react';
import { AppHeader } from './AppHeader';
import { DateStrip } from './DateStrip';
import { FilterBar } from './FilterBar';
import {
  airports,
  distanceKm,
  getCoursesForDate,
  type GolfCourse,
} from '../data/mockData';
import { useAppState } from '../data/store';
import { FilterSheet } from './FilterSheet';
import {
  createCourseMarker,
  createAirportMarker,
  createDistanceLabel,
} from './map/markers';
import { REGION_CENTERS, filterCoursesByRegions } from './map/regions';
import { SelectedCourseCard } from './map/SelectedCourseCard';
import { AirportInfoPanel } from './map/AirportInfoPanel';
import { findNearestAirport, coursesNearAirport } from '../lib/geo';

const AIRPORT_RADIUS_KM = 200;

// ────────────────────────────────────────────────────────────────
// 지도 보조 컴포넌트
// ────────────────────────────────────────────────────────────────

function MapControls({ onResearch, hasSelectedCourse }: { onResearch: () => void; hasSelectedCourse: boolean }) {
  const map = useMap();
  const [moved, setMoved] = useState(false);

  useMapEvents({
    moveend: () => setMoved(true),
  });

  return (
    <>
      <div className={`absolute right-3 z-[400] flex flex-col gap-1 transition-[bottom] duration-200 ${hasSelectedCourse ? 'bottom-[180px]' : 'bottom-4'}`}>
        <button
          onClick={() => map.zoomIn()}
          className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-[#F9FAFB]"
        >
          <Plus className="w-5 h-5 text-[#535D67]" />
        </button>
        <button
          onClick={() => map.zoomOut()}
          className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-[#F9FAFB]"
        >
          <Minus className="w-5 h-5 text-[#535D67]" />
        </button>
        <button
          onClick={() => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                map.setView([pos.coords.latitude, pos.coords.longitude], 12);
                toast.success('현재 위치로 이동했습니다', { position: 'top-center', duration: 2000 });
              },
              () => {
                toast.error('위치 정보 사용을 허용해 주세요.\n설정 > 개인정보 보호 > 위치 서비스에서 변경할 수 있습니다.', { position: 'top-center', duration: 4000 });
              },
              { enableHighAccuracy: true, timeout: 5000 }
            );
          }}
          className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-[#F9FAFB]"
        >
          <Crosshair className="w-5 h-5 text-[#535D67]" />
        </button>
      </div>

      {moved && (
        <button
          onClick={() => { onResearch(); setMoved(false); }}
          className="absolute left-1/2 -translate-x-1/2 top-3 z-[400] flex items-center gap-1.5 px-4 py-2 bg-[#272833] text-white text-xs font-bold rounded-full shadow-md hover:bg-[#1A1B23] animate-fade-in"
        >
          <Search className="w-3.5 h-3.5" />
          이 지역 검색
        </button>
      )}
    </>
  );
}

function ZoomTracker({ onZoom }: { onZoom: (z: number) => void }) {
  useMapEvents({
    zoomend: e => onZoom(e.target.getZoom()),
  });
  return null;
}

// ────────────────────────────────────────────────────────────────
// MapPage
// ────────────────────────────────────────────────────────────────

export function MapPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    availableOnly, setAvailableOnly,
    filterState, setFilterState,
    selectedRegions, setSelectedRegions,
    selectedDate,
    setArrivalContext,
  } = useAppState();

  const [showFilter, setShowFilter] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const initialAirport = searchParams.get('airport');
  const [selectedAirportId, setSelectedAirportId] = useState<string | null>(initialAirport);

  // URL 파라미터로 공항이 지정된 경우 글로벌 컨텍스트 set.
  // 권역 잠금은 하지 않음 — 다른 권역 공항/코스도 지도에서 컨텍스트로 보이게.
  // 카메라는 selectedAirportId useEffect 에서 그 공항으로 fit 처리.
  useEffect(() => {
    if (initialAirport) {
      const ap = airports.find(a => a.id === initialAirport);
      if (ap) {
        setArrivalContext({ airportId: ap.id, airportName: ap.name });
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // 지도 페이지는 일본 한정 (다른 나라는 별도 마커 좌표/권역 지원 전이라 일본만 표시)
  const datedCourses = useMemo(
    () => getCoursesForDate(selectedDate).filter(c => (c.country ?? 'jp') === 'jp'),
    [selectedDate],
  );
  const [visibleCourses, setVisibleCourses] = useState<GolfCourse[]>(datedCourses);
  const [currentZoom, setCurrentZoom] = useState(5);
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // 날짜 변경 시 visibleCourses 갱신
  useEffect(() => {
    setVisibleCourses(datedCourses);
  }, [datedCourses]);

  // ─── 지역 + 예약가능 필터 ───
  const filteredCourses = useMemo(
    () => {
      const byRegion = filterCoursesByRegions(datedCourses, selectedRegions);
      if (availableOnly) {
        return byRegion.filter(c => c.remainingTeams > 0 && c.plans && c.plans.length > 0);
      }
      return byRegion;
    },
    [selectedRegions, datedCourses, availableOnly],
  );

  const toggleRegion = useCallback((region: string) => {
    if (selectedRegions.includes(region)) {
      if (selectedRegions.length === 1) return;
      setSelectedRegions(selectedRegions.filter(r => r !== region));
    } else {
      setSelectedRegions([...selectedRegions, region]);
    }
  }, [selectedRegions, setSelectedRegions]);

  // 지역 변경 시에만 지도 포커싱 — availableOnly 토글 등 다른 필터 변화엔 줌/뷰 유지
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (selectedRegions.length === 1) {
      const cfg = REGION_CENTERS[selectedRegions[0] as keyof typeof REGION_CENTERS];
      if (cfg) {
        map.flyTo(cfg.center, cfg.zoom, { duration: 0.8 });
        return;
      }
    }
    if (filteredCourses.length > 0) {
      const bounds = L.latLngBounds(
        filteredCourses.map(c => [c.latitude, c.longitude] as [number, number]),
      );
      map.flyToBounds(bounds, { padding: [60, 60], duration: 0.8, maxZoom: 9 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegions]);

  // filteredCourses 변경 시 visibleCourses 동기화
  useEffect(() => {
    setVisibleCourses(filteredCourses);
  }, [filteredCourses]);

  // ─── 선택된 골프장 + 동적 nearest airport ───
  const selectedCourse = useMemo(
    () => visibleCourses.find(c => c.id === selectedCourseId) ?? null,
    [visibleCourses, selectedCourseId],
  );

  const selectedCourseNearest = useMemo(
    () => (selectedCourse ? findNearestAirport(selectedCourse) : null),
    [selectedCourse],
  );

  // 선택 시 코스 + 공항이 모두 보이도록 지도 fit
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedCourse || !selectedCourseNearest) return;
    const bounds = L.latLngBounds([
      [selectedCourse.latitude, selectedCourse.longitude],
      [selectedCourseNearest.airport.latitude, selectedCourseNearest.airport.longitude],
    ]);
    map.flyToBounds(bounds, { padding: [80, 80], duration: 0.6, maxZoom: 11 });
  }, [selectedCourseId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── 공항 클릭 → 반경 내 골프장 포커싱 ───
  const airportFocused = useMemo(() => {
    if (!selectedAirportId) return null;
    const selected = airports.find(a => a.id === selectedAirportId);
    if (!selected) return null;
    return {
      selected,
      items: coursesNearAirport(filteredCourses, selected, AIRPORT_RADIUS_KM),
    };
  }, [selectedAirportId, filteredCourses]);

  const airportInfoById = useMemo(() => {
    const map: Record<string, { km: number; name: string }> = {};
    if (airportFocused) {
      for (const item of airportFocused.items) {
        map[item.course.id] = {
          km: Math.round(item.nearestKm),
          name: item.nearest.name,
        };
      }
    }
    return map;
  }, [airportFocused]);

  const handleAirportClick = useCallback((airportId: string) => {
    if (selectedAirportId === airportId) {
      setSelectedAirportId(null);
      setArrivalContext(null);  // 공항 해제 시 글로벌 컨텍스트도 정리
      toast.dismiss();
      return;
    }
    // 다른 공항으로 전환 — 이전 코스 선택 해제.
    //  공항이 1차축(탐색 컨텍스트), 코스는 그 공항 안의 2차 선택이므로
    //  공항을 바꾸면 코스 선택도 리셋해야 지도(새 공항)와 하단 패널이 일치한다.
    //  (해제 없으면 지도는 B로 이동하지만 코스 우선 규칙 탓에 A의 코스 카드가 남아 불일치)
    setSelectedCourseId(null);
    // "이 지역 검색"으로 좁혀진 visibleCourses가 새 공항 반경을 놓치지 않도록 리셋
    setVisibleCourses(filteredCourses);
    setSelectedAirportId(airportId);

    // 피드백: 반경 내 코스 수 + 글로벌 컨텍스트 동기화
    const ap = airports.find(a => a.id === airportId);
    if (ap) {
      const nearby = coursesNearAirport(filteredCourses, ap, AIRPORT_RADIUS_KM);
      toast.info(`${ap.name} 주변 ${nearby.length}개 코스`, { duration: 3000, position: 'top-center' });
      // 공항 기준 컨텍스트 (항공편 정보 없이) — 목록보기 전환 시 자동 인계
      setArrivalContext({ airportId: ap.id, airportName: ap.name });
    }
  }, [selectedAirportId, filteredCourses]);

  // 공항 선택 시 반경 골프장을 모두 보이도록 지도 fit
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !airportFocused) return;
    const points: [number, number][] = [
      [airportFocused.selected.latitude, airportFocused.selected.longitude],
      ...airportFocused.items.map(i => [i.course.latitude, i.course.longitude] as [number, number]),
    ];
    // 비대칭 패딩 — 상단(검색바·이지역검색 ~120px) + 하단(AirportInfoPanel ~180px) UI 회피.
    // 좌우는 50px 그대로. 결과: 마커/코스가 UI 오버레이에 가리지 않고 가시 영역 내에 fit.
    const paddingTopLeft: [number, number] = [40, 120];
    const paddingBottomRight: [number, number] = [40, 200];
    if (points.length === 1) {
      // 단일 포인트(공항만) — 중심을 살짝 위로 올려서 하단 panel 안 가리게
      map.flyToBounds(L.latLngBounds([points[0]]).pad(0.5), {
        paddingTopLeft,
        paddingBottomRight,
        duration: 0.8,
        maxZoom: 10,
      });
    } else {
      map.flyToBounds(L.latLngBounds(points), {
        paddingTopLeft,
        paddingBottomRight,
        duration: 0.8,
        maxZoom: 11,
      });
    }
  }, [selectedAirportId, mapReady]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResearch = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = map.getBounds();
    setVisibleCourses(filteredCourses.filter(c => bounds.contains([c.latitude, c.longitude])));
  }, [filteredCourses]);

  // ─── 렌더링용 공항 리스트 (지역 + 줌 필터) ───
  // hub가 없는 지역(도호쿠/주고쿠/시코쿠)의 regional은 줌 6부터 노출
  // selectedRegions 가 비어 있으면 "전체"(필터 없음) — 모든 지역의 공항이 줌 규칙에 따라 노출
  const HUB_REGIONS = new Set(airports.filter(a => a.tier === 'hub').map(a => a.region));
  const visibleAirports = useMemo(() => {
    const isAllRegions = selectedRegions.length === 0;
    return airports.filter(a => {
      if (!isAllRegions && !selectedRegions.includes(a.region)) return false;
      if (a.tier === 'hub') return true;
      // 단일 지역 선택 시 그 지역의 regional 은 모두 노출
      if (!isAllRegions && selectedRegions.length === 1) return true;
      // hub가 없는 지역의 regional: 줌 6부터
      if (!HUB_REGIONS.has(a.region)) return currentZoom >= 6;
      // hub가 있는 지역의 regional: 줌 7부터
      return currentZoom >= 7;
    });
  }, [selectedRegions, currentZoom]);

  // ─── 선택 코스와 nearest airport 거리/중점 (Polyline 용) ───
  const polylineData = useMemo(() => {
    if (!selectedCourse || !selectedCourseNearest) return null;
    const { airport } = selectedCourseNearest;
    return {
      from: [selectedCourse.latitude, selectedCourse.longitude] as [number, number],
      to: [airport.latitude, airport.longitude] as [number, number],
      mid: [
        (selectedCourse.latitude + airport.latitude) / 2,
        (selectedCourse.longitude + airport.longitude) / 2,
      ] as [number, number],
      km: Math.round(
        distanceKm(selectedCourse.latitude, selectedCourse.longitude, airport.latitude, airport.longitude),
      ),
    };
  }, [selectedCourse, selectedCourseNearest]);

  return (
    <div className="absolute inset-0 bg-white flex flex-col">
      {/* 헤더 — 지도/공항별 찾기는 일본 전용이라 국가 선택 드롭다운 미노출. 지도 위 고정(비-sticky) */}
      <AppHeader title="일본 골프장 지도" showHome border={false} sticky={false} zIndex={500}>
        {/* 날짜 스트립 */}
        <DateStrip />

        <FilterBar
          availableOnly={availableOnly}
          setAvailableOnly={setAvailableOnly}
          filterState={filterState}
          selectedRegions={selectedRegions}
          onFilterClick={() => setShowFilter(true)}
          showSort={false}
        />
      </AppHeader>

      {/* 지도 */}
      <div className="flex-1 relative">
        <MapContainer
          center={[36.5, 138.0]}
          zoom={5}
          minZoom={4}
          maxBounds={L.latLngBounds([22, 120], [47, 148])}
          maxBoundsViscosity={1.0}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          ref={ref => { if (ref) { mapRef.current = ref; setMapReady(true); } }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* 골프장 마커 */}
          {visibleCourses.map(course => {
            const isSelected = selectedCourseId === course.id;
            const info = airportInfoById[course.id];
            const inAirportRange = info != null;
            const isDimmed =
              (!!selectedCourseId && !isSelected && !inAirportRange) ||
              (!!selectedAirportId && !inAirportRange && !isSelected);
            return (
              <Marker
                key={`${course.id}-${info?.km ?? 'x'}-${selectedAirportId ?? 'na'}`}
                position={[course.latitude, course.longitude]}
                icon={createCourseMarker(course, isSelected, isDimmed, info?.km, info?.name)}
                zIndexOffset={isSelected ? 1000 : inAirportRange ? 600 : 0}
                eventHandlers={{
                  click: () => setSelectedCourseId(prev => (prev === course.id ? null : course.id)),
                }}
              />
            );
          })}

          {/* 공항 마커 */}
          {visibleAirports.map(airport => {
            const isActive = selectedAirportId === airport.id;
            const compact = airport.tier === 'regional' && currentZoom < 8 && !isActive;
            return (
              <Marker
                key={`airport-${airport.id}-${compact ? 'c' : 'f'}`}
                position={[airport.latitude, airport.longitude]}
                icon={createAirportMarker(airport.name, isActive, compact)}
                zIndexOffset={isActive ? 950 : airport.tier === 'hub' ? 500 : 300}
                eventHandlers={{ click: () => handleAirportClick(airport.id) }}
              />
            );
          })}

          {/* 선택된 골프장 → nearest airport 점선 + km 라벨 */}
          {polylineData && (
            <>
              <Polyline
                positions={[polylineData.from, polylineData.to]}
                pathOptions={{ color: '#272833', weight: 2, dashArray: '6 6', opacity: 0.85 }}
              />
              <Marker
                position={polylineData.mid}
                icon={createDistanceLabel(polylineData.km)}
                interactive={false}
                zIndexOffset={800}
              />
            </>
          )}

          <MapControls onResearch={handleResearch} hasSelectedCourse={!!selectedCourse} />
          <ZoomTracker onZoom={setCurrentZoom} />
        </MapContainer>

        {/* 빈 상태 — 토스트로 안내 */}

        {/* 선택된 골프장 카드 (코스 선택이 우선) */}
        {selectedCourse && (
          <SelectedCourseCard
            course={selectedCourse}
            onOpen={() => navigate(`/course/${selectedCourse.id}`)}
            onClose={() => setSelectedCourseId(null)}
          />
        )}

        {/* 공항 포커스 패널 — 코스 선택이 없을 때 한국 출발지별 직항 매트릭스 노출 */}
        {!selectedCourse && selectedAirportId && (
          <AirportInfoPanel
            airportId={selectedAirportId}
            onClose={() => setSelectedAirportId(null)}
          />
        )}
      </div>

      <FilterSheet
        open={showFilter}
        onOpenChange={setShowFilter}
        initial={filterState}
        onApply={setFilterState}
      />
    </div>
  );
}
