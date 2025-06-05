/**
 * JavaScript for Fundos de Investimento page
 * Handles API integration, dynamic card generation, and UI state management
 */

// State variables
let fundos = [];
let bancos = [];
let ativos = [];
let summaryData = {
    totalInvestido: 0,
    valorAtual: 0,
    retorno: 0,
    totalFundos: 0
};

// Symbol search variables
let searchTimeout = null;
let currentSelectedSymbol = null;

// DOM Elements
const elements = {
    // Containers
    fundosContainer: document.getElementById('fundosContainer'),

    // States
    loadingState: document.getElementById('loadingState'),
    errorState: document.getElementById('errorState'),
    emptyState: document.getElementById('emptyState'),

    // Summary elements
    totalInvestido: document.getElementById('totalInvestido'),
    valorAtual: document.getElementById('valorAtual'),
    retorno: document.getElementById('retorno'),
    totalFundos: document.getElementById('totalFundos'),

    // Buttons
    retryButton: document.getElementById('retryButton'),
    emptyStateNovoFundo: document.getElementById('emptyStateNovoFundo')
};

/**
 * Initialize the page
 */
async function init() {
    // Show loading state first
    showState('loading');

    // Setup event listeners
    setupEventListeners();

    try {
        // Fetch reference data first
        await Promise.all([
            fetchBancos(),
            fetchAtivos()
        ]);

        // Fetch fundos from API
        await fetchFundos();
    } catch (error) {
        console.error('Error initializing page:', error);
        showState('error');
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Retry button
    if (elements.retryButton) {
        elements.retryButton.addEventListener('click', fetchFundos);
    }

    // Empty state new fund button
    if (elements.emptyStateNovoFundo) {
        elements.emptyStateNovoFundo.addEventListener('click', abrirModal);
    }

    // Symbol search functionality
    const ativoSiglaInput = document.getElementById('ativoSigla');
    if (ativoSiglaInput) {
        ativoSiglaInput.addEventListener('input', handleSymbolSearch);
        ativoSiglaInput.addEventListener('focus', handleSymbolFocus);
        ativoSiglaInput.addEventListener('blur', handleSymbolBlur);
    }

    // Close search results when clicking outside
    document.addEventListener('click', function (e) {
        const searchResults = document.getElementById('symbolSearchResults');
        const ativoSiglaInput = document.getElementById('\Sigla');

        if (searchResults && !searchResults.contains(e.target) && e.target !== ativoSiglaInput) {
            searchResults.classList.add('hidden');
        }
    });

    // Details modal close buttons
    const fecharModalDetalhesBtn = document.getElementById('fecharModalDetalhesBtn');
    if (fecharModalDetalhesBtn) {
        fecharModalDetalhesBtn.addEventListener('click', fecharModalDetalhes);
    }

    const fecharDetalhesFundoBtn = document.getElementById('fecharDetalhesFundoBtn');
    if (fecharDetalhesFundoBtn) {
        fecharDetalhesFundoBtn.addEventListener('click', fecharModalDetalhes);
    }

    // Close the details modal when clicking outside
    const detalhesFundoModal = document.getElementById('detalhesFundoModal');
    if (detalhesFundoModal) {
        detalhesFundoModal.addEventListener('click', function (e) {
            if (e.target === this) {
                fecharModalDetalhes();
            }
        });
    }

    // Delete modal event listeners
    const cancelarRemocaoBtn = document.getElementById('cancelarRemocaoBtn');
    if (cancelarRemocaoBtn) {
        cancelarRemocaoBtn.addEventListener('click', fecharModalRemocao);
    }

    const confirmarRemocaoBtn = document.getElementById('confirmarRemocaoBtn');
    if (confirmarRemocaoBtn) {
        confirmarRemocaoBtn.addEventListener('click', removerFundo);
    }

    // Close the delete modal when clicking outside
    const confirmarRemocaoModal = document.getElementById('confirmarRemocaoModal');
    if (confirmarRemocaoModal) {
        confirmarRemocaoModal.addEventListener('click', function (e) {
            if (e.target === this) {
                fecharModalRemocao();
            }
        });
    }
}

/**
 * Fetch fundos from API
 */
async function fetchFundos() {
    try {
        // Show loading state
        showState('loading');

        // Fetch data from API
        const response = await fetch('/api/fundoinvestimento/getAllByUser', {
            method: 'GET',
            credentials: 'include'
        });

        // Check if response is ok
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse response
        const data = await response.json();

        // Handle different API response formats
        if (data && typeof data === 'object') {
            if (Array.isArray(data)) {
                // If it's already an array, use it directly
                fundos = data;
            } else if (data.error) {
                // If it has an error property, handle the error
                throw new Error(data.error);
            } else {
                // If it's a single object, wrap it in an array
                fundos = [data];
            }
        } else {
            // If it's something unexpected, use empty array
            fundos = [];
        }

        // Filter out any null or undefined values
        fundos = fundos.filter(Boolean);

        console.log('Fundos carregados:', fundos);

        // Update UI
        await renderFundos();

        // Calculate and update summary
        await updateSummary();

    } catch (error) {
        console.error('Error fetching fundos:', error);
        showState('error');
    }
}

/**
 * Render fundos
 */
async function renderFundos() {
    // Remove demo cards and show loading state first
    showState('loading');

    // Check if we have fundos
    if (!fundos || fundos.length === 0) {
        showState('empty');
        return;
    }

    // Get the fundos grid element
    const fundosGrid = document.getElementById('fundosGrid');
    if (!fundosGrid) {
        console.error('Fundos grid element not found');
        showState('error');
        return;
    }

    // Clear the fundos grid
    fundosGrid.innerHTML = '';

    // Sort fundos: put those with data access first, those without access (-69) last
    const sortedFundos = [...fundos];

    // Calculate lucro for all fundos to determine sorting order
    const fundosWithLucro = await Promise.all(
        sortedFundos.map(async (fundo) => {
            try {
                const lucro = await calcularLucroFundoInvestimento(fundo);
                return {
                    fundo,
                    hasDataAccess: true
                };
            } catch (error) {
                if (error.message === "Nao temos acesso com a api gratis symbol") {
                    return {
                        fundo,
                        hasDataAccess: false
                    };
                } else {
                    console.error(`Erro ao calcular lucro do fundo ${fundo.id}:`, error);
                    return {
                        fundo,
                        hasDataAccess: true // Consider it accessible but with error
                    };
                }
            }
        })
    );

    // Sort: funds with data access first, then funds without data access
    fundosWithLucro.sort((a, b) => {
        if (a.hasDataAccess && !b.hasDataAccess) return -1;
        if (!a.hasDataAccess && b.hasDataAccess) return 1;
        return 0;
    });

    // Render each fundo in sorted order
    for (const { fundo } of fundosWithLucro) {
        const card = await createFundoCard(fundo);
        fundosGrid.appendChild(card);
    }

    // Show fundos grid
    showState('fundos');
}

/**
 * Create a fundo card element
 * @param {Object} fundo - The fundo data
 * @returns {Promise<HTMLElement>} - The fundo card element
 */
async function createFundoCard(fundo) {
    // Get ativo information
    const ativo = getAtivo(fundo.ativoFinanceiroId || fundo.ativoFinaceiroId);
    const ativoNome = fundo.nome || (ativo ? ativo.nome : `Fundo ${fundo.id}`);
    const ativoSigla = fundo.ativoSigla || (ativo ? ativo.sigla : 'N/A');

    // Get basic values
    let montanteInvestido = fundo.montanteInvestido || 0;
    let valorAtual = montanteInvestido;
    let lucro = 0;
    let porcentagemLucro = 0;
    let hasDataAccessIssue = false;

    // Try to get calculated values if available
    try {
        lucro = await calcularLucroFundoInvestimento(fundo);
        porcentagemLucro = await calcularPorcentagemLucroFundoInvestimento(fundo);
        valorAtual = montanteInvestido + lucro;
    } catch (error) {
        if (error.message === "Nao temos acesso com a api gratis symbol") {
            hasDataAccessIssue = true;
            lucro = 0; // Reset to 0 for display purposes
            valorAtual = montanteInvestido;
            porcentagemLucro = 0;
        } else {
            console.error(`Erro ao calcular dados do fundo ${fundo.id}:`, error);
        }
    }

    // Format dates
    const dataCriacao = fundo.dataCriacao ?
        new Date(fundo.dataCriacao).toLocaleDateString('pt-PT') : 'Não definido';

    // Create card element
    const card = document.createElement('div');
    card.className = 'bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl overflow-hidden hover:border-primary-500/30 transition-all duration-300 group';

    // Generate a gradient color based on fund type or ID
    const gradients = [
        'from-orange-500 to-yellow-500',
        'from-blue-500 to-purple-500',
        'from-green-500 to-teal-500',
        'from-pink-500 to-rose-500',
        'from-indigo-500 to-blue-500',
        'from-purple-500 to-pink-500'
    ];
    const gradientClass = gradients[fundo.id % gradients.length];

    // Format currency
    const formatter = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });

    card.innerHTML = `
        <div class="relative h-32 bg-gradient-to-br ${gradientClass} p-6">
            <div class="absolute top-4 right-4">
                <span class="text-2xl">📈</span>
            </div>
            <div class="absolute bottom-4 left-6">
                <h3 class="text-xl font-bold text-white">${ativoNome}</h3>
                <span class="text-white/80 text-sm">${ativoSigla}</span>
            </div>
        </div>
        
        <div class="p-6">
            ${hasDataAccessIssue ? `
                <div class="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                        <span class="text-yellow-400 text-xs font-medium">Não temos acesso às informações deste fundo</span>
                    </div>
                </div>
            ` : ''}
            
            <!-- Header with delete button -->
            <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-white mb-1">${ativoNome}</h3>
                    <span class="text-gray-400 text-sm">${ativoSigla}</span>
                </div>
                <button onclick="abrirModalRemocao('${fundo.id}', '${ativoNome.replace(/'/g, "\\\'")}')"
                    class="w-8 h-8 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg flex items-center justify-center transition-colors"
                    title="Remover fundo">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>
            </div>
            
            <div class="space-y-3 mb-4">
                <div class="flex justify-between">
                    <span class="text-gray-400">Investido:</span>
                    <span class="text-white font-semibold">${formatter.format(montanteInvestido)}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Valor Atual:</span>
                    <span class="text-${hasDataAccessIssue ? 'gray' : (lucro >= 0 ? 'green' : 'red')}-400 font-semibold">${formatter.format(valorAtual)}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Lucro:</span>
                    <span class="text-${hasDataAccessIssue ? 'gray' : (lucro >= 0 ? 'green' : 'red')}-400 font-semibold">${hasDataAccessIssue ? 'N/A' : (lucro >= 0 ? '+' : '') + formatter.format(lucro)}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Retorno:</span>
                    <span class="text-${hasDataAccessIssue ? 'gray' : (lucro >= 0 ? 'green' : 'red')}-400 font-semibold">${hasDataAccessIssue ? 'N/A' : (lucro >= 0 ? '+' : '') + porcentagemLucro.toFixed(1) + '%'}</span>
                </div>
            </div>
            
            <!-- Action buttons container -->
            <div class="flex gap-2">
                <button onclick="abrirModalDetalhes('${fundo.id}')"
                    class="flex-1 py-2 bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 rounded-lg transition-colors duration-200 text-sm font-medium">
                    Ver Detalhes
                </button>
                <button onclick="verGraficoFundo('${ativoSigla}', '${ativoNome.replace(/'/g, "\\\'")}')"
                    class="flex-1 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                    Ver Gráfico
                </button>
            </div>
        </div>
    `;

    // Debug: Log that card was created with delete button
    console.log(`Card created for fund ${fundo.id} with delete button`);

    return card;
}

