import express from 'express';
import walletController from '../controllers/walletController.js';

import { validate } from '../../globalHelpers/validate.js';
import { verifyOwnerAccessToken } from '../helpers/jwtHelper.js';



const router = express.Router();

export { router as walletRoute };


router.get('/walletHistory/:skip/:take', verifyOwnerAccessToken, walletController.getWalletHistory);

router.post('/withdrawRequest', verifyOwnerAccessToken, walletController.placeWithdrawRequestValidationRules(), validate, walletController.placeWithdrawRequest);

