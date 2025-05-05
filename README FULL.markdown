# ConfLoto - Sistema de Gerenciamento de Apostas em Loterias

## Descrição
**ConfLoto** é uma aplicação web para gerenciamento de apostas em loterias brasileiras, incluindo Mega-Sena, Lotofácil, +Milionária, Quina e Dia de Sorte. O sistema permite que usuários Lancem apostas individuais para conferencias, participem de bolões e que administradores gerenciem usuários e configurações. A aplicação é composta por um backend (Node.js/Express com Firebase) e um frontend (React com Firebase Authentication).

## Funcionalidades
- **Autenticação de Usuários**: Registro, login e logout com email e senha, protegidos por tokens JWT.
- **Gerenciamento de Usuários**: Visualização e edição de perfis, administração de papéis (comum, premium, admin).
- **Apostas Individuais**: Criação e histórico de apostas validadas conforme as regras de cada loteria.
- **Bolões**: Criação e participação em bolões (restrito a usuários premium), com gerenciamento de participantes.
- **Administração**: Painel para gerenciamento de usuários, apostas e configurações gerais (parcialmente implementado).
- **Resultados e Notificações**: Integração com API de resultados e notificações via Telegram (a ser implementado).

## Tecnologias Utilizadas
### Backend
- **Node.js** (16+): Ambiente de execução.
- **Express**: Framework para construção de APIs.
- **Firebase**:
  - **Authentication**: Gerenciamento de usuários.
  - **Realtime Database**: Armazenamento de apostas e dados de usuários.
- **Dependências**: `cors`, `firebase-admin`.
- **Ferramentas de Desenvolvimento**: `nodemon`, `jest`, `eslint`.

### Frontend
- **React** (17+): Biblioteca para construção de interfaces.
- **Firebase**: Autenticação de usuários.
- **Vite**: Ferramenta de build e desenvolvimento.
- **Dependências**: `react`, `react-dom`, `firebase`.
- **Ferramentas de Desenvolvimento**: `@vitejs/plugin-react`, `eslint`, `prettier`.

## Estrutura do Projeto
```
lottery/
├── lottery-backend-node/
│   ├── scripts/              # Scripts utilitários (ex.: set_admin.js)
│   ├── src/
│   │   ├── config/           # Configurações (ex.: Firebase)
│   │   ├── middleware/       # Middlewares (ex.: autenticação)
│   │   ├── models/           # Modelos de dados (ex.: Bet, User)
│   │   ├── routes/           # Rotas da API (ex.: auth, bet)
│   │   └── index.js          # Ponto de entrada do backend
│   ├── .env                  # Variáveis de ambiente
│   ├── .gitignore
│   ├── firebase_rules.json   # Regras de segurança do Firebase
│   ├── package.json
│   ├── README.markdown
│   └── serviceAccountKey.json # Credenciais do Firebase
├── lottery-frontend-react/
│   ├── assets/               # Recursos estáticos (ex.: favicon.ico)
│   ├── css/                  # Estilos (ex.: styles.css)
│   ├── js/
│   │   ├── components/       # Componentes React (ex.: Login.jsx, BetForm.jsx)
│   │   ├── services/         # Serviços (ex.: api.js, firebase.js)
│   │   └── app.jsx           # Componente principal
│   ├── .env                  # Variáveis de ambiente
│   ├── .gitignore
│   ├── index.html            # Arquivo HTML principal
│   ├── package.json
│   ├── README.md
│   └── vite.config.js        # Configuração do Vite
└── Project Requirements - ConfLoto.markdown # Documentação de requisitos
```

## Pré-requisitos
- **Node.js** (16+ para backend, 18+ para frontend): [Download](https://nodejs.org/).
- **Firebase**:
  - Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
  - Habilite **Authentication** (método Email/Senha).
  - Configure o **Realtime Database** e copie as credenciais para os arquivos `.env`.
- **Navegador moderno**: Chrome, Firefox, Safari, Edge.
- **Conexão à internet**: Necessária para carregar dependências e acessar o Firebase.

## Instalação
### Backend
1. Clone o repositório:
   ```bash
   git clone https://github.com/<seu-usuario>/lottery.git
   cd lottery/lottery-backend-node
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
5. Inicie o servidor:
   ```bash
   npm run dev
   ```
   - O backend estará disponível em `http://localhost:5000`.

### Frontend
1. Navegue até o diretório do frontend:
   ```bash
   cd lottery/lottery-frontend-react
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente em `.env`:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_DATABASE_URL=your-database-url
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   VITE_API_BASE_URL=http://localhost:5000
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   - O frontend estará disponível em `http://localhost:8000`.

## Uso
1. **Registro/Login**: Crie uma conta ou faça login na página inicial.
2. **Perfil**: Visualize e edite informações do perfil.
3. **Apostas**: Crie apostas individuais selecionando modalidade, números e concursos.
4. **Bolões**: (Parcialmente implementado) Crie ou participe de bolões (restrito a usuários premium).
5. **Admin**: (A ser implementado) Gerencie usuários e configurações via painel administrativo.

## Desenvolvimento
- **Depuração**: Use o console do navegador (F12) para verificar erros.
- **Hot Reload**:
  - Backend: `nodemon` recarrega automaticamente.
  - Frontend: Vite suporta recarregamento automático.
- **Linting e Formatação**:
  ```bash
  npm run lint
  npm run format
  ```

## Build e Deploy
### Backend
1. Build (opcional, pois é executado diretamente):
   ```bash
   npm start
   ```
2. Hospedagem: Use plataformas como **Heroku** ou **Google Cloud Run**.
   - Configure variáveis de ambiente e o `serviceAccountKey.json` na plataforma.

### Frontend
1. Build para produção:
   ```bash
   npm run build
   ```
   - Os arquivos serão gerados em `dist`.
2. Visualizar build:
   ```bash
   npm run preview
   ```
3. Hospedagem: Use **Vercel**, **Netlify** ou **Firebase Hosting**.
   - Exemplo para Vercel:
     ```bash
     vercel
     ```
   - Configure as variáveis de ambiente no painel da plataforma.

## Próximos Passos
- Implementar componentes `GroupBetForm.jsx` e `AdminPanel.jsx`.
- Adicionar integração com API de resultados de loterias (ex.: Caixa Econômica).
- Configurar notificações via Telegram com a biblioteca `telegraf`.
- Adicionar testes unitários com `jest` e `react-testing-library`.
- Melhorar a interface com bibliotecas como **Tailwind CSS** ou **Material-UI**.
- Garantir conformidade com **WCAG 2.1** para acessibilidade.

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