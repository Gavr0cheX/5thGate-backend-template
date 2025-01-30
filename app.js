const APPconfig = require('./admin/config.js').app; // Import APP config
const express = require('express');                 // Import Express Framework
const http = require('http');                       // Import HTTP requests library
const morgan = require('morgan');                   // Import HTTP request logger
const parser = require('body-parser');              // Import body-parser middleware
const path = require('path');
const helmet = require('helmet');                   // Import Helmet for security
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./admin/corsOptions')
const app = express();                              // Declaring express as the app framework
const port = process.env.PORT || APPconfig.port;    // Declaring APP Port
const host = process.env.HOST || '0.0.0.0';         // Declaring APP Host
const { logEvents, reqLogger } = require('./middlewares/logEvents');
const verifyJWT = require('./middlewares/verifyJWT');

// Initializing server
const server = http.createServer(app);

// Security middleware
app.use(helmet());
app.use(cors(corsOptions))
// Body parsers
app.use(parser.json()); // Parse Content-Type: application/json
app.use(parser.urlencoded({ extended: true })); // Parse Content-Type: application/x-www-form-urlencoded

// Logging middlewares
app.use(morgan('dev'));
app.use(reqLogger);
app.use(cookieParser());

// Open Routes
app.use('/user/login', require('./routes/user/login'));
app.use('/user/refresh', require('./routes/refresh'));
app.use('/user/logout', require('./routes/user/logout'));



// Authorized Routes
app.use(verifyJWT);
app.use('/users', require('./routes/user'));
app.use('/user/create', require('./routes/user/create'));

// Unit routes
app.use('/units', require('./routes/unit'));  // Use unit routes

// Client routes
app.use('/clients', require('./routes/client'));  // Use client routes

// 404 Route
app.get('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});

// Running server
server.listen(port, host, () => console.log(`Server is running on ${host}:${port}`));
