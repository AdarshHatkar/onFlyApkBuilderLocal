import express from 'express';
import { validate } from '../../globalHelpers/validate.js';
import authController from '../controllers/authController.js';
import { verifyMasterRefreshToken } from '../helpers/jwtHelper.js';



const router = express.Router();

export { router as authRoute };
router.get('/', (req, res) => {
    res.json({
        status: 'success',
        msg: 'Welcome to Mater panel auth base'
    });

});


router.post('/login', authController.masterLoginValidationRules(), validate, authController.masterLogin);

router.get('/refresh-token', verifyMasterRefreshToken, authController.refreshToken);