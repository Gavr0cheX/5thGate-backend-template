const userModule = require("../models/user");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    console.error("No refresh token provided");
    return res.sendStatus(401); // Unauthorized
  }

  const refreshToken = cookies.jwt;

  try {
    const foundUser = await userModule.findByToken(refreshToken);
    if (!foundUser || !foundUser[0]) {
      console.warn("Refresh token not found or invalid");
      return res.sendStatus(401); // Unauthorized
    }

    // Get User Roles
    const foundUserRoles = await userModule.getUserRoles(foundUser[0].id);
    foundUser[0].roles = foundUserRoles.reduce((rolesObj, role) => {
      rolesObj[role.role] = role.role_id;
      return rolesObj;
    }, {});

    // Verify JWT
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) {
          console.error("Invalid refresh token:", err.message);
          return res.sendStatus(403); // Forbidden
        }

        if (foundUser[0].username !== decoded.username) {
          console.warn("Username mismatch during refresh token verification");
          return res.sendStatus(403); // Forbidden
        }

        const roles = Object.values(foundUser[0].roles);
        const accessToken = jwt.sign(
          {
            userInfo: {
              username: decoded.username,
              roles: roles,
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "30m" }
        );
        const expiration = decoded.exp - decoded.iat;

        res.json({
          id: foundUser[0].id,
          username: foundUser[0].username,
          accessToken,
          expiresIn: expiration,
          roles: roles,
        });
      }
    );
  } catch (error) {
    console.error("Error handling refresh token:", error);
    res.sendStatus(500); // Internal Server Error
  }
};

module.exports = {
  handleRefreshToken,
};
