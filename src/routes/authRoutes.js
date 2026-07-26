import { Router } from 'express';
import { celebrate } from 'celebrate';

//import controllers
import {
  registerUser,
  loginUser,
  logoutUser
} from '../controllers/userController.js';

//import validations
import {
  loginValidation,
  registerValidation,
} from '../validations/authValidations.js';

const router = Router();

router.post('/auth/register', celebrate(registerValidation), registerUser);
router.post('/auth/login', celebrate(loginValidation), loginUser);
router.post('/auth/logout', logoutUser);

export default router;
