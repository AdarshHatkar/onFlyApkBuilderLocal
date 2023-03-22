import express from 'express';
import BasicController from '../controllers/basicController.js';
import { verifyMasterAccessToken } from '../helpers/jwtHelper.js';



const router = express.Router();

export { router as basicRoute };


// define the home page route

router.get('/getDashboardData', verifyMasterAccessToken, BasicController.getDashboardData);


router.get('/getAllOwners', verifyMasterAccessToken, BasicController.getAllOwners);

router.get('/getAllWithdrawals', verifyMasterAccessToken, BasicController.getAllWithdrawals);
router.get('/getAllWithdrawalsDataTable', verifyMasterAccessToken, BasicController.getAllWithdrawalsDataTable);
router.post('/updateWithdrawalStatus', verifyMasterAccessToken, BasicController.updateWithdrawalStatus);
router.get('/getWebApkOrders', verifyMasterAccessToken, BasicController.getWebApkOrdersDataTable);
router.post('/updateWebApkOrder', verifyMasterAccessToken, BasicController.updateWebApkOrder);



