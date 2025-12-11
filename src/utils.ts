import fs from "fs-extra";
import path from "path";
import axios from "axios";
import FormData from "form-data";
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

// Télécharge un fichier depuis le serveur HTTPS
export async function downloadFileFromHttps(remotePath: string, localPath: string) {
  const url = `${config.https.baseUrl}${remotePath}`;
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    auth: config.https.auth?.username ? {
      username: config.https.auth.username,
      password: config.https.auth.password,
    } : undefined,
    headers: config.https.auth?.token ? { Authorization: `Bearer ${config.https.auth.token}` } : {},
  });
  await fs.ensureDir(path.dirname(localPath));
  await fs.writeFile(localPath, response.data);
  console.log(`Fichier téléchargé : ${url} → ${localPath}`);
}

// Envoie un fichier vers le serveur HTTPS
export async function uploadFileToHttps(localPath: string, remotePath: string) {
  const url = `${config.https.baseUrl}${remotePath}`;
  const form = new FormData();
  form.append("file", fs.createReadStream(localPath));
  
  await axios.post(url, form, {
    headers: {
      ...form.getHeaders(),
      ...(config.https.auth?.token ? { Authorization: `Bearer ${config.https.auth.token}` } : {}),
    },
    auth: config.https.auth?.username ? {
      username: config.https.auth.username,
      password: config.https.auth.password,
    } : undefined,
  });
  console.log(`Fichier envoyé : ${localPath} → ${url}`);
}

// Liste les fichiers sur le serveur HTTPS (exemple générique, à adapter selon ton API)
export async function listFilesOnHttps(remoteDir: string) {
  const url = `${config.https.baseUrl}${remoteDir}`;
  const response = await axios.get(url, {
    auth: config.https.auth?.username ? {
      username: config.https.auth.username,
      password: config.https.auth.password,
    } : undefined,
    headers: config.https.auth?.token ? { Authorization: `Bearer ${config.https.auth.token}` } : {},
  });
  return response.data; // Supposons que l'API retourne une liste de fichiers
}