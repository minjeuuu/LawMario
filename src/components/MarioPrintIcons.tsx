import React from 'react';

interface MarioIconProps {
  className?: string;
  size?: number;
}

/**
 * Authentic Super Star vector icon with classic eye slits and gold metallic halo.
 * Pure SVG vector geometry — zero emojis.
 */
export const MarioSuperStarIcon: React.FC<MarioIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={`inline-block shrink-0 ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Outer Star Body */}
    <path
      d="M12 2L14.9 8.2L21.7 9.1L16.6 13.8L18 20.6L12 17.2L6 20.6L7.4 13.8L2.3 9.1L9.1 8.2L12 2Z"
      fill="#FACC15"
      stroke="#B45309"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Inner Star Shading */}
    <path
      d="M12 4.2L14.2 9.1L19.5 9.8L15.6 13.4L16.6 18.7L12 16L7.4 18.7L8.4 13.4L4.5 9.8L9.8 9.1L12 4.2Z"
      fill="#FDE047"
    />
    {/* Classic Vertical Eye Slits */}
    <ellipse cx="10.2" cy="11.5" rx="0.85" ry="2.2" fill="#0F172A" />
    <ellipse cx="13.8" cy="11.5" rx="0.85" ry="2.2" fill="#0F172A" />
    {/* Eye Catchlights */}
    <circle cx="10.2" cy="10.4" r="0.35" fill="#FFFFFF" />
    <circle cx="13.8" cy="10.4" r="0.35" fill="#FFFFFF" />
  </svg>
);

/**
 * Authentic Mario Question Mark [ ? ] Coin Block vector icon.
 * Pure SVG vector geometry with metallic trim and 4 corner bolts — zero emojis.
 */
export const MarioCoinBlockIcon: React.FC<MarioIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={`inline-block shrink-0 ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Outer Block */}
    <rect x="2" y="2" width="20" height="20" rx="2.5" fill="#F59E0B" stroke="#78350F" strokeWidth="1.6" />
    {/* Inner Bevel */}
    <rect x="4" y="4" width="16" height="16" rx="1.5" fill="#FBBF24" />
    {/* 4 Corner Bolts */}
    <circle cx="5.5" cy="5.5" r="0.9" fill="#78350F" />
    <circle cx="18.5" cy="5.5" r="0.9" fill="#78350F" />
    <circle cx="5.5" cy="18.5" r="0.9" fill="#78350F" />
    <circle cx="18.5" cy="18.5" r="0.9" fill="#78350F" />
    {/* Question Mark Glyph */}
    <path
      d="M9.2 8.4C9.2 6.8 10.4 5.6 12 5.6C13.6 5.6 14.8 6.8 14.8 8.3C14.8 9.5 14.1 10.3 13.1 11.1C12.3 11.8 11.8 12.3 11.8 13.3H12.2"
      stroke="#78350F"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="16.3" r="1.1" fill="#78350F" />
  </svg>
);

/**
 * Authentic Mario Warp Pipe vector icon.
 * Pure SVG vector geometry with pipe rim and highlight stripe — zero emojis.
 */
