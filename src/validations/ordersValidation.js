import Joi from 'joi';
import { Segments } from 'celebrate';

export const createOrderValidation = {
  [Segments.BODY]: Joi.object({
    client_id: Joi.number().integer().positive().required(),
    title: Joi.string().min(2).max(255).required(),
    total_price: Joi.number().min(0).required(),
    deadline: Joi.date().allow(null),
    comment: Joi.string().allow('', null),
  }),
};
