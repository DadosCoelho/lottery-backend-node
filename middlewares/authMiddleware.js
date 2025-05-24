const { auth } = require('../config/firebase');

// Middleware para verificar se o usuário está autenticado
const authenticate = async (req, res, next) => {
  try {
    console.log('⚡ Nova solicitação autenticada');
    
    // Verificar cabeçalhos de autenticação
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('❌ Authorization header não fornecido');
      return res.status(401).json({
        success: false,
        message: 'Acesso não autorizado. Token não fornecido.'
      });
    }
    
    // Verificar se o formato do token está correto (Bearer token)
    if (!authHeader.startsWith('Bearer ')) {
      console.log('❌ Formato de token inválido:', authHeader.substring(0, 15) + '...');
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido. Use o formato "Bearer TOKEN".'
      });
    }
    
    // Extrair o token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log('❌ Token vazio após separação');
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido após prefixo Bearer.'
      });
    }
    
    console.log('🔑 Token recebido:', token.substring(0, 15) + '...');
    
    try {
      // Verificar token com Firebase Admin SDK
      const decodedToken = await auth.verifyIdToken(token);
      console.log('✅ Token verificado para usuário:', decodedToken.uid);
      
      // Adicionar informações do usuário ao objeto req para uso posterior
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      };
      
      // Prosseguir para o próximo middleware ou controlador
      next();
    } catch (tokenError) {
      console.error('❌ Erro ao verificar token:', tokenError.message);
      
      let mensagem = 'Acesso não autorizado. Token inválido ou expirado.';
      
      if (tokenError.message.includes('expired')) {
        mensagem = 'Token expirado. Por favor, faça login novamente.';
      } else if (tokenError.message.includes('invalid')) {
        mensagem = 'Token inválido. Por favor, faça login novamente.';
      }
      
      return res.status(401).json({
        success: false,
        message: mensagem,
        errorDetails: process.env.NODE_ENV !== 'production' ? tokenError.message : undefined
      });
    }
  } catch (error) {
    console.error('❌ Erro no middleware de autenticação:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor durante autenticação.'
    });
  }
};

module.exports = { authenticate }; 