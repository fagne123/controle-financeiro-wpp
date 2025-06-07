const User = require('../models/user');

/**
 * Middleware to verify API token for external services
 * This allows services like n8n to authenticate with a simple API token
 * instead of using JWT
 */
module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const apiToken = req.header('X-API-Token');
    
    // Check if token exists
    if (!apiToken) {
      return res.status(401).json({
        success: false,
        error: 'Token de API não fornecido. Acesso negado',
        code: 'NO_API_TOKEN'
      });
    }
    
    // Verify token exists in database
    const user = await User.findOne({ apiToken });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Token de API inválido',
        code: 'INVALID_API_TOKEN'
      });
    }
    
    // Add user to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    console.error('Erro no middleware de token API:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'SERVER_ERROR'
    });
  }
};
