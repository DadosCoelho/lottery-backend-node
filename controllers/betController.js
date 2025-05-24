const { adminDatabase, adminAuth } = require('../config/firebase');
const axios = require('axios'); // Certifique-se de que axios está importado

// --- Funções Auxiliares ---

/**
 * Busca o UID de um usuário a partir do seu e-mail no Firebase Authentication.
 * @param {string} email - O e-mail do usuário.
 * @returns {Promise<string|null>} O UID do usuário ou null se não encontrado.
 */
async function getUidByEmail(email) {
  try {
    const userRecord = await adminAuth.getUserByEmail(email);
    return userRecord.uid;
  } catch (error) {
    // Se o usuário não for encontrado, getUserByEmail lança um erro.
    // Capturamos e retornamos null ou lançamos um erro específico.
    console.warn(`[getUidByEmail] Usuário com email ${email} não encontrado no Firebase Auth.`);
    return null;
  }
}

/**
 * Busca o perfil de um usuário no Realtime Database a partir do seu UID.
 * @param {string} uid - O UID do usuário.
 * @returns {Promise<object|null>} O objeto de perfil do usuário ou null se não encontrado.
 */
async function getUserProfileByUid(uid) {
  try {
    const userRef = adminDatabase.ref(`users/${uid}/profile`);
    const snapshot = await userRef.once('value');
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error(`[getUserProfileByUid] Erro ao buscar perfil do usuário ${uid}:`, error);
    return null;
  }
}


// --- Funções de Controlador (existentes e modificadas) ---

