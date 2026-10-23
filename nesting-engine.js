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
    maxMetrosPorArquivo: 1.0      // Padrão DTF: 1.0 metro por arquivo literalmente. 0 = contínuo.
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
  empacotarSkyline2D: function(itens, W_ROLO, GAP, yInicial = 0, maxH = 0) {
    if (!itens || !itens.length) return { artes: [], itensNaoEncaixados: [], alturaMaxima: yInicial };

    // Clona e ordena os itens: maior dimensão e área decrescente (Best-Fit Decreasing)
    let lista = [...itens];
    lista.sort((a, b) => {
      const maxB = Math.max(b.w, b.h);
      const maxA = Math.max(a.w, a.h);
      if (Math.abs(maxB - maxA) > 0.01) return maxB - maxA;
      return (b.w * b.h) - (a.w * a.h);
    });

    // O Skyline é mantido como lista de segmentos horizontais contíguos cobrindo de x=0 a x=W_ROLO
    let segmentos = [{ x: 0, y: yInicial, width: W_ROLO }];
    let artesPosicionadas = [];
    let itensNaoEncaixados = [];

    lista.forEach(item => {
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

          // SE HOUVER LIMITE DE ALTURA POR ARQUIVO (ex: 100cm):
          // A estampa NÃO pode ultrapassar a metragem da folha!
          if (maxH > 0 && topoY > (yInicial + maxH + 0.001)) {
            continue; // Não cabe nesta folha/metro atual. Será alocada na próxima folha!
          }

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
          uid: item.uid,
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
      } else {
        // NÃO COUBE NESTE METRO/ARQUIVO: Passa para o próximo arquivo!
        itensNaoEncaixados.push(item);
      }
    });

    let alturaMaxima = yInicial;
    artesPosicionadas.forEach(a => {
      alturaMaxima = Math.max(alturaMaxima, a.y + a.h);
    });

    return {
      artes: artesPosicionadas,
      itensNaoEncaixados: itensNaoEncaixados,
      alturaMaxima: alturaMaxima
    };
  },

  /**
   * Executa o algoritmo completo de encaixe 2D com suporte a divisão estrita por metro/arquivo
   */
  processarNesting: function(listaArtes, configCustom) {
    const config = Object.assign({}, this.configPadrao, configCustom || {});
    const W_ROLO = parseFloat(config.larguraRoloCm) || 58.0;
    const GAP = parseFloat(config.espacamentoEntreArtesCm) || 0.5;
    const separarPorPedido = config.separarPorPedido !== false;
    const maxMetrosPorArquivo = (config.maxMetrosPorArquivo !== undefined) ? parseFloat(config.maxMetrosPorArquivo) : 1.0;
    const maxCmPorArquivo = maxMetrosPorArquivo > 0 ? (maxMetrosPorArquivo * 100) : 0;

    // 1. Desmembrar as quantidades em cópias individuais com identificadores únicos
    let itensParaEmpacotar = [];
    let contadorUid = 1;
    (listaArtes || []).forEach(arte => {
      const qtd = parseInt(arte.quantidade || arte.copias, 10) || 1;
      const w = parseFloat(arte.larguraCm) || 10;
      const h = parseFloat(arte.alturaCm) || 10;
      const aspect = arte.aspectRatio || (w / h) || 1;

      for (let i = 0; i < qtd; i++) {
        itensParaEmpacotar.push({
          uid: 'art_' + (arte.id || 'item') + '_' + contadorUid++,
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

    // Se separar por pedido, ordena agrupando por pedido para manter estampas do mesmo pedido juntas
    if (separarPorPedido) {
      itensParaEmpacotar.sort((a, b) => {
        const pedA = String(a.pedidoNumero || a.pedidoId || '');
        const pedB = String(b.pedidoNumero || b.pedidoId || '');
        if (pedA !== pedB) return pedA.localeCompare(pedB);
        const maxB = Math.max(b.w, b.h);
        const maxA = Math.max(a.w, a.h);
        return maxB - maxA;
      });
    }

    let arquivosPaginados = [];
    let todasArtesPosicionadasGlobal = [];
    let itensRestantes = [...itensParaEmpacotar];
    let fileIndex = 1;
    const sheetGap = 6.0; // cm de intervalo visual entre folhas na visualização geral

    if (maxCmPorArquivo > 0) {
      // 2. ENCAIXE FÍSICO ARQUIVO POR ARQUIVO (LITERALMENTE 1 METRO POR ARQUIVO SEM CORTAR ESTAMPAS)
      while (itensRestantes.length > 0) {
        // Empacota no arquivo atual respeitando rigorosamente o limite de maxCmPorArquivo (ex: 100cm)
        let resSheet = this.empacotarSkyline2D(itensRestantes, W_ROLO, GAP, 0, maxCmPorArquivo);

        // Se nenhum item coube (ex: estampa oversize cuja menor dimensão é maior que maxCmPorArquivo)
        if (resSheet.artes.length === 0 && itensRestantes.length > 0) {
          const minD = Math.min(itensRestantes[0].w, itensRestantes[0].h);
          const altExt = Math.max(maxCmPorArquivo, minD + GAP * 2);
          resSheet = this.empacotarSkyline2D(itensRestantes, W_ROLO, GAP, 0, altExt);

          if (resSheet.artes.length === 0) {
            // Força o item para evitar travamento infinito
            const itemForcado = itensRestantes.shift();
            resSheet.artes.push({
              uid: itemForcado.uid,
              id: itemForcado.id,
              nome: itemForcado.nome,
              cliente: itemForcado.cliente,
              pedidoId: itemForcado.pedidoId,
              pedidoNumero: itemForcado.pedidoNumero,
              arquivoNome: itemForcado.arquivoNome,
              imagemDataUrl: itemForcado.imagemDataUrl,
              aspectRatio: itemForcado.aspectRatio,
              x: 0,
              y: 0,
              w: Math.min(itemForcado.w, W_ROLO),
              h: itemForcado.h,
              wOriginal: itemForcado.w,
              hOriginal: itemForcado.h,
              rotacionado: false,
              cor: itemForcado.cor
            });
            resSheet.alturaMaxima = itemForcado.h;
          }
        }

        const colocadosUids = new Set(resSheet.artes.map(a => a.uid));
        itensRestantes = itensRestantes.filter(it => !colocadosUids.has(it.uid));

        const altOcupada = resSheet.alturaMaxima;
        // Cada arquivo tem LITERALMENTE a metragem solicitada (ex: 100cm = 1.0 metro)
        const altArquivo = Math.max(maxCmPorArquivo, parseFloat(altOcupada.toFixed(1)));
        const metrosArquivo = parseFloat((altArquivo / 100).toFixed(2));

        const yOffsetGlobal = arquivosPaginados.reduce((acc, arq) => acc + arq.alturaCm + sheetGap, 0);

        const artesDoArquivo = resSheet.artes.map(art => ({
          ...art,
          arquivoIndex: fileIndex,
          yNoArquivo: parseFloat(art.y.toFixed(2)),
          yGlobal: parseFloat((yOffsetGlobal + art.y).toFixed(2))
        }));

        const arquivoObj = {
          index: fileIndex,
          yInicioGlobal: yOffsetGlobal,
          yFimGlobal: yOffsetGlobal + altArquivo,
          alturaCm: altArquivo,
          alturaOcupadaCm: parseFloat(altOcupada.toFixed(1)),
          metrosLineares: metrosArquivo,
          artes: artesDoArquivo,
          separadores: []
        };

        arquivosPaginados.push(arquivoObj);

        artesDoArquivo.forEach(art => {
          todasArtesPosicionadasGlobal.push({
            ...art,
            y: art.yGlobal
          });
        });

        fileIndex++;
        if (fileIndex > 200) break; // Segurança
      }

      if (arquivosPaginados.length === 0) {
        arquivosPaginados.push({
          index: 1,
          yInicioGlobal: 0,
          yFimGlobal: maxCmPorArquivo,
          alturaCm: maxCmPorArquivo,
          alturaOcupadaCm: 0,
          metrosLineares: maxMetrosPorArquivo,
          artes: [],
          separadores: []
        });
      }
    } else {
      // CONTÍNUO (ROLO ÚNICO SEM DIVISÃO DE METRAGEM)
      const resContinuo = this.empacotarSkyline2D(itensRestantes, W_ROLO, GAP, 0, 0);
      const altTotal = Math.max(10, resContinuo.alturaMaxima);
      const metrosTotais = parseFloat((altTotal / 100).toFixed(2));

      const artesDoArquivo = resContinuo.artes.map(art => ({
        ...art,
        arquivoIndex: 1,
        yNoArquivo: parseFloat(art.y.toFixed(2)),
        yGlobal: parseFloat(art.y.toFixed(2))
      }));

      todasArtesPosicionadasGlobal = artesDoArquivo;

      arquivosPaginados.push({
        index: 1,
        yInicioGlobal: 0,
        yFimGlobal: altTotal,
        alturaCm: parseFloat(altTotal.toFixed(1)),
        alturaOcupadaCm: parseFloat(resContinuo.alturaMaxima.toFixed(1)),
        metrosLineares: metrosTotais,
        artes: artesDoArquivo,
        separadores: []
      });
    }

    // 3. Cálculos de área e taxa de aproveitamento
    let areaUtilArtesCm2 = 0;
    todasArtesPosicionadasGlobal.forEach(art => {
      areaUtilArtesCm2 += (art.w * art.h);
    });

    const alturaTotalSomaArquivos = arquivosPaginados.reduce((acc, arq) => acc + arq.alturaCm, 0);
    const metrosLinearesTotais = parseFloat((alturaTotalSomaArquivos / 100).toFixed(2));
    const areaTotalRoloCm2 = W_ROLO * alturaTotalSomaArquivos;
    const taxaAproveitamento = areaTotalRoloCm2 > 0 ? (areaUtilArtesCm2 / areaTotalRoloCm2) * 100 : 0;
    const taxaDesperdicio = Math.max(0, 100 - taxaAproveitamento);
    const custoTotalRolo = metrosLinearesTotais * config.custoMetroLinear;
    const totalItens = todasArtesPosicionadasGlobal.length;
    const custoMedioPorArte = totalItens > 0 ? (custoTotalRolo / totalItens) : 0;

    return {
      larguraRoloCm: W_ROLO,
      alturaTotalCm: parseFloat(alturaTotalSomaArquivos.toFixed(1)),
      metrosLinearesTotais: metrosLinearesTotais,
      areaUtilArtesCm2: parseFloat(areaUtilArtesCm2.toFixed(1)),
      areaTotalRoloCm2: parseFloat(areaTotalRoloCm2.toFixed(1)),
      taxaAproveitamentoPercentual: parseFloat(taxaAproveitamento.toFixed(1)),
      taxaDesperdicioPercentual: parseFloat(taxaDesperdicio.toFixed(1)),
      custoTotalRolo: parseFloat(custoTotalRolo.toFixed(2)),
      custoMedioPorArte: parseFloat(custoMedioPorArte.toFixed(2)),
      totalItensProcessados: totalItens,
      artesPosicionadas: todasArtesPosicionadasGlobal,
      separadoresVisuais: [],
      arquivos: arquivosPaginados,
      config: config
    };
  },

  /**
   * MOTOR CIRÚRGICO DE REMOÇÃO DE FUNDO (Canva / Magic Wand Vectorial)
   * Processa ImageData com precisão cirúrgica:
   * - Elimina fundo externo conectado
   * - Limpa furos e cavidades fechadas de letras (A, B, R, P, O, D, Q...)
   * - Proteção absoluta de texto e cores contrastantes (sem desbotar ou ficar transparente)
   * - Eliminação cirúrgica de contornos/halos residuais (Anti-Halo & Despeckle)
   */
  processarImageDataCirurgico: function(imgDataOriginal, opcoes = {}) {
    const w = imgDataOriginal.width;
    const h = imgDataOriginal.height;
    const totalPixels = w * h;
    const srcData = imgDataOriginal.data;

    // Cria cópia dos pixels para não mutar o original
    const saida = new ImageData(new Uint8ClampedArray(srcData), w, h);
    const data = saida.data;

    const tolerancia = opcoes.tolerancia !== undefined ? Math.max(1, Math.min(100, opcoes.tolerancia)) : 35;
    const limparBuracos = opcoes.limparBuracos !== false;
    const protegerTexto = opcoes.protegerTexto !== false;
    const removerHalo = opcoes.removerHalo !== false;
    const limparBordasFantasmas = opcoes.limparBordasFantasmas !== false;
    const modo = opcoes.modo || 'inteligente'; // 'inteligente' | 'global' | 'apenas_exterior'

    // 1. Determina a cor alvo (manual via conta-gotas ou detecção de perímetro)
    let bgR = 255, bgG = 255, bgB = 255;
    if (opcoes.corAlvo && typeof opcoes.corAlvo.r === 'number') {
      bgR = Math.max(0, Math.min(255, Math.round(opcoes.corAlvo.r)));
      bgG = Math.max(0, Math.min(255, Math.round(opcoes.corAlvo.g)));
      bgB = Math.max(0, Math.min(255, Math.round(opcoes.corAlvo.b)));
    } else {
      const cores = [];
      const stepX = Math.max(1, Math.floor(w / 40));
      const stepY = Math.max(1, Math.floor(h / 40));
      function amostrar(px, py) {
        if (px < 0 || px >= w || py < 0 || py >= h) return;
        const idx = (py * w + px) * 4;
        if (srcData[idx + 3] > 40) {
          cores.push({ r: srcData[idx], g: srcData[idx + 1], b: srcData[idx + 2] });
        }
      }
      for (let x = 0; x < w; x += stepX) {
        amostrar(x, 0); amostrar(x, 1); amostrar(x, 2);
        amostrar(x, h - 1); amostrar(x, h - 2); amostrar(x, h - 3);
      }
      for (let y = 0; y < h; y += stepY) {
        amostrar(0, y); amostrar(1, y); amostrar(2, y);
        amostrar(w - 1, y); amostrar(w - 2, y); amostrar(w - 3, y);
      }

      if (cores.length === 0) {
        bgR = 255; bgG = 255; bgB = 255;
      } else {
        let sr = 0, sg = 0, sb = 0;
        cores.forEach(c => { sr += c.r; sg += c.g; sb += c.b; });
        const mr = sr / cores.length;
        const mg = sg / cores.length;
        const mb = sb / cores.length;
        const mlum = 0.299 * mr + 0.587 * mg + 0.114 * mb;
        if (mlum > 238 && Math.abs(mr - mg) < 10 && Math.abs(mg - mb) < 10) {
          bgR = 255; bgG = 255; bgB = 255;
        } else if (mlum < 25 && mr < 30 && mg < 30 && mb < 30) {
          bgR = 0; bgG = 0; bgB = 0;
        } else {
          bgR = Math.round(mr);
          bgG = Math.round(mg);
          bgB = Math.round(mb);
        }
      }
    }

    const bgLum = 0.299 * bgR + 0.587 * bgG + 0.114 * bgB;
    const isFundoEscuro = bgLum < 80;
    const isFundoClaro = bgLum > 180;

    // Distância euclidiana com compensação perceptual humana (redmean)
    function distCor(r, g, b) {
      const rmean = (r + bgR) >> 1;
      const dr = r - bgR;
      const dg = g - bgG;
      const db = b - bgB;
      return Math.sqrt((((512 + rmean) * dr * dr) >> 8) + 4 * dg * dg + (((767 - rmean) * db * db) >> 8));
    }

    // Escala calibrada: 35% ~ 168 (elimina ruído JPG sem agredir tons médios)
    const limiarDist = (tolerancia / 100) * 480;

    // 2. Classificação de pixels candidatos a fundo
    const isCandidato = new Uint8Array(totalPixels);
    for (let i = 0; i < totalPixels; i++) {
      const idx = i * 4;
      const a = srcData[idx + 3];
      if (a < 25) {
        isCandidato[i] = 1;
        continue;
      }
      const r = srcData[idx];
      const g = srcData[idx + 1];
      const b = srcData[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Proteção de texto e grafismo de alto contraste
      if (protegerTexto) {
        if (isFundoClaro && lum < 135) {
          continue; // Cores escuras em fundo branco nunca são candidatas
        }
        if (isFundoEscuro && lum > 120) {
          continue; // Cores claras em fundo preto nunca são candidatas
        }
        // Elementos fortemente saturados (ex: vermelho, verde, azul)
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const sat = maxC > 0 ? (maxC - minC) / maxC : 0;
        if (sat > 0.25 && Math.abs(lum - bgLum) > 20) {
          continue;
        }
      }

      const d = distCor(r, g, b);
      if (d <= limiarDist) {
        isCandidato[i] = 1;
      }
    }

    // 3. Resolução Espacial: BFS Flood Fill estritamente no perímetro externo
    const isFundoFinal = new Uint8Array(totalPixels);

    if (modo === 'global') {
      for (let i = 0; i < totalPixels; i++) {
        if (isCandidato[i]) isFundoFinal[i] = 1;
      }
    } else {
      const fila = new Int32Array(totalPixels);
      let filaInicio = 0, filaFim = 0;

      function enfileirarBorda(px, py) {
        const pIdx = py * w + px;
        if (!isFundoFinal[pIdx] && (isCandidato[pIdx] || srcData[pIdx * 4 + 3] < 25)) {
          isFundoFinal[pIdx] = 1;
          fila[filaFim++] = pIdx;
        }
      }

      for (let x = 0; x < w; x++) { enfileirarBorda(x, 0); enfileirarBorda(x, h - 1); }
      for (let y = 0; y < h; y++) { enfileirarBorda(0, y); enfileirarBorda(w - 1, y); }

      while (filaInicio < filaFim) {
        const curIdx = fila[filaInicio++];
        const cx = curIdx % w;
        const cy = (curIdx / w) | 0;

        if (cx > 0) {
          const left = curIdx - 1;
          if (!isFundoFinal[left] && (isCandidato[left] || srcData[left * 4 + 3] < 25)) {
            isFundoFinal[left] = 1;
            fila[filaFim++] = left;
          }
        }
        if (cx < w - 1) {
          const right = curIdx + 1;
          if (!isFundoFinal[right] && (isCandidato[right] || srcData[right * 4 + 3] < 25)) {
            isFundoFinal[right] = 1;
            fila[filaFim++] = right;
          }
        }
        if (cy > 0) {
          const up = curIdx - w;
          if (!isFundoFinal[up] && (isCandidato[up] || srcData[up * 4 + 3] < 25)) {
            isFundoFinal[up] = 1;
            fila[filaFim++] = up;
          }
        }
        if (cy < h - 1) {
          const down = curIdx + w;
          if (!isFundoFinal[down] && (isCandidato[down] || srcData[down * 4 + 3] < 25)) {
            isFundoFinal[down] = 1;
            fila[filaFim++] = down;
          }
        }
      }

      // 4. Detecção Topológica de Furos de Letras Soltas (O, A, P, R, D...)
      // REGRA DE OURO: Só é furo de letra se a parede que envolve a cavidade for FINA (traço de letra)
      // e fizer fronteira com o exterior. Se estiver dentro de um escudo ou badge fechado,
      // a parede é espessa (dezenas/centenas de pixels) -> 100% PROTEGIDO, NUNCA É FURADO!
      if (limparBuracos && modo !== 'apenas_exterior') {
        const maxDistTraço = Math.max(20, Math.min(38, Math.round(Math.min(w, h) * 0.045)));
        const distExterior = new Uint8Array(totalPixels);
        const qDist = new Int32Array(totalPixels);
        let qDistIni = 0, qDistFim = 0;

        // Identifica pixels de primeiro plano que tocam diretamente o fundo externo
        for (let i = 0; i < totalPixels; i++) {
          if (!isFundoFinal[i]) {
            const cx = i % w;
            const cy = (i / w) | 0;
            if ((cx > 0 && isFundoFinal[i - 1]) ||
                (cx < w - 1 && isFundoFinal[i + 1]) ||
                (cy > 0 && isFundoFinal[i - w]) ||
                (cy < h - 1 && isFundoFinal[i + w])) {
              distExterior[i] = 1;
              qDist[qDistFim++] = i;
            }
          }
        }

        // Propaga a distância através do primeiro plano até o limite do traço de letra
        while (qDistIni < qDistFim) {
          const cur = qDist[qDistIni++];
          const curDist = distExterior[cur];
          if (curDist >= maxDistTraço) continue;

          const cx = cur % w;
          const cy = (cur / w) | 0;
          const viz = [
            cx > 0 ? cur - 1 : -1,
            cx < w - 1 ? cur + 1 : -1,
            cy > 0 ? cur - w : -1,
            cy < h - 1 ? cur + w : -1
          ];

          for (const v of viz) {
            if (v !== -1 && !isFundoFinal[v] && distExterior[v] === 0) {
              distExterior[v] = curDist + 1;
              qDist[qDistFim++] = v;
            }
          }
        }

        // Analisa cavidades fechadas (candidatos não alcançados pelo exterior)
        const visitadoCavidades = new Uint8Array(totalPixels);
        const maxAreaCavidade = Math.round(totalPixels * 0.035); // Max 3.5% da arte
        const qCav = new Int32Array(totalPixels);

        for (let i = 0; i < totalPixels; i++) {
          if (isCandidato[i] && !isFundoFinal[i] && !visitadoCavidades[i]) {
            let cIni = 0, cFim = 0;
            qCav[cFim++] = i;
            visitadoCavidades[i] = 1;

            let minX = i % w, maxX = minX;
            let minY = (i / w) | 0, maxY = minY;
            let vizinhosBordaTotal = 0;
            let vizinhosBordaPertoExterior = 0;

            while (cIni < cFim) {
              const cur = qCav[cIni++];
              const cx = cur % w;
              const cy = (cur / w) | 0;

              if (cx < minX) minX = cx;
              if (cx > maxX) maxX = cx;
              if (cy < minY) minY = cy;
              if (cy > maxY) maxY = cy;

              const viz4 = [
                cx > 0 ? cur - 1 : -1,
                cx < w - 1 ? cur + 1 : -1,
                cy > 0 ? cur - w : -1,
                cy < h - 1 ? cur + w : -1
              ];

              for (const v of viz4) {
                if (v === -1) continue;
                if (isCandidato[v] && !isFundoFinal[v]) {
                  if (!visitadoCavidades[v]) {
                    visitadoCavidades[v] = 1;
                    qCav[cFim++] = v;
                  }
                } else if (!isFundoFinal[v]) {
                  vizinhosBordaTotal++;
                  if (distExterior[v] > 0 && distExterior[v] <= maxDistTraço) {
                    vizinhosBordaPertoExterior++;
                  }
                }
              }
            }

            const count = cFim;
            const largCav = maxX - minX + 1;
            const altCav = maxY - minY + 1;

            // Só libera remoção se a cavidade for comprovadamente um furo de letra solta
            // cercada por um traço fino cuja outra borda é o fundo externo!
            const ehFuroLegitimo = (count <= maxAreaCavidade) &&
                                  (largCav < w * 0.3) &&
                                  (altCav < h * 0.3) &&
                                  (vizinhosBordaTotal > 0) &&
                                  ((vizinhosBordaPertoExterior / vizinhosBordaTotal) >= 0.85);

            if (ehFuroLegitimo) {
              for (let k = 0; k < count; k++) {
                isFundoFinal[qCav[k]] = 1;
              }
            }
          }
        }
      }
    }

    // 5. Tratamento de Bordas, Anti-Halo e Descontaminação de Cor (Defringe HD)
    const isBordaForeground = new Uint8Array(totalPixels);
    const vizFundoCount = new Uint8Array(totalPixels);

    for (let y = 0; y < h; y++) {
      const yOff = y * w;
      for (let x = 0; x < w; x++) {
        const p = yOff + x;
        if (!isFundoFinal[p]) {
          let bgNeighbors = 0;
          for (let dy = -1; dy <= 1; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= h) { bgNeighbors++; continue; }
            const nOff = ny * w;
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx;
              if (nx < 0 || nx >= w || isFundoFinal[nOff + nx]) {
                bgNeighbors++;
              }
            }
          }
          if (bgNeighbors > 0) {
            isBordaForeground[p] = 1;
            vizFundoCount[p] = bgNeighbors;
          }
        }
      }
    }

    // Aplica a transparência no fundo e refina o contorno do primeiro plano
    for (let p = 0; p < totalPixels; p++) {
      const bIdx = p * 4;
      if (isFundoFinal[p]) {
        data[bIdx + 3] = 0; // Transparência cirúrgica 100%
      } else {
        if (removerHalo && isBordaForeground[p]) {
          const r = srcData[bIdx];
          const g = srcData[bIdx + 1];
          const b = srcData[bIdx + 2];
          const bgNeigh = vizFundoCount[p];

          // Pontas excessivamente isoladas (serrilhados ou poeira de corte)
          const d = distCor(r, g, b);
          if (bgNeigh >= 6 && d <= limiarDist * 1.3) {
            data[bIdx + 3] = 0;
            continue;
          }

          // Descontaminação de cor (substitui contaminação de halo pela cor autêntica interna da estampa)
          const cx = p % w;
          const cy = (p / w) | 0;
          let bestInnerR = r, bestInnerG = g, bestInnerB = b;
          let achouInterior = false;

          for (let dy = -2; dy <= 2 && !achouInterior; dy++) {
            const ny = cy + dy;
            if (ny < 0 || ny >= h) continue;
            for (let dx = -2; dx <= 2 && !achouInterior; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = cx + dx;
              if (nx < 0 || nx >= w) continue;
              const np = ny * w + nx;
              if (!isFundoFinal[np] && !isBordaForeground[np]) {
                const ni = np * 4;
                bestInnerR = srcData[ni];
                bestInnerG = srcData[ni + 1];
                bestInnerB = srcData[ni + 2];
                achouInterior = true;
              }
            }
          }

          if (achouInterior) {
            const blend = bgNeigh >= 4 ? 0.85 : 0.65;
            data[bIdx] = Math.round(r * (1 - blend) + bestInnerR * blend);
            data[bIdx + 1] = Math.round(g * (1 - blend) + bestInnerG * blend);
            data[bIdx + 2] = Math.round(b * (1 - blend) + bestInnerB * blend);
          } else {
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            if (isFundoClaro && lum > 140) {
              const escurecer = Math.max(0.35, (255 - lum) / 255);
              data[bIdx] = Math.round(r * escurecer);
              data[bIdx + 1] = Math.round(g * escurecer);
              data[bIdx + 2] = Math.round(b * escurecer);
            } else if (isFundoEscuro && lum < 60) {
              const clarear = Math.min(2.2, 100 / Math.max(1, lum));
              data[bIdx] = Math.min(255, Math.round(r * clarear));
              data[bIdx + 1] = Math.min(255, Math.round(g * clarear));
              data[bIdx + 2] = Math.min(255, Math.round(b * clarear));
            }
          }

          // Anti-aliasing suave no canal alfa
          if (bgNeigh >= 4) {
            data[bIdx + 3] = Math.min(255, Math.max(120, Math.round(255 * (1 - (bgNeigh - 3) * 0.16))));
          } else {
            data[bIdx + 3] = 255;
          }
        } else {
          // O miolo da arte permanece 100% opaco e vibrante
          data[bIdx + 3] = 255;
        }
      }
    }

    // 6. Despeckle Cirúrgico (elimina pontinhos isolados, poeira de JPG e sujeira flutuante)
    if (limparBordasFantasmas) {
      const visSpeckle = new Uint8Array(totalPixels);
      const qSpeckle = new Int32Array(350);

      for (let y = 0; y < h; y++) {
        const yOff = y * w;
        for (let x = 0; x < w; x++) {
          const p = yOff + x;
          const bIdx = p * 4;
          if (data[bIdx + 3] > 0 && !visSpeckle[p]) {
            let sIni = 0, sFim = 0;
            qSpeckle[sFim++] = p;
            visSpeckle[p] = 1;

            let minSx = x, maxSx = x;
            let minSy = y, maxSy = y;
            let estourou = false;

            while (sIni < sFim) {
              const sp = qSpeckle[sIni++];
              const sx = sp % w;
              const sy = (sp / w) | 0;
              if (sx < minSx) minSx = sx;
              if (sx > maxSx) maxSx = sx;
              if (sy < minSy) minSy = sy;
              if (sy > maxSy) maxSy = sy;

              for (let dy = -1; dy <= 1; dy++) {
                const ny = sy + dy;
                if (ny < 0 || ny >= h) continue;
                for (let dx = -1; dx <= 1; dx++) {
                  if (dx === 0 && dy === 0) continue;
                  const nx = sx + dx;
                  if (nx < 0 || nx >= w) continue;
                  const np = ny * w + nx;
                  if (data[np * 4 + 3] > 0 && !visSpeckle[np]) {
                    if (sFim >= 300) {
                      estourou = true;
                      break;
                    }
                    visSpeckle[np] = 1;
                    qSpeckle[sFim++] = np;
                  }
                }
                if (estourou) break;
              }
              if (estourou) break;
            }

            // Se for um bloco menor que 30 pixels e com dimensões <= 7x7px solto no vazio, apaga!
            if (!estourou && sFim <= 30 && (maxSx - minSx <= 7) && (maxSy - minSy <= 7)) {
              for (let k = 0; k < sFim; k++) {
                data[qSpeckle[k] * 4 + 3] = 0;
              }
            }
          }
        }
      }
    }

    return {
      imageData: saida,
      corDetectada: { r: bgR, g: bgG, b: bgB }
    };
  },

  /**
   * Remove fundo de uma imagem e retorna DataURL PNG com transparência
   */
  removerFundoImagem: async function(fonteImagem, opcoes = {}) {
    if (!fonteImagem) return null;
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
    const resultado = this.processarImageDataCirurgico(imgData, opcoes);
    ctx.putImageData(resultado.imageData, 0, 0);

    return canvas.toDataURL('image/png');
  },

  /**
   * Calcula o Bounding Box de conteúdo de uma imagem (Auto-Trim de bordas vazias/transparentes)
   */
  calcularBoundingBoxConteudo: function(fonteCanvasOuImgData, opcoes = {}) {
    let w, h, data;
    if (fonteCanvasOuImgData instanceof ImageData) {
      w = fonteCanvasOuImgData.width;
      h = fonteCanvasOuImgData.height;
      data = fonteCanvasOuImgData.data;
    } else if (fonteCanvasOuImgData && fonteCanvasOuImgData.getContext) {
      const ctx = fonteCanvasOuImgData.getContext('2d', { willReadFrequently: true });
      w = fonteCanvasOuImgData.width;
      h = fonteCanvasOuImgData.height;
      data = ctx.getImageData(0, 0, w, h).data;
    } else {
      return null;
    }

    if (w <= 0 || h <= 0) return null;

    const margem = typeof opcoes.margem === 'number' ? opcoes.margem : 2;
    const tol = (typeof opcoes.tolerancia === 'number' ? opcoes.tolerancia : 35) * 2.55;

    // 1. Detecta cor de fundo das bordas para isolar a logo com precisão
    let bgR = 0, bgG = 0, bgB = 0;
    if (opcoes.corAlvo && typeof opcoes.corAlvo.r === 'number') {
      bgR = opcoes.corAlvo.r;
      bgG = opcoes.corAlvo.g;
      bgB = opcoes.corAlvo.b;
    } else {
      // Coleta amostras das quinas e bordas para detectar o tom do fundo
      const amostras = [];
      const addSample = (sx, sy) => {
        const xClamped = Math.max(0, Math.min(w - 1, sx));
        const yClamped = Math.max(0, Math.min(h - 1, sy));
        const i = (yClamped * w + xClamped) * 4;
        amostras.push({ r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] });
      };

      addSample(0, 0);
      addSample(Math.min(w - 1, 2), Math.min(h - 1, 2));
      addSample(w - 1, 0);
      addSample(0, h - 1);
      addSample(w - 1, h - 1);
      addSample(Math.floor(w / 2), 0);
      addSample(Math.floor(w / 2), h - 1);
      addSample(0, Math.floor(h / 2));
      addSample(w - 1, Math.floor(h / 2));

      let sumR = 0, sumG = 0, sumB = 0, count = 0;
      for (const s of amostras) {
        if (s.a > 120) {
          sumR += s.r;
          sumG += s.g;
          sumB += s.b;
          count++;
        }
      }
      if (count > 0) {
        bgR = Math.round(sumR / count);
        bgG = Math.round(sumG / count);
        bgB = Math.round(sumB / count);
      }
    }

    // 2. Detecta se a imagem possui transparência evidente
    let temTransparenciaSignificativa = false;
    let countTransp = 0;
    for (let i = 3; i < data.length; i += 16) {
      if (data[i] < 200) {
        countTransp++;
        if (countTransp > 10) {
          temTransparenciaSignificativa = true;
          break;
        }
      }
    }

    // 3. Histograma de linhas (y) e colunas (x) com conteúdo real da logo
    const rowContentCount = new Int32Array(h);
    const colContentCount = new Int32Array(w);

    for (let y = 0; y < h; y++) {
      const yOffset = y * w * 4;
      for (let x = 0; x < w; x++) {
        const idx = yOffset + (x * 4);
        let isContent = false;

        if (temTransparenciaSignificativa) {
          // Imagem já tratada ou PNG com canal alfa: pixel é conteúdo se alfa for nítido
          const a = data[idx + 3];
          if (a >= 35) {
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];
            const diff = Math.max(Math.abs(r - bgR), Math.abs(g - bgG), Math.abs(b - bgB));
            if (a > 60 || diff > 15) {
              isContent = true;
            }
          }
        } else {
          // Imagem opaca: pixel é conteúdo se difere da cor do fundo com tolerância
          const r = data[idx], g = data[idx + 1], b = data[idx + 2];
          const diff = Math.max(Math.abs(r - bgR), Math.abs(g - bgG), Math.abs(b - bgB));
          if (diff > tol) {
            isContent = true;
          }
        }

        if (isContent) {
          rowContentCount[y]++;
          colContentCount[x]++;
        }
      }
    }

    // Filtro anti-ruído: linhas ou colunas precisam ter pelo menos um limite mínimo de pixels
    // para evitar que um único pixel fantasma / poeira de compressão trave o corte na borda
    const minPixelsRow = Math.max(2, Math.min(8, Math.floor(w * 0.003)));
    const minPixelsCol = Math.max(2, Math.min(8, Math.floor(h * 0.003)));

    let minY = -1, maxY = -1, minX = -1, maxX = -1;

    for (let y = 0; y < h; y++) {
      if (rowContentCount[y] >= minPixelsRow) {
        minY = y;
        break;
      }
    }
    for (let y = h - 1; y >= 0; y--) {
      if (rowContentCount[y] >= minPixelsRow) {
        maxY = y;
        break;
      }
    }

    for (let x = 0; x < w; x++) {
      if (colContentCount[x] >= minPixelsCol) {
        minX = x;
        break;
      }
    }
    for (let x = w - 1; x >= 0; x--) {
      if (colContentCount[x] >= minPixelsCol) {
        maxX = x;
        break;
      }
    }

    // Se o filtro estrito não encontrou, tenta com limite mais permissivo (>= 1)
    if (minY === -1 || maxY === -1 || minX === -1 || maxX === -1 || minY > maxY || minX > maxX) {
      for (let y = 0; y < h; y++) {
        if (rowContentCount[y] >= 1) { minY = y; break; }
      }
      for (let y = h - 1; y >= 0; y--) {
        if (rowContentCount[y] >= 1) { maxY = y; break; }
      }
      for (let x = 0; x < w; x++) {
        if (colContentCount[x] >= 1) { minX = x; break; }
      }
      for (let x = w - 1; x >= 0; x--) {
        if (colContentCount[x] >= 1) { maxX = x; break; }
      }
    }

    if (minY === -1 || maxY === -1 || minX === -1 || maxX === -1 || minY > maxY || minX > maxX) {
      return null;
    }

    minX = Math.max(0, minX - margem);
    minY = Math.max(0, minY - margem);
    maxX = Math.min(w - 1, maxX + margem);
    maxY = Math.min(h - 1, maxY + margem);

    return {
      x: minX,
      y: minY,
      w: maxX - minX + 1,
      h: maxY - minY + 1,
      larguraOriginal: w,
      alturaOriginal: h
    };
  },

  /**
   * Recorta um Canvas para uma região retangular e retorna novo Canvas
   */
  recortarCanvas: function(canvasOrigem, x, y, largura, altura) {
    if (!canvasOrigem || largura <= 0 || altura <= 0) return null;
    const destCanvas = document.createElement('canvas');
    destCanvas.width = Math.round(largura);
    destCanvas.height = Math.round(altura);
    const destCtx = destCanvas.getContext('2d');
    if (!destCtx) return null;

    destCtx.drawImage(
      canvasOrigem,
      Math.round(x), Math.round(y), Math.round(largura), Math.round(altura),
      0, 0, Math.round(largura), Math.round(altura)
    );

    return destCanvas;
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

    const temMultiplosArquivos = (resultadoNesting.arquivos && resultadoNesting.arquivos.length > 1);
    if (arquivoIndex > 0 && resultadoNesting.arquivos && resultadoNesting.arquivos[arquivoIndex - 1]) {
      const arq = resultadoNesting.arquivos[arquivoIndex - 1];
      artesParaDesenhar = arq.artes;
      H_DESENHO = Math.max(20, arq.alturaCm);
      yOffsetArquivo = 0;
      separadoresParaDesenhar = [];
    } else if (temMultiplosArquivos) {
      H_DESENHO = Math.max(20, resultadoNesting.arquivos[resultadoNesting.arquivos.length - 1].yFimGlobal);
      artesParaDesenhar = resultadoNesting.artesPosicionadas;
    }

    // Calcula dimensões virtuais do Canvas
    const containerWidth = canvas.parentElement ? (canvas.parentElement.clientWidth || 600) : 600;
    const margemReguaX = 26; // Design fino e elegante (reduzido de 38px)
    const margemReguaY = 20; // Design fino e elegante (reduzido de 32px)

    const larguraDisponivel = Math.max(220, containerWidth - margemReguaX - 36);
    const escalaBase = larguraDisponivel / W_ROLO;
    const escala = escalaBase * zoom;

    const roloPixelW = W_ROLO * escala;
    const roloPixelH = H_DESENHO * escala;

    const offsetX = margemReguaX + 6;
    const offsetY = margemReguaY + 6;

    const targetW = Math.ceil(roloPixelW + offsetX + 24);
    const targetH = Math.ceil(roloPixelH + offsetY + 30);

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

    // 0. CANTO SUPERIOR ESQUERDO (JUNÇÃO DAS RÉGUAS COM IDENTIFICADOR 'cm')
    ctx.fillStyle = '#061c24';
    ctx.fillRect(4, 4, margemReguaX, margemReguaY);
    ctx.strokeStyle = '#083c4b';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 4, margemReguaX, margemReguaY);

    ctx.fillStyle = '#2dd4bf';
    ctx.font = 'bold 8.5px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('cm', 4 + (margemReguaX / 2), 4 + (margemReguaY / 2));

    // 1. RÉGUA HORIZONTAL (Centímetros no Topo - Design CAD Fino & Moderno)
    ctx.fillStyle = '#061c24';
    ctx.fillRect(offsetX, 4, roloPixelW, margemReguaY);
    ctx.strokeStyle = '#083c4b';
    ctx.lineWidth = 1;
    ctx.strokeRect(offsetX, 4, roloPixelW, margemReguaY);

    // Linha de base inferior da régua
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(offsetX, 4 + margemReguaY);
    ctx.lineTo(offsetX + roloPixelW, 4 + margemReguaY);
    ctx.stroke();

    for (let cm = 0; cm <= W_ROLO; cm += 1) {
      const xPos = offsetX + (cm * escala);
      const isMajor = (cm % 10 === 0 || cm === Math.round(W_ROLO));
      const isMid = (!isMajor && cm % 5 === 0);

      ctx.beginPath();
      if (isMajor) {
        ctx.strokeStyle = '#2dd4bf';
        ctx.lineWidth = 1;
        ctx.moveTo(xPos, 4 + margemReguaY);
        ctx.lineTo(xPos, 4 + margemReguaY - 7);
        ctx.stroke();

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '700 7.5px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`${cm}`, xPos, 5);
      } else if (isMid) {
        ctx.strokeStyle = 'rgba(45, 212, 191, 0.6)';
        ctx.lineWidth = 0.8;
        ctx.moveTo(xPos, 4 + margemReguaY);
        ctx.lineTo(xPos, 4 + margemReguaY - 4.5);
        ctx.stroke();
      } else if (escala >= 3.0) {
        // Ticks milimétricos finos a cada 1cm
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.lineWidth = 0.6;
        ctx.moveTo(xPos, 4 + margemReguaY);
        ctx.lineTo(xPos, 4 + margemReguaY - 2.5);
        ctx.stroke();
      }
    }

    // 2. RÉGUA VERTICAL (Metros/Centímetros na Esquerda - Design CAD Fino & Moderno)
    ctx.fillStyle = '#061c24';
    ctx.fillRect(4, offsetY, margemReguaX, roloPixelH);
    ctx.strokeStyle = '#083c4b';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, offsetY, margemReguaX, roloPixelH);

    // Linha de base da régua vertical
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(4 + margemReguaX, offsetY);
    ctx.lineTo(4 + margemReguaX, offsetY + roloPixelH);
    ctx.stroke();

    for (let cm = 0; cm <= H_DESENHO; cm += 5) {
      const yPos = offsetY + (cm * escala);
      const isMeter = (cm > 0 && cm % 100 === 0);
      const isMajor = (cm % 10 === 0 || isMeter);

      ctx.beginPath();
      if (isMeter) {
        // Linha marcando metro completo
        ctx.strokeStyle = '#2dd4bf';
        ctx.lineWidth = 1.2;
        ctx.moveTo(4 + margemReguaX, yPos);
        ctx.lineTo(4, yPos);
        ctx.stroke();

        ctx.fillStyle = '#2dd4bf';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${cm / 100}m`, 4 + margemReguaX - 2, yPos - 5);
      } else if (isMajor) {
        ctx.strokeStyle = 'rgba(45, 212, 191, 0.7)';
        ctx.lineWidth = 0.9;
        ctx.moveTo(4 + margemReguaX, yPos);
        ctx.lineTo(4 + margemReguaX - 6, yPos);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 7.5px monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${cm}`, 4 + margemReguaX - 7, yPos);
      } else {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.lineWidth = 0.6;
        ctx.moveTo(4 + margemReguaX, yPos);
        ctx.lineTo(4 + margemReguaX - 3.5, yPos);
        ctx.stroke();
      }
    }

    // 3. FUNDO DAS FOLHAS FÍSICAS DE DTF (CADA UMA COM SUA METRAGEM INDEPENDENTE)
    if (arquivoIndex === 0 && temMultiplosArquivos) {
      // Visão Geral: Desenha cada arquivo como uma folha física delimitada
      resultadoNesting.arquivos.forEach(arq => {
        const sheetY = offsetY + (arq.yInicioGlobal * escala);
        const sheetH = arq.alturaCm * escala;

        // Fundo da folha
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(offsetX, sheetY, roloPixelW, sheetH);

        // Borda destacada do arquivo
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(offsetX, sheetY, roloPixelW, sheetH);

        // Barra superior de identificação do Arquivo
        ctx.fillStyle = 'rgba(2, 132, 199, 0.12)';
        ctx.fillRect(offsetX, sheetY, roloPixelW, 20);
        ctx.strokeStyle = 'rgba(2, 132, 199, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(offsetX, sheetY + 20);
        ctx.lineTo(offsetX + roloPixelW, sheetY + 20);
        ctx.stroke();

        ctx.fillStyle = '#0369a1';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`📄 ARQUIVO ${arq.index} (${arq.metrosLineares}m • ${W_ROLO}x${arq.alturaCm}cm) — ${arq.artes.length} estampas`, offsetX + 8, sheetY + 14);

        // Rodapé da folha indicando final do metro
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`Limite de ${arq.metrosLineares}m do Arquivo ${arq.index}`, offsetX + roloPixelW - 8, sheetY + sheetH - 5);
      });
    } else {
      // Arquivo único ou folha isolada
      ctx.fillStyle = '#f8fafc';
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

      // Borda sólida da folha
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(offsetX, offsetY, roloPixelW, roloPixelH);

      if (arquivoIndex > 0 && resultadoNesting.arquivos && resultadoNesting.arquivos[arquivoIndex - 1]) {
        const arq = resultadoNesting.arquivos[arquivoIndex - 1];
        ctx.fillStyle = 'rgba(2, 132, 199, 0.12)';
        ctx.fillRect(offsetX, offsetY, roloPixelW, 20);
        ctx.fillStyle = '#0369a1';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`📄 ARQUIVO ${arq.index} (${arq.metrosLineares}m • ${W_ROLO}x${arq.alturaCm}cm) — ${arq.artes.length} estampas`, offsetX + 8, offsetY + 14);
      }
    }

    // 4. RENDERIZAÇÃO REAL DAS ARTES COM PROPORÇÃO GEOMÉTRICA RÍGIDA (NUNCA ACHATADA)
    artesParaDesenhar.forEach(arte => {
      const yRelativo = (arquivoIndex > 0)
        ? (arte.yNoArquivo !== undefined ? arte.yNoArquivo : arte.y)
        : (arte.yGlobal !== undefined ? arte.yGlobal : arte.y);

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

      // Moldura e Borda
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
      yOffset = 0;
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
      yOffset = 0;
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
