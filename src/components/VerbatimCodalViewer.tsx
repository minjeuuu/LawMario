import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Scale,
  BookOpen,
  Sparkles,
  Copy,
  Check,
  BookmarkPlus,
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  Download,
  Search,
  X,
  Eye,
  EyeOff,
  Type,
  Hash,
  HelpCircle,
  FileText,
  Gavel,
  ShieldAlert,
} from 'lucide-react';
import { marioAudio } from '../utils/audio';
import {
  parseVerbatimStatute,
  getVerbatimClozeTerms,
  formatVerbatimMarkdown,
  splitVerbatimIntoNumberedLines,
  VerbatimBlock,
} from '../utils/verbatimFormatter';

export interface VerbatimCodalViewerProps {
  statuteId?: string;
  citation: string;
  title: string;
  verbatim: string;
  summary?: string;
  keyRule?: string;
  worldBadge?: string;
  initialTheme?: 'midnight' | 'parchment' | 'ivory';
  searchQuery?: string;
  onSaveToNotes?: () => void;
  isSavedToNotes?: boolean;
  compactToolbar?: boolean;
  className?: string;
  showRecitationMode?: boolean;
}

export const VerbatimCodalViewer: React.FC<VerbatimCodalViewerProps> = ({
  statuteId,
  citation,
  title,
  verbatim,
  summary,
  keyRule,
  worldBadge,
  initialTheme = 'parchment',
  searchQuery = '',
  onSaveToNotes,
  isSavedToNotes = false,
  compactToolbar = false,
  className = '',
  showRecitationMode = true,
}) => {
  // Theme & Typography States
  const [theme, setTheme] = useState<'midnight' | 'parchment' | 'ivory'>(initialTheme);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [lineSpacing, setLineSpacing] = useState<'tight' | 'normal' | 'relaxed'>('normal');
  const [showLineNumbers, setShowLineNumbers] = useState(false);

  // In-statute Search State
  const [localSearch, setLocalSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Recitation / Cloze Deletion Active Recall State
  const [isRecitationMode, setIsRecitationMode] = useState(false);
  const [revealedClozeIndices, setRevealedClozeIndices] = useState<Set<number>>(new Set());

  // Audio Speech Synthesis State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Copy Feedback States
  const [copiedPure, setCopiedPure] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);

  // Parse semantic blocks
  const blocks = useMemo(() => parseVerbatimStatute(verbatim), [verbatim]);

  // Extract cloze terms for Recitation Mode
  const clozeTerms = useMemo(() => getVerbatimClozeTerms(verbatim), [verbatim]);

  // Reset cloze reveal state when verbatim changes
  useEffect(() => {
    setRevealedClozeIndices(new Set());
  }, [verbatim]);

  // Stop speech when unmounted
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Effective search query (combines global query and in-box search)
  const effectiveQuery = (localSearch.trim() || searchQuery.trim()).toLowerCase();

  // Highlight and Cloze Renderer helper
  const renderFormattedText = (text: string) => {
    if (!text) return null;

    // Handle Recitation Mode Cloze Replacement
    if (isRecitationMode && clozeTerms.length > 0) {
      // Build a combined regex for all cloze terms
      const escaped = clozeTerms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const combinedRegex = new RegExp(`(${escaped.join('|')})`, 'gi');
      const parts = text.split(combinedRegex);

      return parts.map((part, index) => {
        const isCloze = clozeTerms.some((t) => t.toLowerCase() === part.toLowerCase());
        if (!isCloze) {
          return highlightSearchInText(part, effectiveQuery);
        }

        const isRevealed = revealedClozeIndices.has(index);
        return (
          <button
            key={index}
            type="button"
            onClick={() => {
              setRevealedClozeIndices((prev) => {
                const next = new Set(prev);
                if (next.has(index)) {
                  next.delete(index);
                } else {
                  next.add(index);
                  marioAudio.playCoin();
                }
                return next;
              });
            }}
            title={isRevealed ? 'Click to veil doctrine' : 'Click to reveal hidden doctrine'}
            className={`inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-lg text-xs font-black transition-all cursor-pointer border ${
              isRevealed
                ? theme === 'parchment'
                  ? 'bg-emerald-100 text-emerald-950 border-emerald-600'
                  : theme === 'ivory'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-500'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-400'
                : theme === 'parchment'
                ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-800 shadow-[0_2px_0_#78350f]'
                : theme === 'ivory'
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-800 shadow-[0_2px_0_#1e3a8a]'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-black shadow-[0_2px_0_#000]'
            }`}
          >
            {isRevealed ? (
              <>
                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>{part}</span>
              </>
            ) : (
              <>
                <HelpCircle className="w-3 h-3 shrink-0" />
                <span className="font-mario text-[10px] uppercase">? RECALL ?</span>
              </>
            )}
          </button>
        );
      });
    }

    // Default text with search query highlighting
    return highlightSearchInText(text, effectiveQuery);
  };

  const highlightSearchInText = (text: string, query: string) => {
    if (!query || !text) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark
          key={i}
          className="bg-amber-300 text-slate-950 px-1 py-0.5 rounded-sm font-bold shadow-xs select-text"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Speech Narration Handlers
  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    // Start new narration
    window.speechSynthesis.cancel();
    marioAudio.pauseStudyAmbience();

    const utterance = new SpeechSynthesisUtterance(`${citation}. ${title}. ${verbatim}`);
    utterance.rate = speechRate;
    utterance.lang = 'en-US';

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      marioAudio.resumeStudyAmbience();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      marioAudio.resumeStudyAmbience();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
    marioAudio.playClick();
  };

  const handleStopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    marioAudio.resumeStudyAmbience();
  };

  const handleCycleSpeechRate = () => {
    const rates = [0.8, 1.0, 1.25, 1.5];
    const currentIndex = rates.indexOf(speechRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setSpeechRate(nextRate);
    marioAudio.playClick();

    if (isSpeaking) {
      handleStopSpeech();
    }
  };

  // Copy pure verbatim text
  const handleCopyPure = () => {
    navigator.clipboard.writeText(verbatim);
    setCopiedPure(true);
    marioAudio.playCoin();
    setTimeout(() => setCopiedPure(false), 2000);
  };

  // Copy full legal citation slip
  const handleCopyFull = () => {
    const textToCopy = `${citation}\n${title}\n\n[Exact Verbatim Provision]:\n${verbatim}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedFull(true);
    marioAudio.playCoin();
    setTimeout(() => setCopiedFull(false), 2000);
  };

  // Download Markdown legal slip
  const handleDownloadMarkdown = () => {
    const md = formatVerbatimMarkdown(citation, title, verbatim, summary, keyRule);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const safeTitle = (citation || 'statute')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase()
      .slice(0, 40);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeTitle}_verbatim_codex.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    marioAudio.playPowerUp();
  };

  // Typography Class Resolver
  const fontClass =
    fontFamily === 'serif'
      ? 'font-serif'
      : fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  const sizeClass =
    fontSize === 'sm'
      ? 'text-xs sm:text-[13px]'
      : fontSize === 'lg'
      ? 'text-sm sm:text-base'
      : fontSize === 'xl'
      ? 'text-base sm:text-lg'
      : 'text-xs sm:text-sm';

  const leadingClass =
    lineSpacing === 'tight'
      ? 'leading-snug'
      : lineSpacing === 'relaxed'
      ? 'leading-loose'
      : 'leading-relaxed';

  // Container styling by theme
  const containerThemeClass =
    theme === 'parchment'
      ? 'bg-gradient-to-br from-[#fcf7ee] via-[#f7f0df] to-[#eedfc2] text-stone-900 border-amber-700/70 shadow-[0_8px_30px_rgba(180,83,9,0.2)]'
      : theme === 'ivory'
      ? 'bg-white text-slate-900 border-slate-300 shadow-[0_8px_30px_rgba(0,0,0,0.12)]'
      : 'bg-gradient-to-br from-slate-950 via-[#0d1321] to-[#080c14] text-slate-100 border-amber-400/90 shadow-[0_8px_30px_rgba(0,0,0,0.6)]';

  const innerScrollClass =
    theme === 'parchment'
      ? 'bg-[#fffefb] border-amber-700/30 text-stone-900 shadow-[inset_0_2px_12px_rgba(180,83,9,0.08)]'
      : theme === 'ivory'
      ? 'bg-slate-50/70 border-slate-200 text-slate-900 shadow-inner'
      : 'bg-[#090d16] border-slate-800 text-slate-100 shadow-inner';

  return (
    <div
      data-testid={statuteId ? `verbatim-viewer-${statuteId}` : 'verbatim-codal-viewer'}
      className={`rounded-2xl border-2 p-3.5 sm:p-5 space-y-3.5 relative overflow-hidden transition-colors duration-200 ${containerThemeClass} ${className}`}
    >
      {/* Decorative Watermark Seal */}
      <div className="absolute -right-8 -bottom-8 pointer-events-none opacity-5 select-none">
        <Scale
          className={`w-48 h-48 ${
            theme === 'parchment' ? 'text-amber-900' : theme === 'ivory' ? 'text-blue-900' : 'text-amber-300'
          }`}
        />
      </div>

      {/* Top Header Bar */}
      <div
        className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b pb-3 ${
          theme === 'parchment'
            ? 'border-amber-700/25'
            : theme === 'ivory'
            ? 'border-slate-200'
            : 'border-amber-400/25'
        }`}
      >
        {/* Title & Authority Badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border border-black shadow-[0_2px_0_#000] ${
              theme === 'parchment'
                ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-50'
                : theme === 'ivory'
                ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white'
                : 'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950'
            }`}
          >
            <Scale className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`text-[9px] font-black uppercase font-mario tracking-wider px-2 py-0.5 rounded border ${
                  theme === 'parchment'
                    ? 'bg-amber-900/15 text-amber-950 border-amber-700/40'
                    : theme === 'ivory'
                    ? 'bg-blue-100 text-blue-950 border-blue-300'
                    : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                }`}
              >
                REPUBLIC OF THE PHILIPPINES · CODIFIED STATUTE
              </span>
              {worldBadge && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    theme === 'parchment'
                      ? 'bg-amber-200/80 text-amber-900'
                      : theme === 'ivory'
                      ? 'bg-slate-200 text-slate-800'
                      : 'bg-slate-800 text-amber-300'
                  }`}
                >
                  {worldBadge}
                </span>
              )}
            </div>
            <h4
              className={`text-sm sm:text-base font-black font-display mt-0.5 truncate ${
                theme === 'parchment' ? 'text-stone-900' : theme === 'ivory' ? 'text-slate-900' : 'text-white'
              }`}
            >
              {citation}
            </h4>
          </div>
        </div>

        {/* Master Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Audio Speech Narration Button */}
          <div className="inline-flex items-center rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-xs">
            <button
              type="button"
              onClick={handleToggleSpeech}
              title={isSpeaking ? (isPaused ? 'Resume Read-Aloud' : 'Pause Read-Aloud') : 'Listen to Verbatim Statute'}
              className={`min-h-[34px] px-2.5 text-xs font-black inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                isSpeaking
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {isSpeaking && !isPaused ? (
                <>
                  <Pause className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Pause</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="hidden sm:inline">Read Aloud</span>
                </>
              )}
            </button>

            {isSpeaking && (
              <button
                type="button"
                onClick={handleStopSpeech}
                title="Stop Narration"
                className="min-h-[34px] px-2 bg-slate-800 hover:bg-rose-900/60 text-rose-300 border-l border-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}

            <button
              type="button"
              onClick={handleCycleSpeechRate}
              title="Cycle Narration Speed (0.8x, 1.0x, 1.25x, 1.5x)"
              className="min-h-[34px] px-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-mono font-bold border-l border-slate-700 cursor-pointer"
            >
              {speechRate}x
            </button>
          </div>

          {/* Bar Exam Recitation Mode (Cloze Recall) */}
          {showRecitationMode && clozeTerms.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setIsRecitationMode((prev) => !prev);
                marioAudio.playPowerUp();
              }}
              title="Toggle Bar Exam Recitation Mode (Cloze Deletion Active Recall)"
              className={`min-h-[34px] px-2.5 rounded-xl text-xs font-black border inline-flex items-center gap-1.5 cursor-pointer transition-all ${
                isRecitationMode
                  ? 'bg-amber-400 text-slate-950 border-black shadow-[0_2px_0_#000]'
                  : theme === 'parchment'
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-600'
                  : theme === 'ivory'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{isRecitationMode ? 'Exit Recitation' : 'Recitation Mode'}</span>
            </button>
          )}

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={() => {
              setTheme((prev) => (prev === 'midnight' ? 'parchment' : prev === 'parchment' ? 'ivory' : 'midnight'));
              marioAudio.playClick();
            }}
            title="Cycle Reading Theme (Midnight Codex, Courtroom Parchment, Law Library Ivory)"
            className={`min-h-[34px] px-2.5 rounded-xl text-xs font-bold border inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
              theme === 'parchment'
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-600'
                : theme === 'ivory'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline capitalize">{theme}</span>
          </button>

          {/* Font Family Switcher */}
          <button
            type="button"
            onClick={() => {
              setFontFamily((prev) => (prev === 'serif' ? 'sans' : prev === 'sans' ? 'mono' : 'serif'));
              marioAudio.playClick();
            }}
            title="Cycle Font Style (Classical Serif, Modern Sans, Precision Mono)"
            className={`min-h-[34px] px-2 rounded-xl text-xs font-black border inline-flex items-center gap-1 cursor-pointer font-mono ${
              theme === 'parchment'
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-600'
                : theme === 'ivory'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
            }`}
          >
            <Type className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] uppercase font-bold">{fontFamily}</span>
          </button>

          {/* Font Size Scaler */}
          <button
            type="button"
            onClick={() => {
              setFontSize((prev) => (prev === 'sm' ? 'base' : prev === 'base' ? 'lg' : prev === 'lg' ? 'xl' : 'sm'));
              marioAudio.playClick();
            }}
            title="Cycle Font Size (Small, Base, Large, Extra Large)"
            className={`min-h-[34px] px-2.5 rounded-xl text-xs font-black border inline-flex items-center gap-1 cursor-pointer font-mono ${
              theme === 'parchment'
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-600'
                : theme === 'ivory'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
            }`}
          >
            <span>A</span>
            <span className="text-[10px] text-amber-400">
              {fontSize === 'sm' ? '1' : fontSize === 'base' ? '2' : fontSize === 'lg' ? '3' : '4'}
            </span>
          </button>

          {/* Line Numbers Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowLineNumbers((prev) => !prev);
              marioAudio.playClick();
            }}
            title="Toggle Codal Line Numbers (#)"
            className={`min-h-[34px] px-2 rounded-xl text-xs font-black border inline-flex items-center gap-1 cursor-pointer ${
              showLineNumbers
                ? 'bg-amber-400 text-slate-950 border-black'
                : theme === 'parchment'
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-600'
                : theme === 'ivory'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
            }`}
          >
            <Hash className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] hidden sm:inline">Lines</span>
          </button>

          {/* In-Statute Search Toggle */}
          <button
            type="button"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            title="Search in this codal provision"
            className={`min-h-[34px] px-2 rounded-xl text-xs font-bold border inline-flex items-center gap-1 cursor-pointer ${
              isSearchOpen || localSearch.trim()
                ? 'bg-amber-400 text-slate-950 border-black'
                : theme === 'parchment'
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-600'
                : theme === 'ivory'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
            }`}
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
          </button>

          {/* Save to Notes */}
          {onSaveToNotes && (
            <button
              type="button"
              onClick={onSaveToNotes}
              title="Save Statute into Study Notes"
              className={`min-h-[34px] px-2.5 rounded-xl text-xs font-bold border inline-flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isSavedToNotes
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : theme === 'parchment'
                  ? 'bg-amber-200/80 hover:bg-amber-300 text-amber-950 border-amber-600'
                  : theme === 'ivory'
                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-950 border-slate-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
              }`}
            >
              {isSavedToNotes ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  <span className="font-bold">Saved!</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="hidden sm:inline">Save Note</span>
                </>
              )}
            </button>
          )}

          {/* Copy Pure Verbatim */}
          <button
            type="button"
            onClick={handleCopyPure}
            title="Copy exact statutory text"
            className={`min-h-[34px] px-2.5 rounded-xl text-xs font-bold border inline-flex items-center gap-1.5 cursor-pointer shadow-xs ${
              copiedPure
                ? 'bg-emerald-600 text-white border-emerald-700'
                : theme === 'parchment'
                ? 'bg-amber-200/80 hover:bg-amber-300 text-amber-950 border-amber-600'
                : theme === 'ivory'
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-950 border-slate-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
            }`}
          >
            {copiedPure ? (
              <>
                <Check className="w-3.5 h-3.5 text-white shrink-0" />
                <span className="font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Copy Text</span>
              </>
            )}
          </button>

          {/* Download Markdown Slip */}
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            title="Download formatted legal slip as Markdown (.md)"
            className={`min-h-[34px] px-2 rounded-xl text-xs font-bold border inline-flex items-center gap-1 cursor-pointer ${
              theme === 'parchment'
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-600'
                : theme === 'ivory'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* In-Statute Search Box */}
      {isSearchOpen && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/95 border border-amber-400/50 text-white animate-in fade-in duration-150">
          <Search className="w-4 h-4 text-amber-400 shrink-0 ml-1" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search keywords in this provision (e.g. managerial, overtime, 25%)..."
            className="flex-1 bg-transparent border-none text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-hidden"
            autoFocus
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => setLocalSearch('')}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            Done
          </button>
        </div>
      )}

      {/* Recitation Mode Status Banner */}
      {isRecitationMode && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl bg-amber-400/15 border border-amber-400/50 text-xs">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold">
              Bar Recitation Mode Active: {revealedClozeIndices.size} of {clozeTerms.length} doctrine thresholds revealed.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                // Reveal all
                const all = new Set<number>();
                for (let i = 0; i < 200; i++) all.add(i);
                setRevealedClozeIndices(all);
                marioAudio.playCoin();
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] cursor-pointer"
            >
              Reveal All
            </button>
            <button
              type="button"
              onClick={() => {
                setRevealedClozeIndices(new Set());
                marioAudio.playClick();
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] cursor-pointer"
            >
              Hide All
            </button>
          </div>
        </div>
      )}

      {/* Controlling Statutory Rule Pill if present */}
      {keyRule && (
        <div
          className={`p-3 rounded-xl border text-xs sm:text-sm font-medium flex items-start gap-2.5 ${
            theme === 'parchment'
              ? 'bg-amber-100/90 border-amber-600/40 text-amber-950'
              : theme === 'ivory'
              ? 'bg-blue-50 border-blue-200 text-blue-950'
              : 'bg-amber-950/40 border-amber-400/30 text-amber-200'
          }`}
        >
          <Gavel className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-black uppercase tracking-wider text-[10px] block opacity-80">
              CORE STATUTORY DOCTRINE &amp; BAR PRINCIPLE:
            </span>
            <span>{renderFormattedText(keyRule)}</span>
          </div>
        </div>
      )}

      {/* Main Statutory Text Scroll Container */}
      <div className={`rounded-xl p-4 sm:p-6 border-2 select-text allow-text-select relative ${innerScrollClass}`}>
        {/* Header Ribbon Inside Codex */}
        <div
          className={`flex items-center justify-between gap-2 border-b pb-2 mb-3 text-[11px] font-mono ${
            theme === 'parchment'
              ? 'border-amber-700/20 text-amber-900 font-bold'
              : theme === 'ivory'
              ? 'border-slate-300 text-slate-600 font-semibold'
              : 'border-slate-800 text-amber-300'
          }`}
        >
          <span className="font-bold flex items-center gap-1.5">
            <BookOpen
              className={`w-3.5 h-3.5 ${
                theme === 'parchment' ? 'text-amber-800' : theme === 'ivory' ? 'text-blue-700' : 'text-amber-400'
              }`}
            />
            <span>OFFICIAL STATUTORY TEXT · LABOR CODE OF THE PHILIPPINES</span>
          </span>
          <span className="text-[10px] hidden sm:inline opacity-75">
            Unabridged Controlling Codification
          </span>
        </div>

        {/* Content Body: Line-Numbered or Block-Parsed */}
        {showLineNumbers ? (
          <div className={`space-y-1 font-mono ${sizeClass} ${leadingClass}`}>
            {splitVerbatimIntoNumberedLines(verbatim).map(({ lineNumber, text }) => (
              <div key={lineNumber} className="flex items-start gap-3 hover:bg-amber-500/10 rounded px-1 -mx-1">
                <span
                  className={`text-[10px] font-bold select-none text-right w-6 shrink-0 opacity-40 ${
                    theme === 'parchment' ? 'text-amber-950' : 'text-slate-400'
                  }`}
                >
                  {String(lineNumber).padStart(2, '0')}
                </span>
                <span className="flex-1 whitespace-pre-wrap break-words">
                  {renderFormattedText(text)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className={`space-y-3.5 ${fontClass} ${sizeClass} ${leadingClass}`}>
            {blocks.map((block, idx) => {
              if (block.type === 'article-header') {
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border ${
                      theme === 'parchment'
                        ? 'bg-amber-100/70 border-amber-600/50 text-stone-900'
                        : theme === 'ivory'
                        ? 'bg-slate-100 border-slate-300 text-slate-900'
                        : 'bg-amber-950/40 border-amber-500/40 text-amber-100'
                    }`}
                  >
                    <span
                      className={`font-black text-xs sm:text-sm uppercase tracking-wide block ${
                        theme === 'parchment'
                          ? 'text-amber-950'
                          : theme === 'ivory'
                          ? 'text-blue-900'
                          : 'text-amber-300'
                      }`}
                    >
                      {block.leadLabel}
                    </span>
                    {block.bodyText && (
                      <p className="mt-1.5 whitespace-pre-wrap font-medium">
                        {renderFormattedText(block.bodyText)}
                      </p>
                    )}
                  </div>
                );
              }

              if (block.type === 'subsection') {
                return (
                  <div
                    key={idx}
                    className={`pl-3.5 py-1 border-l-3 space-y-1 ${
                      theme === 'parchment'
                        ? 'border-amber-700 text-stone-900'
                        : theme === 'ivory'
                        ? 'border-blue-600 text-slate-900'
                        : 'border-amber-400 text-slate-100'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`text-xs font-black font-mono shrink-0 px-1.5 py-0.5 rounded ${
                          theme === 'parchment'
                            ? 'bg-amber-200/80 text-amber-950'
                            : theme === 'ivory'
                            ? 'bg-blue-100 text-blue-950'
                            : 'bg-amber-950 text-amber-300 border border-amber-400/40'
                        }`}
                      >
                        {block.leadLabel}
                      </span>
                      <div className="flex-1 whitespace-pre-wrap">
                        {renderFormattedText(block.bodyText)}
                      </div>
                    </div>
                  </div>
                );
              }

              if (block.type === 'admin-directive') {
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                      theme === 'parchment'
                        ? 'bg-blue-50/80 border-blue-600/30 text-blue-950'
                        : theme === 'ivory'
                        ? 'bg-sky-50 border-sky-300 text-sky-950'
                        : 'bg-sky-950/40 border-sky-500/40 text-sky-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] mb-1 opacity-90">
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span>{block.leadLabel}</span>
                    </div>
                    <div className="whitespace-pre-wrap">{renderFormattedText(block.bodyText)}</div>
                  </div>
                );
              }

              if (block.type === 'case-precedent') {
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                      theme === 'parchment'
                        ? 'bg-amber-50 border-amber-700/30 text-stone-900'
                        : theme === 'ivory'
                        ? 'bg-amber-50 border-amber-300 text-amber-950'
                        : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] mb-1 opacity-90 text-amber-400">
                      <Gavel className="w-3.5 h-3.5 shrink-0" />
                      <span>{block.leadLabel}</span>
                    </div>
                    <div className="whitespace-pre-wrap italic">{renderFormattedText(block.bodyText)}</div>
                  </div>
                );
              }

              if (block.type === 'doctrine-note') {
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                      theme === 'parchment'
                        ? 'bg-emerald-50 border-emerald-700/30 text-emerald-950'
                        : theme === 'ivory'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] mb-1 opacity-90 text-emerald-400">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span>{block.leadLabel}</span>
                    </div>
                    <div className="whitespace-pre-wrap">{renderFormattedText(block.bodyText)}</div>
                  </div>
                );
              }

              // Regular statute body
              return (
                <p key={idx} className="whitespace-pre-wrap font-medium">
                  {renderFormattedText(block.bodyText)}
                </p>
              );
            })}
          </div>
        )}

        {/* Footer citation stamp */}
        <div
          className={`mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono ${
            theme === 'parchment'
              ? 'border-amber-700/20 text-amber-900'
              : theme === 'ivory'
              ? 'border-slate-300 text-slate-500'
              : 'border-slate-800/80 text-slate-400'
          }`}
        >
          <span>Source: Bureau of Working Conditions (DOLE)</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyFull}
              className="hover:underline cursor-pointer flex items-center gap-1 text-[10px]"
            >
              <FileText className="w-3 h-3" />
              <span>{copiedFull ? 'Copied with Citation!' : 'Copy with Citation'}</span>
            </button>
            <span
              className={`${
                theme === 'parchment'
                  ? 'text-amber-950 font-black'
                  : theme === 'ivory'
                  ? 'text-blue-900 font-bold'
                  : 'text-amber-400/90 font-bold'
              }`}
            >
              Philippine Codal Repertory
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
