// Jot Service Worker — handles timer countdown in background

// Tick every ~3 seconds (Chrome minimum for alarms is ~30s, so we use a workaround)
// Actually chrome.alarms minimum period is 1 minute for released extensions
// We'll use a combination: set alarm for timer end, and periodic check
chrome.alarms.create('midnight-reset', { periodInMinutes: 60 });

// When timer starts, we create a 'jot-timer-end' alarm at the exact end time
// Plus a periodic tick to update remaining in storage

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'jot-timer-end') {
    // Timer is done!
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

      chrome.notifications.create('jot-timer-done', {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Jot Timer',
        message: timer.mode === 'work' ? 'Break time! 🎉' : 'Back to work! 💪',
      });
    });
  }

  if (alarm.name === 'jot-timer-tick') {
    // Update remaining in storage so popup can display it
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

// Listen for messages from popup to start/stop timer alarms
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'timer-start') {
    const endTime = msg.endTime;
    const delayMs = endTime - Date.now();
    // Set exact alarm for when timer ends
    chrome.alarms.create('jot-timer-end', { when: endTime });
    // Periodic tick to update remaining (every 1 min — Chrome minimum)
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
