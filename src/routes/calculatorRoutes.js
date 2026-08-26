import { Router } from 'express';

import { celebrate } from 'celebrate';

import {
  createCalculatorController,
  getCalculatorConfigController,
} from '../controllers/calculatorController.js';

import { createCalculatorSchema } from '../validations/calculatorValidations.js';

import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.post(
  '/calculator',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  celebrate(createCalculatorSchema),
  createCalculatorController,
);

router.get(
  '/calculator/:productId',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  getCalculatorConfigController,
);

export default router;
