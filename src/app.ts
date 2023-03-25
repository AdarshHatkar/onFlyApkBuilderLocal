import { copyFolderAsync, } from "./helpers/copyFolder.js";
import { updateAppIconFun } from "./helpers/generateAppIcon.js";
import { newAppSourceCodeDir, originalAppSourceCodeDir } from "./constants.js";
import { addJdkPathFun } from "./helpers/addJdkPath.js";
import { updateBuildGradle } from "./helpers/updateBuildGradleFile.js";
import { updateGoogleServicesJson } from "./helpers/googleServices_Json.js";
import { updateAppName } from "./helpers/updateAppName.js";
import { buildApkFun } from "./helpers/buildApk.js";



let main = async () => {

    console.log("------program started---------");








    //new data variable

    let newApplicationId = 'com.gaming_apk.web_apk';
    let userName = 'gaming_apk';
    let apkName = 'Gaming Apk';
    let appLogoUrl = 'https://cdn.discordapp.com/attachments/947848349476876389/1089248253897343146/ic_launcher_foreground.png'; // Replace with your image URL

    let newVersionCode = 10301;
    let newVersionName = newVersionCode / 10000;











    /*creating copy of original source code */
    await copyFolderAsync(originalAppSourceCodeDir, newAppSourceCodeDir)

    /* adding new gradle jdk path */

    await addJdkPathFun()

    /*download logo from link  and stores in a folder*/

    await updateAppIconFun(userName, appLogoUrl)

    /* changing package name in module */

    await updateBuildGradle(newApplicationId, newVersionCode)

    /* editing package json file */

    await updateGoogleServicesJson(newApplicationId)
    /* Change app name */
    await updateAppName(apkName)
    // Read the strings.xml file


   await buildApkFun(userName,newVersionCode)

    


    console.log("------program ended---------");
}
main()

