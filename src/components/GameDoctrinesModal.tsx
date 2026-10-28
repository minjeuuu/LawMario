import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  KART_QUESTION_BANK,
  SLOTS_TRIVIA_BANK,
  WORLD6_LEAVE_CLINIC_BANK,
  PLATFORMER_2D_DOCTRINES_BANK,
  COURTROOM_BOWSER_ATTACK_BANK,
  GOOMBA_DEDUCTION_BANK,
  WARP_PIPE_SORTER_BANK,
  MULTIPLIER_MEMORY_BANK,
  CONTRACTOR_DOCKET_BANK,
  BRIDGE_DOCTRINE_BANK,
  PAYROLL_CAPSULE_BANK,
} from '../utils/gameQuestionDeck';
import {
  MarioQuestionBlockIcon,
  MarioStarIcon,
  MarioMushroomIcon,
  MarioFireFlowerIcon,
  Mario1UpIcon,
  MarioCoinIcon,
} from './MarioIcons';
import { marioAudio } from '../utils/audio';
import {
  X,
  Search,
  BookOpen,
  Scale,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Volume2,
  Square,
  Gamepad2,
  FileText,
  Filter,
} from 'lucide-react';
import { VaultGameId } from './GameVault';

interface GameDoctrinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeGameId: VaultGameId;
}

interface DoctrineEntry {
  id: string;
  category: string;
  title: string;
  questionOrDoctrine: string;
  answerOrRule: string;
  legalBasis: string;
}

