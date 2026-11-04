import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, RotateCcw, Trash2, X, Layers, Compass, ArrowDownUp } from 'lucide-react';
import {
  ModuleSessionBookmarkSlot,
  ModuleWorkspaceViewMode,
  loadModuleSessionBookmarks,
  upsertModuleSessionBookmarkSlot,
  deleteModuleSessionBookmarkSlot,
} from '../utils/round13Features';
import { WORLDS_METADATA } from '../data/laborLawData';
import { marioAudio } from '../utils/audio';

interface ModuleSessionBookmarksBarProps {
  activeWorld: string;
  openTopicIds: readonly string[];
  moduleViewMode: ModuleWorkspaceViewMode;
  onRestoreSlot: (slot: ModuleSessionBookmarkSlot) => void;
}

export const ModuleSessionBookmarksBar: React.FC<ModuleSessionBookmarksBarProps> = ({
  activeWorld,
  openTopicIds,
  moduleViewMode,
  onRestoreSlot,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [slots, setSlots] = useState<ModuleSessionBookmarkSlot[]>(() =>
    typeof window !== 'undefined' ? loadModuleSessionBookmarks(window.localStorage) : []
  );
  const [slotNameInput, setSlotNameInput] = useState('');
  const [liveScrollY, setLiveScrollY] = useState<number>(() =>
    typeof window !== 'undefined' ? Math.max(0, Math.round(window.scrollY || 0)) : 0
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;
    setLiveScrollY(Math.max(0, Math.round(window.scrollY || 0)));
    const handleScroll = () => {
      setLiveScrollY(Math.max(0, Math.round(window.scrollY || 0)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  const formatWorldLabel = (worldId: string): string => {
    if (worldId === 'all') return 'All 6 Worlds';
    const found = WORLDS_METADATA.find((w) => w.id === worldId);
    return found ? `W${found.worldNumber}: ${found.shortTitle}` : worldId;
  };

  const handleSaveCurrentSession = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const currentScrollY =
      typeof window !== 'undefined' ? Math.max(0, Math.round(window.scrollY || 0)) : liveScrollY;
    const defaultLabel = `${formatWorldLabel(activeWorld)} · ${new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
    const chosenName = slotNameInput.trim() || defaultLabel;

    const { slots: nextSlots, savedSlot } = upsertModuleSessionBookmarkSlot(
      slots,
      {
        slotName: chosenName,
        scrollY: currentScrollY,
        activeWorld,
        openTopicIds,
        moduleViewMode,
      },
      typeof window !== 'undefined' ? window.localStorage : null
    );

    setSlots(nextSlots);
    setSlotNameInput('');
    setLiveScrollY(currentScrollY);
    setStatusMessage(
      `Saved "${savedSlot.slotName}" (${formatWorldLabel(savedSlot.activeWorld)}, ${
        savedSlot.openTopicIds.length
      } open cards, ${savedSlot.scrollY}px)`
    );
    marioAudio.playCoin();
    window.setTimeout(() => setStatusMessage(null), 3200);
  };

  const handleRestore = (slot: ModuleSessionBookmarkSlot) => {
    onRestoreSlot(slot);
    setStatusMessage(`Restored "${slot.slotName}"`);
    marioAudio.playPipe();
    window.setTimeout(() => setStatusMessage(null), 2600);
  };

  const handleDelete = (slot: ModuleSessionBookmarkSlot) => {
    const next = deleteModuleSessionBookmarkSlot(
      slots,
      slot.id,
      typeof window !== 'undefined' ? window.localStorage : null
    );
    setSlots(next);
    marioAudio.playClick();
  };

  return (
    <div className="w-full space-y-2.5" data-testid="module-session-bookmarks-wrapper">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/95 border-2 border-slate-700 rounded-2xl px-3.5 py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 border border-black flex items-center justify-center shrink-0">
            <Bookmark className="w-4 h-4 fill-current" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase text-amber-300 font-mario block">
              WORKSPACE CHECKPOINT SLOTS
            </span>
            <span className="text-xs font-semibold text-slate-300 block truncate">
              Save scroll position, world filter &amp; open topic cards into named slots
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {slots.length > 0 && !isOpen && (
            <button
              type="button"
              data-testid="modules-bookmark-quick-restore-latest-btn"
              onClick={() => handleRestore(slots[0])}
              title={`Restore latest slot: ${slots[0].slotName}`}
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-600 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span className="max-w-[140px] truncate">Restore: {slots[0].slotName}</span>
            </button>
          )}

          <button
            type="button"
            data-testid="modules-bookmark-session-btn"
            aria-expanded={isOpen}
            onClick={() => {
              setIsOpen((prev) => !prev);
              marioAudio.playClick();
            }}
            className={`min-h-[42px] px-3.5 py-1.5 rounded-xl text-xs font-black border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap ${
              isOpen
                ? 'bg-emerald-400 text-slate-950'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
            }`}
          >
            <BookmarkCheck className="w-4 h-4 shrink-0" />
            <span>Bookmark Session ({slots.length})</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          data-testid="modules-bookmark-session-panel"
          className="bg-slate-950 text-white border-2 border-amber-400 rounded-2xl p-4 space-y-4 shadow-[4px_4px_0_#000]"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 tabular-nums">
              <span className="font-black text-amber-300">Current Workspace:</span>
              <span className="inline-flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{formatWorldLabel(activeWorld)}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{openTopicIds.length} open cards</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <ArrowDownUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Scroll {liveScrollY}px</span>
              </span>
            </div>

            <button
              type="button"
              aria-label="Close Bookmark Session panel"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form
            onSubmit={handleSaveCurrentSession}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            <label htmlFor="bookmark-session-slot-name" className="sr-only">
              Session Slot Name
            </label>
            <input
              id="bookmark-session-slot-name"
              data-testid="bookmark-session-name-input"
              type="text"
              value={slotNameInput}
              onChange={(e) => setSlotNameInput(e.target.value)}
              placeholder="Name this session slot (e.g., World 2 Holiday Rules)..."
              maxLength={60}
              className="flex-1 min-h-[42px] rounded-xl bg-slate-900 border-2 border-slate-700 focus:border-amber-400 px-3.5 py-2 text-xs sm:text-sm font-bold text-white placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              data-testid="bookmark-session-save-btn"
              className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <BookmarkCheck className="w-4 h-4 shrink-0" />
              <span>Save Session</span>
            </button>
          </form>

          {statusMessage && (
            <div
              role="status"
              data-testid="bookmark-session-status"
              className="text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/60 rounded-xl px-3 py-2"
            >
              {statusMessage}
            </div>
          )}

          {slots.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium">
              No saved session slots yet. Enter a slot name above and click Save Session to store your current scroll position, active world filter, and expanded topic cards.
            </p>
          ) : (
            <div
              data-testid="bookmark-session-slots-list"
              className="grid grid-cols-1 md:grid-cols-2 gap-2.5"
            >
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  data-testid={`bookmark-session-slot-${slot.id}`}
                  className="bg-slate-900 border border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3 min-w-0"
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="text-xs sm:text-sm font-black text-white truncate">
                      {slot.slotName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium tabular-nums truncate">
                      {formatWorldLabel(slot.activeWorld)} · {slot.openTopicIds.length} open ·{' '}
                      {slot.scrollY}px
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      data-testid={`bookmark-session-restore-${slot.id}`}
                      aria-label={`Restore session ${slot.slotName}`}
                      onClick={() => handleRestore(slot)}
                      className="min-h-[36px] px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border border-black inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                      <span>Restore</span>
                    </button>
                    <button
                      type="button"
                      data-testid={`bookmark-session-delete-${slot.id}`}
                      aria-label={`Delete session ${slot.slotName}`}
                      onClick={() => handleDelete(slot)}
                      className="min-h-[36px] min-w-[36px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 inline-flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
