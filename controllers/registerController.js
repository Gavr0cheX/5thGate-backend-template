const bcrypt = require('bcrypt');
const userModel = require('../models/user');

const handleNewUser = async (req, res) => {
    const { username, phone, password, fullname } = req.body;

    // Validate input
    if (!username || !phone || !password || !fullname) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    try {
        // Check for duplicate username or phone
        const duplicateUser = await userModel.findByUserName(username);
        const duplicatePhone = await userModel.findByPhone(phone); // Assuming this function exists
        if (duplicateUser.length > 0 || duplicatePhone.length > 0) {
            return res.status(409).json({ message: "Username or phone number already exists" });
        }

        // Encrypt the password
        const hashedPWD = await bcrypt.hash(password, 10);

        // Store the new user
        let newUser = new userModel(username, phone, hashedPWD, fullname);
        await newUser.createUser();

        // Retrieve the created user
        const createdUser = await userModel.findByUserName(username);

        // Assign default role
        await userModel.addRoleToUser(createdUser[0].id, 2001);

        // Success response
        return res.status(201).json({ message: `User ${username} created successfully` });
    } catch (err) {
        console.error("Error creating user:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    handleNewUser
};
