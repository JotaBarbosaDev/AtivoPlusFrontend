/**
 * JavaScript for Ativos calculations
 * Handles profit calculations for different asset types
 */

/**
 * Calculate profit for deposit investments
 * @param {Object} deposito - The deposit data
 * @returns {number} - The calculated profit
 */
/**
 * Calculate profit percentage for deposit investments using API
 * @param {Object} deposito - The deposit data
 * @returns {Promise<number>} - The calculated profit percentage
 */
async function calcularPorcentagemLucroDeposito(deposito) {
    try {
        if (!deposito || !deposito.id) {
            return 0;
        }

        const response = await fetch(`/api/depositoprazo/getLucroById?depositoPrazoId=${deposito.id}`);

        if (!response.ok) {
            console.error('Erro na API de lucro do depósito:', response.status);
            return 0;
        }

        const data = await response.json();

        // Check if response contains error message
        if (typeof data === 'string' || data.error) {
            console.error('Erro na resposta da API:', data);
            return 0;
        }

        const profitPercentage = data.percentagemLucro || 0;
        console.log(`Porcentagem de lucro do depósito ${deposito.id}: ${profitPercentage}%`);
        return Math.max(0, Math.round(profitPercentage * 100) / 100);

    } catch (error) {
        console.error('Erro ao calcular porcentagem de lucro do depósito:', error);
        return 0;
    }
}

/**
 * Calculate direct profit value for deposit investments using API
 * @param {Object} deposito - The deposit data
 * @returns {Promise<number>} - The calculated profit value
 */
async function calcularLucroDeposito(deposito) {
    try {
        if (!deposito || !deposito.id) {
            return 0;
        }

        const response = await fetch(`/api/depositoprazo/getLucroById?depositoPrazoId=${deposito.id}`);

        if (!response.ok) {
            console.error('Erro na API de lucro do depósito:', response.status);
            return 0;
        }

        const data = await response.json();

        // Check if response contains error message
        if (typeof data === 'string' || data.error) {
            console.error('Erro na resposta da API:', data);
            return 0;
        }

        const profitValue = data.lucro || 0;
        console.log(`Lucro direto do depósito ${deposito.id}: ${profitValue}`);
        return Math.round(profitValue * 100) / 100;

    } catch (error) {
        console.error('Erro ao calcular lucro direto do depósito:', error);
        return 0;
    }
}

/**
 * Calculate profit percentage for investment funds using API
 * @param {Object} fundo - The fund data
 * @returns {Promise<number>} - The calculated profit percentage    
 */
async function calcularPorcentagemLucroFundoInvestimento(fundo) {
    try {
        if (!fundo || !fundo.id) {
            return 0;
        }

        const response = await fetch(`/api/fundoinvestimento/getLucroById?fundoInvestimentoId=${fundo.id}`);

        if (!response.ok) {
            const data = await response.text();
            if (data.includes("Nao temos acesso com a api gratis symbol")) {
                const symbol = fundo.symbol || fundo.simbolo || 'unknown';
                console.error(`Nao temos acesso com a api gratis symbol ${symbol}`);
                return -69;
            }
            console.error('Erro na API de lucro do fundo:', response.status);
            return 0;
        }

        const data = await response.json();

        // Check if response contains error message
        if (typeof data === 'string' && data.includes("Nao temos acesso com a api gratis symbol")) {
            const symbol = fundo.symbol || fundo.simbolo || 'unknown';
            console.error(`Nao temos acesso com a api gratis symbol ${symbol}`);
            return -69;
        }

        // Check if response contains error message
        if (typeof data === 'string' || data.error) {
            console.error('Erro na resposta da API:', data);
            return 0;
        }

        const profitPercentage = data.percentagemLucro || 0;
        console.log(`Porcentagem de lucro do fundo ${fundo.id}: ${profitPercentage}%`);
        return Math.round(profitPercentage * 100) / 100;

    } catch (error) {
        console.error('Erro ao calcular porcentagem de lucro do fundo:', error);
        return 0;
    }
}

/**
 * Calculate direct profit value for investment funds using API
 * @param {Object} fundo - The fund data
 * @returns {Promise<number>} - The calculated direct profit value    
 */
