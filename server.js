const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { admin } = require('./config/firebase');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 'https://lottery-backend-node.onrender.com';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar rotas
const apiRoutes = require('./routes');

// Carregar regras de segurança do Firebase
const loadFirebaseRules = async () => {
  try {
    const rulesPath = path.join(__dirname, '..', 'database.rules.json');
    if (fs.existsSync(rulesPath)) {
      console.log('Carregando regras de segurança do Firebase...');
      const rulesContent = fs.readFileSync(rulesPath, 'utf8');
      const rules = JSON.parse(rulesContent);

      // Aplicar regras usando o SDK Admin
      if (admin.database) {
        await admin.database().setRules(rules);
        console.log('Regras de segurança do Firebase atualizadas com sucesso');
      } else {
        console.log('Firebase Admin SDK não está completamente inicializado. Regras não aplicadas.');
      }
    } else {
      console.log('Arquivo de regras database.rules.json não encontrado');
    }
  } catch (error) {
    console.error('Erro ao atualizar regras de segurança do Firebase:', error);
  }
};

// Aplicar regras de segurança se não estiver em produção
if (process.env.NODE_ENV !== 'production') {
  loadFirebaseRules();
}

// Usar rotas
app.use('/api', apiRoutes);

// Rota simples para verificar se a API está funcionando
app.get('/', (req, res) => {
  res.send('API de Loterias está ativa!');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
}); 