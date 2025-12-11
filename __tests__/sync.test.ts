import fs from "fs-extra";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { downloadFileFromHttps, uploadFileToHttps, listFilesOnHttps } from "../src/utils";
import { config } from "../src/config";

const mockAxios = new MockAdapter(axios);

describe("Synchronisation via HTTPS", () => {
  beforeEach(() => {
    mockAxios.reset();
  });

  it("downloadFileFromHttps devrait télécharger un fichier depuis le serveur", async () => {
    const mockData = "contenu du fichier distant";
    mockAxios.onGet(`${config.https.baseUrl}/test.txt`).reply(200, mockData);

    await downloadFileFromHttps("/test.txt", "./test-download.txt");
    const exists = await fs.pathExists("./test-download.txt");
    expect(exists).toBe(true);
  });

  it("uploadFileToHttps devrait envoyer un fichier vers le serveur", async () => {
    await fs.writeFile("./test-upload.txt", "contenu à envoyer");
    mockAxios.onPost(`${config.https.baseUrl}/test-upload.txt`).reply(200);

    await uploadFileToHttps("./test-upload.txt", "/test-upload.txt");
    expect(mockAxios.history.post.length).toBe(1);
  });

  it("listFilesOnHttps devrait lister les fichiers sur le serveur", async () => {
    const mockFiles = ["file1.txt", "file2.txt"];
    mockAxios.onGet(`${config.https.baseUrl}/`).reply(200, mockFiles);

    const files = await listFilesOnHttps("/");
    expect(files).toEqual(mockFiles);
  });
});