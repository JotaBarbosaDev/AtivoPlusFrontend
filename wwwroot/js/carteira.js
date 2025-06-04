/**
 * JavaScript for Carteira page
 * Handles portfolio management without money calculations
 */

let carteiras = [];
let ativos = [];
let carteiraAtualId = null;

// Initialize the carteira page
async function initCarteiras() {
    try {
        await Promise.all([
            carregarCarteiras(),
            carregarAtivos()
        ]);
        atualizarResumo();
    } catch (error) {
        console.error('Erro ao inicializar carteiras:', error);
        showToast('Erro ao carregar dados das carteiras', 'error');
    }
}

// Load carteiras from API
async function carregarCarteiras() {
    try {
        const response = await fetch('/api/carteira/ver?userIdFromCarteira=-1', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar carteiras');
        }

        carteiras = await response.json();
        renderizarCarteiras();
    } catch (error) {
        console.error('Erro ao carregar carteiras:', error);
        carteiras = [];
        renderizarCarteiras();
    }
}

// Load all ativos from API
async function carregarAtivos() {
    try {
        const response = await fetch('/api/ativofinanceiro/ver?userIdFromAtivo=-1', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar ativos');
        }

        ativos = await response.json();
        console.log('Ativos carregados:', ativos);

        // Load asset types and enhance ativos with type information
        await carregarTiposAtivos();
    } catch (error) {
        console.error('Erro ao carregar ativos:', error);
        ativos = [];
    }
}

// Load asset types by checking investments associated with each ativo
async function carregarTiposAtivos() {
    try {
        // Fetch data from all investment APIs
        const [depositosResponse, fundosResponse, imoveisResponse] = await Promise.all([
            fetch('/api/depositoprazo/getAllByUser', { method: 'GET', credentials: 'include' }),
            fetch('/api/fundoinvestimento/getAllByUser', { method: 'GET', credentials: 'include' }),
            fetch('/api/imovelarrendado/getAllByUser', { method: 'GET', credentials: 'include' })
        ]);

        // Parse responses (handle both JSON and text responses)
        const depositos = await parseResponse(depositosResponse);
        const fundos = await parseResponse(fundosResponse);
        const imoveis = await parseResponse(imoveisResponse);

        console.log('Dados de investimentos carregados:', { depositos, fundos, imoveis });

        // Map each ativo to its type based on associated investments
        ativos.forEach(ativo => {
            // Check if this ativo has deposits
            const temDeposito = depositos.some(d => d.ativoFinaceiroId === ativo.id);
            // Check if this ativo has funds
            const temFundo = fundos.some(f => f.ativoFinaceiroId === ativo.id);
            // Check if this ativo has real estate
            const temImovel = imoveis.some(i => i.ativoFinaceiroId === ativo.id);

            // Determine type based on what investments exist
            if (temDeposito && !temFundo && !temImovel) {
                ativo.tipo = 'Depósito a Prazo';
            } else if (temFundo && !temDeposito && !temImovel) {
                ativo.tipo = 'Fundo de Investimento';
            } else if (temImovel && !temDeposito && !temFundo) {
                ativo.tipo = 'Imóvel Arrendado';
            } else if (temDeposito || temFundo || temImovel) {
                ativo.tipo = 'Misto'; // Multiple types
            } else {
                ativo.tipo = 'Sem Investimentos'; // No investments found
            }
        });

        console.log('Ativos com tipos determinados:', ativos);
    } catch (error) {
        console.error('Erro ao carregar tipos de ativos:', error);
        // Set default type for all ativos if error occurs
        ativos.forEach(ativo => {
            ativo.tipo = 'Tipo Desconhecido';
        });
    }
}

// Helper function to parse API responses (handles both JSON and text)
async function parseResponse(response) {
    if (!response.ok) {
        return [];
    }

    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return Array.isArray(data) ? data : [data];
    } else {
        const textData = await response.text();
        // Check for "no entries found" messages
        if (textData.toLowerCase().includes('no') && textData.toLowerCase().includes('found')) {
            return [];
        }
        // If it's unexpected text, return empty array
        return [];
    }
}

