import { z } from "zod";
import myPrisma from "../../globalHelpers/myPrisma.js";
import { trpcRouter } from "../../trpc.js";
import { adminPanelPublicProcedure } from "../adminPanelTrpc.js";

import bcrypt from 'bcrypt';
import { adminRefreshTokenPayloadType, signOwnerAccessToken, signOwnerRefreshToken } from "../helpers/jwtHelper.js";

import { jwtVerifyAsync } from "../../globalHelpers/jsonwebtoken.js";


export let authRoutes = trpcRouter({

    login: adminPanelPublicProcedure

        .input(z.object({
            email: z.string({ required_error: "Email is Requires" }).min(1, 'Email is Requires').email({ message: "Invalid Email" }),
            password: z.string({ required_error: "Password is requires" }).min(8, 'Password Must be 8 or more characters long').max(20, "Password Must be 20 or fewer characters long")
        }))

        .mutation(async ({ ctx, input }) => {

            try {
                const { email, password } = input;

                const ownerExists = await myPrisma.all_owners.findFirst({
                    where: {
                        email: email
                    },
                    include: {
                        web_app_details: true,
                        owners_plan_details: true,
                        all_web_apks: {
                            orderBy: {
                                createdAt: 'desc'
                            }
                        }
                    }
                });



                // console.log(ownerExists);


                if (!ownerExists) {
                    return {
                        status: 'error',
                        msg: 'This email is not registered'
                    }
                }
                const dbPassword = ownerExists.password;
                const passwordMatch = bcrypt.compareSync(password, dbPassword);
                if (!passwordMatch) {
                    return {
                        status: 'error',
                        msg: 'Invalid Login details'
                    }
                }

                const ownerId = ownerExists.ownerId;

                // if (ownerId === 133) {
                //     return res.json({
                //         status: 'emailBanned',
                //         msg: 'Email Email Banned from auth System',
                //         ownerId: ownerId
                //     });
                // }

                const ownersCredentialStatus = await myPrisma.owners_credential_status.findFirst({
                    where: {
                        ownerId: ownerId
                    }
                });

                if (ownersCredentialStatus.isEmailVerified === false) {
                    return {
                        status: 'emailUnverified',
                        msg: 'Email Verification is pending',
                        ownerId: ownerId
                    }
                }
                const getActivePlanData = await myPrisma.owners_plan_details.findFirst({
                    where: {
                        ownerId: ownerId
                    }
                });
                const activePlan = getActivePlanData.activePlan.toLowerCase();

                const accessToken = await signOwnerAccessToken({ ownerId, activePlan });
                const refreshToken = await signOwnerRefreshToken(ownerId);


                let logoLink = '';
                if (ownerExists.all_web_apks.length > 0) {
                    logoLink = ownerExists.all_web_apks[0].logoLink;
                }
                // success response
                return {
                    status: 'success',
                    msg: 'Login success',
                    fullName: ownerExists.fullName,
                    depositCredit: ownerExists.depositCredit,
                    bonusCredit: ownerExists.bonusCredit,
                    appName: ownerExists.web_app_details[0].name,
                    appUsername: ownerExists.web_app_details[0].username,
                    activePlan: activePlan,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    logoLink,
                    ownerId: ownerExists.ownerId
                }

            } catch (error) {


                console.log(error);
                return {
                    status: 'unknownServerError',
                    msg: 'unknownServerError'
                }
            }


        }),
    refreshToken: adminPanelPublicProcedure
        .input(z.object({
            refreshToken: z.string({ required_error: "refreshToken is Requires" }),

        }))
        .mutation(async ({ ctx, input }) => {
            try {
                let { refreshToken } = input
                let payload = await jwtVerifyAsync(refreshToken, process.env.REFRESH_TOKEN_SECRET) as adminRefreshTokenPayloadType

                let { ownerId } = payload
                const getActivePlanData = await myPrisma.owners_plan_details.findFirst({
                    where: {
                        ownerId: ownerId
                    }
                });
                const activePlan = getActivePlanData.activePlan.toLowerCase();

                const accessToken = await signOwnerAccessToken({ ownerId, activePlan });
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

