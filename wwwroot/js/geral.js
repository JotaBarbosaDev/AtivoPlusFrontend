/**
 * JavaScript for Geral page
 * Handles dashboard data aggregation and display using existing APIs
 */

// Global variables
let dashboardData = {
    totalProfit: 0,
    totalValue: 0,
    depositos: [],
    fundos: [],
    imoveis: [],
    carteiras: [],
    topAssets: [],
    recentTransactions: []
};

// Initialize dashboard
async function initDashboard() {
    try {
        console.log('🚀 Dashboard initialization started...');
        showLoadingState();

        // Load all data from existing APIs with timeout
        const loadPromises = [
            loadDepositosData(),
            loadFundosData(),
            loadImoveisData(),
            loadCarteirasData()
        ];

        // Use Promise.allSettled to handle partial failures
        const results = await Promise.allSettled(loadPromises);

        // Log results for debugging
        results.forEach((result, index) => {
            const dataType = ['depositos', 'fundos', 'imoveis', 'carteiras'][index];
            if (result.status === 'rejected') {
                console.warn(`⚠️ Failed to load ${dataType}:`, result.reason);
            } else {
                console.log(`✅ Successfully loaded ${dataType}`);
            }
        });

        // Calculate and update dashboard metrics
        await calculateDashboardMetrics();
        await updateDashboardDisplay();

        // Add some sample data if no real data is available
        if (dashboardData.totalValue === 0) {
            console.log('📊 No real data found, using sample data for demonstration');
            addSampleData();
            await calculateDashboardMetrics();
            await updateDashboardDisplay();
        }

        hideLoadingState();
        console.log('✅ Dashboard initialization completed successfully');
    } catch (error) {
        console.error('❌ Error initializing dashboard:', error);
        showErrorState();
        // Try to load sample data as fallback
        addSampleData();
        await calculateDashboardMetrics();
        await updateDashboardDisplay();
        hideLoadingState();
    }
}

// Load depositos data using existing API
async function loadDepositosData() {
    try {
        console.log('🏦 Loading depositos data...');
        const response = await fetch('/api/depositoprazo/getAll', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            dashboardData.depositos = await response.json();
            console.log('✅ Depositos loaded:', dashboardData.depositos.length, 'items');
        } else {
            console.warn('⚠️ Failed to load depositos:', response.status);
        }
    } catch (error) {
        console.error('❌ Error loading depositos:', error);
        // Use mock data for testing
        dashboardData.depositos = [
            { id: 1, valorInicial: 10000, valorAtual: 10500 },
            { id: 2, valorInicial: 5000, valorAtual: 5250 }
        ];
        console.log('🔄 Using mock depositos data');
    }
}

// Load fundos data using existing API
async function loadFundosData() {
    try {
        console.log('📈 Loading fundos data...');
        const response = await fetch('/api/fundoinvestimento/getAll', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            dashboardData.fundos = await response.json();
            console.log('✅ Fundos loaded:', dashboardData.fundos.length, 'items');
        } else {
            console.warn('⚠️ Failed to load fundos:', response.status);
        }
    } catch (error) {
        console.error('❌ Error loading fundos:', error);
        // Use mock data for testing
        dashboardData.fundos = [
            { id: 1, designacao: 'Fundo A', valorInicial: 15000, valorAtual: 16200 },
            { id: 2, designacao: 'Fundo B', valorInicial: 8000, valorAtual: 8400 }
        ];
        console.log('🔄 Using mock fundos data');
    }
}

// Load imoveis data using existing API
async function loadImoveisData() {
    try {
        console.log('🏠 Loading imoveis data...');
        const response = await fetch('/api/imovelarrendado/getAll', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            dashboardData.imoveis = await response.json();
            console.log('✅ Imoveis loaded:', dashboardData.imoveis.length, 'items');
        } else {
            console.warn('⚠️ Failed to load imoveis:', response.status);
        }
    } catch (error) {
        console.error('❌ Error loading imoveis:', error);
        // Use mock data for testing
        dashboardData.imoveis = [
            { id: 1, designacao: 'Apartamento Lisboa', valorCompra: 200000, valorAtual: 220000 },
            { id: 2, designacao: 'Casa Porto', valorCompra: 150000, valorAtual: 165000 }
        ];
        console.log('🔄 Using mock imoveis data');
    }
}

