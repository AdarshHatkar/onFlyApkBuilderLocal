
import sharp from 'sharp';
import fs, { writeFileSync } from 'fs';
import { appLogosDir, appMainResDir, playstoreIconDir } from '../constants.js';
import axios from 'axios';
import imageType from 'image-type';

 function generateAndroidLauncherIcons(sourceImagePath) {
    return new Promise((resolve, reject) => {try {
        
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
        const sourceImageBuffer = fs.readFileSync(sourceImagePath);

        // Loop through the icon sizes and density scale factors
        for (const { size, name } of iconSizes) {
            for (const [density, folderName] of Object.entries(densityFolderMap)) {
                // Calculate the icon size for this density

                //@ts-ignore
                const iconSize = size * density as number

                // Resize the source image to the icon size
                sharp(sourceImageBuffer)
                    .resize(iconSize, iconSize, { fit: 'inside' })
                    .toBuffer()
                    .then((resizedImage) => {
                        // Create a new image with a transparent background
                        sharp({
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
                            .then((mergedImage) => {
                                // Create the icon folder if it doesn't exist
                                const iconFolder = `${appMainResDir}/mipmap-${folderName}`;
                                if (!fs.existsSync(iconFolder)) {
                                    fs.mkdirSync(iconFolder, { recursive: true });
                                }

                                // Write the merged image to the icon file
                                const iconFilePath = `${iconFolder}/${name}.png`;
                                fs.writeFileSync(iconFilePath, mergedImage);



                                // Generate the ic_launcher_foreground image
                                if (name === 'ic_launcher') {
                                    const foregroundSize = Math.floor(iconSize * 0.6);
                                    sharp(sourceImageBuffer)
                                        .resize(foregroundSize, foregroundSize, { fit: 'inside' })
                                        .toBuffer()
                                        .then((foregroundImage) => {
                                            const foregroundFolder = `${appMainResDir}/mipmap-${folderName}`;
                                            if (!fs.existsSync(foregroundFolder)) {
                                                fs.mkdirSync(foregroundFolder, { recursive: true });
                                            }

                                            const foregroundFilePath = `${foregroundFolder}/${name}_foreground.png`;
                                            fs.writeFileSync(foregroundFilePath, foregroundImage);
                                        })
                                        .catch((err) => reject(err));
                                }



                            })
                            .catch((err) => reject(err));
                    })
                    .catch((err) => reject(err));
            }
        }


        // Generate the ic_launcher-playstore icon
        const playstoreIconSize = 1024;
        const playstoreIconName = 'ic_launcher-playstore';
        sharp(sourceImageBuffer)
            .resize(playstoreIconSize, playstoreIconSize, { fit: 'inside' })
            .toBuffer()
            .then((resizedImage) => {

                if (!fs.existsSync(playstoreIconDir)) {
                    fs.mkdirSync(playstoreIconDir, { recursive: true });
                }

                const playstoreIconFilePath = `${playstoreIconDir}/${playstoreIconName}.png`;
                fs.writeFileSync(playstoreIconFilePath, resizedImage);
            })
        resolve(true);
   
    } catch (error) {
        reject(error)
    } });
}




export let updateAppIconFun = (userName, appLogoUrl) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("\n ------- icon updating stated---------");
            const folder = appLogosDir; // Replace with the folder where you want to save the image
            const filename = userName; // Replace with the desired filename (without extension)

            // Download the image
            let response = await axios.get(appLogoUrl, { responseType: 'arraybuffer' })
            // Determine the file type based on the contents
            const fileType = await imageType(response.data);
            if (!fileType) {
                throw new Error('Unable to determine file type');
            }
            // console.log({fileType});

            // Save the image with the appropriate extension
            const extension = fileType.ext;
            const downloadedLogoPath = `${folder}/${filename}.${extension}`;
            writeFileSync(downloadedLogoPath, response.data, 'binary');

            console.log(`Image saved to ${downloadedLogoPath}`);

            /* change the app logo */
           let  result=   await generateAndroidLauncherIcons(downloadedLogoPath)
                if(result){
                    console.log("\n ------- icon updating ended---------");
                    resolve(true)

                }
        } catch (error) {
            reject(error)
        }
    })
}

