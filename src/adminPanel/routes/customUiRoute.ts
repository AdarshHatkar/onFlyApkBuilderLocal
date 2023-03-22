import express from 'express';
import customUiController from '../controllers/customUiController.js';
import { verifyOwnerAccessToken } from '../helpers/jwtHelper.js';





const router = express.Router();

export { router as customUiRoute };


router.get('/getCustomUiData', verifyOwnerAccessToken, customUiController.getCustomUiData);
router.post('/updateHeaderUi', verifyOwnerAccessToken, customUiController.updateHeaderUi);
router.post('/updateBottomNavbar', verifyOwnerAccessToken, customUiController.updateBottomNavbar);