const test = require('node:test');
const assert = require('node:assert/strict');
const { mock } = require('node:test');
const { MongoClient } = require('mongodb');

const { freshRequire, restoreAllMocks } = require('../support-util');

process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'test-refresh-secret';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
process.env.MONGO_DB_NAME = 'test_base_api';

const calls = {
  connect: 0,
  db: 0,
  close: 0,
  usersIndexes: [],
  rolesIndexes: [],
  roleUpserts: [],
};

const resetCalls = () => {
  calls.connect = 0;
  calls.db = 0;
  calls.close = 0;
  calls.usersIndexes = [];
  calls.rolesIndexes = [];
  calls.roleUpserts = [];
};

const installMongoClientMocks = () => {
  mock.method(MongoClient.prototype, 'connect', async function connect() {
    calls.connect += 1;
    return this;
  });

  mock.method(MongoClient.prototype, 'db', function db() {
    calls.db += 1;
    return fakeDb;
  });

  mock.method(MongoClient.prototype, 'close', async function close() {
    calls.close += 1;
  });
};

const usersCollection = {
  createIndex: async (spec, options) => {
    calls.usersIndexes.push({ spec, options });
  },
};

const rolesCollection = {
  createIndex: async (spec, options) => {
    calls.rolesIndexes.push({ spec, options });
  },
  updateOne: async (filter, update, options) => {
    calls.roleUpserts.push({ filter, update, options });
  },
};

const fakeDb = {
  collection(name) {
    if (name === 'users') {
      return usersCollection;
    }
    if (name === 'ref_roles') {
      return rolesCollection;
    }
    throw new Error(`Unexpected collection: ${name}`);
  },
};

const mongoDatabase = freshRequire('../admin/mongoDatabase');

test.beforeEach(() => {
  resetCalls();
  installMongoClientMocks();
});

test.afterEach(async () => {
  await mongoDatabase.closeMongoConnection();
  restoreAllMocks();
});

test('mongoDatabase seeds indexes and default roles once then reuses the cached db', async () => {
  const first = await mongoDatabase.getMongoDb();
  const second = await mongoDatabase.getMongoDb();

  assert.equal(first, fakeDb);
  assert.equal(second, fakeDb);
  assert.equal(calls.connect, 1);
  assert.equal(calls.db, 1);
  assert.equal(calls.usersIndexes.length, 4);
  assert.equal(calls.rolesIndexes.length, 1);
  assert.equal(calls.roleUpserts.length, 2);
  assert.deepEqual(calls.roleUpserts.map((entry) => entry.filter.id), [1001, 2001]);
  assert.deepEqual(calls.roleUpserts.map((entry) => entry.update), [
    { $setOnInsert: { id: 1001, role: 'Admin' } },
    { $setOnInsert: { id: 2001, role: 'User' } },
  ]);
});

test('mongoDatabase closes the client and reconnects after reset', async () => {
  await mongoDatabase.getMongoDb();
  await mongoDatabase.closeMongoConnection();
  await mongoDatabase.getMongoDb();

  assert.equal(calls.close, 1);
  assert.equal(calls.connect, 2);
  assert.equal(calls.db, 2);
});
