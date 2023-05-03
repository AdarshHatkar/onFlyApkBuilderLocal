
import { exec, spawn } from "child_process";
import { rename, copyFile } from "fs";
import { join } from "path";
import { debugApkDir, newAppSourceCodeDir, outputApksDir, releaseAbbDir } from "../constants.js";




export let buildAbb = (orderId, ownerId, userName, newVersionCode) => {
  return new Promise<{
    status: 'success' | 'error',
    msg: string,
    data?: {
      outputAbb: string,
      abbNewName: string
    }
  }>(async (resolve, reject) => {
    try {




      const command = 'gradlew.bat';
      const args = ['--daemon', ':app:bundleRelease'];
      const options = { cwd: newAppSourceCodeDir };

      const gradleProcess = spawn(command, args, options);

      gradleProcess.stdout.on('data', data => {
        console.log(`stdout: ${data}`);
        if (data.includes("-Xlint:deprecation ")) {

        } else {
          return;
        }
      });

      gradleProcess.stderr.on('data', data => {
        console.error(`stderr: ${data}`);
      });

      gradleProcess.on('error', error => {
        console.error(`Error executing command: ${error.message}`);
        reject({
          status: 'error',
          msg: `Error executing command: ${error.message}`,
          
        });

      });

      gradleProcess.on('close', code => {
        console.log(`Command exited with code ${code}`);

        if (code === 0) {
          // APK file generated, do something with it here
          const releaseAbb = join(releaseAbbDir, 'app-release.aab');
          const abbNewName = `${userName}V${newVersionCode}.aab`;
          const renamedAbb = join(releaseAbbDir, abbNewName);
          const outputAbb = join(outputApksDir, abbNewName);

          rename(releaseAbb, renamedAbb, (err) => {
            if (err) {
              console.error(`Error renaming file: ${err.message}`);
              reject(err);
            } else {
              console.log('Rename complete!');

              copyFile(renamedAbb, outputAbb, async (err) => {
                if (err) {
                  console.error(`Error copying file: ${err.message}`);
                  reject(err);
                } else {
                  console.log('renamedApk was copied to output folder');

                  console.log('APK generated');

                  // upload apk to ftp
                  try {

                    resolve({
                      status: 'success',
                      msg: `APK generated`,
                      data: { outputAbb, abbNewName }
                    });

                  } catch (error) {
                    console.error(`Error uploading APK: ${error.message}`);
                    reject(error);
                  }
                }
              });
            }
          });
        } else {
          console.error('Command exited with non-zero status');
          reject(new Error(`Command exited with non-zero status: ${code}`));
        }
      });


    } catch (error) {
      reject(error)
    }
  })
}