const { isMongoProvider } = require('../admin/dbProvider');

module.exports = isMongoProvider
  ? require('./user.mongo')
  : require('./user.mysql');
