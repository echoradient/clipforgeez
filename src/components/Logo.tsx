import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const dimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }[size];

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${dimensions} ${className}`}>
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/40 via-cyan-500/30 to-violet-400/20 rounded-xl blur-sm" />
      
      {/* SVG Icon: Film Strip sliced cleanly by a precision cutting blade */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="cf-film-grad" x1="4" y1="8" x2="44" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1e293b" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="cf-blade-grad" x1="10" y1="4" x2="38" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38bdf8" />
            <stop offset="0.5" stopColor="#818cf8" />
            <stop offset="1" stopColor="#c084fc" />
          </linearGradient>
          <linearGradient id="cf-glow-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="1" stopColor="#8b5cf6" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Film strip base */}
        <rect
          x="6"
          y="8"
          width="36"
          height="32"
          rx="6"
          fill="url(#cf-film-grad)"
          stroke="url(#cf-glow-grad)"
          strokeWidth="1.5"
        />

        {/* Top perforations */}
        <rect x="10" y="11" width="3.5" height="4" rx="1" fill="#38bdf8" fillOpacity="0.8" />
        <rect x="18" y="11" width="3.5" height="4" rx="1" fill="#38bdf8" fillOpacity="0.8" />
        <rect x="26" y="11" width="3.5" height="4" rx="1" fill="#38bdf8" fillOpacity="0.8" />
        <rect x="34" y="11" width="3.5" height="4" rx="1" fill="#38bdf8" fillOpacity="0.8" />

        {/* Bottom perforations */}
        <rect x="10" y="33" width="3.5" height="4" rx="1" fill="#a855f7" fillOpacity="0.8" />
        <rect x="18" y="33" width="3.5" height="4" rx="1" fill="#a855f7" fillOpacity="0.8" />
        <rect x="26" y="33" width="3.5" height="4" rx="1" fill="#a855f7" fillOpacity="0.8" />
        <rect x="34" y="33" width="3.5" height="4" rx="1" fill="#a855f7" fillOpacity="0.8" />

        {/* Diagonal Cutting Blade across the film strip */}
        <path
          d="M8 38L38 10L42 14L12 42Z"
          fill="url(#cf-blade-grad)"
        />
        {/* Blade sharp edge highlight */}
        <path
          d="M8 38L38 10"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Sparkle / cut mark */}
        <circle cx="23" cy="24" r="1.5" fill="#38bdf8" />
      </svg>
    </div>
  );
};
