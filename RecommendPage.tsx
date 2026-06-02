import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plane, ChevronRight, Sparkles } from 'lucide-react';
import { AppHeader } from './AppHeader';
import { TRIP_THEMES } from '../lib/curations';
import { KOREAN_DEPARTURES } from '../data/flightDurations';
import { useAppState } from '../data/store';
import { DEFAULT_FILTER } from './FilterSheet';

/** TRIP_THEMES.id → DayTripPage TripMode 매핑 */
const THEME_TO_MODE: Record<string, 'daytrip' | 'onenight' | 'weekend'> = {
  daytrip: 'daytrip',
  '1n2d': 'onenight',
  '2n3d': 'weekend',
  '3n4d': 'weekend', // 별도 모드 없음 → 주말 여행으로 fallback
};

/** 언제 떠나시나요? — 시기 옵션 (custom = 직접 날짜 지정) */
const PERIOD_OPTS = [
  { id: 'thisWeek', label: '이번 주' },
  { id: 'nextWeek', label: '다음 주' },
  { id: 'thisMonth', label: '이번 달' },
  { id: 'nextMonth', label: '다음 달' },
  { id: 'anyTime', label: '한 달 내 아무 때나' },
  { id: 'custom', label: '📅 날짜 지정' },
];

const fmtYmd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fmtKor = (s: string) => {
  if (!s) return '';
  const [y, m, d] = s.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dow = ['일','월','화','수','목','금','토'][date.getDay()];
  return `${m}/${d} (${dow})`;
};

/** 로딩 화면에 순차 표기되는 카피 */
const LOADING_STEPS = [
  '✈️ 출발지에서 직항 가능한 항공편 찾는 중...',
  '⛳ 일정에 맞는 골프장 매칭 중...',
  '💰 가성비 좋은 조합 비교 중...',
  '✨ 딱 맞는 일정 추천 완성!',
];

/**
 * "✨ 어디 갈지 정하기 전이라면, 추천 받아보세요" 랜딩 페이지.
 *
 * 입력 → 추천 검색
 * - 테마 (1박2일 / 2박3일 / 3박4일 / 당일치기 도전)
 * - 출발 공항 (선택)
 * - 인원 (디폴트 4)
 *
 * 결과: 입력값을 기반으로 selectedDate/endDate, departureAirport 를 셋팅하고
 * /search 로 진입. quickCuration 은 사용하지 않음.
 */
