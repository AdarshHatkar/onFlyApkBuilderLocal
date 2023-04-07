
import { exec, spawn } from "child_process";
import { rename, copyFile } from "fs";
import { join } from "path";
import { debugApkDir, newAppSourceCodeDir, outputApksDir } from "../constants.js";
import { uploadApkFun } from "./uploadApk.js";
import { uploadApkToApiFun } from "./uploadApkToApi.js";

export let buildApkFun = (orderId, ownerId, userName, newVersionCode) => {
    return new Promise((resolve, reject) => {
        try {
            const command = `cd ${newAppSourceCodeDir} && gradlew --daemon  :app:assembleDebug `;

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing command: ${error.message}`);
                    return;
                }
                if (stderr) {

                    console.error(`Command error: ${stderr}`);
                    //   console.log({stderr});
                    if (stderr.includes("-Xlint:deprecation ")) {

                    } else {
                        return;
                    }

                }
                console.log(`Command output: ${stdout}`);

                // APK file generated, do something with it here
                //@ts-ignore
                const debugApk = join(debugApkDir, 'app-debug.apk');
                let apkNewName = `${userName}V${newVersionCode}.apk`
                //@ts-ignore
                const renamedApk = join(debugApkDir, apkNewName);
                //@ts-ignore
                const outputApk = join(outputApksDir, apkNewName);
                //@ts-ignore
                rename(debugApk, renamedApk, (err) => {
                    if (err) throw err;
                    console.log('Rename complete!');
                    //@ts-ignore
                    copyFile(renamedApk, outputApk, async (err) => {
                        if (err) throw err;
                        console.log('renamedApk was copied to output folder');

                        console.log("apk generated");

                        // upload apk to ftp
                        await uploadApkToApiFun(orderId, outputApk, apkNewName)

                        resolve(true)
                    });
                })

            });
        } catch (error) {
            reject(error)
        }
    })
}