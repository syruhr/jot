// Jot Service Worker — handles timer countdown in background

// Tick every minute to check timer
chrome.alarms.create('jot-timer-tick', { periodInMinutes: 0.05 }); // ~3 seconds via minimum
chrome.alarms.create('midnight-reset', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'jot-timer-tick') {
    chrome.storage.local.get(['timer', 'timerEndTime', 'settings'], (data) => {
      const timer = data.timer;
      const endTime = data.timerEndTime;
      const settings = data.settings || { workDuration: 25, breakDuration: 5, soundEnabled: true };

      if (!timer || !timer.running || !endTime) return;

      const now = Date.now();
      const remaining = Math.max(0, Math.round((endTime - now) / 1000));

      if (remaining <= 0) {
        // Timer complete!
        const today = new Date().toISOString().slice(0, 10);
        const newSessions = timer.mode === 'work' ? (timer.lastSessionDate === today ? timer.sessionsToday + 1 : 1) : timer.sessionsToday;
        const nextMode = timer.mode === 'work' ? 'break' : 'work';
        const dur = nextMode === 'work' ? (settings.workDuration || 25) * 60 : (settings.breakDuration || 5) * 60;

        const next = {
          mode: nextMode,
          duration: dur,
          remaining: dur,
          running: false,
          sessionsToday: newSessions,
          lastSessionDate: today,
        };

        chrome.storage.local.set({ timer: next, timerEndTime: null });

        // Notification
        chrome.notifications.create('jot-timer-done', {
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: 'Jot Timer',
          message: timer.mode === 'work' ? 'Break time! 🎉' : 'Back to work! 💪',
        });
      } else {
        // Update remaining so popup can read it
        chrome.storage.local.set({ timer: { ...timer, remaining } });
      }
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
