const userModule = require('../models/user');
const jwt = require('jsonwebtoken');
const { success, failure } = require('../helpers/apiResponse');
require('dotenv').config({ quiet: true });

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return failure(res, 401, 'No refresh token provided');
  }

  const refreshToken = cookies.jwt;

  try {
    const foundUser = await userModule.findByToken(refreshToken);
    if (!foundUser || !foundUser[0]) {
      return failure(res, 401, 'Refresh token not found or invalid');
    }

    const foundUserRoles = await userModule.getUserRoles(foundUser[0].id);
    const roles = foundUserRoles.map((role) => role.role_id);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return failure(res, 403, 'Invalid refresh token');
      }

      if (foundUser[0].username !== decoded.username) {
        return failure(res, 403, 'Username mismatch during refresh token verification');
      }

      const accessToken = jwt.sign(
        {
          userInfo: {
            username: decoded.username,
            roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '30m' }
      );

      const expiration = decoded.exp - decoded.iat;

      return success(res, 200, 'Access token refreshed', {
        user: {
          id: foundUser[0].id,
          username: foundUser[0].username,
          roles,
        },
        accessToken,
        expiresIn: expiration,
      });
    });
  } catch (error) {
    console.error('Error handling refresh token:', error);
    return failure(res, 500, 'Internal server error');
  }
};

module.exports = {
  handleRefreshToken,
};
