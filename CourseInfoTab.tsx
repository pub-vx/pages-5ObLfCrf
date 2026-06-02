import { MapPin, Copy, Phone, Map } from 'lucide-react';
import { toast } from 'sonner';
import type { GolfCourse } from '../../data/mockData';
import { formatCourseDistance } from '../../lib/geo';
import { SellerInfoTable } from '../SellerInfoTable';

interface CourseInfoTabProps {
  course: GolfCourse;
}

export function CourseInfoTab({ course }: CourseInfoTabProps) {
  const copyAddress = () => {
    navigator.clipboard?.writeText(course.addressLocal);
    toast.success('주소가 복사되었습니다');
  };

  return (
    <div>
      {/* 지도 placeholder */}
      <div className="w-full h-44 bg-[#F0F2F5] flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-8 h-8 text-[#1AB277] mx-auto mb-1" />
          <p className="text-[12px] text-[#9EABBA]">지도 영역</p>
        </div>
      </div>

      {/* 골프장명 */}
      <div className="px-4 pt-4 pb-3">
        <h3 className="text-[16px] font-bold text-[#272833]">{course.name}</h3>
      </div>

      {/* 액션 버튼 — 전화 / 지도에서 보기 */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 border border-[#D9E0E8] rounded-[8px] overflow-hidden">
          <button className="flex flex-col items-center justify-center py-3 gap-1.5 border-r border-[#D9E0E8]">
            <Phone className="w-5 h-5 text-[#272833]" />
            <span className="text-[13px] text-[#272833] font-medium">전화</span>
          </button>
          <button className="flex flex-col items-center justify-center py-3 gap-1.5">
            <Map className="w-5 h-5 text-[#272833]" />
            <span className="text-[13px] text-[#272833] font-medium">지도에서 보기</span>
          </button>
        </div>
      </div>

      {/* 기본 정보 테이블 */}
      <div className="border-t border-[#D9E0E8]">
        <InfoRow label="주소">
          <div>
            <p className="text-[13px] text-[#272833]">{course.address}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[12px] text-[#6A7683]">{course.addressLocal}</p>
              <button
                onClick={copyAddress}
                className="flex items-center gap-0.5 text-[11px] text-[#448FFF]"
              >
                <Copy className="w-3 h-3" /> 복사
              </button>
            </div>
          </div>
        </InfoRow>
        <InfoRow label="교통">
          <span className="text-[13px] text-[#272833]">{formatCourseDistance(course)}</span>
        </InfoRow>
        {course.courseDesigner && (
          <InfoRow label="설계">
            <span className="text-[13px] text-[#272833]">{course.courseDesigner}</span>
          </InfoRow>
        )}
        <InfoRow label="구분">
          <span className="text-[13px] text-[#272833]">{course.courseGrade || '대중형'}</span>
        </InfoRow>
        <InfoRow label="규모">
          <span className="text-[13px] text-[#272833]">{course.holes}홀 / Par {course.par}</span>
        </InfoRow>
        {course.koreanSupport && (
          <InfoRow label="한국어 대응">
            <span className="text-[13px] text-[#272833]">{course.koreanSupport}</span>
          </InfoRow>
        )}
      </div>

      {/* 드레스코드 간단 버전 */}
      {course.dressCode && !course.etiquette && (
        <InfoRow label="드레스코드">
          <span className="text-[13px] text-[#272833]">{course.dressCode}</span>
        </InfoRow>
      )}

      {/* 판매자 정보 — 전자상거래법상 통신판매중개자/판매자(공급자) 표시 */}
      <div className="border-t border-[#D9E0E8] mt-2 pt-5 pb-2 px-4">
        <h3 className="text-[14px] font-bold text-[#272833] tracking-[-0.2px] mb-2">판매자 정보</h3>
        <SellerInfoTable course={course} />
      </div>

      {/* 하단 여백 */}
      <div className="h-8" />
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex px-4 py-3 border-b border-[#F0F2F5]">
      <span className="text-[13px] text-[#6A7683] w-[72px] flex-shrink-0">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}
