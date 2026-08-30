const { ObjectId } = require('mongodb');
const { getMongoDb } = require('../admin/mongoDatabase');

const DEFAULT_ROLE_ID = 2001;

const isObjectId = (value) => {
  return ObjectId.isValid(value) && String(new ObjectId(value)) === String(value);
};

const toMongoId = (value) => {
  if (isObjectId(value)) {
    return new ObjectId(value);
  }

  return value;
};

const normalizeUser = (doc) => {
  if (!doc) {
    return doc;
  }

  return {
    id: doc._id.toString(),
    username: doc.username,
    email: doc.email ?? null,
    phone: doc.phone,
    password: doc.password,
    fullname: doc.fullname,
    refreshToken: doc.refreshToken ?? null,
    main_uid: doc.main_uid ?? null,
    roles: Array.isArray(doc.roles) ? doc.roles : [],
  };
};

const normalizePublicUser = (doc) => ({
  id: doc._id.toString(),
  username: doc.username,
  email: doc.email ?? null,
  phone: doc.phone,
  fullname: doc.fullname,
  main_uid: doc.main_uid ?? null,
});

const mapRole = (doc) => ({
  role: doc.role,
  role_id: doc.id,
});

class User {
  constructor(username, phone, password, fullname, role = DEFAULT_ROLE_ID) {
    this.username = username;
    this.phone = phone;
    this.password = password;
    this.fullname = fullname;
    this.role = role;
  }

  static async getAllUsers() {
    const db = await getMongoDb();
    const docs = await db.collection('users')
      .find({}, { projection: { password: 0, refreshToken: 0 } })
      .sort({ username: 1 })
      .toArray();

    return docs.map(normalizePublicUser);
  }

  static async findByUserName(username) {
    const db = await getMongoDb();
    const user = await db.collection('users').findOne({ username });
    return user ? [normalizeUser(user)] : [];
  }

  static async findByPhone(phone) {
    const db = await getMongoDb();
    const user = await db.collection('users').findOne({ phone });
    return user ? [normalizeUser(user)] : [];
  }

  static async findById(id) {
    const db = await getMongoDb();
    const user = await db.collection('users').findOne({ _id: toMongoId(id) });
    return user ? [normalizeUser(user)] : [];
  }

  static async addRoleToUser(uid, role_id) {
    const db = await getMongoDb();
    await db.collection('users').updateOne(
      { _id: toMongoId(uid) },
      { $addToSet: { roles: role_id } }
    );
  }

  static async getUserRoles(id) {
    const db = await getMongoDb();
    const user = await db.collection('users').findOne(
      { _id: toMongoId(id) },
      { projection: { roles: 1 } }
    );

    const roleIds = Array.isArray(user?.roles) ? user.roles : [];
    if (!roleIds.length) {
      return [];
    }

    const roles = await db.collection('ref_roles')
      .find({ id: { $in: roleIds } })
      .sort({ id: 1 })
      .toArray();

    const roleById = new Map(roles.map((role) => [role.id, mapRole(role)]));
    return roleIds.map((roleId) => roleById.get(roleId)).filter(Boolean);
  }

  static async getRolesList() {
    const db = await getMongoDb();
    const roles = await db.collection('ref_roles').find({}).sort({ id: 1 }).toArray();
    return roles.map(mapRole);
  }

  static async findByToken(token) {
    const db = await getMongoDb();
    const user = await db.collection('users').findOne({ refreshToken: token });
    return user ? [normalizeUser(user)] : [];
  }

  static async refreshToken(id, refreshToken) {
    const db = await getMongoDb();
    return db.collection('users').updateOne(
      { _id: toMongoId(id) },
      { $set: { refreshToken } }
    );
  }

  static async updateUserDetails(id, username, email, phone, password, fullname) {
    const db = await getMongoDb();
    return db.collection('users').updateOne(
      { _id: toMongoId(id) },
      {
        $set: {
          username,
          email,
          phone,
          password,
          fullname,
        },
      }
    );
  }

  static async updateRoles(id, roleIds) {
    const db = await getMongoDb();
    return db.collection('users').updateOne(
      { _id: toMongoId(id) },
      {
        $set: {
          roles: Array.from(new Set(roleIds)),
        },
      }
    );
  }

  static async removeRoles(id) {
    const db = await getMongoDb();
    return db.collection('users').updateOne(
      { _id: toMongoId(id) },
      { $set: { roles: [] } }
    );
  }

  static async deleteUser(id) {
    const db = await getMongoDb();
    return db.collection('users').deleteOne({ _id: toMongoId(id) });
  }

  async createUser() {
    const db = await getMongoDb();

    return db.collection('users').insertOne({
      username: this.username,
      phone: this.phone,
      password: this.password,
      fullname: this.fullname,
      email: null,
      refreshToken: null,
      main_uid: null,
      roles: [this.role],
    });
  }
}

module.exports = User;