/**
 * Update the summary cards with calculated values
 */
async function updateSummary() {
    if (!fundos || fundos.length === 0) {
        // Reset summary for empty state
        summaryData = {
            totalInvestido: 0,
            valorAtual: 0,
            retorno: 0,
            totalFundos: 0
        };

        const formatter = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });
        elements.totalInvestido.textContent = formatter.format(0);
        elements.valorAtual.textContent = formatter.format(0);
        elements.retorno.textContent = formatter.format(0);
        elements.totalFundos.textContent = '0';
        return;
    }

    // Calculate totals
    let totalInvestido = 0;
    let totalLucro = 0;
    let valorAtualTotal = 0;

    // Use API-based calculations with proper error handling
    for (const fundo of fundos) {
        totalInvestido += fundo.montanteInvestido || 0;

        try {
            const lucro = await calcularLucroFundoInvestimento(fundo);
            totalLucro += lucro;
            valorAtualTotal += (fundo.montanteInvestido || 0) + lucro;
        } catch (error) {
            if (error.message === "Nao temos acesso com a api gratis symbol") {
                // For funds without data access, just add the invested amount
                valorAtualTotal += fundo.montanteInvestido || 0;
            } else {
                console.error(`Erro ao calcular lucro do fundo ${fundo.id}:`, error);
                // For other errors, assume no profit but include invested amount
                valorAtualTotal += fundo.montanteInvestido || 0;
            }
        }
    }

    // Update summary data
    summaryData = {
        totalInvestido,
        valorAtual: valorAtualTotal,
        retorno: totalLucro,
        totalFundos: fundos.length
    };

    // Update UI
    const formatter = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });
    elements.totalInvestido.textContent = formatter.format(totalInvestido);
    elements.valorAtual.textContent = formatter.format(valorAtualTotal);
    elements.retorno.textContent = formatter.format(totalLucro);
    elements.totalFundos.textContent = fundos.length.toString();
}

