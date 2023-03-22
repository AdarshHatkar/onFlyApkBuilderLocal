import * as OneSignal from '@onesignal/node-onesignal';
import { Prisma } from "@prisma/client";
import createTransaction from '../../globalControllers/transactionController.js';
import mtaConfig from '../../globalHelpers/mtaConfig.js';
import myPrisma from '../../globalHelpers/myPrisma.js';
import { convertToInt, convertToTwoDecimalInt, unixTimeStampInSeconds } from '../../globalHelpers/utility.js';
import { refreshUserDepositTransactionStatus } from '../../webApp/controllers/paytmController.js';
import { refreshOwnerDepositTransactionStatus } from './paytmController.js';



const BasicController = {


    basicDetails: async (req, res) => {
        try {
            let { ownerId } = req.payload;
            ownerId = +ownerId;

            const getBasicDetails = await myPrisma.all_owners.findFirst({
                where: {
                    ownerId: ownerId
                },
                include: {
                    web_app_details: true,
                    owners_plan_details: true,
                    all_web_apks: {
                        orderBy: {
                            createdAt: 'asc'
                        }
                    }
                }
            });

            let logoLink = '';
            if (getBasicDetails.all_web_apks.length > 0) {
                logoLink = getBasicDetails.all_web_apks[0].logoLink;
            }

            // success response
            return res.json({
                status: 'success',
                msg: 'request success',
                updatedAt: unixTimeStampInSeconds(),
                fullName: getBasicDetails.fullName,
                depositCredit: getBasicDetails.depositCredit,
                bonusCredit: getBasicDetails.bonusCredit,
                appName: getBasicDetails.web_app_details[0].name,
                appUsername: getBasicDetails.web_app_details[0].username,
                activePlan: getBasicDetails.owners_plan_details.activePlan.toLowerCase(),
                logoLink

            });
        } catch (error) {
            console.log(error);
        }
    },

    getDashboardData: async (req, res) => {
        try {
            let { ownerId } = req.payload;
            ownerId = +ownerId;

            const getDashboardData = await myPrisma.all_owners.findFirst({
                where: {
                    ownerId
                },
                select: {
                    depositCredit: true,
                    owners_plan_details: true,
                    _count: {
                        select: {
                            all_users: true,

                        }

                    }
                },

            });

            const redeemRequestsCount = await myPrisma.users_withdraw_log.count({
                where: {
                    ownerId,
                    status: 'PENDING'
                }
            });



            // success response
            return res.json({
                status: 'success',
                msg: 'request success',
                getDashboardData,
                redeemRequestsCount

            });
        } catch (error) {
            console.log(error);
        }
    },


    addSupportMethod: async (req, res) => {
        const { ownerId, activePlan } = req.payload;
        const { methodName, methodId, icon, onClickLink } = req.body;
        const supportDetailsCount = await myPrisma.app_support_details.count({
            where: {
                ownerId
            }
        });

        if (supportDetailsCount > 1) {

            if (activePlan !== 'starter' && activePlan !== 'premium') {
                return res.json({
                    status: 'error',
                    msg: 'Upgrade to starter plan to add more',



                });
            }


        }

        if (supportDetailsCount > 20) {
            return res.json({
                status: 'error',
                msg: 'Max limit reached',



            });
        }

        const insertMethod = await myPrisma.app_support_details.create({
            data: {
                ownerId,
                icon,
                methodId,
                methodName,
                onClickLink
            }
        });

        if (insertMethod) {
            return res.json({
                status: 'success',
                msg: 'Method added ',



            });
        }
    },

    deleteSupportMethod: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { sn } = req.params;

            const getSelectedSupportMethod = await myPrisma.app_support_details.findFirst({
                where: {
                    sn: +sn,
                    ownerId
                }
            });

            if (!getSelectedSupportMethod) {
                return res.json({
                    status: 'error',
                    msg: 'Method Not Found',



                });
            }


            const deleteMethod = await myPrisma.app_support_details.delete({
                where: {
                    sn: getSelectedSupportMethod.sn

                }
            });

            if (deleteMethod) {
                return res.json({
                    status: 'success',
                    msg: 'Method deleted ',



                });
            }

        } catch (error) {
            console.log(error);
        }
    },

    getSupportMethods: async (req, res) => {

        try {
            const { ownerId } = req.payload;

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




    addNewGame: async (req, res) => {
        try {
            const { ownerId, activePlan } = req.payload;
            const { name, shortName, bannerLink } = req.body;

            const gamesCount = await myPrisma.games.count({
                where: {
                    ownerId
                }
            });


            if (gamesCount > 1) {

                if (activePlan !== 'starter' && activePlan !== 'premium') {
                    return res.json({
                        status: 'error',
                        msg: 'Upgrade to starter plan to add more',



                    });
                }


            }

            if (gamesCount > 20) {
                return res.json({
                    status: 'error',
                    msg: 'Max limit reached',



                });
            }

            const insertGame = await myPrisma.games.create({
                data: {
                    ownerId,
                    name,
                    bannerLink,
                    shortName
                }
            });

            if (insertGame) {
                return res.json({
                    status: 'success',
                    msg: 'Game added ',
                });
            }
        } catch (error) {
            console.log(error);
        }
    },

    getGames: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const gamesData = await myPrisma.games.findMany({
                where: {
                    ownerId
                }
            });

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

    deleteGame: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { sn } = req.params;

            const getGamesData = await myPrisma.games.findFirst({
                where: {
                    sn: +sn,
                    ownerId
                }
            });

            if (!getGamesData) {
                return res.json({
                    status: 'error',
                    msg: 'Game Not Found',



                });
            }


            const deleteGame = await myPrisma.games.delete({
                where: {
                    sn: getGamesData.sn

                }
            });

            if (deleteGame) {
                return res.json({
                    status: 'success',
                    msg: 'Game deleted ',



                });
            }

        } catch (error) {
            console.log(error);
        }
    },



    addNewRulesCollection: async (req, res) => {
        try {
            const { ownerId, activePlan } = req.payload;
            const { name } = req.body;

            const rulesCollectionCount = await myPrisma.rules_collections.count({
                where: {
                    ownerId
                }
            });


            if (rulesCollectionCount > 1) {

                if (activePlan !== 'starter' && activePlan !== 'premium') {
                    return res.json({
                        status: 'error',
                        msg: 'Upgrade to starter plan to add more',



                    });
                }


            }

            if (rulesCollectionCount > 20) {
                return res.json({
                    status: 'error',
                    msg: 'Max limit reached',



                });
            }

            const insertRulesCollection = await myPrisma.rules_collections.create({
                data: {
                    ownerId,
                    name,
                }
            });

            if (insertRulesCollection) {
                return res.json({
                    status: 'success',
                    msg: 'rules_collections added ',
                });
            }
        } catch (error) {
            console.log(error);
        }
    },

    getRulesCollections: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const rulesCollectionsData = await myPrisma.rules_collections.findMany({
                where: {
                    ownerId
                }
            });

            if (rulesCollectionsData) {
                return res.json({
                    status: 'success',
                    msg: 'data fetched ',
                    rulesCollectionsData



                });
            }
        } catch (error) {
            console.log(error);
        }
    },

    deleteRulesCollections: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { sn } = req.params;

            const getRulesCollectionData = await myPrisma.rules_collections.findFirst({
                where: {
                    sn: +sn,
                    ownerId
                }
            });

            if (!getRulesCollectionData) {
                return res.json({
                    status: 'error',
                    msg: 'rules_collections Not Found',



                });
            }


            const deleteRulesCollection = await myPrisma.rules_collections.delete({
                where: {
                    sn: getRulesCollectionData.sn

                }
            });

            if (deleteRulesCollection) {
                return res.json({
                    status: 'success',
                    msg: 'rules_collections deleted ',



                });
            }

        } catch (error) {
            console.log(error);
        }
    },




    addNewRule: async (req, res) => {
        try {
            const { ownerId, activePlan } = req.payload;
            const { text } = req.body;
            const { collectionId } = req.params;

            const rulesCount = await myPrisma.rules.count({
                where: {
                    ownerId,
                    collectionId: +collectionId,
                }
            });


            if (rulesCount > 10) {

                if (activePlan !== 'starter' && activePlan !== 'premium') {
                    return res.json({
                        status: 'error',
                        msg: 'Upgrade to starter plan to add more',



                    });
                }


            }

            if (rulesCount > 50) {
                return res.json({
                    status: 'error',
                    msg: 'Max limit reached',



                });
            }

            const insertRules = await myPrisma.rules.create({
                data: {
                    ownerId,
                    text,
                    collectionId: +collectionId,
                }
            });

            if (insertRules) {
                return res.json({
                    status: 'success',
                    msg: 'rules added ',
                });
            }
        } catch (error) {
            console.log(error);
        }
    },

    getRules: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { collectionId } = req.params;
            const rulesData = await myPrisma.rules.findMany({
                where: {
                    ownerId,
                    collectionId: +collectionId,
                }
            });

            if (rulesData) {
                return res.json({
                    status: 'success',
                    msg: 'data fetched ',
                    rulesData



                });
            }
        } catch (error) {
            console.log(error);
        }
    },

    deleteRule: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { sn, collectionId } = req.params;

            const getRulesData = await myPrisma.rules.findFirst({
                where: {
                    sn: +sn,
                    collectionId: +collectionId,
                    ownerId
                }
            });

            if (!getRulesData) {
                return res.json({
                    status: 'error',
                    msg: 'rules Not Found',



                });
            }


            const deleteRulesCollection = await myPrisma.rules.delete({
                where: {
                    sn: getRulesData.sn

                }
            });

            if (deleteRulesCollection) {
                return res.json({
                    status: 'success',
                    msg: 'rules deleted ',



                });
            }

        } catch (error) {
            console.log(error);
        }
    },


    submitMatch: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { action, sn } = req.params;
            const { title,
                bannerLink,
                youtubeLink,
                gameId,
                rulesCollectionId,
                prizePool,
                perKill,
                entryFees,
                playersInTeam,
                mode,
                map,
                maxJoining,
                prizeDescription,
                time } = req.body;

            if (action === 'add') {
                const matchesCount = await myPrisma.matches.count({
                    where: {
                        ownerId
                    }
                });

                if (matchesCount > 10000) {
                    return res.json({
                        status: 'error',
                        msg: 'Max limit reached',



                    });
                }


                const insertMatch = await myPrisma.matches.create({
                    data: {
                        ownerId,
                        title,
                        bannerLink,
                        gameId,
                        rulesCollectionId,
                        prizePool,
                        perKill,
                        entryFees,
                        playersInTeam,
                        mode,
                        map,
                        maxJoining,
                        prizeDescription,
                        time,
                        resultNote: '',
                        status: 'upcoming',
                        youtubeLink


                    }
                });


                if (!insertMatch) {

                    return res.json({
                        status: 'error',
                        msg: 'insertMatch',
                    });
                }

                const insertCustomRoomDetails = await myPrisma.custom_room_details.create({
                    data: {
                        roomId: 'Coming Soon',
                        roomPassword: 'Coming Soon',
                        ownerId,
                        matchId: insertMatch.sn
                    }
                });

                if (insertCustomRoomDetails) {
                    return res.json({
                        status: 'success',
                        msg: 'match added ',
                    });
                }
            } else if (action === 'update') {
                const matchesCount = await myPrisma.matches.count({
                    where: {
                        ownerId,
                        sn: +sn
                    }
                });

                if (!matchesCount) {
                    return res.json({
                        status: 'error',
                        msg: 'match not found ',



                    });
                }
                const updateMatch = await myPrisma.matches.update({
                    where: {

                        sn: +sn
                    },
                    data: {

                        title,
                        bannerLink,
                        gameId,
                        rulesCollectionId,
                        prizePool,
                        perKill,
                        entryFees,
                        playersInTeam,
                        mode,
                        map,
                        maxJoining,
                        prizeDescription,
                        time,
                        youtubeLink


                    }
                });

                if (updateMatch) {
                    return res.json({
                        status: 'success',
                        msg: 'Match Updated ',
                    });
                }


            }



        } catch (error) {
            console.log(error);
        }
    },

    getMatchesDataTable: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { get } = req.params;
            const draw = req.query.draw;

            const skip = convertToInt(req.query.start);

            const take = convertToInt(req.query.length);

            const order_data = req.query.order;

            let orderByColumnName = '';
            let orderBySortOrder = '';

            if (typeof order_data == 'undefined') {
                orderByColumnName = 'time';

                orderBySortOrder = '';
            }
            else {
                const column_index = req.query.order[0]['column'];

                orderByColumnName = req.query.columns[column_index]['data'];

                orderBySortOrder = req.query.order[0]['dir'];
            }

            //search data

            let search_value = req.query.search['value'];
            search_value = search_value.trim();

            let onlyNumberSearchValue = +`${search_value}`;
            if (isNaN(onlyNumberSearchValue)) {
                onlyNumberSearchValue = -1;
            }

            if (orderBySortOrder === '') {
                orderBySortOrder = 'desc';
                (get === 'upcoming' || get === 'ongoing') ? orderBySortOrder = 'asc' : true;
            }
            const orderBy = {
                [orderByColumnName]: orderBySortOrder,
            };

            let matchesData, totalRecords, totalRecordsWithFilter;
            if (get !== 'all') {





                totalRecords = await myPrisma.matches.count({
                    where: {
                        ownerId,
                        status: get
                    }
                });

                totalRecordsWithFilter = await myPrisma.matches.count({
                    where: {
                        ownerId,
                        status: get,
                        OR: [
                            {
                                sn: {
                                    equals: onlyNumberSearchValue
                                }
                            },
                            {
                                title: {
                                    contains: search_value
                                }
                            },
                            {
                                map: {
                                    contains: search_value
                                }
                            },
                            {
                                prizePool: {
                                    equals: onlyNumberSearchValue
                                }
                            }
                        ]
                    }
                });

                matchesData = await myPrisma.matches.findMany({
                    where: {
                        ownerId,
                        status: get,
                        OR: [
                            {
                                sn: {
                                    equals: onlyNumberSearchValue
                                }
                            },
                            {
                                title: {
                                    contains: search_value
                                }
                            },
                            {
                                map: {
                                    contains: search_value
                                }
                            },
                            {
                                prizePool: {
                                    equals: onlyNumberSearchValue
                                }
                            }
                        ]
                    },
                    include: {
                        games: {
                            select: {
                                shortName: true
                            }
                        },
                        custom_room_details: {
                            select: {
                                roomId: true,
                                roomPassword: true,
                                updatedAt: true
                            }
                        }

                    },
                    skip,
                    take,
                    orderBy
                });

            } else {
                totalRecords = await myPrisma.matches.count({
                    where: {
                        ownerId,

                    }
                });
                totalRecordsWithFilter = await myPrisma.matches.count({
                    where: {
                        ownerId,
                        OR: [
                            {
                                sn: {
                                    equals: onlyNumberSearchValue
                                }
                            },
                            {
                                title: {
                                    contains: search_value
                                }
                            },
                            {
                                map: {
                                    contains: search_value
                                }
                            },
                            {
                                prizePool: {
                                    equals: onlyNumberSearchValue
                                }
                            }
                        ]

                    }
                });

                matchesData = await myPrisma.matches.findMany({
                    where: {
                        ownerId,
                        OR: [
                            {
                                sn: {
                                    equals: onlyNumberSearchValue
                                }
                            },
                            {
                                title: {
                                    contains: search_value
                                }
                            },
                            {
                                map: {
                                    contains: search_value
                                }
                            },
                            {
                                prizePool: {
                                    equals: onlyNumberSearchValue
                                }
                            }
                        ]
                    },
                    include: {
                        games: {
                            select: {
                                shortName: true
                            }
                        },
                        custom_room_details: {
                            select: {
                                roomId: true,
                                roomPassword: true,
                                updatedAt: true
                            }
                        }

                    },
                    skip,
                    take,
                    orderBy
                });
            }


            const output = {
                'draw': draw,
                'iTotalRecords': totalRecords,
                'iTotalDisplayRecords': totalRecordsWithFilter,
                'aaData': matchesData
            };

            return res.json(output);
        } catch (error) {
            console.log(error);
        }
    },
    deleteMatch: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { sn } = req.params;

            const getMatchData = await myPrisma.matches.findFirst({
                where: {
                    sn: +sn,
                    ownerId,
                    OR: [
                        {
                            status: 'resulted',
                        },
                        {
                            status: 'cancelled',
                        },
                    ],
                }
            });

            if (!getMatchData) {
                return res.json({
                    status: 'error',
                    msg: 'getMatchData Not Found',



                });
            }


            const deleteMatch = await myPrisma.matches.delete({
                where: {
                    sn: getMatchData.sn

                }
            });

            if (deleteMatch) {
                return res.json({
                    status: 'success',
                    msg: 'getMatchData deleted ',



                });
            }

        } catch (error) {
            console.log(error);
        }
    },
    getMatchDetails: async (req, res) => {

        try {
            const { ownerId } = req.payload;
            const { sn } = req.params;


            // console.log(userId);

            const matchDetailsData = await myPrisma.matches.findFirst({
                where: {
                    ownerId,

                    sn: +sn

                }
            });

            if (!matchDetailsData) {
                return res.json({
                    status: 'error',
                    msg: 'Match not found'
                });
            }




            if (matchDetailsData) {
                return res.json({
                    status: 'success',
                    msg: 'data fetched ',
                    matchDetailsData
                });
            }
        } catch (error) {
            console.log(error);
        }
    },

    updateRoomIdAndPass: async (req, res) => {
        const { ownerId } = req.payload;
        const { matchId,
            roomId,
            roomPassword } = req.body;


        const roomDetailsData = await myPrisma.custom_room_details.findFirst({
            where: {
                ownerId,
                matchId: +matchId
            }


        });

        if (!roomDetailsData) {
            return res.json({
                status: 'error',
                msg: 'Room details not found',
            });
        }

        const updateRoomIdAndPass = await myPrisma.custom_room_details.update({
            data: {
                roomId,
                roomPassword,
                updatedAt: unixTimeStampInSeconds()
            },
            where: {

                matchId: +matchId
            }

        });

        if (updateRoomIdAndPass) {
            return res.json({
                status: 'success',
                msg: 'RoomIdAndPass updated',
            });
        }


    },

    updateMatchStatus: async (req, res) => {
        const { ownerId } = req.payload;
        const {
            sn,
            status,


        } = req.body;


        const matchData = await myPrisma.matches.findFirst({
            where: {
                ownerId,
                sn: +sn,
                OR: [
                    {
                        status: 'upcoming',
                    },
                    {
                        status: 'ongoing',
                    },
                ],
            }


        });

        if (!matchData) {
            return res.json({
                status: 'error',
                msg: 'match already resulted/cancelled',
            });
        }

        const updateMatchStatus = await myPrisma.matches.update({
            data: {
                status
            },
            where: {

                sn: +sn
            }

        });

        if (updateMatchStatus) {
            return res.json({
                status: 'success',
                msg: 'MatchStatus updated',
            });
        }


    },

    getResultData: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { matchId } = req.params;

            const getResultData = await myPrisma.matches.findFirst({
                where: {
                    ownerId,

                    sn: +matchId

                },
                include: {

                    matches_joinings: {},

                }
            });

            if (getResultData) {
                return res.json({
                    status: 'success',
                    msg: 'data fetched ',
                    getResultData



                });
            }
        } catch (error) {
            console.log(error);
        }


    },

    editResultData: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const {
                sn,
                matchId,
                kills,
                isWinner,
                winnerPrize,


            } = req.body;

            const getMatchData = await myPrisma.matches.findFirst({
                where: {
                    ownerId,

                    sn: +matchId,
                    OR: [
                        {
                            status: 'upcoming',
                        },
                        {
                            status: 'ongoing',
                        },
                    ],

                }
            });
            if (!getMatchData) {
                return res.json({
                    status: 'error',
                    msg: 'match already resulted/cancelled '



                });
            }
            const totalWinning = (kills * convertToInt(getMatchData.perKill)) + (convertToInt(winnerPrize));

            const updateResultData = await myPrisma.matches_joinings.update({
                where: {
                    sn: +sn,

                },
                data: {
                    kills,
                    isWinner,
                    winnerPrize,
                    totalWinning
                }
            });

            if (updateResultData) {
                return res.json({
                    status: 'success',
                    msg: 'Result data updated '



                });
            }
        } catch (error) {
            console.log(error);
        }


    },

    publishResult: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { matchId } = req.params;
            const getMatchData = await myPrisma.matches.findFirst({
                where: {
                    ownerId,

                    sn: +matchId,
                    OR: [
                        {
                            status: 'upcoming',
                        },
                        {
                            status: 'ongoing',
                        },
                    ],

                },
                include: {

                    matches_joinings: {},

                }
            });

            if (!getMatchData) {
                return res.json({
                    status: 'error',
                    msg: 'match already resulted/cancelled '



                });
            }

            if (getMatchData.matches_joinings.length > 0) {
                let i = 0;
                while (getMatchData.matches_joinings.length > i) {
                    const { sn, joinedBy, isUserWalletUpdated, totalWinning, inGameName, inGameId, matchId } = getMatchData.matches_joinings[i];
                    i++;
                    if (isUserWalletUpdated) {
                        continue;

                    }

                    if (totalWinning <= new Prisma.Decimal(0)) {
                        continue;
                    }

                    const createUserWinCreditTransactionData = await createTransaction.user.onlyWinCredit({ userId: joinedBy, transactionType: 'CREDIT', amount: totalWinning, comment: `Earning of ::${inGameName}(${inGameId}) From matchId:${matchId}` });
                    if (createUserWinCreditTransactionData.status === 'error') {

                        return res.json(createUserWinCreditTransactionData);

                    }

                    const updateWalletUpdateStatus = await myPrisma.matches_joinings.update({
                        where: {
                            sn
                        },
                        data: {
                            isUserWalletUpdated: true
                        }
                    });
                    updateWalletUpdateStatus;

                }

            }

            const nonUpdatedJoiningDetails = await myPrisma.matches_joinings.findMany({
                where: {
                    matchId: +matchId,
                    ownerId,
                    isUserWalletUpdated: false,
                    totalWinning: {
                        gt: 0,
                    }
                }
            });
            let updateMatchStatus = undefined;
            if (nonUpdatedJoiningDetails.length === 0) {
                updateMatchStatus = await myPrisma.matches.update({
                    where: {
                        sn: +matchId
                    },
                    data: {
                        status: 'resulted'
                    }
                });
            }


            if (updateMatchStatus) {
                return res.json({
                    status: 'success',
                    msg: 'Result Published '



                });
            } else {
                return res.json({
                    status: 'error',
                    msg: 'Some thing error in result '



                });
            }

        } catch (error) {
            console.log(error);
        }
    },
    cancelMatch: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { matchId } = req.params;
            const getMatchData = await myPrisma.matches.findFirst({
                where: {
                    ownerId,

                    sn: +matchId,
                    OR: [
                        {
                            status: 'upcoming',
                        },
                        {
                            status: 'ongoing',
                        },
                    ],

                },
                include: {

                    matches_joinings: {},

                }
            });

            if (!getMatchData) {
                return res.json({
                    status: 'error',
                    msg: 'match already resulted/cancelled '



                });
            }

            const { entryFees } = getMatchData;

            if (getMatchData.matches_joinings.length > 0) {
                let i = 0;
                while (getMatchData.matches_joinings.length > i) {
                    const { sn, joinedBy, isUserWalletUpdated, inGameName, inGameId, matchId } = getMatchData.matches_joinings[i];
                    i++;
                    if (isUserWalletUpdated) {
                        continue;

                    }


                    if (entryFees > new Prisma.Decimal(0)) {
                        const createUserWinCreditTransactionData = await createTransaction.user.onlyDepositCredit({ userId: joinedBy, transactionType: 'CREDIT', amount: entryFees, comment: `Refund of ::${inGameName}(${inGameId}) From matchId:${matchId}` });
                        if (createUserWinCreditTransactionData.status === 'error') {

                            return res.json(createUserWinCreditTransactionData);

                        }
                    }


                    const updateWalletUpdateStatus = await myPrisma.matches_joinings.update({
                        where: {
                            sn
                        },
                        data: {
                            isUserWalletUpdated: true
                        }
                    });
                    updateWalletUpdateStatus;

                }

            }

            const nonUpdatedJoiningDetails = await myPrisma.matches_joinings.findMany({
                where: {
                    matchId: +matchId,
                    ownerId,
                    isUserWalletUpdated: false
                }
            });
            let updateMatchStatus = undefined;
            if (nonUpdatedJoiningDetails.length === 0) {
                updateMatchStatus = await myPrisma.matches.update({
                    where: {
                        sn: +matchId
                    },
                    data: {
                        status: 'cancelled'
                    }
                });
            }


            if (updateMatchStatus) {
                return res.json({
                    status: 'success',
                    msg: 'match  cancelled '



                });
            } else {
                return res.json({
                    status: 'error',
                    msg: 'Some thing error in match  cancelled '



                });
            }

        } catch (error) {
            console.log(error);
        }
    },

    getAdminDepositLogs: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { skip, take } = req.params;

            const adminDepositLogsData = await myPrisma.owners_deposit_log.findMany({
                where: {
                    ownerId
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip: +skip,
                take: +take,
            });

            if (adminDepositLogsData) {
                return res.json({
                    status: 'success',
                    msg: 'Data fetched',
                    adminDepositLogsData



                });
            }
        } catch (error) {
            console.log(error);
        }
    },

    refreshAdminDepositLog: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { orderId } = req.params;

            const resData = await refreshOwnerDepositTransactionStatus(ownerId, +orderId);
            if (resData) {
                return res.json(resData);
            }
        } catch (error) {
            console.log(error);
        }
    },

    getUsersDepositLogs: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { skip, take } = req.params;

            const usersDepositLogsData = await myPrisma.users_deposit_log.findMany({
                where: {
                    ownerId
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip: +skip,
                take: +take,
            });

            if (usersDepositLogsData) {
                return res.json({
                    status: 'success',
                    msg: 'Data fetched',
                    usersDepositLogsData



                });
            }
        } catch (error) {
            console.log(error);
        }
    },
    refreshUserDepositLog: async (req, res) => {
        try {

            const { orderId, userId } = req.params;

            const resData = await refreshUserDepositTransactionStatus(+userId, +orderId);
            if (resData) {
                return res.json(resData);
            }
        } catch (error) {
            console.log(error);
        }
    },

    getWebApkDetails: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const webApkDetails = await myPrisma.web_apk_details.findFirst({
                where: {
                    ownerId
                }
            });

            if (webApkDetails) {
                return res.json({
                    status: 'success',
                    msg: 'data fetched ',
                    webApkDetails



                });
            }
        } catch (error) {
            console.log(error);
        }
    },
    updateWebApkDetails: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { googleServiceJson, oneSignalAppId, oneSignalApiKey, } = req.body;
            const updateWebApkDetails = await myPrisma.web_apk_details.update({
                where: {
                    ownerId
                },
                data: {
                    googleServiceJson,
                    oneSignalApiKey,
                    oneSignalAppId
                }
            });

            if (updateWebApkDetails) {
                return res.json({
                    status: 'success',
                    msg: 'data Updated'



                });
            }
        } catch (error) {
            console.log(error);
        }
    },
    getWebApkList: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const webApkList = await myPrisma.all_web_apks.findMany({
                where: {
                    ownerId
                },
                orderBy: {
                    createdAt: 'desc'
                },

                take: 10
            });

            if (webApkList) {
                return res.json({
                    status: 'success',
                    msg: 'data fetched ',
                    webApkList,
                    mtaConfig



                });
            }
        } catch (error) {
            console.log(error);
        }
    },

    placeWebApkOrder: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { logoLink, orderType } = req.body;

            const version = mtaConfig.latestWebApkVersionCode;

            let amount;

            let webApkOrderPrice = mtaConfig.webApkOrderPrice;
            // check apk list count

            const apkListCount = await myPrisma.all_web_apks.count({
                where: {
                    ownerId
                }
            });

            // added apk price 1 rs for first order
            if (apkListCount === 0) {
                webApkOrderPrice = 1;
            } else {
                webApkOrderPrice = mtaConfig.webApkOrderPrice;
            }

            if (orderType === 'apk') {
                amount = webApkOrderPrice;
            } else if (orderType === 'apkAndAab') {
                amount = webApkOrderPrice + mtaConfig.webAabOrderPrice;
            }

            const WebApkDetails = await myPrisma.web_apk_details.findFirst({
                where: {
                    ownerId
                }

            });

            if (WebApkDetails.googleServiceJson === '') {
                return res.json({
                    status: 'googleServiceJsonNotFound',
                    msg: 'googleServiceJson not found'
                });
            }


            const createOwnerDepositCreditTransactionData = await createTransaction.owner.bonusThenDepositCredit({ ownerId, transactionType: 'DEBIT', amount, comment: `Ordered ${orderType} Version[${version}]` });

            if (createOwnerDepositCreditTransactionData.status === 'error') {
                return res.json(createOwnerDepositCreditTransactionData);
            }
            if (createOwnerDepositCreditTransactionData.status !== 'success') {
                return res.json({
                    status: 'error',
                    msg: 'unknown Status'
                });
            }

            const placeWebApkOrder = await myPrisma.all_web_apks.create({
                data: {
                    ownerId,
                    aabLink: '',
                    apkLink: '',
                    createdAt: unixTimeStampInSeconds(),
                    customApkLink: '',
                    logoLink,
                    orderType,
                    status: 'pending',
                    updatedAt: null,
                    version,

                }
            });

            if (placeWebApkOrder) {
                return res.json({
                    status: 'success',
                    msg: 'Order Placed'



                });
            }
        } catch (error) {
            console.log(error);
        }
    },

    pushWebApkNotification: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { message } = req.body;

            const webApkDetailsData = await myPrisma.web_apk_details.findFirst({
                where: {
                    ownerId
                }
            });
            const app_key_provider = {
                getToken() {
                    return webApkDetailsData.oneSignalApiKey;
                }
            };



            const configuration = OneSignal.createConfiguration({
                authMethods: {
                    app_key: {
                        tokenProvider: app_key_provider
                    }
                }
            });
            const client = new OneSignal.DefaultApi(configuration);


            const notification = new OneSignal.Notification();
            notification.app_id = webApkDetailsData.oneSignalAppId;
            notification.included_segments = ['All'];
            notification.contents = {
                en: message
            };

            const sendNotification = await client.createNotification(notification);
            // console.log(sendNotification);
            return res.json({
                status: 'success',
                msg: 'Notification Sended ',
                sendNotification



            });
        } catch (error) {
            console.log(error);


            return res.json({
                status: 'error',
                msg: 'Invalid OneSignal Configs'



            });
        }
    },
    getReferAndEarnConfig: async (req, res) => {
        try {
            const { ownerId } = req.payload;




            const getReferAndEarnConfigData = await myPrisma.refer_and_earn_configs.findFirst({
                where: {
                    ownerId: ownerId
                }
            });

            let referAndEarnConfigData;

            if (!getReferAndEarnConfigData) {
                referAndEarnConfigData = mtaConfig.defaultReferAndEarnConfig;
            } else {
                referAndEarnConfigData = getReferAndEarnConfigData;
            }






            res.json({
                status: 'success',
                msg: `request  completed successfully`,
                referAndEarnConfigData


            });


        } catch (error) {
            console.error(error);
        }
    }
    ,
    updateReferAndEarnConfig: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { referRewardCoin, referRewardAmount, registerRewardCoin, registerRewardAmount, minimumMatchFees } = req.body;





            const getReferAndEarnConfigData = await myPrisma.refer_and_earn_configs.findFirst({
                where: {
                    ownerId: ownerId
                }
            });

            let updateReferAndEarnConfig;

            if (!getReferAndEarnConfigData) {
                // insert data 

                updateReferAndEarnConfig = await myPrisma.refer_and_earn_configs.create({
                    data: {
                        ownerId,
                        minimumMatchFees,
                        referRewardAmount,
                        referRewardCoin,
                        registerRewardAmount,
                        registerRewardCoin,
                    }
                });
            } else {
                // update data 
                updateReferAndEarnConfig = await myPrisma.refer_and_earn_configs.update({
                    where: {
                        ownerId
                    },
                    data: {

                        minimumMatchFees,
                        referRewardAmount,
                        referRewardCoin,
                        registerRewardAmount,
                        registerRewardCoin,
                    }


                });
            }



            if (updateReferAndEarnConfig) {
                res.json({
                    status: 'success',
                    msg: `request  completed successfully`,



                });
            }





        } catch (error) {
            console.error(error);
        }
    },
    addNewCarousel: async (req, res) => {
        try {
            const { ownerId, activePlan } = req.payload;
            const { bannerLink, onClickLink } = req.body;

            const carouselCount = await myPrisma.carousels.count({
                where: {
                    ownerId
                }
            });


            if (carouselCount > 1) {

                if (activePlan !== 'starter' && activePlan !== 'premium') {
                    return res.json({
                        status: 'error',
                        msg: 'Upgrade to starter plan to add more',



                    });
                }


            }

            if (carouselCount > 20) {
                return res.json({
                    status: 'error',
                    msg: 'Max limit reached',



                });
            }

            const insertCarousel = await myPrisma.carousels.create({
                data: {
                    ownerId,

                    bannerLink,
                    onClickLink
                }
            });

            if (insertCarousel) {
                return res.json({
                    status: 'success',
                    msg: 'Carousel  added ',
                });
            }
        } catch (error) {
            console.log(error);
        }
    },
    getCarousels: async (req, res) => {
        try {
            const { ownerId } = req.payload;
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
    deleteCarousel: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { sn } = req.params;

            const carouselData = await myPrisma.carousels.findFirst({
                where: {
                    sn: +sn,
                    ownerId
                }
            });

            if (!carouselData) {
                return res.json({
                    status: 'error',
                    msg: 'Carousel Not Found',



                });
            }


            const deleteCarousel = await myPrisma.carousels.delete({
                where: {
                    sn: carouselData.sn

                }
            });

            if (deleteCarousel) {
                return res.json({
                    status: 'success',
                    msg: 'Carousel deleted ',



                });
            }

        } catch (error) {
            console.log(error);
        }
    },
    addNewAnnouncement: async (req, res) => {
        try {
            const { ownerId, activePlan } = req.payload;
            const { message, onClickLink } = req.body;

            const announcementsCount = await myPrisma.announcements.count({
                where: {
                    ownerId
                }
            });



            if (announcementsCount > 1) {

                if (activePlan !== 'starter' && activePlan !== 'premium') {
                    return res.json({
                        status: 'error',
                        msg: 'Upgrade to starter plan to add more',



                    });
                }


            }

            if (announcementsCount > 20) {
                return res.json({
                    status: 'error',
                    msg: 'Max limit reached',



                });
            }

            const insertAnnouncement = await myPrisma.announcements.create({
                data: {
                    ownerId,

                    message,
                    onClickLink
                }
            });

            if (insertAnnouncement) {
                return res.json({
                    status: 'success',
                    msg: 'Announcement  added ',
                });
            }
        } catch (error) {
            console.log(error);
        }
    },
    getAnnouncements: async (req, res) => {
        try {
            const { ownerId } = req.payload;
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
    deleteAnnouncement: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { sn } = req.params;

            const announcementsData = await myPrisma.announcements.findFirst({
                where: {
                    sn: +sn,
                    ownerId
                }
            });

            if (!announcementsData) {
                return res.json({
                    status: 'error',
                    msg: 'Announcement Not Found',



                });
            }


            const deleteAnnouncement = await myPrisma.announcements.delete({
                where: {
                    sn: announcementsData.sn

                }
            });

            if (deleteAnnouncement) {
                return res.json({
                    status: 'success',
                    msg: 'Announcement deleted ',



                });
            }

        } catch (error) {
            console.log(error);
        }
    },
    getWalletConfig: async (req, res) => {
        try {
            const { ownerId } = req.payload;




            const getWalletConfigData = await myPrisma.wallet_configs.findFirst({
                where: {
                    ownerId: ownerId
                }
            });

            let walletConfigData;

            if (!getWalletConfigData) {
                walletConfigData = mtaConfig.defaultWalletConfigs;
            } else {
                walletConfigData = getWalletConfigData;
            }






            res.json({
                status: 'success',
                msg: `request  completed successfully`,
                walletConfigData


            });


        } catch (error) {
            console.error(error);
        }
    }
    ,
    updateWalletConfig: async (req, res) => {
        try {
            const { ownerId, activePlan } = req.payload;
            let { minimumDeposit, maximumDeposit, minimumWithdrawal, maximumWithdrawal, withdrawalChargeInPercentage, paytmMerchantId, paytmMerchantKey } = req.body;
            const { activePaymentGateway } = req.body;

            minimumDeposit = convertToTwoDecimalInt(minimumDeposit);
            maximumDeposit = convertToTwoDecimalInt(maximumDeposit);
            minimumWithdrawal = convertToTwoDecimalInt(minimumWithdrawal);
            maximumWithdrawal = convertToTwoDecimalInt(maximumWithdrawal);
            withdrawalChargeInPercentage = convertToTwoDecimalInt(withdrawalChargeInPercentage);

            if (activePaymentGateway === 'paytmCustom') {

                // check owner plan 
                // making paytm custom for free plan
                // if (activePlan !== 'starter' && activePlan !== 'premium') {
                //     res.json({
                //         status: 'error',
                //         msg: `This Feature Needs Starter or Premium Plan`,



                //     });
                // }

            } else {
                paytmMerchantId = '',
                    paytmMerchantKey = '';
            }



            const getWalletConfigData = await myPrisma.wallet_configs.findFirst({
                where: {
                    ownerId: ownerId
                }
            });

            let updateWalletConfig;

            if (!getWalletConfigData) {
                // insert data 

                updateWalletConfig = await myPrisma.wallet_configs.create({
                    data: {
                        ownerId,
                        minimumDeposit,
                        maximumDeposit,
                        minimumWithdrawal,
                        maximumWithdrawal,
                        withdrawalChargeInPercentage,
                        activePaymentGateway,
                        paytmMerchantId,
                        paytmMerchantKey

                    }
                });
            } else {
                // update data 
                updateWalletConfig = await myPrisma.wallet_configs.update({
                    where: {
                        ownerId
                    },
                    data: {

                        minimumDeposit,
                        maximumDeposit,
                        minimumWithdrawal,
                        maximumWithdrawal,
                        withdrawalChargeInPercentage,
                        activePaymentGateway,
                        paytmMerchantId,
                        paytmMerchantKey
                    }


                });
            }



            if (updateWalletConfig) {
                res.json({
                    status: 'success',
                    msg: `request  completed successfully`,



                });
            }





        } catch (error) {
            console.error(error);
        }
    },
    getActivePlanDetails: async (req, res) => {
        try {
            const { ownerId } = req.payload;




            const getActivePlanData = await myPrisma.owners_plan_details.findFirst({
                where: {
                    ownerId: ownerId
                }
            });







            res.json({
                status: 'success',
                msg: `request  completed successfully`,
                activePlanData: getActivePlanData


            });


        } catch (error) {
            console.error(error);
        }
    },
    purchasePlan: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            let { months } = req.body;
            const { plan } = req.body;

            // check if owner have already active plan or not 

            const getActivePlanData = await myPrisma.owners_plan_details.findFirst({
                where: {
                    ownerId: ownerId
                }
            });
            if (getActivePlanData.activePlan === 'starter' || getActivePlanData.activePlan === 'premium') {

                if (getActivePlanData.validTill > unixTimeStampInSeconds()) {
                    res.json({
                        status: 'error',
                        msg: `you already have an active plan `,



                    });
                }

            }

            // calculate the plan price
            let basePrice, discountPercent;
            months = convertToInt(months);
            if (plan === 'starter') {
                basePrice = 100;
            } else if (plan === 'premium') {
                basePrice = 300;
            }

            if (months === 1) {
                discountPercent = 0;
            } else if (months === 3) {
                discountPercent = 10;
            } else if (months === 6) {
                discountPercent = 20;
            } else if (months === 12) {
                discountPercent = 30;
            }
            const totalAmount = basePrice * months;

            const discountAmount = (discountPercent / 100) * totalAmount;

            const finalAmount = totalAmount - discountAmount;


            // create transaction 
            const createOwnerBonusThenDepositCreditTransactionData = await createTransaction.owner.bonusThenDepositCredit({ ownerId, transactionType: 'DEBIT', amount: finalAmount, comment: `${plan} plan purchased for ${months} months` });

            if (createOwnerBonusThenDepositCreditTransactionData.status === 'error') {
                return res.json(createOwnerBonusThenDepositCreditTransactionData);
            }
            if (createOwnerBonusThenDepositCreditTransactionData.status !== 'success') {
                return res.json({
                    status: 'error',
                    msg: 'unknown Status'
                });
            }

            // update plan details 

            const updateActivePlanData = await myPrisma.owners_plan_details.update({
                where: {
                    sn: getActivePlanData.sn
                },
                data: {
                    activePlan: plan,
                    purchasePrice: finalAmount,
                    startedAt: unixTimeStampInSeconds(),
                    validTill: unixTimeStampInSeconds() + (months * 60 * 60 * 24 * 30)

                }
            });

            // adding referral reward

            const owners_referrals_log = await myPrisma.owners_referrals_log.findFirst({
                where: {
                    ownerId
                },
                include: {
                    all_owners: {
                        include: {
                            web_app_details: true
                        }
                    }
                }
            });

            if (owners_referrals_log) {
                const referredById = owners_referrals_log.referredById;

                let referredByReward = 10;

                const getReferredByActivePlanData = await myPrisma.owners_plan_details.findFirst({
                    where: {
                        ownerId: referredById
                    }
                });


                if (getReferredByActivePlanData.activePlan === 'starter') {
                    referredByReward = 50;
                }
                if (getReferredByActivePlanData.activePlan === 'premium') {
                    referredByReward = 100;
                }

                let referredByEarnings = convertToTwoDecimalInt(owners_referrals_log.referredByEarnings) + convertToTwoDecimalInt(referredByReward)
                // update referral log 
                const updateReferralLog = await myPrisma.owners_referrals_log.update({
                    where: {
                        sn: owners_referrals_log.sn
                    },
                    data: {
                        referredByEarnings
                    }
                });

                if (updateReferralLog) {
                    // credit reward to referred by wallet
                    const createReferredByDepositCreditTransactionData = await createTransaction.owner.onlyDepositCredit({ ownerId: referredById, transactionType: 'CREDIT', amount: referredByReward, comment: `Referral reward of ${owners_referrals_log.all_owners.web_app_details[0].name}` });

                    if (createReferredByDepositCreditTransactionData.status === 'error') {
                        return res.json(createReferredByDepositCreditTransactionData);
                    }
                    if (createReferredByDepositCreditTransactionData.status !== 'success') {
                        return res.json({
                            status: 'error',
                            msg: 'unknown Status'
                        });
                    }
                }
            }

            if (updateActivePlanData) {
                res.json({
                    status: 'success',
                    msg: `request  completed successfully`,



                });
            }





        } catch (error) {
            console.error(error);
        }
    },
    getMyReferralsList: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const myReferralsList = await myPrisma.owners_referrals_log.findMany({
                where: {
                    referredById: ownerId
                },

                include: {
                    all_owners: {
                        include: {
                            web_app_details: true
                        }
                    }
                }
            });

            if (myReferralsList) {
                return res.json({
                    status: 'success',
                    msg: 'data fetched ',
                    myReferralsList



                });
            }
        } catch (error) {
            console.log(error);
        }
    },
    addNewWithdrawalMethod: async (req, res) => {
        try {
            const { ownerId, activePlan } = req.payload;
            const { name, title, idExample } = req.body;

            const withdrawalMethodsCount = await myPrisma.withdrawal_methods.count({
                where: {
                    ownerId
                }
            });
            if (withdrawalMethodsCount) {
                if (withdrawalMethodsCount > 1) {

                    if (activePlan !== 'starter' && activePlan !== 'premium') {
                        return res.json({
                            status: 'error',
                            msg: 'Upgrade to starter plan to add more',



                        });
                    }


                }
                if (withdrawalMethodsCount > 20) {

                    return res.json({
                        status: 'error',
                        msg: 'Max Limit Reached',



                    });


                }
            }



            const insertWithdrawalMethod = await myPrisma.withdrawal_methods.create({
                data: {
                    ownerId,

                    idExample,
                    name,
                    title
                }
            });

            if (insertWithdrawalMethod) {
                return res.json({
                    status: 'success',
                    msg: 'Withdraw method   added ',
                });
            }
        } catch (error) {
            console.log(error);
        }
    },
    getWithdrawalMethods: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const withdrawalMethodsData = await myPrisma.withdrawal_methods.findMany({
                where: {
                    ownerId
                }
            });

            if (withdrawalMethodsData) {
                return res.json({
                    status: 'success',
                    msg: 'data fetched ',
                    withdrawalMethodsData



                });
            }
        } catch (error) {
            console.log(error);
        }
    },
    deleteWithdrawalMethod: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { sn } = req.params;

            const withdrawalMethodData = await myPrisma.withdrawal_methods.findFirst({
                where: {
                    sn: +sn,
                    ownerId
                }
            });

            if (!withdrawalMethodData) {
                return res.json({
                    status: 'error',
                    msg: 'Carousel Not Found',



                });
            }


            const deleteWithdrawalMethod = await myPrisma.withdrawal_methods.delete({
                where: {
                    sn: withdrawalMethodData.sn

                }
            });

            if (deleteWithdrawalMethod) {
                return res.json({
                    status: 'success',
                    msg: 'Withdrawal Method deleted ',



                });
            }

        } catch (error) {
            console.log(error);
        }
    }
};

export default BasicController; 