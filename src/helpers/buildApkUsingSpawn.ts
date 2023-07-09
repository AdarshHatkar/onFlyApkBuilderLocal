
import { exec, spawn } from "child_process";
import { rename, copyFile } from "fs";
import { join } from "path";
import { debugApkDir, newAppSourceCodeDir, outputApksDir } from "../constants.js";




export let buildApkUsingSpawnFun = (orderId,  apkFileName, newVersionCode): Promise<{
  status: 'success' | 'error',
  msg: string,
  data: any
}> => {
  return new Promise(async (resolve, reject) => {
    try {




      const command = 'gradlew.bat';
      const args = ['--daemon', ':app:assembleDebug'];
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
          data: error
        });

      });

      gradleProcess.on('close', code => {
        console.log(`Command exited with code ${code}`);

        if (code === 0) {
          // APK file generated, do something with it here
          const debugApk = join(debugApkDir, 'app-debug.apk');
          const apkNewName = `${apkFileName}.apk`;
          const renamedApk = join(debugApkDir, apkNewName);
          const outputApk = join(outputApksDir, apkNewName);

          rename(debugApk, renamedApk, (err) => {
            if (err) {
              console.error(`Error renaming file: ${err.message}`);
              reject(err);
            } else {
              console.log('Rename complete!');

              copyFile(renamedApk, outputApk, async (err) => {
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
                      data: { outputApk, apkNewName }
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