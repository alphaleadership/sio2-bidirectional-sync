import fs from "fs-extra";
import path from "path";
import Client from "ssh2-sftp-client";
import { config } from "./config";

// Compare deux fichiers par leur checksum MD5
export async function areFilesEqual(filePath1: string, filePath2: string): Promise<boolean> {
  const file1 = await fs.readFile(filePath1);
  const file2 = await fs.readFile(filePath2);
  return file1.equals(file2);
}

// Copie un fichier d'un chemin source vers un chemin destination (local)
export async function copyFile(src: string, dest: string): Promise<void> {
  await fs.ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
}

// Connexion au serveur SFTP
export async function connectSftp() {
  const sftp = new Client();
  try {
    await sftp.connect(config.sftp);
    console.log("Connecté au serveur SFTP");
    return sftp;
  } catch (err) {
    console.error("Erreur de connexion SFTP :", err);
    throw err;
  }
}

// Télécharge un fichier depuis le serveur SFTP
export async function downloadFile(sftp: Client, remotePath: string, localPath: string) {
  await fs.ensureDir(path.dirname(localPath));
  await sftp.get(remotePath, localPath);
  console.log(`Fichier téléchargé : ${remotePath} → ${localPath}`);
}

// Envoie un fichier vers le serveur SFTP
export async function uploadFile(sftp: Client, localPath: string, remotePath: string) {
  await sftp.put(localPath, remotePath);
  console.log(`Fichier envoyé : ${localPath} → ${remotePath}`);
}