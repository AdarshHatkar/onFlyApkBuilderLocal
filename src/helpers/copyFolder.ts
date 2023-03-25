import { mkdirSync, readdirSync, lstatSync, copyFileSync } from 'fs';
import { join } from 'path';

export function copyFolderAsync(from: string, to: string) {

  return new Promise((resolve, reject) => {
    try {
      mkdirSync(to, { recursive: true });
      readdirSync(from).forEach(element => {
        const absolutePath = join(from, element);
        const targetPath = join(to, element);
        if (lstatSync(absolutePath).isFile()) {
          copyFileSync(absolutePath, targetPath);
        } else {
          copyFolderAsync(absolutePath, targetPath);
        }
      })

      resolve(true)
    } catch (error) {
      reject(error)
    }
  })


}