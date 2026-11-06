import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Scale,
  BookOpen,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  X,
  Volume2,
  Square,
  BookmarkPlus,
  Download,
  SlidersHorizontal,
  Gavel,
  ShieldAlert,
} from 'lucide-react';
import {
  STATUTE_LOOKUP_CATALOG,
  StatuteLookupEntry,
  lookupStatutesByQuery,
} from '../utils/round8Features';
import {
  loadStudyNotes,
  createStudyNote,
  saveStudyNotes,
} from '../utils/engagementFeatures';
import { ALL_LAW_TOPICS } from '../data/laborLawData';
import { marioAudio } from '../utils/audio';
import { VerbatimCodalViewer } from './VerbatimCodalViewer';

interface StatuteLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onJumpToTopic?: (worldId: string, topicId?: string) => void;
}

const QUICK_STATUTE_NUMBERS: readonly string[] = [
  '82',
  '84',
  '86',
  '87',
  '88',
  '94',
  '95',
  '96',
  '100',
  '106',
  '113',
  '124',
  '297',
  '298',
  '302',
  '306',
  'PD 851',
  'RA 11210',
  'RA 10361',
  'RA 11313',
];

type BookScopeFilter = 'all' | 'book3' | 'wages_contracting' | 'post_employment' | 'special_laws';