// Criar uma nova aposta
exports.createBet = async (req, res) => {
  try {
    const { jogo, concurso, numeros, teimosinha, qtdTeimosinha } = req.body;
    const userId = req.user.uid;

    // Validações básicas
    if (!jogo || !concurso || !numeros) {
      return res.status(400).json({
        success: false,
        message: 'Dados incompletos. Informe jogo, concurso e números.'
      });
    }

    console.log('Dados da aposta recebidos:', { jogo, concurso, numeros });
    console.log('ID do usuário:', userId);

    // Preparar os dados da aposta - evitar possíveis problemas de tipo com os números
    const betNumbers = Array.isArray(numeros) 
      ? numeros 
      : numeros.split(',').map(n => n.trim());

    // Converter concurso para número para facilitar incremento
    const concursoNumero = parseInt(concurso);
    if (isNaN(concursoNumero)) {
      return res.status(400).json({
        success: false,
        message: 'Número de concurso inválido. Deve ser um número.'
      });
    }

    // Determinar quantas apostas devem ser criadas
    const quantidade = teimosinha ? parseInt(qtdTeimosinha) || 1 : 1;
    const apostas = [];
    
    try {
      // Usar o adminDatabase.ref() em vez do ref(database, path)
      // Referência para a coleção de apostas
      const betsRef = adminDatabase.ref('bets');
      
      // Criar cada aposta da teimosinha
      for (let i = 0; i < quantidade; i++) {
        // Dados da aposta
        const betData = {
          userId,
          jogo,
          concurso: (concursoNumero + i).toString(), // Incrementar o número do concurso
          numeros: betNumbers,
          teimosinha: teimosinha,
          qtdTeimosinha: quantidade,
          dataCriacao: new Date().toISOString(),
          status: 'pendente',
          sequenciaTeimosinhaIndex: i, // Índice na sequência da teimosinha
          sequenciaTeimosinhaTotal: quantidade,// Total de apostas na sequência
          consultado: false, // Inicializa como não consultado
          resultadoSorteio: null // Inicializa sem resultado salvo
        };
        
        // Salvar a aposta
        const newBetRef = betsRef.push();
        
        // Adicionar o ID gerado aos dados da aposta
        betData.id = newBetRef.key;
        
        // Salvar a aposta
        await newBetRef.set(betData);
        console.log(`Aposta ${i+1}/${quantidade} salva com sucesso:`, newBetRef.key);

        // Atualizar o perfil do usuário com a nova aposta
        const userBetsRef = adminDatabase.ref(`users/${userId}/bets/${newBetRef.key}`);
        await userBetsRef.set(true);
        
        apostas.push(betData);
      }
      
      console.log(`${quantidade} apostas teimosinha criadas com sucesso`);

      return res.status(201).json({
        success: true,
        message: `${quantidade > 1 ? `${quantidade} apostas teimosinha` : 'Aposta'} registrada${quantidade > 1 ? 's' : ''} com sucesso`,
        bets: apostas
      });
    } catch (dbError) {
      console.error('Erro ao salvar no banco de dados:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao salvar aposta no banco de dados',
        error: dbError.message
      });
    }
  } catch (error) {
    console.error('Erro ao registrar aposta:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro ao registrar aposta',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

// Criar uma nova aposta em grupo
exports.createGroupBet = async (req, res) => {
  try {
    const { jogo, concurso, numeros, teimosinha, qtdTeimosinha, grupo } = req.body;
    const creatorUid = req.user.uid; // O UID do usuário autenticado
    const creatorEmail = req.user.email; // O e-mail do usuário autenticado

    // 1. Validações iniciais
    if (!jogo || !concurso || !numeros || !grupo || !grupo.nome || !grupo.participantes || grupo.participantes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dados incompletos. Informe jogo, concurso, números e dados do grupo (nome e participantes).'
      });
    }

    // 2. Verificar se o criador é um usuário premium e se o perfil existe no Realtime Database
    const creatorProfileSnapshot = await adminDatabase.ref(`users/${creatorUid}`).once('value');
    const creatorProfile = creatorProfileSnapshot.val();

    if (!creatorProfile) {
      return res.status(400).json({ success: false, message: 'Seu perfil de usuário não foi encontrado no banco de dados. Por favor, verifique seu cadastro ou entre em contato com o suporte.' });
    }
    if (!creatorProfile.is_premium) {
      return res.status(403).json({ success: false, message: 'Apenas usuários premium podem criar bolões.' });
    }

    // 3. Resolver e-mails dos participantes para UIDs
    const participantEmails = grupo.participantes.map(p => p.email);
    // Adiciona o e-mail do criador à lista se ainda não estiver presente
    if (!participantEmails.includes(creatorEmail)) {
        participantEmails.push(creatorEmail);
    }

    const participantUids = [];
    for (const email of participantEmails) {
      const uid = await getUidByEmail(email);
      if (uid) {
        participantUids.push(uid);
      } else {
        // Se algum e-mail de participante não corresponder a um UID, rejeita a criação
        return res.status(400).json({ success: false, message: `Participante com e-mail "${email}" não encontrado ou não registrado. Todos os participantes devem ter uma conta.` });
      }
    }

    if (participantUids.length < 1) {
      return res.status(400).json({
        success: false,
        message: 'Um grupo deve ter pelo menos 1 participantes registrados (incluindo o criador).'
      });
    }

    console.log('[createGroupBet] Dados da aposta em grupo recebidos:', { jogo, concurso, numeros, grupo });
    console.log('[createGroupBet] UID do usuário criador:', creatorUid);
    console.log('[createGroupBet] UIDs dos participantes:', participantUids);

    // 4. Preparar números da aposta
    const betNumbers = Array.isArray(numeros)
      ? numeros
      : numeros.split(',').map(n => n.trim());

    // 5. Converter número do concurso para inteiro
    const concursoNumero = parseInt(concurso);
    if (isNaN(concursoNumero)) {
      return res.status(400).json({
        success: false,
        message: 'Número de concurso inválido. Deve ser um número.'
      });
    }

    // 6. Determinar quantidade de apostas (para teimosinha)
    const quantidade = teimosinha ? parseInt(qtdTeimosinha) || 1 : 1;
    const apostas = [];

    try {
      const betsRef = adminDatabase.ref('bets');

      // Preparar o mapa de UIDs para compatibilidade com as regras do Firebase
      const participantUidsMap = {};
      for (const uid of participantUids) {
        participantUidsMap[uid] = true;
      }

      // 7. Criar cada aposta (incluindo teimosinha)
      for (let i = 0; i < quantidade; i++) {
        const newBetRef = betsRef.push();
        const betId = newBetRef.key;

        const groupBetData = {
          id: betId,
          userId: creatorUid, // O UID do criador permanece aqui para facilitar a busca de apostas criadas
          jogo,
          concurso: (concursoNumero + i).toString(),
          numeros: betNumbers,
          teimosinha: teimosinha,
          qtdTeimosinha: quantidade,
          dataCriacao: new Date().toISOString(),
          status: 'pendente',
          tipo: 'grupo',
          sequenciaTeimosinhaIndex: i,
          sequenciaTeimosinhaTotal: quantidade,
          grupo: {
            nome: grupo.nome,
            criadorUid: creatorUid, // Armazena o UID do criador dentro do objeto do grupo
            participantesUids: participantUidsMap, // Armazena os UIDs de todos os participantes como um mapa
            // Opcionalmente, você pode manter a lista original de nomes/e-mails para exibição no frontend
            // participantes: grupo.participantes
          },
          consultado: false,
          resultadoSorteio: null
        };

        await newBetRef.set(groupBetData);
        console.log(`[createGroupBet] Aposta em grupo ${i+1}/${quantidade} salva com sucesso:`, betId);

        // 8. Atualizar o nó 'bets' de CADA participante para incluir esta aposta de grupo
        for (const pUid of participantUids) {
          const userBetsRef = adminDatabase.ref(`users/${pUid}/bets/${betId}`);
          await userBetsRef.set(true); // Define como 'true' para indicar participação
        }

        apostas.push(groupBetData);
      }

      console.log(`[createGroupBet] ${quantidade} apostas teimosinha em grupo criadas com sucesso`);

      return res.status(201).json({
        success: true,
        message: `${quantidade > 1 ? `${quantidade} apostas teimosinha em grupo` : 'Aposta em grupo'} registrada${quantidade > 1 ? 's' : ''} com sucesso`,
        bets: apostas
      });
    } catch (dbError) {
      console.error('[createGroupBet] Erro ao salvar aposta em grupo no banco de dados:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao salvar aposta em grupo no banco de dados',
        error: dbError.message
      });
    }
  } catch (error) {
    console.error('[createGroupBet] Erro ao registrar aposta em grupo:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao registrar aposta em grupo',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

// Obter todas as apostas do usuário (modificado para incluir apostas de grupo onde o usuário é participante)
exports.getUserBets = async (req, res) => {
  try {
    const userId = req.user.uid;
    console.log('[getUserBets] Buscando apostas para o usuário:', userId);

    // Referência para as apostas do usuário (tanto individuais quanto de grupo onde ele é participante)
    const userBetsRef = adminDatabase.ref(`users/${userId}/bets`);

    try {
      const userBetsSnapshot = await userBetsRef.once('value');

      if (!userBetsSnapshot.exists()) {
        console.log('[getUserBets] Nenhuma aposta encontrada para o usuário:', userId);
        return res.status(200).json({
          success: true,
          message: 'Nenhuma aposta encontrada',
          bets: []
        });
      }

      const betIds = Object.keys(userBetsSnapshot.val());
      console.log(`[getUserBets] ${betIds.length} IDs de apostas encontradas para o usuário:`, userId);

      const bets = [];
      for (const betId of betIds) {
        const betSnapshot = await adminDatabase.ref(`bets/${betId}`).once('value');
        if (betSnapshot.exists()) {
          const bet = betSnapshot.val();

          // Enriquecer dados da aposta de grupo com a contagem de participantes para exibição no frontend
          if (bet.tipo === 'grupo' && bet.grupo && bet.grupo.participantesUids) {
            bet.participanteCount = Object.keys(bet.grupo.participantesUids).length;
            // Opcionalmente, você pode buscar os nomes/e-mails dos participantes aqui
            // se o frontend precisar deles para exibição detalhada, mas isso adiciona
            // complexidade e mais chamadas ao banco de dados.
            // Por enquanto, o frontend usará `participanteCount` e `grupo.nome`.
          }

          bets.push(bet);
        }
      }

      return res.status(200).json({
        success: true,
        bets
      });
    } catch (dbError) {
      console.error('[getUserBets] Erro ao acessar o banco de dados:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar apostas do banco de dados',
        error: dbError.message
      });
    }
  } catch (error) {
    console.error('[getUserBets] Erro ao buscar apostas:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar apostas',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

// Obter todas as apostas do usuário
exports.getUserBets = async (req, res) => {
  try {
    const userId = req.user.uid;
    console.log('Buscando apostas para o usuário:', userId);
    
    // Referência para as apostas do usuário usando adminDatabase
    const userBetsRef = adminDatabase.ref(`users/${userId}/bets`);
    
    try {
      // Obter snapshot
      const userBetsSnapshot = await userBetsRef.once('value');
      
      if (!userBetsSnapshot.exists()) {
        console.log('Nenhuma aposta encontrada para o usuário:', userId);
        return res.status(200).json({
          success: true,
          message: 'Nenhuma aposta encontrada',
          bets: []
        });
      }
      
      // Obter os IDs das apostas
      const betIds = Object.keys(userBetsSnapshot.val());
      console.log(`${betIds.length} apostas encontradas para o usuário:`, userId);
      
      // Buscar os detalhes de cada aposta
      const bets = [];
      
      for (const betId of betIds) {
        const betSnapshot = await adminDatabase.ref(`bets/${betId}`).once('value');
        if (betSnapshot.exists()) {
          const bet = betSnapshot.val();
          
          // Adicionar um tipo padrão se não existir (para compatibilidade com apostas antigas)
          if (!bet.tipo) {
            bet.tipo = 'individual';
          }
          
          // Processar dados adicionais para apostas em grupo
          if (bet.tipo === 'grupo' && bet.grupo) {
            // Podemos adicionar informações extras se necessário
            bet.participanteCount = bet.grupo.participantes ? bet.grupo.participantes.length : 0;
          }
          
          bets.push(bet);
        }
      }
      
      return res.status(200).json({
        success: true,
        bets
      });
    } catch (dbError) {
      console.error('Erro ao acessar o banco de dados:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar apostas do banco de dados',
        error: dbError.message
      });
    }
  } catch (error) {
    console.error('Erro ao buscar apostas:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar apostas',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

// Obter detalhes de uma aposta específica
exports.getBetDetails = async (req, res) => {
  try {
    const userId = req.user.uid;
    const betId = req.params.id;
    
    if (!betId) {
      return res.status(400).json({
        success: false,
        message: 'ID da aposta não fornecido'
      });
    }
    
    // Buscar a aposta usando adminDatabase
    const betRef = adminDatabase.ref(`bets/${betId}`);
    
    try {
      const betSnapshot = await betRef.once('value');
      
      if (!betSnapshot.exists()) {
        return res.status(404).json({
          success: false,
          message: 'Aposta não encontrada'
        });
      }
      
      const bet = betSnapshot.val();
      
      // Verificar se a aposta pertence ao usuário
      if (bet.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Acesso não autorizado a esta aposta'
        });
      }
      
      return res.status(200).json({
        success: true,
        bet
      });
    } catch (dbError) {
      console.error('Erro ao acessar o banco de dados:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar detalhes da aposta do banco de dados',
        error: dbError.message
      });
    }
  } catch (error) {
    console.error('Erro ao buscar detalhes da aposta:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar detalhes da aposta',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
}; 

/// Helper function to normalize game name for external API
const normalizarNomeJogo = (jogo) => {
  const mapeamento = {
    'mega-sena': 'megasena',
    'lotofacil': 'lotofacil',
    'quina': 'quina',
    'lotomania': 'lotomania',
    'timemania': 'timemania',
    'dupla-sena': 'duplasena',
    'dia-de-sorte': 'diadesorte',
    'super-sete': 'supersete'
  };
  const jogoNormalizado = jogo.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
  return mapeamento[jogoNormalizado] || 'megasena'; // Padrão para megasena
};

// Helper function to count matches between bet numbers and result numbers
const getMatchCount = (betNumbers, resultNumbers) => {
  // Garante que ambos são arrays de strings e compara
  const betNums = Array.isArray(betNumbers) ? betNumbers.map(String) : [];
  const resultNums = Array.isArray(resultNumbers) ? resultNumbers.map(String) : [];
  
  return betNums.filter(num => resultNums.includes(num)).length;
};

// Helper function to determine if a bet is winning based on match count and game type
const isWinningBet = (matchCount, gameType) => {
  // Definir regras de premiação baseadas no tipo de jogo
  const premiationRules = {
    'megasena': 4,      // 4 ou mais acertos (Quadra)
    'lotofacil': 11,    // 11 ou mais acertos
    'quina': 2,         // 2 ou mais acertos (Duque)
    'lotomania': 15,    // 15 ou mais acertos
    'timemania': 3,     // 3 ou mais acertos
    'dupla-sena': 4,     // 4 ou mais acertos
    'dia-de-sorte': 4,    // 4 ou mais acertos
    'super-sete': 3       // 3 ou mais acertos
  };
  
  // Obter o valor mínimo de acertos para o jogo, ou usar 4 como padrão
  const minMatches = premiationRules[gameType] || 4;
  
  return matchCount >= minMatches;
};

// Verifica e salva o resultado da aposta
exports.checkAndSaveBetResult = async (req, res) => {
  try {
    const { id: betId } = req.params;
    const userId = req.user.uid;

    if (!betId) {
      return res.status(400).json({ success: false, message: 'ID da aposta não fornecido.' });
    }

    const betRef = adminDatabase.ref(`bets/${betId}`);
    const betSnapshot = await betRef.once('value');

    if (!betSnapshot.exists()) {
      return res.status(404).json({ success: false, message: 'Aposta não encontrada.' });
    }

    const bet = betSnapshot.val();

    if (bet.userId !== userId && (!req.user.role || req.user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Acesso não autorizado a esta aposta.' });
    }

    let fetchedResultData = null;
    let newBetStatus = bet.status; // Mantém o status atual por padrão

    // Se o resultado já foi consultado e está salvo, usa os dados salvos
    if (bet.consultado && bet.resultadoSorteio) {
      console.log(`[Backend] Resultado para aposta ${betId} já consultado. Retornando dados salvos.`);
      fetchedResultData = bet.resultadoSorteio;
      newBetStatus = bet.status; // Mantém o status que já estava salvo
    } else {
      // Se não foi consultado, busca da API externa
      console.log(`[Backend] Consultando resultado para aposta ${betId} da API externa.`);
      const jogoNormalizado = normalizarNomeJogo(bet.jogo);
      const externalApiUrl = `https://api.guidi.dev.br/loteria/${jogoNormalizado}/${bet.concurso}`;

      const externalApiResponse = await axios.get(externalApiUrl);
      const externalResult = externalApiResponse.data;

      // Processa os dados da API externa para um formato consistente
      fetchedResultData = {
        concurso: externalResult.numero?.toString() || bet.concurso,
        dataSorteio: externalResult.dataApuracao || new Date().toLocaleDateString('pt-BR'),
        numeros: externalResult.listaDezenas || externalResult.dezenas || externalResult.dezenasSorteadasOrdemSorteio || [],
        premiacoes: externalResult.listaRateioPremio ? externalResult.listaRateioPremio.map(p => ({
          acertos: p.descricaoFaixa || `${p.faixa} acertos`,
          ganhadores: p.numeroDeGanhadores || 0,
          premio: p.valorPremio // Mantenha como número/string, o frontend formatará
        })) : [],
        acumulou: externalResult.acumulado === true || externalResult.valorAcumuladoProximoConcurso > 0,
        valorAcumulado: externalResult.valorAcumulado || null,
        proxConcurso: externalResult.numeroConcursoProximo || null,
        dataProxConcurso: externalResult.dataProximoConcurso || null,
        valorAcumuladoProximoConcurso: externalResult.valorAcumuladoProximoConcurso || null
      };

      // *** LÓGICA DE DETERMINAÇÃO DO STATUS MOVIDA PARA O BACKEND ***
      const matchCount = getMatchCount(bet.numeros, fetchedResultData.numeros);
      const isWinner = isWinningBet(matchCount, jogoNormalizado);
      newBetStatus = isWinner ? 'prêmio' : 'finalizado';

      // Atualiza a aposta no Firebase com o resultado, marca como consultado e ATUALIZA O STATUS
      await betRef.update({
        consultado: true,
        resultadoSorteio: fetchedResultData,
        status: newBetStatus, // Salva o status determinado
        verificadoEm: new Date().toISOString() // Adiciona um timestamp de verificação
      });

      console.log(`[Backend] Resultado para aposta ${betId} salvo e status atualizado para '${newBetStatus}'.`);
    }

    // Retorna o resultado e o status FINAL da aposta
    return res.status(200).json({ success: true, result: fetchedResultData, status: newBetStatus });

  } catch (error) {
    console.error('[Backend] Erro ao verificar e salvar resultado da aposta:', error);
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: `Erro ao buscar resultado da loteria: ${error.response.statusText || error.message}`,
        details: error.response.data
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao processar a solicitação.',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

