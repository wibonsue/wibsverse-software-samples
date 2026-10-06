'use strict';

function parsePrice(value) {
  if (typeof value !== 'string' || !/^\d{1,7}(?:\.\d{1,2})?$/.test(value.trim())) {
    throw new TypeError('Enter a positive price with at most two decimal places.');
  }
  const [whole, fraction = ''] = value.trim().split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (cents < 1) throw new RangeError('Price must be greater than zero.');
  return cents;
}

function calculateTotal(price, quantity) {
  if (typeof quantity !== 'string' || !/^\d{1,4}$/.test(quantity.trim())) {
    throw new TypeError('Quantity must be a whole number from 1 to 9999.');
  }
  const count = Number(quantity.trim());
  if (count < 1) throw new RangeError('Quantity must be greater than zero.');
  return parsePrice(price) * count;
}

function formatCents(cents) {
  if (!Number.isSafeInteger(cents) || cents < 0) throw new TypeError('Expected non-negative integer cents.');
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;
}

function reproduceLegacyBug(price, quantity) {
  return parseInt(price, 10) * parseInt(quantity, 10);
}

const api = { parsePrice, calculateTotal, formatCents, reproduceLegacyBug };
if (typeof module !== 'undefined') module.exports = api;
if (typeof window !== 'undefined') window.PriceRepair = Object.freeze(api);