/**
 * Show the appropriate state (loading, error, empty, or fundos)
 * @param {string} state - The state to show ('loading', 'error', 'empty', or 'fundos')
 */
function showState(state) {
    // Hide all elements
    if (elements.loadingState) elements.loadingState.classList.add('hidden');
    if (elements.errorState) elements.errorState.classList.add('hidden');
    if (elements.emptyState) elements.emptyState.classList.add('hidden');

    // Also hide fundos grid by default
    const fundosGrid = document.getElementById('fundosGrid');
    if (fundosGrid) fundosGrid.classList.add('hidden');

    // Show the appropriate element
    switch (state) {
        case 'loading':
            if (elements.loadingState) elements.loadingState.classList.remove('hidden');
            break;
        case 'error':
            if (elements.errorState) elements.errorState.classList.remove('hidden');
            break;
        case 'empty':
            if (elements.emptyState) elements.emptyState.classList.remove('hidden');
            break;
        case 'fundos':
            // Show fundos grid
            if (fundosGrid) fundosGrid.classList.remove('hidden');
            break;
    }
}

/**
 * Fetch bancos list from API
 */
async function fetchBancos() {
    try {
        const response = await fetch('/api/banco/ver');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        bancos = await response.json();
        console.log('Bancos loaded:', bancos);
    } catch (error) {
        console.error('Error fetching bancos:', error);
    }
}

