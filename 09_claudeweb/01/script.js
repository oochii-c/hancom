// ===== Calculator with toggleable engineering (scientific) mode =====

const calculator = document.getElementById("calculator");
const engToggle = document.getElementById("engToggle");
const engPad = document.getElementById("engPad");
const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const degRadBtn = document.getElementById("degRad");

// 상태
let tokens = [];          // 입력 토큰 배열 (내부 표현)
let deg = true;           // 각도 모드: true=DEG, false=RAD
let justEvaluated = false; // 방금 '=' 눌렀는지

// ---------- 토큰 → 화면 표시 매핑 ----------
const DISPLAY_MAP = {
  "*": "×", "/": "÷", "-": "−", "^": "^",
  "sqrt(": "√(", "cbrt(": "∛(", "abs(": "|",
  "sin(": "sin(", "cos(": "cos(", "tan(": "tan(",
  "ln(": "ln(", "log(": "log(", "exp(": "exp(", "1/(": "1/(",
  "pi": "π", "e": "e", "!": "!", "%": "%",
};

// ---------- 토큰 → JS 평가식 매핑 ----------
const JS_MAP = {
  "*": "*", "/": "/", "-": "-", "^": "**",
  "sqrt(": "sqrt(", "cbrt(": "cbrt(", "abs(": "abs(",
  "sin(": "sin(", "cos(": "cos(", "tan(": "tan(",
  "ln(": "ln(", "log(": "log(", "exp(": "exp(", "1/(": "1/(",
  "pi": "pi", "e": "e", "%": "/100",
};

// ---------- 유틸 ----------
function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function lastToken() {
  return tokens[tokens.length - 1];
}

function isNumberChar(t) {
  return /^[0-9.]$/.test(t);
}

function isOperator(t) {
  return ["+", "-", "*", "/", "^"].includes(t);
}

// 현재 뒤쪽에 쌓인 숫자 세그먼트의 시작 인덱스
function currentNumberStart() {
  let i = tokens.length;
  while (i > 0 && isNumberChar(tokens[i - 1])) i--;
  return i;
}

// ---------- 화면 갱신 ----------
function updateDisplay() {
  const expr = tokens
    .map((t) => DISPLAY_MAP[t] !== undefined ? DISPLAY_MAP[t] : t)
    .join("");
  expressionEl.innerHTML = expr === "" ? "&nbsp;" : expr;

  // 미리보기 결과
  try {
    const preview = evaluate();
    if (preview !== null && Number.isFinite(preview)) {
      resultEl.textContent = formatNumber(preview);
    }
  } catch (_) {
    /* 계산 불가한 중간 상태는 무시 */
  }
  if (tokens.length === 0) resultEl.textContent = "0";
}

function formatNumber(n) {
  if (!Number.isFinite(n)) return "Error";
  // 부동소수 오차 정리
  const rounded = Math.round(n * 1e12) / 1e12;
  return String(rounded);
}

// ---------- 평가 ----------
function evaluate() {
  if (tokens.length === 0) return null;

  let js = tokens
    .map((t) => (JS_MAP[t] !== undefined ? JS_MAP[t] : t))
    .join("");

  // 팩토리얼: 숫자/π/e/) 뒤의 ! 를 fact(...) 로 변환
  js = js.replace(/(\d+\.?\d*|pi|e)!/g, "fact($1)");

  // 괄호 자동 닫기
  const open = (js.match(/\(/g) || []).length;
  const close = (js.match(/\)/g) || []).length;
  if (open > close) js += ")".repeat(open - close);

  const toRad = deg ? Math.PI / 180 : 1;
  const scope = {
    pi: Math.PI,
    e: Math.E,
    sqrt: Math.sqrt,
    cbrt: Math.cbrt,
    abs: Math.abs,
    exp: Math.exp,
    ln: Math.log,
    log: Math.log10,
    fact: factorial,
    sin: (x) => Math.sin(x * toRad),
    cos: (x) => Math.cos(x * toRad),
    tan: (x) => Math.tan(x * toRad),
  };

  const fn = new Function(...Object.keys(scope), `return (${js});`);
  const value = fn(...Object.values(scope));
  return typeof value === "number" ? value : null;
}

// ---------- 입력 처리 ----------
function pushNumber(ch) {
  if (justEvaluated) {
    tokens = [];
    justEvaluated = false;
  }
  // 소수점 중복 방지
  if (ch === ".") {
    const start = currentNumberStart();
    const seg = tokens.slice(start).join("");
    if (seg.includes(".")) return;
    if (seg === "") tokens.push("0"); // 앞에 0 자동 추가
  }
  tokens.push(ch);
  updateDisplay();
}

function pushOperator(op) {
  if (justEvaluated) justEvaluated = false;
  if (tokens.length === 0) {
    if (op === "-") tokens.push("-"); // 음수 시작 허용
    else return;
  } else if (isOperator(lastToken())) {
    tokens[tokens.length - 1] = op; // 연산자 교체
  } else {
    tokens.push(op);
  }
  updateDisplay();
}

