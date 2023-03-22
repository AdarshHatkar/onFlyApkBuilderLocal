

import bcrypt from 'bcrypt';
import { Request, Response } from "express";
import { z } from "zod";
import GlobalBasicController from '../../globalControllers/basicController.js';
import createTransaction from '../../globalControllers/transactionController.js';
import myPrisma from '../../globalHelpers/myPrisma.js';
import { errorResponse } from '../../globalHelpers/response.js';
import { convertToInt, unixTimeStampInSeconds } from '../../globalHelpers/utility.js';

import { signUserAccessToken, signUserRefreshToken } from '../helpers/jwtHelper.js';
import { appDataType } from '../middlewares/appUsername.js';


const AuthController = {

    registerBodySchema: z.object({
        fullName: z.string({ required_error: "Full Name is Requires" }).min(3, "Full Name Must be 3 or more characters long").max(50, "Full Name Must be 50 or Fewer characters long"),
        email: z.string({ required_error: "Email is Requires" }).email({ message: "Invalid Email" }),
        mobileNumber: z.string().min(10, "Enter 10 digit Mobile Number").max(10, "Enter 10 digit Mobile Number"),
        password: z.string({ required_error: "Password is requires" }).min(8, 'Password Must be 8 or more characters long').max(20, "Password Must be 20 or fewer characters long"),
        referralCodeString: z.string({ invalid_type_error: "Invalid Referral Code" }).optional()
    }),
    register: async (req, res) => {
        try {
            type registerBody = z.infer<typeof AuthController.registerBodySchema>
            const { ownerId } = req.appData as appDataType
            let { fullName, email, mobileNumber, password, referralCodeString } = req.body as registerBody
            let referralCode = convertToInt(referralCodeString)


            if (referralCode) {

                const checkReferralCode = await myPrisma.all_users.findFirst({
                    where: {
                        userId: referralCode,
                        ownerId
                    }
                });

                if (!checkReferralCode) {
                    return res.json({
                        status: 'error',
                        msg: 'Referral Code is invalid'
                    });
                }

            }


            const checkEmailExist = await myPrisma.all_users.findFirst({
                where: {
                    ownerId,
                    email
                }
            });
            if (checkEmailExist) {
                return res.json({
                    status: 'error',
                    msg: 'Email already registered'
                });
            }

            const checkMobileNumberExist = await myPrisma.all_users.findFirst({
                where: {
                    ownerId,
                    mobileNumber
                }
            });
            if (checkMobileNumberExist) {
                return res.json({
                    status: 'error',
                    msg: 'Mobile Number already registered'
                });
            }

            const passwordHash = bcrypt.hashSync(password, 10);


            const insertUser = await myPrisma.all_users.create({
                data: {
                    ownerId,
                    fullName,
                    email,
                    countryCode: 0,
                    mobileNumber,
                    depositCredit: 0,
                    winCredit: 0,
                    bonusCredit: 0,
                    updatedAt: unixTimeStampInSeconds(),
                    createdAt: unixTimeStampInSeconds(),
                    password: passwordHash
                }
            });

            const userId = insertUser.userId;

            const insertUsersCredentialStatus = await myPrisma.users_credential_status.create({
                data: {
                    userId,
                    isEmailVerified: false,
                    isMobileNumberVerified: false
                }
            });
            insertUsersCredentialStatus;


            if (referralCode) {
                // insert referral log
                const insertReferralLog = await myPrisma.users_referrals_log.create({
                    data: {
                        userId,
                        referredById: referralCode,
                        referredByEarnings: 0
                    }
                });
                insertReferralLog;
                // get refer and earn config
                const referAndEarnConfigData = await GlobalBasicController.getReferAndEarnConfig(ownerId);


                // deposit register reward
                if (referAndEarnConfigData.registerRewardCoin === 'winCredit') {
                    await createTransaction.user.onlyWinCredit({ userId: userId, transactionType: 'CREDIT', amount: referAndEarnConfigData.registerRewardAmount, comment: `Register Reward For Using referralCode [${referralCode}] ` });
                } else {
                    await createTransaction.user.onlyDepositCredit({ userId: userId, transactionType: 'CREDIT', amount: referAndEarnConfigData.registerRewardAmount, comment: `Register Reward For Using referralCode [${referralCode}] ` });
                }
            }




            const accessToken = await signUserAccessToken(ownerId, userId);
            const refreshToken = await signUserRefreshToken(ownerId, userId);

            res.json({
                status: 'success',
                msg: 'Registration Complete',
                fullName,
                depositCredit: insertUser.depositCredit,
                winCredit: insertUser.winCredit,
                bonusCredit: insertUser.bonusCredit,
                accessToken,
                refreshToken
            });

        } catch (error) {
            console.log(error);
        }
    },

    loginBodySchema: z.object({
        email: z.string({ required_error: "Email is Requires" }).email({ message: "Invalid Email" }),
        password: z.string({ required_error: "Password is requires" }).min(8, 'Password Must be 8 or more characters long').max(20, "Password Must be 20 or fewer characters long")
    }),
    login: async (req: Request, res: Response) => {
        try {
            type loginBody = z.infer<typeof AuthController.loginBodySchema>
            const { ownerId } = req.appData as appDataType
            const { email, password } = req.body as loginBody

            const userExists = await myPrisma.all_users.findFirst({
                where: {
                    ownerId,
                    email
                }
            });

            // console.log(userExists);
            if (!userExists) {

                return errorResponse(res, "This email is not registered")
            }


            const dbPassword = userExists.password;
            const passwordMatch = bcrypt.compareSync(password, dbPassword);
            if (!passwordMatch) {

                return errorResponse(res, "Invalid Login details")
            }


            const userId = userExists.userId;

            const accessToken = await signUserAccessToken(ownerId, userId);
            const refreshToken = await signUserRefreshToken(ownerId, userId);


            res.json({
                status: 'success',
                msg: 'Login Success',
                fullName: userExists.fullName,
                depositCredit: userExists.depositCredit,
                winCredit: userExists.winCredit,
                bonusCredit: userExists.bonusCredit,
                accessToken,
                refreshToken
            });


        } catch (error) {
            console.log(error);
        }

    },

    refreshToken: async (req, res) => {

        const { ownerId, userId } = req.payload;


        const accessToken = await signUserAccessToken(ownerId, userId);
        return res.json({
            status: 'success',
            msg: 'token successfully refreshed',
            accessToken: accessToken
        });
    },
};

export default AuthController;