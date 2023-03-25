
import { exec } from "child_process";
import { rename, copyFile } from "fs";
import { join } from "path";
import { debugApkDir, newAppSourceCodeDir, outputApksDir } from "../constants.js";

export let buildApkFun=(userName,newVersionCode)=>{
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
        //@ts-ignore
        const renamedApk = join(debugApkDir, `${userName}V${newVersionCode}.apk`);
        //@ts-ignore
        const outputApk = join(outputApksDir, `${userName}V${newVersionCode}.apk`);
        //@ts-ignore
        rename(debugApk, renamedApk, (err) => {
            if (err) throw err;
            console.log('Rename complete!');
           //@ts-ignore
            copyFile(renamedApk, outputApk, (err) => {
                if (err) throw err;
                console.log('renamedApk was copied to output folder');

                console.log("apk generated");

                resolve(true)
            });
        })

    });
    } catch (error) {
        reject(error)
    }
 })
}