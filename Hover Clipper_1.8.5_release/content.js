// Constants (상수 선언: 애니메이션 및 툴팁 지속 시간)
const duration = 500; // Visual feedback animation duration (시각 피드백 애니메이션 재생시간)
const tooltipDuration = 1000; // Tooltip display time (1 second) (안내문구 표시 시간: 1초)

// State Variables (상태 변수: 기능 활성화 여부 및 모드 관리)
let enabled = false; // Shift key enable state (Shift 키 활성화 상태)
let markdown = false; // Alt key markdown mode (Alt 키 마크다운 모드)
let cleanUrlMode = true; // Clean URL mode (default: ON, query params removal) (Clean URL 모드: 기본 ON, 쿼리 제거)
let lastLink = null; // Last hovered link (최근 호버된 링크)

// 초기 상태 로드
chrome.storage.local.get(['cleanUrlMode', 'markdownMode'], res => {
  cleanUrlMode = res.cleanUrlMode ?? true;  // 기본값 ON
  markdown = res.markdown ?? false;
});

// 초기 로드 (오류 방지 기본값 추가)
chrome.storage.local.get(['cleanUrlMode', 'markdownMode'], (result) => {
  cleanUrlMode = result.cleanUrlMode ?? true;
  markdown = result.markdownMode ?? false;
  applyCleanUrlMode();
  applyMarkdownMode();
});

// 즉시 적용 함수 (추가/확장)
function applyCleanUrlMode() {
  showModeTooltip(cleanUrlMode);  // 툴팁 즉시 표시
  // 추가: Clean URL 관련 이벤트 재바인딩 (필요 시, e.g. 복사 함수 재호출)
}

function applyMarkdownMode() {
  // 추가: Markdown 복사 로직 재적용 (필요 시)
}

// toggleCleanUrlMode()도 storage로 동기화
function toggleCleanUrlMode() {
  cleanUrlMode = !cleanUrlMode;
  chrome.storage.local.set({ cleanUrlMode });
  applyCleanUrlMode();  // 즉시 적용
}

// 초기 상태 로드 시에도 적용
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

// 기능 즉시 적용 헬퍼 함수 (새로 추가)
function applyCleanUrlMode() {
  showModeTooltip(cleanUrlMode);  // 토글 상태 툴팁 즉시 표시
  // 추가 로직: 필요 시 URL 클린 관련 이벤트 재바인딩 (e.g., 기존 복사 함수 재호출)
}

function applyMarkdownMode() {
  // 추가 로직: Markdown 복사 관련 이벤트 재바인딩 (e.g., 복사 핸들러 업데이트)
  // 만약 Markdown이 키 이벤트에 의존한다면, 여기서 재설정
}



// Load persisted state (저장된 상태 로드: Clean URL 모드 유지)
const savedMode = localStorage.getItem('cleanUrlMode');
if (savedMode !== null) {
  cleanUrlMode = savedMode === 'true'; // Convert string to boolean (문자열을 불린으로 변환)
}

// Utility Functions (유틸리티 함수: 로그, 픽셀 변환 등)
const px = n => n + 'px'; // Pixel string converter (픽셀 문자열 변환)
const log = (...args) => {}; // Logging (disabled; enable with console.log for debugging) (로그: 디버깅 시 console.log로 변경)

// Localization helper (다국어 지원 헬퍼 함수)
function t(key) {
  try {
    return chrome.i18n.getMessage(key) || key;  // 번역 실패 시 키 반환
  } catch (e) {
    console.error(`i18n error for key: ${key}`);
    return key;  // 기본 fallback
  }
}

// Mouse Position Tracking (마우스 위치 추적: clientX/Y로 브라우저 창 기준)
let mouseX;
let mouseY;
document.addEventListener('mousemove', e => {
  mouseX = e.clientX; // Browser viewport based (스크롤 무시)
  mouseY = e.clientY;
});

