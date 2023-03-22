import { Prisma } from "@prisma/client";

const mtaConfig = {
    latestWebApkVersionCode: 10300,
    webApkOrderPrice: 50,
    webAabOrderPrice: 50,
    defaultReferAndEarnConfig: {
        referRewardCoin: 'winCredit',
        referRewardAmount: 10,
        registerRewardCoin: 'depositCredit',
        registerRewardAmount: 5,
        minimumMatchFees: 20

    },
    defaultWalletConfigs: {
        minimumDeposit: new Prisma.Decimal(1),
        maximumDeposit: new Prisma.Decimal(100),
        minimumWithdrawal: new Prisma.Decimal(1),
        maximumWithdrawal: new Prisma.Decimal(100),

        withdrawalChargeInPercentage: 0,
        activePaymentGateway: 'paytmPrimexopCat',
        paytmMerchantId: '',
        paytmMerchantKey: ''

    },
    defaultWithdrawMethods: [
        {
            name: 'UPI',
            title: 'UPI ID',
            idExample: '983487xxxx@upi'
        },
        {
            name: 'PAYTM',
            title: 'PAYTM Wallet Number',
            idExample: '9834xxxx06'
        },
        {
            name: 'PHONEPAY',
            title: 'PHONEPAY Wallet Number',
            idExample: '9834xxxx06'
        },
        {
            name: 'GPAY',
            title: 'GPAY Wallet Number',
            idExample: '9834xxxx06'
        },
    ]

};

export default mtaConfig;