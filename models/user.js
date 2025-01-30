const db = require("../admin/database");

class User {
  constructor(username, phone, password, fullname, role = 2001) {
    this.username = username;
    this.phone = phone;
    this.password = password;
    this.fullname = fullname;
    this.role = role;
  }

  static async getAllUsers() {
    const sql = `SELECT * FROM users`;
    try {
      return await db.query(sql);
    } catch (err) {
      throw new Error("Error fetching users: " + err.message);
    }
  }

  static async findByUserName(username) {
    const sql = `SELECT * FROM users WHERE username = ? LIMIT 1`;
    try {
      return await db.query(sql, [username]);
    } catch (err) {
      throw new Error("Error fetching user by username: " + err.message);
    }
  }

  static async findById(id) {
    const sql = `SELECT * FROM users WHERE id = ? LIMIT 1`;
    try {
      return await db.query(sql, [id]);
    } catch (err) {
      throw new Error("Error fetching user by ID: " + err.message);
    }
  }

  static async addRoleToUser(uid, role_id) {
    const sql = `INSERT INTO user_roles (uid, role_id) VALUES (?, ?)`;
    try {
      return await db.query(sql, [uid, role_id]);
    } catch (err) {
      throw new Error("Error adding role to user: " + err.message);
    }
  }

  static async getUserRoles(id) {
    const sql = `
            SELECT ref_roles.role, user_roles.role_id 
            FROM user_roles 
            INNER JOIN ref_roles ON user_roles.role_id = ref_roles.id 
            WHERE user_roles.uid = ?`;
    try {
      return await db.query(sql, [id]);
    } catch (err) {
      throw new Error("Error fetching user roles: " + err.message);
    }
  }

  static async getRolesList() {
    const sql = `SELECT * FROM ref_roles`;
    try {
      return await db.query(sql);
    } catch (err) {
      throw new Error("Error fetching roles list: " + err.message);
    }
  }

  static async findByToken(token) {
    const sql = `SELECT * FROM users WHERE refreshToken = ? LIMIT 1`;
    try {
      return await db.query(sql, [token]);
    } catch (err) {
      throw new Error("Error fetching user by token: " + err.message);
    }
  }

  static async refreshToken(id, refreshToken) {
    const sql = `UPDATE users SET refreshToken = ? WHERE id = ?`;
    try {
      return await db.query(sql, [refreshToken, id]);
    } catch (err) {
      throw new Error("Error updating refresh token: " + err.message);
    }
  }

  // Update user details
  static updateUserDetails(id, username, email, phone, password, fullname) {
    let sql = `
      UPDATE users
      SET username = '${username}', email = '${email}', phone = '${phone}', password = '${password}', fullname = '${fullname}'
      WHERE id = '${id}'
    `;
    return db.query(sql);
  }

  // Update user roles
  static async updateRoles(id, roleIds) {
    // First, remove all existing roles for the user
    let sql = `DELETE FROM user_roles WHERE uid = '${id}'`;
    await db.query(sql);

    // Now add the new roles
    for (const roleId of roleIds) {
      await User.addRoleToUser(id, roleId);
    }
  }

  // Remove user roles
  static removeRoles(id) {
    let sql = `DELETE FROM user_roles WHERE uid = '${id}'`;
    return db.query(sql);
  }

  // Delete user
  static deleteUser(id) {
    let sql = `DELETE FROM users WHERE id = '${id}'`;
    return db.query(sql);
  }

  // Add role to user
  static addRoleToUser(uid, role_id) {
    let sql = `INSERT INTO user_roles (uid, role_id) VALUES ('${uid}', '${role_id}')`;
    return db.query(sql);
  }

  async createUser() {
    const sql = `
            INSERT INTO users (username, phone, password, fullname) 
            VALUES (?, ?, ?, ?)`;
    try {
      return await db.query(sql, [
        this.username,
        this.phone,
        this.password,
        this.fullname,
      ]);
    } catch (err) {
      throw new Error("Error creating user: " + err.message);
    }
  }
}

module.exports = User;
