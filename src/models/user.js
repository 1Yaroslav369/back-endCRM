import db from '../db/connectDB.js';

class User {
  static async createUser(name, login, password, role) {
    const [result] = await db.execute(
      'INSERT INTO users (name, login, password, role) VALUES (?, ?, ?, ?)',
      [name, login, password, role],
    );

    return result.insertId;
  }

  static async findOneByLogin(login) {
    const [rows] = await db.execute('SELECT * FROM users WHERE login = ?', [
      login,
    ]);

    return rows[0] || null;
  }
}

export default User;
