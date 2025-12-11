// Chemins des dossiers à synchroniser
interface SftpConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
}

export const config = {
  localDir: "./local",
  remoteDir: "/remote", // Chemin sur le serveur distant
  sftp: {
    host: "ton-serveur.com", // Remplace par l'adresse de ton serveur
    port: 22,
    username: "ton-utilisateur", // Remplace par ton utilisateur
    password: "ton-mot-de-passe", // Remplace par ton mot de passe (ou utilise privateKey)
    // privateKey: "-----BEGIN RSA PRIVATE KEY-----...", // Optionnel : clé SSH privée
  },
  syncOptions: {
    overwrite: false, // Ne pas écraser les fichiers existants en cas de conflit
    deleteExtra: false, // Ne pas supprimer les fichiers en trop
  },
};