// Key Event Listeners (키 이벤트 리스너: Shift/Alt 키 및 토글 핸들링)
document.addEventListener('keydown', e => {
  if (e.key === 'Shift') {
    log('keydown Shift');
    enabled = true;
    if (lastLink) createIndicator(lastLink);
  } else if (e.key === 'Alt') {
    log('keydown Alt');
    markdown = true;
  } else if (e.altKey && e.shiftKey && e.key === 'C') { // Alt + Shift + C for Clean URL toggle (Clean URL 모드 토글)
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

// Mouseover Event Listener (마우스오버 이벤트: 링크 감지 및 인디케이터 생성)
document.addEventListener('mouseover', e => {
  const { target } = e;
  log('mouseover', target.tagName);
  lastLink = target.tagName === 'A' ? target : target.closest('a');
  log('lastLink', lastLink);
  if (lastLink && enabled) {
    createIndicator(lastLink); // Create visual indicator and copy (인디케이터 생성 및 복사)
  }
});

// Mode Detection (브라우저 모드 인식, 없으면 추가)
function isDarkMode() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Core Functionality: Create Visual Indicator and Copy (핵심 기능: 시각 인디케이터 생성 및 클립보드 복사)
function createIndicator(link) {
  log('createIndicator');
  const startWidth = 10;
  const indicator = document.createElement('div');
  try {
    document.body.appendChild(indicator); // Append to body (바디에 추가, 실패 대비)
  } catch (err) {
    log('Indicator append failed', err);
    return;
  }

  const { style } = indicator;
  style.position = 'fixed'; // Fixed to viewport (스크롤 무시)
  style.left = px(mouseX - startWidth / 2);
  style.top = px(mouseY - startWidth / 2);
  style.width = px(startWidth);
  style.height = px(startWidth);
  style.backgroundColor = 'rgba(200, 200, 200, 0.8)';
  style.borderRadius = px(startWidth / 2);
  style.transition = `transform ${duration}ms, opacity ${duration}ms`;
  style.pointerEvents = 'none';
  style.zIndex = '999999999'; // High z-index to avoid overlap (가려짐 방지)
  style.opacity = '1';

  requestAnimationFrame(() => { // Animation start (애니메이션 시작: 스케일 및 페이드아웃)
    style.transform = 'scale(20)';
    style.opacity = '0';
  });

  const rawUrl = link.href;
  const finalUrl = cleanUrlMode ? cleanUrl(rawUrl) : rawUrl; // Apply Clean URL if enabled (Clean URL 적용)
  const text = markdown ? `[${link.textContent.replace(/\s+/g, ' ').replace(/\]/g, '\\]').trim()}](${finalUrl})` : finalUrl; // Markdown or plain URL (마크다운 또는 일반 URL)

  copyTextToClipboard(text); // Copy to clipboard (클립보드 복사)
  showCopiedUrlTooltip(text); // Show copied URL tooltip (복사 툴팁 표시)

  setTimeout(() => { // Remove indicator after animation (애니메이션 후 제거)
    if (indicator.parentElement) indicator.parentElement.removeChild(indicator);
  }, duration);
}

// Clipboard Copy Function (클립보드 복사 함수: Navigator API 우선, fallback 지원)
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

// Tooltip Functionality: Copied URL Tooltip (툴팁 기능: 복사된 URL 표시, 중첩 방지 및 크로스 페이드)
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
      displayNewCopiedTooltip(url); // Create new after fade out (페이드아웃 후 새 생성)
    }, 75);
  } else {
    displayNewCopiedTooltip(url);
  }
}

function displayNewCopiedTooltip(url) {
  const tooltip = document.createElement('div');
  tooltip.innerHTML = `<span style="color: var(--text-primary); font-weight:500;">${t('copied_url')}</span> <span style="color: var(--url-highlight); font-weight:bold;">${url}</span>`;
  tooltip.classList.add('common-tooltip');
  tooltip.classList.add(isDarkMode() ? 'tooltip-dark' : 'tooltip-light'); // 모드에 따라 클래스 스위칭

  document.body.appendChild(tooltip);
  activeCopiedUrlTooltip = tooltip;

  requestAnimationFrame(() => {
    tooltip.style.opacity = '1'; // Fade in (페이드 인)
    copiedTooltipTimer = setTimeout(() => {
      tooltip.style.opacity = '0';
      setTimeout(() => {
        if (tooltip.parentElement) {
          tooltip.parentElement.removeChild(tooltip);
          if (activeCopiedUrlTooltip === tooltip) activeCopiedUrlTooltip = null;
        }
      }, 75); // Remove after fade out (페이드아웃 후 제거)
    }, tooltipDuration); // Display duration after fade-in (표시 시간)
  });
}

// Tooltip Functionality: Clean URL Mode Tooltip (툴팁 기능: Clean URL 모드 토글 표시, 중첩 방지 및 크로스 페이드)
let activeModeTooltip = null;
let modeTooltipTimer = null;

