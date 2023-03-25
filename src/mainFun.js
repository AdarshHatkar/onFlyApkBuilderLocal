import require from "./require.js";
import { exec } from "node:child_process";
import process from "node:process";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { copyFile, fsync, readFile, rename, writeFile } from "node:fs";
const xml2js = require('xml2js');
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// gradle --version
export let mainFun =  () => {


  console.log("Script Started-------------------");

  let packageName = 'com.gaming_apk.web_apk';
  let userName = 'gaming_apk';
  let apkName = 'Gaming Apk';
  let version = 10300;



  // android source code location
  const appSourceCodeDir = join(__dirname, '../gaming_app_apk_v103');
  const debugApkDir = join(__dirname, '../gaming_app_apk_v103/app/build/outputs/apk/debug');
  const outputApksDir = join(__dirname, '../outputApks');
  let stringXmlPath = join(__dirname, '../gaming_app_apk_v103/app/src/main/res/values/strings.xml');
  //console.log(appSourceCodeDir);

  /* Change app name */

  // Read the strings.xml file
  readFile(stringXmlPath, 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    // Parse the XML data
    xml2js.parseString(data, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      // Modify the app_name string
      const resources = result.resources;
      const stringArray = resources.string;
      for (let i = 0; i < stringArray.length; i++) {
        if (stringArray[i]['$'].name === 'app_name') {
          stringArray[i]._ = apkName;
          break;
        }
      }

      // Convert the modified XML back to string
      const builder = new xml2js.Builder();
      const xml = builder.buildObject(result);

      // Write the modified XML back to the file
      writeFile(stringXmlPath, xml, (err) => {
        if (err) {
          console.error(err);
          return;
        }

        console.log('App name changed successfully!');
      });
    });
  });

  console.log("Start apk generation");

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
    rename(debugApk, renamedApk, (err) => {
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
