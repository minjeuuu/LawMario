import React from 'react';

interface MarioWorldCardBackdropProps {
  worldId?: string;
  className?: string;
}

/**
 * MarioWorldCardBackdrop
 * Renders subtle, responsive Mario World visual elements (floating clouds, smiling stars,
 * question-block outlines) directly behind Topic Cards.
 * Clamped strictly inside the card boundary using `-z-10 absolute inset-0 overflow-hidden rounded-3xl`
 * to guarantee zero horizontal or vertical cropping.
 */
export const MarioWorldCardBackdrop: React.FC<MarioWorldCardBackdropProps> = ({
  worldId = 'world1',
  className = '',
}) => {
  return (
    <div
      aria-hidden="true"
      data-testid={`mario-card-backdrop-${worldId}`}
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl select-none transition-opacity duration-300 ${className}`}
    >
      {/* World 1: Fluffy Smiling Mario Cloud (Top Right) & Subtle Star (Bottom Left) */}
      {(worldId === 'world1' || worldId === 'all') && (
        <>
          <svg
            className="absolute -top-3 -right-3 w-32 h-20 text-slate-200/40 dark:text-sky-400/10 transition-transform duration-700 hover:scale-105"
            viewBox="0 0 100 60"
            fill="currentColor"
          >
            {/* Fluffy Mario Cloud */}
            <path d="M20,45 Q10,45 10,35 Q10,25 22,25 Q25,12 38,12 Q48,12 52,20 Q60,15 70,22 Q82,22 84,32 Q92,34 90,45 Z" />
            {/* Friendly Cloud Eyes */}
            <circle cx="45" cy="30" r="2" fill="#0F172A" opacity="0.6" />
            <circle cx="55" cy="30" r="2" fill="#0F172A" opacity="0.6" />
          </svg>
          <svg
            className="absolute -bottom-4 -left-4 w-20 h-20 text-amber-400/15 dark:text-amber-300/10 animate-pulse"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
          </svg>
        </>
      )}

      {/* World 2: Retro Brick Pattern & Underground Pipe Silhouette */}
      {worldId === 'world2' && (
        <>
          <svg
            className="absolute top-2 right-3 w-28 h-16 text-slate-300/30 dark:text-amber-500/10"
            viewBox="0 0 80 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="2" y="2" width="22" height="16" rx="2" />
            <rect x="28" y="2" width="22" height="16" rx="2" />
            <rect x="54" y="2" width="22" height="16" rx="2" />
            <rect x="15" y="22" width="22" height="16" rx="2" />
            <rect x="41" y="22" width="22" height="16" rx="2" />
          </svg>
          <svg
            className="absolute bottom-2 left-3 w-16 h-14 text-emerald-400/15 dark:text-emerald-500/10"
            viewBox="0 0 40 36"
            fill="currentColor"
          >
            <rect x="4" y="2" width="32" height="10" rx="2" />
            <rect x="8" y="12" width="24" height="22" />
          </svg>
        </>
      )}

      {/* World 3: Ocean Bubbles & Sea Star Silhouette */}
      {worldId === 'world3' && (
        <>
          <svg
            className="absolute top-3 right-4 w-24 h-24 text-sky-400/20 dark:text-sky-300/10"
            viewBox="0 0 60 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="15" cy="15" r="8" />
            <circle cx="42" cy="22" r="12" />
            <circle cx="28" cy="45" r="6" />
          </svg>
          <svg
            className="absolute -bottom-3 -left-3 w-20 h-20 text-cyan-400/15 dark:text-cyan-300/10"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <circle cx="12" cy="12" r="9" />
          </svg>
        </>
      )}

      {/* World 4: Jungle Vines & Yoshi Island Silhouette */}
      {worldId === 'world4' && (
        <>
          <svg
            className="absolute top-2 right-3 w-28 h-20 text-emerald-400/20 dark:text-emerald-400/10"
            viewBox="0 0 80 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M10,5 Q30,40 50,15 T75,45" strokeLinecap="round" />
            <circle cx="30" cy="28" r="4" fill="currentColor" opacity="0.3" />
            <circle cx="62" cy="30" r="5" fill="currentColor" opacity="0.3" />
          </svg>
        </>
      )}

      {/* World 5: Bowser Castle Battlement & Ember Glow */}
      {worldId === 'world5' && (
        <>
          <svg
            className="absolute top-2 right-2 w-28 h-18 text-rose-500/20 dark:text-rose-600/15"
            viewBox="0 0 80 40"
            fill="currentColor"
          >
            <polygon points="5,35 5,12 15,12 15,20 25,20 25,12 35,12 35,20 45,20 45,12 55,12 55,20 65,20 65,12 75,12 75,35" />
          </svg>
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-rose-600/10 rounded-full blur-md" />
        </>
      )}

      {/* World 6: Star Road Constellation & Celestial Rings */}
      {worldId === 'world6' && (
        <>
          <svg
            className="absolute top-2 right-4 w-32 h-20 text-pink-400/20 dark:text-pink-300/10"
            viewBox="0 0 100 60"
            fill="currentColor"
          >
            <circle cx="20" cy="25" r="3" />
            <circle cx="50" cy="15" r="4" />
            <circle cx="80" cy="30" r="3.5" />
            <line x1="20" y1="25" x2="50" y2="15" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            <line x1="50" y1="15" x2="80" y2="30" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          </svg>
          <div className="absolute bottom-2 left-3 w-16 h-16 rounded-full border-2 border-dashed border-amber-300/20 dark:border-amber-300/10" />
        </>
      )}
    </div>
  );
};
