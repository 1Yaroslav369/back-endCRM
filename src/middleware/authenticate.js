import createHttpError from 'http-errors';
import Session from '../models/session.js';
import User from '../models/user.js';

export const authenticate = async (req, res, next) => {
  try {
    if (!req.cookies.accessToken) {
      return next(createHttpError(401, 'Missing access token'));
    }

    const session = await Session.findByToken(req.cookies.refreshToken);

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

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

