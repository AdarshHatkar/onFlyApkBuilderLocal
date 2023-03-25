import { mkdirSync, readdirSync, lstatSync, copyFileSync } from 'fs';
import { join } from 'path';

export function copyFolderSync(from, to) {
  mkdirSync(to, { recursive: true });
  readdirSync(from).forEach(element => {
    const absolutePath = join(from, element);
    const targetPath = join(to, element);
    if (lstatSync(absolutePath).isFile()) {
      copyFileSync(absolutePath, targetPath);
    } else {
      copyFolderSync(absolutePath, targetPath);
    }
  });
}