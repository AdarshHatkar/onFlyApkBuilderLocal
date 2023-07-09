import { readFile, readFileSync, writeFile, writeFileSync } from "fs";
import { appBuild_GradleFile, oldApplicationId, oldVersionCode, oldVersionName } from "../constants.js";




export let updateBuildGradle = (orderId,newApplicationId, versionName) => {
    return new Promise((resolve, reject) => {
        try {

        
            let data = readFileSync(appBuild_GradleFile, 'utf-8');
            // Replace the old Application Id with the new Application Id
            let newBuildGradleData = data.replace(
                `applicationId '${oldApplicationId}'`,
                `applicationId '${newApplicationId}'`
            );



            // Replace the old version code with the new version code
            newBuildGradleData = newBuildGradleData.replace(
                `versionCode ${oldVersionCode}`,
                `versionCode ${orderId}`
            );

            // Replace the old version name with the new version name
            newBuildGradleData = newBuildGradleData.replace(
                `versionName '${oldVersionName}'`,
                `versionName '${versionName}'`
            );

            writeFileSync(appBuild_GradleFile, newBuildGradleData);
            console.log('Application ID updated successfully!');
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}