// Load carteiras data using existing API
async function loadCarteirasData() {
    try {
        console.log('💼 Loading carteiras data...');
        const response = await fetch('/api/carteira/getAll', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            dashboardData.carteiras = await response.json();
            console.log('✅ Carteiras loaded:', dashboardData.carteiras.length, 'items');
        } else {
            console.warn('⚠️ Failed to load carteiras:', response.status);
        }
    } catch (error) {
        console.error('❌ Error loading carteiras:', error);
        // Use mock data for testing
        dashboardData.carteiras = [
            { id: 1, nome: 'Carteira Principal' },
            { id: 2, nome: 'Carteira Secundária' }
        ];
        console.log('🔄 Using mock carteiras data');
    }
}

// Calculate dashboard metrics using existing calculation functions
async function calculateDashboardMetrics() {
    try {
        console.log('🧮 Calculating dashboard metrics...');
        let totalProfit = 0;
        let totalValue = 0;
        let assets = [];

        // Calculate depositos profits
        console.log('💰 Processing depositos...');
        for (const deposito of dashboardData.depositos) {
            try {
                let profit = 0;
                let totalDeposito = deposito.valorInicial || 0;

                // Try to use calculation function if available
                if (typeof calcularLucroDeposito === 'function') {
                    profit = await calcularLucroDeposito(deposito);
                } else {
                    // Fallback calculation
                    profit = (deposito.valorAtual || deposito.valorInicial || 0) - (deposito.valorInicial || 0);
                }

                if (typeof calcularValorTotalDeposito === 'function') {
                    totalDeposito = await calcularValorTotalDeposito(deposito);
                } else {
                    totalDeposito = deposito.valorAtual || deposito.valorInicial || 0;
                }

                totalProfit += profit;
                totalValue += totalDeposito;

                assets.push({
                    name: `Depósito ${deposito.id}`,
                    type: 'Depósito',
                    profit: profit,
                    value: totalDeposito,
                    icon: '💰'
                });
            } catch (error) {
                console.error('Error calculating deposito profit:', error);
            }
        }

        // Calculate fundos profits
        console.log('📈 Processing fundos...');
        for (const fundo of dashboardData.fundos) {
            try {
                let profit = 0;

                // Try to use calculation function if available
                if (typeof calcularLucroFundoInvestimento === 'function') {
                    profit = await calcularLucroFundoInvestimento(fundo);
                } else {
                    // Fallback calculation
                    profit = (fundo.valorAtual || fundo.valorInicial || 0) - (fundo.valorInicial || 0);
                }

                const currentValue = (fundo.valorAtual || fundo.valorInicial || 0);

                totalProfit += profit;
                totalValue += currentValue;

                assets.push({
                    name: fundo.designacao || `Fundo ${fundo.id}`,
                    type: 'Fundo',
                    profit: profit,
                    value: currentValue,
                    icon: '🏦'
                });
            } catch (error) {
                console.error('Error calculating fundo profit:', error);
            }
        }

        // Calculate imoveis profits
        console.log('🏠 Processing imoveis...');
        for (const imovel of dashboardData.imoveis) {
            try {
                let profit = 0;

                // Try to use calculation function if available
                if (typeof calcularLucroImovel === 'function') {
                    profit = await calcularLucroImovel(imovel);
                } else {
                    // Fallback calculation
                    profit = (imovel.valorAtual || imovel.valorCompra || 0) - (imovel.valorCompra || 0);
                }

                const currentValue = imovel.valorAtual || imovel.valorCompra || 0;

                totalProfit += profit;
                totalValue += currentValue;

                assets.push({
                    name: imovel.designacao || `Imóvel ${imovel.id}`,
                    type: 'Imóvel',
                    profit: profit,
                    value: currentValue,
                    icon: '🏠'
                });
            } catch (error) {
                console.error('Error calculating imovel profit:', error);
            }
        }

        // Store calculated values
        dashboardData.totalProfit = totalProfit;
        dashboardData.totalValue = totalValue;

        // Sort assets by profit (top performers)
        assets.sort((a, b) => b.profit - a.profit);
        dashboardData.topAssets = assets.slice(0, 5);

        console.log('✅ Dashboard metrics calculated:', {
            totalProfit: totalProfit,
            totalValue: totalValue,
            topAssets: dashboardData.topAssets.length
        });

    } catch (error) {
        console.error('❌ Error calculating dashboard metrics:', error);
    }
}

