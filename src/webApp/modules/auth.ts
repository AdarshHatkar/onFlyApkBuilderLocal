import { z } from "zod";
import myPrisma from "../../globalHelpers/myPrisma.js";
import { trpcRouter } from "../../trpc.js";
import { webAppPublicProcedure } from "../webAppTrpc.js";

import { TRPCError } from "@trpc/server";
import bcrypt from 'bcrypt';
import { jwtVerifyAsync } from "../../globalHelpers/jsonwebtoken.js";
import { convertToInt } from "../../globalHelpers/utility.js";
import { signUserAccessToken, signUserRefreshToken, webAppUserRefreshTokenPayloadType } from "../helpers/jwtHelper.js";





export let authRoutes = trpcRouter({

    login: webAppPublicProcedure

        .input(z.object({
            email: z.string({ required_error: "Email is Requires" }).min(1, 'Email is Requires').email({ message: "Invalid Email" }),
            password: z.string({ required_error: "Password is requires" }).min(8, 'Password Must be 8 or more characters long').max(20, "Password Must be 20 or fewer characters long")
        }))

        .mutation(async ({ ctx, input }) => {

            try {

                const { ownerId } = ctx.appData;
                const { email, password } = input

                const userExists = await myPrisma.all_users.findFirst({
                    where: {
                        ownerId,
                        email
                    }
                });

                // console.log(userExists);
                if (!userExists) {


                    return {
                        status: 'error',
                        msg: "This email is not registered"
                    }
                }


                const dbPassword = userExists.password;
                const passwordMatch = bcrypt.compareSync(password, dbPassword);
                if (!passwordMatch) {

                    //  return errorResponse(res, "Invalid Login details")
                    return {
                        status: 'error',
                        msg: "Invalid Login details"
                    }
                }


                const userId = userExists.userId;

                const accessToken = await signUserAccessToken(ownerId, userId);
                const refreshToken = await signUserRefreshToken(ownerId, userId);


                return {
                    status: 'success',
                    msg: 'Login Success',
                    fullName: userExists.fullName,
                    userId: userId,
                    depositCredit: userExists.depositCredit,
                    winCredit: userExists.winCredit,
                    bonusCredit: userExists.bonusCredit,
                    accessToken,
                    refreshToken
                }


            } catch (error) {

                if (error == "invalidAppUsername") {
                    throw new TRPCError({ code: 'BAD_REQUEST', message: 'invalidAppUsername', cause: 'invalidAppUsernameCause' });
                } else {
                    console.log(error);
                    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: 'try catch ' });
                }
            }


        }),
    refreshToken: webAppPublicProcedure
        .input(z.object({
            refreshToken: z.string({ required_error: "refreshToken is Requires" }),

        }))
        .mutation(async ({ ctx, input }) => {
            try {
                let { refreshToken } = input
                let payload = await jwtVerifyAsync(refreshToken, process.env.REFRESH_TOKEN_SECRET) as webAppUserRefreshTokenPayloadType

                const verifyActiveSessions = await myPrisma.users_active_sessions.findFirst({
                    where: {
                        ownerId: convertToInt(payload.ownerId),
                        userId: convertToInt(payload.userId),
                        refreshTokenId: convertToInt(payload.refreshTokenId)
                    }
                });

                if (!verifyActiveSessions) {
                    return {
                        status: 'invalidRefreshToken',
                        msg: 'invalidRefreshToken'
                    }
                }


                const accessToken = await signUserAccessToken(verifyActiveSessions.ownerId, verifyActiveSessions.userId);
                return {
                    status: 'success',
                    msg: 'token successfully refreshed',
                    accessToken: accessToken
                }




            } catch (error) {
                if (error.name == "TokenExpiredError" || error.name == "JsonWebTokenError") {
                    return {
                        status: 'invalidRefreshToken',
                        msg: 'invalidRefreshToken'
                    }
                } else {
                    console.log(error.name);
                    console.log(error.message);
                    console.log('else log');
                    console.log({ error });


                    return {
                        status: 'unknownServerError',
                        msg: 'invalidRefreshToken'
                    }
                }
            }




        })

}) 