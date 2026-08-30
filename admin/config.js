require('dotenv').config({ quiet: true });

const requiredSecrets = ['ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET'];

for (const secretName of requiredSecrets) {
  if (!process.env[secretName]) {
    throw new Error(`Missing required environment variable: ${secretName}`);
  }
}

const dbProvider = (process.env.DB_PROVIDER || 'mysql').toLowerCase();

const config = {
  app: {
    port: Number(process.env.PORT) || 3000,
    host: process.env.HOST || '0.0.0.0',
  },
  db: {
    provider: dbProvider,
    host: process.env.DB_HOST || process.env.DBHOST || '127.0.0.1',
    user: process.env.DB_USER || process.env.DBUSER || 'root',
    password: process.env.DB_PASSWORD || process.env.DBPW || '',
    database: process.env.DB_NAME || process.env.DB_DATABASE || process.env.DB || 'base_api',
    mongoUri: process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017',
    mongoDatabase: process.env.MONGO_DB_NAME || process.env.MONGODB_DB || 'base_api',
  },
  auth: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  },
  corsOrigins: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

module.exports = config;