async function calcularLucroFundoInvestimento(fundo) {
    try {
        if (!fundo || !fundo.id) {
            return 0;
        }

        const response = await fetch(`/api/fundoinvestimento/getLucroById?fundoInvestimentoId=${fundo.id}`);

        if (!response.ok) {
            const data = await response.text();
            if (data.includes("Nao temos acesso com a api gratis symbol")) {
                const symbol = fundo.symbol || fundo.simbolo || 'unknown';
                console.error(`Nao temos acesso com a api gratis symbol ${symbol}`);
                return -69;
            }
            console.error('Erro na API de lucro do fundo:', response.status);
            return 0;
        }

        const data = await response.json();

        // Check if response contains error message
        if (typeof data === 'string' && data.includes("Nao temos acesso com a api gratis symbol")) {
            const symbol = fundo.symbol || fundo.simbolo || 'unknown';
            console.error(`Nao temos acesso com a api gratis symbol ${symbol}`);
            return -69;
        }
        if (typeof data === 'string' || data.error) {
            console.error('Erro na resposta da API:', data);
            return 0;
        }

        const profitValue = data.lucro || 0;
        console.log(`Lucro direto do fundo ${fundo.id}: ${profitValue}`);
        return Math.round(profitValue * 100) / 100;

    } catch (error) {
        console.error('Erro ao calcular lucro direto do fundo:', error);
        return 0;
    }
}

/**
 * Calculate profit percentage for real estate properties using API
 * @param {Object} imovel - The property data
 * @returns {Promise<number>} - The calculated profit percentage
 */
async function calcularPorcentagemLucroImovel(imovel) {
    try {
        if (!imovel || !imovel.id) {
            return 0;
        }

        const response = await fetch(`/api/imovelarrendado/getLucroById?imovelArrendadoId=${imovel.id}`);

        if (!response.ok) {
            console.error('Erro na API de lucro do imóvel:', response.status);
            return 0;
        }

        const data = await response.json();

        // Check if response contains error message
        if (typeof data === 'string' || data.error) {
            console.error('Erro na resposta da API:', data);
            return 0;
        }

        const profitPercentage = data.percentagemLucro || 0;
        console.log(`Porcentagem de lucro do imóvel ${imovel.id}: ${profitPercentage}%`);
        return Math.max(0, Math.round(profitPercentage * 100) / 100);

    } catch (error) {
        console.error('Erro ao calcular porcentagem de lucro do imóvel:', error);
        return 0;
    }
}

/**
 * Calculate direct profit value for real estate properties using API
 * @param {Object} imovel - The property data
 * @returns {Promise<number>} - The calculated profit value
 */
async function calcularLucroImovel(imovel) {
    try {
        if (!imovel || !imovel.id) {
            return 0;
        }

        const response = await fetch(`/api/imovelarrendado/getLucroById?imovelArrendadoId=${imovel.id}`);

        if (!response.ok) {
            console.error('Erro na API de lucro do imóvel:', response.status);
            return 0;
        }

        const data = await response.json();

        // Check if response contains error message
        if (typeof data === 'string' || data.error) {
            console.error('Erro na resposta da API:', data);
            return 0;
        }

        const profitValue = data.lucro || 0;
        console.log(`Lucro direto do imóvel ${imovel.id}: ${profitValue}`);
        return Math.round(profitValue * 100) / 100;

    } catch (error) {
        console.error('Erro ao calcular lucro direto do imóvel:', error);
        return 0;
    }
}

/**
 * State variables for all asset types
 */
window.allAssetData = {
    depositos: [],
    fundos: [],
    imoveis: [],
    ativos: [],
    carteiras: []
};

/**
 * Fetch all deposits for the user
 */
