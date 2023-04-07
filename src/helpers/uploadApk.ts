import ftp from 'basic-ftp'
import { createReadStream } from 'fs'

export let uploadApkFun = (ownerId, localApkPath, apkNewName) => {
    return new Promise(async (resolve, reject) => {
        try {
            const ftpClient = new ftp.Client(0)
            ftpClient.ftp.verbose = false
            // Log progress for any transfer from now on.
            
//             ftpClient.trackProgress(info => {
//     console.log("File", info.name)
//     console.log("Type", info.type)
//     console.log("Transferred", info.bytes)
//     console.log("Transferred Overall", info.bytesOverall)
// })

            await ftpClient.access({
                host: '217.21.91.139',
                user: 'u844048624.gamingFtp',
                password: 'Rajeadvika15',
                secure: false,
                secureOptions:{
                    timeout:60000
                }
            })
              console.log(await ftpClient.ftp.timeout );
            console.log('Connected to FTP server')


     

            // Check if directory exists, create it if not
            await ftpClient.ensureDir(`/${ownerId}`)

          

            // Upload the file
        
            await ftpClient.uploadFrom(localApkPath, `/${ownerId}/${apkNewName}`)
            console.log('APK file uploaded to FTP server')

            //  console.log(await ftpClient.list())


            ftpClient.close()
            console.log('FTP connection closed')
            resolve(true)
        } catch (error) {
            console.log(error);
            reject(error)
        }
    })
}