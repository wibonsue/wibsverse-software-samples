'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateTotal, formatCents, reproduceLegacyBug } = require('./core.cjs');

test('reproduces decimal truncation and verifies the repaired total', () => {
  assert.equal(reproduceLegacyBug('19.90', '3'), 57);
  assert.equal(formatCents(calculateTotal('19.90', '3')), '59.70');
});
test('keeps small fractions exact in integer minor units', () => {
  assert.equal(calculateTotal('0.10', '3'), 30);
  assert.equal(formatCents(calculateTotal('0.10', '3')), '0.30');
});
test('accepts whole prices and a single decimal digit', () => {
  assert.equal(calculateTotal('20', '2'), 4000);
  assert.equal(calculateTotal('1.5', '2'), 300);
});
test('rejects malformed, negative, zero and excessive-precision prices', () => {
  for (const price of ['', '-1', '0', '1e3', '19,90', '1.999', 'NaN', 'Infinity', '10000000']) {
    assert.throws(() => calculateTotal(price, '1'));
  }
});
test('rejects partial parses, fractional, zero and oversized quantities', () => {
  for (const quantity of ['', '3x', '1.5', '-2', '0', '10000', 'Infinity']) {
    assert.throws(() => calculateTotal('19.90', quantity));
  }
});
test('bounded maximum remains exact and formatting rejects unsafe values', () => {
  assert.equal(calculateTotal('9999999.99', '9999'), 9998999990001);
  assert.throws(() => formatCents(NaN));
  assert.throws(() => formatCents(1.5));
});
