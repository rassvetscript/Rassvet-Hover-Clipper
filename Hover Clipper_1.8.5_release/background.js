chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    if (chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: chrome.i18n.getMessage("notificationTitle"),
        message: chrome.i18n.getMessage("notificationMessage")
      });
    }
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  }
});



chrome.commands.onCommand.addListener((command) => {
    if (command === 'togglecleanurl') {
        chrome.storage.local.get('cleanUrlMode', (data) => {
            const enabled = !data.cleanUrlMode ?? true;  // undefined 방지, 기본 true
            chrome.storage.local.set({ cleanUrlMode: enabled });

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length > 0) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'toggleCleanUrl',
                        enabled: enabled,
                        triggeredBy: 'shortcut'
                    }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.warn('Message send error:', chrome.runtime.lastError.message);
                        } else {
                            console.log('Message sent successfully');
                        }
                    });
                }
            });
        });
    }
});
