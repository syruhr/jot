import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerState, todayStr } from '../utils/storage';
import { playDing } from '../utils/sounds';

const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.runtime;

function sendMsg(msg: any) {
  if (isExtension && chrome.runtime?.sendMessage) {
    chrome.runtime.sendMessage(msg).catch(() => {});
  }
}

export function useTimer(
  initial: TimerState | undefined,
  settings: { workDuration: number; breakDuration: number; soundEnabled: boolean } | undefined,
  onUpdate: (timer: TimerState) => void
) {
  const [timer, setTimer] = useState<TimerState>(
    initial || { mode: 'work', duration: 25 * 60, remaining: 25 * 60, running: false, sessionsToday: 0, lastSessionDate: '' }
  );
  const intervalRef = useRef<number | null>(null);

  // Sync from storage when popup opens
  useEffect(() => {
    if (initial) {
      const today = todayStr();

      if (isExtension && initial.running) {
        // Timer is running in background — read endTime to calculate true remaining
        chrome.storage.local.get(['timerEndTime'], (data) => {
          const endTime = data.timerEndTime;
          if (endTime) {
            const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
            if (remaining <= 0) {
              // Timer already finished while popup was closed
              // Background worker should have handled this, just sync
              setTimer(initial);
            } else {
              setTimer({
                ...initial,
                remaining,
                sessionsToday: initial.lastSessionDate === today ? initial.sessionsToday : 0,
              });
            }
          } else {
            setTimer({
              ...initial,
              sessionsToday: initial.lastSessionDate === today ? initial.sessionsToday : 0,
            });
          }
        });
      } else {
        setTimer({
          ...initial,
          sessionsToday: initial.lastSessionDate === today ? initial.sessionsToday : 0,
        });
      }
    }
  }, [initial]);

  // Live countdown in popup (visual smoothness — updates every second)
  useEffect(() => {
    if (timer.running) {
      if (isExtension) {
        // Poll from endTime for accurate display
        intervalRef.current = window.setInterval(() => {
          chrome.storage.local.get(['timerEndTime', 'timer'], (data) => {
            if (data.timerEndTime) {
              const remaining = Math.max(0, Math.round((data.timerEndTime - Date.now()) / 1000));
              setTimer(prev => {
                if (!prev.running) return prev; // was stopped
                if (remaining <= 0) {
                  // Timer done — background handles state change, just read it
                  if (data.timer && !data.timer.running) {
                    if (settings?.soundEnabled) playDing();
                    return data.timer;
                  }
                }
                return { ...prev, remaining };
              });
            } else if (data.timer && !data.timer.running) {
              // Timer was stopped/completed by background
              if (settings?.soundEnabled) playDing();
              setTimer(data.timer);
            }
          });
        }, 1000);
      } else {
        // Dev mode — local interval
        intervalRef.current = window.setInterval(() => {
          setTimer((prev) => {
            if (prev.remaining <= 1) {
              if (settings?.soundEnabled) playDing();
              const today = todayStr();
              const newSessions = prev.mode === 'work' ? prev.sessionsToday + 1 : prev.sessionsToday;
              const nextMode = prev.mode === 'work' ? 'break' : 'work';
              const dur = nextMode === 'work' ? (settings?.workDuration || 25) * 60 : (settings?.breakDuration || 5) * 60;
              const next: TimerState = { mode: nextMode as 'work' | 'break', duration: dur, remaining: dur, running: false, sessionsToday: newSessions, lastSessionDate: today };
              onUpdate(next);
              return next;
            }
            return { ...prev, remaining: prev.remaining - 1 };
          });
        }, 1000);
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timer.running, settings]);

  const toggle = useCallback(() => {
    setTimer((prev) => {
      const next = { ...prev, running: !prev.running };
      if (next.running) {
        const endTime = Date.now() + next.remaining * 1000;
        if (isExtension) {
          chrome.storage.local.set({ timer: next, timerEndTime: endTime });
          sendMsg({ type: 'timer-start', endTime });
        }
      } else {
        if (isExtension) {
          chrome.storage.local.set({ timer: next, timerEndTime: null });
          sendMsg({ type: 'timer-stop' });
        }
      }
      onUpdate(next);
      return next;
    });
  }, [onUpdate]);

  const reset = useCallback(() => {
    const dur = timer.mode === 'work' ? (settings?.workDuration || 25) * 60 : (settings?.breakDuration || 5) * 60;
    const next: TimerState = { ...timer, remaining: dur, duration: dur, running: false };
    setTimer(next);
    onUpdate(next);
    if (isExtension) {
      chrome.storage.local.set({ timer: next, timerEndTime: null });
      sendMsg({ type: 'timer-stop' });
    }
  }, [timer.mode, settings, onUpdate]);

  const switchMode = useCallback((mode: 'work' | 'break') => {
    const dur = mode === 'work' ? (settings?.workDuration || 25) * 60 : (settings?.breakDuration || 5) * 60;
    const next: TimerState = { ...timer, mode, duration: dur, remaining: dur, running: false };
    setTimer(next);
    onUpdate(next);
    if (isExtension) {
      chrome.storage.local.set({ timer: next, timerEndTime: null });
      sendMsg({ type: 'timer-stop' });
    }
  }, [settings, timer, onUpdate]);

  const setDuration = useCallback((minutes: number) => {
    const dur = minutes * 60;
    const next: TimerState = { ...timer, duration: dur, remaining: dur, running: false };
    setTimer(next);
    onUpdate(next);
    if (isExtension) {
      chrome.storage.local.set({ timer: next, timerEndTime: null });
      sendMsg({ type: 'timer-stop' });
    }
  }, [timer, onUpdate]);

  return { timer, toggle, reset, switchMode, setDuration };
}
