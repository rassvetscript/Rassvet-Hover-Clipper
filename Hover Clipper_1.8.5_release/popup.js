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

    // Clean URL 토글 이벤트 (triggeredBy 추가)
    cleanUrlCheckbox.addEventListener('change', () => {
        const enabled = cleanUrlCheckbox.checked;
        chrome.storage.local.set({ cleanUrlMode: enabled });
        sendMessageToActiveTab({
            action: 'toggleCleanUrl',  // action 통일 (대소문자 주의)
            enabled: enabled,
            triggeredBy: 'popup'  // 필수: 툴팁 표시 트리거
        });
    });

    settingShortcut.addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    });

    // aboutinfo 클릭 이벤트
    const aboutInfo = document.getElementById('aboutinfo');
    if (aboutInfo) {
        aboutInfo.addEventListener('click', () => {
            const targetId = aboutInfo.getAttribute('data-target');
            if (targetId) {
                document.getElementById('main-content').style.display = 'none'; // 메인 콘텐츠 숨기기 (메인 뷰의 ID를 'main-content'로 가정; 실제에 맞게 변경)
                document.getElementById(targetId).style.display = 'block';  // 세부 페이지 표시
                
                // 동적으로 이벤트 리스너 등록 (about-detail 표시 후)
                const backToMain = document.getElementById('back-to-main');  // 이제 div ID
                if (backToMain) {
                    backToMain.addEventListener('click', () => {
                        document.getElementById('about-detail').style.display = 'none';
                        document.getElementById('main-content').style.display = 'block';
                    }, { once: true });  // 한 번만 등록
                }
                // 새로 추가: 마우스 백 버튼 (XButton1) 감지로 뒤로 가기 구현
            const handleMouseBack = (event) => {
                if (event.button === 3) {  // button 3 = XButton1 (마우스 백 버튼)
                    event.preventDefault();  // 기본 동작 방지
                    document.getElementById('about-detail').style.display = 'none';
                    document.getElementById('main-content').style.display = 'block';
                    document.removeEventListener('mousedown', handleMouseBack);  // 이벤트 제거 (중복 방지)
                }
            };
            document.addEventListener('mousedown', handleMouseBack);  // detail 페이지 표시 시 등록
                
            }
        });
    }

    

});

function updatePopupTheme() {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const root = document.body;
        root.classList.toggle('dark', isDark);
        root.classList.toggle('light', !isDark);
        // setting-arrow icon color mode switch
        document.querySelectorAll('img.setting-arrow').forEach(img => {
            img.src = isDark ? 'icons/arrow-right(dark).svg' : 'icons/arrow-right(light).svg';
        });
        // external-link icon color mode switch
        document.querySelectorAll('img.external-link-icon').forEach(img => {
            img.src = isDark ? 'icons/external-link(dark).svg' : 'icons/external-link(light).svg';
        });
        // 추가: arrow 아이콘 src 동적 업데이트 (about-detail에서도 적용)
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

