import { appendFileSync } from "fs";
import { gradlePropertiesFile } from "../constants.js";

export let addJdkPathFun=()=>{
    return new Promise((resolve, reject) => {
        try {
            const newLine = '\n\norg.gradle.java.home=../gradleJDK11\n';
            appendFileSync(gradlePropertiesFile, newLine);
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}