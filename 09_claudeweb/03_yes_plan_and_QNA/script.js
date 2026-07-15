/* =========================================================
   Neon 계산기 — 바닐라 JS
   기능: 사칙연산 · 소수점/연속계산 · 백스페이스/부호/%
        · 히스토리 · 키보드 입력
   ========================================================= */

// ----- 상태 -----
const state = {
  current: "0",     // 화면에 표시되는 현재 입력값(문자열)
  previous: null,   // 이전 피연산자(숫자)
  operator: null,   // 대기 중인 연산자 ('+', '-', '*', '/')
  overwrite: true,  // 다음 숫자 입력 시 current를 덮어쓸지 여부
};

// ----- DOM -----
const resultEl = document.getElementById("result");
const expressionEl = document.getElementById("expression");
const historyListEl = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");
const keysEl = document.querySelector(".calc__keys");

const OP_SYMBOL = { "+": "+", "-": "−", "*": "×", "/": "÷" };

// ----- 표시 갱신 -----
function formatNumber(numStr) {
  if (numStr === "Error") return "Error";
  // 소수점 이하는 그대로 두고 정수부에만 천 단위 콤마
  const [intPart, decPart] = String(numStr).split(".");
  const sign = intPart.startsWith("-") ? "-" : "";
  const digits = sign ? intPart.slice(1) : intPart;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return sign + grouped + (decPart !== undefined ? "." + decPart : "");
}

function updateDisplay() {
  resultEl.textContent = formatNumber(state.current);

  if (state.operator && state.previous !== null) {
    expressionEl.textContent =
      formatNumber(String(state.previous)) + " " + OP_SYMBOL[state.operator];
  } else {
    expressionEl.innerHTML = "&nbsp;";
  }

  // 선택된 연산자 버튼 하이라이트
  document.querySelectorAll(".key--op").forEach((btn) => {
    btn.classList.toggle(
      "is-selected",
      state.operator === btn.dataset.op && state.overwrite
    );
  });
}

// ----- 숫자/소수점 입력 -----
function inputNumber(digit) {
  if (state.overwrite) {
    state.current = digit;
    state.overwrite = false;
  } else {
    // 선행 0 방지
    state.current = state.current === "0" ? digit : state.current + digit;
  }
  updateDisplay();
}

function inputDecimal() {
  if (state.overwrite) {
    state.current = "0.";
    state.overwrite = false;
  } else if (!state.current.includes(".")) {
    state.current += ".";
  }
  updateDisplay();
}

// ----- 연산 -----
function compute(a, b, op) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? null : a / b; // 0으로 나누기 → null(에러)
  }
}

// 부동소수점 오차 정리 (예: 0.1 + 0.2)
function tidy(num) {
  return parseFloat(num.toPrecision(12));
}

function chooseOperator(nextOp) {
  const inputValue = parseFloat(state.current);

  if (state.operator && !state.overwrite) {
    // 연속 계산: 이전 결과에 이어서 계산
    const answer = compute(state.previous, inputValue, state.operator);
    if (answer === null) return showError();
    state.previous = tidy(answer);
    state.current = String(state.previous);
  } else if (state.previous === null) {
    state.previous = inputValue;
  }

  state.operator = nextOp;
  state.overwrite = true;
  updateDisplay();
}

function equals() {
  if (state.operator === null || state.previous === null) return;

  const inputValue = parseFloat(state.current);
  const answer = compute(state.previous, inputValue, state.operator);
  if (answer === null) return showError();

  const exprText =
    formatNumber(String(state.previous)) +
    " " + OP_SYMBOL[state.operator] + " " +
    formatNumber(state.current) + " =";

  const resultVal = tidy(answer);
  addHistory(exprText, formatNumber(String(resultVal)));

  state.current = String(resultVal);
  state.previous = null;
  state.operator = null;
  state.overwrite = true;

  // '=' 직후에는 상단 수식에 방금 계산식을 남겨줌
  resultEl.textContent = formatNumber(state.current);
  expressionEl.textContent = exprText;
  document.querySelectorAll(".key--op").forEach((b) => b.classList.remove("is-selected"));
}

// ----- 기능 키 -----
function clearAll() {
  state.current = "0";
  state.previous = null;
  state.operator = null;
  state.overwrite = true;
  updateDisplay();
}

function backspace() {
  if (state.overwrite) return;
  if (state.current.length <= 1 || (state.current.length === 2 && state.current.startsWith("-"))) {
    state.current = "0";
    state.overwrite = true;
  } else {
    state.current = state.current.slice(0, -1);
  }
  updateDisplay();
}

function negate() {
  if (state.current === "0" || state.current === "Error") return;
  state.current = state.current.startsWith("-")
    ? state.current.slice(1)
    : "-" + state.current;
  updateDisplay();
}

