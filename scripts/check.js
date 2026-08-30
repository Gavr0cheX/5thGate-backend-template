const assert = require('assert');

process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'check-access-secret';
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'check-refresh-secret';

const exported = require('../app');

assert(exported && exported.app, 'Expected app.js to export an app instance');
assert(exported && exported.server, 'Expected app.js to export a server instance');

console.log('Smoke check passed: app module loads successfully.');
