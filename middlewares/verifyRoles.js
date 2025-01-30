const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.roles) {
            return res.status(401).json({ message: "Unauthorized: Roles not found" });
        }

        const hasRole = req.roles.some(role => allowedRoles.includes(role));
        if (!hasRole) {
            return res.status(403).json({ message: "Forbidden: Insufficient privileges" });
        }

        next();
    };
};

module.exports = verifyRoles;
