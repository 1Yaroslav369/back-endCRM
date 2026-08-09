import { Router } from 'express';
import { celebrate } from 'celebrate';

import {
  getOrders,
  getOrderById,
  createOrder,
} from '../controllers/orderController.js';

import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

import { createOrderValidation } from '../validations/ordersValidation.js';

const router = Router();

// Get all orders
router.get('/orders', authenticate, authorize('ADMIN', 'MANAGER'), getOrders);

// Get order by id
router.get(
  '/orders/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  getOrderById,
);

// Create order
router.post(
  '/orders',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  celebrate(createOrderValidation),
  createOrder,
);

export default router;
