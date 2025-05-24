# API de Loterias com Node.js e Express

Esta é a API backend para a aplicação "Lottery Online", construída com Node.js e o framework Express. Ela se integra com o Firebase para autenticação de usuários e persistência de dados (Realtime Database), além de consumir uma API externa para resultados de loterias.

## Funcionalidades Principais

*   **Autenticação de Usuários:** Gerenciamento de login e registro de usuários utilizando o Firebase Authentication.
*   **Gerenciamento de Apostas:** Criação, consulta e acompanhamento de apostas individuais e em grupo, com dados persistidos no Firebase Realtime Database.
*   **Consulta de Resultados de Loterias:** Atua como um proxy para uma API externa, permitindo consultar resultados de jogos e concursos específicos de diversas loterias.
*   **Estrutura Modular:** Organização clara de controladores, rotas e middlewares para facilitar a manutenção e a escalabilidade do projeto.

## Instalação

Para configurar e executar o projeto localmente, siga os passos abaixo:

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/DadosCoelho/lottery-backend-node.git
    cd lottery-backend-node
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```

## Configuração

Para que a API funcione corretamente, é necessário configurar algumas variáveis de ambiente e credenciais do Firebase.

1.  **Variáveis de Ambiente (`.env`):**
    Crie um arquivo `.env` na raiz do projeto (`lottery-backend-node/`) com o seguinte conteúdo:

    ```
    PORT=3000
    NODE_ENV=development
    ```
    *   `PORT`: Define a porta em que a API será executada (ex: `3000`).
    *   `NODE_ENV`: Define o ambiente de execução (`development` para desenvolvimento, `production` para produção).

2.  **Credenciais do Firebase Admin SDK (`conf-loto-firebase-adminsdk-fbsvc-2cee54fe44.json`):**
    Este projeto utiliza o Firebase Admin SDK para funcionalidades como verificação de tokens de autenticação e gerenciamento de regras do Realtime Database. É **essencial** que o arquivo de credenciais do Firebase Admin SDK esteja presente na raiz do projeto.

    *   **Obtenção:** Você deve gerar este arquivo no console do Firebase (Vá em `Configurações do Projeto` > `Contas de Serviço` > `Gerar nova chave privada`).
    *   **Localização:** Renomeie o arquivo baixado para `conf-loto-firebase-adminsdk-fbsvc-2cee54fe44.json` e coloque-o diretamente na pasta `lottery-backend-node/`.
    *   **SEGURANÇA:** Este arquivo contém chaves sensíveis e **NÃO DEVE SER VERSIONADO** em sistemas de controle de versão públicos (já está incluído no `.gitignore`).

3.  **Regras de Segurança do Firebase Realtime Database (`database.rules.json`):**
    O arquivo `database.rules.json` define as regras de acesso ao Firebase Realtime Database. O backend tenta carregar e aplicar essas regras na inicialização (especialmente em ambiente de desenvolvimento). Certifique-se de que este arquivo esteja acessível no caminho `../database.rules.json` a partir da raiz do backend (no repositório completo, ele geralmente fica na raiz do frontend).

    *   **Exemplo de Regras (para referência):**
        ```json
        {
          "rules": {
            ".read": "auth != null",
            ".write": "auth != null",
            "bets": {
              ".read": "auth != null",
              ".write": "auth != null",
              "$betId": {
                ".read": "auth != null && data.child('userId').val() === auth.uid",
                ".write": "auth != null && (newData.child('userId').val() === auth.uid || !data.exists())"
              }
            },
            "users": {
              "$userId": {
                ".read": "auth != null && auth.uid === $userId",
                ".write": "auth != null && auth.uid === $userId",
                "bets": {
                  ".read": "auth != null && auth.uid === $userId",
                  ".write": "auth != null && auth.uid === $userId"
                }
              }
            }
          }
        }
        ```
        Estas regras garantem que apenas usuários autenticados possam ler/escrever dados e que cada usuário só possa acessar suas próprias apostas e perfil.

## Executando a API

Você pode executar a API em diferentes modos:

### Modo Desenvolvimento

Para iniciar a API com `nodemon` (que monitora alterações nos arquivos e reinicia o servidor automaticamente):

```
npm run dev
```
### Modo Produção
Para iniciar a API em modo de produção:
```
npm start
```
### Modo Seguro (Verificação de Credenciais)
Existe um script start:safe que verifica a presença dos arquivos de credenciais e regras do Firebase antes de iniciar o servidor, fornecendo avisos se eles não forem encontrados.
```
npm run start:safe
```
### Rotas Disponíveis
A API oferece as seguintes rotas:

### Rotas Públicas
* GET /: Rota padrão que retorna uma mensagem de status (API de Loterias está ativa!).
* GET /api/teste: Rota de teste simples.
* POST /api/auth/login: Autentica um usuário com e-mail e senha.
* POST /api/auth/register: Registra um novo usuário com e-mail e senha.
* GET /api/loteria/:jogo/:concurso: Rota de proxy para a API externa de loterias. Permite consultar resultados de jogos e concursos específicos (ex: /api/loteria/megasena/2500).
### Rotas Protegidas (Requerem Autenticação com Token Bearer no cabeçalho Authorization)
* GET /api/auth/check: Verifica o status de autenticação do usuário.
* GET /api/users/profile: Obtém o perfil do usuário autenticado.
* POST /api/bets: Cria uma nova aposta individual.
* POST /api/bets/group: Cria uma nova aposta em grupo.
* GET /api/bets: Obtém todas as apostas do usuário autenticado.
* GET /api/bets/:id: Obtém os detalhes de uma aposta específica do usuário autenticado.
* GET /api/items: Exemplo de rota para obter uma lista de itens.
* GET /api/items/:id: Exemplo de rota para obter um item específico pelo ID.
* POST /api/items: Exemplo de rota para criar um novo item.
### Estrutura do Projeto
```
lottery-backend-node/
├── config/             # Configurações (ex: Firebase)
│   └── firebase.js     # Configuração e inicialização do Firebase Admin SDK
├── controllers/        # Lógica de negócio para cada rota (auth, bet, example)
│   ├── authController.js
│   ├── betController.js
│   └── exampleController.js
├── middlewares/        # Middlewares (ex: autenticação)
│   └── authMiddleware.js
├── routes/             # Definições de rotas da API
│   ├── auth.js         # Rotas de autenticação
│   ├── bets.js         # Rotas de apostas
│   ├── items.js        # Rotas de exemplo
│   └── index.js        # Agregador de todas as rotas
├── .env                # Variáveis de ambiente (NÃO VERSIONADO)
├── .gitignore          # Arquivos e pastas a serem ignorados pelo Git
├── package.json        # Dependências e scripts do projeto
├── README.md           # Este arquivo
├── server.js           # Arquivo principal do servidor Express
├── start.js            # Script para iniciar o servidor com verificações
└── conf-loto-firebase-adminsdk-fbsvc-2cee54fe44.json # 
```
### Credenciais do Firebase Admin SDK (NÃO VERSIONADO)
## Dependências
As principais dependências utilizadas neste projeto são:

* express: Framework web robusto para Node.js.
* cors: Middleware para habilitar Cross-Origin Resource Sharing (CORS).
* dotenv: Carrega variáveis de ambiente de um arquivo .env.
* firebase: SDK do Firebase para o lado do cliente (usado para autenticação).
* firebase-admin: SDK do Firebase para o lado do servidor (usado para verificar tokens de autenticação e gerenciar o Realtime Database).
* axios: Cliente HTTP baseado em Promises para fazer requisições a APIs externas.
* nodemon (devDependencies): Ferramenta para monitorar alterações e reiniciar o servidor automaticamente em desenvolvimento.