import React, { useState, useEffect } from 'react';
import { BookmarkPlus, Check } from 'lucide-react';
import {
  QuizErrorNoteInput,
  saveSingleQuizErrorToStudyNotes,
  isQuizErrorSavedInNotes,
  computeQuizErrorFingerprint,
} from '../utils/round13Features';
import { loadStudyNotes } from '../utils/engagementFeatures';
import { marioAudio } from '../utils/audio';

interface SaveSingleQuizErrorButtonProps {
  errorItem: QuizErrorNoteInput;
  compact?: boolean;
  darkSurface?: boolean;
  testId?: string;
}

export const SaveSingleQuizErrorButton: React.FC<SaveSingleQuizErrorButtonProps> = ({
  errorItem,
  compact = false,
  darkSurface = false,
  testId,
}) => {
  const fingerprint = computeQuizErrorFingerprint(errorItem);
  const [isSaved, setIsSaved] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const notes = loadStudyNotes(window.localStorage);
    return isQuizErrorSavedInNotes(notes, errorItem);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncSaved = () => {
      const notes = loadStudyNotes(window.localStorage);
      setIsSaved(isQuizErrorSavedInNotes(notes, errorItem));
    };
    syncSaved();
    window.addEventListener('mario-study-notes-updated', syncSaved);
    return () => window.removeEventListener('mario-study-notes-updated', syncSaved);
  }, [fingerprint, errorItem]);

  const handleSaveOneError = () => {
    if (typeof window === 'undefined') return;
    const res = saveSingleQuizErrorToStudyNotes(window.localStorage, errorItem);
    setIsSaved(true);
    if (!res.alreadyExists) {
      marioAudio.playCoin();
    } else {
      marioAudio.playClick();
    }
  };

  return (
    <button
      type="button"
      data-testid={testId || `save-single-quiz-error-${fingerprint}`}
      disabled={isSaved}
      aria-label={
        isSaved
          ? `Saved error on ${errorItem.legalBasis} to Study Notes`
          : `Save error on ${errorItem.legalBasis} to Study Notes`
      }
      onClick={handleSaveOneError}
      className={`${
        compact ? 'min-h-[34px] px-2.5 py-1 text-[11px]' : 'min-h-[38px] px-3 py-1.5 text-xs'
      } rounded-xl font-black border inline-flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
        isSaved
          ? darkSurface
            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/70 cursor-default'
            : 'bg-emerald-100 text-emerald-900 border-emerald-600 cursor-default'
          : darkSurface
          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-black shadow-[0_2px_0_#000] cursor-pointer active:translate-y-0.5'
          : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-black shadow-[0_2px_0_#000] cursor-pointer active:translate-y-0.5'
      }`}
    >
      {isSaved ? (
        <>
          <Check className="w-3.5 h-3.5 shrink-0" />
          <span>Saved to Notes</span>
        </>
      ) : (
        <>
          <BookmarkPlus className="w-3.5 h-3.5 shrink-0" />
          <span>Save Error to Notes</span>
        </>
      )}
    </button>
  );
};
