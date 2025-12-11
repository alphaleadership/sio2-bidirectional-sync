import fs from "fs-extra";
import path from "path";
import { config } from "./config";
import {
  areFilesEqual,
  copyFile,
  downloadFileFromHttps,
  uploadFileToHttps,
  listFilesOnHttps,
} from "./utils";

// Synchronise un fichier local vers le serveur HTTPS
async function syncFileToRemote(localPath: string, remotePath: string) {
  if (!(await fileExistsOnHttps(remotePath)) || !(await areFilesEqual(localPath, "./temp-remote-file"))) {
    console.log(`Envoi de ${localPath} vers ${remotePath}...`);
    await uploadFileToHttps(localPath, remotePath);
  }
}

// Synchronise un fichier du serveur HTTPS vers local
async function syncFileFromRemote(remotePath: string, localPath: string) {
  if (!(await fs.pathExists(localPath)) || !(await areFilesEqual("./temp-remote-file", localPath))) {
    console.log(`Téléchargement de ${remotePath} vers ${localPath}...`);
    await downloadFileFromHttps(remotePath, localPath);
  }
}

// Vérifie si un fichier existe sur le serveur HTTPS (simplifié)
async function fileExistsOnHttps(remotePath: string): Promise<boolean> {
  try {
    await downloadFileFromHttps(remotePath, "./temp-remote-file");
    return true;
  } catch (err) {
    return false;
  }
}

// Synchronise un dossier local vers le serveur HTTPS
async function syncLocalToRemote(localDir: string, remoteDir: string) {
  const files = await fs.readdir(localDir);
  
  for (const file of files) {
    const localPath = path.join(localDir, file);
    const remotePath = path.join(remoteDir, file).replace(/\\/g, "/");
    const stat = await fs.stat(localPath);
    
    if (stat.isDirectory()) {
      await syncLocalToRemote(localPath, remotePath);
    } else {
      await syncFileToRemote(localPath, remotePath);
    }
  }
}

// Synchronise un dossier du serveur HTTPS vers local
async function syncRemoteToLocal(remoteDir: string, localDir: string) {
  const files = await listFilesOnHttps(remoteDir);
  
  for (const file of files) {
    const remotePath = path.join(remoteDir, file).replace(/\\/g, "/");
    const localPath = path.join(localDir, file);
    
    // Ici, on suppose que `files` est une liste de noms de fichiers/dossiers
    // Pour une API réelle, il faudrait adapter selon la structure de la réponse
    if (typeof file === "string") {
      await syncFileFromRemote(remotePath, localPath);
    }
  }
}

// Fonction principale de synchronisation
async function main() {
  console.log("Début de la synchronisation via HTTPS...");
  
  try {
    await syncLocalToRemote(config.localDir, config.remoteDir);
    await syncRemoteToLocal(config.remoteDir, config.localDir);
    console.log("Synchronisation terminée.");
  } catch (err) {
    console.error("Erreur lors de la synchronisation :", err);
  }
}

main().catch(console.error);