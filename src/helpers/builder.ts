import { copyFolderAsync, } from "./copyFolder.js";
import { updateAppIconFun } from "./generateAppIcon.js";
import { newAppSourceCodeDir, originalAppSourceCodeDir } from "../constants.js";
import { addJdkPathFun } from "./addJdkPath.js";
import { updateBuildGradle } from "./updateBuildGradleFile.js";
import { updateGoogleServicesJson } from "./googleServices_Json.js";
import { updateAppName } from "./updateAppName.js";
import { buildApkFun } from "./buildApk.js";

export let builderFun = (orderId,ownerId,newApplicationId,userName,apkName,newVersionCode,googleServiceJson) => {
    return new Promise(async (resolve, reject) => {
        try {


            console.log(`\n------Building ${apkName} started---------`);




            /*creating copy of original source code */
            await copyFolderAsync(originalAppSourceCodeDir, newAppSourceCodeDir)

            /* adding new gradle jdk path */

            await addJdkPathFun()

            /*download logo from link  and stores in a folder*/

            await updateAppIconFun(userName, ownerId)

            /* changing package name in module */

            await updateBuildGradle(newApplicationId, newVersionCode)

            /* editing package json file */

            await updateGoogleServicesJson(newApplicationId,googleServiceJson)
            /* Change app name */
            await updateAppName(apkName)
            // Read the strings.xml file


            await buildApkFun(orderId,ownerId,userName, newVersionCode)

            


            console.log(`\n------Building ${apkName} Completed---------`);
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}