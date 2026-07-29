import Joi from 'joi';
import { Segments } from 'celebrate';

export const createClientValidation = {
  [Segments.BODY]: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    nip: Joi.string().max(10).allow('', null),
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
    name: Joi.string().min(2).optional(),

    nip: Joi.string().allow('').optional(),

    phone: Joi.string().allow('').optional(),

    email: Joi.string().email().allow('').optional(),

    city: Joi.string().allow('').optional(),

    address: Joi.string().allow('').optional(),

    comment: Joi.string().allow('').optional(),
  }),
};


export const getClientValidation = {
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};
