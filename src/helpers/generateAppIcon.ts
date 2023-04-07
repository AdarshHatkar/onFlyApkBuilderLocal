
import sharp from 'sharp';
import fs, { existsSync, renameSync, writeFileSync } from 'fs';
import { appLogosDir, appMainDir, appMainResDir, appTempDir, playstoreIconDir } from '../constants.js';
import axios from 'axios';
import AdmZip from 'adm-zip';

import imageType, { minimumBytes } from 'image-type';
import { readChunk } from 'read-chunk';
import { mkdir, readFile, rename, stat, writeFile, unlink } from 'fs/promises';
import path from 'path';
import { copyFolderAsync } from './copyFolder.js';

function compressPngFile(inputFilePath, fileSizeLimitInKB) {
    return new Promise((resolve, reject) => {
        try {




            let quality = 100

            let isCompressZlib = true

            let preResolveFun = async (inputFilePath) => {
                // deleting old file

                if (!inputFilePath.includes("_old.png")) {
                    inputFilePath = inputFilePath.replace(`.png`, `_old.png`)
                }
                if (fs.existsSync(inputFilePath)) {
                    // Delete the old file
                    await unlink(inputFilePath);
                }

            }

            let compressFun = async (inputFilePath) => {

                try {
                    // Get file stats
                    let stats = await stat(inputFilePath);




                    const fileSizeInBytes = stats.size;
                    const fileSizeInKB = fileSizeInBytes / 1024;

                    // Check if file size is within limit
                    if (fileSizeInKB > fileSizeLimitInKB) {
                        let outputFilePath = inputFilePath.replace(`_old.png`, `.png`)
                        if (!inputFilePath.includes("_old.png")) {
                            inputFilePath = outputFilePath.replace(`.png`, `_old.png`)
                        }
                        await rename(outputFilePath, inputFilePath)


                        console.log(`\n ${fileSizeInKB}  < ${fileSizeLimitInKB}\n`);
                        // Compress the image

                        if (isCompressZlib) {
                            let info = await sharp(inputFilePath)
                                .png({ compressionLevel: 9 })
                                .toFile(outputFilePath);



                            console.log(`z-${isCompressZlib} q-${quality} Compressed ${inputFilePath} to ${info.size / 1024} KB`);
                            isCompressZlib = false

                            await compressFun(outputFilePath)

                        } else {
                            let info = await sharp(inputFilePath)
                                .png({ quality: quality })
                                .toFile(outputFilePath);



                            console.log(`z-${isCompressZlib} q-${quality} Compressed ${inputFilePath} to ${info.size / 1024} KB`);
                            quality = quality - 1;
                            if (quality > 10) {
                                isCompressZlib = true
                                await compressFun(outputFilePath)
                            } else {
                                await preResolveFun(inputFilePath)
                                resolve(true);
                            }


                        }
                    } else {
                        console.log(`File size is ${fileSizeInKB} KB. No compression needed.`);

                        await preResolveFun(inputFilePath)

                        resolve(true);
                        return;
                    }



                } catch (error) {
                    console.log(error);
                }


            }
            compressFun(inputFilePath)
        } catch (error) {
            reject(error)
        }

    });
}

let convertImageToPng = (oldPath) => {
    return new Promise(async (resolve, reject) => {
        try {
            const buffer = await readChunk(oldPath, { length: minimumBytes });

            let fileType = await imageType(buffer);
            if (!fileType) {
                throw new Error('Unable to determine file type');
            }

            const extension = fileType.ext;
            let newPath = oldPath.replace(`.${extension}`, `.png`)
            if (extension != 'png') {
                sharp(oldPath)
                    .png()
                    .toFile(newPath, (err, info) => {
                        if (err)
                            throw err;
                        console.log(info);
                        // Delete the old file
                        fs.unlink(oldPath, (err) => {
                            if (err)
                                throw err;
                            console.log(`Deleted ${oldPath}`);
                            resolve(newPath)
                        });
                    });
            } else {
                resolve(newPath)
            }

        } catch (error) {
            reject(error)
        }
    })
}


