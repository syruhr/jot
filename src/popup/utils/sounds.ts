const audioCtx = () => new (window.AudioContext || (window as any).webkitAudioContext)();

export function playPop() {
  try {
    const ctx = audioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

export function playCompletionDing() {
  try {
    const ctx = audioCtx();
    const t = ctx.currentTime;
    // Three ascending chimes — satisfying completion sound
    [660, 880, 1100].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.12);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.5);
      osc.start(t + i * 0.12);
      osc.stop(t + i * 0.12 + 0.5);
    });
  } catch {}
}

export function playTimerDone() {
  try {
    const ctx = audioCtx();
    const t = ctx.currentTime;

    // Multi-chime alarm — 3 sets of double-dings with a pause
    // Much more noticeable than a single short ding
    const pattern = [
      // First pair
      { freq: 880, time: 0, dur: 0.3 },
      { freq: 1100, time: 0.15, dur: 0.3 },
      // Pause...
      // Second pair
      { freq: 880, time: 0.6, dur: 0.3 },
      { freq: 1100, time: 0.75, dur: 0.3 },
      // Pause...
      // Third pair (slightly louder for urgency)
      { freq: 880, time: 1.2, dur: 0.4 },
      { freq: 1320, time: 1.35, dur: 0.6 },
    ];

    pattern.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + time);
      gain.gain.setValueAtTime(0, t + time);
      gain.gain.linearRampToValueAtTime(0.25, t + time + 0.02);
      gain.gain.setValueAtTime(0.25, t + time + dur * 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, t + time + dur);
      osc.start(t + time);
      osc.stop(t + time + dur);
    });
  } catch {}
}

// Keep old playDing as alias for backward compat
export const playDing = playTimerDone;
