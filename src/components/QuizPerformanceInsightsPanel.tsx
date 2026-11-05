import React, { useState, useMemo } from 'react';
import {
  HeatmapSummaryReport,
  HeatmapSectionItem,
  buildLaborLawSectionHeatmap,
  loadSectionAttemptLog,
  SectionQuestionAttempt,
} from '../utils/quizPerformanceInsights';
import { marioAudio } from '../utils/audio';
import { appendQuickTextToStudyNotes } from '../utils/round8Features';
import {
  BarChart3,
  Calendar,
  Filter,
  Flame,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Play,
  BookmarkPlus,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  Trophy,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface QuizPerformanceInsightsPanelProps {
  attemptsLog?: SectionQuestionAttempt[];
  onStartTargetedDrill?: (topicId: string) => void;
  onOpenStudyNotes?: (topicId?: string) => void;
  compact?: boolean;
}

export const QuizPerformanceInsightsPanel: React.FC<QuizPerformanceInsightsPanelProps> = ({
  attemptsLog,
  onStartTargetedDrill,
  onOpenStudyNotes,
  compact = false,
}) => {
  const [timeframeDays, setTimeframeDays] = useState<number>(30); // 7, 14, 30, 0 (all)
  const [selectedWorld, setSelectedWorld] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<HeatmapSectionItem | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [savedToNotes, setSavedToNotes] = useState(false);

  const effectiveLog = useMemo(() => {
    if (attemptsLog) return attemptsLog;
    if (typeof window !== 'undefined') {
      return loadSectionAttemptLog(window.localStorage);
    }
    return [];
  }, [attemptsLog]);

  const report: HeatmapSummaryReport = useMemo(() => {
    return buildLaborLawSectionHeatmap({
      timeWindowDays: timeframeDays,
      attemptsLog: effectiveLog,
      filterWorldId: selectedWorld,
    });
  }, [timeframeDays, effectiveLog, selectedWorld]);

  const handleCopyReport = async () => {
    const text = [
      `=== PHILIPPINE LABOR LAW 30-DAY QUIZ HEATMAP ===`,
      `Bar Readiness Index: ${report.barReadinessIndex}%`,
      `Total Attempted Questions: ${report.totalAttempts}`,
      `Total Correct: ${report.totalCorrect} (${Math.round((report.totalCorrect / Math.max(1, report.totalAttempts)) * 100)}%)`,
      `Critical Vulnerabilities: ${report.criticalCount}`,
      ``,
      `--- TOP MISSED TOPICS ---`,
      ...report.mostMissed.map(
        (m, i) =>
          `${i + 1}. ${m.sectionTitle} (${m.legalBasis}): ${m.missed} misses, ${m.accuracyPercent}% accuracy`
      ),
      ``,
      `Super Mario Labor Adventure Study Aid`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      marioAudio.playCoin();
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {}
  };

  const handleSaveToNotes = () => {
    const text = [
      `30-Day Quiz Heatmap Summary:`,
      `Bar Readiness: ${report.barReadinessIndex}% | Critical Topics: ${report.criticalCount}`,
      `Top Missed: ${report.mostMissed.map((m) => `${m.sectionTitle} (${m.accuracyPercent}%)`).join(', ')}`,
    ].join('\n');

    if (typeof window !== 'undefined') {
      appendQuickTextToStudyNotes(window.localStorage, 'Quiz Performance Heatmap', text);
      setSavedToNotes(true);
      marioAudio.playPowerUp();
      setTimeout(() => setSavedToNotes(false), 2000);
    }
  };

  const worldFilters = [
    { id: 'all', label: 'All Worlds' },
    { id: 'world1', label: 'W1: Hours' },
    { id: 'world2', label: 'W2: Rest/Holidays' },
    { id: 'world3', label: 'W3: Wages' },
    { id: 'world4', label: 'W4: Special Groups' },
    { id: 'world5', label: 'W5: Protective' },
    { id: 'world6', label: 'W6: Leaves' },
  ];

  const getCategoryStyles = (category: HeatmapSectionItem['category']) => {
    switch (category) {
      case 'mastered':
        return {
          bg: 'bg-emerald-600/90 hover:bg-emerald-500 border-emerald-400 text-white',
          badge: 'bg-emerald-950 text-emerald-300 border-emerald-500',
          dot: 'bg-emerald-400',
        };
      case 'competent':
        return {
          bg: 'bg-teal-700/80 hover:bg-teal-600 border-teal-400 text-white',
          badge: 'bg-teal-950 text-teal-300 border-teal-500',
          dot: 'bg-teal-400',
        };
      case 'needs_review':
        return {
          bg: 'bg-amber-600/80 hover:bg-amber-500 border-amber-400 text-white',
          badge: 'bg-amber-950 text-amber-300 border-amber-500',
          dot: 'bg-amber-400',
        };
      case 'critical':
        return {
          bg: 'bg-red-600/90 hover:bg-red-500 border-red-400 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]',
          badge: 'bg-red-950 text-red-300 border-red-500',
          dot: 'bg-red-400 animate-ping',
        };
      case 'untested':
      default:
        return {
          bg: 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300',
          badge: 'bg-slate-900 text-slate-400 border-slate-700',
          dot: 'bg-slate-500',
        };
    }
  };

  return (
    <div
      data-testid="quiz-performance-insights-panel"
      className="rounded-2xl bg-slate-900 text-white border-3 border-black shadow-[4px_4px_0_#000] p-4 sm:p-5 space-y-5 text-left"
    >
      {/* Header and Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0_#000]">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black font-display text-white">
              Quiz Performance Insights & Heatmap
            </h3>
            <p className="text-[11px] text-slate-300">
              Interactive 30-day accuracy heatmap of Labor Law provisions and codal sections
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyReport}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedSummary ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleSaveToNotes}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            {savedToNotes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
            {savedToNotes ? 'Saved' : 'Save to Notes'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
            Bar Readiness Index
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono tabular-nums">
              {report.barReadinessIndex}%
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">
              {report.barReadinessIndex >= 75 ? 'Ready' : 'Developing'}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${report.barReadinessIndex}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
            Total Tackled
          </span>
          <div className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums">
            {report.totalAttempts} <span className="text-xs font-normal text-slate-400">Qs</span>
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            {report.totalCorrect} Correct ({Math.round((report.totalCorrect / Math.max(1, report.totalAttempts)) * 100)}%)
          </span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
            Critical Review
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-red-400 font-mono tabular-nums">
              {report.criticalCount}
            </span>
            <span className="text-[10px] text-red-300 font-bold">Sections</span>
          </div>
          <span className="text-[10px] text-red-300/80 block font-mono">
            Miss rate &gt; 50%
          </span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
            Mastered
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tabular-nums">
              {report.masteredCount}
            </span>
            <span className="text-[10px] text-emerald-300 font-bold">Sections</span>
          </div>
          <span className="text-[10px] text-emerald-300/80 block font-mono">
            Accuracy &ge; 85%
          </span>
        </div>
      </div>

      {/* Filter Tabs: Timeframe + World */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Time Window Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {[
            { days: 7, label: 'Last 7 Days' },
            { days: 14, label: 'Last 14 Days' },
            { days: 30, label: 'Last 30 Days' },
            { days: 0, label: 'All Time' },
          ].map((t) => (
            <button
              key={t.days}
              onClick={() => {
                setTimeframeDays(t.days);
                marioAudio.playCoin();
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                timeframeDays === t.days
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* World Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 text-xs">
          {worldFilters.map((wf) => (
            <button
              key={wf.id}
              onClick={() => {
                setSelectedWorld(wf.id);
                marioAudio.playPipe();
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-all cursor-pointer ${
                selectedWorld === wf.id
                  ? 'bg-sky-500 text-slate-950 font-black'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {wf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
        <span className="font-bold text-slate-300 uppercase">Legend:</span>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-emerald-600 inline-block border border-black" />
          <span>Mastered (&ge;85%)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-teal-700 inline-block border border-black" />
          <span>Competent (70-84%)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-600 inline-block border border-black" />
          <span>Needs Review (50-69%)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-600 inline-block border border-black" />
          <span>Critical (&lt;50%)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-slate-800 inline-block border border-slate-700" />
          <span>Untested</span>
        </div>
      </div>

      {/* The Heatmap Grid */}
      <div className="space-y-2">
        <h4 className="text-xs font-black uppercase text-amber-300 font-display flex items-center justify-between">
          <span>Labor Law Section Grid ({report.items.length} Sections)</span>
          <span className="text-[10px] text-slate-400 font-mono normal-case">
            Click any section block to inspect &amp; drill
          </span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {report.items.map((item) => {
            const styles = getCategoryStyles(item.category);
            const isSelected = selectedTopic?.topicId === item.topicId;

            return (
              <button
                key={item.topicId}
                onClick={() => {
                  setSelectedTopic(item);
                  marioAudio.playCoin();
                }}
                className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  styles.bg
                } ${isSelected ? 'ring-2 ring-white scale-[1.02]' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40 text-amber-200">
                      {item.legalBasis}
                    </span>
                    <span className="text-xs font-mono font-black tabular-nums">
                      {item.attempts > 0 ? `${item.accuracyPercent}%` : '--'}
                    </span>
                  </div>
                  <p className="text-xs font-bold line-clamp-2 leading-tight">
                    {item.shortLabel}
                  </p>
                </div>

                <div className="mt-2 pt-1.5 border-t border-black/20 flex items-center justify-between text-[10px] font-mono">
                  <span>{item.attempts} Qs</span>
                  <span className={item.missed > 0 ? 'text-amber-200 font-bold' : 'opacity-80'}>
                    {item.missed} Missed
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Topic Inspector Drawer / Card */}
      {selectedTopic && (
        <div
          data-testid="selected-topic-inspector"
          className="bg-slate-950 border-2 border-amber-400 p-4 rounded-xl space-y-3"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-300 uppercase px-2 py-0.5 rounded bg-amber-950 border border-amber-500">
                  {selectedTopic.legalBasis}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {selectedTopic.worldName}
                </span>
              </div>
              <h4 className="text-base font-black text-white mt-1">
                {selectedTopic.sectionTitle}
              </h4>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-amber-300 font-mono tabular-nums">
                {selectedTopic.accuracyPercent}%
              </span>
              <span className="text-xs text-slate-400 block font-mono">
                {selectedTopic.correct}/{selectedTopic.attempts} Correct ({selectedTopic.missed} Missed)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
            {onStartTargetedDrill && (
              <button
                onClick={() => onStartTargetedDrill(selectedTopic.topicId)}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase rounded-xl border border-black shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Practice 5 Questions on this Section
              </button>
            )}

            {onOpenStudyNotes && (
              <button
                onClick={() => onOpenStudyNotes(selectedTopic.topicId)}
                className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase rounded-xl border border-black shadow flex items-center gap-1.5 cursor-pointer"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                Read Codal Summary
              </button>
            )}

            <button
              onClick={() => setSelectedTopic(null)}
              className="ml-auto px-2.5 py-1 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Top 5 Most Missed Vulnerabilities List */}
      {report.mostMissed.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <h4 className="text-xs font-black uppercase text-red-400 font-display flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Top 5 Critical Vulnerabilities (Highest Miss Rate)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {report.mostMissed.map((miss, idx) => (
              <div
                key={miss.topicId}
                className="bg-slate-950/90 border border-red-500/50 p-3 rounded-xl flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-red-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-black text-red-200 truncate">
                      {miss.shortLabel}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {miss.legalBasis} · {miss.missed} Misses ({miss.accuracyPercent}% accuracy)
                  </div>
                </div>

                {onStartTargetedDrill && (
                  <button
                    onClick={() => onStartTargetedDrill(miss.topicId)}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white text-[11px] font-black rounded-lg border border-black shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    Drill
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
