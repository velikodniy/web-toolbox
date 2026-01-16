import type { ReactNode } from 'react';

type ToolPageLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  maxWidth?: 'default' | 'narrow' | 'wide';
};

const maxWidthStyles: Record<string, string> = {
  default: '800px',
  narrow: '480px',
  wide: '1200px',
};

export function ToolPageLayout({
  title,
  description,
  children,
  maxWidth = 'default',
}: ToolPageLayoutProps) {
  return (
    <div className='tool-page' style={{ maxWidth: maxWidthStyles[maxWidth] }}>
      <h1>{title}</h1>
      <p className='description'>{description}</p>
      {children}
    </div>
  );
}
