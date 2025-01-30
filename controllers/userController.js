const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Get all users (including sales principals)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Create a new user (admin can add sales principals too)
const createUser = async (req, res) => {
  const { username, email, phone, password, fullname, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findByUserName(username);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = new User(username, phone, hashedPassword, fullname);
    await newUser.createUser();

    // Add role (default 'User' role)
    const userId = await User.findByUserName(username);
    const userRoles = (role === 'sales_principal') ? [1001, 3001] : [1001, 2001];  // Admin and Sales Principal or Admin and User
    for (const roleId of userRoles) {
      await User.addRoleToUser(userId[0].id, roleId);
    }

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

// Update user role or details
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, phone, password, fullname, role } = req.body;

  try {
    // Check if the user exists
    const existingUser = await User.findById(id);
    if (existingUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password if it's updated
    let updatedPassword = existingUser[0].password;
    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }

    // Update user details
    await User.updateUserDetails(id, username, email, phone, updatedPassword, fullname);

    // Update role (if provided)
    const userRoles = (role === 'sales_principal') ? [1001, 3001] : [1001, 2001];
    await User.updateRoles(id, userRoles);

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

// Remove a user
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Delete the user from user_roles first
    await User.removeRoles(id);

    // Delete the user
    await User.deleteUser(id);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};
