// 터미널 입력창, 출력창, 커서
const inputEl  = document.getElementById('hiddenInput');
const outputEl = document.getElementById('output');
const cursorEl = document.getElementById('cursor');

let prevLen   = 0;
let isComposing = false;
let fadeTimer   = null;
let clearTimer  = null;

/**
 * 타이핑 애니메이션
 * @param {string} char
 */
function appendChar(char) {
  if (char === '\n') {
    // 줄바꿈 <br>
    outputEl.appendChild(document.createElement('br'));
    return;
  }
  const span = document.createElement('span');
  span.className = 'fade-in';
  span.textContent = char;
  outputEl.appendChild(span);
  // 애니메이션
  requestAnimationFrame(() => span.classList.add('visible'));
  // 스크롤 하단 고정
  scrollTo(0, document.body.scrollHeight);
}

/**
 * 출력 영역 마지막 글자 페이드
 */
function removeLastChar() {
  const children = outputEl.children;
  if (children.length > 0) {
    outputEl.removeChild(children[children.length - 1]);
  }
}

/**
 * 입력&출력창 동기화
 */
function syncOutput() {
  const val = inputEl.value;
  if (val.length > prevLen) {
    // 새로 입력된 문자 추가
    for (const c of val.slice(prevLen)) appendChar(c);
  } else if (val.length < prevLen) {
    // 삭제된 문자 제거
    for (let i = 0; i < prevLen - val.length; i++) removeLastChar();
  }
  prevLen = val.length;
}

/**
 * IME 조합 입력 부분
 */
inputEl.addEventListener('compositionstart', () => {
  isComposing = true;
});

/**
 * IME 조합 입력 종료
 */
inputEl.addEventListener('compositionend', () => {
  isComposing = false;
  syncOutput();
});

/**
 * 일반 입력 이벤트 처리
 */
inputEl.addEventListener('input', () => {
  if (!isComposing) syncOutput();
});

/**
 * 키보드 입력 처리
 */
document.addEventListener('keydown', (e) => {
  // Backspace
  if (e.key === 'Backspace') {
    e.preventDefault();
    if (prevLen > 0) {
      inputEl.value = inputEl.value.slice(0, -1);
      syncOutput();
    }
    return;
  }
  // Tab
  if (e.key === 'Tab') {
    e.preventDefault();
    inputEl.value += '\t';
    syncOutput();
    return;
  }
  // Delete
  if (e.key === 'Delete') {
    e.preventDefault();
    clearTimeout(fadeTimer);
    clearTimeout(clearTimer);

    // 스윕 애니메이션
    document.body.classList.add('pulse-green');

    // 출력/커서 페이드아웃
    fadeTimer = setTimeout(() => {
      outputEl.classList.add('fade-out');
      cursorEl.classList.add('fade-out');
    }, 500);

    // 애니메이션 종료 후 리셋
    clearTimer = setTimeout(() => {
      document.body.classList.remove('pulse-green');
      outputEl.innerHTML = '';
      inputEl.value = '';
      prevLen = 0;

      // 페이드아웃 해제
      outputEl.classList.remove('fade-out');
      cursorEl.classList.remove('fade-out');
      outputEl.style.opacity = '';
      cursorEl.style.opacity = '';
    }, 1000);
    return;
  }
  // 입력창에 포커싱
  inputEl.focus();
});

/**
 * 입력창에 포커싱
 */
document.addEventListener('click', () => inputEl.focus());