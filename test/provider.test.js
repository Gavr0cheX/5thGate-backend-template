const test = require('node:test');
const assert = require('node:assert/strict');

const { restoreAllMocks } = require('../support-util');

process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'test-refresh-secret';

const loadProvider = () => {
  delete require.cache[require.resolve('../admin/config.js')];
  delete require.cache[require.resolve('../admin/dbProvider')];
  return require('../admin/dbProvider');
};

test.afterEach(() => {
  restoreAllMocks();
});

test('dbProvider flags reflect the selected SQL provider', () => {
  const originalProvider = process.env.DB_PROVIDER;
  process.env.DB_PROVIDER = 'mysql';

  const provider = loadProvider();
  assert.equal(provider.isMySqlProvider, true);
  assert.equal(provider.isMongoProvider, false);

  process.env.DB_PROVIDER = originalProvider;
});

test('dbProvider flags reflect the selected Mongo provider', () => {
  const originalProvider = process.env.DB_PROVIDER;
  process.env.DB_PROVIDER = 'mongodb';

  const provider = loadProvider();
  assert.equal(provider.isMySqlProvider, false);
  assert.equal(provider.isMongoProvider, true);

  process.env.DB_PROVIDER = originalProvider;
});
