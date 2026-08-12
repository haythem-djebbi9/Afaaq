import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold';
type Size = 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-afaaq-blue text-white hover:bg-afaaq-blue-700 shadow-sm',
  secondary: 'bg-white text-afaaq-blue border border-ink-200 hover:border-afaaq-blue',
  ghost: 'bg-transparent text-ink-700 hover:bg-ink-200/50',
  gold: 'bg-afaaq-gold text-afaaq-blue-900 hover:bg-afaaq-gold-600'
};

const sizes: Record<Size, string> = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-[15px]'
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${
      variants[variant]} ${
      sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}>
      
      {children}
    </button>);

}