import { z } from "zod";
import myPrisma from "../../globalHelpers/myPrisma.js";
import { trpcRouter } from "../../trpc.js";
import { webAppPublicProcedure } from "../webAppTrpc.js";
export let basicRoutes = trpcRouter({
    sayHello: webAppPublicProcedure
        .meta({ openapi: { method: 'GET', path: '/basic/sayHello', tags: ['webApp'], enabled: true } })
        .input(z.void())
        .output(z.object({ greeting: z.string() }))
        .query(({ ctx }) => {
            return { greeting: `Hello !--${ctx.appData.appUsername}` };
        }),
    customerSupport: webAppPublicProcedure
        .meta({ openapi: { method: 'GET', path: '/basic/customerSupport', tags: ['webApp'], enabled: false } })
        .input(z.void())
        // .output(z.object({ customerSupportData: z.array() }))
        .query(async ({ ctx }) => {

            try {

                const { ownerId } = ctx.appData;

                const customerSupportData = await myPrisma.app_support_details.findMany({
                    where: {
                        ownerId
                    }
                });
                if (customerSupportData) {
                    return {

                        customerSupportData



                    }
                }
            } catch (error) {
                console.log(error);
            }


        })

}) 