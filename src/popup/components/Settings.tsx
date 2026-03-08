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
      <div className="flex items-center justify-between bg-gray-900 rounded-2xl border border-gray-800 p-4">
        <div>
          <p className="text-sm text-gray-200">Sound effects</p>
          <p className="text-[10px] text-gray-500">Satisfying pops when completing todos</p>
        </div>
        <button
          onClick={() => onUpdate({ settings: { ...data.settings, soundEnabled: !data.settings.soundEnabled } })}
          className={`w-10 h-6 rounded-full transition-all flex items-center ${
            data.settings.soundEnabled ? 'bg-amber-400 justify-end' : 'bg-gray-700 justify-start'
          }`}
        >
          <span className="block w-4 h-4 bg-white rounded-full mx-1 transition-all" />
        </button>
      </div>

      {/* Timer settings */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 space-y-3">
        <p className="text-sm text-gray-200">Timer durations</p>
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500 w-16">Focus</label>
          <input
            type="number"
            value={data.settings.workDuration}
            onChange={(e) => onUpdate({ settings: { ...data.settings, workDuration: Math.max(1, parseInt(e.target.value) || 25) } })}
            className="w-16 bg-gray-800 rounded-lg px-2 py-1 text-sm text-gray-200 outline-none text-center"
          />
          <span className="text-xs text-gray-500">min</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500 w-16">Break</label>
          <input
            type="number"
            value={data.settings.breakDuration}
            onChange={(e) => onUpdate({ settings: { ...data.settings, breakDuration: Math.max(1, parseInt(e.target.value) || 5) } })}
            className="w-16 bg-gray-800 rounded-lg px-2 py-1 text-sm text-gray-200 outline-none text-center"
          />
          <span className="text-xs text-gray-500">min</span>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
        <p className="text-sm text-gray-200 mb-2">Stats</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-gray-500">Notes: <span className="text-gray-300">{data.notes.length}</span></div>
          <div className="text-gray-500">Todos: <span className="text-gray-300">{data.todos.length}</span></div>
          <div className="text-gray-500">Done: <span className="text-gray-300">{data.todos.filter(t => t.done).length}</span></div>
          <div className="text-gray-500">Streak: <span className="text-amber-400">🔥 {data.streak.count}</span></div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={clearCompleted}
          className="w-full py-2.5 rounded-xl text-sm bg-gray-900 border border-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-all"
        >
          Clear completed todos
        </button>
        <button
          onClick={exportMarkdown}
          className="w-full py-2.5 rounded-xl text-sm bg-amber-400/10 border border-amber-400/20 text-amber-400 hover:bg-amber-400/20 transition-all"
        >
          📥 Export as Markdown
        </button>
      </div>

      <p className="text-center text-[10px] text-gray-700 pt-2">Jot v1.0 · Made with ❤️</p>
    </div>
  );
}
