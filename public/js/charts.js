/**
 * Charts module for visualizing financial data
 */
class ChartsManager {
  constructor() {
    this.categoryChart = null;
    this.monthlyChart = null;
    this.chartOptions = {
      animation: {
        duration: CONFIG.CHART.ANIMATION_DURATION
      },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed !== null) {
                label += new Intl.NumberFormat('pt-BR', CONFIG.CURRENCY_FORMAT)
                  .format(context.parsed);
              }
              return label;
            }
          }
        }
      }
    };
  }

  /**
   * Initialize chart instances
   */
  initCharts() {
    this.initCategoryChart();
    this.initMonthlyChart();
  }

  /**
   * Initialize the category distribution chart
   */
  initCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    this.categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderWidth: 1
        }]
      },
      options: this.chartOptions
    });
  }

  /**
   * Initialize the monthly expenses chart
   */
  initMonthlyChart() {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    
    this.monthlyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Despesas por Mês',
          data: [],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        ...this.chartOptions,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat('pt-BR', CONFIG.CURRENCY_FORMAT)
                  .format(value);
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  /**
   * Update the category distribution chart with new data
   * @param {Array} summaryData - The summary data from the API
   */
  updateCategoryChart(summaryData) {
    if (!this.categoryChart) {
      console.log('Inicializando gráfico de categorias...');
      this.initCategoryChart();
    }

    console.log('Atualizando gráfico de categorias com dados:', summaryData);

    // Check if there's data to display
    if (!summaryData || summaryData.length === 0) {
      console.log('Nenhum dado de resumo para exibir');
      // Set empty data
      this.categoryChart.data.labels = ['Sem dados'];
      this.categoryChart.data.datasets[0].data = [1];
      this.categoryChart.data.datasets[0].backgroundColor = ['#dddddd'];
      
      // Update the no data message
      this.categoryChart.options.plugins.legend.display = false;
      this.categoryChart.options.plugins.tooltip = {
        callbacks: {
          label: function() {
            return 'Sem transações para exibir';
          }
        }
      };
      
      this.categoryChart.update();
      return;
    }

    // Reset options if they were changed for no data
    this.categoryChart.options.plugins.legend.display = true;
    this.categoryChart.options.plugins.tooltip = this.chartOptions.plugins.tooltip;
    
    const labels = [];
    const data = [];
    const backgroundColor = [];

    summaryData.forEach(category => {
      const categoryName = category.category;
      const categoryConfig = CONFIG.CATEGORIES[categoryName];

      console.log('Processando categoria:', {
        name: categoryName,
        config: categoryConfig ? 'encontrada' : 'não encontrada',
        totalAmount: category.totalAmount
      });
      
      if (categoryConfig) {
        labels.push(categoryConfig.label);
        data.push(category.totalAmount);
        backgroundColor.push(categoryConfig.color);
      } else {
        // Handle unknown categories gracefully
        console.warn('Categoria desconhecida:', categoryName);
        labels.push(categoryName);
        data.push(category.totalAmount);
        backgroundColor.push('#999999'); // Default color for unknown categories
      }
    });

    this.categoryChart.data.labels = labels;
    this.categoryChart.data.datasets[0].data = data;
    this.categoryChart.data.datasets[0].backgroundColor = backgroundColor;
    
    this.categoryChart.update();
  }

  /**
   * Group transactions by month and update the monthly chart
   * @param {Array} transactions - The transactions data from the API
   */
  updateMonthlyChart(transactions) {
    if (!this.monthlyChart) {
      console.log('Inicializando gráfico mensal...');
      this.initMonthlyChart();
    }

    console.log('Atualizando gráfico mensal com transações:', transactions?.length || 0);

    // Check if there's data to display
    if (!transactions || transactions.length === 0) {
      console.log('Nenhuma transação para exibir no gráfico mensal');
      // Set empty data
      this.monthlyChart.data.labels = ['Sem dados'];
      this.monthlyChart.data.datasets[0].data = [0];
      
      // Update options to show 'no data' message
      this.monthlyChart.options.plugins.tooltip = {
        callbacks: {
          label: function() {
            return 'Sem transações para exibir';
          }
        }
      };
      
      this.monthlyChart.update();
      return;
    }

    // Reset options if they were changed for no data
    this.monthlyChart.options.plugins.tooltip = {
      callbacks: {
        label: function(context) {
          return new Intl.NumberFormat('pt-BR', CONFIG.CURRENCY_FORMAT)
            .format(context.parsed.y);
        }
      }
    };
    
    // Group transactions by month
    const monthlyData = {};
    
    // Add current month and previous months (up to 6 months) even if they have no transactions
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      monthlyData[monthYear] = 0;
    }
    
    console.log('Meses inicializados:', Object.keys(monthlyData));
    
    // Add transaction data
    transactions.forEach(transaction => {
      try {
        const date = new Date(transaction.date);
        console.log('Processando transação para gráfico mensal:', {
          id: transaction._id,
          date: transaction.date,
          parsedDate: date.toISOString(),
          value: transaction.value
        });
        
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        
        if (!monthlyData[monthYear]) {
          console.log('Adicionando novo mês ao gráfico:', monthYear);
          monthlyData[monthYear] = 0;
        }
        
        monthlyData[monthYear] += transaction.value;
      } catch (e) {
        console.error('Erro ao processar data da transação:', e, transaction);
      }
    });

    // Sort by date (reverse chronological order - newest first)
    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      const [monthA, yearA] = a.split('/');
      const [monthB, yearB] = b.split('/');
      return new Date(yearB, monthB - 1) - new Date(yearA, monthA - 1);
    });

    console.log('Meses ordenados:', sortedMonths);

    // Format month labels
    const labels = sortedMonths.map(monthYear => {
      const [month, year] = monthYear.split('/');
      return new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    });

    const data = sortedMonths.map(monthYear => monthlyData[monthYear]);

    console.log('Dados para gráfico mensal:', {
      labels,
      data
    });

    this.monthlyChart.data.labels = labels;
    this.monthlyChart.data.datasets[0].data = data;
    
    this.monthlyChart.update();
    console.log('Gráfico mensal atualizado com sucesso');
  }
}

// Create a singleton instance
const chartsManager = new ChartsManager();

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Inicializando gráficos...');
  chartsManager.initCharts();
  console.log('Gráficos inicializados com sucesso');
});
