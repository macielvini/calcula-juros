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
function toNumber(input) { return Number.parseFloat(input.value); }
function toInt(input) { return Number.parseInt(input.value, 10); }
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
function fmt(n) { return brl.format(Number.isFinite(n) ? n : 0); }
function toNumberLocale(input) {
  const raw = typeof input.value === 'string' ? input.value.trim() : '';
  return Number.parseFloat(raw.replace(',', '.'));
}
function toNumberLocaleOrZero(input) {
  const raw = typeof input.value === 'string' ? input.value.trim() : '';
  if (raw === '') return 0;
  const n = Number.parseFloat(raw.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function clearErrors() {
  [totalErr, upfrontErr, installmentsErr, feeErr].forEach(hide);
}

function validateInputs(total, upfront, installments, fee) {
  let ok = true;
  if (!(Number.isFinite(total) && total >= 0)) { show(totalErr); ok = false; }
  if (!(Number.isFinite(upfront) && upfront >= 0 && upfront <= total)) { show(upfrontErr); ok = false; }
  if (!(Number.isInteger(installments) && installments >= 1)) { show(installmentsErr); ok = false; }
  if (!(Number.isFinite(fee) && fee >= 0 && fee < 100)) { show(feeErr); ok = false; }
  return ok;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  clearErrors();
  calculateBtn.disabled = true;

  const total = toNumber(totalValueEl);
  const upfront = toNumberLocaleOrZero(upfrontEl);
  const installments = toInt(installmentsEl);
  const fee = toNumberLocale(feeEl);

  if (!validateInputs(total, upfront, installments, fee)) {
    calculateBtn.disabled = false;
    return;
  }

  const denominator = (100 - fee) / 100;
  const totalPlusFee = (total - upfront) / denominator;
  const finalTotal = upfront + totalPlusFee;
  const installmentValue = totalPlusFee / installments;

  finalTotalOut.textContent = fmt(finalTotal);
  installmentValueOut.textContent = fmt(installmentValue);
  show(results);

  calculateBtn.disabled = false;
});

resetBtn.addEventListener('click', () => {
  form.reset();
  clearErrors();
  hide(results);
  finalTotalOut.textContent = brl.format(0);
  installmentValueOut.textContent = brl.format(0);
});


