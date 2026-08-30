const bcrypt = require('bcryptjs');
const User = require('../models/user');
const ROLES_LIST = require('../admin/rolesList');

const resolveRoleIds = ({ roleIds, roleId } = {}) => {
  if (Array.isArray(roleIds) && roleIds.length > 0) {
    return roleIds;
  }

  if (roleId) {
    return [roleId];
  }

  return [ROLES_LIST.USER];
};

const ensureUniqueUser = async (username, phone) => {
  const [duplicateUser, duplicatePhone] = await Promise.all([
    User.findByUserName(username),
    User.findByPhone(phone),
  ]);

  if (duplicateUser.length > 0 || duplicatePhone.length > 0) {
    const error = new Error('Username or phone number already exists');
    error.statusCode = 409;
    throw error;
  }
};

const createUser = async ({ username, phone, password, fullname, roleIds, roleId }) => {
  if (!username || !phone || !password || !fullname) {
    const error = new Error('Username, phone, password, and fullname are required');
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 8) {
    const error = new Error('Password must be at least 8 characters long');
    error.statusCode = 400;
    throw error;
  }

  await ensureUniqueUser(username, phone);

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User(username, phone, hashedPassword, fullname);
  await newUser.createUser();

  const createdUser = await User.findByUserName(username);
  const selectedRoleIds = resolveRoleIds({ roleIds, roleId });

  for (const currentRoleId of selectedRoleIds) {
    await User.addRoleToUser(createdUser[0].id, currentRoleId);
  }

  return createdUser[0];
};

const updateUser = async ({ id, username, email, phone, password, fullname, roleIds, roleId }) => {
  const existingUser = await User.findById(id);
  if (existingUser.length === 0) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const currentUser = existingUser[0];
  const updatedPassword = password ? await bcrypt.hash(password, 10) : currentUser.password;
  const updatedUsername = username || currentUser.username;
  const updatedEmail = email ?? currentUser.email;
  const updatedPhone = phone || currentUser.phone;
  const updatedFullname = fullname || currentUser.fullname;

  await User.updateUserDetails(
    id,
    updatedUsername,
    updatedEmail,
    updatedPhone,
    updatedPassword,
    updatedFullname
  );

  const selectedRoleIds = resolveRoleIds({ roleIds, roleId });
  if (selectedRoleIds.length > 0) {
    await User.updateRoles(id, selectedRoleIds);
  }

  return User.findById(id);
};

const deleteUser = async (id) => {
  await User.removeRoles(id);
  await User.deleteUser(id);
};

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  resolveRoleIds,
};
