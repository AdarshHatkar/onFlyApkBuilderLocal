export const unixTimeStampInSeconds = () => { return Math.floor(Date.now() / 1000); };

export const randomNumberWithFixedLength = (length: number) => {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * (9 * Math.pow(10, length - 1)));
};

export const convertToTwoDecimalInt = (data: any): number => {
    if (isNaN(data)) {
        console.log("error in convertToInt()")
        data = 0
    }
    return +parseFloat(data).toFixed(2);
};
export const convertToInt = (data: any): number => {
    if (isNaN(data)) {
        console.log("error in convertToInt()")
        data = 0
    }

    return +parseInt(data);
};