import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { MarioCoinIcon, MarioStarIcon } from './MarioIcons';
import { X } from 'lucide-react';

interface CoinConfettiProps {
  active: boolean;
  onComplete?: () => void;
  title?: string;
  subtitle?: string;
  particlesOnly?: boolean;
}

export const CoinConfetti: React.FC<CoinConfettiProps> = ({
  active,
  onComplete,
  title = 'WORLD CLEARED!',
  subtitle = 'Golden Coin Rain & Victory Celebration!',
  particlesOnly = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    // Trigger exactly TWO discrete bursts of canvas-confetti with golden/amber palette
    try {
      const colors = ['#f59e0b', '#fbbf24', '#fcd34d', '#eab308', '#ca8a04', '#ffffff'];

      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0.1, y: 0.7 },
        colors,
        shapes: ['circle'],
        scalar: 1.1,
      });

      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 0.9, y: 0.7 },
        colors,
        shapes: ['circle'],
        scalar: 1.1,
      });

      const secondBurst = window.setTimeout(() => {
        try {
          confetti({
            particleCount: 35,
            spread: 75,
            origin: { x: 0.5, y: 0.6 },
            colors,
            shapes: ['circle'],
            scalar: 1.1,
          });
        } catch {
          // ignore
        }
      }, 200);

      // Custom Canvas Coin Particle Animation
      const canvas = canvasRef.current;
      if (!canvas) {
        window.clearTimeout(secondBurst);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        window.clearTimeout(secondBurst);
        return;
      }

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      interface CoinParticle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        rot: number;
        vRot: number;
        scaleX: number;
        vScaleX: number;
        size: number;
        alpha: number;
      }

      const particles: CoinParticle[] = [];
      const count = Math.min(36, Math.floor(window.innerWidth / 30));

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: -20 - Math.random() * 180,
          vx: (Math.random() - 0.5) * 3,
          vy: 3.5 + Math.random() * 4,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.1,
          scaleX: Math.random(),
          vScaleX: 0.08 + Math.random() * 0.08,
          size: 14 + Math.random() * 10,
          alpha: 1,
        });
      }

      let animId: number;
      const startTime = Date.now();

      const render = () => {
        const elapsed = Date.now() - startTime;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.vRot;
          p.scaleX += p.vScaleX;
          if (p.scaleX > 1 || p.scaleX < -1) {
            p.vScaleX = -p.vScaleX;
          }

          // Draw spinning Mario Gold Coin
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(Math.cos(p.scaleX), 1);
          ctx.globalAlpha = p.alpha;

          // Outer black border
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 1.35, 0, 0, Math.PI * 2);
          ctx.fill();

          // Golden rim
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size - 2, (p.size - 2) * 1.35, 0, 0, Math.PI * 2);
          ctx.fill();

          // Inner coin core
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.65, p.size * 0.9, 0, 0, Math.PI * 2);
          ctx.fill();

          // Center line
          ctx.fillStyle = '#ca8a04';
          ctx.fillRect(-1.5, -p.size * 0.6, 3, p.size * 1.2);

          ctx.restore();

          // Fade out after 1.6s
          if (elapsed > 1600) {
            p.alpha = Math.max(0, 1 - (elapsed - 1600) / 800);
          }
        });

        if (elapsed < 2400) {
          animId = requestAnimationFrame(render);
        } else {
          onComplete?.();
        }
      };

      animId = requestAnimationFrame(render);

      const timer = window.setTimeout(() => {
        onComplete?.();
      }, 2500);

      return () => {
        window.clearTimeout(secondBurst);
        window.cancelAnimationFrame(animId);
        window.clearTimeout(timer);
        try {
          confetti.reset();
        } catch {
          // ignore
        }
      };
    } catch {
      const fallbackTimer = window.setTimeout(() => {
        onComplete?.();
      }, 2000);
      return () => window.clearTimeout(fallbackTimer);
    }
  }, [active, onComplete]);

  if (!active) return null;

  if (particlesOnly) {
    return (
      <div
        aria-hidden="true"
        data-testid="coin-confetti-particles"
        className="fixed inset-0 z-[60] pointer-events-none overflow-hidden print:hidden"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="coin-confetti-celebration"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-hidden bg-black/45 animate-in fade-in duration-150"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Floating Victory Banner with Dismiss Action */}
      <div className="relative z-10 bg-slate-950/95 border-4 border-amber-400 rounded-3xl p-5 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.9)] text-center text-white max-w-md w-full animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
        <button
          type="button"
          onClick={() => onComplete?.()}
          aria-label="Dismiss Celebration"
          className="absolute top-3 right-3 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-2">
          <MarioStarIcon className="w-8 h-8 animate-spin" />
          <MarioCoinIcon className="w-9 h-9" />
          <MarioStarIcon className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black font-mario text-amber-300 uppercase tracking-wider drop-shadow-[0_2px_0_#000]">
          {title}
        </h2>
        <p className="text-xs sm:text-sm font-bold text-slate-200 mt-2">
          {subtitle}
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs font-mario border-2 border-black">
            <MarioCoinIcon className="w-4 h-4" />
            <span>BONUS COINS COLLECTED!</span>
          </div>
          <button
            type="button"
            onClick={() => onComplete?.()}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-600 cursor-pointer"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
