# Requisitos do Projeto ConfLoto

## Visão Geral
O **ConfLoto** é uma aplicação web para gerenciamento de apostas em loterias brasileiras, incluindo Mega-Sena, Lotofácil, +Milionária, Quina e Dia de Sorte. O sistema permite que usuários façam apostas individuais, participem de bolões, e que administradores gerenciem usuários e configurações. A aplicação é composta por um backend (Node.js/Express com Firebase) e um frontend (React com Firebase Authentication).

## Requisitos Funcionais

### RF1: Autenticação de Usuários
- **RF1.1**: O sistema deve permitir que usuários se registrem com email e senha.
- **RF1.2**: O sistema deve permitir login com email e senha, retornando um token JWT válido.
- **RF1.3**: O sistema deve suportar logout, invalidando a sessão do usuário.
- **RF1.4**: O sistema deve proteger rotas sensíveis, exigindo autenticação via token JWT.

### RF2: Gerenciamento de Usuários
- **RF2.1**: Usuários devem poder visualizar e editar seu perfil (nome, email, preferências).
- **RF2.2**: Administradores devem poder alterar o papel de um usuário (comum, premium, admin).
- **RF2.3**: Administradores devem poder visualizar a lista de todos os usuários registrados.
- **RF2.4**: Usuários premium devem ter privilégios adicionais, como criar bolões.

### RF3: Apostas Individuais
- **RF3.1**: Usuários autenticados devem poder criar apostas para qualquer loteria suportada (Mega-Sena, Lotofácil, +Milionária, Quina, Dia de Sorte).
- **RF3.2**: O sistema deve validar as apostas de acordo com as regras de cada loteria (ex.: número mínimo/máximo de dezenas).
- **RF3.3**: Usuários devem poder visualizar o histórico de suas apostas.
- **RF3.4**: O sistema deve armazenar as apostas no Firebase Realtime Database.

### RF4: Bolões
- **RF4.1**: Usuários premium devem poder criar bolões para qualquer loteria suportada.
- **RF4.2**: Qualquer usuário autenticado deve poder ingressar em um bolão existente, sujeito a restrições (ex.: vagas disponíveis).
- **RF4.3**: O sistema deve gerenciar a divisão de prêmios em bolões com base na participação de cada usuário.
- **RF4.4**: Usuários devem poder visualizar os detalhes de bolões em que participam (apostas, membros, status).

### RF5: Resultados e Notificações (A ser implementado)
- **RF5.1**: O sistema deve integrar com uma API externa (ex.: API da Caixa Econômica) para consultar resultados de sorteios.
- **RF5.2**: O sistema deve notificar usuários sobre resultados de suas apostas individuais e bolões.
- **RF5.3**: Notificações devem ser enviadas via Telegram usando um bot (ex.: com a biblioteca `telegraf`).
- **RF5.4**: Usuários devem poder optar por receber ou não notificações.

### RF6: Administração
- **RF6.1**: Administradores devem ter acesso a um painel para gerenciar usuários, apostas e bolões.
- **RF6.2**: Administradores devem poder configurar regras gerais do sistema (ex.: limites de apostas, prazos).
- **RF6.3**: O sistema deve permitir a configuração inicial de um usuário admin via script (`set_admin.js`).

## Requisitos Não Funcionais

### RNF1: Desempenho
- **RNF1.1**: O sistema deve suportar até 1.000 usuários simultâneos sem degradação significativa de desempenho.
- **RNF1.2**: As respostas das APIs devem ter latência média inferior a 500ms em condições normais.
- **RNF1.3**: O frontend deve carregar em menos de 3 segundos em conexões 4G padrão.

### RNF2: Segurança
- **RNF2.1**: Todas as comunicações entre frontend, backend e Firebase devem usar HTTPS.
- **RNF2.2**: Dados sensíveis (ex.: senhas, chaves Firebase) devem ser armazenados de forma segura (ex.: variáveis de ambiente).
- **RNF2.3**: O sistema deve implementar validação de entrada para prevenir injeções (SQL, XSS, etc.).
- **RNF2.4**: O Firebase Realtime Database deve ter regras de segurança configuradas para restringir acesso não autorizado.

### RNF3: Escalabilidade
- **RNF3.1**: O backend deve ser compatível com plataformas de hospedagem escaláveis (ex.: Heroku, Google Cloud Run).
- **RNF3.2**: O sistema deve suportar a adição de cache (ex.: Redis) para endpoints frequentemente acessados.
- **RNF3.3**: O frontend deve ser otimizado para builds estáticas, compatíveis com CDNs (ex.: Vercel, Netlify).

### RNF4: Usabilidade
- **RNF4.1**: A interface do frontend deve ser responsiva, funcionando em dispositivos móveis e desktops.
- **RNF4.2**: O sistema deve seguir diretrizes de acessibilidade (WCAG 2.1) para garantir uso por pessoas com deficiências.
- **RNF4.3**: Mensagens de erro devem ser claras e orientar o usuário sobre como corrigir problemas.

### RNF5: Manutenibilidade
- **RNF5.1**: O código deve seguir padrões de linting (ESLint) e formatação (Prettier) para consistência.
- **RNF5.2**: O sistema deve incluir testes unitários (ex.: com Jest) para pelo menos 80% das funcionalidades críticas.
- **RNF5.3**: A documentação (README, comentários no código) deve ser clara e atualizada.

### RNF6: Compatibilidade
- **RNF6.1**: O backend deve rodar em ambientes Node.js 16+.
- **RNF6.2**: O frontend deve ser compatível com navegadores modernos (Chrome, Firefox, Safari, Edge).
- **RNF6.3**: O sistema deve integrar com o Firebase Realtime Database e Authentication sem dependências de outros serviços de banco de dados.

### RNF7: Disponibilidade
- **RNF7.1**: O sistema deve ter disponibilidade de pelo menos 99,5% em produção.
- **RNF7.2**: Erros críticos devem ser registrados (ex.: com logging no backend) para análise e correção.

## Restrições
- O sistema deve usar Firebase para autenticação e armazenamento de dados, sem suporte a outros bancos de dados.
- A integração com resultados de loterias e notificações via Telegram é planejada, mas ainda não implementada.
- O sistema não suporta apostas reais (pagamentos) ou integração com sistemas de loterias oficiais na versão atual.

## Premissas
- Os usuários têm acesso a um navegador moderno e conexão à internet.
- O backend e o frontend serão hospedados em plataformas compatíveis (ex.: Heroku para backend, Vercel para frontend).
- As loterias suportadas seguem as regras oficiais da Caixa Econômica Federal.
- Um administrador inicial será configurado manualmente para gerenciar o sistema.