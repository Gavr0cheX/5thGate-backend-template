const test = require('node:test');
const assert = require('node:assert/strict');
const { mock } = require('node:test');

const { freshRequire, createResponseStub, restoreAllMocks } = require('../support-util');

process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'test-refresh-secret';

test.afterEach(() => {
  restoreAllMocks();
});

test('logout returns a no-session response when no cookie is present', async () => {
  const { handleLogout } = freshRequire('../controllers/logoutController');
  const res = createResponseStub();

  await handleLogout({ cookies: {} }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.message, 'No active session to clear');
});

test('logout clears invalid refresh cookies', async () => {
  const userModel = freshRequire('../models/user');
  const { handleLogout } = freshRequire('../controllers/logoutController');
  mock.method(userModel, 'findByToken', async () => []);
  const res = createResponseStub();

  await handleLogout({ cookies: { jwt: 'bad-refresh' } }, res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.message, 'Invalid refresh token');
  assert.equal(res.clearedCookies.length, 1);
});

test('logout clears refresh tokens for valid sessions', async () => {
  const userModel = freshRequire('../models/user');
  const { handleLogout } = freshRequire('../controllers/logoutController');
  const calls = [];

  mock.method(userModel, 'findByToken', async () => [{ id: 'user-1' }]);
  mock.method(userModel, 'refreshToken', async (id, token) => {
    calls.push([id, token]);
  });
  const res = createResponseStub();

  await handleLogout({ cookies: { jwt: 'good-refresh' } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.message, 'Logged out successfully');
  assert.deepEqual(calls, [['user-1', null]]);
  assert.equal(res.clearedCookies.length, 1);
});

test('refresh rejects missing cookies and unknown refresh tokens', async () => {
  const userModule = freshRequire('../models/user');
  const { handleRefreshToken } = freshRequire('../controllers/refreshTokenController');
  mock.method(userModule, 'findByToken', async () => []);
  const res = createResponseStub();

  await handleRefreshToken({ cookies: {} }, res);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, 'No refresh token provided');

  const missing = createResponseStub();
  await handleRefreshToken({ cookies: { jwt: 'missing' } }, missing);
  assert.equal(missing.statusCode, 401);
  assert.equal(missing.body.message, 'Refresh token not found or invalid');
});

test('refresh issues a new access token for a valid session', async () => {
  const userModule = freshRequire('../models/user');
  const jwt = require('jsonwebtoken');
  const { handleRefreshToken } = freshRequire('../controllers/refreshTokenController');

  mock.method(userModule, 'findByToken', async () => [{ id: 'user-1', username: 'alice' }]);
  mock.method(userModule, 'getUserRoles', async () => [{ role_id: 2001 }]);
  mock.method(jwt, 'verify', (token, secret, callback) => callback(null, { username: 'alice', exp: 200, iat: 100 }));
  mock.method(jwt, 'sign', () => 'new-access-token');
  const res = createResponseStub();

  await handleRefreshToken({ cookies: { jwt: 'refresh-token' } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.message, 'Access token refreshed');
  assert.equal(res.body.accessToken, 'new-access-token');
  assert.equal(res.body.expiresIn, 100);
  assert.deepEqual(res.body.user, {
    id: 'user-1',
    username: 'alice',
    roles: [2001],
  });
});

test('errorHandler returns JSON unless headers were already sent', () => {
  const errorHandler = freshRequire('../middlewares/errorHandler');
  mock.method(console, 'error', () => {});

  const res = createResponseStub();
  const nextCalls = [];
  errorHandler(new Error('boom'), {}, res, (err) => nextCalls.push(err.message));

  assert.equal(res.statusCode, 500);
  assert.equal(res.body.message, 'Internal Server Error');
  assert.deepEqual(nextCalls, []);

  const sentRes = { headersSent: true };
  const forwarded = [];
  errorHandler(new Error('already sent'), {}, sentRes, (err) => forwarded.push(err.message));
  assert.deepEqual(forwarded, ['already sent']);
});
