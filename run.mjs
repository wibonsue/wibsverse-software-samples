import { writeFile } from 'node:fs/promises';
import { triageRequests, planInvoiceDispatch } from './workflows.mjs';

const sampleRequest = { id: 'event-1', email: 'owner@example.test', service: 'website_fix', summary: 'Repair a broken contact form.' };
const sampleClient = { clientId: 'client-1', invoiceId: 'invoice-1', email: 'billing@example.test', cycle: 'mid_month' };
const report = {
  label: 'Synthetic technical demonstration. No real client work, external integrations or revenue.',
  requestTriage: triageRequests([
    sampleRequest,
    sampleRequest,
    { ...sampleRequest, service: 'api_integration' },
    { ...sampleRequest, id: 'event-2', email: 'invalid' },
    { ...sampleRequest, id: 'event-3', service: 'data_automation' }
  ]),
  invoiceDispatch: planInvoiceDispatch({
    cycle: 'mid_month',
    clients: [sampleClient, { ...sampleClient, clientId: 'client-2', invoiceId: 'invoice-2' }],
    documents: [{ clientId: 'client-1', invoiceId: 'invoice-1', documentId: 'document-1', filename: 'invoice-1.pdf' }]
  })
};
await writeFile(new URL('./sample-results.json', import.meta.url), `${JSON.stringify(report, null, 2)}\n`, { encoding: 'utf8' });
console.log('Wrote synthetic sample-results.json. No external services were contacted.');
