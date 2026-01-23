import React from 'react';

type IconProps = {
  size?: number;
  className?: string;
  fill?: string;
  stroke?: string;
};

// Common props helper
const SvgIcon: React.FC<IconProps & { children: React.ReactNode }> = ({ size = 24, className = '', stroke = "currentColor", children }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={stroke} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {children}
  </svg>
);

export const SunIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M4.93 4.93l1.41 1.41" />
    <path d="M17.66 17.66l1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M6.34 17.66l-1.41 1.41" />
    <path d="M19.07 4.93l-1.41 1.41" />
  </SvgIcon>
);

export const MoonIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </SvgIcon>
);

export const MercuryIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
    <path d="M12 3c1.5 0 3 2 3 3" />
    <path d="M12 3c-1.5 0-3 2-3 3" />
    <path d="M12 13v8" />
    <path d="M8 17h8" />
  </SvgIcon>
);

export const VenusIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M12 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    <line x1="12" y1="9" x2="12" y2="22" />
    <line x1="8" y1="17" x2="16" y2="17" />
  </SvgIcon>
);

export const MarsIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M10 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    <path d="M13.5 7.5L20 1" />
    <path d="M16 1h4v4" />
  </SvgIcon>
);

export const JupiterIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M19 3v13c0 2-3 4-5 2" />
    <path d="M5 18h9" />
    <path d="M6 3v16" />
    <path d="M10 3v16" />
  </SvgIcon> 
  /* Simplified '4' glyph alternative: */
);

export const JupiterGlyph: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
     <path d="M16.5 4C16.5 4 6 5 6 13C6 21 15 21 15 21" />
     <path d="M14 4V20" />
     <path d="M5 15H19" />
  </SvgIcon>
);

export const SaturnIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M15 3v16c0 2-2 3-4 1" />
    <path d="M5 10h5" />
    <path d="M10 3c0 0-3 1-3 6 0 6 4 7 4 7" />
    <path d="M4 3h2" />
  </SvgIcon>
);

export const SaturnGlyph: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
      <path d="M14 3v9c0 5-6 6-6 6s4 4 8 0" />
      <path d="M6 8h10" />
      <path d="M10 3v5" />
  </SvgIcon>
);

export const UranusIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <circle cx="12" cy="18" r="2" />
    <path d="M12 16v-6" />
    <path d="M6 6v8" />
    <path d="M18 6v8" />
    <path d="M4 10h16" />
  </SvgIcon>
);

export const NeptuneIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M12 18v4" />
    <path d="M5 10v4c0 3 2 5 7 5s7-2 7-5v-4" />
    <path d="M5 10l3-3" />
    <path d="M19 10l-3-3" />
    <path d="M12 19l0-14" />
    <path d="M9 7l3-3 3 3" />
  </SvgIcon>
);

export const PlutoIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <circle cx="12" cy="7" r="3" />
    <path d="M8 12a4 4 0 0 0 8 0" />
    <path d="M12 12v8" />
    <path d="M8 17h8" />
  </SvgIcon>
);

export const NorthNodeIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M4 14a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4" />
    <circle cx="5" cy="15" r="2" />
    <circle cx="19" cy="15" r="2" />
  </SvgIcon>
);

export const LockingRuneIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <circle cx="12" cy="12" r="9" strokeDasharray="2 2" opacity="0.5" />
    <path d="M12 3v18M3 12h18" strokeWidth="1" />
    <path d="M7 7l10 10M17 7L7 17" strokeWidth="1" />
    <rect x="9" y="9" width="6" height="6" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </SvgIcon>
);

export const getPlanetIcon = (name: string) => {
  const map: Record<string, React.FC<IconProps>> = {
    'Sun': SunIcon,
    'Moon': MoonIcon,
    'Mercury': MercuryIcon,
    'Venus': VenusIcon,
    'Mars': MarsIcon,
    'Jupiter': JupiterGlyph,
    'Saturn': SaturnGlyph,
    'Uranus': UranusIcon,
    'Neptune': NeptuneIcon,
    'Pluto': PlutoIcon,
    'North Node': NorthNodeIcon,
  };
  return map[name] || SunIcon;
};
