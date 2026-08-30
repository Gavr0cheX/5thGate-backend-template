const userModel = require('../models/user');
const jwt = require('jsonwebtoken');
const { success, failure } = require('../helpers/apiResponse');
const { loginRefreshCookieOptions } = require('../helpers/authCookies');

const handleLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return failure(res, 400, 'Username and password are required.');
  }

  const foundUser = await userModel.findByUserName(username);

  if (!foundUser[0]) {
    return failure(res, 401, 'Invalid username');
  }

  const match = await require('bcryptjs').compare(password, foundUser[0].password);
  if (!match) {
    return failure(res, 401, 'Invalid password');
  }

  const foundUserRoles = await userModel.getUserRoles(foundUser[0].id);
  const roles = foundUserRoles.map((role) => role.role_id);

  const accessToken = jwt.sign(
    { userInfo: { username: foundUser[0].username, roles } },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '30m' }
  );

  const refreshToken = jwt.sign(
    { username: foundUser[0].username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  await userModel.refreshToken(foundUser[0].id, refreshToken);

  const decoded = jwt.decode(accessToken);
  const expiration = decoded.exp - decoded.iat;

  res.cookie('jwt', refreshToken, loginRefreshCookieOptions);

  return success(res, 200, 'Login successful', {
    user: {
      id: foundUser[0].id,
      username: foundUser[0].username,
      roles,
    },
    accessToken,
    expiresIn: expiration,
  });
};

module.exports = {
  handleLogin,
};
