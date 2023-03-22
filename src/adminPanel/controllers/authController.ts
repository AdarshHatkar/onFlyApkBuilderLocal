import bcrypt from 'bcrypt';
import mtaConfig from '../../globalHelpers/mtaConfig.js';
import myPrisma from '../../globalHelpers/myPrisma.js';
import { convertToInt, unixTimeStampInSeconds } from '../../globalHelpers/utility.js';
import { signOwnerAccessToken, signOwnerRefreshToken } from '../helpers/jwtHelper.js';

import { body } from 'express-validator';


const authController = {

    adminRegisterValidationRules: () => {
        return [
            /// appName must be at least 3 chars long
            body('appName')
                .isLength({ min: 3, max: 50 })
                .trim(),
            body('ownerName')
                .isLength({ min: 3, max: 50 })
                .trim(),
            body('email')
                .isEmail()
                .normalizeEmail(),
            body('password')
                .isLength({ min: 8, max: 30 })
                .trim(),
            body('referralCode')
                .isLength({ min: 0, max: 20 })
                .isString()
                .escape()
                .trim(),


        ];
    },
    adminRegister: async (req, res) => {
        try {

            const { appName, ownerName, email, password, referralCode } = req.body;



            let isReferredBy = false;
            if (referralCode !== '') {
                isReferredBy = true;
            }
            let referredById = 0;
            if (isReferredBy) {
                const referredByExists = await myPrisma.web_app_details.findFirst({
                    where: {
                        username: referralCode
                    }
                });
                if (!referredByExists) {
                    return res.json({
                        status: 'error',
                        msg: 'Invalid referral code'
                    });
                }

                referredById = referredByExists.ownerId;

            }

            let appUsername = appName;
            // replacing space
            appUsername = appUsername.replace(/ /g, '_');
            //replace all except alphanumeric
            appUsername = appUsername.replace(/\W/g, '');
            // making small case
            appUsername = appUsername.toLowerCase();


            const appUsernameExists = await myPrisma.web_app_details.findFirst({
                where: {
                    username: appUsername
                }
            });
            if (appUsernameExists) {
                return res.json({
                    status: 'error',
                    msg: 'App name Already exists'
                });
            }
            const ownerExists = await myPrisma.all_owners.findFirst({
                where: {
                    email: email
                }
            });
            if (ownerExists) {
                return res.json({
                    status: 'error',
                    msg: 'Email Already exists'
                });
            }

            const passwordHash = bcrypt.hashSync(password, 10);
            // return console.log(passwordHash);

            // inserting data 

            const insertOwner = await myPrisma.all_owners.create({
                data: {
                    email: email,
                    countryCode: 0,
                    mobileNumber: '',
                    depositCredit: 0,
                    bonusCredit: 0,
                    fullName: ownerName,
                    password: passwordHash,
                    createdAt: unixTimeStampInSeconds(),
                    updatedAt: unixTimeStampInSeconds()

                }
            });

            const ownerId = insertOwner.ownerId;

            const insertOwnersCredentialStatus = await myPrisma.owners_credential_status.create({
                data: {
                    ownerId: ownerId,
                    isEmailVerified: false,
                    isMobileNumberVerified: false
                }
            });
            insertOwnersCredentialStatus;

            const insertWebAppDetails = await myPrisma.web_app_details.create({
                data: {
                    ownerId: ownerId,
                    name: appName,
                    username: appUsername


                }
            });
            insertWebAppDetails;
            const insertWebApkDetails = await myPrisma.web_apk_details.create({
                data: {
                    ownerId: ownerId,
                    googleServiceJson: '',
                    newVersion: mtaConfig.latestWebApkVersionCode,
                    oldVersion: mtaConfig.latestWebApkVersionCode,
                    oneSignalApiKey: '',
                    oneSignalAppId: ''
                }
            });
            insertWebApkDetails;
            const insertOwnersPlanDetails = await myPrisma.owners_plan_details.create({
                data: {
                    ownerId: ownerId,
                    purchasePrice: 0,
                    startedAt: unixTimeStampInSeconds(),
                    validTill: unixTimeStampInSeconds(),
                    activePlan: 'free'
                }
            });
            /* 
            if we need to add one month validity on register
            validTill: unixTimeStampInSeconds() + 60 * 60 * 24 * 30
            */
            insertOwnersPlanDetails;

            if (isReferredBy) {
                const insertOwnersReferralsLog = await myPrisma.owners_referrals_log.create({
                    data: {
                        ownerId: ownerId,
                        referredById: referredById,
                        referredByEarnings: 0

                    }
                });

                insertOwnersReferralsLog;
            }


            res.json({
                status: 'success',
                msg: 'Registration Complete',
                ownerId: ownerId
            });

            // console.log(insertWebAppDetails);

            // res.send(DateTime.now())
        } catch (error) {
            console.log(error);
        }
    },


    adminLoginValidationRules: () => {
        return [

            body('email')
                .isEmail()
                .normalizeEmail(),
            body('password')
                .isLength({ min: 8, max: 30 })
                .trim()


        ];
    },
    adminLogin: async (req, res) => {
        const { email, password } = req.body;

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
            return res.json({
                status: 'error',
                msg: 'This email is not registered'
            });
        }
        const dbPassword = ownerExists.password;
        const passwordMatch = bcrypt.compareSync(password, dbPassword);
        if (!passwordMatch) {
            return res.json({
                status: 'error',
                msg: 'Invalid Login details'
            });
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
            return res.json({
                status: 'emailUnverified',
                msg: 'Email Verification is pending',
                ownerId: ownerId
            });
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
        return res.json({
            status: 'success',
            msg: 'Login success',
            fullName: ownerExists.fullName,
            depositCredit: ownerExists.depositCredit,
            appName: ownerExists.web_app_details[0].name,
            appUsername: ownerExists.web_app_details[0].username,
            activePlan: activePlan,
            accessToken: accessToken,
            refreshToken: refreshToken,
            logoLink
        });


    },

    refreshToken: async (req, res) => {

        let { ownerId } = req.payload;
        ownerId = convertToInt(ownerId);
        const getActivePlanData = await myPrisma.owners_plan_details.findFirst({
            where: {
                ownerId: ownerId
            }
        });
        const activePlan = getActivePlanData.activePlan.toLowerCase();

        const accessToken = await signOwnerAccessToken({ ownerId, activePlan });
        return res.json({
            status: 'success',
            msg: 'token successfully refreshed',
            accessToken: accessToken
        });
    },
};

export default authController;