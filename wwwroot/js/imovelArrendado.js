/**
 * JavaScript for ImovelArrendado page
 * Handles API integration, dynamic card generation, and UI state management
 */

// State variables
let imoveis = [];
let assets = [];
let summaryData = {
    valorTotal: 0,
    rendaMensal: 0,
    rendaAnual: 0,
    imoveisAtivos: 0
};

// DOM Elements
const elements = {
    // Containers
    imoveisContainer: document.getElementById('imoveisContainer'),
    imoveisGrid: document.getElementById('imoveisGrid'),

    // States
    loadingState: document.getElementById('loadingState'),
    errorState: document.getElementById('errorState'),
    emptyState: document.getElementById('emptyState'),

    // Summary elements
    valorTotal: document.getElementById('valorTotal'),
    rendaMensal: document.getElementById('rendaMensal'),
    rendaAnual: document.getElementById('rendaAnual'),
    imoveisAtivos: document.getElementById('imoveisAtivos'),

    // Buttons
    retryButton: document.getElementById('retryButton'),
    emptyStateNovoImovel: document.getElementById('emptyStateNovoImovel')
};

/**
 * Initialize the page
 */
async function init() {
    // Setup event listeners
    setupEventListeners();

    // Fetch reference data first
    await fetchAssets();

    // Fetch real estate properties from API
    await fetchImoveis();
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Retry button
    if (elements.retryButton) {
        elements.retryButton.addEventListener('click', fetchImoveis);
    }

    // Empty state new property button
    if (elements.emptyStateNovoImovel) {
        elements.emptyStateNovoImovel.addEventListener('click', abrirModalNovoImovel);
    }
}

/**
 * Fetch real estate properties from API
 */
async function fetchImoveis() {
    try {
        // Show loading state
        showState('loading');

        // Fetch data from API
        const response = await fetch('/api/imovelarrendado/getAllByUser', {
            method: 'GET',
            credentials: 'include'
        });

        // Check if response is ok
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse response
        const data = await response.json();

        // Log the raw API response for debugging
        console.log('API Response:', data);
        console.log('Sample property structure:', data.length > 0 ? data[0] : 'No properties found');

        // Store properties
        imoveis = Array.isArray(data) ? data : [data];
        console.log('Imóveis processados:', imoveis);

        // Update UI
        await renderImoveis();

        // Calculate and update summary
        await updateSummary();

    } catch (error) {
        console.error('Error fetching real estate properties:', error);
        showState('error');
    }
}

/**
 * Fetch assets from API
 */
async function fetchAssets() {
    try {
        const response = await fetch('/api/ativofinanceiro/ver', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            assets = await response.json();
            console.log('Assets carregados:', assets);
        }
    } catch (error) {
        console.error('Error fetching assets:', error);
    }
}

/**
 * Render real estate properties
 */
async function renderImoveis() {
    // Check if we have properties
    if (!imoveis || imoveis.length === 0) {
        showState('empty');
        return;
    }

    // Show properties grid
    showState('imoveis');

    // Clear properties grid
    elements.imoveisGrid.innerHTML = '';

    // Render each property
    for (const imovel of imoveis) {
        const card = await createImovelCard(imovel);
        elements.imoveisGrid.appendChild(card);
    }
}

/**
 * Create a real estate property card element
 * @param {Object} imovel - The property data
 * @returns {Promise<HTMLElement>} - The property card element
 */