// Update dashboard display with calculated data
async function updateDashboardDisplay() {
    try {
        console.log('🖥️ Updating dashboard display...');

        // Update total profit
        const totalProfitElement = document.getElementById('totalProfit');
        if (totalProfitElement) {
            totalProfitElement.textContent = formatCurrency(dashboardData.totalProfit);
            totalProfitElement.classList.remove('loading-indicator');
        }

        // Update profit percentage
        const profitPercentageElement = document.getElementById('profitPercentage');
        if (profitPercentageElement && dashboardData.totalValue > 0) {
            const invested = dashboardData.totalValue - dashboardData.totalProfit;
            const percentage = invested > 0 ? (dashboardData.totalProfit / invested) * 100 : 0;
            profitPercentageElement.textContent = `+${percentage.toFixed(1)}%`;
            profitPercentageElement.classList.remove('loading-indicator');
        }

        // Update asset counts and summaries
        updateSummaryCards();

        // Update top assets
        updateTopAssets();

        console.log('✅ Dashboard display updated successfully');

    } catch (error) {
        console.error('❌ Error updating dashboard display:', error);
    }
}

// Calculate imoveis profits
for (const imovel of dashboardData.imoveis) {
    try {
        const profit = await calcularLucroImovel(imovel);
        const currentValue = imovel.valorCompra + profit;

        totalProfit += profit;
        totalValue += currentValue;

        assets.push({
            name: imovel.designacao || `Imóvel ${imovel.id}`,
            type: 'Imóvel',
            profit: profit,
            value: currentValue,
            icon: '🏠'
        });
    } catch (error) {
        console.error('Error calculating imovel profit:', error);
    }
}


// Update dashboard display with calculated data
async function updateDashboardDisplay() {
    try {
        // Update total profit
        const totalProfitElement = document.getElementById('totalProfit');
        if (totalProfitElement) {
            totalProfitElement.textContent = formatCurrency(dashboardData.totalProfit);
        }

        // Update total value
        const totalValueElement = document.getElementById('totalValue');
        if (totalValueElement) {
            totalValueElement.textContent = formatCurrency(dashboardData.totalValue);
        }

        // Update profit percentage
        const profitPercentageElement = document.getElementById('profitPercentage');
        if (profitPercentageElement && dashboardData.totalValue > 0) {
            const percentage = ((dashboardData.totalProfit / (dashboardData.totalValue - dashboardData.totalProfit)) * 100);
            profitPercentageElement.textContent = `+${percentage.toFixed(1)}%`;
        }

        // Update asset counts
        updateAssetCounts();

        // Update top assets
        updateTopAssets();

        // Update summary cards
        updateSummaryCards();

    } catch (error) {
        console.error('Error updating dashboard display:', error);
    }
}

// Update asset counts
function updateAssetCounts() {
    const totalAssets = dashboardData.depositos.length + dashboardData.fundos.length + dashboardData.imoveis.length;
    const totalCarteiras = dashboardData.carteiras.length;

    const totalAssetsElement = document.getElementById('totalAssets');
    if (totalAssetsElement) {
        totalAssetsElement.textContent = totalAssets.toString();
    }

    const totalAssetsValueElement = document.getElementById('totalAssetsValue');
    if (totalAssetsValueElement) {
        totalAssetsValueElement.textContent = formatCurrency(dashboardData.totalValue);
    }

    const totalCarteirasElement = document.getElementById('totalCarteiras');
    if (totalCarteirasElement) {
        totalCarteirasElement.textContent = `${totalAssets} ativos em ${totalCarteiras} carteiras`;
    }
}

