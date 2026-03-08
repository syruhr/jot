export interface Note {
  id: string;
  text: string;
  color: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  completedAt?: number;
}

export interface TimerState {
  mode: 'work' | 'break';
  duration: number;
  remaining: number;
  running: boolean;
  sessionsToday: number;
  lastSessionDate: string;
}

export interface JotData {
  notes: Note[];
  todos: Todo[];
  focus: { text: string; date: string };
  timer: TimerState;
  streak: { count: number; lastDate: string };
  settings: { soundEnabled: boolean; workDuration: number; breakDuration: number };
}

const defaults: JotData = {
  notes: [],
  todos: [],
  focus: { text: '', date: '' },
  timer: { mode: 'work', duration: 25 * 60, remaining: 25 * 60, running: false, sessionsToday: 0, lastSessionDate: '' },
  streak: { count: 0, lastDate: '' },
  settings: { soundEnabled: true, workDuration: 25, breakDuration: 5 },
};

const isExtension = typeof chrome !== 'undefined' && chrome.storage;

export async function getData(): Promise<JotData> {
  if (isExtension) {
    return new Promise((resolve) => {
      chrome.storage.local.get(defaults, (result) => resolve(result as JotData));
    });
  }
  const raw = localStorage.getItem('jot');
  return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
}

export async function setData(partial: Partial<JotData>): Promise<void> {
  if (isExtension) {
    return new Promise((resolve) => {
      chrome.storage.local.set(partial, resolve);
    });
  }
  const current = await getData();
  localStorage.setItem('jot', JSON.stringify({ ...current, ...partial }));
}

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export const NOTE_COLORS = [
  'bg-amber-400/20 border-amber-400/30',
  'bg-rose-400/20 border-rose-400/30',
  'bg-sky-400/20 border-sky-400/30',
  'bg-violet-400/20 border-violet-400/30',
  'bg-emerald-400/20 border-emerald-400/30',
  'bg-orange-400/20 border-orange-400/30',
];
