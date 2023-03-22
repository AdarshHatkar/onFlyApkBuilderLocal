import myPrisma from '../../globalHelpers/myPrisma.js';




const customUiController = {
    getCustomUiData: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const customUi = await myPrisma.custom_ui.findFirst({
                where: {
                    ownerId
                }
            });
            let customUiData = {};
            if (customUi) {
                customUiData = JSON.parse(customUi.data);
            }
            if (customUiData) {
                return res.json({
                    status: 'success',
                    msg: 'data fetched ',
                    customUiData



                });
            }
        } catch (error) {
            console.log(error);
        }
    },
    updateHeaderUi: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { color, backgroundColor } = req.body;



            const oldUiData = await myPrisma.custom_ui.findFirst({
                where: {
                    ownerId
                }
            });

            if (oldUiData) {
                // 
                const oldData = JSON.parse(oldUiData.data);
                await myPrisma.custom_ui.update({
                    where: {
                        sn: oldUiData.sn
                    },
                    data: {
                        data: JSON.stringify({
                            ...oldData, components: {
                                ...oldData.components,
                                header: {
                                    backgroundColor,
                                    color
                                }
                            }
                        })
                    }
                });
            } else {
                const newData = {
                    components: {
                        header: {
                            backgroundColor,
                            color
                        }
                    }
                };
                await myPrisma.custom_ui.create({
                    data: {
                        ownerId,
                        data: JSON.stringify(newData)
                    }
                });
            }

            return res.json({
                status: 'success',
                msg: 'data   updated ',
            });
        } catch (error) {
            console.log(error);
        }
    },
    updateBottomNavbar: async (req, res) => {
        try {
            const { ownerId } = req.payload;
            const { backgroundColor } = req.body;



            const oldUiData = await myPrisma.custom_ui.findFirst({
                where: {
                    ownerId
                }
            });

            if (oldUiData) {
                // 
                const oldData = JSON.parse(oldUiData.data);
                await myPrisma.custom_ui.update({
                    where: {
                        sn: oldUiData.sn
                    },
                    data: {
                        data: JSON.stringify({
                            ...oldData, components: {
                                ...oldData.components,
                                bottomNavBar: {
                                    backgroundColor
                                }
                            }
                        })
                    }
                });
            } else {
                const newData = {
                    components: {
                        bottomNavBar: {
                            backgroundColor
                        }
                    }
                };
                await myPrisma.custom_ui.create({
                    data: {
                        ownerId,
                        data: JSON.stringify(newData)
                    }
                });
            }

            return res.json({
                status: 'success',
                msg: 'data   updated ',
            });
        } catch (error) {
            console.log(error);
        }
    },
};

export default customUiController;