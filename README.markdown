# ConfLoto - Backend (Node.js)

## Descrição
Este é o backend do sistema **ConfLoto**, uma aplicação web para gerenciamento de apostas em loterias brasileiras, incluindo Mega-Sena, Lotofácil, +Milionária, Quina e Dia de Sorte. Construído com **Node.js** e **Express**, utiliza **Firebase** para autenticação e armazenamento de dados no **Realtime Database**. O backend fornece APIs para autenticação, gerenciamento de usuários, apostas individuais e bolões.

## Funcionalidades
- **Autenticação**: Registro, login e validação de usuários com tokens JWT.
- **Gerenciamento de Usuários**: Visualização, edição de perfis e administração de papéis (comum, premium, admin).
- **Apostas Individuais**: Criação e listagem de apostas validadas conforme as regras de cada loteria.
- **Bolões**: Criação (restrita a usuários premium) e participação em bolões, com gerenciamento de participantes.
- **Administração**: Configuração inicial de administradores via script e gerenciamento de dados (parcialmente implementado).

## Tecnologias Utilizadas
- **Node.js** (16+): Ambiente de execução.
- **Express**: Framework para construção de APIs.
- **Firebase**:
  - **Authentication**: Gerenciamento de usuários.
  - **Realtime Database**: Armazenamento de apostas, bolões e dados de usuários.
- **Dependências**:
  - `cors`: Suporte a requisições cross-origin.
  - `firebase-admin`: Integração com Firebase.
- **Ferramentas de Desenvolvimento**:
  - `nodemon`: Recarregamento automático em desenvolvimento.
  - `jest`: Testes unitários.
  - `eslint`: Linting de código.

## Estrutura do Projeto
```
lottery-backend-node/
├── scripts/
│   └── set_admin.js           # Script para configurar usuário admin
├── src/
│   ├── config/
│   │   └── firebase.js       # Configuração do Firebase
│   ├── middleware/
│   │   └── auth.js           # Middleware de autenticação
│   ├── models/
│   │   ├── bet.js            # Modelo de aposta individual
│   │   ├── groupBet.js       # Modelo de bolão
│   │   └── user.js           # Modelo de usuário
│   ├── routes/
│   │   ├── auth.js           # Rotas de autenticação
│   │   ├── bet.js            # Rotas de apostas
│   │   ├── groupBet.js       # Rotas de bolões
│   │   └── user.js           # Rotas de gerenciamento de usuários
│   └── index.js              # Ponto de entrada do backend
├── .env                      # Variáveis de ambiente
├── .gitignore
├── firebase_rules.json       # Regras de segurança do Firebase
├── package.json
├── README.markdown           # Este arquivo
├── serviceAccountKey.json    # Credenciais do Firebase
└── test_firebase.js          # Script de teste de conexão com Firebase
```

## Pré-requisitos
- **Node.js** (16+): [Download](https://nodejs.org/).
- **Firebase**:
  - Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
  - Habilite **Authentication** (método Email/Senha).
  - Configure o **Realtime Database** e obtenha as credenciais.
- **Conexão à internet**: Necessária para acessar o Firebase.

## Instalação
1. Clone o repositório:
   ```bash
   git clone https://github.com/<seu-usuario>/lottery-backend-node.git
   cd lottery-backend-node
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente em `.env`:
   ```env
   FIREBASE_DATABASE_URL=https://conf-loto-default-rtdb.firebaseio.com
   PORT=5000
   ```
4. Adicione o arquivo `serviceAccountKey.json` na raiz do projeto (obtido no Firebase Console).
5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   - O backend estará disponível em `http://localhost:5000`.

## Uso
- **Teste de Conexão**: Execute `node test_firebase.js` para verificar a conexão com o Firebase.
- **Rotas da API**:
  - `/auth/register`: Registra um novo usuário (POST).
  - `/auth/login`: Realiza login e retorna dados do usuário (POST).
  - `/user/profile`: Obtém ou atualiza o perfil do usuário (GET, PUT).
  - `/user/set_role`: Altera o papel de um usuário (admin, POST).
  - `/bet/create`: Cria uma aposta individual (POST).
  - `/bet/list`: Lista apostas do usuário (GET).
  - `/group_bet/create`: Cria um bolão (premium, POST).
  - `/group_bet/join/:group_bet_id`: Ingressa em um bolão (POST).
- **Configuração de Admin**: Execute o script para configurar um usuário como administrador:
  ```bash
  npm run set-admin
  ```
  - Edite `scripts/set_admin.js` com o UID do usuário desejado.

## Desenvolvimento
- **Depuração**: Verifique logs no console ou use ferramentas como `Postman` para testar APIs.
- **Hot Reload**: O `nodemon` recarrega automaticamente o servidor ao salvar alterações.
- **Linting**:
  ```bash
  npm run lint
  ```
- **Testes**:
  ```bash
  npm run test
  ```

## Build e Deploy
1. Build (execução direta, sem build adicional):
   ```bash
   npm start
   ```
2. Hospedagem: Use plataformas como **Heroku** ou **Google Cloud Run**.
   - Configure o `serviceAccountKey.json` e variáveis de ambiente na plataforma.
   - Exemplo para Heroku:
     ```bash
     heroku create
     git push heroku main
     ```

## Próximos Passos
- Implementar integração com API de resultados de loterias (ex.: Caixa Econômica).
- Configurar notificações via Telegram usando a biblioteca `telegraf`.
- Adicionar testes unitários para cobrir 80% das funcionalidades críticas.
- Implementar cache (ex.: Redis) para endpoints frequentemente acessados.
- Configurar logging de erros para monitoramento em produção.

## Contribuição
1. Faça um fork do repositório.
2. Crie uma branch: `git checkout -b minha-feature`.
3. Commit: `git commit -m "Adiciona minha feature"`.
4. Push: `git push origin minha-feature`.
5. Abra um Pull Request.

## Licença
MIT License.

## Contato
- **Email**: <seu-email@example.com>
- **GitHub**: <seu-usuario>