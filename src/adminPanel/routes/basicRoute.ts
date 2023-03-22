import express from 'express';
import BasicController from '../controllers/basicController.js';
import { verifyOwnerAccessToken } from '../helpers/jwtHelper.js';



const router = express.Router();

export { router as basicRoute };


// define the home page route
router.get('/', verifyOwnerAccessToken, BasicController.basicDetails);
router.get('/getDashboardData', verifyOwnerAccessToken, BasicController.getDashboardData);

router.post('/addSupportMethod', verifyOwnerAccessToken, BasicController.addSupportMethod);
router.get('/getSupportMethods', verifyOwnerAccessToken, BasicController.getSupportMethods);
router.get('/deleteSupportMethod/:sn', verifyOwnerAccessToken, BasicController.deleteSupportMethod);

router.post('/addNewGame', verifyOwnerAccessToken, BasicController.addNewGame);
router.get('/getGames', verifyOwnerAccessToken, BasicController.getGames);
router.get('/deleteGame/:sn', verifyOwnerAccessToken, BasicController.deleteGame);


router.post('/addNewRulesCollection', verifyOwnerAccessToken, BasicController.addNewRulesCollection);
router.get('/getRulesCollections', verifyOwnerAccessToken, BasicController.getRulesCollections);
router.get('/deleteRulesCollection/:sn', verifyOwnerAccessToken, BasicController.deleteRulesCollections);


router.post('/addNewRule/:collectionId', verifyOwnerAccessToken, BasicController.addNewRule);
router.get('/getRules/:collectionId', verifyOwnerAccessToken, BasicController.getRules);
router.get('/deleteRule/:collectionId/:sn', verifyOwnerAccessToken, BasicController.deleteRule);


router.post('/submitMatch/:action/:sn', verifyOwnerAccessToken, BasicController.submitMatch);

router.get('/getMatchesDataTable/:get', verifyOwnerAccessToken, BasicController.getMatchesDataTable);
router.get('/deleteMatch/:sn', verifyOwnerAccessToken, BasicController.deleteMatch);
router.get('/getMatchDetails/:sn', verifyOwnerAccessToken, BasicController.getMatchDetails);



router.post('/updateRoomIdAndPass', verifyOwnerAccessToken, BasicController.updateRoomIdAndPass);
router.post('/updateMatchStatus', verifyOwnerAccessToken, BasicController.updateMatchStatus);


router.get('/getResultData/:matchId', verifyOwnerAccessToken, BasicController.getResultData);
router.post('/editResultData', verifyOwnerAccessToken, BasicController.editResultData);
router.get('/publishResult/:matchId', verifyOwnerAccessToken, BasicController.publishResult);
router.get('/cancelMatch/:matchId', verifyOwnerAccessToken, BasicController.cancelMatch);

router.get('/getAdminDepositLogs/:skip/:take', verifyOwnerAccessToken, BasicController.getAdminDepositLogs);
router.get('/refreshAdminDepositLog/:orderId', verifyOwnerAccessToken, BasicController.refreshAdminDepositLog);

router.get('/getUsersDepositLogs/:skip/:take', verifyOwnerAccessToken, BasicController.getUsersDepositLogs);
router.get('/refreshUserDepositLog/:orderId/:userId', verifyOwnerAccessToken, BasicController.refreshUserDepositLog);

router.get('/getWebApkDetails', verifyOwnerAccessToken, BasicController.getWebApkDetails);
router.post('/updateWebApkDetails', verifyOwnerAccessToken, BasicController.updateWebApkDetails);

router.get('/getWebApkList', verifyOwnerAccessToken, BasicController.getWebApkList);
router.post('/placeWebApkOrder', verifyOwnerAccessToken, BasicController.placeWebApkOrder);
router.post('/pushWebApkNotification', verifyOwnerAccessToken, BasicController.pushWebApkNotification);




router.get('/getReferAndEarnConfig', verifyOwnerAccessToken, BasicController.getReferAndEarnConfig);
router.post('/updateReferAndEarnConfig', verifyOwnerAccessToken, BasicController.updateReferAndEarnConfig);

router.post('/addNewCarousel', verifyOwnerAccessToken, BasicController.addNewCarousel);
router.get('/getCarousels', verifyOwnerAccessToken, BasicController.getCarousels);
router.get('/deleteCarousel/:sn', verifyOwnerAccessToken, BasicController.deleteCarousel);

router.post('/addNewAnnouncement', verifyOwnerAccessToken, BasicController.addNewAnnouncement);
router.get('/getAnnouncements', verifyOwnerAccessToken, BasicController.getAnnouncements);
router.get('/deleteAnnouncement/:sn', verifyOwnerAccessToken, BasicController.deleteAnnouncement);

router.get('/getWalletConfig', verifyOwnerAccessToken, BasicController.getWalletConfig);
router.post('/updateWalletConfig', verifyOwnerAccessToken, BasicController.updateWalletConfig);

router.get('/getActivePlanDetails', verifyOwnerAccessToken, BasicController.getActivePlanDetails);
router.post('/purchasePlan', verifyOwnerAccessToken, BasicController.purchasePlan);

router.get('/getMyReferralsList', verifyOwnerAccessToken, BasicController.getMyReferralsList);

router.post('/addNewWithdrawalMethod', verifyOwnerAccessToken, BasicController.addNewWithdrawalMethod);
router.get('/getWithdrawalMethods', verifyOwnerAccessToken, BasicController.getWithdrawalMethods);
router.get('/deleteWithdrawalMethod/:sn', verifyOwnerAccessToken, BasicController.deleteWithdrawalMethod);