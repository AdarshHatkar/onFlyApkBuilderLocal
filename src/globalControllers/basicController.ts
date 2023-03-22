import { Decimal } from '@prisma/client/runtime/index.js';
import mtaConfig from '../globalHelpers/mtaConfig.js';
import myPrisma from '../globalHelpers/myPrisma.js';
import { convertToInt } from '../globalHelpers/utility.js';

const GlobalBasicController = {
    getReferAndEarnConfig: async (ownerId) => {
        ownerId = convertToInt(ownerId);
        const getReferAndEarnConfigData = await myPrisma.refer_and_earn_configs.findFirst({
            where: {
                ownerId: ownerId
            }
        });

        let referAndEarnConfigData: { referRewardCoin: string; referRewardAmount: number | Decimal; registerRewardCoin: string; registerRewardAmount: number | Decimal; minimumMatchFees: number | Decimal; sn?: number; ownerId?: number; };

        if (!getReferAndEarnConfigData) {
            referAndEarnConfigData = mtaConfig.defaultReferAndEarnConfig;
        } else {
            referAndEarnConfigData = getReferAndEarnConfigData;
        }

        return referAndEarnConfigData;
    }
};

export default GlobalBasicController;