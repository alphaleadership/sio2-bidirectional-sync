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

// Obtient un token JWT depuis l'API
export async function getJwtToken(username: string, password: string): Promise<string> {
  const response = await axios.post(`${config.https.baseUrl}/auth/login`, {
    username,
    password,
  });
  return response.data.token;
}

// Télécharge un fichier depuis le serveur HTTPS avec token JWT
export async function downloadFileFromHttps(remotePath: string, localPath: string, token: string) {
  const url = `${config.https.baseUrl}${remotePath}`;
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  await fs.ensureDir(path.dirname(localPath));
  await fs.writeFile(localPath, response.data);
  console.log(`Fichier téléchargé : ${url} → ${localPath}`);
}

// Envoie un fichier vers le serveur HTTPS avec token JWT
export async function uploadFileToHttps(localPath: string, remotePath: string, token: string) {
  const url = `${config.https.baseUrl}${remotePath}`;
  const form = new FormData();
  form.append("file", fs.createReadStream(localPath));
  
  await axios.post(url, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${token}`,
    },
  });
  console.log(`Fichier envoyé : ${localPath} → ${url}`);
}

// Liste les fichiers sur le serveur HTTPS avec token JWT
export async function listFilesOnHttps(remoteDir: string, token: string) {
  const url = `${config.https.baseUrl}${remoteDir}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

// Supprime un fichier sur le serveur HTTPS avec token JWT
export async function deleteFileOnHttps(remotePath: string, token: string) {
  const url = `${config.https.baseUrl}${remotePath}`;
  await axios.delete(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log(`Fichier supprimé : ${url}`);
}