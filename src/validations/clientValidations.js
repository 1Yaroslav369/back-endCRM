import Joi from 'joi';
import { Segments } from 'celebrate';

export const createClientValidation = {
  [Segments.BODY]: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    phone: Joi.string().min(7).max(50).allow('', null),
    email: Joi.string().email().allow('', null),
    city: Joi.string().max(100).allow('', null),
    address: Joi.string().max(255).allow('', null),
    comment: Joi.string().max(1000).allow('', null),
  }),
};

export const updateClientValidation = {
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),

  [Segments.BODY]: Joi.object({
    name: Joi.string().min(2).max(255),
    phone: Joi.string().min(7).max(50).allow('', null),
    email: Joi.string().email().allow('', null),
    city: Joi.string().max(100).allow('', null),
    address: Joi.string().max(255).allow('', null),
    comment: Joi.string().max(1000).allow('', null),
  }).min(1),
};

export const getClientValidation = {
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};
