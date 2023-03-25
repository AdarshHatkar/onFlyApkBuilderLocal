import require from './require.js';

const sharp = require('sharp');
const fs = require('fs');

export function generateAndroidLauncherIcons(sourceImagePath, targetFolderPath, playstoreIconFolderPath) {
    return new Promise((resolve, reject) => {
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
                const iconSize = size * density;

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
                                const iconFolder = `${targetFolderPath}/mipmap-${folderName}`;
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
                                            const foregroundFolder = `${targetFolderPath}/mipmap-${folderName}`;
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

                if (!fs.existsSync(playstoreIconFolderPath)) {
                    fs.mkdirSync(playstoreIconFolderPath, { recursive: true });
                }

                const playstoreIconFilePath = `${playstoreIconFolderPath}/${playstoreIconName}.png`;
                fs.writeFileSync(playstoreIconFilePath, resizedImage);
            })
        resolve('Android launcher icons generated successfully!');
    });
}




export function generateAndroidLauncherIcons1(sourceImagePath, targetFolderPath,playstoreIconFolderPath) {
  return new Promise((resolve, reject) => {
    // Read the source image file
    const sourceImageBuffer = fs.readFileSync(sourceImagePath);

    // Generate the ic_launcher.png icon
    sharp(sourceImageBuffer)
      .resize(512, 512, { fit: 'inside' })
      .toFile(`${targetFolderPath}/mipmap-mdpi/ic_launcher.png`, () => {})
      .toFile(`${targetFolderPath}/mipmap-hdpi/ic_launcher.png`, () => {})
      .toFile(`${targetFolderPath}/mipmap-xhdpi/ic_launcher.png`, () => {})
      .toFile(`${targetFolderPath}/mipmap-xxhdpi/ic_launcher.png`, () => {})
      .toFile(`${targetFolderPath}/mipmap-xxxhdpi/ic_launcher.png`, () => {});

    // Generate the ic_launcher_round.png icon
    sharp(sourceImageBuffer)
      .resize(512, 512, { fit: 'inside' })
      .toFile(`${targetFolderPath}/mipmap-mdpi/ic_launcher_round.png`, () => {})
      .toFile(`${targetFolderPath}/mipmap-hdpi/ic_launcher_round.png`, () => {})
      .toFile(`${targetFolderPath}/mipmap-xhdpi/ic_launcher_round.png`, () => {})
      .toFile(`${targetFolderPath}/mipmap-xxhdpi/ic_launcher_round.png`, () => {})
      .toFile(`${targetFolderPath}/mipmap-xxxhdpi/ic_launcher_round.png`, () => {});

    // Generate the ic_launcher_foreground.png icon
    sharp(sourceImageBuffer)
      .resize(432, 432, { fit: 'inside' })
      .toFile(`${targetFolderPath}/mipmap-mdpi/ic_launcher_foreground.png`, () => {})
      .toFile(`${targetFolderPath}/mipmap-hdpi/ic_launcher_foreground.png`, () => {})
      .toFile(`${targetFolderPath}/mipmap-xhdpi/ic_launcher_foreground.png`, () => {})
      .toFile(`${targetFolderPath}/mipmap-xxhdpi/ic_launcher_foreground.png`, () => {})
      .toFile(`${targetFolderPath}/mipmap-xxxhdpi/ic_launcher_foreground.png`, () => {});



    // Generate the ic_launcher-playstore.png icon
    sharp(sourceImageBuffer)
      .resize(512, 512, { fit: 'inside' })
      .toFile(`${playstoreIconFolderPath}/ic_launcher-playstore.png`)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// Example usage
// generateAndroidLauncherIcons('path/to/source/image.png', 'path/to/target/folder')
//   .then(() => {
//     console.log('Android launcher icons generated successfully');
//   })
//   .catch((err) => {
//     console.error('Error generating Android launcher icons', err);
//   });

