const { db } = require('./config.js');

const provider = (db.provider || 'mysql').toLowerCase();

module.exports = {
  provider,
  isMongoProvider: provider === 'mongodb',
  isMySqlProvider: provider === 'mysql',
};
