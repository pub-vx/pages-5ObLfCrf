/**
 * 통신판매중개자 법적고지 — 탐색·예약 흐름 페이지 하단 공용 푸터.
 *
 * 부착 위치
 *  - ExploreTabsPage (실시간/패키지 탭 공용)
 *  - MainPage (/search) 골프장 목록
 *  - 코스 상세 / 체크아웃 / 예약완료 / 예약내역 등 사용자가 보는 거래 페이지
 * 부착 안함
 *  - /map (풀스크린 Leaflet)
 *  - 시트/모달 내부
 *
 * 디자인: 회색 배경 + 작은 본문 — 페이지 본문과 시각적으로 분리되어
 * "광고/UI 콘텐츠" 가 아닌 "고지문" 임을 명확히 한다.
 */
export function LegalFooter() {
  return (
    <footer className="bg-surface-soft px-4 py-4 mt-auto">
      <p className="text-[13px] font-bold text-ink-muted tracking-[-0.2px] mb-1.5">법적고지</p>
      <p className="text-[12px] font-medium text-ink-mid tracking-[-0.2px] leading-relaxed break-keep">
        (주)카카오VX는 통신판매중개시스템의 제공자로서, 통신판매의 당사자가 아니며 상품의 예약 및 결제, 환불 등과 관련된 의무는 각 판매자(골프장)에 있습니다.
      </p>
    </footer>
  );
}
