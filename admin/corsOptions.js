const whitelist = [
    'capacitor://localhost',
    'http://localhost',
    'http://localhost:4200',
    'http://localhost:8100',
    'https://system.awonksa.com',
    "https://awonksa.com"

];

const corsOptions = {
    origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(console.error(`${origin} Not allowed by CORS`));
        }
    },
    optionsSuccessStatus: 200,
    credentials: true
}

module.exports = corsOptions;