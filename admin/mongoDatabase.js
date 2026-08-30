const { MongoClient } = require('mongodb');
const { db: config } = require('./config.js');

const DEFAULT_ROLES = [
  { id: 1001, role: 'Admin' },
  { id: 2001, role: 'User' },
];

let client;
let database;
let initPromise;

async function seedDefaults(dbInstance) {
  const roles = dbInstance.collection('ref_roles');
  await roles.createIndex({ id: 1 }, { unique: true });

  for (const role of DEFAULT_ROLES) {
    await roles.updateOne({ id: role.id }, { $setOnInsert: role }, { upsert: true });
  }
}

async function ensureIndexes(dbInstance) {
  const users = dbInstance.collection('users');

  await Promise.all([
    users.createIndex({ username: 1 }, { unique: true }),
    users.createIndex({ phone: 1 }, { unique: true }),
    users.createIndex({ email: 1 }, { unique: true, sparse: true }),
    users.createIndex({ refreshToken: 1 }),
  ]);
}

async function connectMongo() {
  if (!config.mongoUri) {
    throw new Error('Missing required environment variable: MONGO_URI');
  }

  client = new MongoClient(config.mongoUri, {
    maxPoolSize: 10,
  });

  await client.connect();
  database = client.db(config.mongoDatabase);
  await Promise.all([
    ensureIndexes(database),
    seedDefaults(database),
  ]);

  return database;
}

async function getMongoDb() {
  if (database) {
    return database;
  }

  if (!initPromise) {
    initPromise = connectMongo().catch((error) => {
      initPromise = null;
      throw error;
    });
  }

  database = await initPromise;
  return database;
}

async function closeMongoConnection() {
  if (client) {
    await client.close();
  }

  client = undefined;
  database = undefined;
  initPromise = null;
}

module.exports = {
  getMongoDb,
  closeMongoConnection,
};
