'use strict';
const form = document.getElementById('calculator');
const legacy = document.getElementById('legacy');
const fixed = document.getElementById('fixed');
const difference = document.getElementById('difference');
const error = document.getElementById('error');
function compare(event) {
  event?.preventDefault();
  legacy.textContent = '—';
  fixed.textContent = '—';
  difference.textContent = '';
  error.textContent = '';
  try {
    const price = document.getElementById('price').value;
    const quantity = document.getElementById('quantity').value;
    const cents = window.PriceRepair.calculateTotal(price, quantity);
    const broken = window.PriceRepair.reproduceLegacyBug(price, quantity);
    legacy.textContent = `$${broken.toFixed(2)}`;
    fixed.textContent = `$${window.PriceRepair.formatCents(cents)}`;
    difference.textContent = `Difference: $${window.PriceRepair.formatCents(cents - broken * 100)} lost by the original calculation.`;
  } catch (failure) {
    error.textContent = failure.message;
  }
}
form.addEventListener('submit', compare);
compare();
