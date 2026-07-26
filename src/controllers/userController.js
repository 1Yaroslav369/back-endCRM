//!Models
import User from '../models/user.js';
import Session from '../models/session.js';
//!libraries
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
//!services
import * as auth from '../services/auth.js';
//
import { pool } from '../db/connectDB.js';

export const registerUser = async (req, res, next) => {
  try {
    const { name, login, password, role } = req.body;

    const existingUser = await User.findOneByLogin(login);

    if (existingUser) {
      return next(createHttpError(409, 'User with this login already exists'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await User.createUser(name, login, hashedPassword, role);

    const newSession = await auth.createSession(userId);

    auth.setSessionCookies(res, newSession);

    res.status(201).json({
      id: userId,
      name,
      login,
      role,
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { login, password } = req.body;

    const user = await User.findOneByLogin(login);

    if (!user) {
      return next(createHttpError(401, 'Invalid login or password'));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return next(createHttpError(401, 'Invalid login or password'));
    }

    await Session.deleteByUserId(user.id);

    const newSession = await auth.createSession(user.id);

    auth.setSessionCookies(res, newSession);

    const safeUser = {
      id: user.id,
      name: user.name,
      login: user.login,
      role: user.role,
    };

    res.status(200).json(safeUser);
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const { refreshToken} = req.cookies;

    console.log('refreshToken:', refreshToken);
    if(refreshToken) {
      await pool.execute('DELETE FROM sessions WHERE refresh_token = ?', [refreshToken]);
    }
    res.clearCookie('sessionid');
    res.clearCookie('refreshToken');
    res.status(204).send();

  } catch (error) {
    next(error);
  }
};


export const refreshUserSession = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return next(createHttpError(401, 'Refresh token not found'));
    }

    //find session by refreshToken
    const [rows] = await pool.execute(
      'SELECT * FROM sessions WHERE refresh_token = ?',
      [refreshToken]
    );

    if (rows.length === 0) {
      return next(createHttpError(401, 'Session not found'));
    }

    const session = rows[0];

    // Check if the session is expired
    if (new Date() > new Date(session.refresh_token_valid_until)) {
      await pool.execute(
        'DELETE FROM sessions WHERE refresh_token = ?',
        [refreshToken]
      );

      return next(createHttpError(401, 'Session token expired'));
    }

    // delite old session
    await pool.execute(
      'DELETE FROM sessions WHERE refresh_token = ?',
      [refreshToken]
    );

    // create new session
    const newSession = await auth.createSession(session.user_id);

    // Set new session cookies
    auth.setSessionCookies(res, newSession);

    res.status(200).json({
      message: 'Session refreshed',
    });
  } catch (error) {
    next(error);
  }
};