function percent() {
  const value = parseFloat(state.current);
  if (isNaN(value)) return;
  state.current = String(tidy(value / 100));
  state.overwrite = false;
  updateDisplay();
}

function showError() {
  state.current = "Error";
  state.previous = null;
  state.operator = null;
  state.overwrite = true;
  updateDisplay();
}

// ----- 히스토리 -----
function addHistory(expr, res) {
  const empty = historyListEl.querySelector(".history__empty");
  if (empty) empty.remove();

  const li = document.createElement("li");
  li.innerHTML =
    `<span class="history__expr">${expr}</span>` +
    `<span class="history__res">${res}</span>`;

  // 클릭하면 그 결과를 다시 불러와 이어서 계산
  li.addEventListener("click", () => {
    state.current = res.replace(/,/g, "");
    state.previous = null;
    state.operator = null;
    state.overwrite = true;
    updateDisplay();
  });

  historyListEl.prepend(li);
}

function clearHistory() {
  historyListEl.innerHTML =
    '<li class="history__empty">아직 계산 기록이 없어요</li>';
}

// ----- 버튼 클릭 처리 -----
keysEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".key");
  if (!btn) return;

  if (btn.dataset.num !== undefined) {
    if (state.current === "Error") clearAll();
    inputNumber(btn.dataset.num);
  } else if (btn.dataset.op !== undefined) {
    if (state.current === "Error") return;
    chooseOperator(btn.dataset.op);
  } else {
    switch (btn.dataset.action) {
      case "clear": clearAll(); break;
      case "backspace": backspace(); break;
      case "percent": percent(); break;
      case "negate": negate(); break;
      case "decimal":
        if (state.current === "Error") clearAll();
        inputDecimal();
        break;
      case "equals": equals(); break;
    }
  }
});

clearHistoryBtn.addEventListener("click", clearHistory);

// ----- 키보드 입력 -----
const KEY_MAP = {
  "0": '[data-num="0"]', "1": '[data-num="1"]', "2": '[data-num="2"]',
  "3": '[data-num="3"]', "4": '[data-num="4"]', "5": '[data-num="5"]',
  "6": '[data-num="6"]', "7": '[data-num="7"]', "8": '[data-num="8"]',
  "9": '[data-num="9"]',
  "+": '[data-op="+"]', "-": '[data-op="-"]',
  "*": '[data-op="*"]', "/": '[data-op="/"]',
  ".": '[data-action="decimal"]',
  "Enter": '[data-action="equals"]', "=": '[data-action="equals"]',
  "Backspace": '[data-action="backspace"]',
  "Escape": '[data-action="clear"]',
  "%": '[data-action="percent"]',
};

window.addEventListener("keydown", (e) => {
  const selector = KEY_MAP[e.key];
  if (!selector) return;

  // 스크롤/기본 동작 방지 (특히 Backspace, / 등)
  e.preventDefault();

  const btn = document.querySelector(selector);
  if (!btn) return;

  // 시각적 피드백
  btn.classList.add("is-active");
  setTimeout(() => btn.classList.remove("is-active"), 110);

  btn.click();
});

// ===== 🎉 이스터에그: 코나미 코드 파티모드 =====
// ↑ ↑ ↓ ↓ ← → ← → B A
const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];
let konamiIdx = 0;
let partyOn = false;

window.addEventListener("keydown", (e) => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  konamiIdx = key === KONAMI[konamiIdx] ? konamiIdx + 1 : (key === KONAMI[0] ? 1 : 0);
  if (konamiIdx === KONAMI.length) {
    konamiIdx = 0;
    toggleParty();
  }
});

function toggleParty() {
  partyOn = !partyOn;
  document.body.classList.toggle("party", partyOn);
  if (partyOn) {
    showToast("🎉 PARTY MODE 🎉");
    startConfetti();
  } else {
    showToast("😌 파티 끝!");
    stopConfetti();
  }
}

let toastEl = null;
function showToast(text) {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.className = "party-toast";
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = text;
  // 리플로우 후 슬라이드 인
  requestAnimationFrame(() => toastEl.classList.add("show"));
  clearTimeout(toastEl._timer);
  toastEl._timer = setTimeout(() => toastEl.classList.remove("show"), 2500);
}

let confettiTimer = null;
const CONFETTI_COLORS = ["#7ef9d6", "#ff9ecd", "#b39dff", "#8fd4ff", "#fff59d"];
function startConfetti() {
  if (confettiTimer) return;
  confettiTimer = setInterval(() => {
    const piece = document.createElement("div");
    piece.className = "confetti";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const dur = 2.5 + Math.random() * 2;
    piece.style.animationDuration = dur + "s";
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), dur * 1000);
  }, 120);
}
function stopConfetti() {
  clearInterval(confettiTimer);
  confettiTimer = null;
}

// ----- 초기화 -----
updateDisplay();
