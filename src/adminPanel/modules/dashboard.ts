import { z } from "zod";
import myPrisma from "../../globalHelpers/myPrisma.js";
import { convertToTwoDecimalInt } from "../../globalHelpers/utility.js";
import { trpcRouter } from "../../trpc.js";
import { adminPanelUserProcedure } from "../adminPanelTrpc.js";
import { adminAccessTokenPayloadType } from "../helpers/jwtHelper.js";




export let dashboardRoutes = trpcRouter({

    getData: adminPanelUserProcedure
        .input(z.void())
        .query(async ({ ctx }) => {

            try {

                let { ownerId }: adminAccessTokenPayloadType = ctx.payload


                const getDashboardData = await myPrisma.all_owners.findFirst({
                    where: {
                        ownerId
                    },
                    select: {
                        depositCredit: true, bonusCredit: true,
                        owners_plan_details: true,
                        _count: {
                            select: {
                                all_users: true,

                            }

                        }
                    },

                });

                const redeemRequestsCount = await myPrisma.users_withdraw_log.count({
                    where: {
                        ownerId,
                        status: 'PENDING'
                    }
                });



                // success response
                return {
                    status: 'success',
                    msg: 'request success',
                    redeemRequestsCount,
                    totalUsers: getDashboardData._count.all_users,
                    depositCredit: convertToTwoDecimalInt(getDashboardData.depositCredit),
                    bonusCredit: convertToTwoDecimalInt(getDashboardData.bonusCredit),

                    activePlan: getDashboardData?.owners_plan_details.activePlan,
                    validTill: getDashboardData?.owners_plan_details.validTill,


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