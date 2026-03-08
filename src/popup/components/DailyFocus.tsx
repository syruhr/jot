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
        className="w-full px-4 py-2.5 text-sm text-gray-500 hover:text-violet-300 transition-all text-left group relative z-10"
      >
        <span className="group-hover:opacity-100 opacity-70 transition-opacity">🎯</span>
        <span className="ml-1.5">Set today's focus...</span>
      </button>
    );
  }

  if (editing) {
    return (
      <div className="px-4 py-2.5 flex items-center gap-2 relative z-10">
        <span className="text-sm">🎯</span>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { onUpdate(value); setEditing(false); }
            if (e.key === 'Escape') setEditing(false);
          }}
          onBlur={() => { onUpdate(value); setEditing(false); }}
          className="flex-1 bg-transparent text-sm text-violet-200 outline-none placeholder-gray-600"
          placeholder="What's your focus today?"
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => { setEditing(true); setValue(focus.text); }}
      className="px-4 py-2.5 text-sm text-violet-200/80 cursor-pointer hover:text-violet-200 transition-all truncate relative z-10"
    >
      🎯 {focus.text}
    </div>
  );
}
