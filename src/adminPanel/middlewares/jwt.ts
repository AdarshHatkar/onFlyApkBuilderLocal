import { TRPCError } from "@trpc/server";
import { jwtVerifyAsync } from "../../globalHelpers/jsonwebtoken.js";
import { trpcContextType, trpcMiddleware } from "../../trpc.js";
import { adminAccessTokenPayloadType } from "../helpers/jwtHelper.js";








export const verifyAdminAccessTokenMiddleware = trpcMiddleware(async ({ ctx, next }) => {
    try {

        let { req } = ctx as trpcContextType
        if (!req.headers['authorization']) {
            throw "invalidUserAccessToken"

        }

        const authHeader = req.headers['authorization'];
        const bearerToken = authHeader.split(' ');
        const token = bearerToken[1];

        let payload = await jwtVerifyAsync(token, process.env.ACCESS_TOKEN_SECRET) as adminAccessTokenPayloadType

        return next({
            ctx: {
                payload
            },
        });

    } catch (error) {

        if (error.name == "TokenExpiredError" || error.name == "JsonWebTokenError") {
            throw new TRPCError({ code: 'UNAUTHORIZED', message: 'invalidUserAccessToken' });
        } else {
            console.log(error.name);
            console.log(error.message);
            console.log('else log');
            console.log({ error });
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: 'try catch ' });
        }

    }

});