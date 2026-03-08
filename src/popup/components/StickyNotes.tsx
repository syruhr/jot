import React, { useState } from 'react';
import { Note, NOTE_COLORS, genId } from '../utils/storage';

const V4_COLORS = [
  'bg-violet-500/10 border-violet-500/20 hover:border-violet-400/30',
  'bg-rose-500/10 border-rose-500/20 hover:border-rose-400/30',
  'bg-teal-500/10 border-teal-500/20 hover:border-teal-400/30',
  'bg-amber-500/10 border-amber-500/20 hover:border-amber-400/30',
  'bg-sky-500/10 border-sky-500/20 hover:border-sky-400/30',
  'bg-fuchsia-500/10 border-fuchsia-500/20 hover:border-fuchsia-400/30',
];

interface Props {
  notes: Note[];
  onUpdate: (notes: Note[]) => void;
  onMoveToTodo?: (note: Note) => void;
}

export default function StickyNotes({ notes, onUpdate, onMoveToTodo }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const sorted = [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.createdAt - a.createdAt;
  });

  const getColor = (index: number) => V4_COLORS[index % V4_COLORS.length];

  const handleDelete = (id: string) => {
    setRemovingId(id);
    setTimeout(() => { onUpdate(notes.filter((n) => n.id !== id)); setRemovingId(null); }, 200);
  };

  const handlePin = (id: string) => {
    onUpdate(notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  };

  const handleEdit = (note: Note) => { setEditingId(note.id); setEditText(note.text); };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      onUpdate(notes.map((n) => (n.id === editingId ? { ...n, text: editText.trim(), updatedAt: Date.now() } : n)));
    }
    setEditingId(null);
  };

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
        <span className="text-3xl mb-3 opacity-60">📝</span>
        <p>No notes yet — capture something!</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-medium text-gray-400">{notes.length} note{notes.length !== 1 ? 's' : ''}</h2>
        {showClearConfirm ? (
          <div className="flex items-center gap-2 animate-slide-in">
            <span className="text-xs text-gray-500">Clear all?</span>
            <button onClick={() => { onUpdate([]); setShowClearConfirm(false); }} className="text-xs text-rose-400 hover:text-rose-300 transition-colors">Yes</button>
            <button onClick={() => setShowClearConfirm(false)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">No</button>
          </div>
        ) : (
          <button onClick={() => setShowClearConfirm(true)} className="text-xs text-gray-600 hover:text-rose-400 transition-colors">Clear all</button>
        )}
      </div>
      {sorted.map((note, i) => (
        <div
          key={note.id}
          className={`rounded-2xl border p-4 transition-all duration-200 ${getColor(i)} ${
            removingId === note.id ? 'animate-fade-out' : 'animate-fade-in-up'
          }`}
        >
          {editingId === note.id ? (
            <textarea
              autoFocus
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) saveEdit(); if (e.key === 'Escape') setEditingId(null); }}
              className="w-full bg-transparent text-sm text-gray-100 outline-none resize-none min-h-[60px]"
            />
          ) : (
            <p onClick={() => handleEdit(note)} className="text-sm text-gray-200 cursor-pointer whitespace-pre-wrap leading-relaxed">
              {note.text}
            </p>
          )}
          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px] text-gray-500">
              {new Date(note.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              {' · '}
              {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex items-center gap-2.5">
              {onMoveToTodo && (
                <button onClick={() => onMoveToTodo(note)} className="text-xs text-gray-600 hover:text-teal-400 transition-all hover:scale-110" title="Move to todos">☑</button>
              )}
              <button onClick={() => handlePin(note.id)} className={`text-xs transition-all hover:scale-110 ${note.pinned ? 'text-violet-400' : 'text-gray-600 hover:text-violet-400'}`}>📌</button>
              <button onClick={() => handleDelete(note.id)} className="text-xs text-gray-600 hover:text-rose-400 transition-all hover:scale-110">✕</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
