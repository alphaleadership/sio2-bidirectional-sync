#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Récupère le type de bump (patch, minor, major) depuis les variables d'environnement
const bumpType = process.env.BUMP_TYPE || 'patch';

// Lit le package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Met à jour la version
const versionParts = packageJson.version.split('.');
switch (bumpType) {
  case 'major':
    versionParts[0] = String(parseInt(versionParts[0]) + 1);
    versionParts[1] = '0';
    versionParts[2] = '0';
    break;
  case 'minor':
    versionParts[1] = String(parseInt(versionParts[1]) + 1);
    versionParts[2] = '0';
    break;
  case 'patch':
  default:
    versionParts[2] = String(parseInt(versionParts[2]) + 1);
    break;
}

packageJson.version = versionParts.join('.');

// Écrit le package.json mis à jour
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`Version mise à jour : ${packageJson.version}`);