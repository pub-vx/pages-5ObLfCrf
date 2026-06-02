// 지리/공항 관련 순수 유틸.
// MapPage / GolfCourseList / 카드 컴포넌트에서 공용으로 사용.
import {
  airports,
  distanceKm,
  type Airport,
  type GolfCourse,
} from '../data/mockData';

/**
 * "후쿠오카공항에서 약 28km" 형식의 거리 문자열 생성.
 * 일본 외 나라(country !== 'jp')의 코스는 좌표 기반 가까운 공항을 알 수 없으므로
 * seed 가 제공한 `course.distance` 라벨을 그대로 사용.
 */
export function formatCourseDistance(
  course: Pick<GolfCourse, 'latitude' | 'longitude' | 'country' | 'distance'>,
): string {
  if (course.country && course.country !== 'jp') {
    return course.distance ?? '';
  }
  const { airport, km } = findNearestAirport(course);
  const rounded = Math.round(km);
  return `${airport.name}에서 약 ${rounded}km`;
}

/**
 * 차량 이동 시간 상한(분). 이 값을 초과하면 카드의 도착 예상 시각 표기를 생략하고
 * 시간 라벨은 그대로 노출 (장거리 케이스에서 거리감만 안내)
 */
export const MAX_DRIVETIME_MINUTES = 300;

/** 직선거리(km)를 차량 이동 시간(분)으로 환산. 도로 우회율 1.3× + 평균 50km/h 가정 */
export function kmToMinutes(km: number): number {
  const roadKm = km * 1.3;
  const minutes = (roadKm / 50) * 60;
  return Math.round(minutes / 5) * 5 || 5; // 5분 단위 반올림, 최소 5분
}

/**
 * 차량 이동 분을 사람이 읽기 좋은 문자열로 포맷.
 * - <60분: "45분"
 * - 60분 이상: "X시간 Y분" (분 0이면 "2시간")
 *
 * 직선 거리가 매우 먼 케이스에도 "장거리" 같은 추상 라벨 대신 실제 시간을 그대로 보여줘
 * 사용자가 거리감을 가늠할 수 있도록 한다 (예: "7시간 56분").
 */
export function formatDriveMinutes(minutes: number): string {
  if (minutes <= 0) return '0분';
  if (minutes < 60) return `${minutes}분`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
}

/**
 * 주어진 골프장에서 전체 공항 중 가장 가까운 공항을 반환.
 * mockData의 `nearestAirportId` 필드는 수동 관리라 틀릴 수 있어
 * 좌표 기반으로 항상 동적으로 계산한다.
 */
export function findNearestAirport(course: Pick<GolfCourse, 'latitude' | 'longitude'>): {
  airport: Airport;
  km: number;
} {
  let nearest = airports[0];
  let nearestKm = distanceKm(
    course.latitude,
    course.longitude,
    nearest.latitude,
    nearest.longitude,
  );
  for (let i = 1; i < airports.length; i++) {
    const a = airports[i];
    const k = distanceKm(course.latitude, course.longitude, a.latitude, a.longitude);
    if (k < nearestKm) {
      nearest = a;
      nearestKm = k;
    }
  }
  return { airport: nearest, km: nearestKm };
}

/**
 * 특정 공항 반경 `radiusKm` 이내의 골프장 목록.
 * 단, 선택 공항이 해당 골프장의 가장 가까운 공항인 경우만 포함.
 * → 이바라키 선택 시 나리타가 더 가까운 골프장은 활성화되지 않음.
 */
export function coursesNearAirport(
  courses: GolfCourse[],
  airport: Airport,
  radiusKm: number,
): { course: GolfCourse; kmFromSelected: number; nearest: Airport; nearestKm: number }[] {
  const out: { course: GolfCourse; kmFromSelected: number; nearest: Airport; nearestKm: number }[] = [];
  for (const c of courses) {
    const kmFromSelected = distanceKm(c.latitude, c.longitude, airport.latitude, airport.longitude);
    if (kmFromSelected > radiusKm) continue;
    const { airport: nearest, km: nearestKm } = findNearestAirport(c);
    // 선택 공항이 이 골프장의 최근접 공항이 아니면 제외
    if (nearest.id !== airport.id) continue;
    out.push({ course: c, kmFromSelected, nearest, nearestKm });
  }
  return out;
}
