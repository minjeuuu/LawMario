import { useEffect, useRef } from 'react';
import { marioAudio } from './audio';

export interface MarioSoundEffectEvents {
  topicCompleted?: boolean;
  isWorldCleared?: boolean;
  streakDays?: number;
  isQuizTimeout?: boolean;
  isExamModeStarted?: boolean;
  isPowerUpActive?: boolean;
}

/**
 * Hook that listens to key app events and triggers short, iconic Mario sound effect audio clips:
 * - Topic completed: Coin or Level Up fanfare if world cleared
 * - Streak milestone (every 5 days): 1-Up chime + Level Up
 * - Quiz Timeout: Warning buzzer + Power Down
 * - Power-up / Exam Mode: Star invincibility / Power-Up fanfare
 */
export function useMarioSoundEffects(events: MarioSoundEffectEvents) {
  const prevEventsRef = useRef<MarioSoundEffectEvents>({});

  useEffect(() => {
    const prev = prevEventsRef.current;

    // 1. Topic completed event
    if (events.topicCompleted && !prev.topicCompleted) {
      if (events.isWorldCleared) {
        marioAudio.playLevelUp();
      } else {
        marioAudio.playCoin();
      }
    }

    // 2. Streak milestone reached (every 5 days: 5, 10, 15, 20, 25, 30)
    if (
      events.streakDays !== undefined &&
      events.streakDays > 0 &&
      events.streakDays !== prev.streakDays &&
      events.streakDays % 5 === 0
    ) {
      marioAudio.playOneUp();
      setTimeout(() => {
        marioAudio.playLevelUp();
      }, 350);
    }

    // 3. Quiz timeout / time ran out
    if (events.isQuizTimeout && !prev.isQuizTimeout) {
      marioAudio.playQuizTimeout();
    }

    // 4. Exam mode started
    if (events.isExamModeStarted && !prev.isExamModeStarted) {
      marioAudio.playPowerUp();
    }

    prevEventsRef.current = { ...events };
  }, [
    events.topicCompleted,
    events.isWorldCleared,
    events.streakDays,
    events.isQuizTimeout,
    events.isExamModeStarted,
    events.isPowerUpActive,
  ]);
}
