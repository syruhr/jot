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

  const isWork = timer.mode === 'work';
  const accentColor = isWork ? '#8b5cf6' : '#2dd4bf';
  const accentGlow = isWork ? 'rgba(139, 92, 246, 0.3)' : 'rgba(45, 212, 191, 0.3)';

  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 p-4">
      {/* Mode toggle */}
      <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1 border border-violet-500/10">
        <button
          onClick={() => onSwitchMode('work')}
          className={`px-5 py-1.5 rounded-lg text-sm transition-all duration-200 ${
            isWork
              ? 'bg-violet-500/20 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.15)]'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Focus
        </button>
        <button
          onClick={() => onSwitchMode('break')}
          className={`px-5 py-1.5 rounded-lg text-sm transition-all duration-200 ${
            !isWork
              ? 'bg-teal-500/20 text-teal-300 shadow-[0_0_12px_rgba(45,212,191,0.15)]'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Break
        </button>
      </div>

      {/* Circular timer */}
      <div
        className={`relative ${timer.running ? 'animate-pulse-ring' : ''}`}
        style={{ borderRadius: '50%' }}
      >
        <svg width="200" height="200" className="-rotate-90">
          <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={accentColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
            style={{
              filter: timer.running ? `drop-shadow(0 0 8px ${accentGlow})` : 'none',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-light text-gray-100 tabular-nums tracking-wide">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-xs text-gray-500 mt-1.5">
            {isWork ? 'focus time' : 'break time'}
          </span>
        </div>
      </div>

      {/* Duration adjuster */}
      {!timer.running && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSetDuration(Math.max(1, Math.floor(timer.duration / 60) - 5))}
            className="w-8 h-8 rounded-lg bg-white/[0.04] border border-violet-500/10 text-gray-400 hover:text-violet-300 hover:border-violet-500/25 transition-all text-sm font-medium"
          >
            −
          </button>
          <span className="text-sm text-gray-400 w-16 text-center tabular-nums">{Math.floor(timer.duration / 60)} min</span>
          <button
            onClick={() => onSetDuration(Math.min(120, Math.floor(timer.duration / 60) + 5))}
            className="w-8 h-8 rounded-lg bg-white/[0.04] border border-violet-500/10 text-gray-400 hover:text-violet-300 hover:border-violet-500/25 transition-all text-sm font-medium"
          >
            +
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={onReset}
          className="px-5 py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-300 bg-white/[0.03] border border-violet-500/10 hover:border-violet-500/20 transition-all"
        >
          Reset
        </button>
        <button
          onClick={onToggle}
          className={`px-8 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            timer.running
              ? 'bg-white/[0.06] border border-violet-500/15 text-gray-300 hover:bg-white/[0.08]'
              : `border border-transparent text-white shadow-[0_0_20px_${accentGlow}]`
          }`}
          style={!timer.running ? {
            background: isWork
              ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
              : 'linear-gradient(135deg, #2dd4bf, #14b8a6)',
            boxShadow: `0 0 20px ${accentGlow}`,
          } : {}}
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
