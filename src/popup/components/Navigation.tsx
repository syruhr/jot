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
    <nav className="flex items-center justify-around border-t border-violet-500/10 bg-[#0f0a1a]/95 backdrop-blur-sm px-2 py-1 relative z-20">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelect(tab.id)}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
            active === tab.id
              ? 'text-violet-300 bg-violet-500/15 shadow-[0_0_12px_rgba(139,92,246,0.15)]'
              : 'text-gray-500 hover:text-violet-300/70 hover:bg-violet-500/5'
          }`}
        >
          <span className="text-base">{tab.icon}</span>
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
