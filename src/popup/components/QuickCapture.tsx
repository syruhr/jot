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
      onAddTodo({
        id: genId(),
        text: cleanText,
        done: false,
        priority: 'medium',
        createdAt: Date.now(),
      });
    } else {
      onAddNote({
        id: genId(),
        text,
        color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
        pinned: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    if (soundEnabled) playPop();
    setInput('');
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
  };

  const recentItems = [...notes, ...todos]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 10);

  return (
    <div className="flex flex-col h-full">
      {/* Input */}
      <div className="p-4 pb-2">
        <div className={`relative rounded-2xl border transition-all ${flash ? 'border-amber-400 bg-amber-400/5' : 'border-gray-800 bg-gray-900'}`}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="What's on your mind?"
            className="w-full bg-transparent px-4 py-3 text-sm text-gray-100 outline-none placeholder-gray-600"
          />
          {input && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-600">
              {input.length} chars
            </div>
          )}
        </div>
        <p className="mt-1.5 text-[10px] text-gray-600 px-1">
          Press Enter to save · Start with "[]" or "todo" for tasks
        </p>
      </div>

      {/* Recent items */}
      <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-2">
        {recentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 text-sm">
            <span className="text-3xl mb-2">💭</span>
            <p>No notes yet — what's on your mind?</p>
          </div>
        ) : (
          recentItems.map((item) => {
            const isNote = 'color' in item;
            const note = item as Note;
            const todo = item as Todo;
            return (
              <div
                key={item.id}
                className={`rounded-xl border px-3 py-2 text-sm animate-fade-in-up ${
                  isNote ? note.color : 'bg-gray-900 border-gray-800'
                }`}
              >
                <div className="flex items-start gap-2">
                  {!isNote && (
                    <span className="text-gray-500 mt-0.5">{todo.done ? '☑️' : '☐'}</span>
                  )}
                  <span className={`flex-1 ${!isNote && todo.done ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                    {isNote ? note.text : todo.text}
                  </span>
                </div>
                <div className="text-[10px] text-gray-600 mt-1">
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isNote ? ' · note' : ' · todo'}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