/**
 * Fetch financial assets from API
 */
async function fetchAtivos() {
    try {
        const response = await fetch('/api/ativofinanceiro/ver?userIdFromAtivo=-1');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        ativos = await response.json();
        console.log('Ativos loaded:', ativos);
    } catch (error) {
        console.error('Error fetching ativos:', error);
    }
}

/**
 * Get ativo by ID
 * @param {number} ativoId - The ativo ID
 * @returns {object|null} - The ativo object or null
 */
function getAtivo(ativoId) {
    return ativos.find(a => a.id === ativoId) || null;
}

/**
 * Open the fund details modal
 * @param {string|number} fundoId - The ID of the fund to show details for
 */
async function abrirModalDetalhes(fundoId) {
    // Convert to number if it's a string
    fundoId = typeof fundoId === 'string' ? parseInt(fundoId, 10) : fundoId;

    // Find the fund in the array
    const fundo = fundos.find(f => f.id === fundoId);
    if (!fundo) {
        showToast("Fundo não encontrado", "error");
        return;
    }

    // Get modal elements
    const modal = document.getElementById('detalhesFundoModal');
    const headerEl = document.getElementById('modalFundoHeader');
    const nomeEl = document.getElementById('detalhesFundoNome');
    const siglaEl = document.getElementById('detalhesFundoSigla');
    const montanteEl = document.getElementById('detalhesMontanteInvestido');
    const valorAtualEl = document.getElementById('detalhesValorAtual');
    const lucroEl = document.getElementById('detalhesLucro');
    const retornoEl = document.getElementById('detalhesRetornoPorcentagem');
    const dataInicioEl = document.getElementById('detalhesDataInicio');
    const duracaoMesesEl = document.getElementById('detalhesDuracaoMeses');
    const taxaImpostoEl = document.getElementById('detalhesTaxaImposto');

    if (!modal || !nomeEl || !siglaEl) {
        console.error('Elementos do modal não encontrados');
        showToast("Erro ao exibir detalhes", "error");
        return;
    }

    // Format date
    const dataInicio = fundo.dataInicio
        ? new Date(fundo.dataInicio).toLocaleDateString('pt-PT')
        : (fundo.dataCriacao
            ? new Date(fundo.dataCriacao).toLocaleDateString('pt-PT')
            : 'Não definido');

    // Currency formatter
    const formatter = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });

    // Get ativo information
    const ativo = getAtivo(fundo.ativoFinanceiroId || fundo.ativoFinaceiroId);
    const ativoNome = fundo.nome || (ativo ? ativo.nome : `Fundo ${fundo.id}`);
    const ativoSigla = fundo.ativoSigla || (ativo ? ativo.sigla : 'N/A');

    try {
        // Calculate values with API functions
        const lucro = await calcularLucroFundoInvestimento(fundo);
        const percentagem = await calcularPorcentagemLucroFundoInvestimento(fundo);
        const valorAtual = (fundo.montanteInvestido || 0) + lucro;

        // Generate gradient colors consistently
        const gradients = [
            'from-orange-500 to-yellow-500',
            'from-blue-500 to-purple-500',
            'from-green-500 to-teal-500',
            'from-pink-500 to-rose-500',
            'from-indigo-500 to-blue-500',
            'from-purple-500 to-pink-500'
        ];
        const gradientClass = gradients[fundo.id % gradients.length];
        headerEl.className = `bg-gradient-to-r ${gradientClass} p-6 rounded-xl text-center mb-6`;

        // Set text content for all elements
        nomeEl.textContent = ativoNome;
        siglaEl.textContent = ativoSigla;
        montanteEl.textContent = formatter.format(fundo.montanteInvestido || 0);
        valorAtualEl.textContent = formatter.format(valorAtual);

        // Set lucro value with proper formatting and color
        lucroEl.textContent = `${lucro >= 0 ? '+' : ''}${formatter.format(lucro)}`;
        lucroEl.className = `text-${lucro >= 0 ? 'green' : 'red'}-400 font-semibold`;

        // Set percentagem value
        retornoEl.textContent = `${percentagem >= 0 ? '+' : ''}${percentagem.toFixed(2)}%`;
        retornoEl.className = `text-${percentagem >= 0 ? 'green' : 'red'}-400 font-semibold`;

        // Additional details
        dataInicioEl.textContent = dataInicio;
        duracaoMesesEl.textContent = fundo.duracaoMeses || 0;
        taxaImpostoEl.textContent = `${(fundo.taxaImposto || 0).toFixed(2)}%`;

        // Show modal
        modal.classList.remove('hidden');
        modal.classList.add('flex');

    } catch (error) {
        console.error('Erro ao carregar detalhes do fundo:', error);

        // Check if this is an API access error
        if (error.message === "Nao temos acesso com a api gratis symbol") {
            // Show modal with "No access" message
            const gradients = [
                'from-orange-500 to-yellow-500',
                'from-blue-500 to-purple-500',
                'from-green-500 to-teal-500',
                'from-pink-500 to-rose-500',
                'from-indigo-500 to-blue-500',
                'from-purple-500 to-pink-500'
            ];
            const gradientClass = gradients[fundo.id % gradients.length];
            headerEl.className = `bg-gradient-to-r ${gradientClass} p-6 rounded-xl text-center mb-6`;

            nomeEl.textContent = ativoNome;
            siglaEl.textContent = ativoSigla;
            montanteEl.textContent = formatter.format(fundo.montanteInvestido || 0);
            valorAtualEl.textContent = "Não disponível";
            lucroEl.textContent = "Não disponível";
            lucroEl.className = "text-yellow-400 font-semibold";
            retornoEl.textContent = "Não disponível";
            retornoEl.className = "text-yellow-400 font-semibold";
            dataInicioEl.textContent = dataInicio;
            duracaoMesesEl.textContent = fundo.duracaoMeses || 0;
            taxaImpostoEl.textContent = `${(fundo.taxaImposto || 0).toFixed(2)}%`;

            // Show modal
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        } else {
            showToast("Erro ao carregar detalhes do fundo", "error");
        }
    }
}

