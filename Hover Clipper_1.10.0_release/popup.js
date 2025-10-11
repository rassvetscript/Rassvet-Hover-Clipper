document.addEventListener('DOMContentLoaded', () => {
    const cleanUrlCheckbox = document.getElementById('cleanUrlMode');
    const settingShortcut = document.getElementById('settingShortcut');

    chrome.storage.local.get(['cleanUrlMode'], (res) => {
        cleanUrlCheckbox.checked = res.cleanUrlMode ?? true;
    });

    async function sendMessageToActiveTab(payload) {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true, url: ['http://*/*', 'https://*/*'] });
        if (tabs.length === 0) return;
        try {
            await chrome.tabs.sendMessage(tabs[0].id, payload);
        } catch (e) {
            console.warn('Message send failed', e);
        }
    }

    
    cleanUrlCheckbox.addEventListener('change', () => {
        const enabled = cleanUrlCheckbox.checked;
        chrome.storage.local.set({ cleanUrlMode: enabled });
        sendMessageToActiveTab({
            action: 'toggleCleanUrl',  
            enabled: enabled,
            triggeredBy: 'popup'  
        });
    });

    settingShortcut.addEventListener('click', () => {
        chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    });

    
const aboutInfo = document.getElementById('aboutinfo');
if (aboutInfo) {
    aboutInfo.addEventListener('click', () => {
        const targetId = aboutInfo.getAttribute('data-target');
        if (targetId) {
            const mainContent = document.getElementById('main-content');
            const aboutDetail = document.getElementById(targetId);
            
            
            aboutDetail.style.display = 'block';
            aboutDetail.classList.add('detail-hidden'); 
            
            
            requestAnimationFrame(() => {
                
                mainContent.classList.add('behind');
                
                
                aboutDetail.classList.remove('detail-hidden');
                aboutDetail.classList.add('detail-active');
            });
            
            
            const backToMain = document.getElementById('back-to-main');
            if (backToMain) {
                backToMain.addEventListener('click', () => {
                    
                    aboutDetail.classList.remove('detail-active');
                    aboutDetail.classList.add('detail-hidden');
                    mainContent.classList.remove('behind');
                    
                    
                    setTimeout(() => {
                        aboutDetail.style.display = 'none';
                        aboutDetail.classList.remove('detail-hidden'); 
                    }, 300);
                }, { once: true });
            }
            
            
            const handleMouseBack = (event) => {
                if (event.button === 3) {
                    event.preventDefault();
                    
                    aboutDetail.classList.remove('detail-active');
                    aboutDetail.classList.add('detail-hidden');
                    mainContent.classList.remove('behind');
                    
                    setTimeout(() => {
                        aboutDetail.style.display = 'none';
                        aboutDetail.classList.remove('detail-hidden'); 
                    }, 300);
                    
                    document.removeEventListener('mousedown', handleMouseBack);
                }
            };
            document.addEventListener('mousedown', handleMouseBack);
        }
    });
}





});

function updatePopupTheme() {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const root = document.body;
    root.classList.toggle('dark', isDark);
    root.classList.toggle('light', !isDark);
    
    document.querySelectorAll('img.setting-arrow').forEach(img => {
        img.src = isDark ? 'icons/arrow-right(dark).svg' : 'icons/arrow-right(light).svg';
    });
    
    document.querySelectorAll('img.external-link-icon').forEach(img => {
        img.src = isDark ? 'icons/external-link(dark).svg' : 'icons/external-link(light).svg';
    });
    
    const arrowImg = document.querySelector('.headerArrow');
    if (arrowImg) {
        arrowImg.src = isDark ? 'icons/headerarrow-left(dark).svg' : 'icons/headerarrow-left(light).svg';
    }
}

window.matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', updatePopupTheme);
document.addEventListener('DOMContentLoaded', updatePopupTheme);


document.getElementById('contactsupport')
    .addEventListener('click', () => {
        chrome.tabs.create({ url: 'mailto:rassvetscript@gmail.com' });
    });

document.getElementById('donatepage')
    .addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://www.patreon.com/c/RassvetScript/membership' });
    });

document.getElementById('officialWebsite')
    .addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://github.com/rassvetscript/Rassvet-Hover-Clipper' });
    });

function localizePopup() {
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(element => {
        const messageKey = element.getAttribute('data-i18n');
        const localizedText = chrome.i18n.getMessage(messageKey);

        if (localizedText) {
            element.textContent = localizedText;
        }
    });

}

document.addEventListener('DOMContentLoaded', localizePopup);


document.addEventListener('DOMContentLoaded', function () {
    var version = chrome.runtime.getManifest().version;  
    document.getElementById('version-display').textContent = chrome.runtime.getManifest().version; 
});


document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
}, true);