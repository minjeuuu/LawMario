import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LawTopic, ComplexityMode } from '../types/laborLaw';
import {
  cleanRuleText,
  formatModuleRuleItems,
  FormattedModuleItem,
  SubClauseItem,
} from '../utils/moduleFormatter';
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  CheckCircle2,
  ShieldCheck,
  Volume2,
  Play,
  Pause,
  Square,
  Table as TableIcon,
  LayoutGrid,
  Clock,
  Coins,
  BookOpen,
  Scale,
  AlertTriangle,
  Calculator,
  Layers,
  Flag,
  MapPin,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  ListChecks,
  Bookmark,
} from 'lucide-react';
import {
  MarioMushroomIcon,
  MarioFireFlowerIcon,
  MarioStarIcon,
  Mario1UpIcon,
  MarioCoinIcon,
  MarioQuestionBlockIcon,
} from './MarioIcons';
import { marioAudio } from '../utils/audio';
import { SHORTCUT_MAP_HIGHLIGHTS } from '../utils/engagementFeatures';
import { InteractiveStudyMatrix } from './InteractiveStudyMatrix';
import {
  ALL_GLOSSARY_KEYWORDS,
  findGlossaryTerm,
} from '../data/quickGlossaryData';
import { QuickGlossaryModal } from './QuickGlossaryModal';
import { extractClozeSegments } from '../utils/studyModes';
import { getTopicQuickCheck } from '../utils/moduleSorting';

