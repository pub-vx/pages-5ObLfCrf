import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { JAPAN_REGIONS_DATA } from '../../lib/regions';

/**
 * 어디로(권역) 선택 — 지도 뷰. 어디로 바텀시트 본문에 인라인으로 삽입된다(별도 풀스크린 모달 X).
 * - 리스트(체크박스)와 동일한 selectedRegions 상태를 공유 → 양방향 동기화
 * - 권역 마커 탭 = 토글(추가/해제), 다중 선택 유지
 * - 현재 일본만 좌표 제공. 그 외 나라는 안내 문구로 대체
 */

/** 일본 1차 권역 중심 좌표 (지도 마커 배치용) */
const REGION_CENTERS: Record<string, [number, number]> = {
  '규슈': [32.8, 130.6],
  '간토': [35.9, 139.9],
  '간사이': [34.6, 135.5],
  '주부': [36.2, 137.6],
  '홋카이도': [43.2, 142.6],
  '오키나와': [26.5, 127.9],
  '도호쿠': [39.7, 140.7],
  '시코쿠': [33.7, 133.5],
  '주고쿠': [34.9, 132.4],
};

/**
 * 권역 마커 — 선택 시 브랜드 민트 액센트, 미선택 시 차분한 흰 칩.
 *  선택: 옅은 민트 배경 + 민트 보더 + 다크 민트 텍스트 (브랜드 컬러로 강한 시각 강조)
 *  미선택: 흰 배경 + 옅은 보더 + 중간 회색 텍스트 (가독성 ↑, 노이즈 ↓)
 */
function createRegionMarker(label: string, count: number, selected: boolean): L.DivIcon {
  const bg = selected ? '#F2FDF7' : '#ffffff';
  const border = selected ? '#1AB277' : '#E6EBF0';
  const fg = selected ? '#149867' : '#535D67';
  const countFg = selected ? '#1AB277' : '#9EABBA';
  return L.divIcon({
    className: '',
    html: `<div style="
      display:inline-flex;align-items:center;gap:5px;white-space:nowrap;
      padding:5px 11px;border-radius:999px;font-size:13px;font-weight:700;letter-spacing:-0.2px;
      border:2px solid ${border};
      background:${bg};
      color:${fg};
      box-shadow:0 2px 8px rgba(15,23,42,0.15);
      transform:translate(-50%,-50%);
    ">${selected ? '✓&nbsp;' : ''}${label}<span style="font-size:11px;font-weight:600;color:${countFg}">${count}</span></div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

/** 인라인 전환 직후 컨테이너 크기 재계산 (flex 영역 안에서 0 → 정상) */
function InvalidateOnMount() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

interface Props {
  selectedRegions: string[];
  onToggleRegion: (id: string) => void;
  /** `${countryCode}:${regionId}` → 골프장 수 */
  regionCounts: Record<string, number>;
  countryCode: string;
}

export function RegionMapView({ selectedRegions, onToggleRegion, regionCounts, countryCode }: Props) {
  // 지도 좌표는 현재 일본만 제공
  if (countryCode !== 'jp') {
    return (
      <div className="h-full flex items-center justify-center px-8 text-center bg-[#EAF1F4]">
        <p className="text-[13px] font-medium text-[#9EABBA] tracking-[-0.2px] leading-relaxed">
          선택하신 나라는 지도 선택을 준비 중이에요.<br />리스트에서 권역을 선택해 주세요.
        </p>
      </div>
    );
  }

  // 선택된 권역 수 — 상단 헬퍼 칩에 표시
  const selectedCount = JAPAN_REGIONS_DATA.filter(r => selectedRegions.includes(r.id)).length;

  return (
    <div className="h-full relative bg-[#EAF1F4]">
      <MapContainer
        center={[37.6, 137.5]}
        zoom={4}
        minZoom={4}
        maxZoom={7}
        maxBounds={L.latLngBounds([22, 120], [47, 148])}
        maxBoundsViscosity={1.0}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <InvalidateOnMount />
        {JAPAN_REGIONS_DATA.map(r => {
          const pos = REGION_CENTERS[r.id];
          if (!pos) return null;
          const sel = selectedRegions.includes(r.id);
          const count = regionCounts[`${countryCode}:${r.id}`] || 0;
          return (
            <Marker
              key={`${r.id}-${sel}`}
              position={pos}
              icon={createRegionMarker(r.label, count, sel)}
              eventHandlers={{ click: () => onToggleRegion(r.id) }}
            />
          );
        })}
      </MapContainer>

      {/* 상단 헬퍼 칩 — 현재 선택 상태 안내 (지도 위 floating). 마커 탭 안내까지 겸함 */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
        <div className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-[0_2px_8px_rgba(15,23,42,0.10)] border border-[#E6EBF0]">
          <p className="text-[12px] font-medium tracking-[-0.2px] text-[#535D67]">
            {selectedCount === 0
              ? '마커를 탭해 권역을 선택하세요'
              : <><span className="font-bold text-[#1AB277]">{selectedCount}개</span> 권역 선택됨</>}
          </p>
        </div>
      </div>
    </div>
  );
}
