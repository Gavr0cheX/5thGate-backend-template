const test = require('node:test');
const assert = require('node:assert/strict');
const { mock } = require('node:test');

const { freshRequire, restoreAllMocks } = require('../support-util');

process.env.DB_PROVIDER = 'mysql';
process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'test-refresh-secret';

mock.method(console, 'error', () => {});

const db = freshRequire('../admin/database');
const User = freshRequire('../models/user.mysql');

test.after(async () => {
  restoreAllMocks();
  if (typeof db.end === 'function') {
    await db.end();
  }
});

test('mysql user model forwards lookups through parameterized queries', async () => {
  const calls = [];
  db.query = async (sql, params) => {
    calls.push({ sql, params });
    return [{ id: 1, username: params[0] }];
  };

  const rows = await User.findByUserName('alice');

  assert.equal(rows[0].username, 'alice');
  assert.match(calls[0].sql, /SELECT \* FROM users WHERE username = \? LIMIT 1/);
  assert.deepEqual(calls[0].params, ['alice']);
});

test('mysql user model inserts users through a single parameterized statement', async () => {
  const calls = [];
  db.query = async (sql, params) => {
    calls.push({ sql, params });
    return [{ insertId: 5 }];
  };

  const user = new User('bob', '01000000004', 'hashed-password', 'Bob Builder');
  await user.createUser();

  assert.match(calls[0].sql, /INSERT INTO users/);
  assert.deepEqual(calls[0].params, ['bob', '01000000004', 'hashed-password', 'Bob Builder']);
});
