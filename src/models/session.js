import { pool } from '../db/connectDB.js';

class Session {
  static async createSession(userId, refreshToken, refreshTokenValidUntil) {
    const [result] = await pool.execute(
      'INSERT INTO sessions (user_id, refresh_token,   refresh_token_valid_until) VALUES (?, ?, ?)',
      [userId, refreshToken, refreshTokenValidUntil],
    );
    return result.insertId;
  }
  static async findByToken(refreshToken) {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM sessions
      WHERE refresh_token = ?
      `,
      [refreshToken],
    );

    return rows[0] || null;
  }
  static async deleteByToken(refreshToken) {
    await pool.execute(
      `
      DELETE FROM sessions
      WHERE refresh_token = ?
      `,
      [refreshToken],
    );
  }
  static async deleteByUserId(userId) {
    await pool.execute(
      `
      DELETE FROM sessions
      WHERE user_id = ?
      `,
      [userId],
    );
  }
}

export default Session;
