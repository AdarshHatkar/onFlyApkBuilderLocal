import createTransaction from '../../globalControllers/transactionController.js';
import myPrisma from '../../globalHelpers/myPrisma.js';
import { convertToInt, convertToTwoDecimalInt, unixTimeStampInSeconds } from '../../globalHelpers/utility.js';




const BasicController = {




    getDashboardData: async (req, res) => {
        try {

            // const timeStampOf24hrBack = unixTimeStampInSeconds() - 60 * 60 * 24;

            // todays start 
            const todayStartingPointTimestamp = new Date();
            todayStartingPointTimestamp.setUTCHours(18, 30, 0, 0);

            const todayStartingPoint = (todayStartingPointTimestamp.getTime() / 1000) - 60 * 60 * 24;



            const yesterdayStartingPoint = (todayStartingPointTimestamp.getTime() / 1000) - (60 * 60 * 24 * 2);
            const yesterdayEndingPoint = todayStartingPoint - 1;

            // console.log({ todayStartingPoint, yesterdayStartingPoint, yesterdayEndingPoint });



            const allUsersCount = await myPrisma.all_users.count({});
            const newUsersInTodayCount = await myPrisma.all_users.count({
                where: {
                    createdAt: {
                        gt: todayStartingPoint
                    }
                }
            });
            const newUsersInYesterdayCount = await myPrisma.all_users.count({
                where: {
                    AND: [
                        {
                            createdAt: {

                                gt: yesterdayStartingPoint
                            }
                        },
                        {
                            createdAt: {

                                lt: yesterdayEndingPoint
                            }
                        }
                    ]

                }
            });
            const allOwners = await myPrisma.all_owners.findMany({
                include: {
                    owners_plan_details: true
                }
            });

            const allOwnersCount = allOwners.length;
            let sumOfOwnersDeposit = 0;
            let sumOfOwnersBonus = 0;
            let newOwnersInTodayCount = 0;
            let newOwnersInYesterdayCount = 0;
            let ownersWithStarterPlan = 0;
            let ownersWithPremiumPlan = 0;
            for (let i = 0; i < allOwnersCount; i++) {
                sumOfOwnersDeposit = sumOfOwnersDeposit + convertToTwoDecimalInt(allOwners[i].depositCredit);

                sumOfOwnersBonus = sumOfOwnersBonus + convertToTwoDecimalInt(allOwners[i].bonusCredit);

                if (allOwners[i].createdAt > todayStartingPoint) {
                    newOwnersInTodayCount++;
                }

                if (allOwners[i].createdAt > yesterdayStartingPoint) {
                    if (allOwners[i].createdAt < yesterdayEndingPoint) {
                        newOwnersInYesterdayCount++;
                    }

                }

                if (allOwners[i].owners_plan_details.activePlan === 'starter') {
                    ownersWithStarterPlan++;
                }
                if (allOwners[i].owners_plan_details.activePlan === 'premium') {
                    ownersWithPremiumPlan++;
                }



            }


            const pendingWithdrawals = await myPrisma.owners_withdraw_log.findMany({
                where: {
                    status: 'PENDING'
                }
            });
            const pendingWithdrawalsCount = pendingWithdrawals.length;

            let sumOfPendingWithdrawals = 0;

            for (let i = 0; i < pendingWithdrawals.length; i++) {

                sumOfPendingWithdrawals = sumOfPendingWithdrawals + convertToTwoDecimalInt(pendingWithdrawals[i].amount);

            }

            const pendingWebApkOrdersCount = await myPrisma.all_web_apks.count({
                where: {
                    status: 'pending'
                }
            });





            // success response
            return res.json({
                status: 'success',
                msg: 'request success',
                allUsersCount,
                allOwnersCount,
                pendingWithdrawalsCount,
                sumOfPendingWithdrawals,
                pendingWebApkOrdersCount,
                sumOfOwnersDeposit,
                sumOfOwnersBonus,
                newOwnersInTodayCount,
                newOwnersInYesterdayCount,
                newUsersInTodayCount,
                newUsersInYesterdayCount,
                ownersWithStarterPlan,
                ownersWithPremiumPlan


            });
        } catch (error) {
            console.log(error);
        }
    },

    getAllOwners: async (req, res) => {
        try {
            const allOwnersData = await myPrisma.all_owners.findMany({
                include: {
                    web_app_details: true,
                    _count: {
                        select: {
                            all_users: true
                        }
                    }
                }

            });

            // success response
            return res.json({
                status: 'success',
                msg: 'data fetched',
                allOwnersData

            });
        } catch (error) {
            console.log(error);
        }

    },


    getAllWithdrawals: async (req, res) => {
        try {


            const allWithdrawalsData = await myPrisma.owners_withdraw_log.findMany({

                orderBy: {
                    createdAt: 'desc'
                }
            });

            // success response
            return res.json({
                status: 'success',
                msg: 'Request success',
                allWithdrawalsData,


            });


        } catch (error) {
            console.log(error);
        }
    },
    getAllWithdrawalsDataTable: async (req, res) => {
        try {

            const draw = req.query.draw;

            const skip = convertToInt(req.query.start);

            const take = convertToInt(req.query.length);

            const order_data = req.query.order;

            let orderByColumnName = '';
            let orderBySortOrder = '';

            if (typeof order_data == 'undefined') {
                orderByColumnName = 'createdAt';

                orderBySortOrder = 'desc';
            }
            else {
                const column_index = req.query.order[0]['column'];

                orderByColumnName = req.query.columns[column_index]['data'];

                orderBySortOrder = req.query.order[0]['dir'];
            }

            //search data

            let search_value = req.query.search['value'];
            search_value = search_value.trim();

            // with prisma 

            // checking if search value is number or text

            let onlyNumberSearchValue = +`${search_value}`;
            if (isNaN(onlyNumberSearchValue)) {
                onlyNumberSearchValue = -1;
            }
            const orderBy = {
                [orderByColumnName]: orderBySortOrder,
            };

            const totalRecords = await myPrisma.owners_withdraw_log.count();
            const totalRecordsWithFilter = await myPrisma.owners_withdraw_log.count({
                where: {

                    OR: [
                        {
                            sn: {
                                equals: onlyNumberSearchValue
                            }
                        },
                        {
                            ownerId: {
                                equals: onlyNumberSearchValue
                            }
                        },
                        {
                            status: {
                                contains: search_value
                            }
                        },
                        {
                            amount: {
                                equals: onlyNumberSearchValue
                            }
                        },
                        {
                            methodName: {
                                contains: search_value
                            }
                        },
                        {
                            methodId: {
                                contains: search_value
                            }
                        },
                    ]
                },

            });
            const tableData = await myPrisma.owners_withdraw_log.findMany({
                where: {

                    OR: [
                        {
                            sn: {
                                equals: onlyNumberSearchValue
                            }
                        },
                        {
                            ownerId: {
                                equals: onlyNumberSearchValue
                            }
                        },
                        {
                            status: {
                                contains: search_value
                            }
                        },
                        {
                            amount: {
                                equals: onlyNumberSearchValue
                            }
                        },
                        {
                            methodName: {
                                contains: search_value
                            }
                        },
                        {
                            methodId: {
                                contains: search_value
                            }
                        },
                    ]
                },
                skip,
                take,
                orderBy
            });

            const output = {
                'draw': draw,
                'iTotalRecords': totalRecords,
                'iTotalDisplayRecords': totalRecordsWithFilter,
                'aaData': tableData
            };

            return res.json(output);


        } catch (error) {
            console.log(error);
        }
    },

    updateWithdrawalStatus: async (req, res) => {
        try {



            const { sn, action, comment } = req.body;

            console.log(req.body);

            const getRedeemRequestData = await myPrisma.owners_withdraw_log.findFirst({
                where: {

                    sn: +sn
                }
            });

            if (!getRedeemRequestData) {
                return res.json({
                    status: 'error',
                    msg: 'Invalid request',



                });
            }

            if (getRedeemRequestData.status !== 'PENDING') {
                return res.json({
                    status: 'error',
                    msg: 'already updated',



                });
            }

            if (action === 'SUCCESS') {
                const updateRedeemRequestStatus = await myPrisma.owners_withdraw_log.update({
                    where: {

                        sn: getRedeemRequestData.sn
                    },
                    data: {
                        status: action,
                        comment,
                        updatedAt: unixTimeStampInSeconds()
                    }

                });


                if (updateRedeemRequestStatus) {
                    return res.json({
                        status: 'success',
                        msg: 'Redeem Request updated',



                    });
                }

            }

            if (action === 'FAILURE') {

                let finalRedeemAmount = 0;

                const redeemAmount = convertToTwoDecimalInt(getRedeemRequestData.amount)
                if (redeemAmount < 100) {


                    finalRedeemAmount = redeemAmount + 5.00;
                } else {

                    finalRedeemAmount = redeemAmount + ((5.00 * redeemAmount) / 100);
                }


                console.log({ finalRedeemAmount, redeemAmount });


                const depositCreditTransactionData = await createTransaction.owner.onlyDepositCredit({ ownerId: getRedeemRequestData.ownerId, transactionType: 'CREDIT', amount: finalRedeemAmount, comment: `Withdrawal (${getRedeemRequestData.sn}) cancelled [${comment}] ` });
                if (depositCreditTransactionData.status === 'error') {

                    return res.json(depositCreditTransactionData);

                }

                const updateRedeemRequestStatus = await myPrisma.owners_withdraw_log.update({
                    where: {

                        sn: getRedeemRequestData.sn
                    },
                    data: {
                        status: action,
                        comment,
                        updatedAt: unixTimeStampInSeconds()
                    }

                });


                if (updateRedeemRequestStatus) {
                    return res.json({
                        status: 'success',
                        msg: 'Redeem Request updated',




                    });
                }
            }




        } catch (error) {
            console.log(error);
        }
    },


    getWebApkOrdersDataTable: async (req, res) => {
        try {
            // console.log(req.query);





            const draw = req.query.draw;

            const skip = convertToInt(req.query.start);

            const take = convertToInt(req.query.length);

            const order_data = req.query.order;

            let orderByColumnName = '';
            let orderBySortOrder = '';

            if (typeof order_data == 'undefined') {
                orderByColumnName = 'sn';

                orderBySortOrder = 'desc';
            }
            else {
                const column_index = req.query.order[0]['column'];

                orderByColumnName = req.query.columns[column_index]['data'];

                orderBySortOrder = req.query.order[0]['dir'];
            }

            //search data

            let search_value = req.query.search['value'];
            search_value = search_value.trim();


            // with prisma 

            // checking if search value is number or text

            let onlyNumberSearchValue = +`${search_value}`;
            if (isNaN(onlyNumberSearchValue)) {
                onlyNumberSearchValue = -1;
            }
            const orderBy = {
                [orderByColumnName]: orderBySortOrder,
            };
            const totalRecords = await myPrisma.all_web_apks.count({

            });
            const totalRecordsWithFilter = await myPrisma.all_web_apks.count({
                where: {

                    OR: [
                        {
                            sn: {
                                equals: onlyNumberSearchValue
                            }
                        },
                        {
                            ownerId: {
                                equals: onlyNumberSearchValue
                            }
                        },
                        {
                            logoLink: {
                                contains: search_value
                            }
                        },
                        {
                            orderType: {
                                contains: search_value
                            }
                        }
                    ]
                },

            });
            const tableData = await myPrisma.all_web_apks.findMany({
                where: {

                    OR: [
                        {
                            sn: {
                                equals: onlyNumberSearchValue
                            }
                        },
                        {
                            ownerId: {
                                equals: onlyNumberSearchValue
                            }
                        },
                        {
                            logoLink: {
                                contains: search_value
                            }
                        },
                        {
                            orderType: {
                                contains: search_value
                            }
                        }
                    ]
                },
                include: {
                    all_owners: {
                        include: {
                            web_apk_details: true,
                            web_app_details: true
                        }
                    }
                },
                skip,
                take,
                orderBy
            });

            // adding data in table data

            /*
            for (let i = 0; i < tableData.length; i++) {
                const { userId, fullName, depositCredit, winCredit } = tableData[i];

                tableData[i].walletUpdateData = { userId, fullName, depositCredit, winCredit };
            }
*/


            const output = {
                'draw': draw,
                'iTotalRecords': totalRecords,
                'iTotalDisplayRecords': totalRecordsWithFilter,
                'aaData': tableData
            };

            return res.json(output);

        } catch (error) {
            console.log(error);
        }

    },
    updateWebApkOrder: async (req, res) => {

        try {
            const { sn, apkLink, aabLink } = req.body;

            const updateWebApkOrder = await myPrisma.all_web_apks.update({
                where: {
                    sn: +sn
                },
                data: {
                    aabLink,
                    apkLink,
                    updatedAt: unixTimeStampInSeconds(),
                    status: 'completed'
                }
            });

            if (updateWebApkOrder) {
                return res.json({
                    status: 'success',
                    msg: 'Web Apk Order Updated ',



                });
            }


        } catch (error) {
            console.log(error);
        }





    },















};

export default BasicController;