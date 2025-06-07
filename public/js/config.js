/**
 * Configuration settings for the Financial Tracker application
 */
const CONFIG = {
  // API settings
  API_BASE_URL: 'http://localhost:3000/api',
  API_ENDPOINTS: {
    TRANSACTIONS: '/transactions',
    SUMMARY: '/transactions/summary',
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      PROFILE: '/auth/profile',
      TOKEN: '/auth/token'
    }
  },
  
  // Date format options
  DATE_FORMAT: {
    SHORT: { day: '2-digit', month: '2-digit', year: 'numeric' },
    LONG: { day: '2-digit', month: 'long', year: 'numeric' },
    DATETIME: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  },
  
  // Currency format options
  CURRENCY_FORMAT: { style: 'currency', currency: 'BRL' },
  
  // Category names and colors mapping
  CATEGORIES: {
    comida: { label: 'Comida', color: '#28a745' },
    moradia: { label: 'Moradia', color: '#007bff' },
    transporte: { label: 'Transporte', color: '#fd7e14' },
    lazer: { label: 'Lazer', color: '#6f42c1' },
    trabalho: { label: 'Trabalho', color: '#20c997' },
    financeiro: { label: 'Financeiro', color: '#dc3545' }
  },
  
  // Subcategories mapping
  SUBCATEGORIES: {
    comida: [
      { value: 'mercado', label: 'Mercado' },
      { value: 'restaurante', label: 'Restaurante' },
      { value: 'delivery', label: 'Delivery' }
    ],
    moradia: [
      { value: 'aluguel', label: 'Aluguel' },
      { value: 'energia', label: 'Energia' },
      { value: 'agua', label: 'Água' },
      { value: 'internet', label: 'Internet' },
      { value: 'gás', label: 'Gás' },
      { value: 'agua de beber', label: 'Água de beber' },
      { value: 'imprevistos', label: 'Imprevistos' }
    ],
    transporte: [
      { value: 'gasolina', label: 'Gasolina' },
      { value: 'oficina', label: 'Oficina' }
    ],
    lazer: [
      { value: 'cigarro', label: 'Cigarro' },
      { value: 'bebedeira', label: 'Bebedeira' },
      { value: 'roupas', label: 'Roupas' },
      { value: 'cabelereiro', label: 'Cabelereiro' },
      { value: 'academia', label: 'Academia' }
    ],
    trabalho: [
      { value: 'ferramentas', label: 'Ferramentas' }
    ],
    financeiro: [
      { value: 'cartão de credito', label: 'Cartão de Crédito' },
      { value: 'agiota', label: 'Agiota' }
    ]
  },
  
  // Pagination settings
  PAGINATION: {
    ITEMS_PER_PAGE: 10
  },
  
  // Chart settings
  CHART: {
    ANIMATION_DURATION: 800
  },
  
  // Token storage key
  AUTH_TOKEN_KEY: 'financial_tracker_auth_token'
};
