const duration = 500; 
const toastDuration = 1000; 


let enabled = false; 
let markdown = false; 
let cleanUrlMode = true; 
let lastLink = null; 


chrome.storage.local.get(['cleanUrlMode', 'markdownMode'], res => {
    cleanUrlMode = res.cleanUrlMode ?? true; 
    markdown = res.markdown ?? false;
});


chrome.storage.local.get(['cleanUrlMode', 'markdownMode'], (result) => {
    cleanUrlMode = result.cleanUrlMode ?? true;
    markdown = result.markdownMode ?? false;
    applyCleanUrlMode();
    applyMarkdownMode();
});


function applyCleanUrlMode() {
    showModeToast(cleanUrlMode); 
    
}

function applyMarkdownMode() {
    
}


function toggleCleanUrlMode() {
    cleanUrlMode = !cleanUrlMode;
    chrome.storage.local.set({ cleanUrlMode });
    applyCleanUrlMode(); 
}


chrome.storage.local.get(['cleanUrlMode', 'markdownMode'], (result) => {
    if (result.cleanUrlMode !== undefined) {
        cleanUrlMode = result.cleanUrlMode;
        applyCleanUrlMode();
    }
    if (result.markdownMode !== undefined) {
        markdown = result.markdownMode;
        applyMarkdownMode();
    }
});


function applyCleanUrlMode() {
    showModeToast(cleanUrlMode); 
    
}

function applyMarkdownMode() {
    
    
}


const savedMode = localStorage.getItem('cleanUrlMode');
if (savedMode !== null) {
    cleanUrlMode = savedMode === 'true'; 
}


const px = n => n + 'px'; 
const log = (...args) => {}; 


function t(key) {
    try {
        return chrome.i18n.getMessage(key) || key; 
    } catch (e) {
        console.error(`i18n error for key: ${key}`);
        return key; 
    }
}


let mouseX;
let mouseY;
document.addEventListener('mousemove', e => {
    mouseX = e.clientX; 
    mouseY = e.clientY;
});


document.addEventListener('keydown', e => {
    if (e.key === 'Shift') {
        log('keydown Shift');
        enabled = true;
        if (lastLink) createIndicator(lastLink);
    } else if (e.key === 'Alt') {
        log('keydown Alt');
        markdown = true;
    } else if (e.altKey && e.shiftKey && e.key === 'C') { 
        toggleCleanUrlMode();
    }
});

document.addEventListener('keyup', e => {
    if (e.key === 'Shift') {
        enabled = false;
        log('keyup Shift');
    } else if (e.key === 'Alt') {
        markdown = false;
        log('keyup Alt');
    }
});


document.addEventListener('mouseover', e => {
    const { target } = e;
    log('mouseover', target.tagName);
    lastLink = target.tagName === 'A' ? target : target.closest('a');
    log('lastLink', lastLink);
    if (lastLink && enabled) {
        createIndicator(lastLink); 
    }
});


function isDarkMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}


function createIndicator(link) {
    log('createIndicator');
    const startWidth = 10;
    const indicator = document.createElement('div');
    try {
        document.body.appendChild(indicator); 
    } catch (err) {
        log('Indicator append failed', err);
        return;
    }
    const { style } = indicator;
    style.position = 'fixed'; 
    style.left = px(mouseX - startWidth / 2);
    style.top = px(mouseY - startWidth / 2);
    style.width = px(startWidth);
    style.height = px(startWidth);
    style.backgroundColor = 'rgba(200, 200, 200, 0.8)';
    style.borderRadius = px(startWidth / 2);
    style.transition = `transform ${duration}ms, opacity ${duration}ms`;
    style.pointerEvents = 'none';
    style.zIndex = '999999999'; 
    style.opacity = '1';

    requestAnimationFrame(() => { 
        style.transform = 'scale(20)';
        style.opacity = '0';
    });

    const rawUrl = link.href;
    const finalUrl = cleanUrlMode ? cleanUrl(rawUrl) : rawUrl; 
    const text = markdown ? `[${link.textContent.replace(/\s+/g, ' ').replace(/\]/g, '\\]').trim()}](${finalUrl})` : finalUrl; 

    copyTextToClipboard(text); 
    showCopiedToast(text, markdown); 

    setTimeout(() => { 
        if (indicator.parentElement) indicator.parentElement.removeChild(indicator);
    }, duration);
}


function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(err => {
            log('Clipboard write failed', err);
        });
    } else {
        const copyFrom = document.createElement('textarea');
        copyFrom.textContent = text;
        document.body.appendChild(copyFrom);
        copyFrom.select();
        document.execCommand('copy');
        copyFrom.blur();
        document.body.removeChild(copyFrom);
    }
}


