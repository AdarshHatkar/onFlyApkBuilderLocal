import { stringXmlPath } from "../constants.js";
import xml2js from 'xml2js';
import { readFile, readFileSync, writeFile } from "fs";

type updateStringXmlType = {
    apkName: string,
    homePageLink:string
    oneSignalAppId: string
}

export let updateStringXml = ({ apkName,homePageLink, oneSignalAppId }: updateStringXmlType) => {
    return new Promise((resolve, reject) => {
        try {
            let data = readFileSync(stringXmlPath, 'utf-8',);

            // Parse the XML data
            xml2js.parseString(data, (err, result) => {
                if (err) {
                    console.error(err);
                    return;
                }

                // Modify the  string
                const resources = result.resources;
                const stringArray = resources.string;
                for (let i = 0; i < stringArray.length; i++) {

                    if (stringArray[i]['$'].name === 'app_name') {
                        stringArray[i]._ = apkName;
                       
                    }
                    if (stringArray[i]['$'].name === 'home_page_link') {
                        stringArray[i]._ = homePageLink;
                       
                    }
                    if (stringArray[i]['$'].name === 'onesignal_app_id') {
                        stringArray[i]._ = oneSignalAppId;
                       
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

                    console.log('String Xml updated successfully!');

                    resolve(true)
                });
            });
        } catch (error) {
            reject(error)
        }
    })
}