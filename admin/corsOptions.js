const defaultOrigins = [
  'http://localhost',
  'http://localhost:3000',
  'http://localhost:4200',
  'http://localhost:8100',
];

const whitelist = (process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : defaultOrigins)
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`${origin} not allowed by CORS`));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true,
};

module.exports = corsOptions;
