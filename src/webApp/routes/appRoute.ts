import express from 'express';
import AppController from '../controllers/appController.js';





const router = express.Router();

export { router as appRoute };


router.get('/', (req, res) => {
    const { appUsername } = req.appData;

    console.log(req.params);
    res.json({
        status: 'success',
        msg: `Welcome to ${appUsername}/basic`
    });

});

router.get('/getDetails', AppController.getDetails);
router.get('/getCustomUiData', AppController.getCustomUiData);
