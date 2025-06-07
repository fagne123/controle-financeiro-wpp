const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// Carregando variáveis de ambiente do arquivo .env
const result = dotenv.config({
  path: path.resolve(__dirname, '../.env')
});

if (result.error) {
  console.error('Erro ao carregar arquivo .env:', result.error);
} else {
  console.log('Variáveis de ambiente carregadas com sucesso');
}

// Import routes
const transactionRoutes = require('./routes/transactions');
const authRoutes = require('./routes/auth');

// Create Express app
const app = express();

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Conectar ao MongoDB
console.log('Tentando conectar ao MongoDB: ' + process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000 // Timeout de 5 segundos para a seleção do servidor
})
  .then(() => {
    console.log('Conectado ao MongoDB com sucesso');
  })
  .catch((err) => {
    console.error('Falha ao conectar ao MongoDB:', err.message);
    // Não encerrar o processo aqui, permitir que o servidor continue funcionando mesmo sem DB
    // Em um ambiente de produção, seria melhor encerrar o processo
  });

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Rota de teste para verificar o status do servidor
app.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor está funcionando corretamente',
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      dbConnected: mongoose.connection.readyState === 1
    }
  });
});

// Rota para configurar o usuário administrador inicial (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  const User = require('./models/user');
  const bcrypt = require('bcrypt');
  
  app.get('/api/setup', async (req, res) => {
    try {
      // Verificar se já existe um admin
      const adminExists = await User.findOne({ email: 'admin@example.com' });
      
      if (adminExists) {
        console.log('Usuário admin já existe, resetando senha...');
        
        // Resetar a senha do admin existente para garantir acesso
        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash('admin123', salt);
        
        adminExists.password = newHashedPassword;
        await adminExists.save();
        
        console.log('Senha do admin resetada com sucesso');
        
        return res.status(200).json({
          success: true,
          message: 'Administrador já existe, senha resetada',
          user: {
            id: adminExists._id,
            email: adminExists.email,
            name: adminExists.name
          },
          credentials: {
            email: 'admin@example.com',
            password: 'admin123' // Apenas para fins de desenvolvimento
          }
        });
      }
      
      console.log('Criando novo usuário admin...');
      
      // Criar novo usuário admin diretamente usando o modelo
      const newAdmin = new User({
        name: 'Administrador',
        email: 'admin@example.com',
        password: 'admin123', // Será hasheado pelo middleware pre-save
        role: 'admin'
      });
      
      // Salvar o usuário, o que acionará o middleware de hash da senha
      await newAdmin.save();
      
      console.log('Usuário admin criado com sucesso:', {
        id: newAdmin._id,
        email: newAdmin.email
      });
      
      res.status(201).json({
        success: true,
        message: 'Usuário administrador criado com sucesso',
        user: {
          id: newAdmin._id,
          email: newAdmin.email,
          name: newAdmin.name
        },
        credentials: {
          email: 'admin@example.com',
          password: 'admin123' // Apenas para fins de desenvolvimento
        }
      });
    } catch (error) {
      console.error('Erro ao criar admin:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao configurar usuário administrador',
        details: error.message
      });
    }
  });
}

// Set up API routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/auth', authRoutes);

// Home route (API)
app.get('/api', (req, res) => {
  res.json({ message: 'Bem-vindo à API de Controle Financeiro', status: 'online' });
});

// Rota de teste para verificar status do servidor
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'online', 
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    dbConnected: mongoose.connection.readyState === 1,
    version: '1.0.0'
  });
});

// Serve the main application for all other routes
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

// Rota para login e registro
app.get('/login', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public/register.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public/profile.html'));
});

// Error handling middleware melhorado
app.use((err, req, res, next) => {
  console.error('Erro na aplicau00e7u00e3o:', err.name, err.message);
  console.error(err.stack);
  
  // Tratamento especu00edfico para erros conhecidos
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Erro de validau00e7u00e3o', 
      details: err.message,
      path: err.path
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ 
      error: 'Formato de ID invu00e1lido', 
      details: err.message
    });
  }
  
  // Erro genu00e9rico
  return res.status(500).json({ 
    error: 'Erro interno no servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Contate o administrador do sistema'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
