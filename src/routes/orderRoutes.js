import { Router } from 'express';

import {
  getOrders,
  getOrderById,
  createOrder,
} from '../controllers/orderController.js';

import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

// get all orders
router.get('/order', authenticate, authorize('ADMIN', 'MANAGER'), getOrders);

// get order by id
router.get('/order/:id', authenticate, authorize('ADMIN', 'MANAGER'), getOrderById);

// create order
router.post('/order', authenticate, authorize('ADMIN', 'MANAGER'), createOrder);

export default router;
