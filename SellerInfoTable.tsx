import type { GolfCourse } from '../data/mockData';
import { getCourseSeller } from '../data/mockData';

interface Props {
  course: GolfCourse;
}

/**
 * 판매자 정보 표 — 전자상거래법상 통신판매중개자/판매자(공급자) 표시.
 * 코스별로 operator/contact 가 분기되며, brand 가 있으면 자동 매핑됨(getCourseSeller).
 * 예약하기/골프장 상세 등 거래 맥락이 있는 화면에서 공용 사용.
 */
export function SellerInfoTable({ course }: Props) {
  const seller = getCourseSeller(course);
  const rows: [string, string][] = [
    ['통신판매중개', '(주)카카오VX'],
    ['중개업 신고', '제2021-성남분당A-0000호'],
    ['판매자(공급자)', `${course.name} · ${seller.operator}`],
    ['소재지', course.addressLocal],
    ['대표 연락처', seller.contact],
    ['결제·환불 책임', '판매자(골프장/제휴사)'],
  ];
  return (
    <div className="rounded-[8px] border border-[#E6EBF0] overflow-hidden">
      {rows.map(([label, value], i) => (
        <div
          key={label}
          className={`flex px-3.5 py-2.5 ${i % 2 ? 'bg-white' : 'bg-[#F9FAFB]'}`}
          style={{ fontSize: 12, letterSpacing: '-0.2px' }}
        >
          <span className="text-[#9EABBA] flex-shrink-0" style={{ width: 92 }}>{label}</span>
          <span className="text-[#393F48] flex-1 break-keep">{value}</span>
        </div>
      ))}
    </div>
  );
}
