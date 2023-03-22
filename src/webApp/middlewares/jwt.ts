import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { jwtVerifyAsync } from "../../globalHelpers/jsonwebtoken.js";
import { t, trpcContextType } from "../../trpc.js";
import { webAppUserAccessTokenPayloadType } from "../helpers/jwtHelper.js";

let appDataSchema = z.object({
    appUsername: z.string().min(1),
    ownerId: z.number()
})

export type appDataType = z.infer<typeof appDataSchema>



export const verifyUserAccessTokenMiddleware = t.middleware(async ({ ctx, next }) => {
    try {

        let { req } = ctx as trpcContextType
        if (!req.headers['authorization']) {
            throw "invalidUserAccessToken"
        }

        const authHeader = req.headers['authorization'];
        const bearerToken = authHeader.split(' ');
        const token = bearerToken[1];
        // console.log("hello fom middle ware 1 ");
        // jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, payload) {

        //     if (err) {
        //         if (err.name !== 'TokenExpiredError') {
        //             throw "invalidUserAccessToken"
        //         }

        //         throw "invalidUserAccessToken"
        //     }
        //     //   console.log("hello fom middle ware 2 ");
        //     // console.log({ payload });
        //     //req.payload = payload;
        //     let { ownerId, userId } = payload;
        //     return next({
        //         ctx: {
        //             userJwtPayload: {
        //                 ownerId,
        //                 userId
        //             },
        //         },
        //     });
        // });
        let payload = await jwtVerifyAsync(token, process.env.ACCESS_TOKEN_SECRET) as webAppUserAccessTokenPayloadType
        //console.log("hello fom middle ware 3 ");
        // console.log({ payload });
        //@ts-ignore
        // let { ownerId, userId } = payload;
        return next({
            ctx: {
                payload
            },
        });

    } catch (error) {

        if (error.name == "TokenExpiredError") {
            throw new TRPCError({ code: 'UNAUTHORIZED', message: 'invalidUserAccessToken' });
        } else {
            // console.log(error.name);
            // console.log(error.message);
            // console.log('else log');
            // console.log({ error });
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: 'try catch ' });
        }

    }

});