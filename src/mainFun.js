import require from "./require.js";
import { exec } from "node:child_process";
import process from "node:process";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { copyFile, fsync, rename } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// gradle --version
export let mainFun = async() => {


  console.log("Script Started-------------------");

  let packageName = 'com.gaming_apk.web_apk';
  let userName = 'gaming_apk';
  let version = 10300;



  // android source code location
  const appSourceCodeDir = join(__dirname, '../gaming_app_apk_v103');
  const debugApkDir = join(__dirname, '../gaming_app_apk_v103/app/build/outputs/apk/debug');
  const outputApksDir = join(__dirname, '../outputApks');
  //console.log(appSourceCodeDir);


  
  const command = `cd ${appSourceCodeDir} && gradlew assembleDebug`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Command error: ${stderr}`);
      return;
    }
    console.log(`Command output: ${stdout}`);

    // APK file generated, do something with it here
    const debugApk = join(debugApkDir, 'app-debug.apk');
    const renamedApk = join(debugApkDir, `${userName}V${version}.apk`);
    const outputApk = join(outputApksDir, `${userName}V${version}.apk`);
    rename(debugApk, renamedApk,(err)=>{
      if (err) throw err;
      console.log('Rename complete!');

      copyFile(renamedApk, outputApk, (err) => {
        if (err) throw err;
        console.log('renamedApk was copied to output folder');

        console.log("apk generated");
      });
    })
    
  });


};
