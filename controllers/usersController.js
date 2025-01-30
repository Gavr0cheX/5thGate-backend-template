const userModel = require('../models/user');

// Utility function to format roles
const formatUserRoles = async (userId) => {
    const rolesData = await userModel.getUserRoles(userId);
    const roles = {};
    for (const role of rolesData) {
        roles[role.role] = role.role_id;
    }
    return roles;
};

const handleGetAllUsers = async (req, res) => {
    try {
        const foundUsers = await userModel.getAllUsers();
        if (!foundUsers.length) {
            return res.status(404).json({ message: "No users found" });
        }
        res.status(200).json(foundUsers);
    } catch (err) {
        console.error("Error fetching users:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

const handleGetUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const foundUser = await userModel.findById(userId);

        if (!foundUser || !foundUser.length) {
            return res.status(404).json({ message: `User ID ${userId} not found` });
        }

        // Add roles to user
        foundUser[0]["roles"] = await formatUserRoles(foundUser[0].id);

        res.status(200).json(foundUser[0]);
    } catch (err) {
        console.error("Error fetching user by ID:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    handleGetAllUsers,
    handleGetUserById,
};
