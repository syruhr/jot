import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerState, todayStr } from '../utils/storage';
import { playDing } from '../utils/sounds';

export function useTimer(
  initial: TimerState | undefined,
  settings: { workDuration: number; breakDuration: number; soundEnabled: boolean } | undefined,
  onUpdate: (timer: TimerState) => void
) {
  const [timer, setTimer] = useState<TimerState>(
    initial || { mode: 'work', duration: 25 * 60, remaining: 25 * 60, running: false, sessionsToday: 0, lastSessionDate: '' }
  );
  const intervalRef = useRef<number | null>(null);
  const timerRef = useRef(timer);
  timerRef.current = timer;

  useEffect(() => {
    if (initial) {
      const today = todayStr();
      setTimer({
        ...initial,
        sessionsToday: initial.lastSessionDate === today ? initial.sessionsToday : 0,
      });
    }
  }, [initial]);

  useEffect(() => {
    if (timer.running) {
      intervalRef.current = window.setInterval(() => {
        setTimer((prev) => {
          if (prev.remaining <= 1) {
            // Timer done
            if (settings?.soundEnabled) playDing();
            if (typeof chrome !== 'undefined' && chrome.notifications) {
              chrome.notifications.create({ type: 'basic', iconUrl: '/icons/icon128.png', title: 'Jot Timer', message: prev.mode === 'work' ? 'Break time! 🎉' : 'Back to work! 💪' });
            }
            const today = todayStr();
            const newSessions = prev.mode === 'work' ? prev.sessionsToday + 1 : prev.sessionsToday;
            const nextMode = prev.mode === 'work' ? 'break' : 'work';
            const dur = nextMode === 'work' ? (settings?.workDuration || 25) * 60 : (settings?.breakDuration || 5) * 60;
            const next: TimerState = { mode: nextMode as 'work' | 'break', duration: dur, remaining: dur, running: false, sessionsToday: newSessions, lastSessionDate: today };
            onUpdate(next);
            return next;
          }
          const next = { ...prev, remaining: prev.remaining - 1 };
          return next;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timer.running, settings]);

  const toggle = useCallback(() => {
    setTimer((prev) => {
      const next = { ...prev, running: !prev.running };
      onUpdate(next);
      return next;
    });
  }, [onUpdate]);

  const reset = useCallback(() => {
    const dur = timer.mode === 'work' ? (settings?.workDuration || 25) * 60 : (settings?.breakDuration || 5) * 60;
    const next: TimerState = { ...timer, remaining: dur, duration: dur, running: false };
    setTimer(next);
    onUpdate(next);
  }, [timer.mode, settings, onUpdate]);

  const switchMode = useCallback((mode: 'work' | 'break') => {
    const dur = mode === 'work' ? (settings?.workDuration || 25) * 60 : (settings?.breakDuration || 5) * 60;
    const next: TimerState = { ...timer, mode, duration: dur, remaining: dur, running: false };
    setTimer(next);
    onUpdate(next);
  }, [settings, timer, onUpdate]);

  const setDuration = useCallback((minutes: number) => {
    const dur = minutes * 60;
    const next: TimerState = { ...timer, duration: dur, remaining: dur, running: false };
    setTimer(next);
    onUpdate(next);
  }, [timer, onUpdate]);

  return { timer, toggle, reset, switchMode, setDuration };
}
