import express from 'express';
import walletController from '../controllers/walletController.js';

import { validate } from '../../globalHelpers/validate.js';
import { verifyUserAccessToken } from '../helpers/jwtHelper.js';




const router = express.Router();

export { router as walletRoute };


router.get('/walletHistory/:skip', verifyUserAccessToken, walletController.getWalletHistory);

router.post('/withdrawRequest', verifyUserAccessToken, walletController.placeWithdrawRequestValidationRules(), validate, walletController.placeWithdrawRequest);
router.get('/getWalletConfig', walletController.getWalletConfig);

