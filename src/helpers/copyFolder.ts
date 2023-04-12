import { mkdirSync, readdirSync, lstatSync, copyFileSync } from 'fs';
import { mkdir, readdir, unlink } from 'fs/promises';
import { join } from 'path';
import { rimraf } from 'rimraf';

export function copyFolderAsync(from: string, to: string,isDeletingTo:boolean=false) {

  return new Promise(async (resolve, reject) => {
    try {

      if(isDeletingTo){
        console.log("\n ------- deleting stated---------");

        // making to folder empty 
        await rimraf(to);
        console.log("\n ------- deleting completed---------");
      }
   
      console.log("\n ------- coping stated---------");
      let copyFolderFun = async (from, to) => {
        await mkdir(to, { recursive: true });
        readdirSync(from).forEach(element => {
          const absolutePath = join(from, element);
          const targetPath = join(to, element);
          if (lstatSync(absolutePath).isFile()) {
            copyFileSync(absolutePath, targetPath);
          } else {
            copyFolderFun(absolutePath, targetPath);
          }
        })
      }
      copyFolderFun(from, to)
      console.log("\n ------- coping ended---------");
      resolve(true)
    } catch (error) {
      reject(error)
    }
  })


}