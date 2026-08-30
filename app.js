const express = require('express');
const http = require('http');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const APPconfig = require('./admin/config.js').app;
const corsOptions = require('./admin/corsOptions');
const { reqLogger } = require('./middlewares/logEvents');
const verifyJWT = require('./middlewares/verifyJWT');
const { failure } = require('./helpers/apiResponse');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || APPconfig.port;
const host = process.env.HOST || APPconfig.host || '0.0.0.0';

app.disable('x-powered-by');

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middlewares
app.use(morgan('dev'));
app.use(reqLogger);
app.use(cookieParser());

// Open routes
app.use('/user/login', require('./routes/user/login'));
app.use('/user/refresh', require('./routes/refresh'));
app.use('/user/logout', require('./routes/user/logout'));

// Health and readiness routes
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, status: 'ok' });
});

app.get('/ready', (req, res) => {
  res.status(200).json({ success: true, status: 'ready' });
});

// Authorized routes
app.use(verifyJWT);
app.use('/users', require('./routes/user'));
app.use('/user/create', require('./routes/user/create'));

// 404 route
app.use((req, res) => {
  return failure(res, 404, 'Route not found');
});

// Error handling middleware
app.use(errorHandler);

if (require.main === module) {
  server.listen(port, host, () => {
    console.log(`Server is running on ${host}:${port}`);
  });
}

module.exports = { app, server };
