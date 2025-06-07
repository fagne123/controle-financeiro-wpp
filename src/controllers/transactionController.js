const Transaction = require('../models/transaction');

// Criar uma nova transação
exports.createTransaction = async (req, res) => {
  try {
    const { value, date, category, subcategory, description } = req.body;
    
    // Criar objeto de transação
    const transaction = new Transaction({
      value,
      date: date || new Date(),
      category,
      subcategory,
      description
    });

    // Salvar no banco de dados
    await transaction.save();
    
    // Responder com sucesso
    res.status(201).json({ 
      success: true, 
      data: transaction,
      message: 'Transação registrada com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    
    // Erro de validação do Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: 'Erro de validação',
        details: messages
      });
    } 
    // Erro de validação personalizado (pré-validação)
    else if (error.message && error.message.includes('Invalid')) {
      return res.status(400).json({
        success: false,
        error: 'Erro de validação',
        details: error.message
      });
    }
    // Erro interno do servidor
    else {
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }
};

// Obter todas as transações
exports.getTransactions = async (req, res) => {
  try {
    // Support for filtering by category
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.subcategory) {
      filter.subcategory = req.query.subcategory;
    }
    
    // Support for date range filtering
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) {
        filter.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.date.$lte = new Date(req.query.endDate);
      }
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Erro no servidor'
    });
  }
};

// Obter transação por ID
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transação não encontrada'
      });
    }

    return res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Erro no servidor'
    });
  }
};

// Atualizar transação
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transação não encontrada'
      });
    }

    return res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// Excluir transação
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transação não encontrada'
      });
    }

    await Transaction.deleteOne({ _id: req.params.id });

    return res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Erro no servidor'
    });
  }
};

// Obter resumo de gastos (totais por categoria)
exports.getSummary = async (req, res) => {
  try {
    // Support date range filtering
    const dateFilter = {};
    if (req.query.startDate) {
      dateFilter.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      dateFilter.$lte = new Date(req.query.endDate);
    }

    const matchStage = {};
    if (Object.keys(dateFilter).length > 0) {
      matchStage.date = dateFilter;
    }

    const summary = await Transaction.aggregate([
      { $match: matchStage },
      { $group: {
          _id: { category: '$category', subcategory: '$subcategory' },
          totalAmount: { $sum: '$value' },
          count: { $sum: 1 }
        }
      },
      { $group: {
          _id: '$_id.category',
          totalAmount: { $sum: '$totalAmount' },
          subcategories: {
            $push: {
              name: '$_id.subcategory',
              totalAmount: '$totalAmount',
              count: '$count'
            }
          }
        }
      },
      { $project: {
          _id: 0,
          category: '$_id',
          totalAmount: 1,
          subcategories: 1
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Erro no servidor'
    });
  }
};
