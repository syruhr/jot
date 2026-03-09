// Jot Service Worker — handles timer countdown in background

chrome.alarms.create('midnight-reset', { periodInMinutes: 60 });

// Play sound via offscreen document (works even with popup closed)
async function playTimerSound() {
  try {
    // Check if offscreen doc already exists
    const existingContexts = await (chrome as any).runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
      documentUrls: [chrome.runtime.getURL('offscreen.html')],
    });

    if (!existingContexts || existingContexts.length === 0) {
      await (chrome as any).offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Play timer completion sound',
      });
    }

    chrome.runtime.sendMessage({ type: 'play-timer-done' });
  } catch (e) {
    console.log('Offscreen sound error:', e);
  }
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'jot-timer-end') {
    chrome.storage.local.get(['timer', 'settings'], (data) => {
      const timer = data.timer;
      const settings = data.settings || { workDuration: 25, breakDuration: 5, soundEnabled: true };
      if (!timer || !timer.running) return;

      const today = new Date().toISOString().slice(0, 10);
      const newSessions = timer.mode === 'work'
        ? (timer.lastSessionDate === today ? timer.sessionsToday + 1 : 1)
        : timer.sessionsToday;
      const nextMode = timer.mode === 'work' ? 'break' : 'work';
      const dur = nextMode === 'work'
        ? (settings.workDuration || 25) * 60
        : (settings.breakDuration || 5) * 60;

      const next = {
        mode: nextMode,
        duration: dur,
        remaining: dur,
        running: false,
        sessionsToday: newSessions,
        lastSessionDate: today,
      };

      chrome.storage.local.set({ timer: next, timerEndTime: null });
      chrome.alarms.clear('jot-timer-tick');

      // Play sound if enabled
      if (settings.soundEnabled) {
        playTimerSound();
      }

      chrome.notifications.create('jot-timer-done', {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Jot Timer',
        message: timer.mode === 'work' ? 'Break time! 🎉' : 'Back to work! 💪',
      });
    });
  }

  if (alarm.name === 'jot-timer-tick') {
    chrome.storage.local.get(['timer', 'timerEndTime'], (data) => {
      const timer = data.timer;
      const endTime = data.timerEndTime;
      if (!timer || !timer.running || !endTime) return;

      const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
      chrome.storage.local.set({ timer: { ...timer, remaining } });
    });
  }

  if (alarm.name === 'midnight-reset') {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() < 60) {
      chrome.storage.local.get({ focus: { text: '', date: '' } }, (data) => {
        const today = new Date().toISOString().slice(0, 10);
        if (data.focus.date !== today) {
          chrome.storage.local.set({ focus: { text: '', date: '' } });
        }
      });
    }
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'timer-start') {
    chrome.alarms.create('jot-timer-end', { when: msg.endTime });
    chrome.alarms.create('jot-timer-tick', { periodInMinutes: 1 });
    sendResponse({ ok: true });
  }
  if (msg.type === 'timer-stop') {
    chrome.alarms.clear('jot-timer-end');
    chrome.alarms.clear('jot-timer-tick');
    sendResponse({ ok: true });
  }
  return true;
});

export {};
