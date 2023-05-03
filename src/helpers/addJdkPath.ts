import { appendFileSync } from "fs";
import { gradlePropertiesFile } from "../constants.js";
import { appendFile } from "fs/promises";

export let addJdkPathFun=()=>{
    return new Promise( async (resolve, reject) => {
        try {
            const newLine = '\n\norg.gradle.java.home=C:/Program Files/Android/Android Studio/jbr\n';

           await appendFile(gradlePropertiesFile, newLine);
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}