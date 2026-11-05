import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  NotebookPen,
  Plus,
  Trash2,
  Pin,
  Search,
  X,
  Sparkles,
  Check,
  Pencil,
  Copy,
  Mic,
  MicOff,
  Highlighter,
  Star,
  Calendar,
  GripVertical,
} from 'lucide-react';
import {
  StudyNoteItem,
  StudyNoteCategoryTag,
  STUDY_NOTE_CATEGORY_TAGS,
  loadStudyNotes,
  saveStudyNotes,
  createStudyNote,
  updateStudyNote,
  deleteStudyNote,
  filterStudyNotes,
} from '../utils/engagementFeatures';
import {
  PLANNER_DAYS,
  PlannerDayKey,
  NoteLineAnnotationsMap,
  WeeklyStudyPlannerSchedule,
  loadNoteLineAnnotations,
  saveNoteLineAnnotations,
  toggleNoteLineHighlight,
  toggleNoteLineStar,
  loadWeeklyStudyPlanner,
  saveWeeklyStudyPlanner,
  assignModuleToPlannerDay,
  removeModuleFromPlannerDay,
} from '../utils/studyPlannerAndNotes';
import { WORLDS_METADATA, ALL_LAW_TOPICS } from '../data/laborLawData';
import { marioAudio } from '../utils/audio';

interface StudyNotesDrawerProps {
  activeWorld: string;
  activeTab: string;
  onNotesChange?: (notes: StudyNoteItem[]) => void;
}

const QUICK_MNEMONIC_TEMPLATES: { label: string; worldTag: string; title: string; content: string }[] = [
  {
    label: '20m Brownout',
    worldTag: 'world1',
    title: 'Brownout <= 20 Mins Rule',
    content: 'Power interruptions of 20 minutes or less are COMPENSABLE hours worked (Art. 84 Implementing Rules).',
  },
  {
    label: '390% Holiday',
    worldTag: 'holidays',
    title: 'Double Holiday + Rest Day = 390%',
    content: '2 Regular Holidays coincide = 200% unworked, 300% worked. Add +30% of 300% (+90%) on Rest Day = 390%!',
  },
  {
    label: '100% Service Charge',
    worldTag: 'world2',
    title: 'R.A. 11360 Service Charges',
    content: '100% distributed equally to covered rank-and-file/supervisory workers; managerial employees excluded.',
  },
  {
    label: 'D.O. 174 LOC',
    worldTag: 'world3',
    title: 'Labor-Only Contracting Test',
    content: 'No substantial capital/investment + directly related to principal business OR no control over workers = Prohibited LOC.',
  },
  {
    label: '105d Maternity / 5d SIL',
    worldTag: 'world6',
    title: 'World 6 Statutory Leaves Key Numbers',
    content: 'SIL: 5d commutable after 1 yr (Art. 95) | Maternity: 105d live (+15d solo) / 60d miscarriage (RA 11210) | Paternity: 7d first 4 (RA 8187) | Solo Parent: 7d after 6 mos (RA 11861) | VAWC: 10d (RA 9262).',
  },
];

