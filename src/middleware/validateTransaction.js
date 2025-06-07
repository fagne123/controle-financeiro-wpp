const Joi = require('joi');

module.exports = (req, res, next) => {
  try {
    // Schema para validação de transação
    const schema = Joi.object({
      value: Joi.number().required().min(0).messages({
        'number.base': 'O valor deve ser um número',
        'number.empty': 'O valor é obrigatório',
        'number.min': 'O valor deve ser maior ou igual a 0',
        'any.required': 'O valor é obrigatório'
      }),
      date: Joi.date().default(Date.now).messages({
        'date.base': 'Data inválida'
      }),
      category: Joi.string().required().valid(
        'comida', 'moradia', 'transporte', 'lazer', 'trabalho', 'financeiro'
      ).messages({
        'string.empty': 'Categoria é obrigatória',
        'any.required': 'Categoria é obrigatória',
        'any.only': 'Categoria inválida. Deve ser uma das categorias predefinidas'
      }),
      subcategory: Joi.string().required().messages({
        'string.empty': 'Subcategoria é obrigatória',
        'any.required': 'Subcategoria é obrigatória'
      }),
      description: Joi.string().allow('', null)
    });

    // Validar corpo da requisição
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      // Coletar todas as mensagens de erro
      const errorMessages = error.details.map(detail => detail.message);
      
      return res.status(400).json({ 
        success: false, 
        error: 'Erro de validação',
        details: errorMessages
      });
    }

    // Se passou pela validação, continua para o próximo middleware
    next();
  } catch (err) {
    // Capturar quaisquer erros inesperados
    console.error('Erro no middleware de validação:', err);
    return res.status(500).json({
      success: false,
      error: 'Erro interno durante a validação',
      message: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
};
