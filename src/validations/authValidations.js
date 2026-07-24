import Joi from 'joi';
import { Segments } from 'celebrate';

export const registerValidation = {
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().min(3).max(30).required(),
    login: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(8).max(30).required(),
    role: Joi.string().valid('admin', 'manager').required(),
  }),
};

export const loginValidation = {
  [Segments.BODY]: Joi.object({
    login: Joi.string().required(),
    password: Joi.string().required(),
  }),
};
