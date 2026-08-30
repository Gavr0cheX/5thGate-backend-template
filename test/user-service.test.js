const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');

const { freshRequire, restoreAllMocks } = require('../support-util');

process.env.DB_PROVIDER = 'mongodb';
process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'test-refresh-secret';

const User = freshRequire('../models/user');
const userService = freshRequire('../services/userService');

test.afterEach(() => {
  restoreAllMocks();
});

test('userService.createUser hashes the password and assigns the default role', async () => {
  const calls = [];
  let lookupCount = 0;

  User.findByUserName = async () => {
    lookupCount += 1;
    return lookupCount <= 1 ? [] : [{ id: 'new-user-id', username: 'new-user' }];
  };
  User.findByPhone = async () => [];
  User.addRoleToUser = async (id, roleId) => {
    calls.push(['addRoleToUser', id, roleId]);
  };
  User.prototype.createUser = async function createUser() {
    calls.push(['createUser', this.username, this.phone, this.fullname]);
    return { insertedId: 'new-user-id' };
  };

  require('node:test').mock.method(bcrypt, 'hash', async () => 'hashed-password');

  const created = await userService.createUser({
    username: 'new-user',
    phone: '01000000009',
    password: 'Password123!',
    fullname: 'New User',
  });

  assert.equal(created.username, 'new-user');
  assert.deepEqual(calls, [
    ['createUser', 'new-user', '01000000009', 'New User'],
    ['addRoleToUser', 'new-user-id', 2001],
  ]);
});

test('userService.updateUser rewrites values and keeps selected roles', async () => {
  const updateCalls = [];
  let lookupCount = 0;

  User.findById = async () => {
    lookupCount += 1;
    return lookupCount === 1
      ? [{
          id: 'existing-id',
          username: 'existing-user',
          email: 'old@example.com',
          phone: '01000000001',
          password: 'old-hash',
          fullname: 'Existing User',
        }]
      : [{
          id: 'existing-id',
          username: 'updated-user',
          email: 'new@example.com',
          phone: '01000000002',
          password: 'new-hash',
          fullname: 'Updated User',
        }];
  };
  User.updateUserDetails = async (...args) => updateCalls.push(['details', ...args]);
  User.updateRoles = async (...args) => updateCalls.push(['roles', ...args]);
  require('node:test').mock.method(bcrypt, 'hash', async () => 'new-hash');

  const result = await userService.updateUser({
    id: 'existing-id',
    username: 'updated-user',
    email: 'new@example.com',
    phone: '01000000002',
    password: 'NewPassword123!',
    fullname: 'Updated User',
    roleId: 2001,
  });

  assert.equal(result[0].username, 'updated-user');
  assert.deepEqual(updateCalls, [
    ['details', 'existing-id', 'updated-user', 'new@example.com', '01000000002', 'new-hash', 'Updated User'],
    ['roles', 'existing-id', [2001]],
  ]);
});

test('userService.deleteUser removes roles before deleting the record', async () => {
  const calls = [];
  User.removeRoles = async (id) => calls.push(['removeRoles', id]);
  User.deleteUser = async (id) => calls.push(['deleteUser', id]);

  await userService.deleteUser('delete-id');

  assert.deepEqual(calls, [
    ['removeRoles', 'delete-id'],
    ['deleteUser', 'delete-id'],
  ]);
});
