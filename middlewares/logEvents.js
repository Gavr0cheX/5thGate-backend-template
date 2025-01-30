const { format } = require('date-fns');
const { v4: uuid } = require('uuid');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Use environment variable or default to '../logs'
const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, '..', 'logs');

const logEvents = async (message, logName) => {
    const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

    try {
        if (!fs.existsSync(LOG_DIR)) {
            await fsPromises.mkdir(LOG_DIR, { recursive: true });
        }
        await fsPromises.appendFile(path.join(LOG_DIR, logName), logItem);
    } catch (err) {
        console.error(`Failed to log event: ${err.message}`);
    }
};

const reqLogger = async (req, res, next) => {
    try {
        const logMessage = `${req.method}\t${req.headers.origin || 'unknown-origin'}\t${req.url}\t${req.ip}`;
        await logEvents(logMessage, 'reqLog.txt');
    } catch (err) {
        console.error(`Logging middleware error: ${err.message}`);
    }
    next();
};

module.exports = { 
    logEvents,
    reqLogger
};
