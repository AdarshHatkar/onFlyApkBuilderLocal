
import cron from 'node-cron';
import myPrisma from './myPrisma.js';
import { unixTimeStampInSeconds } from './utility.js';

const checkExpiredPlans = async () => {
    console.log('CronJob:checkExpiredPlans Start');

    let activePlans = await myPrisma.owners_plan_details.findMany({
        where: {
            OR: [{
                activePlan: {
                    equals: 'premium'
                },


            }, {
                activePlan: {
                    equals: 'starter'
                },


            }]
        }
    })
    if (activePlans) {
        // console.log(activePlans)

        if (activePlans.length > 0) {

            for (let i = 0; i < activePlans.length; i++) {
                let { validTill, sn, ownerId } = activePlans[i]

                if (validTill < unixTimeStampInSeconds()) {
                    let updatePlan = await myPrisma.owners_plan_details.update({
                        where: {
                            sn
                        }, data: {
                            activePlan: 'free'
                        }
                    })
                    if (updatePlan) {
                        console.log(`${ownerId} Plan Expired`)
                    }
                }
            }
        }
    }

    console.log('CronJob:checkExpiredPlans End');

};


export const initCronJobs = () => {
    checkExpiredPlans();
    cron.schedule('0 0 0 * * *', checkExpiredPlans);
};