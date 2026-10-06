import test from 'node:test';
import assert from 'node:assert/strict';
import { triageRequests, planInvoiceDispatch } from './workflows.mjs';

const request = { id: 'event-1', email: 'owner@example.test', service: 'website_fix', summary: 'Repair an error on form submission.' };
const client = { clientId: 'client-1', invoiceId: 'invoice-1', email: 'billing@example.test', cycle: 'mid_month' };
const document = { clientId: 'client-1', invoiceId: 'invoice-1', documentId: 'document-1', filename: 'invoice-1.pdf' };
const plan = (overrides = {}) => planInvoiceDispatch({ cycle: 'mid_month', clients: [client], documents: [document], ...overrides });

test('valid request is routed and an identical replay is suppressed', () => {
  assert.deepEqual(triageRequests([request, request]).results.map(r => r.status), ['queued', 'duplicate']);
});
test('changed content under the same event ID requires review', () => {
  const output = triageRequests([request, { ...request, service: 'api_integration' }]);
  assert.equal(output.results[1].reason, 'event_id_conflict');
});
test('saved event ledger suppresses a replay across runs', () => {
  const first = triageRequests([request]);
  assert.equal(triageRequests([request], first.nextEventLedger).results[0].status, 'duplicate');
});
test('distinct requests from the same contact are retained', () => {
  assert.deepEqual(triageRequests([request, { ...request, id: 'event-2' }]).results.map(r => r.status), ['queued', 'queued']);
});
test('unknown service and malformed email require review', () => {
  assert.deepEqual(triageRequests([{ ...request, service: 'unknown' }, { ...request, email: 'bad\n@example.test' }]).results.map(r => r.status), ['review', 'review']);
});
test('invalid payload or conflicting persisted ledger is rejected', () => {
  assert.throws(() => triageRequests({}), TypeError);
  assert.throws(() => triageRequests([], [{ id: 'event-1', fingerprint: 'a'.repeat(64) }, { id: 'event-1', fingerprint: 'b'.repeat(64) }]), TypeError);
});
test('invoice dispatch requires exact client and invoice IDs', () => {
  assert.equal(plan().results[0].status, 'prepared');
  assert.equal(plan({ documents: [{ ...document, clientId: 'client-2' }] }).results[0].reason, 'missing_document');
});
test('ambiguous PDF matches are held for review', () => {
  assert.equal(plan({ documents: [document, { ...document, documentId: 'document-2' }] }).results[0].reason, 'ambiguous_document_match');
});
test('duplicate client rows are held for review', () => {
  assert.ok(plan({ clients: [client, { ...client, email: 'other@example.test' }] }).results.every(r => r.reason === 'duplicate_client_id'));
});
test('successful deliveries are skipped and preparation sends no email', () => {
  const output = plan({ successfulDeliveries: [{ clientId: 'client-1', invoiceId: 'invoice-1' }] });
  assert.equal(output.results[0].reason, 'already_delivered');
  assert.equal(output.externalSideEffects, 0);
  assert.equal(plan().externalSideEffects, 0);
});
test('billing-cycle mismatch is skipped and invalid cycles require review', () => {
  assert.equal(plan({ cycle: 'end_month' }).results[0].reason, 'different_billing_cycle');
  assert.equal(plan({ clients: [{ ...client, cycle: 'weekly' }] }).results[0].reason, 'invalid_billing_cycle');
  assert.throws(() => plan({ cycle: 'weekly' }), TypeError);
});
test('invalid recipients, document metadata and delivery ledgers are rejected', () => {
  assert.equal(plan({ clients: [{ ...client, email: 'invalid' }] }).results[0].reason, 'invalid_email');
  assert.equal(plan({ documents: [{ ...document, filename: '../invoice-1.pdf' }] }).results[0].reason, 'invalid_document_metadata');
  assert.throws(() => plan({ successfulDeliveries: [{}] }), TypeError);
});
