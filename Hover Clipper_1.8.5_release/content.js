const duration = 500; 
const tooltipDuration = 1000; 


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
  showModeTooltip(cleanUrlMode);  
  
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
  showModeTooltip(cleanUrlMode);  
  
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
  showCopiedUrlTooltip(text); 

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


let activeCopiedUrlTooltip = null;
let copiedTooltipTimer = null;

function showCopiedUrlTooltip(url) {
  if (activeCopiedUrlTooltip && activeCopiedUrlTooltip.parentElement) {
    activeCopiedUrlTooltip.style.transition = 'opacity 50ms';
    activeCopiedUrlTooltip.style.opacity = '0';
    clearTimeout(copiedTooltipTimer);
    setTimeout(() => {
      if (activeCopiedUrlTooltip && activeCopiedUrlTooltip.parentElement) {
        activeCopiedUrlTooltip.parentElement.removeChild(activeCopiedUrlTooltip);
        activeCopiedUrlTooltip = null;
      }
      displayNewCopiedTooltip(url); 
    }, 75);
  } else {
    displayNewCopiedTooltip(url);
  }
}

function displayNewCopiedTooltip(url) {
  const tooltip = document.createElement('div');
  tooltip.innerHTML = `<span style="color: var(--text-primary); font-weight:500;">${t('copied_url')}</span> <span style="color: var(--url-highlight); font-weight:bold;">${url}</span>`;
  tooltip.classList.add('common-tooltip');
  tooltip.classList.add(isDarkMode() ? 'tooltip-dark' : 'tooltip-light'); 

  document.body.appendChild(tooltip);
  activeCopiedUrlTooltip = tooltip;

  requestAnimationFrame(() => {
    tooltip.style.opacity = '1'; 
    copiedTooltipTimer = setTimeout(() => {
      tooltip.style.opacity = '0';
      setTimeout(() => {
        if (tooltip.parentElement) {
          tooltip.parentElement.removeChild(tooltip);
          if (activeCopiedUrlTooltip === tooltip) activeCopiedUrlTooltip = null;
        }
      }, 75); 
    }, tooltipDuration); 
  });
}


let activeModeTooltip = null;
let modeTooltipTimer = null;


function showModeTooltip(enabled, triggeredBy) {
    if (triggeredBy !== 'popup' && triggeredBy !== 'shortcut') {
        return;  
    }
    
    
    if (activeModeTooltip && activeModeTooltip.parentElement) {
        activeModeTooltip.style.transition = 'opacity 50ms';
        activeModeTooltip.style.opacity = 0;
        clearTimeout(modeTooltipTimer);
        setTimeout(() => {
            if (activeModeTooltip && activeModeTooltip.parentElement) {
                activeModeTooltip.parentElement.removeChild(activeModeTooltip);
                activeModeTooltip = null;
            }
            displayNewModeTooltip(enabled);  
        }, 75);
    } else {
        displayNewModeTooltip(enabled);
    }
}


function displayNewModeTooltip(enabled) {
    const tooltip = document.createElement('div');

    
    tooltip.classList.add('common-tooltip');
    tooltip.classList.add(isDarkMode() ? 'tooltip-dark' : 'tooltip-light');

    
    tooltip.innerHTML = enabled 
        ? `<span style="color: var(--text-primary); font-weight:500;">${t('cleanUrlMode')}</span> <span style="color: var(--on-highlight); font-weight:500;">${t('cleanUrlModeOn')}</span>`
        : `<span style="color: var(--text-primary); font-weight:500;">${t('cleanUrlMode')}</span> <span style="color: var(--off-highlight); font-weight:500;">${t('cleanUrlModeOff')}</span>`;
    
    
    tooltip.classList.add('common-tooltip');
    tooltip.classList.add(isDarkMode() ? 'tooltip-dark' : 'tooltip-light');
    
    document.body.appendChild(tooltip);
    activeModeTooltip = tooltip;
    
    requestAnimationFrame(() => {
        tooltip.style.opacity = 1;  
    });
    
    modeTooltipTimer = setTimeout(() => {
        tooltip.style.opacity = 0;
        setTimeout(() => {
            if (tooltip.parentElement) tooltip.parentElement.removeChild(tooltip);
            if (activeModeTooltip === tooltip) activeModeTooltip = null;
        }, 75);  
    }, tooltipDuration);  
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
        showModeTooltip(enabled, request.triggeredBy || 'unknown');  
        sendResponse({ success: true });
        return true;  
    }

    
    if (request.type === 'updateMarkdownMode') {
        markdown = request.value;
        applyMarkdownMode(markdown);
    }
});