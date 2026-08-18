// The source file is a square export with ~28% white margin baked in, and it stacks the
// mark above the "AFAAQ CONNECT" wordmark. Rendering it raw makes the logo look tiny and
// clipped inside a header bar, so every placement crops to a measured content box instead
// of relying on object-fit. Coordinates below were measured against the source pixels.
const SOURCE = { w: 2695, h: 2738 };

const CROPS = {
  // Whole lockup: mark + wordmark + tagline, white margin trimmed off.
  full: { x: 392, y: 288, w: 1928, h: 1969 },
  // Just the triangular mark — for tight spots where the wordmark would be unreadable.
  mark: { x: 687, y: 288, w: 1317, h: 1304 }
};

interface LogoProps {
  /** Rendered height in px. Width is derived from the crop's aspect ratio. */
  size?: number;
  variant?: keyof typeof CROPS;
  className?: string;
}

export function Logo({ size = 40, variant = 'full', className = '' }: LogoProps) {
  const crop = CROPS[variant];

  return (
    <span
      role="img"
      aria-label="AFAAQ CONNECT"
      className={`inline-block shrink-0 bg-no-repeat ${className}`}
      style={{
        height: size,
        width: size * (crop.w / crop.h),
        backgroundImage: 'url(/logo.jpg)',
        // Standard sprite-crop maths: scale the image up so the crop box fills the
        // element, then offset it proportionally to bring that box into view.
        backgroundSize: `${SOURCE.w / crop.w * 100}% ${SOURCE.h / crop.h * 100}%`,
        backgroundPosition: `${crop.x / (SOURCE.w - crop.w) * 100}% ${
        crop.y / (SOURCE.h - crop.h) * 100}%`
      }} />);

}
