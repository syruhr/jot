import React from 'react';

export type Tab = 'capture' | 'notes' | 'todos' | 'timer' | 'more';

const tabs: { id: Tab; icon: string; label: string }[] = [
  { id: 'capture', icon: '⚡', label: 'Capture' },
  { id: 'notes', icon: '📝', label: 'Notes' },
  { id: 'todos', icon: '✅', label: 'Todos' },
  { id: 'timer', icon: '⏱️', label: 'Timer' },
  { id: 'more', icon: '⚙️', label: 'More' },
];

interface Props {
  active: Tab;
  onSelect: (tab: Tab) => void;
}

export default function Navigation({ active, onSelect }: Props) {
  return (
    <nav className="flex items-center justify-around border-t border-gray-800 bg-gray-950 px-2 py-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelect(tab.id)}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
            active === tab.id
              ? 'text-amber-400 bg-amber-400/10'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <span className="text-base">{tab.icon}</span>
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
