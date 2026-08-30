const userModel = require('../models/user');
const { success, failure } = require('../helpers/apiResponse');
const { refreshCookieOptions } = require('../helpers/authCookies');

const handleLogout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return success(res, 200, 'No active session to clear');
  }

  const refreshToken = cookies.jwt;
  const foundUser = await userModel.findByToken(refreshToken);

  if (foundUser == undefined || !foundUser[0]) {
    res.clearCookie('jwt', refreshCookieOptions);
    return failure(res, 403, 'Invalid refresh token');
  }

  await userModel.refreshToken(foundUser[0].id, null);
  res.clearCookie('jwt', refreshCookieOptions);
  return success(res, 200, 'Logged out successfully');
};

module.exports = {
  handleLogout,
};
