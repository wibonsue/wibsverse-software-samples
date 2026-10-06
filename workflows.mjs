import { createHash } from 'node:crypto';

const ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const SERVICES = new Set(['website_fix', 'api_integration', 'data_automation']);

function validId(value) {
  return typeof value === 'string' && ID.test(value);
}

function validEmail(value) {
  return typeof value === 'string' && value.length <= 254 && EMAIL.test(value);
}

function hash(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function requireArray(value, name) {
  if (!Array.isArray(value) || value.length > 10000) {
    throw new TypeError(`${name} must be an array with at most 10000 entries.`);
  }
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function triageRequests(requests, previousEvents = []) {
  requireArray(requests, 'requests');
  requireArray(previousEvents, 'previousEvents');
  const events = new Map();
  for (const event of previousEvents) {
    if (!isRecord(event) || !validId(event.id) || !/^[a-f0-9]{64}$/.test(event.fingerprint ?? '')) {
      throw new TypeError('Previous event records require a valid ID and SHA-256 fingerprint.');
    }
    if (events.has(event.id) && events.get(event.id) !== event.fingerprint) {
      throw new TypeError('Conflicting previous event records.');
    }
    events.set(event.id, event.fingerprint);
  }
  const results = [];
  for (const input of requests) {
    if (!isRecord(input) || !validId(input.id)) {
      results.push({ id: null, status: 'review', reason: 'invalid_event_id' });
      continue;
    }
    const email = typeof input.email === 'string' ? input.email.trim() : '';
    const service = input.service;
    if (!validEmail(email) || !SERVICES.has(service)) {
      results.push({ id: input.id, status: 'review', reason: !validEmail(email) ? 'invalid_email' : 'unsupported_service' });
      continue;
    }
    if (typeof input.summary !== 'string' || !input.summary.trim() || input.summary.length > 2000) {
      results.push({ id: input.id, status: 'review', reason: 'invalid_summary' });
      continue;
    }
    const normalized = { id: input.id, email, service, summary: input.summary.trim() };
    const fingerprint = hash(normalized);
    if (events.has(input.id)) {
      const replay = events.get(input.id) === fingerprint;
      results.push({ id: input.id, status: replay ? 'duplicate' : 'review', reason: replay ? 'identical_event_replay' : 'event_id_conflict' });
      continue;
    }
    events.set(input.id, fingerprint);
    results.push({ id: input.id, status: 'queued', queue: service, contact: email, fingerprint });
  }
  return { results, nextEventLedger: [...events].map(([id, fingerprint]) => ({ id, fingerprint })) };
}

export function planInvoiceDispatch({ cycle, clients, documents, successfulDeliveries = [] }) {
  if (cycle !== 'mid_month' && cycle !== 'end_month') {
    throw new TypeError('cycle must be mid_month or end_month.');
  }
  requireArray(clients, 'clients');
  requireArray(documents, 'documents');
  requireArray(successfulDeliveries, 'successfulDeliveries');
  const delivered = new Set();
  for (const entry of successfulDeliveries) {
    if (!isRecord(entry) || !validId(entry.clientId) || !validId(entry.invoiceId)) {
      throw new TypeError('Delivery ledger entries require valid client and invoice IDs.');
    }
    delivered.add(JSON.stringify([entry.clientId, entry.invoiceId]));
  }
  const clientCounts = new Map();
  for (const client of clients) {
    if (isRecord(client) && validId(client.clientId)) {
      clientCounts.set(client.clientId, (clientCounts.get(client.clientId) ?? 0) + 1);
    }
  }
  const results = [];
  for (const client of clients) {
    if (!isRecord(client) || !validId(client.clientId) || !validId(client.invoiceId)) {
      results.push({ clientId: null, status: 'review', reason: 'invalid_ids' });
      continue;
    }
    const base = { clientId: client.clientId, invoiceId: client.invoiceId };
    if (clientCounts.get(client.clientId) !== 1) {
      results.push({ ...base, status: 'review', reason: 'duplicate_client_id' });
      continue;
    }
    if (client.cycle !== 'mid_month' && client.cycle !== 'end_month') {
      results.push({ ...base, status: 'review', reason: 'invalid_billing_cycle' });
      continue;
    }
    if (client.cycle !== cycle) {
      results.push({ ...base, status: 'skipped', reason: 'different_billing_cycle' });
      continue;
    }
    if (!validEmail(client.email)) {
      results.push({ ...base, status: 'review', reason: 'invalid_email' });
      continue;
    }
    if (delivered.has(JSON.stringify([client.clientId, client.invoiceId]))) {
      results.push({ ...base, status: 'skipped', reason: 'already_delivered' });
      continue;
    }
    const matches = documents.filter(doc => isRecord(doc) && doc.clientId === client.clientId && doc.invoiceId === client.invoiceId);
    if (matches.length !== 1) {
      results.push({ ...base, status: 'review', reason: matches.length ? 'ambiguous_document_match' : 'missing_document' });
      continue;
    }
    const document = matches[0];
    if (!validId(document.documentId) || typeof document.filename !== 'string' || !/^[^\r\n\/\\]+\.pdf$/i.test(document.filename)) {
      results.push({ ...base, status: 'review', reason: 'invalid_document_metadata' });
      continue;
    }
    results.push({ ...base, status: 'prepared', recipient: client.email, documentId: document.documentId, filename: document.filename });
  }
  return {
    results,
    externalSideEffects: 0,
    note: 'This is a dispatch plan only. No files are fetched and no email is sent. Prepared items must not be recorded as delivered.'
  };
}
