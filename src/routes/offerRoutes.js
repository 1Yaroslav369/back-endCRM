import { Router } from 'express';
import { celebrate } from 'celebrate';

import {
  createOfferController,
  getOffersController,
  getOfferByIdController,
  updateOfferController,
} from '../controllers/offerController.js';

import {
  createOfferSchema,
  updateOfferSchema,
} from '../validations/offerValidations.js';

import { authorize } from '../middleware/authorize.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.post(
  '/offers',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  celebrate(createOfferSchema),
  createOfferController,
);

router.get(
  '/offers',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  getOffersController,
);

router.get(
  '/offers/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  getOfferByIdController,
);

router.patch(
  '/offers/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  celebrate(updateOfferSchema),
  updateOfferController,
);

export default router;
