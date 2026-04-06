import dotenv from "dotenv";
dotenv.config();

import { Router } from "express";

import {authController} from "../controller/auth.controller.js"
import {authMiddleware} from "../middleware/auth.middleware.js"
import { roleAccess } from "../middleware/roleAcces.middleware.js"
const authRouter = Router()

authRouter.post('/register', authController.register)
// authRouter.post('/register', authMiddleware, roleAccess(['admin']), authController.register)
authRouter.post('/login', authController.login)

export default authRouter