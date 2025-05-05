const admin = require('../src/config/firebase');

const adminUid = 'RkwX9NDBHjWjNFmHBDzmPIuxLDk2'; // Substitua pelo UID real do usuário

async function setAdmin() {
  try {
    await admin.auth().setCustomUserClaims(adminUid, { role: 'admin', is_premium: true });
    await admin.database().ref(`users/${adminUid}`).update({
      email: 'daldocoelho@gmail.com',
      name: 'Coelho Admin',
      role: 'admin',
      is_premium: true
    });
    console.log(`Usuário ${adminUid} configurado como admin com sucesso!`);
  } catch (error) {
    console.error(`Erro ao configurar admin: ${error.message}`);
  }
}

setAdmin();