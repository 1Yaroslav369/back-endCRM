import jwt from 'jsonwebtoken';
import Session from '../models/session.js';
import { ONE_DAY } from '../constans/time.js';

export const createSession = async (userId) => {
  const refreshToken = jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: '30d',
    },
  );

  const refreshTokenValidUntil = new Date(Date.now() + ONE_DAY);

  await Session.createSession(userId, refreshToken, refreshTokenValidUntil);

  return {
    refreshToken,
    refreshTokenValidUntil,
  };
};

export const setSessionCookies = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    expires: session.refreshTokenValidUntil,
  });
};
