import React from 'react';
import { JotData } from '../utils/storage';

interface Props {
  data: JotData;
  onUpdate: (partial: Partial<JotData>) => void;
}

export default function Settings({ data, onUpdate }: Props) {
  const exportMarkdown = () => {
    let md = '# Jot Export\n\n';
    md += '## Notes\n\n';
    data.notes.forEach((n) => {
      md += `- ${n.text} *(${new Date(n.createdAt).toLocaleDateString()})*\n`;
    });
    md += '\n## Todos\n\n';
    data.todos.forEach((t) => {
      md += `- [${t.done ? 'x' : ' '}] ${t.text}\n`;
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jot-export-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearCompleted = () => {
    onUpdate({ todos: data.todos.filter((t) => !t.done) });
  };

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <h2 className="text-sm font-medium text-gray-400">Settings</h2>

      {/* Sound */}
      <div className="flex items-center justify-between bg-white/[0.03] rounded-2xl border border-violet-500/10 p-4">
        <div>
          <p className="text-sm text-gray-200">Sound effects</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Chimes on completion & timer end</p>
        </div>
        <button
          onClick={() => onUpdate({ settings: { ...data.settings, soundEnabled: !data.settings.soundEnabled } })}
          className={`w-11 h-6 rounded-full transition-all duration-200 flex items-center ${
            data.settings.soundEnabled
              ? 'bg-violet-500 justify-end shadow-[0_0_10px_rgba(139,92,246,0.3)]'
              : 'bg-gray-700 justify-start'
          }`}
        >
          <span className="block w-4.5 h-4.5 bg-white rounded-full mx-1 transition-all shadow-sm" style={{ width: 18, height: 18 }} />
        </button>
      </div>

      {/* Timer settings */}
      <div className="bg-white/[0.03] rounded-2xl border border-violet-500/10 p-4 space-y-3">
        <p className="text-sm text-gray-200">Timer durations</p>
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500 w-16">Focus</label>
          <input
            type="number"
            value={data.settings.workDuration}
            onChange={(e) => onUpdate({ settings: { ...data.settings, workDuration: Math.max(1, parseInt(e.target.value) || 25) } })}
            className="w-16 bg-white/[0.04] border border-violet-500/10 rounded-lg px-2 py-1.5 text-sm text-gray-200 outline-none text-center focus:border-violet-500/30 transition-colors"
          />
          <span className="text-xs text-gray-500">min</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500 w-16">Break</label>
          <input
            type="number"
            value={data.settings.breakDuration}
            onChange={(e) => onUpdate({ settings: { ...data.settings, breakDuration: Math.max(1, parseInt(e.target.value) || 5) } })}
            className="w-16 bg-white/[0.04] border border-violet-500/10 rounded-lg px-2 py-1.5 text-sm text-gray-200 outline-none text-center focus:border-violet-500/30 transition-colors"
          />
          <span className="text-xs text-gray-500">min</span>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white/[0.03] rounded-2xl border border-violet-500/10 p-4">
        <p className="text-sm text-gray-200 mb-3">Stats</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-violet-500/[0.06] rounded-xl p-3 text-center">
            <p className="text-lg font-light text-violet-300">{data.notes.length}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Notes</p>
          </div>
          <div className="bg-teal-500/[0.06] rounded-xl p-3 text-center">
            <p className="text-lg font-light text-teal-300">{data.todos.length}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Todos</p>
          </div>
          <div className="bg-sky-500/[0.06] rounded-xl p-3 text-center">
            <p className="text-lg font-light text-sky-300">{data.todos.filter(t => t.done).length}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Completed</p>
          </div>
          <div className="bg-amber-500/[0.06] rounded-xl p-3 text-center">
            <p className="text-lg font-light text-amber-300">🔥 {data.streak.count}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Streak</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={clearCompleted}
          className="w-full py-2.5 rounded-xl text-sm bg-white/[0.03] border border-violet-500/10 text-gray-400 hover:text-gray-200 hover:border-violet-500/20 transition-all"
        >
          Clear completed todos
        </button>
        <button
          onClick={exportMarkdown}
          className="w-full py-2.5 rounded-xl text-sm bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/15 transition-all"
        >
          📥 Export as Markdown
        </button>
      </div>

      <p className="text-center text-[10px] text-gray-700 pt-2">Jot v1.0 · Made with ❤️</p>
    </div>
  );
}
