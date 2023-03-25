import { readFileSync, writeFileSync } from "fs";
import { googleServices_JsonFile } from "../constants.js";



export let updateGoogleServicesJson = (newApplicationId) => {
    return new Promise((resolve, reject) => {
        try {
            // Read the contents of the JSON file
            const data = readFileSync(googleServices_JsonFile).toString();

            // Parse the JSON data
            const jsonData = JSON.parse(data);

            // Modify the JSON object

            jsonData.client[0].client_info.android_client_info.package_name = newApplicationId

            // Write the modified JSON back to the file
            writeFileSync(googleServices_JsonFile, JSON.stringify(jsonData, null, 2));

            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}