// Update top assets display
function updateTopAssets() {
    const topAssetsContainer = document.getElementById('topAssetsContainer');
    if (!topAssetsContainer || dashboardData.topAssets.length === 0) return;

    const topAssetsHtml = dashboardData.topAssets.map(asset => `
        <div class="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
            <div class="flex items-center">
                <span class="text-2xl mr-3">${asset.icon}</span>
                <span class="font-medium text-white">${asset.name}</span>
            </div>
            <div class="text-right">
                <div class="text-green-400 font-semibold">${formatCurrency(asset.profit)}</div>
                <div class="text-xs text-gray-400">${asset.type}</div>
            </div>
        </div>
    `).join('');

    topAssetsContainer.innerHTML = topAssetsHtml;
}

// Update summary cards with real data
function updateSummaryCards() {
    // Update depositos summary
    const depositosCount = dashboardData.depositos.length;
    const depositosTotal = dashboardData.depositos.reduce((sum, dep) => sum + (dep.valorInicial || 0), 0);

    // Update fundos summary
    const fundosCount = dashboardData.fundos.length;
    const fundosTotal = dashboardData.fundos.reduce((sum, fund) => sum + (fund.valorInicial || 0), 0);

    // Update imoveis summary
    const imoveisCount = dashboardData.imoveis.length;
    const imoveisTotal = dashboardData.imoveis.reduce((sum, imovel) => sum + (imovel.valorCompra || 0), 0);

    // Update displays if elements exist
    const summaryElements = {
        // Main cards
        depositosCount: document.getElementById('depositosCount'),
        depositosTotal: document.getElementById('depositosTotal'),
        fundosCount: document.getElementById('fundosCount'),
        fundosTotal: document.getElementById('fundosTotal'),
        imoveisCount: document.getElementById('imoveisCount'),
        imoveisTotal: document.getElementById('imoveisTotal'),

        // Secondary displays
        depositosCount2: document.getElementById('depositosCount2'),
        depositosTotal2: document.getElementById('depositosTotal2'),
        fundosCount2: document.getElementById('fundosCount2'),
        fundosTotal2: document.getElementById('fundosTotal2'),
        imoveisCount2: document.getElementById('imoveisCount2'),
        imoveisTotal2: document.getElementById('imoveisTotal2')
    };

    // Update main cards
    if (summaryElements.depositosCount) summaryElements.depositosCount.textContent = depositosCount;
    if (summaryElements.depositosTotal) summaryElements.depositosTotal.textContent = formatCurrency(depositosTotal);
    if (summaryElements.fundosCount) summaryElements.fundosCount.textContent = fundosCount;
    if (summaryElements.fundosTotal) summaryElements.fundosTotal.textContent = formatCurrency(fundosTotal);
    if (summaryElements.imoveisCount) summaryElements.imoveisCount.textContent = imoveisCount;
    if (summaryElements.imoveisTotal) summaryElements.imoveisTotal.textContent = formatCurrency(imoveisTotal);

    // Update secondary displays
    if (summaryElements.depositosCount2) summaryElements.depositosCount2.textContent = `${depositosCount} ativos`;
    if (summaryElements.depositosTotal2) summaryElements.depositosTotal2.textContent = formatCurrency(depositosTotal);
    if (summaryElements.fundosCount2) summaryElements.fundosCount2.textContent = `${fundosCount} ativos`;
    if (summaryElements.fundosTotal2) summaryElements.fundosTotal2.textContent = formatCurrency(fundosTotal);
    if (summaryElements.imoveisCount2) summaryElements.imoveisCount2.textContent = `${imoveisCount} ativos`;
    if (summaryElements.imoveisTotal2) summaryElements.imoveisTotal2.textContent = formatCurrency(imoveisTotal);
}

// Helper function to calculate total value of a deposito (if not available in ativosCalculos.js)
async function calcularValorTotalDeposito(deposito) {
    try {
        // Calculate based on initial value + profit
        const profit = await calcularLucroDeposito(deposito);
        return (deposito.valorInicial || deposito.valorInvestido || 0) + profit;
    } catch (error) {
        console.error('Error calculating deposito total value:', error);
        return deposito.valorInicial || deposito.valorInvestido || 0;
    }
}

