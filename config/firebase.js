// Importações regulares do Firebase para autenticação
const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getDatabase } = require('firebase/database');
const path = require('path');
const fs = require('fs');

// Importação do Admin SDK
const admin = require('firebase-admin');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9ctbfwGXHCm7uLoKNER_WJITYaLMmo9I",
  authDomain: "conf-loto.firebaseapp.com",
  databaseURL: "https://conf-loto-default-rtdb.firebaseio.com",
  projectId: "conf-loto",
  storageBucket: "conf-loto.firebasestorage.app",
  messagingSenderId: "762971944104",
  appId: "1:762971944104:web:7ae1d52762737e153fbe9d",
  measurementId: "G-VQYHP7BSE1"
};

// Inicializar Firebase client
const app = initializeApp(firebaseConfig);
const clientAuth = getAuth(app);
const database = getDatabase(app);

// Configurar credenciais do Admin SDK
const getAdminCredential = () => {
  try {
    // Caminho para o arquivo de credenciais
    const credentialsPath = path.join(__dirname, '..', 'conf-loto-firebase-adminsdk-fbsvc-2cee54fe44.json');
    
    if (fs.existsSync(credentialsPath)) {
      console.log('Usando arquivo de credenciais do Firebase Admin...');
      return admin.credential.cert(require(credentialsPath));
    } else {
      console.log('Arquivo de credenciais não encontrado, usando configuração alternativa...');
      return admin.credential.cert({
        projectId: firebaseConfig.projectId,
        clientEmail: "firebase-adminsdk-fbsvc@conf-loto.iam.gserviceaccount.com",
        privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDIJPDW6ym+XB53\nEA+ebARCeHHfApeyKQp2zzMzw/ujqli9QrG8bJhNd4k0sd9t2UldDAhpm63p7aRJ\nHZDK9qT6oScEcyPqu7JTJ4n87jVDTUJjFg6W3oGpKujDrmX6L3vr4/YLPgKK0tBI\n1rI0a4Og9RIZTPoOe0i6vrj7JV6Eemjj8kTUNZnLXZGuBYpQ68tmvc6f70fnBK2D\nGTTLOh8epqMDv+BgUhun3lvOAZVbSmKbv6SKn1cCb62LqYCyLjydiAyoz7VEfIZj\ndcP572nare7eG6MlwHqmuomIayDMzSBBtdLFRHmf1UB0C4kBHQfVQtuAyGFoKbZD\neV1njHTrAgMBAAECggEAPmXF8DtAuGhf1x7av7lNWqvSVISqZpEFAiV3ARyIx23E\nXLz+TJBOq1gpHpSV49lqVef6d3Jhthywq1rcWWqr5Ld5QpnjCLubzPD2xDQ/xsu/\ndsTZp4+XPPZzuw4UHPvQ1qorezXJ9R3kcdD9nfom/3doPRsSmpE1C4OKiEIORZ6W\nyI8CKq98xZem/ElPXyc5WYg0twoAZB9hcA2ZZpy5zIlGbxMR5giJwqx/eKOG4la0\nfKq/p2WGYGYbAo/d5PjbjOYg1IClSS3qZF16SGdLy5NbFTTVaV2Coo82JK35BS5h\nJ6ydxa4/1D3vhki7jIU21ZTLwmyHUekTNnOyfQdRgQKBgQDxJL3LyyABDB3S1Z7B\nHdXU0NLaK3WGW37jryik4CYT7/DSsXKewkfcNuq8QTTShtWX0QueaGInCfd/gDp6\nl1r6P8nPMSudCjANxI3yXT2UFKQ3+o5tdjgy/mDz08n9iXiL1xQzjXFx4wp8Pu5b\ng7FfycouBjY4YufWT9LwDWhfzwKBgQDUeZHB4pLMAPKbg2YJ2GQKOOFatD248sR3\nPczClZnzz9l1zhK0+VLSC298mpg+ckGWOfk7bo2ai9ve83EF1/vytSB/sI5SPaql\nsqdI0WYBPVQBWzuvmApvWYrKlLQCv1QZc+GA6xgfj+oxaSH3TBhrXh6mXzQEjfkK\nQb8sZAqkJQKBgHXega81kGUyqPk/VaQLk1O85vOhPob3/iQIoBNHRRWFuO8jsWUM\njdeEOGTgcpNdONZGZil92ExAwOtfoDX/+YZM27Yc0LaoHij8pG2NSeYx2LtMC4ZR\nvNKgKH/GS/tT0Mp5zPQN9R+33I4yrIuq6W5q0hqBCsuw/KVyyyZvR09dAoGBAJEp\nyZqEWLTGBPqYqFMboyWUvOpCcFT2j6HD+CwNF5SKsdCZjRBVsu7MX0vrNw6a8xJW\n419mZZpr6TkGa3aJnJmyg9SZZHLtrLPuPfozDhTUuJsAoOOT5bUzoO5M8DtcSnHl\nSPDSLbYKlf9SC6GwPJLGR/x02M4vzTDjwF/srZR9AoGAGZmC8/lkiFIdEKXBLAvl\n1CImRWiTZPgpW0gbVGj51oZ4BRwP/xDkfaXzNAHGZMj0OQjYWETgUc+AKDCImAaW\n/X4Lsvxdgj1UrS8dMHOUbCBhdfUmzqFZj9sTJYKODsx4p4GATnRwBv2mnpvlHfcK\n09SNmSBxXzPpxj9di6x8hvQ=\n-----END PRIVATE KEY-----\n"
      });
    }
  } catch (error) {
    console.error('Erro ao configurar credenciais do Firebase Admin:', error);
    // Fallback de emergência
    return admin.credential.applicationDefault();
  }
};

