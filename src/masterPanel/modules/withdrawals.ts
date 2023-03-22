
import { z } from "zod";
import createTransaction from "../../globalControllers/transactionController.js";
import myPrisma from "../../globalHelpers/myPrisma.js";
import { convertToTwoDecimalInt, unixTimeStampInSeconds } from "../../globalHelpers/utility.js";
import { trpcRouter } from "../../trpc.js";
import { masterPanelUserProcedure } from "../masterPanelTrpc.js";





export let withdrawalsRoutes = trpcRouter({

    withdrawalDetails: masterPanelUserProcedure

        .input(z.object({
            withdrawId: z.number()
        }))

        .query(async ({ ctx, input }) => {

            try {
                // console.log(req.query);





                const withdrawId = input.withdrawId;





                const withdrawalDetails = await myPrisma.owners_withdraw_log.findFirst({
                    where: {

                        sn: withdrawId
                    },

                });



                return {
                    status: 'success',
                    msg: 'success',
                    withdrawalDetails: withdrawalDetails

                };



            } catch (error) {
                console.log(error);

                return {
                    status: 'unknownServerError',
                    msg: 'unknownServerError'
                }
            }


        }),

    updateWithdrawal: masterPanelUserProcedure

        .input(z.object({
            withdrawId: z.number(),
            action: z.string(),
            comment: z.string()
        }))
        .mutation(async ({ ctx, input }) => {

            try {
                // console.log(req.query);





                const { withdrawId, action, comment } = input;











                const getRedeemRequestData = await myPrisma.owners_withdraw_log.findFirst({
                    where: {

                        sn: withdrawId
                    }
                });

                if (!getRedeemRequestData) {
                    return {
                        status: 'error',
                        msg: 'Invalid request',



                    }
                }

                if (getRedeemRequestData.status !== 'PENDING') {
                    return {
                        status: 'error',
                        msg: 'already updated',



                    }
                }

                if (action === 'SUCCESS') {
                    const updateRedeemRequestStatus = await myPrisma.owners_withdraw_log.update({
                        where: {

                            sn: getRedeemRequestData.sn
                        },
                        data: {
                            status: action,
                            comment,
                            updatedAt: unixTimeStampInSeconds()
                        }

                    });


                    if (updateRedeemRequestStatus) {
                        return {
                            status: 'success',
                            msg: 'Redeem Request updated',



                        }
                    }

                }

                if (action === 'FAILURE') {

                    let finalRedeemAmount = 0;

                    const redeemAmount = convertToTwoDecimalInt(getRedeemRequestData.amount)
                    if (redeemAmount < 100) {


                        finalRedeemAmount = redeemAmount + 5.00;
                    } else {

                        finalRedeemAmount = redeemAmount + ((5.00 * redeemAmount) / 100);
                    }


                    console.log({ finalRedeemAmount, redeemAmount });


                    const depositCreditTransactionData = await createTransaction.owner.onlyDepositCredit({ ownerId: getRedeemRequestData.ownerId, transactionType: 'CREDIT', amount: finalRedeemAmount, comment: `Withdrawal (${getRedeemRequestData.sn}) cancelled [${comment}] ` });
                    if (depositCreditTransactionData.status === 'error') {

                        return depositCreditTransactionData;

                    }

                    const updateRedeemRequestStatus = await myPrisma.owners_withdraw_log.update({
                        where: {

                            sn: getRedeemRequestData.sn
                        },
                        data: {
                            status: action,
                            comment,
                            updatedAt: unixTimeStampInSeconds()
                        }

                    });


                    if (updateRedeemRequestStatus) {
                        return {
                            status: 'success',
                            msg: 'Redeem Request updated',




                        }
                    }
                }








            } catch (error) {
                console.log(error);

                return {
                    status: 'unknownServerError',
                    msg: 'unknownServerError'
                }
            }


        }),

}) 