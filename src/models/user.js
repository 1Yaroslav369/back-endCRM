import {pool} from '../db/connectDB.js';

class User {
  static async createUser(name, login, password, role) {
    const [result] = await pool.execute(
      'INSERT INTO users (name, login, password, role) VALUES (?, ?, ?, ?)',
      [name, login, password, role],
    );

    return result.insertId;
  }

  static async findOneByLogin(login) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE login = ?', [
      login,
    ]);

    return rows[0] || null;
  }
}

export default User;
