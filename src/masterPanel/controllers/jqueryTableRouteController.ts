import myPrisma from '../../globalHelpers/myPrisma.js';
import { convertToInt } from '../../globalHelpers/utility.js';

let jqueryTableRouteController = {
    allOwnersDataTable: async (req, res) => {
        try {
            // console.log(req.query);





            const draw = req.query.draw;

            const skip = convertToInt(req.query.start);

            const take = convertToInt(req.query.length);

            const order_data = req.query.order;

            let orderByColumnName = '';
            let orderBySortOrder = '';

            if (typeof order_data == 'undefined') {
                orderByColumnName = 'ownerId';

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
            let orderBy = {
                [orderByColumnName]: orderBySortOrder,
            };
            // special conditions order by

            if (orderByColumnName == "_count") {
                orderBy = {
                    //@ts-ignore
                    all_users: {
                        [orderByColumnName]: orderBySortOrder
                    }
                }
            }

            const totalRecords = await myPrisma.all_owners.count({

            });
            const totalRecordsWithFilter = await myPrisma.all_owners.count({
                where: {

                    OR: [

                        {
                            ownerId: {
                                equals: onlyNumberSearchValue
                            }
                        },
                        {
                            email: {
                                contains: search_value
                            }
                        },
                        {
                            fullName: {
                                contains: search_value
                            }
                        },
                        {
                            web_app_details: {
                                every: {
                                    name: {
                                        contains: search_value
                                    }
                                }
                            }
                        }
                    ]
                },

            });
            const tableData = await myPrisma.all_owners.findMany({
                where: {

                    OR: [

                        {
                            ownerId: {
                                equals: onlyNumberSearchValue
                            }
                        },
                        {
                            email: {
                                contains: search_value
                            }
                        },
                        {
                            fullName: {
                                contains: search_value
                            }
                        },
                        {
                            web_app_details: {
                                every: {
                                    name: {
                                        contains: search_value
                                    }
                                }
                            }
                        }
                    ]
                },
                include: {
                    web_app_details: true,
                    _count: {
                        select: {
                            all_users: true
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
}

export default jqueryTableRouteController