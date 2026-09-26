/**
 * UNIFORMES ERP - BANCO DE DADOS INICIAL / MOCK DATA
 * Estrutura profissional para indústria de confecção têxtil e uniformes
 */

window.ERP_INITIAL_DATA = {
  // Configurações da Empresa
  empresa: {
    razaoSocial: "TexPro Uniformes Profissionais Ltda",
    nomeFantasia: "TexPro Indústria Têxtil",
    cnpj: "34.582.910/0001-44",
    ie: "109.824.712.110",
    telefone: "(11) 98765-4321",
    email: "comercial@texprouniformes.com.br",
    cidade: "Americana",
    uf: "SP",
    regimeTributario: "Simples Nacional",
    aliquotaImpostoPadrao: 6.5
  },

  // Catálogo de Modelagens e Produtos Base
  produtosBase: [
    {
      id: "PROD-001",
      codigo: "POL-01",
      nome: "Camisa Polo Tradicional",
      categoria: "Linha Corporativa",
      tipoMalhaPadrao: "Piquet PA (50% Algodão / 50% Poliéster)",
      consumoMalhaKgPorPeca: 0.28,
      custoMaoDeObraBase: 7.50,
      aviamentosPadrao: [
        { nome: "Gola Polo Retilínea", qtd: 1, custoUnitario: 3.20 },
        { nome: "Punho de Manga", qtd: 2, custoUnitario: 1.10 },
        { nome: "Botão 2 Furos com Gravação", qtd: 3, custoUnitario: 0.15 },
        { nome: "Etiqueta Tecida", qtd: 1, custoUnitario: 0.40 }
      ]
    },
    {
      id: "PROD-002",
      codigo: "CAM-01",
      nome: "Camiseta Básica Gola Careca",
      categoria: "Linha Promocional e Eventos",
      tipoMalhaPadrao: "Meia Malha 30.1 Penteada 100% Algodão",
      consumoMalhaKgPorPeca: 0.22,
      custoMaoDeObraBase: 5.00,
      aviamentosPadrao: [
        { nome: "Ribana Gola Careca", qtd: 1, custoUnitario: 1.20 },
        { nome: "Etiqueta Termocolante", qtd: 1, custoUnitario: 0.35 }
      ]
    },
    {
      id: "PROD-003",
      codigo: "OP-01",
      nome: "Camisa Operacional Manga Curta",
      categoria: "Linha Pesada e Operacional",
      tipoMalhaPadrao: "Tecido Brim Pesado 100% Algodão 260g",
      consumoMalhaKgPorPeca: 1.35, // metros
      custoMaoDeObraBase: 12.00,
      aviamentosPadrao: [
        { nome: "Botão Reforçado 4 Furos", qtd: 6, custoUnitario: 0.25 },
        { nome: "Entretela Gola", qtd: 1, custoUnitario: 0.80 },
        { nome: "Faixa Refletiva 5cm (metro)", qtd: 0.6, custoUnitario: 4.50 }
      ]
    },
    {
      id: "PROD-004",
      codigo: "DRY-01",
      nome: "Camisa Esportiva Dry Fit",
      categoria: "Linha Esportiva e Atléticas",
      tipoMalhaPadrao: "Malha Dry Fit Poliéster Microfibra 130g",
      consumoMalhaKgPorPeca: 0.19,
      custoMaoDeObraBase: 5.50,
      aviamentosPadrao: [
        { nome: "Viés de Acabamento Gola", qtd: 1, custoUnitario: 0.90 },
        { nome: "Etiqueta Transfer Interna", qtd: 1, custoUnitario: 0.30 }
      ]
    },
    {
      id: "PROD-005",
      codigo: "JAL-01",
      nome: "Jaleco Hospitalar Manga Longa",
      categoria: "Linha Saúde e Laboratorial",
      tipoMalhaPadrao: "Tecido Oxford 100% Poliéster",
      consumoMalhaKgPorPeca: 1.80, // metros
      custoMaoDeObraBase: 14.00,
      aviamentosPadrao: [
        { nome: "Botão Caseado Grande", qtd: 5, custoUnitario: 0.35 },
        { nome: "Punho Malha Canelada", qtd: 2, custoUnitario: 1.40 }
      ]
    }
  ],

  // Estoque de Matérias-Primas e Aviamentos
  estoque: [
    { id: "EST-01", codigo: "MAL-PIQ-AZUL", descricao: "Malha Piquet PA Azul Marinho", categoria: "Malhas e Tecidos", unidade: "kg", saldoAtual: 280, estoqueMinimo: 80, custoMedioUnitario: 48.50 },
    { id: "EST-02", codigo: "MAL-PIQ-BRANCO", descricao: "Malha Piquet PA Branco Alvejado", categoria: "Malhas e Tecidos", unidade: "kg", saldoAtual: 195, estoqueMinimo: 60, custoMedioUnitario: 46.00 },
    { id: "EST-03", codigo: "MAL-PIQ-PRETO", descricao: "Malha Piquet PA Preto Reativo", categoria: "Malhas e Tecidos", unidade: "kg", saldoAtual: 42, estoqueMinimo: 70, custoMedioUnitario: 50.00 },
    { id: "EST-04", codigo: "MAL-301-BRANCO", descricao: "Meia Malha 30.1 Penteada Algodão Branco", categoria: "Malhas e Tecidos", unidade: "kg", saldoAtual: 310, estoqueMinimo: 100, custoMedioUnitario: 44.00 },
    { id: "EST-05", codigo: "MAL-DRY-AZUL", descricao: "Malha Dry Fit Poliéster Azul Royal", categoria: "Malhas e Tecidos", unidade: "kg", saldoAtual: 140, estoqueMinimo: 50, custoMedioUnitario: 38.00 },
    { id: "EST-06", codigo: "TEC-BRIM-CINZA", descricao: "Tecido Brim Pesado 100% Algodão Cinza", categoria: "Malhas e Tecidos", unidade: "m", saldoAtual: 520, estoqueMinimo: 150, custoMedioUnitario: 22.80 },
    { id: "EST-07", codigo: "TEC-OXFORD-BRANCO", descricao: "Tecido Oxford Branco 100% Poliéster", categoria: "Malhas e Tecidos", unidade: "m", saldoAtual: 280, estoqueMinimo: 100, custoMedioUnitario: 14.50 },
    { id: "EST-08", codigo: "AVI-GOLA-AZUL", descricao: "Gola Polo Retilínea Azul Marinho c/ Friso Branco", categoria: "Aviamentos", unidade: "un", saldoAtual: 850, estoqueMinimo: 200, custoMedioUnitario: 3.20 },
    { id: "EST-09", codigo: "AVI-PUNHO-AZUL", descricao: "Punho Retilíneo Manga Azul Marinho", categoria: "Aviamentos", unidade: "par", saldoAtual: 790, estoqueMinimo: 200, custoMedioUnitario: 2.20 },
    { id: "EST-10", codigo: "AVI-BOT-POLO", descricao: "Botão Poliéster 2 Furos 18mm", categoria: "Aviamentos", unidade: "grosa", saldoAtual: 18, estoqueMinimo: 10, custoMedioUnitario: 14.00 },
    { id: "EST-11", codigo: "DTF-FILME-60", descricao: "Filme DTF Rolo 60cm x 100m", categoria: "Insumos DTF", unidade: "m", saldoAtual: 185, estoqueMinimo: 50, custoMedioUnitario: 12.00 },
    { id: "EST-12", codigo: "DTF-PO-POLIAM", descricao: "Poliamida Termofusível Branca Especial DTF", categoria: "Insumos DTF", unidade: "kg", saldoAtual: 24, estoqueMinimo: 10, custoMedioUnitario: 95.00 },
    { id: "EST-13", codigo: "LINHA-120-MAR", descricao: "Cone Linha Reta 120 10.000m Azul Marinho", categoria: "Aviamentos", unidade: "un", saldoAtual: 14, estoqueMinimo: 5, custoMedioUnitario: 18.50 }
  ],

  // Clientes Cadastrados
  clientes: [
    {
      id: "CLI-101",
      razaoSocial: "Transportadora Rápido Paulista S.A.",
      nomeFantasia: "Expresso Paulista",
      cnpj: "18.394.819/0001-92",
      contatoNome: "Roberto Medeiros (Gerente RH)",
      telefone: "11984210091",
      email: "rh@expressopaulista.com.br",
      cidade: "Campinas",
      uf: "SP",
      totalPedidosFeitos: 6,
      faturamentoAcumulado: 48500.00,
      dataUltimaCompra: "2026-03-15",
      intervaloRecompraMeses: 6,
      precisaRecompraAlerta: true
    },
    {
      id: "CLI-102",
      razaoSocial: "Clínica Integrada Odonto Vida Ltda",
      nomeFantasia: "Odonto Vida",
      cnpj: "29.114.731/0001-05",
      contatoNome: "Dra. Carolina Vaz",
      telefone: "11971203344",
      email: "adm@odontovida.com.br",
      cidade: "São Paulo",
      uf: "SP",
      totalPedidosFeitos: 3,
      faturamentoAcumulado: 14200.00,
      dataUltimaCompra: "2026-07-20",
      intervaloRecompraMeses: 6,
      precisaRecompraAlerta: false
    },
    {
      id: "CLI-103",
      razaoSocial: "Metalúrgica Nova Era Indústria e Comércio",
      nomeFantasia: "Nova Era Metalúrgica",
      cnpj: "52.889.012/0001-63",
      contatoNome: "Cláudio Sampaio (Compras)",
      telefone: "19992348877",
      email: "compras@novaerametal.com.br",
      cidade: "Piracicaba",
      uf: "SP",
      totalPedidosFeitos: 8,
      faturamentoAcumulado: 76300.00,
      dataUltimaCompra: "2026-08-10",
      intervaloRecompraMeses: 6,
      precisaRecompraAlerta: false
    },
    {
      id: "CLI-104",
      razaoSocial: "Colégio Santa Helena Educação Básica",
      nomeFantasia: "Colégio Santa Helena",
      cnpj: "44.102.948/0001-71",
      contatoNome: "Marta Guimarães (Diretora)",
      telefone: "19988112244",
      email: "diretoria@colegiosantahelena.com.br",
      cidade: "Sumaré",
      uf: "SP",
      totalPedidosFeitos: 5,
      faturamentoAcumulado: 62000.00,
      dataUltimaCompra: "2026-02-05",
      intervaloRecompraMeses: 6,
      precisaRecompraAlerta: true
    }
  ],

  // Pedidos e Orçamentos Comerciais
  pedidos: [
    {
      id: "PED-1084",
      numero: 1084,
      dataCriacao: "2026-09-24",
      clienteId: "CLI-101",
      clienteNome: "Expresso Paulista",
      clienteTelefone: "11984210091",
      status: "Em Producao",
      etapaProducao: "Costura",
      produtoId: "PROD-001",
      produtoNome: "Camisa Polo Tradicional",
      corTecido: "Azul Marinho",
      tecidoEspecificacao: "Piquet PA 50/50",
      tipoPersonalizacao: "Bordado Peito + Costas",
      grade: { pp: 0, p: 15, m: 35, g: 30, gg: 15, xg: 5, total: 100 },
      precoUnitarioVenda: 54.00,
      valorTotalVenda: 5400.00,
      custoTotalEstimado: 3420.00,
      lucroLiquidoEstimado: 1980.00,
      margemLucroPercentual: 36.67,
      condicaoPagamento: "50% Sinal + 50% na Retirada",
      sinalPago: true,
      valorSinalPago: 2700.00,
      saldoPendente: 2700.00,
      dataPrevisaoEntrega: "2026-10-06",
      notaFiscalEmitida: false,
      chaveNFe: null,
      vendedorResponsavel: "Marcos Paulo"
    },
    {
      id: "PED-1085",
      numero: 1085,
      dataCriacao: "2026-09-25",
      clienteId: "CLI-103",
      clienteNome: "Nova Era Metalúrgica",
      clienteTelefone: "19992348877",
      status: "Em Producao",
      etapaProducao: "Corte",
      produtoId: "PROD-003",
      produtoNome: "Camisa Operacional Manga Curta",
      corTecido: "Cinza Chumbo",
      tecidoEspecificacao: "Tecido Brim Pesado 100% Algodão",
      tipoPersonalizacao: "Bordado Bolso + Silk Costas",
      grade: { pp: 0, p: 10, m: 25, g: 25, gg: 10, xg: 0, total: 70 },
      precoUnitarioVenda: 68.00,
      valorTotalVenda: 4760.00,
      custoTotalEstimado: 3150.00,
      lucroLiquidoEstimado: 1610.00,
      margemLucroPercentual: 33.82,
      condicaoPagamento: "50% Sinal + 50% no Faturamento 15dd",
      sinalPago: true,
      valorSinalPago: 2380.00,
      saldoPendente: 2380.00,
      dataPrevisaoEntrega: "2026-10-08",
      notaFiscalEmitida: false,
      chaveNFe: null,
      vendedorResponsavel: "Fabiana Toledo"
    },
    {
      id: "PED-1086",
      numero: 1086,
      dataCriacao: "2026-09-26",
      clienteId: "CLI-102",
      clienteNome: "Odonto Vida",
      clienteTelefone: "11971203344",
      status: "Quarentena",
      etapaProducao: "Aguardando Aprovacao",
      produtoId: "PROD-005",
      produtoNome: "Jaleco Hospitalar Manga Longa",
      corTecido: "Branco",
      tecidoEspecificacao: "Oxford 100% Poliéster",
      tipoPersonalizacao: "Bordado Nome Individual + Logo Peito",
      grade: { pp: 5, p: 12, m: 10, g: 3, gg: 0, xg: 0, total: 30 },
      precoUnitarioVenda: 89.00,
      valorTotalVenda: 2670.00,
      custoTotalEstimado: 1710.00,
      lucroLiquidoEstimado: 960.00,
      margemLucroPercentual: 35.95,
      condicaoPagamento: "50% Sinal + 50% na Entrega",
      sinalPago: true,
      valorSinalPago: 1335.00,
      saldoPendente: 1335.00,
      dataPrevisaoEntrega: "2026-10-12",
      notaFiscalEmitida: false,
      chaveNFe: null,
      vendedorResponsavel: "Marcos Paulo"
    },
    {
      id: "PED-1087",
      numero: 1087,
      dataCriacao: "2026-09-26",
      clienteId: "CLI-104",
      clienteNome: "Colégio Santa Helena",
      clienteTelefone: "19988112244",
      status: "Quarentena",
      etapaProducao: "Aguardando Aprovacao",
      produtoId: "PROD-004",
      produtoNome: "Camisa Esportiva Dry Fit",
      corTecido: "Azul Royal c/ Sublimação Total",
      tecidoEspecificacao: "Dry Fit Microfibra",
      tipoPersonalizacao: "Sublimação Total Digital",
      grade: { pp: 20, p: 40, m: 60, g: 50, gg: 20, xg: 10, total: 200 },
      precoUnitarioVenda: 34.50,
      valorTotalVenda: 6900.00,
      custoTotalEstimado: 5600.00,
      lucroLiquidoEstimado: 1300.00,
      margemLucroPercentual: 18.84,
      condicaoPagamento: "50% Sinal + 50% na Entrega",
      sinalPago: false,
      valorSinalPago: 0,
      saldoPendente: 6900.00,
      dataPrevisaoEntrega: "2026-10-15",
      notaFiscalEmitida: false,
      chaveNFe: null,
      vendedorResponsavel: "Fabiana Toledo"
    }
  ],

  // Ordens de Serviço Técnicas (Oficina / Chão de Fábrica)
  ordensServico: [
    {
      id: "OS-8401",
      pedidoNumero: 1084,
      cliente: "Expresso Paulista",
      produto: "Camisa Polo Tradicional",
      quantidadeTotal: 100,
      grade: { pp: 0, p: 15, m: 35, g: 30, gg: 15, xg: 5 },
      etapaAtual: "Costura",
      setorResponsavel: "Costura Linha 2",
      responsavelCorte: "Vanderlei Souza",
      dataEntradaCorte: "2026-09-25",
      dataConclusaoCorte: "2026-09-25",
      tecidoConsumidoKg: 28.4,
      arteDtfMetrosLineares: 6.2,
      instrucoesCorte: "Gola e punho cor marinho friso branco. Reforço ombro a ombro obrigatório.",
      instrucoesBordado: "Bordado no peito esquerdo 8,5cm largura (Logo Expresso). Costas em DTF 26x8cm.",
      statusBordado: "Concluido",
      statusCostura: "Em Andamento (62/100 costuradas)",
      statusAcabamento: "Pendente"
    },
    {
      id: "OS-8402",
      pedidoNumero: 1085,
      cliente: "Nova Era Metalúrgica",
      produto: "Camisa Operacional Manga Curta",
      quantidadeTotal: 70,
      grade: { pp: 0, p: 10, m: 25, g: 25, gg: 10, xg: 0 },
      etapaAtual: "Corte",
      setorResponsavel: "Mesa de Corte 1",
      responsavelCorte: "Vanderlei Souza",
      dataEntradaCorte: "2026-09-26",
      dataConclusaoCorte: null,
      tecidoConsumidoKg: 94.5,
      arteDtfMetrosLineares: 0,
      instrucoesCorte: "Brim pesado cinza chumbo. Fio reto milimétrico para não torcer no encolhimento.",
      instrucoesBordado: "Bolso frontal esquerdo com bordado simples em linha branca 120.",
      statusBordado: "Pendente",
      statusCostura: "Pendente",
      statusAcabamento: "Pendente"
    }
  ],

  // Gestor de Fila DTF (Nesting de Artes)
  nestingFila: [
    { id: "ART-01", cliente: "Expresso Paulista", descricao: "Logo Costas Expresso", larguraCm: 26, alturaCm: 8, copias: 100, roloLarguraCm: 58 },
    { id: "ART-02", cliente: "Odonto Vida", descricao: "Escudo Peito Odonto", larguraCm: 9, alturaCm: 7.5, copias: 30, roloLarguraCm: 58 },
    { id: "ART-03", cliente: "Metalúrgica Nova Era", descricao: "Logo Bolso Operacional", larguraCm: 8, alturaCm: 5, copias: 70, roloLarguraCm: 58 },
    { id: "ART-04", cliente: "Colégio Santa Helena", descricao: "Emblema Brasão Infantil", larguraCm: 7, alturaCm: 7, copias: 200, roloLarguraCm: 58 }
  ],

  // Notas Fiscais Emitidas
  notasFiscais: [
    {
      id: "NFE-00981",
      numero: 981,
      serie: "1",
      dataEmissao: "2026-09-20",
      cliente: "Transportadora Rápido Paulista S.A.",
      cnpj: "18.394.819/0001-92",
      cfop: "5101",
      naturezaOperacao: "Venda de Produção do Estabelecimento",
      valorTotal: 8400.00,
      valorImpostos: 546.00,
      statusSefaz: "Autorizada",
      chaveAcesso: "35260934582910000144550010000009811098234710",
      protocolo: "135260098124512"
    },
    {
      id: "NFE-00980",
      numero: 980,
      serie: "1",
      dataEmissao: "2026-09-18",
      cliente: "Metalúrgica Nova Era Indústria e Comércio",
      cnpj: "52.889.012/0001-63",
      cfop: "5101",
      naturezaOperacao: "Venda de Produção do Estabelecimento",
      valorTotal: 5920.00,
      valorImpostos: 384.80,
      statusSefaz: "Autorizada",
      chaveAcesso: "35260934582910000144550010000009801098234709",
      protocolo: "135260098011284"
    }
  ],

  // Compras de Insumos Têxteis
  compras: [
    { id: "COM-501", data: "2026-09-22", fornecedor: "Malharia Textil Sul S.A.", itens: "300kg Malha Piquet PA Azul Marinho e Preto", valorTotal: 14450.00, status: "Entregue", previsaoChegada: "2026-09-24" },
    { id: "COM-502", data: "2026-09-24", fornecedor: "Fios & Linhas Brasil", itens: "50 cones Linha Reta 120 e Fio Overlock", valorTotal: 925.00, status: "A Caminho", previsaoChegada: "2026-09-28" },
    { id: "COM-503", data: "2026-09-26", fornecedor: "DTF Pro Suprimentos Digitais", itens: "2 Rolos Filme DTF 60cm + 10kg Poliamida", valorTotal: 3350.00, status: "Pendente Aprovacao", previsaoChegada: "2026-10-02" }
  ],

  // Equipe e Usuários do Sistema
  equipe: [
    { id: "USR-01", nome: "Carlos Eduardo Mendes", email: "carlos@texpro.com.br", cargo: "Administrador Geral / Diretor", nivelAcesso: "Admin", status: "Ativo" },
    { id: "USR-02", nome: "Marcos Paulo Silva", email: "marcos@texpro.com.br", cargo: "Vendedor Técnico Corporativo", nivelAcesso: "Comercial", status: "Ativo" },
    { id: "USR-03", nome: "Fabiana Toledo", email: "fabiana@texpro.com.br", cargo: "Vendedora Linha Operacional e Escolar", nivelAcesso: "Comercial", status: "Ativo" },
    { id: "USR-04", nome: "Vanderlei Souza", email: "vanderlei@texpro.com.br", cargo: "Encarregado de Corte & PCP", nivelAcesso: "Producao", status: "Ativo" },
    { id: "USR-05", nome: "Ana Paula Guedes", email: "financeiro@texpro.com.br", cargo: "Analista Financeiro e Fiscal", nivelAcesso: "Financeiro", status: "Ativo" }
  ]
};
