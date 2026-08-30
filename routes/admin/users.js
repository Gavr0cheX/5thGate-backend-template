const express = require('express');
const router = express.Router();
const createUserController = require('../../controllers/registerController');
const usersController = require('../../controllers/usersController');
const ROLES_LIST = require('../../admin/rolesList');
const verifyRoles = require('../../middlewares/verifyRoles');

router.route('/')
  .get(verifyRoles(ROLES_LIST.ADMIN), usersController.handleGetAllUsers)
  .post(createUserController.handleNewUser);

router.route('/:id')
  .get(usersController.handleGetUserById);

module.exports = router;
