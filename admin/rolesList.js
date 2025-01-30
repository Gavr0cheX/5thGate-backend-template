const permissionsList = {
    READ: 'read',
    WRITE: 'write',
    DELETE: 'delete',
    MANAGE: 'manage'
};

const rolesList = {
    ADMIN: {
        value: 'admin',
        description: 'Administrator with full access to all resources.',
        permissions: [permissionsList.READ, permissionsList.WRITE, permissionsList.DELETE, permissionsList.MANAGE]
    },
    USER: {
        value: 'user',
        description: 'Standard user with limited access to resources.',
        permissions: [permissionsList.READ]
    },
    MODERATOR: {
        value: 'moderator',
        description: 'User with privileges to moderate content.',
        permissions: [permissionsList.READ, permissionsList.DELETE]
    }
};

module.exports = rolesList;
