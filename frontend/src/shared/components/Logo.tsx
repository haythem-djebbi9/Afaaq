// Brand asset: /LOGO.png — 3641x3730, transparent background, already trimmed, stacking
// the mark above the wordmark and a small tagline. Scaling that whole lockup down to
// header size turns the tagline into mush, so placements pick a crop:
//   'brand' — mark image + the wordmark as real text (stays crisp at any size). Default.
//   'full'  — the entire lockup, for large surfaces (splash, footer) where it is legible.
//   'mark'  — the symbol alone.
// Crop coordinates were measured against the source pixels.
const SOURCE = { w: 3641, h: 3730 };

const CROPS = {
  full: { x: 0, y: 0, w: 3641, h: 3730 },
  mark: { x: 548, y: 0, w: 2495, h: 2463 }
};

function CroppedLogo({
  size,
  crop,
  className = ''




}: {size: number;crop: keyof typeof CROPS;className?: string;}) {
  const box = CROPS[crop];
  // Sprite-crop maths: scale the source so the crop box fills the element, then offset it
  // proportionally to bring that box into view. A crop spanning the full axis has no room
  // to slide, so the offset collapses to 0 rather than dividing by zero.
  const slideX = SOURCE.w - box.w;
  const slideY = SOURCE.h - box.h;

  return (
    <span
      role="img"
      aria-label="AFAAQ CONNECT"
      className={`inline-block shrink-0 bg-no-repeat ${className}`}
      style={{
        height: size,
        width: size * (box.w / box.h),
        backgroundImage: 'url(/LOGO.png)',
        backgroundSize: `${SOURCE.w / box.w * 100}% ${SOURCE.h / box.h * 100}%`,
        backgroundPosition: `${slideX ? box.x / slideX * 100 : 0}% ${
        slideY ? box.y / slideY * 100 : 0}%`
      }} />);

}

interface LogoProps {
  /** Height of the symbol in px. */
  size?: number;
  variant?: 'brand' | 'full' | 'mark';
  /** 'light' switches the wordmark to white for dark backgrounds. */
  tone?: 'dark' | 'light';
  /** Wordmark size for the 'brand' variant. */
  wordmarkClassName?: string;
  /** Applied to the symbol — e.g. a white badge so the navy mark stays readable on navy. */
  markClassName?: string;
  className?: string;
}

export function Logo({
  size = 40,
  variant = 'brand',
  tone = 'dark',
  wordmarkClassName = 'text-[17px]',
  markClassName = '',
  className = ''
}: LogoProps) {
  if (variant !== 'brand') {
    return <CroppedLogo size={size} crop={variant} className={className} />;
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <CroppedLogo size={size} crop="mark" className={markClassName} />
      <span
        className={`whitespace-nowrap font-display font-extrabold leading-none tracking-[0.12em] ${
        tone === 'light' ? 'text-white' : 'text-afaaq-blue'} ${wordmarkClassName}`}>

        AFAAQ<span className="text-afaaq-gold"> CONNECT</span>
      </span>
    </span>);

}
