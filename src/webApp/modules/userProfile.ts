import { TRPCError } from "@trpc/server";
import bcrypt from 'bcrypt';
import { z } from "zod";
import myPrisma from "../../globalHelpers/myPrisma.js";
import { trpcRouter } from "../../trpc.js";
import { webAppUserProcedure } from "../webAppTrpc.js";
let userProfileRoutes = trpcRouter({

    getProfileData: webAppUserProcedure

        .input(z.void())

        .query(async ({ ctx }) => {

            try {

                const { ownerId } = ctx.appData;
                const { userId } = ctx.payload

                let userData = await myPrisma.all_users.findFirst({
                    where: {
                        userId
                    },
                    select: {
                        fullName: true,
                        email: true,
                        mobileNumber: true
                    }
                })
                if (userData) {
                    return {

                        userData



                    }
                }
            } catch (error) {
                console.log(error);
            }


        })

    ,
    updateProfileData: webAppUserProcedure
        .input(z.object({
            fullName: z.string({ required_error: "Full Name is Requires" }).min(3, "Full Name Must be 3 or more characters long").max(50, "Full Name Must be 50 or Fewer characters long"),
            email: z.string({ required_error: "Email is Requires" }).email({ message: "Invalid Email" }),
            mobileNumber: z.string().min(10, "Enter 10 digit Mobile Number").max(10, "Enter 10 digit Mobile Number"),
        }))
        .mutation(async ({ ctx, input }) => {

            try {

                const { ownerId } = ctx.appData;
                const { userId } = ctx.payload
                const { email, fullName, mobileNumber } = input

                let updateUserData = await myPrisma.all_users.update({
                    where: {
                        userId
                    },
                    data: {
                        email, fullName, mobileNumber
                    }
                })


                if (updateUserData) {
                    return {
                        status: 'success',
                        msg: 'profile data updated ',

                    }
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
    updatePassword: webAppUserProcedure
        .input(z.object({
            oldPassword: z.string({ required_error: "Password is requires" }).min(8, 'Password Must be 8 or more characters long').max(20, "Password Must be 20 or fewer characters long"),
            newPassword: z.string({ required_error: "Password is requires" }).min(8, 'Password Must be 8 or more characters long').max(20, "Password Must be 20 or fewer characters long"),
            newPasswordConfirmation: z.string({ required_error: "Password is requires" }).min(8, 'Password Must be 8 or more characters long').max(20, "Password Must be 20 or fewer characters long"),
        }))
        .mutation(async ({ ctx, input }) => {
            try {


                const { ownerId } = ctx.appData;
                const { userId } = ctx.payload
                const { oldPassword, newPassword } = input

                let userData = await myPrisma.all_users.findFirst({
                    where: {
                        userId
                    }
                })


                const dbPassword = userData.password;
                const passwordMatch = bcrypt.compareSync(oldPassword, dbPassword);
                if (!passwordMatch) {


                    return {
                        status: 'error',
                        msg: "Invalid old Password"
                    }
                }
                const passwordHash = bcrypt.hashSync(newPassword, 10);

                let updateUserPassword = await myPrisma.all_users.update({
                    where: {
                        userId
                    },
                    data: {
                        password: passwordHash
                    }
                })

                if (updateUserPassword) {
                    return {
                        status: 'success',
                        msg: 'Password updated ',

                    }
                }



            } catch (error) {

                if (error == "invalidAppUsername") {
                    throw new TRPCError({ code: 'BAD_REQUEST', message: 'invalidAppUsername', cause: 'invalidAppUsernameCause' });
                } else {
                    console.log(error);
                    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: 'try catch ' });
                }
            }


        })
})

export default userProfileRoutes