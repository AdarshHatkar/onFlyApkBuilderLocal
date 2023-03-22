
import GlobalBasicController from '../../globalControllers/basicController.js';
import createTransaction from '../../globalControllers/transactionController.js';
import myPrisma from '../../globalHelpers/myPrisma.js';
import { convertToInt, convertToTwoDecimalInt } from '../../globalHelpers/utility.js';



const BasicController = {
    basicDetails: async (req, res) => {

        const { userId } = req.payload;
        const userData = await myPrisma.all_users.findFirst({
            where: {
                userId
            }
        });

        if (!userData) {
            return res.json({
                status: 'error',
                msg: 'user not found'
            });
        }

        const { fullName, depositCredit, winCredit, bonusCredit } = userData;

        return res.json({
            status: 'success',
            msg: 'request completed',

            fullName,
            depositCredit,
            winCredit,
            bonusCredit

        });
    },

    getSupportMethods: async (req, res) => {
        try {

            const { ownerId } = req.appData;

            const supportMethodsData = await myPrisma.app_support_details.findMany({
                where: {
                    ownerId
                }
            });
            if (supportMethodsData) {
                return res.json({
                    status: 'success',
                    msg: 'data fetched ',
                    supportMethodsData



                });
            }
        } catch (error) {
            console.log(error);
        }
    },

    getGames: async (req, res) => {

        try {
            const { ownerId } = req.appData;

            const gamesData = await myPrisma.games.findMany({
                where: {
                    ownerId
                },
                include: {
                    matches: {
                        where: {
                            status: 'upcoming'
                        },
                        take: 40
                    }
                }

            });
            // await new Promise(r => setTimeout(r, 50 * 1000));
            if (gamesData) {
                return res.json({
                    status: 'success',
                    msg: 'data fetched ',
                    gamesData
                });
            }
        } catch (error) {
            console.log(error);
        }

    },

    getUpcomingMatches: async (req, res) => {

        try {
            const { ownerId } = req.appData;
            const { userId } = req.payload;
            let { gameId, skip } = req.params;

            gameId = convertToInt(gameId);
            skip = convertToInt(skip);

            const upcomingMatchesData = await myPrisma.matches.findMany({
                where: {
                    ownerId,
                    gameId: gameId,
                    status: 'upcoming'
                },
                orderBy: {
                    time: 'asc'
                },
                skip,
                take: 5,
                include: {
                    matches_joinings: {
                        where: {

                            joinedBy: userId
                        }
                    },
                    _count: {
                        select: {
                            matches_joinings: true,

                        }
                    }
                }
            });

            if (upcomingMatchesData) {
                return res.json({
                    status: 'success',
                    msg: 'upcomingMatchesData fetched ',
                    upcomingMatchesData
                });
            }
        } catch (error) {
            console.log(error);
        }
    },
    getOngoingMatches: async (req, res) => {

        try {
            const { ownerId } = req.appData;
            let { gameId, skip } = req.params;
            gameId = convertToInt(gameId);
            skip = convertToInt(skip);

            const ongoingMatchesData = await myPrisma.matches.findMany({
                where: {
                    ownerId,
                    gameId,
                    status: 'ongoing'
                },
                orderBy: {
                    time: 'asc'
                },
                skip,
                take: 5
            });

            if (ongoingMatchesData) {
                return res.json({
                    status: 'success',
                    msg: 'ongoingMatchesData fetched ',
                    ongoingMatchesData
                });
            }
        } catch (error) {
            console.log(error);
        }
    },
    getResultedMatches: async (req, res) => {

        try {
            const { ownerId } = req.appData;
            let { gameId, skip } = req.params;
            gameId = convertToInt(gameId);
            skip = convertToInt(skip);

            const resultedMatchesData = await myPrisma.matches.findMany({
                where: {
                    ownerId,
                    gameId,
                    OR: [
                        {
                            status: 'resulted',
                        },
                        {
                            status: 'cancelled',
                        },
                    ],
                },
                orderBy: {
                    time: 'desc'
                },
                skip,
                take: 5
            });

            if (resultedMatchesData) {
                return res.json({
                    status: 'success',
                    msg: 'resultedMatchesData fetched ',
                    resultedMatchesData
                });
            }
        } catch (error) {
            console.log(error);
        }
    },


    getMatchDetails: async (req, res) => {

        try {
            const { ownerId } = req.appData;
            let { gameId, sn } = req.params;
            const { userId } = req.payload;

            // converting to int 

            gameId = convertToInt(gameId);
            sn = convertToInt(sn);

            const matchDetailsData = await myPrisma.matches.findFirst({
                where: {
                    ownerId,
                    gameId,
                    sn

                },
                include: {
                    rules_collections: {
                        include: {
                            rules: {}
                        }
                    },
                    _count: {
                        select: {
                            matches_joinings: true
                        }
                    }

                }
            });


            const userJoiningsData = await myPrisma.matches_joinings.findMany({
                where: {
                    matchId: matchDetailsData.sn,
                    joinedBy: userId
                }
            });

            let roomIdAndPassData = undefined;
            if (userJoiningsData.length > 0) {
                roomIdAndPassData = await myPrisma.custom_room_details.findFirst({
                    where: {
                        matchId: matchDetailsData.sn,
                    }
                });
            }

            if (userJoiningsData) {
                return res.json({
                    status: 'success',
                    msg: 'data fetched ',
                    matchDetailsData,
                    userJoiningsData,
                    roomIdAndPassData
                });
            }
        } catch (error) {
            console.log(error);
        }
    },
    getAllJoinings: async (req, res) => {
        try {
            const { ownerId } = req.appData;
            let { skip, sn } = req.params;


            // converting to int 

            skip = convertToInt(skip);
            sn = convertToInt(sn);

            const allJoiningDetails = await myPrisma.matches_joinings.findMany({
                where: {
                    matchId: sn,
                    ownerId
                },
                skip,
                take: 20,
                orderBy: {
                    totalWinning: 'desc'
                }
            });
            const allWinnersDetails = await myPrisma.matches_joinings.findMany({
                where: {
                    matchId: sn,
                    ownerId,
                    isWinner: true
                },
                take: 20,
                orderBy: {
                    totalWinning: 'desc'
                }
            });

            if (allJoiningDetails) {
                return res.json({
                    status: 'success',
                    msg: 'data fetched ',

                    allJoiningDetails,
                    allWinnersDetails

                });
            }
        } catch (error) {
            console.log(error);
        }
    },

    addJoining: async (req, res) => {
        try {
            const { ownerId } = req.appData;
            let { gameId, sn } = req.params;
            const { userId } = req.payload;
            const { inGameName, inGameId } = req.body;
            // console.log({ inGameName, inGameId });
            // converting to int 
            gameId = convertToInt(gameId);
            sn = convertToInt(sn);



            const matchDetailsData = await myPrisma.matches.findFirst({
                where: {
                    ownerId,
                    gameId,
                    sn

                },
                include: {

                    matches_joinings: {},

                }
            });

            // checking if user already joined with same username and id 

            if (inGameName !== '') {
                const UsersJoiningCheck = await myPrisma.matches_joinings.findMany({
                    where: {
                        matchId: sn,
                        ownerId,
                        inGameName
                    }
                });

                if (UsersJoiningCheck.length > 0) {
                    return res.json({
                        status: 'error',
                        msg: 'inGameName is already joined'
                    });
                }

            }
            if (inGameId !== '') {
                const UsersJoiningCheck = await myPrisma.matches_joinings.findMany({
                    where: {
                        matchId: sn,
                        ownerId,
                        inGameId
                    }
                });

                if (UsersJoiningCheck.length > 0) {
                    return res.json({
                        status: 'error',
                        msg: 'inGameId is already joined'
                    });
                }

            }


            const UsersJoiningData = await myPrisma.matches_joinings.findMany({
                where: {
                    matchId: sn,
                    ownerId,
                    joinedBy: userId
                }
            });

            if (matchDetailsData.status !== 'upcoming') {
                return res.json({
                    status: 'error',
                    msg: 'match already Ongoing'
                });
            }

            if (matchDetailsData.maxJoining <= matchDetailsData.matches_joinings.length) {
                return res.json({
                    status: 'error',
                    msg: 'Joining already full'
                });
            }
            if (matchDetailsData.playersInTeam <= UsersJoiningData.length) {
                return res.json({
                    status: 'error',
                    msg: 'Your Team already full'
                });
            }

            const entryFees = convertToTwoDecimalInt(matchDetailsData.entryFees);



            const userData = await myPrisma.all_users.findFirst({
                where: {
                    ownerId,
                    userId
                }
            });
            const winCredit = convertToTwoDecimalInt(userData.winCredit);
            const depositCredit = convertToTwoDecimalInt(userData.depositCredit);
            const totalCredit = convertToTwoDecimalInt(winCredit + depositCredit);


            // console.log({ entryFees, totalCredit, winCredit, depositCredit });
            if (entryFees > totalCredit) {
                return res.json({
                    status: 'error',
                    msg: 'Low Balance'
                });
            }


            if (entryFees > 0) {
                if (entryFees <= depositCredit) {
                    // create deposit trx
                    const createUserDepositCreditTransactionData = await createTransaction.user.onlyDepositCredit({ userId: userId, transactionType: 'DEBIT', amount: entryFees, comment: `Joining of [ ${inGameName} ]:${inGameId} in match id: ${sn}` });

                    if (createUserDepositCreditTransactionData.status === 'error') {
                        return res.json(createUserDepositCreditTransactionData);
                    }
                } else if (0 < depositCredit) {

                    const depositCreditDebitAmount = depositCredit;
                    const winCreditDebitAmount = entryFees - depositCredit;

                    // console.log({ depositCreditDebitAmount, winCreditDebitAmount });


                    // create dep +win trx
                    const createUserDepositCreditTransactionData = await createTransaction.user.onlyDepositCredit({ userId: userId, transactionType: 'DEBIT', amount: depositCreditDebitAmount, comment: `Joining of [ ${inGameName} ]:${inGameId} in match id: ${sn}` });
                    if (createUserDepositCreditTransactionData.status === 'error') {
                        return res.json(createUserDepositCreditTransactionData);
                    }

                    const createUserWinCreditTransactionData = await createTransaction.user.onlyWinCredit({ userId: userId, transactionType: 'DEBIT', amount: winCreditDebitAmount, comment: `Joining of [ ${inGameName} ]:${inGameId} in match id: ${sn}` });
                    if (createUserWinCreditTransactionData.status === 'error') {
                        return res.json(createUserWinCreditTransactionData);
                    }


                } else {
                    const createUserWinCreditTransactionData = await createTransaction.user.onlyWinCredit({ userId: userId, transactionType: 'DEBIT', amount: entryFees, comment: `Joining of [ ${inGameName} ]:${inGameId} in match id: ${sn}` });
                    if (createUserWinCreditTransactionData.status === 'error') {
                        return res.json(createUserWinCreditTransactionData);
                    }
                }
            }

            // add joining 

            const addJoining = await myPrisma.matches_joinings.create({
                data: {
                    inGameId,
                    inGameName,
                    isUserWalletUpdated: false,
                    isWinner: false,
                    kills: 0,
                    totalWinning: 0,
                    winnerPrize: 0,
                    ownerId,
                    joinedBy: userId,
                    matchId: +sn,


                }
            });

            // check is refer log  and earning 
            const checkReferralLog = await myPrisma.users_referrals_log.findFirst({
                where: {
                    userId
                }
            });
            if (checkReferralLog) {

                if (convertToTwoDecimalInt(checkReferralLog.referredByEarnings) === 0) {
                    // get refer and earn config
                    const referAndEarnConfigData = await GlobalBasicController.getReferAndEarnConfig(ownerId);
                    // check if minimum entry fees match 
                    if (entryFees >= convertToTwoDecimalInt(referAndEarnConfigData.minimumMatchFees)) {
                        // update refer by wallet 

                        if (referAndEarnConfigData.referRewardCoin === 'winCredit') {
                            await createTransaction.user.onlyWinCredit({ userId: checkReferralLog.referredById, transactionType: 'CREDIT', amount: referAndEarnConfigData.referRewardAmount, comment: `Referral Reward of ${userData.fullName}[${userId}] ` });
                        } else {
                            await createTransaction.user.onlyDepositCredit({ userId: checkReferralLog.referredById, transactionType: 'CREDIT', amount: referAndEarnConfigData.referRewardAmount, comment: `Referral Reward of ${userData.fullName}[${userId}]` });
                        }
                        // update refer log 

                        const updateReferralLog = await myPrisma.users_referrals_log.update({
                            where: {
                                sn: checkReferralLog.sn
                            },
                            data: {
                                referredByEarnings: referAndEarnConfigData.referRewardAmount
                            }
                        });
                        updateReferralLog;
                    }



                }
            }



            if (addJoining) {
                return res.json({
                    status: 'success',
                    msg: 'Joining completed'
                });
            }


        } catch (error) {
            console.log(error);
        }
    },

    getWebApkInitData: async (req, res) => {
        try {
            const { ownerId } = req.appData;
            const apkDetails = await myPrisma.web_apk_details.findFirst({
                where: {
                    ownerId
                }
            });
            return res.json({
                status: 'success',
                msg: 'request completed',
                oneSignalAppId: apkDetails.oneSignalAppId
            });
        } catch (error) {
            console.log(error);
        }
    },
    getReferAndEarnConfig: async (req, res) => {
        try {
            const { ownerId } = req.appData;
            const { userId } = req.payload;





            const referAndEarnConfigData = await GlobalBasicController.getReferAndEarnConfig(ownerId);

            const webApkList = await myPrisma.all_web_apks.findFirst({
                where: {
                    ownerId
                },
                orderBy: {
                    updatedAt: 'desc'
                }
            });





            res.json({
                status: 'success',
                msg: `request  completed successfully`,
                referAndEarnConfigData,
                referralCode: userId,
                webApkList


            });


        } catch (error) {
            console.error(error);
        }
    },
    getMyReferrals: async (req, res) => {
        try {
            // const { ownerId } = req.appData;
            const { userId } = req.payload;





            const getReferralLogData = await myPrisma.users_referrals_log.findMany({
                where: {
                    referredById: userId
                },
                take: 50
            });

            const myReferralsCount = getReferralLogData.length;

            let myReferralsEarning = 0;
            for (let i = 0; i < myReferralsCount; i++) {
                myReferralsEarning = myReferralsEarning + convertToTwoDecimalInt(getReferralLogData[i].referredByEarnings);
            }






            res.json({
                status: 'success',
                msg: `request  completed successfully`,
                myReferralsCount,
                myReferralsEarning,
                myReferralsData: getReferralLogData


            });


        } catch (error) {
            console.error(error);
        }
    },
    getCarousels: async (req, res) => {
        try {
            const { ownerId } = req.appData;
            const carouselData = await myPrisma.carousels.findMany({
                where: {
                    ownerId
                }
            });

            if (carouselData) {
                return res.json({
                    status: 'success',
                    msg: 'data fetched ',
                    carouselData



                });
            }
        } catch (error) {
            console.log(error);
        }
    },
    getAnnouncements: async (req, res) => {
        try {
            const { ownerId } = req.appData;
            const AnnouncementData = await myPrisma.announcements.findMany({
                where: {
                    ownerId
                }
            });

            if (AnnouncementData) {
                return res.json({
                    status: 'success',
                    msg: 'data fetched ',
                    AnnouncementData



                });
            }
        } catch (error) {
            console.log(error);
        }
    },
};

export default BasicController; 