function generateAndroidLauncherIcons(sourceImagePath) {
    return new Promise(async (resolve, reject) => {
        try {

            // Define the icon sizes and names
            const iconSizes = [
                { size: 48, name: 'ic_launcher' },
                { size: 72, name: 'ic_launcher' },
                { size: 96, name: 'ic_launcher' },
                { size: 144, name: 'ic_launcher' },
                { size: 192, name: 'ic_launcher' },
                { size: 512, name: 'ic_launcher_round' },
            ];

            // Define the density scale factors and folder names
            const densityFolderMap = {
                0.75: 'ldpi',
                1: 'mdpi',
                1.5: 'hdpi',
                2: 'xhdpi',
                3: 'xxhdpi',
                4: 'xxxhdpi',
            };

            // Read the source image into a buffer
            const sourceImageBuffer = await readFile(sourceImagePath);

            // Loop through the icon sizes and density scale factors
            for (const { size, name } of iconSizes) {
                for (const [density, folderName] of Object.entries(densityFolderMap)) {
                    // Calculate the icon size for this density

                    //@ts-ignore
                    const iconSize = size * density as number

                    // Resize the source image to the icon size
                    let resizedImage = await sharp(sourceImageBuffer)
                        .resize(iconSize, iconSize, { fit: 'inside' })
                        .toBuffer()


                    // Create a new image with a transparent background
                    let mergedImage = await sharp({
                        create: {
                            width: iconSize,
                            height: iconSize,
                            channels: 4,
                            background: { r: 0, g: 0, b: 0, alpha: 0 },
                        },
                    })
                        // Composite the resized image onto the transparent background
                        .composite([{ input: resizedImage, gravity: 'center' }])
                        .png()
                        .toBuffer()



                    // Create the icon folder if it doesn't exist
                    const iconFolder = `${appMainResDir}/mipmap-${folderName}`;
                    if (!existsSync(iconFolder)) {
                        await mkdir(iconFolder, { recursive: true });
                    }

                    // Write the merged image to the icon file
                    const iconFilePath = `${iconFolder}/${name}.png`;
                    await writeFile(iconFilePath, mergedImage);
                    //    await compressPngFile(iconFilePath, 100)


                    // Generate the ic_launcher_foreground image
                    if (name === 'ic_launcher') {
                        const foregroundSize = Math.floor(iconSize * 0.6);
                        let foregroundImage = await sharp(sourceImageBuffer)
                            .resize(foregroundSize, foregroundSize, { fit: 'inside' })
                            .toBuffer()



                        const foregroundFolder = `${appMainResDir}/mipmap-${folderName}`;
                        if (!fs.existsSync(foregroundFolder)) {
                            fs.mkdirSync(foregroundFolder, { recursive: true });
                        }

                        const foregroundFilePath = `${foregroundFolder}/${name}_foreground.png`;
                        fs.writeFileSync(foregroundFilePath, foregroundImage);
                        //   await compressPngFile(foregroundFilePath, 100)

                    }





                }
            }


            // Generate the ic_launcher-playstore icon
            const playstoreIconSize = 1024;
            const playstoreIconName = 'ic_launcher-playstore';
            let playstoreIcon = await sharp(sourceImageBuffer)
                .resize(playstoreIconSize, playstoreIconSize, { fit: 'inside' })
                .toBuffer()

            if (!fs.existsSync(playstoreIconDir)) {
                await mkdir(playstoreIconDir, { recursive: true });
            }

            const playstoreIconFilePath = `${playstoreIconDir}/${playstoreIconName}.png`;
            await writeFile(playstoreIconFilePath, playstoreIcon);
            //   await compressPngFile(playstoreIconFilePath, 100)
            resolve(true);

        } catch (error) {
            reject(error)
        }
    });
}




export let updateAppIconFun = (userName, ownerId) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("\n ------- icon updating stated---------");

            let folderPath = `${appTempDir}/${ownerId}`
            // Set the path where the zip file will be saved
            const filePath = path.join(folderPath, 'apkLogoBundle.zip');

            // Make sure the download folder exists, if not create it
            if (!fs.existsSync(folderPath)) {
                await mkdir(folderPath, { recursive: true });
            }

            // Download the  apk logo bundle
            let response = await axios.get(`https://gafs.primexop.com/${ownerId}/apkLogoBundle.zip`, { responseType: 'stream' })

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