async function createImovelCard(imovel) {
    console.log('Criando card para imóvel:', imovel);

    // Get asset information
    const asset = getAsset(imovel.ativoFinaceiroId);
    const assetName = asset ? asset.nome : `Ativo ID: ${imovel.ativoFinaceiroId}`;
    console.log(`Ativo relacionado: ${assetName}`);

    // Calculate profit if the calculation function exists
    let profitSoFar = 0;
    let profitPercentage = 0;

    try {
        if (typeof calcularLucroImovel === 'function') {
            console.log(`Calculando lucro para imóvel ${imovel.id} - ${imovel.designacao}`);
            profitSoFar = await calcularLucroImovel(imovel);
            console.log(`Lucro calculado: €${profitSoFar}`);

            // Calculate profit percentage based on property value
            profitPercentage = imovel.valorImovel > 0 ? (profitSoFar / imovel.valorImovel) * 100 : 0;
            console.log(`Percentagem de lucro calculada: ${profitPercentage.toFixed(2)}%`);
        } else {
            console.warn('A função calcularLucroImovel não foi encontrada. Verifique se ativosCalculos.js está carregado corretamente.');
        }
    } catch (error) {
        console.error('Erro ao calcular lucro do imóvel:', error);
    }

    // Calculate annual rental income
    const rendaAnual = imovel.valorRenda * 12;
    const despesasAnuais = (imovel.valorMensalCondominio * 12) + (imovel.valorAnualDespesasEstimadas || 0);
    const rendaLiquida = rendaAnual - despesasAnuais;

    // Calculate yield
    const yieldAnual = imovel.valorImovel > 0 ? (rendaLiquida / imovel.valorImovel) * 100 : 0;

    // Format date if available
    const dataCriacaoFormatada = imovel.dataCriacao ?
        new Date(imovel.dataCriacao).toLocaleDateString('pt-PT') :
        'N/A';

    // Create card element
    const card = document.createElement('div');
    card.className = 'bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl overflow-hidden hover:border-primary-500/30 transition-all duration-300 group';

    // Generate a gradient color based on property type or ID
    const gradients = [
        'from-emerald-500 to-teal-500',
        'from-blue-500 to-indigo-500',
        'from-purple-500 to-pink-500',
        'from-orange-500 to-amber-500',
        'from-green-500 to-lime-500',
        'from-red-500 to-rose-500'
    ];
    const gradientClass = gradients[imovel.id % gradients.length];

    // Display both morada and localizacao in the card
    const moradaDisplay = imovel.moradaId || imovel.morada || 'Morada não especificada';
    const localizacaoDisplay = imovel.localizacao || 'Localização não especificada';

    card.innerHTML = `
        <div class="relative h-32 bg-gradient-to-br ${gradientClass} p-6">
            <div class="absolute top-4 right-4">
                <span class="text-2xl">🏠</span>
            </div>
            <div class="absolute bottom-4 left-6">
                <h3 class="text-xl font-bold text-white">${imovel.designacao || 'Imóvel sem nome'}</h3>
                <span class="text-white/80 text-sm">${assetName}</span>
            </div>
        </div>
        
        <div class="p-6">
            <!-- Header with edit and delete buttons -->
            <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-white mb-1">${imovel.designacao || 'Imóvel sem nome'}</h3>
                    <span class="text-gray-400 text-sm">${moradaDisplay}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-lg font-medium">
                        Ativo
                    </span>
                    <button onclick="abrirModalEditarImovel(${imovel.id})" 
                        class="w-8 h-8 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-lg flex items-center justify-center transition-colors" 
                        title="Editar imóvel">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button onclick="abrirConfirmacaoDelete(${imovel.id}, '${imovel.designacao?.replace(/'/g, "\\'")}', '${(imovel.moradaId || imovel.morada || 'Sem morada')?.replace(/'/g, "\\'")}')" 
                        class="w-8 h-8 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg flex items-center justify-center transition-colors" 
                        title="Eliminar imóvel">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            <div class="space-y-3 mb-4">
                <div class="flex justify-between">
                    <span class="text-gray-400">Valor do Imóvel:</span>
                    <span class="text-white font-semibold">€${(imovel.valorImovel || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Renda Mensal:</span>
                    <span class="text-white font-semibold">€${(imovel.valorRenda || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Renda Anual Líquida:</span>
                    <span class="text-green-400 font-semibold">€${rendaLiquida.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Lucro Acumulado:</span>
                    <span class="text-${profitSoFar >= 0 ? 'green' : 'red'}-400 font-semibold">${profitSoFar >= 0 ? '+' : ''}€${profitSoFar.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Yield Anual:</span>
                    <span class="text-primary-400 font-semibold">${yieldAnual.toFixed(2)}%</span>
                </div>
            </div>

            <button onclick="abrirDetalhesImovel(${imovel.id})" 
                class="w-full py-2 bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 rounded-lg transition-colors duration-200 text-sm font-medium">
                Ver Detalhes
            </button>
        </div>
    `;

    // Prevent event bubbling on buttons
    const buttons = card.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    // Add click event to open details
    card.addEventListener('click', () => abrirDetalhesImovel(imovel.id));

    return card;
}

