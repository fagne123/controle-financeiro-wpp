/**
 * API Service for handling all HTTP requests
 */
class ApiService {
  constructor() {
    this.baseUrl = CONFIG.API_BASE_URL;
    this.endpoints = CONFIG.API_ENDPOINTS;
    this.token = localStorage.getItem(CONFIG.AUTH_TOKEN_KEY) || null;
  }

  /**
   * Set the authentication token
   * @param {string} token - The JWT token
   */
  setToken(token) {
    this.token = token;
    localStorage.setItem(CONFIG.AUTH_TOKEN_KEY, token);
    console.log('Token definido e salvo no localStorage:', token ? token.substring(0, 20) + '...' : 'null');
  }

  /**
   * Clear the authentication token
   */
  clearToken() {
    this.token = null;
    localStorage.removeItem(CONFIG.AUTH_TOKEN_KEY);
  }

  /**
   * Create the request headers
   * @returns {Object} Headers object
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Handle API response
   * @param {Response} response - The fetch API response
   * @returns {Promise} Resolved with the response data or rejected with error
   */
  async handleResponse(response) {
    let data;
    try {
      const contentType = response.headers.get('content-type');
      console.log('Content-Type da resposta:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('Resposta JSON parseada:', data);
      } else {
        const text = await response.text();
        console.log('Resposta texto (não-JSON):', text);
        throw new Error('Resposta do servidor não está no formato JSON');
      }
    } catch (e) {
      console.error('Erro ao processar resposta:', e);
      throw new Error('Erro ao processar resposta do servidor: ' + e.message);
    }

    if (!response.ok) {
      console.warn('Resposta com erro, status:', response.status);
      
      // Handle unauthorized requests
      if (response.status === 401) {
        console.log('Usuário não autorizado (401), redirecionando para login');
        this.clearToken();
        // Redirect to login page with error message
        window.location.href = 'login.html?session=expired';
      }
      
      // Get detailed error message
      let errorMessage = 'Ocorreu um erro inesperado';
      if (data.error) {
        errorMessage = data.error;
      } else if (data.details) {
        errorMessage = Array.isArray(data.details) ? data.details.join(', ') : data.details;
      } else if (data.message) {
        errorMessage = data.message;
      }
      
      console.error('Erro detalhado:', errorMessage);
      throw new Error(errorMessage);
    }

    return data;
  }

  /**
   * Get all transactions with optional filters
   * @param {Object} filters - Optional query parameters
   * @returns {Promise} Resolved with transactions data
   */
  async getTransactions(filters = {}) {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
  
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const url = `${this.baseUrl}${this.endpoints.TRANSACTIONS}${queryString}`;
      
      console.log('Fazendo chamada GET para:', url);
      console.log('Com headers:', this.getHeaders());
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });
  
      console.log('Resposta recebida com status:', response.status);
      
      const result = await this.handleResponse(response);
      console.log('Dados processados:', result);
      return result;
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      throw error;
    }
  }

  /**
   * Create a new transaction
   * @param {Object} transactionData - The transaction data
   * @returns {Promise} Resolved with the created transaction
   */
  async createTransaction(transactionData) {
    const response = await fetch(
      `${this.baseUrl}${this.endpoints.TRANSACTIONS}`, 
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(transactionData)
      }
    );

    return this.handleResponse(response);
  }

  /**
   * Update an existing transaction
   * @param {string} id - The transaction ID
   * @param {Object} transactionData - The updated transaction data
   * @returns {Promise} Resolved with the updated transaction
   */
  async updateTransaction(id, transactionData) {
    const response = await fetch(
      `${this.baseUrl}${this.endpoints.TRANSACTIONS}/${id}`, 
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(transactionData)
      }
    );

    return this.handleResponse(response);
  }

  /**
   * Delete a transaction
   * @param {string} id - The transaction ID
   * @returns {Promise} Resolved when transaction is deleted
   */
  async deleteTransaction(id) {
    const response = await fetch(
      `${this.baseUrl}${this.endpoints.TRANSACTIONS}/${id}`, 
      {
        method: 'DELETE',
        headers: this.getHeaders()
      }
    );

    return this.handleResponse(response);
  }

  /**
   * Get spending summary
   * @param {Object} filters - Optional query parameters (startDate, endDate)
   * @returns {Promise} Resolved with summary data
   */
  async getSummary(filters = {}) {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
  
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const url = `${this.baseUrl}${this.endpoints.SUMMARY}${queryString}`;
      
      console.log('Fazendo chamada GET para summary:', url);
      console.log('Com headers:', this.getHeaders());
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });
  
      console.log('Resposta do summary recebida com status:', response.status);
      
      const result = await this.handleResponse(response);
      console.log('Dados de summary processados:', result);
      return result;
    } catch (error) {
      console.error('Erro ao buscar resumo de gastos:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const api = new ApiService();

// Adicionar método para testar a API
api.testConnection = async function() {
  try {
    console.log('Testando conexão com a API...');
    console.log('Token atual:', this.token ? 'Presente' : 'Ausente');
    console.log('Base URL:', this.baseUrl);
    console.log('Endpoints:', this.endpoints);
    
    // Tentar buscar transações como teste
    const response = await this.getTransactions();
    console.log('Conexão com API bem-sucedida:', response);
    notifications.showSuccess('Conexão com API estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('Falha na conexão com a API:', error);
    notifications.showError('Falha na conexão com a API: ' + (error.message || 'Erro desconhecido'));
    return false;
  }
};
