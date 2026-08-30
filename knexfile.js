const { db } = require('./admin/config.js');

if (db.provider !== 'mysql') {
  throw new Error('Knex migrations are only available when DB_PROVIDER=mysql');
}

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: db.host,
      user: db.user,
      password: db.password,
      database: db.database,
    },
    migrations: {
      directory: './migrations',
    },
  },
};
