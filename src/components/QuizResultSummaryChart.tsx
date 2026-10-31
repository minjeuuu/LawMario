import React, { useMemo } from 'react';
import {
  computeQuizWorldResultSummary,
  QuizCategoryAnswerInput,
} from '../utils/round8Features';
import { BarChart3, CheckCircle2, XCircle, Sparkles, Target } from 'lucide-react';

interface QuizResultSummaryChartProps {
  records: readonly QuizCategoryAnswerInput[];
  title?: string;
  darkSurface?: boolean;
}

export const QuizResultSummaryChart: React.FC<QuizResultSummaryChartProps> = ({
  records,
  title = 'RESULT SUMMARY · RIGHT VS WRONG BY WORLD',
  darkSurface = false,
}) => {
  const summary = useMemo(() => computeQuizWorldResultSummary(records), [records]);

  if (summary.rows.length === 0) {
    return null;
  }

  const svgWidth = Math.max(320, summary.rows.length * 76 + 32);
  const svgHeight = 148;
  const padTop = 22;
  const padBottom = 30;
  const plotHeight = svgHeight - padTop - padBottom;
  const baselineY = padTop + plotHeight;
  const maxVal = Math.max(
    1,
    ...summary.rows.map((r) => Math.max(r.rightCount, r.wrongCount))
  );

  const containerClass = darkSurface
    ? 'bg-slate-900/95 border-2 border-slate-700 text-white'
    : 'bg-slate-50 border-2 border-slate-900 text-slate-900';

  const subCardClass = darkSurface
    ? 'bg-slate-950/90 border border-slate-800 text-slate-100'
    : 'bg-white border border-slate-200 text-slate-900';

  return (
    <section
      data-testid="quiz-result-summary-breakdown"
      aria-label="Quiz Result Summary by World and Category"
      className={`rounded-2xl p-4 sm:p-5 space-y-4 text-left ${containerClass}`}
    >
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-300/30 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-400 border-2 border-black flex items-center justify-center text-slate-950 shadow-[0_2px_0_#000] shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span
              className={`text-[10px] font-black uppercase font-mario block ${
                darkSurface ? 'text-amber-300' : 'text-slate-600'
              }`}
            >
              CATEGORY PERFORMANCE CHART
            </span>
            <h4 className="text-sm sm:text-base font-black font-display truncate">
              {title}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap text-xs font-extrabold tabular-nums">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Right: {summary.totalRight}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/40">
            <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>Wrong: {summary.totalWrong}</span>
          </span>
        </div>
      </div>

      {/* Grouped Right-vs-Wrong Mini Bar Chart */}
      <div
        className={`rounded-xl p-3 overflow-x-auto ${subCardClass}`}
        data-testid="quiz-result-summary-chart"
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          role="img"
          aria-label={`Bar chart comparing ${summary.totalRight} right answers and ${summary.totalWrong} wrong answers across ${summary.rows.length} categories`}
          className="w-full h-36 min-w-[260px]"
        >
          {/* Horizontal reference gridlines */}
          {[0, 0.5, 1].map((frac, idx) => {
            const gy = padTop + plotHeight * (1 - frac);
            return (
              <line
                key={idx}
                x1={14}
                y1={gy}
                x2={svgWidth - 14}
                y2={gy}
                stroke={darkSurface ? '#334155' : '#cbd5e1'}
                strokeDasharray={frac === 0 ? undefined : '3 3'}
                strokeWidth={frac === 0 ? 1.5 : 1}
              />
            );
          })}

          {summary.rows.map((row, idx) => {
            const slotWidth = (svgWidth - 28) / summary.rows.length;
            const centerX = 14 + slotWidth * idx + slotWidth / 2;
            const barW = Math.min(20, Math.max(12, Math.floor(slotWidth * 0.28)));
            const rightH =
              row.rightCount > 0
                ? Math.max(8, Math.round((row.rightCount / maxVal) * plotHeight))
                : 3;
            const wrongH =
              row.wrongCount > 0
                ? Math.max(8, Math.round((row.wrongCount / maxVal) * plotHeight))
                : 3;

            const rightX = centerX - barW - 2;
            const wrongX = centerX + 2;
            const rightY = baselineY - rightH;
            const wrongY = baselineY - wrongH;

            return (
              <g key={row.categoryKey}>
                {/* Right count bar */}
                <rect
                  x={rightX}
                  y={rightY}
                  width={barW}
                  height={rightH}
                  rx={4}
                  fill={row.rightCount > 0 ? '#10b981' : '#94a3b8'}
                  opacity={row.rightCount > 0 ? 1 : 0.35}
                />
                <text
                  x={rightX + barW / 2}
                  y={rightY - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="800"
                  fill={darkSurface ? '#6ee7b7' : '#047857'}
                >
                  {row.rightCount}
                </text>

                {/* Wrong count bar */}
                <rect
                  x={wrongX}
                  y={wrongY}
                  width={barW}
                  height={wrongH}
                  rx={4}
                  fill={row.wrongCount > 0 ? '#f43f5e' : '#94a3b8'}
                  opacity={row.wrongCount > 0 ? 1 : 0.35}
                />
                <text
                  x={wrongX + barW / 2}
                  y={wrongY - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="800"
                  fill={darkSurface ? '#fda4af' : '#be123c'}
                >
                  {row.wrongCount}
                </text>

                {/* Category label */}
                <text
                  x={centerX}
                  y={baselineY + 16}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="800"
                  fill={darkSurface ? '#e2e8f0' : '#0f172a'}
                >
                  {row.shortLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Per-World / Category Detailed Rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {summary.rows.map((row) => {
          const rightWidthSvg = Math.max(0, Math.min(200, row.rightBarPercent * 2));
          const wrongWidthSvg = Math.max(0, 200 - rightWidthSvg);
          return (
            <div
              key={row.categoryKey}
              data-testid={`quiz-summary-category-${row.categoryKey}`}
              className={`rounded-xl p-3 space-y-2 ${subCardClass}`}
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-extrabold truncate">{row.fullLabel}</span>
                <span className="font-black tabular-nums shrink-0 text-[11px]">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {row.rightCount}✓
                  </span>
                  <span className="mx-1 opacity-50">/</span>
                  <span className="text-rose-600 dark:text-rose-400">
                    {row.wrongCount}✗
                  </span>
                  <span className="ml-1.5 opacity-80">({row.accuracyPercent}%)</span>
                </span>
              </div>

              <svg
                viewBox="0 0 200 8"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="w-full h-2 rounded-full overflow-hidden"
              >
                {rightWidthSvg > 0 && (
                  <rect x={0} y={0} width={rightWidthSvg} height={8} fill="#10b981" />
                )}
                {wrongWidthSvg > 0 && (
                  <rect
                    x={rightWidthSvg}
                    y={0}
                    width={wrongWidthSvg}
                    height={8}
                    fill="#f43f5e"
                  />
                )}
              </svg>
            </div>
          );
        })}
      </div>

      {/* Strongest & Focus Callouts */}
      {(summary.strongestCategory || summary.weakestCategory) && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs font-bold">
          {summary.strongestCategory && (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>
                Strongest: {summary.strongestCategory.fullLabel} (
                {summary.strongestCategory.accuracyPercent}%)
              </span>
            </span>
          )}
          {summary.weakestCategory && (
            <span className="inline-flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
              <Target className="w-3.5 h-3.5 shrink-0" />
              <span>
                Review Next: {summary.weakestCategory.fullLabel} (
                {summary.weakestCategory.wrongCount} missed)
              </span>
            </span>
          )}
        </div>
      )}
    </section>
  );
};
