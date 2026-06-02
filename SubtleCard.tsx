import type { ReactNode, MouseEvent } from 'react';

interface SubtleCardCommonProps {
  children: ReactNode;
  /** 추가 클래스 (padding, hover, width 등 인스턴스별 차이는 여기에) */
  className?: string;
}

interface SubtleCardDivProps extends SubtleCardCommonProps {
  as?: 'div';
}

interface SubtleCardButtonProps extends SubtleCardCommonProps {
  as: 'button';
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}

type SubtleCardProps = SubtleCardDivProps | SubtleCardButtonProps;

/**
 * 홈화면에서 콘텐츠 카드/입력 박스에 쓰는 surface 컴포넌트.
 *
 * 디자인 토큰:
 *  - 배경: `#F9FAFB`
 *  - 라운드: `rounded-[10px]`
 *  - 보더: `border border-[#E6EBF0]`
 *
 * 사용처:
 *  - ArrivalAirportFinder 공항 카드 (`as="button"` + p-3 + hover)
 *  - SearchInputCard 입력 박스 (`as="div"` + overflow-hidden)
 *
 * className 으로 padding/hover/width 등 인스턴스별 변형 추가.
 *
 * 사용:
 *   <SubtleCard className="p-3">…</SubtleCard>
 *   <SubtleCard as="button" onClick={…} className="w-[160px] p-3 hover:border-[#272833]">…</SubtleCard>
 */
export function SubtleCard(props: SubtleCardProps) {
  const baseClass = 'bg-surface-base rounded-[10px] border border-border-soft';
  const className = `${baseClass} ${props.className ?? ''}`;

  if (props.as === 'button') {
    const { children, onClick, type = 'button', 'aria-label': ariaLabel } = props;
    return (
      <button type={type} onClick={onClick} aria-label={ariaLabel} className={className}>
        {children}
      </button>
    );
  }
  return <div className={className}>{props.children}</div>;
}