function pushFunc(fn) {
  if (justEvaluated) {
    tokens = [];
    justEvaluated = false;
  }
  tokens.push(fn + "(");
  updateDisplay();
}

function pushParen(p) {
  if (justEvaluated) justEvaluated = false;
  tokens.push(p);
  updateDisplay();
}

function pushConst(name) {
  if (justEvaluated) {
    tokens = [];
    justEvaluated = false;
  }
  if (name === "rand") {
    String(Math.random()).split("").forEach((c) => tokens.push(c));
  } else {
    tokens.push(name); // pi | e
  }
  updateDisplay();
}

function applyPostfix(sym) {
  // n! 또는 % : 뒤에 붙임
  if (tokens.length === 0) return;
  justEvaluated = false;
  tokens.push(sym);
  updateDisplay();
}

function applySquare() {
  if (justEvaluated) justEvaluated = false;
  tokens.push("^", "2");
  updateDisplay();
}

function applyPow10() {
  if (justEvaluated) {
    tokens = [];
    justEvaluated = false;
  }
  tokens.push("1", "0", "^");
  updateDisplay();
}

function negate() {
  if (tokens.length === 0) return;
  const start = currentNumberStart();
  if (start >= tokens.length) return; // 뒤가 숫자가 아니면 무시
  const before = tokens[start - 1];
  if (before === "-" && (start - 1 === 0 || isOperator(tokens[start - 2]) || tokens[start - 2] === "(")) {
    tokens.splice(start - 1, 1); // 음수 → 양수
  } else {
    tokens.splice(start, 0, "-"); // 양수 → 음수
  }
  updateDisplay();
}

function backspace() {
  if (justEvaluated) justEvaluated = false;
  tokens.pop();
  updateDisplay();
}

function clearAll() {
  tokens = [];
  justEvaluated = false;
  expressionEl.innerHTML = "&nbsp;";
  resultEl.textContent = "0";
}

function equals() {
  if (tokens.length === 0) return;
  try {
    const value = evaluate();
    if (value === null || !Number.isFinite(value)) {
      resultEl.textContent = "Error";
      return;
    }
    const result = formatNumber(value);
    expressionEl.innerHTML =
      tokens.map((t) => (DISPLAY_MAP[t] !== undefined ? DISPLAY_MAP[t] : t)).join("") + " =";
    resultEl.textContent = result;
    tokens = result.split(""); // 결과를 다음 계산의 피연산자로
    justEvaluated = true;
  } catch (_) {
    resultEl.textContent = "Error";
  }
}

// ---------- 버튼 이벤트 위임 ----------
document.querySelectorAll(".pad").forEach((pad) => {
  pad.addEventListener("click", (e) => {
    const btn = e.target.closest("button.btn");
    if (!btn) return;
    const d = btn.dataset;

    if (d.num !== undefined) pushNumber(d.num);
    else if (d.op !== undefined) pushOperator(d.op);
    else if (d.func !== undefined) handleFunc(d.func);
    else if (d.const !== undefined) pushConst(d.const);
    else if (d.paren !== undefined) pushParen(d.paren);
    else if (d.action !== undefined) handleAction(d.action);
    else if (d.toggleDeg !== undefined) toggleDeg();
  });
});

function handleFunc(f) {
  switch (f) {
    case "sqrt": case "cbrt": case "abs":
    case "sin": case "cos": case "tan":
    case "ln": case "log": case "exp":
      pushFunc(f); break;
    case "inv": pushParen("1/("); break;
    case "square": applySquare(); break;
    case "pow10": applyPow10(); break;
    case "fact": applyPostfix("!"); break;
    case "percent": applyPostfix("%"); break;
    case "negate": negate(); break;
  }
}

function handleAction(a) {
  if (a === "clear") clearAll();
  else if (a === "back") backspace();
  else if (a === "equals") equals();
}

// ---------- ENG 토글 ----------
engToggle.addEventListener("click", () => {
  const on = engToggle.getAttribute("aria-pressed") === "true";
  const next = !on;
  engToggle.setAttribute("aria-pressed", String(next));
  engPad.hidden = !next;
  calculator.classList.toggle("is-eng", next);
});

// ---------- DEG / RAD ----------
function toggleDeg() {
  deg = !deg;
  degRadBtn.textContent = deg ? "DEG" : "RAD";
  degRadBtn.classList.toggle("is-rad", !deg);
  updateDisplay();
}

// ---------- 키보드 지원 ----------
document.addEventListener("keydown", (e) => {
  const k = e.key;
  if (/^[0-9]$/.test(k)) pushNumber(k);
  else if (k === ".") pushNumber(".");
  else if (k === "+" || k === "-" || k === "*" || k === "/") pushOperator(k);
  else if (k === "^") pushOperator("^");
  else if (k === "(" || k === ")") pushParen(k);
  else if (k === "Enter" || k === "=") { e.preventDefault(); equals(); }
  else if (k === "Backspace") backspace();
  else if (k === "Escape") clearAll();
  else if (k === "%") applyPostfix("%");
  else if (k === "!") applyPostfix("!");
});
