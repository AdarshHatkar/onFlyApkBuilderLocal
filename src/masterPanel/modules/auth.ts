import { z } from "zod";
import myPrisma from "../../globalHelpers/myPrisma.js";
import { trpcRouter } from "../../trpc.js";
import { masterPanelPublicProcedure } from "../masterPanelTrpc.js";

import bcrypt from 'bcrypt';
import { masterRefreshTokenPayloadType, signMasterAccessToken, signMasterRefreshToken } from "../helpers/jwtHelper.js";

import { jwtVerifyAsync } from "../../globalHelpers/jsonwebtoken.js";
import { convertToInt } from "../../globalHelpers/utility.js";


export let authRoutes = trpcRouter({

    login: masterPanelPublicProcedure

        .input(z.object({
            email: z.string({ required_error: "Email is Requires" }).min(1, 'Email is Requires').email({ message: "Invalid Email" }),
            password: z.string({ required_error: "Password is requires" }).min(8, 'Password Must be 8 or more characters long').max(20, "Password Must be 20 or fewer characters long")
        }))

        .mutation(async ({ ctx, input }) => {

            try {





                const { email, password } = input;

                const masterExists = await myPrisma.all_masters.findFirst({
                    where: {
                        email: email
                    }
                });

                // console.log(masterExists);


                if (!masterExists) {
                    return {
                        status: 'error',
                        msg: 'This Pc is not registered'
                    };
                }
                const dbPassword = masterExists.password;
                const passwordMatch = bcrypt.compareSync(password, dbPassword);
                if (!passwordMatch) {
                    return {
                        status: 'error',
                        msg: 'Invalid Machine details'
                    }
                }

                const masterId = masterExists.masterId;



                const accessToken = await signMasterAccessToken(masterId);
                const refreshToken = await signMasterRefreshToken(masterId);
                // success response
                return {
                    status: 'success',
                    msg: 'Login success',

                    accessToken: accessToken,
                    refreshToken: refreshToken
                }


            } catch (error) {


                console.log(error);
                return {
                    status: 'unknownServerError',
                    msg: 'unknownServerError'
                }
            }


        }),
    refreshToken: masterPanelPublicProcedure
        .input(z.object({
            refreshToken: z.string({ required_error: "refreshToken is Requires" }),

        }))
        .mutation(async ({ ctx, input }) => {
            try {
                let { refreshToken } = input
                let payload = await jwtVerifyAsync(refreshToken, process.env.REFRESH_TOKEN_SECRET) as masterRefreshTokenPayloadType

                const verifyActiveSessions = await myPrisma.masters_active_sessions.findFirst({
                    where: {
                        masterId: convertToInt(payload.masterId),
                        refreshTokenId: convertToInt(payload.refreshTokenId)
                    }
                });

                if (!verifyActiveSessions) {
                    return {
                        status: 'invalidRefreshToken',
                        msg: 'invalidRefreshToken'
                    }
                }


                const accessToken = await signMasterAccessToken(verifyActiveSessions.masterId);
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

