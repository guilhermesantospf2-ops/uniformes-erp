/**
 * UNIFORMES ERP - INTELIGÊNCIA DE MERCADO TÊXTIL BRASIL
 * Dados de Preços Praticados no Brasil por Modelo e Faixa de Quantidade
 * Base consolidada dos maiores polos confeccionistas (Americana/SP, Brusque/SC, Maringá/PR, Fortaleza/CE)
 */

window.MarketBenchmark = {
  // Base de Dados Nacional Consolidada de Confecções Têxteis (Brasil)
  tabelasReferencia: {
    // 1. Polos
    "PROD-001": {
      nome: "Camisa Polo Tradicional Piquet",
      faixas: [
        { min: 10, max: 29, precoMinimo: 56.00, precoMedioBrasil: 65.00, precoMaximo: 78.00 },
        { min: 30, max: 49, precoMinimo: 48.00, precoMedioBrasil: 55.00, precoMaximo: 65.00 },
        { min: 50, max: 99, precoMinimo: 42.00, precoMedioBrasil: 48.50, precoMaximo: 58.00 },
        { min: 100, max: 299, precoMinimo: 36.50, precoMedioBrasil: 42.00, precoMaximo: 49.00 },
        { min: 300, max: 99999, precoMinimo: 31.00, precoMedioBrasil: 36.50, precoMaximo: 43.00 }
      ]
    },
    "PROD-002": {
      nome: "Camisa Polo Friso Duplo Gola Especial",
      faixas: [
        { min: 10, max: 29, precoMinimo: 62.00, precoMedioBrasil: 72.00, precoMaximo: 85.00 },
        { min: 30, max: 49, precoMinimo: 54.00, precoMedioBrasil: 62.00, precoMaximo: 72.00 },
        { min: 50, max: 99, precoMinimo: 47.00, precoMedioBrasil: 54.00, precoMaximo: 64.00 },
        { min: 100, max: 299, precoMinimo: 41.00, precoMedioBrasil: 47.00, precoMaximo: 55.00 },
        { min: 300, max: 99999, precoMinimo: 35.00, precoMedioBrasil: 41.00, precoMaximo: 48.00 }
      ]
    },
    "PROD-003": {
      nome: "Camisa Polo Dry Fit Confort",
      faixas: [
        { min: 10, max: 29, precoMinimo: 52.00, precoMedioBrasil: 60.00, precoMaximo: 72.00 },
        { min: 30, max: 49, precoMinimo: 44.00, precoMedioBrasil: 51.00, precoMaximo: 60.00 },
        { min: 50, max: 99, precoMinimo: 38.00, precoMedioBrasil: 44.50, precoMaximo: 52.00 },
        { min: 100, max: 299, precoMinimo: 33.00, precoMedioBrasil: 38.00, precoMaximo: 45.00 },
        { min: 300, max: 99999, precoMinimo: 28.00, precoMedioBrasil: 33.00, precoMaximo: 39.00 }
      ]
    },
    // 2. Camisetas
    "PROD-004": {
      nome: "Camiseta Básica Gola Careca Algodão",
      faixas: [
        { min: 10, max: 29, precoMinimo: 35.00, precoMedioBrasil: 42.00, precoMaximo: 49.00 },
        { min: 30, max: 49, precoMinimo: 28.00, precoMedioBrasil: 34.00, precoMaximo: 40.00 },
        { min: 50, max: 99, precoMinimo: 23.00, precoMedioBrasil: 28.50, precoMaximo: 35.00 },
        { min: 100, max: 299, precoMinimo: 19.50, precoMedioBrasil: 24.00, precoMaximo: 29.00 },
        { min: 300, max: 99999, precoMinimo: 16.80, precoMedioBrasil: 20.50, precoMaximo: 24.50 }
      ]
    },
    "PROD-005": {
      nome: "Camiseta Gola V Poliviscose (Anti-Pilling)",
      faixas: [
        { min: 10, max: 29, precoMinimo: 37.00, precoMedioBrasil: 44.00, precoMaximo: 52.00 },
        { min: 30, max: 49, precoMinimo: 30.00, precoMedioBrasil: 36.00, precoMaximo: 43.00 },
        { min: 50, max: 99, precoMinimo: 25.00, precoMedioBrasil: 30.50, precoMaximo: 37.00 },
        { min: 100, max: 299, precoMinimo: 21.00, precoMedioBrasil: 26.00, precoMaximo: 31.00 },
        { min: 300, max: 99999, precoMinimo: 18.00, precoMedioBrasil: 22.00, precoMaximo: 26.00 }
      ]
    },
    "PROD-006": {
      nome: "Camiseta Manga Longa Punho Canelado",
      faixas: [
        { min: 10, max: 29, precoMinimo: 46.00, precoMedioBrasil: 54.00, precoMaximo: 64.00 },
        { min: 30, max: 49, precoMinimo: 38.00, precoMedioBrasil: 45.00, precoMaximo: 53.00 },
        { min: 50, max: 99, precoMinimo: 32.00, precoMedioBrasil: 38.00, precoMaximo: 45.00 },
        { min: 100, max: 299, precoMinimo: 27.00, precoMedioBrasil: 32.50, precoMaximo: 39.00 },
        { min: 300, max: 99999, precoMinimo: 23.50, precoMedioBrasil: 28.00, precoMaximo: 34.00 }
      ]
    },
    // 3. Linha Pesada & Operacional
    "PROD-007": {
      nome: "Camisa Operacional Brim Leve com Bolso",
      faixas: [
        { min: 10, max: 29, precoMinimo: 68.00, precoMedioBrasil: 78.00, precoMaximo: 90.00 },
        { min: 30, max: 49, precoMinimo: 58.00, precoMedioBrasil: 68.00, precoMaximo: 78.00 },
        { min: 50, max: 99, precoMinimo: 50.00, precoMedioBrasil: 59.00, precoMaximo: 69.00 },
        { min: 100, max: 299, precoMinimo: 44.00, precoMedioBrasil: 51.00, precoMaximo: 60.00 },
        { min: 300, max: 99999, precoMinimo: 38.00, precoMedioBrasil: 45.00, precoMaximo: 52.00 }
      ]
    },
    "PROD-008": {
      nome: "Camisa Operacional Brim c/ Faixa Refletiva",
      faixas: [
        { min: 10, max: 29, precoMinimo: 79.00, precoMedioBrasil: 89.00, precoMaximo: 105.00 },
        { min: 30, max: 49, precoMinimo: 68.00, precoMedioBrasil: 78.00, precoMaximo: 92.00 },
        { min: 50, max: 99, precoMinimo: 59.00, precoMedioBrasil: 68.00, precoMaximo: 80.00 },
        { min: 100, max: 299, precoMinimo: 51.00, precoMedioBrasil: 59.50, precoMaximo: 70.00 },
        { min: 300, max: 99999, precoMinimo: 45.00, precoMedioBrasil: 52.00, precoMaximo: 62.00 }
      ]
    },
    "PROD-009": {
      nome: "Calça Operacional Meio Elástico Brim",
      faixas: [
        { min: 10, max: 29, precoMinimo: 68.00, precoMedioBrasil: 79.00, precoMaximo: 92.00 },
        { min: 30, max: 49, precoMinimo: 58.00, precoMedioBrasil: 68.00, precoMaximo: 79.00 },
        { min: 50, max: 99, precoMinimo: 49.00, precoMedioBrasil: 58.00, precoMaximo: 69.00 },
        { min: 100, max: 299, precoMinimo: 42.00, precoMedioBrasil: 49.00, precoMaximo: 58.00 },
        { min: 300, max: 99999, precoMinimo: 36.00, precoMedioBrasil: 43.00, precoMaximo: 51.00 }
      ]
    },
    "PROD-010": {
      nome: "Calça Cargo 6 Bolsos Reforçada",
      faixas: [
        { min: 10, max: 49, precoMinimo: 85.00, precoMedioBrasil: 98.00, precoMaximo: 120.00 },
        { min: 50, max: 99, precoMinimo: 72.00, precoMedioBrasil: 85.00, precoMaximo: 99.00 },
        { min: 100, max: 99999, precoMinimo: 62.00, precoMedioBrasil: 74.00, precoMaximo: 86.00 }
      ]
    },
    "PROD-011": {
      nome: "Macacão Operacional Mecânico",
      faixas: [
        { min: 10, max: 49, precoMinimo: 135.00, precoMedioBrasil: 158.00, precoMaximo: 195.00 },
        { min: 50, max: 99, precoMinimo: 118.00, precoMedioBrasil: 136.00, precoMaximo: 165.00 },
        { min: 100, max: 99999, precoMinimo: 99.00, precoMedioBrasil: 118.00, precoMaximo: 142.00 }
      ]
    },
    // 4. Linha Saúde & Laboratorial
    "PROD-012": {
      nome: "Jaleco Hospitalar Manga Longa Oxford",
      faixas: [
        { min: 10, max: 29, precoMinimo: 85.00, precoMedioBrasil: 98.00, precoMaximo: 118.00 },
        { min: 30, max: 49, precoMinimo: 74.00, precoMedioBrasil: 86.00, precoMaximo: 102.00 },
        { min: 50, max: 99, precoMinimo: 65.00, precoMedioBrasil: 76.00, precoMaximo: 90.00 },
        { min: 100, max: 99999, precoMinimo: 56.00, precoMedioBrasil: 66.00, precoMaximo: 78.00 }
      ]
    },
    "PROD-013": {
      nome: "Jaleco Gabardine Premium Gola Padre",
      faixas: [
        { min: 10, max: 49, precoMinimo: 115.00, precoMedioBrasil: 138.00, precoMaximo: 175.00 },
        { min: 50, max: 99, precoMinimo: 98.00, precoMedioBrasil: 118.00, precoMaximo: 145.00 },
        { min: 100, max: 99999, precoMinimo: 84.00, precoMedioBrasil: 102.00, precoMaximo: 125.00 }
      ]
    },
    "PROD-014": {
      nome: "Conjunto Scrub / Pijama Cirúrgico",
      faixas: [
        { min: 10, max: 49, precoMinimo: 110.00, precoMedioBrasil: 135.00, precoMaximo: 165.00 },
        { min: 50, max: 99, precoMinimo: 95.00, precoMedioBrasil: 115.00, precoMaximo: 140.00 },
        { min: 100, max: 99999, precoMinimo: 82.00, precoMedioBrasil: 98.00, precoMaximo: 120.00 }
      ]
    },
    // 5. Linha Esportiva & Escolar
    "PROD-015": {
      nome: "Camisa Esportiva Dry Fit Sublimada",
      faixas: [
        { min: 10, max: 29, precoMinimo: 42.00, precoMedioBrasil: 49.00, precoMaximo: 62.00 },
        { min: 30, max: 49, precoMinimo: 34.00, precoMedioBrasil: 39.50, precoMaximo: 48.00 },
        { min: 50, max: 99, precoMinimo: 28.00, precoMedioBrasil: 33.50, precoMaximo: 41.00 },
        { min: 100, max: 299, precoMinimo: 23.50, precoMedioBrasil: 27.50, precoMaximo: 34.00 },
        { min: 300, max: 99999, precoMinimo: 19.50, precoMedioBrasil: 23.00, precoMaximo: 28.00 }
      ]
    },
    "PROD-016": {
      nome: "Bermuda Tactel / Helanca Escolar",
      faixas: [
        { min: 10, max: 49, precoMinimo: 36.00, precoMedioBrasil: 44.00, precoMaximo: 54.00 },
        { min: 50, max: 99, precoMinimo: 29.00, precoMedioBrasil: 36.00, precoMaximo: 44.00 },
        { min: 100, max: 99999, precoMinimo: 24.00, precoMedioBrasil: 29.50, precoMaximo: 36.00 }
      ]
    },
    "PROD-017": {
      nome: "Moletom Canguru com Capuz 3 Cabos",
      faixas: [
        { min: 10, max: 49, precoMinimo: 105.00, precoMedioBrasil: 125.00, precoMaximo: 155.00 },
        { min: 50, max: 99, precoMinimo: 89.00, precoMedioBrasil: 108.00, precoMaximo: 132.00 },
        { min: 100, max: 99999, precoMinimo: 78.00, precoMedioBrasil: 94.00, precoMaximo: 115.00 }
      ]
    },
    "PROD-018": {
      nome: "Avental de Cozinha / Barbeiro com Bolso",
      faixas: [
        { min: 10, max: 49, precoMinimo: 38.00, precoMedioBrasil: 46.00, precoMaximo: 56.00 },
        { min: 50, max: 99, precoMinimo: 31.00, precoMedioBrasil: 37.00, precoMaximo: 46.00 },
        { min: 100, max: 99999, precoMinimo: 25.00, precoMedioBrasil: 31.00, precoMaximo: 38.00 }
      ]
    },
    "PROD-019": {
      nome: "Boné 6 Gomos Bordado Brim/Microfibra",
      faixas: [
        { min: 30, max: 49, precoMinimo: 26.00, precoMedioBrasil: 32.00, precoMaximo: 40.00 },
        { min: 50, max: 99, precoMinimo: 21.00, precoMedioBrasil: 25.50, precoMaximo: 32.00 },
        { min: 100, max: 99999, precoMinimo: 16.50, precoMedioBrasil: 20.00, precoMaximo: 26.00 }
      ]
    },
    "PROD-020": {
      nome: "Colete Refletivo Operacional Fechamento Zíper",
      faixas: [
        { min: 10, max: 49, precoMinimo: 48.00, precoMedioBrasil: 58.00, precoMaximo: 72.00 },
        { min: 50, max: 99, precoMinimo: 39.00, precoMedioBrasil: 47.00, precoMaximo: 58.00 },
        { min: 100, max: 99999, precoMinimo: 32.00, precoMedioBrasil: 39.00, precoMaximo: 48.00 }
      ]
    },
    "PROD-021": {
      nome: "Moletom Careca Fechado Tradicional",
      faixas: [
        { min: 10, max: 29, precoMinimo: 75.00, precoMedioBrasil: 88.00, precoMaximo: 105.00 },
        { min: 30, max: 49, precoMinimo: 64.00, precoMedioBrasil: 76.00, precoMaximo: 90.00 },
        { min: 50, max: 99, precoMinimo: 56.00, precoMedioBrasil: 66.00, precoMaximo: 78.00 },
        { min: 100, max: 99999, precoMinimo: 48.00, precoMedioBrasil: 58.00, precoMaximo: 68.00 }
      ]
    },
    "PROD-022": {
      nome: "Avental de Cozinha / Barbeiro com Bolso",
      faixas: [
        { min: 10, max: 29, precoMinimo: 34.00, precoMedioBrasil: 42.00, precoMaximo: 52.00 },
        { min: 30, max: 49, precoMinimo: 28.00, precoMedioBrasil: 35.00, precoMaximo: 44.00 },
        { min: 50, max: 99, precoMinimo: 24.00, precoMedioBrasil: 30.00, precoMaximo: 38.00 },
        { min: 100, max: 99999, precoMinimo: 20.00, precoMedioBrasil: 25.50, precoMaximo: 32.00 }
      ]
    },
    "PROD-023": {
      nome: "Dolmã de Chef Gastronomia c/ Botão de Pressão",
      faixas: [
        { min: 10, max: 29, precoMinimo: 110.00, precoMedioBrasil: 135.00, precoMaximo: 165.00 },
        { min: 30, max: 49, precoMinimo: 95.00, precoMedioBrasil: 118.00, precoMaximo: 140.00 },
        { min: 50, max: 99, precoMinimo: 84.00, precoMedioBrasil: 104.00, precoMaximo: 125.00 },
        { min: 100, max: 99999, precoMinimo: 74.00, precoMedioBrasil: 92.00, precoMaximo: 110.00 }
      ]
    },
    "PROD-024": {
      nome: "Jaqueta Corta-Vento Repelente à Água",
      faixas: [
        { min: 10, max: 29, precoMinimo: 125.00, precoMedioBrasil: 148.00, precoMaximo: 180.00 },
        { min: 30, max: 49, precoMinimo: 108.00, precoMedioBrasil: 128.00, precoMaximo: 155.00 },
        { min: 50, max: 99, precoMinimo: 95.00, precoMedioBrasil: 112.00, precoMaximo: 135.00 },
        { min: 100, max: 99999, precoMinimo: 82.00, precoMedioBrasil: 98.00, precoMaximo: 118.00 }
      ]
    },
    "PROD-025": {
      nome: "Camisa Térmica Segunda Pele UV50+",
      faixas: [
        { min: 10, max: 29, precoMinimo: 52.00, precoMedioBrasil: 62.00, precoMaximo: 76.00 },
        { min: 30, max: 49, precoMinimo: 44.00, precoMedioBrasil: 53.00, precoMaximo: 64.00 },
        { min: 50, max: 99, precoMinimo: 38.00, precoMedioBrasil: 46.00, precoMaximo: 55.00 },
        { min: 100, max: 99999, precoMinimo: 32.00, precoMedioBrasil: 39.50, precoMaximo: 48.00 }
      ]
    },
    "PROD-028": {
      nome: "Bermuda Operacional Cargo Sarja",
      faixas: [
        { min: 10, max: 29, precoMinimo: 58.00, precoMedioBrasil: 68.00, precoMaximo: 82.00 },
        { min: 30, max: 49, precoMinimo: 49.00, precoMedioBrasil: 59.00, precoMaximo: 70.00 },
        { min: 50, max: 99, precoMinimo: 42.00, precoMedioBrasil: 51.00, precoMaximo: 62.00 },
        { min: 100, max: 99999, precoMinimo: 36.00, precoMedioBrasil: 44.00, precoMaximo: 53.00 }
      ]
    }
  },

  /**
   * Obtém a faixa de mercado nacional para o produto e quantidade informada
   */
  obterReferenciaMercado: function(produtoId, quantidade) {
    const tabela = this.tabelasReferencia[produtoId];
    if (!tabela) {
      // Se for produto customizado cadastrado na hora
      return { precoMinimo: 45.00, precoMedioBrasil: 56.00, precoMaximo: 70.00 };
    }
    const faixa = tabela.faixas.find(f => quantidade >= f.min && quantidade <= f.max) || tabela.faixas[tabela.faixas.length - 1];
    return faixa;
  },

  /**
   * Calcula a viabilidade matemática de um orçamento têxtil
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
      aliquotaImpostoPercentual,
      margemDesejadaPercentual,
      precoVendaPretendido
    } = dados;

    const custoTecidoUnitario = (custoTecidoKgOuMetro || 0) * (consumoPorPeca || 0.28);
    const custoDiretoInsumos = custoTecidoUnitario + (custoAviamentosTotal || 0) + (custoPersonalizacaoUnitario || 0) + (custoEmbalagemEtiqueta || 1.50);
    const custoProducaoUnitario = custoDiretoInsumos + (custoMaoDeObraCostura || 7.50);

    const taxaDeducoes = ((aliquotaImpostoPercentual || 6.5) + (margemDesejadaPercentual || 30.0)) / 100;
    const divisor = Math.max(0.1, 1 - taxaDeducoes);
    const precoSugeridoCalculado = custoProducaoUnitario / divisor;

    const mercado = this.obterReferenciaMercado(produtoId, quantidade);
    const precoFinalVenda = precoVendaPretendido > 0 ? precoVendaPretendido : precoSugeridoCalculado;

    const valorImpostoUnitario = precoFinalVenda * ((aliquotaImpostoPercentual || 6.5) / 100);
    const lucroLiquidoUnitario = precoFinalVenda - custoProducaoUnitario - valorImpostoUnitario;
    const margemLiquidaReal = precoFinalVenda > 0 ? (lucroLiquidoUnitario / precoFinalVenda) * 100 : 0;

    const impostoMedioDecimal = (aliquotaImpostoPercentual || 6.5) / 100;
    const custoTetoParaMediaBrasil = mercado.precoMedioBrasil * (1 - impostoMedioDecimal - 0.30);

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
