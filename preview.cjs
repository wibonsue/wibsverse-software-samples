'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const entries = new Map([['/', ['index.html', 'text/html']], ['/core.cjs', ['core.cjs', 'text/javascript']], ['/app.js', ['app.js', 'text/javascript']]]);
http.createServer((request, response) => {
  const entry = entries.get(request.url);
  if (request.method !== 'GET' || !entry) { response.writeHead(404); response.end('Not found'); return; }
  response.writeHead(200, { 'Content-Type': `${entry[1]}; charset=utf-8`, 'Cache-Control': 'no-store', 'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'" });
  response.end(fs.readFileSync(path.join(__dirname, entry[0])));
}).listen(8755, '127.0.0.1', () => console.log('Original price repair demo at http://127.0.0.1:8755'));
