with open('src/components/UserProfileModal.tsx', 'r') as f:
    content = f.read()

# 1. Update Lucide imports
import_target = '''import {
  X,
  Trophy,'''

import_repl = '''import {
  X,
  Trophy,
  Calendar,
  ChevronLeft,
  ChevronRight,'''

assert import_target in content, 'import_target not found'
content = content.replace(import_target, import_repl, 1)

# 2. Add calendar state in component
state_target = '''  const [dailyGoalTarget, setDailyGoalTarget] = useState<number>(() => readStoredDailyStudyGoal());
  const goalStatus = computeDailyStudyGoalStatus(stats, dailyGoalTarget);'''

state_repl = '''  const [dailyGoalTarget, setDailyGoalTarget] = useState<number>(() => readStoredDailyStudyGoal());
  const goalStatus = computeDailyStudyGoalStatus(stats, dailyGoalTarget);

  // Monthly Calendar & Streak Heatmap State
  const [calendarViewDate, setCalendarViewDate] = useState(() => new Date());
  const calYear = calendarViewDate.getFullYear();
  const calMonth = calendarViewDate.getMonth();
  const monthName = calendarViewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const daysInCurrentMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay(); // 0 is Sunday

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Calculate streak dates set (spanning loginStreak days back from today)
  const streakDatesSet = React.useMemo(() => {
    const set = new Set<string>();
    const count = Math.max(1, loginStreak);
    for (let i = 0; i < count; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      set.add(str);
    }
    return set;
  }, [loginStreak, todayStr]);

  // Compute days studied in this month
  const monthlyDaysStudied = React.useMemo(() => {
    let count = 0;
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dayStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const sessions = stats.dailyPomodoroLogs?.[dayStr]?.sessions || 0;
      if (sessions > 0 || (streakDatesSet.has(dayStr) && new Date(calYear, calMonth, day) <= today)) {
        count++;
      }
    }
    return count;
  }, [calYear, calMonth, daysInCurrentMonth, stats.dailyPomodoroLogs, streakDatesSet]);'''

assert state_target in content, 'state_target not found'
content = content.replace(state_target, state_repl, 1)

# 3. Add Monthly Calendar section right after Section 2
calendar_section = '''          {/* Section 2B: Monthly Study Calendar & Streak Heatmap */}
          <div
            data-testid="monthly-study-calendar-section"
            className="bg-slate-900 rounded-2xl p-4 sm:p-5 border-2 border-slate-700 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 border-2 border-black flex items-center justify-center text-slate-950 shadow-[0_2px_0_#000] shrink-0">
                  <Calendar className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-400 font-mario block">
                    DAILY ENGAGEMENT HEATMAP
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white font-display">
                    MONTHLY STUDY CALENDAR &amp; STREAK
                  </h3>
                </div>
              </div>

              {/* Month Navigation Controls & Stats */}
              <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
                <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-slate-700 text-xs">
                  <span className="text-slate-400 font-medium">Days Active:</span>
                  <strong className="text-emerald-400 font-bold font-mono">{monthlyDaysStudied} / {daysInCurrentMonth}</strong>
                  <span className="text-slate-600">|</span>
                  <span className="text-amber-400 font-bold font-mono flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    {loginStreak} Day Streak
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Previous Month"
                    onClick={() => {
                      setCalendarViewDate(new Date(calYear, calMonth - 1, 1));
                      marioAudio.playJump();
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-black uppercase text-amber-300 font-mario px-2 min-w-[120px] text-center">
                    {monthName}
                  </span>
                  <button
                    type="button"
                    aria-label="Next Month"
                    onClick={() => {
                      setCalendarViewDate(new Date(calYear, calMonth + 1, 1));
                      marioAudio.playJump();
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-2">
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-[10px] sm:text-xs font-black text-slate-400 uppercase font-mono">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="py-1">{d}</div>
                ))}
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {/* Empty offset placeholders */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`offset-${i}`} className="aspect-square rounded-xl bg-slate-950/30 border border-slate-800/40 opacity-20" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayDate = new Date(calYear, calMonth, dayNum);
                  const dayStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isDayToday = dayStr === todayStr;
                  const isFuture = dayDate > today;
                  const logRecord = stats.dailyPomodoroLogs?.[dayStr];
                  const sessionCount = logRecord?.sessions || 0;
                  const minutesStudied = logRecord?.minutes || (sessionCount * 25);
                  const isStreakDay = streakDatesSet.has(dayStr) && !isFuture;
                  const hasActivity = sessionCount > 0 || isStreakDay;

                  // Determine heatmap styling
                  let cellBg = 'bg-slate-950/60 border-slate-800 text-slate-500';
                  if (hasActivity) {
                    if (sessionCount >= 3) {
                      cellBg = 'bg-amber-400 border-amber-300 text-slate-950 font-black shadow-[0_2px_4px_rgba(251,191,36,0.3)]';
                    } else if (sessionCount >= 2) {
                      cellBg = 'bg-emerald-500 border-emerald-400 text-slate-950 font-extrabold';
                    } else {
                      cellBg = 'bg-emerald-600/70 border-emerald-500/80 text-emerald-100 font-bold';
                    }
                  } else if (isFuture) {
                    cellBg = 'bg-slate-950/30 border-slate-900 text-slate-700';
                  }

                  return (
                    <div
                      key={`day-${dayNum}`}
                      title={`${dayStr}: ${hasActivity ? (sessionCount ? `${sessionCount} study blocks (${minutesStudied}m)` : 'Active streak day') : isFuture ? 'Upcoming day' : 'No study logged'}`}
                      className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center p-1 transition-all select-none ${cellBg} ${
                        isDayToday ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900' : ''
                      }`}
                    >
                      <span className={`text-[11px] sm:text-xs leading-none ${hasActivity && sessionCount >= 2 ? 'font-black' : 'font-semibold'}`}>
                        {dayNum}
                      </span>
                      {hasActivity && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {sessionCount >= 3 ? (
                            <span className="text-[9px] font-mono leading-none">3+</span>
                          ) : (
                            <div className={`w-1.5 h-1.5 rounded-full ${sessionCount >= 2 ? 'bg-slate-950' : 'bg-emerald-300'}`} />
                          )}
                        </div>
                      )}
                      {isDayToday && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Heatmap Legend */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[10px] sm:text-xs text-slate-400">
              <span className="font-medium">Daily Study Frequency &amp; Pomodoro Intensity</span>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-slate-950 border border-slate-800" />
                  <span>0 Sessions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-emerald-600/70 border border-emerald-500" />
                  <span>1 Session</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-emerald-500 border border-emerald-400" />
                  <span>2 Sessions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-amber-400 border border-amber-300" />
                  <span>3+ Sessions</span>
                </div>
              </div>
            </div>
          </div>
'''

sec2_end = '              </ResponsiveContainer>\n            </div>\n          </div>'
assert sec2_end in content, 'sec2_end not found'
content = content.replace(sec2_end, sec2_end + '\n\n' + calendar_section, 1)

with open('src/components/UserProfileModal.tsx', 'w') as f:
    f.write(content)
print('UserProfileModal updated successfully with Monthly Calendar & Heatmap')