// Inicializar SDK Admin se ainda não estiver inicializado
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: getAdminCredential(),
      databaseURL: firebaseConfig.databaseURL
    });
    console.log('Firebase Admin SDK inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar Firebase Admin:', error);
    
    // Fallback para inicialização sem credenciais (para desenvolvimento)
    try {
      admin.initializeApp({
        projectId: firebaseConfig.projectId,
        databaseURL: firebaseConfig.databaseURL
      });
      console.log('Firebase Admin SDK inicializado no modo de emergência sem credenciais');
    } catch (fallbackError) {
      console.error('Erro crítico na inicialização do Firebase Admin:', fallbackError);
    }
  }
}

// Exportar serviços do Firebase (usando o cliente + admin)
const adminDatabase = admin.database();
const adminAuth = admin.auth();

// Auth helper com verificação de token via Firebase Admin SDK
const auth = {
  async verifyIdToken(token) {
    try {
      console.log('Verificando token via Firebase Admin SDK');
      
      // Tentar verificar com Firebase Admin
      try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        console.log('Token verificado com sucesso via Firebase Admin SDK');
        return decodedToken;
      } catch (adminError) {
        console.error('Erro na verificação via Admin SDK:', adminError);
        
        // Fallback para verificação manual (apenas desenvolvimento)
        if (process.env.NODE_ENV !== 'production') {
          console.log('Tentando verificação alternativa (apenas para desenvolvimento)');
          
          // Decodificar token JWT manualmente (para desenvolvimento)
          const parts = token.split('.');
          if (parts.length !== 3) {
            throw new Error('Token JWT inválido');
          }
          
          // Decodificar a parte do payload
          const base64Url = parts[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
          
          console.log('Payload decodificado:', payload);
          
          // Extrair informações do usuário
          const uid = payload.user_id || payload.sub;
          if (!uid) {
            throw new Error('Token não contém ID de usuário válido');
          }
          
          // Retornar objeto similar ao retornado pelo Firebase Auth
          return {
            uid,
            email: payload.email || null,
            email_verified: payload.email_verified || false
          };
        } else {
          // Em produção, não permitir fallback
          throw adminError;
        }
      }
    } catch (error) {
      console.error('Erro na verificação do token:', error);
      throw error;
    }
  }
};

module.exports = { admin, auth, adminAuth, adminDatabase, clientAuth, database }; 