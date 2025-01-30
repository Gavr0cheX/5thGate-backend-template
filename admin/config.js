require('dotenv').config(); // Load environment variables from .env

const config = {
    app: {
        port: process.env.PORT || 3000 // Fallback to 3000 if not set
    },
    db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    }
};

module.exports = config;
