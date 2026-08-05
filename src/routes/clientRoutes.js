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
  archiveClient,
  searchClients,
} from '../controllers/clientController.js';

const router = Router();

router.get('/clients', authenticate, getClients);

router.get('/clients/search', authenticate, searchClients);

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

router.patch(
  '/clients/:id/archive',
  authenticate,
  celebrate(updateClientValidation),
  archiveClient,
);

export default router;
