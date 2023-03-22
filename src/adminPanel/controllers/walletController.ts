import { body } from 'express-validator';
import createTransaction from '../../globalControllers/transactionController.js';
import myPrisma from '../../globalHelpers/myPrisma.js';
import { unixTimeStampInSeconds } from '../../globalHelpers/utility.js';



class walletController {
    static getWalletHistory = async (req, res) => {
        const { ownerId } = req.payload;
        const { skip, take } = req.params;

        const getWalletHistory = await myPrisma.owners_wallet_history.findMany({
            where: {
                ownerId
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: +skip,
            take: +take,
        });

        // res.send(getWalletHistory);

        // success response
        return res.json({
            status: 'success',
            msg: 'Request success',
            walletHistoryData: getWalletHistory,


        });
    };

    static placeWithdrawRequestValidationRules = () => {
        return [

            body('methodName')
                .isString(),
            body('methodId')
                .isString(),
            body('amount')
                .isDecimal()


        ];
    };
    static placeWithdrawRequest = async (req, res) => {
        const { ownerId } = req.payload;
        // console.log(req.payload);
        // eslint-disable-next-line prefer-const
        let { methodName, methodId, amount } = req.body;
        amount = +parseFloat(amount).toFixed(2);
        if (amount < 6) {
            return res.json({
                status: 'error',
                msg: 'Minimum Withdraw Amount is 6 Credits'
            });
        }

        const createOwnerDepositCreditTransactionData = await createTransaction.owner.onlyDepositCredit({ ownerId, transactionType: 'DEBIT', amount, comment: `Requested Withdraw (${methodName})${methodId}` });


        if (createOwnerDepositCreditTransactionData.status === 'error') {
            return res.json(createOwnerDepositCreditTransactionData);
        }
        if (createOwnerDepositCreditTransactionData.status !== 'success') {
            return res.json({
                status: 'error',
                msg: 'unknown Status'
            });
        }

        let finalWithdrawAmount;
        if (amount < 100) {


            finalWithdrawAmount = amount - 5;
        } else {

            finalWithdrawAmount = amount - (5 * amount) / 100;
        }

        const insertOwnersWithdrawLog = await myPrisma.owners_withdraw_log.create({
            data: {
                ownerId,
                amount: finalWithdrawAmount,
                methodName,
                methodId,
                status: 'PENDING',
                createdAt: unixTimeStampInSeconds(),
                updatedAt: unixTimeStampInSeconds(),
                comment: ''
            }
        });

        if (insertOwnersWithdrawLog) {
            return res.json({
                status: 'success',
                msg: 'Withdraw requested'
            });
        }



    };
}

export default walletController;