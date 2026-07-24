import { Router } from "express";
import { celebrate } from "celebrate";

//import controllers
import {registerUser} from "../controllers/userController.js";

//import validations
import { registerValidation } from "../validations/authValidations.js";

const router = Router();

router.post("/auth/register", celebrate(registerValidation), registerUser);

export default router;
