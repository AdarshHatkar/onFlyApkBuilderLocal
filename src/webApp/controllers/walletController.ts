import { body } from 'express-validator';
import createTransaction from '../../globalControllers/transactionController.js';
import mtaConfig from '../../globalHelpers/mtaConfig.js';
import myPrisma from '../../globalHelpers/myPrisma.js';
import { convertToInt, convertToTwoDecimalInt, unixTimeStampInSeconds } from '../../globalHelpers/utility.js';

const walletController = {
    getWalletHistory: async (req, res) => {
        const { userId } = req.payload;
        let { skip } = req.params;

        skip = convertToInt(skip);

        if (isNaN(skip)) {
            return res.json({
                status: 'error',
                msg: 'invalid skip'



            });
        }


        const getWalletHistory = await myPrisma.users_wallet_history.findMany({
            where: {
                userId
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: +skip,
            take: 10,
        });

        // res.send(getWalletHistory);
        // await new Promise(r => setTimeout(r, 5 * 1000));
        // success response
        return res.json({
            status: 'success',
            msg: 'Request success',
            walletHistoryData: getWalletHistory,


        });
    },

    placeWithdrawRequestValidationRules: () => {
        return [

            body('methodName')
                .isString(),
            body('methodId')
                .isString(),
            body('amount')
                .isDecimal()


        ];
    },
    placeWithdrawRequest: async (req, res) => {
        try {


            const { userId } = req.payload;
            const { ownerId } = req.appData;
            // console.log(req.payload);
            // eslint-disable-next-line prefer-const
            let { methodName, methodId, amount } = req.body;

            amount = convertToTwoDecimalInt(amount);
            if (amount < 1) {
                return res.json({
                    status: 'error',
                    msg: 'amount must be more than 1'
                });
            }


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

            if (walletConfigData.minimumWithdrawal > amount) {
                return res.json({
                    status: 'error',
                    msg: `Minimum amount allowed is ${walletConfigData.minimumWithdrawal} `
                });
            }
            if (walletConfigData.maximumWithdrawal < amount) {
                return res.json({
                    status: 'error',
                    msg: `Maximum amount allowed is ${walletConfigData.maximumWithdrawal} `
                });
            }


            const userData = await myPrisma.all_users.findFirst({
                where: {
                    userId,
                    ownerId
                }
            });


            if (amount > userData.winCredit) {
                return res.json({
                    status: 'error',
                    msg: 'Low Win Coins in Wallet'
                });
            }

            //! Don't  Place the insert wallet log query here this creating glitch

            const createUserWinCreditTransactionData = await createTransaction.user.onlyWinCredit({ userId: userId, transactionType: 'DEBIT', amount: amount, comment: `Withdraw  Requested [${methodName}]${methodId}` });

            if (createUserWinCreditTransactionData.status === 'error') {
                return res.json(createUserWinCreditTransactionData);
            }
            if (createUserWinCreditTransactionData.status !== 'success') {
                return res.json({
                    status: 'error',
                    msg: 'unknown Status'
                });
            }
            const insertUsersWithdrawLog = await myPrisma.users_withdraw_log.create({
                data: {
                    ownerId,
                    userId,
                    amount,
                    methodName,
                    methodId,
                    status: 'PENDING',
                    comment: '',
                    createdAt: unixTimeStampInSeconds(),
                    updatedAt: unixTimeStampInSeconds()
                }
            });
            if (insertUsersWithdrawLog) {
                return res.json({
                    status: 'success',
                    msg: 'Withdraw requested'
                });
            }


        } catch (error) {
            console.log(error);
        }
    },

    getWalletConfig: async (req, res) => {
        try {
            const { ownerId } = req.appData;




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

            const getWithdrawalMethods = await myPrisma.withdrawal_methods.findMany({
                where: {
                    ownerId
                }
            });
            walletConfigData.withdrawalMethodsData = [];


            if (getWithdrawalMethods.length < 1) {
                walletConfigData.withdrawalMethodsData = mtaConfig.defaultWithdrawMethods;
            } else {
                walletConfigData.withdrawalMethodsData = getWithdrawalMethods;
            }


            // await new Promise(r => setTimeout(r, 5 * 1000));


            res.json({
                status: 'success',
                msg: `request  completed successfully`,
                walletConfigData


            });


        } catch (error) {
            console.error(error);
        }
    }

};

export default walletController;