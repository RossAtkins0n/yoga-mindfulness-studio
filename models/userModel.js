// models/userModel.js
import { usersDb } from "./_db.js";

export const UserModel = {
  async create(user) {
    return usersDb.insert(user);
  },

  async findByEmail(email) {
    return usersDb.findOne({ email });
  },

  async findById(id) {
    return usersDb.findOne({ _id: id });
  },

  async findBySessionToken(sessionToken) {
    return usersDb.findOne({ sessionToken });
  },

  async list(filter = {}) {
    return usersDb.find(filter).sort({ name: 1 });
  },

  async update(id, patch) {
    await usersDb.update({ _id: id }, { $set: patch });
    return this.findById(id);
  },

  async delete(id) {
    return usersDb.remove({ _id: id }, {});
  },

  async setSession(id, sessionToken) {
    await usersDb.update({ _id: id }, { $set: { sessionToken } });
    return this.findById(id);
  },

  async clearSession(id) {
    await usersDb.update({ _id: id }, { $unset: { sessionToken: true } });
    return this.findById(id);
  }
};