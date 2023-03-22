import myPrisma from '../../globalHelpers/myPrisma.js';


const AppController = {

    getDetails: async (req, res) => {
        try {
            const { appUsername, ownerId } = req.appData;



            const appDetails = await myPrisma.web_app_details.findFirst({
                where: {
                    username: appUsername
                }
            });

            if (!appDetails) {
                res.json({
                    status: 'invalidAppUsername',
                    msg: `Invalid Link `
                });
            }



            const activePlanData = await myPrisma.owners_plan_details.findFirst({
                where: {
                    ownerId
                }
            });
            const apkDetails = await myPrisma.web_apk_details.findFirst({
                where: {
                    ownerId
                }
            });
            let latestApkData = {}
            let latestApk = await myPrisma.all_web_apks.findFirst({
                where: {
                    ownerId,
                    status: 'completed'
                },
                orderBy: {
                    updatedAt: 'desc'
                }
            });

            if (latestApk) {
                latestApkData = {
                    version: latestApk.version,
                    apkLink: latestApk.apkLink,
                    updatedAt: latestApk.updatedAt,
                }
            } else {
                latestApkData = {
                    version: 0,
                    apkLink: '',
                    updatedAt: 0,
                }

            }

            //  console.log(apkDetails.oneSignalAppId);
            res.json({
                status: 'success',
                msg: `request  completed successfully`,
                ownerId,
                appName: appDetails.name,
                appUsername: appDetails.username,
                activePlan: activePlanData.activePlan,
                planStartedAt: activePlanData.startedAt,
                planValidTill: activePlanData.validTill,
                onesignalAppId: apkDetails.oneSignalAppId,
                latestApkData: latestApkData

            });


        } catch (error) {
            console.error(error);
        }
    },
    getCustomUiData: async (req, res) => {
        try {
            const { ownerId } = req.appData;
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


};

export default AppController;