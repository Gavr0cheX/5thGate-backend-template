const test = require('node:test');
const assert = require('node:assert/strict');

const { freshRequire, createResponseStub, restoreAllMocks } = require('../support-util');

test.afterEach(() => {
  restoreAllMocks();
});

test('apiResponse success wraps payload consistently', () => {
  const { success } = freshRequire('../helpers/apiResponse');
  const res = createResponseStub();

  success(res, 201, 'Created', { id: 7 });

  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, {
    success: true,
    message: 'Created',
    id: 7,
  });
});

test('apiResponse failure includes optional details when provided', () => {
  const { failure } = freshRequire('../helpers/apiResponse');
  const res = createResponseStub();

  failure(res, 400, 'Bad Request', { field: 'username' });

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    success: false,
    message: 'Bad Request',
    details: { field: 'username' },
  });
});

test('auth cookie options stay split between login and clear flows', () => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';

  const cookies = freshRequire('../helpers/authCookies');

  assert.equal(cookies.refreshCookieOptions.httpOnly, true);
  assert.equal(cookies.refreshCookieOptions.sameSite, 'lax');
  assert.equal(cookies.loginRefreshCookieOptions.maxAge, 7 * 24 * 60 * 60 * 1000);

  process.env.NODE_ENV = originalEnv;
});