export const StudyNotesDrawer: React.FC<StudyNotesDrawerProps> = ({
  activeWorld,
  activeTab,
  onNotesChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<StudyNoteItem[]>(() =>
    typeof window !== 'undefined' ? loadStudyNotes(window.localStorage) : []
  );

  useEffect(() => {
    const handleOpenNotes = () => {
      setIsOpen(true);
      marioAudio.playPipe();
    };
    const handleExternalUpdate = () => {
      const refreshed = loadStudyNotes(window.localStorage);
      setNotes(refreshed);
      onNotesChange?.(refreshed);
    };
    window.addEventListener('mario-open-study-notes', handleOpenNotes);
    window.addEventListener('mario-study-notes-updated', handleExternalUpdate);
    return () => {
      window.removeEventListener('mario-open-study-notes', handleOpenNotes);
      window.removeEventListener('mario-study-notes-updated', handleExternalUpdate);
    };
  }, [onNotesChange]);

  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftWorldTag, setDraftWorldTag] = useState<string>('all');
  const [draftCategoryTag, setDraftCategoryTag] =
    useState<StudyNoteCategoryTag>('Quick Reference');
  const [worldFilter, setWorldFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [drawerTab, setDrawerTab] = useState<'notes' | 'planner'>('notes');
  const [lineAnnotations, setLineAnnotations] = useState<NoteLineAnnotationsMap>(() =>
    typeof window !== 'undefined' ? loadNoteLineAnnotations(window.localStorage) : {}
  );
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyStudyPlannerSchedule>(() =>
    typeof window !== 'undefined' ? loadWeeklyStudyPlanner(window.localStorage) : loadWeeklyStudyPlanner()
  );
  const [plannerWorldFilter, setPlannerWorldFilter] = useState<string>('all');
  const [selectedDayByTopic, setSelectedDayByTopic] = useState<Record<string, PlannerDayKey>>({});
  const [dragHoverDay, setDragHoverDay] = useState<PlannerDayKey | null>(null);

  // Voice Memo / Multi-Language SpeechRecognition state ('' = Auto-Detect All Languages)
  const [voiceLang, setVoiceLang] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const voiceLanguageOptions = [
    { code: '', label: 'Auto-Detect (All Languages)' },
    { code: 'fil-PH', label: 'Filipino / Tagalog (PH)' },
    { code: 'en-PH', label: 'English (Philippines)' },
    { code: 'en-US', label: 'English (US)' },
    { code: 'es-ES', label: 'Español' },
    { code: 'ja-JP', label: '日本語 (Japanese)' },
    { code: 'ko-KR', label: '한국어 (Korean)' },
    { code: 'zh-CN', label: '中文 (Mandarin)' },
  ];

  const handleToggleVoiceMemo = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setSpeechNotice('Voice dictation not supported in this browser. Try Chrome or Edge.');
      setTimeout(() => setSpeechNotice(null), 4000);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
      setSpeechNotice(null);
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = false;
      if (voiceLang) {
        rec.lang = voiceLang;
      }

      rec.onstart = () => {
        setIsListening(true);
        const langLabel =
          voiceLanguageOptions.find((l) => l.code === voiceLang)?.label ||
          'Auto-Detect (All Languages)';
        setSpeechNotice(`Listening (${langLabel})... speak clearly to transcribe`);
        marioAudio.playCoin();
      };

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        if (transcript.trim()) {
          setDraftContent((prev) => (prev ? `${prev} ${transcript.trim()}` : transcript.trim()));
        }
      };

      rec.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
        setSpeechNotice(err.error === 'not-allowed' ? 'Microphone permission denied' : `Mic error: ${err.error || 'Unavailable'}`);
        setTimeout(() => setSpeechNotice(null), 4000);
      };

      rec.onend = () => {
        setIsListening(false);
        setTimeout(() => setSpeechNotice(null), 2500);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setSpeechNotice('Could not start microphone speech recognition.');
      setTimeout(() => setSpeechNotice(null), 4000);
    }
  };

  // Sync default world tag when user switches worlds
  useEffect(() => {
    if (!editingId) {
      setDraftWorldTag(activeWorld && activeWorld !== 'all' ? activeWorld : 'all');
    }
  }, [activeWorld, editingId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveStudyNotes(notes, window.localStorage);
    }
    onNotesChange?.(notes);
  }, [notes, onNotesChange]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveNoteLineAnnotations(lineAnnotations, window.localStorage);
    }
  }, [lineAnnotations]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveWeeklyStudyPlanner(weeklySchedule, window.localStorage);
    }
  }, [weeklySchedule]);

  const visibleNotes = useMemo(
    () => filterStudyNotes(notes, worldFilter, searchQuery, categoryFilter),
    [notes, worldFilter, searchQuery, categoryFilter]
  );

  const worldTagOptions = [
    { id: 'all', label: 'General / All Worlds' },
    ...WORLDS_METADATA.map((w) => ({
      id: w.id,
      label: `W${w.worldNumber}: ${w.shortTitle}`,
    })),
    { id: 'holidays', label: 'Holidays Hub' },
    { id: 'wages_matrix', label: '17 Regions Wages' },
  ];

  const getWorldBadgeLabel = (tag: string) => {
    const found = worldTagOptions.find((o) => o.id === tag);
    return found ? found.label : 'General';
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftContent.trim()) return;

    if (editingId) {
      setNotes((prev) =>
        updateStudyNote(prev, editingId, {
          title: draftTitle,
          content: draftContent,
          worldTag: draftWorldTag,
          categoryTag: draftCategoryTag,
        })
      );
      setEditingId(null);
      marioAudio.playPowerUp();
    } else {
      setNotes((prev) =>
        createStudyNote(prev, {
          title: draftTitle,
          content: draftContent,
          worldTag: draftWorldTag,
          categoryTag: draftCategoryTag,
        })
      );
      marioAudio.playCoin();
    }

    setDraftTitle('');
    setDraftContent('');
  };

  const handleStartEdit = (note: StudyNoteItem) => {
    setEditingId(note.id);
    setDraftTitle(note.title);
    setDraftContent(note.content);
    setDraftWorldTag(note.worldTag);
    setDraftCategoryTag(note.categoryTag || 'Quick Reference');
    marioAudio.playJump();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setDraftTitle('');
    setDraftContent('');
    marioAudio.playPipe();
  };

  const handleTogglePin = (note: StudyNoteItem) => {
    setNotes((prev) => updateStudyNote(prev, note.id, { pinned: !note.pinned }));
    marioAudio.playJump();
  };

  const handleDelete = (id: string) => {
    setNotes((prev) => deleteStudyNote(prev, id));
    if (editingId === id) {
      setEditingId(null);
      setDraftTitle('');
      setDraftContent('');
    }
    marioAudio.playStomp();
  };

  const handleQuickTemplate = (tpl: (typeof QUICK_MNEMONIC_TEMPLATES)[number]) => {
    setNotes((prev) =>
      createStudyNote(prev, {
        title: tpl.title,
        content: tpl.content,
        worldTag: tpl.worldTag,
        categoryTag: 'Quick Reference',
      })
    );
    marioAudio.playCoin();
  };

  const handleCopyNote = (note: StudyNoteItem) => {
    navigator.clipboard?.writeText(`${note.title}\n${note.content}`);
    setCopiedId(note.id);
    marioAudio.playCoin();
    setTimeout(() => setCopiedId(null), 1600);
  };

  const handleToggleHighlightLine = (noteId: string, lineIndex: number) => {
    setLineAnnotations((prev) => toggleNoteLineHighlight(prev, noteId, lineIndex));
    marioAudio.playCoin();
  };

  const handleToggleStarLine = (noteId: string, lineIndex: number) => {
    setLineAnnotations((prev) => toggleNoteLineStar(prev, noteId, lineIndex));
    marioAudio.playPowerUp();
  };

  const filteredPlannerModules = useMemo(() => {
    if (plannerWorldFilter === 'all') return ALL_LAW_TOPICS;
    return ALL_LAW_TOPICS.filter((t) => t.worldId === plannerWorldFilter);
  }, [plannerWorldFilter]);

  const handleAssignModuleToDay = (
    day: PlannerDayKey,
    topicId: string,
    fromDay?: PlannerDayKey
  ) => {
    const mod = ALL_LAW_TOPICS.find((t) => t.id === topicId);
    if (!mod) return;
    setWeeklySchedule((prev) =>
      assignModuleToPlannerDay(
        prev,
        day,
        {
          topicId: mod.id,
          title: mod.title,
          worldId: mod.worldId,
          badge: mod.badge,
        },
        fromDay
      )
    );
    marioAudio.playPowerUp();
  };

  const handleRemoveModuleFromDay = (day: PlannerDayKey, topicId: string) => {
    setWeeklySchedule((prev) => removeModuleFromPlannerDay(prev, day, topicId));
    marioAudio.playClick();
  };

  return (
    <>
      {/* Docked Right-Edge Study Notes Tab — Anchored Upper-Middle on Mobile to Clear Timer & Scroller */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          marioAudio.playPipe();
        }}
        data-testid="study-notes-trigger"
        aria-label={`Open Study Notes Drawer (${notes.length} saved notes)`}
        title="Open Study Notes Drawer — Jot down labor law notes"
        className="flex fixed right-0 top-[168px] bottom-auto sm:top-[46%] sm:-translate-y-1/2 z-30 bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-r-0 border-black rounded-l-2xl rounded-r-none px-1.5 py-2 sm:px-2 sm:py-3 shadow-[-3px_3px_0_#000] flex-col items-center gap-1 sm:gap-1.5 cursor-pointer transition-colors select-none print:hidden"
      >
        <NotebookPen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 shrink-0" />
        <span className="text-[8.5px] sm:text-[9px] font-black font-mario uppercase tracking-tighter leading-none [writing-mode:vertical-rl] rotate-180">
          NOTES
        </span>
        <span className="min-w-[18px] sm:min-w-[20px] h-4.5 sm:h-5 px-1 rounded-full bg-red-600 text-white text-[9.5px] sm:text-[10px] font-black inline-flex items-center justify-center border border-black leading-none tabular-nums">
          {notes.length}
        </span>
      </button>

      {/* Slide-Over Right Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/65 print:hidden">
          <div
            className="flex-1 cursor-pointer"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <aside
            role="dialog"
            aria-label="Study Notes Drawer"
            data-testid="study-notes-drawer"
            className="relative w-full max-w-md bg-[#1e293b] text-white border-l-2 border-slate-950 shadow-[-8px_0_30px_rgba(0,0,0,0.85)] h-[100dvh] flex flex-col overflow-hidden safe-top-nav safe-bottom-dock"
          >
            {/* Drawer Header */}
            <div className="bg-[#0f172a] p-4 border-b-2 border-slate-700 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-400 border-2 border-black flex items-center justify-center text-slate-950 shrink-0 shadow-[0_2px_0_#000]">
                  <NotebookPen className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
                    PERSISTENT MNEMONIC PAD
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-white font-display truncate">
                    STUDY NOTES ({notes.length})
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Study Notes Drawer"
                className="min-w-[44px] min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Tabs: Saved Notes vs. Weekly Study Planner */}
            <div className="bg-[#0b1220] px-4 py-2 border-b border-slate-700 grid grid-cols-2 gap-2 shrink-0">
              <button
                type="button"
                data-testid="drawer-tab-notes"
                onClick={() => {
                  setDrawerTab('notes');
                  marioAudio.playClick();
                }}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl font-black text-xs border-2 cursor-pointer inline-flex items-center justify-center gap-1.5 transition-colors ${
                  drawerTab === 'notes'
                    ? 'bg-amber-400 text-slate-950 border-black shadow-[0_2px_0_#000]'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <NotebookPen className="w-3.5 h-3.5 shrink-0" />
                <span>Saved Notes ({notes.length})</span>
              </button>
              <button
                type="button"
                data-testid="drawer-tab-planner"
                onClick={() => {
                  setDrawerTab('planner');
                  marioAudio.playClick();
                }}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl font-black text-xs border-2 cursor-pointer inline-flex items-center justify-center gap-1.5 transition-colors ${
                  drawerTab === 'planner'
                    ? 'bg-emerald-400 text-slate-950 border-black shadow-[0_2px_0_#000]'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>Study Planner (Mon-Sun)</span>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4">
              {drawerTab === 'planner' ? (
                <section data-testid="weekly-study-planner" className="space-y-4">
                  <div className="bg-slate-900 border-2 border-emerald-400/50 rounded-2xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase text-emerald-400 font-mario block">
                          DRAG &amp; DROP WEEKLY STUDY PLANNER
                        </span>
                        <p className="text-xs text-slate-300 font-semibold">
                          Drag any Labor Law module below onto Mon–Sun or use quick day assign.
                        </p>
                      </div>
                    </div>

                    <select
                      aria-label="Filter Planner Modules by World"
                      value={plannerWorldFilter}
                      onChange={(e) => setPlannerWorldFilter(e.target.value)}
                      className="w-full bg-slate-950 [color-scheme:dark] text-amber-300 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700"
                    >
                      <option value="all" className="bg-slate-950 text-white">
                        All Worlds ({ALL_LAW_TOPICS.length} Modules)
                      </option>
                      {WORLDS_METADATA.map((w) => (
                        <option key={w.id} value={w.id} className="bg-slate-950 text-white">
                          World {w.worldNumber}: {w.shortTitle}
                        </option>
                      ))}
                    </select>

                    {/* Draggable Module Palette */}
                    <div className="max-h-52 overflow-y-auto overscroll-contain space-y-1.5 pr-1">
                      {filteredPlannerModules.map((mod) => {
                        const chosenDay = selectedDayByTopic[mod.id] || 'Mon';
                        return (
                          <div
                            key={mod.id}
                            draggable
                            data-testid={`planner-draggable-module-${mod.id}`}
                            onDragStart={(e) => {
                              e.dataTransfer.setData(
                                'application/json',
                                JSON.stringify({ topicId: mod.id })
                              );
                            }}
                            className="bg-slate-950 hover:bg-slate-800/90 border border-slate-700 rounded-xl p-2 flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <GripVertical className="w-4 h-4 text-amber-400 shrink-0" />
                              <div className="min-w-0">
                                <span className="text-[10px] font-mono font-bold text-emerald-300 block">
                                  {mod.worldId.toUpperCase()} · {mod.badge}
                                </span>
                                <span className="text-xs font-black text-white block truncate">
                                  {mod.title}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <select
                                aria-label={`Select day for ${mod.title}`}
                                value={chosenDay}
                                onChange={(e) =>
                                  setSelectedDayByTopic((prev) => ({
                                    ...prev,
                                    [mod.id]: e.target.value as PlannerDayKey,
                                  }))
                                }
                                className="bg-slate-900 [color-scheme:dark] text-amber-200 text-[11px] font-bold px-1.5 py-1 rounded-lg border border-slate-700"
                              >
                                {PLANNER_DAYS.map((d) => (
                                  <option key={d} value={d} className="bg-slate-900 text-white">
                                    {d}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                data-testid={`planner-quick-add-${mod.id}`}
                                onClick={() => handleAssignModuleToDay(chosenDay, mod.id)}
                                className="px-2 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] border border-black cursor-pointer"
                              >
                                + Add
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mon - Sun Calendar Drop Targets */}
                  <div className="space-y-2.5">
                    {PLANNER_DAYS.map((day) => {
                      const items = weeklySchedule[day] || [];
                      const isOver = dragHoverDay === day;
                      return (
                        <div
                          key={day}
                          data-testid={`planner-day-${day}`}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (dragHoverDay !== day) setDragHoverDay(day);
                          }}
                          onDragLeave={() => {
                            if (dragHoverDay === day) setDragHoverDay(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragHoverDay(null);
                            try {
                              const raw = e.dataTransfer.getData('application/json');
                              if (!raw) return;
                              const parsed = JSON.parse(raw) as {
                                topicId?: string;
                                fromDay?: PlannerDayKey;
                              };
                              if (parsed.topicId) {
                                handleAssignModuleToDay(day, parsed.topicId, parsed.fromDay);
                              }
                            } catch {
                              // ignore invalid drop payload
                            }
                          }}
                          className={`rounded-2xl p-3 border-2 transition-colors space-y-2 ${
                            isOver
                              ? 'bg-emerald-950/70 border-emerald-400'
                              : 'bg-slate-900 border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-black text-xs uppercase font-mario text-amber-300">
                              {day}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 font-bold tabular-nums">
                              {items.length} {items.length === 1 ? 'module' : 'modules'}
                            </span>
                          </div>

                          {items.length === 0 ? (
                            <p className="text-[11px] text-slate-500 font-semibold italic">
                              Drop a Labor Law module here for {day}
                            </p>
                          ) : (
                            <div className="space-y-1.5">
                              {items.map((sched) => (
                                <div
                                  key={`${day}-${sched.topicId}`}
                                  draggable
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData(
                                      'application/json',
                                      JSON.stringify({
                                        topicId: sched.topicId,
                                        fromDay: day,
                                      })
                                    );
                                  }}
                                  className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 flex items-center justify-between gap-2 cursor-grab"
                                >
                                  <div className="min-w-0">
                                    <span className="text-[9px] font-mono text-amber-300 font-bold block">
                                      {sched.worldId.toUpperCase()} · {sched.badge}
                                    </span>
                                    <span className="text-xs font-extrabold text-white block truncate">
                                      {sched.title}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveModuleFromDay(day, sched.topicId)}
                                    aria-label={`Remove ${sched.title} from ${day}`}
                                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white text-[10px] font-black border border-slate-600 cursor-pointer shrink-0"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : (
                <>
              {/* Compose / Edit Form */}
              <form
                onSubmit={handleSaveNote}
                className="bg-slate-900 rounded-2xl p-3.5 border-2 border-slate-700 space-y-2.5"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
                    <span className="text-[10px] font-black uppercase text-amber-400 font-mario truncate">
                      {editingId ? 'EDIT STUDY NOTE' : 'NEW STUDY NOTE'}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <select
                        aria-label="Voice Note Dictation Language"
                        data-testid="voice-memo-lang-select"
                        value={voiceLang}
                        onChange={(e) => setVoiceLang(e.target.value)}
                        className="bg-slate-800 text-slate-200 text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-600 focus:outline-none focus:border-amber-400 cursor-pointer max-w-[150px] truncate"
                      >
                        {voiceLanguageOptions.map((opt) => (
                          <option key={opt.code || 'auto'} value={opt.code}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        data-testid="voice-memo-btn"
                        onClick={handleToggleVoiceMemo}
                        title={isListening ? 'Stop voice recording' : 'Dictate note using Voice Memo (All Languages)'}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                          isListening
                            ? 'bg-red-500/20 border-red-500 text-red-300 animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300'
                        }`}
                      >
                        {isListening ? (
                          <>
                            <MicOff className="w-3.5 h-3.5 text-red-400 animate-bounce shrink-0" />
                            <span className="text-[10px] uppercase font-mono font-bold">Stop Voice</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="text-[10px] uppercase font-mono font-bold">Voice Memo</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full min-w-0">
                    <select
                      aria-label="Note World Category"
                      data-testid="study-notes-world-select"
                      value={draftWorldTag}
                      onChange={(e) => setDraftWorldTag(e.target.value)}
                      className="w-full min-w-0 max-w-full truncate bg-slate-800 text-amber-300 text-xs font-bold px-3 py-2 rounded-xl border border-slate-600 focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      {worldTagOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    <select
                      aria-label="Note Study Tag"
                      data-testid="study-notes-category-tag-select"
                      value={draftCategoryTag}
                      onChange={(e) =>
                        setDraftCategoryTag(e.target.value as StudyNoteCategoryTag)
                      }
                      className="w-full min-w-0 max-w-full truncate bg-slate-800 text-emerald-300 text-xs font-bold px-3 py-2 rounded-xl border border-slate-600 focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      {STUDY_NOTE_CATEGORY_TAGS.map((tag) => (
                        <option key={tag} value={tag}>
                          Tag: {tag}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {speechNotice && (
                  <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] truncate">{speechNotice}</span>
                    <button
                      type="button"
                      onClick={() => setSpeechNotice(null)}
                      className="text-amber-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="Optional title (e.g., Art. 94 Successive Holidays)"
                  aria-label="Mnemonic Note Title"
                  className="w-full bg-slate-950 text-white placeholder-slate-500 text-xs sm:text-sm font-bold px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
                />

                <textarea
                  rows={3}
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  placeholder="Jot down a quick mnemonic, statutory exception, or multiplier rule..."
                  aria-label="Mnemonic Note Content"
                  required
                  className="w-full bg-slate-950 text-white placeholder-slate-500 text-xs sm:text-sm font-medium px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 resize-y"
                />

                <div className="flex items-center justify-between gap-2">
                  {editingId ? (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-600 cursor-pointer"
                    >
                      Cancel
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-semibold">
                      Auto-saved to browser storage
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={!draftContent.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-black text-xs font-mario border-2 border-black shadow-[0_2px_0_#000] active:translate-y-0.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>{editingId ? 'UPDATE' : 'SAVE NOTE'}</span>
                  </button>
                </div>
              </form>

              {/* Quick 1-Tap Mnemonic Starters */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-400 font-mario">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>1-TAP STUDY MNEMONIC STARTERS</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_MNEMONIC_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.label}
                      type="button"
                      onClick={() => handleQuickTemplate(tpl)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-200 border border-slate-600 text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      + {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="space-y-2 pt-2 border-t border-slate-700 min-w-0">
                <div className="flex flex-col sm:flex-row gap-2 min-w-0">
                  <div className="relative flex-1 min-w-0">
                    <Search className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter saved notes..."
                      aria-label="Search Study Notes"
                      className="w-full min-w-0 bg-slate-900 text-white placeholder-slate-500 text-xs font-semibold pl-8 pr-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <select
                    aria-label="Filter Notes by World"
                    value={worldFilter}
                    onChange={(e) => setWorldFilter(e.target.value)}
                    className="w-full sm:w-44 min-w-0 max-w-full truncate bg-slate-900 text-slate-200 text-xs font-bold px-2.5 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="all">All Worlds</option>
                    {worldTagOptions
                      .filter((o) => o.id !== 'all')
                      .map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Category Tag Filter Buttons */}
                <div
                  role="group"
                  aria-label="Filter Notes by Study Tag"
                  className="flex flex-wrap items-center gap-1.5"
                >
                  {(['all', ...STUDY_NOTE_CATEGORY_TAGS] as const).map((cat) => {
                    const active = categoryFilter === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        data-testid={`notes-filter-tag-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => {
                          setCategoryFilter(cat);
                          marioAudio.playClick();
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer transition-colors ${
                          active
                            ? 'bg-amber-400 text-slate-950 border-black font-black'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {cat === 'all' ? 'All Tags' : cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes List */}
              {visibleNotes.length === 0 ? (
                <div className="bg-slate-900/70 border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center space-y-2">
                  <NotebookPen className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-sm font-black text-white font-display">
                    {notes.length === 0 ? 'No study notes yet!' : 'No notes match your filter.'}
                  </p>
                  <p className="text-xs text-slate-400 font-semibold">
                    Write your own Labor Standards mnemonics above or tap a quick starter chip. Your notes stay available as you switch across all tabs!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {visibleNotes.map((note) => (
                    <article
                      key={note.id}
                      className={`rounded-2xl p-3.5 border-2 transition-all space-y-2 ${
                        note.pinned
                          ? 'bg-amber-950/35 border-amber-400'
                          : 'bg-slate-900 border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1 text-[11px] text-slate-300 font-bold">
                            <span className="text-amber-300">
                              {getWorldBadgeLabel(note.worldTag)}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-300">
                              {note.categoryTag || 'Quick Reference'}
                            </span>
                            {note.pinned && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-amber-200 font-black">Pinned</span>
                              </>
                            )}
                          </div>
                          <h3 className="font-black text-sm text-white font-display break-words">
                            {note.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleTogglePin(note)}
                            aria-label={note.pinned ? `Unpin ${note.title}` : `Pin ${note.title}`}
                            title={note.pinned ? 'Unpin note' : 'Pin to top'}
                            className={`p-1.5 rounded-lg border cursor-pointer ${
                              note.pinned
                                ? 'bg-amber-400 text-slate-950 border-black'
                                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-600'
                            }`}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyNote(note)}
                            aria-label={`Copy ${note.title}`}
                            title="Copy note"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 cursor-pointer"
                          >
                            {copiedId === note.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(note)}
                            aria-label={`Edit ${note.title}`}
                            title="Edit note"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(note.id)}
                            aria-label={`Delete ${note.title}`}
                            title="Delete note"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        {note.content.split('\n').map((line, lineIdx) => {
                          const ann = lineAnnotations[note.id];
                          const isHighlighted = ann?.highlightedLines?.includes(lineIdx) ?? false;
                          const isStarred = ann?.starredLines?.includes(lineIdx) ?? false;
                          return (
                            <div
                              key={`${note.id}-line-${lineIdx}`}
                              data-testid={`note-line-${note.id}-${lineIdx}`}
                              className={`flex items-start justify-between gap-2 rounded-xl px-2 py-1 transition-colors ${
                                isStarred
                                  ? 'bg-amber-950/60 border-l-3 border-amber-400 pl-2'
                                  : ''
                              }`}
                            >
                              <p
                                className={`text-xs sm:text-sm font-medium whitespace-pre-wrap leading-relaxed break-words flex-1 min-w-0 ${
                                  isHighlighted
                                    ? 'bg-yellow-200 text-slate-950 font-bold px-1.5 py-0.5 rounded'
                                    : 'text-slate-200'
                                }`}
                              >
                                {isStarred && (
                                  <Star
                                    aria-label="Starred line"
                                    className="w-3.5 h-3.5 text-amber-400 fill-amber-400 inline-block mr-1.5 -mt-0.5"
                                  />
                                )}
                                {line || '\u00A0'}
                              </p>
                              <div className="inline-flex items-center gap-1 shrink-0 pt-0.5">
                                <button
                                  type="button"
                                  data-testid={`highlight-line-${note.id}-${lineIdx}`}
                                  aria-label={`Highlight line ${lineIdx + 1}`}
                                  aria-pressed={isHighlighted}
                                  title={isHighlighted ? 'Remove yellow highlight' : 'Highlight line in yellow'}
                                  onClick={() => handleToggleHighlightLine(note.id, lineIdx)}
                                  className={`p-1 rounded border text-[10px] cursor-pointer transition-colors ${
                                    isHighlighted
                                      ? 'bg-yellow-300 text-slate-950 border-black'
                                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'
                                  }`}
                                >
                                  <Highlighter className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  data-testid={`star-line-${note.id}-${lineIdx}`}
                                  aria-label={`Star line ${lineIdx + 1}`}
                                  aria-pressed={isStarred}
                                  title={isStarred ? 'Unstar line' : 'Star important line'}
                                  onClick={() => handleToggleStarLine(note.id, lineIdx)}
                                  className={`p-1 rounded border text-[10px] cursor-pointer transition-colors ${
                                    isStarred
                                      ? 'bg-amber-400 text-slate-950 border-black'
                                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'
                                  }`}
                                >
                                  <Star className={`w-3 h-3 ${isStarred ? 'fill-current' : ''}`} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </article>
                  ))}
                </div>
              )}
                </>
              )}
            </div>

            {/* Footer Tip */}
            <div className="bg-[#0f172a] px-4 py-2.5 border-t border-slate-700 text-[11px] text-slate-400 font-semibold flex items-center justify-between shrink-0">
              <span>Included optionally in Print Study Guide</span>
              <span className="text-amber-300 font-bold">localStorage Synced</span>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
