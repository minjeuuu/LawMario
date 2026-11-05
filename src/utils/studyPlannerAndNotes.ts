// Pure, deterministic state helpers for Note Line Highlighting & Starring + Weekly Study Planner (Mon-Sun)
import { StorageLike } from './round11Features';

export const NOTE_LINE_ANNOTATIONS_KEY = 'mario_note_line_annotations_v1';
export const WEEKLY_STUDY_PLANNER_KEY = 'mario_weekly_study_planner_v1';

export type PlannerDayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export const PLANNER_DAYS: readonly PlannerDayKey[] = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun',
];

export interface NoteLineAnnotation {
  highlightedLines: number[];
  starredLines: number[];
}

export type NoteLineAnnotationsMap = Record<string, NoteLineAnnotation>;

export interface PlannerScheduledModule {
  topicId: string;
  title: string;
  worldId: string;
  badge: string;
  addedAtIso: string;
}

export type WeeklyStudyPlannerSchedule = Record<PlannerDayKey, PlannerScheduledModule[]>;

export function loadNoteLineAnnotations(storage?: StorageLike): NoteLineAnnotationsMap {
  if (!storage) return {};
  try {
    const raw = storage.getItem(NOTE_LINE_ANNOTATIONS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as NoteLineAnnotationsMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveNoteLineAnnotations(
  map: NoteLineAnnotationsMap,
  storage?: StorageLike
): void {
  if (!storage) return;
  try {
    storage.setItem(NOTE_LINE_ANNOTATIONS_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function toggleNoteLineHighlight(
  map: NoteLineAnnotationsMap,
  noteId: string,
  lineIndex: number
): NoteLineAnnotationsMap {
  const existing = map[noteId] || { highlightedLines: [], starredLines: [] };
  const has = existing.highlightedLines.includes(lineIndex);
  const nextHighlighted = has
    ? existing.highlightedLines.filter((i) => i !== lineIndex)
    : [...existing.highlightedLines, lineIndex].sort((a, b) => a - b);
  return {
    ...map,
    [noteId]: {
      highlightedLines: nextHighlighted,
      starredLines: existing.starredLines,
    },
  };
}

export function toggleNoteLineStar(
  map: NoteLineAnnotationsMap,
  noteId: string,
  lineIndex: number
): NoteLineAnnotationsMap {
  const existing = map[noteId] || { highlightedLines: [], starredLines: [] };
  const has = existing.starredLines.includes(lineIndex);
  const nextStarred = has
    ? existing.starredLines.filter((i) => i !== lineIndex)
    : [...existing.starredLines, lineIndex].sort((a, b) => a - b);
  return {
    ...map,
    [noteId]: {
      highlightedLines: existing.highlightedLines,
      starredLines: nextStarred,
    },
  };
}

export function createEmptyWeeklySchedule(): WeeklyStudyPlannerSchedule {
  return {
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: [],
    Sat: [],
    Sun: [],
  };
}

export function loadWeeklyStudyPlanner(storage?: StorageLike): WeeklyStudyPlannerSchedule {
  const base = createEmptyWeeklySchedule();
  if (!storage) return base;
  try {
    const raw = storage.getItem(WEEKLY_STUDY_PLANNER_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<WeeklyStudyPlannerSchedule>;
    for (const day of PLANNER_DAYS) {
      if (Array.isArray(parsed?.[day])) {
        base[day] = parsed[day] as PlannerScheduledModule[];
      }
    }
    return base;
  } catch {
    return base;
  }
}

export function saveWeeklyStudyPlanner(
  schedule: WeeklyStudyPlannerSchedule,
  storage?: StorageLike
): void {
  if (!storage) return;
  try {
    storage.setItem(WEEKLY_STUDY_PLANNER_KEY, JSON.stringify(schedule));
  } catch {
    // ignore
  }
}

export function assignModuleToPlannerDay(
  schedule: WeeklyStudyPlannerSchedule,
  day: PlannerDayKey,
  mod: Omit<PlannerScheduledModule, 'addedAtIso'>,
  fromDay?: PlannerDayKey
): WeeklyStudyPlannerSchedule {
  const next: WeeklyStudyPlannerSchedule = {
    Mon: [...schedule.Mon],
    Tue: [...schedule.Tue],
    Wed: [...schedule.Wed],
    Thu: [...schedule.Thu],
    Fri: [...schedule.Fri],
    Sat: [...schedule.Sat],
    Sun: [...schedule.Sun],
  };

  if (fromDay && PLANNER_DAYS.includes(fromDay)) {
    next[fromDay] = next[fromDay].filter((item) => item.topicId !== mod.topicId);
  }

  const alreadyOnDay = next[day].some((item) => item.topicId === mod.topicId);
  if (!alreadyOnDay) {
    next[day] = [
      ...next[day],
      {
        ...mod,
        addedAtIso: new Date().toISOString(),
      },
    ];
  }
  return next;
}

export function removeModuleFromPlannerDay(
  schedule: WeeklyStudyPlannerSchedule,
  day: PlannerDayKey,
  topicId: string
): WeeklyStudyPlannerSchedule {
  return {
    ...schedule,
    [day]: schedule[day].filter((item) => item.topicId !== topicId),
  };
}
