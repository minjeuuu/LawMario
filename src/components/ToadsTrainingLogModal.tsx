import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import {
  X,
  Clock,
  CheckCircle2,
  Trophy,
  Sparkles,
  Zap,
  TrendingUp,
  Flame,
  Calendar,
  Award,
} from 'lucide-react';
import {
  PlayerProfileStats,
} from '../utils/profileAchievements';
import {
  buildToadTrainingDataSeries,
  computeWeeklyTrainingSummary,
  DailyTrainingDataPoint,
} from '../utils/toadsTrainingLog';
import { MarioCharacterAvatar, MarioCoinIcon, MarioMushroomIcon } from './MarioIcons';
import { marioAudio } from '../utils/audio';

interface ToadsTrainingLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileStats: PlayerProfileStats | null;
  onLaunchStudySprint?: () => void;
}

export const ToadsTrainingLogModal: React.FC<ToadsTrainingLogModalProps> = ({
  isOpen,
  onClose,
  profileStats,
  onLaunchStudySprint,
}) => {
  const [rangeDays, setRangeDays] = useState<7 | 14 | 30>(7);
  const [hoveredPoint, setHoveredPoint] = useState<DailyTrainingDataPoint | null>(null);
  const chartSvgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(640);

  // Resize observer to make chart responsive
  useEffect(() => {
    if (!isOpen) return;
    const updateWidth = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w > 0) setContainerWidth(w);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [isOpen]);

  const series = useMemo(() => {
    return buildToadTrainingDataSeries({
      dayCount: rangeDays,
      profileStats,
    });
  }, [rangeDays, profileStats]);

  const summary = useMemo(() => {
    return computeWeeklyTrainingSummary(series);
  }, [series]);

  // D3 Chart Rendering
  useEffect(() => {
    if (!isOpen || !chartSvgRef.current || series.length === 0) return;

    const svg = d3.select(chartSvgRef.current);
    svg.selectAll('*').remove();

    const width = Math.max(340, containerWidth);
    const height = 260;
    const margin = { top: 24, right: 46, bottom: 36, left: 44 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Defs & Gradients
    const defs = svg.append('defs');

    // Gold Area Gradient for Study Time
    const goldGrad = defs
      .append('linearGradient')
      .attr('id', 'toadGoldGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    goldGrad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#F59E0B')
      .attr('stop-opacity', 0.45);
    goldGrad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#F59E0B')
      .attr('stop-opacity', 0.0);

    // Emerald Area Gradient for Quiz Completion Rate
    const greenGrad = defs
      .append('linearGradient')
      .attr('id', 'toadGreenGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    greenGrad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10B981')
      .attr('stop-opacity', 0.35);
    greenGrad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#10B981')
      .attr('stop-opacity', 0.0);

    // Scales
    const xScale = d3
      .scalePoint<string>()
      .domain(series.map((d) => d.dateKey))
      .range([0, innerWidth])
      .padding(0.15);

    const maxStudyMin = Math.max(60, d3.max(series, (d) => d.studyMinutes) || 60);
    const yScaleLeft = d3
      .scaleLinear()
      .domain([0, Math.ceil(maxStudyMin / 15) * 15])
      .range([innerHeight, 0])
      .nice();

    const yScaleRight = d3
      .scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    // Horizontal Grid Lines
    const yGrid = d3.axisLeft(yScaleLeft).ticks(4).tickSize(-innerWidth).tickFormat(() => '');
    g.append('g')
      .attr('class', 'grid text-slate-800')
      .call(yGrid)
      .selectAll('line')
      .attr('stroke', '#334155')
      .attr('stroke-dasharray', '2,4')
      .attr('stroke-opacity', 0.6);

    // X Axis
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat((dKey) => {
        const item = series.find((d) => d.dateKey === dKey);
        return item ? item.shortDay : '';
      });

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#94A3B8')
      .attr('font-size', '11px')
      .attr('font-weight', '700');

    // Left Y Axis (Minutes)
    const yAxisLeft = d3.axisLeft(yScaleLeft).ticks(4).tickFormat((d) => `${d}m`);
    g.append('g')
      .call(yAxisLeft)
      .selectAll('text')
      .attr('fill', '#FBBF24')
      .attr('font-size', '11px')
      .attr('font-weight', '800');

    // Right Y Axis (Completion Rate %)
    const yAxisRight = d3.axisRight(yScaleRight).ticks(4).tickFormat((d) => `${d}%`);
    g.append('g')
      .attr('transform', `translate(${innerWidth},0)`)
      .call(yAxisRight)
      .selectAll('text')
      .attr('fill', '#34D399')
      .attr('font-size', '11px')
      .attr('font-weight', '800');

    // Study Minutes Area & Line
    const areaStudy = d3
      .area<DailyTrainingDataPoint>()
      .x((d) => xScale(d.dateKey) || 0)
      .y0(innerHeight)
      .y1((d) => yScaleLeft(d.studyMinutes))
      .curve(d3.curveMonotoneX);

    const lineStudy = d3
      .line<DailyTrainingDataPoint>()
      .x((d) => xScale(d.dateKey) || 0)
      .y((d) => yScaleLeft(d.studyMinutes))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(series)
      .attr('fill', 'url(#toadGoldGrad)')
      .attr('d', areaStudy);

    g.append('path')
      .datum(series)
      .attr('fill', 'none')
      .attr('stroke', '#F59E0B')
      .attr('stroke-width', 3)
      .attr('d', lineStudy);

    // Quiz Completion Rate Area & Line
    const areaRate = d3
      .area<DailyTrainingDataPoint>()
      .x((d) => xScale(d.dateKey) || 0)
      .y0(innerHeight)
      .y1((d) => yScaleRight(d.quizCompletionRate))
      .curve(d3.curveMonotoneX);

    const lineRate = d3
      .line<DailyTrainingDataPoint>()
      .x((d) => xScale(d.dateKey) || 0)
      .y((d) => yScaleRight(d.quizCompletionRate))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(series)
      .attr('fill', 'url(#toadGreenGrad)')
      .attr('d', areaRate);

    g.append('path')
      .datum(series)
      .attr('fill', 'none')
      .attr('stroke', '#10B981')
      .attr('stroke-width', 2.5)
      .attr('stroke-dasharray', '4,3')
      .attr('d', lineRate);

    // Data Points / Dots
    series.forEach((pt) => {
      const cx = xScale(pt.dateKey) || 0;
      const cyStudy = yScaleLeft(pt.studyMinutes);
      const cyRate = yScaleRight(pt.quizCompletionRate);

      // Gold Coin Dot for Study Minutes
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cyStudy)
        .attr('r', pt.isToday ? 6 : 4.5)
        .attr('fill', '#FBBF24')
        .attr('stroke', '#000000')
        .attr('stroke-width', 2)
        .attr('cursor', 'pointer')
        .on('mouseenter', () => setHoveredPoint(pt));

      // Emerald Dot for Quiz Completion
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cyRate)
        .attr('r', pt.isToday ? 5 : 3.5)
        .attr('fill', '#10B981')
        .attr('stroke', '#000000')
        .attr('stroke-width', 1.5)
        .attr('cursor', 'pointer')
        .on('mouseenter', () => setHoveredPoint(pt));
    });

  }, [isOpen, series, containerWidth]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Toad's Training Log"
      data-testid="toads-training-log-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
    >
      <div className="bg-slate-950 border-4 border-black rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-[10px_10px_0_#000] text-white space-y-4 my-auto max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
              <MarioCharacterAvatar character="toad" className="w-9 h-9" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-amber-300 font-mario block">
                MUSHROOM KINGDOM · ACADEMIC TELEMETRY
              </span>
              <h2 className="text-lg sm:text-xl font-black font-display text-white truncate">
                Toad&apos;s Training Log
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Range Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-0.5">
              {([7, 14, 30] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  data-testid={`toad-range-${r}d-btn`}
                  onClick={() => {
                    marioAudio.playClick();
                    setRangeDays(r);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    rangeDays === r
                      ? 'bg-amber-400 text-slate-950 font-black shadow-[0_1px_0_#000]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r}D
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Toad's Training Log"
              className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div
          data-testid="toads-training-log-scroll"
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-4 pr-1 custom-scrollbar"
        >
          {/* HUD Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-900/90 border-2 border-amber-500/60 rounded-2xl p-3 space-y-1">
              <div className="flex items-center justify-between text-amber-400">
                <span className="text-[10px] font-bold uppercase">Study Time</span>
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">
                {summary.totalStudyHoursFormatted}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold">
                {summary.dailyAverageMinutes}m daily avg
              </div>
            </div>

            <div className="bg-slate-900/90 border-2 border-emerald-500/60 rounded-2xl p-3 space-y-1">
              <div className="flex items-center justify-between text-emerald-400">
                <span className="text-[10px] font-bold uppercase">Quiz Accuracy</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">
                {summary.averageCompletionRate}%
              </div>
              <div className="text-[10px] text-slate-400 font-semibold">
                {summary.quizzesCompletedTotal} cleared
              </div>
            </div>

            <div className="bg-slate-900/90 border-2 border-cyan-500/60 rounded-2xl p-3 space-y-1">
              <div className="flex items-center justify-between text-cyan-400">
                <span className="text-[10px] font-bold uppercase">Best Day</span>
                <Calendar className="w-4 h-4" />
              </div>
              <div className="text-base sm:text-lg font-black text-white font-display truncate">
                {summary.bestStudyDay.dayLabel}
              </div>
              <div className="text-[10px] text-cyan-300 font-mono">
                {summary.bestStudyDay.minutes} min logged
              </div>
            </div>

            <div className="bg-slate-900/90 border-2 border-purple-500/60 rounded-2xl p-3 space-y-1">
              <div className="flex items-center justify-between text-purple-400">
                <span className="text-[10px] font-bold uppercase">Toad Rank</span>
                <Trophy className="w-4 h-4" />
              </div>
              <div className="text-xs sm:text-sm font-black text-amber-300 font-mario leading-tight line-clamp-2">
                {summary.toadRankTitle}
              </div>
              <div className="text-[10px] text-purple-300 font-semibold">
                Academic Tier
              </div>
            </div>
          </div>

          {/* D3 Line Chart Container */}
          <div
            ref={containerRef}
            data-testid="toad-d3-chart-card"
            className="bg-slate-900/80 border-2 border-slate-700 rounded-3xl p-3 sm:p-4 space-y-2 relative"
          >
            {/* Chart Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-3 h-3 rounded-full bg-amber-400 border border-black inline-block" />
                  <span>Study Minutes (Gold)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 border border-black inline-block" />
                  <span>Quiz Accuracy % (Emerald)</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                Hover over node to inspect
              </span>
            </div>

            {/* D3 SVG Canvas */}
            <div className="w-full flex justify-center">
              <svg
                ref={chartSvgRef}
                className="w-full h-auto max-h-[260px] overflow-visible"
              />
            </div>

            {/* Tooltip Card when hovering */}
            {hoveredPoint && (
              <div
                data-testid="toad-chart-tooltip"
                className="bg-slate-950 border-2 border-amber-400 rounded-2xl p-2.5 text-xs shadow-xl flex items-center justify-between gap-3 animate-fadeIn"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-black text-white">{hoveredPoint.dateLabel}</span>
                    {hoveredPoint.isToday && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                        Today
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <div className="text-amber-300">
                    <span className="font-bold">{hoveredPoint.studyMinutes}m</span> studied
                  </div>
                  <div className="text-emerald-400">
                    <span className="font-bold">{hoveredPoint.quizCompletionRate}%</span> accuracy
                  </div>
                  <div className="text-purple-300">
                    <span className="font-bold">+{hoveredPoint.xpEarned}</span> XP
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Toad Pro-Tip Speech Bubble */}
          <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border-2 border-amber-400/80 rounded-2xl p-3 sm:p-4 flex items-start gap-3 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 border border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
              <MarioMushroomIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-black font-mario">
                <Sparkles className="w-3.5 h-3.5" />
                <span>TOAD&apos;S TRAINING REPORT</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-100 leading-snug">
                {summary.toadProTip}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
          >
            Close Log
          </button>

          {onLaunchStudySprint && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLaunchStudySprint();
                marioAudio.playPowerUp();
              }}
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-2 cursor-pointer"
            >
              <Flame className="w-4 h-4 text-red-600 fill-red-500" />
              <span>Launch 25-Min Study Sprint</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
