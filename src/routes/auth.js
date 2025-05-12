const express = require('express');
const admin = require('../config/firebase');
const User = require('../models/user');
const router = express.Router();
const crypto = require('crypto');

// Função para hash de senha com salt
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Função para verificar senha
function verifyPassword(password, hashedPassword, salt) {
  const hash = hashPassword(password, salt);
  return hash === hashedPassword;
}

// Função para gerar salt aleatório
function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  // Validações
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
  }
  if (!/^[\w\.-]+@[\w\.-]+\.\w+$/.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres, uma letra maiúscula e um número' });
  }
  if (name.length < 2) {
    return res.status(400).json({ error: 'O nome deve ter pelo menos 2 caracteres' });
  }

  try {
    // Verificar se o email já está registrado
    const userByEmailSnapshot = await admin.database().ref('users')
      .orderByChild('email')
      .equalTo(email)
      .once('value');
    
    if (userByEmailSnapshot.exists()) {
      return res.status(400).json({ error: 'Email já registrado' });
    }

    // Criar usuário no Firebase Authentication (apenas para ter um ID)
    const userRecord = await admin.auth().createUser({ 
      email, 
      emailVerified: false,
      displayName: name
    });
    
    // Gerar salt e hash da senha
    const salt = generateSalt();
    const hashedPassword = hashPassword(password, salt);
    
    // Salvar credenciais separadamente
    await admin.database().ref(`credentials/${userRecord.uid}`).set({
      salt,
      hashedPassword
    });
    
    // Criar perfil do usuário no Realtime Database
    const user = new User(userRecord.uid, email, name);
    await admin.database().ref(`users/${userRecord.uid}`).set(user.toJSON());
    
    // Gerar token JWT para o cliente
    const token = await admin.auth().createCustomToken(userRecord.uid);
    
    return res.status(201).json({ 
      message: 'Usuário registrado com sucesso', 
      uid: userRecord.uid,
      token,
      user: {
        email,
        name,
        role: 'common',
        is_premium: false
      }
    });
  } catch (error) {
    return res.status(400).json({ error: `Erro ao registrar: ${error.message}` });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    console.log(`Tentativa de login para o email: ${email}`);
    
    // Buscar usuário pelo email
    const usersSnapshot = await admin.database().ref('users')
      .orderByChild('email')
      .equalTo(email)
      .once('value');
    
    if (!usersSnapshot.exists()) {
      console.log(`Email não encontrado: ${email}`);
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }
    
    // Obter o primeiro (e único) usuário com esse email
    let uid = null;
    let userData = null;
    
    usersSnapshot.forEach((childSnapshot) => {
      uid = childSnapshot.key;
      userData = childSnapshot.val();
    });
    
    if (!uid || !userData) {
      console.log(`Dados de usuário inválidos para email: ${email}`);
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }
    
    console.log(`Usuário encontrado com ID: ${uid}`);
    
    // Buscar credenciais do usuário
    const credentialsSnapshot = await admin.database().ref(`credentials/${uid}`).once('value');
    const credentials = credentialsSnapshot.val();
    
    if (!credentials || !credentials.salt || !credentials.hashedPassword) {
      console.log(`Credenciais não encontradas para o usuário: ${uid}`);
      
      // Se não houver credenciais, podemos tentar criar um token diretamente
      // Este é um fallback para usuários criados pelo método antigo
      try {
        console.log(`Tentando criar token para usuário: ${uid} sem verificação de senha`);
        
        // Criar uma sessão personalizada para o usuário
        const sessionClaims = {
          email: userData.email,
          name: userData.name,
          role: userData.role || 'common',
          is_premium: userData.is_premium || false,
          created_at: new Date().toISOString()
        };
        
        // Atualizar os custom claims do usuário
        await admin.auth().setCustomUserClaims(uid, sessionClaims);
        console.log(`Custom claims atualizados para o usuário: ${uid}`);
        
        // Gerar um token que pode ser verificado diretamente
        const token = await admin.auth().createCustomToken(uid);
        
        return res.status(200).json({
          message: 'Login bem-sucedido',
          uid,
          token,
          user: {
            email: userData.email,
            name: userData.name,
            role: userData.role || 'common',
            is_premium: userData.is_premium || false
          }
        });
      } catch (tokenError) {
        console.error(`Erro ao gerar token para usuário: ${uid}`, tokenError);
        return res.status(500).json({ error: 'Erro ao gerar token de autenticação' });
      }
    }
    
    // Verificar senha
    if (!verifyPassword(password, credentials.hashedPassword, credentials.salt)) {
      console.log(`Senha incorreta para o usuário: ${uid}`);
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }
    
    console.log(`Senha verificada com sucesso para usuário: ${uid}`);
    
    // Criar uma sessão personalizada para o usuário
    const sessionClaims = {
      email: userData.email,
      name: userData.name,
      role: userData.role || 'common',
      is_premium: userData.is_premium || false,
      created_at: new Date().toISOString()
    };
    
    // Atualizar os custom claims do usuário
    await admin.auth().setCustomUserClaims(uid, sessionClaims);
    console.log(`Custom claims atualizados para o usuário: ${uid}`);
    
    // Gerar um token JWT para o cliente
    const token = await admin.auth().createCustomToken(uid);
    console.log(`Token gerado com sucesso para usuário: ${uid}`);
    
    return res.status(200).json({
      message: 'Login bem-sucedido',
      uid,
      token,
      user: {
        email: userData.email,
        name: userData.name,
        role: userData.role || 'common',
        is_premium: userData.is_premium || false
      }
    });
  } catch (error) {
    console.error(`Erro no login: ${error.message}`, error);
    return res.status(500).json({ error: `Erro ao fazer login: ${error.message}` });
  }
});

// Middleware para verificar autenticação
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
};

// Rota para verificar a sessão atual do usuário
router.get('/me', authenticateToken, async (req, res) => {
  try {
    console.log('Rota /me - Usuário autenticado:', req.user);
    const uid = req.user.uid;
    
    if (!uid) {
      return res.status(400).json({ error: 'UID não encontrado no token' });
    }
    
    const userSnapshot = await admin.database().ref(`users/${uid}`).once('value');
    const userData = userSnapshot.val();
    
    if (!userData) {
      console.log(`Usuário não encontrado no banco para UID: ${uid}`);
      return res.status(404).json({ error: 'Usuário não encontrado no banco de dados' });
    }
    
    console.log('Dados do usuário encontrados:', { email: userData.email, name: userData.name });
    
    return res.status(200).json({
      uid,
      user: {
        email: userData.email,
        name: userData.name,
        role: userData.role || 'common',
        is_premium: userData.is_premium || false
      }
    });
  } catch (error) {
    console.error('Erro em /auth/me:', error);
    return res.status(500).json({ error: `Erro ao obter dados do usuário: ${error.message}` });
  }
});

// Rota de verificação de token
router.post('/verify-token', async (req, res) => {
  const { idToken } = req.body;
  
  if (!idToken) {
    return res.status(400).json({ error: 'Token não fornecido' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const userData = (await admin.database().ref(`users/${uid}`).once('value')).val();
    
    if (!userData) {
      return res.status(404).json({ error: 'Usuário não encontrado no banco de dados' });
    }
    
    return res.status(200).json({
      message: 'Token válido',
      uid,
      user: {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        is_premium: userData.is_premium
      }
    });
  } catch (error) {
    return res.status(401).json({ error: `Token inválido: ${error.message}` });
  }
});

module.exports = router;