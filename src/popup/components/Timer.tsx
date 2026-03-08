import React from 'react';
import { TimerState } from '../utils/storage';

interface Props {
  timer: TimerState;
  onToggle: () => void;
  onReset: () => void;
  onSwitchMode: (mode: 'work' | 'break') => void;
  onSetDuration: (minutes: number) => void;
}

export default function Timer({ timer, onToggle, onReset, onSwitchMode, onSetDuration }: Props) {
  const minutes = Math.floor(timer.remaining / 60);
  const seconds = timer.remaining % 60;
  const pct = timer.duration > 0 ? ((timer.duration - timer.remaining) / timer.duration) * 100 : 0;

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-4">
      {/* Mode toggle */}
      <div className="flex gap-1 bg-gray-900 rounded-xl p-1">
        <button
          onClick={() => onSwitchMode('work')}
          className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
            timer.mode === 'work' ? 'bg-amber-400/20 text-amber-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Focus
        </button>
        <button
          onClick={() => onSwitchMode('break')}
          className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
            timer.mode === 'break' ? 'bg-emerald-400/20 text-emerald-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Break
        </button>
      </div>

      {/* Circular timer */}
      <div className={`relative ${timer.running ? 'animate-pulse-ring' : ''}`} style={{ borderRadius: '50%' }}>
        <svg width="200" height="200" className="-rotate-90">
          <circle cx="100" cy="100" r={radius} fill="none" stroke="#1f2937" strokeWidth="6" />
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={timer.mode === 'work' ? '#fbbf24' : '#34d399'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-light text-gray-100 tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-xs text-gray-500 mt-1">
            {timer.mode === 'work' ? 'focus time' : 'break time'}
          </span>
        </div>
      </div>

      {/* Duration adjuster */}
      {!timer.running && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSetDuration(Math.max(1, Math.floor(timer.duration / 60) - 5))}
            className="w-8 h-8 rounded-lg bg-gray-900 text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-all text-sm font-medium"
          >
            −
          </button>
          <span className="text-sm text-gray-400 w-16 text-center">{Math.floor(timer.duration / 60)} min</span>
          <button
            onClick={() => onSetDuration(Math.min(120, Math.floor(timer.duration / 60) + 5))}
            className="w-8 h-8 rounded-lg bg-gray-900 text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-all text-sm font-medium"
          >
            +
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={onReset}
          className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-300 bg-gray-900 hover:bg-gray-800 transition-all"
        >
          Reset
        </button>
        <button
          onClick={onToggle}
          className={`px-8 py-2.5 rounded-xl text-sm font-medium transition-all ${
            timer.running
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              : 'bg-amber-400 text-gray-950 hover:bg-amber-300'
          }`}
        >
          {timer.running ? 'Pause' : 'Start'}
        </button>
      </div>

      {/* Sessions */}
      <div className="text-sm text-gray-500">
        {timer.sessionsToday > 0
          ? `${timer.sessionsToday} session${timer.sessionsToday !== 1 ? 's' : ''} today 🎯`
          : 'No sessions yet today'}
      </div>
    </div>
  );
}
