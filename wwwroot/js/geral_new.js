/**
 * Enhanced JavaScript for Geral Dashboard page
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
        console.log('🚀 Initializing dashboard...');
        showLoadingState();

        // Load all data from existing APIs
        await Promise.all([
            loadDepositosData(),
            loadFundosData(),
            loadImoveisData(),
            loadCarteirasData()
        ]);

        // Calculate and update dashboard metrics
        await calculateDashboardMetrics();
        await updateDashboardDisplay();

        hideLoadingState();
        console.log('✅ Dashboard initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing dashboard:', error);
        showErrorState();
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
            // Use fallback data
            dashboardData.depositos = [];
        }
    } catch (error) {
        console.error('❌ Error loading depositos:', error);
        // Use mock data for testing
        dashboardData.depositos = [
            { id: 1, valorInicial: 10000, valorAtual: 10500, taxaJuroAnual: 2.5 },
            { id: 2, valorInicial: 5000, valorAtual: 5250, taxaJuroAnual: 3.0 }
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
            dashboardData.fundos = [];
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
            dashboardData.imoveis = [];
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
            dashboardData.carteiras = [];
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

        // Update performance indicators
        updatePerformanceIndicators();

        console.log('✅ Dashboard display updated successfully');

    } catch (error) {
        console.error('❌ Error updating dashboard display:', error);
    }
}

// Update summary cards with real data
function updateSummaryCards() {
    console.log('📊 Updating summary cards...');

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
    if (summaryElements.depositosCount) {
        summaryElements.depositosCount.textContent = depositosCount;
        summaryElements.depositosCount.classList.remove('loading-indicator');
    }
    if (summaryElements.depositosTotal) {
        summaryElements.depositosTotal.textContent = formatCurrency(depositosTotal);
        summaryElements.depositosTotal.classList.remove('loading-indicator');
    }
    if (summaryElements.fundosCount) {
        summaryElements.fundosCount.textContent = fundosCount;
        summaryElements.fundosCount.classList.remove('loading-indicator');
    }
    if (summaryElements.fundosTotal) {
        summaryElements.fundosTotal.textContent = formatCurrency(fundosTotal);
        summaryElements.fundosTotal.classList.remove('loading-indicator');
    }
    if (summaryElements.imoveisCount) {
        summaryElements.imoveisCount.textContent = imoveisCount;
        summaryElements.imoveisCount.classList.remove('loading-indicator');
    }
    if (summaryElements.imoveisTotal) {
        summaryElements.imoveisTotal.textContent = formatCurrency(imoveisTotal);
        summaryElements.imoveisTotal.classList.remove('loading-indicator');
    }

    // Update secondary displays
    if (summaryElements.depositosCount2) {
        summaryElements.depositosCount2.textContent = `${depositosCount} ativos`;
        summaryElements.depositosCount2.classList.remove('loading-indicator');
    }
    if (summaryElements.depositosTotal2) {
        summaryElements.depositosTotal2.textContent = formatCurrency(depositosTotal);
        summaryElements.depositosTotal2.classList.remove('loading-indicator');
    }
    if (summaryElements.fundosCount2) {
        summaryElements.fundosCount2.textContent = `${fundosCount} ativos`;
        summaryElements.fundosCount2.classList.remove('loading-indicator');
    }
    if (summaryElements.fundosTotal2) {
        summaryElements.fundosTotal2.textContent = formatCurrency(fundosTotal);
        summaryElements.fundosTotal2.classList.remove('loading-indicator');
    }
    if (summaryElements.imoveisCount2) {
        summaryElements.imoveisCount2.textContent = `${imoveisCount} ativos`;
        summaryElements.imoveisCount2.classList.remove('loading-indicator');
    }
    if (summaryElements.imoveisTotal2) {
        summaryElements.imoveisTotal2.textContent = formatCurrency(imoveisTotal);
        summaryElements.imoveisTotal2.classList.remove('loading-indicator');
    }
}

// Update top assets display
function updateTopAssets() {
    const topAssetsContainer = document.getElementById('topAssetsContainer');
    if (!topAssetsContainer) return;

    if (dashboardData.topAssets.length === 0) {
        topAssetsContainer.innerHTML = `
            <div class="text-center p-8 text-gray-400">
                <div class="text-4xl mb-2">📊</div>
                <p>Nenhum ativo encontrado</p>
            </div>
        `;
        return;
    }

    const topAssetsHtml = dashboardData.topAssets.map(asset => `
        <div class="flex justify-between items-center p-4 dark-glass-card rounded-lg hover:scale-102 transition-all duration-300">
            <div class="flex items-center">
                <span class="text-2xl mr-3">${asset.icon}</span>
                <div>
                    <span class="font-medium text-white">${asset.name}</span>
                    <div class="text-xs text-gray-400">${asset.type}</div>
                </div>
            </div>
            <div class="text-right">
                <div class="text-emerald-400 font-semibold">${formatCurrency(asset.profit)}</div>
                <div class="text-xs text-gray-400">${formatCurrency(asset.value)}</div>
            </div>
        </div>
    `).join('');

    topAssetsContainer.innerHTML = topAssetsHtml;
}

// Calculate performance for each asset type
function calculateDepositosPerformance() {
    if (!dashboardData.depositos || dashboardData.depositos.length === 0) return 0;

    const totalInvested = dashboardData.depositos.reduce((sum, d) => sum + (d.valorInicial || 0), 0);
    const totalCurrent = dashboardData.depositos.reduce((sum, d) => sum + (d.valorAtual || d.valorInicial || 0), 0);

    return totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested) * 100 : 0;
}

function calculateFundosPerformance() {
    if (!dashboardData.fundos || dashboardData.fundos.length === 0) return 0;

    const totalInvested = dashboardData.fundos.reduce((sum, f) => sum + (f.valorInicial || 0), 0);
    const totalCurrent = dashboardData.fundos.reduce((sum, f) => sum + (f.valorAtual || f.valorInicial || 0), 0);

    return totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested) * 100 : 0;
}

function calculateImoveisPerformance() {
    if (!dashboardData.imoveis || dashboardData.imoveis.length === 0) return 0;

    const totalInvested = dashboardData.imoveis.reduce((sum, i) => sum + (i.valorCompra || 0), 0);
    const totalCurrent = dashboardData.imoveis.reduce((sum, i) => sum + (i.valorAtual || i.valorCompra || 0), 0);

    return totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested) * 100 : 0;
}

// Update performance indicators
function updatePerformanceIndicators() {
    try {
        console.log('📈 Updating performance indicators...');

        const depositosPerf = calculateDepositosPerformance();
        const fundosPerf = calculateFundosPerformance();
        const imoveisPerf = calculateImoveisPerformance();

        const totalInvested = dashboardData.totalValue - dashboardData.totalProfit;
        const totalPerf = totalInvested > 0 ? (dashboardData.totalProfit / totalInvested) * 100 : 0;

        // Update UI elements
        const performanceElements = {
            depositosPerformance: document.getElementById('depositosPerformance'),
            fundosPerformance: document.getElementById('fundosPerformance'),
            imoveisPerformance: document.getElementById('imoveisPerformance'),
            totalPerformance: document.getElementById('totalPerformance')
        };

        if (performanceElements.depositosPerformance) {
            performanceElements.depositosPerformance.textContent = `${depositosPerf >= 0 ? '+' : ''}${depositosPerf.toFixed(1)}%`;
            performanceElements.depositosPerformance.className = depositosPerf >= 0 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold';
            performanceElements.depositosPerformance.classList.remove('loading-indicator');
        }

        if (performanceElements.fundosPerformance) {
            performanceElements.fundosPerformance.textContent = `${fundosPerf >= 0 ? '+' : ''}${fundosPerf.toFixed(1)}%`;
            performanceElements.fundosPerformance.className = fundosPerf >= 0 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold';
            performanceElements.fundosPerformance.classList.remove('loading-indicator');
        }

        if (performanceElements.imoveisPerformance) {
            performanceElements.imoveisPerformance.textContent = `${imoveisPerf >= 0 ? '+' : ''}${imoveisPerf.toFixed(1)}%`;
            performanceElements.imoveisPerformance.className = imoveisPerf >= 0 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold';
            performanceElements.imoveisPerformance.classList.remove('loading-indicator');
        }

        if (performanceElements.totalPerformance) {
            performanceElements.totalPerformance.textContent = `${totalPerf >= 0 ? '+' : ''}${totalPerf.toFixed(1)}%`;
            performanceElements.totalPerformance.className = totalPerf >= 0 ? 'text-emerald-400' : 'text-red-400';
            performanceElements.totalPerformance.classList.remove('loading-indicator');
        }

    } catch (error) {
        console.error('❌ Error updating performance indicators:', error);
    }
}

// Helper function to calculate total value of a deposito (if not available in ativosCalculos.js)
async function calcularValorTotalDeposito(deposito) {
    try {
        return deposito.valorAtual || deposito.valorInicial || 0;
    } catch (error) {
        console.error('Error calculating total deposito value:', error);
        return deposito.valorInicial || 0;
    }
}

// Utility functions
function formatCurrency(value) {
    if (typeof value !== 'number' || isNaN(value)) return '€0';

    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function showLoadingState() {
    console.log('⏳ Showing loading state...');
    // Loading indicators are handled by CSS classes
}

function hideLoadingState() {
    console.log('✅ Hiding loading state...');
    const loadingElements = document.querySelectorAll('.loading-indicator');
    loadingElements.forEach(el => el.classList.remove('loading-indicator'));
}

function showErrorState() {
    console.warn('⚠️ Dashboard is in error state, using fallback display');
    const errorToast = document.createElement('div');
    errorToast.className = 'fixed top-4 left-4 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg';
    errorToast.innerHTML = '⚠️ Erro ao carregar dados. Usando dados de exemplo.';
    document.body.appendChild(errorToast);

    setTimeout(() => {
        document.body.removeChild(errorToast);
    }, 5000);
}

// Refresh dashboard data
async function refreshDashboard() {
    console.log('🔄 Refreshing dashboard...');
    await initDashboard();
    showToast('✨ Dashboard atualizado com sucesso!', 'success');
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;

    const bgColor = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    console.log('🎯 DOM Content Loaded - Starting Dashboard');

    // Check if we have the required calculation functions
    if (typeof calcularLucroDeposito === 'function' &&
        typeof calcularLucroFundoInvestimento === 'function' &&
        typeof calcularLucroImovel === 'function') {
        console.log('✅ All calculation functions available');
        initDashboard();
    } else {
        console.warn('⚠️ Some calculation functions not found. Using fallback calculations.');
        initDashboard();
    }
});

// Export functions for external use
window.DashboardManager = {
    refreshDashboard,
    initDashboard,
    dashboardData,
    calculateDashboardMetrics,
    updateDashboardDisplay
};

console.log('📊 Enhanced Dashboard Manager loaded successfully');
