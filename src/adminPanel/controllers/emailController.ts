
import bcrypt from 'bcrypt';
import { body } from 'express-validator';
import mailTransporter from '../../globalHelpers/mailTransporter.js';
import myPrisma from '../../globalHelpers/myPrisma.js';
import { unixTimeStampInSeconds } from '../../globalHelpers/utility.js';

const emailController = {

    sendVerificationEmailValidationRules: () => {
        return [
            body('ownerId')
                .toInt()
                .trim(),
            body('requesterHostHref')
                .isURL()
        ];
    },

    sendVerificationEmail: async (req, res) => {
        try {
            const { requesterHostHref } = req.body;
            let { ownerId } = req.body;
            ownerId = parseInt(ownerId);


            const owners_credential_status = await myPrisma.owners_credential_status.findFirst({
                where: {
                    ownerId: ownerId
                }
            });


            if (owners_credential_status.isEmailVerified === true) {
                return res.json({
                    status: 'error',
                    msg: 'Email Already Verified 🥰'
                });
            }

            const emailsSendedInLastFiveMinutes = await myPrisma.owners_email_log.findFirst({
                where: {
                    ownerId: ownerId,
                    createdAt: {
                        gt: unixTimeStampInSeconds() - 60 * 5
                    }
                }
            });

            if (emailsSendedInLastFiveMinutes) {
                return res.json({
                    status: 'error',
                    msg: 'Email Already Sended try again after 5 Minutes'
                });
            }

            const emailsSendedInLastOneDay = await myPrisma.owners_email_log.count({
                where: {
                    ownerId: ownerId,
                    createdAt: {
                        gt: unixTimeStampInSeconds() - 60 * 60 * 24
                    }
                }
            });

            if (emailsSendedInLastOneDay > 5) {
                return res.json({
                    status: 'error',
                    msg: 'Daily limit Reached try again after 24 Hours'
                });
            }

            const ownerData = await myPrisma.all_owners.findFirst({
                where: {
                    ownerId: ownerId
                }
            });

            if (!ownerData) {
                return res.json({
                    status: 'error',
                    msg: 'Owner Account is missing'
                });
            }

            // sending email 
            const randomEmailToken = Math.floor(1000 + Math.random() * 9000);

            const verificationLink = requesterHostHref + `?action=checkVerificationLink&ownerId=${ownerId}&token=${randomEmailToken}`;

            // send mail with defined transport object
            const sendMail = await mailTransporter.sendMail({
                from: '"Primexop" <no-reply@primexop.com>',
                replyTo: 'support@primexop.com',
                to: {
                    name: ownerData.fullName,
                    address: ownerData.email
                },
                subject: 'Email Verification Link',
                text: 'contact our customer support for help Primexop.com',
                html: `
                <html>
                <head>
                    
                </head>
                <body>
                    <h1> Email Verification Link <h1>
                            <br>
                            <p> Hello  ${ownerData.fullName} </p> 
                            <br>
                            <P> Click on link below to verify your email on Primexop.com </P>
                            <br>
                            Link: <a href="${verificationLink}">${verificationLink}</a>
                            <br>
                            <P>If this email verification is not requested by you then Report Us immediately on <a href="https://primexop.com">Primexop.com</a></P>
                </body>
                
                </html>
                `, // html body
            });

            if (!sendMail) {
                return res.json({
                    status: 'error',
                    msg: 'Mail Server error'
                });
            }


            const insertOwnersEmailLog = await myPrisma.owners_email_log.create({
                data: {
                    ownerId: ownerId,
                    type: 'EMAIL_VERIFICATION',
                    token: randomEmailToken,
                    createdAt: unixTimeStampInSeconds()
                }
            });
            insertOwnersEmailLog;

            return res.json({
                status: 'success',
                msg: 'Verification email Sended successfully',
                email: ownerData.email
            });

        } catch (error) {
            console.log(error);
        }
    },

    checkVerificationLinkValidationRules: () => {
        return [
            body('ownerId')
                .isInt()
                .trim(),
            body('token')
                .isInt()
                .trim()
        ];
    },

    checkVerificationLink: async (req, res) => {

        let { ownerId, token } = req.body;
        ownerId = parseInt(ownerId);
        token = parseInt(token);

        const checkVerificationToken = await myPrisma.owners_email_log.findFirst({
            where: {
                ownerId: ownerId,
                token: token
            }
        });
        checkVerificationToken;

        if (!checkVerificationToken) {
            return res.json({
                status: 'error',
                msg: 'Invalid link'
            });
        }

        const updateEmailVerificationStatus = await myPrisma.owners_credential_status.update({
            where: {
                ownerId: ownerId
            },
            data: {
                isEmailVerified: true
            }
        });
        updateEmailVerificationStatus;

        return res.json({
            status: 'success',
            msg: 'Email Verification Completed'
        });
    },

    sendPasswordResetEmailValidationRules: () => {
        return [
            body('email')
                .isEmail()
                .trim(),
            body('requesterHostHref')
                .isURL()
        ];
    },

    sendPasswordResetEmail: async (req, res) => {
        try {
            const { requesterHostHref, email } = req.body;



            const ownerData = await myPrisma.all_owners.findFirst({
                where: {
                    email
                }
            });

            if (!ownerData) {
                return res.json({
                    status: 'error',
                    msg: 'No account is linked to this email '
                });
            }

            const ownerId = ownerData.ownerId;




            const emailsSendedInLastFiveMinutes = await myPrisma.owners_email_log.findFirst({
                where: {
                    ownerId: ownerId,
                    createdAt: {
                        gt: unixTimeStampInSeconds() - 60 * 5
                    }
                }
            });

            if (emailsSendedInLastFiveMinutes) {
                return res.json({
                    status: 'error',
                    msg: 'Email Already Sended try again after 5 Minutes'
                });
            }

            const emailsSendedInLastOneDay = await myPrisma.owners_email_log.count({
                where: {
                    ownerId: ownerId,
                    createdAt: {
                        gt: unixTimeStampInSeconds() - 60 * 60 * 24
                    }
                }
            });

            if (emailsSendedInLastOneDay > 5) {
                return res.json({
                    status: 'error',
                    msg: 'Daily limit Reached try again after 24 Hours'
                });
            }





            // sending email 
            const randomEmailToken = Math.floor(1000 + Math.random() * 9000);

            const passwordResetLink = requesterHostHref + `?action=checkPasswordResetLink&ownerId=${ownerId}&token=${randomEmailToken}`;

            // send mail with defined transport object
            const sendMail = await mailTransporter.sendMail({
                from: '"Primexop" <no-reply@primexop.com>',
                replyTo: 'support@primexop.com',
                to: {
                    name: ownerData.fullName,
                    address: ownerData.email
                },
                subject: 'Password Reset Link',
                text: 'contact our customer support for help Primexop.com',
                html: `
                <html>
                <head>
                    
                </head>
                <body>
                    <h1> Password Reset Link <h1>
                            <br>
                            <p> Hello  ${ownerData.fullName} </p> 
                            <br>
                            <P> Click on link below to Reset Your Password on Primexop.com </P>
                            <br>
                            Link: <a href="${passwordResetLink}">${passwordResetLink}</a>
                            <br>
                            <P>If this Password Reset is not requested by you then Report Us immediately on <a href="https://primexop.com">Primexop.com</a></P>
                </body>
                
                </html>
                `, // html body
            });

            if (!sendMail) {
                return res.json({
                    status: 'error',
                    msg: 'Mail Server error'
                });
            }


            const insertOwnersEmailLog = await myPrisma.owners_email_log.create({
                data: {
                    ownerId: ownerId,
                    type: 'PASSWORD_RESET',
                    token: randomEmailToken,
                    createdAt: unixTimeStampInSeconds()
                }
            });
            insertOwnersEmailLog;

            return res.json({
                status: 'success',
                msg: 'Password Reset Email Sended Successfully',
                email: ownerData.email
            });

        } catch (error) {
            console.log(error);
        }
    },

    checkPasswordResetLinkValidationRules: () => {
        return [
            body('ownerId')
                .isInt()
                .trim(),
            body('token')
                .isInt()
                .trim(),
            body('password')
                .isLength({ min: 8, max: 20 })
                .trim()
        ];
    },

    checkPasswordResetLink: async (req, res) => {

        let { ownerId, token } = req.body;
        const { password } = req.body;

        ownerId = +ownerId;
        token = +token;


        const checkVerificationToken = await myPrisma.owners_email_log.findFirst({
            where: {
                ownerId,
                token,
                type: 'PASSWORD_RESET'
            }
        });


        if (!checkVerificationToken) {
            return res.json({
                status: 'error',
                msg: 'Invalid link'
            });
        }

        const deleteOwnersActiveSessions = await myPrisma.owners_active_sessions.deleteMany({
            where: {
                ownerId
            }
        });
        deleteOwnersActiveSessions;
        const passwordHash = bcrypt.hashSync(password, 10);
        const updatePassword = await myPrisma.all_owners.update({
            where: {
                ownerId
            },
            data: {
                password: passwordHash
            }
        });

        if (updatePassword) {
            return res.json({
                status: 'success',
                msg: 'Password Updated '
            });
        }


    },
};

export default emailController;