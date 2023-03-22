import bcrypt from 'bcrypt';
import createTransaction from '../../globalControllers/transactionController.js';
import myPrisma from '../../globalHelpers/myPrisma.js';
import { convertToInt, unixTimeStampInSeconds } from '../../globalHelpers/utility.js';

const UsersController = {


    getAllUsersDataTable: async (req, res) => {
        try {
            // console.log(req.query);

            const { ownerId } = req.payload;



            const draw = req.query.draw;

            const skip = convertToInt(req.query.start);

            const take = convertToInt(req.query.length);

            const order_data = req.query.order;

            let orderByColumnName = '';
            let orderBySortOrder = '';

            if (typeof order_data == 'undefined') {
                orderByColumnName = 'userId';

                orderBySortOrder = 'asc';
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
            const totalRecords = await myPrisma.all_users.count({
                where: {
                    ownerId
                }
            });
            const totalRecordsWithFilter = await myPrisma.all_users.count({
                where: {
                    ownerId,
                    OR: [
                        {
                            userId: {
                                equals: onlyNumberSearchValue
                            }
                        },
                        {
                            fullName: {
                                contains: search_value
                            }
                        },
                        {
                            email: {
                                contains: search_value
                            }
                        },
                        {
                            mobileNumber: {
                                contains: search_value
                            }
                        }
                    ]
                },

            });
            const tableData = await myPrisma.all_users.findMany({
                where: {
                    ownerId,
                    OR: [
                        {
                            userId: {
                                equals: onlyNumberSearchValue
                            }
                        },
                        {
                            fullName: {
                                contains: search_value
                            }
                        },
                        {
                            email: {
                                contains: search_value
                            }
                        },
                        {
                            mobileNumber: {
                                contains: search_value
                            }
                        }
                    ]
                },
                select: {
                    userId: true,
                    fullName: true,
                    email: true,
                    mobileNumber: true,

                    depositCredit: true,
                    winCredit: true,
                    bonusCredit: true,
                    createdAt: true
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

    getAllRedeemRequests: async (req, res) => {
        try {
            const { ownerId } = req.payload;

            const allRedeemRequestsData = await myPrisma.users_withdraw_log.findMany({
                where: {
                    ownerId
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            // success response
            return res.json({
                status: 'success',
                msg: 'Request success',
                redeemRequestsData: allRedeemRequestsData,


            });


        } catch (error) {
            console.log(error);
        }
    },

    updateRedeemRequest: async (req, res) => {
        const { ownerId } = req.payload;

        const { sn, action, comment } = req.body;

        console.log(req.body);

        const getRedeemRequestData = await myPrisma.users_withdraw_log.findFirst({
            where: {
                ownerId,
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
            const updateRedeemRequestStatus = await myPrisma.users_withdraw_log.update({
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

            await createTransaction.user.onlyWinCredit({ userId: getRedeemRequestData.userId, transactionType: 'CREDIT', amount: getRedeemRequestData.amount, comment: `Redeem (${getRedeemRequestData.sn}) cancelled [${comment}] ` });
            const updateRedeemRequestStatus = await myPrisma.users_withdraw_log.update({
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



    },
    updateUserWallet: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { userId,
                walletSelect,
                actionSelect, amount, comment } = req.body;

            const userData = await myPrisma.all_users.findFirst({
                where: {
                    ownerId, userId: +userId
                }
            });

            if (walletSelect === 'depositCredit') {

                const createUserWinCreditTransactionData = await createTransaction.user.onlyDepositCredit({ userId: userData.userId, transactionType: actionSelect, amount, comment: `${comment}` });
                if (createUserWinCreditTransactionData.status === 'error') {

                    return res.json(createUserWinCreditTransactionData);

                }
            } else if (walletSelect === 'winCredit') {
                const createUserWinCreditTransactionData = await createTransaction.user.onlyWinCredit({ userId: userData.userId, transactionType: actionSelect, amount: amount, comment: `${comment}` });
                if (createUserWinCreditTransactionData.status === 'error') {

                    return res.json(createUserWinCreditTransactionData);

                }
            }

            return res.json({
                status: 'success',
                msg: 'User Wallet updated',



            });



        } catch (error) {
            console.log(error);
        }
    },
    updateUserPassword: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { userId,

                password } = req.body;

            const userData = await myPrisma.all_users.findFirst({
                where: {
                    ownerId, userId: +userId
                }
            });

            if (!userData) {
                return res.json({
                    status: 'error',
                    msg: 'User not found',



                });
            }
            const passwordHash = bcrypt.hashSync(password, 10);
            const updatePassword = await myPrisma.all_users.update({
                where: {
                    userId: userData.userId
                },
                data: {
                    password: passwordHash
                }
            });
            if (!updatePassword) {
                return res.json({
                    status: 'error',
                    msg: 'Server error',



                });
            }
            return res.json({
                status: 'success',
                msg: 'User Password updated',



            });



        } catch (error) {
            console.log(error);
        }
    },
    deleteUser: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { userId } = req.params;

            const userData = await myPrisma.all_users.findFirst({
                where: {
                    ownerId, userId: +userId
                }
            });

            if (!userData) {
                return res.json({
                    status: 'error',
                    msg: 'User not found',



                });
            }

            const deleteUser = await myPrisma.all_users.delete({
                where: {
                    userId: userData.userId
                }
            });
            if (!deleteUser) {
                return res.json({
                    status: 'error',
                    msg: 'Server error',



                });
            }
            return res.json({
                status: 'success',
                msg: 'User Deleted',



            });



        } catch (error) {
            console.log(error);
        }
    },
};

export default UsersController;