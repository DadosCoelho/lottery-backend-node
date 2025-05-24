const { adminDatabase } = require('../config/firebase');

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
          sequenciaTeimosinhaTotal: quantidade // Total de apostas na sequência
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
    const userId = req.user.uid;

    // Validações básicas
    if (!jogo || !concurso || !numeros || !grupo || !grupo.nome || !grupo.participantes) {
      return res.status(400).json({
        success: false,
        message: 'Dados incompletos. Informe jogo, concurso, números e dados do grupo.'
      });
    }

    if (grupo.participantes.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Um grupo deve ter pelo menos 2 participantes.'
      });
    }

    console.log('Dados da aposta em grupo recebidos:', { jogo, concurso, numeros, grupo });
    console.log('ID do usuário criador:', userId);

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
      // Referência para a coleção de apostas
      const betsRef = adminDatabase.ref('bets');
      
      // Criar cada aposta da teimosinha
      for (let i = 0; i < quantidade; i++) {
        // Dados da aposta em grupo
        const groupBetData = {
          userId, // ID do criador
          jogo,
          concurso: (concursoNumero + i).toString(), // Incrementar o número do concurso
          numeros: betNumbers,
          teimosinha: teimosinha,
          qtdTeimosinha: quantidade,
          dataCriacao: new Date().toISOString(),
          status: 'pendente',
          tipo: 'grupo',
          sequenciaTeimosinhaIndex: i, // Índice na sequência da teimosinha
          sequenciaTeimosinhaTotal: quantidade, // Total de apostas na sequência
          grupo: {
            nome: grupo.nome,
            participantes: grupo.participantes,
            criador: grupo.criador || userId
          }
        };
        
        // Salvar a aposta em grupo
        const newBetRef = betsRef.push();
        
        // Adicionar o ID gerado aos dados da aposta
        groupBetData.id = newBetRef.key;
        
        // Salvar a aposta
        await newBetRef.set(groupBetData);
        console.log(`Aposta em grupo ${i+1}/${quantidade} salva com sucesso:`, newBetRef.key);

        // Atualizar o perfil do usuário criador com a nova aposta
        const userBetsRef = adminDatabase.ref(`users/${userId}/bets/${newBetRef.key}`);
        await userBetsRef.set(true);
        
        apostas.push(groupBetData);
      }
      
      console.log(`${quantidade} apostas teimosinha em grupo criadas com sucesso`);

      return res.status(201).json({
        success: true,
        message: `${quantidade > 1 ? `${quantidade} apostas teimosinha em grupo` : 'Aposta em grupo'} registrada${quantidade > 1 ? 's' : ''} com sucesso`,
        bets: apostas
      });
    } catch (dbError) {
      console.error('Erro ao salvar aposta em grupo no banco de dados:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao salvar aposta em grupo no banco de dados',
        error: dbError.message
      });
    }
  } catch (error) {
    console.error('Erro ao registrar aposta em grupo:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro ao registrar aposta em grupo',
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