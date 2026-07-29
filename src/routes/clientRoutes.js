import { Router } from 'express';
import { celebrate } from 'celebrate';

import { authenticate } from '../middleware/authenticate.js';

import {
  createClientValidation,
  getClientValidation,
  updateClientValidation,
} from '../validations/clientValidations.js';

import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} from '../controllers/clientController.js';

const router = Router();

router.get('/clients', authenticate, getClients);

router.get(
  '/clients/:id',
  authenticate,
  celebrate(getClientValidation),
  getClientById,
);

router.post(
  '/clients',
  authenticate,
  celebrate(createClientValidation),
  createClient,
);

router.patch(
  '/clients/:id',
  authenticate,
  celebrate(updateClientValidation),
  updateClient,
);

router.delete(
  '/clients/:id',
  authenticate,
  celebrate(getClientValidation),
  deleteClient,
);

export default router;
