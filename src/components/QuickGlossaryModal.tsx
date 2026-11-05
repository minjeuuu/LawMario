import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  QUICK_GLOSSARY_TERMS,
  GLOSSARY_CATEGORIES,
  GlossaryCategory,
  QuickGlossaryItem,
} from '../data/quickGlossaryData';
import {
  MarioMushroomIcon,
  MarioFireFlowerIcon,
  MarioStarIcon,
  Mario1UpIcon,
  MarioCoinIcon,
  MarioPipeIcon,
  MarioBowserIcon,
  MarioQuestionBlockIcon,
} from './MarioIcons';
import { marioAudio } from '../utils/audio';
import {
  X,
  Search,
  Sparkles,
  Scale,
  Copy,
  Check,
  Volume2,
  Square,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Shuffle,
} from 'lucide-react';

interface QuickGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTermId?: string | null;
}

export const QuickGlossaryModal: React.FC<QuickGlossaryModalProps> = ({
  isOpen,
  onClose,
  initialTermId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | GlossaryCategory>('all');
  const [selectedTermId, setSelectedTermId] = useState<string>(() => {
    return initialTermId || QUICK_GLOSSARY_TERMS[0].id;
  });
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (initialTermId) {
      setSelectedTermId(initialTermId);
      setSelectedCategory('all');
      marioAudio.playPowerUp();
    }
  }, [initialTermId]);

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    };
  }, [isOpen, onClose]);

  const filteredTerms = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return QUICK_GLOSSARY_TERMS.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;
      return (
        item.term.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.marioPowerUp.toLowerCase().includes(q) ||
        item.statutoryBasis.toLowerCase().includes(q) ||
        item.simplifiedDefinition.toLowerCase().includes(q) ||
        item.barExamTip.toLowerCase().includes(q) ||
        item.aliases.some((alias) => alias.toLowerCase().includes(q))
      );
    });
  }, [searchTerm, selectedCategory]);

  const activeItem = useMemo(() => {
    return (
      filteredTerms.find((t) => t.id === selectedTermId) ||
      filteredTerms[0] ||
      QUICK_GLOSSARY_TERMS.find((t) => t.id === selectedTermId) ||
      QUICK_GLOSSARY_TERMS[0]
    );
  }, [selectedTermId, filteredTerms]);

  const activeIndexInFiltered = useMemo(() => {
    if (!activeItem || filteredTerms.length === 0) return -1;
    return filteredTerms.findIndex((t) => t.id === activeItem.id);
  }, [activeItem, filteredTerms]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleStepTerm = (delta: number) => {
    if (filteredTerms.length === 0) return;
    const baseIdx = activeIndexInFiltered >= 0 ? activeIndexInFiltered : 0;
    const nextIdx = (baseIdx + delta + filteredTerms.length) % filteredTerms.length;
    setSelectedTermId(filteredTerms[nextIdx].id);
    marioAudio.playCoin();
  };

  const handleRandomTerm = () => {
    const pool = filteredTerms.length > 1 ? filteredTerms : QUICK_GLOSSARY_TERMS;
    const candidates = pool.filter((item) => item.id !== activeItem?.id);
    const chosen = candidates[Math.floor(Math.random() * candidates.length)] || pool[0];
    if (chosen) {
      setSelectedTermId(chosen.id);
      marioAudio.playPowerUp();
    }
  };

  const handleCopy = async () => {
    if (!activeItem) return;
    const text = `Super Mario Labor Law Glossary: ${activeItem.term} [${activeItem.category}]\n\n[Mario Analogy - ${activeItem.marioPowerUp}]:\n"${activeItem.marioAnalogy}"\n\n[Statutory Definition]:\n${activeItem.simplifiedDefinition}\n\n[Legal Basis]: ${activeItem.statutoryBasis}\n\n[Bar Exam Tip]: ${activeItem.barExamTip}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      marioAudio.playCoin();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard fallback ignored
    }
  };

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(
      `${activeItem.term}. Mario analogy: ${activeItem.marioAnalogy}. Statutory rule: ${activeItem.simplifiedDefinition}. Legal basis: ${activeItem.statutoryBasis}. Bar tip: ${activeItem.barExamTip}`
    );
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    marioAudio.playJump();
    window.speechSynthesis.speak(utterance);
  };

  const renderIcon = (iconType: QuickGlossaryItem['marioIcon']) => {
    switch (iconType) {
      case 'mushroom':
        return <MarioMushroomIcon className="w-5 h-5" />;
      case 'fire_flower':
        return <MarioFireFlowerIcon className="w-5 h-5" />;
      case 'star':
        return <MarioStarIcon className="w-5 h-5" />;
      case '1up':
        return <Mario1UpIcon className="w-5 h-5" />;
      case 'coin':
        return <MarioCoinIcon className="w-5 h-5" />;
      case 'pipe':
        return <MarioPipeIcon className="w-5 h-5" />;
      case 'bowser':
        return <MarioBowserIcon className="w-5 h-5" />;
      default:
        return <MarioQuestionBlockIcon className="w-5 h-5 text-slate-950" />;
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mushroom Kingdom Legal Glossary"
      data-testid="quick-glossary-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 print:hidden"
    >
      <div
        data-testid="quick-glossary-modal-card"
        className="bg-slate-900 border-4 border-amber-400 rounded-3xl w-[96vw] max-w-6xl h-[92dvh] md:h-[88vh] max-h-[880px] flex flex-col shadow-[0_16px_48px_rgba(0,0,0,0.75)] overflow-hidden text-white"
      >
        {/* Header */}
        <div className="px-3.5 py-2.5 sm:px-6 sm:py-3.5 bg-slate-950 border-b-2 border-amber-400 flex items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-amber-400 rounded-2xl border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
              <MarioQuestionBlockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-semibold text-slate-300">
                <span className="font-mario text-[8.5px] sm:text-[10px] uppercase text-amber-400 whitespace-nowrap">
                  MARIO JURISPRUDENCE
                </span>
                <span aria-hidden="true" className="hidden sm:inline">·</span>
                <span
                  data-testid="glossary-total-count"
                  className="font-mono text-emerald-300 tabular-nums whitespace-nowrap text-[11px]"
                >
                  {QUICK_GLOSSARY_TERMS.length} Codified Doctrines &amp; Terms
                </span>
              </div>
              <h2 className="text-sm sm:text-xl font-black font-display text-white truncate">
                MUSHROOM KINGDOM LEGAL GLOSSARY
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRandomTerm}
              title="Jump to a random legal doctrine"
              className="min-h-[38px] px-2.5 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border-2 border-slate-700 text-xs font-black inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
            >
              <Shuffle className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Random Term</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-800 hover:bg-red-600 hover:text-white text-slate-300 border-2 border-slate-700 flex items-center justify-center cursor-pointer transition-colors shrink-0"
              aria-label="Close Quick Glossary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Filter Bar */}
        <div className="px-3 py-2 sm:px-5 bg-slate-950/95 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              marioAudio.playClick();
            }}
            className={`min-h-[32px] px-2.5 py-1 rounded-lg border text-[11px] font-black whitespace-nowrap cursor-pointer transition-colors shrink-0 tabular-nums ${
              selectedCategory === 'all'
                ? 'bg-amber-400 text-slate-950 border-black'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            All ({QUICK_GLOSSARY_TERMS.length})
          </button>
          {GLOSSARY_CATEGORIES.map((cat) => {
            const count = QUICK_GLOSSARY_TERMS.filter((t) => t.category === cat).length;
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  marioAudio.playClick();
                }}
                className={`min-h-[32px] px-2.5 py-1 rounded-lg border text-[11px] font-bold whitespace-nowrap cursor-pointer transition-colors shrink-0 tabular-nums ${
                  active
                    ? 'bg-emerald-400 text-slate-950 border-black font-black'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col lg:flex-row">
          {/* Mobile & Tablet (<lg): Compact Search + Dropdown + Single-Row Horizontal Tab Strip */}
          <div className="flex lg:hidden flex-col shrink-0 bg-slate-950/90 border-b-2 border-slate-800 px-3 py-2 gap-2 max-w-full">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  aria-label="Search glossary terms"
                  placeholder="Search 70+ doctrines, cases, statutes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 bg-slate-900 border-2 border-slate-700 rounded-xl pl-9 pr-8 text-xs font-bold text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-400"
                />
                {searchTerm && (
                  <button
                    type="button"
                    aria-label="Clear glossary search"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {filteredTerms.length > 0 && (
                <select
                  aria-label="Select Glossary Doctrine"
                  value={activeItem?.id || ''}
                  onChange={(e) => {
                    setSelectedTermId(e.target.value);
                    marioAudio.playCoin();
                  }}
                  className="h-9 sm:w-56 bg-slate-900 border-2 border-slate-700 rounded-xl px-2.5 text-xs font-bold text-amber-300 cursor-pointer focus:outline-hidden focus:border-amber-400 shrink-0 truncate"
                >
                  {filteredTerms.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.term}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {filteredTerms.length > 0 ? (
              <div className="flex items-center gap-1.5 max-w-full">
                <button
                  type="button"
                  aria-label="Scroll glossary tabs left"
                  onClick={(e) => {
                    const list = e.currentTarget.nextElementSibling as HTMLElement | null;
                    list?.scrollBy({ left: -200, behavior: 'smooth' });
                  }}
                  className="h-8 w-7 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 inline-flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div
                  role="tablist"
                  aria-label="Glossary Doctrines"
                  data-testid="glossary-mobile-tabs"
                  className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar"
                >
                  {filteredTerms.map((item) => {
                    const isSelected = activeItem?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        onClick={(e) => {
                          setSelectedTermId(item.id);
                          e.currentTarget.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest',
                            inline: 'center',
                          });
                          marioAudio.playCoin();
                        }}
                        className={`h-8 px-2.5 rounded-xl border text-xs font-black whitespace-nowrap cursor-pointer transition-colors shrink-0 inline-flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-amber-400 border-black text-slate-950 shadow-[0_2px_0_#000]'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                        }`}
                      >
                        <span>{item.term}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  aria-label="Scroll glossary tabs right"
                  onClick={(e) => {
                    const list = e.currentTarget.previousElementSibling as HTMLElement | null;
                    list?.scrollBy({ left: 200, behavior: 'smooth' });
                  }}
                  className="h-8 w-7 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 inline-flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 text-xs text-slate-300 py-1">
                <span className="truncate">No glossary doctrines match &ldquo;{searchTerm}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold cursor-pointer shrink-0"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Desktop (lg+): Left Sidebar Search & Scrollable Term Directory */}
          <div className="hidden lg:flex lg:w-80 xl:w-96 shrink-0 flex-col min-h-0 overflow-hidden bg-slate-950/75 border-r-2 border-slate-800 p-4 space-y-2.5">
            <div className="relative shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                aria-label="Search glossary terms desktop"
                placeholder="Search doctrines, cases, statutes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm font-bold text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  aria-label="Clear desktop glossary search"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="text-[10px] font-mario text-slate-400 px-1 uppercase flex items-center justify-between shrink-0 tabular-nums">
              <span>TERMS ({filteredTerms.length})</span>
              <span className="text-amber-400">SELECT DOCTRINE</span>
            </div>

            {filteredTerms.length > 0 ? (
              <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
                {filteredTerms.map((item) => {
                  const isSelected = activeItem?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedTermId(item.id);
                        marioAudio.playCoin();
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-amber-400 border-black text-slate-950 font-black shadow-[0_2px_0_#000]'
                          : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="shrink-0">{renderIcon(item.marioIcon)}</div>
                        <div className="min-w-0">
                          <span className="text-xs font-black block truncate leading-tight">
                            {item.term}
                          </span>
                          <span
                            className={`text-[10px] font-semibold block truncate ${
                              isSelected ? 'text-slate-900' : 'text-amber-400'
                            }`}
                          >
                            {item.category} · {item.statutoryBasis}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-75" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs space-y-2">
                <p className="font-bold text-slate-200">
                  No glossary doctrines match &ldquo;{searchTerm}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* Right / Main Workspace: Active Term Full Wide Card */}
          <div
            data-testid="glossary-content-pane"
            className="flex-1 min-w-0 min-h-0 overflow-y-auto p-3.5 sm:p-6 space-y-4 bg-slate-900"
          >
            {activeItem && (
              <>
                {/* Active Term Title & Action Strip */}
                <div className="border-b-2 border-slate-800 pb-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-emerald-300 font-bold text-[11px] whitespace-nowrap">
                        {activeItem.category}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-mario text-[9.5px] text-amber-300 uppercase">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                        <span>{activeItem.marioPowerUp}</span>
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-white font-display leading-tight break-words">
                      {activeItem.term}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0 max-w-full">
                    <button
                      type="button"
                      onClick={handleSpeak}
                      className={`min-h-[38px] px-3 rounded-xl border-2 text-xs font-black inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                        isSpeaking
                          ? 'bg-amber-400 text-slate-950 border-black'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      }`}
                    >
                      {isSpeaking ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current shrink-0" />
                          <span>Stop Audio</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="min-h-[38px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border-2 border-slate-700 text-xs font-black inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-emerald-300">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Spacious 2-Column Side-by-Side Doctrine Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
                  {/* Column A: Simplified Statutory Definition & Legal Basis */}
                  <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border-2 border-slate-800 flex flex-col justify-between gap-4 min-w-0">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Scale className="w-4 h-4 shrink-0" />
                        <span className="font-mario text-[10px] sm:text-xs font-black uppercase tracking-wider">
                          STATUTORY DEFINITION &amp; RULE
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-slate-100 font-semibold leading-relaxed break-words">
                        {activeItem.simplifiedDefinition}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/90 space-y-2">
                      <div className="flex flex-col gap-0.5 text-xs font-mono">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">
                          CODIFIED LEGAL BASIS &amp; JURISPRUDENCE
                        </span>
                        <span className="font-black text-amber-300 break-words">
                          {activeItem.statutoryBasis}
                        </span>
                      </div>
                      {activeItem.aliases && activeItem.aliases.length > 0 && (
                        <div className="text-xs text-slate-400 leading-snug break-words">
                          <span className="font-semibold text-slate-300">Related Keywords: </span>
                          <span>{activeItem.aliases.join(' · ')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column B: Super Mario Analogy + Bar Exam Pro-Tip Stacked Cleanly */}
                  <div className="flex flex-col gap-4 justify-between min-w-0">
                    <div className="bg-amber-400 text-slate-950 p-4 sm:p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0_#000] space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <MarioStarIcon className="w-5 h-5 shrink-0" />
                        <span className="font-mario text-[10px] sm:text-xs font-black uppercase tracking-wider break-words">
                          MARIO ANALOGY · {activeItem.marioPowerUp}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base font-extrabold leading-relaxed break-words">
                        &ldquo;{activeItem.marioAnalogy}&rdquo;
                      </p>
                    </div>

                    <div className="bg-red-950/65 p-4 sm:p-5 rounded-2xl border-2 border-red-700/80 space-y-2 flex-1">
                      <div className="flex items-center gap-2 text-rose-200">
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-mario text-[10px] sm:text-xs font-black uppercase tracking-wider">
                          BAR EXAM PRO-TIP &amp; COMMON TRAP
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-rose-100 font-bold leading-relaxed break-words">
                        {activeItem.barExamTip}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer with Quick Prev/Next Term Navigation */}
        <div className="px-3.5 py-2.5 sm:px-6 sm:py-3 bg-slate-950 border-t-2 border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 shrink-0 max-w-full">
          <span className="text-[11px] font-mono tabular-nums text-slate-300">
            {activeIndexInFiltered >= 0
              ? `Doctrine ${activeIndexInFiltered + 1} of ${filteredTerms.length}`
              : `${QUICK_GLOSSARY_TERMS.length} Doctrines`}
          </span>

          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 ml-auto max-w-full">
            {filteredTerms.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => handleStepTerm(-1)}
                  className="min-h-[38px] px-2.5 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                  <span className="sm:hidden">Prev</span>
                  <span className="hidden sm:inline">Prev Term</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStepTerm(1)}
                  className="min-h-[38px] px-2.5 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <span className="sm:hidden">Next</span>
                  <span className="hidden sm:inline">Next Term</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="min-h-[38px] px-3.5 sm:px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black text-xs uppercase cursor-pointer whitespace-nowrap"
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
