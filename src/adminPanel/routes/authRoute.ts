import express from 'express';
import { validate } from '../../globalHelpers/validate.js';
import authController from '../controllers/authController.js';
import { verifyOwnerRefreshToken } from '../helpers/jwtHelper.js';



const router = express.Router();

export { router as authRoute };
router.get('/', (req, res) => { 
    res.json({
        status: 'success',
        msg: 'Welcome to admin panel auth base'
    });

});

router.post('/register',authController.adminRegisterValidationRules(),validate,authController.adminRegister);
router.post('/login',authController.adminLoginValidationRules(),validate,authController.adminLogin);

router.get('/refresh-token',verifyOwnerRefreshToken,authController.refreshToken);