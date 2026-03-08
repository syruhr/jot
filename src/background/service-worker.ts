chrome.alarms.create('midnight-reset', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
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

export {};
