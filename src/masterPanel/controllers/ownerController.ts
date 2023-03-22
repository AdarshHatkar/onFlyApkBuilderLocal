import createTransaction from '../../globalControllers/transactionController.js';
import myPrisma from '../../globalHelpers/myPrisma.js';


const OwnerController = {

    updateOwnerWallet: async (req, res) => {
        try {

            const { ownerId,
                walletSelect,
                actionSelect, amount, comment } = req.body;

            const ownerData = await myPrisma.all_owners.findFirst({
                where: {
                    ownerId: +ownerId
                }
            });

            if (walletSelect === 'depositCredit') {

                const depositCreditTransactionData = await createTransaction.owner.onlyDepositCredit({ ownerId: ownerData.ownerId, transactionType: actionSelect, amount, comment: `${comment}` });
                if (depositCreditTransactionData.status === 'error') {

                    return res.json(depositCreditTransactionData);

                }
            } else if (walletSelect === 'bonusCredit') {
                const bonusCreditTransactionData = await createTransaction.owner.onlyBonusCredit({ ownerId: ownerData.ownerId, transactionType: actionSelect, amount, comment: `${comment}` });
                if (bonusCreditTransactionData.status === 'error') {

                    return res.json(bonusCreditTransactionData);

                }
            }

            return res.json({
                status: 'success',
                msg: 'owner Wallet updated',



            });



        } catch (error) {
            console.log(error);
        }
    },




};

export default OwnerController;