import React, { useState } from 'react';
import {
  Sparkles,
  Scale,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Award,
} from 'lucide-react';
import { MarioStarIcon, MarioCoinIcon } from './MarioIcons';
import { marioAudio } from '../utils/audio';
import { saveSingleQuizErrorToStudyNotes } from '../utils/round13Features';

export interface ArcadeDoctrineCardProps {
  title?: string;
  statute: string;
  rule: string;
  takeaway?: string;
  isCorrect?: boolean;
  onAdvance?: () => void;
  advanceLabel?: string;
  worldCode?: string;
  scenarioText?: string;
  chosenAnswerText?: string;
  correctAnswerText?: string;
  speedBonusAwarded?: boolean;
  shieldAbsorbedHit?: boolean;
}

export const ArcadeDoctrineCard: React.FC<ArcadeDoctrineCardProps> = ({
  title,
  statute,
  rule,
  takeaway,
  isCorrect = true,
  onAdvance,
  advanceLabel = 'Next Stage',
  worldCode = 'w1',
  scenarioText,
  chosenAnswerText,
  correctAnswerText,
  speedBonusAwarded = false,
  shieldAbsorbedHit = false,
}) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveToNotes = () => {
    if (typeof window === 'undefined') return;
    try {
      saveSingleQuizErrorToStudyNotes(window.localStorage, {
        worldCode,
        legalBasis: statute,
        scenario: scenarioText || title || rule.slice(0, 80),
        chosenOptionText: chosenAnswerText || (isCorrect ? 'Correct Ruling' : 'Incorrect Choice'),
        correctOptionText: correctAnswerText || rule,
        explanation: rule,
      });
      setIsSaved(true);
      marioAudio.playCoin();
    } catch {
      setIsSaved(true);
    }
  };

  return (
    <div
      data-testid="arcade-doctrine-takeaway-card"
      className={`rounded-3xl border-3 p-4 sm:p-5 space-y-3.5 transition-all shadow-[0_8px_24px_rgba(0,0,0,0.55)] ${
        isCorrect
          ? 'bg-gradient-to-b from-[#062c1e] via-[#0b1c16] to-[#04130d] border-emerald-400 text-emerald-100'
          : shieldAbsorbedHit
          ? 'bg-gradient-to-b from-[#0c2238] via-[#091626] to-[#040b14] border-sky-400 text-sky-100'
          : 'bg-gradient-to-b from-[#310c14] via-[#20080d] to-[#120407] border-rose-500 text-rose-100'
      }`}
    >
      {/* Top Banner Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-white/15">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center border-2 border-black shrink-0 ${
              isCorrect ? 'bg-emerald-400 text-slate-950' : 'bg-rose-500 text-white'
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
          </div>
          <span className="font-mario text-[10px] sm:text-[11px] uppercase tracking-wider font-black">
            {isCorrect
              ? 'DOCTRINE MASTERED!'
              : shieldAbsorbedHit
              ? 'STAR SHIELD DEFLECTED!'
              : 'CRITICAL STATUTORY DISTINCTION!'}
          </span>
          {speedBonusAwarded && (
            <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-mario text-[9px] font-black shrink-0">
              +5 SPEED BONUS!
            </span>
          )}
        </div>

        {/* Legal Citation Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-amber-400/60 font-mono text-xs font-bold text-amber-300 shadow-[0_2px_0_#000]">
          <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate max-w-[240px] sm:max-w-none">{statute}</span>
        </div>
      </div>

      {/* Title if provided */}
      {title && (
        <h4 className="text-sm sm:text-base font-black font-display text-white tracking-wide">
          {title}
        </h4>
      )}

      {/* Controlling Codal Rule Box */}
      <div className="bg-slate-950/85 rounded-2xl border-l-4 border-amber-400 border-y border-r border-slate-800 p-3.5 sm:p-4 space-y-1.5 shadow-[2px_2px_0_#000]">
        <div className="flex items-center gap-1.5 text-[10px] font-mario text-amber-300 uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>CONTROLLING CODAL DOCTRINE</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-100 font-semibold leading-relaxed">
          {rule}
        </p>
      </div>

      {/* Practical Takeaway / Memory Peg */}
      {takeaway && (
        <div className="bg-slate-950/70 rounded-2xl border-l-4 border-emerald-400 border-y border-r border-slate-800 p-3 sm:p-3.5 space-y-1 shadow-[2px_2px_0_#000]">
          <div className="flex items-center gap-1.5 text-[10px] font-mario text-emerald-300 uppercase tracking-wide">
            <MarioStarIcon className="w-3 h-3 shrink-0" />
            <span>STATUTORY TAKEAWAY &amp; PRACTICAL DISTINCTION</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed">
            {takeaway}
          </p>
        </div>
      )}

      {/* Bottom Action Footer with 1-Tap Save to Study Notes & Next Stage */}
      <div className="pt-1.5 flex flex-wrap items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={handleSaveToNotes}
          disabled={isSaved}
          title="Save this high-yield legal doctrine to your Study Notes Drawer"
          className={`min-h-[40px] px-3.5 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all ${
            isSaved
              ? 'bg-emerald-900/80 text-emerald-300 border-emerald-500 shadow-none cursor-default'
              : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-700 hover:border-amber-400 shadow-[0_2px_0_#000] active:translate-y-0.5'
          }`}
        >
          {isSaved ? (
            <>
              <BookmarkCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Saved to Study Notes</span>
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Save to Study Notes</span>
            </>
          )}
        </button>

        {onAdvance && (
          <button
            type="button"
            onClick={() => {
              marioAudio.playJump();
              onAdvance();
            }}
            className="min-h-[42px] px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm border-2 border-black inline-flex items-center gap-1.5 cursor-pointer shadow-[0_3px_0_#000] active:translate-y-0.5"
          >
            <span>{advanceLabel}</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
};
