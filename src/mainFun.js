import require from "./helpers/require.js";
import { exec } from "node:child_process";
import process from "node:process";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { appendFileSync, copyFile, fsync, readFile, readFileSync, rename, writeFile, writeFileSync } from "node:fs";
import { copyFolderSync } from "./helpers/copyFolder.js";
import imageType from "image-type";
import axios from "axios";
import { generateAndroidLauncherIcons } from "./helpers/updateAppIcon.js";
const xml2js = require('xml2js');
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// gradle --version
export let mainFun = async () => {


  console.log("Script Started-------------------");


  // old data constant 
  const oldApplicationId = "com.gaming_apk_v_103.web_apk";

  const oldVersionCode = 10300;
  const oldVersionName = '1.0300'


  //new data variable

  let newApplicationId = 'com.gaming_apk.web_apk';
  let userName = 'gaming_apk';
  let apkName = 'Gaming Apk';
  const appLogoUrl = 'https://cdn.discordapp.com/attachments/947848349476876389/1089248253897343146/ic_launcher_foreground.png'; // Replace with your image URL

  const newVersionCode = 10301;
  const newVersionName = newVersionCode / 10000;






  // android source code location
  const originalAppSourceCodeDir = join(__dirname, '../gaming_app_apk_v103');
  const newAppSourceCodeDir = join(__dirname, '../appSourceCode');
  const appLogosDir = join(__dirname, '../appLogos');
  const gradlePropertiesFile = join(newAppSourceCodeDir, 'gradle.properties');
  const appBuild_GradleFile = join(newAppSourceCodeDir, '/app/build.gradle');
  const googleServices_JsonFile = join(newAppSourceCodeDir, '/app/google-services.json');
  const appMainResDir = join(newAppSourceCodeDir, '/app/src/main/res');
  const playstoreIconDir = join(newAppSourceCodeDir, '/app/src/main');
  const debugApkDir = join(newAppSourceCodeDir, '/app/build/outputs/apk/debug');
  const outputApksDir = join(newAppSourceCodeDir, '../outputApks');
  let stringXmlPath = join(newAppSourceCodeDir, '/app/src/main/res/values/strings.xml');
  //console.log(appSourceCodeDir);




  /*creating copy of original source code */
  copyFolderSync(originalAppSourceCodeDir, newAppSourceCodeDir)

  /* adding new gradle jdk path */

  const newLine = '\n\norg.gradle.java.home=../gradelJDK11\n';
  appendFileSync(gradlePropertiesFile, newLine);

    /*download logo from link  and stores in a folder*/

    const folder = appLogosDir; // Replace with the folder where you want to save the image
    const filename = userName; // Replace with the desired filename (without extension)
  
    // Download the image
    axios.get(appLogoUrl, { responseType: 'arraybuffer' })
      .then(async (response) => {
        // Determine the file type based on the contents
        const fileType = await imageType(response.data);
        if (!fileType) {
          throw new Error('Unable to determine file type');
        }
        // console.log({fileType});
  
        // Save the image with the appropriate extension
        const extension = fileType.ext;
        const path = `${folder}/${filename}.${extension}`;
        writeFileSync(path, response.data, 'binary');
  
        console.log(`Image saved to ${path}`);
  
        /* change the app logo */
        generateAndroidLauncherIcons(path, appMainResDir,playstoreIconDir)
          .then((result) => console.log(result))
          .catch((err) => console.error(err));
      })
      .catch(error => {
        console.error(error);
      });

  /* changing package name in module */

  readFile(appBuild_GradleFile, 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }



    // Replace the old Application Id with the new Application Id
    let newBuildGradleData = data.replace(
      `applicationId '${oldApplicationId}'`,
      `applicationId '${newApplicationId}'`
    );

    // Replace the old version name with the new version name
    newBuildGradleData = newBuildGradleData.replace(
      `versionName '${oldVersionName}'`,
      `versionName '${newVersionName}'`
    );

    // Replace the old version code with the new version code
    newBuildGradleData = newBuildGradleData.replace(
      `versionCode ${oldVersionCode}`,
      `versionCode ${newVersionCode}`
    );

    writeFile(appBuild_GradleFile, newBuildGradleData, (err) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log('Application ID updated successfully!');
    });
  });

  /* editing package json file */
  // Read the contents of the JSON file
  const data = readFileSync(googleServices_JsonFile);

  // Parse the JSON data
  const jsonData = JSON.parse(data);

  // Modify the JSON object

  jsonData.client[0].client_info.android_client_info.package_name = newApplicationId

  // Write the modified JSON back to the file
  writeFileSync(googleServices_JsonFile, JSON.stringify(jsonData, null, 2));

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
    const debugApk = join(debugApkDir, 'app-debug.apk');
    const renamedApk = join(debugApkDir, `${userName}V${newVersionCode}.apk`);
    const outputApk = join(outputApksDir, `${userName}V${newVersionCode}.apk`);
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
