import express from 'express';
import { convertToInt } from '../../globalHelpers/utility.js';
import { validate } from '../../globalHelpers/validate.js';
import paytmController, { refreshOwnerDepositTransactionStatus } from '../controllers/paytmController.js';
import { verifyOwnerAccessToken } from '../helpers/jwtHelper.js';





const router = express.Router();

export { router as paytmRoute };

// define the home page route
router.post('/init', verifyOwnerAccessToken, paytmController.initTransactionValidationRules(), validate, paytmController.initTransaction);
router.post('/response/:ownerId', (req, res) => {

    async function main() {

        let ownerIdString = req.params.ownerId
        let ownerId = convertToInt(ownerIdString)
        const { ORDERID } = req.body;
        const orderId = convertToInt(ORDERID);

        const resData = await refreshOwnerDepositTransactionStatus(ownerId, orderId);
        //@ts-ignore
        const redirectUrl = `${resData.clientLocationUrl}?transactionStatus=${resData.transactionStatus}&transactionResponse=${encodeURIComponent(resData.transactionResponse)}`;
        // console.log();

        // res.send(resData);
        return res.redirect(redirectUrl);
    }
    main();

});