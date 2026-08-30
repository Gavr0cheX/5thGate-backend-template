const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');

const { freshRequire, listen, close, restoreAllMocks } = require('../support-util');

process.env.DB_PROVIDER = 'mongodb';
process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'test-refresh-secret';
process.env.NODE_ENV = 'test';

const userModel = freshRequire('../models/user');
const { server } = freshRequire('../app');

let baseUrl;
let refreshTokenStore = null;
const currentUser = {
  id: 'user-1',
  username: 'test-user',
  password: '$2b$10$123456789012345678901uVw8c0g6QZb3hXgL1w1Jm9oP7Yq7zKkG',
  fullname: 'Test User',
  email: 'test@example.com',
  phone: '01000000001',
};

const installModelStubs = () => {
  refreshTokenStore = null;

  userModel.findByUserName = async (username) => {
    if (username === currentUser.username) {
      return [{ ...currentUser }];
    }
    return [];
  };

  userModel.findByToken = async (token) => {
    if (refreshTokenStore && token === refreshTokenStore) {
      return [{ ...currentUser, refreshToken: refreshTokenStore }];
    }
    return [];
  };

  userModel.getUserRoles = async () => [{ role: 'User', role_id: 2001 }];
  userModel.refreshToken = async (_id, token) => {
    refreshTokenStore = token;
    return { affectedRows: 1 };
  };
  userModel.getAllUsers = async () => [
    {
      id: currentUser.id,
      username: currentUser.username,
      email: currentUser.email,
      phone: currentUser.phone,
      fullname: currentUser.fullname,
      main_uid: null,
    },
  ];
};

test.before(async () => {
  installModelStubs();
  const address = await listen(server);
  baseUrl = `http://${address.address}:${address.port}`;
});

test.after(async () => {
  await close(server);
});

test.afterEach(() => {
  restoreAllMocks();
  installModelStubs();
});

test('health and readiness endpoints stay public', async () => {
  const health = await fetch(`${baseUrl}/health`);
  const ready = await fetch(`${baseUrl}/ready`);

  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { success: true, status: 'ok' });

  assert.equal(ready.status, 200);
  assert.deepEqual(await ready.json(), { success: true, status: 'ready' });
});

test('protected routes reject missing tokens before hitting the model layer', async () => {
  const response = await fetch(`${baseUrl}/users`);

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), {
    message: 'Unauthorized: Missing or invalid token',
  });
});

test('login, refresh, and logout work end to end with a refresh token cookie', async () => {
  const invalidLogin = await fetch(`${baseUrl}/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: '', password: '' }),
  });

  assert.equal(invalidLogin.status, 400);
  assert.equal((await invalidLogin.json()).message, 'Username and password are required.');

  const loginPassword = 'Test@12345!';
  currentUser.password = await bcrypt.hash(loginPassword, 10);

  const compareMock = async (password, hash) => password === loginPassword && hash === currentUser.password;
  require('node:test').mock.method(bcrypt, 'compare', compareMock);

  const login = await fetch(`${baseUrl}/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: currentUser.username, password: loginPassword }),
  });

  assert.equal(login.status, 200);
  const loginBody = await login.json();
  assert.equal(loginBody.message, 'Login successful');
  assert.equal(loginBody.user.username, currentUser.username);

  const cookie = login.headers.get('set-cookie');
  assert.ok(cookie?.includes('jwt='));
  assert.ok(refreshTokenStore, 'refresh token should be stored after login');
  assert.ok(loginBody.accessToken, 'access token should be returned after login');

  const users = await fetch(`${baseUrl}/users`, {
    headers: { Authorization: `Bearer ${loginBody.accessToken}` },
  });
  assert.equal(users.status, 200);

  const refresh = await fetch(`${baseUrl}/user/refresh`, {
    headers: { Cookie: cookie.split(';')[0] },
  });
  assert.equal(refresh.status, 200);
  const refreshed = await refresh.json();
  assert.equal(refreshed.message, 'Access token refreshed');
  assert.equal(refreshed.user.username, currentUser.username);

  const logout = await fetch(`${baseUrl}/user/logout`, {
    headers: { Cookie: cookie.split(';')[0] },
  });
  assert.equal(logout.status, 200);
  assert.equal((await logout.json()).message, 'Logged out successfully');
  assert.equal(refreshTokenStore, null);

  const refreshAfterLogout = await fetch(`${baseUrl}/user/refresh`, {
    headers: { Cookie: cookie.split(';')[0] },
  });
  assert.equal(refreshAfterLogout.status, 401);
  assert.equal((await refreshAfterLogout.json()).message, 'Refresh token not found or invalid');
});