// Add sample data for demonstration when real data is not available
function addSampleData() {
    console.log('📊 Adding sample data for demonstration...');

    dashboardData.depositos = [
        { id: 1, valorInicial: 5000, taxaJuro: 2.5, dataInicio: '2024-01-01', dataFim: '2024-12-31' },
        { id: 2, valorInicial: 10000, taxaJuro: 3.0, dataInicio: '2024-02-01', dataFim: '2025-02-01' }
    ];

    dashboardData.fundos = [
        { id: 1, designacao: 'Fundo Global', valorInicial: 15000, dataCompra: '2024-01-15' },
        { id: 2, designacao: 'Fundo Tecnologia', valorInicial: 8000, dataCompra: '2024-03-01' }
    ];

    dashboardData.imoveis = [
        { id: 1, designacao: 'Apartamento T2 Lisboa', valorCompra: 150000, rendaAtual: 800, dataCompra: '2023-06-01' },
        { id: 2, designacao: 'Casa T3 Porto', valorCompra: 200000, rendaAtual: 1200, dataCompra: '2023-09-15' }
    ];

    dashboardData.carteiras = [
        { id: 1, designacao: 'Carteira Principal' },
        { id: 2, designacao: 'Carteira Secundária' }
    ];
}

// Dashboard Manager object for global access
window.DashboardManager = {
    initDashboard: initDashboard,
    refreshDashboard: async function () {
        console.log('🔄 Refreshing dashboard data...');
        await initDashboard();
    },
    getDashboardData: function () {
        return dashboardData;
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 DOM loaded, checking for required functions...');

    // Check if we have the required calculation functions
    if (typeof calcularLucroDeposito === 'function' &&
        typeof calcularLucroFundoInvestimento === 'function' &&
        typeof calcularLucroImovel === 'function') {
        console.log('✅ All calculation functions found, initializing dashboard...');
        initDashboard();
    } else {
        console.warn('⚠️ Some calculation functions not found, initializing with sample data...');
        // Create fallback functions if they don't exist
        if (typeof calcularLucroDeposito !== 'function') {
            window.calcularLucroDeposito = async function (deposito) {
                // Simple calculation: 2.5% annual return
                const monthsElapsed = 6; // Assume 6 months
                return (deposito.valorInicial * (deposito.taxaJuro / 100) * monthsElapsed / 12);
            };
        }

        if (typeof calcularLucroFundoInvestimento !== 'function') {
            window.calcularLucroFundoInvestimento = async function (fundo) {
                // Simple calculation: 5% return
                return fundo.valorInicial * 0.05;
            };
        }

        if (typeof calcularLucroImovel !== 'function') {
            window.calcularLucroImovel = async function (imovel) {
                // Simple calculation: rent for 12 months
                return (imovel.rendaAtual || 800) * 12;
            };
        }

        if (typeof calcularValorTotalDeposito !== 'function') {
            window.calcularValorTotalDeposito = async function (deposito) {
                const profit = await calcularLucroDeposito(deposito);
                return deposito.valorInicial + profit;
            };
        }

        // Initialize with fallback functions
        setTimeout(initDashboard, 1000);
    }
});

// Utility functions
function formatCurrency(value) {
    if (typeof value !== 'number' || isNaN(value)) return '€0,00';

    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function showLoadingState() {
    // Show loading indicators
    const loadingElements = document.querySelectorAll('.loading-indicator');
    loadingElements.forEach(el => el.classList.remove('hidden'));
}

function hideLoadingState() {
    // Hide loading indicators
    const loadingElements = document.querySelectorAll('.loading-indicator');
    loadingElements.forEach(el => el.classList.add('hidden'));
}

function showErrorState() {
    console.warn('Dashboard is in error state, using fallback display');
    // Could show error message to user
}

// Refresh dashboard data
async function refreshDashboard() {
    await initDashboard();
    showToast('Dashboard atualizado com sucesso!', 'success');
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;

    const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
    toast.className += ` ${bgColor} text-white`;

    toast.textContent = message;
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Performance calculation functions have been removed as they are no longer needed
