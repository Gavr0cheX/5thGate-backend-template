const userModel = require('../models/user');

const handleLogout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); // No Content

    const refreshToken = cookies.jwt;

    // Evaluate refresh token
    const foundUser = await userModel.findByToken(refreshToken);
    if (foundUser == undefined || !foundUser[0]) {
        console.error('Invalid or expired refresh token attempt');
        res.clearCookie('jwt', {
            httpOnly: true,
            maxAge: 365 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production', // Secure flag for production
            sameSite: 'Strict' // Prevent cross-site requests
        });
        return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Log the logout event
    console.log(`User ${foundUser[0].username} logged out successfully.`);

    // Delete refresh token from db
    await userModel.refreshToken(foundUser[0].id, null);

    // Clear the cookie
    res.clearCookie('jwt', {
        httpOnly: true,
        maxAge: 365 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production', // Secure flag for production
        sameSite: 'Strict' // Prevent cross-site requests
    });

    res.sendStatus(204); // Successfully logged out
};

module.exports = {
    handleLogout
};
