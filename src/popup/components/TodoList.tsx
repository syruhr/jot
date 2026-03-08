import React, { useState, useCallback } from 'react';
import { Todo, todayStr } from '../utils/storage';
import { playCompletionDing } from '../utils/sounds';
import Confetti from './Confetti';

interface Props {
  todos: Todo[];
  streak: { count: number; lastDate: string };
  soundEnabled: boolean;
  onUpdate: (todos: Todo[]) => void;
  onStreakUpdate: (streak: { count: number; lastDate: string }) => void;
}

const PRIORITY_COLORS = {
  low: 'bg-sky-400',
  medium: 'bg-violet-400',
  high: 'bg-rose-400',
};

const ENCOURAGEMENTS = ['nice!', '+1', 'sweet!', '🎯', '💪', 'crushed it!', '🔥'];

export default function TodoList({ todos, streak, soundEnabled, onUpdate, onStreakUpdate }: Props) {
  const [confetti, setConfetti] = useState<{ x: number; y: number } | null>(null);
  const [floatingText, setFloatingText] = useState<{ id: string; text: string; x: number; y: number } | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const today = todayStr();
  const todayTodos = todos.filter((t) => new Date(t.createdAt).toISOString().slice(0, 10) === today || !t.done);
  const doneCount = todayTodos.filter((t) => t.done).length;
  const totalCount = todayTodos.length;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const handleToggle = useCallback((id: string, e: React.MouseEvent) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    if (!todo.done) {
      setCompletingId(id);
      if (soundEnabled) playCompletionDing();

      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setConfetti({ x: rect.left + 10, y: rect.top + 10 });

      if (Math.random() > 0.4) {
        setFloatingText({
          id: Date.now().toString(),
          text: ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)],
          x: rect.left + 20, y: rect.top,
        });
        setTimeout(() => setFloatingText(null), 800);
      }

      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (streak.lastDate === yesterday || streak.lastDate === today) {
        onStreakUpdate({ count: streak.lastDate === today ? streak.count : streak.count + 1, lastDate: today });
      } else {
        onStreakUpdate({ count: 1, lastDate: today });
      }
      setTimeout(() => setCompletingId(null), 400);
    }

    onUpdate(todos.map((t) => t.id === id ? { ...t, done: !t.done, completedAt: !t.done ? Date.now() : undefined } : t));
  }, [todos, streak, soundEnabled, onUpdate, onStreakUpdate]);

  const handleDelete = (id: string) => {
    setRemovingId(id);
    setTimeout(() => { onUpdate(todos.filter((t) => t.id !== id)); setRemovingId(null); }, 200);
  };

  const cyclePriority = (id: string) => {
    const order: Todo['priority'][] = ['low', 'medium', 'high'];
    onUpdate(todos.map((t) => {
      if (t.id !== id) return t;
      return { ...t, priority: order[(order.indexOf(t.priority) + 1) % 3] };
    }));
  };

  const pending = todos.filter((t) => !t.done).sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.priority] - p[b.priority];
  });
  const done = todos.filter((t) => t.done).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  return (
    <div className="flex flex-col h-full relative">
      {confetti && <Confetti x={confetti.x} y={confetti.y} onDone={() => setConfetti(null)} />}
      {floatingText && (
        <div
          className="fixed text-teal-400 text-sm font-bold animate-float-up pointer-events-none z-50"
          style={{ left: floatingText.x, top: floatingText.y }}
        >
          {floatingText.text}
        </div>
      )}

      {/* Progress */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-sm text-gray-400">{doneCount}/{totalCount} done today</span>
          {streak.count >= 2 && (
            <span className="text-xs text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-full">🔥 {streak.count} day streak</span>
          )}
        </div>
        <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: pct === 100
                ? 'linear-gradient(90deg, #2dd4bf, #a78bfa)'
                : 'linear-gradient(90deg, #8b5cf6, #6d28d9)',
            }}
          />
        </div>
        {pct === 100 && totalCount > 0 && (
          <p className="text-[10px] text-teal-400/80 mt-1.5 text-center animate-fade-in-up">All done! You're crushing it 🎉</p>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-1.5">
        {todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
            <span className="text-3xl mb-3 opacity-60">✨</span>
            <p>No todos yet — add one from Capture!</p>
          </div>
        ) : (
          <>
            {pending.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-center gap-3 rounded-xl bg-white/[0.03] border border-violet-500/10 px-3 py-2.5 transition-all hover:border-violet-500/20 hover:bg-white/[0.04] ${
                  removingId === todo.id ? 'animate-fade-out' : 'animate-fade-in-up'
                } ${completingId === todo.id ? 'animate-completion-ripple' : ''}`}
              >
                <button
                  onClick={(e) => handleToggle(todo.id, e)}
                  className={`w-5 h-5 rounded-md border-2 border-violet-500/30 flex items-center justify-center transition-all hover:border-teal-400/60 ${
                    completingId === todo.id ? 'animate-pop bg-teal-400 border-teal-400 shadow-[0_0_14px_rgba(45,212,191,0.5)]' : ''
                  }`}
                />
                <button onClick={() => cyclePriority(todo.id)} className="flex-shrink-0 transition-transform hover:scale-125">
                  <span className={`block w-2 h-2 rounded-full ${PRIORITY_COLORS[todo.priority]} shadow-[0_0_6px_currentColor]`} />
                </button>
                <span className="flex-1 text-sm text-gray-200">{todo.text}</span>
                <button onClick={() => handleDelete(todo.id)} className="text-xs text-gray-600 hover:text-rose-400 transition-all hover:scale-110">✕</button>
              </div>
            ))}
            {done.length > 0 && (
              <div className="pt-3">
                <p className="text-[10px] text-gray-600 mb-2 px-1 uppercase tracking-wider">Completed</p>
                {done.map((todo) => (
                  <div
                    key={todo.id}
                    className={`flex items-center gap-3 rounded-xl bg-teal-500/[0.03] border border-teal-500/8 px-3 py-2 mb-1.5 ${
                      removingId === todo.id ? 'animate-fade-out' : ''
                    }`}
                  >
                    <button
                      onClick={(e) => handleToggle(todo.id, e)}
                      className="w-5 h-5 rounded-md bg-teal-400/15 border-2 border-teal-400/30 flex items-center justify-center text-teal-400 text-xs"
                    >
                      ✓
                    </button>
                    <span className="flex-1 text-sm text-gray-500 line-through">{todo.text}</span>
                    <button onClick={() => handleDelete(todo.id)} className="text-xs text-gray-700 hover:text-rose-400 transition-all">✕</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
