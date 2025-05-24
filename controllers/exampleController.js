// Funções de exemplo para um controlador

/**
 * Obter todos os itens
 */
exports.getAll = (req, res) => {
  res.json({
    message: 'Lista de todos os itens',
    items: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' }
    ]
  });
};

/**
 * Obter um item pelo ID
 */
exports.getById = (req, res) => {
  const id = req.params.id;
  res.json({
    message: `Informações do item ${id}`,
    item: { id: parseInt(id), name: `Item ${id}` }
  });
};

/**
 * Criar um novo item
 */
exports.create = (req, res) => {
  const newItem = req.body;
  res.status(201).json({
    message: 'Item criado com sucesso',
    item: { id: 4, ...newItem }
  });
}; 