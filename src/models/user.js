import db from '../db/connectDB.js';

class User {
  static async createUser(name, login, password, role) {
    const [result] = await db.execute(
      'INSERT INTO users (name, login, password, role) VALUES (?, ?, ?, ?)',
      [name, login, password, role]
    );
    return result.insertId;
  }
}

export default User;