export function RecommendPage() {
  const navigate = useNavigate();
  const { selectedDate, departureAirport, setDepartureAirport, setFilterState, setSortBy, setQuickCuration } = useAppState();

  const [theme, setTheme] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('anyTime');
  const [customStart, setCustomStart] = useState<string>(fmtYmd(new Date(selectedDate)));
  const [customEnd, setCustomEnd] = useState<string>('');
  const [players, setPlayers] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const selectedTheme = TRIP_THEMES.find(t => t.id === theme);
  const canSubmit = !!theme; // 테마 또는 일정 길이(동기화) 선택되어 있으면 OK
  const periodLabel = period === 'custom'
    ? (customEnd
        ? `${fmtKor(customStart)} ~ ${fmtKor(customEnd)}`
        : customStart
        ? `${fmtKor(customStart)} 출국`
        : '날짜 지정')
    : (PERIOD_OPTS.find(p => p.id === period)?.label ?? '');

  const handleSubmit = () => {
    if (!selectedTheme) return;
    // 필터 초기화 + 추천순 정렬
    setFilterState(DEFAULT_FILTER);
    setSortBy('recommended');
    setQuickCuration(null);

    // 로딩 시퀀스 시작 → 마지막에 즉흥 골프 큐레이션 페이지로 진입
    setIsLoading(true);
    setLoadingStep(0);
    const stepInterval = setInterval(() => {
      setLoadingStep(s => {
        if (s >= LOADING_STEPS.length - 1) return s;
        return s + 1;
      });
    }, 600);
    setTimeout(() => {
      clearInterval(stepInterval);
      const mode = THEME_TO_MODE[selectedTheme.id] ?? 'onenight';
      navigate(`/daytrip?mode=${mode}`, { state: { fromRecommend: true } });
    }, 2400);
  };

  // 테마 기반 결과 미리보기
  const summary = selectedTheme
    ? `${selectedTheme.title} ${selectedTheme.hint} · ${periodLabel} · ${KOREAN_DEPARTURES.find(d => d.id === departureAirport)?.short ?? '인천'}(${departureAirport}) 출발 · ${players}인`
    : '일정을 선택해주세요';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F2FDF7] via-white to-[#E0F7ED] flex flex-col items-center justify-center px-8">
        {/* 메인 일러스트 — 회전하는 골프공 + 비행기 */}
        <div className="relative w-32 h-32 mb-8">
          <div
            className="absolute inset-0 rounded-full border-[3px] border-[#1AB277]/20 border-t-[#1AB277] animate-spin"
            style={{ animationDuration: '1.2s' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span style={{ fontSize: 48 }}>⛳</span>
          </div>
          <div
            className="absolute -top-2 right-2 animate-bounce"
            style={{ fontSize: 24, animationDuration: '1.4s' }}
          >
            ✈️
          </div>
        </div>

        {/* 메인 카피 */}
        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white rounded-[20px] mb-3">
          <Sparkles className="w-3 h-3 text-[#149867]" />
          <span
            className="text-[#149867]"
            style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-0.2px' }}
          >
            맞춤 일정 만드는 중
          </span>
        </div>
        <h2
          className="text-[#272833] text-center mb-2"
          style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}
        >
          {selectedTheme?.title}
        </h2>
        <p
          className="text-[#535D67] text-center mb-8"
          style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.2px' }}
        >
          {summary}
        </p>

        {/* 단계별 진행 */}
        <div className="w-full max-w-[280px] space-y-2">
          {LOADING_STEPS.map((step, i) => {
            const done = i < loadingStep;
            const active = i === loadingStep;
            return (
              <div
                key={i}
                className={`flex items-center gap-2 px-3 py-2 rounded-[8px] transition-all ${
                  active
                    ? 'bg-white border border-[#1AB277]'
                    : done
                    ? 'bg-white/70 opacity-50'
                    : 'bg-white/40 opacity-30'
                }`}
              >
                {done ? (
                  <span
                    className="w-4 h-4 bg-[#1AB277] text-white rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ fontSize: 9 }}
                  >
                    ✓
                  </span>
                ) : active ? (
                  <span className="w-4 h-4 border-2 border-[#1AB277] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                ) : (
                  <span className="w-4 h-4 bg-[#D9E0E8] rounded-full flex-shrink-0" />
                )}
                <span
                  className={done || active ? 'text-[#272833]' : 'text-[#9EABBA]'}
                  style={{ fontSize: 12, fontWeight: active ? 700 : 500, letterSpacing: '-0.2px' }}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <AppHeader title="추천 받아보기" showHome />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#F2FDF7] to-[#E0F7ED] px-5 py-6">
        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white rounded-[20px] mb-2">
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-0.2px' }} className="text-[#149867]">
            ✨ 어디 갈지 못 정한 분께
          </span>
        </div>
        <h2
          className="text-[#272833] leading-tight"
          style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}
        >
          몇 가지만 알려주시면<br />딱 맞는 골프 일정 추천해드려요
        </h2>
      </div>

      {/* Step 1 — 테마 */}
      <div className="px-5 py-5 border-b border-[#F0F2F5]">
        <div className="flex items-baseline gap-1.5 mb-3">
          <span
            className="px-1.5 py-0.5 bg-[#272833] text-white rounded-[4px]"
            style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0 }}
          >
            STEP 1
          </span>
          <p
            className="text-[#272833]"
            style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.3px' }}
          >
            언제, 어떤 일정으로 다녀오실래요?
          </p>
        </div>

        <div className="space-y-1.5">
          {TRIP_THEMES.map(t => {
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`w-full rounded-[8px] bg-gradient-to-br ${t.gradient} px-3 py-2 text-left transition-all flex items-center gap-2.5 ${
                  active ? 'ring-2 ring-[#272833]' : ''
                }`}
              >
                <span style={{ fontSize: 20 }}>{t.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p
                      className={t.textColor}
                      style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.2px' }}
                    >
                      {t.title}
                    </p>
                    {t.badge && (
                      <span
                        className="px-1 py-0.5 bg-[#272833] text-white rounded-[4px] font-bold"
                        style={{ fontSize: 9 }}
                      >
                        {t.badge}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-[#535D67]"
                    style={{ fontSize: 11, fontWeight: 500, letterSpacing: '-0.3px' }}
                  >
                    {t.hint}
                  </p>
                </div>
                {active && (
                  <span className="w-4 h-4 rounded-full bg-[#272833] text-white flex items-center justify-center flex-shrink-0" style={{ fontSize: 9 }}>
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 언제 떠나시나요? — STEP 1 안에 통합 */}
        <div className="mt-4 pt-4 border-t border-dashed border-[#E6EBF0]">
          <p
            className="text-[#535D67] mb-1.5"
            style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.2px' }}
          >
            언제 떠나시나요?
          </p>
          <div className="flex flex-wrap gap-1.5">
            {PERIOD_OPTS.map(opt => {
              const active = period === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setPeriod(opt.id)}
                  className={`px-3 py-1.5 rounded-full border transition-all ${
                    active
                      ? 'bg-white border-[#272833] text-[#272833] font-bold'
                      : 'bg-white border-[#D9E0E8] text-[#9EABBA] font-medium'
                  }`}
                  style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.2px' }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* 날짜 지정 모드일 때만 노출 — 출발/도착일 직접 입력 */}
          {period === 'custom' && (
            <div className="mt-2 p-2.5 bg-[#F9FAFB] rounded-[8px] border border-[#E6EBF0] space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className="text-[#535D67] flex-shrink-0"
                  style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-0.2px', minWidth: 38 }}
                >
                  출국일
                </span>
                <input
                  type="date"
                  value={customStart}
                  min={fmtYmd(new Date())}
                  onChange={e => {
                    setCustomStart(e.target.value);
                    if (customEnd && e.target.value > customEnd) setCustomEnd('');
                  }}
                  className="flex-1 bg-white border border-[#D9E0E8] rounded-[6px] px-2 py-1.5 text-[#272833] outline-none focus:border-[#1AB277]"
                  style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.2px' }}
                />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[#535D67] flex-shrink-0"
                  style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-0.2px', minWidth: 38 }}
                >
                  귀국일
                </span>
                <input
                  type="date"
                  value={customEnd}
                  min={customStart}
                  onChange={e => setCustomEnd(e.target.value)}
                  className="flex-1 bg-white border border-[#D9E0E8] rounded-[6px] px-2 py-1.5 text-[#272833] outline-none focus:border-[#1AB277]"
                  style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.2px' }}
                />
                {customEnd && (
                  <button
                    onClick={() => setCustomEnd('')}
                    className="-m-1 p-1 text-[#9EABBA] underline"
                    style={{ fontSize: 11, fontWeight: 500, letterSpacing: '-0.3px' }}
                  >
                    당일치기
                  </button>
                )}
              </div>
              <p
                className="text-[#9EABBA]"
                style={{ fontSize: 11, fontWeight: 500, letterSpacing: '-0.3px' }}
              >
                귀국일을 비워두면 당일치기로 인식돼요
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Step 2 — 출발 공항 */}
      <div className="px-5 py-5 border-b border-[#F0F2F5]">
        <div className="flex items-baseline gap-1.5 mb-3">
          <span
            className="px-1.5 py-0.5 bg-[#272833] text-white rounded-[4px]"
            style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0 }}
          >
            STEP 2
          </span>
          <p
            className="text-[#272833]"
            style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.3px' }}
          >
            어디서 출발하세요?
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {KOREAN_DEPARTURES.map(d => {
            const active = departureAirport === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setDepartureAirport(d.id)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border transition-all ${
                  active
                    ? 'bg-white border-[#272833] text-[#272833] font-bold'
                    : 'bg-white border-[#D9E0E8] text-[#9EABBA] font-medium'
                }`}
                style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.2px' }}
              >
                <Plane className={`w-3 h-3 ${active ? 'text-white' : 'text-[#1AB277]'}`} />
                <span>{d.short}</span>
                <span className={active ? 'opacity-70' : 'text-[#9EABBA]'} style={{ fontSize: 10 }}>
                  ({d.id})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3 — 인원 */}
      <div className="px-5 py-5 border-b border-[#F0F2F5]">
        <div className="flex items-baseline gap-1.5 mb-3">
          <span
            className="px-1.5 py-0.5 bg-[#272833] text-white rounded-[4px]"
            style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0 }}
          >
            STEP 3
          </span>
          <p
            className="text-[#272833]"
            style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.3px' }}
          >
            몇 분이 함께 가시나요?
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPlayers(p => Math.max(1, p - 1))}
            className="w-9 h-9 rounded-full border border-[#D9E0E8] text-[#535D67] flex items-center justify-center"
            style={{ fontSize: 18, fontWeight: 700 }}
          >
            −
          </button>
          <span
            className="text-[#272833] min-w-[60px] text-center"
            style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}
          >
            {players}인
          </span>
          <button
            onClick={() => setPlayers(p => Math.min(8, p + 1))}
            className="w-9 h-9 rounded-full border border-[#D9E0E8] text-[#535D67] flex items-center justify-center"
            style={{ fontSize: 18, fontWeight: 700 }}
          >
            +
          </button>
        </div>
      </div>

      {/* 요약 + CTA */}
      <div className="px-5 py-5">
        <div className="bg-[#F9FAFB] rounded-[8px] border border-[#E6EBF0] px-4 py-3 mb-3">
          <p
            className="text-[#9EABBA] mb-1"
            style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-0.3px' }}
          >
            추천 검색 조건
          </p>
          <p
            className="text-[#272833] leading-relaxed"
            style={{ fontSize: 12, fontWeight: 500, letterSpacing: '-0.2px' }}
          >
            {summary}
          </p>
          {selectedDate && selectedTheme && (
            <p
              className="text-[#9EABBA] mt-1"
              style={{ fontSize: 11, fontWeight: 500, letterSpacing: '-0.3px' }}
            >
              · 출발 기준일: {selectedDate.getMonth() + 1}/{selectedDate.getDate()}
            </p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full py-3.5 rounded-[8px] flex items-center justify-center gap-1 transition-all ${
            canSubmit
              ? 'bg-[#1AB277] text-white hover:bg-[#149867]'
              : 'bg-[#F0F2F5] text-[#9EABBA] cursor-not-allowed'
          }`}
          style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px' }}
        >
          <span>추천 받기</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="h-6" />
    </div>
  );
}
