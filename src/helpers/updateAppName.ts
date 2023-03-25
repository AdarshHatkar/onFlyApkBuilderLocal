import { stringXmlPath } from "../constants.js";
import xml2js from 'xml2js';
import { readFile, readFileSync, writeFile } from "fs";
export let updateAppName = (apkName) => {
    return new Promise((resolve, reject) => {
        try {
            let data = readFileSync(stringXmlPath, 'utf-8',);

            // Parse the XML data
            xml2js.parseString(data, (err, result) => {
                if (err) {
                    console.error(err);
                    return;
                }

                // Modify the app_name string
                const resources = result.resources;
                const stringArray = resources.string;
                for (let i = 0; i < stringArray.length; i++) {
                    if (stringArray[i]['$'].name === 'app_name') {
                        stringArray[i]._ = apkName;
                        break;
                    }
                }

                // Convert the modified XML back to string
                const builder = new xml2js.Builder();
                const xml = builder.buildObject(result);

                // Write the modified XML back to the file
                writeFile(stringXmlPath, xml, (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }

                    console.log('App name changed successfully!');

                    resolve(true)
                });
            });
        } catch (error) {
            reject(error)
        }
    })
}