const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: [true, 'O valor da transação é obrigatório'],
    min: [0, 'O valor não pode ser negativo']
  },
  date: {
    type: Date,
    required: [true, 'A data da transação é obrigatória'],
    default: Date.now
  },
  category: {
    type: String,
    required: [true, 'A categoria é obrigatória'],
    enum: {
      values: ['comida', 'moradia', 'transporte', 'lazer', 'trabalho', 'financeiro'],
      message: 'Categoria {VALUE} não é permitida'
    }
  },
  subcategory: {
    type: String,
    required: [true, 'A subcategoria é obrigatória']
  },
  description: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Validau00e7u00e3o de subcategorias baseada na categoria principal
transactionSchema.pre('validate', function(next) {
  try {
    // Lista de subcategorias válidas para cada categoria
    const validSubcategories = {
      comida: ['mercado', 'restaurante', 'delivery'],
      moradia: ['aluguel', 'energia', 'agua', 'internet', 'gás', 'agua de beber', 'imprevistos'],
      transporte: ['gasolina', 'oficina'],
      lazer: ['cigarro', 'bebedeira', 'roupas', 'cabelereiro', 'academia'],
      trabalho: ['ferramentas'],
      financeiro: ['cartão de credito', 'agiota']
    };

    // Se não for uma categoria válida ou não estiver definida, pula a validação
    // (o erro de categoria inválida será capturado pela validação enum)
    if (!this.category || !validSubcategories[this.category]) {
      return next();
    }

    // Se subcategoria não estiver definida, pula a validação
    // (o erro de subcategoria obrigatória será capturado por outra validação)
    if (!this.subcategory) {
      return next();
    }

    // Verifica se a subcategoria pertence à categoria selecionada
    if (!validSubcategories[this.category].includes(this.subcategory)) {
      return next(new Error(`Subcategoria '${this.subcategory}' não é válida para a categoria '${this.category}'`));
    }

    next();
  } catch (error) {
    console.error('Erro na validação de subcategoria:', error);
    next(error);
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
