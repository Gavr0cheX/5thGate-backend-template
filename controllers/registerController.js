const userService = require('../services/userService');
const { success, failure } = require('../helpers/apiResponse');

const handleNewUser = async (req, res) => {
  try {
    await userService.createUser(req.body);
    return success(res, 201, `User ${req.body.username} created successfully`);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    const message = err.statusCode ? err.message : 'Internal server error';
    if (!err.statusCode) {
      console.error('Error creating user:', err.message);
    }
    return failure(res, statusCode, message);
  }
};

module.exports = {
  handleNewUser,
};
