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
 * Calculate profit percentage for deposit investments
 * @param {Object} deposito - The deposit data
 * @returns {number} - The calculated profit percentage
 */
function calcularPorcentagemLucroDeposito(deposito) {
    try {
        if (!deposito || !deposito.valorInvestido || !deposito.dataCriacao) {
            return 0;
        }

        // Calculate estimated maturity value with compound interest
        const dataCriacao = new Date(deposito.dataCriacao);
        const monthsElapsed = Math.max(0, Math.floor((new Date() - dataCriacao) / (1000 * 60 * 60 * 24 * 30.44)));
        const monthlyRate = (deposito.taxaJuroAnual || 0) / 100 / 12;
        const valorAtual = deposito.valorInvestido * Math.pow(1 + monthlyRate, monthsElapsed);

        if (deposito.valorInvestido <= 0) return 0;

        // Calculate profit percentage: ((current - initial) / initial) * 100
        const profitPercentage = ((valorAtual - deposito.valorInvestido) / deposito.valorInvestido) * 100;

        console.log(`Porcentagem de lucro do depósito ${deposito.ativoFinaceiroId}: ${profitPercentage}%`);
        return Math.max(0, Math.round(profitPercentage * 100) / 100); // Round to 2 decimal places
    } catch (error) {
        console.error('Erro ao calcular porcentagem de lucro do depósito:', error);
        return 0;
    }
}

/**
 * Calculate direct profit value for deposit investments
 * @param {Object} deposito - The deposit data
 * @returns {number} - The calculated profit value
 */
function calcularLucroDeposito(deposito) {
    try {
        if (!deposito || !deposito.valorInvestido || !deposito.dataCriacao) {
            return 0;
        }

        // Get profit percentage
        const profitPercentage = calcularPorcentagemLucroDeposito(deposito);

        // Calculate direct profit value: (percentage / 100) * invested amount
        const profitValue = (profitPercentage / 100) * deposito.valorInvestido;

        console.log(`Lucro direto do depósito ${deposito.ativoFinaceiroId}: ${profitValue}`);
        return Math.round(profitValue * 100) / 100;

    } catch (error) {
        console.error('Erro ao calcular lucro direto do depósito:', error);
        return 0;
    }
}

/**
 * Calculate profit percentage for investment funds
 * @param {Object} fundo - The fund data
 * @returns {number} - The calculated profit percentage    
 */
async function calcularPorcentagemLucroFundoInvestimento(fundo) {
    try {
        if (!fundo.ativoSigla || !fundo.dataCriacao || !fundo.montanteInvestido) {
            return 0;
        }

        // Get yesterday's date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Get creation date
        const creationDate = new Date(fundo.dataCriacao).toISOString().split('T')[0];

        let sigla = fundo.ativoSigla;
        let urlSafeSigla = encodeURIComponent(sigla);

        // Fetch current price (yesterday's data)
        const currentResponse = await fetch(`/api/candle/time/${yesterdayStr}/${urlSafeSigla}/1day`);
        if (!currentResponse.ok) {
            console.error('Failed to fetch current price');
            return 0;
        }
        const currentData = await currentResponse.json();

        // Fetch creation date price
        const creationResponse = await fetch(`/api/candle/time/${creationDate}/${urlSafeSigla}/1day`);
        if (!creationResponse.ok) {
            console.error('Failed to fetch creation date price');
            return 0;
        }
        const creationData = await creationResponse.json();

        // Get the close price from current data
        const currentPrice = Array.isArray(currentData) && currentData.length > 0
            ? currentData[currentData.length - 1].close
            : currentData.close;

        // Get creation date close price
        const creationPrice = Array.isArray(creationData) && creationData.length > 0
            ? creationData[0].close
            : creationData.close;

        if (!currentPrice || !creationPrice || creationPrice <= 0) {
            return 0;
        }

        // Calculate profit percentage: ((current - creation) / creation) * 100
        const profitPercentage = ((currentPrice - creationPrice) / creationPrice) * 100;

        // Return the profit percentage, rounded to 2 decimal places
        console.log(`Porcentagem de lucro do fundo ${sigla}: ${profitPercentage}%`);
        return Math.round(profitPercentage * 100) / 100;

    } catch (error) {
        console.error('Erro ao calcular porcentagem de lucro do fundo:', error);
        return 0;
    }
}

/**
 * Calculate direct profit value for investment funds
 * @param {Object} fundo - The fund data
 * @returns {number} - The calculated direct profit value    
 */
async function calcularLucroFundoInvestimento(fundo) {
    try {
        if (!fundo.ativoSigla || !fundo.dataCriacao || !fundo.montanteInvestido) {
            return 0;
        }

        // Get profit percentage
        const profitPercentage = await calcularPorcentagemLucroFundoInvestimento(fundo);

        // Calculate direct profit value: (percentage / 100) * invested amount
        const profitValue = (profitPercentage / 100) * fundo.montanteInvestido;

        console.log(`Lucro direto do fundo ${fundo.ativoSigla}: ${profitValue}`);
        return Math.round(profitValue * 100) / 100;

    } catch (error) {
        console.error('Erro ao calcular lucro direto do fundo:', error);
        return 0;
    }
}

