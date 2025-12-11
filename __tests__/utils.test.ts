import fs from "fs-extra";
import path from "path";
import { areFilesEqual, copyFile } from "../src/utils";

describe("Fonctions utilitaires", () => {
  beforeAll(async () => {
    await fs.ensureDir("./test-local");
    await fs.writeFile("./test-local/file1.txt", "contenu test");
    await fs.writeFile("./test-local/file2.txt", "contenu test");
  });

  afterAll(async () => {
    await fs.remove("./test-local");
    await fs.remove("./test-dest");
  });

  it("areFilesEqual devrait retourner true pour deux fichiers identiques", async () => {
    await fs.ensureDir("./test-dest");
    await fs.copyFile("./test-local/file1.txt", "./test-dest/file1.txt");
    const result = await areFilesEqual("./test-local/file1.txt", "./test-dest/file1.txt");
    expect(result).toBe(true);
  });

  it("copyFile devrait copier un fichier vers une destination", async () => {
    await fs.ensureDir("./test-dest");
    await copyFile("./test-local/file2.txt", "./test-dest/file2-copy.txt");
    const exists = await fs.pathExists("./test-dest/file2-copy.txt");
    expect(exists).toBe(true);
  });
});