WORKFLOW DELIVERY SAMPLES

Two original JavaScript demonstrations using synthetic data. These are portfolio samples, not deployed customer systems and not Make/n8n integration exports.

Requirements: Node.js 22 or newer. No packages, keys or accounts required.
Run examples: node run.mjs
Run checks: node --test workflows.test.mjs

REQUEST TRIAGE
Validates request identifiers, contact addresses, service categories and a brief. Routes accepted requests to a named queue. An identical event replay is suppressed; changed content under a reused event ID is held for review. A saved event ledger can be supplied on subsequent runs. Different legitimate requests from one contact remain distinct.

INVOICE DISPATCH PLANNING
Uses exact client and invoice identifiers to select one document record and one recipient. Holds ambiguous matches, duplicate client records, missing documents and invalid metadata for review. Previously successful deliveries are skipped. It prepares a plan and sends no emails.

VALIDATION LIMITS
The checks cover the local decision logic. Document bytes, ownership, email delivery, CRM APIs, Google Sheets/Drive, Make and n8n have not been connected or tested. Email validation is a format screen, not verification of address ownership or deliverability. Persistent storage and external-send transaction handling must be designed and tested for an actual deployment. No secrets or real customer data are included.

Do not describe a prepared item as sent or successful. A platform-specific implementation requires the customer's brief, credentials supplied through an agreed secure route, a staging test and separate external-integration checks.
