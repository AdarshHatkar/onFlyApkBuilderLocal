
import { z } from "zod";
import createTransaction from "../../globalControllers/transactionController.js";
import myPrisma from "../../globalHelpers/myPrisma.js";
import { trpcRouter } from "../../trpc.js";
import { masterPanelUserProcedure } from "../masterPanelTrpc.js";





export let ownersRoutes = trpcRouter({

    ownerDetails: masterPanelUserProcedure

        .input(z.object({
            ownerId: z.number()
        }))

        .query(async ({ ctx, input }) => {

            try {
                // console.log(req.query);





                const ownerId = input.ownerId;





                const ownerDetails = await myPrisma.all_owners.findFirst({
                    where: {

                        ownerId
                    },

                });



                return {
                    status: 'success',
                    msg: 'success',
                    ownerDetails: ownerDetails

                };



            } catch (error) {
                console.log(error);

                return {
                    status: 'unknownServerError',
                    msg: 'unknownServerError'
                }
            }


        }),
    updateOwnerWallet: masterPanelUserProcedure

        .input(z.object({
            ownerId: z.number(),
            amount: z.number().min(1),
            walletSelect: z.string(),
            actionSelect: z.string(),
            comment: z.string(),

        }))
        .mutation(async ({ ctx, input }) => {

            try {

                const { ownerId,
                    walletSelect,
                    actionSelect, amount, comment } = input;

                const ownerData = await myPrisma.all_owners.findFirst({
                    where: {
                        ownerId
                    }
                });

                if (walletSelect === 'depositCredit') {

                    const depositCreditTransactionData = await createTransaction.owner.onlyDepositCredit({ ownerId: ownerData.ownerId, transactionType: actionSelect, amount, comment: `${comment}` });
                    if (depositCreditTransactionData.status === 'error') {

                        return depositCreditTransactionData

                    }
                } else if (walletSelect === 'bonusCredit') {
                    const bonusCreditTransactionData = await createTransaction.owner.onlyBonusCredit({ ownerId: ownerData.ownerId, transactionType: actionSelect, amount, comment: `${comment}` });
                    if (bonusCreditTransactionData.status === 'error') {

                        return bonusCreditTransactionData

                    }
                }

                return {
                    status: 'success',
                    msg: 'owner Wallet updated',



                }



            } catch (error) {
                console.log(error);

                return {
                    status: 'unknownServerError',
                    msg: 'unknownServerError'
                }
            }


        })

}) 