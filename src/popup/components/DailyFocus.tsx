import React, { useState } from 'react';

interface Props {
  focus: { text: string; date: string };
  onUpdate: (text: string) => void;
}

export default function DailyFocus({ focus, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(focus.text);

  if (!focus.text && !editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="w-full px-4 py-2 text-sm text-gray-500 hover:text-amber-400 transition-colors text-left"
      >
        🎯 Set today's focus...
      </button>
    );
  }

  if (editing) {
    return (
      <div className="px-4 py-2 flex items-center gap-2">
        <span className="text-sm">🎯</span>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onUpdate(value);
              setEditing(false);
            }
            if (e.key === 'Escape') setEditing(false);
          }}
          onBlur={() => { onUpdate(value); setEditing(false); }}
          className="flex-1 bg-transparent text-sm text-amber-300 outline-none placeholder-gray-600"
          placeholder="What's your focus today?"
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => { setEditing(true); setValue(focus.text); }}
      className="px-4 py-2 text-sm text-amber-300/80 cursor-pointer hover:text-amber-300 transition-colors truncate"
    >
      🎯 {focus.text}
    </div>
  );
}
