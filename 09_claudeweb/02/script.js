// 계산기 로직 (프레임워크 없음)
(function () {
  "use strict";

  const displayEl = document.getElementById("display");
  const historyEl = document.getElementById("history");
  const keysEl = document.querySelector(".keys");

  // 상태
  let current = "0";      // 현재 입력 중인 숫자 문자열
  let previous = null;    // 이전 피연산자 (number)
  let operator = null;    // 선택된 연산자 (+, -, *, /)
  let resetNext = false;  // 다음 숫자 입력 시 디스플레이 교체 여부

  const OP_SYMBOL = { "+": "+", "-": "−", "*": "×", "/": "÷" };

  function isError() {
    return current === "Error";
  }

  // 긴 숫자 처리: 지수 표기 또는 반올림
  function formatNumber(num) {
    if (!isFinite(num)) return "Error";
    if (num === 0) return "0";
    const abs = Math.abs(num);
    // 너무 크거나 작으면 지수 표기
    if (abs >= 1e15 || (abs < 1e-9 && abs > 0)) {
      return num.toExponential(6).replace(/\.?0+e/, "e");
    }
    // 최대 12자리 유효숫자로 반올림
    let str = String(parseFloat(num.toPrecision(12)));
    return str;
  }

  function updateDisplay() {
    displayEl.textContent = current;
    if (operator !== null && previous !== null) {
      historyEl.textContent = formatNumber(previous) + " " + OP_SYMBOL[operator];
    } else {
      historyEl.textContent = "";
    }
    // 연산자 버튼 활성 표시 (다음 피연산자 입력 대기 중일 때)
    document.querySelectorAll(".key--op").forEach((btn) => {
      btn.classList.toggle(
        "active",
        operator !== null && resetNext && btn.dataset.op === operator
      );
    });
  }

  function inputDigit(d) {
    if (isError()) clearAll();
    if (resetNext) {
      current = d;
      resetNext = false;
    } else {
      current = current === "0" ? d : current + d;
    }
    updateDisplay();
  }

  function inputDecimal() {
    if (isError()) clearAll();
    if (resetNext) {
      current = "0.";
      resetNext = false;
    } else if (!current.includes(".")) {
      current += ".";
    }
    updateDisplay();
  }

  function chooseOperator(op) {
    if (isError()) return;
    // 대기 중인 연산이 있고, 방금 연산자를 누른 상태가 아니면 먼저 계산
    if (operator !== null && !resetNext) {
      calculate();
      if (isError()) return;
    }
    previous = parseFloat(current);
    operator = op;
    resetNext = true;
    updateDisplay();
  }

  function calculate() {
    if (operator === null || previous === null) return;
    const a = previous;
    const b = parseFloat(current);
    let result;
    switch (operator) {
      case "+": result = a + b; break;
      case "-": result = a - b; break;
      case "*": result = a * b; break;
      case "/":
        if (b === 0) {
          current = "Error";
          previous = null;
          operator = null;
          resetNext = true;
          updateDisplay();
          return;
        }
        result = a / b;
        break;
      default: return;
    }
    current = formatNumber(result);
    previous = null;
    operator = null;
    resetNext = true;
    updateDisplay();
  }

  function clearAll() {
    current = "0";
    previous = null;
    operator = null;
    resetNext = false;
    updateDisplay();
  }

  function backspace() {
    if (isError()) { clearAll(); return; }
    if (resetNext) return;
    if (current.length <= 1 || (current.length === 2 && current.startsWith("-"))) {
      current = "0";
    } else {
      current = current.slice(0, -1);
    }
    updateDisplay();
  }

  function toggleSign() {
    if (isError()) return;
    if (current === "0") return;
    current = current.startsWith("-") ? current.slice(1) : "-" + current;
    updateDisplay();
  }

  function percent() {
    if (isError()) return;
    current = formatNumber(parseFloat(current) / 100);
    resetNext = true;
    updateDisplay();
  }

  // 버튼 클릭 (이벤트 위임)
  keysEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    if (btn.dataset.digit !== undefined) {
      inputDigit(btn.dataset.digit);
    } else if (btn.dataset.op !== undefined) {
      chooseOperator(btn.dataset.op);
    } else {
      switch (btn.dataset.action) {
        case "clear": clearAll(); break;
        case "sign": toggleSign(); break;
        case "percent": percent(); break;
        case "back": backspace(); break;
        case "decimal": inputDecimal(); break;
        case "equals": calculate(); break;
      }
    }
  });

  // 키보드 입력
  window.addEventListener("keydown", (e) => {
    const k = e.key;
    if (k >= "0" && k <= "9") {
      inputDigit(k);
    } else if (k === ".") {
      inputDecimal();
    } else if (k === "+" || k === "-" || k === "*" || k === "/") {
      e.preventDefault();
      chooseOperator(k);
    } else if (k === "Enter" || k === "=") {
      e.preventDefault();
      calculate();
    } else if (k === "Backspace") {
      backspace();
    } else if (k === "Escape") {
      clearAll();
    } else if (k === "%") {
      percent();
    }
  });

  updateDisplay();
})();
