const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  throw new Error('Arquivo serviceAccountKey.json não encontrado. Configure-o na raiz do projeto.');
}

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
  databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://conf-loto-default-rtdb.firebaseio.com'
});

module.exports = admin;