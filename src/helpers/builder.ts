import { copyFolderAsync, } from "./copyFolder.js";
import { updateAppIconFun } from "./generateAppIcon.js";
import { newAppSourceCodeDir, originalAppSourceCodeV106Dir } from "../constants.js";
import { addJdkPathFun } from "./addJdkPath.js";
import { updateBuildGradle } from "./updateBuildGradleFile.js";
import { updateGoogleServicesJson } from "./googleServices_Json.js";


import { rm } from "node:fs/promises";
import { appTempDir } from "../constants.js";
import { buildApkUsingSpawnFun } from "./buildApkUsingSpawn.js";
import { uploadApkToApiFun } from "./uploadApkToApi.js";
import { buildAbb } from "./buildAbb.js";
import { uploadAbbToApiFun } from "./uploadAbbToApi.js";

import { updateStringXml } from "./updateStringXml.js";
import { exec, execSync } from "node:child_process";
import { rimraf } from "rimraf";
import { join } from "node:path";
import { deleteFolderRecursive } from "./deleteFolderRecursive.js";
import { restBaseUrl } from "./config.js";
import { convertAppNameToUserName } from "./appNameHelper.js";

export let builderFun = (orderId,  newApplicationId,  apkName, versionName, googleJsonLink,oneSignalAppId,webLink,iconBundleLink) => {
    return new Promise(async (resolve, reject) => {
        try {


            console.log(`\n------Building ${apkName} started---------`);

            let homePageLink=webLink

           let apkFileName=convertAppNameToUserName(`${apkName}V${versionName}`)


            /*creating copy of original source code from main branch */
            
            execSync('git checkout main', { cwd: originalAppSourceCodeV106Dir});
            execSync('git pull -r origin main', { cwd: originalAppSourceCodeV106Dir});
            // await copyFolderAsync(originalAppSourceCodeV103Dir, newAppSourceCodeDir, true)
            await copyFolderAsync(originalAppSourceCodeV106Dir, newAppSourceCodeDir, true)

            execSync('git checkout dev', { cwd: originalAppSourceCodeV106Dir});

          

            /* deleting git folder */
            // deleteFolderRecursive()
            // await rimraf(join(newAppSourceCodeDir, '/.git/'));
            /* adding new gradle jdk path */

            // await addJdkPathFun()

            /*download logo from link  and stores in a folder*/

            await updateAppIconFun(orderId,iconBundleLink)

            /* changing package name in module */

            await updateBuildGradle(orderId,newApplicationId, versionName)

            /* editing package json file */

            await updateGoogleServicesJson(newApplicationId, googleJsonLink)

        

            /* Change app name */
            await updateStringXml({apkName,homePageLink,oneSignalAppId})
           
          

            let res1 = await buildAbb(orderId, apkFileName, versionName)
               

            /* uploading aab*/
            await uploadAbbToApiFun(orderId, res1.data.outputAbb, res1.data.abbNewName);


            // await buildApkFun(orderId,ownerId,userName, newVersionCode)
            let res2 = await buildApkUsingSpawnFun(orderId, apkFileName, versionName)

         

            /* uploading apk */
            await uploadApkToApiFun(orderId, res2.data.outputApk, res2.data.apkNewName);

            // deleting temp folder
            await rm(`${appTempDir}/${orderId}`, { recursive: true, force: true })

            console.log(`\n------Building ${apkName} Completed---------`);
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}