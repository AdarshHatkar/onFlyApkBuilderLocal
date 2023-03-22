

import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import myPrisma from '../../globalHelpers/myPrisma.js';
import { randomNumberWithFixedLength, unixTimeStampInSeconds } from '../../globalHelpers/utility.js';

export type adminAccessTokenPayloadType = {
    ownerId: number,
    activePlan: string
}
export type adminRefreshTokenPayloadType = {
    refreshTokenId: number,
    ownerId: number
}

export const signOwnerAccessToken = ({ ownerId, activePlan }) => {

    return new Promise((resolve, reject) => {




        const payload: adminAccessTokenPayloadType = { ownerId, activePlan };

        const secrete = process.env.ACCESS_TOKEN_SECRET;

        const options = {
            expiresIn: 60 * 10,
            issuer: 'Primexop.com'
        };


        jwt.sign(payload, secrete, options, (err, token) => {
            if (err) {
                console.log(err);
                reject(createHttpError.InternalServerError());
            }

            resolve(token);
        });
    });

};

export const verifyOwnerAccessToken = (req, res, next) => {
    if (!req.headers['authorization']) {
        return next(createHttpError.Unauthorized());
    }

    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader.split(' ');
    const token = bearerToken[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, payload) {

        if (err) {
            if (err.name !== 'TokenExpiredError') return next(createHttpError.Unauthorized());

            return next(createHttpError.Unauthorized(err.message));
        }

        req.payload = payload;
        next();
    });

};

export const signOwnerRefreshToken = (ownerId) => {


    return new Promise((resolve, reject) => {

        async function main() {
            try {
                const validTillInSeconds = 60 * 60 * 24;

                const activeSessionsLimit = 2;

                const randomNumber = randomNumberWithFixedLength(6);

                //adding to data base 

                let activeSessions = await myPrisma.owners_active_sessions.findMany({
                    where: {
                        ownerId: ownerId
                    },
                    orderBy: {
                        createdAt: 'asc',
                    }
                });

                // console.log(activeSessions);

                let activeSessionsCount = activeSessions.length;

                while (activeSessionsCount > activeSessionsLimit - 1) {



                    const deleteOldSession = await myPrisma.owners_active_sessions.delete({
                        where: {
                            sn: activeSessions[0].sn
                        }
                    });
                    deleteOldSession;
                    // console.log(deleteOldSession.sn +'this');

                    activeSessions = await myPrisma.owners_active_sessions.findMany({
                        where: {
                            ownerId: ownerId
                        },
                        orderBy: {
                            createdAt: 'asc',
                        }
                    });



                    activeSessionsCount = activeSessions.length;

                }


                const insertNewSession = await myPrisma.owners_active_sessions.create({
                    data: {
                        ownerId: ownerId,
                        refreshTokenId: randomNumber,
                        createdAt: unixTimeStampInSeconds(),
                        validTill: unixTimeStampInSeconds() + validTillInSeconds
                    }
                });


                const payload: adminRefreshTokenPayloadType = {
                    refreshTokenId: insertNewSession.refreshTokenId,
                    ownerId
                };

                const secrete = process.env.REFRESH_TOKEN_SECRET;

                const options = {
                    expiresIn: validTillInSeconds,
                    issuer: 'Primexop.com',

                };


                jwt.sign(payload, secrete, options, (err, token) => {
                    if (err) {
                        console.log(err);
                        reject(createHttpError.InternalServerError());
                    }

                    resolve(token);
                });
            } catch (error) {
                console.log(error);
            }

        }
        main();


    });

};

export const verifyOwnerRefreshToken = (req, res, next) => {
    if (!req.headers['authorization']) {
        return next(createHttpError.Unauthorized());
    }

    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader.split(' ');
    const token = bearerToken[1];


    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, function (err, payload) {

        async function main() {
            if (err) {
                if (err.name !== 'TokenExpiredError') return next(createHttpError.Unauthorized());

                return next(createHttpError.Unauthorized(err.message));
            }


            const verifyActiveSessions = await myPrisma.owners_active_sessions.findFirst({
                where: {
                    ownerId: +payload.ownerId,
                    refreshTokenId: payload.refreshTokenId
                }
            });

            if (!verifyActiveSessions) return next(createHttpError.Unauthorized());

            req.payload = payload;
            next();
        }
        main();


    });


};
