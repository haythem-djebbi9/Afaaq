
interface LogoProps {
  size?: number;
  variant?: 'full' | 'mark';
  tone?: 'dark' | 'light';
  tagline?: string;
}

export function Logo({ size = 40, variant = 'full', tone = 'dark', tagline }: LogoProps) {
  const blue = tone === 'light' ? '#FFFFFF' : '#0D47A1';
  const wordmark = tone === 'light' ? 'text-white' : 'text-afaaq-blue';

  return (
    <span className="inline-flex items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        role="img"
        aria-label="AFAAQ CONNECT"
        className="shrink-0">
        
        <path
          d="M24 4.5c1.6 0 3.1.85 3.9 2.24l14.3 24.8a4.5 4.5 0 1 1-7.8 4.5L24 17.6 13.6 36.04a4.5 4.5 0 1 1-7.8-4.5l14.3-24.8A4.5 4.5 0 0 1 24 4.5Z"
          fill={blue} />
        
        <path
          d="M22.2 34.6c.7-5.6 1.7-9.7 3.6-13.1l2.1 1.6c-1.5 3.3-2.2 7.1-2.3 11.5h-3.4Z"
          fill="#FFC107" />
        
        <circle cx="26.9" cy="17.9" r="1.9" fill="#FFC107" />
      </svg>
      {variant === 'full' &&
      <span className="flex flex-col leading-none">
          <span className={`font-display text-[17px] font-extrabold tracking-[0.14em] ${wordmark}`}>
            AFAAQ<span className="text-afaaq-gold"> CONNECT</span>
          </span>
          {tagline &&
        <span
          className={`mt-1 text-[10px] tracking-[0.12em] ${
          tone === 'light' ? 'text-white/70' : 'text-ink-500'}`
          }>
          
              {tagline}
            </span>
        }
        </span>
      }
    </span>);

}