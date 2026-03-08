import React, { useState, useCallback } from 'react';
import { useStorage } from './hooks/useStorage';
import { useTimer } from './hooks/useTimer';
import { Note, Todo, todayStr } from './utils/storage';
import Navigation, { Tab } from './components/Navigation';
import DailyFocus from './components/DailyFocus';
import QuickCapture from './components/QuickCapture';
import StickyNotes from './components/StickyNotes';
import TodoList from './components/TodoList';
import Timer from './components/Timer';
import Settings from './components/Settings';

export default function App() {
  const { data, update } = useStorage();
  const [tab, setTab] = useState<Tab>('capture');

  const handleTimerUpdate = useCallback(
    (timer: any) => update({ timer }),
    [update]
  );

  const { timer, toggle, reset, switchMode, setDuration } = useTimer(
    data?.timer,
    data?.settings,
    handleTimerUpdate
  );

  if (!data) return null;

  const today = todayStr();
  if (data.focus.date && data.focus.date !== today) {
    update({ focus: { text: '', date: '' } });
  }

  const handleAddNote = (note: Note) => update({ notes: [...data.notes, note] });
  const handleAddTodo = (todo: Todo) => update({ todos: [...data.todos, todo] });
  const handleFocusUpdate = (text: string) => update({ focus: { text, date: today } });

  return (
    <div className="flex flex-col h-[520px] w-[380px] bg-[#0f0a1a] text-gray-100 overflow-hidden relative">
      {/* Subtle gradient glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />
      
      {/* Daily Focus */}
      <DailyFocus focus={data.focus} onUpdate={handleFocusUpdate} />

      {/* Content */}
      <div className="flex-1 overflow-hidden relative z-10">
        {tab === 'capture' && (
          <QuickCapture
            notes={data.notes}
            todos={data.todos}
            soundEnabled={data.settings.soundEnabled}
            onAddNote={handleAddNote}
            onAddTodo={handleAddTodo}
          />
        )}
        {tab === 'notes' && (
          <StickyNotes
            notes={data.notes}
            onUpdate={(notes) => update({ notes })}
            onMoveToTodo={(note) => {
              update({
                notes: data.notes.filter((n) => n.id !== note.id),
                todos: [...data.todos, { id: note.id, text: note.text, done: false, priority: 'medium' as const, createdAt: note.createdAt }],
              });
            }}
          />
        )}
        {tab === 'todos' && (
          <TodoList
            todos={data.todos}
            streak={data.streak}
            soundEnabled={data.settings.soundEnabled}
            onUpdate={(todos) => update({ todos })}
            onStreakUpdate={(streak) => update({ streak })}
          />
        )}
        {tab === 'timer' && (
          <Timer timer={timer} onToggle={toggle} onReset={reset} onSwitchMode={switchMode} onSetDuration={setDuration} />
        )}
        {tab === 'more' && <Settings data={data} onUpdate={update} />}
      </div>

      {/* Navigation */}
      <Navigation active={tab} onSelect={setTab} />
    </div>
  );
}