/**
 * Close the fund details modal
 */
function fecharModalDetalhes() {
    const modal = document.getElementById('detalhesFundoModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

/**
 * Show toast notification
 * @param {string} message - The message to show
 * @param {string} type - The type of toast ('success', 'error', 'info')
 */
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    let iconSVG, bgClass;

    switch (type) {
        case 'success':
            bgClass = 'bg-green-500/10 border-green-500/20';
            iconSVG = `<svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 111.414-1.414L8.414 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>`;
            break;
        case 'error':
            bgClass = 'bg-red-500/10 border-red-500/20';
            iconSVG = `<svg class="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>`;
            break;
        default:
            bgClass = 'bg-primary-500/10 border-primary-500/20';
            iconSVG = `<svg class="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>`;
    }

    toast.className = `flex items-center p-4 space-x-3 ${bgClass} border backdrop-blur-xl rounded-xl shadow-lg text-white animate-slide-up`;
    toast.innerHTML = `${iconSVG}<div class="text-sm font-medium">${message}</div>`;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize on page load
/**
 * Open the add fund modal
 */
function abrirModal() {
    const modal = document.getElementById('novoFundoModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        // Populate the ativo financeiro select
        populateAtivosSelect();

        const nomeFundoInput = document.getElementById('nomeFundo');
        if (nomeFundoInput) {
            nomeFundoInput.focus();
        }
    }
}

/**
 * Populate assets select element in the form
 */
function populateAtivosSelect() {
    const select = document.getElementById('ativoFinanceiroSelect');
    if (!select) return;

    // Clear existing options except the first one
    while (select.options.length > 1) {
        select.remove(1);
    }

    // Add assets as options
    ativos.forEach(ativo => {
        const option = document.createElement('option');
        option.value = ativo.id;
        // Use only nome since sigla might not exist
        option.textContent = ativo.nome;
        select.appendChild(option);
    });
}

/**
 * Close the add fund modal
 */
function fecharModal() {
    const modal = document.getElementById('novoFundoModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        const form = document.getElementById('formNovoFundo');
        if (form) {
            form.reset();
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    init();

    // Setup modal buttons that may not be caught in the setupEventListeners function
    const novoFundoBtn = document.getElementById('novoFundoBtn');
    if (novoFundoBtn) {
        novoFundoBtn.addEventListener('click', abrirModal);
    }

    const fecharModalBtn = document.getElementById('fecharModalBtn');
    if (fecharModalBtn) {
        fecharModalBtn.addEventListener('click', fecharModal);
    }

    const cancelarBtn = document.getElementById('cancelarBtn');
    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', fecharModal);
    }

    // Close the modal when clicking outside
    const novoFundoModal = document.getElementById('novoFundoModal');
    if (novoFundoModal) {
        novoFundoModal.addEventListener('click', function (e) {
            if (e.target === this) {
                fecharModal();
            }
        });
    }

    // Setup form submission
    const formNovoFundo = document.getElementById('formNovoFundo');
    if (formNovoFundo) {
        formNovoFundo.addEventListener('submit', handleFundSubmit);
    }
});

/**
 * Handle fund form submission
 * @param {Event} e - Form submit event
 */
async function handleFundSubmit(e) {
    e.preventDefault();

    // Get form values
    const nomeFundo = document.getElementById('nomeFundo').value.trim();
    const ativoSigla = document.getElementById('ativoSigla').value.trim();
    const ativoFinanceiroId = parseInt(document.getElementById('ativoFinanceiroSelect').value);
    const montanteInvestido = parseFloat(document.getElementById('montanteInvestido').value);

    // Validate form data
    if (!nomeFundo || !ativoSigla || !ativoFinanceiroId || isNaN(montanteInvestido)) {
        showToast('Por favor, preencha todos os campos obrigatórios', 'error');
        return;
    }

    if (montanteInvestido <= 0) {
        showToast('O montante investido deve ser maior que zero', 'error');
        return;
    }

    // Create fund data object with the correct API format
    const fundoData = {
        userId: -1,
        ativoFinaceiroId: ativoFinanceiroId,
        nome: nomeFundo,
        montanteInvestido: montanteInvestido,
        ativoSigla: ativoSigla,
        dataCriacao: new Date().toISOString()
    };

    try {
        // Show loading state
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Adicionando...';
        submitButton.disabled = true;

        // Make API call
        const response = await fetch('/api/fundoinvestimento/adicionar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(fundoData)
        });

        if (response.ok) {
            // Success
            showToast('Fundo adicionado com sucesso!', 'success');
            fecharModal();

            // Reload the funds list
            await fetchFundos();
        } else {
            // Error response
            const errorText = await response.text();
            console.error('API Error:', errorText);
            showToast('Erro ao adicionar fundo. Tente novamente.', 'error');
        }
    } catch (error) {
        console.error('Network Error:', error);
        showToast('Erro de conexão. Verifique sua internet.', 'error');
    } finally {
        // Reset button state
        const submitButton = e.target.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Adicionar Fundo';
            submitButton.disabled = false;
        }
    }
}

