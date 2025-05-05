const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://conf-loto-default-rtdb.firebaseio.com'
});

console.log('Firebase inicializado com sucesso!');