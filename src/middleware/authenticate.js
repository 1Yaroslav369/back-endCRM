import createHttpError from 'http-errors';

import Session from '../models/session.js';
import User from '../models/user.js';

export const authenticate = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return next(createHttpError(401, 'Missing refresh token'));
    }

    const session = await Session.findByToken(refreshToken);

    if (!session) {
      return next(createHttpError(401, 'Invalid session'));
    }

    const isExpired = new Date() > new Date(session.refresh_token_valid_until);

    if (isExpired) {
      return next(createHttpError(401, 'Session expired'));
    }

    const user = await User.findById(session.user_id);

    if (!user) {
      return next(createHttpError(404, 'User not found'));
    }

    req.user = {
      id: user.id,
      name: user.name,
      login: user.login,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};
