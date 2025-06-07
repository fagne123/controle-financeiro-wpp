/**
 * Main application script for Financial Tracker
 */
class FinancialTracker {
  constructor() {
    // State
    this.transactions = [];
    this.summaryData = [];
    this.currentPage = 1;
    this.totalPages = 1;
    this.itemsPerPage = CONFIG.PAGINATION.ITEMS_PER_PAGE;
    this.filters = {};
    
    // DOM Elements
    this.elements = {
      // Forms
      transactionForm: document.getElementById('transactionForm'),
      dateRangeForm: document.getElementById('dateRangeForm'),
      
      // Form inputs
      transactionValue: document.getElementById('transactionValue'),
      transactionDate: document.getElementById('transactionDate'),
      transactionCategory: document.getElementById('transactionCategory'),
      transactionSubcategory: document.getElementById('transactionSubcategory'),
      transactionDescription: document.getElementById('transactionDescription'),
      startDate: document.getElementById('startDate'),
      endDate: document.getElementById('endDate'),
      searchTransactions: document.getElementById('searchTransactions'),
      
      // Buttons
      saveTransaction: document.getElementById('saveTransaction'),
      applyDateFilter: document.getElementById('applyDateFilter'),
      filterMonth: document.getElementById('filterMonth'),
      filterQuarter: document.getElementById('filterQuarter'),
      filterYear: document.getElementById('filterYear'),
      filterCustom: document.getElementById('filterCustom'),
      prevPage: document.getElementById('prevPage'),
      nextPage: document.getElementById('nextPage'),
      
      // Display elements
      transactionsTable: document.getElementById('transactionsTable'),
      paginationInfo: document.getElementById('paginationInfo'),
      totalExpenses: document.getElementById('totalExpenses'),
      topCategory: document.getElementById('topCategory'),
      transactionCount: document.getElementById('transactionCount')
    };
    
    // Initialize the app
    this.init();
  }
  
  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('Inicializando aplicação...');
      
      // Verificar se todos os elementos DOM foram encontrados
      const missingElements = Object.entries(this.elements)
        .filter(([key, element]) => !element)
        .map(([key]) => key);
      
      if (missingElements.length > 0) {
        console.error('Elementos DOM não encontrados:', missingElements);
        notifications.showError(`Erro na inicialização: Elementos não encontrados: ${missingElements.join(', ')}`);
        return;
      }
      
      // Set default dates
      this.setDefaultDates();
      
      // Attach event listeners
      this.attachEventListeners();
      
      // Testar conexão com a API antes de carregar dados
      console.log('Testando conexão com a API...');
      const apiConnected = await api.testConnection();
      
      // Só carregar dados se a conexão com a API estiver funcionando
      if (apiConnected) {
        console.log('Conexão OK, carregando dados...');
        this.loadData();
      } else {
        console.error('Erro na conexão com a API, não foi possível carregar dados');
        notifications.showError('Não foi possível estabelecer conexão com o servidor. Verifique sua conexão e tente novamente.');
      }
      
