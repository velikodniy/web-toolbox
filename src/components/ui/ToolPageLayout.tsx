import type { ReactNode } from 'react';

type ToolPageLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  maxWidth?: 'default' | 'narrow' | 'wide' | 'full';
};

export function ToolPageLayout({
  title,
  description,
  children,
  maxWidth = 'default',
}: ToolPageLayoutProps) {
  const widthClass = maxWidth === 'default' ? '' : `tool-page-${maxWidth}`;
  return (
    <div className={`tool-page ${widthClass}`.trim()}>
      <h1>{title}</h1>
      <p className='description'>{description}</p>
      {children}
    </div>
  );
}
