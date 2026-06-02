import { useState } from 'react';
import { useParams } from 'react-router';
import { getCourseById } from '../data/mockData';
import { AppHeader } from './AppHeader';
import { useAppState } from '../data/store';
import { CourseHeroSection } from './course-detail/CourseHeroSection';
import { CourseInfoCard } from './course-detail/CourseInfoCard';
import { CourseTabBar, type CourseTab } from './course-detail/CourseTabBar';
import { TeeTimeTab } from './course-detail/TeeTimeTab';
import { CourseInfoTab } from './course-detail/CourseInfoTab';
import { LegalFooter } from './LegalFooter';

export function CourseDetailPage() {
  const { id } = useParams();
  const course = getCourseById(id || '');

  const [activeTab, setActiveTab] = useState<CourseTab>('teetime');
  const [showToast, setShowToast] = useState(false);

  const handleShare = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // 선택 일자는 store 글로벌 값을 그대로 사용 — 목록/지도에서 선택한 날짜가 상세까지 이어짐
  // (store 디폴트 = 오늘 + DEFAULT_DATE_OFFSET_DAYS)
  const { selectedDate, setSelectedDate } = useAppState();

  if (!course) {
    return (
      <div className="p-8 text-center text-[#9EABBA]">
        <p>골프장을 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <AppHeader title={course.name} showHome border={false} />

      {/* 히어로 이미지 */}
      <CourseHeroSection images={course.images} courseName={course.name} />

      {/* 기본 정보 카드 */}
      <CourseInfoCard course={course} onShare={handleShare} />

      {/* 탭 바 */}
      <CourseTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 탭 콘텐츠 */}
      {activeTab === 'teetime' && (
        <TeeTimeTab
          course={course}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      )}
      {activeTab === 'info' && (
        <CourseInfoTab course={course} />
      )}

      {/* 토스트 메시지 */}
      {showToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] animate-fade-in">
          <div className="bg-[#272833] text-white text-[14px] font-medium px-5 py-3 rounded-[8px] shadow-lg whitespace-nowrap">
            클립보드로 복사되었습니다
          </div>
        </div>
      )}

      <LegalFooter />
    </div>
  );
}
