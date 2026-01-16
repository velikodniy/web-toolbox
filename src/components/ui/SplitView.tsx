import type { ReactNode } from 'react';

type SplitViewProps = {
  left: ReactNode;
  right: ReactNode;
  className?: string;
};

export function SplitView({ left, right, className = '' }: SplitViewProps) {
  return (
    <div className={`split-view ${className}`.trim()}>
      {left}
      {right}
    </div>
  );
}