/**
 * Handle symbol search input
 */
function handleSymbolSearch(e) {
    const query = e.target.value.trim();

    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    // Hide results if query is too short
    if (query.length < 2) {
        hideSymbolSearchResults();
        return;
    }

    // Show spinner
    showSearchSpinner(true);

    // Debounce the search
    searchTimeout = setTimeout(() => {
        searchSymbols(query);
    }, 300);
}

/**
 * Handle symbol input focus
 */
function handleSymbolFocus(e) {
    const query = e.target.value.trim();
    if (query.length >= 2) {
        const searchResults = document.getElementById('symbolSearchResults');
        if (searchResults && !searchResults.classList.contains('hidden')) {
            searchResults.classList.remove('hidden');
        }
    }
}

/**
 * Handle symbol input blur with delay
 */
function handleSymbolBlur(e) {
    // Delay hiding to allow clicking on results
    setTimeout(() => {
        hideSymbolSearchResults();
    }, 200);
}

/**
 * Search symbols using multiple APIs with fallback
 */
async function searchSymbols(query) {
    try {
        // First, try local symbol list
        const localResults = searchLocalSymbols(query);
        if (localResults.length > 0) {
            showSearchSpinner(false);
            displaySymbolSearchResults(localResults);
            return;
        }

        // Try Twelve Data API (free tier)
        try {
            const response = await fetch(`https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(query)}&apikey=demo`);

            if (response.ok) {
                const data = await response.json();
                showSearchSpinner(false);

                if (data && data.data && Array.isArray(data.data)) {
                    displaySymbolSearchResults(data.data);
                    return;
                }
            }
        } catch (apiError) {
            console.warn('Twelve Data API not available, using fallback', apiError);
        }

        // Fallback: Generate suggestions based on query
        const fallbackResults = generateFallbackSymbols(query);
        showSearchSpinner(false);
        displaySymbolSearchResults(fallbackResults);

    } catch (error) {
        console.error('Error searching symbols:', error);
        showSearchSpinner(false);
        displaySymbolSearchResults([]);
    }
}

/**
 * Search local symbol database
 */
