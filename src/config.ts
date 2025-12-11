// Configuration pour la synchronisation via HTTPS
interface HttpsConfig {
  baseUrl: string; // URL de base du serveur (ex: https://ton-serveur.com/api/files)
  auth?: {
    username?: string;
    password?: string;
    token?: string; // Token d'authentification si nécessaire
  };
}

export const config = {
  localDir: "./local",
  remoteDir: "/", // Chemin de base sur le serveur (peut être vide ou "/" pour la racine)
  https: {
    baseUrl: "https://ton-serveur.com/api/files", // Remplace par l'URL de ton API/serveur
    auth: {
      // username: "ton-utilisateur", // Optionnel
      // password: "ton-mot-de-passe", // Optionnel
      // token: "ton-token", // Optionnel
    },
  },
  syncOptions: {
    overwrite: false, // Ne pas écraser les fichiers existants en cas de conflit
    deleteExtra: false, // Ne pas supprimer les fichiers en trop
  },
};
