/**
 * 날짜 strip 공용 유틸 — DateStrip / DetailDateStrip 등에서 사용.
 * 오늘부터 N일치 날짜 메타데이터 배열을 생성한다.
 */

export const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'] as const;

export interface DayMeta {
  /** 날짜 객체 (자정 기준) */
  date: Date;
  /** 일 (1~31) */
  day: number;
  /** 월 (1~12) */
  month: number;
  /** 요일 한 글자 ('일'~'토') */
  dayName: string;
  isSunday: boolean;
  isSaturday: boolean;
}

/**
 * 오늘 자정 시작으로 `count` 일치 날짜 메타 배열을 생성.
 * @param count 생성할 일수 (기본 28)
 */
export function generateDays(count = 28): DayMeta[] {
  const days: DayMeta[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      date: d,
      day: d.getDate(),
      month: d.getMonth() + 1,
      dayName: DAY_NAMES[d.getDay()],
      isSunday: d.getDay() === 0,
      isSaturday: d.getDay() === 6,
    });
  }
  return days;
}
