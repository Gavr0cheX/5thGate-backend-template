const assert = require('assert');

process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'check-access-secret';
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'check-refresh-secret';

const provider = (process.env.DB_PROVIDER || 'mysql').toLowerCase();
const exported = require('../models/user');

assert(exported, 'Expected models/user to export a provider implementation');
assert.strictEqual(typeof exported.findByUserName, 'function', 'Expected user model to expose the standard repository API');
assert.strictEqual(typeof exported.getAllUsers, 'function', 'Expected user model to expose the standard repository API');

console.log(`Provider check passed: ${provider}`);
