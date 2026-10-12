/**
 * UNIFORMES ERP - MOTOR INDUSTRIAL DE NESTING DTF (DIRECT TO FILM)
 * Otimizador algorítmico 2D para aproveitamento máximo de rolos de impressão têxtil
 * Suporte a Encaixe por Pedido, Divisão em Arquivos por Metragem, Renderização Real de Imagens & Exportação RIP
 */

window.DtfNestingEngine = {
  // Configurações padrão da impressora DTF
  configPadrao: {
    larguraRoloCm: 58.0,          // Largura útil do rolo DTF (Rolo 60cm com 1cm de borda de segurança)
    espacamentoEntreArtesCm: 0.5, // Margem de segurança de corte (5mm)
    custoMetroLinear: 60.00,      // Custo médio por metro linear de impressão DTF profissional
    separarPorPedido: true,       // Agrupa artes por pedido para organização de corte
    maxMetrosPorArquivo: 0        // 0 = contínuo, >0 divide em arquivos de X metros (ex: 2.0m)
  },

  // Cache de imagens em memória para renderização fluida no Canvas
  cacheImagens: new Map(),

  /**
   * Pré-carrega uma imagem (DataURL ou URL) no cache para desenhar no Canvas sem atraso
   */
  obterImagemCache: function(src, callbackAoCarregar) {
    if (!src) return null;
    if (this.cacheImagens.has(src)) {
      const img = this.cacheImagens.get(src);
      if (img.complete && img.naturalWidth > 0) return img;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      this.cacheImagens.set(src, img);
      if (typeof callbackAoCarregar === 'function') callbackAoCarregar(img);
    };
    img.onerror = () => {
      this.cacheImagens.delete(src);
    };
    img.src = src;
    this.cacheImagens.set(src, img);
    return img;
  },

  /**
   * Empacota um grupo de itens em prateleiras (Shelf Packing Heuristic)
   */
  empacotarPrateleiras: function(itens, W_ROLO, GAP, yInicial = 0) {
    // Ordenação por maior dimensão decrescente (First-Fit Decreasing)
    itens.sort((a, b) => Math.max(b.w, b.h) - Math.max(a.w, a.h));

    let prateleiras = [];
    let prateleiraAtual = {
      y: yInicial,
      alturaMaxima: 0,
      larguraUsada: 0,
      itens: []
    };

    itens.forEach(item => {
      let wNormal = item.w;
      let hNormal = item.h;
      let wRot = item.h;
      let hRot = item.w;

      // Se a rotação manual foi travada pelo usuário
      const permiteRotacao = item.permitirRotacao !== false;

      let melhorOrientacao = null;

      const cabeNormal = (prateleiraAtual.larguraUsada + wNormal + (prateleiraAtual.itens.length > 0 ? GAP : 0)) <= W_ROLO;
      const cabeRot = permiteRotacao && ((prateleiraAtual.larguraUsada + wRot + (prateleiraAtual.itens.length > 0 ? GAP : 0)) <= W_ROLO);

      if (cabeNormal && cabeRot) {
        if (hNormal <= hRot) {
          melhorOrientacao = { w: wNormal, h: hNormal, rotacionado: false };
        } else {
          melhorOrientacao = { w: wRot, h: hRot, rotacionado: true };
        }
      } else if (cabeNormal) {
        melhorOrientacao = { w: wNormal, h: hNormal, rotacionado: false };
      } else if (cabeRot) {
        melhorOrientacao = { w: wRot, h: hRot, rotacionado: true };
      }

      if (melhorOrientacao) {
        const xPos = prateleiraAtual.larguraUsada + (prateleiraAtual.itens.length > 0 ? GAP : 0);
        prateleiraAtual.itens.push({
          id: item.id,
          nome: item.nome,
          cliente: item.cliente,
          pedidoId: item.pedidoId,
          pedidoNumero: item.pedidoNumero,
          arquivoNome: item.arquivoNome,
          imagemDataUrl: item.imagemDataUrl,
          x: xPos,
          y: prateleiraAtual.y,
          w: melhorOrientacao.w,
          h: melhorOrientacao.h,
          wOriginal: item.w,
          hOriginal: item.h,
          rotacionado: melhorOrientacao.rotacionado,
          cor: item.cor || '#0284c7'
        });
        prateleiraAtual.larguraUsada = xPos + melhorOrientacao.w;
        prateleiraAtual.alturaMaxima = Math.max(prateleiraAtual.alturaMaxima, melhorOrientacao.h);
      } else {
        // Nova prateleira
        if (prateleiraAtual.itens.length > 0) {
          prateleiras.push(prateleiraAtual);
        }

        const novoY = prateleiraAtual.y + (prateleiraAtual.alturaMaxima > 0 ? (prateleiraAtual.alturaMaxima + GAP) : 0);

        let wFinal = wNormal;
        let hFinal = hNormal;
        let rot = false;

        if (permiteRotacao) {
          if (wNormal > W_ROLO && wRot <= W_ROLO) {
            wFinal = wRot;
            hFinal = hRot;
            rot = true;
          } else if (wRot <= W_ROLO && hRot < hNormal) {
            wFinal = wRot;
            hFinal = hRot;
            rot = true;
          }
        }

        prateleiraAtual = {
          y: novoY,
          alturaMaxima: hFinal,
          larguraUsada: wFinal,
          itens: [{
            id: item.id,
            nome: item.nome,
            cliente: item.cliente,
            pedidoId: item.pedidoId,
            pedidoNumero: item.pedidoNumero,
            arquivoNome: item.arquivoNome,
            imagemDataUrl: item.imagemDataUrl,
            x: 0,
            y: novoY,
            w: wFinal,
            h: hFinal,
            wOriginal: item.w,
            hOriginal: item.h,
            rotacionado: rot,
            cor: item.cor || '#0284c7'
          }]
        };
      }
    });

    if (prateleiraAtual.itens.length > 0) {
      prateleiras.push(prateleiraAtual);
    }

    return prateleiras;
  },

  /**
   * Executa o algoritmo completo de encaixe 2D com suporte a separação por pedido e quebra de páginas
   */
  processarNesting: function(listaArtes, configCustom) {
    const config = Object.assign({}, this.configPadrao, configCustom || {});
    const W_ROLO = parseFloat(config.larguraRoloCm) || 58.0;
    const GAP = parseFloat(config.espacamentoEntreArtesCm) || 0.5;
    const separarPorPedido = config.separarPorPedido !== false;
    const maxMetrosPorArquivo = parseFloat(config.maxMetrosPorArquivo) || 0;

    // 1. Desmembrar as quantidades em itens individuais para alocação
    let itensParaEmpacotar = [];
    (listaArtes || []).forEach(arte => {
      const qtd = parseInt(arte.quantidade || arte.copias, 10) || 1;
      const w = parseFloat(arte.larguraCm) || 10;
      const h = parseFloat(arte.alturaCm) || 10;
      for (let i = 0; i < qtd; i++) {
        itensParaEmpacotar.push({
          id: arte.id,
          nome: arte.nome || arte.descricao || "Arte",
          cliente: arte.cliente || arte.clienteNome || "Cliente",
          pedidoId: arte.pedidoId || "AVULSO",
          pedidoNumero: arte.pedidoNumero || "Avulso",
          arquivoNome: arte.arquivoNome || "arte.png",
          imagemDataUrl: arte.imagemDataUrl || arte.arquivoDataUrl || null,
          w: w,
          h: h,
          permitirRotacao: arte.permitirRotacao !== false,
          cor: arte.cor || '#0284c7',
          instanciaIndex: i + 1,
          totalInstancias: qtd
        });
      }
    });

    let prateleiras = [];
    let separadoresVisuais = [];

    // 2. Empacotamento com Separação por Pedido ou Otimização Contínua
    if (separarPorPedido && itensParaEmpacotar.length > 0) {
      // Agrupa itens por identificador de pedido
      const gruposPorPedido = new Map();
      itensParaEmpacotar.forEach(item => {
        const chave = String(item.pedidoNumero || item.pedidoId || 'Avulso');
        if (!gruposPorPedido.has(chave)) gruposPorPedido.set(chave, []);
        gruposPorPedido.get(chave).push(item);
      });

      let yCursor = 0;
      let contadorGrupo = 0;

      gruposPorPedido.forEach((itensDoPedido, chavePedido) => {
        if (contadorGrupo > 0) {
          // Insere separador visual de corte entre pedidos
          const hSeparador = 2.5; // 2.5cm de faixa de corte
          separadoresVisuais.push({
            y: yCursor + GAP,
            h: hSeparador,
            pedidoNumero: chavePedido,
            clienteNome: itensDoPedido[0]?.cliente || 'Cliente',
            totalPecas: itensDoPedido.length
          });
          yCursor += GAP + hSeparador + GAP;
        }

        const prateleirasDoPedido = this.empacotarPrateleiras(itensDoPedido, W_ROLO, GAP, yCursor);
        prateleiras = prateleiras.concat(prateleirasDoPedido);

        // Atualiza yCursor para o final deste pedido
        prateleirasDoPedido.forEach(prat => {
          yCursor = Math.max(yCursor, prat.y + prat.alturaMaxima);
        });

        contadorGrupo++;
      });
    } else {
      // Encaixe contínuo livre (First-Fit Decreasing global)
      prateleiras = this.empacotarPrateleiras(itensParaEmpacotar, W_ROLO, GAP, 0);
    }

    // 3. Consolidação das artes e cálculo da altura máxima
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

    separadoresVisuais.forEach(sep => {
      alturaTotalCm = Math.max(alturaTotalCm, sep.y + sep.h);
    });

    const metrosLinearesTotais = alturaTotalCm > 0 ? (alturaTotalCm / 100) : 0;
    const areaTotalRoloCm2 = W_ROLO * alturaTotalCm;
    const taxaAproveitamento = areaTotalRoloCm2 > 0 ? (areaUtilArtesCm2 / areaTotalRoloCm2) * 100 : 0;
    const taxaDesperdicio = Math.max(0, 100 - taxaAproveitamento);
    const custoTotalRolo = metrosLinearesTotais * config.custoMetroLinear;
    const totalItens = todasArtesPosicionadas.length;
    const custoMedioPorArte = totalItens > 0 ? (custoTotalRolo / totalItens) : 0;

    // 4. Divisão em Páginas/Arquivos caso haja limite de metros por arquivo
    let arquivosPaginados = [];
    if (maxMetrosPorArquivo > 0 && metrosLinearesTotais > 0) {
      const maxCmPorArquivo = maxMetrosPorArquivo * 100;
      let arquivoAtual = {
        index: 1,
        yInicio: 0,
        yFim: 0,
        alturaCm: 0,
        metrosLineares: 0,
        artes: [],
        separadores: []
      };

      let limiteYAtual = maxCmPorArquivo;

      prateleiras.forEach(prat => {
        const pratFimY = prat.y + prat.alturaMaxima;

        // Se ultrapassar o limite do arquivo atual (e o arquivo atual já tiver itens), fecha e abre próximo
        if (pratFimY > limiteYAtual && arquivoAtual.artes.length > 0) {
          arquivoAtual.alturaCm = parseFloat((arquivoAtual.yFim - arquivoAtual.yInicio).toFixed(1));
          arquivoAtual.metrosLineares = parseFloat((arquivoAtual.alturaCm / 100).toFixed(2));
          arquivosPaginados.push(arquivoAtual);

          const novoIndex = arquivosPaginados.length + 1;
          arquivoAtual = {
            index: novoIndex,
            yInicio: prat.y,
            yFim: pratFimY,
            alturaCm: 0,
            metrosLineares: 0,
            artes: [],
            separadores: []
          };
          limiteYAtual = prat.y + maxCmPorArquivo;
        }

        // Adiciona itens com coordenadas ajustadas ao arquivo
        prat.itens.forEach(it => {
          arquivoAtual.artes.push(Object.assign({}, it, {
            yNoArquivo: it.y - arquivoAtual.yInicio
          }));
        });
        arquivoAtual.yFim = Math.max(arquivoAtual.yFim, pratFimY);
      });

      if (arquivoAtual.artes.length > 0) {
        arquivoAtual.alturaCm = parseFloat((arquivoAtual.yFim - arquivoAtual.yInicio).toFixed(1));
        arquivoAtual.metrosLineares = parseFloat((arquivoAtual.alturaCm / 100).toFixed(2));
        arquivosPaginados.push(arquivoAtual);
      }
    } else {
      // Arquivo único contínuo
      arquivosPaginados.push({
        index: 1,
        yInicio: 0,
        yFim: alturaTotalCm,
        alturaCm: parseFloat(alturaTotalCm.toFixed(1)),
        metrosLineares: parseFloat(metrosLinearesTotais.toFixed(2)),
        artes: todasArtesPosicionadas.map(it => Object.assign({}, it, { yNoArquivo: it.y })),
        separadores: separadoresVisuais
      });
    }

    return {
      larguraRoloCm: W_ROLO,
      alturaTotalCm: parseFloat(alturaTotalCm.toFixed(1)),
      metrosLinearesTotais: parseFloat(metrosLinearesTotais.toFixed(2)),
      areaUtilArtesCm2: parseFloat(areaUtilArtesCm2.toFixed(1)),
      areaTotalRoloCm2: parseFloat(areaTotalRoloCm2.toFixed(1)),
      taxaAproveitamentoPercentual: parseFloat(taxaAproveitamento.toFixed(1)),
      taxaDesperdicioPercentual: parseFloat(taxaDesperdicio.toFixed(1)),
      custoTotalRolo: parseFloat(custoTotalRolo.toFixed(2)),
      custoMedioPorArte: parseFloat(custoMedioPorArte.toFixed(2)),
      totalItensProcessados: totalItens,
      artesPosicionadas: todasArtesPosicionadas,
      separadoresVisuais: separadoresVisuais,
      arquivos: arquivosPaginados,
      config: config
    };
  },

  /**
   * Renderiza graficamente o rolo de impressão DTF no Canvas HTML5 com Imagens Reais e Réguas
   */
  renderizarCanvas: function(canvas, resultadoNesting, opcoes = {}) {
    if (!canvas || !resultadoNesting) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W_ROLO = resultadoNesting.larguraRoloCm;
    const zoom = parseFloat(opcoes.zoom) || 1.0;
    const arquivoIndex = parseInt(opcoes.arquivoIndex, 10) || 0; // 0 = rolo completo, >=1 = página específica

    let artesParaDesenhar = resultadoNesting.artesPosicionadas;
    let separadoresParaDesenhar = resultadoNesting.separadoresVisuais || [];
    let H_DESENHO = Math.max(20, resultadoNesting.alturaTotalCm);
    let yOffsetArquivo = 0;

    // Se estiver visualizando um arquivo paginado específico
    if (arquivoIndex > 0 && resultadoNesting.arquivos && resultadoNesting.arquivos[arquivoIndex - 1]) {
      const arq = resultadoNesting.arquivos[arquivoIndex - 1];
      artesParaDesenhar = arq.artes;
      H_DESENHO = Math.max(20, arq.alturaCm);
      yOffsetArquivo = arq.yInicio;
      separadoresParaDesenhar = (resultadoNesting.separadoresVisuais || []).filter(s => s.y >= arq.yInicio && s.y <= arq.yFim);
    }

    // Calcula dimensões do Canvas com base no container e zoom
    const containerWidth = canvas.parentElement ? (canvas.parentElement.clientWidth || 600) : 600;
    const margemReguaX = 36; // Espaço da régua vertical em cm/m
    const margemReguaY = 30; // Espaço da régua horizontal em cm

    const larguraDisponivel = Math.max(200, containerWidth - margemReguaX - 30);
    const escalaBase = larguraDisponivel / W_ROLO;
    const escala = escalaBase * zoom;

    const roloPixelW = W_ROLO * escala;
    const roloPixelH = H_DESENHO * escala;

    canvas.width = Math.ceil(roloPixelW + margemReguaX + 40);
    canvas.height = Math.ceil(roloPixelH + margemReguaY + 50);

    // Limpa fundo
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const offsetX = margemReguaX + 10;
    const offsetY = margemReguaY + 10;

    // 1. RÉGUA HORIZONTAL (Centímetros no Topo)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(offsetX, 4, roloPixelW, margemReguaY - 4);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.strokeRect(offsetX, 4, roloPixelW, margemReguaY - 4);

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';

    for (let cm = 0; cm <= W_ROLO; cm += 5) {
      const xPos = offsetX + (cm * escala);
      ctx.beginPath();
      ctx.moveTo(xPos, margemReguaY - 2);
      ctx.lineTo(xPos, cm % 10 === 0 ? 12 : 20);
      ctx.stroke();

      if (cm % 10 === 0 || cm === Math.round(W_ROLO)) {
        ctx.fillText(`${cm}cm`, xPos, 11);
      }
    }

    // 2. RÉGUA VERTICAL (Metros/Centímetros na Esquerda)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(4, offsetY, margemReguaX - 4, roloPixelH);
    ctx.strokeStyle = '#cbd5e1';
    ctx.strokeRect(4, offsetY, margemReguaX - 4, roloPixelH);

    ctx.textAlign = 'right';
    for (let cm = 0; cm <= H_DESENHO; cm += 10) {
      const yPos = offsetY + (cm * escala);
      ctx.beginPath();
      ctx.moveTo(margemReguaX - 2, yPos);
      ctx.lineTo(cm % 50 === 0 ? 10 : 22, yPos);
      ctx.stroke();

      if (cm % 50 === 0 || cm === Math.round(H_DESENHO)) {
        const m = (cm / 100).toFixed(1);
        ctx.fillText(`${m}m`, margemReguaX - 6, yPos + 3);
      }
    }

    // 3. FUNDO DO ROLO DTF (Filme Translúcido com Grid Sutil)
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(offsetX, offsetY, roloPixelW, roloPixelH);

    // Grid sutil milimétrico a cada 5cm
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.45)';
    ctx.lineWidth = 0.5;
    for (let cm = 5; cm < W_ROLO; cm += 5) {
      const x = offsetX + (cm * escala);
      ctx.beginPath();
      ctx.moveTo(x, offsetY);
      ctx.lineTo(x, offsetY + roloPixelH);
      ctx.stroke();
    }

    // Borda sólida do rolo
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(offsetX, offsetY, roloPixelW, roloPixelH);

    // 4. SEPARADORES VISUAIS DE PEDIDO (quando ativar "Separar por Pedido")
    separadoresParaDesenhar.forEach(sep => {
      const sepY = offsetY + ((sep.y - yOffsetArquivo) * escala);
      const sepH = sep.h * escala;

      ctx.fillStyle = '#fef2f2';
      ctx.fillRect(offsetX, sepY, roloPixelW, sepH);

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(offsetX, sepY);
      ctx.lineTo(offsetX + roloPixelW, sepY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(offsetX, sepY + sepH);
      ctx.lineTo(offsetX + roloPixelW, sepY + sepH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`✂️ CORTE - PEDIDO #${sep.pedidoNumero} • ${sep.clienteNome.toUpperCase()} (${sep.totalPecas} estampas)`, offsetX + 10, sepY + (sepH / 2) + 4);
    });

    // 5. RENDERIZAÇÃO REAL DAS ARTES (COM IMAGEM, BORDAS DE CORTE E LABELS)
    let precisaRepintar = false;

    artesParaDesenhar.forEach(arte => {
      const yRelativo = (arte.yNoArquivo !== undefined) ? arte.yNoArquivo : (arte.y - yOffsetArquivo);
      const artX = offsetX + (arte.x * escala);
      const artY = offsetY + (yRelativo * escala);
      const artW = arte.w * escala;
      const artH = arte.h * escala;

      // Fundo branco puro sob a estampa
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(artX, artY, artW, artH);

      // Desenha imagem real da arte se disponível
      if (arte.imagemDataUrl) {
        const img = this.obterImagemCache(arte.imagemDataUrl, () => {
          // Callback assíncrono para repintar assim que a imagem for baixada
          this.renderizarCanvas(canvas, resultadoNesting, opcoes);
        });

        if (img && img.complete && img.naturalWidth > 0) {
          ctx.save();
          // Clipping para manter a imagem dentro dos limites da arte
          ctx.beginPath();
          ctx.rect(artX, artY, artW, artH);
          ctx.clip();

          if (arte.rotacionado) {
            // Rotação de 90 graus no centro do retângulo
            ctx.translate(artX + artW / 2, artY + artH / 2);
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(img, -artH / 2, -artW / 2, artH, artW);
          } else {
            ctx.drawImage(img, artX, artY, artW, artH);
          }
          ctx.restore();
        } else {
          precisaRepintar = true;
        }
      } else {
        // Mockup visual genérico para artes sem arquivo binário
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(artX + 2, artY + 2, artW - 4, artH - 4);
        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎨 DTF', artX + artW / 2, artY + artH / 2);
      }

      // Moldura e Borda de Corte Pontilhada
      ctx.strokeStyle = arte.rotacionado ? '#059669' : '#0284c7';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(artX, artY, artW, artH);

      // Etiqueta com dimensões se couber na tela
      if (artW > 38 && artH > 18) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(artX + 2, artY + artH - 14, Math.min(artW - 4, 110), 12);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'left';
        const labelMedida = `${arte.w.toFixed(1)}x${arte.h.toFixed(1)}cm${arte.rotacionado ? ' ↻' : ''}`;
        ctx.fillText(labelMedida, artX + 4, artY + artH - 5);
      }
    });

    // 6. LINHAS DE CORTE A CADA 1 METRO LINEAR
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.7)';
    ctx.setLineDash([5, 4]);
    for (let m = 100; m < H_DESENHO; m += 100) {
      const lineY = offsetY + (m * escala);
      ctx.beginPath();
      ctx.moveTo(offsetX, lineY);
      ctx.lineTo(offsetX + roloPixelW, lineY);
      ctx.stroke();

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`✂️ MARCA DE CORTE: ${(m / 100)}m`, offsetX + 8, lineY - 3);
    }
    ctx.setLineDash([]);
  },

  /**
   * Exporta a imagem em alta resolução (PNG com canal alpha) pronta para software RIP de impressão DTF
   */
  exportarImagemAltaResolucao: function(resultadoNesting, arquivoIndex = 0, dpi = 150) {
    if (!resultadoNesting) return null;
    const W_ROLO = resultadoNesting.larguraRoloCm;

    let artesParaExportar = resultadoNesting.artesPosicionadas;
    let H_EXPORT = resultadoNesting.alturaTotalCm;
    let yOffset = 0;

    if (arquivoIndex > 0 && resultadoNesting.arquivos && resultadoNesting.arquivos[arquivoIndex - 1]) {
      const arq = resultadoNesting.arquivos[arquivoIndex - 1];
      artesParaExportar = arq.artes;
      H_EXPORT = arq.alturaCm;
      yOffset = arq.yInicio;
    }

    // Converte cm para pixels conforme DPI (1 polegada = 2.54 cm)
    const escalaDpi = dpi / 2.54;
    const canvasOffscreen = document.createElement('canvas');
    canvasOffscreen.width = Math.round(W_ROLO * escalaDpi);
    canvasOffscreen.height = Math.round(H_EXPORT * escalaDpi);

    const ctx = canvasOffscreen.getContext('2d');
    if (!ctx) return null;

    // Fundo transparente puro para impressão DTF
    ctx.clearRect(0, 0, canvasOffscreen.width, canvasOffscreen.height);

    artesParaExportar.forEach(arte => {
      const yRel = (arte.yNoArquivo !== undefined) ? arte.yNoArquivo : (arte.y - yOffset);
      const artX = Math.round(arte.x * escalaDpi);
      const artY = Math.round(yRel * escalaDpi);
      const artW = Math.round(arte.w * escalaDpi);
      const artH = Math.round(arte.h * escalaDpi);

      if (arte.imagemDataUrl) {
        const img = this.obterImagemCache(arte.imagemDataUrl);
        if (img && img.complete) {
          ctx.save();
          if (arte.rotacionado) {
            ctx.translate(artX + artW / 2, artY + artH / 2);
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(img, -artH / 2, -artW / 2, artH, artW);
          } else {
            ctx.drawImage(img, artX, artY, artW, artH);
          }
          ctx.restore();
        }
      }
    });

    return canvasOffscreen.toDataURL('image/png');
  },

  /**
   * Exportação assíncrona em alta resolução (aguarda carregamento total de imagens)
   */
  exportarImagemAltaResolucaoAsync: async function(resultadoNesting, arquivoIndex = 0, dpi = 150) {
    if (!resultadoNesting) return null;
    const W_ROLO = resultadoNesting.larguraRoloCm;

    let artesParaExportar = resultadoNesting.artesPosicionadas;
    let H_EXPORT = Math.max(10, resultadoNesting.alturaTotalCm);
    let yOffset = 0;

    if (arquivoIndex > 0 && resultadoNesting.arquivos && resultadoNesting.arquivos[arquivoIndex - 1]) {
      const arq = resultadoNesting.arquivos[arquivoIndex - 1];
      artesParaExportar = arq.artes;
      H_EXPORT = Math.max(10, arq.alturaCm);
      yOffset = arq.yInicio;
    }

    // Pré-carrega todas as imagens de forma assíncrona
    await Promise.all(artesParaExportar.map(arte => {
      if (!arte.imagemDataUrl) return Promise.resolve(null);
      if (this.cacheImagens.has(arte.imagemDataUrl)) {
        const cached = this.cacheImagens.get(arte.imagemDataUrl);
        if (cached.complete && cached.naturalWidth > 0) return Promise.resolve(cached);
      }
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          this.cacheImagens.set(arte.imagemDataUrl, img);
          resolve(img);
        };
        img.onerror = () => resolve(null);
        img.src = arte.imagemDataUrl;
      });
    }));

    const escalaDpi = dpi / 2.54;
    const canvasOffscreen = document.createElement('canvas');
    canvasOffscreen.width = Math.round(W_ROLO * escalaDpi);
    canvasOffscreen.height = Math.round(H_EXPORT * escalaDpi);

    const ctx = canvasOffscreen.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, canvasOffscreen.width, canvasOffscreen.height);

    artesParaExportar.forEach(arte => {
      const yRel = (arte.yNoArquivo !== undefined) ? arte.yNoArquivo : (arte.y - yOffset);
      const artX = Math.round(arte.x * escalaDpi);
      const artY = Math.round(yRel * escalaDpi);
      const artW = Math.round(arte.w * escalaDpi);
      const artH = Math.round(arte.h * escalaDpi);

      if (arte.imagemDataUrl) {
        const img = this.cacheImagens.get(arte.imagemDataUrl);
        if (img && img.complete && img.naturalWidth > 0) {
          ctx.save();
          if (arte.rotacionado) {
            ctx.translate(artX + artW / 2, artY + artH / 2);
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(img, -artH / 2, -artW / 2, artH, artW);
          } else {
            ctx.drawImage(img, artX, artY, artW, artH);
          }
          ctx.restore();
        }
      }
    });

    return canvasOffscreen.toDataURL('image/png');
  },

  /**
   * Gera a Ficha Técnica de Impressão DTF formatada para A4 / Impressora
   */
  gerarFichaImpressaoHTML: function(resultadoNesting) {
    if (!resultadoNesting) return '';
    const agora = new Date().toLocaleString('pt-BR');
    const artes = resultadoNesting.artesPosicionadas || [];

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Ficha de Produção DTF - Bravvi Uniformes</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 20px; color: #0f172a; font-size: 12px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 16px; }
          .title { font-size: 18px; font-weight: 800; color: #0284c7; }
          .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
          .kpi-card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; text-align: center; }
          .kpi-val { font-size: 16px; font-weight: 800; color: #0284c7; }
          .kpi-lbl { font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
          th { background: #0f172a; color: #ffffff; text-align: left; padding: 6px 10px; }
          td { border-bottom: 1px solid #e2e8f0; padding: 6px 10px; vertical-align: middle; }
          .footer { margin-top: 30px; border-top: 1px dashed #94a3b8; padding-top: 10px; display: flex; justify-content: space-between; font-size: 10px; color: #64748b; }
          @media print {
            .no-print { display: none; }
            body { margin: 10mm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">BRAVVI UNIFORMES • ORDEM TÉCNICA DE IMPRESSÃO DTF</div>
            <div>Emitido em: ${agora} • Sistema Industrial de Nesting</div>
          </div>
          <div class="no-print">
            <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">🖨️ Imprimir Ficha</button>
          </div>
        </div>

        <div class="kpis">
          <div class="kpi-card">
            <div class="kpi-val">${resultadoNesting.metrosLinearesTotais} m</div>
            <div class="kpi-lbl">Metros Lineares (${resultadoNesting.larguraRoloCm}cm)</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-val">${resultadoNesting.taxaAproveitamentoPercentual}%</div>
            <div class="kpi-lbl">Aproveitamento Filme</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-val">${resultadoNesting.totalItensProcessados} un</div>
            <div class="kpi-lbl">Cópias Encaixadas</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-val">${resultadoNesting.arquivos ? resultadoNesting.arquivos.length : 1} arq</div>
            <div class="kpi-lbl">Divisão de Arquivos</div>
          </div>
        </div>

        <h3>Itens Posicionados no Rolo DTF</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Arte / Local</th>
              <th>Dimensões (LxA)</th>
              <th>Orientação</th>
              <th>Posição (X, Y cm)</th>
            </tr>
          </thead>
          <tbody>
            ${artes.map((art, i) => `
              <tr>
                <td><strong>${i + 1}</strong></td>
                <td>#${art.pedidoNumero || 'Avulso'}</td>
                <td>${art.cliente || 'Cliente'}</td>
                <td>${art.nome}</td>
                <td><strong>${art.w.toFixed(1)} x ${art.h.toFixed(1)} cm</strong></td>
                <td>${art.rotacionado ? '↻ Rotacionado 90°' : 'Normal'}</td>
                <td>X: ${art.x.toFixed(1)}cm | Y: ${art.y.toFixed(1)}cm</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <div>Operador da Impressora: ___________________________</div>
          <div>Conferência PCP: ___________________________</div>
          <div>Bravvi Uniformes - ERP Industrial</div>
        </div>
      </body>
      </html>
    `;
  }
};