// Render carteiras in the grid
function renderizarCarteiras() {
    const container = document.getElementById('carteirasContainer');
    const emptyState = document.getElementById('emptyState');

    if (!carteiras || carteiras.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    const carteirasHtml = carteiras.map(carteira => {
        const ativosNaCarteira = ativos.filter(ativo => ativo.carteiraId === carteira.id);
        const numAtivos = ativosNaCarteira.length;

        return `
            <div class="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 hover:border-primary-500/50 transition-all duration-300 card-hover cursor-pointer"
                onclick="abrirModalDetalhes(${carteira.id}, '${carteira.nome}')">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center">
                        <svg class="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-400">${numAtivos} ativos</span>
                    </div>
                </div>
                <h3 class="text-xl font-semibold text-white mb-2">${carteira.nome}</h3>
                <p class="text-gray-400 text-sm mb-4">Carteira de investimentos</p>
                <div class="flex items-center justify-between">
                    <span class="text-primary-400 font-medium">Ver Detalhes</span>
                    <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = carteirasHtml;
}

// Update summary cards
function atualizarResumo() {
    const totalCarteirasElement = document.getElementById('totalCarteiras');
    const totalAtivosElement = document.getElementById('totalAtivos');

    if (totalCarteirasElement) {
        totalCarteirasElement.textContent = carteiras.length;
    }

    if (totalAtivosElement) {
        totalAtivosElement.textContent = ativos.length;
    }
}

// Open modal with portfolio details
function abrirModalDetalhes(carteiraId, nome) {
    carteiraAtualId = carteiraId;

    // Find the carteira and its ativos
    const carteira = carteiras.find(c => c.id === carteiraId);
    const ativosNaCarteira = ativos.filter(ativo => ativo.carteiraId === carteiraId);

    // Update modal title
    document.getElementById('modalCarteiraNome').textContent = nome;

    // Update unified content (overview + assets in one view)
    updateConteudoUnificado(carteira, ativosNaCarteira);

    // Show modal
    const modal = document.getElementById('detalhesCarteiraModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

// Update unified content showing overview and assets together
function updateConteudoUnificado(carteira, ativosNaCarteira) {
    // Format creation date
    const dataCriacao = carteira?.dataCriacao
        ? new Date(carteira.dataCriacao).toLocaleDateString('pt-PT')
        : new Date().toLocaleDateString('pt-PT');

    // Create unified content HTML
    let conteudoHTML = `
        <!-- Overview Section -->
        <div class="mb-8">
            <h3 class="text-lg font-semibold text-white mb-4">Informações da Carteira</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-gray-800/50 rounded-lg p-4">
                    <div class="flex justify-between items-center">
                        <span class="text-gray-400">Número de Ativos:</span>
                        <span class="text-white font-semibold">${ativosNaCarteira.length}</span>
                    </div>
                </div>
                <div class="bg-gray-800/50 rounded-lg p-4">
                    <div class="flex justify-between items-center">
                        <span class="text-gray-400">Data de Criação:</span>
                        <span class="text-white font-semibold">${dataCriacao}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Assets Section -->
        <div>
            <h3 class="text-lg font-semibold text-white mb-4">Ativos na Carteira</h3>
    `;

    if (!ativosNaCarteira || ativosNaCarteira.length === 0) {
        conteudoHTML += `
            <div class="text-center py-8">
                <div class="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <p class="text-gray-400">Nenhum ativo encontrado nesta carteira</p>
                <p class="text-gray-500 text-sm mt-2">Vá para a página de Ativos para adicionar investimentos</p>
            </div>
        `;
    } else {
        conteudoHTML += '<div class="space-y-4">';

        ativosNaCarteira.forEach(ativo => {
            let iconClass = 'bg-blue-500/10 text-blue-400';
            let iconSvg = 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1';

            if (ativo.tipo === 'Fundo de Investimento') {
                iconClass = 'bg-green-500/10 text-green-400';
                iconSvg = 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6';
            } else if (ativo.tipo === 'Imóvel Arrendado') {
                iconClass = 'bg-yellow-500/10 text-yellow-400';
                iconSvg = 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1';
            }

            conteudoHTML += `
                <button onclick="navegarParaAtivo(${ativo.id}, '${ativo.tipo || 'Tipo Desconhecido'}')" 
                    class="w-full bg-gray-800/50 rounded-xl p-4 hover:bg-gray-800/70 transition-colors text-left group">
                    <div class="flex items-start justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 ${iconClass} rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconSvg}"/>
                                </svg>
                            </div>
                            <div>
                                <h4 class="font-semibold text-white">${ativo.nome || 'Ativo Financeiro'}</h4>
                                <p class="text-sm text-gray-400">${ativo.tipo || 'Tipo Desconhecido'}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-primary-400 text-sm group-hover:text-primary-300">Ver Detalhes</span>
                            <svg class="w-4 h-4 text-primary-400 group-hover:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </div>
                    </div>
                </button>
            `;
        });

        conteudoHTML += '</div>';
    }

    conteudoHTML += '</div>';

    // Update the unified content area
    document.getElementById('conteudoVisaoGeral').innerHTML = conteudoHTML;
}

// Update distribution by asset type
function updateDistribuicaoTipos(ativosNaCarteira) {
    const depositos = ativosNaCarteira.filter(ativo => ativo.tipo === 'Depósito a Prazo').length;
    const fundos = ativosNaCarteira.filter(ativo => ativo.tipo === 'Fundo de Investimento').length;
    const imoveis = ativosNaCarteira.filter(ativo => ativo.tipo === 'Imóvel Arrendado').length;

    const total = depositos + fundos + imoveis;

    // Update progress bars and counts
    const depositosElement = document.querySelector('[data-asset-type="depositos"]');
    const fundosElement = document.querySelector('[data-asset-type="fundos"]');
    const imoveisElement = document.querySelector('[data-asset-type="imoveis"]');

    if (depositosElement) {
        const progressBar = depositosElement.querySelector('.bg-blue-500');
        const countSpan = depositosElement.querySelector('.text-white.text-sm');
        progressBar.style.width = total > 0 ? `${(depositos / total) * 100}%` : '0%';
        countSpan.textContent = depositos;
    }

    if (fundosElement) {
        const progressBar = fundosElement.querySelector('.bg-green-500');
        const countSpan = fundosElement.querySelector('.text-white.text-sm');
        progressBar.style.width = total > 0 ? `${(fundos / total) * 100}%` : '0%';
        countSpan.textContent = fundos;
    }

    if (imoveisElement) {
        const progressBar = imoveisElement.querySelector('.bg-yellow-500');
        const countSpan = imoveisElement.querySelector('.text-white.text-sm');
        progressBar.style.width = total > 0 ? `${(imoveis / total) * 100}%` : '0%';
        countSpan.textContent = imoveis;
    }
}

// Populate assets tab with clickable buttons
function populateAssetsTab(ativosNaCarteira) {
    const conteudoAtivos = document.getElementById('conteudoAtivos');

    if (!ativosNaCarteira || ativosNaCarteira.length === 0) {
        conteudoAtivos.innerHTML = `
            <div class="text-center py-8">
                <div class="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <p class="text-gray-400">Nenhum ativo encontrado nesta carteira</p>
                <p class="text-gray-500 text-sm mt-2">Vá para a página de Ativos para adicionar investimentos</p>
            </div>
        `;
        return;
    }

    let assetsHtml = '<div class="space-y-4">';

    ativosNaCarteira.forEach(ativo => {
        let iconClass = 'bg-blue-500/10 text-blue-400';
        let iconSvg = 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1';

        if (ativo.tipo === 'Fundo de Investimento') {
            iconClass = 'bg-green-500/10 text-green-400';
            iconSvg = 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6';
        } else if (ativo.tipo === 'Imóvel Arrendado') {
            iconClass = 'bg-yellow-500/10 text-yellow-400';
            iconSvg = 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1';
        }

        assetsHtml += `
            <button onclick="navegarParaAtivo(${ativo.id}, '${ativo.tipo || 'Tipo Desconhecido'}')" 
                class="w-full bg-gray-800/50 rounded-xl p-4 hover:bg-gray-800/70 transition-colors text-left group">
                <div class="flex items-start justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 ${iconClass} rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconSvg}"/>
                            </svg>
                        </div>
                        <div>
                            <h4 class="font-semibold text-white">${ativo.nome || 'Ativo Financeiro'}</h4>
                            <p class="text-sm text-gray-400">${ativo.tipo || 'Tipo Desconhecido'}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-primary-400 text-sm group-hover:text-primary-300">Ver Detalhes</span>
                        <svg class="w-4 h-4 text-primary-400 group-hover:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </div>
            </button>
        `;
    });

    assetsHtml += '</div>';
    conteudoAtivos.innerHTML = assetsHtml;
}

// Navigate to Ativos page and show specific ativo details
function navegarParaAtivo(ativoId, tipoAtivo) {
    // Store the ativo data to show details on the Ativos page
    const ativoData = {
        id: ativoId,
        tipo: tipoAtivo
    };

    sessionStorage.setItem('navegarParaAtivo', JSON.stringify(ativoData));

    // Navigate to Ativos page
    window.location.href = '/Ativos';
}

// Refresh portfolio data
async function refreshPortfolioData() {
    await initCarteiras();
}

// Tab switching functionality
function switchTab(tabName) {
    // Hide all tab contents
    document.getElementById('conteudoVisaoGeral').classList.toggle('hidden', tabName !== 'visao-geral');
    document.getElementById('conteudoAtivos').classList.toggle('hidden', tabName !== 'ativos');

    // Update tab styling
    const tabVisaoGeral = document.getElementById('tabVisaoGeral');
    const tabAtivos = document.getElementById('tabAtivos');

    // Remove active classes from all tabs
    [tabVisaoGeral, tabAtivos].forEach(tab => {
        tab.classList.remove('text-primary-400', 'border-primary-400', 'border-b-2');
        tab.classList.add('text-gray-400');
    });

    // Add active class to selected tab
    if (tabName === 'visao-geral') {
        tabVisaoGeral.classList.remove('text-gray-400');
        tabVisaoGeral.classList.add('text-primary-400', 'border-primary-400', 'border-b-2');
    } else if (tabName === 'ativos') {
        tabAtivos.classList.remove('text-gray-400');
        tabAtivos.classList.add('text-primary-400', 'border-primary-400', 'border-b-2');
    }
}

// Toast notification function
function showToast(message, type = "info") {
    const toast = document.createElement("div");
    let iconSVG, bgClass;

    switch (type) {
        case "success":
            bgClass = "bg-green-500/10 border-green-500/20";
            iconSVG = `<svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 111.414-1.414L8.414 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>`;
            break;
        case "error":
            bgClass = "bg-red-500/10 border-red-500/20";
            iconSVG = `<svg class="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>`;
            break;
        default:
            bgClass = "bg-primary-500/10 border-primary-500/20";
            iconSVG = `<svg class="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m-1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>`;
    }

    toast.className = `flex items-center p-4 space-x-3 ${bgClass} border backdrop-blur-xl rounded-xl shadow-lg text-white animate-slide-up`;
    toast.innerHTML = `${iconSVG}<div class="text-sm font-medium">${message}</div>`;

    document.getElementById("toast-container").appendChild(toast);

    setTimeout(() => {
        toast.classList.add("opacity-0", "transition-opacity", "duration-300");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
