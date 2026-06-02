import { useAppState } from '../data/store';
import type { PlayerCount } from '../data/store';

/**
 * 인원수 선택기 — 2/3/4 3옵션, 기본 4. 라디오 버튼 패턴.
 *
 * 디자인 의도: pill 칩 토글은 다중 선택처럼 보일 수 있어, 단일 선택임이 명확한
 * 라디오 패턴(원형 인디케이터 + 라벨)으로 전환. 동시에 카드 안 다른 행과 동일한
 * "평면 옵션" 결을 유지.
 *  - 라디오 원: w-4 h-4 rounded-full + 보더
 *  - 활성: 보더 + 내부 채움 점(다크), 라벨 다크/bold
 *  - 비활성: 보더만(옅음), 라벨 라이트/medium
 */
const OPTIONS: Array<{ value: PlayerCount; label: string }> = [
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
];

export function PlayerCountStepper() {
  const { playerCount, setPlayerCount } = useAppState();
  return (
    <div className="inline-flex items-center gap-3" role="radiogroup" aria-label="인원수">
      {OPTIONS.map(opt => {
        const active = opt.value === playerCount;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setPlayerCount(opt.value)}
            className="inline-flex items-center gap-1.5"
          >
            <span
              className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-colors ${
                active ? 'border-ink-muted' : 'border-border-strong'
              }`}
            >
              {active && <span className="w-2 h-2 rounded-full bg-ink-muted" />}
            </span>
            <span
              className={`text-[13px] tracking-[-0.2px] transition-colors ${
                active ? 'text-ink font-bold' : 'text-ink-light font-medium'
              }`}
            >
              {opt.label}인
            </span>
          </button>
        );
      })}
    </div>
  );
}
