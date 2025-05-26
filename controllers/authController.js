const { auth, clientAuth, database } = require('../config/firebase');
const { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} = require('firebase/auth');
const { ref, set, get } = require('firebase/database');
const admin = require('firebase-admin');

// Helper function to translate Firebase error codes to Portuguese
const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/invalid-credential':
      return 'Email ou senha inválidos.';
    case 'auth/user-not-found':
      return 'Usuário não encontrado.';
    case 'auth/wrong-password':
      return 'Senha incorreta.';
    case 'auth/email-already-in-use':
      return 'Este email já está sendo utilizado.';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres.';
    case 'auth/invalid-email':
      return 'Email inválido.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas consecutivas. Tente novamente mais tarde.';
    default:
      return 'Ocorreu um erro. Tente novamente.';
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email e senha são obrigatórios' 
      });
    }
    
    console.log('Tentando autenticar usuário:', email);
    const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
    const user = userCredential.user;
    console.log('Usuário autenticado com sucesso:', user.uid);
    
    // Buscar os dados do usuário no Database
    const userRef = ref(database, `users/${user.uid}/profile`);
    const userSnapshot = await get(userRef);
    
    // Dados para enviar para o cliente
    const userData = {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      profile: userSnapshot.exists() ? userSnapshot.val() : {}
    };
    
    // Atualizar último login
    await set(ref(database, `users/${user.uid}/lastLogin`), new Date().toISOString());
    
    // Obter token
    const token = await user.getIdToken();
    console.log('Token gerado para o usuário:', token.substring(0, 20) + '...');
    
    return res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      user: userData,
      token: token
    });
  } catch (error) {
    console.error('Erro no login:', error.code, error.message);
    return res.status(400).json({
      success: false,
      message: getErrorMessage(error.code)
    });
  }
};

// Registro
exports.register = async (req, res) => {
  try {
    const { email, password, role = 'common', is_premium = true, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Cria usuário no Firebase Auth (Client SDK)
    const userCredential = await createUserWithEmailAndPassword(clientAuth, email, password);
    const user = userCredential.user;

    // Salva informações do usuário no Database
    const profileData = {
      email: user.email,
      name: name || email.split('@')[0],
      role,
      is_premium,
      emailVerified: user.emailVerified,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    await set(ref(database, `users/${user.uid}/profile`), profileData);
    await set(ref(database, `users/${user.uid}/lastLogin`), new Date().toISOString());

    // Define custom claims (Admin SDK)
    await admin.auth().setCustomUserClaims(user.uid, { role, is_premium });

    // Obter token para o usuário
    const token = await user.getIdToken();

    // Dados para enviar para o cliente
    const userData = {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      profile: profileData
    };

    return res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      user: userData,
      token: token
    });
  } catch (error) {
    console.error('Erro no registro:', error.code, error.message || error);
    return res.status(400).json({
      success: false,
      message: getErrorMessage(error.code || error.message)
    });
  }
};

// Verificar status de autenticação
exports.checkAuth = async (req, res) => {
  try {
    // O middleware de autenticação já terá verificado o token
    // e adicionado as informações do usuário ao objeto req
    if (req.user) {
      // Buscar os dados do perfil do usuário no Database
      const userRef = ref(database, `users/${req.user.uid}/profile`);
      const userSnapshot = await get(userRef);
      
      return res.status(200).json({
        success: true,
        authenticated: true,
        user: {
          uid: req.user.uid,
          email: req.user.email,
          emailVerified: req.user.email_verified,
          profile: userSnapshot.exists() ? userSnapshot.val() : {}
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        authenticated: false
      });
    }
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao verificar autenticação'
    });
  }
};

// Obter perfil do usuário
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Buscar os dados do perfil do usuário
    const userRef = ref(database, `users/${userId}/profile`);
    const userSnapshot = await get(userRef);
    
    if (!userSnapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: 'Perfil não encontrado'
      });
    }
    
    return res.status(200).json({
      success: true,
      profile: userSnapshot.val()
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar perfil do usuário',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};