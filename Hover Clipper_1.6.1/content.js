/*

Copyright Notice:

© 2025 Mir Petenka ┃ All rights reserved

SPDX-FileCopyrightText: © 2025 Mir Petenka

SPDX-License-Identifier : MIT

This software was developed by Mir Petenka with significant

assistance from Perplexity AI’s large-language-model service.

Natural-language prompts were authored by , and

Perplexity AI generated code snippets that were curated,

modified, and integrated by the author.

Perplexity AI does not claim ownership of the resulting

source; all intellectual-property rights in the final work

remain with the above-named copyright holder.

For attribution purposes, please cite:

“Code generation assisted by Perplexity AI (2025)”

*/

/*

* Version History:

* - v1.0.0 (2025-09-05): 초기 버전. Shift 키로 링크 복사 기능 구현.

* - v1.1.0 (2025-09-06): OS별 Meta키 기반 Markdown데이터 복사 기능 구현.

* - v1.2.0 (2025-09-06): 시각적 피드백 기능 구현.

* - v1.3.0 (2025-09-06): 중국어 대응.

* - v1.4.0 (2025-09-07): Meta키 입력을 Alt키 입력으로 대체. 러시아어, 일본어, 에스파냐어 대응.

* - v1.4.1 (2025-09-07): 시각 피드백 애니메이션 최적화.

* - v1.5.0 (2025-09-09): 복사 시 1초 동안 "Copied URL in clipboard: [URL]" 안내문구 표시 기능 추가.

* - v1.5.1 (2025-09-09): 안내문구가 복사 기능을 방해하지 않도록 pointer-events: none 적용.

* - v1.6.0 (2025-09-10): Clean URL 모드 추가 (쿼리 매개변수 제거). Alt+Shift+C로 토글, 토글 시 1초 안내문구 표시.

* - v1.6.1 (2025-09-10): Clean URL 모드 기본값 ON으로 변경. localStorage로 상태 유지 (새로고침/재시작 후 설정 유지).

*/

const duration = 500 // 시각 피드백 애니메이션 재생시간
const tooltipDuration = 1000 // 안내문구 표시 시간 (1초)

let enabled = false
let markdown = false
let cleanUrlMode = true  // 수정: 기본값 ON (쿼리 제거 활성화)
const savedMode = localStorage.getItem('cleanUrlMode')  // 저장된 상태 로드
if (savedMode !== null) {
  cleanUrlMode = savedMode === 'true'  // 문자열 'true'/'false'로 변환
}
let lastLink = null

const px = n => n + 'px'

const log = (...args) => {} // console.log(...args)로 변경해 로그 확인

document.addEventListener('keydown', e => {
  if (e.key === 'Shift') {
    log('keydown Shift')
    enabled = true
    if (lastLink) createIndicator(lastLink)
  } else if (e.key === 'Alt') {
    log('keydown Alt')
    markdown = true
  } else if (e.altKey && e.shiftKey && e.key === 'C') { // Alt + Shift + C로 토글
    toggleCleanUrlMode()
  }
})

document.addEventListener('keyup', e => {
  if (e.key === 'Shift') {
    enabled = false
    log('keyup Shift')
  } else if (e.key === 'Alt') {
    markdown = false
    log('keyup Alt')
  }
})

document.addEventListener('mouseover', e => {
  const { target } = e
  log('mouseover', target.tagName)
  lastLink = target.tagName === 'A' ? target : target.closest('a')
  log('lastLink', lastLink)
  if (lastLink && enabled) {
    createIndicator(e.target)
  }
})

let mouseX
let mouseY
document.addEventListener('mousemove', e => {
  mouseX = e.clientX // 변경: clientX로 브라우저 창 기준 (스크롤 무시)
  mouseY = e.clientY // 변경: clientY로 브라우저 창 기준
})

