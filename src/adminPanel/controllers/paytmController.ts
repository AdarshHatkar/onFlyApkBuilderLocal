
import { body } from 'express-validator';
import Paytm from 'paytm-pg-node-sdk';
import createTransaction from '../../globalControllers/transactionController.js';
import myPrisma from '../../globalHelpers/myPrisma.js';
import { unixTimeStampInSeconds } from '../../globalHelpers/utility.js';

export const refreshOwnerDepositTransactionStatus = async (ownerId, orderId) => {

    try {



        const depositLogData = await myPrisma.owners_deposit_log.findFirst({
            where: {
                ownerId, orderId
            }
        });

        if (!depositLogData) {
            return {
                status: 'error',
                msg: 'deposit log not found',
            };
        }

        if (depositLogData.walletUpdateStatus === true) {
            return {
                status: 'error',
                msg: 'wallet already updated',
            };
        }

        // initiating paytm code


        // For Production 
        var environment = Paytm.LibraryConstants.PRODUCTION_ENVIRONMENT;

        // Find your mid, key, website in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys 
        var mid = 'sOGYCE31009545550862';
        var key = 'wIGlN@_RaZ&m1j%y';
        var website = 'YOUR_WEBSITE_NAME';
        var client_id = 'DEFAULT';





        var callbackUrl = '';

        console.log(callbackUrl);
        Paytm.MerchantProperties.setCallbackUrl(callbackUrl);

        Paytm.MerchantProperties.initialize(environment, mid, key, website);
        // console.log(Paytm.MerchantProperties);

        var orderIdString = `${orderId}`;
        var readTimeout = 80000;
        var paymentStatusDetailBuilder = new Paytm.PaymentStatusDetailBuilder(orderIdString);
        var paymentStatusDetail = paymentStatusDetailBuilder.setReadTimeout(readTimeout).build();
        const response = await Paytm.Payment.getPaymentStatus(paymentStatusDetail);
        let transactionStatus = response.responseObject.body.resultInfo.resultStatus;
        const transactionResponse = response.responseObject.body.resultInfo.resultMsg;
        const txnAmount = response.responseObject.body.txnAmount;

        if (transactionStatus === 'TXN_SUCCESS') {
            transactionStatus = 'SUCCESS';
        }
        if (transactionStatus === 'TXN_FAILURE') {
            transactionStatus = 'FAILURE';
        }

        // console.log({ transactionStatus ,transactionResponse});

        // updating transaction status in deposit log

        const updateDepositLog = await myPrisma.owners_deposit_log.update({
            where: {
                sn: depositLogData.sn
            },
            data: {
                status: transactionStatus,
                response: transactionResponse
            }
        });
        updateDepositLog;

        if (transactionStatus === 'FAILURE' || transactionStatus === 'PENDING') {
            return {
                status: 'success',
                msg: 'Status refreshed',
                transactionStatus,
                transactionResponse,
                clientLocationUrl: depositLogData.clientLocationUrl
            };
        }

        if (transactionStatus !== 'SUCCESS') {
            return {
                status: 'error',
                msg: 'transactionStatus unknown:' + transactionStatus,
            };
        }

        const createOwnerDepositCreditTransactionData = await createTransaction.owner.onlyDepositCredit({ ownerId, transactionType: 'CREDIT', amount: txnAmount, comment: `Deposited by You [OID:${orderId}]` });
        if (createOwnerDepositCreditTransactionData.status === 'error') {
            return createOwnerDepositCreditTransactionData;
        }
        if (createOwnerDepositCreditTransactionData.status !== 'success') {
            return {
                status: 'error',
                msg: 'createOwnerDepositCreditTransactionData.status unknown:' + createOwnerDepositCreditTransactionData.status,
            };
        }

        const updateDepositLogWalletUpdateStatus = await myPrisma.owners_deposit_log.update({
            where: {
                sn: depositLogData.sn
            },
            data: {
                walletUpdateStatus: true
            }
        });
        updateDepositLogWalletUpdateStatus;

        return {
            status: 'success',
            msg: 'Status refreshed',
            transactionStatus,
            transactionResponse,
            clientLocationUrl: depositLogData.clientLocationUrl
        };


    } catch (error) {
        console.log(error);
    }


};
class paytmController {
    static initTransactionValidationRules = () => {
        return [

            body('txnAmount')
                .isDecimal(),
            body('clientLocationUrl')
                .isURL()

        ];
    };
    static initTransaction = async (req, res) => {
        try {

            const { clientLocationUrl } = req.body;
            let { txnAmount } = req.body;
            // making any number to 2 decimal
            txnAmount = +parseFloat(txnAmount).toFixed(2);

            if (txnAmount < 1) {
                return res.json({
                    status: 'error',
                    msg: 'Minimum amount is 1'
                });
            }
            let { ownerId } = req.payload;
            ownerId = +ownerId;

            let orderId = unixTimeStampInSeconds();
            const orderIdCount = await myPrisma.owners_deposit_log.count({
                where: {
                    orderId
                }
            });

            if (orderIdCount !== 0) {
                return res.json({
                    status: 'error',
                    msg: 'Network error Refresh and try again'
                });
            }

            const insertOwnersDepositLog = await myPrisma.owners_deposit_log.create({
                data: {
                    ownerId,
                    orderId,
                    status: 'PENDING',
                    response: '',
                    walletUpdateStatus: false,
                    clientLocationUrl: clientLocationUrl,
                    createdAt: unixTimeStampInSeconds()
                }
            });
            insertOwnersDepositLog;

            // initiating paytm code


            // For Production 
            var environment = Paytm.LibraryConstants.PRODUCTION_ENVIRONMENT;

            // Find your mid, key, website in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys 
            var mid = 'sOGYCE31009545550862';
            var key = 'wIGlN@_RaZ&m1j%y';
            var website = 'DEFAULT';
            var client_id = 'DEFAULT';





            var callbackUrl = `${process.env.PAYTM_CALLBACK_HOST}/adminPanel/paytm/response/${ownerId}`;

            // console.log(callbackUrl);
            Paytm.MerchantProperties.setCallbackUrl(callbackUrl);

            Paytm.MerchantProperties.initialize(environment, mid, key, website);
            // console.log(Paytm.MerchantProperties);

            // create transaction token
            var channelId = Paytm.EChannelId.WEB;
            let orderIdString = `${orderId}`;
            txnAmount = Paytm.Money.constructWithCurrencyAndValue(Paytm.EnumCurrency.INR, `${txnAmount}`);
            var userInfo = new Paytm.UserInfo(`${ownerId}`);

            var paymentDetailBuilder = new Paytm.PaymentDetailBuilder(channelId, orderIdString, txnAmount, userInfo);
            var paymentDetail = paymentDetailBuilder.build();
            const response = await Paytm.Payment.createTxnToken(paymentDetail);

            // console.log(response);
            const token = response.responseObject.body.txnToken;
            // res.send(response.responseObject.body.txnToken);

            return res.json({
                status: 'success',
                msg: 'Transaction initiated',
                orderId: orderId,
                token: token,
                txnAmount: txnAmount
            });





        } catch (error) {
            console.log(error);
        }
    };
}

export default paytmController;