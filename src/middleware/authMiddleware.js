const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * Middleware para autenticação JWT
 * Verifica e valida o token JWT nos headers da requisição
 */
module.exports = async (req, res, next) => {
  try {
    // Verificar se o header de autorização existe
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Acesso negado. Autenticação necessária',
        code: 'NO_TOKEN'
      });
    }

    // Extrair o token do header (formato: Bearer <token>)
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    // Verificar se o token existe
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Acesso negado. Token não fornecido',
        code: 'NO_TOKEN'
      });
    }

    try {
      // Verificar e decodificar o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verificar se o usuário ainda existe no banco de dados
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não existe ou foi removido',
          code: 'USER_NOT_FOUND'
        });
      }

      // Adicionar o usuário à requisição para uso nas rotas protegidas
      req.user = user;
      next();
    } catch (error) {
      // Tratar especificamente erros de token expirado
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expirado. Por favor, faça login novamente',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      // Tratar outros erros de validação de token
      return res.status(401).json({
        success: false,
        error: 'Token inválido',
        code: 'INVALID_TOKEN',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'SERVER_ERROR'
    });
  }
};