function createIndicator(link) {
  log('createIndicator')
  const startWidth = 10
  const indicator = document.createElement('div')

  try {
    document.body.appendChild(indicator) // 추가 실패 대비
  } catch (err) {
    log('Indicator append failed', err)
    return
  }

  const { style } = indicator
  style.position = 'fixed' // 재설계: fixed로 브라우저 창에 고정 (스크롤 무시)
  style.left = px(mouseX - startWidth / 2)
  style.top = px(mouseY - startWidth / 2)
  style.width = px(startWidth)
  style.height = px(startWidth)
  style.backgroundColor = 'rgba(200, 200, 200, 0.8)'
  style.borderRadius = px(startWidth / 2)
  style.transition = `transform ${duration}ms, opacity ${duration}ms`
  style.pointerEvents = 'none'
  style.zIndex = '999999999' // 높여 가려짐 방지
  style.opacity = '1'

  requestAnimationFrame(() => { // 재설계: 타이밍 최적화
    style.transform = 'scale(20)'
    style.opacity = '0'
  })

  const rawUrl = link.href
  const finalUrl = cleanUrlMode ? cleanUrl(rawUrl) : rawUrl // 새 기능: Clean URL 적용
  const text = markdown ? `[${link.textContent.replace(/\s+/g, ' ').replace(/\]/g, '\\]').trim()}](${finalUrl})` : finalUrl
  copyTextToClipboard(text)

  // 새 기능: 복사된 URL 안내문구 표시
  showCopiedUrlTooltip(text)

  setTimeout(() => {
    if (indicator.parentElement) indicator.parentElement.removeChild(indicator)
  }, duration)
}

function copyTextToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(err => {
      log('Clipboard write failed', err)
    })
  } else {
    var copyFrom = document.createElement('textarea')
    copyFrom.textContent = text
    document.body.appendChild(copyFrom)
    copyFrom.select()
    document.execCommand('copy')
    copyFrom.blur()
    document.body.removeChild(copyFrom)
  }
}

// 새 함수: 복사된 URL 안내문구 표시 (v1.5.0 추가, v1.5.1 수정: pointer-events: none)
function showCopiedUrlTooltip(url) {
  const tooltip = document.createElement('div')
  tooltip.textContent = `Copied URL in clipboard: ${url}` // 요청하신 문구 (URL은 줄 바꿈 없이 표시, 필요 시 조정)
  const { style } = tooltip
  style.position = 'fixed'
  style.left = '50%'
  style.top = '10%'  // 화면 상단 중앙
  style.transform = 'translateX(-50%)'
  style.padding = '10px 20px'
  style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
  style.color = 'white'
  style.fontSize = '14px'
  style.fontFamily = 'sans-serif'
  style.borderRadius = '5px'
  style.zIndex = '1000000000' // 다른 요소 위에 표시
  style.textAlign = 'center'
  style.maxWidth = '80%'  // 긴 URL 대비 줄 바꿈
  style.wordBreak = 'break-all'  // 긴 URL 자동 줄 바꿈
  style.opacity = '1'
  style.transition = 'opacity 300ms'  // 부드러운 fade out
  style.pointerEvents = 'none'  // 수정: 마우스 이벤트 투과 (복사 기능 방해 방지)

  document.body.appendChild(tooltip)

  setTimeout(() => {
    style.opacity = '0'
    setTimeout(() => {
      if (tooltip.parentElement) {
        tooltip.parentElement.removeChild(tooltip)
      }
    }, 300)  // fade out 후 제거
  }, tooltipDuration)  // 1초 표시
}

// 새 함수: Clean URL 모드 토글 안내문구 표시 (v1.6.0 추가)
function showModeTooltip(enabled) {
  const tooltip = document.createElement('div')
  tooltip.textContent = enabled ? "Clean URL mode ON" : "Clean URL mode OFF"
  const { style } = tooltip
  style.position = 'fixed'
  style.left = '50%'
  style.top = '10%'  // 화면 상단 중앙
  style.transform = 'translateX(-50%)'
  style.padding = '10px 20px'
  style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
  style.color = 'white'
  style.fontSize = '14px'
  style.fontFamily = 'sans-serif'
  style.borderRadius = '5px'
  style.zIndex = '1000000000'
  style.textAlign = 'center'
  style.maxWidth = '80%'
  style.wordBreak = 'break-all'
  style.opacity = '1'
  style.transition = 'opacity 300ms'
  style.pointerEvents = 'none'  // 마우스 이벤트 투과

  document.body.appendChild(tooltip)

  setTimeout(() => {
    style.opacity = '0'
    setTimeout(() => {
      if (tooltip.parentElement) {
        tooltip.parentElement.removeChild(tooltip)
      }
    }, 300)
  }, tooltipDuration)  // 1초 표시
}

// 새 함수: URL에서 쿼리 매개변수 제거 (v1.6.0 추가)
function cleanUrl(url) {
  const qIdx = url.indexOf('?')
  if (qIdx === -1) return url
  return url.substring(0, qIdx)
}

// 새 함수: Clean URL 모드 토글 및 저장 (v1.6.1 추가)
function toggleCleanUrlMode() {
  cleanUrlMode = !cleanUrlMode
  localStorage.setItem('cleanUrlMode', cleanUrlMode ? 'true' : 'false')  // 상태 저장
  showModeTooltip(cleanUrlMode)
}