async function fetchDepositos() {
    try {
        const response = await fetch('/api/depositoprazo/getAllByUser', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        window.allAssetData.depositos = Array.isArray(data) ? data : [data];
        console.log('Depósitos carregados:', window.allAssetData.depositos);

        return window.allAssetData.depositos;
    } catch (error) {
        console.error('Erro ao carregar depósitos:', error);
        return [];
    }
}

/**
 * Fetch all investment funds for the user
 */
async function fetchFundos() {
    try {
        const response = await fetch('/api/fundoinvestimento/getAllByUser', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        window.allAssetData.fundos = Array.isArray(data) ? data : [data];
        console.log('Fundos carregados:', window.allAssetData.fundos);

        return window.allAssetData.fundos;
    } catch (error) {
        console.error('Erro ao carregar fundos:', error);
        return [];
    }
}

/**
 * Fetch all real estate properties for the user
 */
async function fetchImoveis() {
    try {
        const response = await fetch('/api/imovelarrendado/getAllByUser', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        window.allAssetData.imoveis = Array.isArray(data) ? data : [data];
        console.log('Imóveis carregados:', window.allAssetData.imoveis);

        return window.allAssetData.imoveis;
    } catch (error) {
        console.error('Erro ao carregar imóveis:', error);
        return [];
    }
}

/**
 * Fetch all asset-related data
 */
async function fetchAllAssetData() {
    try {
        const [depositos, fundos, imoveis] = await Promise.all([
            fetchDepositos(),
            fetchFundos(),
            fetchImoveis()
        ]);

        // Update global state
        window.allAssetData.depositos = depositos;
        window.allAssetData.fundos = fundos;
        window.allAssetData.imoveis = imoveis;

        console.log('All asset data loaded:', window.allAssetData);

        return {
            depositos,
            fundos,
            imoveis
        };
    } catch (error) {
        console.error('Erro ao carregar dados dos ativos:', error);
        return {
            depositos: [],
            fundos: [],
            imoveis: []
        };
    }
}

/**
 * Get detailed asset information with profit calculations
 * @param {Object} ativo - The basic asset data
 * @returns {Promise<Object>} - Enhanced asset data with profit information
 */
async function getDetailedAssetInfo(ativo) {
    let detailedInfo = {
        ...ativo,
        tipo: 'Desconhecido',
        lucro: 0,
        lucroTotal: 0,
        valorAtual: 0,
        valorAtualTotal: 0,
        valorInvestido: 0,
        valorInvestidoTotal: 0,
        detalhes: []
    };

    // Check for deposits (multiple possible)
    const depositos = window.allAssetData.depositos.filter(d =>
        d.ativoFinaceiroId === ativo.id ||
        d.ativoFinanceiroId === ativo.id ||
        d.ativoId === ativo.id
    );

    if (depositos.length > 0) {
        detailedInfo.tipo = 'Depósito a Prazo';
        detailedInfo.detalhes = depositos;

        let totalLucro = 0;
        let totalValorAtual = 0;
        let totalValorInvestido = 0;

        for (const deposito of depositos) {
            const lucro = await calcularLucroDeposito(deposito);
            const valorAtual = deposito.valorAtual || deposito.valorInvestido || 0;
            const valorInvestido = deposito.valorInvestido || 0;

            totalLucro += lucro;
            totalValorAtual += valorAtual;
            totalValorInvestido += valorInvestido;
        }

        detailedInfo.lucro = totalLucro;
        detailedInfo.lucroTotal = totalLucro;
        detailedInfo.valorAtual = totalValorAtual;
        detailedInfo.valorAtualTotal = totalValorAtual;
        detailedInfo.valorInvestido = totalValorInvestido;
        detailedInfo.valorInvestidoTotal = totalValorInvestido;

        return detailedInfo;
    }

    // Check for investment funds (multiple possible)
    const fundos = window.allAssetData.fundos.filter(f =>
        f.ativoFinaceiroId === ativo.id ||
        f.ativoFinanceiroId === ativo.id ||
        f.ativoId === ativo.id
    );

    if (fundos.length > 0) {
        detailedInfo.tipo = 'Fundo de Investimento';
        detailedInfo.detalhes = fundos;

        let totalLucro = 0;
        let totalValorAtual = 0;
        let totalValorInvestido = 0;

        for (const fundo of fundos) {
            const lucro = await calcularLucroFundoInvestimento(fundo);
            const valorInvestido = fundo.montanteInvestido || 0;

            totalLucro += lucro;
            totalValorAtual += valorInvestido; // Assuming current value same as invested for now
            totalValorInvestido += valorInvestido;
        }

        detailedInfo.lucro = totalLucro;
        detailedInfo.lucroTotal = totalLucro;
        detailedInfo.valorAtual = totalValorAtual;
        detailedInfo.valorAtualTotal = totalValorAtual;
        detailedInfo.valorInvestido = totalValorInvestido;
        detailedInfo.valorInvestidoTotal = totalValorInvestido;

        return detailedInfo;
    }

    // Check for real estate (multiple possible)
    const imoveis = window.allAssetData.imoveis.filter(i =>
        i.ativoFinaceiroId === ativo.id ||
        i.ativoFinanceiroId === ativo.id ||
        i.ativoId === ativo.id
    );

    if (imoveis.length > 0) {
        detailedInfo.tipo = 'Imóvel Arrendado';
        detailedInfo.detalhes = imoveis;

        let totalLucro = 0;
        let totalValorAtual = 0;
        let totalValorInvestido = 0;

        for (const imovel of imoveis) {
            const lucro = await calcularLucroImovel(imovel);
            const valorImovel = imovel.valorImovel || imovel.valorCompra || 0;

            totalLucro += lucro;
            totalValorAtual += valorImovel;
            totalValorInvestido += valorImovel;
        }

        detailedInfo.lucro = totalLucro;
        detailedInfo.lucroTotal = totalLucro;
        detailedInfo.valorAtual = totalValorAtual;
        detailedInfo.valorAtualTotal = totalValorAtual;
        detailedInfo.valorInvestido = totalValorInvestido;
        detailedInfo.valorInvestidoTotal = totalValorInvestido;

        return detailedInfo;
    }

    return detailedInfo;
}

/**
 * Calculate summary statistics for all assets
 * @returns {Promise<Object>} - Summary statistics
 */
async function calculateAssetSummary() {
    let totalInvestido = 0;
    let totalAtual = 0;
    let totalLucro = 0;
    let countDepositos = window.allAssetData.depositos.length;
    let countFundos = window.allAssetData.fundos.length;
    let countImoveis = window.allAssetData.imoveis.length;

    // Calculate from deposits
    for (const deposito of window.allAssetData.depositos) {
        totalInvestido += deposito.valorInvestido || 0;
        totalAtual += deposito.valorAtual || deposito.valorInvestido || 0;
        totalLucro += await calcularLucroDeposito(deposito);
    }

    // Calculate from funds
    for (const fundo of window.allAssetData.fundos) {
        totalInvestido += fundo.montanteInvestido || 0;
        totalAtual += fundo.montanteInvestido || 0; // Assuming current value for now
        totalLucro += await calcularLucroFundoInvestimento(fundo);
    }

    // Calculate from real estate
    for (const imovel of window.allAssetData.imoveis) {
        totalInvestido += imovel.valorImovel || 0;
        totalAtual += imovel.valorImovel || 0;
        totalLucro += await calcularLucroImovel(imovel);
    }

    return {
        totalInvestido,
        totalAtual,
        totalLucro,
        totalAssets: countDepositos + countFundos + countImoveis,
        breakdown: {
            depositos: countDepositos,
            fundos: countFundos,
            imoveis: countImoveis
        }
    };
}

/**
 * Calculate total current value for deposit investments using API
 * @param {Object} deposito - The deposit data
 * @returns {Promise<number>} - The calculated total current value (base + profit)
 */
async function calcularValorTotalDeposito(deposito) {
    try {
        if (!deposito || !deposito.id) {
            return deposito?.valorAtual || deposito?.valorInvestido || 0;
        }

        const response = await fetch(`/api/depositoprazo/getLucroById?depositoPrazoId=${deposito.id}`);

        if (!response.ok) {
            console.error('Erro na API de lucro do depósito:', response.status);
            return deposito.valorAtual || deposito.valorInvestido || 0;
        }

        const data = await response.json();

        // Check if response contains error message
        if (typeof data === 'string' || data.error) {
            console.error('Erro na resposta da API:', data);
            return deposito.valorAtual || deposito.valorInvestido || 0;
        }

        const totalValue = data.total || (data.base + data.lucro) || deposito.valorAtual || deposito.valorInvestido || 0;
        console.log(`Valor total do depósito ${deposito.id}: ${totalValue}`);
        return Math.round(totalValue * 100) / 100;

    } catch (error) {
        console.error('Erro ao calcular valor total do depósito:', error);
        return deposito?.valorAtual || deposito?.valorInvestido || 0;
    }
}

