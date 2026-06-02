import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, Plane, Hotel, Calendar } from 'lucide-react';
import { AppHeader } from './AppHeader';
import { airports } from '../data/mockData';
import { useAppState } from '../data/store';
import { KOREAN_DEPARTURES } from '../data/flightDurations';

function formatDateLabel(d: Date): string {
  const days = ['일','월','화','수','목','금','토'];
  return `${d.getMonth()+1}/${d.getDate()} (${days[d.getDay()]})`;
}

function dayDiff(a: Date, b: Date): number {
  const aa = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const bb = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((bb - aa) / (1000 * 60 * 60 * 24));
}

export function FlightSearchPage() {
  const navigate = useNavigate();
  const { selectedDate, setSelectedRegions, setArrivalContext, departureAirport, setDepartureAirport } = useAppState();

  // 디폴트: 출국 = 오늘+30일, 귀국 = 출국+1일
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const initialOut = useMemo(() => selectedDate >= today ? new Date(selectedDate) : (() => {
    const d = new Date(today); d.setDate(d.getDate() + 30); return d;
  })(), [selectedDate, today]);
  const initialIn = useMemo(() => { const d = new Date(initialOut); d.setDate(d.getDate() + 1); return d; }, [initialOut]);

  const [outDate, setOutDate] = useState<Date>(initialOut);
  const [inDate, setInDate] = useState<Date>(initialIn);

  // 항공편 → 공항 기준으로 변경. 출국 도착 공항(필수) + 도착 시각(선택), 귀국 출발 공항(선택)
  const hubAirports = useMemo(() => airports.filter(a => a.tier === 'hub'), []);
  const [outArrivalAirportId, setOutArrivalAirportId] = useState<string>('');
  const [outArrivalTime, setOutArrivalTime] = useState<string>(''); // 'HH:MM'
  const [inDepartAirportId, setInDepartAirportId] = useState<string>('');
  const [inArrivalAirportId, setInArrivalAirportId] = useState<string>(departureAirport); // 귀국 도착 (한국)

  const [hotelName, setHotelName] = useState('');

  // 자동 일정 분석
  const trip = useMemo(() => {
    const nights = dayDiff(outDate, inDate);
    if (nights <= 0) return { mode: 'daytrip' as const, label: '당일치기', emoji: '🌅', sub: '12시간 내 라운드' };
    if (nights === 1) return { mode: 'onenight' as const, label: '1박 2일', emoji: '🌙', sub: '느긋한 골프' };
    if (nights >= 2 && nights <= 3) return { mode: 'weekend' as const, label: '주말 여행', emoji: '🎒', sub: `${nights}박 ${nights+1}일` };
    return { mode: 'weekend' as const, label: '장기 여행', emoji: '🏖️', sub: `${nights}박 ${nights+1}일` };
  }, [outDate, inDate]);

  const outboundAirport = airports.find(a => a.id === outArrivalAirportId) ?? null;

  const canProceed = !!outboundAirport;

  const handleProceed = () => {
    if (!outboundAirport) return;
    setSelectedRegions([outboundAirport.region]);
    setArrivalContext({
      airportId: outboundAirport.id,
      airportName: outboundAirport.name,
      arrivalTime: outArrivalTime || undefined,
    });
    navigate(`/daytrip?mode=${trip.mode}`);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* 헤더 */}
      <AppHeader title="투어 루트 짜기" showHome />

      {/* Hero */}
      <div className="bg-white px-5 py-5 border-b border-[#F0F2F5]">
        <div className="w-12 h-12 rounded-full bg-[#E1F5FE] flex items-center justify-center mb-3">
          <Plane className="w-6 h-6 text-[#0277BD]" />
        </div>
        <h2 className="text-[18px] font-bold text-[#272833] leading-tight mb-1">
          이미 항공편이 있으신가요?
        </h2>
        <p className="text-[13px] text-[#6A7683] leading-relaxed">
          출국·귀국 공항만 알려주시면<br />
          남은 시간에 맞는 골프 일정을 자동으로 추천해드려요
        </p>
      </div>

      {/* 출국 항공편 */}
      <div className="bg-white px-5 py-4 mt-2">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-7 h-7 rounded-full bg-[#E1F5FE] flex items-center justify-center text-[14px]">🛫</span>
          <p className="text-[14px] font-bold text-[#272833]">출국 항공편</p>
        </div>

        {/* 출국 출발 공항 (한국) */}
        <p className="text-[11px] text-[#9EABBA] mb-1.5">출발 공항 <span className="text-[#535D67] font-medium">(한국)</span></p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {KOREAN_DEPARTURES.map(d => {
            const active = departureAirport === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setDepartureAirport(d.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[20px] border transition-all ${
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

        {/* 출국 도착 공항 (일본) */}
        <p className="text-[11px] text-[#9EABBA] mb-1.5">도착 공항 <span className="text-[#535D67] font-medium">(일본)</span></p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {hubAirports.map(ap => {
            const active = outArrivalAirportId === ap.id;
            return (
              <button
                key={ap.id}
                onClick={() => setOutArrivalAirportId(ap.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[20px] border transition-all ${
                  active
                    ? 'bg-white border-[#272833] text-[#272833] font-bold'
                    : 'bg-white border-[#D9E0E8] text-[#9EABBA] font-medium'
                }`}
                style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.2px' }}
              >
                <span>{ap.name.replace(/ ?공항$/, '')}</span>
                <span className={active ? 'opacity-70' : 'text-[#9EABBA]'} style={{ fontSize: 10 }}>
                  ({ap.code})
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[11px] text-[#9EABBA] mb-1">출국일</p>
            <input
              type="date"
              value={outDate.toISOString().slice(0,10)}
              onChange={e => setOutDate(new Date(e.target.value))}
              className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E6EBF0] rounded-[8px] text-[13px] text-[#272833] outline-none focus:border-[#1AB277]"
            />
          </div>
          <div>
            <p className="text-[11px] text-[#9EABBA] mb-1">도착 시각 <span className="text-[#C5CDD5]">(선택)</span></p>
            <input
              type="time"
              value={outArrivalTime}
              onChange={e => setOutArrivalTime(e.target.value)}
              className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E6EBF0] rounded-[8px] text-[13px] text-[#272833] outline-none focus:border-[#1AB277]"
            />
          </div>
        </div>

        {outboundAirport && (
          <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F2FDF7] border border-[#1AB277] rounded-[8px]">
            <span className="text-[10px] font-bold text-white bg-[#1AB277] rounded-full w-4 h-4 flex items-center justify-center">✓</span>
            <p className="text-[12px] font-medium text-[#149867]">
              {KOREAN_DEPARTURES.find(d => d.id === departureAirport)?.short} → {outboundAirport.name.replace(/ ?공항$/, '')} ({outboundAirport.code})
              {outArrivalTime ? ` · ${outArrivalTime} 도착` : ''}
            </p>
          </div>
        )}
      </div>

      {/* 귀국 항공편 (선택) */}
      <div className="bg-white px-5 py-4 mt-2">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-7 h-7 rounded-full bg-[#FFF4E0] flex items-center justify-center text-[14px]">🛬</span>
          <p className="text-[14px] font-bold text-[#272833]">귀국 항공편</p>
          <span className="text-[10px] text-[#9EABBA]">(선택)</span>
        </div>

        {/* 귀국 출발 공항 (일본) */}
        <p className="text-[11px] text-[#9EABBA] mb-1.5">출발 공항 <span className="text-[#535D67] font-medium">(일본)</span></p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {hubAirports.map(ap => {
            const active = inDepartAirportId === ap.id;
            return (
              <button
                key={ap.id}
                onClick={() => setInDepartAirportId(active ? '' : ap.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[20px] border transition-all ${
                  active
                    ? 'bg-white border-[#272833] text-[#272833] font-bold'
                    : 'bg-white border-[#D9E0E8] text-[#9EABBA] font-medium'
                }`}
                style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.2px' }}
              >
                <span>{ap.name.replace(/ ?공항$/, '')}</span>
                <span className={active ? 'opacity-70' : 'text-[#9EABBA]'} style={{ fontSize: 10 }}>
                  ({ap.code})
                </span>
              </button>
            );
          })}
        </div>

        {/* 귀국 도착 공항 (한국) */}
        <p className="text-[11px] text-[#9EABBA] mb-1.5">도착 공항 <span className="text-[#535D67] font-medium">(한국)</span></p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {KOREAN_DEPARTURES.map(d => {
            const active = inArrivalAirportId === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setInArrivalAirportId(d.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[20px] border transition-all ${
                  active
                    ? 'bg-white border-[#272833] text-[#272833] font-bold'
                    : 'bg-white border-[#D9E0E8] text-[#9EABBA] font-medium'
                }`}
                style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.2px' }}
              >
                <Plane className={`w-3 h-3 ${active ? 'text-white' : 'text-[#1AB277]'} rotate-180`} />
                <span>{d.short}</span>
                <span className={active ? 'opacity-70' : 'text-[#9EABBA]'} style={{ fontSize: 10 }}>
                  ({d.id})
                </span>
              </button>
            );
          })}
        </div>

        <div>
          <p className="text-[11px] text-[#9EABBA] mb-1">귀국일</p>
          <input
            type="date"
            value={inDate.toISOString().slice(0,10)}
            onChange={e => setInDate(new Date(e.target.value))}
            className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E6EBF0] rounded-[8px] text-[13px] text-[#272833] outline-none focus:border-[#1AB277]"
          />
        </div>

        <p className="text-[11px] text-[#9EABBA] mt-2">
          미입력 시 일정 길이만 활용해 추천해드려요.
        </p>
      </div>

      {/* 숙소 (선택) */}
      <div className="bg-white px-5 py-4 mt-2">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-7 h-7 rounded-full bg-[#F3E8FF] flex items-center justify-center">
            <Hotel className="w-3.5 h-3.5 text-[#7C3AED]" />
          </span>
          <p className="text-[14px] font-bold text-[#272833]">숙소</p>
          <span className="text-[10px] text-[#9EABBA]">(선택)</span>
        </div>
        <input
          type="text"
          value={hotelName}
          onChange={e => setHotelName(e.target.value)}
          placeholder="호텔명 또는 지역 (예: 후쿠오카 시내, 료칸)"
          className="w-full px-3 py-2.5 bg-[#F9FAFB] border border-[#E6EBF0] rounded-[8px] text-[13px] text-[#272833] outline-none focus:border-[#1AB277] placeholder:text-[#C5CDD5]"
        />
        <p className="text-[11px] text-[#9EABBA] mt-1.5">
          {hotelName.trim()
            ? `🏨 ${hotelName} 근처 골프장도 함께 추천해드려요`
            : '비워두시면 도착 공항·일정에 맞는 숙소를 추천해드려요'}
        </p>
      </div>

      {/* 자동 일정 분석 */}
      {outboundAirport && (
        <div className="bg-white px-5 py-4 mt-2">
          <p className="text-[11px] text-[#9EABBA] mb-2">자동 일정 분석</p>
          <div className="flex items-center gap-3 p-3 rounded-[8px] bg-gradient-to-br from-[#F2FDF7] to-[#E0F7ED] border border-[#BFE9D2]">
            <span className="text-[28px]">{trip.emoji}</span>
            <div className="flex-1">
              <p className="text-[15px] font-bold text-[#149867]">{trip.label}</p>
              <p className="text-[11px] text-[#6A7683] mt-0.5">{trip.sub}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#9EABBA]">기간</p>
              <p className="text-[12px] font-bold text-[#272833]">
                {formatDateLabel(outDate)}
                {dayDiff(outDate, inDate) > 0 && ` ~ ${formatDateLabel(inDate)}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-white px-5 py-5 mt-2 sticky bottom-0 border-t border-[#F0F2F5]">
        <button
          onClick={handleProceed}
          disabled={!canProceed}
          className={`w-full py-3.5 rounded-[8px] text-[15px] font-bold transition-all flex items-center justify-center gap-1 ${
            canProceed
              ? 'bg-[#1AB277] text-white hover:bg-[#149867]'
              : 'bg-[#F0F2F5] text-[#9EABBA] cursor-not-allowed'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>이 일정으로 골프장 찾기</span>
          <ChevronRight className="w-4 h-4" />
        </button>
        {!canProceed && (
          <p className="text-[11px] text-[#9EABBA] text-center mt-2">
            도착 공항을 선택하면 일정 추천을 시작해드려요
          </p>
        )}
      </div>

      <div className="h-4" />
    </div>
  );
}
