import axios from 'axios';
import ftp from 'basic-ftp'
import { createReadStream } from 'fs'
import { readFile } from 'fs/promises';
import { restBaseUrl } from './config.js';

export let uploadApkToApiFun = (orderId, localApkPath, apkNewName) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("\n ------- apk upload stated---------");

            const apkData = await readFile(localApkPath);
            const apkBlob = new Blob([apkData], { type: 'application/octet-stream' });

            const formData = new FormData();
            formData.append('file', apkBlob, apkNewName);
        //    formData.append('orderId', orderId);
        
            const response = await axios.post(`${restBaseUrl}/uploadApk?orderId=${orderId}`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            console.log(response.data);
            if(response.data.status=="success"){
                console.log("\n ------- apk upload Completed---------");
                resolve(true)
            }else{
                console.log("\n ------- apk upload Failed---------");
                reject(false)
            }
            

           
        } catch (error) {
            console.log(error);
            reject(false)
        }
    })
}