export const GameDoctrinesModal: React.FC<GameDoctrinesModalProps> = ({
  isOpen,
  onClose,
  activeGameId,
}) => {
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>(activeGameId);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Build unified doctrine and question entries from game decks
  const allEntries = useMemo<DoctrineEntry[]>(() => {
    const list: DoctrineEntry[] = [];

    // 1. Labor Kart Questions
    KART_QUESTION_BANK.forEach((k, idx) => {
      list.push({
        id: `kart-${k.id || idx}`,
        category: 'kart',
        title: `Labor Kart GP • Question #${idx + 1}`,
        questionOrDoctrine: k.question,
        answerOrRule: `Correct Answer: ${k.options[k.correctIndex]}`,
        legalBasis: 'Philippine Labor Standards & DOLE Omnibus Rules',
      });
    });

    // 2. 2D Platformer Doctrines
    PLATFORMER_2D_DOCTRINES_BANK.forEach((d, idx) => {
      list.push({
        id: `run2d-${idx}`,
        category: 'run2d',
        title: `Super Mario Legal Run • Block Doctrine #${idx + 1}`,
        questionOrDoctrine: d.slice(0, 60) + '...',
        answerOrRule: d,
        legalBasis: 'Labor Code Books III & IV Codification',
      });
    });

    // 3. Courtroom Bowser Charges & Motions
    COURTROOM_BOWSER_ATTACK_BANK.forEach((c) => {
      list.push({
        id: `court-${c.id}`,
        category: 'courtroom',
        title: `Courtroom Boss Battle • ${c.title}`,
        questionOrDoctrine: `Bowser Charge: "${c.dialogue}"`,
        answerOrRule: `Statutory Countermeasure: ${c.weakness.replace(/_/g, ' ').toUpperCase()}`,
        legalBasis: 'Art. 83, 113, 297 & R.A. 11210 Standards',
      });
    });

    // 4. World 6 Leave Clinic Cases
    WORLD6_LEAVE_CLINIC_BANK.forEach((lc, idx) => {
      list.push({
        id: `w6-${lc.id || idx}`,
        category: 'world6_clinic',
        title: `World 6 Leave Clinic • Case #${idx + 1}`,
        questionOrDoctrine: lc.scenario,
        answerOrRule: `Mandatory Leave: ${lc.correctLeave}`,
        legalBasis: lc.statute,
      });
    });

    // 5. Warp Pipe Sorter (Covered vs Exempt)
    WARP_PIPE_SORTER_BANK.forEach((w, idx) => {
      list.push({
        id: `pipe-${w.id || idx}`,
        category: 'pipe_sorter',
        title: `Warp Pipe Classifier • ${w.label}`,
        questionOrDoctrine: `Subject: ${w.label} — ${w.detail}`,
        answerOrRule: `Classification: ${w.targetPipe === 'covered' ? 'GREEN PIPE (Covered / Mandatory)' : 'RED PIPE (Exempt / Prohibited)'}`,
        legalBasis: 'Articles 82, 94, 95 & Statutory Standards',
      });
    });

    // 6. Slots Trivia
    SLOTS_TRIVIA_BANK.forEach((st, idx) => {
      list.push({
        id: `slots-${st.id || idx}`,
        category: 'toad_slots',
        title: `Toad Slots • Trivia #${idx + 1}`,
        questionOrDoctrine: st.q,
        answerOrRule: `Correct Answer: ${st.opts[st.ans]}`,
        legalBasis: 'Philippine Labor Law Bar Precepts',
      });
    });

    // 7. Whack-a-Goomba Deductions
    GOOMBA_DEDUCTION_BANK.forEach((g, idx) => {
      list.push({
        id: `whack-${g.id || idx}`,
        category: 'whack',
        title: `Whack-a-Goomba • Deduction #${idx + 1}`,
        questionOrDoctrine: g.label,
        answerOrRule: g.isIllegal ? 'ILLEGAL DEDUCTION (Smash Goomba!)' : 'LAWFUL DEDUCTION (Spare Toad!)',
        legalBasis: g.ruleNote,
      });
    });

    // 8. Contractor Buster
    CONTRACTOR_DOCKET_BANK.forEach((cd, idx) => {
      list.push({
        id: `contractor-${cd.id || idx}`,
        category: 'mansion',
        title: `Contractor Buster • ${cd.agencyName}`,
        questionOrDoctrine: `Capital: ${cd.capital} | Control: ${cd.controlHolder} | Work: ${cd.workRelation}`,
        answerOrRule: cd.isLaborOnly ? 'PROHIBITED LABOR-ONLY CONTRACTOR' : 'LEGITIMATE INDEPENDENT CONTRACTOR',
        legalBasis: cd.verdictNote,
      });
    });

    return list;
  }, []);

  const filteredList = useMemo(() => {
    let result = allEntries;
    if (selectedGameFilter !== 'all') {
      result = result.filter((e) => e.category === selectedGameFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.questionOrDoctrine.toLowerCase().includes(q) ||
          e.answerOrRule.toLowerCase().includes(q) ||
          e.legalBasis.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allEntries, selectedGameFilter, searchQuery]);

  if (!isOpen) return null;

  const handleCopy = (item: DoctrineEntry) => {
    const text = `${item.title}\n\nQuestion / Scenario:\n${item.questionOrDoctrine}\n\nRule / Answer:\n${item.answerOrRule}\n\nStatutory Basis:\n${item.legalBasis}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    marioAudio.playCoin();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const textClass =
    fontSize === 'xlarge'
      ? 'text-base sm:text-lg leading-relaxed'
      : fontSize === 'large'
      ? 'text-sm sm:text-base leading-relaxed'
      : 'text-xs sm:text-sm leading-relaxed';

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-2.5 sm:p-5 bg-black/85 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-slate-900 border-4 border-amber-400 rounded-3xl w-[96vw] max-w-7xl h-[90vh] flex flex-col shadow-[0_0_35px_rgba(251,191,36,0.25)] overflow-hidden text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b-3 border-amber-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-amber-400 rounded-2xl border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
              <BookOpen className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mario text-[10px] uppercase text-amber-400">
                  ARCADE CURRICULUM
                </span>
                <span className="text-[10px] bg-emerald-600 text-white font-black font-mono px-2 py-0.5 rounded uppercase">
                  UNABRIDGED STUDY SHEET
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black font-display text-white">
                GAME DOCTRINES, QUESTIONS &amp; STATUTORY ANSWERS
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
            <div className="inline-flex rounded-xl bg-slate-800 border-2 border-slate-700 p-0.5 text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                className={`px-2.5 py-1 rounded-lg ${fontSize === 'normal' ? 'bg-amber-400 text-slate-950' : 'text-slate-300'}`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`px-2.5 py-1 rounded-lg font-black ${fontSize === 'large' ? 'bg-amber-400 text-slate-950' : 'text-slate-300'}`}
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setFontSize('xlarge')}
                className={`px-2.5 py-1 rounded-lg font-black text-sm ${fontSize === 'xlarge' ? 'bg-amber-400 text-slate-950' : 'text-slate-300'}`}
              >
                A++
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-red-600 hover:text-white text-slate-300 border-2 border-slate-700 flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Close Doctrine Reader"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Game Selector & Search */}
        <div className="p-3 sm:p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col md:flex-row items-center gap-3 shrink-0">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search doctrines, statutes, or answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm font-bold text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full no-scrollbar pb-1 md:pb-0 text-xs">
            {[
              { id: 'all', label: 'All Games' },
              { id: 'kart', label: 'Labor Kart' },
              { id: 'run2d', label: '2D Runner' },
              { id: 'courtroom', label: 'Courtroom RPG' },
              { id: 'world6_clinic', label: 'Leave Clinic' },
              { id: 'pipe_sorter', label: 'Pipe Sorter' },
              { id: 'toad_slots', label: 'Toad Slots' },
              { id: 'whack', label: 'Goomba Audit' },
              { id: 'mansion', label: 'Contractor Buster' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedGameFilter(tab.id);
                  marioAudio.playCoin();
                }}
                className={`min-h-[36px] px-3 rounded-xl border-2 font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedGameFilter === tab.id
                    ? 'bg-amber-400 border-black text-slate-950 shadow-[0_2px_0_#000]'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Feed: High-Readability Doctrine Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-1">
            <span>SHOWING {filteredList.length} CODIFIED DOCTRINES &amp; QUESTIONS</span>
            <span>TAP COPY OR REVIEW AT LEISURE</span>
          </div>

          {filteredList.map((item) => {
            const isCopied = copiedId === item.id;
            return (
              <div
                key={item.id}
                className="bg-slate-950 rounded-2xl border-3 border-slate-800 hover:border-amber-400/80 p-4 sm:p-5 space-y-3 transition-colors shadow-md"
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-2.5">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase text-amber-400 font-mario">
                      {item.title}
                    </span>
                    <h4 className="text-sm sm:text-base font-extrabold text-white">
                      {item.questionOrDoctrine}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(item)}
                    className="min-h-[34px] px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-3 sm:p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-mario text-[10px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>STATUTORY ANSWER &amp; RULE:</span>
                  </div>
                  <p className={`${textClass} font-bold text-emerald-100`}>
                    {item.answerOrRule}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-amber-300/90 pt-1">
                  <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-slate-500 uppercase font-bold">LEGAL BASIS:</span>
                  <span className="font-semibold">{item.legalBasis}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
};
