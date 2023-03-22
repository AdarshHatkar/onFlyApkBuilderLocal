import express from 'express';
import UsersController from '../controllers/ownerController.js';
import { verifyMasterAccessToken } from '../helpers/jwtHelper.js';




const router = express.Router();

export { router as ownerRoute };


// define the home page route
// router.get('/', verifyMasterAccessToken, UsersController.getAllUsers);

router.post('/updateOwnerWallet', verifyMasterAccessToken, UsersController.updateOwnerWallet);

