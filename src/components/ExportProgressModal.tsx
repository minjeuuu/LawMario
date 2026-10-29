import React, { useEffect, useRef, useState } from 'react';
import { ALL_LAW_TOPICS, WORLDS_METADATA } from '../data/laborLawData';
import { MarioAvatar } from '../types/laborLaw';
import {
  MarioStarIcon,
  MarioCoinIcon,
  MarioCharacterAvatar,
} from './MarioIcons';
import { marioAudio } from '../utils/audio';
import {
  applyPrintPageRule,
  clearPrintPageRule,
  triggerCleanPrint,
} from '../utils/printHelper';
import confetti from 'canvas-confetti';
import {
  Download,
  Copy,
  Check,
  Trophy,
  Award,
  X,
  Printer,
  Flame,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface ExportProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedTopicIds: string[];
  coins: number;
  playerName?: string;
  equippedAvatar?: MarioAvatar;
  loginStreak?: number;
  unlockedAchievementsCount?: number;
  totalAchievementsCount?: number;
  quizRunsCompleted?: number;
  studiedSeconds?: number;
}

export const ExportProgressModal: React.FC<ExportProgressModalProps> = ({
  isOpen,
  onClose,
  completedTopicIds,
  coins,
  playerName = 'Counsel Hero',
  equippedAvatar = 'mario',
  loginStreak = 1,
  unlockedAchievementsCount = 0,
  totalAchievementsCount = 12,
  quizRunsCompleted = 0,
  studiedSeconds = 0,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadedOnce, setDownloadedOnce] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    applyPrintPageRule('landscape', '8mm');
    return () => {
      clearPrintPageRule();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalTopics = ALL_LAW_TOPICS.length;
  const completedCount = completedTopicIds.length;
  const overallPercent = Math.min(
    100,
    Math.round((completedCount / Math.max(1, totalTopics)) * 100)
  );
  const masteredWorldsCount = WORLDS_METADATA.filter((w) => {
    const wt = ALL_LAW_TOPICS.filter((t) => t.worldId === w.id);
    return wt.length > 0 && wt.every((t) => completedTopicIds.includes(t.id));
  }).length;

  const studiedMinutes = Math.max(1, Math.round(studiedSeconds / 60));
  const formattedIssueDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Compute stats per world with rich palette accents
  const worldAccentPalette: Record<string, { hex: string; softBg: string; textHex: string }> = {
    world1: { hex: '#ef4444', softBg: '#fef2f2', textHex: '#b91c1c' },
    world2: { hex: '#10b981', softBg: '#ecfdf5', textHex: '#047857' },
    world3: { hex: '#3b82f6', softBg: '#eff6ff', textHex: '#1d4ed8' },
    world4: { hex: '#f59e0b', softBg: '#fffbeb', textHex: '#b45309' },
    world5: { hex: '#8b5cf6', softBg: '#f5f3ff', textHex: '#6d28d9' },
    world6: { hex: '#ec4899', softBg: '#fdf2f8', textHex: '#be185d' },
  };

  const worldStats = WORLDS_METADATA.map((w) => {
    const worldTopics = ALL_LAW_TOPICS.filter((t) => t.worldId === w.id);
    const worldCompleted = worldTopics.filter((t) => completedTopicIds.includes(t.id)).length;
    const percent =
      worldTopics.length > 0 ? Math.round((worldCompleted / worldTopics.length) * 100) : 0;
    const palette = worldAccentPalette[w.id] || {
      hex: '#f59e0b',
      softBg: '#fffbeb',
      textHex: '#b45309',
    };
    return {
      ...w,
      total: worldTopics.length,
      completed: worldCompleted,
      percent,
      palette,
    };
  });

  const playerRank =
    overallPercent >= 100
      ? 'INVINCIBLE STAR COUNSEL'
      : overallPercent >= 75
      ? 'FIRE FLOWER SPECIALIST'
      : overallPercent >= 45
      ? 'SUPER LABOR ADVOCATE'
      : 'STAGE 1-1 JURIST';

  const handleCopyText = () => {
    const lines = [
      'SUPER MARIO LABOR ADVENTURE · OFFICIAL SCORE SUMMARY',
      `Scholar: ${playerName} | Rank: ${playerRank}`,
      `Mastery: ${completedCount} / ${totalTopics} Doctrines (${overallPercent}%)`,
      `Coins: ${coins} | Streak: ${loginStreak}d | Badges: ${unlockedAchievementsCount}/${totalAchievementsCount}`,
      '',
      'WORLD-BY-WORLD STATUTORY MASTERY:',
      ...worldStats.map(
        (ws) =>
          `World ${ws.worldNumber} (${ws.shortTitle}): ${ws.percent}% (${ws.completed}/${ws.total})`
      ),
      '',
      'Philippine Labor Standards & Protective Laws Memory Aid · Created by Matthew',
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    marioAudio.playCoin();
    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
    setTimeout(() => setCopied(false), 2500);
  };

  /**
   * High-Resolution 1600x1080 Editorial Championship Score Stats Summary PNG Renderer
   */
  const handleDownloadImage = () => {
    const W = 1600;
    const H = 1080;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Deep Studio Slate-Navy Backdrop
    const outerGrad = ctx.createLinearGradient(0, 0, W, H);
    outerGrad.addColorStop(0, '#070b14');
    outerGrad.addColorStop(0.55, '#0f172a');
    outerGrad.addColorStop(1, '#172036');
    ctx.fillStyle = outerGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle architectural grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < W; gx += 48) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, H);
      ctx.stroke();
    }
    for (let gy = 0; gy < H; gy += 48) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(W, gy);
      ctx.stroke();
    }

    // Soft ambient warm gold radial glow top-right & emerald bottom-left
    const glowTop = ctx.createRadialGradient(W - 220, 140, 20, W - 220, 140, 520);
    glowTop.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
    glowTop.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = glowTop;
    ctx.fillRect(0, 0, W, H);

    const glowBot = ctx.createRadialGradient(220, H - 120, 20, 220, H - 120, 480);
    glowBot.addColorStop(0, 'rgba(16, 185, 129, 0.16)');
    glowBot.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = glowBot;
    ctx.fillRect(0, 0, W, H);

    // 2. Main Editorial Dossier Frame
    const cardX = 56;
    const cardY = 48;
    const cardW = W - 112;
    const cardH = H - 96;

    ctx.fillStyle = '#0b1120';
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.65)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, [36]);
    ctx.fill();
    ctx.stroke();

    // Inner hairline frame
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cardX + 14, cardY + 14, cardW - 28, cardH - 28, [26]);
    ctx.stroke();

    // 3. Top Championship Header Band
    const headerX = cardX + 36;
    const headerY = cardY + 34;
    const headerW = cardW - 72;
    const headerH = 196;

    const headerGrad = ctx.createLinearGradient(headerX, headerY, headerX + headerW, headerY + headerH);
    headerGrad.addColorStop(0, '#1e293b');
    headerGrad.addColorStop(0.65, '#111827');
    headerGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = headerGrad;
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(headerX, headerY, headerW, headerH, [24]);
    ctx.fill();
    ctx.stroke();

    // Gold Star Crest Badge on Left
    const crestX = headerX + 32;
    const crestY = headerY + 34;
    const crestSize = 128;
    const crestGrad = ctx.createLinearGradient(crestX, crestY, crestX + crestSize, crestY + crestSize);
    crestGrad.addColorStop(0, '#fbbf24');
    crestGrad.addColorStop(1, '#d97706');
    ctx.fillStyle = crestGrad;
    ctx.beginPath();
    ctx.roundRect(crestX, crestY, crestSize, crestSize, [28]);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#090d16';
    ctx.stroke();

    // Draw 5-point crisp star inside crest
    const drawStar = (cx: number, cy: number, spikes: number, outerR: number, innerR: number) => {
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerR);
      for (let i = 0; i < spikes; i++) {
        ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
        rot += step;
        ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
        rot += step;
      }
      ctx.closePath();
    };
    drawStar(crestX + crestSize / 2, crestY + crestSize / 2, 5, 44, 20);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // Header Typography
    const titleLeft = crestX + crestSize + 30;
    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 16px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText('PHILIPPINE LABOR STANDARDS  ·  OFFICIAL MASTERY SUMMARY', titleLeft, headerY + 54);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '900 44px "Plus Jakarta Sans", system-ui, sans-serif';
    const safeName = (playerName || 'Counsel Hero').slice(0, 26);
    ctx.fillText(safeName, titleLeft, headerY + 108);

    // Rank Tag & Date
    ctx.fillStyle = '#34d399';
    ctx.font = '800 20px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(`RANK: ${playerRank}`, titleLeft, headerY + 146);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 16px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(`Issued ${formattedIssueDate}  ·  Worlds 1–6 Unabridged Curriculum`, titleLeft, headerY + 174);

    // Radial Mastery Gauge on Right of Header
    const gaugeCx = headerX + headerW - 118;
    const gaugeCy = headerY + headerH / 2;
    const gaugeR = 68;

    ctx.lineWidth = 14;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
    ctx.beginPath();
    ctx.arc(gaugeCx, gaugeCy, gaugeR, 0, Math.PI * 2);
    ctx.stroke();

    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.PI * 2 * Math.max(2, overallPercent)) / 100;
    const arcGrad = ctx.createLinearGradient(gaugeCx - gaugeR, gaugeCy - gaugeR, gaugeCx + gaugeR, gaugeCy + gaugeR);
    arcGrad.addColorStop(0, '#fbbf24');
    arcGrad.addColorStop(1, '#10b981');
    ctx.strokeStyle = arcGrad;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(gaugeCx, gaugeCy, gaugeR, startAngle, endAngle);
    ctx.stroke();
    ctx.lineCap = 'butt';

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 34px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(`${overallPercent}%`, gaugeCx, gaugeCy + 8);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 12px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText('COMPLETE', gaugeCx, gaugeCy + 28);
    ctx.textAlign = 'left';

    // 4. 4-Column KPI Telemetry Strip
    const kpiY = headerY + headerH + 26;
    const kpiGap = 20;
    const kpiW = (headerW - kpiGap * 3) / 4;
    const kpiH = 122;

    const kpiItems = [
      {
        label: 'DOCTRINES MASTERED',
        value: `${completedCount} / ${totalTopics}`,
        sub: `${masteredWorldsCount} of 6 Worlds Cleared`,
        accent: '#10b981',
      },
      {
        label: 'TREASURY WALLET',
        value: `${coins.toLocaleString()} Coins`,
        sub: 'Earned via Study & Quizzes',
        accent: '#fbbf24',
      },
      {
        label: 'DAILY STUDY STREAK',
        value: `${loginStreak} Day${loginStreak === 1 ? '' : 's'}`,
        sub: `${studiedMinutes}+ Mins Logged`,
        accent: '#38bdf8',
      },
      {
        label: 'MILESTONE BADGES',
        value: `${unlockedAchievementsCount} / ${totalAchievementsCount}`,
        sub: `${quizRunsCompleted} Quiz Runs Completed`,
        accent: '#f43f5e',
      },
    ];

    kpiItems.forEach((item, idx) => {
      const x = headerX + idx * (kpiW + kpiGap);
      ctx.fillStyle = '#131c31';
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, kpiY, kpiW, kpiH, [20]);
      ctx.fill();
      ctx.stroke();

      // Top accent bar inside KPI card
      ctx.fillStyle = item.accent;
      ctx.beginPath();
      ctx.roundRect(x + 22, kpiY + 18, 36, 5, [3]);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 13px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(item.label, x + 22, kpiY + 44);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '900 30px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(item.value, x + 22, kpiY + 80);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 14px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(item.sub, x + 22, kpiY + 104);
    });

    // 5. Section Heading for 6-World Breakdown
    const gridHeaderY = kpiY + kpiH + 40;
    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 16px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText('WORLD-BY-WORLD STATUTORY MASTERY BREAKDOWN', headerX, gridHeaderY);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 15px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${completedCount} of ${totalTopics} Modules Verified`, headerX + headerW, gridHeaderY);
    ctx.textAlign = 'left';

    // 6. 2x3 Bento Grid for Worlds 1–6
    const gridTopY = gridHeaderY + 18;
    const colGap = 24;
    const rowGap = 18;
    const cellW = (headerW - colGap) / 2;
    const cellH = 128;

    worldStats.forEach((ws, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cx = headerX + col * (cellW + colGap);
      const cy = gridTopY + row * (cellH + rowGap);

      ctx.fillStyle = '#131c31';
      ctx.strokeStyle = ws.percent === 100 ? 'rgba(16, 185, 129, 0.55)' : 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(cx, cy, cellW, cellH, [20]);
      ctx.fill();
      ctx.stroke();

      // World Number Pill Square
      ctx.fillStyle = ws.palette.hex;
      ctx.beginPath();
      ctx.roundRect(cx + 20, cy + 20, 52, 44, [12]);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 18px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`W${ws.worldNumber}`, cx + 46, cy + 48);
      ctx.textAlign = 'left';

      // World Title & Sub-count
      ctx.fillStyle = '#f8fafc';
      ctx.font = '800 21px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(ws.shortTitle, cx + 86, cy + 40);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 14px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(
        ws.percent === 100 ? 'Stage Mastered · All Doctrines Complete' : `${ws.completed} of ${ws.total} Doctrines Completed`,
        cx + 86,
        cy + 62
      );

      // Percentage Readout on Right
      ctx.textAlign = 'right';
      ctx.fillStyle = ws.percent === 100 ? '#34d399' : '#fbbf24';
      ctx.font = '900 24px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(`${ws.percent}%`, cx + cellW - 22, cy + 46);
      ctx.textAlign = 'left';

      // Progress Bar Track
      const barX = cx + 20;
      const barY = cy + 86;
      const barW = cellW - 40;
      const barH = 18;

      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, [9]);
      ctx.fill();

      if (ws.percent > 0) {
        const fillW = Math.max(18, (barW * ws.percent) / 100);
        const wGrad = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
        wGrad.addColorStop(0, ws.palette.hex);
        wGrad.addColorStop(1, ws.percent === 100 ? '#34d399' : '#fbbf24');
        ctx.fillStyle = wGrad;
        ctx.beginPath();
        ctx.roundRect(barX, barY, fillW, barH, [9]);
        ctx.fill();
      }
    });

    // 7. Editorial Footer Signature Strip
    const footerY = cardY + cardH - 34;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 15px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(
      'SUPER MARIO LABOR ADVENTURE  ·  Philippine Labor Standards & Protective Statutes',
      headerX,
      footerY
    );

    ctx.textAlign = 'right';
    ctx.fillStyle = '#fbbf24';
    ctx.font = '700 15px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(
      'Created by Matthew (Matthew Cesar Corpuz) · Main Creator',
      headerX + headerW,
      footerY
    );
    ctx.textAlign = 'left';

    // Trigger PNG Download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Mario-Labor-Law-Score-Summary-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

    setDownloadedOnce(true);
    marioAudio.playPowerUp();
    try {
      confetti({ particleCount: 65, spread: 75, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Score Stats Summary Card"
      data-testid="export-progress-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs select-none overflow-y-auto print:static print:bg-white print:p-0 print:overflow-visible"
    >
      <div className="bg-[#0f172a] text-white w-full max-w-3xl h-[100dvh] sm:h-auto sm:max-h-[92vh] rounded-none sm:rounded-3xl border-0 sm:border-3 border-amber-400/80 shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden my-auto flex flex-col safe-top-nav safe-bottom-dock print:bg-white print:max-w-full print:h-auto print:max-h-none print:border-0 print:shadow-none print:overflow-visible">
        {/* Modal Top Bar */}
        <div className="print:hidden bg-[#090d16] px-4 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000] shrink-0">
              <Trophy className="w-5 h-5 text-slate-950" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-amber-400 font-mario block truncate">
                HIGH-DPI SHAREABLE DOSSIER
              </span>
              <h2 className="text-base sm:text-xl font-black text-white font-display truncate">
                Score Stats Summary Card
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Export Score Card Modal"
            className="min-w-[42px] min-h-[42px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Redesigned Editorial Championship Score Card Preview */}
        <div className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto min-h-0 bg-[#0b1120] print:p-0 print:overflow-visible print:bg-white">
          <div
            id="official-player-scorecard"
            data-testid="score-stats-summary-card"
            ref={cardRef}
            className="bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#172036] text-white rounded-3xl p-4 sm:p-6 border-2 border-amber-400/60 shadow-2xl space-y-5 relative overflow-hidden"
          >
            {/* Championship Hero Header */}
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_3px_0_#000]">
                  <MarioCharacterAvatar character={equippedAvatar} className="w-11 h-11" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Philippine Labor Standards · Mastery Summary</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black font-display text-white truncate">
                    {playerName || 'Counsel Hero'}
                  </h3>
                  <p className="text-xs font-bold text-emerald-300 truncate">
                    {playerRank} <span className="text-slate-500">·</span>{' '}
                    <span className="text-slate-400 font-medium">Issued {formattedIssueDate}</span>
                  </p>
                </div>
              </div>

              {/* Overall Completion Score Focal Readout */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-2.5 shrink-0 tabular-nums">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Overall Score
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-amber-300 font-display">
                    {overallPercent}%
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    ({completedCount}/{totalTopics})
                  </span>
                </div>
              </div>
            </div>

            {/* 4-Column KPI Stat Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 tabular-nums">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 block">Doctrines</span>
                <div className="text-lg sm:text-xl font-black text-white font-display flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {completedCount}/{totalTopics}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-300 font-medium block">
                  {masteredWorldsCount}/6 Worlds Clear
                </span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 block">Treasury</span>
                <div className="text-lg sm:text-xl font-black text-amber-300 font-display flex items-center gap-1.5">
                  <MarioCoinIcon className="w-4 h-4 shrink-0" />
                  <span>{coins.toLocaleString()}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium block">Gold Coins</span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 block">Study Streak</span>
                <div className="text-lg sm:text-xl font-black text-sky-300 font-display flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {loginStreak}d
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium block">
                  {studiedMinutes}+ mins logged
                </span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 block">Milestones</span>
                <div className="text-lg sm:text-xl font-black text-rose-300 font-display flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {unlockedAchievementsCount}/{totalAchievementsCount}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium block">
                  {quizRunsCompleted} quizzes cleared
                </span>
              </div>
            </div>

            {/* 2-Column Worlds 1–6 Mastery Breakdown Grid */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black uppercase tracking-wider text-amber-300 font-mario text-[10px]">
                  WORLD-BY-WORLD STATUTORY PROGRESS
                </span>
                <span className="text-slate-400 font-semibold tabular-nums">
                  6 Core Modules
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 tabular-nums">
                {worldStats.map((ws) => (
                  <div
                    key={ws.id}
                    className="bg-slate-900/85 border border-slate-800 rounded-2xl p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-8 h-7 rounded-lg ${ws.accentBg} text-white font-black text-xs inline-flex items-center justify-center shrink-0 border border-black/40`}
                        >
                          W{ws.worldNumber}
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-extrabold text-white block truncate">
                            {ws.shortTitle}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            {ws.completed} of {ws.total} doctrines
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-black shrink-0 ${
                          ws.percent === 100 ? 'text-emerald-400' : 'text-amber-300'
                        }`}
                      >
                        {ws.percent}%
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          ws.percent === 100
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-300'
                            : ws.percent >= 50
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-300'
                            : 'bg-gradient-to-r from-sky-500 to-indigo-400'
                        }`}
                        style={{ width: `${Math.max(ws.percent > 0 ? 8 : 0, ws.percent)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Crisp Editorial Attribution Footer */}
            <div className="pt-3 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-300">
                <MarioStarIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Super Mario Labor Adventure · Unabridged Labor Standards</span>
              </span>
              <span className="font-semibold text-amber-300/90">
                Created by Matthew · Main Creator
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="print:hidden bg-[#090d16] px-4 sm:px-6 py-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 active:translate-y-0.5 cursor-pointer whitespace-nowrap"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Copy className="w-4 h-4 shrink-0" />
              )}
              <span>{copied ? 'Summary Copied' : 'Copy Text'}</span>
            </button>

            <button
              type="button"
              data-testid="print-scorecard-btn"
              onClick={() => {
                marioAudio.playClick();
                triggerCleanPrint({
                  mode: 'scorecard',
                  orientation: 'landscape',
                  marginCss: '8mm',
                });
              }}
              className="inline-flex min-h-[44px] items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 cursor-pointer whitespace-nowrap"
              title="Print Score Summary in Landscape"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span>Print Score Card</span>
            </button>
          </div>

          <button
            type="button"
            data-testid="download-scorecard-png-btn"
            data-downloaded={downloadedOnce ? 'true' : 'false'}
            onClick={handleDownloadImage}
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl border-2 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 cursor-pointer ml-auto whitespace-nowrap"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>{downloadedOnce ? 'Download HD PNG Again' : 'Download HD Image (PNG)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
