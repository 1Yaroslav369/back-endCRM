import { Router } from 'express';
import { celebrate } from 'celebrate';

//import validations
import {
  createClientValidation,
  getClientValidation,
  updateClientValidation
} from '../validations/clientValidations.js';
import { createClient,
  getClients,
  getClientById,
  updateClient
  } from '../controllers/clientController.js';

const router = Router();

router.post('/clients', celebrate(createClientValidation), createClient);
router.get('/clients', getClients);
router.get('/clients/:id', celebrate(getClientValidation), getClientById);
router.patch('/clients/:id', celebrate(updateClientValidation), updateClient);

export default router;
