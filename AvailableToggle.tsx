import { Check } from 'lucide-react';

interface Props {
  availableOnly: boolean;
  setAvailableOnly: (v: boolean) => void;
}

/** 잔여 티타임이 있는 코스만 보기 토글 */
export function AvailableToggle({ availableOnly, setAvailableOnly }: Props) {
  return (
    <button
      type="button"
      onClick={() => setAvailableOnly(!availableOnly)}
      className="flex items-center gap-1.5 cursor-pointer"
    >
      <span className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
        availableOnly ? 'bg-[#272833] border-[#272833]' : 'border-[#BFCAD6] bg-white'
      }`}>
        <Check className={`w-3 h-3 transition-opacity ${availableOnly ? 'text-white opacity-100' : 'text-[#BFCAD6] opacity-100'}`} />
      </span>
      <span className="text-[14px] text-[#272833] font-medium tracking-[-0.5px]">예약 가능</span>
    </button>
  );
}
