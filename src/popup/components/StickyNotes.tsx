import React, { useState } from 'react';
import { Note, Todo, NOTE_COLORS, genId } from '../utils/storage';

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

  const handleDelete = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      onUpdate(notes.filter((n) => n.id !== id));
      setRemovingId(null);
    }, 200);
  };

  const handlePin = (id: string) => {
    onUpdate(notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  };

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setEditText(note.text);
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      onUpdate(notes.map((n) => (n.id === editingId ? { ...n, text: editText.trim(), updatedAt: Date.now() } : n)));
    }
    setEditingId(null);
  };

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-600 text-sm">
        <span className="text-3xl mb-2">📝</span>
        <p>No notes yet — capture something!</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-medium text-gray-400">{notes.length} note{notes.length !== 1 ? 's' : ''}</h2>
        {showClearConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Clear all?</span>
            <button onClick={() => { onUpdate([]); setShowClearConfirm(false); }} className="text-xs text-rose-400 hover:text-rose-300">Yes</button>
            <button onClick={() => setShowClearConfirm(false)} className="text-xs text-gray-500 hover:text-gray-300">No</button>
          </div>
        ) : (
          <button onClick={() => setShowClearConfirm(true)} className="text-xs text-gray-600 hover:text-rose-400 transition-colors">
            Clear all
          </button>
        )}
      </div>
      {sorted.map((note) => (
        <div
          key={note.id}
          className={`rounded-2xl border p-4 transition-all ${note.color} ${
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
            <p
              onClick={() => handleEdit(note)}
              className="text-sm text-gray-200 cursor-pointer whitespace-pre-wrap"
            >
              {note.text}
            </p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-gray-500">
              {new Date(note.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              {' · '}
              {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex items-center gap-2">
              {onMoveToTodo && (
                <button
                  onClick={() => onMoveToTodo(note)}
                  className="text-xs text-gray-600 hover:text-emerald-400 transition-colors hover:scale-125"
                  title="Move to todos"
                >
                  ☑
                </button>
              )}
              <button
                onClick={() => handlePin(note.id)}
                className={`text-xs transition-transform hover:scale-125 ${note.pinned ? 'text-amber-400' : 'text-gray-600 hover:text-gray-400'}`}
              >
                📌
              </button>
              <button
                onClick={() => handleDelete(note.id)}
                className="text-xs text-gray-600 hover:text-rose-400 transition-colors hover:scale-125"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
