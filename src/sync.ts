import fs from "fs-extra";
import path from "path";
import { config } from "./config";
import { areFilesEqual, copyFile, connectSftp, downloadFile, uploadFile } from "./utils";

// Synchronise un fichier local vers le serveur SFTP
async function syncFileToRemote(sftp: any, localPath: string, remotePath: string) {
  if (!(await sftp.exists(remotePath)) || !(await areFilesEqual(localPath, "./temp-remote-file"))) {
    console.log(`Envoi de ${localPath} vers ${remotePath}...`);
    await uploadFile(sftp, localPath, remotePath);
  }
}

// Synchronise un fichier du serveur SFTP vers local
async function syncFileFromRemote(sftp: any, remotePath: string, localPath: string) {
  if (!(await fs.pathExists(localPath)) || !(await areFilesEqual("./temp-remote-file", localPath))) {
    console.log(`Téléchargement de ${remotePath} vers ${localPath}...`);
    await downloadFile(sftp, remotePath, localPath);
  }
}

// Synchronise un dossier local vers le serveur SFTP
async function syncLocalToRemote(sftp: any, localDir: string, remoteDir: string) {
  const files = await fs.readdir(localDir);
  
  for (const file of files) {
    const localPath = path.join(localDir, file);
    const remotePath = path.join(remoteDir, file).replace(/\\/g, "/");
    const stat = await fs.stat(localPath);
    
    if (stat.isDirectory()) {
      await syncLocalToRemote(sftp, localPath, remotePath);
    } else {
      await syncFileToRemote(sftp, localPath, remotePath);
    }
  }
}

// Synchronise un dossier du serveur SFTP vers local
async function syncRemoteToLocal(sftp: any, remoteDir: string, localDir: string) {
  const files = await sftp.listdir(remoteDir);
  
  for (const file of files) {
    const remotePath = path.join(remoteDir, file).replace(/\\/g, "/");
    const localPath = path.join(localDir, file);
    const isDirectory = (await sftp.stat(remotePath)).type === 'd';
    
    if (isDirectory) {
      await fs.ensureDir(localPath);
      await syncRemoteToLocal(sftp, remotePath, localPath);
    } else {
      await syncFileFromRemote(sftp, remotePath, localPath);
    }
  }
}

// Fonction principale de synchronisation
async function main() {
  console.log("Début de la synchronisation...");
  const sftp = await connectSftp();
  
  try {
    await syncLocalToRemote(sftp, config.localDir, config.remoteDir);
    await syncRemoteToLocal(sftp, config.remoteDir, config.localDir);
    console.log("Synchronisation terminée.");
  } finally {
    await sftp.end();
  }
}

main().catch(console.error);