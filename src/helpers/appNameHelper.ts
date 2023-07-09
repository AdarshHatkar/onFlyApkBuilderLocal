export let convertAppNameToUserName = (AppName: string): string => {

    let userName = AppName
    // removing all starting numbers 
    userName = userName.replace(/^\d+/, "");
    // replacing space
    userName = userName.replaceAll(/ /g, '_');
    //replace all except alphanumeric
    userName = userName.replaceAll(/\W/g, '');
    // making small case
    userName = userName.toLowerCase();


    return userName;
}

export let convertAppUsernameToFirebaseProjectName = (AppUserName: string): string => {

    const firebaseProjectName = AppUserName.replaceAll('_', '-');


    return firebaseProjectName;
}
export let convertAppUsernameToPackageName = (AppUserName: string): string => {

    const packageName = `com.${AppUserName}.web_apk`;


    return packageName;
}