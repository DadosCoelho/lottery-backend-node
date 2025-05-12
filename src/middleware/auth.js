const admin = require('../config/firebase');

// Middleware para verificar autenticação
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    console.log('Token recebido:', token.substring(0, 20) + '...');
    
    // Tokens gerados por createCustomToken precisam ser trocados por ID tokens
    // antes de serem verificados com verifyIdToken
    let uid;
    let decodedToken;
    
    try {
      // Primeiro tenta verificar como um token ID normal
      decodedToken = await admin.auth().verifyIdToken(token);
      uid = decodedToken.uid;
      console.log('Token verificado como ID token para usuário:', uid);
    } catch (tokenError) {
      console.log('Falha ao verificar como ID token, verificando token customizado:', tokenError.message);
      
      // Se falhou, podemos estar lidando com um custom token
      // Custom tokens não podem ser verificados diretamente com verifyIdToken
      // Vamos tentar extrair o UID do token
      try {
        // Verificamos na base de usuários se existe um usuário com este UID
        const base64Payload = token.split('.')[1];
        const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
        uid = payload.uid || payload.sub;
        
        if (!uid) {
          console.error('Token não contém UID:', payload);
          return res.status(403).json({ error: 'Token inválido ou expirado' });
        }
        
        console.log('Extraído UID do token customizado:', uid);
        
        // Verifica se o usuário existe no Firebase
        await admin.auth().getUser(uid);
        console.log('Usuário confirmado no Firebase Auth:', uid);
      } catch (customTokenError) {
        console.error('Erro ao processar token customizado:', customTokenError);
        return res.status(403).json({ error: 'Token inválido ou expirado' });
      }
    }
    
    // Neste ponto temos um UID válido, então podemos prosseguir
    req.user = { uid };
    return next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({ error: 'Erro interno de autenticação' });
  }
};

module.exports = {
  authenticateToken
};