import { Router } from 'express';
import { celebrate } from 'celebrate';

import {
  createOfferController,
  getOffersController,
  getOfferByIdController,
  updateOfferController,
  downloadOfferPdfController,
  updateOfferStatusController,
} from '../controllers/offerController.js';

import {
  createOfferSchema,
  updateOfferSchema,
  updateOfferStatusSchema,
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

router.patch(
  '/offers/:id/status',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  celebrate(updateOfferStatusSchema),
  updateOfferStatusController,
);

router.get(
  '/offers/:id/download',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  downloadOfferPdfController,
);
export default router;