function searchLocalSymbols(query) {
    const commonSymbols = [
        // Portuguese stocks
        { symbol: 'EDP.LS', instrument_name: 'EDP - Energias de Portugal SA', exchange: 'Euronext Lisbon', currency: 'EUR', type: 'Stock' },
        { symbol: 'GALP.LS', instrument_name: 'Galp Energia SGPS SA', exchange: 'Euronext Lisbon', currency: 'EUR', type: 'Stock' },
        { symbol: 'BCP.LS', instrument_name: 'Banco Comercial Português SA', exchange: 'Euronext Lisbon', currency: 'EUR', type: 'Stock' },
        { symbol: 'SON.LS', instrument_name: 'Sonae SGPS SA', exchange: 'Euronext Lisbon', currency: 'EUR', type: 'Stock' },
        { symbol: 'JMT.LS', instrument_name: 'Jerónimo Martins SGPS SA', exchange: 'Euronext Lisbon', currency: 'EUR', type: 'Stock' },

        // Major US stocks
        { symbol: 'AAPL', instrument_name: 'Apple Inc', exchange: 'NASDAQ', currency: 'USD', type: 'Stock' },
        { symbol: 'MSFT', instrument_name: 'Microsoft Corporation', exchange: 'NASDAQ', currency: 'USD', type: 'Stock' },
        { symbol: 'GOOGL', instrument_name: 'Alphabet Inc Class A', exchange: 'NASDAQ', currency: 'USD', type: 'Stock' },
        { symbol: 'AMZN', instrument_name: 'Amazon.com Inc', exchange: 'NASDAQ', currency: 'USD', type: 'Stock' },
        { symbol: 'TSLA', instrument_name: 'Tesla Inc', exchange: 'NASDAQ', currency: 'USD', type: 'Stock' },
        { symbol: 'META', instrument_name: 'Meta Platforms Inc', exchange: 'NASDAQ', currency: 'USD', type: 'Stock' },
        { symbol: 'NVDA', instrument_name: 'NVIDIA Corporation', exchange: 'NASDAQ', currency: 'USD', type: 'Stock' },

        // European stocks
        { symbol: 'ASML.AS', instrument_name: 'ASML Holding NV', exchange: 'Euronext Amsterdam', currency: 'EUR', type: 'Stock' },
        { symbol: 'SAP.DE', instrument_name: 'SAP SE', exchange: 'XETRA', currency: 'EUR', type: 'Stock' },
        { symbol: 'NESN.SW', instrument_name: 'Nestlé SA', exchange: 'SIX Swiss Exchange', currency: 'CHF', type: 'Stock' },

        // Crypto
        { symbol: 'BTC/USD', instrument_name: 'Bitcoin', exchange: 'Crypto', currency: 'USD', type: 'Cryptocurrency' },
        { symbol: 'ETH/USD', instrument_name: 'Ethereum', exchange: 'Crypto', currency: 'USD', type: 'Cryptocurrency' },
        { symbol: 'ADA/USD', instrument_name: 'Cardano', exchange: 'Crypto', currency: 'USD', type: 'Cryptocurrency' },

        // ETFs
        { symbol: 'SPY', instrument_name: 'SPDR S&P 500 ETF Trust', exchange: 'NYSE Arca', currency: 'USD', type: 'ETF' },
        { symbol: 'QQQ', instrument_name: 'Invesco QQQ Trust', exchange: 'NASDAQ', currency: 'USD', type: 'ETF' },
        { symbol: 'VTI', instrument_name: 'Vanguard Total Stock Market ETF', exchange: 'NYSE Arca', currency: 'USD', type: 'ETF' }
    ];

    const queryLower = query.toLowerCase();
    return commonSymbols.filter(symbol =>
        symbol.symbol.toLowerCase().includes(queryLower) ||
        symbol.instrument_name.toLowerCase().includes(queryLower)
    );
}

/**
 * Generate fallback symbol suggestions
 */
function generateFallbackSymbols(query) {
    const queryUpper = query.toUpperCase();

    // Generate some logical suggestions based on the query
    const suggestions = [];

    if (query.length >= 2) {
        // Add the query itself as a potential symbol
        suggestions.push({
            symbol: queryUpper,
            instrument_name: `${queryUpper} - Símbolo personalizado`,
            exchange: 'Manual',
            currency: 'EUR',
            type: 'Custom'
        });

        // Add some variations
        if (query.length <= 4) {
            suggestions.push({
                symbol: `${queryUpper}.LS`,
                instrument_name: `${queryUpper} - Euronext Lisboa`,
                exchange: 'Euronext Lisbon',
                currency: 'EUR',
                type: 'Stock'
            });

            suggestions.push({
                symbol: `${queryUpper}/USD`,
                instrument_name: `${queryUpper} - Par de moedas`,
                exchange: 'Forex',
                currency: 'USD',
                type: 'Currency'
            });
        }
    }

    return suggestions;
}

/**
 * Display symbol search results
 */
