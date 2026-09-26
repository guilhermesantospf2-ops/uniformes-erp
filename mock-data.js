/**
 * UNIFORMES ERP - BANCO DE DADOS TÊXTIL PROFISSIONAL
 * Dados industriais completos para fábrica de uniformes profissionais, escolares e operacionais
 */

// Gerador de Mockups Vetoriais em Proporção 3x4 (300x400)
window.ERP_MOCKUPS = {
  gerarMockupSvg: function(tipo, corPrincipal = "#1e3a8a", corDetalhe = "#ffffff", textoArte = "LOGO") {
    tipo = (tipo || "").toLowerCase();
    
    // Paleta de cores para tecidos têxteis
    let fillBody = corPrincipal || "#1e3a8a";
    let fillTrim = corDetalhe || "#ffffff";
    let shadowColor = "rgba(0,0,0,0.12)";
    let seamStroke = "rgba(0,0,0,0.22)";

    let svgConteudo = "";

    if (tipo.includes("polo")) {
      // Polo Corporativa com Gola e Botões
      svgConteudo = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
          <rect width="300" height="400" fill="#f8fafc"/>
          <g transform="translate(25, 20)">
            <!-- Corpo Polo -->
            <path d="M 50 70 L 10 115 L 45 155 L 70 135 L 70 330 C 70 340, 180 340, 180 330 L 180 135 L 205 155 L 240 115 L 200 70 C 160 50, 90 50, 50 70 Z" fill="${fillBody}" stroke="${seamStroke}" stroke-width="2"/>
            <!-- Mangas com friso -->
            <path d="M 10 115 L 45 155 L 38 162 L 5 122 Z" fill="${fillTrim}"/>
            <path d="M 240 115 L 205 155 L 212 162 L 245 122 Z" fill="${fillTrim}"/>
            <!-- Peitilho e Gola -->
            <path d="M 95 62 L 155 62 L 140 150 L 110 150 Z" fill="#ffffff" stroke="${seamStroke}" stroke-width="1.5"/>
            <path d="M 85 60 L 125 90 L 125 60 Z" fill="${fillTrim}" stroke="${seamStroke}" stroke-width="1.5"/>
            <path d="M 165 60 L 125 90 L 125 60 Z" fill="${fillTrim}" stroke="${seamStroke}" stroke-width="1.5"/>
            <!-- Botões -->
            <circle cx="125" cy="85" r="3.5" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1"/>
            <circle cx="125" cy="110" r="3.5" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1"/>
            <circle cx="125" cy="135" r="3.5" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1"/>
            <!-- Simulação de Bordado Peito Esquerdo -->
            <rect x="145" y="115" width="24" height="16" rx="2" fill="#0f172a" opacity="0.8"/>
            <text x="157" y="127" font-size="7" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="sans-serif">${textoArte}</text>
            <!-- Sombra e Caimento -->
            <path d="M 70 135 C 100 180, 100 280, 70 330" stroke="${shadowColor}" stroke-width="3" fill="none"/>
            <path d="M 180 135 C 150 180, 150 280, 180 330" stroke="${shadowColor}" stroke-width="3" fill="none"/>
          </g>
          <!-- Badge 3x4 Mockup Oficial -->
          <rect x="8" y="372" width="284" height="20" rx="3" fill="#0f172a"/>
          <text x="150" y="386" font-size="9" font-family="monospace" font-weight="bold" fill="#ffffff" text-anchor="middle">MOCKUP OFICIAL • POLO PIQUET</text>
        </svg>
      `;
    } else if (tipo.includes("brim") || tipo.includes("operacional") || tipo.includes("cargo") || tipo.includes("macacao")) {
      // Camisa Operacional Brim com Faixa Refletiva e Bolsos
      svgConteudo = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
          <rect width="300" height="400" fill="#f8fafc"/>
          <g transform="translate(25, 20)">
            <!-- Corpo Camisa Operacional -->
            <path d="M 50 65 L 10 115 L 45 155 L 70 135 L 70 335 C 70 342, 180 342, 180 335 L 180 135 L 205 155 L 240 115 L 200 65 C 160 48, 90 48, 50 65 Z" fill="${fillBody}" stroke="${seamStroke}" stroke-width="2"/>
            <!-- Faixa Refletiva no Tronco -->
            <rect x="70" y="180" width="110" height="16" fill="#eab308" stroke="#ca8a04" stroke-width="1"/>
            <rect x="70" y="184" width="110" height="8" fill="#e2e8f0"/>
            <!-- Faixas Refletivas nas Mangas -->
            <rect x="18" y="125" width="22" height="12" fill="#eab308" transform="rotate(-35 25 130)"/>
            <rect x="208" y="125" width="22" height="12" fill="#eab308" transform="rotate(35 215 130)"/>
            <!-- Bolsos Operacionais com Tampa -->
            <rect x="85" y="105" width="32" height="38" rx="2" fill="${fillBody}" stroke="${seamStroke}" stroke-width="1.5"/>
            <path d="M 83 105 L 101 115 L 119 105 Z" fill="${seamStroke}"/>
            <circle cx="101" cy="111" r="2.5" fill="#94a3b8"/>
            <rect x="133" y="105" width="32" height="38" rx="2" fill="${fillBody}" stroke="${seamStroke}" stroke-width="1.5"/>
            <path d="M 131 105 L 149 115 L 167 105 Z" fill="${seamStroke}"/>
            <circle cx="149" cy="111" r="2.5" fill="#94a3b8"/>
            <!-- Estampa no Bolso Direito -->
            <text x="149" y="130" font-size="7" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="sans-serif">${textoArte}</text>
            <!-- Colarinho Operacional Fechado -->
            <path d="M 90 58 L 125 80 L 95 90 Z" fill="${fillTrim}" stroke="${seamStroke}" stroke-width="1.5"/>
            <path d="M 160 58 L 125 80 L 155 90 Z" fill="${fillTrim}" stroke="${seamStroke}" stroke-width="1.5"/>
          </g>
          <!-- Badge 3x4 Mockup Oficial -->
          <rect x="8" y="372" width="284" height="20" rx="3" fill="#0f172a"/>
          <text x="150" y="386" font-size="9" font-family="monospace" font-weight="bold" fill="#ffffff" text-anchor="middle">MOCKUP OFICIAL • BRIM OPERACIONAL</text>
        </svg>
      `;
    } else if (tipo.includes("jaleco") || tipo.includes("scrub") || tipo.includes("saude")) {
      // Jaleco Hospitalar / Saúde
      svgConteudo = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
          <rect width="300" height="400" fill="#f8fafc"/>
          <g transform="translate(25, 20)">
            <!-- Corpo Jaleco Longo Branco -->
            <path d="M 50 65 L 12 140 L 42 165 L 68 135 L 68 345 C 68 350, 182 350, 182 345 L 182 135 L 208 165 L 238 140 L 200 65 C 160 45, 90 45, 50 65 Z" fill="#ffffff" stroke="${seamStroke}" stroke-width="2"/>
            <!-- Lapela e Decote -->
            <path d="M 95 55 L 125 125 L 85 110 Z" fill="#f1f5f9" stroke="${seamStroke}" stroke-width="1.5"/>
            <path d="M 155 55 L 125 125 L 165 110 Z" fill="#f1f5f9" stroke="${seamStroke}" stroke-width="1.5"/>
            <!-- Linha de Botões Frontal -->
            <line x1="125" y1="125" x2="125" y2="345" stroke="${seamStroke}" stroke-width="1.5"/>
            <circle cx="125" cy="150" r="3" fill="#cbd5e1" stroke="#64748b"/>
            <circle cx="125" cy="190" r="3" fill="#cbd5e1" stroke="#64748b"/>
            <circle cx="125" cy="230" r="3" fill="#cbd5e1" stroke="#64748b"/>
            <circle cx="125" cy="270" r="3" fill="#cbd5e1" stroke="#64748b"/>
            <!-- Bolsos Inferiores e Peito -->
            <rect x="80" y="240" width="35" height="45" rx="2" fill="#ffffff" stroke="${seamStroke}" stroke-width="1.2"/>
            <rect x="135" y="240" width="35" height="45" rx="2" fill="#ffffff" stroke="${seamStroke}" stroke-width="1.2"/>
            <rect x="140" y="140" width="28" height="30" rx="2" fill="#ffffff" stroke="${seamStroke}" stroke-width="1.2"/>
            <!-- Brasão Bordado Peito Esquerdo -->
            <rect x="144" y="145" width="20" height="15" rx="2" fill="#047857"/>
            <text x="154" y="156" font-size="7" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="sans-serif">${textoArte}</text>
          </g>
          <!-- Badge 3x4 Mockup Oficial -->
          <rect x="8" y="372" width="284" height="20" rx="3" fill="#0f172a"/>
          <text x="150" y="386" font-size="9" font-family="monospace" font-weight="bold" fill="#ffffff" text-anchor="middle">MOCKUP OFICIAL • JALECO HOSPITALAR</text>
        </svg>
      `;
    } else if (tipo.includes("moletom")) {
      // Moletom Canguru com Capuz
      svgConteudo = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
          <rect width="300" height="400" fill="#f8fafc"/>
          <g transform="translate(25, 20)">
            <!-- Capuz -->
            <path d="M 85 65 C 80 15, 170 15, 165 65 Z" fill="${fillBody}" stroke="${seamStroke}" stroke-width="2"/>
            <circle cx="125" cy="45" r="22" fill="rgba(0,0,0,0.15)"/>
            <!-- Corpo Moletom -->
            <path d="M 50 70 L 5 140 L 38 175 L 65 145 L 65 315 L 185 315 L 185 145 L 212 175 L 245 140 L 200 70 Z" fill="${fillBody}" stroke="${seamStroke}" stroke-width="2"/>
            <!-- Barra Canelada -->
            <rect x="65" y="315" width="120" height="20" fill="${fillTrim}" stroke="${seamStroke}" stroke-width="1.5"/>
            <!-- Bolso Canguru Frontal -->
            <path d="M 85 240 L 165 240 L 175 305 L 75 305 Z" fill="${fillBody}" stroke="${seamStroke}" stroke-width="1.5"/>
            <!-- Estampa DTF / Silk Costas ou Peito -->
            <rect x="100" y="130" width="50" height="40" rx="4" fill="#0f172a" opacity="0.85"/>
            <text x="125" y="154" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="sans-serif">${textoArte}</text>
          </g>
          <!-- Badge 3x4 Mockup Oficial -->
          <rect x="8" y="372" width="284" height="20" rx="3" fill="#0f172a"/>
          <text x="150" y="386" font-size="9" font-family="monospace" font-weight="bold" fill="#ffffff" text-anchor="middle">MOCKUP OFICIAL • MOLETOM CANGURU</text>
        </svg>
      `;
    } else {
      // Camiseta Básica Gola Careca / Dry Fit / Promocional
      svgConteudo = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
          <rect width="300" height="400" fill="#f8fafc"/>
          <g transform="translate(25, 20)">
            <!-- Corpo Camiseta -->
            <path d="M 50 70 L 8 120 L 45 155 L 72 135 L 72 330 C 72 338, 178 338, 178 330 L 178 135 L 205 155 L 242 120 L 200 70 C 160 55, 90 55, 50 70 Z" fill="${fillBody}" stroke="${seamStroke}" stroke-width="2"/>
            <!-- Gola Careca Canelada -->
            <path d="M 95 62 C 105 82, 145 82, 155 62 C 145 52, 105 52, 95 62 Z" fill="${fillTrim}" stroke="${seamStroke}" stroke-width="1.5"/>
            <!-- Estampa Centralizada / Peito -->
            <rect x="95" y="125" width="60" height="50" rx="4" fill="#0f172a" opacity="0.9"/>
            <text x="125" y="155" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="sans-serif">${textoArte}</text>
            <!-- Costuras e Caimento Lateral -->
            <path d="M 72 135 C 95 180, 95 280, 72 330" stroke="${shadowColor}" stroke-width="3" fill="none"/>
            <path d="M 178 135 C 155 180, 155 280, 178 330" stroke="${shadowColor}" stroke-width="3" fill="none"/>
          </g>
          <!-- Badge 3x4 Mockup Oficial -->
          <rect x="8" y="372" width="284" height="20" rx="3" fill="#0f172a"/>
          <text x="150" y="386" font-size="9" font-family="monospace" font-weight="bold" fill="#ffffff" text-anchor="middle">MOCKUP OFICIAL • CAMISETA TÊXTIL</text>
        </svg>
      `;
    }

    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgConteudo.trim());
  }
};

window.ERP_INITIAL_DATA = {
  empresa: {
    razaoSocial: "TexPro Uniformes Profissionais e Industriais Ltda",
    nomeFantasia: "TexPro Indústria Têxtil",
    cnpj: "34.582.910/0001-44",
    ie: "109.824.712.110",
    telefone: "11987654321",
    email: "comercial@texprouniformes.com.br",
    endereco: "Rua das Indústrias Têxteis, 450 - Distrito Industrial",
    cidade: "Americana",
    uf: "SP",
    cep: "13470-000",
    regimeTributario: "Simples Nacional",
    aliquotaImpostoPadrao: 6.5
  },

  // CATÁLOGO COMPLETO DE MODELAGENS TÊXTEIS (28 MODELOS EXAUSTIVOS)
  produtosBase: [
    { id: "PROD-001", codigo: "POL-01", nome: "Camisa Polo Tradicional Piquet", categoria: "Linha Corporativa", tipoMalhaPadrao: "Piquet PA (50% Algodão / 50% Poliéster)", consumoMalhaKgPorPeca: 0.28, custoMaoDeObraBase: 7.50, aviamentosPadrao: [{ nome: "Gola e Punho Retilíneo", qtd: 1, custoUnitario: 4.80 }, { nome: "Botão 2 furos 18mm", qtd: 3, custoUnitario: 0.15 }] },
    { id: "PROD-002", codigo: "POL-02", nome: "Camisa Polo Friso Duplo Gola Especial", categoria: "Linha Corporativa", tipoMalhaPadrao: "Piquet 100% Algodão Penteado", consumoMalhaKgPorPeca: 0.30, custoMaoDeObraBase: 8.50, aviamentosPadrao: [{ nome: "Gola Friso Duplo", qtd: 1, custoUnitario: 5.50 }, { nome: "Botão Personalizado", qtd: 3, custoUnitario: 0.25 }] },
    { id: "PROD-003", codigo: "POL-03", nome: "Camisa Polo Dry Fit Confort", categoria: "Linha Corporativa", tipoMalhaPadrao: "Piquet Dry Poliéster Microfibra", consumoMalhaKgPorPeca: 0.22, custoMaoDeObraBase: 7.00, aviamentosPadrao: [{ nome: "Gola Dry Fit", qtd: 1, custoUnitario: 4.20 }, { nome: "Botão 2 furos", qtd: 2, custoUnitario: 0.15 }] },
    { id: "PROD-004", codigo: "CAM-01", nome: "Camiseta Básica Gola Careca Algodão", categoria: "Promocional & Uniforme Leve", tipoMalhaPadrao: "Meia Malha 30.1 Penteada 100% Algodão", consumoMalhaKgPorPeca: 0.22, custoMaoDeObraBase: 5.00, aviamentosPadrao: [{ nome: "Ribana Gola 1x1", qtd: 1, custoUnitario: 1.20 }, { nome: "Etiqueta Termocolante", qtd: 1, custoUnitario: 0.40 }] },
    { id: "PROD-005", codigo: "CAM-02", nome: "Camiseta Gola V Poliviscose (Anti-Pilling)", categoria: "Promocional & Uniforme Leve", tipoMalhaPadrao: "Malha PV 67% Poliéster / 33% Viscose", consumoMalhaKgPorPeca: 0.23, custoMaoDeObraBase: 5.50, aviamentosPadrao: [{ nome: "Gola V Ribana PV", qtd: 1, custoUnitario: 1.40 }, { nome: "Etiqueta Composição", qtd: 1, custoUnitario: 0.30 }] },
    { id: "PROD-006", codigo: "CAM-03", nome: "Camiseta Manga Longa Punho Canelado", categoria: "Promocional & Uniforme Leve", tipoMalhaPadrao: "Meia Malha 30.1 Algodão", consumoMalhaKgPorPeca: 0.32, custoMaoDeObraBase: 6.50, aviamentosPadrao: [{ nome: "Punho Canelado Par", qtd: 1, custoUnitario: 2.20 }, { nome: "Ribana Gola", qtd: 1, custoUnitario: 1.20 }] },
    { id: "PROD-007", codigo: "CAM-04", nome: "Camiseta Raglan Promocional Bicolor", categoria: "Promocional & Uniforme Leve", tipoMalhaPadrao: "Meia Malha 30.1 Penteada", consumoMalhaKgPorPeca: 0.24, custoMaoDeObraBase: 6.00, aviamentosPadrao: [{ nome: "Ribana Gola Bicolor", qtd: 1, custoUnitario: 1.50 }] },
    { id: "PROD-008", codigo: "OP-01", nome: "Camisa Operacional Brim Leve com Bolso", categoria: "Linha Pesada & Operacional", tipoMalhaPadrao: "Tecido Brim Leve 100% Algodão", consumoMalhaKgPorPeca: 1.30, custoMaoDeObraBase: 11.00, aviamentosPadrao: [{ nome: "Botão 4 Furos Resinado", qtd: 7, custoUnitario: 0.20 }, { nome: "Linha Pesponto 50", qtd: 1, custoUnitario: 0.90 }] },
    { id: "PROD-009", codigo: "OP-02", nome: "Camisa Operacional Brim c/ Faixa Refletiva", categoria: "Linha Pesada & Operacional", tipoMalhaPadrao: "Tecido Brim Pesado 260g", consumoMalhaKgPorPeca: 1.45, custoMaoDeObraBase: 13.50, aviamentosPadrao: [{ nome: "Faixa Refletiva 50mm (2m)", qtd: 1, custoUnitario: 8.50 }, { nome: "Botões Massa", qtd: 7, custoUnitario: 0.20 }] },
    { id: "PROD-010", codigo: "OP-03", nome: "Calça Operacional Meio Elástico Brim", categoria: "Linha Pesada & Operacional", tipoMalhaPadrao: "Tecido Brim Pesado 100% Algodão", consumoMalhaKgPorPeca: 1.40, custoMaoDeObraBase: 12.00, aviamentosPadrao: [{ nome: "Elástico 40mm Cintura", qtd: 1, custoUnitario: 2.50 }, { nome: "Zíper Tratorado 15cm", qtd: 1, custoUnitario: 2.20 }] },
    { id: "PROD-011", codigo: "OP-04", nome: "Calça Cargo 6 Bolsos Reforçada", categoria: "Linha Pesada & Operacional", tipoMalhaPadrao: "Tecido Rip Stop ou Brim Pesado", consumoMalhaKgPorPeca: 1.60, custoMaoDeObraBase: 15.00, aviamentosPadrao: [{ nome: "Velcro p/ Bolsos", qtd: 4, custoUnitario: 3.20 }, { nome: "Zíper Tratorado", qtd: 1, custoUnitario: 2.20 }] },
    { id: "PROD-012", codigo: "OP-05", nome: "Macacão Operacional Mecânico", categoria: "Linha Pesada & Operacional", tipoMalhaPadrao: "Tecido Brim Pesado Sarjado", consumoMalhaKgPorPeca: 2.80, custoMaoDeObraBase: 24.00, aviamentosPadrao: [{ nome: "Zíper Metal Reforçado 65cm", qtd: 1, custoUnitario: 7.50 }, { nome: "Elástico Costas", qtd: 1, custoUnitario: 2.00 }] },
    { id: "PROD-013", codigo: "SOC-01", nome: "Camisa Social Masculina Manga Curta", categoria: "Linha Corporativa", tipoMalhaPadrao: "Tecido Tricoline Mista 60/40", consumoMalhaKgPorPeca: 1.35, custoMaoDeObraBase: 16.00, aviamentosPadrao: [{ nome: "Entretela Gola e Punho", qtd: 1, custoUnitario: 3.50 }, { nome: "Botões Madrepérola", qtd: 8, custoUnitario: 0.35 }] },
    { id: "PROD-014", codigo: "SOC-02", nome: "Camisa Social Manga Longa Fio Tinto", categoria: "Linha Corporativa", tipoMalhaPadrao: "Tecido Tricoline Fio Tinto 100% Algodão", consumoMalhaKgPorPeca: 1.70, custoMaoDeObraBase: 21.00, aviamentosPadrao: [{ nome: "Entretela Nobre", qtd: 1, custoUnitario: 4.80 }, { nome: "Botões", qtd: 12, custoUnitario: 0.35 }] },
    { id: "PROD-015", codigo: "JAL-01", nome: "Jaleco Hospitalar Manga Longa Oxford", categoria: "Linha Saúde & Laboratorial", tipoMalhaPadrao: "Tecido Oxford 100% Poliéster", consumoMalhaKgPorPeca: 1.80, custoMaoDeObraBase: 14.00, aviamentosPadrao: [{ nome: "Botão Branco 4 Furos", qtd: 5, custoUnitario: 0.25 }, { nome: "Linha Pesponto", qtd: 1, custoUnitario: 0.80 }] },
    { id: "PROD-016", codigo: "JAL-02", nome: "Jaleco Gabardine Premium Gola Padre", categoria: "Linha Saúde & Laboratorial", tipoMalhaPadrao: "Tecido Gabardine com Elastano", consumoMalhaKgPorPeca: 1.90, custoMaoDeObraBase: 19.00, aviamentosPadrao: [{ nome: "Zíper Oculto ou Botão Forrado", qtd: 1, custoUnitario: 4.50 }] },
    { id: "PROD-017", codigo: "SCR-01", nome: "Conjunto Scrub / Pijama Cirúrgico", categoria: "Linha Saúde & Laboratorial", tipoMalhaPadrao: "Tecido Microfibra Two Way c/ Elastano", consumoMalhaKgPorPeca: 2.30, custoMaoDeObraBase: 18.00, aviamentosPadrao: [{ nome: "Elástico Cintura 35mm", qtd: 1, custoUnitario: 2.20 }, { nome: "Cordão Regulador", qtd: 1, custoUnitario: 1.50 }] },
    { id: "PROD-018", codigo: "DRY-01", nome: "Camisa Esportiva Dry Fit Sublimada", categoria: "Linha Esportiva & Escolar", tipoMalhaPadrao: "Malha Dry Fit Poliéster 130g", consumoMalhaKgPorPeca: 0.19, custoMaoDeObraBase: 5.50, aviamentosPadrao: [{ nome: "Ribana Gola Dry", qtd: 1, custoUnitario: 1.10 }] },
    { id: "PROD-019", codigo: "BER-01", nome: "Bermuda Tactel / Helanca Escolar", categoria: "Linha Esportiva & Escolar", tipoMalhaPadrao: "Tecido Tactel Microfibra ou Helanca", consumoMalhaKgPorPeca: 0.70, custoMaoDeObraBase: 6.50, aviamentosPadrao: [{ nome: "Elástico 35mm", qtd: 1, custoUnitario: 1.80 }, { nome: "Cordão com Ponteira", qtd: 1, custoUnitario: 1.20 }] },
    { id: "PROD-020", codigo: "MOL-01", nome: "Moletom Canguru com Capuz 3 Cabos", categoria: "Linha Inverno & Escolar", tipoMalhaPadrao: "Moletom Flanelado 50% Alg / 50% Pol", consumoMalhaKgPorPeca: 0.65, custoMaoDeObraBase: 14.00, aviamentosPadrao: [{ nome: "Cordão Algodão Grosso", qtd: 1, custoUnitario: 2.50 }, { nome: "Ilhós de Metal (par)", qtd: 1, custoUnitario: 0.80 }, { nome: "Punho e Barra Canelada", qtd: 1, custoUnitario: 4.50 }] },
    { id: "PROD-021", codigo: "MOL-02", nome: "Moletom Careca Fechado Tradicional", categoria: "Linha Inverno & Escolar", tipoMalhaPadrao: "Moletom 2 Cabos PA", consumoMalhaKgPorPeca: 0.55, custoMaoDeObraBase: 11.00, aviamentosPadrao: [{ nome: "Ribana Gola, Punho e Barra", qtd: 1, custoUnitario: 4.00 }] },
    { id: "PROD-022", codigo: "AVE-01", nome: "Avental de Cozinha / Barbeiro com Bolso", categoria: "Gastronomia & Serviços", tipoMalhaPadrao: "Brim Médio ou Oxford Pesado", consumoMalhaKgPorPeca: 0.90, custoMaoDeObraBase: 8.00, aviamentosPadrao: [{ nome: "Alça Algodão Trançado", qtd: 2, custoUnitario: 3.00 }, { nome: "Regulador de Metal", qtd: 1, custoUnitario: 1.50 }] },
    { id: "PROD-023", codigo: "DOL-01", nome: "Dolmã de Chef Gastronomia c/ Botão de Pressão", categoria: "Gastronomia & Serviços", tipoMalhaPadrao: "Sarja Leve 100% Algodão ou Oxfordine", consumoMalhaKgPorPeca: 1.85, custoMaoDeObraBase: 22.00, aviamentosPadrao: [{ nome: "Botões de Pressão Inox", qtd: 10, custoUnitario: 4.50 }] },
    { id: "PROD-024", codigo: "JAQ-01", nome: "Jaqueta Corta-Vento Repelente à Água", categoria: "Linha Inverno & Escolar", tipoMalhaPadrao: "Tecido Aspen / Nylon Resinado", consumoMalhaKgPorPeca: 1.60, custoMaoDeObraBase: 24.00, aviamentosPadrao: [{ nome: "Zíper Tratorado Destacável", qtd: 1, custoUnitario: 6.80 }, { nome: "Elástico e Regulador", qtd: 2, custoUnitario: 3.20 }] },
    { id: "PROD-025", codigo: "UV-01", nome: "Camisa Térmica Segunda Pele UV50+", categoria: "Promocional & Uniforme Leve", tipoMalhaPadrao: "Malha Poliamida com Elastano UV50+", consumoMalhaKgPorPeca: 0.26, custoMaoDeObraBase: 8.00, aviamentosPadrao: [{ nome: "Etiqueta Termocolante UV", qtd: 1, custoUnitario: 0.60 }] },
    { id: "PROD-026", codigo: "COL-01", nome: "Colete Refletivo Operacional Fechamento Zíper", categoria: "Linha Pesada & Operacional", tipoMalhaPadrao: "Tecido Poliéster com Faixas Fluorescentes", consumoMalhaKgPorPeca: 0.85, custoMaoDeObraBase: 9.50, aviamentosPadrao: [{ nome: "Faixa Refletiva 50mm (3m)", qtd: 1, custoUnitario: 12.00 }, { nome: "Zíper Frontal 50cm", qtd: 1, custoUnitario: 3.50 }] },
    { id: "PROD-027", codigo: "BON-01", nome: "Boné 6 Gomos Bordado Brim/Microfibra", categoria: "Acessórios", tipoMalhaPadrao: "Brim Peletizado ou Microfibra", consumoMalhaKgPorPeca: 0.20, custoMaoDeObraBase: 9.00, aviamentosPadrao: [{ nome: "Aba Plástica Interna", qtd: 1, custoUnitario: 1.80 }, { nome: "Fivela de Metal Traseira", qtd: 1, custoUnitario: 1.50 }] },
    { id: "PROD-028", codigo: "BER-02", nome: "Bermuda Operacional Cargo Sarja", categoria: "Linha Pesada & Operacional", tipoMalhaPadrao: "Tecido Brim Médio 100% Algodão", consumoMalhaKgPorPeca: 0.95, custoMaoDeObraBase: 10.50, aviamentosPadrao: [{ nome: "Zíper Metal 15cm", qtd: 1, custoUnitario: 2.20 }, { nome: "Botão Militar", qtd: 3, custoUnitario: 0.60 }] }
  ],

  // CATÁLOGO MESTRE DE TODOS OS INSUMOS EXISTENTES NA CONFECÇÃO TÊXTIL
  insumosCatalogoMestre: [
    // 1. Malhas
    { id: "CAT-MAL-01", nome: "Malha Piquet PA (50% Algodão / 50% Poliéster)", categoria: "Malhas e Tecidos", unidade: "kg", rendimentoMedioPorKg: 3.5, coresDisponiveis: ["Azul Marinho", "Branco Alvejado", "Preto Reativo", "Cinza Mescla", "Vermelho Ferrari", "Azul Royal", "Verde Bandeira", "Bordô"] },
    { id: "CAT-MAL-02", nome: "Meia Malha 30.1 Penteada 100% Algodão", categoria: "Malhas e Tecidos", unidade: "kg", rendimentoMedioPorKg: 4.5, coresDisponiveis: ["Branco Neve", "Preto Intenso", "Azul Marinho", "Cinza Mescla Claro", "Amarelo Canário", "Laranja", "Vermelho"] },
    { id: "CAT-MAL-03", nome: "Malha Poliviscose PV Anti-Pilling (67% Pol / 33% Visc)", categoria: "Malhas e Tecidos", unidade: "kg", rendimentoMedioPorKg: 4.3, coresDisponiveis: ["Azul Marinho", "Preto", "Branco", "Cinza Chumbo", "Verde Petróleo"] },
    { id: "CAT-MAL-04", nome: "Malha Dry Fit Poliéster Esportivo Microfibra 130g", categoria: "Malhas e Tecidos", unidade: "kg", rendimentoMedioPorKg: 5.2, coresDisponiveis: ["Azul Royal", "Azul Marinho", "Branco Sublimação", "Preto", "Fluorescente Amarelo", "Fluorescente Laranja"] },
    { id: "CAT-MAL-05", nome: "Moletom Flanelado 3 Cabos (50% Alg / 50% Pol)", categoria: "Malhas e Tecidos", unidade: "kg", rendimentoMedioPorKg: 1.5, coresDisponiveis: ["Cinza Mescla Tradicional", "Preto", "Azul Marinho", "Bordô", "Verde Militar"] },
    { id: "CAT-MAL-06", nome: "Malha Poliamida c/ Elastano Proteção UV50+", categoria: "Malhas e Tecidos", unidade: "kg", rendimentoMedioPorKg: 3.8, coresDisponiveis: ["Preto", "Azul Marinho", "Branco", "Cinza Prata"] },
    // 2. Tecidos Planos
    { id: "CAT-TEC-01", nome: "Tecido Brim Pesado Sarja 100% Algodão 260g", categoria: "Malhas e Tecidos", unidade: "m", rendimentoMedioPorKg: 0.7, coresDisponiveis: ["Cinza Chumbo", "Azul Royal", "Azul Marinho", "Preto", "Cáqui / Areia", "Laranja Segurança"] },
    { id: "CAT-TEC-02", nome: "Tecido Oxford 100% Poliéster Liso", categoria: "Malhas e Tecidos", unidade: "m", rendimentoMedioPorKg: 0.55, coresDisponiveis: ["Branco Neve", "Preto", "Azul Marinho", "Verde Hospitalar", "Azul Celeste"] },
    { id: "CAT-TEC-03", nome: "Tecido Gabardine Nobre com Elastano", categoria: "Malhas e Tecidos", unidade: "m", rendimentoMedioPorKg: 0.5, coresDisponiveis: ["Branco", "Preto", "Azul Marinho", "Rosê", "Nude"] },
    { id: "CAT-TEC-04", nome: "Tecido Rip Stop Anti-Rasgo Militar", categoria: "Malhas e Tecidos", unidade: "m", rendimentoMedioPorKg: 0.6, coresDisponiveis: ["Preto Tático", "Verde Oliva", "Azul Noturno", "Cáqui"] },
    { id: "CAT-TEC-05", nome: "Tecido Tactel Microfibra 100% Poliéster", categoria: "Malhas e Tecidos", unidade: "m", rendimentoMedioPorKg: 0.9, coresDisponiveis: ["Azul Marinho", "Preto", "Vermelho", "Royal", "Cinza"] },
    { id: "CAT-TEC-06", nome: "Tecido Tricoline Mista 60/40 Camisaria", categoria: "Malhas e Tecidos", unidade: "m", rendimentoMedioPorKg: 0.75, coresDisponiveis: ["Branco", "Azul Claro", "Cinza Claro", "Listrado Azul"] },
    // 3. Aviamentos e Retilíneas
    { id: "CAT-AVI-01", nome: "Gola Polo Retilínea Algodão/Poliéster", categoria: "Aviamentos", unidade: "un", coresDisponiveis: ["Marinho c/ Friso Branco", "Branco Liso", "Preto c/ Friso Vermelho", "Royal c/ Friso Branco"] },
    { id: "CAT-AVI-02", nome: "Punho Retilíneo Manga Polo (par)", categoria: "Aviamentos", unidade: "par", coresDisponiveis: ["Azul Marinho", "Branco", "Preto", "Azul Royal"] },
    { id: "CAT-AVI-03", nome: "Ribana Tubular Canelada 1x1 Gola", categoria: "Aviamentos", unidade: "kg", coresDisponiveis: ["Branco", "Preto", "Azul Marinho", "Cinza Mescla"] },
    { id: "CAT-AVI-04", nome: "Botão Poliéster 2 Furos 18mm", categoria: "Aviamentos", unidade: "grosa", coresDisponiveis: ["Azul Marinho", "Branco Alvejado", "Preto", "Transparente"] },
    { id: "CAT-AVI-05", nome: "Botão 4 Furos Resinado Camisa Operacional", categoria: "Aviamentos", unidade: "grosa", coresDisponiveis: ["Cinza Chumbo", "Azul Marinho", "Preto", "Cáqui"] },
    { id: "CAT-AVI-06", nome: "Botão de Pressão Inox 14mm (Dolmã e Avental)", categoria: "Aviamentos", unidade: "un", coresDisponiveis: ["Prateado Cromado", "Preto Fosco"] },
    { id: "CAT-AVI-07", nome: "Zíper Tratorado Reforçado 15cm / 20cm", categoria: "Aviamentos", unidade: "un", coresDisponiveis: ["Cinza", "Preto", "Azul Marinho"] },
    { id: "CAT-AVI-08", nome: "Zíper Invisível 18cm / 50cm", categoria: "Aviamentos", unidade: "un", coresDisponiveis: ["Branco", "Preto", "Azul Marinho"] },
    { id: "CAT-AVI-09", nome: "Faixa Refletiva Termocolante Alta Visibilidade 50mm", categoria: "Aviamentos", unidade: "m", coresDisponiveis: ["Amarelo Fluorescente", "Laranja", "Prata Refletivo"] },
    { id: "CAT-AVI-10", nome: "Elástico Chato Reforçado 30mm / 40mm", categoria: "Aviamentos", unidade: "m", coresDisponiveis: ["Branco", "Preto"] },
    { id: "CAT-AVI-11", nome: "Linha de Costura Reta 120 Cone 10.000m", categoria: "Aviamentos", unidade: "un", coresDisponiveis: ["Azul Marinho", "Branco", "Preto", "Cinza", "Vermelho"] },
    { id: "CAT-AVI-12", nome: "Fio de Overlock Texturizado Cone 5.000m", categoria: "Aviamentos", unidade: "un", coresDisponiveis: ["Branco", "Preto", "Azul Marinho", "Cru"] },
    { id: "CAT-AVI-13", nome: "Entretela Termocolante Tecida de Camisaria", categoria: "Aviamentos", unidade: "m", coresDisponiveis: ["Branco", "Cinza"] },
    // 4. Insumos DTF (Direct to Film)
    { id: "CAT-DTF-01", nome: "Filme DTF Rolo 60cm x 100m Hot/Cold Peel", categoria: "Insumos DTF", unidade: "m", coresDisponiveis: ["Translúcido"] },
    { id: "CAT-DTF-02", nome: "Poliamida Termofusível Branca Especial DTF", categoria: "Insumos DTF", unidade: "kg", coresDisponiveis: ["Branca Micronizada", "Preta p/ Tecidos Escuros"] },
    { id: "CAT-DTF-03", nome: "Tinta DTF Têxtil Pigmentada Branca (White) 1L", categoria: "Insumos DTF", unidade: "litro", coresDisponiveis: ["Branco Ultra Opaco"] },
    { id: "CAT-DTF-04", nome: "Kit Tintas DTF CMYK 1L (Ciano, Magenta, Amarelo, Preto)", categoria: "Insumos DTF", unidade: "litro", coresDisponiveis: ["CMYK Completo"] },
    // 5. Suprimentos de Silk Screen & Bordado
    { id: "CAT-SLK-01", nome: "Tinta Silk Screen Plastisol Alto Relevo 1kg", categoria: "Estamparia & Silk", unidade: "kg", coresDisponiveis: ["Branco", "Preto", "Azul", "Vermelho", "Amarelo"] },
    { id: "CAT-SLK-02", nome: "Emulsão Fotográfica Têxtil Resistente a Água", categoria: "Estamparia & Silk", unidade: "litro", coresDisponiveis: ["Roxo Fotossensível"] },
    { id: "CAT-BRD-01", nome: "Linha de Bordado 100% Trilobal Poliéster 40 4.000m", categoria: "Aviamentos", unidade: "cone", coresDisponiveis: ["Branco", "Dourado", "Prata", "Preto", "Azul Marinho"] },
    // 6. Materiais de Consumo & Manutenção da Fábrica
    { id: "CAT-MAN-01", nome: "Fita Isolante Industrial 19mm x 20m", categoria: "Manutenção Fábrica", unidade: "un", coresDisponiveis: ["Preto"] },
    { id: "CAT-MAN-02", nome: "Óleo Lubrificante Singer Máquina de Costura 1L", categoria: "Manutenção Fábrica", unidade: "litro", coresDisponiveis: ["Transparente Mineral"] },
    { id: "CAT-MAN-03", nome: "Agulha Máquina Reta Industrial Cabo Fino DBx1 (cx 10un)", categoria: "Manutenção Fábrica", unidade: "cx", coresDisponiveis: ["Nº 11", "Nº 14", "Nº 16"] },
    { id: "CAT-MAN-04", nome: "Sacos Plásticos Transparentes Embalagem Camisa (milheiro)", categoria: "Embalagem", unidade: "milheiro", coresDisponiveis: ["Transparente 30x40cm"] }
  ],

  // CADASTRO DE COSTUREIRAS E FACÇÕES
  costureiras: [
    { id: "COST-01", nome: "Oficina Interna - Linha 1 (Polos e Sociais)", responsavel: "Lúcia Ferreira", telefone: "19987112233", especialidade: "Camisas Polo, Retilíneas e Camisaria", capacidadeDiaPecas: 120, valorMedioPorPeca: 7.50, status: "Disponível" },
    { id: "COST-02", nome: "Facção São Jorge (Linha Pesada e Brim)", responsavel: "Jorge Alberto Soares", telefone: "19992334455", especialidade: "Brim Operacional, Pesponto Duplo, Calças Cargo e Macacões", capacidadeDiaPecas: 150, valorMedioPorPeca: 12.00, status: "Em Produção" },
    { id: "COST-03", nome: "Costuraria D. Neusa (Linha Saúde e Jalecos)", responsavel: "Neusa Aparecida", telefone: "11977665544", especialidade: "Jalecos Hospitalares, Gabardine, Oxford e Scrubs", capacidadeDiaPecas: 60, valorMedioPorPeca: 16.00, status: "Disponível" },
    { id: "COST-04", nome: "Oficina Interna - Linha 2 (Básicas, Dry e Moletom)", responsavel: "Elizabete Mendes", telefone: "19981223344", especialidade: "Camisetas Gola Careca, Dry Fit, Overlock e Moletom", capacidadeDiaPecas: 200, valorMedioPorPeca: 5.00, status: "Em Produção" },
    { id: "COST-05", nome: "Facção Ponto de Ouro (Acessórios e Bonés)", responsavel: "Silvana Ramos", telefone: "19971008899", especialidade: "Aventais, Bonés, Coletes e Faixas Refletivas", capacidadeDiaPecas: 100, valorMedioPorPeca: 8.50, status: "Disponível" }
  ],

  // ESTOQUE INICIAL DE MATÉRIA-PRIMA E INSUMOS (CADASTRO PRONTO • SALDO ZERADO PARA PRODUÇÃO)
  estoque: [
    { id: "EST-01", codigo: "MAL-PIQ-AZUL", descricao: "Malha Piquet PA Azul Marinho", categoria: "Malhas e Tecidos", unidade: "kg", saldoAtual: 0, estoqueMinimo: 50, custoMedioUnitario: 48.50, fornecedorUltimo: "Malharia Textil Sul" },
    { id: "EST-02", codigo: "MAL-PIQ-BRANCO", descricao: "Malha Piquet PA Branco Alvejado", categoria: "Malhas e Tecidos", unidade: "kg", saldoAtual: 0, estoqueMinimo: 40, custoMedioUnitario: 46.00, fornecedorUltimo: "Malharia Textil Sul" },
    { id: "EST-03", codigo: "MAL-PIQ-PRETO", descricao: "Malha Piquet PA Preto Reativo", categoria: "Malhas e Tecidos", unidade: "kg", saldoAtual: 0, estoqueMinimo: 40, custoMedioUnitario: 50.00, fornecedorUltimo: "Malharia Textil Sul" },
    { id: "EST-04", codigo: "MAL-301-BRANCO", descricao: "Meia Malha 30.1 Penteada Algodão Branco", categoria: "Malhas e Tecidos", unidade: "kg", saldoAtual: 0, estoqueMinimo: 50, custoMedioUnitario: 44.00, fornecedorUltimo: "Fiação Vale do Itajaí" },
    { id: "EST-05", codigo: "MAL-DRY-AZUL", descricao: "Malha Dry Fit Poliéster Azul Royal", categoria: "Malhas e Tecidos", unidade: "kg", saldoAtual: 0, estoqueMinimo: 30, custoMedioUnitario: 38.00, fornecedorUltimo: "Tecelagem Paulista" },
    { id: "EST-06", codigo: "TEC-BRIM-CINZA", descricao: "Tecido Brim Pesado 100% Algodão Cinza", categoria: "Malhas e Tecidos", unidade: "m", saldoAtual: 0, estoqueMinimo: 80, custoMedioUnitario: 22.80, fornecedorUltimo: "Santista Têxtil" },
    { id: "EST-07", codigo: "TEC-OXFORD-BRANCO", descricao: "Tecido Oxford Branco 100% Poliéster", categoria: "Malhas e Tecidos", unidade: "m", saldoAtual: 0, estoqueMinimo: 50, custoMedioUnitario: 14.50, fornecedorUltimo: "Tecidos Aliança" },
    { id: "EST-08", codigo: "AVI-GOLA-AZUL", descricao: "Gola Polo Retilínea Azul Marinho c/ Friso Branco", categoria: "Aviamentos", unidade: "un", saldoAtual: 0, estoqueMinimo: 100, custoMedioUnitario: 3.20, fornecedorUltimo: "Golas & Punhos BR" },
    { id: "EST-09", codigo: "AVI-PUNHO-AZUL", descricao: "Punho Retilíneo Manga Azul Marinho", categoria: "Aviamentos", unidade: "par", saldoAtual: 0, estoqueMinimo: 100, custoMedioUnitario: 2.20, fornecedorUltimo: "Golas & Punhos BR" },
    { id: "EST-10", codigo: "AVI-BOT-POLO", descricao: "Botão Poliéster 2 Furos 18mm", categoria: "Aviamentos", unidade: "grosa", saldoAtual: 0, estoqueMinimo: 5, custoMedioUnitario: 14.00, fornecedorUltimo: "Aviamentos Central" },
    { id: "EST-11", codigo: "DTF-FILME-60", descricao: "Filme DTF Rolo 60cm x 100m", categoria: "Insumos DTF", unidade: "m", saldoAtual: 0, estoqueMinimo: 20, custoMedioUnitario: 12.00, fornecedorUltimo: "DTF Pro Suprimentos" },
    { id: "EST-12", codigo: "DTF-PO-POLIAM", descricao: "Poliamida Termofusível Branca Especial DTF", categoria: "Insumos DTF", unidade: "kg", saldoAtual: 0, estoqueMinimo: 5, custoMedioUnitario: 95.00, fornecedorUltimo: "DTF Pro Suprimentos" },
    { id: "EST-13", codigo: "LINHA-120-MAR", descricao: "Cone Linha Reta 120 10.000m Azul Marinho", categoria: "Aviamentos", unidade: "un", saldoAtual: 0, estoqueMinimo: 3, custoMedioUnitario: 18.50, fornecedorUltimo: "Fios & Linhas Brasil" },
    { id: "EST-14", codigo: "TINTA-DTF-BRANCA", descricao: "Tinta DTF Textil Pigmentada Branca 1L", categoria: "Insumos DTF", unidade: "litro", saldoAtual: 0, estoqueMinimo: 2, custoMedioUnitario: 210.00, fornecedorUltimo: "DTF Pro Suprimentos" },
    { id: "EST-15", codigo: "REFLETIVO-50MM", descricao: "Faixa Refletiva Termocolante Alta Visibilidade 50mm", categoria: "Aviamentos", unidade: "m", saldoAtual: 0, estoqueMinimo: 20, custoMedioUnitario: 5.50, fornecedorUltimo: "Segurança & Fitas Ltda" }
  ],

  // CLIENTES CADASTRADOS (CRM COMPLETO - LIMPO PARA OPERAÇÃO REAL)
  clientes: [],

  // PEDIDOS E ORÇAMENTOS (LIMPO PARA OPERAÇÃO REAL)
  pedidos: [],

  // ORDENS DE SERVIÇO TÉCNICAS (LIMPO PARA OPERAÇÃO REAL)
  ordensServico: [],

  // DESPESAS FIXAS MENSAIS (PARA DRE E BALANÇO FINANCEIRO REAL DA FÁBRICA)
  despesasFixas: [
    { id: "DESP-01", descricao: "Aluguel Galpão Industrial e IPTU", categoria: "Instalações", valorMensal: 6500.00 },
    { id: "DESP-02", descricao: "Energia Elétrica Industrial (Enel Fábrica)", categoria: "Utilidades", valorMensal: 2850.00 },
    { id: "DESP-03", descricao: "Folha de Pagamento Fixa (Cortador, PCP, Admin)", categoria: "Mão de Obra Fixa", valorMensal: 14200.00 },
    { id: "DESP-04", descricao: "Manutenção Preventiva de Máquinas e Bordadeiras", categoria: "Manutenção", valorMensal: 1100.00 },
    { id: "DESP-05", descricao: "Internet Fibra + Telefonia Móvel Comercial", categoria: "Comunicação", valorMensal: 450.00 },
    { id: "DESP-06", descricao: "Honorários Contabilidade e Licenças de Software", categoria: "Serviços Terceiros", valorMensal: 1350.00 },
    { id: "DESP-07", descricao: "Água, Limpeza e Descartáveis de Oficina", categoria: "Utilidades", valorMensal: 620.00 }
  ],

  // LANÇAMENTOS FINANCEIROS (FLUXO DE CAIXA: ENTRADAS E SAÍDAS - LIMPO)
  lancamentosFinanceiros: [],

  // FILA DE NESTING DTF (OTIMIZADOR DE ROLO 58CM - LIMPO)
  nestingFila: [],

  // NOTAS FISCAIS ELETRÔNICAS SEFAZ (LIMPO)
  notasFiscais: [],

  // COMPRAS DE INSUMOS E LANÇAMENTOS AVULSOS (LIMPO)
  compras: [],

  // EQUIPE E COLABORADORES DA FÁBRICA
  equipe: [
    { id: "USR-01", nome: "Carlos Eduardo Mendes", email: "carlos@texpro.com.br", cargo: "Administrador Geral / Diretor", nivelAcesso: "Admin", status: "Ativo", capacidadeDiaPecas: 0, valorRemuneracao: 9500.00 },
    { id: "USR-02", nome: "Marcos Paulo Silva", email: "marcos@texpro.com.br", cargo: "Vendedor Técnico Corporativo", nivelAcesso: "Comercial", status: "Ativo", capacidadeDiaPecas: 0, valorRemuneracao: 4200.00 },
    { id: "USR-03", nome: "Fabiana Toledo", email: "fabiana@texpro.com.br", cargo: "Vendedora Linha Operacional e Escolar", nivelAcesso: "Comercial", status: "Ativo", capacidadeDiaPecas: 0, valorRemuneracao: 4200.00 },
    { id: "USR-04", nome: "Vanderlei Souza", email: "vanderlei@texpro.com.br", cargo: "Encarregado de Corte & PCP", nivelAcesso: "Producao", status: "Ativo", capacidadeDiaPecas: 400, valorRemuneracao: 3800.00 },
    { id: "USR-05", nome: "Ana Paula Guedes", email: "financeiro@texpro.com.br", cargo: "Analista Financeiro e Fiscal", nivelAcesso: "Financeiro", status: "Ativo", capacidadeDiaPecas: 0, valorRemuneracao: 3500.00 },
    { id: "USR-06", nome: "Lúcia Ferreira", email: "costura1@texpro.com.br", cargo: "Costureira Chefe Linha Polos", nivelAcesso: "Producao", status: "Ativo", capacidadeDiaPecas: 120, valorRemuneracao: 2800.00 }
  ]
};
