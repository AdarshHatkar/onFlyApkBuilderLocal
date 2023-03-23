import require from "./require.js";
import { exec } from "node:child_process";
import process from "node:process";
import { fileURLToPath } from 'url';
import { dirname ,join} from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// gradle --version
export let mainFun = () => {
    console.log("hello world");
   
    // exec('gradle --version', (err, stdout, stderr) => {
    //     if (err) {
    //       console.error(err);
    //       return;
    //     }
    //     console.log(stdout);
    //   });



// Set the path to the Android app source code directory
const appDir = join(__dirname, 'gaming_app_apk_v103');



const command = `cd ${appDir} && gradlew assembleDebug`;

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
});

  
};
