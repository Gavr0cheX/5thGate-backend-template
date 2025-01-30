const bcrypt = require("bcrypt");
const userModel = require("../models/user");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

const handleLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Username and password are required." });

  const foundUser = await userModel.findByUserName(username);

  if (!foundUser[0])
    return res.status(401).json({ message: "Invalid username" });

  const match = await bcrypt.compare(password, foundUser[0].password);

  if (!match) return res.status(401).json({ message: "Invalid password" });

  const foundUserRoles = await userModel.getUserRoles(foundUser[0].id);
  foundUser[0]["roles"] = {};

  for (const role of foundUserRoles) {
    foundUser[0]["roles"][role["role"]] = role["role_id"];
  }

  const roles = Object.values(foundUser[0].roles);

  const accessToken = jwt.sign(
    { userInfo: { username: foundUser[0].username, roles: roles } },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "30m" }
  );

  const refreshToken = jwt.sign(
    { username: foundUser[0].username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" } // Set a longer expiration time
  );

  await userModel.refreshToken(foundUser[0].id, refreshToken);

  const decoded = jwt.decode(accessToken);
  const expiration = decoded.exp - decoded.iat;

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    maxAge: 365 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "production", // Set secure flag in production
    sameSite: "Strict", // Prevent cross-site requests
  });

  res.json({
    id: foundUser[0].id,
    username: foundUser[0].username,
    accessToken,
    expiresIn: expiration,
    roles: roles,
  });
};

module.exports = {
  handleLogin,
};
