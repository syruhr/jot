import React, { useState, useRef, useEffect } from 'react';
import { Note, Todo, genId, NOTE_COLORS, todayStr } from '../utils/storage';
import { playPop } from '../utils/sounds';

interface Props {
  notes: Note[];
  todos: Todo[];
  soundEnabled: boolean;
  onAddNote: (note: Note) => void;
  onAddTodo: (todo: Todo) => void;
}

export default function QuickCapture({ notes, todos, soundEnabled, onAddNote, onAddTodo }: Props) {
  const [input, setInput] = useState('');
  const [flash, setFlash] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const text = input.trim();
    if (!text) return;

    const isTodo = /^\[[\sx]?\]/.test(text) || text.toLowerCase().startsWith('todo ');
    const cleanText = text.replace(/^\[[\sx]?\]\s*/, '').replace(/^todo\s+/i, '');

    if (isTodo) {
      onAddTodo({ id: genId(), text: cleanText, done: false, priority: 'medium', createdAt: Date.now() });
    } else {
      onAddNote({
        id: genId(), text, color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
        pinned: false, createdAt: Date.now(), updatedAt: Date.now(),
      });
    }

    if (soundEnabled) playPop();
    setInput('');
    setFlash(true);
    setTimeout(() => setFlash(false), 400);
  };

  const recentItems = [...notes, ...todos].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);

  return (
    <div className="flex flex-col h-full">
      {/* Input */}
      <div className="p-4 pb-2">
        <div className={`relative rounded-2xl border transition-all duration-300 ${
          flash
            ? 'border-teal-400/60 bg-teal-400/5 shadow-[0_0_20px_rgba(45,212,191,0.1)]'
            : 'border-violet-500/20 bg-white/[0.03] hover:border-violet-500/30 focus-within:border-violet-400/40 focus-within:shadow-[0_0_20px_rgba(139,92,246,0.08)]'
        }`}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="What's on your mind?"
            className="w-full bg-transparent px-4 py-3.5 text-sm text-gray-100 outline-none placeholder-gray-500"
          />
          {input && (
            <button
              onClick={handleSubmit}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-violet-500/20 text-violet-300 text-xs hover:bg-violet-500/30 transition-all"
            >
              Save
            </button>
          )}
        </div>
        <p className="mt-1.5 text-[10px] text-gray-600 px-1">
          Enter to save · Start with <span className="text-violet-400/60">[]</span> or <span className="text-violet-400/60">todo</span> for tasks
        </p>
      </div>

      {/* Recent items */}
      <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-2">
        {recentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
            <span className="text-3xl mb-3 opacity-60">💭</span>
            <p className="text-gray-500">What's on your mind?</p>
            <p className="text-[10px] text-gray-600 mt-1">Type above and press Enter</p>
          </div>
        ) : (
          recentItems.map((item) => {
            const isNote = 'color' in item;
            const note = item as Note;
            const todo = item as Todo;
            return (
              <div
                key={item.id}
                className={`rounded-xl border px-3 py-2.5 text-sm animate-fade-in-up transition-all ${
                  isNote
                    ? 'bg-violet-500/[0.06] border-violet-500/15 hover:border-violet-500/25'
                    : 'bg-teal-500/[0.04] border-teal-500/10 hover:border-teal-500/20'
                }`}
              >
                <div className="flex items-start gap-2">
                  {!isNote && (
                    <span className="text-teal-400/60 mt-0.5 text-xs">{todo.done ? '☑' : '☐'}</span>
                  )}
                  <span className={`flex-1 ${!isNote && todo.done ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                    {isNote ? note.text : todo.text}
                  </span>
                </div>
                <div className="text-[10px] text-gray-600 mt-1.5 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isNote ? 'bg-violet-400/40' : 'bg-teal-400/40'}`} />
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  <span className="text-gray-700">·</span>
                  {isNote ? 'note' : 'todo'}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
