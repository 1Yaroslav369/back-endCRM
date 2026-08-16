import Joi from 'joi';
import { Segments } from 'celebrate';

export const createOfferSchema = {
  [Segments.BODY]: Joi.object({
    // Existing client OR null for potential client
    client_id: Joi.number().integer().positive().allow(null).default(null),

    // Used for potential client
    client_name: Joi.string().min(2).max(255).trim().allow('', null),

    client_phone: Joi.string().max(50).trim().allow('', null),

    client_email: Joi.string().email().max(255).trim().allow('', null),

    title: Joi.string().min(2).max(255).trim().required(),

    description: Joi.string().min(2).max(110).allow('', null).trim().required(),

    net_price: Joi.number().precision(2).positive().required(),

    vat: Joi.number().valid(0, 5, 8, 23).required(),

    valid_until: Joi.date().iso().required(),

    comment: Joi.string().max(200).allow('', null).trim(),
  })
    // If there is no client_id,
    // client_name must be provided.
    .custom((value, helpers) => {
      if (!value.client_id && !value.client_name) {
        return helpers.error('any.custom', {
          message:
            'client_name is required when creating an offer without an existing client',
        });
      }

      return value;
    })
    .messages({
      'any.custom': '{{#message}}',
    }),
};

export const updateOfferSchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(2).max(255).trim(),

    description: Joi.string().min(2).max(110).allow('', null).trim(),

    net_price: Joi.number().min(0).precision(2),

    vat: Joi.number().valid(0, 5, 8, 23),

    valid_until: Joi.date().iso().allow(null),

    comment: Joi.string().trim().allow('', null).max(200),
  })
    .min(1)
    .unknown(false),
};

export const updateOfferStatusSchema = {
  [Segments.BODY]: Joi.object({
    status: Joi.string()
      .valid('SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED')
      .required(),
  }),
};
