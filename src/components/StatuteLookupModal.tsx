import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { jsPDF } from 'jspdf';
import {
  Search,
  Scale,
  BookOpen,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  X,
  Volume2,
  Square,
  BookmarkPlus,
  Download,
  FileDown,
  SlidersHorizontal,
  Gavel,
  ShieldAlert,
  ChevronDown,
  Type,
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
  '83',
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
  'RA 11360',
  'RA 11165',
  'RA 8187',
  'RA 11861',
  'RA 9262',
  'RA 9710',
  'RA 10361',
  'RA 11313',
  'DO 174',
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
  const [statuteFontFamily, setStatuteFontFamily] = useState<'serif' | 'sans' | 'mono' | 'playfair'>('serif');
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'list' | 'detail'>('list');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      setMobileTab('detail');
    }
  }, [initialQuery]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 75);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }
  }, [selectedId]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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
      const digitsOnly = artNum.replace(/[^0-9]/g, '');
      const num = digitsOnly ? parseInt(digitsOnly, 10) : NaN;

      if (selectedBook === 'book3') {
        return (!isNaN(num) && num >= 82 && num <= 100) || artNum.includes('94') || artNum.includes('95');
      }
      if (selectedBook === 'wages_contracting') {
        return (
          (!isNaN(num) && num >= 97 && num <= 129) ||
          code.includes('106') ||
          code.includes('WAGE') ||
          code.includes('174') ||
          artNum.includes('106')
        );
      }
      if (selectedBook === 'post_employment') {
        return (
          (!isNaN(num) && num >= 279 && num <= 306) ||
          code.includes('279') ||
          code.includes('280') ||
          code.includes('281') ||
          code.includes('282') ||
          code.includes('283') ||
          code.includes('285') ||
          code.includes('286') ||
          code.includes('287') ||
          code.includes('291') ||
          code.includes('294') ||
          code.includes('295') ||
          code.includes('296') ||
          code.includes('297') ||
          code.includes('298') ||
          code.includes('300') ||
          code.includes('301') ||
          code.includes('302') ||
          code.includes('306') ||
          artNum.includes('294') ||
          artNum.includes('295') ||
          artNum.includes('296') ||
          artNum.includes('297') ||
          artNum.includes('298') ||
          artNum.includes('300') ||
          artNum.includes('301') ||
          artNum.includes('302') ||
          artNum.includes('306')
        );
      }
      if (selectedBook === 'special_laws') {
        return (
          code.includes('RA') ||
          code.includes('PD') ||
          code.includes('D.O.') ||
          code.includes('REPUBLIC ACT') ||
          code.includes('PRESIDENTIAL DECREE') ||
          code.includes('R.A.') ||
          code.includes('P.D.') ||
          artNum.includes('RA') ||
          artNum.includes('PD') ||
          artNum.includes('D.O.')
        );
      }
      return true;
    });
  }, [rawResults, selectedBook]);

  // Keep selectedId valid when results change
  useEffect(() => {
    if (results.length > 0 && !results.some((r) => r.id === selectedId)) {
      setSelectedId(results[0].id);
    }
  }, [results, selectedId]);

  const activeEntry: StatuteLookupEntry | null = useMemo(() => {
    if (results.length === 0) return null;
    return results.find((r) => r.id === selectedId) || results[0];
  }, [results, selectedId]);

  const currentIndex = useMemo(() => {
    if (!activeEntry) return -1;
    return results.findIndex((r) => r.id === activeEntry.id);
  }, [results, activeEntry]);

  const handlePrevStatute = () => {
    if (currentIndex > 0) {
      setSelectedId(results[currentIndex - 1].id);
      marioAudio.playClick();
    }
  };

  const handleNextStatute = () => {
    if (currentIndex >= 0 && currentIndex < results.length - 1) {
      setSelectedId(results[currentIndex + 1].id);
      marioAudio.playClick();
    }
  };

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
      'Common Traps & Practical Interpretation Guidance:',
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
      '## COMMON TRAPS & PRACTICAL INTERPRETATION GUIDANCE',
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

  const handleDownloadSingleStatutePdf = (entry: StatuteLookupEntry) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 16;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      // Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');
      doc.setTextColor(251, 191, 36); // amber-400
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('REPUBLIC OF THE PHILIPPINES · LABOR LAW CODEX', margin + 6, y + 8);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.text(entry.codeLabel || 'Statutory Provision', margin + 6, y + 17);
      y += 30;

      // Title
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      const titleLines = doc.splitTextToSize(entry.title, contentWidth);
      doc.text(titleLines, margin, y);
      y += titleLines.length * 5 + 4;

      // Statutory Text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const statuteLines = doc.splitTextToSize(entry.statutoryText, contentWidth);
      for (let i = 0; i < statuteLines.length; i++) {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = margin;
        }
        doc.text(statuteLines[i], margin, y);
        y += 4.5;
      }
      y += 4;

      // Supreme Court Precedents
      if (entry.supremeCourtDoctrines.length > 0) {
        if (y > pageHeight - 30) {
          doc.addPage();
          y = margin;
        }
        doc.setFillColor(240, 253, 244);
        doc.setDrawColor(34, 197, 94);
        doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');
        doc.setTextColor(20, 83, 45);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text('KEY SUPREME COURT CONTROLLING PRECEDENTS', margin + 4, y + 5.5);
        y += 12;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        entry.supremeCourtDoctrines.forEach((docText, idx) => {
          const docLines = doc.splitTextToSize(`${idx + 1}. ${docText}`, contentWidth - 4);
          for (let i = 0; i < docLines.length; i++) {
            if (y > pageHeight - 20) {
              doc.addPage();
              y = margin;
            }
            doc.text(docLines[i], margin + 2, y);
            y += 4.2;
          }
          y += 2;
        });
      }

      // Practical Interpretation Guidance & Common Traps
      if (entry.interpretationTips.length > 0) {
        if (y > pageHeight - 30) {
          doc.addPage();
          y = margin;
        }
        doc.setFillColor(238, 242, 255);
        doc.setDrawColor(99, 102, 241);
        doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');
        doc.setTextColor(49, 46, 129);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text('COMMON TRAPS & PRACTICAL INTERPRETATION GUIDANCE', margin + 4, y + 5.5);
        y += 12;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        entry.interpretationTips.forEach((tipText, idx) => {
          const tipLines = doc.splitTextToSize(`• ${tipText}`, contentWidth - 4);
          for (let i = 0; i < tipLines.length; i++) {
            if (y > pageHeight - 20) {
              doc.addPage();
              y = margin;
            }
            doc.text(tipLines[i], margin + 2, y);
            y += 4.2;
          }
          y += 2;
        });
      }

      const safeName = entry.articleNumber.toLowerCase().replace(/[^a-z0-9]/g, '_');
      doc.save(`statute_${safeName}_official_dossier.pdf`);
      marioAudio.playPowerUp();
    } catch {
      // fallback
    }
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
        ? [`Practical Interpretation Tips:\n${entry.interpretationTips.map((t) => `• ${t}`).join('\n')}`]
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
      data-codal-font={statuteFontFamily}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[85] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-1 sm:p-4 print:hidden overflow-y-auto"
    >
      <div className="w-full max-w-5xl h-[98dvh] sm:h-[92dvh] max-h-[98dvh] sm:max-h-[92dvh] bg-gradient-to-b from-[#171923] via-[#0f172a] to-[#090d16] text-white rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-amber-400 shadow-[0_10px_0_#000] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-950 px-3 sm:px-6 py-3 sm:py-4 border-b-2 border-slate-800 flex items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-slate-950 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
              <Scale className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-amber-400 font-mono tracking-wider block truncate">
                  INSTANT CODAL FINDER
                </span>
                <span className="text-slate-400 text-[11px] sm:text-xs font-bold">
                  · {results.length} Provisions
                </span>
              </div>
              <h2 className="text-base sm:text-2xl font-black font-display text-white truncate">
                Philippine Labor Statute &amp; Codal Lookup
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Font Style Dropdown */}
            <div className="relative inline-flex items-center">
              <label htmlFor="statute-modal-font-select" className="sr-only">Font Style</label>
              <select
                id="statute-modal-font-select"
                value={statuteFontFamily}
                onChange={(e) => {
                  setStatuteFontFamily(e.target.value as any);
                  marioAudio.playClick();
                }}
                title="Select Font Style (Serif, Sans, Mono, Playfair)"
                className="min-h-[36px] sm:min-h-[38px] pl-2.5 pr-7 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-[11px] sm:text-xs font-bold cursor-pointer appearance-none"
              >
                <option value="serif">Serif (Court)</option>
                <option value="sans">Sans (Inter)</option>
                <option value="mono">Mono (Code)</option>
                <option value="playfair">Playfair</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 pointer-events-none text-slate-400" />
            </div>

            {/* Font scale control */}
            <button
              type="button"
              onClick={handleCycleFontSize}
              title="Toggle reading text size (Small, Base, Large)"
              className="min-h-[36px] sm:min-h-[38px] px-2 sm:px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] sm:text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <Type className="w-3 h-3 text-amber-400" />
              <span>{fontSizeScale.toUpperCase()}</span>
            </button>

            {/* Speech rate control */}
            <button
              type="button"
              onClick={handleCycleSpeechRate}
              title="Toggle Text-to-Speech narration rate"
              className="min-h-[36px] sm:min-h-[38px] px-2 sm:px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] sm:text-xs font-bold inline-flex items-center gap-1 cursor-pointer tabular-nums"
            >
              <SlidersHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{speechRate}x</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Statute Lookup"
              className="min-w-[38px] min-h-[38px] sm:min-w-[42px] sm:min-h-[42px] rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white border-2 border-slate-700 flex items-center justify-center cursor-pointer shrink-0 transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Search Input, Book Scope & Quick Article Buttons */}
        <div className="bg-slate-950/90 px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-slate-800 space-y-2 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              data-testid="statute-lookup-input"
              aria-label="Enter Labor Code Article number, Republic Act, or keyword"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              placeholder="Type Article or Law # (e.g., 87, Art. 94, 106, 297, RA 11210, overtime, SIL)..."
              className="w-full bg-slate-900 text-white placeholder-slate-400 text-xs sm:text-sm font-bold pl-10 pr-20 py-2 sm:py-2.5 rounded-xl border-2 border-slate-700 focus:outline-none focus:border-amber-400"
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
                  className={`min-h-[30px] sm:min-h-[32px] px-2.5 sm:px-3 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
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
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 shrink-0 mr-1">
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
                    setMobileTab('detail');
                    marioAudio.playClick();
                  }}
                  className={`min-h-[28px] sm:min-h-[30px] px-2 sm:px-2.5 py-0.5 rounded-lg text-[11px] sm:text-xs font-mono font-bold border shrink-0 cursor-pointer transition-colors ${
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

        {/* Mobile View Mode Segmented Tab Bar (Phone-Friendly) */}
        <div className="lg:hidden flex items-center bg-slate-900 border-b border-slate-800 p-1.5 gap-1.5 shrink-0">
          <button
            type="button"
            data-testid="statute-mobile-tab-list"
            onClick={() => {
              setMobileTab('list');
              marioAudio.playClick();
            }}
            className={`flex-1 min-h-[38px] py-1.5 px-3 rounded-xl text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'list'
                ? 'bg-amber-400 text-slate-950 border-2 border-black shadow-[0_2px_0_#000]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>Provisions ({results.length})</span>
          </button>
          <button
            type="button"
            data-testid="statute-mobile-tab-detail"
            onClick={() => {
              setMobileTab('detail');
              marioAudio.playClick();
            }}
            disabled={!activeEntry}
            className={`flex-1 min-h-[38px] py-1.5 px-3 rounded-xl text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 ${
              mobileTab === 'detail'
                ? 'bg-amber-400 text-slate-950 border-2 border-black shadow-[0_2px_0_#000]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {activeEntry ? activeEntry.codeLabel : 'Dossier View'}
            </span>
          </button>
        </div>

        {/* Split Results & Detail Pane (Adaptive Dual-Pane on Desktop, Full-Pane on Mobile) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Left Result List */}
          <div
            className={`lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-800 p-2.5 sm:p-4 space-y-2 overflow-y-auto bg-slate-950/70 h-full ${
              mobileTab === 'list' ? 'block' : 'hidden lg:block'
            }`}
          >
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
                      setMobileTab('detail');
                      marioAudio.playClick();
                    }}
                    className={`w-full text-left p-3 sm:p-3.5 rounded-2xl border-2 transition-all cursor-pointer space-y-1 ${
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
          <div
            className={`lg:col-span-8 p-3 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto h-full ${
              mobileTab === 'detail' ? 'block' : 'hidden lg:block'
            }`}
          >
            {activeEntry ? (
              <>
                {/* Mobile Return & Quick Flip Navigation Bar */}
                <div className="lg:hidden flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileTab('list');
                      marioAudio.playClick();
                    }}
                    className="min-h-[34px] px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold border border-slate-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                    <span>All Provisions ({results.length})</span>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={currentIndex <= 0}
                      onClick={handlePrevStatute}
                      aria-label="Previous Statute"
                      className="min-h-[34px] px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 font-black border border-slate-700 cursor-pointer disabled:cursor-not-allowed"
                    >
                      &larr; Prev
                    </button>
                    <span className="font-mono text-[11px] text-slate-300 font-bold tabular-nums px-1">
                      {currentIndex + 1}/{results.length}
                    </span>
                    <button
                      type="button"
                      disabled={currentIndex >= results.length - 1}
                      onClick={handleNextStatute}
                      aria-label="Next Statute"
                      className="min-h-[34px] px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 font-black border border-slate-700 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Next &rarr;
                    </button>
                  </div>
                </div>

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

                    {/* Download PDF Dossier Button */}
                    <button
                      type="button"
                      onClick={() => handleDownloadSingleStatutePdf(activeEntry)}
                      title="Download complete formatted statute dossier as official PDF"
                      className="min-h-[38px] px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>PDF Dossier</span>
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
                  citation={activeEntry.codeLabel}
                  title={activeEntry.title}
                  verbatim={activeEntry.statutoryText}
                  keyRule={activeEntry.supremeCourtDoctrines?.[0] || activeEntry.interpretationTips?.[0] || ''}
                  worldBadge={activeEntry.codeLabel}
                  initialTheme="parchment"
                  searchQuery={query}
                  onSaveToNotes={() => handleSaveStatuteToNotes(activeEntry)}
                  isSavedToNotes={savedNoteId === activeEntry.id}
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

                {/* 3. Common Traps & Practical Interpretation Guidance */}
                {activeEntry.interpretationTips.length > 0 && (
                  <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-4 sm:p-5 border-2 border-sky-400/50 shadow-[2px_2px_0_#000] space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2 text-xs font-black text-sky-300">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-sky-400" />
                        <span className="font-mono uppercase tracking-wider">
                          COMMON TRAPS &amp; PRACTICAL INTERPRETATION GUIDANCE
                        </span>
                      </div>
                      <span className="text-[10px] text-sky-400 font-mono font-bold">
                        Practical Study Tips
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
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
                <Scale className="w-12 h-12 text-slate-600" />
                <p className="text-sm font-bold">
                  Select a statute provision to view its complete codified text and Supreme Court precedents.
                </p>
                <button
                  type="button"
                  onClick={() => setMobileTab('list')}
                  className="lg:hidden px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-[0_2px_0_#000]"
                >
                  Browse Provisions ({results.length})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
