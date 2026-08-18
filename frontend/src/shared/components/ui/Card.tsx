import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
  onClick?: () => void;
}

export function Card({ children, className = '', as: Tag = 'div', onClick }: CardProps) {
  return (
    <Tag
      onClick={onClick}
      className={`rounded-card border border-ink-200/70 bg-white shadow-card transition-all duration-300 ease-out ${className}`}>

      {children}
    </Tag>);

}

interface SectionHeadingProps {
  title: string;
  description?: string;
  badge?: string;
}

export function SectionHeading({ title, description, badge }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-xl font-bold text-ink-900">{title}</h2>
        {badge &&
        <span className="rounded-full bg-afaaq-gold-50 px-2.5 py-1 text-[11px] font-semibold text-afaaq-gold-600">
            {badge}
          </span>
        }
      </div>
      {description && <p className="max-w-2xl text-sm text-ink-500">{description}</p>}
    </div>);

}