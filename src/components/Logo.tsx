import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark'; // light background or dark background (e.g. footer)
  showTagline?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'light',
  showTagline = true,
  onClick,
  className = '',
}) => {
  // Size mapping
  const heightClass = size === 'sm' ? 'h-8' : size === 'lg' ? 'h-14 sm:h-16' : 'h-10 sm:h-12';
  const taglineTextSize = size === 'sm' ? 'text-[8px]' : size === 'lg' ? 'text-[11px] sm:text-[12px]' : 'text-[9px] sm:text-[10px]';
  const wordmarkTextSize = size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl';
  const boxWidth = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14 sm:w-16 sm:h-16' : 'w-10 h-10 sm:w-12 sm:h-12';

  const isDark = variant === 'dark';
  const navyColor = isDark ? '#ffffff' : '#111827'; // Dark navy / white for dark variant
  const orangeColor = '#ff5b17'; // Vibrant orange from image

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${
        onClick ? 'cursor-pointer transition-transform hover:scale-[1.02] active:scale-95' : ''
      } ${className}`}
    >
      {/* 3D Isometric Box SVG */}
      <div className={`relative shrink-0 flex items-center justify-center ${boxWidth}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Sparkles around open box */}
          <path d="M 28 16 L 30 22 L 36 24 L 30 26 L 28 32 L 26 26 L 20 24 L 26 22 Z" fill="#ff5b17" />
          <path d="M 72 12 L 73.5 17 L 78.5 18.5 L 73.5 20 L 72 25 L 70.5 20 L 65.5 18.5 L 70.5 17 Z" fill="#ff5b17" />
          <circle cx="48" cy="18" r="2" fill="#ff5b17" />
          <circle cx="22" cy="30" r="1.5" fill="#111827" />

          {/* Floating elements out of box */}
          {/* Shopping bag */}
          <g transform="translate(30, 22) rotate(-10) scale(0.7)">
            <rect x="8" y="10" width="16" height="18" rx="2" fill="#ff5b17" />
            <path d="M 12 10 C 12 5, 20 5, 20 10" stroke="#ff5b17" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>

          {/* Percentage tag */}
          <g transform="translate(52, 20) rotate(15) scale(0.65)">
            <rect x="5" y="8" width="16" height="22" rx="3" fill={isDark ? '#e2e8f0' : '#111827'} />
            <text x="13" y="23" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900" fontFamily="sans-serif">%</text>
          </g>

          {/* Heart */}
          <path
            d="M 46 36 C 46 33, 42 30, 39 33 C 36 30, 32 33, 32 36 C 32 40, 39 44, 39 44 C 39 44, 46 40, 46 36 Z"
            fill={isDark ? '#f87171' : '#111827'}
          />

          {/* Isometric Box Base */}
          {/* Left Wall (Navy) */}
          <path d="M 12 52 L 48 68 L 48 94 L 12 76 Z" fill={isDark ? '#1e293b' : '#0f172a'} />
          
          {/* Right Wall (Orange) */}
          <path d="M 48 68 L 88 50 L 88 74 L 48 94 Z" fill="#ff5b17" />

          {/* Box Flaps / Top Openings */}
          {/* Left Flap */}
          <path d="M 12 52 L 32 40 L 48 50 L 26 62 Z" fill={isDark ? '#334155' : '#1e293b'} />
          
          {/* Right Flap */}
          <path d="M 88 50 L 98 42 L 68 36 L 58 46 Z" fill="#ff773d" />

          {/* Front Flap / Inside Orange */}
          <path d="M 26 62 L 48 50 L 68 58 L 48 68 Z" fill="#e04800" />

          {/* Shopping Cart line art on Navy Left Wall */}
          <g transform="translate(20, 62) scale(0.55)">
            <path d="M 4 6 L 9 6 L 14 20 L 30 20 L 34 10 L 11 10" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="16" cy="24" r="2.5" fill="#ffffff" />
            <circle cx="28" cy="24" r="2.5" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {/* Wordmark and Tagline */}
      <div className="flex flex-col justify-center">
        {/* Wordmark */}
        <div className={`font-black tracking-tight leading-none flex items-center ${wordmarkTextSize}`}>
          <span style={{ color: navyColor }} className="font-extrabold tracking-tight">
            acha
          </span>
          
          {/* "b" */}
          <span style={{ color: orangeColor }} className="font-black">
            b
          </span>

          {/* "o" with star inside */}
          <span className="relative inline-flex items-center justify-center mx-[0.5px]">
            <span style={{ color: orangeColor }} className="font-black">
              o
            </span>
            <span
              className="absolute inset-0 flex items-center justify-center text-[0.45em] pointer-events-none"
              style={{ color: isDark ? '#0f172a' : '#111827' }}
            >
              ★
            </span>
          </span>

          {/* "x" */}
          <span style={{ color: orangeColor }} className="font-black">
            x
          </span>
        </div>

        {/* Tagline "ACHOU, COMPROU, AMOU!" */}
        {showTagline && (
          <div className={`flex items-center gap-1 mt-1 ${taglineTextSize} font-bold tracking-widest uppercase`}>
            <span className="h-[1.5px] w-2 sm:w-3 bg-[#ff5b17] rounded-full opacity-80" />
            <span style={{ color: isDark ? '#cbd5e1' : '#334155' }} className="font-mono">
              ACHOU, COMPROU, AMOU!
            </span>
            <span className="h-[1.5px] w-2 sm:w-3 bg-[#ff5b17] rounded-full opacity-80" />
          </div>
        )}
      </div>
    </div>
  );
};
