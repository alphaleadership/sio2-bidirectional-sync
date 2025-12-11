import fs from "fs-extra";
import path from "path";

// Compare deux fichiers par leur checksum MD5
export async function areFilesEqual(filePath1: string, filePath2: string): Promise<boolean> {
  const file1 = await fs.readFile(filePath1);
  const file2 = await fs.readFile(filePath2);
  return file1.equals(file2);
}

// Copie un fichier d'un chemin source vers un chemin destination
export async function copyFile(src: string, dest: string): Promise<void> {
  await fs.ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
}