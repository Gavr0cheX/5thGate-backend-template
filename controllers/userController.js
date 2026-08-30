const userService = require('../services/userService');
const { success, failure } = require('../helpers/apiResponse');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await require('../models/user').getAllUsers();
    return success(res, 200, 'Users fetched successfully', { users });
  } catch (error) {
    console.error(error);
    return failure(res, 500, 'Error fetching users');
  }
};

// Create a new user
const createUser = async (req, res) => {
  try {
    await userService.createUser(req.body);
    return success(res, 201, 'User created successfully');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = error.statusCode ? error.message : 'Error creating user';
    if (!error.statusCode) {
      console.error(error);
    }
    return failure(res, statusCode, message);
  }
};

// Update user role or details
const updateUser = async (req, res) => {
  const { id } = req.params;

  try {
    await userService.updateUser({ id, ...req.body });
    return success(res, 200, 'User updated successfully');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = error.statusCode ? error.message : 'Error updating user';
    if (!error.statusCode) {
      console.error(error);
    }
    return failure(res, statusCode, message);
  }
};

// Remove a user
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await userService.deleteUser(id);
    return success(res, 200, 'User deleted successfully');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = error.statusCode ? error.message : 'Error deleting user';
    if (!error.statusCode) {
      console.error(error);
    }
    return failure(res, statusCode, message);
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
