import { RegionPickerA } from './RegionPickerA';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 권역 선택 UX — 바텀시트 카드 그리드 + nested 아코디언 + 다중 선택.
 * DateSheet와 동일한 ui/Sheet 패턴을 사용한다.
 */
export function RegionPicker({ open, onOpenChange }: Props) {
  return <RegionPickerA open={open} onOpenChange={onOpenChange} />;
}
