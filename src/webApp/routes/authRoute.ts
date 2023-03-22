import express from 'express';
import { validateBody } from '../../globalHelpers/validate.js';
import AuthController from '../controllers/authController.js';
import { verifyUserRefreshToken } from '../helpers/jwtHelper.js';


const router = express.Router();



export { router as authRoute };




router.post('/register', validateBody(AuthController.registerBodySchema), AuthController.register);
router.post('/login', validateBody(AuthController.loginBodySchema), AuthController.login);

router.get('/refreshToken', verifyUserRefreshToken, AuthController.refreshToken);