let activeCopiedToast = null;
let toastTimer = null;

function showCopiedToast(url, isMarkdown = false) {
    if (activeCopiedToast && activeCopiedToast.parentElement) {
        activeCopiedToast.style.transition = 'opacity 50ms';
        activeCopiedToast.style.opacity = '0';
        clearTimeout(toastTimer);
        setTimeout(() => {
            if (activeCopiedToast && activeCopiedToast.parentElement) {
                activeCopiedToast.parentElement.removeChild(activeCopiedToast);
                activeCopiedToast = null;
            }
            displayCopiedToast(url, isMarkdown); 
        }, 75);
    } else {
        displayCopiedToast(url, isMarkdown);
    }
}

function displayCopiedToast(url, isMarkdown = false) {
    const toast = document.createElement('div');
    const colorVar = isMarkdown ? '--markdown-url-highlight' : '--url-highlight';
    const isDark = isDarkMode();
    const iconSrc = chrome.runtime.getURL(`icons/copy(${isDark ? 'dark' : 'light'}).svg`);

    toast.innerHTML = `
        <img src="${iconSrc}" style="width: 16px; height: 16px; margin-right: 8px; vertical-align: middle;">
        <span style="color: var(${colorVar});">${url}</span>
    `;

    toast.classList.add('toast-notification');
    toast.classList.add(isDark ? 'toast-dark' : 'toast-light');
    document.body.appendChild(toast);
    activeCopiedToast = toast;

    requestAnimationFrame(() => {
        toast.style.opacity = '1'; 
        toastTimer = setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.parentElement.removeChild(toast);
                    if (activeCopiedToast === toast) activeCopiedToast = null;
                }
            }, 75); 
        }, toastDuration); 
    });
}


let activeModeToast = null;
let modeToastTimer = null;


function showModeToast(enabled, triggeredBy) {
    if (triggeredBy !== 'popup' && triggeredBy !== 'shortcut') {
        return; 
    }

    
    if (activeModeToast && activeModeToast.parentElement) {
        activeModeToast.style.transition = 'opacity 50ms';
        activeModeToast.style.opacity = 0;
        clearTimeout(modeToastTimer);
        setTimeout(() => {
            if (activeModeToast && activeModeToast.parentElement) {
                activeModeToast.parentElement.removeChild(activeModeToast);
                activeModeToast = null;
            }
            displayModeToast(enabled); 
        }, 75);
    } else {
        displayModeToast(enabled);
    }
}


function displayModeToast(enabled) {
    const toast = document.createElement('div');

    
    const stateColorVar = enabled ? '--on-highlight' : '--off-highlight';

    
    toast.innerHTML = enabled
        ? `${t('cleanUrlMode')} <span style="color: var(${stateColorVar}); font-weight: bold;">${t('cleanUrlModeOn')}</span>`
        : `${t('cleanUrlMode')} <span style="color: var(${stateColorVar}); font-weight: bold;">${t('cleanUrlModeOff')}</span>`;

    
    toast.classList.add('toast-notification');
    toast.classList.add(isDarkMode() ? 'toast-dark' : 'toast-light');

    document.body.appendChild(toast);
    activeModeToast = toast;

    requestAnimationFrame(() => {
        toast.style.opacity = 1; 
    });

    modeToastTimer = setTimeout(() => {
        toast.style.opacity = 0;
        setTimeout(() => {
            if (toast.parentElement) toast.parentElement.removeChild(toast);
            if (activeModeToast === toast) activeModeToast = null;
        }, 75); 
    }, toastDuration); 
}


function cleanUrl(url) {
    const qIdx = url.indexOf('?');
    if (qIdx === -1) return url;
    return url.substring(0, qIdx); 
}

function toggleCleanUrlMode() {
    cleanUrlMode = !cleanUrlMode;
    chrome.storage.local.set({ cleanUrlMode });
    applyCleanUrlMode(); 
}

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get('cleanUrlEnabled', (data) => {
        const enabled = data.cleanUrlEnabled ?? true;
        applyCleanUrlMode(enabled); 
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    
    if (request.action === 'toggleCleanUrl') {
        const enabled = request.enabled ?? !cleanUrlMode ?? true; 
        cleanUrlMode = enabled;
        chrome.storage.local.set({ cleanUrlMode: enabled });
        applyCleanUrlMode(enabled);
        showModeToast(enabled, request.triggeredBy || 'unknown'); 
        sendResponse({ success: true });
        return true; 
    }

    
    if (request.type === 'updateMarkdownMode') {
        markdown = request.value;
        applyMarkdownMode(markdown);
    }
});