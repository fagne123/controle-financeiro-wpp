const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Usuário com este email já existe'
      });
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password
    });
    
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        apiToken: user.apiToken
      }
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
        error: 'Erro no servidor'
      });
    }
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Tentativa de login:', { email, passwordLength: password?.length });
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Usuário não encontrado:', email);
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }
    
    console.log('Usuário encontrado:', {
      id: user._id,
      email: user.email,
      passwordHash: user.password?.substring(0, 10) + '...'
    });
    
    // Verify password
    console.log('Verificando senha...');
    const isMatch = await user.comparePassword(password);
    console.log('Resultado da comparação de senha:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '30d' }
    );
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        apiToken: user.apiToken
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        apiToken: user.apiToken
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Generate a new API token
exports.generateApiToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Generate a new token
    user.apiToken = require('crypto').randomBytes(32).toString('hex');
    await user.save();
    
    res.status(200).json({
      success: true,
      apiToken: user.apiToken
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Verify API token middleware
exports.verifyApiToken = async (req, res, next) => {
  try {
    // Get token from header
    const apiToken = req.header('X-API-Token');
    
    // Check if token exists
    if (!apiToken) {
      return res.status(401).json({ message: 'No API token, access denied' });
    }
    
    // Verify token exists in database
    const user = await User.findOne({ apiToken });
    if (!user) {
      return res.status(401).json({ message: 'Invalid API token' });
    }
    
    // Add user to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
