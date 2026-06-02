import type { ReactNode } from 'react';

export function Section({ title, trailing, first, children }: {
  title?: ReactNode;
  trailing?: ReactNode;
  first?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      {!first && <div className="h-2 bg-[#F0F2F5]" />}
      <div className="bg-white px-5 py-5">
        {title && (
          <div className="flex items-center justify-between mb-3">
            <h3
              className="text-[#272833]"
              style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}
            >
              {title}
            </h3>
            {trailing}
          </div>
        )}
        {children}
      </div>
    </>
  );
}
