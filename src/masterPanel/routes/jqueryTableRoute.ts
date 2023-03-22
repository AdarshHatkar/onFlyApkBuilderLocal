import express from 'express';
import jqueryTableRouteController from '../controllers/jqueryTableRouteController.js';
import { verifyMasterAccessToken } from '../helpers/jwtHelper.js';



const router = express.Router();

export { router as jqueryTableRoute };




router.get('/getAllOwnersDataTable', verifyMasterAccessToken, jqueryTableRouteController.allOwnersDataTable);