/**
 * Calculate profit percentage for real estate properties
 * @param {Object} imovel - The property data
 * @returns {number} - The calculated profit percentage
 */
function calcularPorcentagemLucroImovel(imovel) {
    try {
        if (!imovel || !imovel.valorCompra || !imovel.dataCriacao) {
            return 0;
        }

        // Calculate months since creation
        const dataCriacao = new Date(imovel.dataCriacao);
        const monthsElapsed = Math.max(0, Math.floor((new Date() - dataCriacao) / (1000 * 60 * 60 * 24 * 30.44)));

        // Calculate rental income over time
        const rendaMensal = imovel.rendaMensal || 0;
        const totalRenda = rendaMensal * monthsElapsed;

        // Calculate property appreciation (assuming 3% annual appreciation rate if not provided)
        const taxaApreciacao = (imovel.taxaApreciacaoAnual || 3) / 100 / 12;
        const valorAtual = imovel.valorCompra * Math.pow(1 + taxaApreciacao, monthsElapsed);
        const appreciation = valorAtual - imovel.valorCompra;

        const totalProfit = totalRenda + appreciation;

        if (imovel.valorCompra <= 0) return 0;

        // Calculate profit percentage: ((total profit) / initial investment) * 100
        const profitPercentage = (totalProfit / imovel.valorCompra) * 100;

        console.log(`Porcentagem de lucro do imóvel ${imovel.ativoFinaceiroId}: ${profitPercentage}%`);
        return Math.max(0, Math.round(profitPercentage * 100) / 100); // Round to 2 decimal places
    } catch (error) {
        console.error('Erro ao calcular porcentagem de lucro do imóvel:', error);
        return 0;
    }
}

/**
 * Calculate direct profit value for real estate properties
 * @param {Object} imovel - The property data
 * @returns {number} - The calculated profit value
 */
function calcularLucroImovel(imovel) {
    try {
        if (!imovel || !imovel.valorCompra || !imovel.dataCriacao) {
            return 0;
        }

        // Get profit percentage
        const profitPercentage = calcularPorcentagemLucroImovel(imovel);

        // Calculate direct profit value: (percentage / 100) * invested amount
        const profitValue = (profitPercentage / 100) * imovel.valorCompra;

        console.log(`Lucro direto do imóvel ${imovel.ativoFinaceiroId}: ${profitValue}`);
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
 * @returns {Object} - Enhanced asset data with profit information
 */
function getDetailedAssetInfo(ativo) {
    let detailedInfo = {
        ...ativo,
        tipo: 'Desconhecido',
        lucro: 0,
        valorAtual: 0,
        detalhes: null
    };

    // Check if it's a deposit
    const deposito = window.allAssetData.depositos.find(d => d.ativoFinaceiroId === ativo.id);
    if (deposito) {
        detailedInfo.tipo = 'Depósito a Prazo';
        detailedInfo.lucro = calcularLucroDeposito(deposito);
        detailedInfo.valorAtual = deposito.valorAtual || deposito.valorInvestido;
        detailedInfo.detalhes = deposito;
        return detailedInfo;
    }

    // Check if it's an investment fund
    const fundo = window.allAssetData.fundos.find(f => f.ativoFinaceiroId === ativo.id);
    if (fundo) {
        detailedInfo.tipo = 'Fundo de Investimento';
        detailedInfo.lucro = calcularLucroFundoInvestimento(fundo);
        detailedInfo.valorAtual = fundo.montanteInvestido; // Assuming this is current value
        detailedInfo.detalhes = fundo;
        return detailedInfo;
    }

    // Check if it's real estate
    const imovel = window.allAssetData.imoveis.find(i => i.ativoFinaceiroId === ativo.id);
    if (imovel) {
        detailedInfo.tipo = 'Imóvel Arrendado';
        detailedInfo.lucro = calcularLucroImovel(imovel);
        detailedInfo.valorAtual = imovel.valorImovel;
        detailedInfo.detalhes = imovel;
        return detailedInfo;
    }

    return detailedInfo;
}

/**
 * Calculate summary statistics for all assets
 */
function calculateAssetSummary() {
    let totalInvestido = 0;
    let totalAtual = 0;
    let totalLucro = 0;
    let countDepositos = window.allAssetData.depositos.length;
    let countFundos = window.allAssetData.fundos.length;
    let countImoveis = window.allAssetData.imoveis.length;

    // Calculate from deposits
    window.allAssetData.depositos.forEach(deposito => {
        totalInvestido += deposito.valorInvestido || 0;
        totalAtual += deposito.valorAtual || deposito.valorInvestido || 0;
        totalLucro += calcularLucroDeposito(deposito);
    });

    // Calculate from funds
    window.allAssetData.fundos.forEach(fundo => {
        totalInvestido += fundo.montanteInvestido || 0;
        totalAtual += fundo.montanteInvestido || 0; // Assuming current value for now
        totalLucro += calcularLucroFundoInvestimento(fundo);
    });

    // Calculate from real estate
    window.allAssetData.imoveis.forEach(imovel => {
        totalInvestido += imovel.valorImovel || 0;
        totalAtual += imovel.valorImovel || 0;
        totalLucro += calcularLucroImovel(imovel);
    });

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

