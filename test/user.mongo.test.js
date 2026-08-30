const { mock } = require('node:test');
const test = require('node:test');
const assert = require('node:assert/strict');
const { ObjectId } = require('mongodb');

const { freshRequire, restoreAllMocks } = require('../support-util');

process.env.DB_PROVIDER = 'mongodb';
process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'test-refresh-secret';

const mongoDatabase = freshRequire('../admin/mongoDatabase');

let state;

const makeCollection = (name) => {
  if (name === 'ref_roles') {
    return {
      createIndex: async () => undefined,
      updateOne: async () => undefined,
      find: (query) => ({
        sort: () => ({
          toArray: async () => state.ref_roles.filter((role) => query.id.$in.includes(role.id)),
        }),
      }),
      findOne: async () => undefined,
      insertOne: async () => undefined,
      deleteOne: async () => undefined,
    };
  }

  return {
    createIndex: async () => undefined,
    findOne: async (query) => {
      if (query.username) {
        return state.users.find((user) => user.username === query.username) || null;
      }
      if (query.phone) {
        return state.users.find((user) => user.phone === query.phone) || null;
      }
      if (query.refreshToken) {
        return state.users.find((user) => user.refreshToken === query.refreshToken) || null;
      }
      if (query._id) {
        return state.users.find((user) => String(user._id) === String(query._id)) || null;
      }
      return null;
    },
    insertOne: async (doc) => {
      const insertedId = new ObjectId();
      state.users.push({ ...doc, _id: insertedId });
      return { insertedId };
    },
    updateOne: async (filter, update) => {
      const user = state.users.find((entry) => String(entry._id) === String(filter._id));
      if (!user) {
        return { matchedCount: 0, modifiedCount: 0 };
      }
      if (update.$set) {
        Object.assign(user, update.$set);
      }
      if (update.$addToSet?.roles) {
        const role = update.$addToSet.roles;
        user.roles = Array.from(new Set([...(user.roles || []), role]));
      }
      return { matchedCount: 1, modifiedCount: 1 };
    },
    deleteOne: async (filter) => {
      const index = state.users.findIndex((entry) => String(entry._id) === String(filter._id));
      if (index >= 0) {
        state.users.splice(index, 1);
      }
      return { deletedCount: index >= 0 ? 1 : 0 };
    },
    find: (query) => ({
      sort: () => ({
        toArray: async () => state.users.filter((user) => user.roles && user.roles.some((role) => query.id.$in.includes(role))),
      }),
    }),
  };
};

const fakeDb = {
  databaseName: 'base_api_test',
  collection: (name) => makeCollection(name),
};

mock.method(mongoDatabase, 'getMongoDb', async () => fakeDb);
const User = freshRequire('../models/user.mongo');

const resetState = () => {
  state = {
    users: [],
    ref_roles: [
      { id: 1001, role: 'Admin' },
      { id: 2001, role: 'User' },
    ],
  };
};

test.beforeEach(() => {
  resetState();
});

test.afterEach(() => {
  restoreAllMocks();
});

test('mongo user model stores and retrieves users without SQL', async () => {
  const user = new User('mongo-user', '01000000005', 'hashed-password', 'Mongo User');
  await user.createUser();

  const found = await User.findByUserName('mongo-user');
  assert.equal(found[0].username, 'mongo-user');
  assert.equal(found[0].phone, '01000000005');
});

test('mongo user model resolves roles and refresh tokens', async () => {
  const user = new User('mongo-user-2', '01000000006', 'hashed-password', 'Mongo User 2');
  await user.createUser();
  const created = await User.findByUserName('mongo-user-2');
  await User.addRoleToUser(created[0].id, 2001);
  await User.refreshToken(created[0].id, 'refresh-token-value');

  const roles = await User.getUserRoles(created[0].id);
  const byToken = await User.findByToken('refresh-token-value');

  assert.deepEqual(roles, [{ role: 'User', role_id: 2001 }]);
  assert.equal(byToken[0].username, 'mongo-user-2');
});

test('mongo user model removes users and roles cleanly', async () => {
  const user = new User('mongo-user-3', '01000000007', 'hashed-password', 'Mongo User 3');
  await user.createUser();
  const created = await User.findByUserName('mongo-user-3');

  await User.removeRoles(created[0].id);
  await User.deleteUser(created[0].id);

  const afterDelete = await User.findByUserName('mongo-user-3');
  assert.equal(afterDelete.length, 0);
});
