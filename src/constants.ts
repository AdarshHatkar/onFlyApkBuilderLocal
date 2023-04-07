import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);



// old data constant 
export const oldApplicationId = "com.gaming_apk_v_103.web_apk";

export const oldVersionCode = 10300;
export const oldVersionName = '1.0300'



// android source code location
export const originalAppSourceCodeDir = join(__dirname, '../gaming_app_apk_v103');
export const newAppSourceCodeDir = join(__dirname, '../appSourceCode');

export const appTempDir = join(__dirname, '../appTemp');
export const gradlePropertiesFile = join(newAppSourceCodeDir, 'gradle.properties');
export const appBuild_GradleFile = join(newAppSourceCodeDir, '/app/build.gradle');
export const googleServices_JsonFile = join(newAppSourceCodeDir, '/app/google-services.json');
export const appMainDir = join(newAppSourceCodeDir, '/app/src/main');
export const appMainResDir = join(newAppSourceCodeDir, '/app/src/main/res');
export const playstoreIconDir = join(newAppSourceCodeDir, '/app/src/main');
export const debugApkDir = join(newAppSourceCodeDir, '/app/build/outputs/apk/debug');
export const outputApksDir = join(newAppSourceCodeDir, '../outputApks');
export let stringXmlPath = join(newAppSourceCodeDir, '/app/src/main/res/values/strings.xml');
    //console.log(appSourceCodeDir);