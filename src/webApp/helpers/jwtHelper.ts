import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import myPrisma from '../../globalHelpers/myPrisma.js';
import { randomNumberWithFixedLength, unixTimeStampInSeconds } from '../../globalHelpers/utility.js';



export type webAppUserAccessTokenPayloadType = {
    ownerId: number,
    userId: number,
}
export type webAppUserRefreshTokenPayloadType = {
    refreshTokenId: number,
    ownerId: number,
    userId: number,
}

export const signUserAccessToken = (ownerId: number, userId: number) => {

    return new Promise((resolve, reject) => {

        const payload: webAppUserAccessTokenPayloadType = { ownerId, userId };

        const secrete = process.env.ACCESS_TOKEN_SECRET;

        const options = {
            expiresIn: 60 * 10,
            issuer: 'Primexop.com',

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

export const verifyUserAccessToken = (req, res, next) => {
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

        // console.log(payload);
        req.payload = payload;
        next();
    });

};

export const signUserRefreshToken = (ownerId, userId) => {


    return new Promise((resolve, reject) => {

        async function main() {
            try {
                const validTillInSeconds = 60 * 60 * 24 * 15;

                const activeSessionsLimit = 2;

                const randomNumber = randomNumberWithFixedLength(6);

                //adding to data base 

                let activeSessions = await myPrisma.users_active_sessions.findMany({
                    where: {
                        ownerId,
                        userId
                    },
                    orderBy: {
                        createdAt: 'asc',
                    }
                });

                // console.log(activeSessions);

                let activeSessionsCount = activeSessions.length;

                while (activeSessionsCount > activeSessionsLimit - 1) {



                    const deleteOldSession = await myPrisma.users_active_sessions.delete({
                        where: {
                            sn: activeSessions[0].sn
                        }
                    });
                    deleteOldSession;
                    // console.log(deleteOldSession.sn +'this');

                    activeSessions = await myPrisma.users_active_sessions.findMany({
                        where: {
                            ownerId,
                            userId
                        },
                        orderBy: {
                            createdAt: 'asc',
                        }
                    });



                    activeSessionsCount = activeSessions.length;

                }


                const insertNewSession = await myPrisma.users_active_sessions.create({
                    data: {
                        ownerId,
                        userId,
                        refreshTokenId: randomNumber,
                        createdAt: unixTimeStampInSeconds(),
                        validTill: unixTimeStampInSeconds() + validTillInSeconds
                    }
                });


                const payload: webAppUserRefreshTokenPayloadType = {
                    refreshTokenId: insertNewSession.refreshTokenId,
                    ownerId,
                    userId
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

export const verifyUserRefreshToken = (req, res, next) => {
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


            const verifyActiveSessions = await myPrisma.users_active_sessions.findFirst({
                where: {
                    ownerId: +payload.ownerId,
                    userId: +payload.userId,
                    refreshTokenId: payload.refreshTokenId
                }
            });

            if (!verifyActiveSessions) return next(createHttpError.Unauthorized());

            req.payload = payload;
            // console.log(payload);
            next();
        }
        main();


    });


};