/**
 * Get asset by ID
 * @param {number} assetId - The asset ID
 * @returns {Object|null} - The asset object or null if not found
 */
function getAsset(assetId) {
    return assets.find(asset => asset.id === assetId) || null;
}

/**
 * Update summary statistics
 */
async function updateSummary() {
    // Calculate summary data
    summaryData.valorTotal = imoveis.reduce((sum, imovel) => sum + (imovel.valorImovel || 0), 0);
    summaryData.rendaMensal = imoveis.reduce((sum, imovel) => sum + (imovel.valorRenda || 0), 0);
    summaryData.rendaAnual = summaryData.rendaMensal * 12;
    summaryData.imoveisAtivos = imoveis.length;

    // Calculate total annual expenses
    const despesasAnuais = imoveis.reduce((sum, imovel) => {
        return sum + ((imovel.valorMensalCondominio || 0) * 12) + (imovel.valorAnualDespesasEstimadas || 0);
    }, 0);

    // Net annual income
    const rendaAnualLiquida = summaryData.rendaAnual - despesasAnuais;

    // Update UI elements
    if (elements.valorTotal) {
        elements.valorTotal.textContent = `€${summaryData.valorTotal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}`;
    }
    if (elements.rendaMensal) {
        elements.rendaMensal.textContent = `€${summaryData.rendaMensal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}`;
    }
    if (elements.rendaAnual) {
        elements.rendaAnual.textContent = `€${rendaAnualLiquida.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}`;
    }
    if (elements.imoveisAtivos) {
        elements.imoveisAtivos.textContent = summaryData.imoveisAtivos.toString();
    }
}

/**
 * Show different states of the page
 * @param {string} state - The state to show (loading, error, empty, imoveis)
 */
function showState(state) {
    // Hide all states first
    const states = ['loading', 'error', 'empty'];
    states.forEach(s => {
        const element = elements[`${s}State`];
        if (element) {
            element.classList.add('hidden');
            element.classList.remove('flex', 'flex-col');
        }
    });

    if (elements.imoveisContainer) {
        elements.imoveisContainer.classList.add('hidden');
    }

    // Show the requested state
    switch (state) {
        case 'loading':
            if (elements.loadingState) {
                elements.loadingState.classList.remove('hidden');
                elements.loadingState.classList.add('flex', 'flex-col');
            }
            break;
        case 'error':
            if (elements.errorState) {
                elements.errorState.classList.remove('hidden');
                elements.errorState.classList.add('flex', 'flex-col');
            }
            break;
        case 'empty':
            if (elements.emptyState) {
                elements.emptyState.classList.remove('hidden');
                elements.emptyState.classList.add('flex', 'flex-col');
            }
            break;
        case 'imoveis':
            if (elements.imoveisContainer) {
                elements.imoveisContainer.classList.remove('hidden');
            }
            break;
    }
}

/**
 * Open the new property modal
 */
