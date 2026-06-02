import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { AppProvider } from './data/store';
import { RealtimeSearchPage } from './components/RealtimeSearchPage';
import { PackagesSearchPage } from './components/PackagesSearchPage';
import { MainPage } from './components/MainPage';

// 무거운 페이지는 lazy load
const CourseDetailPage = lazy(() => import('./components/CourseDetailPage').then(m => ({ default: m.CourseDetailPage })));
const CheckoutPage = lazy(() => import('./components/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const CompletePage = lazy(() => import('./components/CompletePage').then(m => ({ default: m.CompletePage })));
const BookedPage = lazy(() => import('./components/BookedPage').then(m => ({ default: m.BookedPage })));
const CashbackEventPage = lazy(() => import('./components/CashbackEventPage').then(m => ({ default: m.CashbackEventPage })));
const CartCheckoutPage = lazy(() => import('./components/CartCheckoutPage').then(m => ({ default: m.CartCheckoutPage })));
const FaqPage = lazy(() => import('./components/FaqPage').then(m => ({ default: m.FaqPage })));
const MyReservationsPage = lazy(() => import('./components/MyReservationsPage').then(m => ({ default: m.MyReservationsPage })));
const MapPage = lazy(() => import('./components/MapPage').then(m => ({ default: m.MapPage })));
const BeginnerGuidePage = lazy(() => import('./components/BeginnerGuidePage').then(m => ({ default: m.BeginnerGuidePage })));
const DayTripPage = lazy(() => import('./components/DayTripPage').then(m => ({ default: m.DayTripPage })));
const FlightSearchPage = lazy(() => import('./components/FlightSearchPage').then(m => ({ default: m.FlightSearchPage })));
const RecommendPage = lazy(() => import('./components/RecommendPage').then(m => ({ default: m.RecommendPage })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-[#1AB277] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/**
 * v3 라우팅
 * - `/` → `/realtime` 으로 리다이렉트 (별도 홈 없음)
 * - `/realtime` → 실시간 예약 탭
 * - `/packages` → 패키지 탭 (PackagesSearchPage)
 * - 그 외 경로는 v2 유지 (코스 상세 / 체크아웃 / 예약내역 / 지도 등)
 */
export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
          <div id="mobile-container" className="w-full max-w-[430px] min-h-screen bg-[#F9FAFB] shadow-2xl relative">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Navigate to="/realtime" replace />} />
                <Route path="/realtime" element={<RealtimeSearchPage />} />
                <Route path="/packages" element={<PackagesSearchPage />} />
                <Route path="/search" element={<MainPage />} />
                <Route path="/course/:id" element={<CourseDetailPage />} />
                <Route path="/checkout/:courseId/:planId" element={<CheckoutPage />} />
                <Route path="/complete/:reservationId" element={<CompletePage />} />
                <Route path="/booked/:reservationId" element={<BookedPage />} />
                <Route path="/event/cashback" element={<CashbackEventPage />} />
                <Route path="/cart/:itineraryId" element={<CartCheckoutPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/my-reservations" element={<MyReservationsPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/beginner-guide" element={<BeginnerGuidePage />} />
                <Route path="/daytrip" element={<DayTripPage />} />
                <Route path="/flight-search" element={<FlightSearchPage />} />
                <Route path="/recommend" element={<RecommendPage />} />
              </Routes>
            </Suspense>
          </div>
        </div>
        <Toaster
          position="top-center"
          richColors
          style={{
            width: '430px',
            maxWidth: '100vw',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
          toastOptions={{
            style: { fontSize: '13px' },
          }}
        />
      </AppProvider>
    </HashRouter>
  );
}
