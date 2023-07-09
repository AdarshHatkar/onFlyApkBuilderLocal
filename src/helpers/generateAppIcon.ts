
import sharp from 'sharp';
import fs, { existsSync, renameSync, writeFileSync } from 'fs';
import { appMainDir, appMainResDir, appTempDir, playstoreIconDir } from '../constants.js';
import axios from 'axios';
import AdmZip from 'adm-zip';

import imageType, { minimumBytes } from 'image-type';
import { readChunk } from 'read-chunk';
import { mkdir, readFile, rename, stat, writeFile, unlink } from 'fs/promises';
import path from 'path';
import { copyFolderAsync } from './copyFolder.js';
import { unixTimeStampInSeconds } from './utility.js';

import { rimraf } from 'rimraf';
import { restBaseUrl } from './config.js';




export let updateAppIconFun = (orderId,iconBundleLink) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("\n ------- icon updating stated---------");

            let folderPath = `${appTempDir}/${orderId}`
            // Set the path where the zip file will be saved
            const filePath = path.join(folderPath, 'apkLogoBundle.zip');

            // Make sure the download folder exists, if not create it also it need be empty 
            if (fs.existsSync(folderPath)) {
                // delete folder if exist already
                // making to folder empty 
                await rimraf(folderPath);
            }
            await mkdir(folderPath, { recursive: true });

            let apkLogoBundleUrl=`${iconBundleLink}?v=${unixTimeStampInSeconds()}`

       

            // Download the  apk logo bundle
            let response = await axios.get(apkLogoBundleUrl, { responseType: 'stream' })

            // Create a writable stream to write the file
            const writer = fs.createWriteStream(filePath);

            // Pipe the response stream to the writer stream
            response.data.pipe(writer);

            // Listen to the 'finish' event to know when the download is complete
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            console.log(`File saved to ${filePath}`);

            const zip = new AdmZip(filePath);

            zip.extractAllTo(folderPath, /*overwrite*/true);

            await rename(`${folderPath}/android/play_store_512.png`, `${folderPath}/android/ic_launcher-playstore.png`);

            await copyFolderAsync(`${folderPath}/android`, appMainDir)

            console.log("\n ------- icon updating ended---------");
            resolve(true)
        } catch (error) {
            reject(false)
            console.log(error);
        }
    })
}

