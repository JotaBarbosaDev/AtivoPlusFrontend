/**
 * JavaScript for Geral page
 * Simplified functions for dashboard functionality
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

// Banks data for deposit name generation
let banks = [];

// Initialize dashboard
async function initDashboard() {
    console.log('🚀 Dashboard initialization started...');
    showLoadingState();

    await Promise.all([
        loadDepositosData(),
        loadFundosData(),
        loadImoveisData(),
        loadCarteirasData(),
        loadBanksData()
    ]);

    await calculateDashboardMetrics();
    await updateDashboardDisplay();

    hideLoadingState();
    console.log('✅ Dashboard initialization completed');
    console.log(dashboardData)
}

// Load depositos data
async function loadDepositosData() {
    console.log('🏦 Loading depositos data...');
    try {
        dashboardData.depositos = await fetchDepositos();
    } catch (error) {
        console.error('❌ Error loading depositos:', error);
        dashboardData.depositos = [];
    }
    return 0;
}

// Load fundos data
async function loadFundosData() {
    console.log('📈 Loading fundos data...');
    try {
        dashboardData.fundos = await fetchFundos();
        console.log(`✅ Loaded ${dashboardData.fundos.length} fundos`);
    } catch (error) {
        console.error('❌ Error loading fundos:', error);
        dashboardData.fundos = [];
    }
    return 0;
}

// Load imoveis data
async function loadImoveisData() {
    console.log('🏠 Loading imoveis data...');
    try {
        dashboardData.imoveis = await fetchImoveis();
        console.log(`✅ Loaded ${dashboardData.imoveis.length} imoveis`);
    } catch (error) {
        console.error('❌ Error loading imoveis:', error);
        dashboardData.imoveis = [];
    }
    return 0;
}

// Load carteiras data
async function loadCarteirasData() {
    console.log('💼 Loading carteiras data...');
    try {
        const response = await fetch('/api/carteira/ver?userIdFromCarteira=-1', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar carteiras');
        }

        carteiras = await response.json();

    } catch (error) {
        console.error('Erro ao carregar carteiras:', error);
        carteiras = [];
    }
    return 0;
}

// Load banks data for deposit name generation
async function loadBanksData() {
    console.log('🏦 Loading banks data...');
    try {
        const response = await fetch('/api/banco/ver', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar bancos');
        }

        banks = await response.json();
        console.log(`✅ Loaded ${banks.length} banks`);
    } catch (error) {
        console.error('❌ Error loading banks:', error);
        banks = [];
    }
    return 0;
}

// Get bank name by ID
function getBankName(bancoId) {
    const bank = banks.find(b => b.id === bancoId);
    return bank ? bank.nome : `Banco ID: ${bancoId}`;
}

// Calculate dashboard metrics
async function calculateDashboardMetrics() {
    console.log('🧮 Calculating dashboard metrics...');

    try {
        let totalValue = 0;
        let totalProfit = 0;
        let totalInvested = 0;

        // Calculate depositos metrics using API
        if (dashboardData.depositos && Array.isArray(dashboardData.depositos)) {
            console.log('💰 Calculating depositos metrics...');

            for (const deposito of dashboardData.depositos) {
                try {
                    // Get current value (invested + profit)
                    const valorAtual = await calcularValorTotalDeposito(deposito);
                    const lucro = await calcularLucroDeposito(deposito);
                    const valorInvestido = deposito.valorInvestido || 0;

                    // Update deposito object with calculated values
                    deposito.valorAtual = valorAtual;
                    deposito.lucro = lucro;

                    // Add to totals
                    totalValue += valorAtual;
                    totalProfit += lucro;
                    totalInvested += valorInvestido;

                    console.log(`📊 Depósito ${deposito.id}: Investido €${valorInvestido}, Atual €${valorAtual}, Lucro €${lucro}`);
                } catch (error) {
                    console.error(`❌ Error calculating deposito ${deposito.id}:`, error);
                    // Fallback to stored values
                    const valorInvestido = deposito.valorInvestido || 0;
                    totalValue += valorInvestido;
                    totalInvested += valorInvestido;
                }
            }
        }

        // Calculate fundos metrics using API
        if (dashboardData.fundos && Array.isArray(dashboardData.fundos)) {
            console.log('📈 Calculating fundos metrics...');

            for (const fundo of dashboardData.fundos) {
                try {
                    const lucro = await calcularLucroFundoInvestimento(fundo);
                    const valorInvestido = fundo.montanteInvestido || 0;
                    const valorAtual = valorInvestido + lucro;

                    // Update fundo object with calculated values
                    fundo.valorAtual = valorAtual;
                    fundo.lucro = lucro;

                    // Add to totals
                    totalValue += valorAtual;
                    totalProfit += lucro;
                    totalInvested += valorInvestido;

                    console.log(`📊 Fundo ${fundo.id}: Investido €${valorInvestido}, Atual €${valorAtual}, Lucro €${lucro}`);
                } catch (error) {
                    console.error(`❌ Error calculating fundo ${fundo.id}:`, error);
                    // Check if it's an API access error
                    if (error.message === "Nao temos acesso com a api gratis symbol") {
                        console.warn(`⚠️ API access limited for fundo ${fundo.id}, using fallback values`);
                    }
                    // Fallback to stored values
                    const valorInvestido = fundo.montanteInvestido || 0;
                    totalValue += valorInvestido;
                    totalInvested += valorInvestido;
                }
            }
        }

        // Calculate imoveis metrics using API
        if (dashboardData.imoveis && Array.isArray(dashboardData.imoveis)) {
            console.log('🏠 Calculating imoveis metrics...');

            for (const imovel of dashboardData.imoveis) {
                try {
                    const lucro = await calcularLucroImovel(imovel);
                    const valorInvestido = imovel.valorImovel || 0;
                    const valorAtual = valorInvestido + lucro;

                    // Update imovel object with calculated values
                    imovel.valorAtual = valorAtual;
                    imovel.lucro = lucro;

                    // Add to totals
                    totalValue += valorAtual;
                    totalProfit += lucro;
                    totalInvested += valorInvestido;

                    console.log(`📊 Imóvel ${imovel.id}: Investido €${valorInvestido}, Atual €${valorAtual}, Lucro €${lucro}`);
                } catch (error) {
                    console.error(`❌ Error calculating imovel ${imovel.id}:`, error);
                    // Fallback to stored values
                    const valorInvestido = imovel.valorImovel || 0;
                    totalValue += valorInvestido;
                    totalInvested += valorInvestido;
                }
            }
        }

        // Update dashboard data
        dashboardData.totalValue = totalValue;
        dashboardData.totalProfit = totalProfit;
        dashboardData.totalInvested = totalInvested;

        // Calculate profit percentage
        const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;
        dashboardData.profitPercentage = profitPercentage;

        console.log(`✅ Calculated metrics - Total Invested: €${totalInvested}, Total Value: €${totalValue}, Total Profit: €${totalProfit}, Profit %: ${profitPercentage.toFixed(2)}%`);
    } catch (error) {
        console.error('❌ Error calculating dashboard metrics:', error);
        dashboardData.totalValue = 0;
        dashboardData.totalProfit = 0;
    }

    return 0;
}

// Update dashboard display
async function updateDashboardDisplay() {
    console.log('🎨 Updating dashboard display...');
    updateSummaryCards();
    updateAssetCounts();
    updateTopAssets();
    updatePerformanceIndicators();
    return 0;
}

// Update asset counts
function updateAssetCounts() {
    console.log('📊 Updating asset counts...');

    try {
        // Update depositos count
        const depositosCountEl = document.getElementById('depositosCount');
        if (depositosCountEl && dashboardData.depositos) {
            depositosCountEl.textContent = dashboardData.depositos.length;
        }

        // Update fundos count
        const fundosCountEl = document.getElementById('fundosCount');
        if (fundosCountEl && dashboardData.fundos) {
            fundosCountEl.textContent = dashboardData.fundos.length;
        }

        // Update imoveis count
        const imoveisCountEl = document.getElementById('imoveisCount');
        if (imoveisCountEl && dashboardData.imoveis) {
            imoveisCountEl.textContent = dashboardData.imoveis.length;
        }

        console.log('✅ Asset counts updated');
    } catch (error) {
        console.error('❌ Error updating asset counts:', error);
    }

    return 0;
}

// Update top assets display - ordered by profit percentage
async function updateTopAssets() {
    console.log('🔝 Updating top assets by profit percentage...');

    try {
        const topAssetsContainer = document.getElementById('topAssetsContainer');
        if (!topAssetsContainer) {
            console.warn('Top assets container not found');
            return 0;
        }

        // Show loading state
        topAssetsContainer.innerHTML = `
            <div class="text-center py-8">
                <div class="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p class="text-gray-400 text-sm">Calculando retornos...</p>
            </div>
        `;

        // Calculate profit percentage for each asset
        const assetsWithReturns = [];

        // Process depositos
        for (const deposito of dashboardData.depositos) {
            try {
                const lucro = await calcularLucroDeposito(deposito);
                const valorInvestido = deposito.valorInvestido || 0;
                const returnPercentage = valorInvestido > 0 ? (lucro / valorInvestido) * 100 : 0;

                // Generate deposit name with bank information
                const bankName = getBankName(deposito.bancoId);
                const depositName = deposito.descricao || `Depósito ${deposito.id} em ${bankName}`;

                assetsWithReturns.push({
                    ...deposito,
                    type: 'Depósito',
                    icon: '🏦',
                    lucro,
                    valorInvestido,
                    returnPercentage,
                    nome: depositName
                });
            } catch (error) {
                console.error('Error calculating deposito return:', error);
            }
        }

        // Process fundos
        for (const fundo of dashboardData.fundos) {
            try {
                const lucro = await calcularLucroFundoInvestimento(fundo);
                const valorInvestido = fundo.montanteInvestido || 0;
                const returnPercentage = valorInvestido > 0 ? (lucro / valorInvestido) * 100 : 0;

                assetsWithReturns.push({
                    ...fundo,
                    type: 'Fundo',
                    icon: '📈',
                    lucro,
                    valorInvestido,
                    returnPercentage,
                    nome: fundo.nome || `Fundo ${fundo.id}`
                });
            } catch (error) {
                console.error('Error calculating fundo return:', error);
                // For funds with API access issues, set 0% return
                const valorInvestido = fundo.montanteInvestido || 0;
                assetsWithReturns.push({
                    ...fundo,
                    type: 'Fundo',
                    icon: '📈',
                    lucro: 0,
                    valorInvestido,
                    returnPercentage: 0,
                    nome: fundo.nome || `Fundo ${fundo.id}`
                });
            }
        }

        // Process imoveis
        for (const imovel of dashboardData.imoveis) {
            try {
                const lucro = await calcularLucroImovel(imovel);
                const valorInvestido = imovel.valorImovel || imovel.valorCompra || 0;
                const returnPercentage = valorInvestido > 0 ? (lucro / valorInvestido) * 100 : 0;

                assetsWithReturns.push({
                    ...imovel,
                    type: 'Imóvel',
                    icon: '🏠',
                    lucro,
                    valorInvestido,
                    returnPercentage,
                    nome: imovel.descricao || `Imóvel ${imovel.id}`
                });
            } catch (error) {
                console.error('Error calculating imovel return:', error);
            }
        }

        // Sort by profit percentage (highest first)
        assetsWithReturns.sort((a, b) => b.returnPercentage - a.returnPercentage);

        // Take top 5
        const topAssets = assetsWithReturns.slice(0, 5);

        if (topAssets.length === 0) {
            topAssetsContainer.innerHTML = `
                <div class="text-center py-8">
                    <div class="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="text-2xl">📊</span>
                    </div>
                    <p class="text-gray-400">Nenhum ativo encontrado</p>
                    <p class="text-gray-500 text-sm mt-2">Adicione investimentos para ver o ranking</p>
                </div>
            `;
            return 0;
        }

        // Create asset cards with profit percentage
        let topAssetsHtml = '';
        topAssets.forEach((asset, index) => {
            const isPositive = asset.returnPercentage >= 0;
            const percentageColor = isPositive ? 'text-green-400' : 'text-red-400';
            const percentageSign = isPositive ? '+' : '';

            // Get appropriate background color based on position
            let bgColor = 'bg-gray-800/50';
            if (index === 0) bgColor = 'bg-gradient-to-r from-yellow-500/10 to-yellow-600/5'; // Gold for 1st
            else if (index === 1) bgColor = 'bg-gradient-to-r from-gray-400/10 to-gray-500/5'; // Silver for 2nd
            else if (index === 2) bgColor = 'bg-gradient-to-r from-amber-600/10 to-amber-700/5'; // Bronze for 3rd

            topAssetsHtml += `
                <div class="flex items-center justify-between p-4 ${bgColor} rounded-lg hover:bg-gray-800/70 transition-all duration-300 border border-gray-700/50">
                    <div class="flex items-center space-x-4">
                        <div class="relative">
                            <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <span class="text-lg">${asset.icon}</span>
                            </div>
                            <div class="absolute -top-1 -right-1 w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                ${index + 1}
                            </div>
                        </div>
                        <div>
                            <h4 class="text-white font-medium text-sm">${asset.nome}</h4>
                            <p class="text-gray-400 text-xs">${asset.type}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="${percentageColor} font-bold text-sm">
                            ${percentageSign}${asset.returnPercentage.toFixed(1)}%
                        </p>
                        <p class="text-gray-400 text-xs">
                            ${formatCurrency(asset.lucro)} lucro
                        </p>
                        <p class="text-gray-500 text-xs">
                            de ${formatCurrency(asset.valorInvestido)}
                        </p>
                    </div>
                </div>
            `;
        });

        topAssetsContainer.innerHTML = topAssetsHtml;
        console.log('✅ Top assets by profit percentage updated');
    } catch (error) {
        console.error('❌ Error updating top assets:', error);
        const topAssetsContainer = document.getElementById('topAssetsContainer');
        if (topAssetsContainer) {
            topAssetsContainer.innerHTML = `
                <div class="text-center py-8">
                    <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="text-2xl">⚠️</span>
                    </div>
                    <p class="text-red-400">Erro ao calcular retornos</p>
                    <p class="text-gray-500 text-sm mt-2">Tente recarregar a página</p>
                </div>
            `;
        }
    }

    return 0;
}

// Update summary cards
function updateSummaryCards() {
    console.log('📋 Updating summary cards...');

    try {
        // Calculate profit and invested values for each asset type
        let depositosLucro = 0;
        let depositosInvestido = 0;
        let fundosLucro = 0;
        let fundosInvestido = 0;
        let imoveisLucro = 0;
        let imoveisInvestido = 0;

        // Calculate depositos profit and invested amounts
        if (dashboardData.depositos && Array.isArray(dashboardData.depositos)) {
            depositosLucro = dashboardData.depositos.reduce((sum, deposito) => {
                return sum + (deposito.lucro || 0);
            }, 0);
            depositosInvestido = dashboardData.depositos.reduce((sum, deposito) => {
                return sum + (deposito.valorInvestido || 0);
            }, 0);
        }

        // Calculate fundos profit and invested amounts
        if (dashboardData.fundos && Array.isArray(dashboardData.fundos)) {
            fundosLucro = dashboardData.fundos.reduce((sum, fundo) => {
                return sum + (fundo.lucro || 0);
            }, 0);
            fundosInvestido = dashboardData.fundos.reduce((sum, fundo) => {
                return sum + (fundo.montanteInvestido || 0);
            }, 0);
        }

        // Calculate imoveis profit and invested amounts
        if (dashboardData.imoveis && Array.isArray(dashboardData.imoveis)) {
            imoveisLucro = dashboardData.imoveis.reduce((sum, imovel) => {
                return sum + (imovel.lucro || 0);
            }, 0);
            imoveisInvestido = dashboardData.imoveis.reduce((sum, imovel) => {
                return sum + (imovel.valorImovel || 0);
            }, 0);
        }

        // Update cards to show profit (large) and invested value (small)
        // Card 1: Total Profit
        const totalProfitEl = document.getElementById('totalProfit');
        const totalProfitInvestedEl = document.getElementById('totalProfitInvested');
        if (totalProfitEl) {
            totalProfitEl.textContent = formatCurrency(dashboardData.totalProfit || 0);
        }
        if (totalProfitInvestedEl) {
            totalProfitInvestedEl.textContent = `Investido: ${formatCurrency(dashboardData.totalInvested || 0)}`;
        }

        // Card 2: Depositos - Profit (large) and Invested (small)
        const depositosTotalEl = document.getElementById('depositosTotal');
        const depositosInvestedEl = document.getElementById('depositosInvested');
        if (depositosTotalEl) {
            depositosTotalEl.textContent = formatCurrency(depositosLucro);
        }
        if (depositosInvestedEl) {
            depositosInvestedEl.textContent = `Investido: ${formatCurrency(depositosInvestido)}`;
        }

        // Card 3: Fundos - Profit (large) and Invested (small)
        const fundosTotalEl = document.getElementById('fundosTotal');
        const fundosInvestedEl = document.getElementById('fundosInvested');
        if (fundosTotalEl) {
            fundosTotalEl.textContent = formatCurrency(fundosLucro);
        }
        if (fundosInvestedEl) {
            fundosInvestedEl.textContent = `Investido: ${formatCurrency(fundosInvestido)}`;
        }

        // Card 4: Imoveis - Profit (large) and Invested (small)
        const imoveisTotalEl = document.getElementById('imoveisTotal');
        const imoveisInvestedEl = document.getElementById('imoveisInvested');
        if (imoveisTotalEl) {
            imoveisTotalEl.textContent = formatCurrency(imoveisLucro);
        }
        if (imoveisInvestedEl) {
            imoveisInvestedEl.textContent = `Investido: ${formatCurrency(imoveisInvestido)}`;
        }

        console.log('✅ Summary cards updated - Showing profits and invested amounts');
        console.log(`📊 Depositos: Lucro €${depositosLucro}, Investido €${depositosInvestido}`);
        console.log(`📊 Fundos: Lucro €${fundosLucro}, Investido €${fundosInvestido}`);
        console.log(`📊 Imoveis: Lucro €${imoveisLucro}, Investido €${imoveisInvestido}`);
    } catch (error) {
        console.error('❌ Error updating summary cards:', error);
    }

    return 0;
}

// Update performance indicators
function updatePerformanceIndicators() {
    console.log('📈 Updating performance indicators...');

    try {
        // Use the calculated profit percentage from dashboard metrics
        const profitPercentage = dashboardData.profitPercentage || 0;

        // Update profit percentage indicator
        const profitPercentageEl = document.getElementById('profitPercentage');
        if (profitPercentageEl) {
            const formattedPercentage = profitPercentage >= 0 ?
                `+${profitPercentage.toFixed(1)}%` :
                `${profitPercentage.toFixed(1)}%`;

            profitPercentageEl.textContent = formattedPercentage;

            // Update color based on profit/loss
            if (profitPercentage >= 0) {
                profitPercentageEl.className = profitPercentageEl.className.replace(/text-red-\d+/, 'text-emerald-300');
            } else {
                profitPercentageEl.className = profitPercentageEl.className.replace(/text-emerald-\d+/, 'text-red-300');
            }
        }

        // Remove loading indicators
        const loadingIndicators = document.querySelectorAll('.loading-indicator');
        loadingIndicators.forEach(indicator => {
            indicator.classList.remove('loading-indicator');
        });

        console.log('✅ Performance indicators updated');
    } catch (error) {
        console.error('❌ Error updating performance indicators:', error);
    }

    return 0;
}

// Calculate depositos performance
function calculateDepositosPerformance() {
    console.log('🏦 Calculating depositos performance...');
    return 0;
}

// Calculate fundos performance
function calculateFundosPerformance() {
    console.log('📈 Calculating fundos performance...');
    return 0;
}

// Calculate imoveis performance
function calculateImoveisPerformance() {
    console.log('🏠 Calculating imoveis performance...');
    return 0;
}

// Helper function to calculate total value of a deposito
async function calcularValorTotalDeposito(deposito) {
    console.log('💰 Calculating deposito total value...');
    try {
        // Call the actual function from ativosCalculos.js
        return await window.calcularValorTotalDeposito(deposito);
    } catch (error) {
        console.error('Error calculating deposito total value:', error);
        return deposito.valorInvestido || 0;
    }
}

// Add sample data
function addSampleData() {
    console.log('📊 Adding sample data...');
    return 0;
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
}

function hideLoadingState() {
    console.log('✅ Hiding loading state...');
}

function showErrorState() {
    console.log('⚠️ Showing error state...');
}

// Refresh dashboard data
async function refreshDashboard() {
    console.log('🔄 Refreshing dashboard...');
    await initDashboard();
    showToast('Dashboard atualizado com sucesso!', 'success');
}

// Show toast notification
function showToast(message, type = 'info') {
    console.log(`🔔 Toast: ${message} (${type})`);
    return 0;
}

// Dashboard Manager object for global access
window.DashboardManager = {
    initDashboard,
    refreshDashboard,
    getDashboardData: () => dashboardData,
    dashboardData,
    calculateDashboardMetrics,
    updateDashboardDisplay
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 DOM loaded, initializing dashboard...');
    initDashboard();
});

console.log('📊 Geral Dashboard Manager loaded successfully');
