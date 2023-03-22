import { z } from "zod";
import myPrisma from "../../globalHelpers/myPrisma.js";
import { convertToTwoDecimalInt } from "../../globalHelpers/utility.js";
import { trpcRouter } from "../../trpc.js";
import { masterPanelUserProcedure } from "../masterPanelTrpc.js";





export let dashboardRoutes = trpcRouter({

    getData: masterPanelUserProcedure
        .input(z.void())
        .query(async ({ ctx }) => {

            try {

                // const timeStampOf24hrBack = unixTimeStampInSeconds() - 60 * 60 * 24;

                // todays start 
                const todayStartingPointTimestamp = new Date();
                todayStartingPointTimestamp.setUTCHours(18, 30, 0, 0);

                const todayStartingPoint = (todayStartingPointTimestamp.getTime() / 1000) - 60 * 60 * 24;



                const yesterdayStartingPoint = (todayStartingPointTimestamp.getTime() / 1000) - (60 * 60 * 24 * 2);
                const yesterdayEndingPoint = todayStartingPoint - 1;

                // console.log({ todayStartingPoint, yesterdayStartingPoint, yesterdayEndingPoint });



                const allUsersCount = await myPrisma.all_users.count({});
                const newUsersInTodayCount = await myPrisma.all_users.count({
                    where: {
                        createdAt: {
                            gt: todayStartingPoint
                        }
                    }
                });
                const newUsersInYesterdayCount = await myPrisma.all_users.count({
                    where: {
                        AND: [
                            {
                                createdAt: {

                                    gt: yesterdayStartingPoint
                                }
                            },
                            {
                                createdAt: {

                                    lt: yesterdayEndingPoint
                                }
                            }
                        ]

                    }
                });
                const allOwners = await myPrisma.all_owners.findMany({
                    include: {
                        owners_plan_details: true
                    }
                });

                const allOwnersCount = allOwners.length;
                let sumOfOwnersDeposit = 0;
                let sumOfOwnersBonus = 0;
                let newOwnersInTodayCount = 0;
                let newOwnersInYesterdayCount = 0;
                let ownersWithStarterPlan = 0;
                let ownersWithPremiumPlan = 0;
                for (let i = 0; i < allOwnersCount; i++) {
                    sumOfOwnersDeposit = sumOfOwnersDeposit + convertToTwoDecimalInt(allOwners[i].depositCredit);

                    sumOfOwnersBonus = sumOfOwnersBonus + convertToTwoDecimalInt(allOwners[i].bonusCredit);

                    if (allOwners[i].createdAt > todayStartingPoint) {
                        newOwnersInTodayCount++;
                    }

                    if (allOwners[i].createdAt > yesterdayStartingPoint) {
                        if (allOwners[i].createdAt < yesterdayEndingPoint) {
                            newOwnersInYesterdayCount++;
                        }

                    }

                    if (allOwners[i].owners_plan_details.activePlan === 'starter') {
                        ownersWithStarterPlan++;
                    }
                    if (allOwners[i].owners_plan_details.activePlan === 'premium') {
                        ownersWithPremiumPlan++;
                    }



                }


                const pendingWithdrawals = await myPrisma.owners_withdraw_log.findMany({
                    where: {
                        status: 'PENDING'
                    }
                });
                const pendingWithdrawalsCount = pendingWithdrawals.length;

                let sumOfPendingWithdrawals = 0;

                for (let i = 0; i < pendingWithdrawals.length; i++) {

                    sumOfPendingWithdrawals = sumOfPendingWithdrawals + convertToTwoDecimalInt(pendingWithdrawals[i].amount);

                }

                const pendingWebApkOrdersCount = await myPrisma.all_web_apks.count({
                    where: {
                        status: 'pending'
                    }
                });





                // success response
                return {
                    status: 'success',
                    msg: 'request success',
                    allUsersCount,
                    allOwnersCount,
                    pendingWithdrawalsCount,
                    sumOfPendingWithdrawals,
                    pendingWebApkOrdersCount,
                    sumOfOwnersDeposit,
                    sumOfOwnersBonus,
                    newOwnersInTodayCount,
                    newOwnersInYesterdayCount,
                    newUsersInTodayCount,
                    newUsersInYesterdayCount,
                    ownersWithStarterPlan,
                    ownersWithPremiumPlan


                }
            } catch (error) {
                console.log(error);

                return {
                    status: 'unknownServerError',
                    msg: 'invalidRefreshToken'
                }
            }


        })

}) 