
export const builderEnvironment = process.env.BUILDER_ENVIRONMENT || 'local';

export let isLocalEnvironnement: boolean;
console.log(builderEnvironment);
if (builderEnvironment == 'local') {
    isLocalEnvironnement = true

} else {
    isLocalEnvironnement = false
}


export let restBaseUrl: string;




if (isLocalEnvironnement == true) {
    restBaseUrl = 'http://192.168.100.9:3005/onFlyApkBuilder';
} else {
    restBaseUrl = 'https://mtaapi.primexop.com/onFlyApkBuilder';
}