interface TopicCardProps {
  topic: LawTopic;
  fontSize: 'normal' | 'large' | 'xlarge';
  searchQuery?: string;
  isCompleted?: boolean;
  onToggleComplete?: () => void;
  complexityMode?: ComplexityMode;
  showLegalCitations?: boolean;
  needsImprovement?: boolean;
  onToggleNeedsImprovement?: () => void;
  shortcutMapActive?: boolean;
  equippedCardFrame?: string;
  expandCollapseSignal?: { mode: 'expand' | 'collapse'; seq: number } | null;
  compactView?: boolean;
  onEarnCoins?: (amount: number) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  fontSize,
  searchQuery = '',
  isCompleted = false,
  onToggleComplete,
  complexityMode = 'beginner',
  showLegalCitations = true,
  needsImprovement = false,
  onToggleNeedsImprovement,
  shortcutMapActive = false,
  equippedCardFrame = 'frame_default',
  expandCollapseSignal = null,
  compactView = false,
  onEarnCoins,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const [isExpanded, setIsExpanded] = useState(() => !compactView);
  const [studyLens, setStudyLens] = useState<'full' | 'summary' | 'cloze' | 'checklist'>('full');
  const isSummaryMode = studyLens === 'summary';
  const [revealedClozeKeys, setRevealedClozeKeys] = useState<Record<string, boolean>>({});
  const [checkedChecklistKeys, setCheckedChecklistKeys] = useState<Record<string, boolean>>({});
  const [showVerbatim, setShowVerbatim] = useState(false);
  const [verbatimCopied, setVerbatimCopied] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showSpeedControls, setShowSpeedControls] = useState(false);
  const [viewTab, setViewTab] = useState<'all' | 'cards' | 'tables'>('all');
  const [isGlossaryModalOpen, setIsGlossaryModalOpen] = useState(false);
  const [selectedGlossaryTermId, setSelectedGlossaryTermId] = useState<string | null>(null);
  const [quickCheckChoice, setQuickCheckChoice] = useState<number | null>(null);
  const [quickCheckClaimed, setQuickCheckClaimed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = JSON.parse(localStorage.getItem('mario_claimed_quick_checks') || '[]');
      return Array.isArray(saved) && saved.includes(topic.id);
    } catch {
      return false;
    }
  });
  const quickCheck = useMemo(() => getTopicQuickCheck(topic), [topic]);
  const longPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  useEffect(() => {
    setIsExpanded(!compactView);
  }, [compactView]);

  useEffect(() => {
    if (expandCollapseSignal && expandCollapseSignal.seq > 0) {
      setIsExpanded(expandCollapseSignal.mode === 'expand');
    }
  }, [expandCollapseSignal]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const activeChunksRef = useRef<string[]>([]);
  const chunkIndexRef = useRef<number>(0);
  const isCancelledRef = useRef<boolean>(false);

  const stopAllSpeech = () => {
    isCancelledRef.current = true;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    activeChunksRef.current = [];
    chunkIndexRef.current = 0;
  };

  useEffect(() => {
    return () => {
      stopAllSpeech();
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, []);

  const bodyTextClass =
    fontSize === 'xlarge'
      ? 'topic-card-body-text text-xl leading-relaxed sm:leading-relaxed'
      : fontSize === 'large'
      ? 'topic-card-body-text text-lg leading-relaxed sm:leading-relaxed'
      : 'topic-card-body-text text-sm sm:text-base leading-relaxed sm:leading-relaxed';

  const headingTextClass =
    fontSize === 'xlarge'
      ? 'text-xl font-black'
      : fontSize === 'large'
      ? 'text-lg font-extrabold'
      : 'text-base font-black';

  const handleCopy = () => {
    const textContent =
      `${topic.title} (${topic.badge})\n\nSummary:\n${topic.summary}\n\nKey Doctrines:\n${topic.keyDoctrines
        .map((d) => `- ${cleanRuleText(d)}`)
        .join('\n')}\n\nRules:\n` +
      topic.rules
        .map((r) => {
          const itemsStr = r.items ? r.items.map((i) => cleanRuleText(i)).join('\n') : '';
          const tableStr = r.tableData
            ? [
                r.tableData.headers.join(' | '),
                ...r.tableData.rows.map((row) => row.join(' | ')),
              ].join('\n')
            : '';
          return [r.heading, itemsStr, tableStr].filter(Boolean).join('\n');
        })
        .join('\n\n');
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    marioAudio.playCoin();
    setTimeout(() => setCopied(false), 2000);
  };

  const speakChunkAtIndex = (index: number) => {
    if (isCancelledRef.current) return;
    if (index >= activeChunksRef.current.length) {
      setIsSpeaking(false);
      setIsPaused(false);
      marioAudio.playCoin();
      return;
    }

    const chunkText = activeChunksRef.current[index];
    if (!chunkText || !chunkText.trim()) {
      chunkIndexRef.current = index + 1;
      speakChunkAtIndex(index + 1);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunkText);
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.0;

    try {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const enVoice = voices.find((v) => v.lang.startsWith('en')) || voices[0];
        if (enVoice) utterance.voice = enVoice;
      }
    } catch {}

    utterance.onend = () => {
      if (!isCancelledRef.current) {
        chunkIndexRef.current = index + 1;
        speakChunkAtIndex(index + 1);
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech chunk handled:', e);
      if (!isCancelledRef.current) {
        chunkIndexRef.current = index + 1;
        speakChunkAtIndex(index + 1);
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (isSpeaking) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
        marioAudio.playJump();
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
        marioAudio.playPipe();
      }
      return;
    }

    stopAllSpeech();
    isCancelledRef.current = false;

    const summaryText =
      complexityMode === 'beginner'
        ? topic.beginnerSummary || topic.summary
        : topic.summary;

    const doctrinesText = topic.keyDoctrines?.length
      ? `Core Doctrines: ${topic.keyDoctrines.map((d) => cleanRuleText(d)).join('. ')}`
      : '';

    const rulesText = (topic.rules || [])
      .map((r) => {
        const items = r.items ? r.items.map((i) => cleanRuleText(i)).join('. ') : '';
        const subs = r.subSections
          ? r.subSections
              .map((s) => `${s.title}: ${s.items.map((si) => cleanRuleText(si)).join('. ')}`)
              .join('. ')
          : '';
        return `${r.heading}. ${r.description || ''}. ${items}. ${subs}`;
      })
      .join('. ');

    const fullText = `${topic.title}. Statutory reference: ${topic.badge}. Summary: ${summaryText}. ${doctrinesText}. Detailed Provisions: ${rulesText}.`;

    // Split into speech chunks (~160 chars) so Blink/WebKit audio never stalls
    const sentences = fullText.match(/[^.?!;:]+[.?!;:]+/g) || [fullText];
    const chunks: string[] = [];
    let current = '';

    for (const s of sentences) {
      const clean = s.trim();
      if (!clean) continue;
      if ((current + ' ' + clean).trim().length <= 160) {
        current = (current + ' ' + clean).trim();
      } else {
        if (current) chunks.push(current);
        if (clean.length > 160) {
          const words = clean.split(/\s+/);
          let sub = '';
          for (const w of words) {
            if ((sub + ' ' + w).trim().length <= 160) {
              sub = (sub + ' ' + w).trim();
            } else {
              if (sub) chunks.push(sub);
              sub = w;
            }
          }
          if (sub) current = sub;
          else current = '';
        } else {
          current = clean;
        }
      }
    }
    if (current) chunks.push(current);

    activeChunksRef.current = chunks;
    chunkIndexRef.current = 0;

    marioAudio.playPowerUp();
    setIsSpeaking(true);
    setIsPaused(false);
    speakChunkAtIndex(0);
  };

  const handleStopSpeech = () => {
    stopAllSpeech();
    marioAudio.playPipe();
  };

  const handleSpeedSelect = (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedControls(false);
    marioAudio.playJump();
    if (isSpeaking && utteranceRef.current) {
      handleStopSpeech();
    }
  };

  const highlightMatch = (text: string) => {
    if (!searchQuery.trim() || !text) return text;
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <mark key={i} className="bg-amber-300 text-red-950 font-black px-1 rounded-sm">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const handleTermTouchStart = (termId: string) => {
    isLongPressTriggeredRef.current = false;
    if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current);
    longPressTimeoutRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      setSelectedGlossaryTermId(termId);
      setIsGlossaryModalOpen(true);
      marioAudio.playPowerUp();
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        try {
          navigator.vibrate(50);
        } catch {}
      }
    }, 450);
  };

  const handleTermTouchEnd = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  const handleTermClick = (e: React.MouseEvent, termId: string) => {
    e.stopPropagation();
    if (isLongPressTriggeredRef.current) {
      isLongPressTriggeredRef.current = false;
      return;
    }
    setSelectedGlossaryTermId(termId);
    setIsGlossaryModalOpen(true);
    marioAudio.playPowerUp();
  };

  const glossaryRegex = useMemo(() => {
    if (!ALL_GLOSSARY_KEYWORDS || ALL_GLOSSARY_KEYWORDS.length === 0) return null;
    const pattern = ALL_GLOSSARY_KEYWORDS.map(({ keyword }) => {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const leading = /^\w/.test(keyword) ? '\\b' : '';
      const trailing = /\w$/.test(keyword) ? '\\b' : '';
      return `${leading}${escaped}${trailing}`;
    }).join('|');
    return new RegExp(`(${pattern})`, 'gi');
  }, []);

  const renderInteractiveText = (text: string) => {
    if (!text) return text;
    if (!glossaryRegex) return highlightMatch(text);

    const parts = text.split(glossaryRegex);
    if (parts.length <= 1) return highlightMatch(text);

    return (
      <>
        {parts.map((part, idx) => {
          if (!part) return null;
          const matchedItem = findGlossaryTerm(part);
          if (matchedItem) {
            return (
              <span
                key={idx}
                role="button"
                tabIndex={0}
                title={`Mario Quick Glossary: ${matchedItem.term} (Tap or long-press)`}
                onTouchStart={() => handleTermTouchStart(matchedItem.id)}
                onTouchEnd={handleTermTouchEnd}
                onTouchCancel={handleTermTouchEnd}
                onContextMenu={(e) => e.preventDefault()}
                onClick={(e) => handleTermClick(e, matchedItem.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedGlossaryTermId(matchedItem.id);
                    setIsGlossaryModalOpen(true);
                  }
                }}
                className="glossary-term inline-flex items-center gap-0.5 px-1 py-0.5 -my-0.5 rounded-md bg-amber-100/90 dark:bg-amber-950/60 text-slate-950 dark:text-amber-200 border-b-2 border-amber-500 font-bold cursor-pointer hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors select-none group"
              >
                <span>{highlightMatch(part)}</span>
                <span className="text-[10px] opacity-75 font-mono text-amber-700 dark:text-amber-400 font-black">?</span>
              </span>
            );
          }
          return <React.Fragment key={idx}>{highlightMatch(part)}</React.Fragment>;
        })}
      </>
    );
  };

  const renderSubClauses = (subClauses?: SubClauseItem[]) => {
    if (!subClauses || subClauses.length === 0) return null;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
        {subClauses.map((sc, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 shadow-2xs"
          >
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-md bg-slate-900 dark:bg-amber-400 text-amber-300 dark:text-slate-950 text-[10px] font-black font-mono shrink-0 mt-0.5">
              ({sc.marker})
            </span>
            <span className="leading-snug">{renderInteractiveText(sc.text)}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderFormattedItem = (item: FormattedModuleItem, idx: number) => {
    // 1. Section / Group Header (Unnumbered!)
    if (item.kind === 'group_header') {
      return (
        <div
          key={idx}
          className="pt-2 pb-1 border-b-2 border-amber-400/70 flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 border border-black shrink-0" />
          <span className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-900 dark:text-amber-200 font-display">
            {renderInteractiveText(item.body)}
          </span>
        </div>
      );
    }

    // 2. Definition Card (NEVER numbered!)
    if (item.kind === 'definition') {
      return (
        <div
          key={idx}
          className="p-3.5 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/60 border-2 border-indigo-300 dark:border-indigo-700 space-y-1.5"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider font-mario leading-none">
              <BookOpen className="w-3 h-3 shrink-0" />
              <span>{item.badgeLabel || 'DEFINITION'}</span>
            </span>
            {item.title && (
              <span className="font-black text-indigo-950 dark:text-indigo-200 text-sm sm:text-base font-display">
                {renderInteractiveText(item.title)}
              </span>
            )}
          </div>
          {item.body && (
            <p className={`${bodyTextClass} text-slate-900 dark:text-slate-100 font-semibold`}>
              {renderInteractiveText(item.body)}
            </p>
          )}
          {renderSubClauses(item.subClauses)}
        </div>
      );
    }

    // 3. Semantic Callout / Provision Row (NEVER numbered!)
    if (item.kind === 'callout') {
      const toneStyles =
        item.tone === 'exception'
          ? {
              wrap: 'bg-rose-50/80 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700',
              badge: 'bg-rose-700 text-white',
              title: 'text-rose-950 dark:text-rose-200',
              icon: <AlertTriangle className="w-3 h-3 shrink-0" />,
            }
          : item.tone === 'formula'
          ? {
              wrap: 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700',
              badge: 'bg-emerald-700 text-white',
              title: 'text-emerald-950 dark:text-emerald-200',
              icon: <Calculator className="w-3 h-3 shrink-0" />,
            }
          : item.tone === 'rule' || item.tone === 'doctrine'
          ? {
              wrap: 'bg-amber-50/80 dark:bg-amber-950/45 border-amber-300 dark:border-amber-700',
              badge: 'bg-slate-900 text-amber-300',
              title: 'text-slate-950 dark:text-amber-200',
              icon: <Scale className="w-3 h-3 shrink-0" />,
            }
          : {
              wrap: 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700',
              badge: 'bg-slate-700 text-white',
              title: 'text-slate-950 dark:text-slate-100',
              icon: null,
            };

      return (
        <div
          key={idx}
          className={`p-3 rounded-xl border-2 space-y-1.5 ${toneStyles.wrap}`}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {item.tone !== 'concept' && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider font-mario leading-none ${toneStyles.badge}`}
              >
                {toneStyles.icon}
                <span>{item.badgeLabel}</span>
              </span>
            )}
            {item.title && (
              <span className={`font-black text-sm sm:text-base font-display ${toneStyles.title}`}>
                {renderInteractiveText(item.title)}
              </span>
            )}
          </div>
          {item.body && (
            <p className={`${bodyTextClass} text-slate-800 dark:text-slate-100 font-semibold`}>
              {renderInteractiveText(item.body)}
            </p>
          )}
          {renderSubClauses(item.subClauses)}
        </div>
      );
    }

    // 4. Genuinely Numbered List Item (`1.`, `2.`, etc.)
    if (item.kind === 'numbered') {
      return (
        <div
          key={idx}
          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 shadow-2xs"
        >
          <div className="flex items-start gap-2.5">
            <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-lg bg-amber-400 text-slate-950 border border-black text-xs font-black font-mario shrink-0 mt-0.5 shadow-[0_1px_0_#000]">
              {String(item.number ?? 1).padStart(2, '0')}
            </span>
            <div className={`${bodyTextClass} text-slate-900 dark:text-slate-100 font-semibold flex-1`}>
              {item.title && (
                <span className="font-black text-slate-950 dark:text-amber-200 mr-1.5">
                  {renderInteractiveText(item.title)}:
                </span>
              )}
              <span>{renderInteractiveText(item.body)}</span>
            </div>
          </div>
          {item.subClauses && <div className="pl-8">{renderSubClauses(item.subClauses)}</div>}
        </div>
      );
    }

    // 5. Unnumbered Bullet / Principle Item
    return (
      <div
        key={idx}
        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-2xs"
      >
        <div className="flex items-start gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-black shrink-0 mt-2" />
          <div className={`${bodyTextClass} text-slate-900 dark:text-slate-100 font-semibold flex-1`}>
            {item.title && (
              <span className="font-black text-slate-950 dark:text-amber-200 mr-1.5">
                {renderInteractiveText(item.title)}:
              </span>
            )}
            <span>{renderInteractiveText(item.body)}</span>
          </div>
        </div>
        {item.subClauses && <div className="pl-5">{renderSubClauses(item.subClauses)}</div>}
      </div>
    );
  };

  const hasCustomDiagramOrTable = [
    'm1-coverage',
    'm1-hours-worked',
    'm1-fwa-cww-meals-ot',
    'm2-holiday-pay',
    'm2-13th-month',
    'm3-wage-principles',
    'm3-payment-contracting-distortion',
    'm4-minors-kasambahay-homework',
    'm5-harassment-safe-spaces',
    'm6-service-incentive-leave',
    'm6-maternity-leave',
    'm6-paternity-leave',
    'm6-solo-parents-leave',
    'm6-gynecological-leave',
    'm6-vawc-leave',
    'm6-statutory-leave-matrix-special',
  ].includes(topic.id);

  const isWorld6LeaveTopic = topic.id.startsWith('m6-');
  const shortcutHighlightNote = shortcutMapActive ? SHORTCUT_MAP_HIGHLIGHTS[topic.id] : undefined;

  const estimatedReadingMinutes = useMemo(() => {
    let wordCount = (topic.title + ' ' + (topic.summary || '')).split(/\s+/).filter(Boolean).length;
    topic.keyDoctrines?.forEach((d) => (wordCount += d.split(/\s+/).filter(Boolean).length));
    topic.rules?.forEach((r) => {
      wordCount += (r.heading + ' ' + (r.description || '')).split(/\s+/).filter(Boolean).length;
      r.items?.forEach((i) => (wordCount += i.split(/\s+/).filter(Boolean).length));
      if (r.tableData) {
        wordCount += r.tableData.headers.join(' ').split(/\s+/).filter(Boolean).length;
        r.tableData.rows.forEach((row) => (wordCount += row.join(' ').split(/\s+/).filter(Boolean).length));
      }
    });
    topic.barTips?.forEach((t) => (wordCount += t.split(/\s+/).filter(Boolean).length));
    return Math.max(1, Math.ceil(wordCount / 175));
  }, [topic]);

  const frameClass =
    equippedCardFrame === 'frame_royal_gold'
      ? 'ring-4 ring-amber-400 border-amber-600'
      : equippedCardFrame === 'frame_emerald_pipe'
      ? 'ring-4 ring-emerald-400 border-emerald-700'
      : equippedCardFrame === 'frame_supreme_crimson'
      ? 'ring-4 ring-rose-500 border-rose-700'
      : equippedCardFrame === 'frame_retro_brick'
      ? 'ring-4 ring-orange-400 border-orange-700'
      : equippedCardFrame === 'frame_starlight_prism'
      ? 'ring-4 ring-indigo-400 border-indigo-700'
      : '';

  const showDiagrams = viewTab === 'all' || viewTab === 'tables';
  const showRuleCards = viewTab === 'all' || viewTab === 'cards';

  return (
    <article
      id={`topic-card-${topic.id}`}
      className={`mario-card rounded-3xl transition-all duration-200 overflow-hidden bg-white dark:bg-slate-900 ${
        isCompleted
          ? 'border-emerald-600 ring-2 ring-emerald-400'
          : frameClass || 'border-slate-900 dark:border-slate-700'
      }`}
    >
      {/* Perfectly Aligned Header Banner */}
      <header className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-4 border-slate-950 max-w-full min-w-0">
        <div className="flex items-center gap-3.5 min-w-0 max-w-full">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 border-2 border-black flex items-center justify-center flex-shrink-0 shadow-[0_2px_0_#000]">
            <MarioQuestionBlockIcon className="w-6 h-6 text-slate-950" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap text-xs max-w-full">
              {showLegalCitations ? (
                <span className="font-black uppercase font-mario text-amber-300 tracking-wider">
                  {topic.badge}
                </span>
              ) : (
                <span className="font-black uppercase font-mario text-amber-200 tracking-wider">
                  STATUTORY STANDARD
                </span>
              )}

              {/* Dynamic Statutory Difficulty Tag: Foundation / Intermediate / Bar Master */}
              <span
                data-testid="topic-difficulty-tag"
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-black border shadow-xs leading-none ${
                  topic.difficulty === 'Bar Master'
                    ? 'bg-purple-950/90 text-purple-200 border-purple-400'
                    : topic.difficulty === 'Foundation'
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500'
                    : 'bg-amber-950/90 text-amber-300 border-amber-500'
                }`}
                title={`Statutory Complexity: ${topic.difficulty || 'Intermediate'}`}
              >
                {topic.difficulty === 'Bar Master' ? (
                  <MarioStarIcon className="w-3 h-3 text-amber-300 shrink-0" />
                ) : topic.difficulty === 'Foundation' ? (
                  <MarioMushroomIcon className="w-3 h-3 text-emerald-400 shrink-0" />
                ) : (
                  <MarioFireFlowerIcon className="w-3 h-3 text-amber-400 shrink-0" />
                )}
                <span>{topic.difficulty || 'Intermediate'}</span>
              </span>

              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">
                {complexityMode === 'beginner' ? 'Mushroom Kingdom Mode' : 'Bowser Castle Codified'}
              </span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-sky-300 text-[10px] font-mono font-bold border border-slate-700 shadow-xs tabular-nums">
                <Clock className="w-3 h-3 text-sky-400 shrink-0" />
                <span>{estimatedReadingMinutes} min read</span>
              </span>
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white font-display mt-1 leading-tight break-words">
              {highlightMatch(topic.title)}
            </h3>
          </div>
        </div>

        {/* Touch-friendly >=44px Action Buttons Toolbar */}
        <div className="flex items-center gap-2 flex-wrap min-w-0 max-w-full">
          <div className="relative min-h-[44px] inline-flex items-center bg-slate-800 rounded-xl border-2 border-slate-700 px-1">
            <button
              type="button"
              onClick={handleToggleSpeech}
              title={isSpeaking ? (isPaused ? 'Resume reading' : 'Pause reading') : 'Read aloud'}
              className={`min-h-[38px] inline-flex items-center justify-center gap-1.5 px-3 rounded-lg text-xs font-black font-mario cursor-pointer transition-colors leading-none ${
                isSpeaking
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-200 hover:text-white hover:bg-slate-700'
              }`}
            >
              {isSpeaking ? (
                isPaused ? (
                  <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                ) : (
                  <Pause className="w-3.5 h-3.5 fill-current shrink-0" />
                )
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <span>AUDIO</span>
            </button>

            {isSpeaking && (
              <button
                type="button"
                onClick={handleStopSpeech}
                title="Stop reading"
                aria-label="Stop reading"
                className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-slate-700 rounded cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowSpeedControls(!showSpeedControls)}
              title="Adjust playback speed"
              className="min-h-[38px] inline-flex items-center justify-center px-2.5 text-[11px] font-mono font-bold text-amber-300 hover:bg-slate-700 rounded cursor-pointer border-l border-slate-700 tabular-nums"
            >
              {playbackSpeed}x
            </button>

            {showSpeedControls && (
              <div className="absolute right-0 top-full mt-1 z-30 bg-slate-900 border-2 border-slate-700 rounded-xl p-1.5 shadow-xl flex gap-1">
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => handleSpeedSelect(spd)}
                    className={`min-h-[40px] px-2.5 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer tabular-nums ${
                      playbackSpeed === spd
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {onToggleBookmark && (
            <button
              type="button"
              data-testid={`bookmark-topic-${topic.id}`}
              onClick={onToggleBookmark}
              title={isBookmarked ? 'Remove topic bookmark' : 'Pin / Bookmark topic for quick access'}
              className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 rounded-xl font-black text-xs border-2 cursor-pointer transition-all whitespace-nowrap leading-none ${
                isBookmarked
                  ? 'bg-sky-400 text-slate-950 border-black shadow-[0_2px_0_#000]'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 shrink-0 ${isBookmarked ? 'fill-current' : ''}`} />
              <span>{isBookmarked ? 'Bookmarked' : 'Pin Topic'}</span>
            </button>
          )}

          {onToggleNeedsImprovement && (
            <button
              type="button"
              data-testid={`toggle-need-improvement-${topic.id}`}
              onClick={onToggleNeedsImprovement}
              title="Flag topic as Need Improvement for 5-Minute Quick Study Mode"
              className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 rounded-xl font-black text-xs border-2 cursor-pointer transition-all whitespace-nowrap leading-none ${
                needsImprovement
                  ? 'bg-rose-500 text-white border-black shadow-[0_2px_0_#000]'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Flag className="w-3.5 h-3.5 shrink-0" />
              <span>{needsImprovement ? 'Need Improvement' : 'Flag Review'}</span>
            </button>
          )}

          {onToggleComplete && (
            <button
              type="button"
              onClick={onToggleComplete}
              title="Mark topic as studied / mastered"
              className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3.5 rounded-xl font-black text-xs border-2 cursor-pointer transition-all whitespace-nowrap leading-none ${
                isCompleted
                  ? 'bg-emerald-500 text-slate-950 border-black shadow-[0_2px_0_#000]'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{isCompleted ? 'Mastered' : 'Mark Studied'}</span>
            </button>
          )}

          <button
            type="button"
            data-testid={`glossary-btn-${topic.id}`}
            onClick={() => {
              setSelectedGlossaryTermId(null);
              setIsGlossaryModalOpen(true);
              marioAudio.playPowerUp();
            }}
            title="Open Mario Quick Glossary for complex legal terms"
            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-black text-xs font-black font-mario cursor-pointer whitespace-nowrap leading-none shadow-[0_2px_0_#000] transition-transform active:translate-y-0.5"
          >
            <MarioQuestionBlockIcon className="w-4 h-4 shrink-0 text-slate-950" />
            <span>GLOSSARY</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            title="Copy law provisions"
            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border-2 border-slate-700 text-xs font-bold cursor-pointer whitespace-nowrap leading-none"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Copy className="w-4 h-4 shrink-0" />
            )}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isExpanded) setIsExpanded(true);
              setStudyLens(studyLens === 'summary' ? 'full' : 'summary');
            }}
            className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3.5 rounded-xl text-xs font-black border-2 border-black cursor-pointer whitespace-nowrap leading-none transition-all ${
              isSummaryMode
                ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                : 'bg-white hover:bg-amber-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{isSummaryMode ? 'Full Rules' : 'Summary Mode'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse topic' : 'Expand topic'}
            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] cursor-pointer whitespace-nowrap leading-none"
          >
            <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 stroke-[3] shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 stroke-[3] shrink-0" />
            )}
          </button>
        </div>
      </header>

      {/* Card Body */}
      {isExpanded && (
        <div className="p-4 sm:p-6 md:p-8 space-y-6 bg-[#fcfbf7] dark:bg-slate-900/95">
          {/* Interactive Study Lens Switcher (4 Ways to Study Any Module) */}
          <div
            data-testid={`topic-study-lens-bar-${topic.id}`}
            className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 text-white p-2.5 rounded-2xl border-2 border-slate-950"
          >
            <span className="text-xs font-bold text-amber-300 px-1.5">
              Study Lens:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(
                [
                  { id: 'full' as const, label: 'Full Guide', icon: <BookOpen className="w-3.5 h-3.5 shrink-0" /> },
                  { id: 'summary' as const, label: 'Exec Summary', icon: <Sparkles className="w-3.5 h-3.5 shrink-0" /> },
                  { id: 'cloze' as const, label: 'Cloze Recall', icon: <Eye className="w-3.5 h-3.5 shrink-0" /> },
                  { id: 'checklist' as const, label: 'Study Checklist', icon: <ListChecks className="w-3.5 h-3.5 shrink-0" /> },
                ]
              ).map((lens) => (
                <button
                  key={lens.id}
                  type="button"
                  data-testid={`study-lens-${lens.id}-${topic.id}`}
                  onClick={() => {
                    setStudyLens(lens.id);
                    marioAudio.playClick();
                  }}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-black inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    studyLens === lens.id
                      ? 'bg-amber-400 text-slate-950 border border-black'
                      : 'bg-slate-800 text-slate-200 hover:text-white border border-slate-700'
                  }`}
                >
                  {lens.icon}
                  <span>{lens.label}</span>
                </button>
              ))}
            </div>
          </div>

          {studyLens === 'summary' ? (
            <div className="p-4 sm:p-6 bg-amber-50 dark:bg-slate-800/90 border-2 border-amber-400 rounded-2xl space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-amber-300 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span className="font-black text-sm uppercase font-mario text-amber-900 dark:text-amber-300">
                    MARIO EXECUTIVE SUMMARY · QUICK STUDY REVIEW
                  </span>
                </div>
                <span className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">
                  {topic.badge}
                </span>
              </div>

              <div className="text-slate-900 dark:text-white space-y-3">
                <p className="text-sm sm:text-base font-extrabold leading-relaxed">
                  {topic.beginnerSummary || topic.summary || topic.rules?.[0]?.description || topic.rules?.[0]?.heading || 'Statutory standard under the Philippine Labor Code.'}
                </p>

                {(topic.keyTips || topic.barTips) && (
                  <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-amber-300 dark:border-slate-700 space-y-2">
                    <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 font-mario block">
                      MUST-REMEMBER CHECKPOINTS:
                    </span>
                    <ul className="text-xs font-bold text-slate-800 dark:text-slate-200 space-y-1 list-disc list-inside">
                      {(topic.keyTips || topic.barTips || []).slice(0, 3).map((tip, idx) => (
                        <li key={idx} className="leading-snug">{cleanRuleText(tip)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Last-minute flash review</span>
                <button
                  type="button"
                  onClick={() => setStudyLens('full')}
                  className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  <span>View full codified provisions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : studyLens === 'cloze' ? (
            <div
              data-testid={`cloze-recall-panel-${topic.id}`}
              className="p-4 sm:p-6 bg-sky-50/80 dark:bg-slate-800/90 border-2 border-sky-400 dark:border-sky-600 rounded-2xl space-y-4"
            >
              {(() => {
                const clozeLines = [
                  topic.summary,
                  ...(topic.keyDoctrines || []).map((d) => cleanRuleText(d)),
                  ...(topic.rules || [])
                    .flatMap((r) => (r.items || []).slice(0, 3).map((it) => cleanRuleText(it)))
                    .slice(0, 6),
                ].filter(Boolean);
                const segmentedRows = clozeLines.map((line, rIdx) =>
                  extractClozeSegments(line, `${topic.id}-r${rIdx}`)
                );
                const allBlankKeys = segmentedRows
                  .flatMap((segs) => segs.filter((s) => s.type === 'blank' && s.blankKey).map((s) => s.blankKey!));
                const revealedCount = allBlankKeys.filter((k) => revealedClozeKeys[k]).length;

                return (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-200 dark:border-slate-700 pb-3">
                      <div>
                        <span className="text-xs font-extrabold text-sky-800 dark:text-sky-300 block">
                          Active Recall · Fill-in-the-Blank Statutory Drill
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                          Mentally recite each hidden rate, deadline, or Article before tapping to reveal ({revealedCount}/{allBlankKeys.length} revealed).
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const next: Record<string, boolean> = {};
                            allBlankKeys.forEach((k) => {
                              next[k] = true;
                            });
                            setRevealedClozeKeys(next);
                            marioAudio.playCoin();
                          }}
                          className="min-h-[38px] px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs border border-black inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Eye className="w-3.5 h-3.5 shrink-0" />
                          <span>Reveal All</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRevealedClozeKeys({});
                            marioAudio.playClick();
                          }}
                          className="min-h-[38px] px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs border border-slate-700 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <EyeOff className="w-3.5 h-3.5 shrink-0" />
                          <span>Hide All</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {segmentedRows.map((segs, rowIdx) => (
                        <div
                          key={rowIdx}
                          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-slate-100 leading-relaxed"
                        >
                          {segs.map((seg, sIdx) => {
                            if (seg.type === 'blank' && seg.blankKey) {
                              const isShown = Boolean(revealedClozeKeys[seg.blankKey]);
                              return (
                                <button
                                  key={seg.blankKey}
                                  type="button"
                                  onClick={() => {
                                    setRevealedClozeKeys((prev) => ({
                                      ...prev,
                                      [seg.blankKey!]: !prev[seg.blankKey!],
                                    }));
                                    marioAudio.playJump();
                                  }}
                                  className={`mx-1 px-2.5 py-0.5 rounded-lg font-black text-xs border transition-all cursor-pointer inline-flex items-center gap-1 ${
                                    isShown
                                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-emerald-500'
                                      : 'bg-amber-300 text-slate-950 border-slate-950 hover:bg-amber-200'
                                  }`}
                                >
                                  {isShown ? seg.value : '[ Tap to Reveal ]'}
                                </button>
                              );
                            }
                            return <span key={sIdx}>{seg.value}</span>;
                          })}
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          ) : studyLens === 'checklist' ? (
            <div
              data-testid={`bar-checklist-panel-${topic.id}`}
              className="p-4 sm:p-6 bg-emerald-50/70 dark:bg-slate-800/90 border-2 border-emerald-500 rounded-2xl space-y-4"
            >
              {(() => {
                const checklistRows = [
                  ...(topic.keyDoctrines || []).map((d, i) => ({
                    key: `doc-${i}`,
                    category: 'Core Doctrine',
                    text: cleanRuleText(d),
                  })),
                  ...((topic.barTips || topic.keyTips || []) as string[]).map((t, i) => ({
                    key: `tip-${i}`,
                    category: 'Bar Exam Tip',
                    text: cleanRuleText(t),
                  })),
                ];
                const doneCount = checklistRows.filter((r) => checkedChecklistKeys[r.key]).length;
                return (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 dark:border-slate-700 pb-3">
                      <div>
                        <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300 block">
                          Self-Recitation Bar Exam Checklist
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold tabular-nums">
                          Recite each doctrine &amp; Bar trap aloud, then check it off: {doneCount} / {checklistRows.length} verified.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const allChecked = doneCount === checklistRows.length;
                          if (allChecked) {
                            setCheckedChecklistKeys({});
                          } else {
                            const next: Record<string, boolean> = {};
                            checklistRows.forEach((r) => {
                              next[r.key] = true;
                            });
                            setCheckedChecklistKeys(next);
                          }
                          marioAudio.playCoin();
                        }}
                        className="min-h-[38px] px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs border border-black cursor-pointer whitespace-nowrap"
                      >
                        {doneCount === checklistRows.length ? 'Reset Checklist' : 'Check All Recited'}
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {checklistRows.map((row) => {
                        const checked = Boolean(checkedChecklistKeys[row.key]);
                        return (
                          <button
                            key={row.key}
                            type="button"
                            onClick={() => {
                              setCheckedChecklistKeys((prev) => ({
                                ...prev,
                                [row.key]: !prev[row.key],
                              }));
                              marioAudio.playJump();
                            }}
                            className={`w-full min-h-[48px] text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                              checked
                                ? 'bg-emerald-100/80 dark:bg-emerald-950/60 border-emerald-500 text-slate-900 dark:text-emerald-100'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                                checked
                                  ? 'bg-emerald-600 border-emerald-700 text-white'
                                  : 'bg-white dark:bg-slate-800 border-slate-400'
                              }`}
                            >
                              {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </span>
                            <div className="space-y-0.5">
                              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block">
                                {row.category}
                              </span>
                              <span className={`text-sm font-bold leading-snug block ${checked ? 'line-through opacity-80' : ''}`}>
                                {row.text}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <>
          {shortcutHighlightNote && (
            <div className="bg-amber-100 border-2 border-amber-500 rounded-2xl p-3.5 sm:p-4 flex items-start gap-2.5 text-slate-950">
              <MapPin className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <span className="font-black uppercase font-mario text-[10px] text-red-700 block">
                  {shortcutHighlightNote.priorityLabel} · TOAD&apos;S BAR SHORTCUT MAP
                </span>
                <span className="font-bold">{shortcutHighlightNote.barShortcutNote}</span>
              </div>
            </div>
          )}
          {/* Summary Callout */}
          {complexityMode === 'beginner' ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border-3 border-emerald-500 dark:border-emerald-600 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <MarioMushroomIcon className="w-5 h-5 flex-shrink-0" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300 font-mario">
                  MUSHROOM KINGDOM • PRACTICAL SUMMARY
                </span>
              </div>
              <p className={`${bodyTextClass} text-emerald-950 dark:text-emerald-50 font-bold`}>
                {renderInteractiveText(topic.beginnerSummary || topic.summary)}
              </p>
              <div className="pt-1 flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>Definitions, rules, exceptions, and statutory enumerations are cleanly separated below.</span>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50/90 dark:bg-amber-950/50 border-3 border-amber-400/90 dark:border-amber-600 rounded-2xl p-4 sm:p-5 shadow-sm flex items-start gap-3">
              <MarioStarIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase text-amber-800 dark:text-amber-300 font-mario block">
                  BOWSER CASTLE • CODIFIED STATUTORY SUMMARY
                </span>
                <p className={`${bodyTextClass} text-slate-900 dark:text-slate-100 font-bold`}>
                  {renderInteractiveText(topic.summary)}
                </p>
              </div>
            </div>
          )}

          {/* Core Labor Doctrines Highlight Strip */}
          {topic.keyDoctrines && topic.keyDoctrines.length > 0 && (
            <section className="bg-slate-100 dark:bg-slate-800/85 border-3 border-slate-900 dark:border-slate-700 rounded-2xl p-4 sm:p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-slate-950 dark:text-amber-300 font-black text-base sm:text-lg">
                <Mario1UpIcon className="w-5 h-5 flex-shrink-0" />
                <h4 className="font-display">CORE LABOR DOCTRINES &amp; STATUTORY PRECEPTS</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {topic.keyDoctrines.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xs h-full"
                  >
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-black mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                    <span className={`${bodyTextClass} text-slate-900 dark:text-slate-100 font-bold`}>
                      {renderInteractiveText(cleanRuleText(doc))}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Verbatim Statutory Provision Unabridged Codification */}
          {topic.verbatimProvision && (
            <div
              data-testid={`verbatim-provision-section-${topic.id}`}
              className="bg-slate-950 border-3 border-amber-400 rounded-2xl p-4 sm:p-5 text-white space-y-3 shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
                      EXACT VERBATIM STATUTORY PROVISION
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-slate-100 font-display">
                      {topic.badge} — Complete Unabridged Text
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (topic.verbatimProvision) {
                        navigator.clipboard.writeText(topic.verbatimProvision);
                        setVerbatimCopied(true);
                        marioAudio.playCoin();
                        setTimeout(() => setVerbatimCopied(false), 2000);
                      }
                    }}
                    className="min-h-[36px] px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-600 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {verbatimCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copied Provision!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Verbatim</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowVerbatim(!showVerbatim)}
                    className="min-h-[36px] px-3.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black border border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{showVerbatim ? 'Hide Full Text' : 'Read Verbatim Provision'}</span>
                    {showVerbatim ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {showVerbatim && (
                <div className="bg-slate-900 border border-amber-400/50 rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm text-slate-100 font-mono leading-relaxed whitespace-pre-wrap select-text allow-text-select animate-in fade-in duration-150">
                  {topic.verbatimProvision}
                </div>
              )}
            </div>
          )}

          {/* View Mode Filter Bar when Diagrams/Tables exist */}
          {hasCustomDiagramOrTable && (
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-2xl border-2 border-black">
              <span className="text-xs font-black uppercase text-amber-300 font-mario">
                MODULE LAYOUT FILTER:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setViewTab('all')}
                  className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3.5 rounded-xl text-xs font-black cursor-pointer transition-colors whitespace-nowrap ${
                    viewTab === 'all' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 shrink-0" />
                  <span>Complete View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewTab('cards')}
                  className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3.5 rounded-xl text-xs font-black cursor-pointer transition-colors whitespace-nowrap ${
                    viewTab === 'cards' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                  <span>Provisions Only</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewTab('tables')}
                  className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3.5 rounded-xl text-xs font-black cursor-pointer transition-colors whitespace-nowrap ${
                    viewTab === 'tables' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>Diagrams &amp; Matrices</span>
                </button>
              </div>
            </div>
          )}

          {/* Topic-Specific Visual Diagrams & Interactive Comparative Matrices */}
          {showDiagrams && (
            <>
              {(topic.id === 'm1-coverage' || topic.id === 'm1-hours-worked') && (
                <div className="bg-amber-50 dark:bg-slate-800/90 border-3 border-amber-500 dark:border-amber-600 rounded-2xl p-4 sm:p-6 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-amber-950 dark:text-amber-300 font-black text-sm sm:text-base font-display">
                      <MarioStarIcon className="w-5 h-5 shrink-0" />
                      <span>DIAGRAM: THE FOUR-FOLD TEST OF EMPLOYER-EMPLOYEE RELATIONSHIP</span>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-amber-400 text-slate-950 rounded-md border border-black font-mario leading-none">
                      Supreme Court Doctrine
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
                    {[
                      { num: '01', title: 'Selection & Hiring', desc: 'Power to hire and select the specific individual' },
                      { num: '02', title: 'Payment of Wages', desc: 'Compensation paid directly as wages for labor' },
                      { num: '03', title: 'Power of Dismissal', desc: 'Authority to discipline, suspend, or terminate' },
                      {
                        num: '04',
                        title: 'Power of Control',
                        desc: 'Control over NOT ONLY the result, but MEANS and METHODS (Decisive!)',
                        highlight: true,
                      },
                    ].map((step) => (
                      <div
                        key={step.num}
                        className={`p-3.5 rounded-xl border-2 flex flex-col justify-between h-full ${
                          step.highlight
                            ? 'bg-amber-400 border-black text-slate-950 shadow-[0_2px_0_#000]'
                            : 'bg-white dark:bg-slate-900 border-amber-300 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-black font-mario block mb-1">ELEMENT {step.num}</span>
                          <h6 className="font-black text-sm font-display">{step.title}</h6>
                        </div>
                        <p className="text-xs font-semibold mt-1.5 leading-snug">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {topic.id === 'm1-fwa-cww-meals-ot' && (
                <div className="bg-indigo-50 dark:bg-indigo-950/50 border-3 border-indigo-500 dark:border-indigo-700 rounded-2xl p-4 sm:p-6 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200 font-black text-sm sm:text-base font-display">
                    <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-300 shrink-0" />
                    <span>TIMELINE DIAGRAM: STATUTORY NIGHT SHIFT WINDOW (ART. 86)</span>
                  </div>
                  <div className="p-3 sm:p-4 bg-slate-900 rounded-xl text-white space-y-2.5">
                    <div className="flex items-center justify-between gap-1 text-[10px] sm:text-xs font-mono font-bold text-slate-300">
                      <span>6PM</span>
                      <span className="text-amber-400 font-mario text-[8px] sm:text-[10px]">
                        <span className="sm:hidden">10PM</span>
                        <span className="hidden sm:inline">10:00 PM (START)</span>
                      </span>
                      <span className="text-amber-400 font-mario text-[8px] sm:text-[10px]">
                        <span className="sm:hidden">6AM</span>
                        <span className="hidden sm:inline">6:00 AM (END)</span>
                      </span>
                      <span>12NN</span>
                    </div>
                    <div className="relative h-7 bg-slate-800 rounded-lg overflow-hidden flex">
                      <div className="w-1/4 bg-slate-700/60 flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-slate-300">
                        Day
                      </div>
                      <div className="w-2/4 bg-indigo-600 flex items-center justify-center text-[9px] sm:text-xs font-black text-amber-300 font-mario tracking-wider border-x-2 border-amber-400 text-center px-1">
                        <span className="sm:hidden">+10% NSD</span>
                        <span className="hidden sm:inline">+10% NIGHT DIFFERENTIAL</span>
                      </div>
                      <div className="w-1/4 bg-slate-700/60 flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-slate-300">
                        Day
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-slate-300 text-center">
                      Regular hourly rate × 110% for every hour worked between 10:00 PM and 6:00 AM (exempt: retail/service &le; 5 workers).
                    </p>
                  </div>
                </div>
              )}

              {topic.id === 'm2-holiday-pay' && (
                <InteractiveStudyMatrix
                  testId="matrix-m2-holiday-pay"
                  title="Holiday Pay & Rest Day Statutory Multipliers"
                  subtitle="Interactive comparison of unworked, worked, rest-day, and overtime rates"
                  badge="Labor Code Art. 93–94"
                  accentColor="amber"
                  searchQuery={searchQuery}
                  headers={[
                    'Holiday Category',
                    'Unworked',
                    'Worked (First 8h)',
                    'Worked on Rest Day',
                    'OT Multiplier',
                  ]}
                  rows={[
                    [
                      'Regular Holiday (12 Days)',
                      '100% daily wage',
                      '200% daily wage',
                      '260% daily wage',
                      '+30% of day’s hourly rate',
                    ],
                    [
                      'Special Non-Working Day',
                      '0% (No work, no pay)',
                      '130% daily wage',
                      '150% daily wage',
                      '+30% of day’s hourly rate',
                    ],
                    [
                      'Double Regular Holiday',
                      '200% daily wage',
                      '300% daily wage',
                      '390% daily wage',
                      '+30% of day’s hourly rate',
                    ],
                  ]}
                />
              )}

              {topic.id === 'm2-13th-month' && (
                <div className="bg-amber-50 dark:bg-slate-800/90 border-3 border-amber-500 dark:border-amber-600 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-amber-950 dark:text-amber-300 font-black text-sm sm:text-base font-display">
                      <Coins className="w-5 h-5 text-amber-600 dark:text-amber-300 shrink-0" />
                      <span>VISUAL FORMULA: STATUTORY 13TH-MONTH PAY (P.D. 851)</span>
                    </div>
                    <span className="text-xs font-mono font-black bg-red-600 text-white px-2.5 py-1 rounded-md border border-black leading-none">
                      ON OR BEFORE DEC 24
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border-2 border-slate-900 dark:border-slate-700 shadow-[0_2px_0_#000] text-center space-y-1">
                    <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Statutory Computation Formula
                    </span>
                    <div className="text-base sm:text-xl font-black text-slate-950 dark:text-amber-200 font-display">
                      13th Month Pay = Total Basic Salary Earned During the Calendar Year &divide; 12
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-400 dark:border-emerald-700 space-y-1.5">
                      <span className="font-black text-emerald-900 dark:text-emerald-300 font-mario text-[10px] block">
                        INCLUDED IN BASIC SALARY:
                      </span>
                      <ul className="list-disc pl-4 space-y-1 text-emerald-950 dark:text-emerald-100 font-semibold">
                        <li>Basic daily/monthly wage actually earned</li>
                        <li>COLA only when formally integrated into basic wage</li>
                        <li>Paid sick and vacation leaves actually taken</li>
                      </ul>
                    </div>
                    <div className="p-3.5 rounded-xl bg-red-50 dark:bg-rose-950/60 border-2 border-red-400 dark:border-rose-700 space-y-1.5">
                      <span className="font-black text-red-900 dark:text-rose-300 font-mario text-[10px] block">
                        STRICTLY EXCLUDED:
                      </span>
                      <ul className="list-disc pl-4 space-y-1 text-red-950 dark:text-rose-100 font-semibold">
                        <li>Overtime pay &amp; Night shift differentials</li>
                        <li>Premium pay for rest days and holidays</li>
                        <li>Unused SIL/VL/SL cash conversion equivalents</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {topic.id === 'm3-wage-principles' && (
                <InteractiveStudyMatrix
                  testId="matrix-m3-facilities-supplements"
                  title="Facilities vs. Supplements Distinction Matrix"
                  subtitle="Purpose test & three-requisite deductibility rule"
                  badge="Art. 97(f) · Mabeza Doctrine"
                  accentColor="emerald"
                  searchQuery={searchQuery}
                  headers={['Criterion', 'Facilities (Deductible)', 'Supplements (Non-Deductible)']}
                  rows={[
                    [
                      'Purpose / Benefit',
                      'Necessary for worker & family subsistence (meals, housing)',
                      'Extra privilege or for employer’s business convenience/tools',
                    ],
                    [
                      'Part of Basic Wage?',
                      'Yes — fair value forms part of basic wage',
                      'No — independent of basic wage',
                    ],
                    [
                      'Deductibility Rule',
                      'Allowed ONLY if customary + voluntary written consent + fair value',
                      'Never deductible from employee wages',
                    ],
                  ]}
                />
              )}

              {topic.id === 'm3-payment-contracting-distortion' && (
                <InteractiveStudyMatrix
                  testId="matrix-m3-contracting"
                  title="Legitimate Job Contracting vs. Prohibited Labor-Only Contracting"
                  subtitle="Capitalization, control test, and employer liability comparison"
                  badge="Art. 106–109 · DOLE D.O. 174-17"
                  accentColor="indigo"
                  searchQuery={searchQuery}
                  headers={[
                    'Criteria',
                    'Legitimate Contractor (Allowed)',
                    'Labor-Only Contractor (Prohibited)',
                  ]}
                  rows={[
                    [
                      'Substantial Capital',
                      'At least ₱5,000,000 paid-up capital or net worth',
                      'Lacks substantial capital or distinct tools/premises',
                    ],
                    [
                      'Right of Control',
                      'Contractor independently controls means and methods',
                      'Principal exercises control over worker performance',
                    ],
                    [
                      'Legal Consequence',
                      'Solidarily liable only for unpaid wages',
                      'Prohibited — Principal is DIRECT EMPLOYER for all purposes',
                    ],
                  ]}
                />
              )}

              {topic.id === 'm4-minors-kasambahay-homework' && (
                <InteractiveStudyMatrix
                  testId="matrix-m4-minors"
                  title="Working Hours & Night Work Ban for Minors"
                  subtitle="Statutory hour caps and night-work prohibitions by age bracket"
                  badge="R.A. 9231 · Special Protection of Children"
                  accentColor="rose"
                  searchQuery={searchQuery}
                  headers={[
                    'Age Bracket',
                    'Max Daily Hours',
                    'Max Weekly Hours',
                    'Prohibited Night Window',
                  ]}
                  rows={[
                    [
                      'Below 15 Years Old',
                      '4 hours / day',
                      '20 hours / week',
                      'Prohibited 8:00 PM to 6:00 AM (10 hrs)',
                    ],
                    [
                      '15 to Under 18 Years Old',
                      '8 hours / day',
                      '40 hours / week',
                      'Prohibited 10:00 PM to 6:00 AM (8 hrs)',
                    ],
                  ]}
                />
              )}

              {topic.id === 'm5-harassment-safe-spaces' && (
                <InteractiveStudyMatrix
                  testId="matrix-m5-harassment"
                  title="Anti-Sexual Harassment vs. Safe Spaces Act (Bawal Bastos)"
                  subtitle="Ascendancy requirement and covered workplace/online venues"
                  badge="R.A. 7877 vs. R.A. 11313"
                  accentColor="indigo"
                  searchQuery={searchQuery}
                  headers={[
                    'Statutory Element',
                    'R.A. 7877 (1995 Law)',
                    'R.A. 11313 (Safe Spaces Act)',
                  ]}
                  rows={[
                    [
                      'Authority / Moral Ascendancy',
                      'Required (superior/teacher over subordinate/student)',
                      'Not required (covers peers & subordinate-to-superior)',
                    ],
                    [
                      'Covered Venues',
                      'Work, Education & Training environments only',
                      'Streets, Public Spaces, PUVs, Online, Workplaces & Schools',
                    ],
                  ]}
                />
              )}

              {isWorld6LeaveTopic && (
                <InteractiveStudyMatrix
                  testId="matrix-world6-master-leaves"
                  title="World 6 Master Matrix: Philippine Statutory Leaves at a Glance"
                  subtitle="Filter by leave family or tap 'Quiz Recall' to test durations, eligibility & cash conversion"
                  badge="Art. 95 · RA 11210 · RA 8187 · RA 11861 · RA 9710 · RA 9262"
                  accentColor="emerald"
                  searchQuery={searchQuery}
                  highlightedRowIndex={
                    [
                      'm6-service-incentive-leave',
                      'm6-maternity-leave',
                      'm6-paternity-leave',
                      'm6-solo-parents-leave',
                      'm6-gynecological-leave',
                      'm6-vawc-leave',
                    ].indexOf(topic.id)
                  }
                  categoryTabs={[
                    { id: 'annual', label: 'Annual & Service', rowIndices: [0] },
                    { id: 'parental', label: 'Parental & Birth', rowIndices: [1, 2, 3] },
                    { id: 'protective', label: 'Health & Gender Protection', rowIndices: [4, 5] },
                  ]}
                  headers={[
                    'Statutory Leave',
                    'Paid Duration',
                    'Key Eligibility & Service Rule',
                    'Cash Conversion / Cumulative',
                  ]}
                  rows={[
                    [
                      'Service Incentive Leave (Art. 95)',
                      '5 days / year',
                      'At least 1 year of service (excludes establishments <10 workers & Kasambahay rule)',
                      'Commutable to cash at year-end if unused',
                    ],
                    [
                      'Expanded Maternity Leave (R.A. 11210)',
                      '105 days (+15d solo) / 60d miscarriage',
                      'Every pregnancy regardless of civil status; up to 7d transferable to father',
                      'Paid in full (SSS + salary differential); non-cumulative',
                    ],
                    [
                      'Paternity Leave (R.A. 8187)',
                      '7 calendar days (+7d allocated = 14d)',
                      'Married male employee cohabiting with legitimate spouse; first 4 deliveries',
                      'Non-cumulative & non-convertible to cash',
                    ],
                    [
                      'Solo Parent Leave (R.A. 8972 / 11861)',
                      '7 working days / year',
                      'Valid Solo Parent ID + at least 6 months of service (lowered from 1 yr by R.A. 11861)',
                      'Non-cumulative & forfeited if unused (unless CBA)',
                    ],
                    [
                      'Special Gynecological Leave (R.A. 9710)',
                      'Up to 2 months (full pay)',
                      '6 months continuous aggregate service in last 12 mos + gynecological surgery',
                      'Non-cumulative & non-convertible to cash',
                    ],
                    [
                      'Anti-VAWC Victim Leave (R.A. 9262)',
                      'Up to 10 days (extendible)',
                      'Woman employee victim of VAWC; Barangay/Prosecutor/Court certification',
                      'Non-cumulative & non-convertible to cash',
                    ],
                  ]}
                />
              )}
            </>
          )}

          {/* Statutory Rules & Implementing Provisions Grid */}
          {showRuleCards && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <MarioFireFlowerIcon className="w-5 h-5 flex-shrink-0" />
                <h4 className="text-base sm:text-lg font-black text-slate-950 dark:text-white font-display uppercase tracking-wide">
                  STATUTORY RULES, DEFINITIONS &amp; IMPLEMENTING PROVISIONS
                </h4>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                {topic.rules.map((rule, rIdx) => {
                  const formattedItems = rule.items ? formatModuleRuleItems(rule.items) : [];

                  return (
                    <div
                      key={rIdx}
                      className={`bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-slate-800 dark:hover:border-amber-400/70 transition-colors space-y-3.5 flex flex-col justify-between h-full ${
                        rule.tableData ? 'lg:col-span-2' : ''
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5 pb-2.5 border-b-2 border-slate-200 dark:border-slate-800">
                          <div className="w-3.5 h-3.5 bg-red-600 border border-black rounded-xs flex-shrink-0" />
                          <h5 className={`${headingTextClass} text-red-700 dark:text-amber-300 font-display tracking-tight leading-snug`}>
                            {renderInteractiveText(rule.heading)}
                          </h5>
                        </div>

                        {rule.description && (
                          <p className={`${bodyTextClass} text-slate-800 dark:text-slate-200 font-bold`}>
                            {renderInteractiveText(rule.description)}
                          </p>
                        )}

                        {formattedItems.length > 0 && (
                          <div className="space-y-2.5">
                            {formattedItems.map((item, iIdx) => renderFormattedItem(item, iIdx))}
                          </div>
                        )}

                        {rule.tableData && (
                          <div className="mt-2">
                            <InteractiveStudyMatrix
                              testId={`matrix-${topic.id}-rule-${rIdx}`}
                              title={rule.heading}
                              badge={showLegalCitations ? topic.badge : undefined}
                              headers={rule.tableData.headers}
                              rows={rule.tableData.rows}
                              searchQuery={searchQuery}
                              accentColor={isWorld6LeaveTopic ? 'emerald' : 'amber'}
                            />
                          </div>
                        )}

                        {rule.subSections && (
                          <div className="pt-1 space-y-3">
                            {rule.subSections.map((sub, sIdx) => {
                              const formattedSubItems = formatModuleRuleItems(sub.items);
                              return (
                                <div
                                  key={sIdx}
                                  className="bg-amber-50/70 dark:bg-slate-800/75 border-2 border-amber-300 dark:border-amber-700/70 rounded-xl p-3.5 sm:p-4 space-y-2.5"
                                >
                                  <h6 className={`${bodyTextClass} font-black text-slate-950 dark:text-amber-200 flex items-center gap-2`}>
                                    <MarioCoinIcon className="w-4 h-4 flex-shrink-0" />
                                    <span>{renderInteractiveText(sub.title)}</span>
                                  </h6>
                                  <div className="space-y-2">
                                    {formattedSubItems.map((subItem, siIdx) =>
                                      renderFormattedItem(subItem, siIdx)
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Power-Up Box: Critical Statutory Checkpoints */}
          {(topic.barTips || topic.keyTips) && (
            <div className="mario-question-block rounded-2xl p-4 sm:p-6 text-slate-950 font-bold space-y-3 shadow-md">
              <div className="flex items-center gap-2">
                <MarioStarIcon className="w-6 h-6 flex-shrink-0" />
                <span className="font-black text-base sm:text-lg uppercase tracking-wide text-red-950 font-display">
                  POWER-UP: KEY STATUTORY CHECKPOINTS &amp; PRACTICAL DISTINCTIONS
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {(topic.keyTips || topic.barTips || []).map((tip, tIdx) => (
                  <div
                    key={tIdx}
                    className="flex items-start gap-3 bg-white/95 dark:bg-slate-900 p-3.5 rounded-xl border border-amber-700/40 dark:border-slate-700 text-slate-950 dark:text-slate-100 shadow-xs h-full"
                  >
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500 border border-black text-slate-950 text-xs font-black flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                    <span className={`${bodyTextClass} font-bold`}>
                      {renderInteractiveText(cleanRuleText(tip))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Micro-Quiz: Quick Knowledge Check (+3 Coins) */}
          <section
            data-testid={`topic-quick-check-${topic.id}`}
            className="rounded-2xl border-2 border-slate-900 bg-slate-900 text-white p-4 sm:p-5 space-y-3.5 shadow-[4px_4px_0_#000]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MarioQuestionBlockIcon className="w-5 h-5 shrink-0" />
                <h4 className="text-sm sm:text-base font-black text-amber-300 font-display">
                  Quick Knowledge Check
                </h4>
              </div>
              <span className="text-xs font-bold text-emerald-300 tabular-nums">
                {quickCheckClaimed
                  ? '✓ +3 Coins Claimed'
                  : `Answer Correctly for +${quickCheck.rewardCoins} Coins`}
              </span>
            </div>

            <p className="text-sm font-bold text-slate-100 leading-relaxed">
              {quickCheck.question}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickCheck.options.map((optText, optIdx) => {
                const isSelected = quickCheckChoice === optIdx;
                const isCorrectOpt = optIdx === quickCheck.correctIndex;
                const showResult = quickCheckChoice !== null;

                let btnStyle =
                  'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700';
                if (showResult) {
                  if (isCorrectOpt) {
                    btnStyle = 'bg-emerald-500 text-slate-950 border-black font-black';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-500 text-white border-black font-black';
                  } else {
                    btnStyle = 'bg-slate-950/60 text-slate-400 border-slate-800';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    data-testid={`quick-check-opt-${topic.id}-${optIdx}`}
                    onClick={() => {
                      setQuickCheckChoice(optIdx);
                      if (optIdx === quickCheck.correctIndex) {
                        marioAudio.playCoin();
                        if (!quickCheckClaimed) {
                          setQuickCheckClaimed(true);
                          onEarnCoins?.(quickCheck.rewardCoins);
                          try {
                            const saved = JSON.parse(
                              localStorage.getItem('mario_claimed_quick_checks') || '[]'
                            );
                            const next = Array.isArray(saved)
                              ? Array.from(new Set([...saved, topic.id]))
                              : [topic.id];
                            localStorage.setItem(
                              'mario_claimed_quick_checks',
                              JSON.stringify(next)
                            );
                          } catch {
                            // ignore storage errors
                          }
                        }
                      } else {
                        marioAudio.playWrongAnswer();
                      }
                    }}
                    className={`min-h-[44px] px-3.5 py-2.5 rounded-xl border-2 text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-start gap-2 ${btnStyle}`}
                  >
                    <span className="font-mono font-black shrink-0">
                      {String.fromCharCode(65 + optIdx)}.
                    </span>
                    <span className="min-w-0 break-words">{optText}</span>
                  </button>
                );
              })}
            </div>

            {quickCheckChoice !== null && (
              <div
                className={`rounded-xl p-3 border text-xs sm:text-sm font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  quickCheckChoice === quickCheck.correctIndex
                    ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-100'
                    : 'bg-rose-950/80 border-rose-500/60 text-rose-100'
                }`}
              >
                <p className="leading-relaxed">
                  <strong className="font-black">
                    {quickCheckChoice === quickCheck.correctIndex
                      ? 'Correct! '
                      : 'Not quite — try another choice! '}
                  </strong>
                  {quickCheck.explanation}
                </p>
                {quickCheckChoice !== quickCheck.correctIndex && (
                  <button
                    type="button"
                    onClick={() => setQuickCheckChoice(null)}
                    className="min-h-[36px] px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black text-xs border border-slate-600 shrink-0 cursor-pointer"
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}
          </section>
          </>
          )}
        </div>
      )}

      {/* Mario Quick Glossary Modal */}
      <QuickGlossaryModal
        isOpen={isGlossaryModalOpen}
        onClose={() => setIsGlossaryModalOpen(false)}
        initialTermId={selectedGlossaryTermId}
      />
    </article>
  );
};