// 트리거 기반 토글 메시지 함수 (기존 showModeTooltip에 트리거 조건 추가)
function showModeTooltip(enabled, triggeredBy) {
    if (triggeredBy !== 'popup' && triggeredBy !== 'shortcut') {
        return;  // 페이지 로드 시 등 자동 호출 방지
    }
    
    // 기존 activeModeTooltip 관리 로직 유지 (페이드아웃 후 새 툴팁 생성)
    if (activeModeTooltip && activeModeTooltip.parentElement) {
        activeModeTooltip.style.transition = 'opacity 50ms';
        activeModeTooltip.style.opacity = 0;
        clearTimeout(modeTooltipTimer);
        setTimeout(() => {
            if (activeModeTooltip && activeModeTooltip.parentElement) {
                activeModeTooltip.parentElement.removeChild(activeModeTooltip);
                activeModeTooltip = null;
            }
            displayNewModeTooltip(enabled);  // 새 툴팁 생성
        }, 75);
    } else {
        displayNewModeTooltip(enabled);
    }
}

// 새 툴팁 표시 함수 (CSS 클래스 적용)
function displayNewModeTooltip(enabled) {
    const tooltip = document.createElement('div');

    /* ① styles.css 클래스 연결 */
    tooltip.classList.add('common-tooltip');
    tooltip.classList.add(isDarkMode() ? 'tooltip-dark' : 'tooltip-light');

    // innerHTML: 스타일 없이 텍스트만 (색상은 CSS 변수로)
    tooltip.innerHTML = enabled 
        ? `<span style="color: var(--text-primary); font-weight:500;">${t('cleanUrlMode')}</span> <span style="color: var(--on-highlight); font-weight:500;">${t('cleanUrlModeOn')}</span>`
        : `<span style="color: var(--text-primary); font-weight:500;">${t('cleanUrlMode')}</span> <span style="color: var(--off-highlight); font-weight:500;">${t('cleanUrlModeOff')}</span>`;
    
    // CSS 클래스 추가 (styles.css 기반)
    tooltip.classList.add('common-tooltip');
    tooltip.classList.add(isDarkMode() ? 'tooltip-dark' : 'tooltip-light');
    
    document.body.appendChild(tooltip);
    activeModeTooltip = tooltip;
    
    requestAnimationFrame(() => {
        tooltip.style.opacity = 1;  // 페이드인
    });
    
    modeTooltipTimer = setTimeout(() => {
        tooltip.style.opacity = 0;
        setTimeout(() => {
            if (tooltip.parentElement) tooltip.parentElement.removeChild(tooltip);
            if (activeModeTooltip === tooltip) activeModeTooltip = null;
        }, 75);  // 페이드아웃 후 제거
    }, tooltipDuration);  // 표시 지속 시간 (기존 상수 유지)
}


// Clean URL Functionality (Clean URL 기능: 쿼리 매개변수 제거 및 토글)
function cleanUrl(url) {
  const qIdx = url.indexOf('?');
  if (qIdx === -1) return url;
  return url.substring(0, qIdx); // Remove query params (쿼리 제거)
}

function toggleCleanUrlMode() {
  cleanUrlMode = !cleanUrlMode;
  chrome.storage.local.set({ cleanUrlMode });
  applyCleanUrlMode();  // 즉시 적용
}

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get('cleanUrlEnabled', (data) => {
        const enabled = data.cleanUrlEnabled ?? true;
        applyCleanUrlMode(enabled);  // 상태 적용만, showModeTooltip 호출 제거
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Clean URL 토글 (단축키/popup 공통)
    if (request.action === 'toggleCleanUrl') {
        const enabled = request.enabled ?? !cleanUrlMode ?? true;  // undefined 방지, 기본 true
        cleanUrlMode = enabled;
        chrome.storage.local.set({ cleanUrlMode: enabled });
        applyCleanUrlMode(enabled);
        showModeTooltip(enabled, request.triggeredBy || 'unknown');  // triggeredBy 없으면 로그로 확인
        sendResponse({ success: true });
        return true;  // 비동기 응답 허용
    }

    // Markdown 업데이트 (기존 유지)
    if (request.type === 'updateMarkdownMode') {
        markdown = request.value;
        applyMarkdownMode(markdown);
    }
});
