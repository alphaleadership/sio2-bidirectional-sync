import fs from "fs-extra";
import path from "path";
import { config } from "./config";
import { areFilesEqual, copyFile } from "./utils";

// Synchronise un fichier du dossier source vers le dossier destination
async function syncFile(src: string, dest: string): Promise<void> {
  const srcPath = path.join(src);
  const destPath = path.join(dest);
  
  if (!(await fs.pathExists(destPath)) || !(await areFilesEqual(srcPath, destPath))) {
    console.log(`Copie de ${srcPath} vers ${destPath}...`);
    await copyFile(srcPath, destPath);
  }
}

// Synchronise un dossier source vers un dossier destination
async function syncDir(srcDir: string, destDir: string): Promise<void> {
  const files = await fs.readdir(srcDir);
  
  for (const file of files) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    const stat = await fs.stat(srcPath);
    
    if (stat.isDirectory()) {
      await syncDir(srcPath, destPath);
    } else {
      await syncFile(srcPath, destPath);
    }
  }
}

// Fonction principale de synchronisation
async function main() {
  console.log("Début de la synchronisation...");
  await syncDir(config.localDir, config.remoteDir);
  await syncDir(config.remoteDir, config.localDir);
  console.log("Synchronisation terminée.");
}

main().catch(console.error);