export const MarioWarpPipeIcon: React.FC<MarioIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={`inline-block shrink-0 ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Pipe Rim (Top Overhang) */}
    <rect x="3" y="3" width="18" height="6.5" rx="1.5" fill="#22C55E" stroke="#14532D" strokeWidth="1.5" />
    {/* Pipe Body */}
    <rect x="5" y="9.5" width="14" height="11.5" fill="#16A34A" stroke="#14532D" strokeWidth="1.5" />
    {/* Vertical Reflection Highlights */}
    <rect x="7" y="4.2" width="2.2" height="4.5" fill="#86EFAC" rx="0.5" />
    <rect x="7.8" y="10.8" width="1.8" height="9.2" fill="#86EFAC" rx="0.5" />
    {/* Shadow Stripe */}
    <rect x="16" y="10.8" width="2" height="9.2" fill="#15803D" />
  </svg>
);

/**
 * Authentic 1-Up / Super Mushroom vector icon.
 * Pure SVG vector geometry with spotted cap and eyes — zero emojis.
 */
export const MarioMushroomIcon: React.FC<MarioIconProps & { variant?: '1up' | 'super' }> = ({
  className = 'w-4 h-4',
  size,
  variant = '1up',
}) => {
  const capColor = variant === '1up' ? '#22C55E' : '#EF4444';
  const capStroke = variant === '1up' ? '#14532D' : '#7F1D1D';

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`inline-block shrink-0 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Mushroom Cap */}
      <path
        d="M3 13C3 7.8 7 3.5 12 3.5C17 3.5 21 7.8 21 13C21 13.8 20.3 14.5 19.5 14.5H4.5C3.7 14.5 3 13.8 3 13Z"
        fill={capColor}
        stroke={capStroke}
        strokeWidth="1.5"
      />
      {/* 3 White Spots */}
      <circle cx="12" cy="8.5" r="2.8" fill="#FFFFFF" />
      <circle cx="5.5" cy="12" r="1.8" fill="#FFFFFF" />
      <circle cx="18.5" cy="12" r="1.8" fill="#FFFFFF" />
      {/* Stem */}
      <path
        d="M7.5 14.5H16.5C17.2 14.5 17.5 15.2 17.2 16.2C16.8 17.8 15.8 20.5 12 20.5C8.2 20.5 7.2 17.8 6.8 16.2C6.5 15.2 6.8 14.5 7.5 14.5Z"
        fill="#FEF08A"
        stroke="#854D0E"
        strokeWidth="1.3"
      />
      {/* Eyes */}
      <ellipse cx="10.2" cy="17.2" rx="0.65" ry="1.3" fill="#0F172A" />
      <ellipse cx="13.8" cy="17.2" rx="0.65" ry="1.3" fill="#0F172A" />
    </svg>
  );
};

/**
 * Authentic Fire Flower vector icon with petals and stem.
 * Pure SVG vector geometry — zero emojis.
 */
export const MarioFireFlowerIcon: React.FC<MarioIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={`inline-block shrink-0 ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Outer Red/Orange Petals */}
    <ellipse cx="12" cy="9.5" rx="7.2" ry="6.2" fill="#EA580C" stroke="#7C2D12" strokeWidth="1.4" />
    {/* Middle Yellow Ring */}
    <ellipse cx="12" cy="9.5" rx="5.4" ry="4.4" fill="#FACC15" />
    {/* Inner White Face */}
    <ellipse cx="12" cy="9.5" rx="3.6" ry="2.8" fill="#FFFFFF" />
    {/* Eyes */}
    <ellipse cx="10.8" cy="9.5" rx="0.5" ry="1.2" fill="#0F172A" />
    <ellipse cx="13.2" cy="9.5" rx="0.5" ry="1.2" fill="#0F172A" />
    {/* Stem */}
    <path d="M12 15.5V20.5" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
    {/* 2 Leaves */}
    <ellipse cx="9" cy="18.5" rx="2.5" ry="1.4" transform="rotate(-25 9 18.5)" fill="#22C55E" />
    <ellipse cx="15" cy="18.5" rx="2.5" ry="1.4" transform="rotate(25 15 18.5)" fill="#22C55E" />
  </svg>
);

/**
 * Authentic Mario Gold Coin vector icon.
 * Pure SVG vector geometry — zero emojis.
 */
export const MarioCoinIcon: React.FC<MarioIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={`inline-block shrink-0 ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Outer Gold Ring */}
    <ellipse cx="12" cy="12" rx="8" ry="9.5" fill="#EAB308" stroke="#78350F" strokeWidth="1.5" />
    {/* Inner Bevel */}
    <ellipse cx="12" cy="12" rx="6.5" ry="7.8" fill="#FACC15" />
    {/* Center Vertical Ridge */}
    <rect x="11.1" y="6.8" width="1.8" height="10.4" rx="0.9" fill="#78350F" />
  </svg>
);

/**
 * 8-Bit Brick Pattern Divider Strip for Prints.
 */
export const MarioBrickStrip: React.FC<{ className?: string }> = ({ className = 'w-full h-2.5' }) => (
  <div
    className={`bg-[#9A3412] border-y border-[#451A03] overflow-hidden flex items-center justify-between ${className}`}
    style={{
      backgroundImage: `repeating-linear-gradient(90deg, #7C2D12 0px, #7C2D12 16px, #451A03 16px, #451A03 18px)`,
    }}
    aria-hidden="true"
  />
);
