import express from 'express';
import { trpcRouter } from '../trpc.js';
import { authRoutes } from './modules/auth.js';
import { dashboardRoutes } from './modules/dashboard.js';
import { ownersRoutes } from './modules/owners.js';
import { webApkRoutes } from './modules/webApk.js';
import { withdrawalsRoutes } from './modules/withdrawals.js';

const router = express.Router();


import { authRoute } from './routes/authRoute.js';
import { basicRoute } from './routes/basicRoute.js';
import { emailRoute } from './routes/emailRoute.js';
import { jqueryTableRoute } from './routes/jqueryTableRoute.js';

import { ownerRoute } from './routes/ownerRoute.js';

export { router as masterPanelRoute };



// define the home page route
router.get('/', (req, res) => {
    res.json({
        status: 'success',
        msg: 'Welcome to Master panel base'
    });

});



router.use('/email', emailRoute);
router.use('/auth', authRoute);
router.use('/basic', basicRoute);
router.use('/owner', ownerRoute);
router.use('/jqueryTable', jqueryTableRoute);





// trpc routes 

export const masterPanelRouter = trpcRouter({


    auth: authRoutes,
    dashboard: dashboardRoutes,
    owners: ownersRoutes,
    webApk: webApkRoutes,
    withdrawals: withdrawalsRoutes

});

export type masterPanelRouterTypes = typeof masterPanelRouter;