function abrirModalNovoImovel() {
    const modal = document.getElementById('novoImovelModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Populate asset dropdown
    populateAtivosSelect();
}

/**
 * Close the new property modal
 */
function fecharModalNovoImovel() {
    const modal = document.getElementById('novoImovelModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

/**
 * Open property details modal
 * @param {number} imovelId - The property ID
 */
function abrirDetalhesImovel(imovelId) {
    // Find the property
    const imovel = imoveis.find(i => i.id === imovelId);
    if (!imovel) {
        showToast('Imóvel não encontrado', 'error');
        return;
    }

    // For now, just show a toast - can be enhanced with a details modal
    showToast(`Detalhes do imóvel: ${imovel.designacao}`, 'info');
}

/**
 * Show toast notification
 * @param {string} message - The message to show
 * @param {string} type - The type of toast (success, error, info)
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';

    toast.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0 fixed top-4 right-4 z-50`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
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
    assets.forEach(asset => {
        const option = document.createElement('option');
        option.value = asset.id;
        option.textContent = asset.nome;
        select.appendChild(option);
    });
}

/**
 * Submit the new property form
 * @param {Event} e - Form submit event
 */
async function handleImovelSubmit(e) {
    e.preventDefault();

    const form = document.getElementById('formNovoImovel');
    if (!form) return;

    // Get form values
    const ativoFinaceiroId = parseInt(document.getElementById('ativoFinanceiroSelect').value);
    const designacao = document.getElementById('designacao').value;
    const morada = document.getElementById('morada').value;
    const localizacao = document.getElementById('localizacao').value;
    const valorImovel = parseFloat(document.getElementById('valorImovel').value);
    const valorRenda = parseFloat(document.getElementById('valorRenda').value);
    const valorMensalCondominio = parseFloat(document.getElementById('valorMensalCondominio').value) || 0;
    const valorAnualDespesasEstimadas = parseFloat(document.getElementById('valorAnualDespesasEstimadas').value) || 0;

    // Form validation
    if (!ativoFinaceiroId || !designacao || !morada || !localizacao || isNaN(valorImovel) || isNaN(valorRenda)) {
        showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }

    // Create property data
    const imovelData = {
        userId: -1, // Default value for userId as specified
        ativoFinaceiroId: ativoFinaceiroId,
        morada: morada,
        designacao: designacao,
        localizacao: localizacao,
        valorImovel: valorImovel,
        valorRenda: valorRenda,
        valorMensalCondominio: valorMensalCondominio,
        valorAnualDespesasEstimadas: valorAnualDespesasEstimadas,
        dataCriacao: new Date().toISOString()
    };

    console.log('Submitting property data:', imovelData);
    try {
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="flex items-center justify-center"><div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>A processar...</div>';

        // Send request to API
        const response = await fetch('/api/imovelarrendado/adicionar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(imovelData)
        });

        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Close modal and show success toast
        fecharModalNovoImovel();
        showToast('Imóvel adicionado com sucesso!', 'success');

        // Reset form
        form.reset();

        // Refresh properties list
        await fetchImoveis();

    } catch (error) {
        console.error('Error creating property:', error);
        showToast('Erro ao adicionar imóvel. Por favor, tente novamente.', 'error');
    }
}

// Variable to store the ID of the property to be deleted
let deleteImovelId = null;

/**
 * Open delete confirmation modal
 * @param {number} imovelId - The property ID to delete
 * @param {string} designacao - Property name for display
 * @param {string} moradaInfo - Property address/location for display
 */
function abrirConfirmacaoDelete(imovelId, designacao, moradaInfo) {
    deleteImovelId = imovelId;

    // Find the full property details for better display
    const imovel = imoveis.find(i => i.id === imovelId);
    const localizacao = imovel ? imovel.localizacao : '';

    const modal = document.getElementById('deleteConfirmationModal');
    const infoDiv = document.getElementById('deleteImovelInfo');

    // Populate the property info with more details
    infoDiv.innerHTML = `
        <div class="space-y-2">
            <div class="font-semibold text-lg">${designacao}</div>
            <div class="text-gray-400 text-sm">${moradaInfo}</div>
            ${localizacao ? `<div class="text-gray-500 text-xs">${localizacao}</div>` : ''}
            ${imovel ? `<div class="text-gray-500 text-xs">Valor: €${(imovel.valorImovel || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</div>` : ''}
        </div>
    `;

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
    deleteImovelId = null;
}

/**
 * Delete the property
 */
async function eliminarImovel() {
    if (!deleteImovelId) {
        showToast('Erro: ID do imóvel não encontrado', 'error');
        return;
    }

    try {
        // Show loading state on button
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        const originalText = confirmBtn.innerHTML;
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<div class="flex items-center justify-center"><div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>A eliminar...</div>';

        // Make DELETE request to API
        const response = await fetch(`/api/imovelarrendado/remover?imovelArrendadoId=${deleteImovelId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        // Reset button state
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = originalText;

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Close modal and show success message
        fecharModalConfirmacaoDelete();
        showToast('Imóvel eliminado com sucesso!', 'success');

        // Refresh the properties list
        await fetchImoveis();

    } catch (error) {
        console.error('Error deleting property:', error);
        showToast('Erro ao eliminar imóvel. Por favor, tente novamente.', 'error');

        // Reset button state in case of error
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = 'Eliminar';
    }
}

/**
 * Open edit property modal
 * @param {number} imovelId - The ID of the property to edit
 */
function abrirModalEditarImovel(imovelId) {
    // Find the property to edit
    const imovel = imoveis.find(i => i.id === imovelId);
    if (!imovel) {
        showToast('Imóvel não encontrado', 'error');
        return;
    }

    console.log('Editing property:', imovel);

    // Populate assets select for edit modal
    populateEditAtivosSelect();

    // Fill form with current property data - handle API response structure
    document.getElementById('editImovelId').value = imovel.id;
    document.getElementById('editAtivoFinanceiroSelect').value = imovel.ativoFinaceiroId || '';
    document.getElementById('editDesignacao').value = imovel.designacao || '';
    // Handle both moradaId (from API response) and morada (for form submission)
    document.getElementById('editMorada').value = imovel.moradaId || imovel.morada || '';
    document.getElementById('editLocalizacao').value = imovel.localizacao || '';
    document.getElementById('editValorImovel').value = imovel.valorImovel || '';
    document.getElementById('editValorRenda').value = imovel.valorRenda || '';
    document.getElementById('editValorMensalCondominio').value = imovel.valorMensalCondominio || 0;
    document.getElementById('editValorAnualDespesasEstimadas').value = imovel.valorAnualDespesasEstimadas || 0;

    // Show modal
    const modal = document.getElementById('editarImovelModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

/**
 * Close edit property modal
 */
function fecharModalEditarImovel() {
    const modal = document.getElementById('editarImovelModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');

    // Reset form
    document.getElementById('formEditarImovel').reset();
}

/**
 * Populate assets select element in the edit form
 */
function populateEditAtivosSelect() {
    const select = document.getElementById('editAtivoFinanceiroSelect');
    if (!select) return;

    // Clear existing options except the first one
    while (select.options.length > 1) {
        select.remove(1);
    }

    // Add assets as options
    assets.forEach(asset => {
        const option = document.createElement('option');
        option.value = asset.id;
        option.textContent = asset.nome;
        select.appendChild(option);
    });
}

/**
 * Submit the edit property form
 * @param {Event} e - Form submit event
 */
async function handleImovelEdit(e) {
    e.preventDefault();

    const form = document.getElementById('formEditarImovel');
    if (!form) return;

    // Get form values
    const id = parseInt(document.getElementById('editImovelId').value);
    const ativoFinaceiroId = parseInt(document.getElementById('editAtivoFinanceiroSelect').value);
    const designacao = document.getElementById('editDesignacao').value;
    const morada = document.getElementById('editMorada').value;
    const localizacao = document.getElementById('editLocalizacao').value;
    const valorImovel = parseFloat(document.getElementById('editValorImovel').value);
    const valorRenda = parseFloat(document.getElementById('editValorRenda').value);
    const valorMensalCondominio = parseFloat(document.getElementById('editValorMensalCondominio').value) || 0;
    const valorAnualDespesasEstimadas = parseFloat(document.getElementById('editValorAnualDespesasEstimadas').value) || 0;

    // Form validation
    if (!id || !ativoFinaceiroId || !designacao || !morada || !localizacao || isNaN(valorImovel) || isNaN(valorRenda)) {
        showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }

    // Create property data for update - match the API response structure
    const originalImovel = imoveis.find(i => i.id === id);
    console.log(morada)
    console.log(morada)
    console.log(morada)
    console.log(morada)
    console.log(morada)
    console.log(morada)
    console.log(morada)
    console.log(morada)
    const imovelData = {
        imovelArrendadoId: id,
        morada: morada,
        designacao: designacao,
        localizacao: localizacao,
        valorImovel: valorImovel,
        valorRenda: valorRenda,
        valorMensalCondominio: valorMensalCondominio,
        valorAnualDespesasEstimadas: valorAnualDespesasEstimadas
    };

    console.log('Updating property with data:', imovelData);

    try {
        // Get submit button for loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="flex items-center justify-center"><div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>A guardar...</div>';

        // Make PUT request to API
        const response = await fetch('/api/imovelarrendado/atualizar', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(imovelData)
        });

        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
        }

        // Check if there's content to parse
        const contentType = response.headers.get('content-type');
        let result = null;

        if (contentType && contentType.includes('application/json')) {
            const responseText = await response.text();
            if (responseText.trim()) {
                try {
                    result = JSON.parse(responseText);
                    console.log('Update result:', result);
                } catch (parseError) {
                    console.log('No JSON content in response, operation successful');
                }
            } else {
                console.log('Empty response body, operation successful');
            }
        } else {
            console.log('Non-JSON response, operation successful');
        }

        // Close modal and show success message
        fecharModalEditarImovel();
        showToast('Imóvel atualizado com sucesso!', 'success');

        // Refresh the properties list
        await fetchImoveis();

    } catch (error) {
        console.error('Error updating property:', error);
        showToast('Erro ao atualizar imóvel. Por favor, tente novamente.', 'error');

        // Reset button state in case of error
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Guardar Alterações';
    }
}

/**
 * Open property details modal
 * @param {number} imovelId - The property ID
 */
async function abrirDetalhesImovel(imovelId) {
    // Find the property to view
    const imovel = imoveis.find(i => i.id === imovelId);
    if (!imovel) {
        showToast('Imóvel não encontrado', 'error');
        return;
    }

    console.log('Viewing property details:', imovel);

    // Get asset name
    const asset = getAsset(imovel.ativoFinaceiroId);
    const assetName = asset ? asset.nome : `Ativo ID: ${imovel.ativoFinaceiroId}`;

    // Calculate financial metrics
    const rendaAnualBruta = imovel.valorRenda * 12;
    const despesasAnuais = (imovel.valorMensalCondominio * 12) + (imovel.valorAnualDespesasEstimadas || 0);
    const rendaAnualLiquida = rendaAnualBruta - despesasAnuais;
    const yieldAnual = imovel.valorImovel > 0 ? (rendaAnualLiquida / imovel.valorImovel) * 100 : 0;

    // Get accumulated profit
    let lucroAcumulado = 0;
    try {
        if (window.calcularLucroImovel) {
            lucroAcumulado = await window.calcularLucroImovel(imovel);
        }
    } catch (error) {
        console.error('Erro ao calcular lucro acumulado:', error);
    }

    // Format currency
    const formatCurrency = (value) => `€${(value || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}`;

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-PT');
    };

    // Populate modal fields
    document.getElementById('detalhesDesignacao').textContent = imovel.designacao || 'Sem designação';
    document.getElementById('detalhesAtivoFinanceiro').textContent = assetName;
    document.getElementById('detalhesMorada').textContent = imovel.moradaId || imovel.morada || 'Sem morada';
    document.getElementById('detalhesLocalizacao').textContent = imovel.localizacao || 'Sem localização';
    document.getElementById('detalhesDataCriacao').textContent = formatDate(imovel.dataCriacao);

    // Financial information
    document.getElementById('detalhesValorImovel').textContent = formatCurrency(imovel.valorImovel);
    document.getElementById('detalhesValorRenda').textContent = formatCurrency(imovel.valorRenda);
    document.getElementById('detalhesValorCondominio').textContent = formatCurrency(imovel.valorMensalCondominio);
    document.getElementById('detalhesValorDespesas').textContent = formatCurrency(imovel.valorAnualDespesasEstimadas);

    // Profitability analysis
    document.getElementById('detalhesRendaAnualBruta').textContent = formatCurrency(rendaAnualBruta);
    document.getElementById('detalhesRendaAnualLiquida').textContent = formatCurrency(rendaAnualLiquida);
    document.getElementById('detalhesYield').textContent = `${yieldAnual.toFixed(2)}%`;
    document.getElementById('detalhesDespesasTotais').textContent = formatCurrency(despesasAnuais);

    // Set profit color based on value
    const lucroElement = document.getElementById('detalhesLucroAcumulado');
    lucroElement.textContent = formatCurrency(lucroAcumulado);
    lucroElement.className = `font-medium text-lg ${lucroAcumulado >= 0 ? 'text-green-400' : 'text-red-400'}`;

    // Store the current property ID for potential editing
    window.currentDetailImovelId = imovelId;

    // Show modal
    const modal = document.getElementById('detalhesImovelModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

/**
 * Close property details modal
 */
function fecharModalDetalhes() {
    const modal = document.getElementById('detalhesImovelModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    window.currentDetailImovelId = null;
}

/**
 * Edit property from details modal
 */
function editarImovelFromDetalhes() {
    if (window.currentDetailImovelId) {
        fecharModalDetalhes();
        abrirModalEditarImovel(window.currentDetailImovelId);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
