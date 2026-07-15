class Calculator {
  constructor() {
    this.display = document.querySelector('.result');
    this.currentValue = '0';
    this.previousValue = '';
    this.operator = null;
    this.shouldResetDisplay = false;

    this.setupEventListeners();
  }

  setupEventListeners() {
    document.querySelectorAll('[data-value]').forEach(btn => {
      btn.addEventListener('click', e => this.handleNumber(e.target.dataset.value));
    });

    document.querySelectorAll('[data-operator]').forEach(btn => {
      btn.addEventListener('click', e => this.handleOperator(e.target.dataset.operator));
    });

    document.querySelector('[data-action="equals"]').addEventListener('click', () => this.calculate());
    document.querySelector('[data-action="clear"]').addEventListener('click', () => this.clear());
    document.querySelector('[data-action="delete"]').addEventListener('click', () => this.delete());
  }

  handleNumber(value) {
    if (this.shouldResetDisplay) {
      this.currentValue = value;
      this.shouldResetDisplay = false;
    } else {
      this.currentValue = this.currentValue === '0' ? value : this.currentValue + value;
    }
    this.updateDisplay();
  }

  handleOperator(op) {
    if (op === '.') {
      if (!this.currentValue.includes('.')) {
        this.currentValue += '.';
        this.updateDisplay();
      }
      return;
    }

    if (this.previousValue && !this.shouldResetDisplay) {
      this.calculate();
    }

    this.previousValue = this.currentValue;
    this.operator = op;
    this.shouldResetDisplay = true;
  }

  calculate() {
    if (!this.operator || !this.previousValue) return;

    const prev = parseFloat(this.previousValue);
    const current = parseFloat(this.currentValue);
    let result;

    switch (this.operator) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '*':
        result = prev * current;
        break;
      case '/':
        result = current === 0 ? 'Error' : prev / current;
        break;
      default:
        return;
    }

    this.currentValue = result.toString();
    this.operator = null;
    this.previousValue = '';
    this.shouldResetDisplay = true;
    this.updateDisplay();
  }

  clear() {
    this.currentValue = '0';
    this.previousValue = '';
    this.operator = null;
    this.shouldResetDisplay = false;
    this.updateDisplay();
  }

  delete() {
    if (this.currentValue.length === 1) {
      this.currentValue = '0';
    } else {
      this.currentValue = this.currentValue.slice(0, -1);
    }
    this.updateDisplay();
  }

  updateDisplay() {
    this.display.textContent = this.currentValue;
  }
}

new Calculator();
