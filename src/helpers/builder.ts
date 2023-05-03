import { copyFolderAsync, } from "./copyFolder.js";
import { updateAppIconFun } from "./generateAppIcon.js";
import { newAppSourceCodeDir, originalAppSourceCodeV103Dir, originalAppSourceCodeV106Dir } from "../constants.js";
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

export let builderFun = (orderId, ownerId, newApplicationId, userName, apkName, newVersionCode, googleServiceJson, orderType,oneSignalAppId) => {
    return new Promise(async (resolve, reject) => {
        try {


            console.log(`\n------Building ${apkName} started---------`);

            let homePageLink=`https://mtawar.primexop.com/${userName}/init/${newVersionCode}/`


            /*creating copy of original source code from main branch */
            
            execSync('git checkout main', { cwd: originalAppSourceCodeV106Dir});
            // await copyFolderAsync(originalAppSourceCodeV103Dir, newAppSourceCodeDir, true)
            await copyFolderAsync(originalAppSourceCodeV106Dir, newAppSourceCodeDir, true)


          

            /* deleting git folder */
            // deleteFolderRecursive()
            // await rimraf(join(newAppSourceCodeDir, '/.git/'));
            /* adding new gradle jdk path */

            await addJdkPathFun()

            /*download logo from link  and stores in a folder*/

            await updateAppIconFun(userName, ownerId)

            /* changing package name in module */

            await updateBuildGradle(newApplicationId, newVersionCode)

            /* editing package json file */

            await updateGoogleServicesJson(newApplicationId, googleServiceJson)

        

            /* Change app name */
            await updateStringXml({apkName,homePageLink,oneSignalAppId})
           
          

            if (orderType == 'apkAndAab' || orderType == 'apkAndAabAndPlaystoreUpload') {
                let res = await buildAbb(orderId, ownerId, userName, newVersionCode)
               

                /* uploading aab*/
                await uploadAbbToApiFun(orderId, res.data.outputAbb, res.data.abbNewName);

            }


            // await buildApkFun(orderId,ownerId,userName, newVersionCode)
            let res = await buildApkUsingSpawnFun(orderId, ownerId, userName, newVersionCode)

         

            /* uploading apk */
            await uploadApkToApiFun(orderId, res.data.outputApk, res.data.apkNewName);

            // deleting temp folder
            await rm(`${appTempDir}/${ownerId}`, { recursive: true, force: true })

            console.log(`\n------Building ${apkName} Completed---------`);
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}