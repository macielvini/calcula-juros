import { recordCalculation } from './scripts/history.js';
import { formatBRL, parseLocaleNumber, parseLocaleNumberOrZero, toInt } from './scripts/utils/number.js';
import { validateInputs } from './scripts/validation.js';

const form = document.getElementById('fee-form');
const calculateBtn = document.getElementById('calculateBtn');
const resetBtn = document.getElementById('resetBtn');

const totalValueEl = document.getElementById('totalValue');
const upfrontEl = document.getElementById('upfrontPayment');
const installmentsEl = document.getElementById('installments');
const feeEl = document.getElementById('feePercent');

const totalErr = document.getElementById('totalValueError');
const upfrontErr = document.getElementById('upfrontPaymentError');
const installmentsErr = document.getElementById('installmentsError');
const feeErr = document.getElementById('feePercentError');

const results = document.getElementById('results');
const finalTotalOut = document.getElementById('finalTotal');
const installmentValueOut = document.getElementById('installmentValue');

function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

function clearErrors() {
  [totalErr, upfrontErr, installmentsErr, feeErr].forEach(hide);
  totalValueEl.removeAttribute('aria-invalid');
  upfrontEl.removeAttribute('aria-invalid');
  installmentsEl.removeAttribute('aria-invalid');
  feeEl.removeAttribute('aria-invalid');
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  clearErrors();
  calculateBtn.disabled = true;

  const total = parseLocaleNumber(totalValueEl.value);
  const upfront = parseLocaleNumberOrZero(upfrontEl.value);
  const installments = toInt(installmentsEl.value);
  const fee = parseLocaleNumber(feeEl.value);

  const { ok, errors } = validateInputs({ total, upfront, installments, fee });
  if (!ok) {
    if (errors.total) { show(totalErr); totalValueEl.setAttribute('aria-invalid', 'true'); }
    if (errors.upfront) { show(upfrontErr); upfrontEl.setAttribute('aria-invalid', 'true'); }
    if (errors.installments) { show(installmentsErr); installmentsEl.setAttribute('aria-invalid', 'true'); }
    if (errors.fee) { show(feeErr); feeEl.setAttribute('aria-invalid', 'true'); }
    calculateBtn.disabled = false;
    return;
  }

  const denominator = (100 - fee) / 100;
  const totalPlusFee = (total - upfront) / denominator;
  const finalTotal = upfront + totalPlusFee;
  const installmentValue = totalPlusFee / installments;

  finalTotalOut.textContent = formatBRL(finalTotal);
  installmentValueOut.textContent = formatBRL(installmentValue);
  show(results);

  calculateBtn.disabled = false;

  // save to history (raw input values for easy repopulation)
  const inputs = {
    totalValue: totalValueEl.value,
    upfrontPayment: upfrontEl.value,
    installments: installmentsEl.value,
    feePercent: feeEl.value
  };
  try {
    recordCalculation(inputs, finalTotal);
  } catch {
    // ignore history errors to avoid breaking the calculator UI
  }
});

resetBtn.addEventListener('click', () => {
  form.reset();
  clearErrors();
  hide(results);
  finalTotalOut.textContent = formatBRL(0);
  installmentValueOut.textContent = formatBRL(0);
});


