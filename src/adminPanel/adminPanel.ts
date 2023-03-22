import express from 'express';
import { trpcRouter } from '../trpc.js';
import { authRoutes } from './modules/auth.js';
import { dashboardRoutes } from './modules/dashboard.js';

const router = express.Router();





import { authRoute } from './routes/authRoute.js';
import { basicRoute } from './routes/basicRoute.js';
import { customUiRoute } from './routes/customUiRoute.js';
import { emailRoute } from './routes/emailRoute.js';
import { paytmRoute } from './routes/paytmRoute.js';
import { usersRoute } from './routes/usersRoute.js';
import { walletRoute } from './routes/walletRoute.js';

export { router as adminPanelRoute };



// define the home page route
router.get('/', (req, res) => {
    res.json({
        status: 'success',
        msg: 'Welcome to admin panel base'
    });

});



router.use('/email', emailRoute);
router.use('/auth', authRoute);
router.use('/basic', basicRoute);
router.use('/paytm', paytmRoute);
router.use('/wallet', walletRoute);
router.use('/users', usersRoute);
router.use('/customUi', customUiRoute);




// trpc routes 

export const adminPanelRouter = trpcRouter({


    auth: authRoutes,
    dashboard: dashboardRoutes,
    // owners: ownersRoutes,
    // webApk: webApkRoutes,
    // withdrawals: withdrawalsRoutes

});

export type adminPanelRouterTypes = typeof adminPanelRouter;

