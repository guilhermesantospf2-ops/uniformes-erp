/**
 * UNIFORMES ERP - INTELIGÊNCIA DE MERCADO TÊXTIL BRASIL
 * Benchmark nacional de preços e calculadora de viabilidade e margem
 */

window.MarketBenchmark = {
  // Base de Dados Nacional Consolidada de Confecções Têxteis (Brasil)
  tabelasReferencia: {
    "PROD-001": {
      nome: "Camisa Polo Tradicional (Piquet PA)",
      faixas: [
        { min: 10, max: 29, precoMinimo: 58.00, precoMedioBrasil: 65.00, precoMaximo: 75.00 },
        { min: 30, max: 99, precoMinimo: 46.00, precoMedioBrasil: 53.00, precoMaximo: 62.00 },
        { min: 100, max: 299, precoMinimo: 39.00, precoMedioBrasil: 45.00, precoMaximo: 52.00 },
        { min: 300, max: 99999, precoMinimo: 33.00, precoMedioBrasil: 38.50, precoMaximo: 44.00 }
      ]
    },
    "PROD-002": {
      nome: "Camiseta Básica Gola Careca (Meia Malha 30.1 Algodão)",
      faixas: [
        { min: 10, max: 29, precoMinimo: 36.00, precoMedioBrasil: 42.00, precoMaximo: 48.00 },
        { min: 30, max: 99, precoMinimo: 26.00, precoMedioBrasil: 31.00, precoMaximo: 37.00 },
        { min: 100, max: 299, precoMinimo: 21.00, precoMedioBrasil: 25.50, precoMaximo: 29.50 },
        { min: 300, max: 99999, precoMinimo: 17.50, precoMedioBrasil: 20.80, precoMaximo: 24.50 }
      ]
    },
    "PROD-003": {
      nome: "Camisa Operacional Manga Curta (Brim Pesado 100% Algodão)",
      faixas: [
        { min: 10, max: 29, precoMinimo: 72.00, precoMedioBrasil: 82.00, precoMaximo: 95.00 },
        { min: 30, max: 99, precoMinimo: 59.00, precoMedioBrasil: 67.00, precoMaximo: 76.00 },
        { min: 100, max: 299, precoMinimo: 49.00, precoMedioBrasil: 56.00, precoMaximo: 64.00 },
        { min: 300, max: 99999, precoMinimo: 43.00, precoMedioBrasil: 49.00, precoMaximo: 55.00 }
      ]
    },
    "PROD-004": {
      nome: "Camisa Esportiva Dry Fit (Poliéster Microfibra)",
      faixas: [
        { min: 10, max: 29, precoMinimo: 38.00, precoMedioBrasil: 46.00, precoMaximo: 55.00 },
        { min: 30, max: 99, precoMinimo: 28.00, precoMedioBrasil: 34.00, precoMaximo: 41.00 },
        { min: 100, max: 299, precoMinimo: 23.00, precoMedioBrasil: 28.00, precoMaximo: 33.00 },
        { min: 300, max: 99999, precoMinimo: 19.00, precoMedioBrasil: 23.50, precoMaximo: 27.00 }
      ]
    },
    "PROD-005": {
      nome: "Jaleco Hospitalar Manga Longa (Oxford)",
      faixas: [
        { min: 10, max: 29, precoMinimo: 85.00, precoMedioBrasil: 98.00, precoMaximo: 118.00 },
        { min: 30, max: 99, precoMinimo: 72.00, precoMedioBrasil: 84.00, precoMaximo: 98.00 },
        { min: 100, max: 99999, precoMinimo: 62.00, precoMedioBrasil: 72.00, precoMaximo: 84.00 }
      ]
    }
  },

  /**
   * Obtém a faixa de mercado nacional para o produto e quantidade informada
   */
  obterReferenciaMercado: function(produtoId, quantidade) {
    const tabela = this.tabelasReferencia[produtoId];
    if (!tabela) {
      // Fallback genérico caso produto não cadastrado
      return { precoMinimo: 35.00, precoMedioBrasil: 45.00, precoMaximo: 58.00 };
    }
    const faixa = tabela.faixas.find(f => quantidade >= f.min && quantidade <= f.max) || tabela.faixas[tabela.faixas.length - 1];
    return faixa;
  },

  /**
   * Calcula a viabilidade matemática de um orçamento têxtil
   * Retorna análise de margem, custo teto e diagnóstico se vale a pena pegar o trabalho
   */
  calcularViabilidadeOrcamento: function(dados) {
    const {
      produtoId,
      quantidade,
      custoTecidoKgOuMetro,
      consumoPorPeca,
      custoAviamentosTotal,
      custoPersonalizacaoUnitario, // Bordado / DTF / Silk
      custoMaoDeObraCostura,
      custoEmbalagemEtiqueta,
      aliquotaImpostoPercentual, // Ex: 6.5% Simples
      margemDesejadaPercentual,  // Ex: 35%
      precoVendaPretendido       // Se o cliente já tem um preço em mente
    } = dados;

    // 1. Custo Direto da Matéria-Prima
    const custoTecidoUnitario = custoTecidoKgOuMetro * consumoPorPeca;
    const custoDiretoInsumos = custoTecidoUnitario + custoAviamentosTotal + custoPersonalizacaoUnitario + custoEmbalagemEtiqueta;
    
    // 2. Custo Total de Produção por Peça (antes de impostos)
    const custoProducaoUnitario = custoDiretoInsumos + custoMaoDeObraCostura;

    // 3. Fator de Mark-up com Impostos e Margem
    // Preco = Custo / (1 - (Imposto% + Margem%) / 100)
    const taxaDeducoes = ((aliquotaImpostoPercentual || 6.5) + (margemDesejadaPercentual || 30.0)) / 100;
    const divisor = Math.max(0.1, 1 - taxaDeducoes);
    const precoSugeridoCalculado = custoProducaoUnitario / divisor;

    // 4. Benchmark de Mercado Nacional
    const mercado = this.obterReferenciaMercado(produtoId, quantidade);

    // 5. Preço Efetivo para Análise de Viabilidade
    const precoFinalVenda = precoVendaPretendido > 0 ? precoVendaPretendido : precoSugeridoCalculado;

    // 6. Deduções Reais sobre a Venda
    const valorImpostoUnitario = precoFinalVenda * ((aliquotaImpostoPercentual || 6.5) / 100);
    const lucroLiquidoUnitario = precoFinalVenda - custoProducaoUnitario - valorImpostoUnitario;
    const margemLiquidaReal = (lucroLiquidoUnitario / precoFinalVenda) * 100;

    // 7. Custo Teto que a Confecção PODE ter para vender na Média Brasil com 30% de margem
    const impostoMedioDecimal = (aliquotaImpostoPercentual || 6.5) / 100;
    const custoTetoParaMediaBrasil = mercado.precoMedioBrasil * (1 - impostoMedioDecimal - 0.30);

    // 8. Diagnóstico de Viabilidade do Negócio
    let statusViabilidade = "VIAVEL_EXCELENTE";
    let statusTexto = "VIÁVEL (Margem Excelente)";
    let classeCor = "status-green";
    let recomendacao = "";

    if (margemLiquidaReal >= 28) {
      statusViabilidade = "VIAVEL_EXCELENTE";
      statusTexto = "VIÁVEL (Margem Excelente)";
      classeCor = "status-green";
      recomendacao = "Negócio muito saudável. A confecção opera com folga financeira para cobrir custos fixos e gerar lucro real.";
    } else if (margemLiquidaReal >= 18) {
      statusViabilidade = "VIAVEL_COMPETITIVO";
      statusTexto = "VIÁVEL (Competitivo)";
      classeCor = "status-green";
      recomendacao = "Margem aceitável para fechar grandes lotes. Garanta sinal de 50% e conferência rigorosa de insumos.";
    } else if (margemLiquidaReal >= 10) {
      statusViabilidade = "ATENCAO_ESTREITA";
      statusTexto = "ATENÇÃO (Margem Estreita)";
      classeCor = "status-red";
      recomendacao = "Margem perigosa. Qualquer retrabalho, perda de tecido ou atraso na costura eliminará todo o lucro deste pedido.";
    } else {
      statusViabilidade = "PREJUIZO_INVIAVEL";
      statusTexto = "NÃO VALE A PENA (Risco de Prejuízo)";
      classeCor = "status-red";
      recomendacao = "Atenção crítica: seu custo de produção está muito alto para este preço. Você estará trabalhando de graça ou pagando para produzir.";
    }

    return {
      custoTecidoUnitario,
      custoProducaoUnitario,
      valorImpostoUnitario,
      lucroLiquidoUnitario,
      margemLiquidaReal,
      precoSugeridoCalculado,
      precoFinalVenda,
      mercado,
      custoTetoParaMediaBrasil,
      statusViabilidade,
      statusTexto,
      classeCor,
      recomendacao,
      totaisPedido: {
        faturamentoTotal: precoFinalVenda * quantidade,
        custoTotalProducao: custoProducaoUnitario * quantidade,
        impostosTotal: valorImpostoUnitario * quantidade,
        lucroLiquidoTotal: lucroLiquidoUnitario * quantidade
      }
    };
  }
};
