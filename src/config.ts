// Chemins des dossiers à synchroniser
export const config = {
  localDir: "./local",
  remoteDir: "./remote",
  // Options de synchronisation
  syncOptions: {
    overwrite: false, // Ne pas écraser les fichiers existants en cas de conflit
    deleteExtra: false, // Ne pas supprimer les fichiers en trop
  },
};
