import fs from "fs-extra";
import path from "path";
import { config } from "./config";
import {
  areFilesEqual,
  copyFile,
  getJwtToken,
  downloadFileFromHttps,
  uploadFileToHttps,
  listFilesOnHttps,
  deleteFileOnHttps,
} from "./utils";
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

// Synchronise un fichier local vers le serveur HTTPS
async function syncFileToRemote(localPath: string, remotePath: string, token: string) {
  if (!(await fileExistsOnHttps(remotePath, token)) || !(await areFilesEqual(localPath, "./temp-remote-file"))) {
    console.log(`Envoi de ${localPath} vers ${remotePath}...`);
    await uploadFileToHttps(localPath, remotePath, token);
  }
}

// Synchronise un fichier du serveur HTTPS vers local
async function syncFileFromRemote(remotePath: string, localPath: string, token: string) {
  if (!(await fs.pathExists(localPath)) || !(await areFilesEqual("./temp-remote-file", localPath))) {
    console.log(`Téléchargement de ${remotePath} vers ${localPath}...`);
    await downloadFileFromHttps(remotePath, localPath, token);
  }
}

// Vérifie si un fichier existe sur le serveur HTTPS
async function fileExistsOnHttps(remotePath: string, token: string): Promise<boolean> {
  try {
    await downloadFileFromHttps(remotePath, "./temp-remote-file", token);
    return true;
  } catch (err) {
    return false;
  }
}

// Synchronise un dossier local vers le serveur HTTPS
async function syncLocalToRemote(localDir: string, remoteDir: string, token: string) {
  const files = await fs.readdir(localDir);
  
  for (const file of files) {
    const localPath = path.join(localDir, file);
    const remotePath = path.join(remoteDir, file).replace(/\\/g, "/");
    const stat = await fs.stat(localPath);
    
    if (stat.isDirectory()) {
      await syncLocalToRemote(localPath, remotePath, token);
    } else {
      await syncFileToRemote(localPath, remotePath, token);
    }
  }
}

// Synchronise un dossier du serveur HTTPS vers local
async function syncRemoteToLocal(remoteDir: string, localDir: string, token: string) {
  const files = await listFilesOnHttps(remoteDir, token);
  
  for (const file of files) {
    const remotePath = path.join(remoteDir, file.name).replace(/\\/g, "/");
    const localPath = path.join(localDir, file.name);
    
    if (file.isDirectory) {
      await fs.ensureDir(localPath);
      await syncRemoteToLocal(remotePath, localPath, token);
    } else {
      await syncFileFromRemote(remotePath, localPath, token);
    }
  }
}

// Demande les identifiants à l'utilisateur si non fournis
async function promptForCredentials(): Promise<{username: string, password: string}> {
  const rl = readline.createInterface({ input, output });
  
  const username = await rl.question('Nom d\'utilisateur : ');
  const password = await rl.question('Mot de passe : ', { hideEchoBack: true });
  
  rl.close();
  return { username, password };
}

// Fonction principale de synchronisation
async function main() {
  console.log("Début de la synchronisation via HTTPS avec JWT...");
  
  // 1. Vérifier les identifiants
  let username = config.https.auth?.username || "";
  let password = config.https.auth?.password || "";
  
  if (!username || !password) {
    console.log("Identifiants non fournis dans la configuration. Veuillez les saisir :");
    const credentials = await promptForCredentials();
    username = credentials.username;
    password = credentials.password;
  }
  
  // 2. Obtenir un token JWT
  const token = await getJwtToken(username, password);
  if (!token) {
    console.error("Impossible d'obtenir un token JWT. Vérifiez vos identifiants.");
    return;
  }
  console.log("Token JWT obtenu avec succès.");
  
  try {
    // 3. Synchroniser les fichiers
    await syncLocalToRemote(config.localDir, config.remoteDir, token);
    await syncRemoteToLocal(config.remoteDir, config.localDir, token);
    console.log("Synchronisation terminée.");
  } catch (err) {
    console.error("Erreur lors de la synchronisation :", err);
  }
}

main().catch(console.error);