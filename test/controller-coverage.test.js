const test = require('node:test');
const assert = require('node:assert/strict');
const { mock } = require('node:test');

const { freshRequire, createResponseStub, restoreAllMocks } = require('../support-util');

process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'test-refresh-secret';

mock.method(console, 'error', () => {});

const loadModules = () => {
  const userService = freshRequire('../services/userService');
  const userModel = freshRequire('../models/user');
  const registerController = freshRequire('../controllers/registerController');
  const userController = freshRequire('../controllers/userController');
  return { userService, userModel, registerController, userController };
};

test.afterEach(() => {
  restoreAllMocks();
});

test('registerController creates a user and returns a success response', async () => {
  const { userService, registerController } = loadModules();
  mock.method(userService, 'createUser', async () => ({ id: 'new-id' }));
  const res = createResponseStub();

  await registerController.handleNewUser({ body: { username: 'fresh-user' } }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.message, 'User fresh-user created successfully');
});

test('registerController forwards service errors with the status code', async () => {
  const { userService, registerController } = loadModules();
  mock.method(userService, 'createUser', async () => {
    const error = new Error('Username already exists');
    error.statusCode = 409;
    throw error;
  });
  const res = createResponseStub();

  await registerController.handleNewUser({ body: { username: 'duplicate-user' } }, res);

  assert.equal(res.statusCode, 409);
  assert.equal(res.body.message, 'Username already exists');
});

test('userController fetches users and returns them in the payload', async () => {
  const { userModel, userController } = loadModules();
  mock.method(userModel, 'getAllUsers', async () => ([{ id: 1, username: 'alice' }]));
  const res = createResponseStub();

  await userController.getAllUsers({}, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.users, [{ id: 1, username: 'alice' }]);
});

test('userController returns a generic error when fetching users fails', async () => {
  const { userModel, userController } = loadModules();
  mock.method(userModel, 'getAllUsers', async () => {
    throw new Error('db failed');
  });
  const res = createResponseStub();

  await userController.getAllUsers({}, res);

  assert.equal(res.statusCode, 500);
  assert.equal(res.body.message, 'Error fetching users');
});

test('userController creates, updates, and deletes through the service layer', async () => {
  const { userService, userController } = loadModules();
  const calls = [];

  mock.method(userService, 'createUser', async (body) => {
    calls.push(['createUser', body.username]);
  });
  mock.method(userService, 'updateUser', async (payload) => {
    calls.push(['updateUser', payload.id, payload.username]);
  });
  mock.method(userService, 'deleteUser', async (id) => {
    calls.push(['deleteUser', id]);
  });

  const createRes = createResponseStub();
  const updateRes = createResponseStub();
  const deleteRes = createResponseStub();

  await userController.createUser({ body: { username: 'bob' } }, createRes);
  await userController.updateUser({ params: { id: 'user-1' }, body: { username: 'updated' } }, updateRes);
  await userController.deleteUser({ params: { id: 'user-1' } }, deleteRes);

  assert.deepEqual(calls, [
    ['createUser', 'bob'],
    ['updateUser', 'user-1', 'updated'],
    ['deleteUser', 'user-1'],
  ]);
  assert.equal(createRes.statusCode, 201);
  assert.equal(updateRes.statusCode, 200);
  assert.equal(deleteRes.statusCode, 200);
});
