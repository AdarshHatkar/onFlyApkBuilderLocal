import axios from 'axios';
import ftp from 'basic-ftp'
import { createReadStream } from 'fs'
import { readFile } from 'fs/promises';
import { restBaseUrl } from './config.js';

export let uploadAbbToApiFun = (orderId, localAbbPath, abbNewName) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("\n ------- aab upload stated---------");

            const apkData = await readFile(localAbbPath);
            const apkBlob = new Blob([apkData], { type: 'application/octet-stream' });

            const formData = new FormData();
            formData.append('file', apkBlob, abbNewName);
        //    formData.append('orderId', orderId);
        
            const response = await axios.post(`${restBaseUrl}/uploadAab?orderId=${orderId}`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            console.log(response.data);
            if(response.data.status=="success"){
                console.log("\n ------- aab upload Completed---------");
                resolve(true)
            }else{
                console.log("\n ------- aab upload Failed---------");
                reject(false)
            }
            

           
        } catch (error) {
            console.log(error);
            reject(false)
        }
    })
}