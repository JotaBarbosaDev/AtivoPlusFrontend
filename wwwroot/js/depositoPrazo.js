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
        valorAtualCalculado = await calcularValorTotalDeposito(deposit);

        // Calculate doubling progress for infinite deposits, use profit percentage for fixed-term deposits
        const asset = getAsset(deposit.ativoFinaceiroId);
        if (!asset || !asset.duracaoMeses || asset.duracaoMeses <= 0) {
            // For infinite deposits, use doubling progress
            progress = calculateDoublingProgress(deposit);
        } else {
            // For fixed-term deposits, use profit percentage
            progress = profitPercentage;
        }
    } catch (error) {
        console.error('Erro ao calcular dados do depósito:', error);
    }

    // Calculate other values that don't have API endpoints yet
    const monthlyProfit = calculateMonthlyProfit(deposit);
    const maturityDate = calculateMaturityDateImproved(deposit);

    // Create card element
    const card = document.createElement('div');
    card.className = 'bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl overflow-hidden hover:border-primary-500/30 transition-all duration-300 group';

    // Generate a gradient color based on bank or asset
    const gradients = [
        'from-blue-500 to-cyan-500',
        'from-green-500 to-emerald-500',
        'from-purple-500 to-indigo-500',
        'from-orange-500 to-red-500',
        'from-pink-500 to-rose-500',
        'from-yellow-500 to-amber-500'
    ];
    const gradientClass = gradients[deposit.id % gradients.length];

    // Format currency values
    const formatter = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });

    // Create card HTML with standardized header
    card.innerHTML = `
        <div class="relative h-32 bg-gradient-to-br ${gradientClass} p-6">
            <div class="absolute top-4 right-4">
                <span class="text-2xl">🏦</span>
            </div>
            <div class="absolute bottom-4 left-6">
                <h3 class="text-xl font-bold text-white">${bankName}</h3>
                <span class="text-white/80 text-sm">${assetName}</span>
            </div>
        </div>
        
        <div class="p-6">
            <!-- Header with delete button -->
            <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-white mb-1">${bankName}</h3>
                    <span class="text-gray-400 text-sm">Conta: ${deposit.numeroConta}</span>
                </div>
                <button onclick="abrirModalConfirmacaoDelete(${deposit.id})" 
                    class="w-8 h-8 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg flex items-center justify-center transition-colors"
                    title="Eliminar depósito">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            <div class="space-y-3 mb-4">
                <div class="flex justify-between">
                    <span class="text-gray-400">Valor Investido:</span>
                    <span class="text-white font-semibold">${formatter.format(deposit.valorInvestido)}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Valor Atual:</span>
                    <span class="text-blue-400 font-semibold">${formatter.format(valorAtualCalculado)}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Taxa de Juro:</span>
                    <span class="text-green-400 font-semibold">${deposit.taxaJuroAnual}%</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Juros Acumulados:</span>
                    <span class="text-green-400 font-semibold">${formatter.format(profitSoFar)}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Retorno:</span>
                    <span class="text-${profitPercentage >= 0 ? 'green' : 'red'}-400 font-semibold">${profitPercentage >= 0 ? '+' : ''}${profitPercentage.toFixed(1)}%</span>
                </div>
            </div>

            <div class="mt-4 pt-4 border-t border-gray-700">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-gray-400 text-sm">${(!asset || !asset.duracaoMeses || asset.duracaoMeses <= 0) ? 'Progresso para Duplicar:' : 'Progresso do Investimento:'}</span>
                    <span class="text-emerald-400 text-sm font-semibold">${(!asset || !asset.duracaoMeses || asset.duracaoMeses <= 0) ? `${progress.toFixed(1)}%` : `+${profitPercentage.toFixed(1)}%`}</span>
                </div>
                
                <!-- Progress bar -->
                <div class="relative">
                    <div class="w-full bg-gray-800 rounded-full h-3 border border-gray-600">
                        <div class="bg-gradient-to-r from-emerald-500 to-green-400 h-3 rounded-full transition-all duration-700" 
                             style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                </div>
            </div>
            
            <button onclick="abrirDetalhesDeposito(${deposit.id})" 
                class="w-full mt-4 py-2 bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 rounded-lg transition-colors duration-200 text-sm font-medium">
                Ver Detalhes
            </button>
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
    console.log('Getting asset for ID:', ativoId);
    console.log('Available assets:', assets);
    const asset = assets.find(a => a.id === ativoId);
    console.log('Found asset:', asset);
    return asset || null;
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
 * Calculate time to double money using compound interest (Rule of 72)
 * @param {Object} deposit - The deposit data
 * @returns {Object} - Object with yearsToDouble and isInfinite properties
 */
function calculateTimeToDouble(deposit) {
    const rate = deposit.taxaJuroAnual;

    if (rate <= 0) {
        return { yearsToDouble: Infinity, isInfinite: true };
    }

    // More accurate formula for compound interest doubling time
    // t = log(2) / log(1 + r/100)
    // This is more accurate than the Rule of 72 especially for low rates
    const yearsToDouble = Math.log(2) / Math.log(1 + rate / 100);

    console.log(`Deposit ${deposit.id} with ${rate}% rate will double in ${yearsToDouble.toFixed(1)} years`);

    return { yearsToDouble, isInfinite: false };
}

/**
 * Calculate progress towards doubling money using Rule of 72
 * @param {Object} deposit - The deposit data
 * @returns {number} - Progress percentage (0-100, where 100 = doubled)
 */
function calculateDoublingProgress(deposit) {
    const startDate = new Date(deposit.dataCriacao);
    const now = new Date();
    const yearsPassed = (now - startDate) / (1000 * 60 * 60 * 24 * 365.25);

    const { yearsToDouble, isInfinite } = calculateTimeToDouble(deposit);

    if (isInfinite || yearsToDouble === Infinity) {
        return 0;
    }

    const progress = Math.min(100, (yearsPassed / yearsToDouble) * 100);

    console.log(`Deposit ${deposit.id}: ${yearsPassed.toFixed(2)} years passed, ${yearsToDouble.toFixed(1)} years to double, progress: ${progress.toFixed(1)}%`);

    return progress;
}

/**
 * Calculate maturity date with improved fallback logic
 * @param {Object} deposit - The deposit data
 * @returns {Date} - The calculated maturity date (or date when money doubles for infinite deposits)
 */
function calculateMaturityDateImproved(deposit) {
    const asset = getAsset(deposit.ativoFinaceiroId);
    const startDate = new Date(deposit.dataCriacao);
    const maturityDate = new Date(startDate);

    console.log('Improved calculation for deposit:', deposit.id);
    console.log('Asset found:', asset);

    if (asset && asset.duracaoMeses && asset.duracaoMeses > 0) {
        console.log('Using asset duration:', asset.duracaoMeses, 'months');
        maturityDate.setMonth(startDate.getMonth() + asset.duracaoMeses);
    } else {
        // For infinite deposits, calculate when money would double
        const { yearsToDouble, isInfinite } = calculateTimeToDouble(deposit);

        if (isInfinite) {
            // If rate is 0 or negative, return a date far in the future
            maturityDate.setFullYear(startDate.getFullYear() + 100);
        } else {
            // Set maturity to when money doubles
            const daysToDouble = yearsToDouble * 365.25;
            maturityDate.setTime(startDate.getTime() + (daysToDouble * 24 * 60 * 60 * 1000));
        }

        console.log('No asset duration, calculated doubling date:', maturityDate);
    }

    console.log('Final maturity date:', maturityDate);
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
 * Open deposit details modal
 * @param {number} depositId - The ID of the deposit to show details for
 */
async function abrirDetalhesDeposito(depositId) {
    // Enhanced input validation
    if (!depositId || isNaN(depositId)) {
        showEnhancedErrorToast('ID do depósito inválido', 'Por favor, tente novamente');
        return;
    }

    const deposit = deposits.find(d => d.id === depositId);
    if (!deposit) {
        showEnhancedErrorToast('Depósito não encontrado', 'O depósito selecionado não existe ou foi removido');
        return;
    }

    try {
        // Enhanced modal element validation
        const modalElements = {
            modal: 'detalhesDepositoModal',
            header: 'modalDepositoHeader',
            banco: 'detalhesDepositoBanco',
            conta: 'detalhesDepositoConta',
            ativoNome: 'detalhesAtivoNome',
            dataCriacao: 'detalhesDataCriacao',
            dataVencimento: 'detalhesDataVencimento',
            duracao: 'detalhesDuracao',
            valorInvestido: 'detalhesValorInvestido',
            valorAtual: 'detalhesValorAtual',
            taxaJuro: 'detalhesTaxaJuro',
            jurosAcumulados: 'detalhesJurosAcumulados',
            lucroMensal: 'detalhesLucroMensal',
            retorno: 'detalhesRetorno',
            despesasAnuais: 'detalhesDespesasAnuais',
            taxaImposto: 'detalhesTaxaImposto',
            impostoEstimado: 'detalhesImpostoEstimado',
            progressoPercentagem: 'detalhesProgressoPercentagem',
            progressoBarra: 'detalhesProgressoBarra',
            diasRestantes: 'detalhesDiasRestantes',
            valorVencimento: 'detalhesValorVencimento'
        };

        // Validate all required elements exist
        const missingElements = [];
        const elementRefs = {};

        for (const [key, elementId] of Object.entries(modalElements)) {
            const element = document.getElementById(elementId);
            if (!element) {
                missingElements.push(elementId);
            } else {
                elementRefs[key] = element;
            }
        }

        if (missingElements.length > 0) {
            console.error('Modal elements missing:', missingElements);
            showEnhancedErrorToast(
                'Erro de interface do utilizador',
                `Elementos em falta no modal: ${missingElements.join(', ')}`
            );
            return;
        }

        // Show loading state in modal if it exists
        if (elementRefs.modal) {
            const loadingDiv = createLoadingIndicator();
            elementRefs.modal.appendChild(loadingDiv);
            elementRefs.modal.classList.remove('hidden');
            elementRefs.modal.classList.add('flex');
        }

        try {
            // Get calculated values from API with individual error handling
            let profitSoFar = 0;
            let profitPercentage = 0;
            let valorAtual = deposit.valorInvestido || 0;

            try {
                profitSoFar = await calcularLucroDeposito(deposit);
            } catch (apiError) {
                console.warn('Erro ao calcular lucro do depósito:', apiError);
                profitSoFar = 0;
            }

            try {
                profitPercentage = await calcularPorcentagemLucroDeposito(deposit);
            } catch (apiError) {
                console.warn('Erro ao calcular percentagem de lucro:', apiError);
                profitPercentage = 0;
            }

            try {
                valorAtual = await calcularValorTotalDeposito(deposit);
            } catch (apiError) {
                console.warn('Erro ao calcular valor total:', apiError);
                valorAtual = deposit.valorInvestido || 0;
            }

            // Get reference data with fallbacks
            const bankName = getBankName(deposit.bancoId) || `Banco ID: ${deposit.bancoId}`;
            const asset = getAsset(deposit.ativoFinaceiroId);
            const assetName = asset ? asset.nome : `Ativo ID: ${deposit.ativoFinaceiroId}`;

            // Calculate doubling information using Rule of 72
            const { yearsToDouble, isInfinite } = calculateTimeToDouble(deposit);
            const progress = calculateDoublingProgress(deposit);
            const monthlyProfit = calculateMonthlyProfit(deposit);

            // Start date of deposit
            const startDate = new Date(deposit.dataCriacao);

            // Format dates and currency values
            const formatter = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });
            const dateFormatter = new Intl.DateTimeFormat('pt-PT');

            // For doubling calculation (applies for all deposits)
            const doublingDate = new Date(startDate);

            // Convert years to days and add to the start date
            const daysToDouble = Math.round(yearsToDouble * 365.25);
            doublingDate.setDate(startDate.getDate() + daysToDouble);

            // Calculate days remaining until doubling
            const today = new Date();
            const daysRemaining = Math.max(0, Math.ceil((doublingDate - today) / (1000 * 60 * 60 * 24)));

            // Calculate estimated value at double (which is twice the initial investment)
            const doubledValue = deposit.valorInvestido * 2;

            // Remove loading indicator
            const loadingDiv = elementRefs.modal.querySelector('.loading-indicator');
            if (loadingDiv) {
                loadingDiv.remove();
            }

            // Set a gradient color for the header (similar to the card)
            const gradients = [
                'from-blue-500 to-cyan-500',
                'from-green-500 to-emerald-500',
                'from-purple-500 to-indigo-500',
                'from-orange-500 to-red-500',
                'from-pink-500 to-rose-500',
                'from-yellow-500 to-amber-500'
            ];
            const gradientClass = gradients[deposit.id % gradients.length];
            elementRefs.header.className = `bg-gradient-to-r ${gradientClass} p-6 rounded-xl text-center mb-6`;

            // Populate modal with data using the validated element references
            elementRefs.banco.textContent = bankName;
            elementRefs.conta.textContent = `Conta: ${deposit.numeroConta}`;
            elementRefs.ativoNome.textContent = assetName;
            elementRefs.dataCriacao.textContent = dateFormatter.format(startDate);
            elementRefs.dataVencimento.textContent = isInfinite ? "∞" : dateFormatter.format(doublingDate);

            // Format the doubling time in a more human-readable way
            let durationText = "∞";
            if (!isInfinite) {
                if (yearsToDouble >= 100) {
                    durationText = "Mais de 100 anos";
                } else if (yearsToDouble >= 50) {
                    durationText = "Mais de 50 anos";
                } else {
                    const years = Math.floor(yearsToDouble);
                    const months = Math.round((yearsToDouble - years) * 12);
                    if (months > 0) {
                        durationText = `${years} anos e ${months} meses`;
                    } else {
                        durationText = `${years} anos`;
                    }
                }
            }

            elementRefs.duracao.textContent = durationText;
            elementRefs.valorInvestido.textContent = formatter.format(deposit.valorInvestido);
            elementRefs.valorAtual.textContent = formatter.format(valorAtual);
            elementRefs.taxaJuro.textContent = `${deposit.taxaJuroAnual}%`;
            elementRefs.jurosAcumulados.textContent = formatter.format(profitSoFar);
            elementRefs.lucroMensal.textContent = formatter.format(monthlyProfit);
            elementRefs.retorno.textContent = `${profitPercentage >= 0 ? '+' : ''}${profitPercentage.toFixed(1)}%`;

            // Despesas e taxas (estimadas)
            elementRefs.despesasAnuais.textContent = formatter.format(deposit.valorAnualDespesasEstimadas || 0);
            elementRefs.taxaImposto.textContent = '28%'; // Standard Portuguese tax rate for deposits
            const estimatedTax = profitSoFar * 0.28;
            elementRefs.impostoEstimado.textContent = formatter.format(estimatedTax);

            // Progress towards doubling the money
            elementRefs.progressoPercentagem.textContent = `${progress.toFixed(1)}%`;
            elementRefs.progressoBarra.style.width = `${Math.min(progress, 100)}%`;

            // Format days remaining in a more user-friendly way
            let daysRemainingText = "∞";
            if (!isInfinite) {
                if (daysRemaining > 36500) {  // More than 100 years
                    daysRemainingText = "Mais de 100 anos";
                } else if (daysRemaining > 18250) { // More than 50 years
                    daysRemainingText = "Mais de 50 anos";
                } else if (daysRemaining > 365) {
                    const years = Math.floor(daysRemaining / 365);
                    daysRemainingText = `${years} ano${years > 1 ? 's' : ''}`;
                } else {
                    daysRemainingText = `${daysRemaining} dia${daysRemaining > 1 ? 's' : ''}`;
                }
            }

            elementRefs.diasRestantes.textContent = daysRemainingText;
            elementRefs.valorVencimento.textContent = formatter.format(doubledValue);

            // Store current deposit ID for potential editing
            window.currentDepositId = depositId;

        } catch (dataError) {
            // Remove loading indicator if it exists
            const loadingDiv = elementRefs.modal?.querySelector('.loading-indicator');
            if (loadingDiv) {
                loadingDiv.remove();
            }

            throw dataError; // Re-throw to be caught by outer catch
        }

    } catch (error) {
        console.error('Erro ao carregar detalhes do depósito:', error);

        // Close modal if it was opened
        const modal = document.getElementById('detalhesDepositoModal');
        if (modal && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        // Show detailed error message based on error type
        if (error.name === 'TypeError' && error.message.includes('null')) {
            showEnhancedErrorToast(
                'Erro de interface',
                'Alguns elementos da interface não foram encontrados. Tente recarregar a página.'
            );
        } else if (error.message?.includes('API') || error.message?.includes('fetch')) {
            showEnhancedErrorToast(
                'Erro de conectividade',
                'Não foi possível comunicar com o servidor. Verifique sua conexão.'
            );
        } else {
            showEnhancedErrorToast(
                'Erro inesperado',
                `Ocorreu um erro ao carregar os detalhes: ${error.message || 'Erro desconhecido'}`
            );
        }
    }
}

/**
 * Create a loading indicator element
 * @returns {HTMLElement} Loading indicator element
 */
function createLoadingIndicator() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-indicator absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10';
    loadingDiv.innerHTML = `
        <div class="text-center">
            <div class="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-white font-medium">A carregar detalhes...</p>
        </div>
    `;
    return loadingDiv;
}

/**
 * Show enhanced success toast with title and message
 * @param {string} title - Toast title
 * @param {string} message - Toast message  
 */
function showEnhancedSuccessToast(title, message) {
    showEnhancedToast(title, message, 'success');
}

/**
 * Show enhanced error toast with title and message
 * @param {string} title - Toast title
 * @param {string} message - Toast message
 */
function showEnhancedErrorToast(title, message) {
    showEnhancedToast(title, message, 'error');
}

/**
 * Show enhanced toast notification with title and message
 * @param {string} title - Toast title
 * @param {string} message - Toast message
 * @param {string} type - Toast type ('success', 'error', 'info', 'warning')
 */
function showEnhancedToast(title, message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2 max-w-sm';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');

    // Define colors and icons for different types
    const typeConfig = {
        success: {
            bgClass: 'bg-green-500/90 border-green-400/50',
            iconColor: 'text-green-100',
            icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                     <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 111.414-1.414L8.414 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                   </svg>`
        },
        error: {
            bgClass: 'bg-red-500/90 border-red-400/50',
            iconColor: 'text-red-100',
            icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                   </svg>`
        },
        warning: {
            bgClass: 'bg-yellow-500/90 border-yellow-400/50',
            iconColor: 'text-yellow-100',
            icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                   </svg>`
        },
        info: {
            bgClass: 'bg-blue-500/90 border-blue-400/50',
            iconColor: 'text-blue-100',
            icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                   </svg>`
        }
    };

    const config = typeConfig[type] || typeConfig.info;

    toast.className = `${config.bgClass} border backdrop-blur-xl rounded-xl shadow-2xl text-white p-4 transform transition-all duration-300 ease-in-out translate-x-full opacity-0`;

    toast.innerHTML = `
        <div class="flex items-start space-x-3">
            <div class="${config.iconColor} flex-shrink-0 mt-0.5">
                ${config.icon}
            </div>
            <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-white">${title}</div>
                <div class="text-xs text-white/90 mt-1 leading-relaxed">${message}</div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="text-white/70 hover:text-white flex-shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
    `;

    // Add to container
    toastContainer.appendChild(toast);

    // Show toast with animation
    setTimeout(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
    }, 100);

    // Auto-remove toast after delay (longer for errors)
    const duration = type === 'error' ? 6000 : 4000;
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }, duration);
}

/**
 * Close deposit details modal
 */
function fecharModalDetalhes() {
    const modal = document.getElementById('detalhesDepositoModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    window.currentDepositId = null;
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

// Expose functions to global scope for HTML onclick handlers
window.abrirDetalhesDeposito = abrirDetalhesDeposito;
window.fecharModalDetalhes = fecharModalDetalhes;
window.abrirModalConfirmacaoDelete = abrirModalConfirmacaoDelete;
window.fecharModalConfirmacaoDelete = fecharModalConfirmacaoDelete;
window.eliminarDeposito = eliminarDeposito;
