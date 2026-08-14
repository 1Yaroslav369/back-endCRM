import Joi from 'joi';
import { Segments } from 'celebrate';

export const createOfferSchema = {
  [Segments.BODY]: Joi.object({
    client_id: Joi.number().integer().positive().required(),
    title: Joi.string().min(2).max(30).required(),
    description: Joi.string().min(2).max(110).required(),
    net_price: Joi.number().precision(2).positive().required(),
    vat: Joi.number().valid(0, 5, 8, 23).required(),
    valid_until: Joi.date().iso().required(),
    comment: Joi.string().max(200).allow('', null).trim(),
  }),
};

export const updateOfferSchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(2).max(20),
    description: Joi.string().min(2).max(110).allow('', null).trim(),
    net_price: Joi.number().min(0).precision(2),
    vat: Joi.number().min(0).max(100).precision(2),
    valid_until: Joi.date().iso().allow(null),
    comment: Joi.string().trim().allow('', null).max(200),
  })
    .min(1)
    .unknown(false),
};

export const updateOfferStatusSchema = {
  [Segments.BODY]: Joi.object({
    status: Joi.string()
      .valid('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED')
      .required(),
  }),
};