function displaySymbolSearchResults(results) {
    const searchResultsContainer = document.getElementById('symbolSearchResults');
    if (!searchResultsContainer) return;

    // Clear previous results
    searchResultsContainer.innerHTML = '';

    if (results.length === 0) {
        searchResultsContainer.innerHTML = `
            <div class="p-4 text-center text-gray-400">
                <svg class="w-8 h-8 mx-auto mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Nenhum símbolo encontrado
                <div class="text-xs mt-1">Tente pesquisar por símbolos como AAPL, BTC, ou EDP.LS</div>
            </div>
        `;
        searchResultsContainer.classList.remove('hidden');
        return;
    }

    // Display results (limit to 10)
    const limitedResults = results.slice(0, 10);

    limitedResults.forEach((result, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0 transition-colors';

        // Get type color
        const typeColors = {
            'Stock': 'text-blue-400',
            'ETF': 'text-green-400',
            'Cryptocurrency': 'text-yellow-400',
            'Currency': 'text-purple-400',
            'Custom': 'text-gray-400'
        };

        const typeColor = typeColors[result.type] || 'text-gray-400';

        resultItem.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                        <span class="font-semibold text-white">${result.symbol}</span>
                        ${result.type ? `<span class="text-xs px-2 py-1 rounded ${typeColor} bg-gray-800">${result.type}</span>` : ''}
                    </div>
                    <div class="text-sm text-gray-300 truncate mt-1">${result.instrument_name || 'N/A'}</div>
                    <div class="text-xs text-gray-400 mt-1">
                        ${result.exchange || 'N/A'} ${result.currency ? `• ${result.currency}` : ''}
                    </div>
                </div>
                <div class="flex-shrink-0 ml-2">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        `;

        // Add click event
        resultItem.addEventListener('click', () => {
            selectSymbol(result);
        });

        // Add keyboard navigation
        resultItem.setAttribute('data-index', index);
        resultItem.setAttribute('tabindex', '0');

        resultItem.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectSymbol(result);
            }
        });

        searchResultsContainer.appendChild(resultItem);
    });

    searchResultsContainer.classList.remove('hidden');
}

/**
 * Select a symbol from search results
 */
function selectSymbol(symbolData) {
    const ativoSiglaInput = document.getElementById('ativoSigla');
    const nomeFundoInput = document.getElementById('nomeFundo');

    if (ativoSiglaInput) {
        ativoSiglaInput.value = symbolData.symbol;
    }

    // Always replace the name field with the selected symbol's name
    if (nomeFundoInput) {
        nomeFundoInput.value = symbolData.instrument_name || symbolData.symbol;
    }

    // Store selected symbol data
    currentSelectedSymbol = symbolData;

    // Hide search results
    hideSymbolSearchResults();
}

/**
 * Show/hide search spinner
 */
function showSearchSpinner(show) {
    const spinner = document.getElementById('searchSpinner');
    if (spinner) {
        if (show) {
            spinner.classList.remove('hidden');
        } else {
            spinner.classList.add('hidden');
        }
    }
}

/**
 * Hide symbol search results
 */
function hideSymbolSearchResults() {
    const searchResults = document.getElementById('symbolSearchResults');
    if (searchResults) {
        searchResults.classList.add('hidden');
    }
}

// Global variable to store the fund ID to be deleted
let fundoParaRemover = null;

/**
 * Open the fund removal confirmation modal
 * @param {string|number} fundoId - The ID of the fund to remove
 * @param {string} fundoNome - The name of the fund to remove
 */
function abrirModalRemocao(fundoId, fundoNome) {
    fundoParaRemover = typeof fundoId === 'string' ? parseInt(fundoId, 10) : fundoId;

    const modal = document.getElementById('confirmarRemocaoModal');
    const fundoNomeEl = document.getElementById('fundoParaRemoverNome');

    if (modal && fundoNomeEl) {
        fundoNomeEl.textContent = fundoNome;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

/**
 * Close the fund removal confirmation modal
 */
function fecharModalRemocao() {
    const modal = document.getElementById('confirmarRemocaoModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        fundoParaRemover = null;
    }
}

/**
 * Remove the fund via API
 */
async function removerFundo() {
    if (!fundoParaRemover) {
        showToast('Erro: Nenhum fundo selecionado para remoção', 'error');
        return;
    }

    try {
        // Show loading state
        const confirmarBtn = document.getElementById('confirmarRemocaoBtn');
        const originalText = confirmarBtn.textContent;
        confirmarBtn.textContent = 'Removendo...';
        confirmarBtn.disabled = true;

        // Make API call to remove the fund
        const response = await fetch(`/api/fundoinvestimento/remover?fundoInvestimentoID=${fundoParaRemover}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            // Success
            showToast('Fundo removido com sucesso!', 'success');
            fecharModalRemocao();

            // Reload the funds list
            await fetchFundos();
        } else {
            // Error response
            const errorText = await response.text();
            console.error('API Error:', errorText);
            showToast('Erro ao remover fundo. Tente novamente.', 'error');
        }
    } catch (error) {
        console.error('Network Error:', error);
        showToast('Erro de conexão. Verifique sua internet.', 'error');
    } finally {
        // Reset button state
        const confirmarBtn = document.getElementById('confirmarRemocaoBtn');
        if (confirmarBtn) {
            confirmarBtn.textContent = 'Remover';
            confirmarBtn.disabled = false;
        }
    }
}

/**
 * Navigate to Market page and open chart for specific fund symbol
 * @param {string} symbol - The fund symbol to display in chart
 * @param {string} name - The fund name for display
 */
function verGraficoFundo(symbol, name) {
    if (!symbol || symbol === 'N/A') {
        showToast('Símbolo não disponível para este fundo', 'error');
        return;
    }

    // Create URL with query parameters to pass symbol and name to Market page
    const params = new URLSearchParams({
        symbol: symbol,
        name: name,
        openChart: 'true'
    });

    // Navigate to Market page with parameters
    window.location.href = `/Mercado?${params.toString()}`;
}
