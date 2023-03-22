import express from 'express';
import { convertToInt } from '../../globalHelpers/utility.js';
import { validate } from '../../globalHelpers/validate.js';
import paytmController, { refreshUserDepositTransactionStatus } from '../controllers/paytmController.js';

import { verifyUserAccessToken } from '../helpers/jwtHelper.js';




const router = express.Router();

export { router as paytmRoute };




// for react app
router.post('/initReact', verifyUserAccessToken, paytmController.initReactTransactionValidationRules(), validate, paytmController.initReactTransaction);

router.post('/responseReact/:userId', async (req, res) => {


    let userIdString = req.params.userId
    let userId = convertToInt(userIdString);
    const { ORDERID } = req.body;
    const orderId = convertToInt(ORDERID);

    const resData = await refreshUserDepositTransactionStatus(userId, orderId);
    // console.log({ resData });
    //@ts-ignore
    const redirectUrl = `${resData?.clientLocationUrl}?transactionStatus=${resData?.transactionStatus}&transactionResponse=${encodeURIComponent(resData?.transactionResponse)}`;


    // res.send(resData);
    return res.redirect(redirectUrl);


});


