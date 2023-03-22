import express from 'express';
import { trpcRouter } from "../trpc.js";
import { validateAppUsername } from './middlewares/appUsername.js';
import { authRoutes } from './modules/auth.js';
import { basicRoutes } from './modules/basic.js';
import userProfileRoutes from './modules/userProfile.js';
import { appRoute } from './routes/appRoute.js';
import { authRoute } from './routes/authRoute.js';
import { basicRoute } from './routes/basicRoute.js';
import { paytmRoute } from './routes/paytmRoute.js';
import { walletRoute } from './routes/walletRoute.js';
const router = express.Router();


export { router as webAppRoute };


router.use('/:appUsername', validateAppUsername);


// define the home page route
router.get('/:appUsername', (req, res) => {
    const { appUsername } = req.params;
    res.json({
        status: 'success',
        msg: `Welcome to ${appUsername}`
    });

});

router.use('/:appUsername/app', appRoute);
router.use('/:appUsername/auth', authRoute);
router.use('/:appUsername/basic', basicRoute);
router.use('/:appUsername/paytm', paytmRoute);
router.use('/:appUsername/wallet', walletRoute);

// trpc routes 

export const webAppRouter = trpcRouter({

    basic: basicRoutes,
    auth: authRoutes,
    userProfile: userProfileRoutes
});

export type webAppRouterTypes = typeof webAppRouter;
