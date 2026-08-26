import {
  createCalculator,
  getCalculatorConfig,
} from '../services/calculatorService.js';

// CREATE CALCULATOR
export const createCalculatorController = async (req, res, next) => {
  try {
    const result = await createCalculator(req.body);

    res.status(201).json({
      status: 201,
      message: 'Calculator created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET CALCULATOR CONFIG
export const getCalculatorConfigController = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const result = await getCalculatorConfig(productId);

    res.status(200).json({
      status: 200,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
