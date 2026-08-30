const path = require('node:path');
const { mock } = require('node:test');

const freshRequire = (modulePath) => {
  const normalized = modulePath
    .replace(/^(\.\.\/)+/, '')
    .replace(/^(\.\/)+/, '');
  const resolved = path.join(__dirname, normalized);
  delete require.cache[require.resolve(resolved)];
  return require(resolved);
};

const createResponseStub = () => {
  const res = {
    statusCode: null,
    body: null,
    cookies: [],
    clearedCookies: [],
  };

  res.status = function status(code) {
    this.statusCode = code;
    return this;
  };

  res.json = function json(body) {
    this.body = body;
    return this;
  };

  res.cookie = function cookie(name, value, options) {
    this.cookies.push({ name, value, options });
    return this;
  };

  res.clearCookie = function clearCookie(name, options) {
    this.clearedCookies.push({ name, options });
    return this;
  };

  return res;
};

const listen = (server, port = 0, host = '127.0.0.1') => {
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off('listening', onListening);
      reject(error);
    };

    const onListening = () => {
      server.off('error', onError);
      resolve(server.address());
    };

    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port, host);
  });
};

const close = (server) => {
  return new Promise((resolve) => {
    if (!server.listening) {
      resolve();
      return;
    }

    server.close(() => resolve());
  });
};

const restoreAllMocks = () => {
  mock.restoreAll();
};

module.exports = {
  freshRequire,
  createResponseStub,
  listen,
  close,
  restoreAllMocks,
};
