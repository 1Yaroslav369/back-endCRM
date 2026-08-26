import Joi from 'joi';
import { Segments } from 'celebrate';

const calculatorSideSchema = Joi.object({
  side: Joi.string().valid('A', 'B').required(),

  option_id: Joi.number().integer().positive().required(),
}).unknown(false);

const calculatorServiceSchema = Joi.object({
  service_id: Joi.number().integer().positive().required(),

  quantity: Joi.number().positive().precision(3).required(),

  rule_code: Joi.string().max(100).trim().allow(null).default(null),
}).unknown(false);

const calculatorVariantSchema = Joi.object({
  variant_number: Joi.number().integer().positive().required(),

  door_code: Joi.string().max(50).trim().required(),

  quantity: Joi.number().integer().positive().required(),

  room: Joi.string().max(255).trim().allow('', null).default(null),

  leaf_width: Joi.number().integer().positive().required(),

  leaf_height: Joi.number().integer().positive().required(),

  opening_width: Joi.number().integer().positive().required(),

  opening_height: Joi.number().integer().positive().required(),

  lock_option_id: Joi.number().integer().positive().allow(null).default(null),

  handle_option_id: Joi.number().integer().positive().allow(null).default(null),

  ventilation_option_id: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .default(null),

  sides: Joi.array()
    .items(calculatorSideSchema)
    .length(2)
    .custom((sides, helpers) => {
      const sideNames = sides.map((item) => item.side);

      const hasOneA = sideNames.filter((side) => side === 'A').length === 1;

      const hasOneB = sideNames.filter((side) => side === 'B').length === 1;

      if (!hasOneA || !hasOneB) {
        return helpers.error('any.custom');
      }

      return sides;
    })
    .messages({
      'any.custom': 'Sides must contain exactly one A side and one B side',
    })
    .required(),

  services: Joi.array().items(calculatorServiceSchema).default([]),
}).unknown(false);

export const createCalculatorSchema = {
  [Segments.BODY]: Joi.object({
    product_id: Joi.number().integer().positive().required(),

    title: Joi.string().min(2).max(255).trim().required(),

    side_a_option_id: Joi.number()
      .integer()
      .positive()
      .allow(null)
      .default(null),

    side_b_option_id: Joi.number()
      .integer()
      .positive()
      .allow(null)
      .default(null),

    profile_finish_option_id: Joi.number()
      .integer()
      .positive()
      .allow(null)
      .default(null),

    installation_enabled: Joi.boolean().required(),

    vat: Joi.number().valid(0, 5, 8, 23).required(),

    eur_rate: Joi.number().positive().precision(4).allow(null).default(null),

    variants: Joi.array().items(calculatorVariantSchema).min(1).required(),
  }).unknown(false),
};