const BOOK_SCOPE_FILTERS: Array<{ id: BookScopeFilter; label: string }> = [
  { id: 'all', label: 'All Provisions' },
  { id: 'book3', label: 'Book III: Hours & Conditions' },
  { id: 'wages_contracting', label: 'Wages & D.O. 174' },
  { id: 'post_employment', label: 'Dismissal & Retirement' },
  { id: 'special_laws', label: 'Special Labor Laws' },
];

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        className="bg-amber-400/40 text-amber-200 px-1 py-0.5 rounded font-black"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export const StatuteLookupModal: React.FC<StatuteLookupModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  onJumpToTopic,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedBook, setSelectedBook] = useState<BookScopeFilter>('all');
  const [selectedId, setSelectedId] = useState<string>(STATUTE_LOOKUP_CATALOG[5]?.id || 'art-87');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [fontSizeScale, setFontSizeScale] = useState<'sm' | 'base' | 'lg'>('base');
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (!isOpen && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const rawResults = useMemo(
    () => lookupStatutesByQuery(query, ALL_LAW_TOPICS),
    [query]
  );

  const results = useMemo(() => {
    if (selectedBook === 'all') return rawResults;

    return rawResults.filter((entry) => {
      const artNum = entry.articleNumber.toUpperCase();
      const code = entry.codeLabel.toUpperCase();

      if (selectedBook === 'book3') {
        const num = parseInt(artNum, 10);
        return (!isNaN(num) && num >= 82 && num <= 100) || artNum.includes('94') || artNum.includes('95');
      }
      if (selectedBook === 'wages_contracting') {
        const num = parseInt(artNum, 10);
        return (!isNaN(num) && num >= 97 && num <= 129) || code.includes('106') || code.includes('WAGE');
      }
      if (selectedBook === 'post_employment') {
        const num = parseInt(artNum, 10);
        return (!isNaN(num) && num >= 297 && num <= 302) || code.includes('297') || code.includes('298');
      }
      if (selectedBook === 'special_laws') {
        return code.includes('RA') || code.includes('PD') || code.includes('D.O.');
      }
      return true;
    });
  }, [rawResults, selectedBook]);

  const activeEntry: StatuteLookupEntry | null = useMemo(() => {
    if (results.length === 0) return null;
    return results.find((r) => r.id === selectedId) || results[0];
  }, [results, selectedId]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleCycleSpeechRate = () => {
    const nextRate = speechRate === 0.8 ? 1.0 : speechRate === 1.0 ? 1.25 : 0.8;
    setSpeechRate(nextRate);
    marioAudio.playClick();
  };

  const handleCycleFontSize = () => {
    const next = fontSizeScale === 'sm' ? 'base' : fontSizeScale === 'base' ? 'lg' : 'sm';
    setFontSizeScale(next);
    marioAudio.playClick();
  };

  const handleCopyEntry = (entry: StatuteLookupEntry) => {
    const payload = [
      `${entry.codeLabel} — ${entry.title}`,
      '',
      'Statutory Provision Text:',
      entry.statutoryText,
      '',
      'Key Supreme Court Controlling Precedents:',
      ...entry.supremeCourtDoctrines.map((d) => `• ${d}`),
      '',
      'Bar Exam Traps & Interpretation Guidance:',
      ...entry.interpretationTips.map((t) => `• ${t}`),
    ].join('\n');
    navigator.clipboard?.writeText(payload);
    setCopiedId(entry.id);
    marioAudio.playCoin();
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDownloadSingleStatute = (entry: StatuteLookupEntry) => {
    const lines = [
      `# ${entry.codeLabel} — ${entry.title}`,
      '# Super Mario Philippine Labor Law Codal Dossier',
      `# Export Timestamp: ${new Date().toLocaleString()}`,
      '',
      '======================================================================',
      '## STATUTORY PROVISION TEXT',
      '======================================================================',
      entry.statutoryText,
      '',
      '======================================================================',
      '## KEY SUPREME COURT CONTROLLING PRECEDENTS',
      '======================================================================',
      ...entry.supremeCourtDoctrines.map((d, i) => `${i + 1}. ${d}`),
      '',
      '======================================================================',
      '## BAR EXAM TRAPS & INTERPRETATION GUIDANCE',
      '======================================================================',
      ...entry.interpretationTips.map((t, i) => `${i + 1}. ${t}`),
      '',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statute_${entry.articleNumber.toLowerCase().replace(/[^a-z0-9]/g, '_')}_dossier.md`;
    a.click();
    URL.revokeObjectURL(url);
    marioAudio.playCoin();
  };

  const handleNarrateEntry = (entry: StatuteLookupEntry) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (speakingId === entry.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      marioAudio.playClick();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      `${entry.codeLabel}. ${entry.title}. Statutory text: ${entry.statutoryText}. Key doctrine: ${
        entry.supremeCourtDoctrines[0] || ''
      }`
    );
    utterance.rate = speechRate;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(entry.id);
    marioAudio.playCoin();
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveStatuteToNotes = (entry: StatuteLookupEntry) => {
    if (typeof window === 'undefined') return;
    const existing = loadStudyNotes(window.localStorage);
    const title = `${entry.codeLabel} — ${entry.title}`;
    const sections: string[] = [
      `${entry.title} (${entry.codeLabel})`,
      `Controlling Statutory Text:\n${entry.statutoryText}`,
      ...(entry.supremeCourtDoctrines.length > 0
        ? [`Supreme Court Controlling Doctrines:\n${entry.supremeCourtDoctrines.map((d) => `• ${d}`).join('\n')}`]
        : []),
      ...(entry.interpretationTips.length > 0
        ? [`Bar Exam Interpretation Tips:\n${entry.interpretationTips.map((t) => `• ${t}`).join('\n')}`]
        : []),
      `Ref: statute_${entry.articleNumber.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    ];
    const updated = createStudyNote(existing, {
      title: title.slice(0, 110),
      content: sections.join('\n\n'),
      worldTag: entry.worldId || 'all',
      categoryTag: 'Key Doctrine' as any,
    });
    saveStudyNotes(updated, window.localStorage);
    window.dispatchEvent(new CustomEvent('mario-study-notes-updated'));
    setSavedNoteId(entry.id);
    marioAudio.playCoin();
    setTimeout(() => setSavedNoteId(null), 2200);
  };

  const fontClass =
    fontSizeScale === 'sm'
      ? 'text-xs leading-relaxed'
      : fontSizeScale === 'lg'
      ? 'text-base sm:text-lg leading-relaxed'
      : 'text-xs sm:text-sm leading-relaxed';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Labor Code Statute Lookup Tool"
      data-testid="statute-lookup-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[85] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-5 print:hidden overflow-y-auto"
    >
      <div className="w-full max-w-5xl max-h-[92dvh] bg-gradient-to-b from-[#171923] via-[#0f172a] to-[#090d16] text-white rounded-3xl border-4 border-amber-400 shadow-[0_10px_0_#000] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-950 px-4 sm:px-6 py-4 border-b-2 border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-slate-950 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
              <Scale className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase text-amber-400 font-mono tracking-wider block truncate">
                  INSTANT CODAL &amp; JURISPRUDENCE FINDER
                </span>
                <span className="text-slate-400 text-xs font-bold">
                  · {results.length} Provisions
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black font-display text-white truncate">
                Philippine Labor Statute &amp; Codal Lookup
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Font scale control */}
            <button
              type="button"
              onClick={handleCycleFontSize}
              title="Toggle reading font size (Small, Normal, Large)"
              className="min-h-[38px] px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Font: {fontSizeScale.toUpperCase()}</span>
            </button>

            {/* Speech rate control */}
            <button
              type="button"
              onClick={handleCycleSpeechRate}
              title="Toggle Text-to-Speech narration rate"
              className="min-h-[38px] px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer tabular-nums"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{speechRate}x</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Statute Lookup"
              className="min-w-[42px] min-h-[42px] rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white border-2 border-slate-700 flex items-center justify-center cursor-pointer shrink-0 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Input, Book Scope & Quick Article Buttons */}
        <div className="bg-slate-950/90 px-4 sm:px-6 py-3.5 border-b border-slate-800 space-y-2.5 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              data-testid="statute-lookup-input"
              aria-label="Enter Labor Code Article number, Republic Act, or keyword"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              placeholder="Type Article or Law # (e.g., 87, Art. 94, 106, 297, RA 11210, overtime, SIL)..."
              className="w-full bg-slate-900 text-white placeholder-slate-400 text-xs sm:text-sm font-bold pl-10 pr-20 py-2.5 rounded-xl border-2 border-slate-700 focus:outline-none focus:border-amber-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Book Scope Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            {BOOK_SCOPE_FILTERS.map((bf) => {
              const isSelected = selectedBook === bf.id;
              return (
                <button
                  key={bf.id}
                  type="button"
                  onClick={() => {
                    setSelectedBook(bf.id);
                    marioAudio.playClick();
                  }}
                  className={`min-h-[32px] px-3 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 border-2 border-black font-black'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {bf.label}
                </button>
              );
            })}
          </div>

          {/* Quick Article Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 pt-1 border-t border-slate-800/60">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1">
              Quick Articles:
            </span>
            {QUICK_STATUTE_NUMBERS.map((num) => {
              const isCurrent =
                query.trim().toLowerCase() === num.toLowerCase() ||
                (!query.trim() && activeEntry?.articleNumber === num);
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setQuery(num);
                    marioAudio.playClick();
                  }}
                  className={`min-h-[30px] px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border shrink-0 cursor-pointer transition-colors ${
                    isCurrent
                      ? 'bg-amber-400 text-slate-950 border-black font-black'
                      : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-700'
                  }`}
                >
                  {num.startsWith('RA') || num.startsWith('PD') ? num : `Art. ${num}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Split Results & Detail Pane */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Left Result List */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-800 p-3 sm:p-4 space-y-2 max-h-56 lg:max-h-none overflow-y-auto bg-slate-950/60">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
              <span>Matched Provisions</span>
              <span className="font-mono text-amber-300 tabular-nums">{results.length} found</span>
            </div>

            {results.length === 0 ? (
              <div className="p-5 rounded-2xl bg-slate-900 border border-dashed border-slate-700 text-center space-y-2">
                <p className="text-xs font-bold text-slate-300">
                  No direct match for &ldquo;{query}&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSelectedBook('all');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-black text-xs cursor-pointer"
                >
                  Show All Core Articles
                </button>
              </div>
            ) : (
              results.map((item) => {
                const isSelected = activeEntry?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-testid={`statute-result-${item.id}`}
                    onClick={() => {
                      setSelectedId(item.id);
                      marioAudio.playClick();
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer space-y-1 ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-black shadow-[0_2px_0_#000] -translate-y-0.5'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-100 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono font-black">
                      <span>{item.codeLabel}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded ${isSelected ? 'bg-black/20 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                        {item.articleNumber}
                      </span>
                    </div>
                    <p
                      className={`text-xs font-extrabold leading-snug line-clamp-2 ${
                        isSelected ? 'text-slate-950' : 'text-white'
                      }`}
                    >
                      {highlightText(item.title, query)}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Detailed Statute View */}
          <div className="lg:col-span-8 p-4 sm:p-6 space-y-5 overflow-y-auto">
            {activeEntry ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="space-y-1 min-w-0">
                    <span className="text-xs font-mono font-black text-amber-300 block">
                      {activeEntry.codeLabel}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black font-display text-white leading-snug">
                      {highlightText(activeEntry.title, query)}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Read Aloud Button */}
                    <button
                      type="button"
                      onClick={() => handleNarrateEntry(activeEntry)}
                      className={`min-h-[38px] px-3 rounded-xl text-xs font-black border inline-flex items-center gap-1.5 cursor-pointer ${
                        speakingId === activeEntry.id
                          ? 'bg-rose-500 text-white border-black'
                          : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                      }`}
                    >
                      {speakingId === activeEntry.id ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Read Aloud</span>
                        </>
                      )}
                    </button>

                    {/* Copy Dossier Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyEntry(activeEntry)}
                      className="min-h-[38px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedId === activeEntry.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {/* Download Markdown Dossier Button */}
                    <button
                      type="button"
                      onClick={() => handleDownloadSingleStatute(activeEntry)}
                      title="Download complete statute dossier as Markdown"
                      className="min-h-[38px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold border border-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export (.md)</span>
                    </button>

                    {/* Save to Notes Button */}
                    <button
                      type="button"
                      data-testid={`statute-save-notes-btn-${activeEntry.id}`}
                      onClick={() => handleSaveStatuteToNotes(activeEntry)}
                      className="min-h-[38px] px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
                    >
                      {savedNoteId === activeEntry.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Saved to Notes</span>
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="w-3.5 h-3.5" />
                          <span>Save to Notes</span>
                        </>
                      )}
                    </button>

                    {onJumpToTopic && (
                      <button
                        type="button"
                        data-testid="statute-jump-to-module-btn"
                        onClick={() => {
                          onJumpToTopic(activeEntry.worldId, activeEntry.topicId);
                          onClose();
                          marioAudio.playPipe();
                        }}
                        className="min-h-[38px] px-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Open in Module</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 1. Controlling Statutory Provision Text */}
                <VerbatimCodalViewer
                  statuteId={activeEntry.id}
                  citation={activeEntry.articleNumber}
                  title={activeEntry.title}
                  verbatim={activeEntry.statutoryText}
                  keyRule={activeEntry.keyDoctrine}
                  worldBadge={activeEntry.bookCategory}
                  initialTheme="parchment"
                  searchQuery={query}
                  onSaveToNotes={() => handleSaveStatuteToNotes(activeEntry)}
                  isSavedToNotes={savedNotesId === activeEntry.id}
                  variant="modal"
                />

                {/* 2. Controlling Supreme Court Precedents */}
                {activeEntry.supremeCourtDoctrines.length > 0 && (
                  <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-4 sm:p-5 border-2 border-emerald-500/50 shadow-[2px_2px_0_#000] space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2 text-xs font-black text-emerald-300">
                        <Gavel className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span className="font-mono uppercase tracking-wider">
                          CONTROLLING SUPREME COURT PRECEDENTS
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        {activeEntry.supremeCourtDoctrines.length} Precedent{activeEntry.supremeCourtDoctrines.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-slate-200">
                      {activeEntry.supremeCourtDoctrines.map((doc, idx) => (
                        <li
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 font-medium leading-relaxed"
                        >
                          {highlightText(doc, query)}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* 3. Bar Exam Traps & Interpretation Guidance */}
                {activeEntry.interpretationTips.length > 0 && (
                  <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-4 sm:p-5 border-2 border-sky-400/50 shadow-[2px_2px_0_#000] space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2 text-xs font-black text-sky-300">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-sky-400" />
                        <span className="font-mono uppercase tracking-wider">
                          BAR EXAM TRAPS &amp; INTERPRETATION GUIDANCE
                        </span>
                      </div>
                      <span className="text-[10px] text-sky-400 font-mono font-bold">
                        High-Yield Bar Tips
                      </span>
                    </div>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-slate-200">
                      {activeEntry.interpretationTips.map((tip, idx) => (
                        <li
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-900/90 border border-sky-400/30 font-medium leading-relaxed"
                        >
                          {highlightText(tip, query)}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
