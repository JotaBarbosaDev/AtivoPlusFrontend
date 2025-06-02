/**
 * JavaScript for DepositoPrazo page
 * Handles API integration, dynamic card generation, and UI state management
 */

// State variables
let deposits = [];
let banks = [];
let assets = [];
let summaryData = {
    totalDepositado: 0,
    jurosAcumulados: 0,
    taxaMedia: 0,
    depositosAtivos: 0
};

/**
 * Open the new deposit modal
 */
function abrirModalNovoDeposito() {
    const modal = document.getElementById('novoDepositoModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

// DOM Elements
const elements = {
    // Containers
    depositsContainer: document.getElementById('depositsContainer'),
    depositsGrid: document.getElementById('depositsGrid'),

    // States
    loadingState: document.getElementById('loadingState'),
    errorState: document.getElementById('errorState'),
    emptyState: document.getElementById('emptyState'),

    // Summary elements
    totalDepositado: document.getElementById('totalDepositado'),
    jurosAcumulados: document.getElementById('jurosAcumulados'),
    taxaMedia: document.getElementById('taxaMedia'),
    depositosAtivos: document.getElementById('depositosAtivos'),

    // Buttons
    retryButton: document.getElementById('retryButton'),
    emptyStateNovoDeposito: document.getElementById('emptyStateNovoDeposito')
};

/**
 * Initialize the page
 */
async function init() {
    // Setup event listeners
    setupEventListeners();

    // Fetch reference data first
    await Promise.all([
        fetchBanks(),
        fetchAssets()
    ]);

    // Fetch deposits from API
    await fetchDeposits();
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Retry button
    if (elements.retryButton) {
        elements.retryButton.addEventListener('click', fetchDeposits);
    }

    // Empty state new deposit button
    if (elements.emptyStateNovoDeposito) {
        elements.emptyStateNovoDeposito.addEventListener('click', abrirModalNovoDeposito);
    }
}

/**
 * Fetch deposits from API
 */
async function fetchDeposits() {
    try {
        // Show loading state
        showState('loading');

        // Fetch data from API
        const response = await fetch('/api/depositoprazo/getAllByUser');

        // Check if response is ok
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse response
        const data = await response.json();

        // Store deposits
        deposits = data;

        // Update UI
        await renderDeposits();

        // Calculate and update summary (now asynchronous)
        await updateSummary();

    } catch (error) {
        console.error('Error fetching deposits:', error);
        showState('error');
    }
}

/**
 * Render deposits
 */
async function renderDeposits() {
    // Check if we have deposits
    if (!deposits || deposits.length === 0) {
        showState('empty');
        return;
    }

    // Show deposits grid
    showState('deposits');

    // Clear deposits grid
    elements.depositsGrid.innerHTML = '';

    // Render each deposit
    for (const deposit of deposits) {
        const card = await createDepositCard(deposit);
        elements.depositsGrid.appendChild(card);
    }
}

/**
 * Create a deposit card element
 * @param {Object} deposit - The deposit data
 * @returns {Promise<HTMLElement>} - The deposit card element
 */
async function createDepositCard(deposit) {
    // Get bank and asset information
    const bankName = getBankName(deposit.bancoId);
    const asset = getAsset(deposit.ativoFinaceiroId);
    const assetName = asset ? asset.nome : `Ativo ID: ${deposit.ativoFinaceiroId}`;

    // Get all values from API using the calculation functions from ativosCalculos.js
    let profitSoFar = 0;
    let profitPercentage = 0;
    let progress = 0; // Define progress variable for use in the template
    let valorAtualCalculado = deposit.valorAtual || deposit.valorInvestido || 0;

    try {
        profitSoFar = await calcularLucroDeposito(deposit);
        profitPercentage = await calcularPorcentagemLucroDeposito(deposit);
        progress = profitPercentage; // Set progress equal to profitPercentage
        valorAtualCalculado = await calcularValorTotalDeposito(deposit);
    } catch (error) {
        console.error('Erro ao calcular dados do depósito:', error);
    }

    // Calculate other values that don't have API endpoints yet
    const monthlyProfit = calculateMonthlyProfit(deposit);
    const maturityDate = calculateMaturityDate(deposit);

    // Create card element
    const card = document.createElement('div');
    card.className = 'bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 hover:border-primary-500/50 transition-all duration-200';

    // Generate a random color for the bank icon
    const colors = ['red', 'blue', 'green', 'orange', 'purple', 'pink', 'yellow', 'indigo'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Format dates
    const dataCriacao = new Date(deposit.dataCriacao);
    const formattedDataCriacao = dataCriacao.toLocaleDateString('pt-PT');
    const formattedMaturityDate = maturityDate.toLocaleDateString('pt-PT');

    // Format currency values
    const formatter = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });

    // Create card HTML with all deposit fields (except ID)
    card.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-${randomColor}-500/10 rounded-xl flex items-center justify-center">
                    <svg class="w-6 h-6 text-${randomColor}-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-white">${bankName}</h3>
                    <p class="text-gray-400 text-sm">${assetName}</p>
                </div>
            </div>
            <button onclick="abrirModalConfirmacaoDelete(${deposit.id})" 
                class="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>

        <div class="space-y-3">
            <div class="flex justify-between items-center">
                <span class="text-gray-400">Conta:</span>
                <span class="text-white font-semibold">${deposit.numeroConta}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-400">Valor Investido:</span>
                <span class="text-white font-semibold">${formatter.format(deposit.valorInvestido)}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-400">Valor Atual:</span>
                <span class="text-blue-400 font-semibold">${formatter.format(valorAtualCalculado)}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-400">Taxa de Juro Anual:</span>
                <span class="text-green-400 font-semibold">${deposit.taxaJuroAnual}%</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-400">Juros Acumulados:</span>
                <span class="text-green-400 font-semibold">${formatter.format(profitSoFar)}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-400">Lucro Mensal:</span>
                <span class="text-emerald-400 font-semibold">${formatter.format(monthlyProfit)}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-400">Data de Início:</span>
                <span class="text-white font-semibold">${formattedDataCriacao}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-400">Valor no Vencimento:</span>
                <span class="text-green-400 font-semibold">${formatter.format(valorAtualCalculado)}</span>
            </div>
            ${deposit.valorAnualDespesasEstimadas > 0 ? `
            <div class="flex justify-between items-center">
                <span class="text-gray-400">Despesas Anuais:</span>
                <span class="text-red-400 font-semibold">${formatter.format(deposit.valorAnualDespesasEstimadas)}</span>
            </div>
            ` : ''}
        </div>

        <div class="mt-4 pt-4 border-t border-gray-700">
            <div class="flex justify-between items-center mb-3">
                <span class="text-gray-400 text-sm">Ganho do Investimento:</span>
                <span class="text-emerald-400 text-sm font-semibold">+${profitPercentage.toFixed(1)}%</span>
            </div>
            
            <!-- Enhanced Progress bar with markers -->
            <div class="relative">
                <!-- Background bar with subtle gradient -->
                <div class="w-full bg-gradient-to-r from-gray-800 to-gray-700 rounded-full h-4 relative overflow-hidden border border-gray-600 shadow-inner">
                    <!-- Progress fill with vibrant gradient -->
                    <div class="bg-gradient-to-r from-emerald-500 to-green-400 h-4 rounded-full transition-all duration-700 ease-out relative" 
                         style="width: ${Math.min(profitPercentage, 100)}%">
                        <!-- Glossy effect -->
                        <div class="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 rounded-full"></div>
                    </div>
                    
                    <!-- Milestone markers with better visibility -->
                    <div class="absolute top-0.5 left-[10%] w-0.5 h-3 bg-gray-400 rounded-full shadow-sm"></div>
                    <div class="absolute top-0.5 left-[30%] w-0.5 h-3 bg-gray-400 rounded-full shadow-sm"></div>
                    <div class="absolute top-0.5 left-[50%] w-0.5 h-3 bg-gray-300 rounded-full shadow-sm"></div>
                    <div class="absolute top-0.5 left-[70%] w-0.5 h-3 bg-gray-300 rounded-full shadow-sm"></div>
                    <div class="absolute top-0.5 right-0.5 w-0.5 h-3 bg-gray-200 rounded-full shadow-sm"></div>
                    
                    <!-- Progress indicator dot -->
                    ${progress > 0 ? `
                    <div class="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white border-2 border-emerald-400 rounded-full shadow-lg pulse" 
                         style="left: calc(${Math.min(progress, 100)}% - 6px)">
                        <div class="absolute inset-0.5 bg-emerald-400 rounded-full"></div>
                    </div>
                    ` : ''}
                </div>
                
                <!-- Percentage labels with better styling -->
                <div class="flex justify-between text-xs mt-2 px-0.5">
                    <span class="text-gray-500 font-medium">0%</span>
                    <span class="text-gray-500 font-medium">10%</span>
                    <span class="text-gray-400 font-medium">30%</span>
                    <span class="text-gray-400 font-medium">50%</span>
                    <span class="text-gray-400 font-medium">70%</span>
                    <span class="text-gray-300 font-medium">100%</span>
                </div>                    <!-- Achievement indicators -->
                <div class="flex justify-center gap-1 mt-2">
                    <div class="w-2 h-2 rounded-full ${profitPercentage >= 10 ? 'bg-emerald-400 shadow-sm' : 'bg-gray-600'}"></div>
                    <div class="w-2 h-2 rounded-full ${profitPercentage >= 30 ? 'bg-emerald-400 shadow-sm' : 'bg-gray-600'}"></div>
                    <div class="w-2 h-2 rounded-full ${profitPercentage >= 50 ? 'bg-green-400 shadow-sm' : 'bg-gray-600'}"></div>
                    <div class="w-2 h-2 rounded-full ${profitPercentage >= 70 ? 'bg-green-400 shadow-sm' : 'bg-gray-600'}"></div>
                    <div class="w-2 h-2 rounded-full ${profitPercentage >= 100 ? 'bg-yellow-400 shadow-md' : 'bg-gray-600'}"></div>
                </div>
            </div>
        </div>
    `;

    return card;
}

/**
 * Calculate the progress of a deposit (as a percentage of profit gained)
 * @param {Object} deposit - The deposit data
 * @returns {Promise<Number>} - The profit percentage gained (e.g., 30 for 30% profit)
 */
async function calculateProgress(deposit) {
    try {
        // Use the API-based calculation from ativosCalculos.js
        const profitPercentage = await calcularPorcentagemLucroDeposito(deposit);
        return Math.max(0, profitPercentage);
    } catch (error) {
        console.error('Erro ao calcular progresso do depósito:', error);
        return 0;
    }
}

/**
 * Update the summary cards with calculated values
 */
async function updateSummary() {
    if (!deposits || deposits.length === 0) {
        // Reset summary for empty state
        summaryData = {
            totalDepositado: 0,
            jurosAcumulados: 0,
            taxaMedia: 0,
            depositosAtivos: 0
        };

        const formatter = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });
        elements.totalDepositado.textContent = formatter.format(0);
        elements.jurosAcumulados.textContent = formatter.format(0);
        elements.taxaMedia.textContent = '0.0%';
        elements.depositosAtivos.textContent = '0';
        return;
    }

    // Calculate totals
    let totalDepositado = 0;
    let jurosAcumulados = 0;
    let totalTaxas = 0;
    let totalMonthlyProfit = 0;

    // Use API-based calculations with Promise.all for better performance
    const profitPromises = deposits.map(deposit => calcularLucroDeposito(deposit));
    const profitResults = await Promise.all(profitPromises);

    deposits.forEach((deposit, index) => {
        totalDepositado += deposit.valorInvestido;
        // Use the API-calculated profit from calcularLucroDeposito
        jurosAcumulados += profitResults[index];
        totalTaxas += deposit.taxaJuroAnual;
        totalMonthlyProfit += calculateMonthlyProfit(deposit);
    });

    // Calculate average rate (weighted by deposit amount)
    const taxaMedia = deposits.length > 0 ? totalTaxas / deposits.length : 0;

    // Update summary data
    summaryData = {
        totalDepositado,
        jurosAcumulados,
        taxaMedia,
        depositosAtivos: deposits.length,
        totalMonthlyProfit
    };

    // Update UI
    const formatter = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });

    elements.totalDepositado.textContent = formatter.format(summaryData.totalDepositado);
    elements.jurosAcumulados.textContent = formatter.format(summaryData.jurosAcumulados);
    elements.taxaMedia.textContent = summaryData.taxaMedia.toFixed(1) + '%';
    elements.depositosAtivos.textContent = summaryData.depositosAtivos;
}

/**
 * Show the appropriate state (loading, error, empty, or deposits)
 * @param {string} state - The state to show ('loading', 'error', 'empty', or 'deposits')
 */
function showState(state) {
    // Hide all states
    elements.loadingState.classList.add('hidden');
    elements.errorState.classList.add('hidden');
    elements.emptyState.classList.add('hidden');
    elements.depositsGrid.classList.add('hidden');

    // Show the requested state
    switch (state) {
        case 'loading':
            elements.loadingState.classList.remove('hidden');
            break;
        case 'error':
            elements.errorState.classList.remove('hidden');
            break;
        case 'empty':
            elements.emptyState.classList.remove('hidden');
            break;
        case 'deposits':
            elements.depositsGrid.classList.remove('hidden');
            break;
    }
}

/**
 * Fetch banks list from API
 */
async function fetchBanks() {
    try {
        const response = await fetch('/api/banco/ver');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        banks = await response.json();
        console.log('Banks loaded:', banks);
    } catch (error) {
        console.error('Error fetching banks:', error);
    }
}

/**
 * Fetch financial assets from API
 */
async function fetchAssets() {
    try {
        const response = await fetch('/api/ativofinanceiro/ver?userIdFromAtivo=-1');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        assets = await response.json();
        console.log('Assets loaded:', assets);
    } catch (error) {
        console.error('Error fetching assets:', error);
    }
}

/**
 * Get bank name by ID
 * @param {number} bancoId - The bank ID
 * @returns {string} - The bank name or fallback text
 */
function getBankName(bancoId) {
    const bank = banks.find(b => b.id === bancoId);
    return bank ? bank.nome : `Banco ID: ${bancoId}`;
}

/**
 * Get asset by ID
 * @param {number} ativoId - The asset ID
 * @returns {object|null} - The asset object or null
 */
function getAsset(ativoId) {
    return assets.find(a => a.id === ativoId) || null;
}

/**
 * Calculate monthly interest profit
 * @param {Object} deposit - The deposit data
 * @returns {number} - Monthly profit amount
 */
function calculateMonthlyProfit(deposit) {
    const monthlyRate = deposit.taxaJuroAnual / 100 / 12;
    return deposit.valorInvestido * monthlyRate;
}

/**
 * Calculate maturity date based on asset duration
 * @param {Object} deposit - The deposit data
 * @returns {Date} - The calculated maturity date
 */
function calculateMaturityDate(deposit) {
    const asset = getAsset(deposit.ativoFinaceiroId);
    const startDate = new Date(deposit.dataCriacao);
    const maturityDate = new Date(startDate);

    if (asset && asset.duracaoMeses) {
        maturityDate.setMonth(startDate.getMonth() + asset.duracaoMeses);
    } else {
        // Default to 12 months if no asset duration found
        maturityDate.setFullYear(startDate.getFullYear() + 1);
    }

    return maturityDate;
}

/**
 * Populate banks select element
 */
function populateBanksSelect() {
    const bancoSelect = document.getElementById('bancoSelect');
    if (!bancoSelect) return;

    // Clear existing options except the default
    while (bancoSelect.options.length > 1) {
        bancoSelect.remove(1);
    }

    // Add bank options
    banks.forEach(bank => {
        const option = document.createElement('option');
        option.value = bank.id;
        option.textContent = bank.nome;
        bancoSelect.appendChild(option);
    });
}

/**
 * Populate assets select element
 */
function populateAssetsSelect() {
    const ativoSelect = document.getElementById('ativoSelect');
    if (!ativoSelect) return;

    // Clear existing options except the default
    while (ativoSelect.options.length > 1) {
        ativoSelect.remove(1);
    }

    // Add asset options
    assets.forEach(asset => {
        const option = document.createElement('option');
        option.value = asset.id;
        option.textContent = asset.nome;
        ativoSelect.appendChild(option);
    });
}

/**
 * Show toast notification
 * @param {string} message - The message to show
 * @param {string} type - The type of toast ('success', 'error', 'info')
 */
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 max-w-sm p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out translate-x-full`;

    // Set colors based on type
    const colors = {
        success: 'bg-green-600 text-white',
        error: 'bg-red-600 text-white',
        info: 'bg-blue-600 text-white'
    };

    toast.className += ` ${colors[type] || colors.info}`;
    toast.textContent = message;

    // Add to DOM
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);

    // Hide and remove toast
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

/**
 * Close the new deposit modal
 */
function fecharModalNovoDeposito() {
    const modal = document.getElementById('novoDepositoModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');

    // Reset form
    const form = document.getElementById('novoDepositoForm');
    if (form) {
        form.reset();
    }
}

/**
 * Submit the new deposit form
 * @param {Event} e - Form submit event
 */
async function handleDepositoSubmit(e) {
    e.preventDefault();

    const form = document.getElementById('novoDepositoForm');

    // Get form values
    const bancoId = document.getElementById('bancoSelect').value;
    const ativoFinanceiroId = document.getElementById('ativoSelect').value;
    const numeroConta = document.getElementById('numeroConta').value;
    const taxaJuroAnual = parseFloat(document.getElementById('taxaJuro').value);
    const valorInvestido = parseFloat(document.getElementById('valorInicial').value);
    const valorAtual = valorInvestido; // Initially, the current value equals the invested value
    const dataInicio = document.getElementById('dataInicio').value;
    const valorAnualDespesasEstimadas = 0; // Default to 0 if not provided in form

    // Validate form
    if (!bancoId || !ativoFinanceiroId || !numeroConta || isNaN(taxaJuroAnual) || isNaN(valorInvestido) || !dataInicio) {
        showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }

    // Create deposit data
    const depositoData = {
        userId: -1,
        ativoFinaceiroId: parseInt(ativoFinanceiroId),
        bancoId: parseInt(bancoId),
        numeroConta: parseInt(numeroConta),
        taxaJuroAnual: taxaJuroAnual,
        valorAtual: valorAtual,
        valorInvestido: valorInvestido,
        valorAnualDespesasEstimadas: valorAnualDespesasEstimadas,
        dataCriacao: new Date(dataInicio).toISOString()
    };
    console.log('Submitting deposit data:', depositoData);
    try {
        // Show loading state
        const submitBtn = document.querySelector('#novoDepositoForm button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="flex items-center justify-center"><div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>A processar...</div>';

        // Send request to API
        const response = await fetch('/api/depositoprazo/adicionar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(depositoData)
        });

        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Close modal and show success toast
        fecharModalNovoDeposito();
        showToast('Depósito criado com sucesso!', 'success');

        // Refresh deposits list
        await fetchDeposits();

    } catch (error) {
        console.error('Error creating deposit:', error);
        showToast('Erro ao criar depósito. Por favor, tente novamente.', 'error');
    }
}

/**
 * Variables for delete confirmation
 */
let depositoParaEliminar = null;

/**
 * Open delete confirmation modal
 * @param {number} depositoId - The ID of the deposit to delete
 */
function abrirModalConfirmacaoDelete(depositoId) {
    depositoParaEliminar = depositoId;
    const deposit = deposits.find(d => d.id === depositoId);

    if (!deposit) {
        showToast('Depósito não encontrado.', 'error');
        return;
    }

    // Get bank name for display
    const bankName = getBankName(deposit.bancoId);
    const formatter = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });

    // Update modal content
    document.getElementById('deleteDepositInfo').innerHTML = `
        <strong>${bankName}</strong><br>
        <span class="text-gray-400">Conta: ${deposit.numeroConta}</span><br>
        <span class="text-gray-400">Valor: ${formatter.format(deposit.valorAtual)}</span>
    `;

    const modal = document.getElementById('deleteConfirmationModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

/**
 * Close delete confirmation modal
 */
function fecharModalConfirmacaoDelete() {
    const modal = document.getElementById('deleteConfirmationModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    depositoParaEliminar = null;
}

/**
 * Delete the selected deposit
 */
async function eliminarDeposito() {
    if (!depositoParaEliminar) {
        showToast('Nenhum depósito selecionado para eliminação.', 'error');
        return;
    }

    try {
        // Show loading state on delete button
        const deleteBtn = document.getElementById('confirmDeleteBtn');
        const originalText = deleteBtn.innerHTML;
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = '<div class="flex items-center justify-center"><div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>A eliminar...</div>';

        // Send DELETE request to API
        const response = await fetch(`/api/depositoprazo/remover?depositoPrazoId=${depositoParaEliminar}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Reset button state
        deleteBtn.disabled = false;
        deleteBtn.innerHTML = originalText;

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Close modal and show success toast
        fecharModalConfirmacaoDelete();
        showToast('Depósito eliminado com sucesso!', 'success');

        // Refresh deposits list
        await fetchDeposits();

    } catch (error) {
        console.error('Error deleting deposit:', error);
        showToast('Erro ao eliminar depósito. Por favor, tente novamente.', 'error');
    }
}

/**
 * Setup form event listeners
 */
function setupFormListeners() {
    const form = document.getElementById('novoDepositoForm');
    if (form) {
        form.addEventListener('submit', handleDepositoSubmit);
    }

    // Load banks and assets when opening the modal
    const novoDepositoBtn = document.getElementById('novoDepositoBtn');
    if (novoDepositoBtn) {
        novoDepositoBtn.addEventListener('click', function () {
            // Open the modal
            abrirModalNovoDeposito();
            // Populate dropdowns with already loaded data
            populateBanksSelect();
            populateAssetsSelect();
        });
    }

    // Same for the empty state button
    const emptyStateBtn = document.getElementById('emptyStateNovoDeposito');
    if (emptyStateBtn) {
        emptyStateBtn.addEventListener('click', function () {
            // Open the modal
            abrirModalNovoDeposito();
            // Populate dropdowns with already loaded data
            populateBanksSelect();
            populateAssetsSelect();
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    init();
    setupFormListeners();
});
