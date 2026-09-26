/**
 * UNIFORMES ERP - MOTOR DE NESTING DTF (DIRECT TO FILM)
 * Otimizador algorítmico 2D para aproveitamento máximo de rolos de impressão têxtil
 */

window.DtfNestingEngine = {
  // Configurações padrão da impressora DTF
  configPadrao: {
    larguraRoloCm: 58.0,      // Largura útil do rolo DTF (Rolo de 60cm com 1cm de margem de cada lado)
    espacamentoEntreArtesCm: 0.5, // Margem de segurança para tesoura/guilhotina
    custoMetroLinear: 60.00   // Custo médio por metro linear de impressão DTF profissional
  },

  /**
   * Executa o algoritmo de empacotamento 2D (Shelf Bin-Packing com Rotação Ótima)
   * @param {Array} listaArtes - Array com [{ id, nome, larguraCm, alturaCm, quantidade, cor }]
   * @param {Object} config - Configurações de rolo e espaçamento
   */
  processarNesting: function(listaArtes, configCustom) {
    const config = Object.assign({}, this.configPadrao, configCustom || {});
    const W_ROLO = config.larguraRoloCm;
    const GAP = config.espacamentoEntreArtesCm;

    // 1. Desmembrar as quantidades em itens individuais para alocação
    let itensParaEmpacotar = [];
    listaArtes.forEach(arte => {
      const qtd = parseInt(arte.quantidade, 10) || 1;
      for (let i = 0; i < qtd; i++) {
        itensParaEmpacotar.push({
          id: arte.id,
          nome: arte.nome,
          cliente: arte.cliente || "Geral",
          w: parseFloat(arte.larguraCm),
          h: parseFloat(arte.alturaCm),
          cor: arte.cor || "#3b82f6",
          instanciaIndex: i + 1
        });
      }
    });

    // 2. Ordenação por maior dimensão decrescente (Heurística de First-Fit Decreasing)
    itensParaEmpacotar.sort((a, b) => Math.max(b.w, b.h) - Math.max(a.w, a.h));

    // 3. Algoritmo de Prateleiras (Shelf Packing) com teste de rotação de 90°
    let prateleiras = [];
    let prateleiraAtual = {
      y: 0,
      alturaMaxima: 0,
      larguraUsada: 0,
      itens: []
    };

    itensParaEmpacotar.forEach(item => {
      // Testa orientação normal e rotacionada
      let wNormal = item.w;
      let hNormal = item.h;
      let wRotacionado = item.h;
      let hRotacionado = item.w;

      let melhorOrientacao = null;

      // Verifica se cabe na prateleira atual sem rotação
      const cabeNormalNaPrateleira = (prateleiraAtual.larguraUsada + wNormal + GAP) <= W_ROLO;
      // Verifica se cabe na prateleira atual rotacionado
      const cabeRotacionadoNaPrateleira = (prateleiraAtual.larguraUsada + wRotacionado + GAP) <= W_ROLO;

      if (cabeNormalNaPrateleira && cabeRotacionadoNaPrateleira) {
        // Se ambos cabem, escolhe o que gera menor altura de prateleira (menor desperdício vertical)
        if (hNormal <= hRotacionado) {
          melhorOrientacao = { w: wNormal, h: hNormal, rotacionado: false };
        } else {
          melhorOrientacao = { w: wRotacionado, h: hRotacionado, rotacionado: true };
        }
      } else if (cabeNormalNaPrateleira) {
        melhorOrientacao = { w: wNormal, h: hNormal, rotacionado: false };
      } else if (cabeRotacionadoNaPrateleira) {
        melhorOrientacao = { w: wRotacionado, h: hRotacionado, rotacionado: true };
      }

      if (melhorOrientacao) {
        // Encaixa na prateleira atual
        const xPos = prateleiraAtual.larguraUsada + (prateleiraAtual.itens.length > 0 ? GAP : 0);
        prateleiraAtual.itens.push({
          id: item.id,
          nome: item.nome,
          cliente: item.cliente,
          x: xPos,
          y: prateleiraAtual.y,
          w: melhorOrientacao.w,
          h: melhorOrientacao.h,
          wOriginal: item.w,
          hOriginal: item.h,
          rotacionado: melhorOrientacao.rotacionado,
          cor: item.cor
        });
        prateleiraAtual.larguraUsada = xPos + melhorOrientacao.w;
        prateleiraAtual.alturaMaxima = Math.max(prateleiraAtual.alturaMaxima, melhorOrientacao.h);
      } else {
        // Não cabe na prateleira atual: fecha a prateleira e abre uma nova abaixo
        if (prateleiraAtual.itens.length > 0) {
          prateleiras.push(prateleiraAtual);
        }

        const novoY = prateleiraAtual.y + prateleiraAtual.alturaMaxima + GAP;
        
        // Na nova prateleira, decide a orientação inicial
        let wFinal = wNormal;
        let hFinal = hNormal;
        let rot = false;

        // Se rotacionado couber e for mais baixo, ou se normal for maior que o rolo
        if (wNormal > W_ROLO && wRotacionado <= W_ROLO) {
          wFinal = wRotacionado;
          hFinal = hRotacionado;
          rot = true;
        } else if (wRotacionado <= W_ROLO && hRotacionado < hNormal) {
          wFinal = wRotacionado;
          hFinal = hRotacionado;
          rot = true;
        }

        prateleiraAtual = {
          y: novoY,
          alturaMaxima: hFinal,
          larguraUsada: wFinal,
          itens: [{
            id: item.id,
            nome: item.nome,
            cliente: item.cliente,
            x: 0,
            y: novoY,
            w: wFinal,
            h: hFinal,
            wOriginal: item.w,
            hOriginal: item.h,
            rotacionado: rot,
            cor: item.cor
          }]
        };
      }
    });

    if (prateleiraAtual.itens.length > 0) {
      prateleiras.push(prateleiraAtual);
    }

    // 4. Consolidação das artes posicionadas e cálculo dos totais
    let todasArtesPosicionadas = [];
    let alturaTotalCm = 0;
    let areaUtilArtesCm2 = 0;

    prateleiras.forEach(prat => {
      todasArtesPosicionadas = todasArtesPosicionadas.concat(prat.itens);
      alturaTotalCm = Math.max(alturaTotalCm, prat.y + prat.alturaMaxima);
      prat.itens.forEach(art => {
        areaUtilArtesCm2 += (art.w * art.h);
      });
    });

    // 5. Métricas de Produção e Custos do Rolo
    const metrosLinearesTotais = alturaTotalCm > 0 ? (alturaTotalCm / 100) : 0;
    const areaTotalRoloCm2 = W_ROLO * alturaTotalCm;
    const taxaAproveitamentoPercentual = areaTotalRoloCm2 > 0 ? (areaUtilArtesCm2 / areaTotalRoloCm2) * 100 : 0;
    const taxaDesperdicioPercentual = Math.max(0, 100 - taxaAproveitamentoPercentual);
    const custoTotalRolo = metrosLinearesTotais * config.custoMetroLinear;
    const totalItens = todasArtesPosicionadas.length;
    const custoMedioPorArte = totalItens > 0 ? (custoTotalRolo / totalItens) : 0;

    return {
      larguraRoloCm: W_ROLO,
      alturaTotalCm: parseFloat(alturaTotalCm.toFixed(1)),
      metrosLinearesTotais: parseFloat(metrosLinearesTotais.toFixed(2)),
      areaUtilArtesCm2: parseFloat(areaUtilArtesCm2.toFixed(1)),
      areaTotalRoloCm2: parseFloat(areaTotalRoloCm2.toFixed(1)),
      taxaAproveitamentoPercentual: parseFloat(taxaAproveitamentoPercentual.toFixed(1)),
      taxaDesperdicioPercentual: parseFloat(taxaDesperdicioPercentual.toFixed(1)),
      custoTotalRolo: parseFloat(custoTotalRolo.toFixed(2)),
      custoMedioPorArte: parseFloat(custoMedioPorArte.toFixed(2)),
      totalItensProcessados: totalItens,
      artesPosicionadas: todasArtesPosicionadas
    };
  },

  /**
   * Renderiza graficamente o rolo de impressão DTF no Canvas HTML5
   * @param {HTMLCanvasElement} canvas
   * @param {Object} resultadoNesting - Resultado do processamento
   */
  renderizarCanvas: function(canvas, resultadoNesting) {
    if (!canvas || !resultadoNesting) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W_ROLO = resultadoNesting.larguraRoloCm;
    const H_TOTAL = Math.max(30, resultadoNesting.alturaTotalCm);

    // Ajusta o tamanho físico e a escala do Canvas
    const containerWidth = canvas.parentElement ? canvas.parentElement.clientWidth : 600;
    const escala = (containerWidth - 40) / W_ROLO;

    canvas.width = containerWidth - 20;
    canvas.height = Math.max(250, (H_TOTAL * escala) + 50);

    // Fundo do rolo (Filme DTF Translúcido Claro)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const roloPixelW = W_ROLO * escala;
    const roloPixelH = H_TOTAL * escala;
    const offsetX = 10;
    const offsetY = 20;

    // Fundo do rolo no tema claro
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(offsetX, offsetY, roloPixelW, roloPixelH);

    // Linha de contorno do rolo de 58cm
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(offsetX, offsetY, roloPixelW, roloPixelH);

    // Régua milimétrica no topo
    ctx.fillStyle = "#475569";
    ctx.font = "bold 10px monospace";
    ctx.fillText(`LARGURA ÚTIL DO ROLO: ${W_ROLO} cm`, offsetX + 6, offsetY - 6);
    ctx.fillText(`COMPRIMENTO: ${resultadoNesting.metrosLinearesTotais} metros lineares`, roloPixelW - 200, offsetY - 6);

    // Renderiza cada arte individual encaixada
    resultadoNesting.artesPosicionadas.forEach(arte => {
      const artX = offsetX + (arte.x * escala);
      const artY = offsetY + (arte.y * escala);
      const artW = arte.w * escala;
      const artH = arte.h * escala;

      // Fundo da arte em branco puro
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(artX, artY, artW, artH);

      // Borda nítida de corte
      ctx.strokeStyle = arte.rotacionado ? "#047857" : "#64748b";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(artX, artY, artW, artH);

      // Marcação do texto da arte se houver espaço
      if (artW > 35 && artH > 20) {
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 9px sans-serif";
        const label = arte.nome.length > 14 ? arte.nome.substring(0, 12) + "..." : arte.nome;
        ctx.fillText(label, artX + 4, artY + 12);

        ctx.fillStyle = "#475569";
        ctx.font = "8px monospace";
        ctx.fillText(`${arte.w}x${arte.h}cm ${arte.rotacionado ? '↻90°' : ''}`, artX + 4, artY + 22);
      }
    });

    // Grade de corte pontilhada a cada 1 metro linear
    ctx.strokeStyle = "rgba(185, 28, 28, 0.6)";
    ctx.setLineDash([4, 4]);
    for (let m = 100; m < H_TOTAL; m += 100) {
      const lineY = offsetY + (m * escala);
      ctx.beginPath();
      ctx.moveTo(offsetX, lineY);
      ctx.lineTo(offsetX + roloPixelW, lineY);
      ctx.stroke();

      ctx.fillStyle = "#b91c1c";
      ctx.font = "bold 9px monospace";
      ctx.fillText(`--- CORTE ${(m/100)}m ---`, offsetX + 8, lineY - 3);
    }
    ctx.setLineDash([]);
  }
};
