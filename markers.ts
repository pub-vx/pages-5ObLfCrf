// Leaflet DivIcon 팩토리. 순수 함수로 HTML만 생성.
import L from 'leaflet';
import { formatJpy, type GolfCourse } from '../../data/mockData';
import { kmToMinutes, formatDriveMinutes } from '../../lib/geo';

export function createCourseMarker(
  course: GolfCourse,
  isSelected: boolean,
  isDimmed: boolean,
  /** 공항 선택 시: 선택 공항 기준 km */
  airportKm?: number,
  /** 공항 선택 시: 선택 공항 이름 */
  airportName?: string,
  /** 공항 미선택 시: 가장 가까운 공항 km (작은 뱃지) */
  defaultKm?: number,
): L.DivIcon {
  const priceText = formatJpy(course.lowestPrice);

  let kmBadge = '';
  if (airportKm != null) {
    // 공항 선택 상태: 파란 뱃지 (분 단위)
    kmBadge = `<div class="marker-km-badge">✈ 약 ${kmToMinutes(airportKm)}분</div>`;
  } else if (defaultKm != null) {
    // 기본 상태: 회색 뱃지 (분 단위)
    kmBadge = `<div class="marker-km-badge default">✈ 약 ${kmToMinutes(defaultKm)}분</div>`;
  }

  const html = `
    <div class="course-marker ${isSelected ? 'selected' : ''} ${isDimmed ? 'dimmed' : ''}">
      ${kmBadge}
      <div class="marker-name">${course.name}</div>
      <div class="marker-info">
        <span class="marker-teams">${course.plans.length}플랜</span>
        <span class="marker-price">${priceText}</span>
      </div>
      <div class="marker-tail"></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-marker-wrapper',
    iconSize: [180, 70],
    iconAnchor: [90, 70],
  });
}

export function createAirportMarker(name: string, isActive = false, compact = false): L.DivIcon {
  const html = `
    <div class="airport-marker ${isActive ? 'active' : ''} ${compact ? 'compact' : ''}">
      ${compact && !isActive ? '' : `<div class="airport-name">${name}</div>`}
      <div class="airport-icon">✈</div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-marker-wrapper',
    iconSize: compact ? [40, 40] : [120, 60],
    iconAnchor: compact ? [20, 40] : [60, 60],
  });
}

export function createDistanceLabel(km: number): L.DivIcon {
  return L.divIcon({
    html: `<div class="distance-label">약 ${formatDriveMinutes(kmToMinutes(km))}</div>`,
    className: 'custom-marker-wrapper',
    iconSize: [60, 24],
    iconAnchor: [30, 12],
  });
}
