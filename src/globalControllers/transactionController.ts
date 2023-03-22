import myPrisma from '../globalHelpers/myPrisma.js';
import { convertToTwoDecimalInt, unixTimeStampInSeconds } from '../globalHelpers/utility.js';

const createTransaction = {
    owner: {
        onlyDepositCredit: async ({ ownerId, transactionType, amount, comment }) => {
            try {


                // making any number to 2 decimal
                amount = convertToTwoDecimalInt(amount);


                const ownerData = await myPrisma.all_owners.findFirst({
                    where: {
                        ownerId
                    }
                });
                const depositCredit = convertToTwoDecimalInt(ownerData.depositCredit);

                let newMainWalletBalance = 0;
                if (transactionType === 'DEBIT') {
                    if (depositCredit < amount) {
                        return {
                            status: 'error',
                            msg: 'Low Wallet Balance (depositCredit)'
                        };
                    }

                    newMainWalletBalance = depositCredit - amount;
                }

                if (transactionType === 'CREDIT') {
                    newMainWalletBalance = depositCredit + amount;
                }
                newMainWalletBalance = convertToTwoDecimalInt(newMainWalletBalance)
                // console.log(newMainWalletBalance);
                // return false;
                const updateOwnerMainWallet = await myPrisma.all_owners.update({
                    where: {
                        ownerId
                    },
                    data: {
                        depositCredit: newMainWalletBalance
                    }
                });

                // console.log(updateOwnerMainWallet);

                const insertOwnerTransactionHistory = await myPrisma.owners_wallet_history.create({
                    data: {
                        ownerId,
                        walletType: 'depositCredit',
                        amount,
                        transactionType,
                        closingBalance: updateOwnerMainWallet.depositCredit,
                        comment,
                        createdAt: unixTimeStampInSeconds()

                    }
                });
                insertOwnerTransactionHistory;

                return {
                    status: 'success',
                    msg: 'owner transaction created'
                };

            } catch (error) {
                console.log(error);
            }
        },
        onlyBonusCredit: async ({ ownerId, transactionType, amount, comment }) => {
            try {


                // making any number to 2 decimal
                amount = convertToTwoDecimalInt(amount);


                const ownerData = await myPrisma.all_owners.findFirst({
                    where: {
                        ownerId
                    }
                });
                const bonusCredit = convertToTwoDecimalInt(ownerData.bonusCredit);

                let newMainWalletBalance = 0;
                if (transactionType === 'DEBIT') {
                    if (bonusCredit < amount) {
                        return {
                            status: 'error',
                            msg: 'Low Wallet Balance (bonusCredit)'
                        };
                    }

                    newMainWalletBalance = bonusCredit - amount;
                }

                if (transactionType === 'CREDIT') {
                    newMainWalletBalance = bonusCredit + amount;
                }
                newMainWalletBalance = convertToTwoDecimalInt(newMainWalletBalance);
                // console.log(newMainWalletBalance);
                // return false;
                const updateOwnerMainWallet = await myPrisma.all_owners.update({
                    where: {
                        ownerId
                    },
                    data: {
                        bonusCredit: newMainWalletBalance
                    }
                });

                // console.log(updateOwnerMainWallet);

                const insertOwnerTransactionHistory = await myPrisma.owners_wallet_history.create({
                    data: {
                        ownerId,
                        walletType: 'bonusCredit',
                        amount,
                        transactionType,
                        closingBalance: updateOwnerMainWallet.bonusCredit,
                        comment,
                        createdAt: unixTimeStampInSeconds()

                    }
                });
                insertOwnerTransactionHistory;

                return {
                    status: 'success',
                    msg: 'owner transaction created'
                };

            } catch (error) {
                console.log(error);
            }
        },
        bonusThenDepositCredit: async ({ ownerId, transactionType, amount, comment }) => {
            try {


                // making any number to 2 decimal
                amount = convertToTwoDecimalInt(amount);


                const ownerData = await myPrisma.all_owners.findFirst({
                    where: {
                        ownerId
                    }
                });
                const bonusCredit = convertToTwoDecimalInt(ownerData.bonusCredit);
                const depositCredit = convertToTwoDecimalInt(ownerData.depositCredit);


                if (transactionType === 'DEBIT') {
                    if (bonusCredit < amount) {

                        if (depositCredit < amount - bonusCredit) {
                            return {
                                status: 'error',
                                msg: 'Low Wallet Balance (bonusCredit + depositCredit)'
                            };
                        } else {
                            // do bonus and then deposit transaction 

                            const bonusDebitAmount = bonusCredit;
                            const depositDebitAmount = amount - bonusCredit;

                            // only create bonus transaction when needed
                            if (bonusDebitAmount > 0) {
                                createTransaction.owner.onlyBonusCredit({ ownerId, transactionType, amount: bonusDebitAmount, comment });
                            }

                            createTransaction.owner.onlyDepositCredit({ ownerId, transactionType, amount: depositDebitAmount, comment });
                        }

                    } else {
                        // do only bonus transaction 

                        createTransaction.owner.onlyBonusCredit({ ownerId, transactionType, amount, comment });
                    }


                }

                if (transactionType === 'CREDIT') {
                    // do only bonus transaction 
                    createTransaction.owner.onlyBonusCredit({ ownerId, transactionType, amount, comment });
                }




                return {
                    status: 'success',
                    msg: 'owner transaction created'
                };

            } catch (error) {
                console.log(error);
            }
        }
    },
    user: {
        onlyDepositCredit: async ({ userId, transactionType, amount, comment }) => {


            try {


                // making any number to 2 decimal
                amount = convertToTwoDecimalInt(amount)
                if (0 >= amount) {
                    return {
                        status: 'error',
                        msg: 'amount must be more than 0'
                    };
                }


                const userData = await myPrisma.all_users.findFirst({
                    where: {
                        userId
                    }
                });
                const depositCredit = convertToTwoDecimalInt(userData.depositCredit)

                let newDepositCreditBalance = 0;
                if (transactionType === 'DEBIT') {
                    if (depositCredit < amount) {
                        return {
                            status: 'error',
                            msg: 'Low Dep Coins in Wallet'
                        };
                    }

                    newDepositCreditBalance = depositCredit - amount;
                }

                if (transactionType === 'CREDIT') {
                    newDepositCreditBalance = depositCredit + amount;
                }
                newDepositCreditBalance = convertToTwoDecimalInt(newDepositCreditBalance);
                // console.log(newDepositCreditBalance);
                // return false;
                const updateOwnerDepositCredit = await myPrisma.all_users.update({
                    where: {
                        userId
                    },
                    data: {
                        depositCredit: newDepositCreditBalance
                    }
                });

                // console.log(updateOwnerDepositCredit);

                const insertUsersWalletHistory = await myPrisma.users_wallet_history.create({
                    data: {
                        userId,
                        walletType: 'depositCredit',
                        amount,
                        transactionType,
                        closingBalance: updateOwnerDepositCredit.depositCredit,
                        comment,
                        createdAt: unixTimeStampInSeconds()

                    }
                });
                insertUsersWalletHistory;

                return {
                    status: 'success',
                    msg: 'User dep transaction created'
                };

            } catch (error) {
                console.log(error);
            }


        },
        onlyWinCredit: async ({ userId, transactionType, amount, comment }) => {


            try {


                // making any number to 2 decimal
                amount = convertToTwoDecimalInt(amount)

                if (0 >= amount) {
                    return {
                        status: 'error',
                        msg: 'amount must be more than 0'
                    };
                }


                const userData = await myPrisma.all_users.findFirst({
                    where: {
                        userId
                    }
                });
                const winCredit = convertToTwoDecimalInt(userData.winCredit)

                let newWinCreditBalance = 0;
                if (transactionType === 'DEBIT') {
                    if (winCredit < amount) {
                        return {
                            status: 'error',
                            msg: 'Low Win Coins in Wallet'
                        };
                    }

                    newWinCreditBalance = winCredit - amount;
                }

                if (transactionType === 'CREDIT') {
                    newWinCreditBalance = winCredit + amount;
                }
                newWinCreditBalance = convertToTwoDecimalInt(newWinCreditBalance);
                // console.log(newWinCreditBalance);
                // return false;
                const updateUserWinCredit = await myPrisma.all_users.update({
                    where: {
                        userId
                    },
                    data: {
                        winCredit: newWinCreditBalance
                    }
                });

                // console.log(updateOwnerDepositCredit);

                const insertUsersWalletHistory = await myPrisma.users_wallet_history.create({
                    data: {
                        userId,
                        walletType: 'winCredit',
                        amount,
                        transactionType,
                        closingBalance: updateUserWinCredit.winCredit,
                        comment,
                        createdAt: unixTimeStampInSeconds()

                    }
                });
                insertUsersWalletHistory;

                return {
                    status: 'success',
                    msg: 'user win transaction created'
                };

            } catch (error) {
                console.log(error);
            }


        },
    }
};

export default createTransaction; 