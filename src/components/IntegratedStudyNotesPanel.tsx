import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  NotebookPen,
  Plus,
  Trash2,
  Pin,
  Search,
  Check,
  Pencil,
  Copy,
  Mic,
  MicOff,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import {
  StudyNoteItem,
  loadStudyNotes,
  saveStudyNotes,
  createStudyNote,
  updateStudyNote,
  deleteStudyNote,
  filterStudyNotes,
} from '../utils/engagementFeatures';
import { WORLDS_METADATA } from '../data/laborLawData';
import { marioAudio } from '../utils/audio';

interface IntegratedStudyNotesPanelProps {
  activeWorld: string;
  onNotesChange?: (notes: StudyNoteItem[]) => void;
  onCloseSplitView?: () => void;
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

export const IntegratedStudyNotesPanel: React.FC<IntegratedStudyNotesPanelProps> = ({
  activeWorld,
  onNotesChange,
  onCloseSplitView,
}) => {
  const [notes, setNotes] = useState<StudyNoteItem[]>(() =>
    typeof window !== 'undefined' ? loadStudyNotes(window.localStorage) : []
  );

  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftWorldTag, setDraftWorldTag] = useState<string>('all');
  const [worldFilter, setWorldFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Voice Memo / SpeechRecognition state
  const [isListening, setIsListening] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

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
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setSpeechNotice('Listening... speak clearly to transcribe into note');
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

  const visibleNotes = useMemo(
    () => filterStudyNotes(notes, worldFilter, searchQuery),
    [notes, worldFilter, searchQuery]
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
        })
      );
      marioAudio.playCoin();
    }

    setDraftTitle('');
    setDraftContent('');
  };

  const handleEdit = (item: StudyNoteItem) => {
    setEditingId(item.id);
    setDraftTitle(item.title);
    setDraftContent(item.content);
    setDraftWorldTag(item.worldTag);
    marioAudio.playClick();
  };

  const handleDelete = (id: string) => {
    setNotes((prev) => deleteStudyNote(prev, id));
    if (editingId === id) {
      setEditingId(null);
      setDraftTitle('');
      setDraftContent('');
    }
    marioAudio.playPipe();
  };

  const handleTogglePin = (id: string) => {
    const target = notes.find((n) => n.id === id);
    if (!target) return;
    setNotes((prev) => updateStudyNote(prev, id, { pinned: !target.pinned }));
    marioAudio.playClick();
  };

  const handleCopyNote = (item: StudyNoteItem) => {
    const text = `${item.title}\n\n${item.content}\n\n[World: ${getWorldBadgeLabel(item.worldTag)}]`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    marioAudio.playCoin();
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      data-testid="integrated-study-notes-panel"
      className="bg-slate-900 border-4 border-slate-950 rounded-3xl p-4 sm:p-5 shadow-[6px_6px_0_#000] text-white flex flex-col gap-4 max-h-[calc(100vh-5rem)] sticky top-20 overflow-y-auto no-scrollbar"
    >
      {/* Header Strip */}
      <div className="flex items-center justify-between border-b-2 border-slate-700 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 border border-black shadow-[0_2px_0_#000]">
            <NotebookPen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-amber-400 font-mario">
                SPLIT VIEW
              </span>
              <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded font-mario">
                LIVE
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white font-display">
              Integrated Study Notes ({notes.length})
            </h3>
          </div>
        </div>

        {onCloseSplitView && (
          <button
            type="button"
            onClick={onCloseSplitView}
            className="text-xs font-black px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 cursor-pointer"
          >
            Full View
          </button>
        )}
      </div>

      {/* Voice Memo Notice banner */}
      {speechNotice && (
        <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 shrink-0 text-red-600" />
          <span className="truncate">{speechNotice}</span>
        </div>
      )}

      {/* Quick Mnemonic Shortcuts */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-black uppercase text-slate-400 font-mario block">
          INSERT STUDY MNEMONIC PRESET:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_MNEMONIC_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.label}
              type="button"
              onClick={() => {
                setDraftTitle(tmpl.title);
                setDraftContent(tmpl.content);
                setDraftWorldTag(tmpl.worldTag);
                marioAudio.playCoin();
              }}
              className="text-[10.5px] font-bold px-2 py-1 rounded-lg bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              + {tmpl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Drafting Box */}
      <form onSubmit={handleSaveNote} className="space-y-2.5 bg-slate-950/80 p-3 rounded-2xl border-2 border-slate-700">
        <div className="flex items-center justify-between gap-2">
          <input
            type="text"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="Note headline / mnemonic title..."
            className="w-full text-xs font-black bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />

          {/* Voice Memo Button */}
          <button
            type="button"
            onClick={handleToggleVoiceMemo}
            title={isListening ? 'Stop voice recording' : 'Dictate note via microphone'}
            className={`min-h-[36px] min-w-[36px] px-2 rounded-xl border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
              isListening
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-600'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-amber-400" />}
          </button>
        </div>

        <textarea
          rows={3}
          value={draftContent}
          onChange={(e) => setDraftContent(e.target.value)}
          placeholder="Jot down legal rules, exceptions, bar formulas while reading the topic card on the left..."
          className="w-full text-xs font-medium bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-y"
        />

        <div className="flex flex-col gap-2 min-w-0">
          <select
            aria-label="Split Note World Category"
            data-testid="integrated-notes-world-select"
            value={draftWorldTag}
            onChange={(e) => setDraftWorldTag(e.target.value)}
            className="w-full min-w-0 max-w-full truncate text-[11px] font-bold bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-amber-300 cursor-pointer focus:outline-none focus:border-amber-400"
          >
            {worldTagOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="flex items-center justify-end gap-1.5">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setDraftTitle('');
                  setDraftContent('');
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!draftContent.trim()}
              className="text-xs font-black px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 rounded-xl border border-black shadow-[0_2px_0_#000] cursor-pointer inline-flex items-center gap-1 leading-none whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>{editingId ? 'Update' : 'Save Note'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0">
        <div className="relative flex-1 min-w-0">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter saved notes..."
            className="w-full min-w-0 text-xs bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-2.5 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>
        <select
          aria-label="Filter Split Notes by World"
          value={worldFilter}
          onChange={(e) => setWorldFilter(e.target.value)}
          className="w-full sm:w-36 min-w-0 max-w-full truncate text-xs font-bold bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-300 cursor-pointer"
        >
          <option value="all">All Tags</option>
          {WORLDS_METADATA.map((w) => (
            <option key={w.id} value={w.id}>
              W{w.worldNumber}
            </option>
          ))}
        </select>
      </div>

      {/* Saved Notes Feed */}
      <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
        {visibleNotes.length === 0 ? (
          <div className="text-center py-6 text-slate-500 space-y-1">
            <BookOpen className="w-7 h-7 mx-auto opacity-50" />
            <p className="text-xs font-bold">No notes recorded yet</p>
            <p className="text-[11px]">Type or dictate thoughts while studying!</p>
          </div>
        ) : (
          visibleNotes.map((note) => (
            <div
              key={note.id}
              className={`p-3 rounded-2xl border-2 transition-all space-y-1.5 ${
                note.pinned
                  ? 'bg-amber-950/40 border-amber-400/80 shadow-[0_2px_8px_rgba(251,191,36,0.15)]'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {note.pinned && <Pin className="w-3 h-3 text-amber-400 shrink-0 fill-current" />}
                    <h4 className="text-xs font-black text-white truncate font-display">
                      {note.title}
                    </h4>
                  </div>
                  <span className="text-[9.5px] font-mono text-amber-400 uppercase">
                    {getWorldBadgeLabel(note.worldTag)}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleTogglePin(note.id)}
                    title={note.pinned ? 'Unpin' : 'Pin note'}
                    className={`p-1 rounded-md cursor-pointer ${
                      note.pinned ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Pin className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyNote(note)}
                    title="Copy note"
                    className="p-1 rounded-md text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {copiedId === note.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(note)}
                    title="Edit note"
                    className="p-1 rounded-md text-slate-500 hover:text-amber-300 cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(note.id)}
                    title="Delete note"
                    className="p-1 rounded-md text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                {note.content}
              </p>

              <span className="text-[9px] font-mono text-slate-500 block pt-1">
                Updated {new Date(note.updatedAt).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
