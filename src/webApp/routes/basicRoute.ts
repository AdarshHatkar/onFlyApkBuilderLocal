import express from 'express';
import BasicController from '../controllers/basicController.js';
import { verifyUserAccessToken } from '../helpers/jwtHelper.js';






const router = express.Router();

export { router as basicRoute };



// define the home page route
router.get('/', verifyUserAccessToken, BasicController.basicDetails);
router.get('/getSupportMethods', BasicController.getSupportMethods);

router.get('/getGames', BasicController.getGames);


router.get('/getUpcomingMatches/:gameId/:skip', verifyUserAccessToken, BasicController.getUpcomingMatches);
router.get('/getOngoingMatches/:gameId/:skip', BasicController.getOngoingMatches);
router.get('/getResultedMatches/:gameId/:skip', BasicController.getResultedMatches);


router.get('/getMatchDetails/:gameId/:sn', verifyUserAccessToken, BasicController.getMatchDetails);
router.get('/getAllJoinings/:sn/:skip', verifyUserAccessToken, BasicController.getAllJoinings);

router.post('/addJoining/:gameId/:sn', verifyUserAccessToken, BasicController.addJoining);

router.get('/getWebApkInitData', BasicController.getWebApkInitData);
router.get('/getReferAndEarnConfig', verifyUserAccessToken, BasicController.getReferAndEarnConfig);
router.get('/getMyReferrals', verifyUserAccessToken, BasicController.getMyReferrals);

router.get('/getCarousels', BasicController.getCarousels);
router.get('/getAnnouncements', BasicController.getAnnouncements);


