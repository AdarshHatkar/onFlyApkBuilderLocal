
import createTransaction from '../../globalControllers/transactionController.js';
import mtaConfig from '../../globalHelpers/mtaConfig.js';
import myPrisma from '../../globalHelpers/myPrisma.js';
import paytmPrimexopCat from '../../globalHelpers/paytmPrimexopCat.js';
import { convertToTwoDecimalInt, unixTimeStampInSeconds } from '../../globalHelpers/utility.js';

import { body } from 'express-validator';
import Paytm from 'paytm-pg-node-sdk';

export const refreshUserDepositTransactionStatus = async (userId, orderId) => {

    try {



        const depositLogData = await myPrisma.users_deposit_log.findFirst({
            where: {
                userId, orderId
            }
        });

        if (!depositLogData) {
            return {
                status: 'error',
                msg: 'deposit log not found',
            };
        }

        if (depositLogData.ownerWalletUpdateStatus === true) {
            return {
                status: 'error',
                msg: 'wallet already updated',
                clientLocationUrl: depositLogData.clientLocationUrl
            };
        }
        const ownerId = depositLogData.ownerId;
        // checking gateway by with transaction initiated 
        let walletConfigData = mtaConfig.defaultWalletConfigs;
        let isNeedToUpdateOwnerWallet = false;
        if (depositLogData.paymentGateway === 'paytmPrimexopCat') {

            walletConfigData.paytmMerchantId = paytmPrimexopCat.paytmMerchantId;
            walletConfigData.paytmMerchantKey = paytmPrimexopCat.paytmMerchantKey;

            isNeedToUpdateOwnerWallet = true;
        } else {

            // checking owner wallet configs
            const getWalletConfigData = await myPrisma.wallet_configs.findFirst({
                where: {
                    ownerId
                }
            });
            if (!getWalletConfigData) {
                walletConfigData = mtaConfig.defaultWalletConfigs;
            } else {


                walletConfigData = getWalletConfigData;
            }




        }

        // initiating paytm code


        // For Production 
        var environment = Paytm.LibraryConstants.PRODUCTION_ENVIRONMENT;

        // Find your mid, key, website in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys 
        var mid = walletConfigData.paytmMerchantId;
        var key = walletConfigData.paytmMerchantKey;
        var website = 'DEFAULT';
        var client_id = 'DEFAULT';





        var callbackUrl = '';

        console.log({ callbackUrl });
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

        const updateDepositLog = await myPrisma.users_deposit_log.update({
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

        // updating user wallet

        const createUserDepositCreditTransactionData = await createTransaction.user.onlyDepositCredit({ userId: userId, transactionType: 'CREDIT', amount: txnAmount, comment: `Deposited by You [OID:${orderId}]` });

        if (createUserDepositCreditTransactionData.status === 'error') {
            return createUserDepositCreditTransactionData;
        }
        if (createUserDepositCreditTransactionData.status !== 'success') {
            return {
                status: 'error',
                msg: 'createUserDepositCreditTransactionData.status unknown:' + createUserDepositCreditTransactionData.status,
            };
        }

        // updating owner wallet only if payment done by official gateway



        if (isNeedToUpdateOwnerWallet === true) {

            const createOwnerDepositCreditTransactionData = await createTransaction.owner.onlyDepositCredit({ ownerId, transactionType: 'CREDIT', amount: txnAmount, comment: `Deposited by User(${userId}) [OID:${orderId}]` });
            if (createOwnerDepositCreditTransactionData.status === 'error') {
                return createOwnerDepositCreditTransactionData;
            }
            if (createOwnerDepositCreditTransactionData.status !== 'success') {
                return {
                    status: 'error',
                    msg: 'createOwnerDepositCreditTransactionData.status unknown:' + createOwnerDepositCreditTransactionData.status,
                };
            }

            const updateDepositLogWalletUpdateStatus = await myPrisma.users_deposit_log.update({
                where: {
                    sn: depositLogData.sn
                },
                data: {
                    ownerWalletUpdateStatus: isNeedToUpdateOwnerWallet
                }
            });
            updateDepositLogWalletUpdateStatus;
        }






        return {
            status: 'success',
            msg: 'Status refreshed',
            transactionStatus,
            transactionResponse,
            clientLocationUrl: depositLogData?.clientLocationUrl
        };


    } catch (error) {
        console.log(error);
    }


};
const paytmController = {

    initReactTransactionValidationRules: () => {
        return [
            body('txnAmount')
                .isDecimal(),
            body('clientLocationUrl')

        ];
    },
    initReactTransaction: async (req, res) => {
        try {

            const { clientLocationUrl } = req.body;
            let { txnAmount } = req.body;
            // making any number to 2 decimal

            txnAmount = convertToTwoDecimalInt(txnAmount);

            if (txnAmount < 1) {
                return res.json({
                    status: 'error',
                    msg: 'amount must more than 1'
                });
            }
            const { userId } = req.payload;
            const { ownerId } = req.appData;

            // checking owner wallet configs
            const getWalletConfigData = await myPrisma.wallet_configs.findFirst({
                where: {
                    ownerId: ownerId
                }
            });

            let walletConfigData;

            if (!getWalletConfigData) {
                walletConfigData = mtaConfig.defaultWalletConfigs;
            } else {
                walletConfigData = getWalletConfigData;
            }

            // adding mid according to active payment gateway

            if (walletConfigData.activePaymentGateway === 'paytmPrimexopCat') {
                walletConfigData.paytmMerchantId = paytmPrimexopCat.paytmMerchantId;
                walletConfigData.paytmMerchantKey = paytmPrimexopCat.paytmMerchantKey;
            }

            if (walletConfigData.minimumDeposit > txnAmount) {
                return res.json({
                    status: 'error',
                    msg: `Minimum amount allowed is ${walletConfigData.minimumDeposit} `
                });
            }
            if (walletConfigData.maximumDeposit < txnAmount) {
                return res.json({
                    status: 'error',
                    msg: `Maximum amount allowed is ${walletConfigData.maximumDeposit} `
                });
            }


            let orderId = unixTimeStampInSeconds();
            const orderIdCount = await myPrisma.users_deposit_log.count({
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

            const insertOwnersDepositLog = await myPrisma.users_deposit_log.create({
                data: {
                    ownerId,
                    userId,
                    orderId,
                    status: 'PENDING',
                    response: '',
                    ownerWalletUpdateStatus: false,
                    clientLocationUrl: clientLocationUrl,
                    paymentGateway: walletConfigData.activePaymentGateway,
                    createdAt: unixTimeStampInSeconds()
                }
            });
            insertOwnersDepositLog;

            // initiating paytm code
            // For Production 
            var environment = Paytm.LibraryConstants.PRODUCTION_ENVIRONMENT;

            // Find your mid, key, website in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys 
            var mid = walletConfigData.paytmMerchantId;
            var key = walletConfigData.paytmMerchantKey;
            var website = 'DEFAULT';
            var client_id = 'DEFAULT';





            var callbackUrl = `${process.env.PAYTM_CALLBACK_HOST}/webApp/${req.appData.appUsername}/paytm/responseReact/${userId}`;

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
                txnAmount: txnAmount,
                paytmMerchantId: walletConfigData.paytmMerchantId
            });





        } catch (error) {
            console.log(error);
        }
    },
};

export default paytmController;