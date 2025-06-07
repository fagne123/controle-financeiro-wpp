const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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

// Create Express app
const app = express();

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Connect to MongoDB
console.log('Tentando conectar ao MongoDB: ' + process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000 // Timeout de 5 segundos para a seleção do servidor
})
  .then(() => {
    console.log('Conectado ao MongoDB com sucesso');
  })
  .catch((err) => {
    console.error('Falha ao conectar ao MongoDB:', err.message);
  });

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Simple API test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API está funcionando!' });
});

// Serve the main application for all other routes
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