      console.log('Aplicação inicializada com sucesso');
    } catch (error) {
      console.error('Erro na inicialização da aplicação:', error);
      notifications.showError('Erro ao inicializar a aplicação: ' + (error.message || 'Erro desconhecido'));
    }
    
    // Set default filter to current month
    this.applyMonthlyFilter();
  }
  
  /**
   * Set default dates in date inputs
   */
  setDefaultDates() {
    // Set default transaction date to now
    const now = new Date();
    this.elements.transactionDate.value = this.formatDateTimeForInput(now);
    
    // Set default date range to current month
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    this.elements.startDate.value = this.formatDateForInput(firstDayOfMonth);
    this.elements.endDate.value = this.formatDateForInput(lastDayOfMonth);
  }
  
  /**
   * Format a date for HTML date input
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string (YYYY-MM-DD)
   */
  formatDateForInput(date) {
    return date.toISOString().split('T')[0];
  }
  
  /**
   * Format a date for HTML datetime-local input
   * @param {Date} date - Date to format
   * @returns {string} Formatted datetime string (YYYY-MM-DDThh:mm)
   */
  formatDateTimeForInput(date) {
    return date.toISOString().slice(0, 16);
  }
  
  /**
   * Attach event listeners to UI elements
   */
  attachEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Limpar token e redirecionar para login
        api.clearToken();
        window.location.href = 'login.html';
      });
    }
    
    // Category change event
    this.elements.transactionCategory.addEventListener('change', () => {
      this.populateSubcategories();
    });
    
    // Save transaction button
    this.elements.saveTransaction.addEventListener('click', () => {
      this.saveTransaction();
    });
    
    // Date filters
    this.elements.filterMonth.addEventListener('click', () => {
      this.applyMonthlyFilter();
    });
    
    this.elements.filterQuarter.addEventListener('click', () => {
      this.applyQuarterlyFilter();
    });
    
    this.elements.filterYear.addEventListener('click', () => {
      this.applyYearlyFilter();
    });
    
    this.elements.applyDateFilter.addEventListener('click', () => {
      this.applyCustomDateFilter();
    });
    
    // Pagination
    this.elements.prevPage.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderTransactionsTable();
      }
    });
    
    this.elements.nextPage.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.renderTransactionsTable();
      }
    });
    
    // Search
    this.elements.searchTransactions.addEventListener('input', () => {
      this.currentPage = 1; // Reset to first page when searching
      this.renderTransactionsTable();
    });
  }
  
  /**
   * Populate subcategories based on selected main category
   */
  populateSubcategories() {
    const category = this.elements.transactionCategory.value;
    const subcategorySelect = this.elements.transactionSubcategory;
    
    // Clear current options
    subcategorySelect.innerHTML = '<option value="" selected disabled>Selecione uma subcategoria</option>';
    
    if (category) {
      // Enable the select
      subcategorySelect.disabled = false;
      
      // Add new options
      const subcategories = CONFIG.SUBCATEGORIES[category] || [];
      subcategories.forEach(subcategory => {
        const option = document.createElement('option');
        option.value = subcategory.value;
        option.textContent = subcategory.label;
        subcategorySelect.appendChild(option);
      });
    } else {
      // Disable the select if no category is selected
      subcategorySelect.disabled = true;
    }
  }
  
  /**
   * Apply monthly filter (current month)
   */
  applyMonthlyFilter() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    this.filters = {
      startDate: this.formatDateForInput(firstDayOfMonth),
      endDate: this.formatDateForInput(lastDayOfMonth)
    };
    
    this.elements.startDate.value = this.filters.startDate;
    this.elements.endDate.value = this.filters.endDate;
    
    this.loadData();
  }
  
  /**
   * Apply quarterly filter (last 3 months)
   */
  applyQuarterlyFilter() {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    this.filters = {
      startDate: this.formatDateForInput(threeMonthsAgo),
      endDate: this.formatDateForInput(lastDayOfMonth)
    };
    
    this.elements.startDate.value = this.filters.startDate;
    this.elements.endDate.value = this.filters.endDate;
    
    this.loadData();
  }
  
  /**
   * Apply yearly filter (current year)
   */
  applyYearlyFilter() {
    const now = new Date();
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    const lastDayOfYear = new Date(now.getFullYear(), 11, 31);
    
    this.filters = {
      startDate: this.formatDateForInput(firstDayOfYear),
      endDate: this.formatDateForInput(lastDayOfYear)
    };
    
    this.elements.startDate.value = this.filters.startDate;
    this.elements.endDate.value = this.filters.endDate;
    
    this.loadData();
  }
  
  /**
   * Apply custom date filter from the date range form
   */
  applyCustomDateFilter() {
    this.filters = {
      startDate: this.elements.startDate.value,
      endDate: this.elements.endDate.value
    };
    
    this.loadData();
    
    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('dateRangeModal'));
    if (modal) {
      modal.hide();
    }
  }
  
  /**
   * Load data from the API
   */
  async loadData() {
    try {
      // Show loading indicators
      this.showLoading(true);
      document.querySelector('.container').classList.add('loading-data');
      
      console.log('Iniciando carregamento de dados com filtros:', this.filters);
      
      // Fetch transactions
      const transactionsResponse = await this.loadTransactions();
      console.log('Resposta de transações:', transactionsResponse);
      
      // Fetch summary data
      const summaryResponse = await this.loadSummaryData();
      console.log('Resposta de resumo:', summaryResponse);
      
      // Update UI with the new data
      this.updateDashboard();
      this.renderTransactionsTable();
      
      // Update charts if they exist
      if (typeof chartsManager !== 'undefined') {
        console.log('Atualizando gráficos com dados:', {
          summaryData: this.summaryData,
          transactions: this.transactions
        });
        
        if (this.summaryData && this.summaryData.length > 0) {
          chartsManager.updateCategoryChart(this.summaryData);
        } else {
          console.warn('Sem dados de resumo para atualizar gráfico de categorias');
        }
        
        if (this.transactions && this.transactions.length > 0) {
          chartsManager.updateMonthlyChart(this.transactions);
        } else {
          console.warn('Sem transações para atualizar gráfico mensal');
        }
      } else {
        console.warn('chartsManager não está definido');
      }
      
      // Hide loading indicators
      this.showLoading(false);
      document.querySelector('.container').classList.remove('loading-data');
      
      // Mostrar notificação de sucesso apenas se houver dados
      if ((this.transactions && this.transactions.length > 0) || 
          (this.summaryData && this.summaryData.length > 0)) {
        notifications.showSuccess('Dados carregados com sucesso');
      } else {
        console.log('Nenhum dado encontrado com os filtros atuais');
        notifications.showInfo('Nenhum dado encontrado com os filtros atuais');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.showError('Erro ao carregar dados: ' + (error.message || 'Falha na conexão com o servidor'));
      this.showLoading(false);
      document.querySelector('.container').classList.remove('loading-data');
    }
  }
  
  /**
   * Update dashboard summary elements
   */
  updateDashboard() {
    // Calculate total expenses
    const totalExpenses = this.transactions.reduce((total, transaction) => {
      return total + transaction.value;
    }, 0);
    
    // Format total expenses as currency
    this.elements.totalExpenses.textContent = new Intl.NumberFormat('pt-BR', CONFIG.CURRENCY_FORMAT)
      .format(totalExpenses);
    
    // Show transaction count
    this.elements.transactionCount.textContent = this.transactions.length;
    
    // Find top category
    if (this.summaryData.length > 0) {
      // Sort summaryData by total amount
      const sortedSummary = [...this.summaryData].sort((a, b) => b.totalAmount - a.totalAmount);
      const topCategory = sortedSummary[0];
      
      if (topCategory) {
        const categoryConfig = CONFIG.CATEGORIES[topCategory.category];
        this.elements.topCategory.textContent = categoryConfig.label;
      } else {
        this.elements.topCategory.textContent = '-';
      }
    } else {
      this.elements.topCategory.textContent = '-';
    }
  }
  
  /**
   * Render the transactions table with pagination
   */
  renderTransactionsTable() {
    const searchQuery = this.elements.searchTransactions.value.toLowerCase();
    
    // Filter transactions based on search query
    let filteredTransactions = this.transactions;
    if (searchQuery) {
      filteredTransactions = this.transactions.filter(transaction => {
        const categoryLabel = CONFIG.CATEGORIES[transaction.category]?.label.toLowerCase() || '';
        const subcategoryMatch = transaction.subcategory.toLowerCase().includes(searchQuery);
        const descriptionMatch = transaction.description?.toLowerCase().includes(searchQuery) || false;
        const categoryMatch = categoryLabel.includes(searchQuery);
        
        return subcategoryMatch || descriptionMatch || categoryMatch;
      });
    }
    
    // Calculate pagination
    this.totalPages = Math.ceil(filteredTransactions.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, filteredTransactions.length);
    const currentPageTransactions = filteredTransactions.slice(startIndex, endIndex);
    
    // Update pagination controls
    this.elements.prevPage.parentElement.classList.toggle('disabled', this.currentPage <= 1);
    this.elements.nextPage.parentElement.classList.toggle('disabled', this.currentPage >= this.totalPages);
    this.elements.paginationInfo.textContent = `Mostrando ${startIndex + 1}-${endIndex} de ${filteredTransactions.length} transações`;
    
    // Clear the table
    this.elements.transactionsTable.innerHTML = '';
    
    if (currentPageTransactions.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `<td colspan="6" class="text-center">Nenhuma transação encontrada</td>`;
      this.elements.transactionsTable.appendChild(emptyRow);
      return;
    }
    
    // Add transactions to the table
    currentPageTransactions.forEach(transaction => {
      const row = document.createElement('tr');
      
      // Format date
      const date = new Date(transaction.date);
      const formattedDate = date.toLocaleDateString('pt-BR', CONFIG.DATE_FORMAT.DATETIME);
      
      // Format value
      const formattedValue = new Intl.NumberFormat('pt-BR', CONFIG.CURRENCY_FORMAT)
        .format(transaction.value);
      
      // Category and subcategory
      const categoryConfig = CONFIG.CATEGORIES[transaction.category];
      const categoryLabel = categoryConfig?.label || transaction.category;
      const categoryBadge = `<span class="badge badge-${transaction.category}">${categoryLabel}</span>`;
      
      // Find subcategory label
      let subcategoryLabel = transaction.subcategory;
      const subcategoryConfig = CONFIG.SUBCATEGORIES[transaction.category]?.find(
        sub => sub.value === transaction.subcategory
      );
      
      if (subcategoryConfig) {
        subcategoryLabel = subcategoryConfig.label;
      }
      
      // Create actions buttons
      const actionsHtml = `
        <button class="btn btn-sm btn-outline-primary btn-action edit-transaction" data-id="${transaction._id}">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger btn-action delete-transaction" data-id="${transaction._id}">
          <i class="bi bi-trash"></i>
        </button>
      `;
      
      // Set row HTML
      row.innerHTML = `
        <td>${formattedDate}</td>
        <td>${formattedValue}</td>
        <td>${categoryBadge}</td>
        <td>${subcategoryLabel}</td>
        <td>${transaction.description || '-'}</td>
        <td>${actionsHtml}</td>
      `;
      
      this.elements.transactionsTable.appendChild(row);
    });
    
    // Attach event listeners to action buttons
    this.attachTableActionListeners();
  }
  
  /**
   * Attach event listeners to table action buttons
   */
  attachTableActionListeners() {
    // Edit transaction buttons
    const editButtons = document.querySelectorAll('.edit-transaction');
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        const transactionId = button.getAttribute('data-id');
        this.editTransaction(transactionId);
      });
    });
    
    // Delete transaction buttons
    const deleteButtons = document.querySelectorAll('.delete-transaction');
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const transactionId = button.getAttribute('data-id');
        this.deleteTransaction(transactionId);
      });
    });
  }
  
  /**
   * Save a new transaction
   */
  async saveTransaction() {
    // Validate form inputs before submission
    if (!this.validateTransactionForm()) {
      return;
    }
    
    const transactionData = {
      value: parseFloat(this.elements.transactionValue.value),
      date: this.elements.transactionDate.value,
      category: this.elements.transactionCategory.value,
      subcategory: this.elements.transactionSubcategory.value,
      description: this.elements.transactionDescription.value
    };
    
    // Show loading state
    this.elements.saveTransaction.disabled = true;
    this.elements.saveTransaction.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...';
    
    try {
      await api.createTransaction(transactionData);
      
      // Reset form and close modal
      this.elements.transactionForm.reset();
      bootstrap.Modal.getInstance(document.getElementById('addTransactionModal')).hide();
      
      // Show success message
      this.showSuccess('Transação adicionada com sucesso!');
    } catch (error) {
      console.error('Error saving transaction:', error);
      this.showError('Erro ao salvar transação. Por favor tente novamente.');
      this.showLoading(false);
    }
  }
  
  /**
   * Edit a transaction
   * @param {string} transactionId - The transaction ID to edit
   */
  editTransaction(transactionId) {
    // Find the transaction
    const transaction = this.transactions.find(t => t._id === transactionId);
    if (!transaction) return;
    
    // Fill the form with transaction data
    this.elements.transactionValue.value = transaction.value;
    this.elements.transactionDate.value = this.formatDateTimeForInput(new Date(transaction.date));
    this.elements.transactionCategory.value = transaction.category;
    
    // Update subcategories and select the correct one
    this.populateSubcategories();
    this.elements.transactionSubcategory.value = transaction.subcategory;
    this.elements.transactionDescription.value = transaction.description || '';
    
    // TODO: Implement updating an existing transaction
    // For now, we'll just allow creating a new one with similar data
    
    // Open the modal
    const modal = new bootstrap.Modal(document.getElementById('addTransactionModal'));
    modal.show();
  }
  
  /**
   * Delete a transaction
   * @param {string} transactionId - The transaction ID to delete
   */
  async deleteTransaction(transactionId) {
    // Confirm deletion
    if (!confirm('Tem certeza que deseja excluir esta transação?')) {
      return;
    }
    
    try {
      // Show loading
      this.showLoading(true);
      
      // Call API to delete transaction
      await api.deleteTransaction(transactionId);
      
      // Reload data
      await this.loadData();
      
      // Show success message
      this.showSuccess('Transação excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      this.showError('Erro ao excluir transação. Por favor tente novamente.');
      this.showLoading(false);
    }
  }
  
  /**
   * Load transactions from API
   */
  async loadTransactions() {
    try {
      console.log('Carregando transações com filtros:', this.filters);
      
      // Verificar se o token está disponível
      const token = localStorage.getItem(CONFIG.AUTH_TOKEN_KEY);
      if (!token) {
        console.warn('Tentativa de carregar transações sem token de autenticação');
        notifications.showError('Sessão expirada ou inválida. Por favor, faça login novamente.');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
        return { data: [] };
      }
      
      const response = await api.getTransactions(this.filters);
      console.log('Transações carregadas:', response);
      this.transactions = response.data || [];
      
      // Log detalhado das transações para depuração
      if (this.transactions.length > 0) {
        console.log('Exemplo de transação:', this.transactions[0]);
      }
      
      return response;
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      
      // Se houver erro de autenticação, redirecionar para login
      if (error.message && (
          error.message.includes('inválido') || 
          error.message.includes('expirado') || 
          error.message.includes('401')
      )) {
        notifications.showError('Sessão expirada. Redirecionando para login...');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      }
      
      throw error;
    }
  }
  
  /**
   * Load summary data from API
   */
  async loadSummaryData() {
    try {
      console.log('Carregando dados de resumo com filtros:', this.filters);
      
      // Verificar se o token está disponível
      const token = localStorage.getItem(CONFIG.AUTH_TOKEN_KEY);
      if (!token) {
        console.warn('Tentativa de carregar resumo sem token de autenticação');
        return { data: [] };
      }
      
      const response = await api.getSummary(this.filters);
      console.log('Dados de resumo carregados:', response);
      this.summaryData = response.data || [];
      
      // Log detalhado das categorias para depuração
      if (this.summaryData.length > 0) {
        console.log('Exemplo de categoria:', this.summaryData[0]);
      }
      
      return response;
    } catch (error) {
      console.error('Erro ao carregar dados de resumo:', error);
      throw error;
    }
  }
  
  /**
   * Validate the transaction form
   * @returns {boolean} Whether the form is valid
   */
  validateTransactionForm() {
    // Check required fields
    if (!this.elements.transactionValue.value) {
      this.showError('Por favor, informe o valor da transação.');
      return false;
    }
    
    if (!this.elements.transactionDate.value) {
      this.showError('Por favor, informe a data da transau00e7u00e3o.');
      return false;
    }
    
    if (!this.elements.transactionCategory.value) {
      this.showError('Por favor, selecione uma categoria.');
      return false;
    }
    
    if (!this.elements.transactionSubcategory.value) {
      this.showError('Por favor, selecione uma subcategoria.');
      return false;
    }
    
    return true;
  }
  
  /**
   * Reset the transaction form
   */
  resetTransactionForm() {
    this.elements.transactionForm.reset();
    this.elements.transactionDate.value = this.formatDateTimeForInput(new Date());
    this.elements.transactionSubcategory.disabled = true;
  }
  
  /**
   * Show loading indicator
   * @param {boolean} isLoading - Whether loading is in progress
   */
  showLoading(isLoading) {
    // Implementar indicador de carregamento global se necessário
    // Por enquanto, cada botão gerencia seu próprio estado de carregamento
  }

  /**
   * Show error message
   * @param {string} message - The error message
   */
  showError(message) {
    // Usar o sistema de notificações
    if (typeof notifications !== 'undefined') {
      notifications.error(message);
    } else {
      console.error(message);
      alert(message);
    }
  }

  /**
   * Show success message
   * @param {string} message - The success message
   */
  showSuccess(message) {
    // Usar o sistema de notificações
    if (typeof notifications !== 'undefined') {
      notifications.success(message);
    } else {
      console.log(message);
      alert(message);
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new FinancialTracker();
});
