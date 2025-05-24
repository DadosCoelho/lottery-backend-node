const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

console.log('🚀 Iniciando API de Loterias...');

// Verificar se o arquivo de credenciais do Firebase Admin existe
const credentialsPath = path.join(__dirname, 'conf-loto-firebase-adminsdk-fbsvc-2cee54fe44.json');
if (fs.existsSync(credentialsPath)) {
  console.log('✅ Arquivo de credenciais do Firebase Admin encontrado');
} else {
  console.warn('⚠️ Arquivo de credenciais do Firebase Admin não encontrado. O servidor pode encontrar problemas com autenticação.');
}

// Verificar se o arquivo de regras do Firebase existe
const rulesPath = path.join(__dirname, '..', 'database.rules.json');
if (fs.existsSync(rulesPath)) {
  console.log('✅ Arquivo de regras do Firebase encontrado');
} else {
  console.warn('⚠️ Arquivo de regras do Firebase não encontrado. O servidor usará as regras padrão.');
}

// Iniciar o servidor
console.log('🔄 Iniciando servidor...');
const server = spawn('node', ['server.js'], { stdio: 'inherit' });

server.on('error', (error) => {
  console.error('❌ Erro ao iniciar o servidor:', error.message);
  process.exit(1);
});

// Verificar se o servidor está online após 3 segundos
setTimeout(() => {
  const http = require('http');
  const PORT = process.env.PORT || 3000;
  
  const req = http.request({
    host: 'localhost',
    port: PORT,
    path: '/',
    method: 'GET',
    timeout: 2000
  }, (res) => {
    if (res.statusCode === 200) {
      console.log(`✅ Servidor iniciado com sucesso! Acesse: http://localhost:${PORT}`);
    } else {
      console.warn(`⚠️ Servidor respondeu com status: ${res.statusCode}`);
    }
  });
  
  req.on('error', (err) => {
    console.error('❌ Erro ao conectar ao servidor. Certifique-se de que a porta não está sendo usada por outro processo.');
    console.error('   Detalhes:', err.message);
  });
  
  req.on('timeout', () => {
    console.error('❌ Timeout ao tentar conectar ao servidor.');
  });
  
  req.end();
}, 3000);

// Capturar CTRL+C e outros sinais para encerrar o servidor
process.on('SIGINT', () => {
  console.log('👋 Encerrando servidor...');
  server.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('👋 Encerrando servidor...');
  server.kill();
  process.exit(0);
}); 