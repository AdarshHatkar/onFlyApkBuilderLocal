import express from 'express';
import UsersController from '../controllers/usersController.js';
import { verifyOwnerAccessToken } from '../helpers/jwtHelper.js';




const router = express.Router();

export { router as usersRoute };


// define the home page route

router.get('/getAllUsersDataTable', verifyOwnerAccessToken, UsersController.getAllUsersDataTable);
router.get('/allRedeemRequests', verifyOwnerAccessToken, UsersController.getAllRedeemRequests);
router.post('/updateRedeemRequest', verifyOwnerAccessToken, UsersController.updateRedeemRequest);

router.post('/updateUserWallet', verifyOwnerAccessToken, UsersController.updateUserWallet);

router.post('/updateUserPassword', verifyOwnerAccessToken, UsersController.updateUserPassword);

router.get('/deleteUser/:userId', verifyOwnerAccessToken, UsersController.deleteUser);