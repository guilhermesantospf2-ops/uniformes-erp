/**
 * UNIFORMES ERP - MOTOR INDUSTRIAL DE NESTING DTF (DIRECT TO FILM) V2
 * Otimizador algorítmico 2D Skyline Bottom-Left Packing (Zero Buracos)
 * Proporção Geométrica Preservada 100% (Sem Achatamento / Distorção)
 * Motor Inteligente de Remoção de Fundo (Detecção de Bordas estilo Canva)
 * Renderização Retina HD (High DPI) & Exportação RIP em Alta Resolução
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
    if (!src.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      this.cacheImagens.set(src, img);
      if (typeof callbackAoCarregar === 'function') callbackAoCarregar(img);
    };
    img.onerror = () => {
      if (img.crossOrigin) {
        const fallback = new Image();
        fallback.onload = () => {
          this.cacheImagens.set(src, fallback);
          if (typeof callbackAoCarregar === 'function') callbackAoCarregar(fallback);
        };
        fallback.onerror = () => {
          this.cacheImagens.delete(src);
        };
        fallback.src = src;
      } else {
        this.cacheImagens.delete(src);
      }
    };
    img.src = src;
    this.cacheImagens.set(src, img);
    return img;
  },

  /**
   * Carregamento assíncrono garantido de imagem com Promise
   */
  carregarImagemAsync: function(src) {
    if (!src) return Promise.resolve(null);
    if (this.cacheImagens.has(src)) {
      const cached = this.cacheImagens.get(src);
      if (cached.complete && cached.naturalWidth > 0) return Promise.resolve(cached);
    }
    return new Promise((resolve) => {
      const img = new Image();
      if (!src.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        this.cacheImagens.set(src, img);
        resolve(img);
      };
      img.onerror = () => {
        if (img.crossOrigin) {
          const fallback = new Image();
          fallback.onload = () => {
            this.cacheImagens.set(src, fallback);
            resolve(fallback);
          };
          fallback.onerror = () => resolve(null);
          fallback.src = src;
        } else {
          resolve(null);
        }
      };
      img.src = src;
    });
  },

  /**
   * ALGORITMO INDUSTRIAL 2D SKYLINE BOTTOM-LEFT PACKING (TETRIS MILIMÉTRICO SEM BURACOS)
   * Encaixa cada matriz na posição livre mais baixa disponível, eliminando espaços vazios.
   */
  empacotarSkyline2D: function(itens, W_ROLO, GAP, yInicial = 0) {
    if (!itens || !itens.length) return { artes: [], alturaMaxima: yInicial };

    // Ordenação Best-Fit Decreasing: maior dimensão e área decrescente
    itens.sort((a, b) => {
      const maxB = Math.max(b.w, b.h);
      const maxA = Math.max(a.w, a.h);
      if (Math.abs(maxB - maxA) > 0.01) return maxB - maxA;
      return (b.w * b.h) - (a.w * a.h);
    });

    // O Skyline é mantido como lista de segmentos horizontais contíguos cobrindo de x=0 a x=W_ROLO
    let segmentos = [{ x: 0, y: yInicial, width: W_ROLO }];
    let artesPosicionadas = [];

    itens.forEach(item => {
      let melhor = null;

      // Testa orientações: normal e 90° (se permitida)
      const orientacoes = [{ w: item.w, h: item.h, rot: false }];
      if (item.permitirRotacao !== false && Math.abs(item.w - item.h) > 0.05) {
        orientacoes.push({ w: item.h, h: item.w, rot: true });
      }

      for (const ori of orientacoes) {
        const itW = ori.w;
        const itH = ori.h;
        if (itW > W_ROLO + 0.001) continue; // Não cabe na largura do rolo

        // Avalia cada ponto inicial de segmento como posição candidata X
        for (let i = 0; i < segmentos.length; i++) {
          const candX = segmentos[i].x;
          if (candX + itW > W_ROLO + 0.001) continue; // Ultrapassa a borda direita

          // Encontra o Y máximo sob a extensão deste item
          let maxY = yInicial;
          const xFim = candX + itW;
          for (const seg of segmentos) {
            if (seg.x < xFim && (seg.x + seg.width) > candX) {
              maxY = Math.max(maxY, seg.y);
            }
          }

          const topoY = maxY + itH;

          // Seleção da melhor posição: menor Y base, depois menor topo Y, depois menor X
          if (!melhor ||
              maxY < melhor.y - 0.01 ||
              (Math.abs(maxY - melhor.y) <= 0.01 && topoY < melhor.topoY - 0.01) ||
              (Math.abs(maxY - melhor.y) <= 0.01 && Math.abs(topoY - melhor.topoY) <= 0.01 && candX < melhor.x)) {
            melhor = {
              x: candX,
              y: maxY,
              w: itW,
              h: itH,
              rot: ori.rot,
              topoY: topoY
            };
          }
        }
      }

      if (melhor) {
        artesPosicionadas.push({
          id: item.id,
          nome: item.nome,
          cliente: item.cliente,
          pedidoId: item.pedidoId,
          pedidoNumero: item.pedidoNumero,
          arquivoNome: item.arquivoNome,
          imagemDataUrl: item.imagemDataUrl,
          aspectRatio: item.aspectRatio || (item.w / item.h) || 1,
          x: parseFloat(melhor.x.toFixed(2)),
          y: parseFloat(melhor.y.toFixed(2)),
          w: parseFloat(melhor.w.toFixed(2)),
          h: parseFloat(melhor.h.toFixed(2)),
          wOriginal: item.w,
          hOriginal: item.h,
          rotacionado: melhor.rot,
          cor: item.cor || '#0284c7'
        });

        // Atualiza Skyline com o novo segmento e margem GAP
        const novoX = melhor.x;
        const novoW = Math.min(W_ROLO - novoX, melhor.w + GAP);
        const novoY = melhor.y + melhor.h + GAP;
        const novoSeg = { x: novoX, y: novoY, width: novoW };

        let novosSegs = [];
        for (const seg of segmentos) {
          const sIni = seg.x;
          const sFim = seg.x + seg.width;
          const nIni = novoSeg.x;
          const nFim = novoSeg.x + novoSeg.width;

          if (sFim <= nIni || sIni >= nFim) {
            novosSegs.push(seg);
          } else {
            if (sIni < nIni) novosSegs.push({ x: sIni, y: seg.y, width: nIni - sIni });
            if (sFim > nFim) novosSegs.push({ x: nFim, y: seg.y, width: sFim - nFim });
          }
        }
        novosSegs.push(novoSeg);
        novosSegs.sort((a, b) => a.x - b.x);

        // Mescla segmentos contíguos de mesma altura
        let merged = [];
        for (const s of novosSegs) {
          if (s.width <= 0.001) continue;
          if (merged.length > 0 &&
              Math.abs(merged[merged.length - 1].y - s.y) < 0.01 &&
              Math.abs((merged[merged.length - 1].x + merged[merged.length - 1].width) - s.x) < 0.01) {
            merged[merged.length - 1].width += s.width;
          } else {
            merged.push({ ...s });
          }
        }
        segmentos = merged;
      }
    });

    let alturaMaxima = yInicial;
    artesPosicionadas.forEach(a => {
      alturaMaxima = Math.max(alturaMaxima, a.y + a.h);
    });

    return { artes: artesPosicionadas, alturaMaxima: alturaMaxima };
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
      const aspect = arte.aspectRatio || (w / h) || 1;

      for (let i = 0; i < qtd; i++) {
        itensParaEmpacotar.push({
          id: arte.id,
          nome: arte.nome || arte.descricao || "Arte",
          cliente: arte.cliente || arte.clienteNome || "Cliente Oficial",
          pedidoId: arte.pedidoId || "AVULSO",
          pedidoNumero: arte.pedidoNumero || "Avulso",
          arquivoNome: arte.arquivoNome || "arte.png",
          imagemDataUrl: arte.imagemDataUrl || arte.arquivoDataUrl || null,
          aspectRatio: aspect,
          w: w,
          h: h,
          permitirRotacao: arte.permitirRotacao !== false,
          cor: arte.cor || '#0284c7',
          instanciaIndex: i + 1,
          totalInstancias: qtd
        });
      }
    });

    let todasArtesPosicionadas = [];
    let separadoresVisuais = [];
    let alturaTotalCm = 0;

    // 2. Empacotamento 2D Skyline (Separado por Pedido ou Contínuo Global)
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
            y: parseFloat((yCursor + GAP).toFixed(2)),
            h: hSeparador,
            pedidoNumero: chavePedido,
            clienteNome: itensDoPedido[0]?.cliente || 'Cliente Oficial',
            totalPecas: itensDoPedido.length
          });
          yCursor += GAP + hSeparador + GAP;
        }

        const empacotado = this.empacotarSkyline2D(itensDoPedido, W_ROLO, GAP, yCursor);
        todasArtesPosicionadas = todasArtesPosicionadas.concat(empacotado.artes);
        yCursor = Math.max(yCursor, empacotado.alturaMaxima);
        contadorGrupo++;
      });

      alturaTotalCm = yCursor;
    } else {
      // Encaixe 2D Skyline livre (Tetris Global)
      const empacotado = this.empacotarSkyline2D(itensParaEmpacotar, W_ROLO, GAP, 0);
      todasArtesPosicionadas = empacotado.artes;
      alturaTotalCm = empacotado.alturaMaxima;
    }

    // 3. Cálculos de área e taxa de aproveitamento
    let areaUtilArtesCm2 = 0;
    todasArtesPosicionadas.forEach(art => {
      areaUtilArtesCm2 += (art.w * art.h);
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

      // Ordena por posição vertical Y
      todasArtesPosicionadas.sort((a, b) => a.y - b.y);

      todasArtesPosicionadas.forEach(art => {
        const artFimY = art.y + art.h;

        // Se ultrapassar o limite do arquivo atual (e já tiver itens no arquivo atual)
        if (artFimY > limiteYAtual && arquivoAtual.artes.length > 0) {
          arquivoAtual.alturaCm = parseFloat((arquivoAtual.yFim - arquivoAtual.yInicio).toFixed(1));
          arquivoAtual.metrosLineares = parseFloat((arquivoAtual.alturaCm / 100).toFixed(2));
          arquivosPaginados.push(arquivoAtual);

          const novoIndex = arquivosPaginados.length + 1;
          arquivoAtual = {
            index: novoIndex,
            yInicio: art.y,
            yFim: artFimY,
            alturaCm: 0,
            metrosLineares: 0,
            artes: [],
            separadores: []
          };
          limiteYAtual = art.y + maxCmPorArquivo;
        }

        arquivoAtual.artes.push(Object.assign({}, art, {
          yNoArquivo: parseFloat((art.y - arquivoAtual.yInicio).toFixed(2))
        }));
        arquivoAtual.yFim = Math.max(arquivoAtual.yFim, artFimY);
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
   * MOTOR INTELIGENTE DE REMOÇÃO DE FUNDO (Borda Contínua BFS + Suavização Anti-Aliasing + Defringe)
   * Remove fundos sólidos, brancos ou claros preservando letras e elementos internos intactos (estilo Canva).
   */
  removerFundoImagem: async function(fonteImagem, opcoes = {}) {
    if (!fonteImagem) return null;
    const tolerancia = opcoes.tolerancia !== undefined ? opcoes.tolerancia : 38;
    const removerHalo = opcoes.removerHalo !== false;

    const img = await this.carregarImagemAsync(fonteImagem);
    if (!img) return null;

    const canvas = document.createElement('canvas');
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // 1. Amostra as cores dos cantos e bordas para detectar a cor média do fundo
    const amostras = [];
    function addAmostra(pxX, pxY) {
      const idx = (pxY * w + pxX) * 4;
      amostras.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3] });
    }

    for (let dy = 0; dy < Math.min(4, h); dy++) {
      for (let dx = 0; dx < Math.min(4, w); dx++) {
        addAmostra(dx, dy);
        addAmostra(w - 1 - dx, dy);
        addAmostra(dx, h - 1 - dy);
        addAmostra(w - 1 - dx, h - 1 - dy);
      }
    }

    let somaR = 0, somaG = 0, somaB = 0, countValido = 0;
    for (const s of amostras) {
      if (s.a > 50) {
        somaR += s.r; somaG += s.g; somaB += s.b;
        countValido++;
      }
    }
    const bgR = countValido > 0 ? (somaR / countValido) : 255;
    const bgG = countValido > 0 ? (somaG / countValido) : 255;
    const bgB = countValido > 0 ? (somaB / countValido) : 255;

    // Distância de cor ponderada (Redmean Euclidean Distance)
    function distCor(r, g, b) {
      const rmean = (r + bgR) / 2;
      const dr = r - bgR;
      const dg = g - bgG;
      const db = b - bgB;
      return Math.sqrt((((512 + rmean) * dr * dr) >> 8) + 4 * dg * dg + (((767 - rmean) * db * db) >> 8));
    }

    const totalPixels = w * h;
    const isFundo = new Uint8Array(totalPixels);
    const visitado = new Uint8Array(totalPixels);
    const fila = new Int32Array(totalPixels);
    let filaInicio = 0;
    let filaFim = 0;

    const limiarDist = (tolerancia / 100) * 440;

    function checarBorda(pxX, pxY) {
      const pIdx = pxY * w + pxX;
      if (visitado[pIdx]) return;
      visitado[pIdx] = 1;

      const bIdx = pIdx * 4;
      if (data[bIdx + 3] < 30) {
        isFundo[pIdx] = 1;
        fila[filaFim++] = pIdx;
        return;
      }

      const d = distCor(data[bIdx], data[bIdx + 1], data[bIdx + 2]);
      if (d <= limiarDist) {
        isFundo[pIdx] = 1;
        fila[filaFim++] = pIdx;
      }
    }

    // Alimenta fila com os 4 lados do perímetro
    for (let x = 0; x < w; x++) { checarBorda(x, 0); checarBorda(x, h - 1); }
    for (let y = 0; y < h; y++) { checarBorda(0, y); checarBorda(w - 1, y); }

    // BFS Flood Fill estritamente conectado às bordas externas
    while (filaInicio < filaFim) {
      const curIdx = fila[filaInicio++];
      const cx = curIdx % w;
      const cy = Math.floor(curIdx / w);

      const vizinhos = [
        cx > 0 ? curIdx - 1 : -1,
        cx < w - 1 ? curIdx + 1 : -1,
        cy > 0 ? curIdx - w : -1,
        cy < h - 1 ? curIdx + w : -1
      ];

      for (const vIdx of vizinhos) {
        if (vIdx === -1 || visitado[vIdx]) continue;
        visitado[vIdx] = 1;

        const dIdx = vIdx * 4;
        if (data[dIdx + 3] < 30) {
          isFundo[vIdx] = 1;
          fila[filaFim++] = vIdx;
          continue;
        }

        const d = distCor(data[dIdx], data[dIdx + 1], data[dIdx + 2]);
        if (d <= limiarDist) {
          isFundo[vIdx] = 1;
          fila[filaFim++] = vIdx;
        }
      }
    }

    // Suavização de Borda (Feathering) e Remoção de Halo (Defringing)
    const margemSuave = limiarDist * 0.35;

    for (let pIdx = 0; pIdx < totalPixels; pIdx++) {
      const bIdx = pIdx * 4;
      if (isFundo[pIdx]) {
        data[bIdx + 3] = 0; // Transparência total
      } else {
        const cx = pIdx % w;
        const cy = Math.floor(pIdx / w);
        let vizinhoFundo = false;

        if ((cx > 0 && isFundo[pIdx - 1]) ||
            (cx < w - 1 && isFundo[pIdx + 1]) ||
            (cy > 0 && isFundo[pIdx - w]) ||
            (cy < h - 1 && isFundo[pIdx + w])) {
          vizinhoFundo = true;
        }

        if (vizinhoFundo) {
          const d = distCor(data[bIdx], data[bIdx + 1], data[bIdx + 2]);
          if (d < limiarDist + margemSuave) {
            const alphaRatio = Math.max(0, Math.min(1, (d - limiarDist) / margemSuave));
            data[bIdx + 3] = Math.round(data[bIdx + 3] * alphaRatio);

            if (removerHalo && alphaRatio > 0.08 && alphaRatio < 0.95) {
              data[bIdx] = Math.max(0, Math.min(255, Math.round((data[bIdx] - (1 - alphaRatio) * bgR) / alphaRatio)));
              data[bIdx + 1] = Math.max(0, Math.min(255, Math.round((data[bIdx + 1] - (1 - alphaRatio) * bgG) / alphaRatio)));
              data[bIdx + 2] = Math.max(0, Math.min(255, Math.round((data[bIdx + 2] - (1 - alphaRatio) * bgB) / alphaRatio)));
            }
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  },

  /**
   * Renderiza graficamente o rolo de impressão DTF no Canvas HTML5 com Retina HD (2x), Réguas e Proporção Rígida
   */
  renderizarCanvas: function(canvas, resultadoNesting, opcoes = {}) {
    if (!canvas || !resultadoNesting) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W_ROLO = resultadoNesting.larguraRoloCm;
    const zoom = parseFloat(opcoes.zoom) || 1.0;
    const arquivoIndex = parseInt(opcoes.arquivoIndex, 10) || 0;

    let artesParaDesenhar = resultadoNesting.artesPosicionadas;
    let separadoresParaDesenhar = resultadoNesting.separadoresVisuais || [];
    let H_DESENHO = Math.max(20, resultadoNesting.alturaTotalCm);
    let yOffsetArquivo = 0;

    if (arquivoIndex > 0 && resultadoNesting.arquivos && resultadoNesting.arquivos[arquivoIndex - 1]) {
      const arq = resultadoNesting.arquivos[arquivoIndex - 1];
      artesParaDesenhar = arq.artes;
      H_DESENHO = Math.max(20, arq.alturaCm);
      yOffsetArquivo = arq.yInicio;
      separadoresParaDesenhar = (resultadoNesting.separadoresVisuais || []).filter(s => s.y >= arq.yInicio && s.y <= arq.yFim);
    }

    // Calcula dimensões virtuais do Canvas
    const containerWidth = canvas.parentElement ? (canvas.parentElement.clientWidth || 600) : 600;
    const margemReguaX = 38;
    const margemReguaY = 32;

    const larguraDisponivel = Math.max(220, containerWidth - margemReguaX - 30);
    const escalaBase = larguraDisponivel / W_ROLO;
    const escala = escalaBase * zoom;

    const roloPixelW = W_ROLO * escala;
    const roloPixelH = H_DESENHO * escala;

    const targetW = Math.ceil(roloPixelW + margemReguaX + 40);
    const targetH = Math.ceil(roloPixelH + margemReguaY + 50);

    // SUPORTE RETINA HD / HIGH DPI (Dobra resolução para nitidez extrema de linhas e textos)
    const dpr = Math.max(2, window.devicePixelRatio || 1);
    canvas.width = Math.ceil(targetW * dpr);
    canvas.height = Math.ceil(targetH * dpr);
    canvas.style.width = `${targetW}px`;
    canvas.style.height = `${targetH}px`;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Limpa fundo
    ctx.clearRect(0, 0, targetW, targetH);

    const offsetX = margemReguaX + 10;
    const offsetY = margemReguaY + 10;

    // 1. RÉGUA HORIZONTAL (Centímetros no Topo)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(offsetX, 4, roloPixelW, margemReguaY - 4);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.strokeRect(offsetX, 4, roloPixelW, margemReguaY - 4);

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 9.5px monospace';
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

    // Grid milimétrico sutil a cada 5cm
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

    // 5. RENDERIZAÇÃO REAL DAS ARTES COM PROPORÇÃO GEOMÉTRICA RÍGIDA (NUNCA ACHATADA)
    artesParaDesenhar.forEach(arte => {
      const yRelativo = (arte.yNoArquivo !== undefined) ? arte.yNoArquivo : (arte.y - yOffsetArquivo);
      const artX = offsetX + (arte.x * escala);
      const artY = offsetY + (yRelativo * escala);
      const artW = arte.w * escala;
      const artH = arte.h * escala;

      // Fundo sutil com padrão quadriculado (indicador visual de transparência para DTF)
      ctx.save();
      ctx.beginPath();
      ctx.rect(artX, artY, artW, artH);
      ctx.clip();

      const sq = 6;
      for (let qy = artY; qy < artY + artH; qy += sq) {
        for (let qx = artX; qx < artX + artW; qx += sq) {
          ctx.fillStyle = ((Math.floor((qx - artX) / sq) + Math.floor((qy - artY) / sq)) % 2 === 0) ? '#ffffff' : '#f1f5f9';
          ctx.fillRect(qx, qy, sq, sq);
        }
      }

      // Desenha a imagem real com cálculo rigoroso de contain (sem distorção de proporção)
      if (arte.imagemDataUrl) {
        const img = this.obterImagemCache(arte.imagemDataUrl, () => {
          this.renderizarCanvas(canvas, resultadoNesting, opcoes);
        });

        if (img && img.complete && img.naturalWidth > 0) {
          const imgW = img.naturalWidth;
          const imgH = img.naturalHeight;
          const imgAspect = imgW / imgH;

          if (arte.rotacionado) {
            // Rotação de 90 graus em torno do centro do slot
            ctx.translate(artX + artW / 2, artY + artH / 2);
            ctx.rotate(Math.PI / 2);

            // No espaço rotacionado, a largura é artH e a altura é artW
            const availW = artH;
            const availH = artW;
            const boxAspect = availW / availH;

            let drawW = availW;
            let drawH = availH;
            if (imgAspect > boxAspect) {
              drawH = availW / imgAspect;
            } else {
              drawW = availH * imgAspect;
            }

            ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
          } else {
            // Orientação normal
            const availW = artW;
            const availH = artH;
            const boxAspect = availW / availH;

            let drawW = availW;
            let drawH = availH;
            let drawX = artX;
            let drawY = artY;

            if (imgAspect > boxAspect) {
              drawH = availW / imgAspect;
              drawY = artY + (availH - drawH) / 2;
            } else {
              drawW = availH * imgAspect;
              drawX = artX + (availW - drawW) / 2;
            }

            ctx.drawImage(img, drawX, drawY, drawW, drawH);
          }
        }
      } else {
        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎨 DTF', artX + artW / 2, artY + artH / 2);
      }
      ctx.restore();

      // Moldura e Borda de Corte Pontilhada
      ctx.strokeStyle = arte.rotacionado ? '#059669' : '#0284c7';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(artX, artY, artW, artH);

      // Etiqueta com dimensões se couber na tela
      if (artW > 38 && artH > 18) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(artX + 2, artY + artH - 15, Math.min(artW - 4, 115), 13);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8.5px monospace';
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

    ctx.restore();
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
        const img = this.obterImagemCache(arte.imagemDataUrl);
        if (img && img.complete) {
          ctx.save();
          const imgW = img.naturalWidth || 100;
          const imgH = img.naturalHeight || 100;
          const imgAspect = imgW / imgH;

          if (arte.rotacionado) {
            ctx.translate(artX + artW / 2, artY + artH / 2);
            ctx.rotate(Math.PI / 2);

            const availW = artH;
            const availH = artW;
            const boxAspect = availW / availH;

            let drawW = availW;
            let drawH = availH;
            if (imgAspect > boxAspect) {
              drawH = availW / imgAspect;
            } else {
              drawW = availH * imgAspect;
            }

            ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
          } else {
            const availW = artW;
            const availH = artH;
            const boxAspect = availW / availH;

            let drawW = availW;
            let drawH = availH;
            let drawX = artX;
            let drawY = artY;

            if (imgAspect > boxAspect) {
              drawH = availW / imgAspect;
              drawY = artY + (availH - drawH) / 2;
            } else {
              drawW = availH * imgAspect;
              drawX = artX + (availW - drawW) / 2;
            }

            ctx.drawImage(img, drawX, drawY, drawW, drawH);
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
          const imgW = img.naturalWidth || 100;
          const imgH = img.naturalHeight || 100;
          const imgAspect = imgW / imgH;

          if (arte.rotacionado) {
            ctx.translate(artX + artW / 2, artY + artH / 2);
            ctx.rotate(Math.PI / 2);

            const availW = artH;
            const availH = artW;
            const boxAspect = availW / availH;

            let drawW = availW;
            let drawH = availH;
            if (imgAspect > boxAspect) {
              drawH = availW / imgAspect;
            } else {
              drawW = availH * imgAspect;
            }

            ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
          } else {
            const availW = artW;
            const availH = artH;
            const boxAspect = availW / availH;

            let drawW = availW;
            let drawH = availH;
            let drawX = artX;
            let drawY = artY;

            if (imgAspect > boxAspect) {
              drawH = availW / imgAspect;
              drawY = artY + (availH - drawH) / 2;
            } else {
              drawW = availH * imgAspect;
              drawX = artX + (availW - drawW) / 2;
            }

            ctx.drawImage(img, drawX, drawY, drawW, drawH);
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
