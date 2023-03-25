import require from './require';

const sharp = require('sharp');
const fs = require('fs');

export function generateAndroidLauncherIcons(sourceImagePath, targetFolderPath) {
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
              })
              .catch((err) => reject(err));
          })
          .catch((err) => reject(err));
      }
    }

    resolve('Android launcher icons generated successfully!');
  });
}



