import { mkdirSync, readdirSync, lstatSync, copyFileSync } from 'fs';
import { join } from 'path';

export function copyFolderAsync(from: string, to: string) {

  return new Promise((resolve, reject) => {
    try {

      console.log("\n ------- coping stated---------");
      let copyFolderFun = (from, to) => {
        mkdirSync(to, { recursive: true });
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