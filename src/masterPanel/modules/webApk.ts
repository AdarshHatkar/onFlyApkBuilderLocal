import { z } from "zod";
import myPrisma from "../../globalHelpers/myPrisma.js";
import { unixTimeStampInSeconds } from "../../globalHelpers/utility.js";
import { trpcRouter } from "../../trpc.js";
import { masterPanelUserProcedure } from "../masterPanelTrpc.js";

export let webApkRoutes = trpcRouter({

    webApkOrdersDetails: masterPanelUserProcedure

        .input(z.object({
            orderId: z.number()
        }))

        .query(async ({ ctx, input }) => {

            try {
                // console.log(req.query);





                const orderId = input.orderId;





                const orderDetails = await myPrisma.all_web_apks.findFirst({
                    where: {

                        sn: orderId
                    },
                    include: {
                        all_owners: {
                            include: {
                                web_apk_details: true,
                                web_app_details: true
                            }
                        }
                    }
                });



                return {
                    status: 'success',
                    msg: 'success',
                    orderDetails: orderDetails

                };



            } catch (error) {
                console.log(error);

                return {
                    status: 'unknownServerError',
                    msg: 'unknownServerError'
                }
            }


        }),
    webApkOrderMutate: masterPanelUserProcedure

        .input(z.object({
            orderId: z.number(),
            apkLink: z.string(),
            aabLink: z.string(),

        }))
        .mutation(async ({ ctx, input }) => {

            try {
                // console.log(req.query);



                const { orderId, apkLink, aabLink } = input;

                const updateWebApkOrder = await myPrisma.all_web_apks.update({
                    where: {
                        sn: orderId
                    },
                    data: {
                        aabLink,
                        apkLink,
                        updatedAt: unixTimeStampInSeconds(),
                        status: 'completed'
                    }
                });

                if (updateWebApkOrder) {
                    return {
                        status: 'success',
                        msg: 'Web Apk Order Updated ',



                    }
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