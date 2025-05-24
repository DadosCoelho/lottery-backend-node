# API com Node.js e Express

Esta é uma API backend construída com Node.js e Express.

## Instalação

```bash
npm install
```

## Configuração

Crie um arquivo `.env` na raiz da pasta `api` com o seguinte conteúdo:

```
PORT=3000
NODE_ENV=development
```

## Executando a API

### Modo desenvolvimento
```bash
npm run dev
```

### Modo produção
```bash
npm start
```

## Rotas disponíveis

- `GET /`: Rota padrão que retorna uma mensagem de status
- `GET /api/teste`: Rota de teste
- `GET /api/items`: Obter lista de itens
- `GET /api/items/:id`: Obter item específico pelo ID
- `POST /api/items`: Criar novo item

## Estrutura do projeto

```
api/
├── controllers/      # Controladores para lógica de negócio
├── routes/           # Definições de rotas
├── .env              # Variáveis de ambiente (não versionado)
├── server.js         # Arquivo principal
└── package.json      # Dependências e scripts
``` 