/**
 * UNIFORMES ERP - TEXPRO INDUSTRIAL ERP
 * Controlador Principal da Aplicação Integrada
 * Sistema de Gestão Industrial e Comercial para Fábricas de Uniformes
 */

(function () {
  'use strict';

  // Detecção de Modo Demonstração (Test Drive)
  const isDemo = (window.TEXPRO_IS_DEMO === true) || 
                 (window.location && window.location.search && window.location.search.includes('demo=1')) || 
                 (window.location && window.location.pathname && (window.location.pathname.includes('/demo') || window.location.pathname.includes('demo.html')));
  const ERP_VERSION = isDemo ? 'DEMO_SANDBOX_V1' : '8.0_ZERO_PROD';
  const STORAGE_KEY = isDemo ? 'texpro_erp_demo_temp' : 'texpro_erp_prod_v8';
  let db = null;

  if (isDemo) {
    db = JSON.parse(JSON.stringify(window.ERP_INITIAL_DATA));
    db.versao = ERP_VERSION;
  } else {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY);
      if (salvo) {
        db = JSON.parse(salvo);
      }
    } catch (e) {
      console.error('Erro ao ler localStorage', e);
    }

    if (!db || db.versao !== ERP_VERSION || !db.produtosBase || db.produtosBase.length < 20 || !db.insumosCatalogoMestre) {
      db = JSON.parse(JSON.stringify(window.ERP_INITIAL_DATA));
      db.versao = ERP_VERSION;
      salvarEstado();
    }
  }

  // Garantir integridade de arrays e ausência de dados fictícios
  if (!db.capacidadesProducao || !Array.isArray(db.capacidadesProducao) || db.capacidadesProducao.length === 0) {
    db.capacidadesProducao = JSON.parse(JSON.stringify(window.ERP_INITIAL_DATA.capacidadesProducao || []));
  }
  if (!db.historicoFinanceiroMensal || !Array.isArray(db.historicoFinanceiroMensal) || db.historicoFinanceiroMensal.length === 0) {
    db.historicoFinanceiroMensal = JSON.parse(JSON.stringify(window.ERP_INITIAL_DATA.historicoFinanceiroMensal || []));
  }
  if (!Array.isArray(db.despesasFixas)) db.despesasFixas = [];
  if (!Array.isArray(db.costureiras)) db.costureiras = [];
  if (!Array.isArray(db.equipe)) db.equipe = [];
  if (!Array.isArray(db.pedidos)) db.pedidos = [];
  if (!Array.isArray(db.clientes)) db.clientes = [];
  if (!Array.isArray(db.ordensServico)) db.ordensServico = [];
  if (!Array.isArray(db.lancamentosFinanceiros)) db.lancamentosFinanceiros = [];
  if (!Array.isArray(db.nestingFila)) db.nestingFila = [];
  if (!Array.isArray(db.notasFiscais)) db.notasFiscais = [];
  if (!Array.isArray(db.compras)) db.compras = [];
  salvarEstado();

  function salvarEstado() {
    if (isDemo) {
      // No modo demonstração, salva apenas na sessão temporária do navegador
      // NUNCA salva no banco oficial de produção e NUNCA envia para a nuvem Supabase!
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      } catch (e) {}
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Erro ao salvar no localStorage', e);
    }
    if (window.ERP_CLOUD && typeof window.ERP_CLOUD.sincronizarComNuvem === 'function') {
      window.ERP_CLOUD.sincronizarComNuvem(db);
    }
  }

  // Catálogo Oficial de Cores Têxteis Industriais (36 cores comerciais)
  const PALETA_CORES_TEXTIL = [
    // Azuis
    { nome: 'Azul Marinho', hex: '#1e293b', grupo: 'Azuis' },
    { nome: 'Azul Royal', hex: '#1d4ed8', grupo: 'Azuis' },
    { nome: 'Azul Bic', hex: '#2563eb', grupo: 'Azuis' },
    { nome: 'Azul Celeste', hex: '#38bdf8', grupo: 'Azuis' },
    { nome: 'Azul Petróleo', hex: '#0f766e', grupo: 'Azuis' },
    { nome: 'Azul Turquesa', hex: '#06b6d4', grupo: 'Azuis' },
    { nome: 'Azul Jeans', hex: '#3b82f6', grupo: 'Azuis' },

    // Neutros e Pretos
    { nome: 'Preto Reativo', hex: '#0f172a', grupo: 'Neutros' },
    { nome: 'Branco Neve', hex: '#ffffff', grupo: 'Neutros' },
    { nome: 'Off-White', hex: '#f8fafc', grupo: 'Neutros' },
    { nome: 'Cinza Mescla', hex: '#94a3b8', grupo: 'Neutros' },
    { nome: 'Cinza Chumbo', hex: '#475569', grupo: 'Neutros' },
    { nome: 'Grafite', hex: '#334155', grupo: 'Neutros' },
    { nome: 'Areia / Bege', hex: '#d6d3d1', grupo: 'Neutros' },
    { nome: 'Caqui / Camel', hex: '#a3a375', grupo: 'Neutros' },

    // Vermelhos e Vinhos
    { nome: 'Vermelho Ferrari', hex: '#dc2626', grupo: 'Vermelhos' },
    { nome: 'Bordô / Vinho', hex: '#881337', grupo: 'Vermelhos' },
    { nome: 'Marsala', hex: '#991b1b', grupo: 'Vermelhos' },
    { nome: 'Coral', hex: '#f43f5e', grupo: 'Vermelhos' },
    { nome: 'Magenta / Cereja', hex: '#be185d', grupo: 'Vermelhos' },

    // Verdes
    { nome: 'Verde Bandeira', hex: '#15803d', grupo: 'Verdes' },
    { nome: 'Verde Musgo', hex: '#3f6212', grupo: 'Verdes' },
    { nome: 'Verde Militar', hex: '#4d5b44', grupo: 'Verdes' },
    { nome: 'Verde Garrafa', hex: '#14532d', grupo: 'Verdes' },
    { nome: 'Verde Limão / Neon', hex: '#84cc16', grupo: 'Verdes' },
    { nome: 'Verde Água', hex: '#2dd4bf', grupo: 'Verdes' },
    { nome: 'Verde Tiffany', hex: '#0d9488', grupo: 'Verdes' },

    // Amarelos e Laranjas
    { nome: 'Amarelo Canário', hex: '#facc15', grupo: 'Amarelos' },
    { nome: 'Amarelo Ouro', hex: '#eab308', grupo: 'Amarelos' },
    { nome: 'Mostarda / Ocre', hex: '#d97706', grupo: 'Amarelos' },
    { nome: 'Laranja Operacional', hex: '#ea580c', grupo: 'Amarelos' },
    { nome: 'Laranja Cenoura', hex: '#f97316', grupo: 'Amarelos' },

    // Especiais e Roxo
    { nome: 'Roxo / Violeta', hex: '#7e22ce', grupo: 'Especiais' },
    { nome: 'Lilás', hex: '#c084fc', grupo: 'Especiais' },
    { nome: 'Rosa Pink', hex: '#db2777', grupo: 'Especiais' },
    { nome: 'Rosa Bebê', hex: '#fbcfe8', grupo: 'Especiais' },
    { nome: 'Marrom Café', hex: '#543310', grupo: 'Especiais' },
    { nome: 'Terracota', hex: '#9a3412', grupo: 'Especiais' }
  ];

  function gerarHTMLSeletorCoresIndustrial(prefixo, corAtual = 'Azul Marinho', obsAtual = '') {
    const corNormalizada = (corAtual || 'Azul Marinho').trim();
    const corAtivaObj = PALETA_CORES_TEXTIL.find(c => c.nome.toLowerCase() === corNormalizada.toLowerCase());
    const hexAtivo = corAtivaObj ? corAtivaObj.hex : '#1e293b';

    return `
      <!-- Seletor Industrial de Cores Têxteis com Busca em Tempo Real e Detalhes de Confecção -->
      <div class="seletor-cores-industrial" id="${prefixo}ContainerSeletorCores" style="background: #fdfbf7; border: 1.5px solid #fed7aa; border-radius: var(--radius-sm); padding: 13px 14px; margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 13px; font-weight: 800; color: #9a3412; display: flex; align-items: center; gap: 6px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 0 20v-20z"></path></svg>
              Paleta Têxtil Industrial & Detalhes da Peça:
            </span>
            <span class="status-pill status-orange" style="font-size: 10px; font-weight: 700; padding: 2px 8px;">36 Cores Comerciais</span>
          </div>

          <!-- Badge da Cor Ativa -->
          <div id="${prefixo}BadgeCorSelecionada" style="display: flex; align-items: center; gap: 7px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 20px; padding: 3px 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <span style="font-size: 11px; color: var(--text-gray-500); font-weight: 600;">Cor Escolhida:</span>
            <span id="${prefixo}CircleCorAtiva" class="swatch-circle" style="background-color: ${hexAtivo}; width: 14px; height: 14px; ${hexAtivo === '#ffffff' ? 'border: 1px solid #cbd5e1;' : ''}"></span>
            <strong id="${prefixo}NomeCorAtiva" style="font-size: 12px; color: var(--text-primary);">${corNormalizada}</strong>
          </div>
        </div>

        <div class="form-row" style="margin-bottom: 0; gap: 14px; align-items: flex-start;">
          <!-- Coluna 1: Amostras de Cores com Busca e Filtros -->
          <div class="form-group" style="flex: 1.35; margin-bottom: 0;">
            <!-- Barra de Busca e Input Oficial da Cor -->
            <div style="display: flex; gap: 6px; margin-bottom: 7px;">
              <div style="position: relative; flex: 1.4;">
                <input type="text" id="${prefixo}BuscaCor" class="form-input" placeholder="🔍 Pesquisar cor (ex: Marinho, Royal, Preto, Verde...)" style="font-size: 11.5px; padding: 5px 9px; height: 32px; border-radius: 6px;">
              </div>
              <div style="position: relative; flex: 1;">
                <input type="text" id="${prefixo}CorPrincipalTecido" class="form-input" value="${corNormalizada}" placeholder="Ou digite Pantone/nome..." title="Nome oficial da cor gravado no pedido" style="font-size: 11px; font-weight: 700; height: 32px;">
              </div>
            </div>

            <!-- Filtros de Grupos / Categorias -->
            <div style="display: flex; gap: 3px; margin-bottom: 6px; flex-wrap: wrap;" id="${prefixo}FiltrosGruposCores">
              <button type="button" class="btn-filtro-grupo-cor active" data-grupo="todas">Todas (36)</button>
              <button type="button" class="btn-filtro-grupo-cor" data-grupo="Azuis">Azuis</button>
              <button type="button" class="btn-filtro-grupo-cor" data-grupo="Neutros">Neutros/Preto</button>
              <button type="button" class="btn-filtro-grupo-cor" data-grupo="Vermelhos">Vermelhos</button>
              <button type="button" class="btn-filtro-grupo-cor" data-grupo="Verdes">Verdes</button>
              <button type="button" class="btn-filtro-grupo-cor" data-grupo="Amarelos">Amarelos/Laranja</button>
              <button type="button" class="btn-filtro-grupo-cor" data-grupo="Especiais">Especiais</button>
            </div>

            <!-- Grade de Amostras de Cores (Swatches Clicáveis) -->
            <div id="${prefixo}ContainerSwatches" style="max-height: 125px; overflow-y: auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px; display: flex; flex-wrap: wrap; gap: 4px; align-content: flex-start; scrollbar-width: thin;">
              ${PALETA_CORES_TEXTIL.map(c => `
                <button type="button" class="swatch-chip ${c.nome.toLowerCase() === corNormalizada.toLowerCase() ? 'active' : ''}" data-cor="${c.nome}" data-hex="${c.hex}" data-grupo="${c.grupo}" title="Clique para selecionar ${c.nome} (${c.hex})">
                  <span class="swatch-circle" style="background-color: ${c.hex}; ${c.hex === '#ffffff' ? 'border: 1px solid #cbd5e1;' : ''}"></span>
                  <span>${c.nome}</span>
                </button>
              `).join('')}
            </div>
            <div id="${prefixo}MsgNenhumaCor" style="display: none; font-size: 11px; color: #9a3412; padding: 8px 4px; text-align: center;">
              Nenhuma cor têxtil encontrada. O valor digitado no campo será salvo como cor personalizada.
            </div>
          </div>

          <!-- Coluna 2: Observações e Detalhes de Confecção -->
          <div class="form-group" style="flex: 1.15; margin-bottom: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <label class="form-label" style="font-weight: 700; color: #9a3412; margin: 0; font-size: 11.5px; display: flex; align-items: center; gap: 5px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Detalhes de Confecção & Bicolores:
              </label>
              <span style="font-size: 9.5px; color: #c2410c; font-weight: 700;">Ficha Técnica A4</span>
            </div>

            <textarea id="${prefixo}ObservacoesCoresDetalhes" class="form-textarea" rows="2" style="font-size: 11px; resize: vertical; min-height: 52px; line-height: 1.35;" placeholder="Ex: Gola e punhos brancos com frisos laranjas (2mm). Peitilho interno branco. Recorte lateral dry fit amarelo...">${obsAtual || ''}</textarea>

            <!-- Botões de Inserção Rápida de Detalhes -->
            <div style="display: flex; gap: 3px; margin-top: 5px; flex-wrap: wrap;">
              <span style="font-size: 9.5px; color: #7c2d12; font-weight: 700; align-self: center; margin-right: 2px;">+ Inserir:</span>
              <button type="button" class="btn-quick-detalhe" data-prefixo="${prefixo}" data-texto="Gola e punhos com friso contrastante">+ Gola/Punho Friso</button>
              <button type="button" class="btn-quick-detalhe" data-prefixo="${prefixo}" data-texto="Peitilho interno contrastante com botões combinando">+ Peitilho Interno</button>
              <button type="button" class="btn-quick-detalhe" data-prefixo="${prefixo}" data-texto="Recortes laterais respiráveis contrastantes">+ Recortes Laterais</button>
              <button type="button" class="btn-quick-detalhe" data-prefixo="${prefixo}" data-texto="Faixa refletiva de 5cm norma ABNT">+ Faixa Refletiva</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function configurarEventosSeletorCores(prefixo, onCorSelecionada) {
    const container = document.getElementById(`${prefixo}ContainerSeletorCores`);
    if (!container) return;

    const inputCor = document.getElementById(`${prefixo}CorPrincipalTecido`);
    const inputBusca = document.getElementById(`${prefixo}BuscaCor`);
    const circleAtivo = document.getElementById(`${prefixo}CircleCorAtiva`);
    const nomeAtivo = document.getElementById(`${prefixo}NomeCorAtiva`);
    const msgNenhuma = document.getElementById(`${prefixo}MsgNenhumaCor`);
    const textareaObs = document.getElementById(`${prefixo}ObservacoesCoresDetalhes`);

    function selecionarCor(nome, hex, dispararCallback = true) {
      if (inputCor) inputCor.value = nome;
      if (circleAtivo) {
        circleAtivo.style.backgroundColor = hex || '#1e293b';
        if (hex === '#ffffff') {
          circleAtivo.style.border = '1px solid #cbd5e1';
        } else {
          circleAtivo.style.border = 'none';
        }
      }
      if (nomeAtivo) nomeAtivo.textContent = nome;

      // Atualiza active nos chips
      container.querySelectorAll('.swatch-chip').forEach(chip => {
        if (chip.getAttribute('data-cor').toLowerCase() === nome.toLowerCase()) {
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      });

      if (dispararCallback && typeof onCorSelecionada === 'function') {
        onCorSelecionada(nome, hex);
      }
    }

    // Clique em cada swatch chip
    container.querySelectorAll('.swatch-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const corNome = chip.getAttribute('data-cor');
        const corHex = chip.getAttribute('data-hex');
        selecionarCor(corNome, corHex, true);
      });
    });

    // Filtro por categoria
    let grupoAtivo = 'todas';
    container.querySelectorAll('.btn-filtro-grupo-cor').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.btn-filtro-grupo-cor').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        grupoAtivo = btn.getAttribute('data-grupo');
        aplicarFiltros();
      });
    });

    // Busca em tempo real
    function aplicarFiltros() {
      const termo = (inputBusca?.value || '').toLowerCase().trim();
      let totalVisiveis = 0;

      container.querySelectorAll('.swatch-chip').forEach(chip => {
        const nomeCor = chip.getAttribute('data-cor').toLowerCase();
        const grupoCor = chip.getAttribute('data-grupo');

        const coincideGrupo = (grupoAtivo === 'todas' || grupoCor === grupoAtivo);
        const coincideTermo = (!termo || nomeCor.includes(termo) || grupoCor.toLowerCase().includes(termo));

        if (coincideGrupo && coincideTermo) {
          chip.style.display = 'inline-flex';
          totalVisiveis++;
        } else {
          chip.style.display = 'none';
        }
      });

      if (msgNenhuma) {
        msgNenhuma.style.display = totalVisiveis === 0 ? 'block' : 'none';
      }
    }

    inputBusca?.addEventListener('input', aplicarFiltros);

    // Digitação manual no campo de cor principal
    inputCor?.addEventListener('input', () => {
      const val = inputCor.value.trim();
      if (!val) return;
      const achada = PALETA_CORES_TEXTIL.find(c => c.nome.toLowerCase() === val.toLowerCase());
      if (achada) {
        selecionarCor(achada.nome, achada.hex, true);
      } else {
        if (nomeAtivo) nomeAtivo.textContent = val;
        if (circleAtivo) circleAtivo.style.backgroundColor = '#94a3b8';
      }
    });

    // Botões de inserção rápida de detalhes de confecção
    container.querySelectorAll('.btn-quick-detalhe').forEach(btn => {
      btn.addEventListener('click', () => {
        const texto = btn.getAttribute('data-texto');
        if (!textareaObs || !texto) return;
        const atual = textareaObs.value.trim();
        if (!atual) {
          textareaObs.value = texto;
        } else if (!atual.toLowerCase().includes(texto.toLowerCase())) {
          textareaObs.value = atual + '; ' + texto;
        }
        textareaObs.focus();
      });
    });
  }

  // Estado da Aplicação
  let abaAtiva = 'abertura';
  let visualizacaoPedidos = 'tabela'; // 'tabela' ou 'kanban'

  // Elementos Centrais
  const contentArea = document.getElementById('contentArea');
  const pageTitleElem = document.getElementById('pageTitle');
  const pageBreadcrumbElem = document.getElementById('pageBreadcrumb');
  const toastElem = document.getElementById('erpToast');
  const modalContainer = document.getElementById('modalContainer');

  // Inicialização do Sistema
  function init() {
    configurarMenuNavegacao();
    configurarIdentidadeEPerfis();
    configurarCliqueStatusNuvem();
    if (!isDemo) {
      configurarEscutaNuvemRealtime();
    }
    if (isDemo) {
      carregarDemonstracaoShowroom();
    }
    atualizarBadges();
    configurarCliqueGlobalMockups();
    configurarFechamentoModaisGlobal();
    inicializarBarraRolagemFixa();
    navegarPara(abaAtiva);
  }

  function configurarCliqueStatusNuvem() {
    const badge = document.getElementById('cloudStatusBadge');
    if (badge) {
      badge.style.cursor = 'pointer';
      badge.title = 'Clique para configurar ou ver o status do Banco na Nuvem (Firebase / Firestore)';
      badge.addEventListener('click', () => {
        if (window.ERP_CLOUD && typeof window.ERP_CLOUD.abrirModalConfigNuvem === 'function') {
          window.ERP_CLOUD.abrirModalConfigNuvem();
        }
      });
    }
  }

  function configurarEscutaNuvemRealtime() {
    if (window.ERP_CLOUD && typeof window.ERP_CLOUD.iniciarEscutaRealtime === 'function') {
      window.ERP_CLOUD.iniciarEscutaRealtime((novoDb) => {
        if (novoDb && Array.isArray(novoDb.pedidos)) {
          db = novoDb;
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
          } catch (e) {}
          atualizarBadges();
          navegarPara(abaAtiva);
          mostrarToast('Dados atualizados em tempo real pela Nuvem!', 'green');
        }
      });
    }
  }

  // ==========================================================================
  // BARRA DE ROLAGEM HORIZONTAL FIXA FLUTUANTE (SISTEMA GERAL)
  // Permite rolar lateralmente qualquer tabela sem descer até o fim da página
  // ==========================================================================
  function inicializarBarraRolagemFixa() {
    let floatingBar = document.getElementById('erpFloatingHorizontalScrollbar');
    let floatingInner = document.getElementById('erpFloatingHorizontalScrollbarInner');

    if (!floatingBar) {
      floatingBar = document.createElement('div');
      floatingBar.id = 'erpFloatingHorizontalScrollbar';
      floatingBar.className = 'erp-floating-scrollbar';
      floatingBar.setAttribute('aria-hidden', 'true');
      floatingBar.setAttribute('title', 'Arraste para rolar a tabela lateralmente sem descer até o fim');
      floatingInner = document.createElement('div');
      floatingInner.id = 'erpFloatingHorizontalScrollbarInner';
      floatingInner.className = 'erp-floating-scrollbar-inner';
      floatingBar.appendChild(floatingInner);
      const erpMain = document.querySelector('.erp-main') || document.body;
      erpMain.appendChild(floatingBar);
    }

    let tabelaAtiva = null;
    let sincronizando = false;

    function atualizarBarra() {
      if (!floatingBar || !floatingInner) return;
      const tabelas = Array.from(document.querySelectorAll('.table-wrapper'));
      const vh = window.innerHeight || document.documentElement.clientHeight;

      let tabelaCandidata = null;

      for (const t of tabelas) {
        if (t.scrollWidth > t.clientWidth + 2) {
          const rect = t.getBoundingClientRect();
          // Se a tabela está na tela e seu fundo está abaixo da tela
          if (rect.top < vh - 40 && rect.bottom > vh) {
            tabelaCandidata = t;
            break;
          }
        }
      }

      if (!tabelaCandidata) {
        floatingBar.style.display = 'none';
        tabelaAtiva = null;
        return;
      }

      const rect = tabelaCandidata.getBoundingClientRect();

      // Se o fundo da tabela já está visível dentro da janela, a barra nativa já está acessível
      if (rect.bottom <= vh + 5) {
        floatingBar.style.display = 'none';
        tabelaAtiva = null;
        return;
      }

      tabelaAtiva = tabelaCandidata;

      // Exibe e ajusta posição e tamanho
      floatingBar.style.display = 'block';
      const leftPos = Math.max(0, rect.left);
      const widthVal = Math.max(100, Math.min(window.innerWidth - leftPos, rect.width));
      floatingBar.style.left = leftPos + 'px';
      floatingBar.style.width = widthVal + 'px';
      floatingInner.style.width = Math.max(tabelaCandidata.scrollWidth, widthVal + 400) + 'px';

      // Sincroniza a posição de rolagem proporcionalmente
      const maxTable = tabelaCandidata.scrollWidth - tabelaCandidata.clientWidth;
      const maxFloating = floatingBar.scrollWidth - floatingBar.clientWidth;

      if (!sincronizando && maxTable > 0 && maxFloating > 0) {
        sincronizando = true;
        const pct = Math.min(1, Math.max(0, tabelaCandidata.scrollLeft / maxTable));
        floatingBar.scrollLeft = Math.round(pct * maxFloating);
        requestAnimationFrame(() => {
          sincronizando = false;
        });
      }
    }

    // Ao arrastar a barra flutuante: calcula a porcentagem e aplica na tabela
    // Isso garante que se o usuário arrastar até o fim, a tabela VAI até a última coluna sem truncar
    floatingBar.addEventListener('scroll', () => {
      if (sincronizando || !tabelaAtiva) return;
      const maxFloating = floatingBar.scrollWidth - floatingBar.clientWidth;
      const maxTable = tabelaAtiva.scrollWidth - tabelaAtiva.clientWidth;
      if (maxFloating <= 0 || maxTable <= 0) return;

      sincronizando = true;
      const pct = Math.min(1, Math.max(0, floatingBar.scrollLeft / maxFloating));
      tabelaAtiva.scrollLeft = Math.round(pct * maxTable);
      requestAnimationFrame(() => {
        sincronizando = false;
      });
    }, { passive: true });

    window.addEventListener('scroll', atualizarBarra, { passive: true });
    window.addEventListener('resize', atualizarBarra, { passive: true });

    document.addEventListener('scroll', (e) => {
      if (e.target && e.target.classList && e.target.classList.contains('table-wrapper')) {
        if (e.target === tabelaAtiva && !sincronizando) {
          const maxFloating = floatingBar.scrollWidth - floatingBar.clientWidth;
          const maxTable = e.target.scrollWidth - e.target.clientWidth;
          if (maxFloating > 0 && maxTable > 0) {
            sincronizando = true;
            const pct = Math.min(1, Math.max(0, e.target.scrollLeft / maxTable));
            floatingBar.scrollLeft = Math.round(pct * maxFloating);
            requestAnimationFrame(() => {
              sincronizando = false;
            });
          }
        }
      }
    }, true);

    const contentAreaElem = document.getElementById('contentArea');
    if (contentAreaElem && window.MutationObserver) {
      const observer = new MutationObserver(() => {
        setTimeout(atualizarBarra, 40);
        setTimeout(atualizarBarra, 200);
      });
      observer.observe(contentAreaElem, { childList: true, subtree: true });
    }

    window.ERP_ATUALIZAR_BARRA_ROLAGEM = atualizarBarra;
    setTimeout(atualizarBarra, 100);
    setTimeout(atualizarBarra, 400);
  }

  // Notificações Toast do Sistema (Zero Emojis, Puros SVGs)
  function mostrarToast(mensagem, tipo = 'green') {
    if (!toastElem) return;
    toastElem.className = `toast-msg toast-${tipo} show`;
    toastElem.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${tipo === 'green' 
          ? '<polyline points="20 6 9 17 4 12"></polyline>' 
          : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'}
      </svg>
      <span>${mensagem}</span>
    `;
    setTimeout(() => {
      toastElem.classList.remove('show');
    }, 4500);
  }

  // Utilitários de Formatação
  function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
  }

  function formatarNumero(valor) {
    return new Intl.NumberFormat('pt-BR').format(valor || 0);
  }

  function formatarK(valor) {
    if (valor === undefined || valor === null || isNaN(valor)) return 'R$ 0';
    const num = Number(valor);
    const absVal = Math.abs(num);
    if (absVal === 0) return 'R$ 0';
    const prefix = num < 0 ? '-' : '';
    if (absVal >= 1000) {
      const milhar = (absVal / 1000).toFixed(absVal % 1000 === 0 ? 0 : 1).replace('.0', '');
      return `${prefix}R$ ${milhar}k`;
    }
    return `${prefix}R$ ${absVal.toFixed(0)}`;
  }

  function formatarTelefone(tel) {
    const limpo = (tel || '').toString().replace(/\D/g, '');
    if (limpo.length === 11) {
      return `(${limpo.substring(0,2)}) ${limpo.substring(2,7)}-${limpo.substring(7)}`;
    }
    return tel || '';
  }

  function formatarDataBr(dataIso) {
    if (!dataIso) return '-';
    const clean = dataIso.split('T')[0];
    const partes = clean.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataIso;
  }

  function formatarDiaMes(dataIso) {
    if (!dataIso) return '-';
    const clean = dataIso.split('T')[0];
    const partes = clean.split('-');
    if (partes.length === 3) {
      const dia = partes[2];
      const mesNum = parseInt(partes[1], 10);
      const nomesMes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return `${dia}/${partes[1]} (${nomesMes[mesNum - 1] || ''})`;
    }
    return dataIso;
  }

  function calcularStatusDespesa(despesa) {
    if (despesa.status === 'Pago') {
      const dataPagoFmt = despesa.dataPagamento ? formatarDataBr(despesa.dataPagamento) : '';
      return {
        tipo: 'pago',
        label: 'Pago',
        badgeHtml: `<span class="status-pill status-green" style="font-weight: 700;">✓ PAGO</span>`,
        diasTexto: dataPagoFmt ? `Pago em ${dataPagoFmt}` : 'Quitado',
        dias: 0,
        isAtrasado: false,
        isPago: true
      };
    }

    if (!despesa.dataVencimento) {
      return {
        tipo: 'pendente',
        label: 'A Vencer',
        badgeHtml: `<span class="status-pill status-gray">SEM VENCIMENTO</span>`,
        diasTexto: 'Data não informada',
        dias: 0,
        isAtrasado: false,
        isPago: false
      };
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const partes = despesa.dataVencimento.split('T')[0].split('-');
    const venc = new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10));
    venc.setHours(0, 0, 0, 0);

    const diffMs = hoje.getTime() - venc.getTime();
    const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDias > 0) {
      return {
        tipo: 'atrasado',
        label: 'Atrasado',
        badgeHtml: `<span class="status-pill status-red" style="font-weight: 800;">⚠️ ATRASADO (${diffDias} ${diffDias === 1 ? 'dia' : 'dias'})</span>`,
        diasTexto: `Vencido há ${diffDias} ${diffDias === 1 ? 'dia' : 'dias'}`,
        dias: diffDias,
        isAtrasado: true,
        isPago: false
      };
    } else if (diffDias === 0) {
      return {
        tipo: 'hoje',
        label: 'Vence Hoje',
        badgeHtml: `<span class="status-pill status-yellow" style="font-weight: 800;">⏰ VENCE HOJE</span>`,
        diasTexto: 'Vencimento hoje',
        dias: 0,
        isAtrasado: false,
        isPago: false
      };
    } else {
      const diasRestantes = Math.abs(diffDias);
      return {
        tipo: 'a_vencer',
        label: 'No Prazo',
        badgeHtml: `<span class="status-pill status-blue">A VENCER (${diasRestantes}d)</span>`,
        diasTexto: `Vence em ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}`,
        dias: diasRestantes,
        isAtrasado: false,
        isPago: false
      };
    }
  }

  // Utilitário de Parsing de Datas Diversas (ISO, YYYY-MM-DD, DD/MM/YYYY)
  function parsearDataGenerica(str) {
    if (!str) return null;
    if (str instanceof Date) return isNaN(str.getTime()) ? null : str;
    if (typeof str !== 'string') return null;
    str = str.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      const parts = str.substring(0, 10).split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
      return isNaN(d.getTime()) ? null : d;
    }
    if (/^\d{2}\/\d{2}\/\d{4}/.test(str)) {
      const parts = str.substring(0, 10).split('/');
      const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]), 12, 0, 0);
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }

  // Valida se o registro é um Orçamento em negociação (não confirmado em produção)
  function isPedidoOrcamento(p) {
    if (!p) return false;
    return p.tipoRegistro === 'Orcamento' || 
           p.tipoRegistro === 'Orçamento' || 
           p.status === 'Orcamento' || 
           p.status === 'Orçamento' || 
           p.etapaProducao === 'Orcamento' || 
           p.etapaProducao === 'Em Negociação' || 
           p.etapa === 'Orcamento' || 
           (p.id && String(p.id).startsWith('ORC-'));
  }

  // Motor de Contagem Regressiva e Alerta Térmico de Prazos dos Pedidos
  function calcularContagemRegressivaPedido(p) {
    if (!p) {
      return {
        statusPrazo: 'indefinido',
        diffDias: 999,
        classeCor: 'countdown-finalizado',
        pulse: false,
        label: 'INDEFINIDO',
        diasTexto: 'Sem dados',
        corBarra: '#cbd5e1',
        percTempo: 0,
        badgeHtml: `<span class="badge-countdown countdown-finalizado">--</span>`
      };
    }

    // Regra Têxtil Industrial: Orçamentos em negociação NÃO contam prazo de produção (não são pedidos confirmados)
    if (isPedidoOrcamento(p)) {
      const diasPrometidos = p.prazoPedidoDias || 15;
      return {
        statusPrazo: 'orcamento',
        diffDias: 999,
        classeCor: 'countdown-orcamento',
        pulse: false,
        label: 'ORÇAMENTO (NÃO CONTA PRAZO)',
        diasTexto: `Prazo estimado de ${diasPrometidos} dias úteis (passa a contar apenas após confirmação e sinal)`,
        corBarra: '#cbd5e1',
        percTempo: 0,
        badgeHtml: `<span class="badge-countdown countdown-orcamento" title="Orçamento em negociação: prazo de produção não é contabilizado antes da confirmação do pedido"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ORÇAMENTO (NÃO CONTA)</span>`
      };
    }

    const isFinalizado = p.status === 'Finalizado' || p.status === 'Entregue' || p.etapaProducao === 'Entregue' || p.etapa === 'Entregue' || p.etapaProducao === 'Expedicao';
    if (isFinalizado) {
      return {
        statusPrazo: 'finalizado',
        diffDias: 0,
        classeCor: 'countdown-finalizado',
        pulse: false,
        label: p.status === 'Finalizado' || p.status === 'Entregue' ? 'ENTREGUE' : 'EXPEDIÇÃO',
        diasTexto: 'Pedido concluído pela fábrica',
        corBarra: '#94a3b8',
        percTempo: 100,
        badgeHtml: `<span class="badge-countdown countdown-finalizado" title="Pedido concluído ou em expedição"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> ${p.status === 'Finalizado' || p.status === 'Entregue' ? 'ENTREGUE' : 'PRONTO'}</span>`
      };
    }

    const dataAlvoStr = p.dataPrevisaoEntrega || p.dataMetaInterna || p.dataPrevisaoInterna;
    if (!dataAlvoStr) {
      return {
        statusPrazo: 'sem_prazo',
        diffDias: 999,
        classeCor: 'countdown-finalizado',
        pulse: false,
        label: 'SEM PRAZO',
        diasTexto: 'Prazo a definir',
        corBarra: '#cbd5e1',
        percTempo: 0,
        badgeHtml: `<span class="badge-countdown countdown-finalizado" title="Prazo de entrega não definido">SEM PRAZO</span>`
      };
    }

    const dataAlvo = parsearDataGenerica(dataAlvoStr);
    if (!dataAlvo) {
      return {
        statusPrazo: 'invalido',
        diffDias: 999,
        classeCor: 'countdown-finalizado',
        pulse: false,
        label: 'DATA INVÁLIDA',
        diasTexto: 'Data inválida',
        corBarra: '#cbd5e1',
        percTempo: 0,
        badgeHtml: `<span class="badge-countdown countdown-finalizado">PRAZO --</span>`
      };
    }

    const hoje = new Date();
    hoje.setHours(12, 0, 0, 0);

    const diffMs = dataAlvo.getTime() - hoje.getTime();
    const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));

    // Progresso do tempo decorrido
    let percTempo = 50;
    if (p.dataCriacao) {
      const dataCriacao = parsearDataGenerica(p.dataCriacao) || new Date(hoje.getTime() - (7 * 86400000));
      const totalMs = dataAlvo.getTime() - dataCriacao.getTime();
      const decorridoMs = hoje.getTime() - dataCriacao.getTime();
      if (totalMs > 0) {
        percTempo = Math.min(100, Math.max(0, Math.round((decorridoMs / totalMs) * 100)));
      } else {
        percTempo = 100;
      }
    }

    let classeCor = 'countdown-seguro';
    let statusPrazo = 'seguro';
    let pulse = false;
    let label = '';
    let diasTexto = '';
    let corBarra = '#10b981';

    if (diffDias < 0) {
      const atraso = Math.abs(diffDias);
      classeCor = 'countdown-atrasado';
      statusPrazo = 'atrasado';
      pulse = true;
      corBarra = '#ef4444';
      label = `ATRASADO (-${atraso}d)`;
      diasTexto = `Prazo estourado há ${atraso} ${atraso === 1 ? 'dia' : 'dias'}`;
    } else if (diffDias === 0) {
      classeCor = 'countdown-hoje';
      statusPrazo = 'hoje';
      pulse = true;
      corBarra = '#dc2626';
      label = `VENCE HOJE`;
      diasTexto = `Prazo final hoje!`;
    } else if (diffDias === 1) {
      classeCor = 'countdown-urgente';
      statusPrazo = 'urgente';
      pulse = true;
      corBarra = '#ea580c';
      label = `VENCE AMANHÃ (1d)`;
      diasTexto = `Falta apenas 1 dia para o prazo final`;
    } else if (diffDias <= 3) {
      classeCor = 'countdown-atencao';
      statusPrazo = 'atencao';
      pulse = false;
      corBarra = '#d97706';
      label = `RESTAM ${diffDias} DIAS`;
      diasTexto = `Faltam ${diffDias} dias para a entrega`;
    } else if (diffDias <= 7) {
      classeCor = 'countdown-normal';
      statusPrazo = 'normal';
      pulse = false;
      corBarra = '#0284c7';
      label = `RESTAM ${diffDias} DIAS`;
      diasTexto = `Faltam ${diffDias} dias para a entrega`;
    } else {
      classeCor = 'countdown-seguro';
      statusPrazo = 'seguro';
      pulse = false;
      corBarra = '#059669';
      label = `RESTAM ${diffDias} DIAS`;
      diasTexto = `Prazo confortável (${diffDias} dias)`;
    }

    const badgeHtml = `
      <span class="badge-countdown ${classeCor} ${pulse ? 'prazo-urgente-pulse' : ''}" 
            title="${diasTexto} (Data limite: ${dataAlvoStr})">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        ${label}
      </span>
    `;

    return {
      diffDias,
      statusPrazo,
      classeCor,
      pulse,
      label,
      diasTexto,
      corBarra,
      percTempo,
      badgeHtml,
      dataAlvoStr
    };
  }

  let filtroDespesas = 'todas';

  // Configuração dos Menus da Sidebar
  function configurarMenuNavegacao() {
    const itensMenu = document.querySelectorAll('.menu-item[data-aba]');
    itensMenu.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const aba = item.getAttribute('data-aba');
        if (aba) {
          navegarPara(aba);
        }
      });
    });
  }

  // Roteador de Abas com Controle de Perfis e Permissões Industriais
  function navegarPara(aba) {
    if (window.ERP_CLOUD && typeof window.ERP_CLOUD.obterPerfilAtivo === 'function') {
      const perfil = window.ERP_CLOUD.obterPerfilAtivo();
      if (perfil && perfil.abasPermitidas && !perfil.abasPermitidas.includes(aba)) {
        mostrarToast(`Acesso restrito: seu perfil (${perfil.nome}) não possui permissão para acessar esta área.`, 'red');
        aba = perfil.abasPermitidas[0] || 'pedidos';
      }
    }

    abaAtiva = aba;
    fecharTodosModais();

    document.querySelectorAll('.menu-item[data-aba]').forEach(item => {
      if (item.getAttribute('data-aba') === aba) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    atualizarBadges();

    switch (aba) {
      case 'abertura':
        renderizarAbertura();
        break;
      case 'pedidos':
        renderizarPedidos();
        break;
      case 'os':
        renderizarOrdensServico();
        break;
      case 'nesting':
        renderizarNestingDTF();
        break;
      case 'estoque':
        renderizarEstoque();
        break;
      case 'produtos':
        renderizarProdutos();
        break;
      case 'financeiro':
        renderizarFinanceiro();
        break;
      case 'compras':
        renderizarCompras();
        break;
      case 'clientes':
        renderizarClientes();
        break;
      case 'quarentena':
        renderizarQuarentena();
        break;
      case 'equipe':
        renderizarEquipe();
        break;
      case 'nfe':
        renderizarNotasFiscais();
        break;
      case 'empresa':
        renderizarConfiguracoesEmpresa();
        break;
      default:
        renderizarAbertura();
    }

    if (typeof window.ERP_ATUALIZAR_BARRA_ROLAGEM === 'function') {
      setTimeout(window.ERP_ATUALIZAR_BARRA_ROLAGEM, 40);
      setTimeout(window.ERP_ATUALIZAR_BARRA_ROLAGEM, 250);
    }
  }

  // Atualiza contadores numéricos na Sidebar
  function atualizarBadges() {
    const badgeQuarentena = document.getElementById('badgeQuarentena');
    if (badgeQuarentena) {
      const qtdQuarentena = db.pedidos.filter(p => p.status === 'Quarentena').length;
      badgeQuarentena.textContent = qtdQuarentena;
      badgeQuarentena.className = qtdQuarentena > 0 ? 'menu-badge badge-red' : 'menu-badge badge-gray';
    }

    const badgePedidos = document.getElementById('badgePedidos');
    if (badgePedidos) {
      const qtdProducao = db.pedidos.filter(p => p.status === 'Em Producao').length;
      badgePedidos.textContent = qtdProducao;
    }
  }

  /* ==========================================================================
     GERENCIADOR UNIVERSAL DE MODAIS EM PILHA (MODAL STACK ARCHITECTURE)
     - Suporta múltiplos modais aninhados/sobrepostos sem fechar ou destruir os pais.
     - Fechamento inteligente: 'X', 'Cancelar', backdrop ou ESC fecham APENAS o modal ativo no topo.
     - Preserva 100% dos dados preenchidos nos formulários anteriores (ex: rascunho de pedido).
     ========================================================================== */
  const modalPilha = [];

  function criarModalCamada(htmlConteudo, options = {}) {
    if (!modalContainer) return null;

    if (options.fecharAnteriores) {
      fecharTodosModais();
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlConteudo.trim();
    const modalEl = tempDiv.firstElementChild;
    if (!modalEl) return null;

    // Nível de profundidade atual na pilha
    const nivel = modalPilha.length;
    const baseZ = 10000 + (nivel * 40);
    modalEl.style.zIndex = baseZ;

    // Se for camada filha (sub-modal sobreposto a outro modal), destaca com backdrop escurecido
    if (nivel > 0) {
      modalEl.classList.add('modal-camada-filha');
    }

    // Registra na pilha e adiciona ao container no DOM
    modalPilha.push(modalEl);
    modalContainer.appendChild(modalEl);

    // 1. Fechar este modal específico ao clicar no backdrop (fora da caixa de diálogo)
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) {
        fecharModal(modalEl);
      }
    });

    // 2. Mapeia e vincula todos os botões de fechar e cancelar internos deste modal
    modalEl.querySelectorAll('.modal-close, .modal-close-btn, button[onclick*="fecharModal"]').forEach(btn => {
      btn.removeAttribute('onclick');
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        fecharModal(modalEl);
      });
    });

    return modalEl;
  }

  function fecharModal(elementoEspecifico = null) {
    let el = null;

    if (elementoEspecifico && elementoEspecifico instanceof HTMLElement) {
      el = elementoEspecifico;
      const idx = modalPilha.indexOf(el);
      if (idx !== -1) {
        modalPilha.splice(idx, 1);
      }
    } else if (modalPilha.length > 0) {
      el = modalPilha.pop();
    } else {
      const overlays = document.querySelectorAll('.modal-overlay');
      if (overlays.length > 0) {
        el = overlays[overlays.length - 1];
      }
    }

    if (el) {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }

    if (modalPilha.length === 0 && modalContainer) {
      modalContainer.innerHTML = '';
    }
  }

  function fecharTodosModais() {
    modalPilha.length = 0;
    if (modalContainer) modalContainer.innerHTML = '';
    document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
  }

  function configurarFechamentoModaisGlobal() {
    // 1. Fechar o modal do topo ao pressionar ESC
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (modalPilha.length > 0 || document.querySelector('.modal-overlay')) {
          fecharModal(); // Fecha apenas a camada do topo!
        }
      }
    });
  }

  /* ==========================================================================
     MÓDULO 1: ABERTURA / DASHBOARD INDUSTRIAL
     ========================================================================== */
  function renderizarAbertura() {
    pageTitleElem.textContent = 'Abertura & Visão Geral da Fábrica';
    pageBreadcrumbElem.textContent = 'SISTEMA > ABERTURA';

    const pedidosValidos = db.pedidos.filter(p => p.status !== 'Cancelado' && p.tipoRegistro !== 'Orcamento');
    const faturamentoMes = pedidosValidos.reduce((acc, p) => acc + p.valorTotalVenda, 0);
    const pedidosEmProducao = db.pedidos.filter(p => p.status === 'Em Producao');
    const totalPecasProducao = pedidosEmProducao.reduce((acc, p) => acc + (p.grade?.total || 0), 0);
    const pedidosQuarentena = db.pedidos.filter(p => p.status === 'Quarentena');
    const saldoReceberPendente = pedidosValidos.reduce((acc, p) => acc + (p.saldoPendente || 0), 0);

    const margensValidas = db.pedidos.filter(p => p.margemLucroPercentual > 0);
    const margemMediaPercentual = (
      margensValidas.reduce((acc, p) => acc + p.margemLucroPercentual, 0) / (margensValidas.length || 1)
    ).toFixed(1);

    // 1. Cálculo Dinâmico de Performance Financeira (Entradas e Saídas Reais)
    const entradasReaisLivroCaixa = (db.lancamentosFinanceiros || [])
      .filter(l => (l.tipo === 'Receita' || l.tipo === 'Entrada') && l.status !== 'Cancelado')
      .reduce((acc, l) => acc + (Number(l.valor) || 0), 0);
    const saidasReaisLivroCaixa = (db.lancamentosFinanceiros || [])
      .filter(l => (l.tipo === 'Despesa' || l.tipo === 'Saida') && l.status !== 'Cancelado')
      .reduce((acc, l) => acc + (Number(l.valor) || 0), 0);

    const historicoMensal = (db.historicoFinanceiroMensal || []).map(h => {
      if (h.isAtual && (h.sincronizarComCaixa || entradasReaisLivroCaixa > 0 || saidasReaisLivroCaixa > 0)) {
        return {
          ...h,
          entradas: entradasReaisLivroCaixa > 0 ? entradasReaisLivroCaixa : h.entradas,
          saidas: saidasReaisLivroCaixa > 0 ? saidasReaisLivroCaixa : h.saidas
        };
      }
      return h;
    });

    const maxValorFinanceiro = Math.max(
      ...historicoMensal.flatMap(h => [Number(h.entradas) || 0, Number(h.saidas) || 0]),
      1000
    );

    // 2. Cálculo Dinâmico de Capacidade de Produção por Setor
    const ordensAtivas = (db.ordensServico || []).filter(os => os.status !== 'Entregue' && os.status !== 'Cancelado');
    const pecasCorteAtivas = ordensAtivas
      .filter(os => (os.etapaAtual || '').toLowerCase().includes('corte') || (os.status || '').toLowerCase().includes('corte'))
      .reduce((acc, os) => acc + (os.grade?.total || 0), 0);
    const pecasBordadoAtivas = ordensAtivas
      .filter(os => (os.personalizacao || '').toLowerCase().includes('bordado'))
      .reduce((acc, os) => acc + (os.grade?.total || 0), 0);
    const metrosDtfAtivos = (db.nestingFila || [])
      .reduce((acc, item) => acc + (Number(item.comprimentoLinearMetros) || 1), 0);
    const pecasCosturaAtivas = ordensAtivas
      .filter(os => (os.etapaAtual || '').toLowerCase().includes('costura'))
      .reduce((acc, os) => acc + (os.grade?.total || 0), 0);

    const capacidadesProcessadas = (db.capacidadesProducao || []).map(setor => {
      let producaoReal = Number(setor.atualProduzido) || 0;
      if (setor.modoCalculo === 'auto') {
        const idLow = (setor.id || '').toLowerCase();
        const nomeLow = (setor.nome || '').toLowerCase();
        if (idLow.includes('corte') || nomeLow.includes('corte')) {
          if (pecasCorteAtivas > 0) producaoReal = pecasCorteAtivas;
        } else if (idLow.includes('bordado') || nomeLow.includes('bordado')) {
          if (pecasBordadoAtivas > 0) producaoReal = pecasBordadoAtivas;
        } else if (idLow.includes('dtf') || nomeLow.includes('dtf')) {
          if (metrosDtfAtivos > 0) producaoReal = Math.round(metrosDtfAtivos);
        } else if (idLow.includes('costura') || nomeLow.includes('costura')) {
          if (pecasCosturaAtivas > 0) producaoReal = pecasCosturaAtivas;
        }
      }
      const capDiaria = Number(setor.capacidadeDiaria) || 1;
      const perc = Math.min(Math.round((producaoReal / capDiaria) * 100), 100);
      return {
        ...setor,
        producaoReal,
        perc
      };
    });

    const mediaOcupacao = capacidadesProcessadas.length > 0
      ? Math.round(capacidadesProcessadas.reduce((acc, s) => acc + s.perc, 0) / capacidadesProcessadas.length)
      : 0;

    let badgeCapacidadeHtml = '';
    if (mediaOcupacao === 0) {
      badgeCapacidadeHtml = `<span class="status-pill status-gray">Capacidade Livre (0% Ocupação)</span>`;
    } else if (mediaOcupacao <= 75) {
      badgeCapacidadeHtml = `<span class="status-pill status-green">Oficina em Ritmo Normal (${mediaOcupacao}%)</span>`;
    } else if (mediaOcupacao <= 90) {
      badgeCapacidadeHtml = `<span class="status-pill" style="color: #b45309; background: #fef3c7; border: 1px solid #fde68a;">Carga Moderada/Alta (${mediaOcupacao}%)</span>`;
    } else {
      badgeCapacidadeHtml = `<span class="status-pill status-red">Atenção: Sobrecarga (${mediaOcupacao}%)</span>`;
    }

    // 3. Cálculo Dinâmico do Radar & Termômetro de Prazos da Fábrica (Apenas Pedidos Confirmados)
    const pedidosAtivosPrazos = db.pedidos.filter(p => 
      p.status !== 'Finalizado' && 
      p.status !== 'Cancelado' && 
      p.status !== 'Entregue' && 
      !isPedidoOrcamento(p)
    );
    let qtdAtrasados = 0;
    let qtdHoje = 0;
    let qtdAmanha = 0;
    let qtdCriticos = 0;
    let qtdNoPrazo = 0;
    let qtdSeguros = 0;

    pedidosAtivosPrazos.forEach(p => {
      const cd = calcularContagemRegressivaPedido(p);
      if (cd.statusPrazo === 'atrasado') qtdAtrasados++;
      else if (cd.statusPrazo === 'hoje') qtdHoje++;
      else if (cd.statusPrazo === 'urgente') qtdAmanha++;
      else if (cd.statusPrazo === 'atencao') qtdCriticos++;
      else if (cd.statusPrazo === 'normal') qtdNoPrazo++;
      else if (cd.statusPrazo === 'seguro') qtdSeguros++;
    });

    contentArea.innerHTML = `
      <div class="grid-cards-4">
        <div class="card">
          <div class="kpi-title">
            <span>Faturamento em Carteira</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div class="kpi-value text-primary">${formatarMoeda(faturamentoMes)}</div>
          <div class="kpi-desc">
            <span class="${faturamentoMes > 0 ? 'text-green' : 'text-gray-500'}">${pedidosValidos.length > 0 ? '+14.2% vs. mês anterior' : 'Pronto para novas campanhas'}</span>
          </div>
        </div>

        <div class="card">
          <div class="kpi-title">
            <span>Carga da Fábrica (Peças)</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
          </div>
          <div class="kpi-value text-primary">${formatarNumero(totalPecasProducao)} un</div>
          <div class="kpi-desc">
            <span class="text-gray-500">${pedidosEmProducao.length > 0 ? `${pedidosEmProducao.length} ordens ativas na oficina` : 'Oficina liberada para produção'}</span>
          </div>
        </div>

        <div class="card">
          <div class="kpi-title">
            <span>Quarentena (Aprovação)</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <div class="kpi-value ${pedidosQuarentena.length > 0 ? 'text-red' : 'text-primary'}">${pedidosQuarentena.length} pedidos</div>
          <div class="kpi-desc">
            <span class="${pedidosQuarentena.length > 0 ? 'text-red' : 'text-gray-500'}">${pedidosQuarentena.length > 0 ? 'Aguardando checklist rigoroso' : 'Nenhuma pendência técnica'}</span>
          </div>
        </div>

        <div class="card">
          <div class="kpi-title">
            <span>Margem Média Bruta</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
          </div>
          <div class="kpi-value ${margensValidas.length > 0 ? 'text-green' : 'text-primary'}">${margensValidas.length > 0 ? margemMediaPercentual + '%' : '0.0%'}</div>
          <div class="kpi-desc">
            <span class="${margensValidas.length > 0 ? 'text-green' : 'text-gray-500'}">${margensValidas.length > 0 ? 'Acima da média industrial têxtil' : 'Calculada sobre novos pedidos'}</span>
          </div>
        </div>
      </div>

      <!-- Radar & Termômetro de Prazos dos Pedidos -->
      <div class="radar-prazos-container">
        <span class="radar-prazos-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          Radar de Prazos:
        </span>

        <span class="radar-chip countdown-atrasado ${qtdAtrasados > 0 ? 'prazo-urgente-pulse' : ''}" onclick="window.ERP.navegarPara('pedidos')" title="Pedidos com prazo estourado">
          ⚠️ Atrasados: <strong class="radar-chip-count">${qtdAtrasados}</strong>
        </span>

        <span class="radar-chip countdown-hoje ${qtdHoje > 0 ? 'prazo-urgente-pulse' : ''}" onclick="window.ERP.navegarPara('pedidos')" title="Pedidos que vencem hoje">
          🔥 Vencem Hoje: <strong class="radar-chip-count">${qtdHoje}</strong>
        </span>

        <span class="radar-chip countdown-urgente ${qtdAmanha > 0 ? 'prazo-urgente-pulse' : ''}" onclick="window.ERP.navegarPara('pedidos')" title="Pedidos que vencem amanhã">
          ⚡ Vencem Amanhã: <strong class="radar-chip-count">${qtdAmanha}</strong>
        </span>

        <span class="radar-chip countdown-atencao" onclick="window.ERP.navegarPara('pedidos')" title="Pedidos com prazo de 2 a 3 dias">
          ⏳ Atenção (2-3d): <strong class="radar-chip-count">${qtdCriticos}</strong>
        </span>

        <span class="radar-chip countdown-normal" onclick="window.ERP.navegarPara('pedidos')" title="Pedidos com prazo de 4 a 7 dias">
          ⏱️ No Prazo (4-7d): <strong class="radar-chip-count">${qtdNoPrazo}</strong>
        </span>

        <span class="radar-chip countdown-seguro" onclick="window.ERP.navegarPara('pedidos')" title="Pedidos com prazo acima de 7 dias">
          🟢 Confortável (>7d): <strong class="radar-chip-count">${qtdSeguros}</strong>
        </span>
      </div>

      <div class="grid-cards-2">

        <!-- 1. Performance Financeira Semestral (Entradas e Saídas Reais) -->
        <div class="card">
          <div class="table-header-bar" style="padding: 0 0 10px 0; align-items: flex-start;">
            <div>
              <div class="table-title">Performance Financeira Semestral (R$)</div>
              <div style="display: flex; gap: 12px; font-size: 11px; margin-top: 5px; font-weight: 600;">
                <span style="display: inline-flex; align-items: center; gap: 4px; color: #047857;">
                  <span style="width: 8px; height: 8px; background: #047857; border-radius: 2px;"></span> Entradas
                </span>
                <span style="display: inline-flex; align-items: center; gap: 4px; color: #dc2626;">
                  <span style="width: 8px; height: 8px; background: #dc2626; border-radius: 2px;"></span> Saídas
                </span>
                <span style="display: inline-flex; align-items: center; gap: 4px; color: var(--text-primary);">
                  <span style="width: 8px; height: 8px; background: #94a3b8; border-radius: 2px;"></span> Saldo Líquido
                </span>
              </div>
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
              <span class="status-pill status-gray">Valores em Milhares</span>
              <button class="btn btn-secondary btn-sm" onclick="window.ERP.abrirModalEditarFinanceiro()" title="Editar faturamento e despesas de cada mês">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Editar Gráfico
              </button>
            </div>
          </div>

          <div class="chart-container">
            ${historicoMensal.map(h => {
              const altIn = maxValorFinanceiro > 0 ? Math.max(Math.round((h.entradas / maxValorFinanceiro) * 100), h.entradas > 0 ? 3 : 0) : 0;
              const altOut = maxValorFinanceiro > 0 ? Math.max(Math.round((h.saidas / maxValorFinanceiro) * 100), h.saidas > 0 ? 3 : 0) : 0;
              const saldo = (Number(h.entradas) || 0) - (Number(h.saidas) || 0);
              const kIn = formatarK(h.entradas);
              const kOut = formatarK(h.saidas);
              const kSaldo = formatarK(saldo);
              const isAtual = h.isAtual;
              const isPrev = h.isPrevisto;
              return `
                <div class="bar-col">
                  <div class="bar-dual-vals">
                    <span class="bar-sub-val" style="color: #047857;" title="Entradas: ${formatarMoeda(h.entradas)}">${kIn}</span>
                    <span class="bar-sub-val" style="color: #dc2626;" title="Saídas: ${formatarMoeda(h.saidas)}">${kOut}</span>
                  </div>
                  <div class="bar-paired-group">
                    <div class="bar-fill-paired ${isPrev ? 'bar-prev' : 'bar-in'}" style="height: ${altIn}%;" title="${h.mesCompleto} • Entrada: ${formatarMoeda(h.entradas)}"></div>
                    <div class="bar-fill-paired ${isPrev ? 'bar-prev-out' : 'bar-out'}" style="height: ${altOut}%;" title="${h.mesCompleto} • Saída: ${formatarMoeda(h.saidas)}"></div>
                  </div>
                  <span class="bar-label ${isAtual ? 'text-green' : ''}">${h.mes}${isAtual ? ' (ATUAL)' : (isPrev ? ' (PREV)' : '')}</span>
                  <span class="saldo-badge-col ${saldo >= 0 ? 'text-green' : 'text-red'}" title="Saldo Líquido">${saldo >= 0 ? '+' : ''}${kSaldo}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 2. Capacidade de Produção por Setor (Editável & Monitorado) -->
        <div class="card">
          <div class="table-header-bar" style="padding: 0 0 12px 0;">
            <div>
              <div class="table-title">Capacidade de Produção por Setor</div>
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
              ${badgeCapacidadeHtml}
              <button class="btn btn-secondary btn-sm" onclick="window.ERP.abrirModalEditarCapacidades()" title="Configurar capacidade diária de cada setor">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                Editar Capacidades
              </button>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 10px;">
            ${capacidadesProcessadas.map(s => {
              let corBarra = '#0f172a';
              if (s.perc > 90) corBarra = '#dc2626';
              else if (s.perc >= 75) corBarra = 'var(--color-green)';
              return `
                <div class="capacity-item">
                  <div class="capacity-header">
                    <span><strong>${s.nome}</strong> (Capacidade: ${s.capacidadeDiaria} ${s.unidade})</span>
                    <span class="text-mono"><strong>${s.producaoReal}</strong> ${s.unidade.replace('/dia', '')} (${s.perc}%)</span>
                  </div>
                  <div class="capacity-bar-track">
                    <div class="capacity-bar-fill" style="width: ${s.perc}%; background: ${corBarra};"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <div class="table-wrapper">
        <div class="table-header-bar">
          <div class="table-title">Últimos Pedidos & Mockups Têxteis 3x4</div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="const w=this.closest('.table-wrapper');w.scrollTo({left:0,behavior:'smooth'})" title="Rolar para o Início da Tabela" style="padding: 3px 8px; font-size: 11px; font-weight: 700;">◀ Início</button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="const w=this.closest('.table-wrapper');w.scrollTo({left:w.scrollWidth,behavior:'smooth'})" title="Rolar para Ações e Status" style="padding: 3px 8px; font-size: 11px; font-weight: 700;">Ações & Status ▶</button>
            <button class="btn btn-secondary btn-sm" id="btnIrParaPedidos">Ir para Todos os Pedidos</button>
          </div>
        </div>
        <table class="erp-table">
          <thead>
            <tr>
              <th>Mockup 3x4</th>
              <th>Nº Pedido</th>
              <th>Cliente</th>
              <th>Produto Têxtil</th>
              <th>Grade</th>
              <th>Prazo & Contagem</th>
              <th>Valor Total</th>
              <th>Sinal (50%)</th>
              <th>Status</th>
              <th>Etapa Oficina</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${db.pedidos.length ? db.pedidos.slice(0, 5).map(p => {
              const mockup = p.mockupUrl || window.ERP_MOCKUPS.gerarMockupSvg(p.produtoNome, "#1e3a8a", "#ffffff", p.clienteNome.substring(0, 6));
              const totalV = Number(p.valorTotalVenda) || 0;
              const pagoV = Number(p.valorSinalPago) || 0;
              const saldoV = Math.max(0, totalV - pagoV);
              const quitV = totalV > 0 && saldoV <= 0;
              const percV = totalV > 0 ? ((pagoV / totalV) * 100).toFixed(0) : 0;
              const countdown = calcularContagemRegressivaPedido(p);
              return `
                <tr>
                  <td>
                    <img src="${mockup}" class="mockup-thumb-3x4" data-pedido-id="${p.id}" alt="Mockup 3x4" title="Clique para abrir o mockup 3x4 na tela">
                  </td>
                  <td class="text-mono"><strong>#${p.numero}</strong></td>
                  <td><strong>${p.clienteNome}</strong></td>
                  <td>${p.produtoNome}</td>
                  <td class="text-mono">${p.grade?.total || 0} un</td>
                  <td>
                    ${countdown.badgeHtml}
                    ${isPedidoOrcamento(p) ? `
                      <span style="display: block; font-size: 9.5px; color: #64748b; margin-top: 3px; font-weight: 600;">
                        ⏱️ ${p.prazoPedidoDias || 15}d após aprovação
                      </span>
                    ` : (p.dataPrevisaoEntrega || p.dataMetaInterna) ? `
                      <span style="display: block; font-size: 9.5px; color: #1e40af; margin-top: 3px; font-weight: 700;">
                        📅 ${p.dataPrevisaoEntrega || p.dataMetaInterna}
                      </span>
                    ` : ''}
                  </td>
                  <td class="text-mono"><strong>${formatarMoeda(p.valorTotalVenda)}</strong></td>
                  <td>
                    ${quitV ? `
                      <span class="status-pill status-green">100% QUITADO</span>
                    ` : pagoV > 0 ? `
                      <span class="status-pill status-yellow" title="Saldo remanescente devedor: ${formatarMoeda(saldoV)}">
                        PARCIAL (${percV}%)
                      </span>
                    ` : `
                      <span class="status-pill status-red">PENDENTE</span>
                    `}
                  </td>
                  <td>
                    <span class="status-pill ${p.status === 'Quarentena' ? 'status-red' : p.status === 'Em Producao' ? 'status-green' : 'status-gray'}">
                      ${p.status === 'Quarentena' ? '🔒 QUARENTENA' : p.status.toUpperCase()}
                    </span>
                  </td>
                  <td class="text-mono">${p.etapaProducao}</td>
                  <td>
                    <button class="btn btn-secondary btn-sm" onclick="window.ERP.abrirModalWhatsApp('${p.id}')">
                      WhatsApp
                    </button>
                  </td>
                </tr>
              `;
            }).join('') : `
              <tr>
                <td colspan="11" style="text-align: center; padding: 40px 20px; color: var(--text-gray-500);">
                  <div style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
                    Nenhum pedido em carteira no momento
                  </div>
                  <div style="font-size: 12px; margin-bottom: 14px; color: var(--text-gray-500);">
                    O sistema está limpo e preparado para receber os pedidos reais da sua campanha.
                  </div>
                  <button class="btn btn-primary btn-sm" onclick="window.ERP.abrirModalNovoOrcamento()">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Cadastrar Primeiro Pedido / Orçamento
                  </button>
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('btnIrParaPedidos')?.addEventListener('click', () => navegarPara('pedidos'));
  }

  /* ==========================================================================
     MÓDULO 2: PEDIDOS & ORÇAMENTOS (DUPLO FLUXO + BENCHMARK BRASIL + KANBAN)
     ========================================================================== */
  function renderizarPedidos() {
    pageTitleElem.textContent = 'Gestão Comercial, Orçamentos & Pedidos';
    pageBreadcrumbElem.textContent = 'SISTEMA > PEDIDOS & ORÇAMENTOS';

    contentArea.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; gap: 10px; align-items: center;">
          <input type="text" id="filtroPedidoBusca" class="form-input" style="width: 260px;" placeholder="Buscar cliente, número ou modelo...">
          <select id="filtroPedidoStatus" class="form-select" style="width: 170px;">
            <option value="TODOS">Todos os Status</option>
            <option value="Em Producao">Em Produção</option>
            <option value="Quarentena">Em Quarentena</option>
            <option value="Orcamento">Apenas Orçamento</option>
            <option value="Finalizado">Finalizados</option>
          </select>
        </div>

        <div style="display: flex; gap: 10px; align-items: center;">
          <div class="view-switch-group">
            <button class="view-switch-btn ${visualizacaoPedidos === 'tabela' ? 'active' : ''}" id="btnViewTabela">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              Tabela Detalhada
            </button>
            <button class="view-switch-btn ${visualizacaoPedidos === 'kanban' ? 'active' : ''}" id="btnViewKanban">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="18"></rect><rect x="14" y="3" width="7" height="11"></rect></svg>
              Kanban de Pedidos
            </button>
          </div>

          <button class="btn btn-primary" id="btnAbrirNovoOrcamento">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Novo Orçamento / Pedido Oficial
          </button>
        </div>
      </div>

      <div id="pedidosContainerVisualizacao">
        ${visualizacaoPedidos === 'tabela' ? renderizarTabelaPedidosHtml(db.pedidos) : renderizarKanbanPedidosHtml(db.pedidos)}
      </div>
    `;

    // Eventos
    document.getElementById('btnViewTabela')?.addEventListener('click', () => {
      visualizacaoPedidos = 'tabela';
      renderizarPedidos();
    });

    document.getElementById('btnViewKanban')?.addEventListener('click', () => {
      visualizacaoPedidos = 'kanban';
      renderizarPedidos();
    });

    document.getElementById('btnAbrirNovoOrcamento')?.addEventListener('click', abrirModalNovoOrcamento);

    const buscaInput = document.getElementById('filtroPedidoBusca');
    const statusSelect = document.getElementById('filtroPedidoStatus');

    function aplicarFiltros() {
      const termo = (buscaInput?.value || '').toLowerCase();
      const st = statusSelect?.value || 'TODOS';
      const filtrados = db.pedidos.filter(p => {
        const matchesTermo = p.clienteNome.toLowerCase().includes(termo) ||
                             p.produtoNome.toLowerCase().includes(termo) ||
                             p.numero.toString().includes(termo);
        const matchesStatus = (st === 'TODOS') || (p.status === st);
        return matchesTermo && matchesStatus;
      });

      const container = document.getElementById('pedidosContainerVisualizacao');
      if (container) {
        container.innerHTML = visualizacaoPedidos === 'tabela' 
          ? renderizarTabelaPedidosHtml(filtrados) 
          : renderizarKanbanPedidosHtml(filtrados);
        configurarEventosPedidos();
      }
    }

    buscaInput?.addEventListener('input', aplicarFiltros);
    statusSelect?.addEventListener('change', aplicarFiltros);

    configurarEventosPedidos();
  }

  function renderizarTabelaPedidosHtml(pedidos) {
    if (!pedidos.length) {
      return `
        <div class="card" style="text-align: center; padding: 50px 20px; color: var(--text-gray-500);">
          <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">
            Nenhum pedido ou orçamento registrado no sistema
          </div>
          <p style="font-size: 12.5px; max-width: 520px; margin: 0 auto 16px auto; color: var(--text-gray-600); line-height: 1.6;">
            O sistema está limpo e 100% pronto para a operação real. Inicie uma nova negociação gerando uma proposta comercial personalizada ou registrando uma ordem oficial com sinal.
          </p>
          <button class="btn btn-primary" onclick="window.ERP.abrirModalNovoOrcamento()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Criar Primeiro Orçamento / Pedido Oficial
          </button>
        </div>
      `;
    }

    return `
      <div class="table-wrapper">
        <div class="table-header-bar">
          <div class="table-title">Ordens de Pedidos Oficiais & Orçamentos Ativos (${pedidos.length})</div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="const w=this.closest('.table-wrapper');w.scrollTo({left:0,behavior:'smooth'})" title="Rolar para o Início da Tabela" style="padding: 3px 8px; font-size: 11px; font-weight: 700;">◀ Início</button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="const w=this.closest('.table-wrapper');w.scrollTo({left:w.scrollWidth,behavior:'smooth'})" title="Rolar para Ações, Status e Totais" style="padding: 3px 8px; font-size: 11px; font-weight: 700;">Ações & Totais ▶</button>
            <span class="table-scroll-hint" title="Use a barra fixa no rodapé da tela para navegar pelas colunas sem descer a página">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline><polyline points="19 18 13 12 19 6"></polyline></svg>
              Barra Fixa Ativa
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline><polyline points="5 18 11 12 5 6"></polyline></svg>
            </span>
          </div>
        </div>
        <table class="erp-table">
          <thead>
            <tr>
              <th>Mockup 3x4</th>
              <th>Nº / Data</th>
              <th>Cliente / Contato</th>
              <th>Modelo Têxtil</th>
              <th>Grade (Tamanhos)</th>
              <th>Preço Unit.</th>
              <th>Total Pedido</th>
              <th>Margem Real</th>
              <th>Sinal & Quitação</th>
              <th>Etapa & Status (Trocar)</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${pedidos.map(p => {
              const mockup = p.mockupUrl || window.ERP_MOCKUPS.gerarMockupSvg(p.produtoNome, "#1e3a8a", "#ffffff", p.clienteNome.substring(0, 6));
              const totalVenda = Number(p.valorTotalVenda) || 0;
              const jaPago = Number(p.valorSinalPago) || 0;
              const saldoDevedor = Math.max(0, totalVenda - jaPago);
              const quitadoTotal = totalVenda > 0 && saldoDevedor <= 0;
              const parcialPago = jaPago > 0 && saldoDevedor > 0;
              const percPago = totalVenda > 0 ? ((jaPago / totalVenda) * 100).toFixed(0) : 0;
              const isQuarentena = p.status === 'Quarentena';
              const isOrcamento = p.tipoRegistro === 'Orcamento' || p.status === 'Orcamento';
              const countdown = calcularContagemRegressivaPedido(p);
              return `
                <tr>
                  <td>
                    <img src="${mockup}" class="mockup-thumb-3x4" data-pedido-id="${p.id}" alt="Mockup 3x4" title="Clique para abrir o mockup 3x4 na tela">
                  </td>
                  <td>
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                      <span class="text-mono" style="font-weight: 800; font-size: 13px;">#${p.numero}</span>
                      <span class="status-pill ${isOrcamento ? 'status-gray' : isQuarentena ? 'status-red' : 'status-green'}" 
                            style="font-size: 8.5px; padding: 1.5px 5px; ${isOrcamento ? 'background: #e0f2fe; color: #0369a1; border-color: #bae6fd; font-weight: 800;' : ''}">
                        ${isOrcamento ? 'ORÇAMENTO' : isQuarentena ? 'QUARENTENA' : 'PEDIDO'}
                      </span>
                    </div>
                    <span style="display: block; font-size: 10px; color: var(--text-gray-500); margin-top: 2px;">Criado: ${p.dataCriacao || '-'}</span>

                    <!-- CONTAGEM REGRESSIVA DINÂMICA COM CORES DE URGÊNCIA (APENAS PEDIDOS CONFIRMADOS) -->
                    <div style="margin-top: 6px;">
                      ${countdown.badgeHtml}
                      ${!isOrcamento ? `
                        <div class="countdown-bar-track" title="Tempo decorrido: ${countdown.percTempo}%">
                          <div class="countdown-bar-fill" style="width: ${countdown.percTempo}%; background-color: ${countdown.corBarra};"></div>
                        </div>
                      ` : ''}
                    </div>

                    ${isOrcamento ? `
                      <div style="font-size: 9.5px; margin-top: 4px; color: #64748b; line-height: 1.3;">
                        <span title="Prazo prometido que passará a contar após confirmação e sinal">⏱️ ${p.prazoPedidoDias || 15} dias úteis (após aprovação)</span>
                      </div>
                    ` : (p.dataPrevisaoEntrega || p.dataMetaInterna) ? `
                      <div style="font-size: 9.5px; margin-top: 5px; line-height: 1.3;">
                        <span style="color: #1e40af; font-weight: 700;" title="Prazo Prometido ao Cliente">📅 Cli: ${p.dataPrevisaoEntrega || '-'}</span>
                        ${p.dataMetaInterna ? `<br><span style="color: #0369a1; font-weight: 700;" title="Meta Interna Chão de Fábrica">🏭 Fáb: ${p.dataMetaInterna}</span>` : ''}
                      </div>
                    ` : ''}
                  </td>
                  <td>
                    <strong style="color: var(--text-primary); font-size: 13px;">${p.clienteNome}</strong>
                    <span style="display: block; font-size: 11px; color: var(--text-gray-500);">${formatarTelefone(p.clienteTelefone)}</span>
                    <span style="font-size: 10.5px; color: var(--text-gray-600);">Costureira: <strong>${p.costureiraNome || 'Não atribuída'}</strong></span>
                  </td>
                  <td>
                    <strong>${p.produtoNome}</strong>
                    ${p.corTecido ? `
                      <div style="margin-top: 3px; display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
                        <span class="status-pill status-gray" style="font-size: 9.5px; padding: 1px 6px; font-weight: 700; color: #1e3a8a; background: #eff6ff; border: 1px solid #bfdbfe;">
                          🎨 Cor: ${p.corTecido}
                        </span>
                      </div>
                    ` : ''}
                    ${p.observacoesCoresDetalhes ? `
                      <span class="badge-obs-textil" title="${p.observacoesCoresDetalhes}">
                        <strong>Detalhes:</strong> ${p.observacoesCoresDetalhes}
                      </span>
                    ` : ''}
                    <span style="display: block; font-size: 11px; color: var(--text-gray-500); margin-top: 2px;">${p.tipoPersonalizacao || 'Estampa Conforme Arte'}</span>
                  </td>
                  <td class="text-mono">
                    <span style="font-size: 11px;">P:${p.grade?.p || 0} M:${p.grade?.m || 0} G:${p.grade?.g || 0} GG:${p.grade?.gg || 0}</span>
                    <strong style="display: block; color: var(--text-primary);">${p.grade?.total || 0} peças</strong>
                  </td>
                  <td class="text-mono">${formatarMoeda(p.precoUnitarioVenda)}</td>
                  <td class="text-mono">
                    <strong style="font-size: 13.5px; color: var(--text-primary);">${formatarMoeda(p.valorTotalVenda)}</strong>
                  </td>
                  <td>
                    <span class="text-mono ${p.margemLucroPercentual >= 25 ? 'text-green' : 'text-red'}">
                      <strong>${(p.margemLucroPercentual || 0).toFixed(1)}%</strong>
                    </span>
                  </td>
                  <td>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                      ${isOrcamento ? `
                        <span class="status-pill status-gray" style="font-size: 9.5px; font-weight: 800; color: #475569; background: #f1f5f9; border: 1px solid #cbd5e1;" title="Orçamento em negociação comercial. Para registrar entrada financeira, use o botão 'Entrada'.">
                          📋 AGUARDANDO ENTRADA
                        </span>
                        <span class="text-mono" style="font-size: 10px; color: var(--text-gray-500);">
                          Proposta: ${formatarMoeda(totalVenda)}
                        </span>
                      ` : quitadoTotal ? `
                        <button class="status-pill status-green btn-gerenciar-pagamento" 
                                data-id="${p.id}" 
                                title="Clique para gerenciar ou ver histórico de quitação">
                          ✓ 100% QUITADO
                        </button>
                        <span class="text-mono" style="font-size: 10px; color: var(--color-green); font-weight: 700;">
                          Total: ${formatarMoeda(jaPago)}
                        </span>
                      ` : parcialPago ? `
                        <button class="status-pill status-yellow btn-gerenciar-pagamento" 
                                data-id="${p.id}" 
                                title="Clique para registrar recebimento de saldo devedor">
                          ⚠️ PARCIAL (${percPago}%)
                        </button>
                        <div style="font-size: 10px; line-height: 1.25;">
                          <span class="text-mono" style="color: var(--color-green); display: block;">Pago: ${formatarMoeda(jaPago)}</span>
                          <span class="text-mono" style="color: var(--color-red); font-weight: 800; display: block;" title="Faltou dinheiro para quitação">Falta: ${formatarMoeda(saldoDevedor)}</span>
                        </div>
                      ` : `
                        <button class="status-pill status-red btn-gerenciar-pagamento" 
                                data-id="${p.id}" 
                                title="Clique para registrar recebimento de entrada">
                          ✕ PENDENTE (Receber)
                        </button>
                        <span class="text-mono" style="font-size: 10px; color: var(--color-red); font-weight: 800;">
                          Falta: ${formatarMoeda(totalVenda)}
                        </span>
                      `}
                    </div>
                  </td>
                  <td>
                    ${isOrcamento ? `
                      <div style="display: flex; flex-direction: column; gap: 3px;">
                        <span class="status-pill" style="background: #f8fafc; border: 1px solid #e2e8f0; color: #64748b; font-size: 10px; font-weight: 700;">
                          💬 Em Proposta / Orçamento
                        </span>
                        <span style="font-size: 9.5px; color: var(--text-gray-400);">Requer botão "Entrada"</span>
                      </div>
                    ` : isQuarentena ? `
                      <div style="display: flex; flex-direction: column; gap: 4px;">
                        <button class="status-pill status-red btn-abrir-quarentena" data-id="${p.id}" 
                                style="font-size: 10px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 4px;" 
                                title="Pedido retido na Quarentena de Segurança. Clique para aprovar o checklist de 5 pontos e liberar para a oficina">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                          BLOQUEADO (QUARENTENA)
                        </button>
                        <select class="form-select select-trocar-etapa" data-id="${p.id}" disabled 
                                style="font-size: 11px; padding: 4px 6px; font-weight: 700; opacity: 0.75; background-color: var(--bg-red-soft, #fef2f2); border-color: var(--color-red, #dc2626); color: var(--color-red, #dc2626); cursor: not-allowed;" 
                                title="Bloqueado: É obrigatório aprovar na Quarentena antes de mudar para etapas de corte/produção">
                          <option value="Quarentena" selected>🔒 Quarentena (Aprovação Obrigatória)</option>
                        </select>
                      </div>
                    ` : `
                      <!-- Seletor de Etapa liberado após passar pela quarentena -->
                      <select class="form-select select-trocar-etapa" data-id="${p.id}" style="font-size: 11.5px; padding: 4px 6px; font-weight: 700; background-color: var(--bg-green-soft); border-color: var(--border-green); color: var(--color-green);">
                        <option value="Quarentena">🔒 Reenviar p/ Quarentena</option>
                        <option value="Corte" ${p.etapaProducao === 'Corte' ? 'selected' : ''}>Oficina: 1. Mesa de Corte</option>
                        <option value="Estamparia / DTF" ${p.etapaProducao === 'Estamparia / DTF' || p.etapaProducao === 'Bordado' ? 'selected' : ''}>Oficina: 2. Estamparia / DTF</option>
                        <option value="Costura" ${p.etapaProducao === 'Costura' ? 'selected' : ''}>Oficina: 3. Costura & Fechamento</option>
                        <option value="Acabamento" ${p.etapaProducao === 'Acabamento' ? 'selected' : ''}>Oficina: 4. Revisão & Acabamento</option>
                        <option value="Expedicao" ${p.etapaProducao === 'Expedicao' ? 'selected' : ''}>Oficina: 5. Expedição / Pronto</option>
                        <option value="Entregue" ${p.status === 'Finalizado' || p.etapaProducao === 'Entregue' ? 'selected' : ''}>Entregue ao Cliente</option>
                      </select>
                    `}
                  </td>
                  <td>
                    <div style="display: flex; gap: 5px;">
                      <button class="btn btn-secondary btn-sm btn-disparar-wpp" data-id="${p.id}" title="Enviar Notificação pelo WhatsApp">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        WPP
                      </button>
                      ${isOrcamento ? `
                        <button class="btn btn-secondary btn-sm btn-baixar-proposta" data-id="${p.id}" title="Ver Proposta A4">Proposta</button>
                        <button class="btn btn-primary btn-sm btn-converter-pedido" data-id="${p.id}" style="font-weight: 800; background: var(--color-green); border-color: var(--color-green);" title="Oficializar Pedido e Registrar Entrada de Sinal">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                          Entrada
                        </button>
                      ` : `
                        <button class="btn btn-secondary btn-sm btn-ver-os" data-id="${p.id}">OS</button>
                      `}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderizarKanbanPedidosHtml(pedidos) {
    const colunas = [
      { id: "col-orcamento", etapaDestino: "Quarentena", titulo: "1. ORÇAMENTO & QUARENTENA", filtro: p => p.status === 'Orcamento' || p.status === 'Quarentena' },
      { id: "col-corte", etapaDestino: "Corte", titulo: "2. MESA DE CORTE", filtro: p => p.status === 'Em Producao' && (p.etapaProducao === 'Corte' || p.etapaProducao === 'Aguardando Tecido') },
      { id: "col-estampa", etapaDestino: "Estamparia / DTF", titulo: "3. ESTAMPARIA & DTF", filtro: p => p.status === 'Em Producao' && (p.etapaProducao === 'Estamparia / DTF' || p.etapaProducao === 'Bordado') },
      { id: "col-costura", etapaDestino: "Costura", titulo: "4. COSTURA & FECHAMENTO", filtro: p => p.status === 'Em Producao' && p.etapaProducao === 'Costura' },
      { id: "col-expedicao", etapaDestino: "Expedicao", titulo: "5. EXPEDIÇÃO & FINALIZADO", filtro: p => p.etapaProducao === 'Acabamento' || p.etapaProducao === 'Expedicao' || p.status === 'Finalizado' }
    ];

    return `
      <div class="kanban-board">
        ${colunas.map(col => {
          const itens = pedidos.filter(col.filtro);
          return `
            <div class="kanban-col" data-col-id="${col.id}" data-etapa="${col.etapaDestino}">
              <div class="kanban-col-header">
                <span>${col.titulo}</span>
                <span class="kanban-col-count">${itens.length}</span>
              </div>
              <div class="kanban-items">
                ${itens.length ? itens.map(p => {
                  const mockup = p.mockupUrl || window.ERP_MOCKUPS.gerarMockupSvg(p.produtoNome, "#1e3a8a", "#ffffff", p.clienteNome.substring(0, 6));
                  const totalVenda = Number(p.valorTotalVenda) || 0;
                  const jaPago = Number(p.valorSinalPago) || 0;
                  const saldoDevedor = Math.max(0, totalVenda - jaPago);
                  const quitadoTotal = totalVenda > 0 && saldoDevedor <= 0;
                  const parcialPago = jaPago > 0 && saldoDevedor > 0;
                  const percPago = totalVenda > 0 ? ((jaPago / totalVenda) * 100).toFixed(0) : 0;
                  const isQuarentena = p.status === 'Quarentena';
                  const isOrcamento = p.tipoRegistro === 'Orcamento' || p.status === 'Orcamento';
                  const countdown = calcularContagemRegressivaPedido(p);
                  return `
                    <div class="kanban-card" draggable="true" data-id="${p.id}" title="Segure e arraste para mudar a etapa do pedido">
                      <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        <img src="${mockup}" class="mockup-thumb-3x4" data-pedido-id="${p.id}" alt="Mockup 3x4" title="Clique para abrir o mockup 3x4 na tela">
                        <div style="flex: 1; min-width: 0;">
                          <div style="display: flex; justify-content: space-between; align-items: center; gap: 4px;">
                            <span class="text-mono" style="font-weight: 800; font-size: 11px;">#${p.numero}</span>
                            ${isOrcamento ? `
                              <span class="status-pill" style="font-size: 8.5px; padding: 2px 6px; background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; font-weight: 800;">
                                ORÇAMENTO
                              </span>
                            ` : `
                              <button class="status-pill ${quitadoTotal ? 'status-green' : parcialPago ? 'status-yellow' : 'status-red'} btn-gerenciar-pagamento" 
                                      data-id="${p.id}" style="font-size: 9px; cursor: pointer; border: none; padding: 2px 6px;" title="Clique para gerenciar pagamentos">
                                ${quitadoTotal ? 'QUITADO' : parcialPago ? `PARCIAL (${percPago}%)` : 'PENDENTE'}
                              </button>
                            `}
                          </div>
                          <div class="kanban-card-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.clienteNome}</div>
                          <div class="kanban-card-sub">${p.grade?.total || 0}x ${p.produtoNome}</div>

                          <!-- CONTAGEM REGRESSIVA NO CARD KANBAN -->
                          <div style="margin-top: 5px;">
                            ${countdown.badgeHtml}
                            ${!isOrcamento ? `
                              <div class="countdown-bar-track" style="margin-top: 3px;" title="Tempo decorrido: ${countdown.percTempo}%">
                                <div class="countdown-bar-fill" style="width: ${countdown.percTempo}%; background-color: ${countdown.corBarra};"></div>
                              </div>
                            ` : ''}
                          </div>

                          ${isOrcamento ? `
                            <div style="font-size: 9px; color: #64748b; margin-top: 3px;">
                              ⏱️ ${p.prazoPedidoDias || 15}d úteis após aprovação
                            </div>
                          ` : (p.dataPrevisaoEntrega || p.dataMetaInterna) ? `
                            <div style="font-size: 9.5px; color: #1e40af; margin-top: 4px; font-weight: 700; display: flex; justify-content: space-between; line-height: 1.2;">
                              <span>📅 Cli: ${p.dataPrevisaoEntrega || '-'}</span>
                              ${p.dataMetaInterna ? `<span style="color: #0369a1;">🏭 Fáb: ${p.dataMetaInterna}</span>` : ''}
                            </div>
                          ` : ''}
                        </div>
                      </div>

                      ${isOrcamento ? `
                        <div style="font-size: 10px; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 6px; margin-bottom: 8px; display: flex; align-items: center; gap: 4px;">
                          <span>📋</span>
                          <span><strong>Apenas Orçamento</strong> • Requer Entrada</span>
                        </div>
                      ` : isQuarentena ? `
                        <button class="btn btn-secondary btn-sm btn-abrir-quarentena" data-id="${p.id}" 
                                style="width: 100%; margin-bottom: 8px; font-size: 10px; font-weight: 800; color: var(--color-red); border-color: var(--border-red); background: var(--bg-red-soft); display: flex; align-items: center; justify-content: center; gap: 4px;"
                                title="Pedido retido na Quarentena. Clique para conferir o checklist de 5 pontos">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                          BLOQUEADO (QUARENTENA)
                        </button>
                      ` : ''}

                      <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 8px; border-top: 1px solid var(--border-subtle); padding-top: 6px;">
                        <div>
                          <span class="text-mono" style="display: block; font-weight: 700;">${formatarMoeda(p.valorTotalVenda)}</span>
                          ${(!isOrcamento && saldoDevedor > 0) ? `<span class="text-mono" style="font-size: 9.5px; color: var(--color-red); display: block;" title="Faltou dinheiro para quitação">Falta: ${formatarMoeda(saldoDevedor)}</span>` : ''}
                        </div>
                        <span class="text-mono ${p.margemLucroPercentual >= 25 ? 'text-green' : 'text-red'}">
                          Margem: ${(p.margemLucroPercentual || 0).toFixed(0)}%
                        </span>
                      </div>

                      <div style="display: flex; gap: 6px;">
                        <button class="btn btn-secondary btn-sm btn-disparar-wpp" data-id="${p.id}" style="flex: 1;" title="Enviar WhatsApp">
                          WPP
                        </button>
                        ${isOrcamento ? `
                          <button class="btn btn-secondary btn-sm btn-baixar-proposta" data-id="${p.id}" style="flex: 1;" title="Baixar Proposta">
                            Proposta
                          </button>
                          <button class="btn btn-primary btn-sm btn-converter-pedido" data-id="${p.id}" style="flex: 1.2; font-weight: 800; background: var(--color-green); border-color: var(--color-green);" title="Oficializar Pedido e Dar Entrada">
                            Entrada
                          </button>
                        ` : `
                          <button class="btn btn-primary btn-sm btn-ver-os" data-id="${p.id}" style="flex: 1;">
                            Ficha OS
                          </button>
                        `}
                      </div>
                    </div>
                  `;
                }).join('') : `
                  <div style="font-size: 11.5px; color: var(--text-gray-500); text-align: center; padding: 30px 10px;">
                    Nenhum pedido nesta fase
                  </div>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function configurarEventosPedidos() {
    // Disparo WhatsApp
    document.querySelectorAll('.btn-disparar-wpp').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        abrirModalWhatsApp(id);
      });
    });

    // Ver / Imprimir OS
    document.querySelectorAll('.btn-ver-os').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const p = db.pedidos.find(x => x.id === id);
        if (p) {
          const os = db.ordensServico.find(o => o.pedidoNumero === p.numero);
          if (os) {
            abrirFichaTecnica(os.id);
          } else {
            abrirFichaTecnicaPorPedido(p);
          }
        }
      });
    });

    // Baixar Proposta Comercial do Orçamento
    document.querySelectorAll('.btn-baixar-proposta').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        abrirModalPropostaComercial(id);
      });
    });

    // Converter Orçamento para Pedido Oficial
    document.querySelectorAll('.btn-converter-pedido').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const p = db.pedidos.find(x => x.id === id);
        if (p) {
          abrirEtapaAvancarPedido(p);
        }
      });
    });

    // Gerenciar Pagamento & Baixas (Substitui o alternarStatusSinalPedido de 1 clique)
    document.querySelectorAll('.btn-gerenciar-pagamento').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        abrirModalReceberPagamento(id);
      });
    });

    // Abrir Quarentena direta pelo botão de bloqueio
    document.querySelectorAll('.btn-abrir-quarentena').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        abrirModalInspecaoQuarentena(id);
      });
    });

    // Trocar Etapa no Quadrinho Verde
    document.querySelectorAll('.select-trocar-etapa').forEach(select => {
      select.addEventListener('change', (e) => {
        const id = select.getAttribute('data-id');
        const novaEtapa = select.value;
        atualizarEtapaPedido(id, novaEtapa);
      });
    });

    // ==========================================
    // DRAG AND DROP TÁTIL NO KANBAN DE PEDIDOS
    // ==========================================
    const cards = document.querySelectorAll('.kanban-card[draggable="true"]');
    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        const pId = card.getAttribute('data-id');
        e.dataTransfer.setData('text/plain', pId);
        e.dataTransfer.effectAllowed = 'move';
        card.classList.add('dragging');
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        document.querySelectorAll('.kanban-col').forEach(c => c.classList.remove('drag-over'));
      });
    });

    const colunas = document.querySelectorAll('.kanban-col');
    colunas.forEach(col => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        col.classList.add('drag-over');
      });

      col.addEventListener('dragleave', (e) => {
        if (!col.contains(e.relatedTarget)) {
          col.classList.remove('drag-over');
        }
      });

      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.classList.remove('drag-over');

        const pedidoId = e.dataTransfer.getData('text/plain');
        if (!pedidoId) return;

        const p = db.pedidos.find(x => x.id === pedidoId);
        if (!p) return;

        const colId = col.getAttribute('data-col-id');
        const etapaDestino = col.getAttribute('data-etapa');

        // REGRA 1: Se for apenas orçamento, não pode ser arrastado para a produção (Corte, Estamparia, Costura, Expedição)
        if ((p.tipoRegistro === 'Orcamento' || p.status === 'Orcamento') && colId !== 'col-orcamento') {
          mostrarToast(`⛔ O registro #${p.numero} é apenas um ORÇAMENTO! Para iniciar a produção (${etapaDestino}), clique no botão "Entrada" para oficializar o pedido, definir costureira, artes e sinal.`, 'yellow');
          abrirEtapaAvancarPedido(p);
          return;
        }

        // REGRA 2: Bloqueio estrito de Quarentena
        if (p.status === 'Quarentena' && colId !== 'col-orcamento') {
          mostrarToast(`⛔ Pedido #${p.numero} BLOQUEADO! O pedido está retido na Quarentena de Segurança. É obrigatório aprovar o checklist de 5 pontos na Quarentena antes de liberar para ${etapaDestino}.`, 'red');
          abrirModalInspecaoQuarentena(p.id);
          return;
        }

        // REGRA 3: Se arrastar de volta para a coluna de Orçamento/Quarentena
        if (colId === 'col-orcamento') {
          if (p.tipoRegistro === 'Orcamento') {
            mostrarToast(`Orçamento #${p.numero} mantido em negociação.`, 'gray');
            return;
          }
          // Reenvia para Quarentena
          atualizarEtapaPedido(p.id, 'Quarentena');
          return;
        }

        // REGRA 4: Mudança de etapa de produção regular
        atualizarEtapaPedido(p.id, etapaDestino);
      });
    });
  }

  /* ==========================================================================
     MODAL DE GESTÃO DE PAGAMENTOS, ENTRADAS & BAIXAS COM SALDO REMANESCENTE
     ========================================================================== */
  function abrirModalReceberPagamento(pedidoId) {
    const p = db.pedidos.find(x => x.id === pedidoId);
    if (!p || !modalContainer) return;

    // Se for apenas orçamento, não permite quitação avulsa sem antes oficializar a entrada no pedido
    if (p.tipoRegistro === 'Orcamento' || p.status === 'Orcamento') {
      mostrarToast(`⚠️ O registro #${p.numero} é apenas um Orçamento! Para registrar pagamento ou entrada, clique no botão "Entrada" para oficializar o pedido e definir as especificações têxteis.`, 'yellow');
      abrirEtapaAvancarPedido(p);
      return;
    }

    const totalVenda = Number(p.valorTotalVenda) || 0;
    const jaPago = Number(p.valorSinalPago) || 0;
    const saldoDevedor = Math.max(0, totalVenda - jaPago);
    const percPago = totalVenda > 0 ? (jaPago / totalVenda) * 100 : 0;
    const isQuitado = saldoDevedor <= 0;

    // Histórico de pagamentos
    const historico = p.historicoPagamentos || [];

    // Sugestão de valor padrão
    const valorSugerido = saldoDevedor > 0 ? saldoDevedor : 0;
    const percSugerido = totalVenda > 0 ? Math.min(100, Math.round((valorSugerido / totalVenda) * 100)) : 100;

    const modalEl = criarModalCamada(`
      <div class="modal-overlay active" id="modalPagamentoOverlay">
        <div class="modal-box" style="max-width: 680px;">
          <div class="modal-header">
            <div>
              <div class="modal-title">Gestão Financeira & Baixa de Pagamento • Pedido #${p.numero}</div>
              <span style="font-size: 11px; color: var(--text-gray-500);">Cliente: <strong>${p.clienteNome}</strong> | ${p.grade?.total || 0}x ${p.produtoNome}</span>
            </div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>

          <div class="modal-body">
            <!-- 3 Cards Resumo Financeiro do Pedido -->
            <div class="grid-cards-3" style="gap: 10px; margin-bottom: 16px;">
              <div class="card" style="padding: 10px 12px; background: var(--bg-subtle);">
                <span style="font-size: 11px; color: var(--text-gray-500); display: block;">Valor Total Pedido</span>
                <strong class="text-mono" style="font-size: 15px; color: var(--text-primary);">${formatarMoeda(totalVenda)}</strong>
              </div>
              <div class="card" style="padding: 10px 12px; background: var(--bg-green-soft); border-color: var(--border-green);">
                <span style="font-size: 11px; color: var(--color-green); display: block;">Total Já Recebido</span>
                <strong class="text-mono" style="font-size: 15px; color: var(--color-green);">${formatarMoeda(jaPago)} (${percPago.toFixed(0)}%)</strong>
              </div>
              <div class="card" style="padding: 10px 12px; background: ${isQuitado ? 'var(--bg-green-soft)' : '#fef2f2'}; border-color: ${isQuitado ? 'var(--border-green)' : '#fca5a5'};">
                <span style="font-size: 11px; color: ${isQuitado ? 'var(--color-green)' : 'var(--color-red)'}; display: block;">Saldo Devedor / A Receber</span>
                <strong class="text-mono" style="font-size: 15px; color: ${isQuitado ? 'var(--color-green)' : 'var(--color-red)'};">
                  ${isQuitado ? '✓ R$ 0,00 (100% Quitado)' : formatarMoeda(saldoDevedor)}
                </strong>
              </div>
            </div>

            <!-- Histórico de Pagamentos se houver -->
            ${(historico.length > 0 || (jaPago > 0 && historico.length === 0)) ? `
              <div style="margin-bottom: 16px;">
                <div style="font-size: 11.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; display: flex; justify-content: space-between;">
                  <span>Histórico de Recebimentos Realizados:</span>
                  <span class="text-mono" style="color: var(--color-green); font-size: 11px;">Total Baixado: ${formatarMoeda(jaPago)}</span>
                </div>
                <div class="table-wrapper" style="max-height: 120px; overflow-y: auto; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                  <table class="erp-table" style="font-size: 11px;">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Descrição</th>
                        <th>Forma</th>
                        <th>Valor Recebido</th>
                        <th>Saldo Restante</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${historico.length > 0 ? historico.map(h => `
                        <tr>
                          <td class="text-mono">${h.data}</td>
                          <td>${h.descricao || 'Recebimento de Sinal'}</td>
                          <td><span class="status-pill status-gray" style="font-size: 9.5px;">${h.formaPagamento || 'PIX'}</span></td>
                          <td class="text-mono" style="color: var(--color-green); font-weight: 700;">+ ${formatarMoeda(h.valor)}</td>
                          <td class="text-mono" style="color: ${h.saldoRestante > 0 ? 'var(--color-red)' : 'var(--color-green)'};">
                            ${h.saldoRestante > 0 ? formatarMoeda(h.saldoRestante) : '✓ Quitado'}
                          </td>
                        </tr>
                      `).join('') : `
                        <tr>
                          <td class="text-mono">${p.dataCriacao}</td>
                          <td>Sinal / Entrada Inicial</td>
                          <td><span class="status-pill status-gray" style="font-size: 9.5px;">PIX</span></td>
                          <td class="text-mono" style="color: var(--color-green); font-weight: 700;">+ ${formatarMoeda(jaPago)}</td>
                          <td class="text-mono" style="color: ${saldoDevedor > 0 ? 'var(--color-red)' : 'var(--color-green)'};">
                            ${saldoDevedor > 0 ? formatarMoeda(saldoDevedor) : '✓ Quitado'}
                          </td>
                        </tr>
                      `}
                    </tbody>
                  </table>
                </div>
              </div>
            ` : ''}

            <!-- Formulário de Novo Pagamento -->
            ${isQuitado ? `
              <div style="background: var(--bg-green-soft); border: 1px solid var(--border-green); border-radius: var(--radius-sm); padding: 16px; text-align: center;">
                <div style="font-size: 16px; font-weight: 800; color: var(--color-green); margin-bottom: 4px;">🎉 Pedido 100% Quitado!</div>
                <div style="font-size: 12px; color: var(--text-gray-600);">Não há saldo devedor remanescente para este pedido. Todos os lançamentos foram liquidados no Financeiro.</div>
              </div>
            ` : `
              <div style="background: #ffffff; border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 14px;">
                <div style="font-size: 12px; font-weight: 800; color: var(--text-primary); margin-bottom: 10px;">
                  Registrar Pagamento do Cliente (Entrada, Parcial ou Quitação Total):
                </div>

                <!-- Atalhos rápidos de valor / porcentagem -->
                <div style="display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap;">
                  <span style="font-size: 11px; color: var(--text-gray-500); align-self: center; margin-right: 4px;">Atalhos:</span>
                  <button type="button" class="btn btn-secondary btn-sm btn-quick-pay" data-val="${saldoDevedor.toFixed(2)}" style="font-weight: 700; color: var(--color-green);">
                    Quitar Tudo (${formatarMoeda(saldoDevedor)})
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm btn-quick-pay" data-val="${(saldoDevedor * 0.5).toFixed(2)}">
                    50% do Restante (${formatarMoeda(saldoDevedor * 0.5)})
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm btn-quick-pay" data-val="${(totalVenda * 0.3).toFixed(2)}">
                    Sinal 30% (${formatarMoeda(totalVenda * 0.3)})
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm btn-quick-pay" data-val="${(totalVenda * 0.5).toFixed(2)}">
                    Sinal 50% (${formatarMoeda(totalVenda * 0.5)})
                  </button>
                </div>

                <div class="form-row">
                  <div class="form-group" style="flex: 1;">
                    <label class="form-label">Porcentagem a Pagar (% do Total)</label>
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <input type="number" id="pagInputPorcentagem" class="form-input text-mono" min="1" max="100" step="1" value="${percSugerido}">
                      <span style="font-size: 13px; font-weight: 700; color: var(--text-gray-500);">%</span>
                    </div>
                  </div>

                  <div class="form-group" style="flex: 1.5;">
                    <label class="form-label">
                      <strong>Valor Pago pelo Cliente (R$)</strong> *
                    </label>
                    <input type="number" id="pagInputValor" class="form-input text-mono" style="font-size: 16px; font-weight: 800; color: var(--color-green);" min="0.01" max="${saldoDevedor}" step="5.00" value="${valorSugerido.toFixed(2)}">
                  </div>

                  <div class="form-group" style="flex: 1.5;">
                    <label class="form-label">Forma de Pagamento</label>
                    <select id="pagInputForma" class="form-select">
                      <option value="PIX">PIX (Banco da Confecção)</option>
                      <option value="Dinheiro">Dinheiro em Espécie</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Cartão de Débito">Cartão de Débito</option>
                      <option value="TED/Transferência">TED / Transferência Bancária</option>
                      <option value="Boleto">Boleto Bancário</option>
                      <option value="Cheque">Cheque Compensado</option>
                    </select>
                  </div>
                </div>

                <div class="form-row" style="margin-top: 8px;">
                  <div class="form-group" style="flex: 1;">
                    <label class="form-label">Data do Recebimento</label>
                    <input type="date" id="pagInputData" class="form-input text-mono" value="${new Date().toISOString().split('T')[0]}">
                  </div>
                  <div class="form-group" style="flex: 2;">
                    <label class="form-label">Observações / Comprovante (Opcional)</label>
                    <input type="text" id="pagInputObs" class="form-input" placeholder="Ex: Entrada em dinheiro na loja, PIX CNPJ...">
                  </div>
                </div>

                <!-- Box de Feedback Dinâmico sobre Saldo Remanescente -->
                <div id="pagBoxSaldoFeedback" style="margin-top: 10px; padding: 10px 12px; border-radius: var(--radius-sm); font-size: 11.5px;">
                  <!-- Inserido dinamicamente via JS -->
                </div>
              </div>
            `}
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.ERP.fecharModal()">Fechar</button>
            ${!isQuitado ? `
              <button type="button" class="btn btn-green" id="btnConfirmarRecebimentoPagamento" style="font-weight: 800;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Confirmar Recebimento & Baixar no Caixa
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `);

    // Sincronização entre % e Valor e cálculo do Saldo Remanescente
    const inputPerc = document.getElementById('pagInputPorcentagem');
    const inputValor = document.getElementById('pagInputValor');
    const boxFeedback = document.getElementById('pagBoxSaldoFeedback');

    function atualizarCalculosPagamento(origem) {
      if (!inputValor || !boxFeedback) return;

      let valor = parseFloat(inputValor.value) || 0;
      if (valor < 0) valor = 0;

      if (origem === 'perc' && inputPerc) {
        let perc = parseFloat(inputPerc.value) || 0;
        if (perc > 100) perc = 100;
        if (perc < 0) perc = 0;
        valor = (totalVenda * perc) / 100;
        if (valor > saldoDevedor) valor = saldoDevedor;
        inputValor.value = valor.toFixed(2);
      } else if (origem === 'valor' && inputPerc) {
        if (valor > saldoDevedor) valor = saldoDevedor;
        const perc = totalVenda > 0 ? (valor / totalVenda) * 100 : 0;
        inputPerc.value = perc.toFixed(0);
      }

      const saldoRemanescente = Math.max(0, saldoDevedor - valor);

      if (saldoRemanescente > 0) {
        boxFeedback.style.backgroundColor = '#fef3c7';
        boxFeedback.style.border = '1px solid #fde68a';
        boxFeedback.style.color = '#92400e';
        boxFeedback.innerHTML = `
          <div style="font-weight: 800; display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            Pagamento Parcial • Saldo Remanescente: ${formatarMoeda(saldoRemanescente)}
          </div>
          <div>O cliente está pagando ${formatarMoeda(valor)}. Como é inferior ao saldo devedor, <strong>faltou dinheiro para quitação</strong>. O saldo remanescente de <strong>${formatarMoeda(saldoRemanescente)}</strong> continuará em aberto no sistema para cobrança.</div>
        `;
      } else {
        boxFeedback.style.backgroundColor = 'var(--bg-green-soft)';
        boxFeedback.style.border = '1px solid var(--border-green)';
        boxFeedback.style.color = 'var(--color-green)';
        boxFeedback.innerHTML = `
          <div style="font-weight: 800; display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Quitação Integral (100%) • Sem Saldo Remanescente
          </div>
          <div>O valor pago de ${formatarMoeda(valor)} liquidará <strong>100% do saldo devedor</strong> deste pedido no financeiro.</div>
        `;
      }
    }

    inputPerc?.addEventListener('input', () => atualizarCalculosPagamento('perc'));
    inputValor?.addEventListener('input', () => atualizarCalculosPagamento('valor'));
    atualizarCalculosPagamento('valor');

    document.querySelectorAll('.btn-quick-pay').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseFloat(btn.getAttribute('data-val') || 0);
        if (inputValor) {
          inputValor.value = Math.min(saldoDevedor, val).toFixed(2);
          atualizarCalculosPagamento('valor');
        }
      });
    });

    document.getElementById('btnConfirmarRecebimentoPagamento')?.addEventListener('click', () => {
      const valor = parseFloat(inputValor?.value || 0);
      if (isNaN(valor) || valor <= 0) {
        mostrarToast('Por favor, informe um valor de pagamento válido maior que R$ 0,00.', 'red');
        return;
      }

      const formaPag = document.getElementById('pagInputForma')?.value || 'PIX';
      const dataPag = document.getElementById('pagInputData')?.value || new Date().toISOString().split('T')[0];
      const obsPag = document.getElementById('pagInputObs')?.value || '';

      const novoTotalPago = jaPago + valor;
      const novoSaldoPendente = Math.max(0, totalVenda - novoTotalPago);
      const quitou = novoSaldoPendente <= 0;

      p.valorSinalPago = novoTotalPago;
      p.saldoPendente = novoSaldoPendente;
      p.sinalPago = novoTotalPago > 0;
      if (quitou) {
        p.condicaoPagamento = '100% Quitado';
      }

      if (!p.historicoPagamentos) {
        p.historicoPagamentos = [];
        if (jaPago > 0) {
          p.historicoPagamentos.push({
            id: `PAG-INIT`,
            data: p.dataCriacao || dataPag,
            descricao: 'Entrada / Sinal Inicial',
            formaPagamento: 'PIX',
            valor: jaPago,
            saldoRestante: Math.max(0, totalVenda - jaPago)
          });
        }
      }

      p.historicoPagamentos.push({
        id: `PAG-${Math.floor(1000 + Math.random() * 9000)}`,
        data: dataPag,
        descricao: quitou ? 'Quitação Integral' : 'Recebimento Parcial',
        formaPagamento: formaPag,
        valor: valor,
        observacao: obsPag,
        saldoRestante: novoSaldoPendente
      });

      // Lança no financeiro com o nome do cliente
      db.lancamentosFinanceiros.unshift({
        id: `LAN-${Math.floor(100 + Math.random() * 900)}`,
        data: dataPag,
        tipo: "Entrada",
        descricao: quitou
          ? `Quitação 100% Pedido #${p.numero} (${p.clienteNome})`
          : `Recebimento Parcial Pedido #${p.numero} (${p.clienteNome}) - Resta ${formatarMoeda(novoSaldoPendente)}`,
        cliente: p.clienteNome,
        valor: valor,
        formaPagamento: formaPag,
        categoria: "Vendas de Uniformes"
      });

      salvarEstado();
      fecharModal(modalEl);
      renderizarPedidos();

      if (quitou) {
        mostrarToast(`🎉 Pedido #${p.numero} 100% QUITADO! Recebimento de ${formatarMoeda(valor)} creditado no Financeiro.`, 'green');
      } else {
        mostrarToast(`⚠️ Recebimento de ${formatarMoeda(valor)} confirmado! Faltou dinheiro para quitar: saldo remanescente devedor de ${formatarMoeda(novoSaldoPendente)}.`, 'yellow');
      }
    });
  }

  // Compatibilidade Legada
  function alternarStatusSinalPedido(pedidoId) {
    abrirModalReceberPagamento(pedidoId);
  }

  // Atualização de Etapa com Disparo Obrigatório e Imediato de WhatsApp
  function atualizarEtapaPedido(pedidoId, novaEtapa) {
    const p = db.pedidos.find(x => x.id === pedidoId);
    // BLOQUEIO RIGOROSO DE ORÇAMENTO:
    // Se o registro é apenas orçamento, não pode avançar para a produção sem passar pela Entrada Oficial
    if ((p.tipoRegistro === 'Orcamento' || p.status === 'Orcamento') && novaEtapa !== 'Orcamento') {
      mostrarToast(`⛔ O registro #${p.numero} é apenas um ORÇAMENTO! É obrigatório oficializar a entrada no pedido antes de liberar para a fábrica (${novaEtapa}).`, 'yellow');
      renderizarPedidos();
      abrirEtapaAvancarPedido(p);
      return;
    }

    // BLOQUEIO RIGOROSO DE QUARENTENA:
    // Se o pedido está em quarentena, não pode mudar a etapa sem antes ter passado pelo checklist de 5 pontos na quarentena
    if (p.status === 'Quarentena' && novaEtapa !== 'Quarentena' && novaEtapa !== 'Orcamento') {
      mostrarToast(`⛔ Pedido #${p.numero} BLOQUEADO! O pedido está retido na Quarentena de Segurança. É obrigatório aprovar o checklist de 5 pontos na Quarentena antes de liberar para a fábrica (${novaEtapa}).`, 'red');
      renderizarPedidos();
      abrirModalInspecaoQuarentena(p.id);
      return;
    }

    if (novaEtapa === 'Orcamento') {
      p.status = 'Orcamento';
      p.etapaProducao = 'Em Negociação';
    } else if (novaEtapa === 'Quarentena') {
      p.status = 'Quarentena';
      p.etapaProducao = 'Aguardando Aprovação Técnica';
      p.quarentenaAprovada = false;
    } else if (novaEtapa === 'Entregue') {
      p.status = 'Finalizado';
      p.etapaProducao = 'Entregue ao Cliente';
    } else {
      p.status = 'Em Producao';
      p.etapaProducao = novaEtapa;
    }

    // Sincroniza na OS
    const os = db.ordensServico.find(o => o.pedidoNumero === p.numero);
    if (os) {
      os.etapaAtual = p.etapaProducao;
    }

    salvarEstado();
    atualizarBadges();
    renderizarPedidos();

    mostrarToast(`Etapa do pedido #${p.numero} atualizada para "${p.etapaProducao}".`, 'green');

    // Abre imediatamente o modal com a mensagem pronta personalizada para o WhatsApp do cliente
    abrirModalWhatsApp(p.id);
  }

  /* ==========================================================================
     GERENCIADOR DE PADRÕES INDUSTRIAIS & PRAZOS (CONFIGURÁVEL PELO USUÁRIO)
     ========================================================================== */
  const CONFIGURACOES_PADRAO_SISTEMA = {
    prazoPedidoDias: 15,
    prazoInternoDias: 10,
    dtfLarguraRolo: 58,
    dtfMetroLinear58: 60.00,
    dtfMetroLinear28: 38.00,
    dtfPrensagem: 1.50,
    custoCostura: 7.50,
    margemErroTecido: 8.0,
    custoAviamento: 4.80,
    consumoTecido: 0.28,
    custoTecidoKg: 48.50,
    aliquotaImposto: 6.5,
    margemDesejada: 30.0
  };

  function carregarPadroesSistema() {
    try {
      const raw = localStorage.getItem('UNIFORMES_ERP_PADROES_CUSTOS');
      if (raw) {
        return Object.assign({}, CONFIGURACOES_PADRAO_SISTEMA, JSON.parse(raw));
      }
    } catch (e) {
      console.warn('Erro ao carregar padrões do sistema:', e);
    }
    return Object.assign({}, CONFIGURACOES_PADRAO_SISTEMA);
  }

  function salvarPadroesSistema(novosPadroes) {
    try {
      const atuais = carregarPadroesSistema();
      const combinados = Object.assign({}, atuais, novosPadroes);
      localStorage.setItem('UNIFORMES_ERP_PADROES_CUSTOS', JSON.stringify(combinados));
      return combinados;
    } catch (e) {
      console.error('Erro ao salvar padrões do sistema:', e);
      return null;
    }
  }

  function calcularDataFuturaDiasUteis(diasUteis) {
    const qtd = parseInt(diasUteis, 10) || 15;
    const d = new Date();
    let adicionados = 0;
    while (adicionados < qtd) {
      d.setDate(d.getDate() + 1);
      const diaSemana = d.getDay();
      if (diaSemana !== 0 && diaSemana !== 6) { // Pula sábado e domingo
        adicionados++;
      }
    }
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  /* ==========================================================================
     MODAL DE NOVO ORÇAMENTO COM DUPLO FLUXO & BENCHMARK BRASIL PROFUNDO
     ========================================================================== */
  function abrirModalNovoOrcamento() {
    if (!modalContainer) return;
    fecharTodosModais();

    // Carrega preferências e padrões industriais salvos
    const padroes = carregarPadroesSistema();

    // Estado da técnica de estampa atual no modal
    let tecnicaSelecionada = 'DTF';

    // Mockup 3x4 dinâmico para Orçamento
    const prodInicial = (db.produtosBase && db.produtosBase[0]) || { nome: "Camisa Polo Tradicional Piquet", tipoMalhaPadrao: "Piquet PA", consumoMalhaKgPorPeca: 0.28, custoMaoDeObraBase: 7.50 };
    const cliInicial = (db.clientes && db.clientes[0]) || { nomeFantasia: "TEXPRO", nome: "TEXPRO" };
    const siglaInicial = (cliInicial.nomeFantasia || cliInicial.nome || cliInicial.razaoSocial || "TEXPRO").toString().substring(0, 6);
    let mockupOrcamentoUrl = (window.ERP_MOCKUPS && typeof window.ERP_MOCKUPS.gerarMockupSvg === 'function')
      ? window.ERP_MOCKUPS.gerarMockupSvg(prodInicial.nome, "#1e3a8a", "#ffffff", siglaInicial)
      : "";
    let mockupUploadPersonalizado = false;

    const modalEl = criarModalCamada(`
      <div class="modal-overlay active" id="modalNovoOrcamentoOverlay">
        <div class="modal-box" style="max-width: 880px;">
          <div class="modal-header">
            <div>
              <div class="modal-title">Novo Orçamento & Inteligência de Preço Brasil</div>
              <span style="font-size: 11px; color: var(--text-gray-500);">Preços reais do mercado brasileiro com viabilidade financeira e ficha em tempo real</span>
            </div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>
          
          <div class="modal-body">
            <!-- 1. Seleção e Cadastro de Cliente -->
            <div class="form-row">
              <div class="form-group" style="flex: 2;">
                <label class="form-label">Cliente / Razão Social (Selecione ou Cadastre)</label>
                <div class="inline-input-group">
                  <select id="orcClienteSelect" class="form-select">
                    ${(db.clientes || []).map(c => `<option value="${c.id}">${c.nomeFantasia || c.nome || c.razaoSocial || 'Cliente'} • ${formatarTelefone(c.telefone)} (${c.cidade || 'SP'}/${c.uf || 'SP'})</option>`).join('')}
                  </select>
                  <button type="button" class="btn btn-secondary btn-inline-add" id="btnCadastrarClienteInline">
                    + Novo Cliente
                  </button>
                </div>
              </div>

              <!-- 2. Seleção e Pesquisa de Modelagens Têxteis com Cadastro Inline -->
              <div class="form-group" style="flex: 2;">
                <label class="form-label">Modelo Têxtil (Pesquise ou Cadastre)</label>
                <div class="inline-input-group">
                  <select id="orcProdutoSelect" class="form-select">
                    ${db.produtosBase.map(pr => `<option value="${pr.id}">${pr.nome} [${pr.tipoMalhaPadrao}]</option>`).join('')}
                  </select>
                  <button type="button" class="btn btn-secondary btn-inline-add" id="btnCadastrarModeloInline">
                    + Cadastrar Modelo
                  </button>
                </div>
              </div>
            </div>

            <!-- 2.1 Cores do Uniforme & Especificações de Detalhes Contrastantes -->
            ${gerarHTMLSeletorCoresIndustrial('orc', 'Azul Marinho')}

            <!-- Grade de Tamanhos - PREENCHIMENTO DIRETO OU ATALHOS RÁPIDOS -->
            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; flex-wrap: wrap; gap: 6px;">
                <div>
                  <label class="form-label" style="margin: 0; font-weight: 700;">Grade de Tamanhos (Distribuição de Peças)</label>
                  <span style="font-size: 10px; color: var(--text-gray-500);">Digite as quantidades ou use um atalho rápido:</span>
                </div>
                <div style="display: flex; gap: 4px; align-items: center;">
                  <button type="button" class="btn btn-secondary btn-sm btn-grade-rapida" data-dist="2,4,8,4,2,0" style="font-size: 10px; padding: 2px 7px; font-weight: 600;" title="Preencher grade com 20 peças">+20 Pçs</button>
                  <button type="button" class="btn btn-secondary btn-sm btn-grade-rapida" data-dist="5,10,15,12,6,2" style="font-size: 10px; padding: 2px 7px; font-weight: 600;" title="Preencher grade com 50 peças">+50 Pçs</button>
                  <button type="button" class="btn btn-secondary btn-sm btn-grade-rapida" data-dist="10,20,30,25,10,5" style="font-size: 10px; padding: 2px 7px; font-weight: 600;" title="Preencher grade com 100 peças">+100 Pçs</button>
                  <button type="button" class="btn btn-secondary btn-sm" id="btnZerarGrade" style="font-size: 10px; padding: 2px 7px; color: #dc2626;" title="Zerar todas as quantidades">Zerar</button>
                </div>
              </div>
              <div class="grade-table-input" id="boxGradeTableInput">
                <div class="grade-col"><div class="grade-label">PP</div><input type="number" id="gradePP" class="grade-input" value="0" min="0"></div>
                <div class="grade-col"><div class="grade-label">P</div><input type="number" id="gradeP" class="grade-input" value="0" min="0"></div>
                <div class="grade-col"><div class="grade-label">M</div><input type="number" id="gradeM" class="grade-input" value="0" min="0"></div>
                <div class="grade-col"><div class="grade-label">G</div><input type="number" id="gradeG" class="grade-input" value="0" min="0"></div>
                <div class="grade-col"><div class="grade-label">GG</div><input type="number" id="gradeGG" class="grade-input" value="0" min="0"></div>
                <div class="grade-col"><div class="grade-label">XG</div><input type="number" id="gradeXG" class="grade-input" value="0" min="0"></div>
                <div class="grade-col"><div class="grade-label">TOTAL</div><input type="text" id="gradeTotal" class="grade-input" style="font-weight: 800; background: #0f172a; color: #ffffff;" value="0" readonly></div>
              </div>
            </div>

            <!-- Seção de Prazos de Produção & Entrega (Prometido ao Cliente vs Meta Interna) -->
            <div class="form-group" style="background: #f8fafc; border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label class="form-label" style="font-weight: 800; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 6px;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Prazos do Pedido (Prometido ao Cliente vs Meta Interna da Fábrica):
                </label>
                <button type="button" class="btn btn-secondary btn-sm" id="btnSalvarPrazosPadrao" style="font-size: 10.5px; padding: 3px 8px; font-weight: 700; color: #0369a1; border-color: #bae6fd; background: #f0f9ff;" title="Grava estes dias como padrão do sistema">
                  ⭐ Tornar Prazos Padrão
                </button>
              </div>
              <div class="form-row">
                <div class="form-group" style="flex: 1;">
                  <label class="form-label" style="font-size: 11px;">Prazo Prometido ao Cliente (dias úteis)</label>
                  <input type="number" id="inputPrazoClienteDias" class="form-input" value="${padroes.prazoPedidoDias}" min="1" max="90">
                  <div style="display: flex; gap: 4px; margin-top: 5px;">
                    <button type="button" class="btn btn-secondary btn-sm btn-prazo-cli-pill" data-dias="7" style="font-size: 9.5px; padding: 1px 6px;">7 dias</button>
                    <button type="button" class="btn btn-secondary btn-sm btn-prazo-cli-pill" data-dias="10" style="font-size: 9.5px; padding: 1px 6px;">10 dias</button>
                    <button type="button" class="btn btn-secondary btn-sm btn-prazo-cli-pill" data-dias="15" style="font-size: 9.5px; padding: 1px 6px;">15 dias</button>
                    <button type="button" class="btn btn-secondary btn-sm btn-prazo-cli-pill" data-dias="20" style="font-size: 9.5px; padding: 1px 6px;">20 dias</button>
                  </div>
                  <span id="labelDataEntregaCliente" style="font-size: 11px; color: #1e40af; font-weight: 700; margin-top: 4px; display: block;"></span>
                </div>

                <div class="form-group" style="flex: 1;">
                  <label class="form-label" style="font-size: 11px;">Prazo Interno da Fábrica (Meta do Chão de Fábrica em dias)</label>
                  <input type="number" id="inputPrazoInternoDias" class="form-input" value="${padroes.prazoInternoDias}" min="1" max="90">
                  <div style="display: flex; gap: 4px; margin-top: 5px;">
                    <button type="button" class="btn btn-secondary btn-sm btn-prazo-int-pill" data-dias="5" style="font-size: 9.5px; padding: 1px 6px;">5 dias</button>
                    <button type="button" class="btn btn-secondary btn-sm btn-prazo-int-pill" data-dias="7" style="font-size: 9.5px; padding: 1px 6px;">7 dias</button>
                    <button type="button" class="btn btn-secondary btn-sm btn-prazo-int-pill" data-dias="10" style="font-size: 9.5px; padding: 1px 6px;">10 dias</button>
                    <button type="button" class="btn btn-secondary btn-sm btn-prazo-int-pill" data-dias="12" style="font-size: 9.5px; padding: 1px 6px;">12 dias</button>
                  </div>
                  <span id="labelDataMetaInterna" style="font-size: 11px; color: #0284c7; font-weight: 700; margin-top: 4px; display: block;"></span>
                </div>
              </div>
            </div>

            <!-- MOCKUP 3x4 OFICIAL DO ORÇAMENTO -->
            <div class="form-group" style="background: #f8fafc; border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 14px;">
              <label class="form-label" style="font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">
                Mockup da Peça em Proporção 3x4 (Sairá no Orçamento, Proposta Comercial e Ficha Técnica)
              </label>
              <div style="display: flex; gap: 14px; align-items: center;">
                <div>
                  <img id="previewMockup3x4Orc" src="${mockupOrcamentoUrl}" style="width: 72px; height: 96px; aspect-ratio: 3/4; object-fit: contain; border: 1px solid var(--border-medium); border-radius: 4px; background: #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.08);" alt="Preview 3x4">
                  <span style="display: block; font-size: 9.5px; color: var(--text-gray-500); text-align: center; margin-top: 3px;">Miniatura 3x4</span>
                </div>
                <div style="flex: 1;">
                  <span style="font-size: 11.5px; color: var(--text-gray-600); display: block; margin-bottom: 6px;">
                    Anexe um arquivo de imagem fornecido pelo cliente ou utilize a renderização industrial com paletas oficiais:
                  </span>
                  <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <label class="btn btn-secondary btn-sm" style="cursor: pointer; font-size: 11px; padding: 4px 9px;">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      Anexar Imagem Mockup (Arquivo)
                      <input type="file" id="inputUploadMockupOrc" accept="image/*" style="display: none;">
                    </label>
                    <button type="button" class="btn btn-secondary btn-sm btn-mock-orc-preset" data-preset="azul" style="font-size: 11px; padding: 4px 8px;">Polo Marinho</button>
                    <button type="button" class="btn btn-secondary btn-sm btn-mock-orc-preset" data-preset="cinza" style="font-size: 11px; padding: 4px 8px;">Brim Cinza</button>
                    <button type="button" class="btn btn-secondary btn-sm btn-mock-orc-preset" data-preset="branco" style="font-size: 11px; padding: 4px 8px;">Branco Neve</button>
                    <button type="button" class="btn btn-secondary btn-sm btn-mock-orc-preset" data-preset="preto" style="font-size: 11px; padding: 4px 8px;">Preto Reativo</button>
                    <button type="button" class="btn btn-secondary btn-sm btn-mock-orc-preset" data-preset="royal" style="font-size: 11px; padding: 4px 8px;">Royal Esportivo</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Seletor de Técnicas de Personalização: Bordado, DTF, SILK, Sublimação, Lisa -->
            <div class="form-group">
              <label class="form-label">Técnica de Personalização (Escolha a técnica para calcular o custo específico)</label>
              <div class="tecnica-tabs" id="tecnicasTabsContainer">
                <button type="button" class="tecnica-pill active" data-tecnica="DTF">DTF Digital (Direct to Film)</button>
                <button type="button" class="tecnica-pill" data-tecnica="Bordado">Bordado Computadorizado</button>
                <button type="button" class="tecnica-pill" data-tecnica="Silk">Silk Screen / Serigrafia</button>
                <button type="button" class="tecnica-pill" data-tecnica="Sublimacao">Sublimação Total</button>
                <button type="button" class="tecnica-pill" data-tecnica="Lisa">Peça Lisa (Sem Estampa)</button>
              </div>

              <!-- Parâmetros Específicos da Técnica Escolhida -->
              <div id="painelParametrosTecnica" style="background: #f8fafc; border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 12px;">
                <!-- Dinâmico via JS -->
              </div>
            </div>

            <!-- 4. Painel de Custos de Produção Real da Confecção -->
            <div style="background: #ffffff; padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-medium); margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                <span class="form-label" style="font-size: 12.5px; font-weight: 800; color: var(--text-primary); margin: 0;">
                  Custos Diretos desta Confecção para Produzir:
                </span>
                <div style="display: flex; gap: 6px;">
                  <button type="button" class="btn btn-secondary btn-sm" id="btnSalvarCustosPadrao" style="font-size: 11px; padding: 4px 10px; font-weight: 700; background: #f0fdf4; color: #166534; border-color: #bbf7d0;" title="Salva os custos, consumos, margem de erro, costura e DTF atuais como seus padrões">
                    ⭐ Salvar Valores Atuais como Meus Padrões
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm" id="btnRestaurarCustosPadrao" style="font-size: 11px; padding: 4px 8px;" title="Restaura os valores padrões salvos">
                    🔄 Restaurar Padrões
                  </button>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group" style="flex: 1.2;">
                  <label class="form-label">Custo Tecido (R$/kg ou m)</label>
                  <input type="number" id="inputCustoTecido" class="form-input" value="${padroes.custoTecidoKg.toFixed(2)}" step="0.50">
                </div>

                <div class="form-group" style="flex: 1;">
                  <label class="form-label" title="Consumo têxtil padrão desta modelagem">Consumo (kg ou m/un)</label>
                  <input type="number" id="inputConsumoTecido" class="form-input" value="${(padroes.consumoTecido || prodInicial.consumoMalhaKgPorPeca || 0.28).toFixed(2)}" step="0.01" min="0.05">
                </div>

                <div class="form-group" style="flex: 1;">
                  <label class="form-label" title="Margem de erro / perda no corte, enfesto e ourela (ex: 8%)">Margem Erro (%)</label>
                  <input type="number" id="inputMargemErroTecido" class="form-input" value="${(padroes.margemErroTecido || 8.0).toFixed(1)}" step="0.5" min="0" max="30">
                </div>

                <div class="form-group" style="flex: 1;">
                  <label class="form-label">Aviamentos p/ Peça (R$)</label>
                  <input type="number" id="inputCustoAviamento" class="form-input" value="${(padroes.custoAviamento || 4.80).toFixed(2)}" step="0.20">
                </div>

                <div class="form-group" style="flex: 1;">
                  <label class="form-label">Estampa Calculada (R$)</label>
                  <input type="number" id="inputCustoEstampa" class="form-input" value="6.50" step="0.10">
                </div>

                <div class="form-group" style="flex: 1;">
                  <label class="form-label">Costura & MDO (R$)</label>
                  <input type="number" id="inputCustoCostura" class="form-input" value="${(padroes.custoCostura || 7.50).toFixed(2)}" step="0.50">
                </div>
              </div>

              <!-- Painel Técnico de Rendimento por Peça e Custo do Tecido -->
              <div id="boxRendimentoTecido" style="margin-top: 10px; margin-bottom: 12px; padding: 12px 14px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: var(--radius-sm);">
                <!-- Preenchido dinamicamente via recalcularBenchmarkModal -->
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Preço que Pretende Cobrar (R$ un)</label>
                  <input type="number" id="inputPrecoPretendido" class="form-input" style="font-weight: 800; font-size: 14px;" value="54.00" step="1.00">
                </div>

                <div class="form-group">
                  <label class="form-label">Margem Líquida Alvo (%)</label>
                  <input type="number" id="inputMargemDesejada" class="form-input" value="${padroes.margemDesejada || 30}" step="1">
                </div>

                <div class="form-group">
                  <label class="form-label">Imposto / Simples (%)</label>
                  <input type="number" id="inputAliquotaImposto" class="form-input" value="${padroes.aliquotaImposto || 6.5}" step="0.1">
                </div>
              </div>
            </div>

            <!-- 5. Painel de Inteligência de Mercado Brasil & Viabilidade -->
            <div id="painelBenchmarkResultado" class="benchmark-container">
              <!-- Calculado dinamicamente -->
            </div>
          </div>

          <!-- Rodapé com Duplo Fluxo Conforme Exigido pelo Usuário -->
          <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
            <button type="button" class="btn btn-secondary" onclick="window.ERP.fecharModal()">Cancelar</button>
            
            <div style="display: flex; gap: 10px;">
              <!-- Opção 1: Salvar apenas orçamento e baixar proposta -->
              <button type="button" class="btn btn-secondary" id="btnSalvarApenasOrcamento" style="font-weight: 700;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Salvar Orçamento & Baixar Proposta
              </button>

              <!-- Opção 2: Avançar e dar entrada oficial no pedido -->
              <button type="button" class="btn btn-primary" id="btnAvancarParaPedidoOficial" style="font-weight: 800;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                Avançar & Dar Entrada no Pedido
              </button>
            </div>
          </div>
        </div>
      </div>
    `);

    // Upload de mockup personalizado no orçamento
    const inputUploadOrc = document.getElementById('inputUploadMockupOrc');
    inputUploadOrc?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          mockupOrcamentoUrl = evt.target.result;
          mockupUploadPersonalizado = true;
          const prev = document.getElementById('previewMockup3x4Orc');
          if (prev) prev.src = mockupOrcamentoUrl;
          mostrarToast('Mockup do cliente carregado com sucesso para o orçamento!', 'green');
        };
        reader.readAsDataURL(file);
      }
    });

    // Presets de cores de mockup no orçamento
    document.querySelectorAll('.btn-mock-orc-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-preset');
        const prodId = document.getElementById('orcProdutoSelect')?.value;
        const pObj = db.produtosBase.find(pr => pr.id === prodId) || db.produtosBase[0];
        const cliId = document.getElementById('orcClienteSelect')?.value;
        const cObj = (db.clientes || []).find(c => c.id === cliId) || (db.clientes && db.clientes[0]);
        const sigla = (cObj ? (cObj.nomeFantasia || cObj.nome || cObj.razaoSocial || "TEXPRO") : "TEXPRO").toString().substring(0, 6);

        if (preset === 'azul') {
          mockupOrcamentoUrl = window.ERP_MOCKUPS.gerarMockupSvg(pObj.nome, "#1e3a8a", "#ffffff", sigla);
        } else if (preset === 'cinza') {
          mockupOrcamentoUrl = window.ERP_MOCKUPS.gerarMockupSvg("brim", "#475569", "#eab308", sigla);
        } else if (preset === 'branco') {
          mockupOrcamentoUrl = window.ERP_MOCKUPS.gerarMockupSvg("jaleco", "#ffffff", "#047857", sigla);
        } else if (preset === 'preto') {
          mockupOrcamentoUrl = window.ERP_MOCKUPS.gerarMockupSvg("camiseta", "#0f172a", "#ffffff", sigla);
        } else if (preset === 'royal') {
          mockupOrcamentoUrl = window.ERP_MOCKUPS.gerarMockupSvg(pObj.nome, "#2563eb", "#ffffff", sigla);
        }
        mockupUploadPersonalizado = false;
        const prev = document.getElementById('previewMockup3x4Orc');
        if (prev) prev.src = mockupOrcamentoUrl;
      });
    });

    // Atualiza o painel específico da técnica de estampa
    function atualizarPainelTecnica(tec) {
      tecnicaSelecionada = tec;
      const painel = document.getElementById('painelParametrosTecnica');
      if (!painel) return;

      const pdr = carregarPadroesSistema();

      if (tec === 'DTF') {
        const larguraSalva = pdr.dtfLarguraRolo || 58;
        const isCustom = larguraSalva != 58 && larguraSalva != 28;
        const custoMetroSalvo = larguraSalva == 28 ? (pdr.dtfMetroLinear28 || 38.00) : (pdr.dtfMetroLinear58 || 60.00);

        painel.innerHTML = `
          <div style="font-size: 11.5px; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); display: flex; justify-content: space-between; align-items: center;">
            <span>Cálculo DTF Digital por Bobina e Metro Linear:</span>
            <span style="font-size: 10px; color: var(--text-gray-500);">Bobina 58cm (Industrial) ou 28/30cm (Estreita)</span>
          </div>
          <div class="form-row">
            <div class="form-group" style="flex: 1.3;">
              <label class="form-label" title="Largura útil da bobina de filme DTF ou do arquivo fechado">Largura da Bobina / Arquivo</label>
              <select id="dtfParamLarguraRolo" class="form-select">
                <option value="58" ${larguraSalva == 58 ? 'selected' : ''}>58 cm Útil (Bobina 60cm Industrial)</option>
                <option value="28" ${larguraSalva == 28 ? 'selected' : ''}>28 cm Útil (Bobina Estreita 30cm / A3)</option>
                <option value="custom" ${isCustom ? 'selected' : ''}>Outra Largura Personalizada (cm)...</option>
              </select>
            </div>
            <div class="form-group" id="grpDtfLarguraCustom" style="display: ${isCustom ? 'block' : 'none'}; flex: 0.8;">
              <label class="form-label">Largura Rolo (cm)</label>
              <input type="number" id="dtfParamLarguraCustom" class="form-input" value="${larguraSalva}" step="1" min="10" max="160">
            </div>
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Largura da Arte (cm)</label>
              <input type="number" id="dtfParamLargura" class="form-input" value="26" step="0.5">
            </div>
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Altura da Arte (cm)</label>
              <input type="number" id="dtfParamAltura" class="form-input" value="8" step="0.5">
            </div>
            <div class="form-group" style="flex: 1.1;">
              <label class="form-label" title="Preço do metro linear da bobina selecionada">Custo Metro Linear (R$)</label>
              <input type="number" id="dtfParamMetro" class="form-input" value="${custoMetroSalvo.toFixed(2)}" step="1.00">
            </div>
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Prensagem Térmica (R$)</label>
              <input type="number" id="dtfParamPrensa" class="form-input" value="${(pdr.dtfPrensagem || 1.50).toFixed(2)}" step="0.20">
            </div>
          </div>
          <div id="boxDtfExplicativo" style="font-size: 11px; padding: 6px 10px; background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 4px; color: var(--text-gray-600); margin-top: 4px; line-height: 1.4;">
            <!-- Preenchido dinamicamente -->
          </div>
        `;

        document.getElementById('dtfParamLarguraRolo')?.addEventListener('change', (e) => {
          const val = e.target.value;
          const grpCustom = document.getElementById('grpDtfLarguraCustom');
          const inpMetro = document.getElementById('dtfParamMetro');
          const currentPdr = carregarPadroesSistema();
          if (val === 'custom') {
            if (grpCustom) grpCustom.style.display = 'block';
          } else {
            if (grpCustom) grpCustom.style.display = 'none';
            if (inpMetro) {
              inpMetro.value = val === '28' 
                ? (currentPdr.dtfMetroLinear28 || 38.00).toFixed(2) 
                : (currentPdr.dtfMetroLinear58 || 60.00).toFixed(2);
            }
          }
          recalcularCustoPersonalizacaoDinamico();
        });

        document.getElementById('dtfParamLarguraCustom')?.addEventListener('input', recalcularCustoPersonalizacaoDinamico);
      } else if (tec === 'Bordado') {
        painel.innerHTML = `
          <div style="font-size: 11.5px; font-weight: 700; margin-bottom: 6px; color: var(--text-primary);">
            Cálculo de Bordado Computadorizado:
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Pontos da Matriz (ex: 8.000)</label>
              <input type="number" id="borParamPontos" class="form-input" value="8000" step="500">
            </div>
            <div class="form-group">
              <label class="form-label">Valor por Mil Pontos (R$)</label>
              <input type="number" id="borParamMilPontos" class="form-input" value="0.45" step="0.05">
            </div>
            <div class="form-group">
              <label class="form-label">Taxa Edição Matriz/Programa (R$)</label>
              <input type="number" id="borParamMatriz" class="form-input" value="45.00" step="5.00">
            </div>
            <div class="form-group">
              <label class="form-label">Aplicação de Entretela (R$)</label>
              <input type="number" id="borParamEntretela" class="form-input" value="1.00" step="0.20">
            </div>
          </div>
        `;
      } else if (tec === 'Silk') {
        painel.innerHTML = `
          <div style="font-size: 11.5px; font-weight: 700; margin-bottom: 6px; color: var(--text-primary);">
            Cálculo Silk Screen (Serigrafia Têxtil):
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Número de Cores / Matrizes</label>
              <input type="number" id="silkParamCores" class="form-input" value="2" min="1" max="8">
            </div>
            <div class="form-group">
              <label class="form-label">Custo Gravação por Tela (R$)</label>
              <input type="number" id="silkParamTela" class="form-input" value="35.00" step="5.00">
            </div>
            <div class="form-group">
              <label class="form-label">Custo Puxada/Batida Unitária (R$)</label>
              <input type="number" id="silkParamBatida" class="form-input" value="1.80" step="0.20">
            </div>
            <div class="form-group">
              <label class="form-label">Tinta Plastisol/Solvente (R$)</label>
              <input type="number" id="silkParamTinta" class="form-input" value="0.90" step="0.10">
            </div>
          </div>
        `;
      } else if (tec === 'Sublimacao') {
        painel.innerHTML = `
          <div style="font-size: 11.5px; font-weight: 700; margin-bottom: 6px; color: var(--text-primary);">
            Cálculo de Sublimação Total Digital:
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Área Estampada (m² por peça)</label>
              <input type="number" id="subParamArea" class="form-input" value="0.85" step="0.05">
            </div>
            <div class="form-group">
              <label class="form-label">Custo Papel + Tinta Sublimática m²</label>
              <input type="number" id="subParamCustoM2" class="form-input" value="9.50" step="0.50">
            </div>
            <div class="form-group">
              <label class="form-label">Custo Calandra / Prensa (R$)</label>
              <input type="number" id="subParamCalandra" class="form-input" value="2.50" step="0.50">
            </div>
          </div>
        `;
      } else {
        painel.innerHTML = `
          <div style="font-size: 11.5px; color: var(--text-gray-500); padding: 4px;">
            Peça Lisa: Custo de personalização zerado (R$ 0,00). O valor do pedido será composto exclusivamente pela matéria-prima, corte, costura e acabamento.
          </div>
        `;
      }

      // Adiciona listeners para recalcular custo de estampa
      painel.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', recalcularCustoPersonalizacaoDinamico);
      });

      recalcularCustoPersonalizacaoDinamico();
    }

    function recalcularCustoPersonalizacaoDinamico() {
      const inputCustoEstampa = document.getElementById('inputCustoEstampa');
      if (!inputCustoEstampa) return;

      const pp = parseInt(document.getElementById('gradePP')?.value || 0, 10);
      const p = parseInt(document.getElementById('gradeP')?.value || 0, 10);
      const m = parseInt(document.getElementById('gradeM')?.value || 0, 10);
      const g = parseInt(document.getElementById('gradeG')?.value || 0, 10);
      const gg = parseInt(document.getElementById('gradeGG')?.value || 0, 10);
      const xg = parseInt(document.getElementById('gradeXG')?.value || 0, 10);
      const totalPecas = Math.max(1, pp + p + m + g + gg + xg);

      let custoUnit = 0;

      if (tecnicaSelecionada === 'DTF') {
        const selLargura = document.getElementById('dtfParamLarguraRolo')?.value || '58';
        let larguraRolo = 58.0;
        if (selLargura === '28') larguraRolo = 28.0;
        else if (selLargura === 'custom') larguraRolo = parseFloat(document.getElementById('dtfParamLarguraCustom')?.value || 58.0);
        else larguraRolo = 58.0;

        const w = parseFloat(document.getElementById('dtfParamLargura')?.value || 26);
        const h = parseFloat(document.getElementById('dtfParamAltura')?.value || 8);
        const metroCusto = parseFloat(document.getElementById('dtfParamMetro')?.value || (larguraRolo === 28 ? 38 : 60));
        const prensa = parseFloat(document.getElementById('dtfParamPrensa')?.value || 1.50);
        
        // Cabimento na largura útil com 5mm de margem entre artes
        const cabemNaLinha = Math.max(1, Math.floor(larguraRolo / (w + 0.5)));
        const linhasPorMetro = 100 / (h + 0.5);
        const artesPorMetro = Math.max(1, cabemNaLinha * linhasPorMetro);
        const custoFilmePorArte = metroCusto / artesPorMetro;
        custoUnit = custoFilmePorArte + prensa;

        const boxDtf = document.getElementById('boxDtfExplicativo');
        if (boxDtf) {
          boxDtf.innerHTML = `
            <strong>📐 Bobina DTF ${larguraRolo}cm útil:</strong> Cabem <strong>${cabemNaLinha} arte(s)</strong> lado a lado na largura (${(cabemNaLinha * (w + 0.5)).toFixed(1)}cm ocupados de ${larguraRolo}cm) × ${linhasPorMetro.toFixed(1)} linhas/m ➔ <strong>~${artesPorMetro.toFixed(0)} artes por metro linear</strong>.<br>
            Filme DTF: <strong>${formatarMoeda(custoFilmePorArte)}</strong> + Prensagem: <strong>${formatarMoeda(prensa)}</strong> = <strong>${formatarMoeda(custoUnit)} / estampa por peça</strong>.
          `;
        }
      } else if (tecnicaSelecionada === 'Bordado') {
        const pontos = parseFloat(document.getElementById('borParamPontos')?.value || 8000);
        const milPontos = parseFloat(document.getElementById('borParamMilPontos')?.value || 0.45);
        const taxaMatriz = parseFloat(document.getElementById('borParamMatriz')?.value || 45.00);
        const entretela = parseFloat(document.getElementById('borParamEntretela')?.value || 1.00);
        
        const custoPontos = (pontos / 1000) * milPontos;
        const amortizacaoMatriz = taxaMatriz / totalPecas;
        custoUnit = custoPontos + amortizacaoMatriz + entretela;
      } else if (tecnicaSelecionada === 'Silk') {
        const cores = parseFloat(document.getElementById('silkParamCores')?.value || 2);
        const taxaTela = parseFloat(document.getElementById('silkParamTela')?.value || 35.00);
        const batida = parseFloat(document.getElementById('silkParamBatida')?.value || 1.80);
        const tinta = parseFloat(document.getElementById('silkParamTinta')?.value || 0.90);
        
        const amortizacaoTelas = (cores * taxaTela) / totalPecas;
        custoUnit = amortizacaoTelas + (cores * batida) + tinta;
      } else if (tecnicaSelecionada === 'Sublimacao') {
        const area = parseFloat(document.getElementById('subParamArea')?.value || 0.85);
        const custoM2 = parseFloat(document.getElementById('subParamCustoM2')?.value || 9.50);
        const calandra = parseFloat(document.getElementById('subParamCalandra')?.value || 2.50);
        custoUnit = (area * custoM2) + calandra;
      } else {
        custoUnit = 0;
      }

      inputCustoEstampa.value = custoUnit.toFixed(2);
      recalcularBenchmarkModal();
    }

    // Configuração dos tabs de técnica
    document.querySelectorAll('.tecnica-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.tecnica-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const tec = pill.getAttribute('data-tecnica');
        atualizarPainelTecnica(tec);
      });
    });

    // Atualização e cálculo de Prazos em tempo real
    function atualizarLabelsPrazos() {
      const diasCli = parseInt(document.getElementById('inputPrazoClienteDias')?.value || 15, 10);
      const diasInt = parseInt(document.getElementById('inputPrazoInternoDias')?.value || 10, 10);

      const lblCli = document.getElementById('labelDataEntregaCliente');
      if (lblCli) {
        lblCli.textContent = `📅 Previsão Entrega Cliente: ${calcularDataFuturaDiasUteis(diasCli)} (${diasCli} dias úteis)`;
      }

      const lblInt = document.getElementById('labelDataMetaInterna');
      if (lblInt) {
        const folga = diasCli - diasInt;
        lblInt.textContent = `🏭 Meta Interna Fábrica: ${calcularDataFuturaDiasUteis(diasInt)} (${diasInt} dias úteis${folga > 0 ? ` • ${folga}d de folga` : ''})`;
      }
    }

    document.getElementById('inputPrazoClienteDias')?.addEventListener('input', atualizarLabelsPrazos);
    document.getElementById('inputPrazoInternoDias')?.addEventListener('input', atualizarLabelsPrazos);

    document.querySelectorAll('.btn-prazo-cli-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const dias = btn.getAttribute('data-dias');
        const inp = document.getElementById('inputPrazoClienteDias');
        if (inp) {
          inp.value = dias;
          atualizarLabelsPrazos();
        }
      });
    });

    document.querySelectorAll('.btn-prazo-int-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const dias = btn.getAttribute('data-dias');
        const inp = document.getElementById('inputPrazoInternoDias');
        if (inp) {
          inp.value = dias;
          atualizarLabelsPrazos();
        }
      });
    });

    // Salvar prazos como padrão
    document.getElementById('btnSalvarPrazosPadrao')?.addEventListener('click', () => {
      const diasCli = parseInt(document.getElementById('inputPrazoClienteDias')?.value || 15, 10);
      const diasInt = parseInt(document.getElementById('inputPrazoInternoDias')?.value || 10, 10);
      salvarPadroesSistema({
        prazoPedidoDias: diasCli,
        prazoInternoDias: diasInt
      });
      mostrarToast(`⭐ Prazos padrão atualizados: ${diasCli} dias (Cliente) / ${diasInt} dias (Fábrica).`, 'green');
    });

    // Salvar todos os custos e parâmetros como padrão do usuário
    document.getElementById('btnSalvarCustosPadrao')?.addEventListener('click', () => {
      const custoTec = parseFloat(document.getElementById('inputCustoTecido')?.value || 48.50);
      const consumo = parseFloat(document.getElementById('inputConsumoTecido')?.value || 0.28);
      const margemErro = parseFloat(document.getElementById('inputMargemErroTecido')?.value || 8.0);
      const aviamento = parseFloat(document.getElementById('inputCustoAviamento')?.value || 4.80);
      const costura = parseFloat(document.getElementById('inputCustoCostura')?.value || 7.50);
      const diasCli = parseInt(document.getElementById('inputPrazoClienteDias')?.value || 15, 10);
      const diasInt = parseInt(document.getElementById('inputPrazoInternoDias')?.value || 10, 10);
      
      const selLargura = document.getElementById('dtfParamLarguraRolo')?.value || '58';
      let larguraRolo = 58;
      if (selLargura === '28') larguraRolo = 28;
      else if (selLargura === 'custom') larguraRolo = parseFloat(document.getElementById('dtfParamLarguraCustom')?.value || 58);

      const dtfMetro = parseFloat(document.getElementById('dtfParamMetro')?.value || 60.00);
      const dtfPrensa = parseFloat(document.getElementById('dtfParamPrensa')?.value || 1.50);

      const updateObj = {
        custoTecidoKg: custoTec,
        consumoTecido: consumo,
        margemErroTecido: margemErro,
        custoAviamento: aviamento,
        custoCostura: costura,
        prazoPedidoDias: diasCli,
        prazoInternoDias: diasInt,
        dtfLarguraRolo: larguraRolo,
        dtfPrensagem: dtfPrensa
      };

      if (larguraRolo === 28) {
        updateObj.dtfMetroLinear28 = dtfMetro;
      } else {
        updateObj.dtfMetroLinear58 = dtfMetro;
      }

      salvarPadroesSistema(updateObj);
      mostrarToast('⭐ Padrões salvos com sucesso! Novos orçamentos e pedidos já carregarão automaticamente com estes custos, margem de erro, costura e DTF.', 'green');
    });

    // Restaurar padrões
    document.getElementById('btnRestaurarCustosPadrao')?.addEventListener('click', () => {
      const pdr = carregarPadroesSistema();
      const inpCustoTec = document.getElementById('inputCustoTecido');
      if (inpCustoTec) inpCustoTec.value = pdr.custoTecidoKg.toFixed(2);
      const inpConsumo = document.getElementById('inputConsumoTecido');
      if (inpConsumo) inpConsumo.value = pdr.consumoTecido.toFixed(2);
      const inpMargemErro = document.getElementById('inputMargemErroTecido');
      if (inpMargemErro) inpMargemErro.value = pdr.margemErroTecido.toFixed(1);
      const inpAviamento = document.getElementById('inputCustoAviamento');
      if (inpAviamento) inpAviamento.value = pdr.custoAviamento.toFixed(2);
      const inpCostura = document.getElementById('inputCustoCostura');
      if (inpCostura) inpCostura.value = pdr.custoCostura.toFixed(2);
      const inpDiasCli = document.getElementById('inputPrazoClienteDias');
      if (inpDiasCli) inpDiasCli.value = pdr.prazoPedidoDias;
      const inpDiasInt = document.getElementById('inputPrazoInternoDias');
      if (inpDiasInt) inpDiasInt.value = pdr.prazoInternoDias;
      atualizarLabelsPrazos();
      recalcularBenchmarkModal();
      mostrarToast('Padrões restaurados nos campos.', 'blue');
    });

    // Eventos de Cadastro Inline (Clientes e Modelos)
    document.getElementById('btnCadastrarClienteInline')?.addEventListener('click', () => {
      abrirModalNovoClienteInline((novoCli) => {
        const sel = document.getElementById('orcClienteSelect');
        if (sel) {
          const opt = document.createElement('option');
          opt.value = novoCli.id;
          opt.textContent = `${novoCli.nomeFantasia} • ${formatarTelefone(novoCli.telefone)} (${novoCli.cidade}/${novoCli.uf})`;
          opt.selected = true;
          sel.prepend(opt);
          if (!mockupUploadPersonalizado) {
            const prodId = document.getElementById('orcProdutoSelect')?.value;
            const pObj = db.produtosBase.find(pr => pr.id === prodId) || db.produtosBase[0];
            mockupOrcamentoUrl = window.ERP_MOCKUPS.gerarMockupSvg(pObj.nome, "#1e3a8a", "#ffffff", novoCli.nomeFantasia.substring(0, 6));
            const prev = document.getElementById('previewMockup3x4Orc');
            if (prev) prev.src = mockupOrcamentoUrl;
          }
        }
      });
    });

    document.getElementById('btnCadastrarModeloInline')?.addEventListener('click', () => {
      abrirModalNovoModeloInline((novoMod) => {
        const sel = document.getElementById('orcProdutoSelect');
        if (sel) {
          const opt = document.createElement('option');
          opt.value = novoMod.id;
          opt.textContent = `${novoMod.nome} [${novoMod.tipoMalhaPadrao}]`;
          opt.selected = true;
          sel.prepend(opt);
          document.getElementById('inputCustoCostura').value = novoMod.custoMaoDeObraBase.toFixed(2);
          const inpConsumo = document.getElementById('inputConsumoTecido');
          if (inpConsumo) inpConsumo.value = (novoMod.consumoMalhaKgPorPeca || 0.28).toFixed(2);
          if (!mockupUploadPersonalizado) {
            const cliId = document.getElementById('orcClienteSelect')?.value;
            const cli = (db.clientes || []).find(c => c.id === cliId) || (db.clientes && db.clientes[0]);
            const sigla = (cli ? (cli.nomeFantasia || cli.nome || cli.razaoSocial || "TEXPRO") : "TEXPRO").toString().substring(0, 6);
            mockupOrcamentoUrl = window.ERP_MOCKUPS.gerarMockupSvg(novoMod.nome, "#1e3a8a", "#ffffff", sigla);
            const prev = document.getElementById('previewMockup3x4Orc');
            if (prev) prev.src = mockupOrcamentoUrl;
          }
          recalcularBenchmarkModal();
        }
      });
    });

    // Mudança de modelo textil
    document.getElementById('orcProdutoSelect')?.addEventListener('change', () => {
      const produtoId = document.getElementById('orcProdutoSelect')?.value;
      const prod = db.produtosBase.find(pr => pr.id === produtoId) || db.produtosBase[0];
      const inpConsumo = document.getElementById('inputConsumoTecido');
      if (inpConsumo && prod) {
        inpConsumo.value = (prod.consumoMalhaKgPorPeca || 0.28).toFixed(2);
      }
      const inpCostura = document.getElementById('inputCustoCostura');
      if (inpCostura && prod && prod.custoMaoDeObraBase) {
        inpCostura.value = prod.custoMaoDeObraBase.toFixed(2);
      }
      if (!mockupUploadPersonalizado) {
        const cliId = document.getElementById('orcClienteSelect')?.value;
        const cli = (db.clientes || []).find(c => c.id === cliId) || (db.clientes && db.clientes[0]);
        const sigla = (cli ? (cli.nomeFantasia || cli.nome || cli.razaoSocial || "TEXPRO") : "TEXPRO").toString().substring(0, 6);
        mockupOrcamentoUrl = window.ERP_MOCKUPS.gerarMockupSvg(prod.nome, "#1e3a8a", "#ffffff", sigla);
        const prev = document.getElementById('previewMockup3x4Orc');
        if (prev) prev.src = mockupOrcamentoUrl;
      }
      recalcularBenchmarkModal();
    });

    // Mudança de cliente
    document.getElementById('orcClienteSelect')?.addEventListener('change', () => {
      if (!mockupUploadPersonalizado) {
        const cliId = document.getElementById('orcClienteSelect')?.value;
        const cli = (db.clientes || []).find(c => c.id === cliId) || (db.clientes && db.clientes[0]);
        const sigla = (cli ? (cli.nomeFantasia || cli.nome || cli.razaoSocial || "TEXPRO") : "TEXPRO").toString().substring(0, 6);
        const prodId = document.getElementById('orcProdutoSelect')?.value;
        const prod = db.produtosBase.find(pr => pr.id === prodId) || db.produtosBase[0];
        mockupOrcamentoUrl = window.ERP_MOCKUPS.gerarMockupSvg(prod.nome, "#1e3a8a", "#ffffff", sigla);
        const prev = document.getElementById('previewMockup3x4Orc');
        if (prev) prev.src = mockupOrcamentoUrl;
      }
    });

    // Recálculo da Engenharia Têxtil, Viabilidade e Rendimento em Tempo Real
    function recalcularBenchmarkModal() {
      const pp = parseInt(document.getElementById('gradePP')?.value || 0, 10);
      const p = parseInt(document.getElementById('gradeP')?.value || 0, 10);
      const m = parseInt(document.getElementById('gradeM')?.value || 0, 10);
      const g = parseInt(document.getElementById('gradeG')?.value || 0, 10);
      const gg = parseInt(document.getElementById('gradeGG')?.value || 0, 10);
      const xg = parseInt(document.getElementById('gradeXG')?.value || 0, 10);
      const totalPecas = pp + p + m + g + gg + xg;

      const inpTotal = document.getElementById('gradeTotal');
      if (inpTotal) inpTotal.value = totalPecas;

      const custoTecidoKg = parseFloat(document.getElementById('inputCustoTecido')?.value || 48.50);
      const consumoBase = parseFloat(document.getElementById('inputConsumoTecido')?.value || 0.28);
      const margemErro = parseFloat(document.getElementById('inputMargemErroTecido')?.value || 8.0);
      const custoAviamento = parseFloat(document.getElementById('inputCustoAviamento')?.value || 4.80);
      const custoEstampa = parseFloat(document.getElementById('inputCustoEstampa')?.value || 0);
      const custoCostura = parseFloat(document.getElementById('inputCustoCostura')?.value || 7.50);
      const precoPretendido = parseFloat(document.getElementById('inputPrecoPretendido')?.value || 54.00);
      const margemDesejada = parseFloat(document.getElementById('inputMargemDesejada')?.value || 30.0);
      const aliquotaImposto = parseFloat(document.getElementById('inputAliquotaImposto')?.value || 6.5);

      const prodId = document.getElementById('orcProdutoSelect')?.value || 'PROD-001';

      // Cálculo de Rendimento e Custo de Malha com Margem de Erro
      const consumoRealComPerda = consumoBase * (1 + (margemErro / 100));
      const rendimentoPecasPorKg = consumoRealComPerda > 0 ? (1 / consumoRealComPerda) : 0;
      const custoTecidoUnitario = custoTecidoKg * consumoRealComPerda;
      const totalKgTecido = totalPecas * consumoRealComPerda;

      const boxRendimento = document.getElementById('boxRendimentoTecido');
      if (boxRendimento) {
        boxRendimento.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="color: var(--text-primary); font-size: 12px; display: flex; align-items: center; gap: 5px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
              Engenharia Têxtil: Rendimento & Custo do Tecido por Peça:
            </strong>
            <span class="status-pill status-gray" style="font-size: 10px; font-weight: 700;">Margem de Perda: ${margemErro.toFixed(1)}%</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 11.5px;">
            <div>
              <span style="color: var(--text-gray-500); display: block; font-size: 10px;">Consumo c/ Margem:</span>
              <strong style="color: var(--text-primary);">${consumoRealComPerda.toFixed(3)} kg/un</strong>
              <span style="font-size: 9.5px; color: var(--text-gray-400); display: block;">Base: ${consumoBase.toFixed(2)} + ${margemErro}%</span>
            </div>
            <div>
              <span style="color: var(--text-gray-500); display: block; font-size: 10px;">Rendimento do Tecido:</span>
              <strong style="color: var(--color-green);">${rendimentoPecasPorKg.toFixed(2)} peças / kg</strong>
              <span style="font-size: 9.5px; color: var(--text-gray-400); display: block;">de malha acabada</span>
            </div>
            <div>
              <span style="color: var(--text-gray-500); display: block; font-size: 10px;">Custo Malha por Peça:</span>
              <strong style="color: #1e40af; font-size: 13px;">${formatarMoeda(custoTecidoUnitario)}</strong>
              <span style="font-size: 9.5px; color: var(--text-gray-400); display: block;">@ ${formatarMoeda(custoTecidoKg)}/kg</span>
            </div>
            <div>
              <span style="color: var(--text-gray-500); display: block; font-size: 10px;">Consumo Total Pedido:</span>
              <strong style="color: var(--text-primary);">${totalPecas > 0 ? `${totalKgTecido.toFixed(2)} kg` : '0.00 kg'}</strong>
              <span style="font-size: 9.5px; color: var(--text-gray-400); display: block;">${totalPecas} peças na grade</span>
            </div>
          </div>
          ${totalPecas === 0 ? `
            <div style="margin-top: 8px; padding: 6px 8px; background: #fffbeb; border: 1px dashed #fde68a; border-radius: 4px; font-size: 10.5px; color: #92400e;">
              ℹ️ <strong>Grade zerada:</strong> Digite a distribuição de tamanhos (PP, P, M, G, GG, XG) acima para calcular o pedido completo.
            </div>
          ` : ''}
        `;
      }

      // Benchmark e Viabilidade Financeira (usa quantidade real ou 1 para simulação de custos unitários)
      const qtdCalculo = Math.max(1, totalPecas);
      const viabilidade = window.MarketBenchmark ? window.MarketBenchmark.calcularViabilidadeOrcamento({
        produtoId: prodId,
        quantidade: qtdCalculo,
        custoTecidoKgOuMetro: custoTecidoKg,
        consumoPorPeca: consumoBase,
        margemErroTecidoPercentual: margemErro,
        custoAviamentosTotal: custoAviamento,
        custoPersonalizacaoUnitario: custoEstampa,
        custoMaoDeObraCostura: custoCostura,
        custoEmbalagemEtiqueta: 1.50,
        aliquotaImpostoPercentual: aliquotaImposto,
        margemDesejadaPercentual: margemDesejada,
        precoVendaPretendido: precoPretendido
      }) : {
        custoProducaoUnitario: custoTecidoUnitario + custoAviamento + custoEstampa + custoCostura + 1.50,
        precoSugeridoCalculado: precoPretendido,
        margemLiquidaReal: 25.0,
        lucroLiquidoUnitario: precoPretendido * 0.25,
        statusTexto: 'VIÁVEL (Padrão)',
        classeCor: 'status-green',
        mercado: { min: 10, max: 100, precoMedioBrasil: precoPretendido },
        recomendacao: 'Valores calculados conforme custo direto de insumos e mão de obra.'
      };

      const painel = document.getElementById('painelBenchmarkResultado');
      if (!painel) return;

      const faturamentoTotalReal = precoPretendido * totalPecas;
      const custoTotalReal = viabilidade.custoProducaoUnitario * totalPecas;
      const lucroTotalReal = viabilidade.lucroLiquidoUnitario * totalPecas;

      painel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="status-pill ${viabilidade.classeCor}" style="font-size: 12px; padding: 4px 10px; font-weight: 800;">
              ${viabilidade.statusTexto}
            </span>
            <span style="font-size: 11px; color: var(--text-gray-500);">
              ${totalPecas > 0 ? `Pedido de <strong>${totalPecas} peças</strong>` : `Simulação unitária (Grade zerada)`}
            </span>
          </div>
          <div style="font-size: 11px; color: var(--text-gray-600); text-align: right;">
            Preço Médio Brasil (Faixa ${viabilidade.mercado.min}-${viabilidade.mercado.max} pçs): <strong>${formatarMoeda(viabilidade.mercado.precoMedioBrasil)}</strong>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 12px;">
          <div class="card" style="padding: 10px; margin: 0; background: #f8fafc; border: 1px solid var(--border-medium);">
            <span style="font-size: 10px; color: var(--text-gray-500); text-transform: uppercase;">Custo Direto Produção</span>
            <div class="text-mono" style="font-size: 14px; font-weight: 800; color: var(--text-primary); margin-top: 2px;">
              ${formatarMoeda(viabilidade.custoProducaoUnitario)}
            </div>
            <span style="font-size: 9.5px; color: var(--text-gray-400);">por peça acabada</span>
          </div>

          <div class="card" style="padding: 10px; margin: 0; background: #f8fafc; border: 1px solid var(--border-medium);">
            <span style="font-size: 10px; color: var(--text-gray-500); text-transform: uppercase;">Preço de Venda Unitário</span>
            <div class="text-mono" style="font-size: 14px; font-weight: 800; color: #1e40af; margin-top: 2px;">
              ${formatarMoeda(precoPretendido)}
            </div>
            <span style="font-size: 9.5px; color: var(--text-gray-400);">Sugerido: ${formatarMoeda(viabilidade.precoSugeridoCalculado)}</span>
          </div>

          <div class="card" style="padding: 10px; margin: 0; background: #f8fafc; border: 1px solid var(--border-medium);">
            <span style="font-size: 10px; color: var(--text-gray-500); text-transform: uppercase;">Margem Líquida Real</span>
            <div class="text-mono" style="font-size: 14px; font-weight: 800; color: ${viabilidade.margemLiquidaReal >= 20 ? 'var(--color-green)' : viabilidade.margemLiquidaReal >= 10 ? '#d97706' : 'var(--color-red)'}; margin-top: 2px;">
              ${viabilidade.margemLiquidaReal.toFixed(1)}%
            </div>
            <span style="font-size: 9.5px; color: var(--text-gray-400);">${formatarMoeda(viabilidade.lucroLiquidoUnitario)} lucro/pç</span>
          </div>

          <div class="card" style="padding: 10px; margin: 0; background: #f0fdf4; border: 1px solid #bbf7d0;">
            <span style="font-size: 10px; color: #166534; text-transform: uppercase; font-weight: 700;">
              ${totalPecas > 0 ? 'Lucro Líquido do Pedido' : 'Valor Total do Pedido'}
            </span>
            <div class="text-mono" style="font-size: 15px; font-weight: 800; color: #166534; margin-top: 2px;">
              ${totalPecas > 0 ? formatarMoeda(lucroTotalReal) : 'R$ 0,00'}
            </div>
            <span style="font-size: 9.5px; color: #15803d;">
              ${totalPecas > 0 ? `Faturamento: ${formatarMoeda(faturamentoTotalReal)}` : 'Preencha a grade'}
            </span>
          </div>
        </div>

        <div style="font-size: 11px; padding: 8px 12px; background: #ffffff; border: 1px solid var(--border-medium); border-radius: var(--radius-sm); color: var(--text-gray-600); line-height: 1.4;">
          <strong>Diagnóstico Industrial:</strong> ${viabilidade.recomendacao}
        </div>
      `;
    }

    // Coleta dos dados do formulário com validações
    function coletarDadosOrcamentoModal() {
      const pp = parseInt(document.getElementById('gradePP')?.value || 0, 10);
      const p = parseInt(document.getElementById('gradeP')?.value || 0, 10);
      const m = parseInt(document.getElementById('gradeM')?.value || 0, 10);
      const g = parseInt(document.getElementById('gradeG')?.value || 0, 10);
      const gg = parseInt(document.getElementById('gradeGG')?.value || 0, 10);
      const xg = parseInt(document.getElementById('gradeXG')?.value || 0, 10);
      const totalPecas = pp + p + m + g + gg + xg;

      if (totalPecas <= 0) {
        mostrarToast('Por favor, informe a quantidade de peças na grade de tamanhos (PP a XG).', 'red');
        const boxGrade = document.getElementById('boxGradeTableInput') || document.querySelector('.grade-table-input');
        if (boxGrade) {
          boxGrade.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.45)';
          boxGrade.style.transition = 'box-shadow 0.2s ease';
          setTimeout(() => {
            boxGrade.style.boxShadow = '';
          }, 3000);
        }
        const inpM = document.getElementById('gradeM') || document.getElementById('gradeP') || document.getElementById('gradePP');
        if (inpM) {
          inpM.focus();
          inpM.select();
        }
        return null;
      }

      const clienteId = document.getElementById('orcClienteSelect')?.value;
      const cliente = db.clientes.find(c => c.id === clienteId) || db.clientes[0];

      const prodId = document.getElementById('orcProdutoSelect')?.value;
      const prod = db.produtosBase.find(pr => pr.id === prodId) || db.produtosBase[0];

      const corPrincipal = (document.getElementById('orcCorPrincipalTecido')?.value || 'A Definir').trim();
      const observacoesCoresDetalhes = (document.getElementById('orcObservacoesCoresDetalhes')?.value || '').trim();

      const custoTecido = parseFloat(document.getElementById('inputCustoTecido')?.value || 48.50);
      const consumoTecido = parseFloat(document.getElementById('inputConsumoTecido')?.value || 0.28);
      const margemErroTecido = parseFloat(document.getElementById('inputMargemErroTecido')?.value || 8.0);
      const custoAviamento = parseFloat(document.getElementById('inputCustoAviamento')?.value || 4.80);
      const custoEstampa = parseFloat(document.getElementById('inputCustoEstampa')?.value || 0);
      const custoCostura = parseFloat(document.getElementById('inputCustoCostura')?.value || 7.50);
      const precoVendaUnitario = parseFloat(document.getElementById('inputPrecoPretendido')?.value || 54.00);
      const margemDesejada = parseFloat(document.getElementById('inputMargemDesejada')?.value || 30.0);
      const aliquotaImposto = parseFloat(document.getElementById('inputAliquotaImposto')?.value || 6.5);

      const prazoClienteDias = parseInt(document.getElementById('inputPrazoClienteDias')?.value || 15, 10);
      const prazoInternoDias = parseInt(document.getElementById('inputPrazoInternoDias')?.value || 10, 10);
      const dataEntregaCliente = calcularDataFuturaDiasUteis(prazoClienteDias);
      const dataMetaInterna = calcularDataFuturaDiasUteis(prazoInternoDias);

      const selLargura = document.getElementById('dtfParamLarguraRolo')?.value || '58';
      let larguraRolo = 58;
      if (selLargura === '28') larguraRolo = 28;
      else if (selLargura === 'custom') larguraRolo = parseFloat(document.getElementById('dtfParamLarguraCustom')?.value || 58);

      const viabilidade = window.MarketBenchmark ? window.MarketBenchmark.calcularViabilidadeOrcamento({
        produtoId: prod.id,
        quantidade: totalPecas,
        custoTecidoKgOuMetro: custoTecido,
        consumoPorPeca: consumoTecido,
        margemErroTecidoPercentual: margemErroTecido,
        custoAviamentosTotal: custoAviamento,
        custoPersonalizacaoUnitario: custoEstampa,
        custoMaoDeObraCostura: custoCostura,
        custoEmbalagemEtiqueta: 1.50,
        aliquotaImpostoPercentual: aliquotaImposto,
        margemDesejadaPercentual: margemDesejada,
        precoVendaPretendido: precoVendaUnitario
      }) : {
        custoProducaoUnitario: 24.50,
        custoTecidoUnitario: custoTecido * consumoTecido * 1.08,
        consumoRealComPerda: consumoTecido * 1.08,
        lucroLiquidoUnitario: precoVendaUnitario * 0.25,
        margemLiquidaReal: 25.0
      };

      return {
        cliente,
        prod,
        corPrincipal,
        observacoesCoresDetalhes,
        grade: { pp, p, m, g, gg, xg, total: totalPecas },
        precoVendaUnitario,
        valorTotal: precoVendaUnitario * totalPecas,
        custoTotal: viabilidade.custoProducaoUnitario * totalPecas,
        custoUnitario: viabilidade.custoProducaoUnitario,
        custoTecidoPorPeca: viabilidade.custoTecidoUnitario,
        consumoRealComPerda: viabilidade.consumoRealComPerda,
        margemErroTecido: margemErroTecido,
        lucroLiquido: viabilidade.lucroLiquidoUnitario * totalPecas,
        margem: viabilidade.margemLiquidaReal,
        prazoPedidoDias: prazoClienteDias,
        prazoInternoDias: prazoInternoDias,
        dataPrevisaoEntrega: dataEntregaCliente,
        dataMetaInterna: dataMetaInterna,
        dtfLarguraRolo: larguraRolo,
        mockupUrl: mockupOrcamentoUrl
      };
    }

    // Inputs que disparam recálculo em tempo real
    const inputsRecalculo = [
      'gradePP', 'gradeP', 'gradeM', 'gradeG', 'gradeGG', 'gradeXG',
      'inputCustoTecido', 'inputConsumoTecido', 'inputMargemErroTecido',
      'inputCustoAviamento', 'inputCustoEstampa', 'inputCustoCostura',
      'inputPrecoPretendido', 'inputMargemDesejada', 'inputAliquotaImposto'
    ];

    inputsRecalculo.forEach(id => {
      document.getElementById(id)?.addEventListener('input', recalcularBenchmarkModal);
      document.getElementById(id)?.addEventListener('change', recalcularBenchmarkModal);
    });

    // Configura o seletor industrial de cores e atualiza mockup em tempo real
    configurarEventosSeletorCores('orc', (corNome, corHex) => {
      if (!mockupUploadPersonalizado) {
        const prodId = document.getElementById('orcProdutoSelect')?.value;
        const pObj = db.produtosBase.find(pr => pr.id === prodId) || db.produtosBase[0];
        const cliId = document.getElementById('orcClienteSelect')?.value;
        const cObj = (db.clientes || []).find(c => c.id === cliId) || (db.clientes && db.clientes[0]);
        const sigla = (cObj ? (cObj.nomeFantasia || cObj.nome || cObj.razaoSocial || "TEXPRO") : "TEXPRO").toString().substring(0, 6);
        mockupOrcamentoUrl = window.ERP_MOCKUPS.gerarMockupSvg(pObj.nome, corHex, "#ffffff", sigla);
        const prev = document.getElementById('previewMockup3x4Orc');
        if (prev) prev.src = mockupOrcamentoUrl;
      }
    });

    // Inicializa datas e painel DTF
    atualizarLabelsPrazos();
    atualizarPainelTecnica('DTF');

    // Eventos dos botões de preenchimento rápido de grade
    document.querySelectorAll('.btn-grade-rapida').forEach(btn => {
      btn.addEventListener('click', () => {
        const dist = (btn.getAttribute('data-dist') || '').split(',').map(n => parseInt(n, 10) || 0);
        const campos = ['gradePP', 'gradeP', 'gradeM', 'gradeG', 'gradeGG', 'gradeXG'];
        campos.forEach((id, idx) => {
          const el = document.getElementById(id);
          if (el) el.value = dist[idx] || 0;
        });
        recalcularBenchmarkModal();
      });
    });

    document.getElementById('btnZerarGrade')?.addEventListener('click', () => {
      ['gradePP', 'gradeP', 'gradeM', 'gradeG', 'gradeGG', 'gradeXG'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = 0;
      });
      recalcularBenchmarkModal();
    });

    // Botões de ação do Duplo Fluxo
    document.getElementById('btnSalvarApenasOrcamento')?.addEventListener('click', () => {
      const dadosOrcamento = coletarDadosOrcamentoModal();
      if (!dadosOrcamento) return;
      salvarOrcamentoOuPedido('Orcamento', dadosOrcamento);
    });

    document.getElementById('btnAvancarParaPedidoOficial')?.addEventListener('click', () => {
      const dadosOrcamento = coletarDadosOrcamentoModal();
      if (!dadosOrcamento) return;
      abrirEtapaAvancarPedido(dadosOrcamento);
    });
  }

  // Salvar Orçamento Apenas
  function salvarOrcamentoOuPedido(tipoRegistro, dadosRecebidos = null) {
    let dados = dadosRecebidos;
    if (!dados && typeof coletarDadosOrcamentoModal === 'function') {
      try {
        dados = coletarDadosOrcamentoModal();
      } catch (e) {
        dados = null;
      }
    }
    if (!dados) {
      mostrarToast('Não foi possível coletar os dados do orçamento. Verifique a grade e tente novamente.', 'red');
      return;
    }

    const novoNum = Math.floor(1088 + db.pedidos.length);
    const novoId = tipoRegistro === 'Orcamento' ? `ORC-${novoNum}` : `PED-${novoNum}`;

    const novoRegistro = {
      id: novoId,
      numero: novoNum,
      tipoRegistro: tipoRegistro,
      dataCriacao: new Date().toISOString().split('T')[0],
      clienteId: dados.cliente ? dados.cliente.id : '',
      clienteNome: dados.cliente ? (dados.cliente.nomeFantasia || dados.cliente.nome || dados.cliente.razaoSocial || 'Cliente') : 'Cliente Avulso',
      clienteTelefone: dados.cliente ? dados.cliente.telefone : '',
      status: tipoRegistro === 'Orcamento' ? 'Orcamento' : 'Quarentena',
      etapaProducao: tipoRegistro === 'Orcamento' ? 'Em Negociação' : 'Aguardando Aprovação Técnica',
      produtoId: dados.prod ? dados.prod.id : '',
      produtoNome: dados.prod ? dados.prod.nome : 'Produto',
      corTecido: dados.corPrincipal || 'A Definir',
      observacoesCoresDetalhes: dados.observacoesCoresDetalhes || '',
      tecidoEspecificacao: dados.prod ? dados.prod.tipoMalhaPadrao : 'Padrão Têxtil',
      tipoPersonalizacao: 'Personalização Conforme Proposta',
      mockupUrl: dados.mockupUrl || (window.ERP_MOCKUPS ? window.ERP_MOCKUPS.gerarMockupSvg(dados.prod ? dados.prod.nome : 'Camisa', "#1e3a8a", "#ffffff", (dados.cliente ? (dados.cliente.nomeFantasia || dados.cliente.nome || "TEXPRO") : "TEXPRO").toString().substring(0, 6)) : ''),
      artesAnexadas: [],
      grade: dados.grade,
      precoUnitarioVenda: dados.precoVendaUnitario,
      valorTotalVenda: dados.valorTotal,
      custoTotalEstimado: dados.custoTotal,
      custoTecidoPorPeca: dados.custoTecidoPorPeca,
      consumoRealComPerda: dados.consumoRealComPerda,
      margemErroTecido: dados.margemErroTecido,
      lucroLiquidoEstimado: dados.lucroLiquido,
      margemLucroPercentual: dados.margem,
      condicaoPagamento: '50% Sinal + 50% na Entrega',
      sinalPago: false,
      valorSinalPago: 0,
      saldoPendente: dados.valorTotal,
      prazoPedidoDias: dados.prazoPedidoDias,
      prazoInternoDias: dados.prazoInternoDias,
      dataPrevisaoEntrega: tipoRegistro === 'Orcamento' ? null : dados.dataPrevisaoEntrega,
      dataMetaInterna: tipoRegistro === 'Orcamento' ? null : dados.dataMetaInterna,
      dtfLarguraRolo: dados.dtfLarguraRolo,
      notaFiscalEmitida: false,
      vendedorResponsavel: 'Marcos Paulo'
    };

    db.pedidos.unshift(novoRegistro);
    salvarEstado();
    atualizarBadges();
    fecharModal();
    renderizarPedidos();

    if (tipoRegistro === 'Orcamento') {
      mostrarToast(`Orçamento #${novoRegistro.numero} gerado com sucesso! Abrindo proposta comercial...`, 'green');
      abrirModalPropostaComercial(novoRegistro.id);
    }
  }

  /* ==========================================================================
     ETAPA DE AVANÇO DE PEDIDO: COSTUREIRA, ARTES OBRIGATÓRIAS, MOCKUP 3x4 E SINAL
     ========================================================================== */
  function abrirEtapaAvancarPedido(dadosBase) {
    if (!modalContainer) return;

    let artesBase64 = {
      peito: null,
      costa: null,
      ombro: null,
      outro: null
    };

    let mockupDataUrl = dadosBase.mockupUrl || window.ERP_MOCKUPS.gerarMockupSvg(dadosBase.prod ? dadosBase.prod.nome : dadosBase.produtoNome, "#1e3a8a", "#ffffff", (dadosBase.cliente ? dadosBase.cliente.nomeFantasia : dadosBase.clienteNome).substring(0, 6));

    const totalVenda = dadosBase.valorTotal || dadosBase.valorTotalVenda;
    const sinalSugerido = totalVenda * 0.5;

    const modalEl = criarModalCamada(`
      <div class="modal-overlay active" id="modalAvancarPedidoOverlay">
        <div class="modal-box" style="max-width: 820px;">
          <div class="modal-header">
            <div>
              <div class="modal-title">Entrada Oficial no Pedido • Confecção & Chão de Fábrica</div>
              <span style="font-size: 11px; color: var(--text-gray-500);">Designação de costureira, upload obrigatório de artes em alta qualidade e sincronização de sinal financeiro</span>
            </div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>

          <div class="modal-body">
            <!-- 1. Qual Costureira / Facção vai costurar -->
            <div class="form-group">
              <label class="form-label">
                <strong>Para qual Costureira / Facção vai o pedido?</strong> (Campo Obrigatório)
              </label>
              <div class="inline-input-group">
                <select id="selCostureiraAvanco" class="form-select">
                  ${(db.costureiras && db.costureiras.length > 0) ? db.costureiras.map(c => `
                    <option value="${c.id}">${c.nome} • Resp: ${c.responsavel || c.nome} • Esp: ${c.especialidade || 'Costura'} (${c.status || 'Ativo'})</option>
                  `).join('') : `
                    <option value="" disabled selected>⚠️ Nenhuma costureira cadastrada - Cadastre no botão ao lado</option>
                  `}
                </select>
                <button type="button" class="btn btn-secondary btn-inline-add" id="btnCadastrarCostureiraInline">
                  + Cadastrar Costureira
                </button>
              </div>
            </div>

            <!-- Cores do Uniforme & Especificações de Detalhes Contrastantes -->
            ${gerarHTMLSeletorCoresIndustrial('avanco', dadosBase.corPrincipal || dadosBase.corTecido || 'Azul Marinho', dadosBase.observacoesCoresDetalhes || '')}

            <!-- 2. Artes da Camiseta em Alta Resolução (Checklist com Locais Obrigatórios) -->
            <div class="form-group" style="margin-top: 14px;">
              <label class="form-label">
                <strong>Artes da Peça em Alta Resolução</strong> (Selecione os locais e anexe os arquivos obrigatórios)
              </label>
              
              <div class="art-location-grid">
                <!-- Peito -->
                <div class="art-location-card" id="cardArtePeito">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="chkArtePeito" class="quarentena-checkbox" checked>
                    <label for="chkArtePeito" style="font-weight: 700; font-size: 12.5px; cursor: pointer;">Peito (Frente)</label>
                  </div>
                  <input type="file" id="fileArtePeito" class="form-input" style="font-size: 11px; padding: 4px;" accept="image/*,.pdf,.ai,.pes,.dst">
                  <input type="text" id="dimArtePeito" class="form-input" value="9.0 x 7.5 cm" placeholder="Dimensões (LxA cm)" style="font-size: 11px;">
                </div>

                <!-- Costas -->
                <div class="art-location-card" id="cardArteCostas">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="chkArteCostas" class="quarentena-checkbox">
                    <label for="chkArteCostas" style="font-weight: 700; font-size: 12.5px; cursor: pointer;">Costas</label>
                  </div>
                  <input type="file" id="fileArteCostas" class="form-input" style="font-size: 11px; padding: 4px;" accept="image/*,.pdf,.ai,.pes,.dst">
                  <input type="text" id="dimArteCostas" class="form-input" value="28.0 x 12.0 cm" placeholder="Dimensões (LxA cm)" style="font-size: 11px;">
                </div>

                <!-- Manga / Ombro -->
                <div class="art-location-card" id="cardArteOmbro">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="chkArteOmbro" class="quarentena-checkbox">
                    <label for="chkArteOmbro" style="font-weight: 700; font-size: 12.5px; cursor: pointer;">Ombro / Manga</label>
                  </div>
                  <input type="file" id="fileArteOmbro" class="form-input" style="font-size: 11px; padding: 4px;" accept="image/*,.pdf,.ai,.pes,.dst">
                  <input type="text" id="dimArteOmbro" class="form-input" value="8.0 x 4.0 cm" placeholder="Dimensões (LxA cm)" style="font-size: 11px;">
                </div>

                <!-- Outro Local -->
                <div class="art-location-card" id="cardArteOutro">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="chkArteOutro" class="quarentena-checkbox">
                    <label for="chkArteOutro" style="font-weight: 700; font-size: 12.5px; cursor: pointer;">Outro Local</label>
                  </div>
                  <input type="text" id="descArteOutro" class="form-input" placeholder="Descreva o local (ex: Gola, Barra, Bolso)" style="font-size: 11px;">
                  <input type="file" id="fileArteOutro" class="form-input" style="font-size: 11px; padding: 4px;" accept="image/*,.pdf,.ai,.pes,.dst">
                </div>
              </div>
            </div>

            <!-- 3. Mockup 3x4 Obrigatório -->
            <div class="form-group" style="margin-top: 14px; background: #f8fafc; border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 14px;">
              <label class="form-label" style="font-weight: 800; color: var(--text-primary);">
                Mockup da Camiseta em Proporção 3x4 (Aparecerá na Aba de Pedidos e na Ficha de Corte)
              </label>

              <div style="display: flex; gap: 16px; align-items: center;">
                <div>
                  <img id="previewMockup3x4" src="${mockupDataUrl}" style="width: 75px; height: 100px; aspect-ratio: 3/4; object-fit: contain; border: 1px solid var(--border-medium); border-radius: 4px; background: #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.1);" alt="Preview 3x4">
                  <span style="display: block; font-size: 10px; color: var(--text-gray-500); text-align: center; margin-top: 4px;">Miniatura 3x4</span>
                </div>

                <div style="flex: 1;">
                  <span style="font-size: 12px; color: var(--text-gray-600); display: block; margin-bottom: 6px;">
                    Você pode anexar um mockup pronto fornecido pelo cliente ou utilizar a renderização vetorial industrial de alta fidelidade:
                  </span>
                  
                  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <label class="btn btn-secondary btn-sm" style="cursor: pointer;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      Anexar Imagem Mockup (Arquivo)
                      <input type="file" id="inputUploadMockupReal" accept="image/*" style="display: none;">
                    </label>

                    <button type="button" class="btn btn-secondary btn-sm" id="btnGerarMockupAzul">Polo Marinho</button>
                    <button type="button" class="btn btn-secondary btn-sm" id="btnGerarMockupCinza">Brim Cinza</button>
                    <button type="button" class="btn btn-secondary btn-sm" id="btnGerarMockupBranco">Branco Neve</button>
                    <button type="button" class="btn btn-secondary btn-sm" id="btnGerarMockupPreto">Preto Reativo</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 4. Dados Financeiros & Entrada de Sinal (Valor ou Porcentagem) -->
            <div style="background: #ffffff; border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 14px; margin-top: 14px;">
              <span class="form-label" style="font-weight: 800; color: var(--text-primary); margin-bottom: 8px; display: block;">
                Condições Comerciais, Entrada de Sinal & Saldo Remanescente:
              </span>

              <!-- Atalhos rápidos de porcentagem -->
              <div style="display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; align-items: center;">
                <span style="font-size: 11px; color: var(--text-gray-500);">Atalhos de Entrada:</span>
                <button type="button" class="btn btn-secondary btn-sm btn-quick-entrada" data-perc="0">0% (Sem Entrada)</button>
                <button type="button" class="btn btn-secondary btn-sm btn-quick-entrada" data-perc="30">30% Entrada</button>
                <button type="button" class="btn btn-secondary btn-sm btn-quick-entrada" data-perc="40">40% Entrada</button>
                <button type="button" class="btn btn-secondary btn-sm btn-quick-entrada active" data-perc="50" style="font-weight: 700; color: var(--color-green);">50% Entrada (Padrão)</button>
                <button type="button" class="btn btn-secondary btn-sm btn-quick-entrada" data-perc="100">100% (À Vista Total)</button>
              </div>

              <div class="form-row">
                <div class="form-group" style="flex: 1.2;">
                  <label class="form-label">Valor Total do Pedido (R$)</label>
                  <input type="text" id="finValorTotalPedido" class="form-input text-mono" style="font-weight: 800; font-size: 15px;" value="${formatarMoeda(totalVenda)}" readonly>
                </div>

                <div class="form-group" style="flex: 0.9;">
                  <label class="form-label">Entrada (%)</label>
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <input type="number" id="finPercEntrada" class="form-input text-mono" min="0" max="100" step="5" value="50" style="font-weight: 700; font-size: 15px;">
                    <span style="font-size: 13px; font-weight: 700; color: var(--text-gray-500);">%</span>
                  </div>
                </div>

                <div class="form-group" style="flex: 1.3;">
                  <label class="form-label">Valor da Entrada (R$)</label>
                  <input type="number" id="finValorSinalRecebido" class="form-input text-mono" style="font-weight: 800; font-size: 15px; color: var(--color-green);" value="${sinalSugerido.toFixed(2)}" step="10.00">
                </div>

                <div class="form-group" style="flex: 1.4;">
                  <label class="form-label">Forma de Pagamento</label>
                  <select id="finFormaPagamentoSinal" class="form-select">
                    <option value="PIX">PIX (Banco da Confecção)</option>
                    <option value="Dinheiro">Dinheiro em Espécie</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="TED/Transferência">TED / Transferência Bancária</option>
                    <option value="Boleto 50%">Boleto Bancário</option>
                  </select>
                </div>
              </div>

              <!-- Saldo Remanescente em tempo real -->
              <div id="boxSaldoRemanescenteAvanco" style="margin-top: 10px; padding: 10px 12px; border-radius: var(--radius-sm); font-size: 11.5px; background: #fffbeb; border: 1px solid #fde68a; color: #92400e;">
                <!-- Preenchido dinamicamente via JS -->
              </div>

              <div style="margin-top: 10px; display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" id="chkSinalCompensado" class="quarentena-checkbox" checked>
                <label for="chkSinalCompensado" style="font-size: 11.5px; font-weight: 700; cursor: pointer; color: var(--text-primary);">
                  Confirmar sinal já recebido e lançar entrada imediata no Fluxo de Caixa (Financeiro)
                </label>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.ERP.fecharModal()">Voltar</button>
            <button type="button" class="btn btn-green" id="btnConfirmarSalvarPedidoFinal" style="font-weight: 800;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Confirmar Entrada no Pedido & Gerar OS
            </button>
          </div>
        </div>
      </div>
    `);

    // Leitor de Mockup do Usuário
    const inputUpload = document.getElementById('inputUploadMockupReal');
    inputUpload?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          mockupDataUrl = evt.target.result;
          const prev = document.getElementById('previewMockup3x4');
          if (prev) prev.src = mockupDataUrl;
          mostrarToast('Mockup 3x4 do cliente carregado com sucesso!', 'green');
        };
        reader.readAsDataURL(file);
      }
    });

    // Geradores Rápidos de Cores
    const prodNome = dadosBase.prod ? dadosBase.prod.nome : dadosBase.produtoNome;
    const cliNome = (dadosBase.cliente ? dadosBase.cliente.nomeFantasia : dadosBase.clienteNome);

    document.getElementById('btnGerarMockupAzul')?.addEventListener('click', () => {
      mockupDataUrl = window.ERP_MOCKUPS.gerarMockupSvg(prodNome, "#1e3a8a", "#ffffff", cliNome.substring(0, 6));
      document.getElementById('previewMockup3x4').src = mockupDataUrl;
    });

    document.getElementById('btnGerarMockupCinza')?.addEventListener('click', () => {
      mockupDataUrl = window.ERP_MOCKUPS.gerarMockupSvg("brim", "#475569", "#eab308", cliNome.substring(0, 6));
      document.getElementById('previewMockup3x4').src = mockupDataUrl;
    });

    document.getElementById('btnGerarMockupBranco')?.addEventListener('click', () => {
      mockupDataUrl = window.ERP_MOCKUPS.gerarMockupSvg("jaleco", "#ffffff", "#047857", cliNome.substring(0, 6));
      document.getElementById('previewMockup3x4').src = mockupDataUrl;
    });

    document.getElementById('btnGerarMockupPreto')?.addEventListener('click', () => {
      mockupDataUrl = window.ERP_MOCKUPS.gerarMockupSvg("camiseta", "#0f172a", "#ffffff", cliNome.substring(0, 6));
      document.getElementById('previewMockup3x4').src = mockupDataUrl;
    });

    // Configura o seletor industrial de cores e sincroniza com o mockup 3x4
    configurarEventosSeletorCores('avanco', (corNome, corHex) => {
      const pNome = dadosBase.prod ? dadosBase.prod.nome : dadosBase.produtoNome;
      const cNome = (dadosBase.cliente ? (dadosBase.cliente.nomeFantasia || dadosBase.cliente.nome) : dadosBase.clienteNome);
      mockupDataUrl = window.ERP_MOCKUPS.gerarMockupSvg(pNome, corHex, "#ffffff", (cNome || "TEXPRO").toString().substring(0, 6));
      const prev = document.getElementById('previewMockup3x4');
      if (prev) prev.src = mockupDataUrl;
    });

    // Cadastro de costureira inline
    document.getElementById('btnCadastrarCostureiraInline')?.addEventListener('click', () => {
      abrirModalNovoColaboradorInline((novaCost) => {
        const sel = document.getElementById('selCostureiraAvanco');
        if (sel) {
          const opt = document.createElement('option');
          opt.value = novaCost.id;
          opt.textContent = `${novaCost.nome} • Resp: ${novaCost.responsavel || novaCost.nome} • Esp: ${novaCost.especialidade} (Disponível)`;
          opt.selected = true;
          sel.prepend(opt);
        }
      });
    });

    // Sincronização Dinâmica de Entrada (% vs R$) e Saldo Remanescente no Modal de Avanço
    const inpPercAvanco = document.getElementById('finPercEntrada');
    const inpValorAvanco = document.getElementById('finValorSinalRecebido');
    const boxSaldoAvanco = document.getElementById('boxSaldoRemanescenteAvanco');

    function recalcularSaldoAvanco(origem) {
      if (!inpValorAvanco || !boxSaldoAvanco) return;
      let val = parseFloat(inpValorAvanco.value) || 0;
      if (val < 0) val = 0;

      if (origem === 'perc' && inpPercAvanco) {
        let p = parseFloat(inpPercAvanco.value) || 0;
        if (p < 0) p = 0;
        if (p > 100) p = 100;
        val = (totalVenda * p) / 100;
        inpValorAvanco.value = val.toFixed(2);
      } else if (origem === 'valor' && inpPercAvanco) {
        if (val > totalVenda) val = totalVenda;
        const p = totalVenda > 0 ? (val / totalVenda) * 100 : 0;
        inpPercAvanco.value = p.toFixed(0);
      }

      const remanescente = Math.max(0, totalVenda - val);

      if (remanescente > 0) {
        boxSaldoAvanco.style.backgroundColor = '#fffbeb';
        boxSaldoAvanco.style.border = '1px solid #fde68a';
        boxSaldoAvanco.style.color = '#92400e';
        boxSaldoAvanco.innerHTML = `
          <strong>⚠️ Saldo Remanescente: ${formatarMoeda(remanescente)}</strong>
          <div>Com a entrada de ${formatarMoeda(val)}, faltará <strong>${formatarMoeda(remanescente)}</strong> para quitação do pedido. Este valor continuará como saldo a receber na entrega.</div>
        `;
      } else {
        boxSaldoAvanco.style.backgroundColor = 'var(--bg-green-soft)';
        boxSaldoAvanco.style.border = '1px solid var(--border-green)';
        boxSaldoAvanco.style.color = 'var(--color-green)';
        boxSaldoAvanco.innerHTML = `
          <strong>✅ Quitação Integral (100% Pago)</strong>
          <div>O valor da entrada cobre 100% do pedido. Não haverá saldo remanescente devedor.</div>
        `;
      }
    }

    inpPercAvanco?.addEventListener('input', () => recalcularSaldoAvanco('perc'));
    inpValorAvanco?.addEventListener('input', () => recalcularSaldoAvanco('valor'));
    recalcularSaldoAvanco('perc');

    document.querySelectorAll('.btn-quick-entrada').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-quick-entrada').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const perc = parseFloat(btn.getAttribute('data-perc') || 0);
        if (inpPercAvanco) {
          inpPercAvanco.value = perc;
          recalcularSaldoAvanco('perc');
        }
      });
    });

    // Botão Salvar Pedido Final com Validações Estritas
    document.getElementById('btnConfirmarSalvarPedidoFinal')?.addEventListener('click', () => {
      // 1. Validação da Costureira
      const costureiraId = document.getElementById('selCostureiraAvanco')?.value;
      if (!costureiraId) {
        mostrarToast('Por favor, cadastre ou selecione a Costureira / Facção que confeccionará o pedido.', 'red');
        return;
      }
      const costureiraObj = (db.costureiras || []).find(c => c.id === costureiraId) || db.costureiras[0];
      if (!costureiraObj) {
        mostrarToast('Cadastre ao menos uma costureira no botão "+ Cadastrar Costureira".', 'red');
        return;
      }

      // 2. Validação Obrigatória das Artes
      const chkPeito = document.getElementById('chkArtePeito')?.checked;
      const chkCostas = document.getElementById('chkArteCostas')?.checked;
      const chkOmbro = document.getElementById('chkArteOmbro')?.checked;
      const chkOutro = document.getElementById('chkArteOutro')?.checked;

      if (!chkPeito && !chkCostas && !chkOmbro && !chkOutro) {
        mostrarToast('É obrigatório selecionar ao menos 1 local de aplicação de arte (Peito, Costas, Ombro ou Outro).', 'red');
        return;
      }

      let artesLista = [];

      if (chkPeito) {
        const dim = document.getElementById('dimArtePeito')?.value || '9.0 x 7.5 cm';
        const file = document.getElementById('fileArtePeito')?.files[0];
        artesLista.push({
          local: "Peito Esquerdo",
          tecnica: "Bordado / DTF Peito",
          dimensoes: dim,
          arquivoNome: file ? file.name : "arte_peito_alta_resolucao.pdf"
        });
      }

      if (chkCostas) {
        const dim = document.getElementById('dimArteCostas')?.value || '28.0 x 12.0 cm';
        const file = document.getElementById('fileArteCostas')?.files[0];
        artesLista.push({
          local: "Costas",
          tecnica: "DTF / Silk Costas",
          dimensoes: dim,
          arquivoNome: file ? file.name : "arte_costas_vetor.ai"
        });
      }

      if (chkOmbro) {
        const dim = document.getElementById('dimArteOmbro')?.value || '8.0 x 4.0 cm';
        const file = document.getElementById('fileArteOmbro')?.files[0];
        artesLista.push({
          local: "Manga / Ombro",
          tecnica: "Aplicação Manga",
          dimensoes: dim,
          arquivoNome: file ? file.name : "logo_manga_patrocinio.png"
        });
      }

      if (chkOutro) {
        const desc = document.getElementById('descArteOutro')?.value;
        if (!desc) {
          mostrarToast('Por favor, descreva qual é o outro local da arte selecionada.', 'red');
          return;
        }
        const file = document.getElementById('fileArteOutro')?.files[0];
        artesLista.push({
          local: desc,
          tecnica: "Personalização Especial",
          dimensoes: "Conforme Especificação",
          arquivoNome: file ? file.name : "arte_especial_alta_res.pdf"
        });
      }

      // 3. Validação dos Valores e Sinal Recebido
      const valorSinalRecebido = parseFloat(document.getElementById('finValorSinalRecebido')?.value || 0);
      const percEntrada = parseFloat(document.getElementById('finPercEntrada')?.value || 0);
      const formaPagamento = document.getElementById('finFormaPagamentoSinal')?.value || 'PIX';
      const sinalCompensado = document.getElementById('chkSinalCompensado')?.checked !== false;

      if (isNaN(valorSinalRecebido) || valorSinalRecebido < 0) {
        mostrarToast('Por favor, informe um valor de sinal válido.', 'red');
        return;
      }

      const clienteNomeFinal = dadosBase.cliente ? dadosBase.cliente.nomeFantasia : dadosBase.clienteNome;
      const clienteTelFinal = dadosBase.cliente ? dadosBase.cliente.telefone : dadosBase.clienteTelefone;
      const clienteIdFinal = dadosBase.cliente ? dadosBase.cliente.id : dadosBase.clienteId;
      const prodNomeFinal = dadosBase.prod ? dadosBase.prod.nome : dadosBase.produtoNome;
      const prodIdFinal = dadosBase.prod ? dadosBase.prod.id : dadosBase.produtoId;
      const gradeFinal = dadosBase.grade;
      const precoUnitFinal = dadosBase.precoVendaUnitario || dadosBase.precoUnitarioVenda;
      const totalVendaFinal = totalVenda;
      const custoTotalFinal = dadosBase.custoTotal || dadosBase.custoTotalEstimado;
      const lucroFinal = dadosBase.lucroLiquido || dadosBase.lucroLiquidoEstimado;
      const margemFinal = dadosBase.margem || dadosBase.margemLucroPercentual;

      const novoNum = dadosBase.numero || Math.floor(1088 + db.pedidos.length);
      const novoId = `PED-${novoNum}`;

      const valorEfetivoPago = (sinalCompensado && valorSinalRecebido > 0) ? valorSinalRecebido : 0;
      const saldoRestante = Math.max(0, totalVendaFinal - valorEfetivoPago);
      const isQuitadoNaEntrada = valorEfetivoPago >= totalVendaFinal;

      const corFinal = (document.getElementById('avancoCorPrincipalTecido')?.value || dadosBase.corPrincipal || dadosBase.corTecido || 'A Definir').trim();
      const obsCoresFinal = (document.getElementById('avancoObservacoesCoresDetalhes')?.value || dadosBase.observacoesCoresDetalhes || '').trim();

      // Cria ou atualiza pedido oficial
      const pedidoOficial = {
        id: novoId,
        numero: novoNum,
        tipoRegistro: "Pedido",
        dataCriacao: new Date().toISOString().split('T')[0],
        clienteId: clienteIdFinal,
        clienteNome: clienteNomeFinal,
        clienteTelefone: clienteTelFinal,
        status: "Quarentena", // Vai para quarentena para aprovação administrativa obrigatória
        etapaProducao: "Aguardando Aprovação Técnica",
        quarentenaAprovada: false,
        produtoId: prodIdFinal,
        produtoNome: prodNomeFinal,
        corTecido: corFinal,
        observacoesCoresDetalhes: obsCoresFinal,
        tecidoEspecificacao: dadosBase.prod ? dadosBase.prod.tipoMalhaPadrao : "Conforme Ficha",
        tipoPersonalizacao: artesLista.map(a => a.local).join(' + '),
        costureiraId: costureiraObj.id,
        costureiraNome: costureiraObj.nome,
        mockupUrl: mockupDataUrl,
        artesAnexadas: artesLista,
        grade: gradeFinal,
        precoUnitarioVenda: precoUnitFinal,
        valorTotalVenda: totalVendaFinal,
        custoTotalEstimado: custoTotalFinal,
        lucroLiquidoEstimado: lucroFinal,
        margemLucroPercentual: margemFinal,
        condicaoPagamento: isQuitadoNaEntrada
          ? "100% Quitado à Vista na Entrada"
          : valorEfetivoPago > 0
            ? `Entrada ${formatarMoeda(valorEfetivoPago)} (${percEntrada}%) + Saldo ${formatarMoeda(saldoRestante)} na Entrega`
            : `A Faturar / Pagamento na Entrega (${formatarMoeda(totalVendaFinal)})`,
        sinalPago: valorEfetivoPago > 0,
        valorSinalPago: valorEfetivoPago,
        saldoPendente: saldoRestante,
        historicoPagamentos: valorEfetivoPago > 0 ? [{
          id: `PAG-${Math.floor(1000 + Math.random() * 9000)}`,
          data: new Date().toISOString().split('T')[0],
          descricao: isQuitadoNaEntrada ? "Quitação Integral na Entrada" : `Entrada / Sinal Inicial (${percEntrada}%)`,
          formaPagamento: formaPagamento,
          valor: valorEfetivoPago,
          saldoRestante: saldoRestante
        }] : [],
        dataPrevisaoEntrega: dadosBase.dataPrevisaoEntrega || calcularDataFuturaDiasUteis(dadosBase.prazoPedidoDias || 15),
        dataMetaInterna: dadosBase.dataMetaInterna || calcularDataFuturaDiasUteis(dadosBase.prazoInternoDias || 10),
        prazoPedidoDias: dadosBase.prazoPedidoDias || 15,
        prazoInternoDias: dadosBase.prazoInternoDias || 10,
        dtfLarguraRolo: dadosBase.dtfLarguraRolo || 58,
        notaFiscalEmitida: false,
        vendedorResponsavel: "Marcos Paulo"
      };

      // Remove orçamento antigo se estiver convertendo
      const idxExistente = db.pedidos.findIndex(p => p.id === dadosBase.id);
      if (idxExistente >= 0) {
        db.pedidos.splice(idxExistente, 1);
      }
      db.pedidos.unshift(pedidoOficial);

      // 4. LANÇAMENTO AUTOMÁTICO NO FINANCEIRO (COM NOME DO CLIENTE)
      if (valorEfetivoPago > 0) {
        db.lancamentosFinanceiros.unshift({
          id: `LAN-${Math.floor(100 + Math.random() * 900)}`,
          data: new Date().toISOString().split('T')[0],
          tipo: "Entrada",
          descricao: isQuitadoNaEntrada
            ? `Quitação 100% Pedido #${pedidoOficial.numero} (${pedidoOficial.grade.total}x ${pedidoOficial.produtoNome})`
            : `Sinal Entrada Pedido #${pedidoOficial.numero} (${pedidoOficial.grade.total}x ${pedidoOficial.produtoNome})`,
          cliente: clienteNomeFinal,
          valor: valorEfetivoPago,
          formaPagamento: formaPagamento,
          categoria: "Vendas de Uniformes"
        });
      }

      // 5. Geração de OS Técnica com Prazos e Especificação de DTF
      const novaOS = {
        id: `OS-${Math.floor(8400 + db.ordensServico.length + 1)}`,
        pedidoNumero: pedidoOficial.numero,
        cliente: clienteNomeFinal,
        produto: prodNomeFinal,
        corTecido: corFinal,
        observacoesCoresDetalhes: obsCoresFinal,
        mockupUrl: mockupDataUrl,
        quantidadeTotal: pedidoOficial.grade.total,
        grade: pedidoOficial.grade,
        etapaAtual: "Quarentena",
        costureiraDesignada: costureiraObj.nome,
        responsavelCorte: "Vanderlei Souza",
        dataEntradaCorte: new Date().toISOString().split('T')[0],
        prazoPedidoDias: pedidoOficial.prazoPedidoDias,
        prazoInternoDias: pedidoOficial.prazoInternoDias,
        dataPrevisaoEntrega: pedidoOficial.dataPrevisaoEntrega,
        dataMetaInterna: pedidoOficial.dataMetaInterna,
        dtfLarguraRolo: pedidoOficial.dtfLarguraRolo || 58,
        tecidoConsumidoKg: (pedidoOficial.grade.total * (dadosBase.consumoRealComPerda || 0.28)).toFixed(1),
        artesAplicacao: artesLista,
        instrucoesCorte: `Corte padrão para ${pedidoOficial.grade.total} peças de ${prodNomeFinal}. Cor principal: ${corFinal}.${obsCoresFinal ? ' ATENÇÃO AOS DETALHES DE COR: ' + obsCoresFinal : ''}`,
        instrucoesCostura: `Costureira responsável: ${costureiraObj.nome}.${obsCoresFinal ? ' DETALHES DE CONFECÇÃO: ' + obsCoresFinal : ' Fechamento com fio reforçado.'}`,
        statusBordado: "Pendente",
        statusCostura: "Pendente",
        statusAcabamento: "Pendente"
      };
      db.ordensServico.unshift(novaOS);

      // 6. Adiciona artes para a fila do Nesting DTF automaticamente
      artesLista.forEach((art, aIdx) => {
        db.nestingFila.unshift({
          id: `ART-${Math.floor(10 + Math.random() * 90)}`,
          pedidoNumero: pedidoOficial.numero,
          cliente: clienteNomeFinal,
          descricao: `${art.local} (${art.arquivoNome})`,
          larguraCm: 24.0,
          alturaCm: 10.0,
          copias: pedidoOficial.grade.total,
          roloLarguraCm: 58.0
        });
      });

      salvarEstado();
      atualizarBadges();
      fecharTodosModais();
      renderizarPedidos();

      mostrarToast(`Pedido Oficial #${pedidoOficial.numero} salvo com sucesso! Sinal lançado no Financeiro.`, 'green');

      // Dispara o WhatsApp popup imediatamente
      abrirModalWhatsApp(pedidoOficial.id);
    });
  }

  /* ==========================================================================
     MOTOR DE IMPRESSÃO ISOLADA A4 (BLINDAGEM CONTRA VAZAMENTO DE TELAS DE FUNDO)
     ========================================================================== */
  function imprimirDocumentoIsolado(htmlCorpo, tituloDocumento = 'Documento Industrial A4') {
    const idIframe = 'iframeImpressaoIndustrial';
    const iframeExistente = document.getElementById(idIframe);
    if (iframeExistente) {
      try { iframeExistente.remove(); } catch (e) {}
    }

    const iframe = document.createElement('iframe');
    iframe.id = idIframe;
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.opacity = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>${tituloDocumento}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            font-size: 11.5px;
            line-height: 1.35;
            padding: 2mm 4mm;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .text-mono {
            font-family: 'JetBrains Mono', Consolas, monospace;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 5px 8px;
            font-size: 11px;
          }
          th {
            background-color: #f1f5f9;
            font-weight: 700;
          }
          .status-pill {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 700;
            background: #e2e8f0;
            color: #334155;
          }
          .status-green {
            background: #ecfdf5;
            color: #047857;
            border: 1px solid #a7f3d0;
          }
          .status-gray {
            background: #f1f5f9;
            color: #334155;
            border: 1px solid #cbd5e1;
          }
          img.mockup-thumb-3x4 {
            width: 78px;
            height: 104px;
            aspect-ratio: 3/4;
            object-fit: contain;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            page-break-inside: avoid;
            background: #ffffff;
          }
          .grid-cards-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .a4-sheet {
            width: 100%;
            max-width: 100%;
          }
        </style>
      </head>
      <body>
        <div class="a4-sheet">
          ${htmlCorpo}
        </div>
      </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.error('Erro na impressão isolada:', err);
      }
      setTimeout(() => {
        try { iframe.remove(); } catch (e) {}
      }, 2500);
    }, 350);
  }

  /* ==========================================================================
     PROPOSTA COMERCIAL FORMATADA (ORÇAMENTO IMPRESSÃO / DOWNLOAD)
     ========================================================================== */
  function gerarHtmlCorpoPropostaComercial(p) {
    const prazoDias = p.prazoPedidoDias || 15;
    const dataPrev = p.dataPrevisaoEntrega || calcularDataFuturaDiasUteis(prazoDias);
    const emp = (window.ERP_CLOUD && typeof window.ERP_CLOUD.obterEmpresaConfig === 'function')
      ? window.ERP_CLOUD.obterEmpresaConfig()
      : (db.empresa || {});
    const countdown = calcularContagemRegressivaPedido(p);

    return `
      <!-- Cabeçalho Empresarial -->
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${emp.logoUrl ? `<img src="${emp.logoUrl}" style="max-height: 52px; max-width: 140px; object-fit: contain;" alt="Logo">` : ''}
          <div>
            <h2 style="font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">${emp.nomeFantasia || emp.razaoSocial}</h2>
            <div style="font-size: 11px; color: #475569;">
              ${emp.razaoSocial && emp.razaoSocial !== emp.nomeFantasia ? `${emp.razaoSocial} • ` : ''}CNPJ: ${emp.cnpj || 'Não informado'}<br>
              ${emp.endereco ? `${emp.endereco}, ${emp.cidade || ''}/${emp.uf || ''}` : ''}<br>
              Telefone: ${formatarTelefone(emp.telefone)} • E-mail: ${emp.email || '-'}
            </div>
          </div>
        </div>
        <div style="text-align: right;">
          <span class="status-pill status-gray text-mono" style="font-size: 10.5px;">PROPOSTA COMERCIAL</span>
          <div class="text-mono" style="font-weight: 800; font-size: 14px; margin-top: 4px;">Nº ${p.numero}</div>
          <div style="font-size: 10.5px; color: #64748b;">Emissão: ${p.dataCriacao}</div>
        </div>
      </div>

      <!-- Prazos do Pedido Prometidos ao Cliente -->
      <div style="background: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 4px; padding: 8px 12px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 10px; text-transform: uppercase; font-weight: 800; color: #0369a1; display: block;">Prazo Prometido de Produção & Entrega:</span>
          <strong style="font-size: 13px; color: #1e40af;">📅 ${dataPrev} (${prazoDias} dias úteis)</strong>
        </div>
        <div style="text-align: center;">
          ${countdown.badgeHtml}
        </div>
        <div style="text-align: right;">
          <span style="font-size: 10px; text-transform: uppercase; font-weight: 700; color: #64748b; display: block;">Condição de Fornecimento:</span>
          <strong style="font-size: 11.5px; color: #0f172a;">${p.condicaoPagamento || '50% Entrada + 50% na Retirada'}</strong>
        </div>
      </div>

      <!-- Dados do Cliente -->
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 10px; margin-bottom: 12px;">
        <strong style="color: #0f172a; display: block; margin-bottom: 4px; font-size: 11px;">DADOS DO CLIENTE / DESTINATÁRIO:</strong>
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <div><strong>Razão Social / Nome:</strong> ${p.clienteNome}</div>
          <div><strong>WhatsApp / Telefone:</strong> ${formatarTelefone(p.clienteTelefone)}</div>
        </div>
      </div>

      <!-- Detalhamento do Produto & Mockup 3x4 -->
      <div style="display: flex; gap: 14px; margin-bottom: 14px; align-items: center;">
        <img src="${p.mockupUrl || ''}" class="mockup-thumb-3x4" alt="Mockup da Peça" style="width: 78px; height: 104px;">
        <div style="flex: 1;">
          <h3 style="font-size: 14px; font-weight: 800; color: #0f172a;">${p.produtoNome}</h3>
          <div style="font-size: 11.5px; color: #475569; margin-top: 3px; line-height: 1.4;">
            <strong>Cor Principal:</strong> <span style="font-weight: 700; color: #0f172a;">${p.corTecido || 'A Definir'}</span><br>
            ${p.observacoesCoresDetalhes ? `
              <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 4px; padding: 4px 8px; margin: 4px 0; font-size: 11px; color: #92400e; line-height: 1.35; white-space: normal !important; word-break: break-word; overflow-wrap: anywhere; box-sizing: border-box;">
                <strong>Detalhes de Cores / Confecção:</strong> ${p.observacoesCoresDetalhes}
              </div>
            ` : ''}
            <strong>Especificação do Tecido:</strong> ${p.tecidoEspecificacao || 'Padrão da Indústria'}<br>
            <strong>Personalização:</strong> ${p.tipoPersonalizacao || 'Estampa/Bordado Conforme Pedido'}<br>
            <strong>Quantidade Total:</strong> ${p.grade?.total || 0} peças
          </div>
        </div>
      </div>

      <!-- Grade de Tamanhos -->
      <table style="margin-bottom: 12px;">
        <thead>
          <tr>
            <th style="text-align: center;">PP</th>
            <th style="text-align: center;">P</th>
            <th style="text-align: center;">M</th>
            <th style="text-align: center;">G</th>
            <th style="text-align: center;">GG</th>
            <th style="text-align: center;">XG</th>
            <th style="text-align: center;">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center;" class="text-mono">${p.grade?.pp || 0}</td>
            <td style="text-align: center;" class="text-mono">${p.grade?.p || 0}</td>
            <td style="text-align: center;" class="text-mono">${p.grade?.m || 0}</td>
            <td style="text-align: center;" class="text-mono">${p.grade?.g || 0}</td>
            <td style="text-align: center;" class="text-mono">${p.grade?.gg || 0}</td>
            <td style="text-align: center;" class="text-mono">${p.grade?.xg || 0}</td>
            <td style="text-align: center;" class="text-mono"><strong>${p.grade?.total || 0} peças</strong></td>
          </tr>
        </tbody>
      </table>

      <!-- Resumo de Valores -->
      <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; display: flex; justify-content: flex-end; margin-bottom: 12px;">
        <div style="width: 260px; display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Preço Unitário:</span>
            <span class="text-mono">${formatarMoeda(p.precoUnitarioVenda)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 800; border-top: 1px solid #cbd5e1; padding-top: 4px;">
            <span>VALOR TOTAL:</span>
            <span class="text-mono" style="color: #0f172a;">${formatarMoeda(p.valorTotalVenda)}</span>
          </div>
        </div>
      </div>

      <!-- Condições Comerciais & Pagamento PIX -->
      <div style="padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 10.5px; color: #475569; line-height: 1.45;">
        <strong style="color: #0f172a;">CONDIÇÕES GERAIS DE FORNECIMENTO:</strong><br>
        • Pagamento: ${emp.rodapeProposta || '50% de sinal na aprovação do pedido e 50% restante na retirada/entrega.'}<br>
        • Chave PIX: <strong>${emp.chavePix || 'A combinar'}</strong> (${emp.tipoChavePix || 'PIX'} - Favorecido: ${emp.nomeFantasia || emp.razaoSocial})<br>
        • Prazo de Entrega: Prometido para <strong>${dataPrev}</strong> (${prazoDias} dias úteis após confirmação de sinal e artes).<br>
        • Validade desta proposta: 15 dias corridos a partir da data de emissão.
      </div>
    `;
  }

  function abrirModalPropostaComercial(pedidoId) {
    const p = db.pedidos.find(x => x.id === pedidoId);
    if (!p || !modalContainer) return;

    const htmlCorpo = gerarHtmlCorpoPropostaComercial(p);

    const modalEl = criarModalCamada(`
      <div class="modal-overlay active">
        <div class="modal-box a4-print-sheet" style="max-width: 760px;">
          <div class="modal-header">
            <div>
              <div class="modal-title">Proposta Comercial & Orçamento Têxtil (#${p.numero})</div>
              <span style="font-size: 11px; color: var(--text-gray-500);">Documento oficial pronto para impressão ou envio</span>
            </div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>

          <div class="modal-body" style="font-size: 12.5px; color: #0f172a;" id="corpoModalPropostaDoc">
            ${htmlCorpo}
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.ERP.fecharModal()">Fechar</button>
            <button type="button" class="btn btn-primary" id="btnImprimirPropostaDoc" onclick="window.ERP.imprimirPropostaComercialIsolada('${p.id}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Imprimir / Baixar Proposta em PDF
            </button>
          </div>
        </div>
      </div>
    `);
  }

  function imprimirPropostaComercialIsolada(pedidoId) {
    const p = db.pedidos.find(x => x.id === pedidoId);
    if (!p) {
      mostrarToast('Orçamento não encontrado.', 'red');
      return;
    }
    const html = gerarHtmlCorpoPropostaComercial(p);
    imprimirDocumentoIsolado(html, `Proposta_Comercial_${p.numero}`);
  }

  /* ==========================================================================
     MÓDULO 3: OS & FICHAS TÉCNICAS (OFICINA & CHÃO DE FÁBRICA)
     ========================================================================== */
  function renderizarOrdensServico() {
    pageTitleElem.textContent = 'Ordens de Serviço & Fichas Técnicas';
    pageBreadcrumbElem.textContent = 'SISTEMA > OS & FICHAS TÉCNICAS';

    contentArea.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <p style="color: var(--text-gray-500);">Fichas de produção com especificações de corte, costureira designada, consumo de malha e artes.</p>
        <span class="status-pill status-gray text-mono">${db.ordensServico.length} Fichas de Produção Ativas</span>
      </div>

      <div class="table-wrapper">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Mockup 3x4</th>
              <th>Código OS</th>
              <th>Pedido Nº</th>
              <th>Cliente</th>
              <th>Produto Têxtil</th>
              <th>Grade</th>
              <th>Prazo & Contagem</th>
              <th>Costureira / Facção</th>
              <th>Etapa Atual</th>
              <th>Consumo Tecido</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${db.ordensServico.length ? db.ordensServico.map(os => {
              const mockup = os.mockupUrl || window.ERP_MOCKUPS.gerarMockupSvg(os.produto, "#1e3a8a", "#ffffff", os.cliente.substring(0, 6));
              const pOrig = db.pedidos.find(x => x.numero === os.pedidoNumero) || {};
              const countdown = calcularContagemRegressivaPedido(pOrig.id ? pOrig : {
                dataPrevisaoEntrega: os.dataPrevisaoEntrega,
                dataMetaInterna: os.dataMetaInterna,
                dataCriacao: os.dataEntradaCorte
              });
              return `
                <tr>
                  <td>
                    <img src="${mockup}" class="mockup-thumb-3x4" data-os-id="${os.id}" alt="Mockup 3x4" title="Clique para abrir o mockup 3x4 na tela">
                  </td>
                  <td class="text-mono"><strong>${os.id}</strong></td>
                  <td class="text-mono">#${os.pedidoNumero}</td>
                  <td><strong>${os.cliente}</strong></td>
                  <td>
                    <strong>${os.produto}</strong>
                    <div style="font-size: 10.5px; color: #1e3a8a; margin-top: 2px;">
                      🎨 Cor: <strong>${os.corTecido || pOrig.corTecido || 'A Definir'}</strong>
                    </div>
                    ${(os.observacoesCoresDetalhes || pOrig.observacoesCoresDetalhes) ? `
                      <span class="badge-obs-textil" title="${os.observacoesCoresDetalhes || pOrig.observacoesCoresDetalhes}">
                        <strong>Detalhes:</strong> ${os.observacoesCoresDetalhes || pOrig.observacoesCoresDetalhes}
                      </span>
                    ` : ''}
                  </td>
                  <td class="text-mono">${os.quantidadeTotal} peças</td>
                  <td>
                    ${countdown.badgeHtml}
                    ${(os.dataPrevisaoEntrega || os.dataMetaInterna) ? `
                      <span style="display: block; font-size: 9.5px; color: #1e40af; margin-top: 3px; font-weight: 700;">
                        📅 ${os.dataPrevisaoEntrega || os.dataMetaInterna}
                      </span>
                    ` : ''}
                  </td>
                  <td><strong>${os.costureiraDesignada}</strong></td>
                  <td>
                    <span class="status-pill status-green">${os.etapaAtual.toUpperCase()}</span>
                  </td>
                  <td class="text-mono">${os.tecidoConsumidoKg} kg/m</td>
                  <td>
                    <button class="btn btn-primary btn-sm btn-imprimir-os" data-id="${os.id}">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                      Imprimir OS (A4)
                    </button>
                  </td>
                </tr>
              `;
            }).join('') : `
              <tr>
                <td colspan="11" style="text-align: center; padding: 40px 20px; color: var(--text-gray-500);">
                  Nenhuma Ordem de Serviço na oficina. Conforme os pedidos forem aprovados, as OS industriais com fichas técnicas A4 serão geradas automaticamente aqui.
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    `;

    document.querySelectorAll('.btn-imprimir-os').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        abrirFichaTecnica(id);
      });
    });
  }

  function gerarHtmlCorpoFichaTecnica(os) {
    const pedido = db.pedidos.find(p => p.numero === os.pedidoNumero) || {};
    const prazoCli = os.prazoPedidoDias || pedido.prazoPedidoDias || 15;
    const prazoInt = os.prazoInternoDias || pedido.prazoInternoDias || 10;
    const dataEntrega = os.dataPrevisaoEntrega || pedido.dataPrevisaoEntrega || calcularDataFuturaDiasUteis(prazoCli);
    const dataMeta = os.dataMetaInterna || pedido.dataMetaInterna || calcularDataFuturaDiasUteis(prazoInt);
    const larguraDTF = os.dtfLarguraRolo || pedido.dtfLarguraRolo || 58;
    const emp = (window.ERP_CLOUD && typeof window.ERP_CLOUD.obterEmpresaConfig === 'function')
      ? window.ERP_CLOUD.obterEmpresaConfig()
      : (db.empresa || {});
    const countdown = calcularContagemRegressivaPedido(pedido.id ? pedido : { 
      dataPrevisaoEntrega: dataEntrega, 
      dataMetaInterna: dataMeta, 
      dataCriacao: os.dataEntradaCorte, 
      status: os.etapaAtual === 'Entregue' ? 'Entregue' : 'Em Producao',
      etapaProducao: os.etapaAtual
    });

    return `
      <!-- Cabeçalho da Ordem de Produção -->
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${emp.logoUrl ? `<img src="${emp.logoUrl}" style="max-height: 48px; max-width: 120px; object-fit: contain;" alt="Logo">` : ''}
          <div>
            <h2 style="font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">${emp.nomeFantasia || emp.razaoSocial}</h2>
            <span class="text-mono" style="color: #64748b; font-size: 11px;">ORDEM DE PRODUÇÃO: <strong>${os.id}</strong> • PEDIDO <strong>#${os.pedidoNumero}</strong></span>
          </div>
        </div>
        <div class="text-mono" style="text-align: right; font-size: 11px;">
          <strong>DATA ENTRADA: ${os.dataEntradaCorte}</strong><br>
          <span class="status-pill status-gray" style="margin-top: 3px;">ETAPA: ${os.etapaAtual.toUpperCase()}</span>
        </div>
      </div>

      <!-- Prazos do Pedido: Prometido ao Cliente vs Meta do Chão de Fábrica -->
      <div style="background: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 4px; padding: 8px 12px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 10px; text-transform: uppercase; font-weight: 800; color: #0369a1; display: block;">Prazo Prometido ao Cliente:</span>
          <strong style="font-size: 13px; color: #1e40af;">📅 ${dataEntrega} (${prazoCli} dias úteis)</strong>
        </div>
        <div style="text-align: center;">
          ${countdown.badgeHtml}
        </div>
        <div style="text-align: right;">
          <span style="font-size: 10px; text-transform: uppercase; font-weight: 800; color: #0284c7; display: block;">Meta Interna do Chão de Fábrica:</span>
          <strong style="font-size: 13px; color: #0c4a6e;">🏭 ${dataMeta} (${prazoInt} dias úteis)</strong>
        </div>
      </div>

      <!-- Detalhamento Têxtil & Mockup 3x4 -->
      <div style="display: flex; gap: 14px; margin-bottom: 12px; align-items: flex-start;">
        <img src="${os.mockupUrl}" class="mockup-thumb-3x4" alt="Mockup 3x4">
        
        <div style="flex: 1;">
          <div class="grid-cards-2" style="gap: 8px; font-size: 11.5px;">
            <div><strong>Cliente:</strong> ${os.cliente}</div>
            <div><strong>Produto Têxtil:</strong> ${os.produto}</div>
            <div><strong>Total de Peças:</strong> <span style="font-weight: 800; color: #0f172a;">${os.quantidadeTotal} un</span></div>
            <div><strong>Costureira Designada:</strong> <span style="font-weight: 800; color: #047857;">${os.costureiraDesignada}</span></div>
            <div><strong>Encarregado de Corte:</strong> ${os.responsavelCorte}</div>
            <div><strong>Consumo Estimado:</strong> ${os.tecidoConsumidoKg} kg de malha</div>
          </div>
        </div>
      </div>

      <!-- ESPECIFICAÇÃO DE CORES & DETALHES DE CONFECÇÃO (DESTAQUE CHÃO DE FÁBRICA A4) -->
      <div style="background: #fffbeb; border: 2px solid #f59e0b; border-radius: 4px; padding: 10px 12px; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; flex-wrap: wrap; gap: 6px;">
          <strong style="color: #b45309; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 0 20v-20z"></path></svg>
            ESPECIFICAÇÃO DE CORES & DETALHES DE CONFECÇÃO:
          </strong>
          <span style="font-size: 11px; background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 3px; font-weight: 800; border: 1px solid #fde68a;">
            COR PRINCIPAL: ${(os.corTecido || pedido.corTecido || 'A DEFINIR').toUpperCase()}
          </span>
        </div>
        <div style="font-size: 11.5px; color: #78350f; line-height: 1.45;">
          ${(os.observacoesCoresDetalhes || pedido.observacoesCoresDetalhes) ? `
            <div style="background: #ffffff; border: 1.5px solid #fde68a; border-radius: 3px; padding: 6px 10px; margin-top: 4px;">
              <strong style="color: #b45309;">⚠️ ATENÇÃO CORTE / COSTURA / COMPRA DE MATERIAIS (DETALHES DE COR):</strong><br>
              <span style="font-size: 12px; font-weight: 700; color: #0f172a;">${os.observacoesCoresDetalhes || pedido.observacoesCoresDetalhes}</span>
            </div>
          ` : `
            <span style="color: #64748b; font-style: italic;">Peça monocromática na cor principal informada acima. Sem recortes ou frisos contrastantes adicionais.</span>
          `}
        </div>
      </div>

      <!-- Grade Oficial de Corte -->
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 8px 10px; border-radius: 4px; margin-bottom: 12px;">
        <strong style="color: #0f172a; display: block; margin-bottom: 4px; font-size: 11px;">GRADE OFICIAL DE CORTE & FECHAMENTO:</strong>
        <div class="text-mono" style="display: flex; justify-content: space-around; font-size: 12.5px; font-weight: 700;">
          <span>PP: ${os.grade?.pp || 0}</span>
          <span>P: ${os.grade?.p || 0}</span>
          <span>M: ${os.grade?.m || 0}</span>
          <span>G: ${os.grade?.g || 0}</span>
          <span>GG: ${os.grade?.gg || 0}</span>
          <span>XG: ${os.grade?.xg || 0}</span>
          <span style="color: #047857;">TOTAL: ${os.quantidadeTotal} pçs</span>
        </div>
      </div>

      <!-- 1. Instruções para a Mesa de Corte -->
      <div style="margin-bottom: 10px;">
        <strong style="color: #0f172a; display: block; margin-bottom: 2px; font-size: 11.5px;">1. INSTRUÇÕES PARA A MESA DE CORTE:</strong>
        <p style="color: #475569; font-size: 11px;">${os.instrucoesCorte || 'Corte conforme enfesto industrial padrão com tolerância de 2mm.'}</p>
      </div>

      <!-- 2. Especificações de Estamparia / DTF (Bobina & Arquivos) -->
      <div style="margin-bottom: 10px; background: #fafafa; border: 1px dashed #cbd5e1; padding: 8px 10px; border-radius: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <strong style="color: #0f172a; font-size: 11.5px;">2. ESPECIFICAÇÃO DE ARTES & DTF DIGITAL:</strong>
          <span class="status-pill status-gray" style="font-size: 10px;">
            Bobina DTF: <strong>${larguraDTF} cm Útil</strong> ${larguraDTF == 28 ? '(Bobina Estreita 30cm/A3)' : '(Bobina Industrial 60cm)'}
          </span>
        </div>
        <ul style="padding-left: 18px; color: #475569; font-size: 11px; margin-top: 4px;">
          ${(os.artesAplicacao && os.artesAplicacao.length > 0) ? os.artesAplicacao.map(a => `
            <li><strong>${a.local}:</strong> ${a.dimensoes || a.dimensao || 'Padrão'} • Arquivo: ${a.arquivoNome || a.tecnica || 'Vetor Fechado'}</li>
          `).join('') : `
            <li>Personalização padrão conforme ficha de estampa e bordado aprovada.</li>
          `}
        </ul>
      </div>

      <!-- 3. Instruções para Costureira / Facção -->
      <div style="margin-bottom: 12px;">
        <strong style="color: #0f172a; display: block; margin-bottom: 2px; font-size: 11.5px;">3. INSTRUÇÕES PARA A COSTUREIRA / FACÇÃO:</strong>
        <p style="color: #475569; font-size: 11px;">${os.instrucoesCostura || 'Costura reforçada de ombro a ombro e pesponto duplo nas cavas e barras.'}</p>
      </div>

      <!-- Assinaturas do Chão de Fábrica -->
      <div style="display: flex; justify-content: space-between; margin-top: 20px; padding-top: 10px; border-top: 1px dashed #cbd5e1; font-size: 10px;">
        <div style="text-align: center; width: 170px; border-top: 1px solid #000; padding-top: 3px;">
          Cortador Responsável
        </div>
        <div style="text-align: center; width: 170px; border-top: 1px solid #000; padding-top: 3px;">
          Estampador / DTF
        </div>
        <div style="text-align: center; width: 170px; border-top: 1px solid #000; padding-top: 3px;">
          Costureira / Facção
        </div>
      </div>
      <div style="font-size: 9.5px; color: #64748b; margin-top: 10px; text-align: center;">
        ${emp.rodapeFicha || 'Ordem de Produção Oficial. Tolerância de corte de 2mm. Em caso de dúvidas, contate o encarregado.'}
      </div>
    `;
  }

  function abrirFichaTecnica(osId) {
    const os = db.ordensServico.find(o => o.id === osId);
    if (!os || !modalContainer) return;

    const htmlCorpo = gerarHtmlCorpoFichaTecnica(os);

    const modalEl = criarModalCamada(`
      <div class="modal-overlay active">
        <div class="modal-box a4-print-sheet" style="max-width: 780px;">
          <div class="modal-header">
            <div class="modal-title">Ficha Técnica & Ordem de Produção Industrial (${os.id})</div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>

          <div class="modal-body" style="font-size: 12.5px; color: #0f172a;" id="corpoModalFichaDoc">
            ${htmlCorpo}
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.ERP.fecharModal()">Fechar</button>
            <button type="button" class="btn btn-primary" id="btnImprimirFichaDoc" onclick="window.ERP.imprimirFichaTecnicaIsolada('${os.id}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Imprimir Ordem de Produção (A4)
            </button>
          </div>
        </div>
      </div>
    `);
  }

  function imprimirFichaTecnicaIsolada(osId) {
    const os = db.ordensServico.find(o => o.id === osId);
    if (!os) {
      mostrarToast('Ordem de serviço não encontrada.', 'red');
      return;
    }
    const html = gerarHtmlCorpoFichaTecnica(os);
    imprimirDocumentoIsolado(html, `Ficha_Tecnica_${os.id}`);
  }

  function abrirFichaTecnicaPorPedido(p) {
    const corTec = p.corTecido || 'A Definir';
    const obsCores = p.observacoesCoresDetalhes || '';

    const osTemp = {
      id: `OS-${p.numero}`,
      pedidoNumero: p.numero,
      cliente: p.clienteNome,
      produto: p.produtoNome,
      corTecido: corTec,
      observacoesCoresDetalhes: obsCores,
      mockupUrl: p.mockupUrl,
      quantidadeTotal: p.grade?.total || 0,
      grade: p.grade,
      etapaAtual: p.etapaProducao,
      costureiraDesignada: p.costureiraNome || "Oficina Interna",
      responsavelCorte: "Vanderlei Souza",
      dataEntradaCorte: p.dataCriacao,
      prazoPedidoDias: p.prazoPedidoDias || 15,
      prazoInternoDias: p.prazoInternoDias || 10,
      dataPrevisaoEntrega: p.dataPrevisaoEntrega || calcularDataFuturaDiasUteis(15),
      dataMetaInterna: p.dataMetaInterna || calcularDataFuturaDiasUteis(10),
      dtfLarguraRolo: p.dtfLarguraRolo || 58,
      tecidoConsumidoKg: ((p.grade?.total || 1) * 0.28).toFixed(1),
      artesAplicacao: p.artesAnexadas || [],
      instrucoesCorte: `Enfesto e corte padrão para ${p.grade?.total || 0} peças de ${p.produtoNome}. Cor: ${corTec}.${obsCores ? ' ATENÇÃO AOS DETALHES DE COR: ' + obsCores : ''}`,
      instrucoesCostura: `Costura reforçada de ombro a ombro.${obsCores ? ' DETALHES DE CONFECÇÃO: ' + obsCores : ''}`,
      statusBordado: "Pendente",
      statusCostura: "Pendente",
      statusAcabamento: "Pendente"
    };
    db.ordensServico.unshift(osTemp);
    salvarEstado();
    abrirFichaTecnica(osTemp.id);
  }

  /* ==========================================================================
     MÓDULO 4: NESTING DTF (OTIMIZAÇÃO 2D DE ROLO 58CM + ARTES DE PEDIDOS)
     ========================================================================== */
  function renderizarNestingDTF() {
    pageTitleElem.textContent = 'Gestor de Artes DTF & Nesting Automático';
    pageBreadcrumbElem.textContent = 'SISTEMA > NESTING DE ARTES';

    let larguraRoloCustom = 58.0;
    const resultado = window.DtfNestingEngine.processarNesting(db.nestingFila, { larguraRoloCm: larguraRoloCustom });

    contentArea.innerHTML = `
      <div class="grid-cards-4">
        <div class="card">
          <div class="kpi-title">Metros Lineares de Rolo</div>
          <div class="kpi-value text-primary">${resultado.metrosLinearesTotais} m</div>
          <div class="kpi-desc">Largura útil de ${resultado.larguraRoloCm} cm</div>
        </div>

        <div class="card">
          <div class="kpi-title">Taxa de Aproveitamento</div>
          <div class="kpi-value text-green">${resultado.taxaAproveitamentoPercentual}%</div>
          <div class="kpi-desc">Desperdício reduzido: ${resultado.taxaDesperdicioPercentual}%</div>
        </div>

        <div class="card">
          <div class="kpi-title">Custo Total DTF (Filme + Tinta)</div>
          <div class="kpi-value text-primary">${formatarMoeda(resultado.custoTotalRolo)}</div>
          <div class="kpi-desc">Base de custo: R$ 60,00 por metro linear</div>
        </div>

        <div class="card">
          <div class="kpi-title">Total de Cópias Encaixadas</div>
          <div class="kpi-value text-primary">${resultado.totalItensProcessados} un</div>
          <div class="kpi-desc">Custo médio unitário: ${formatarMoeda(resultado.custoMedioPorArte)}</div>
        </div>
      </div>

      <div class="grid-cards-2">
        <div class="card">
          <div class="table-header-bar" style="padding: 0 0 12px 0;">
            <div class="table-title">Fila de Artes no Rolo DTF</div>
            <button class="btn btn-primary btn-sm" id="btnAdicionarArteNesting">
              + Selecionar Arte de Pedido ou Arquivo Externo
            </button>
          </div>

          <div style="max-height: 400px; overflow-y: auto;">
            <table class="erp-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Descrição / Arte</th>
                  <th>Dimensões (LxA)</th>
                  <th>Cópias</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                ${db.nestingFila.length ? db.nestingFila.map((art, idx) => `
                  <tr>
                    <td><strong>${art.cliente}</strong></td>
                    <td>${art.descricao}</td>
                    <td class="text-mono">${art.larguraCm} x ${art.alturaCm} cm</td>
                    <td class="text-mono"><strong>${art.copias} un</strong></td>
                    <td>
                      <button class="btn btn-red btn-sm btn-remover-arte-nesting" data-index="${idx}">Remover</button>
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="5" style="text-align: center; padding: 30px 10px; color: var(--text-gray-500);">
                      Nenhuma arte na fila de impressão DTF. Clique em "+ Adicionar Arte à Fila" ou gere orçamentos com técnicas DTF.
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="table-header-bar" style="padding: 0 0 12px 0;">
            <div class="table-title">Mapa Visual do Rolo DTF (Escala 1:1)</div>
            <button class="btn btn-primary btn-sm" id="btnExportarPlanoCorte">
              Salvar & Exportar Arquivo DTF para Impressão
            </button>
          </div>
          
          <div class="nesting-canvas-container" style="background: #ffffff; border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 10px;">
            <canvas id="nestingCanvas"></canvas>
          </div>
        </div>
      </div>
    `;

    // Renderiza o canvas
    setTimeout(() => {
      const canvas = document.getElementById('nestingCanvas');
      if (canvas) {
        window.DtfNestingEngine.renderizarCanvas(canvas, resultado);
      }
    }, 60);

    document.getElementById('btnAdicionarArteNesting')?.addEventListener('click', abrirModalAdicionarArteNesting);

    document.querySelectorAll('.btn-remover-arte-nesting').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        db.nestingFila.splice(idx, 1);
        salvarEstado();
        renderizarNestingDTF();
        mostrarToast('Arte removida da fila de impressão DTF.', 'green');
      });
    });

    document.getElementById('btnExportarPlanoCorte')?.addEventListener('click', () => {
      const canvas = document.getElementById('nestingCanvas');
      if (canvas) {
        const link = document.createElement('a');
        link.download = `plano_impressao_dtf_${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
      mostrarToast(`Plano de corte DTF exportado com ${resultado.metrosLinearesTotais} metros lineares prontos para o RIP.`, 'green');
    });
  }

  function abrirModalAdicionarArteNesting() {
    if (!modalContainer) return;

    // Coleta todas as artes cadastradas nos pedidos ativos
    let artesDosPedidos = [];
    db.pedidos.forEach(p => {
      if (p.artesAnexadas && p.artesAnexadas.length) {
        p.artesAnexadas.forEach(a => {
          artesDosPedidos.push({
            pedidoNumero: p.numero,
            clienteNome: p.clienteNome,
            local: a.local,
            arquivoNome: a.arquivoNome,
            dimensoes: a.dimensoes,
            quantidadePadrao: p.grade?.total || 50
          });
        });
      }
    });

    const modalEl = criarModalCamada(`
      <div class="modal-overlay active">
        <div class="modal-box" style="max-width: 580px;">
          <div class="modal-header">
            <div>
              <div class="modal-title">Adicionar Arte na Fila de Nesting DTF</div>
              <span style="font-size: 11px; color: var(--text-gray-500);">Importe artes dos pedidos ou anexe um arquivo externo</span>
            </div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>

          <div class="modal-body">
            <!-- Origem da Arte -->
            <div class="form-group">
              <label class="form-label">Origem da Arte</label>
              <select id="nestOrigemSelect" class="form-select">
                <option value="PEDIDO">Selecionar Arte de Pedido Cadastrado</option>
                <option value="EXTERNO">Adicionar de Pasta / Arquivo Externo</option>
              </select>
            </div>

            <!-- Seção Pedido Cadastrado -->
            <div id="secaoArtePedido" class="form-group">
              <label class="form-label">Selecione o Pedido & Arte</label>
              <select id="nestPedidoArteSelect" class="form-select">
                ${artesDosPedidos.map((a, idx) => `
                  <option value="${idx}">Pedido #${a.pedidoNumero} • ${a.clienteNome} [${a.local}] - ${a.arquivoNome}</option>
                `).join('')}
              </select>
            </div>

            <!-- Seção Arquivo Externo -->
            <div id="secaoArteExterna" class="form-group" style="display: none;">
              <div class="form-group">
                <label class="form-label">Nome do Cliente / Identificação</label>
                <input type="text" id="nestClienteExterno" class="form-input" placeholder="Ex: Gráfica Alfa">
              </div>
              <div class="form-group">
                <label class="form-label">Arquivo de Pasta Externa (PNG / PDF / AI)</label>
                <input type="file" id="nestArquivoExterno" class="form-input" accept="image/*,.pdf,.ai">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Descrição da Estampa</label>
              <input type="text" id="nestDesc" class="form-input" value="Estampa Frente" placeholder="Ex: Peito 9x8cm">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Largura da Arte (cm)</label>
                <input type="number" id="nestLargura" class="form-input" value="26.0" step="0.5" min="1">
              </div>

              <div class="form-group">
                <label class="form-label">Altura da Arte (cm)</label>
                <input type="number" id="nestAltura" class="form-input" value="8.0" step="0.5" min="1">
              </div>

              <div class="form-group">
                <label class="form-label">Quantidade de Cópias</label>
                <input type="number" id="nestQtd" class="form-input" value="50" min="1">
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.ERP.fecharModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btnConfirmarArteNesting">
              Adicionar ao Rolo & Otimizar Espaço
            </button>
          </div>
        </div>
      </div>
    `);

    const selOrigem = document.getElementById('nestOrigemSelect');
    selOrigem?.addEventListener('change', () => {
      const isExt = selOrigem.value === 'EXTERNO';
      document.getElementById('secaoArtePedido').style.display = isExt ? 'none' : 'block';
      document.getElementById('secaoArteExterna').style.display = isExt ? 'block' : 'none';
    });

    document.getElementById('btnConfirmarArteNesting')?.addEventListener('click', () => {
      const isExt = selOrigem.value === 'EXTERNO';
      let clienteNome = "Cliente Geral";
      let desc = document.getElementById('nestDesc')?.value || "Arte Têxtil";
      let w = parseFloat(document.getElementById('nestLargura')?.value || 20);
      let h = parseFloat(document.getElementById('nestAltura')?.value || 10);
      let qtd = parseInt(document.getElementById('nestQtd')?.value || 10, 10);

      if (isExt) {
        clienteNome = document.getElementById('nestClienteExterno')?.value || "Cliente Externo";
        const fileExt = document.getElementById('nestArquivoExterno')?.files[0];
        if (fileExt) desc = `${desc} (${fileExt.name})`;
      } else {
        const idx = parseInt(document.getElementById('nestPedidoArteSelect')?.value || 0, 10);
        const artPed = artesDosPedidos[idx];
        if (artPed) {
          clienteNome = artPed.clienteNome;
          desc = `${artPed.local} [Ped #${artPed.pedidoNumero}]`;
        }
      }

      db.nestingFila.unshift({
        id: `ART-${Math.floor(10 + Math.random() * 90)}`,
        cliente: clienteNome,
        descricao: desc,
        larguraCm: w,
        alturaCm: h,
        copias: qtd,
        roloLarguraCm: 58.0
      });

      salvarEstado();
      fecharModal();
      renderizarNestingDTF();
      mostrarToast('Arte adicionada com sucesso! O rolo foi recalculado com rotação ótima.', 'green');
    });
  }

  /* ==========================================================================
     MÓDULO 5: ESTOQUE TÊXTIL (ENTRADA ROBUSTA + CUSTO MÉDIO + VARIANTES)
     ========================================================================== */
  function renderizarEstoque() {
    pageTitleElem.textContent = 'Estoque de Malhas, Tecidos & Insumos';
    pageBreadcrumbElem.textContent = 'SISTEMA > ESTOQUE';

    contentArea.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <p style="color: var(--text-gray-500);">Controle rigoroso com recálculo de custo médio ponderado, variantes de cores e estoque mínimo.</p>
        <button class="btn btn-primary" id="btnDarEntradaEstoque">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Cadastrar Entrada de Estoque
        </button>
      </div>

      <div class="table-wrapper">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Descrição do Material / Insumo</th>
              <th>Categoria</th>
              <th>Unidade</th>
              <th>Saldo Físico</th>
              <th>Estoque Mínimo</th>
              <th>Custo Médio Unitário</th>
              <th>Valor Total em Estoque</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${db.estoque.map(item => {
              const estaCritico = item.saldoAtual <= item.estoqueMinimo;
              const valorTotalItem = item.saldoAtual * item.custoMedioUnitario;
              return `
                <tr>
                  <td class="text-mono"><strong>${item.codigo}</strong></td>
                  <td><strong>${item.descricao}</strong></td>
                  <td>${item.categoria}</td>
                  <td class="text-mono">${item.unidade}</td>
                  <td class="text-mono" style="font-weight: 800; font-size: 13.5px; color: var(--text-primary);">
                    ${item.saldoAtual} ${item.unidade}
                  </td>
                  <td class="text-mono">${item.estoqueMinimo} ${item.unidade}</td>
                  <td class="text-mono">${formatarMoeda(item.custoMedioUnitario)}</td>
                  <td class="text-mono"><strong>${formatarMoeda(valorTotalItem)}</strong></td>
                  <td>
                    <span class="status-pill ${estaCritico ? 'status-red' : 'status-green'}">
                      ${estaCritico ? 'COMPRA URGENTE' : 'NORMAL'}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-secondary btn-sm btn-ajustar-saldo-estoque" data-id="${item.id}">
                      Ajustar / Entrada
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('btnDarEntradaEstoque')?.addEventListener('click', abrirModalEntradaEstoque);
    document.querySelectorAll('.btn-ajustar-saldo-estoque').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        abrirModalEntradaEstoque(id);
      });
    });
  }

  function abrirModalEntradaEstoque(itemEstoqueId = null) {
    if (!modalContainer) return;

    const itemPreselecionado = itemEstoqueId ? db.estoque.find(e => e.id === itemEstoqueId) : null;

    const modalEl = criarModalCamada(`
      <div class="modal-overlay active">
        <div class="modal-box" style="max-width: 680px;">
          <div class="modal-header">
            <div>
              <div class="modal-title">Entrada de Insumo no Estoque Têxtil</div>
              <span style="font-size: 11px; color: var(--text-gray-500);">Recálculo automático de custo médio ponderado e sincronização de compras</span>
            </div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>

          <div class="modal-body">
            <!-- Pesquisa de Insumo no Catálogo Mestre Têxtil -->
            <div class="form-group">
              <label class="form-label">
                Pesquisar Insumo no Catálogo Têxtil Exaustivo (Tecidos, Malhas, Aviamentos, Linhas, DTF, Botões, etc.)
              </label>
              <select id="selInsumoCatalogo" class="form-select">
                ${db.insumosCatalogoMestre.map(cat => `
                  <option value="${cat.id}">${cat.nome} [${cat.categoria} • ${cat.unidade}]</option>
                `).join('')}
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Cor / Variante do Lote</label>
                <select id="selVarianteCor" class="form-select">
                  <option value="Azul Marinho">Azul Marinho</option>
                  <option value="Branco Alvejado">Branco Alvejado</option>
                  <option value="Preto Reativo">Preto Reativo</option>
                  <option value="Cinza Mescla">Cinza Mescla</option>
                  <option value="Vermelho Ferrari">Vermelho Ferrari</option>
                  <option value="Azul Royal">Azul Royal</option>
                  <option value="Verde Militar">Verde Militar</option>
                  <option value="Transparente / Padrão">Transparente / Padrão</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Fornecedor Têxtil</label>
                <input type="text" id="entFornecedor" class="form-input" value="Malharia Textil Sul S.A." placeholder="Razão do fornecedor">
              </div>

              <div class="form-group">
                <label class="form-label">Nota Fiscal de Entrada (NF-e)</label>
                <input type="text" id="entNfe" class="form-input" value="NF-8924" placeholder="Ex: NF-1290">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Quantidade que Está Entrando</label>
                <input type="number" id="entQuantidade" class="form-input" style="font-weight: 800; font-size: 14px;" value="100" min="1" step="0.5">
              </div>

              <div class="form-group">
                <label class="form-label">Preço Unitário Pago na Compra (R$)</label>
                <input type="number" id="entPrecoPago" class="form-input" style="font-weight: 800; font-size: 14px;" value="48.50" step="0.50">
              </div>

              <div class="form-group">
                <label class="form-label">Estoque Mínimo de Segurança</label>
                <input type="number" id="entEstoqueMinimo" class="form-input" value="60" min="1">
              </div>
            </div>

            <div style="background: #f8fafc; border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 12px; font-size: 12px; color: var(--text-gray-600);">
              <strong style="color: var(--text-primary); display: block; margin-bottom: 4px;">Recálculo de Custo Médio Ponderado:</strong>
              O sistema mesclará o saldo antigo com a nova entrada e recalculará o custo médio exato para garantir que os futuros orçamentos reflitam os preços reais pagos aos fornecedores.
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.ERP.fecharModal()">Cancelar</button>
            <button type="button" class="btn btn-green" id="btnSalvarEntradaEstoque">
              Confirmar Entrada & Recalcular Custo Médio
            </button>
          </div>
        </div>
      </div>
    `);

    document.getElementById('btnSalvarEntradaEstoque')?.addEventListener('click', () => {
      const insumoId = document.getElementById('selInsumoCatalogo')?.value;
      const insumoMestre = db.insumosCatalogoMestre.find(i => i.id === insumoId) || db.insumosCatalogoMestre[0];
      const cor = document.getElementById('selVarianteCor')?.value || 'Padrão';
      const fornecedor = document.getElementById('entFornecedor')?.value || 'Fornecedor Têxtil';
      const nfe = document.getElementById('entNfe')?.value || 'S/N';
      const qtdEntrada = parseFloat(document.getElementById('entQuantidade')?.value || 0);
      const precoPago = parseFloat(document.getElementById('entPrecoPago')?.value || 0);
      const estoqueMin = parseFloat(document.getElementById('entEstoqueMinimo')?.value || 50);

      if (qtdEntrada <= 0 || precoPago <= 0) {
        mostrarToast('Informe quantidade e preço unitário válidos.', 'red');
        return;
      }

      // Procura se já existe esse item com essa cor no estoque
      const descItem = `${insumoMestre.nome} (${cor})`;
      let itemExistente = db.estoque.find(e => e.descricao.toLowerCase() === descItem.toLowerCase());

      if (itemExistente) {
        const saldoAntigo = itemExistente.saldoAtual;
        const custoAntigo = itemExistente.custoMedioUnitario;
        const novoSaldo = saldoAntigo + qtdEntrada;
        const novoCustoMedio = ((saldoAntigo * custoAntigo) + (qtdEntrada * precoPago)) / novoSaldo;

        itemExistente.saldoAtual = novoSaldo;
        itemExistente.custoMedioUnitario = parseFloat(novoCustoMedio.toFixed(2));
        itemExistente.fornecedorUltimo = fornecedor;
      } else {
        db.estoque.unshift({
          id: `EST-${Math.floor(100 + Math.random() * 900)}`,
          codigo: `INS-${Math.floor(1000 + Math.random() * 9000)}`,
          descricao: descItem,
          categoria: insumoMestre.categoria,
          unidade: insumoMestre.unidade,
          saldoAtual: qtdEntrada,
          estoqueMinimo: estoqueMin,
          custoMedioUnitario: precoPago,
          fornecedorUltimo: fornecedor
        });
      }

      // Sincroniza em compras
      const valorTotalCompra = qtdEntrada * precoPago;
      db.compras.unshift({
        id: `COM-${Math.floor(600 + db.compras.length)}`,
        data: new Date().toISOString().split('T')[0],
        fornecedor: fornecedor,
        categoria: insumoMestre.categoria,
        itens: `${qtdEntrada} ${insumoMestre.unidade} de ${descItem} (NF ${nfe})`,
        valorTotal: valorTotalCompra,
        status: "Entregue",
        previsaoChegada: new Date().toISOString().split('T')[0],
        lancadoEstoque: true
      });

      // Lança a saída no financeiro
      db.lancamentosFinanceiros.unshift({
        id: `LAN-${Math.floor(100 + Math.random() * 900)}`,
        data: new Date().toISOString().split('T')[0],
        tipo: "Saida",
        descricao: `Compra de Insumos: ${descItem} (NF ${nfe})`,
        cliente: fornecedor,
        valor: valorTotalCompra,
        formaPagamento: "Boleto 30dd",
        categoria: insumoMestre.categoria
      });

      salvarEstado();
      fecharModal();
      renderizarEstoque();

      mostrarToast(`Entrada de ${qtdEntrada} ${insumoMestre.unidade} confirmada! Custo médio recalculado e registrado no Financeiro.`, 'green');
    });
  }

  /* ==========================================================================
     MÓDULO 6: PRODUTOS & CATÁLOGO DE MODELAGEM COMPLETO (28 MODELOS)
     ========================================================================== */
  function renderizarProdutos() {
    pageTitleElem.textContent = 'Catálogo de Modelagens & Produtos Têxteis';
    pageBreadcrumbElem.textContent = 'SISTEMA > PRODUTOS';

    contentArea.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <p style="color: var(--text-gray-500);">Catálogo completo com todas as modelagens têxteis profissionais, corporativas e operacionais.</p>
        <button class="btn btn-primary" id="btnNovoModeloCatalogo">+ Nova Modelagem Têxtil</button>
      </div>

      <div class="grid-cards-3">
        ${db.produtosBase.map(prod => `
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="status-pill status-gray">${prod.codigo}</span>
              <span class="text-mono" style="font-size: 11px; color: var(--text-gray-500);">${prod.categoria}</span>
            </div>
            
            <h3 style="font-size: 14.5px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">${prod.nome}</h3>
            
            <div style="font-size: 12px; color: var(--text-gray-600); margin-bottom: 12px; display: flex; flex-direction: column; gap: 4px;">
              <div><strong>Malha/Tecido Base:</strong> ${prod.tipoMalhaPadrao}</div>
              <div><strong>Consumo Médio por Peça:</strong> <span class="text-mono" style="font-weight: 700; color: var(--text-primary);">${prod.consumoMalhaKgPorPeca} kg/m</span></div>
              <div><strong>Mão de Obra de Costura:</strong> <span class="text-mono" style="font-weight: 700; color: var(--text-primary);">${formatarMoeda(prod.custoMaoDeObraBase)}</span></div>
            </div>

            <div style="border-top: 1px solid var(--border-subtle); padding-top: 10px; font-size: 11.5px;">
              <strong style="color: var(--text-gray-600); display: block; margin-bottom: 4px;">Aviamentos Fixos:</strong>
              <ul style="list-style: none; padding-left: 0; color: var(--text-gray-500);">
                ${(prod.aviamentosPadrao || []).map(a => `<li>• ${a.nome} (${a.qtd}x) - ${formatarMoeda(a.custoUnitario)}</li>`).join('')}
              </ul>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    document.getElementById('btnNovoModeloCatalogo')?.addEventListener('click', () => {
      abrirModalNovoModeloInline(() => renderizarProdutos());
    });
  }

  function abrirModalNovoModeloInline(callback) {
    if (!modalContainer) return;

    const modalEl = criarModalCamada(`
      <div class="modal-overlay active" id="modalNovoModeloInlineOverlay">
        <div class="modal-box" style="max-width: 580px;">
          <div class="modal-header">
            <div class="modal-title">Cadastrar Nova Modelagem Têxtil</div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Código Interno</label>
                <input type="text" id="cadModCodigo" class="form-input" value="MOD-${Math.floor(10 + Math.random() * 90)}">
              </div>
              <div class="form-group" style="flex: 2;">
                <label class="form-label">Nome da Peça / Modelo</label>
                <input type="text" id="cadModNome" class="form-input" placeholder="Ex: Calça Térmica Frigorífico">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Categoria Têxtil</label>
                <select id="cadModCategoria" class="form-select">
                  <option value="Linha Corporativa">Linha Corporativa</option>
                  <option value="Linha Pesada & Operacional">Linha Pesada & Operacional</option>
                  <option value="Linha Saúde & Laboratorial">Linha Saúde & Laboratorial</option>
                  <option value="Linha Esportiva & Escolar">Linha Esportiva & Escolar</option>
                  <option value="Gastronomia & Serviços">Gastronomia & Serviços</option>
                  <option value="Acessórios">Acessórios</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Tipo de Malha / Tecido Padrão</label>
                <input type="text" id="cadModMalha" class="form-input" value="Malha Especial" placeholder="Ex: Brim Pesado 100% Alg">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Consumo de Tecido (kg ou m / peça)</label>
                <input type="number" id="cadModConsumo" class="form-input" value="0.30" step="0.05">
              </div>

              <div class="form-group">
                <label class="form-label">Custo Mão de Obra Costura (R$)</label>
                <input type="number" id="cadModCostura" class="form-input" value="8.00" step="0.50">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.ERP.fecharModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btnSalvarNovoModelo">Cadastrar e Selecionar</button>
          </div>
        </div>
      </div>
    `);

    document.getElementById('btnSalvarNovoModelo')?.addEventListener('click', () => {
      const nome = document.getElementById('cadModNome')?.value;
      if (!nome) {
        mostrarToast('Informe o nome da nova modelagem.', 'red');
        return;
      }

      const novoMod = {
        id: `PROD-${Math.floor(100 + db.produtosBase.length + 1)}`,
        codigo: document.getElementById('cadModCodigo')?.value || 'MOD-01',
        nome: nome,
        categoria: document.getElementById('cadModCategoria')?.value || 'Linha Corporativa',
        tipoMalhaPadrao: document.getElementById('cadModMalha')?.value || 'Malha Padrão',
        consumoMalhaKgPorPeca: parseFloat(document.getElementById('cadModConsumo')?.value || 0.30),
        custoMaoDeObraBase: parseFloat(document.getElementById('cadModCostura')?.value || 8.00),
        aviamentosPadrao: [{ nome: "Aviamentos Básicos", qtd: 1, custoUnitario: 2.00 }]
      };

      db.produtosBase.unshift(novoMod);
      salvarEstado();
      fecharModal(modalEl);
      mostrarToast(`Modelo "${novoMod.nome}" cadastrado com sucesso!`, 'green');
      if (callback) callback(novoMod);
    });
  }

  /* ==========================================================================
     MÓDULO 7: FINANCEIRO COMPLETO COM CONTAS A PAGAR, DRE, BAIXAS E VENCIMENTOS
     ========================================================================== */
  function renderizarFinanceiro() {
    pageTitleElem.textContent = 'Gestão Financeira, Contas a Pagar & DRE';
    pageBreadcrumbElem.textContent = 'SISTEMA > FINANCEIRO';

    // 1. Cálculos de Vendas e Margens
    const pedidosOficiais = (db.pedidos || []).filter(p => p.status !== 'Cancelado' && p.tipoRegistro !== 'Orcamento');
    const receitaBruta = pedidosOficiais.reduce((acc, p) => acc + (Number(p.valorTotalVenda) || 0), 0);
    const impostosDeducoes = receitaBruta * 0.065; // Simples Nacional médio 6.5%
    const receitaLiquida = receitaBruta - impostosDeducoes;

    const cmvTotal = pedidosOficiais.reduce((acc, p) => acc + (Number(p.custoTotalEstimado) || 0), 0);
    const margemContribuicao = receitaLiquida - cmvTotal;
    const margemContribuicaoPerc = receitaLiquida > 0 ? (margemContribuicao / receitaLiquida) * 100 : 0;

    // 2. Mapeamento Completo de Despesas com Dias de Atraso e Status
    const despesasLista = (db.despesasFixas || []).map(d => {
      const statusInfo = calcularStatusDespesa(d);
      return {
        ...d,
        valorReal: Number(d.valor !== undefined ? d.valor : d.valorMensal) || 0,
        statusInfo
      };
    });

    const despesasPagas = despesasLista.filter(d => d.status === 'Pago');
    const totalDespesasPagas = despesasPagas.reduce((acc, d) => acc + (Number(d.valorPago || d.valorReal) || 0), 0);

    const despesasPendentes = despesasLista.filter(d => d.status !== 'Pago');
    const totalDespesasPendentes = despesasPendentes.reduce((acc, d) => acc + d.valorReal, 0);

    const despesasAtrasadas = despesasPendentes.filter(d => d.statusInfo.isAtrasado);
    const totalDespesasAtrasadas = despesasAtrasadas.reduce((acc, d) => acc + d.valorReal, 0);

    // 3. Livro Caixa (Entradas e Saídas)
    const totalEntradasCaixa = (db.lancamentosFinanceiros || [])
      .filter(l => (l.tipo === 'Entrada' || l.tipo === 'Receita') && l.status !== 'Cancelado')
      .reduce((acc, l) => acc + (Number(l.valor) || 0), 0);

    const totalSaidasCaixa = (db.lancamentosFinanceiros || [])
      .filter(l => (l.tipo === 'Saida' || l.tipo === 'Despesa') && l.status !== 'Cancelado')
      .reduce((acc, l) => acc + (Number(l.valor) || 0), 0);

    const saldoAtualCaixa = totalEntradasCaixa - totalSaidasCaixa;

    // 4. Saldo a Receber de Clientes
    const totalAReceber = pedidosOficiais.reduce((acc, p) => {
      const totalVenda = Number(p.valorTotalVenda) || 0;
      const pago = Number(p.valorSinalPago) || (p.sinalPago ? totalVenda * 0.5 : 0);
      return acc + Math.max(0, totalVenda - pago);
    }, 0);

    // 5. Lucro Líquido Operacional (DRE)
    const totalDespesasFixasDRE = despesasLista.reduce((acc, d) => acc + d.valorReal, 0);
    const lucroLiquidoOperacional = margemContribuicao - totalDespesasFixasDRE;

    // 6. Filtragem de Contas a Pagar
    let despesasFiltradas = despesasLista;
    if (filtroDespesas === 'pendentes') {
      despesasFiltradas = despesasLista.filter(d => d.status !== 'Pago');
    } else if (filtroDespesas === 'atrasadas') {
      despesasFiltradas = despesasLista.filter(d => d.status !== 'Pago' && d.statusInfo.isAtrasado);
    } else if (filtroDespesas === 'pagas') {
      despesasFiltradas = despesasLista.filter(d => d.status === 'Pago');
    }

    contentArea.innerHTML = `
      <!-- Cards Resumo Financeiro (4 KPIs Principais) -->
      <div class="grid-cards-4">
        <div class="card">
          <div class="kpi-title">
            <span>Saldo Líquido em Caixa</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v12M15 9.5a2.5 2.5 0 0 0-5 0c0 4 5 2 5 6a2.5 2.5 0 0 1-5 0"></path></svg>
          </div>
          <div class="kpi-value ${saldoAtualCaixa >= 0 ? 'text-green' : 'text-red'}">${formatarMoeda(saldoAtualCaixa)}</div>
          <div class="kpi-desc">
            <span>Entradas: ${formatarMoeda(totalEntradasCaixa)} | Saídas: ${formatarMoeda(totalSaidasCaixa)}</span>
          </div>
        </div>

        <div class="card">
          <div class="kpi-title">
            <span>Contas a Pagar (Pendentes)</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <div class="kpi-value ${despesasAtrasadas.length > 0 ? 'text-red' : 'text-primary'}">${formatarMoeda(totalDespesasPendentes)}</div>
          <div class="kpi-desc">
            <span class="${despesasAtrasadas.length > 0 ? 'text-red' : 'text-gray-500'}">
              ${despesasPendentes.length} pendente(s)${despesasAtrasadas.length > 0 ? ` • ${despesasAtrasadas.length} em atraso (${formatarMoeda(totalDespesasAtrasadas)})` : ' • Todas no prazo'}
            </span>
          </div>
        </div>

        <div class="card">
          <div class="kpi-title">
            <span>Total a Receber (Clientes)</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div class="kpi-value text-green">${formatarMoeda(totalAReceber)}</div>
          <div class="kpi-desc">
            <span>Saldos a receber de pedidos abertos</span>
          </div>
        </div>

        <div class="card">
          <div class="kpi-title">
            <span>Lucro Líquido DRE</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div class="kpi-value ${lucroLiquidoOperacional >= 0 ? 'text-green' : 'text-red'}">${formatarMoeda(lucroLiquidoOperacional)}</div>
          <div class="kpi-desc">
            <span>Margem Contribuição - Despesas</span>
          </div>
        </div>
      </div>

      <!-- Gestão Completa de Contas a Pagar & Despesas da Fábrica -->
      <div class="card" style="margin-bottom: 24px;">
        <div class="table-header-bar" style="padding: 0 0 16px 0; flex-wrap: wrap; gap: 12px; align-items: center;">
          <div>
            <div class="table-title">Contas a Pagar & Gestão de Despesas</div>
            <span style="font-size: 11.5px; color: var(--text-gray-500);">
              Controle completo com vencimento (dia e mês), cálculo dinâmico de atraso em dias, quitação (dar baixa) e exclusão
            </span>
          </div>

          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <div style="display: flex; gap: 4px; background: var(--bg-subtle); padding: 3px; border-radius: var(--radius-sm); border: 1px solid var(--border-medium);">
              <button class="filter-btn-pill ${filtroDespesas === 'todas' ? 'active' : ''}" data-filtro="todas">
                Todas (${despesasLista.length})
              </button>
              <button class="filter-btn-pill ${filtroDespesas === 'pendentes' ? 'active' : ''}" data-filtro="pendentes">
                Pendentes (${despesasPendentes.length})
              </button>
              <button class="filter-btn-pill ${filtroDespesas === 'atrasadas' ? 'active' : ''}" data-filtro="atrasadas" style="${despesasAtrasadas.length > 0 ? 'color: #dc2626; font-weight: 700;' : ''}">
                ⚠️ Atrasadas (${despesasAtrasadas.length})
              </button>
              <button class="filter-btn-pill ${filtroDespesas === 'pagas' ? 'active' : ''}" data-filtro="pagas">
                ✓ Pagas (${despesasPagas.length})
              </button>
            </div>

            <button class="btn btn-primary btn-sm" id="btnNovaDespesa">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              + Nova Despesa
            </button>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="erp-table">
            <thead>
              <tr>
                <th style="min-width: 200px;">Descrição & Favorecido</th>
                <th>Categoria</th>
                <th>Vencimento (Dia / Mês)</th>
                <th>Valor (R$)</th>
                <th>Status / Atraso</th>
                <th>Forma / Tipo</th>
                <th style="text-align: right; min-width: 180px;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${despesasFiltradas.length > 0 ? despesasFiltradas.map(desp => `
                <tr>
                  <td>
                    <strong>${desp.descricao}</strong>
                    ${desp.fornecedorFavorecido ? `<div style="font-size: 11px; color: var(--text-gray-500);">Favorecido: ${desp.fornecedorFavorecido}</div>` : ''}
                    ${desp.observacoes ? `<div style="font-size: 10.5px; color: var(--text-gray-400); font-style: italic; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${desp.observacoes}</div>` : ''}
                  </td>
                  <td>
                    <span>${desp.categoria}</span>
                    <div style="font-size: 10px; color: var(--text-gray-500); text-transform: uppercase;">${desp.recorrencia || 'Mensal'}</div>
                  </td>
                  <td>
                    <strong style="font-size: 13px; color: var(--text-primary);">${formatarDiaMes(desp.dataVencimento)}</strong>
                    <div class="text-mono" style="font-size: 11px; color: var(--text-gray-500);">${formatarDataBr(desp.dataVencimento)}</div>
                  </td>
                  <td class="text-mono">
                    <strong class="${desp.status === 'Pago' ? 'text-green' : 'text-red'}" style="font-size: 13.5px;">${formatarMoeda(desp.valorReal)}</strong>
                    ${desp.valorPago && desp.valorPago !== desp.valorReal ? `<div class="text-mono text-green" style="font-size: 10.5px;">Pago: ${formatarMoeda(desp.valorPago)}</div>` : ''}
                  </td>
                  <td>
                    <div>${desp.statusInfo.badgeHtml}</div>
                    <div style="font-size: 10.5px; color: var(--text-gray-500); margin-top: 3px;">${desp.statusInfo.diasTexto}</div>
                  </td>
                  <td class="text-mono" style="font-size: 11.5px;">
                    ${desp.status === 'Pago' 
                      ? `${desp.formaPagamentoPago || desp.formaPagamentoPrevista || 'PIX'} <span style="color:#047857; font-weight:700;">(Baixado)</span>`
                      : (desp.formaPagamentoPrevista || 'Boleto')}
                  </td>
                  <td style="text-align: right;">
                    <div style="display: flex; gap: 5px; justify-content: flex-end; align-items: center;">
                      ${desp.status !== 'Pago' ? `
                        <button class="btn btn-green btn-sm btn-dar-baixa" data-id="${desp.id}" title="Registrar quitação e debitar do Caixa">
                          ✓ Dar Baixa
                        </button>
                      ` : `
                        <button class="btn btn-secondary btn-sm btn-estornar-baixa" data-id="${desp.id}" title="Estornar quitação e reabrir como pendente">
                          Estornar
                        </button>
                      `}
                      <button class="btn btn-secondary btn-sm btn-editar-despesa" data-id="${desp.id}" title="Editar campos da despesa">
                        Editar
                      </button>
                      <button class="btn btn-red btn-sm btn-excluir-despesa" data-id="${desp.id}" title="Excluir despesa do sistema">
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="7" style="text-align: center; padding: 45px 15px; color: var(--text-gray-500);">
                    <div style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
                      ${filtroDespesas === 'todas' ? 'Nenhuma despesa ou conta a pagar cadastrada' : `Nenhuma despesa encontrada no filtro "${filtroDespesas}"`}
                    </div>
                    <p style="font-size: 12px; margin-bottom: 14px;">
                      Cadastre as despesas e custos reais da fábrica (aluguel, energia, fornecedores, etc.) com vencimento e valor.
                    </p>
                    <button class="btn btn-primary btn-sm" id="btnNovaDespesaEmpty">+ Cadastrar Primeira Despesa</button>
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Livro Caixa: Entradas & Saídas Realizadas (Fluxo de Caixa) -->
      <div class="card" style="margin-bottom: 24px;">
        <div class="table-header-bar" style="padding: 0 0 14px 0;">
          <div>
            <div class="table-title">Livro Caixa & Fluxo Financeiro (Entradas e Saídas Efetivadas)</div>
            <span style="font-size: 11px; color: var(--text-gray-500);">
              Movimentações em tempo real: recebimento de sinais de clientes e baixas de pagamentos
            </span>
          </div>
          <button class="btn btn-secondary btn-sm" id="btnNovoLancamentoManual">+ Novo Lançamento Manual</button>
        </div>

        <div class="table-wrapper">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Descrição / Favorecido</th>
                <th>Forma de Pagamento</th>
                <th style="text-align: right;">Valor</th>
                <th style="text-align: right; width: 80px;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${(db.lancamentosFinanceiros || []).length > 0 ? db.lancamentosFinanceiros.map(lan => `
                <tr>
                  <td class="text-mono" style="font-size: 11px;">${lan.data}</td>
                  <td>
                    <span class="status-pill ${(lan.tipo === 'Entrada' || lan.tipo === 'Receita') ? 'status-green' : 'status-red'}" style="font-size: 9.5px;">
                      ${lan.tipo.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <strong>${lan.cliente || lan.favorecido || 'TexPro'}</strong>
                    <span style="display: block; font-size: 11px; color: var(--text-gray-500);">${lan.descricao}</span>
                  </td>
                  <td class="text-mono" style="font-size: 11px;">${lan.formaPagamento}</td>
                  <td class="text-mono ${(lan.tipo === 'Entrada' || lan.tipo === 'Receita') ? 'text-green' : 'text-red'}" style="text-align: right; font-weight: 700;">
                    ${(lan.tipo === 'Entrada' || lan.tipo === 'Receita') ? '+' : '-'} ${formatarMoeda(lan.valor)}
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-red btn-xs btn-excluir-lancamento" data-id="${lan.id}" title="Excluir este lançamento">
                      Excluir
                    </button>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="6" style="text-align: center; padding: 35px 10px; color: var(--text-gray-500);">
                    Nenhuma movimentação no caixa ainda. Conforme pedidos receberem sinal ou despesas forem baixadas, as movimentações aparecerão aqui.
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Estrutura Formal da DRE Industrial -->
      <div class="card">
        <div class="table-header-bar" style="padding: 0 0 14px 0;">
          <div>
            <div class="table-title">DRE - Demonstração do Resultado do Exercício Têxtil</div>
            <span style="font-size: 11px; color: var(--text-gray-500);">Estrutura contábil industrial padrão com deduções, CMV e despesas operacionais</span>
          </div>
          
          <button class="btn btn-primary btn-sm" id="btnEmitirRelatorioDRE">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Emitir Relatório DRE & Balanço (PDF/Impressão)
          </button>
        </div>

        <table class="dre-table">
          <tbody>
            <tr class="dre-row-header">
              <td>1. RECEITA OPERACIONAL BRUTA (Vendas de Uniformes)</td>
              <td class="text-mono" style="text-align: right;">${formatarMoeda(receitaBruta)}</td>
              <td class="text-mono" style="text-align: right; width: 100px;">100.0%</td>
            </tr>
            <tr class="dre-row-sub">
              <td>(-) Deduções da Receita & Tributos (DAS Simples Nacional ~6.5%)</td>
              <td class="text-mono text-red" style="text-align: right;">- ${formatarMoeda(impostosDeducoes)}</td>
              <td class="text-mono" style="text-align: right;">6.5%</td>
            </tr>
            <tr class="dre-row-total">
              <td>(=) RECEITA OPERACIONAL LÍQUIDA</td>
              <td class="text-mono" style="text-align: right;">${formatarMoeda(receitaLiquida)}</td>
              <td class="text-mono" style="text-align: right;">${(100 - 6.5).toFixed(1)}%</td>
            </tr>
            <tr class="dre-row-header">
              <td>2. (-) CUSTO DAS MERCADORIAS VENDIDAS (CMV DIRETO)</td>
              <td class="text-mono text-red" style="text-align: right;">- ${formatarMoeda(cmvTotal)}</td>
              <td class="text-mono" style="text-align: right;">${receitaLiquida > 0 ? ((cmvTotal / receitaLiquida) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr class="dre-row-sub-2">
              <td>• Malhas, Tecidos Planos e Linhas de Corte</td>
              <td class="text-mono text-gray-500" style="text-align: right;">- ${formatarMoeda(cmvTotal * 0.55)}</td>
              <td></td>
            </tr>
            <tr class="dre-row-sub-2">
              <td>• Mão de Obra de Costura (Facções Externas e Oficinas)</td>
              <td class="text-mono text-gray-500" style="text-align: right;">- ${formatarMoeda(cmvTotal * 0.25)}</td>
              <td></td>
            </tr>
            <tr class="dre-row-sub-2">
              <td>• Suprimentos DTF, Bordado, Serigrafia e Aviamentos</td>
              <td class="text-mono text-gray-500" style="text-align: right;">- ${formatarMoeda(cmvTotal * 0.20)}</td>
              <td></td>
            </tr>
            <tr class="dre-row-total">
              <td>(=) MARGEM DE CONTRIBUIÇÃO / LUCRO BRUTO</td>
              <td class="text-mono text-green" style="text-align: right;">${formatarMoeda(margemContribuicao)}</td>
              <td class="text-mono" style="text-align: right;">${margemContribuicaoPerc.toFixed(1)}%</td>
            </tr>
            <tr class="dre-row-header">
              <td>3. (-) DESPESAS OPERACIONAIS FIXAS DA FÁBRICA</td>
              <td class="text-mono text-red" style="text-align: right;">- ${formatarMoeda(totalDespesasFixasDRE)}</td>
              <td class="text-mono" style="text-align: right;">${receitaLiquida > 0 ? ((totalDespesasFixasDRE / receitaLiquida) * 100).toFixed(1) : 0}%</td>
            </tr>
            ${despesasLista.length > 0 ? despesasLista.map(d => `
              <tr class="dre-row-sub-2">
                <td>• ${d.descricao} (${d.categoria}) ${d.status === 'Pago' ? '<span style="color:#047857; font-weight:bold; font-size:10px;">[QUITADO]</span>' : '<span style="color:#dc2626; font-size:10px;">[PENDENTE]</span>'}</td>
                <td class="text-mono text-gray-500" style="text-align: right;">- ${formatarMoeda(d.valorReal)}</td>
                <td></td>
              </tr>
            `).join('') : `
              <tr class="dre-row-sub-2">
                <td colspan="3" style="color: var(--text-gray-500); font-style: italic;">Nenhuma despesa operacional cadastrada no momento.</td>
              </tr>
            `}
            <tr class="dre-row-lucro">
              <td>(=) LUCRO LÍQUIDO OPERACIONAL DO EXERCÍCIO (EBITDA)</td>
              <td class="text-mono" style="text-align: right; font-size: 15px;">${formatarMoeda(lucroLiquidoOperacional)}</td>
              <td class="text-mono" style="text-align: right;">${receitaLiquida > 0 ? ((lucroLiquidoOperacional / receitaLiquida) * 100).toFixed(1) : 0}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    // Listeners de Filtro
    document.querySelectorAll('.filter-btn-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        filtroDespesas = btn.getAttribute('data-filtro') || 'todas';
        renderizarFinanceiro();
      });
    });

    // Listeners de Ações Gerais
    document.getElementById('btnNovaDespesa')?.addEventListener('click', () => abrirModalDespesa());
    document.getElementById('btnNovaDespesaEmpty')?.addEventListener('click', () => abrirModalDespesa());
    document.getElementById('btnEmitirRelatorioDRE')?.addEventListener('click', abrirModalRelatorioDRE);
    document.getElementById('btnNovoLancamentoManual')?.addEventListener('click', abrirModalNovoLancamentoManual);

    // Listeners de Cada Linha de Despesa
    document.querySelectorAll('.btn-dar-baixa').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        abrirModalDarBaixaDespesa(id);
      });
    });

    document.querySelectorAll('.btn-estornar-baixa').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        estornarBaixaDespesa(id);
      });
    });

    document.querySelectorAll('.btn-editar-despesa').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const desp = (db.despesasFixas || []).find(d => d.id === id);
        if (desp) abrirModalDespesa(desp);
      });
    });

    document.querySelectorAll('.btn-excluir-despesa').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        excluirDespesa(id);
      });
    });

    // Listener para Excluir Lançamento do Caixa
    document.querySelectorAll('.btn-excluir-lancamento').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        excluirLancamentoCaixa(id);
      });
    });
  }

  // Modal: Cadastrar ou Editar Despesa com Todos os Campos
  function abrirModalDespesa(despesaParaEditar = null) {
    if (!modalContainer) return;

    const isEdit = !!despesaParaEditar;
    const desp = despesaParaEditar || {
      descricao: '',
      categoria: 'Instalações',
      valor: '',
      dataVencimento: new Date().toISOString().split('T')[0],
      formaPagamentoPrevista: 'Boleto Bancário',
      recorrencia: 'Mensal',
      fornecedorFavorecido: '',
      observacoes: ''
    };

    const modalEl = criarModalCamada(`
      <div class="modal-overlay active">
        <div class="modal-box" style="max-width: 580px;">
          <div class="modal-header">
            <div>
              <div class="modal-title">${isEdit ? 'Editar Conta / Despesa' : 'Cadastrar Nova Despesa / Conta a Pagar'}</div>
              <div style="font-size: 11.5px; color: var(--text-gray-500); margin-top: 2px;">
                Preencha todos os dados: vencimento (dia e mês), fornecedor, categoria e valor
              </div>
            </div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Descrição da Despesa *</label>
              <input type="text" id="despDescricao" class="form-input" placeholder="Ex: Aluguel do Galpão, Conta de Luz (Enel), Fio de Costura" value="${desp.descricao || ''}">
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Categoria de Custo *</label>
                <select id="despCategoria" class="form-select">
                  <option value="Instalações" ${desp.categoria === 'Instalações' ? 'selected' : ''}>Instalações (Aluguel, IPTU, Condomínio)</option>
                  <option value="Utilidades" ${desp.categoria === 'Utilidades' ? 'selected' : ''}>Utilidades (Energia, Água, Gás)</option>
                  <option value="Fornecedores Malhas" ${desp.categoria === 'Fornecedores Malhas' ? 'selected' : ''}>Fornecedores (Malhas e Tecidos)</option>
                  <option value="Aviamentos" ${desp.categoria === 'Aviamentos' ? 'selected' : ''}>Aviamentos (Zíperes, Linhas, Botões)</option>
                  <option value="Mão de Obra Fixa" ${desp.categoria === 'Mão de Obra Fixa' ? 'selected' : ''}>Mão de Obra Fixa (Salários, Encargos)</option>
                  <option value="Facções Externas" ${desp.categoria === 'Facções Externas' ? 'selected' : ''}>Facções Externas (Costura Terceirizada)</option>
                  <option value="Manutenção" ${desp.categoria === 'Manutenção' ? 'selected' : ''}>Manutenção Máquinas & Equipamentos</option>
                  <option value="Comunicação" ${desp.categoria === 'Comunicação' ? 'selected' : ''}>Comunicação / Internet / Telefonia</option>
                  <option value="Serviços Terceiros" ${desp.categoria === 'Serviços Terceiros' ? 'selected' : ''}>Serviços Terceiros / Contabilidade / Software</option>
                  <option value="Tributos" ${desp.categoria === 'Tributos' ? 'selected' : ''}>Tributos & Impostos (DAS Simples Nacional)</option>
                  <option value="Outras Despesas" ${desp.categoria === 'Outras Despesas' ? 'selected' : ''}>Outras Despesas Operacionais</option>
                </select>
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Valor (R$) *</label>
                <input type="number" id="despValor" class="form-input text-mono" step="0.01" min="0" placeholder="0.00" value="${desp.valor !== undefined ? desp.valor : (desp.valorMensal || '')}">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Data de Vencimento (Dia / Mês) *</label>
                <input type="date" id="despVencimento" class="form-input text-mono" value="${desp.dataVencimento ? desp.dataVencimento.split('T')[0] : ''}">
                <div style="font-size: 11px; color: var(--text-gray-500); margin-top: 3px;">
                  O sistema calculará atraso em dias e alertará automaticamente
                </div>
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Forma Prevista de Pagamento</label>
                <select id="despForma" class="form-select">
                  <option value="Boleto Bancário" ${desp.formaPagamentoPrevista === 'Boleto Bancário' ? 'selected' : ''}>Boleto Bancário</option>
                  <option value="PIX" ${desp.formaPagamentoPrevista === 'PIX' ? 'selected' : ''}>PIX</option>
                  <option value="Cartão de Crédito" ${desp.formaPagamentoPrevista === 'Cartão de Crédito' ? 'selected' : ''}>Cartão de Crédito</option>
                  <option value="Transferência Bancária" ${desp.formaPagamentoPrevista === 'Transferência Bancária' ? 'selected' : ''}>Transferência Bancária</option>
                  <option value="Dinheiro" ${desp.formaPagamentoPrevista === 'Dinheiro' ? 'selected' : ''}>Dinheiro em Espécie</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Recorrência</label>
                <select id="despRecorrencia" class="form-select">
                  <option value="Mensal" ${desp.recorrencia === 'Mensal' ? 'selected' : ''}>Mensal Recorrente</option>
                  <option value="Avulsa" ${desp.recorrencia === 'Avulsa' ? 'selected' : ''}>Avulsa / Única</option>
                  <option value="Anual" ${desp.recorrencia === 'Anual' ? 'selected' : ''}>Anual</option>
                </select>
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Favorecido / Fornecedor (Opcional)</label>
                <input type="text" id="despFavorecido" class="form-input" placeholder="Ex: Imobiliária, Concessionária, Fornecedor X" value="${desp.fornecedorFavorecido || ''}">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Observações / Detalhes</label>
              <textarea id="despObs" class="form-input" rows="2" placeholder="Informações adicionais, código de barras, número da NF de compra...">${desp.observacoes || ''}</textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.ERP.fecharModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btnSalvarDespesaModal">
              ${isEdit ? 'Salvar Alterações' : 'Cadastrar Despesa'}
            </button>
          </div>
        </div>
      </div>
    `);

    document.getElementById('btnSalvarDespesaModal')?.addEventListener('click', () => {
      const desc = document.getElementById('despDescricao')?.value.trim();
      const cat = document.getElementById('despCategoria')?.value;
      const val = parseFloat(document.getElementById('despValor')?.value || 0);
      const venc = document.getElementById('despVencimento')?.value;
      const forma = document.getElementById('despForma')?.value;
      const rec = document.getElementById('despRecorrencia')?.value;
      const fav = document.getElementById('despFavorecido')?.value.trim();
      const obs = document.getElementById('despObs')?.value.trim();

      if (!desc) {
        mostrarToast('Informe a descrição da despesa.', 'red');
        return;
      }
      if (isNaN(val) || val <= 0) {
        mostrarToast('Informe um valor monetário válido maior que zero.', 'red');
        return;
      }
      if (!venc) {
        mostrarToast('Informe a data de vencimento com dia e mês.', 'red');
        return;
      }

      if (isEdit) {
        desp.descricao = desc;
        desp.categoria = cat;
        desp.valor = val;
        desp.valorMensal = val;
        desp.dataVencimento = venc;
        desp.formaPagamentoPrevista = forma;
        desp.recorrencia = rec;
        desp.fornecedorFavorecido = fav;
        desp.observacoes = obs;
        mostrarToast(`Despesa "${desc}" atualizada com sucesso!`, 'green');
      } else {
        const novaDesp = {
          id: `DESP-${Date.now().toString().slice(-6)}`,
          descricao: desc,
          categoria: cat,
          valor: val,
          valorMensal: val,
          dataVencimento: venc,
          formaPagamentoPrevista: forma,
          recorrencia: rec,
          fornecedorFavorecido: fav,
          observacoes: obs,
          status: 'Pendente',
          dataPagamento: null,
          valorPago: null,
          formaPagamentoPago: null,
          comprovanteDoc: null,
          lancamentoId: null
        };
        if (!Array.isArray(db.despesasFixas)) db.despesasFixas = [];
        db.despesasFixas.unshift(novaDesp);
        mostrarToast(`Despesa "${desc}" cadastrada com vencimento em ${formatarDiaMes(venc)}!`, 'green');
      }

      salvarEstado();
      fecharModal(modalEl);
      renderizarFinanceiro();
    });
  }

  // Modal: Dar Baixa em Pagamento de Despesa
  function abrirModalDarBaixaDespesa(despesaId) {
    const desp = (db.despesasFixas || []).find(d => d.id === despesaId);
    if (!desp) return;

    const hojeIso = new Date().toISOString().split('T')[0];
    const valorOriginal = Number(desp.valor !== undefined ? desp.valor : desp.valorMensal) || 0;

    const modalEl = criarModalCamada(`
      <div class="modal-overlay active">
        <div class="modal-box" style="max-width: 520px;">
          <div class="modal-header">
            <div>
              <div class="modal-title">Dar Baixa em Despesa / Conta a Pagar</div>
              <div style="font-size: 11.5px; color: var(--text-gray-500); margin-top: 2px;">
                Quitação financeira e débito imediato no Livro Caixa
              </div>
            </div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div style="background: #f8fafc; border: 1px solid var(--border-medium); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 16px;">
              <div style="font-size: 14px; font-weight: 700; color: var(--text-primary);">${desp.descricao}</div>
              <div style="font-size: 12px; color: var(--text-gray-600); margin-top: 4px; display: flex; gap: 14px; flex-wrap: wrap;">
                <span><strong>Categoria:</strong> ${desp.categoria}</span>
                <span><strong>Vencimento:</strong> ${formatarDiaMes(desp.dataVencimento)} (${formatarDataBr(desp.dataVencimento)})</span>
                ${desp.fornecedorFavorecido ? `<span><strong>Favorecido:</strong> ${desp.fornecedorFavorecido}</span>` : ''}
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Data do Pagamento *</label>
                <input type="date" id="baixaData" class="form-input text-mono" value="${hojeIso}">
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Valor Pago (R$) *</label>
                <input type="number" id="baixaValor" class="form-input text-mono" step="0.01" value="${valorOriginal.toFixed(2)}">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Forma de Pagamento *</label>
                <select id="baixaForma" class="form-select">
                  <option value="PIX">PIX</option>
                  <option value="Boleto Bancário">Boleto Bancário</option>
                  <option value="Transferência Bancária">Transferência / TED</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Dinheiro">Dinheiro em Espécie</option>
                </select>
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Comprovante / Autenticação (Opcional)</label>
                <input type="text" id="baixaComprovante" class="form-input" placeholder="Ex: Autenticação #98214">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Observações da Quitação</label>
              <input type="text" id="baixaObs" class="form-input" placeholder="Ex: Pago com desconto pontualidade ou juros">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.ERP.fecharModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btnConfirmarBaixa">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Confirmar Quitação & Baixar
            </button>
          </div>
        </div>
      </div>
    `);

    document.getElementById('btnConfirmarBaixa')?.addEventListener('click', () => {
      const dataPagto = document.getElementById('baixaData')?.value || hojeIso;
      const valorPago = parseFloat(document.getElementById('baixaValor')?.value || 0);
      const formaPagto = document.getElementById('baixaForma')?.value || 'PIX';
      const comprovante = document.getElementById('baixaComprovante')?.value || '';
      const obs = document.getElementById('baixaObs')?.value || '';

      if (isNaN(valorPago) || valorPago <= 0) {
        mostrarToast('Informe um valor pago válido superior a zero.', 'red');
        return;
      }

      desp.status = 'Pago';
      desp.dataPagamento = dataPagto;
      desp.valorPago = valorPago;
      desp.formaPagamentoPago = formaPagto;
      desp.comprovanteDoc = comprovante;
      if (obs) {
        desp.observacoes = desp.observacoes ? `${desp.observacoes} | ${obs}` : obs;
      }

      // Sincronizar automaticamente criando lançamento de Saída no Livro Caixa
      const novoLancamento = {
        id: `LAN-${Date.now()}`,
        data: formatarDataBr(dataPagto),
        tipo: 'Saida',
        cliente: desp.fornecedorFavorecido || desp.descricao,
        descricao: `Baixa Despesa: ${desp.descricao} (${desp.categoria})`,
        formaPagamento: formaPagto,
        valor: valorPago,
        despesaId: desp.id
      };
      if (!Array.isArray(db.lancamentosFinanceiros)) db.lancamentosFinanceiros = [];
      db.lancamentosFinanceiros.unshift(novoLancamento);
      desp.lancamentoId = novoLancamento.id;

      // Sincronizar com o mês atual do histórico financeiro se existir
      const mesAtual = db.historicoFinanceiroMensal?.find(h => h.isAtual);
      if (mesAtual) {
        mesAtual.saidas = (Number(mesAtual.saidas) || 0) + valorPago;
      }

      salvarEstado();
      fecharModal(modalEl);
      renderizarFinanceiro();
      mostrarToast(`Pagamento de ${formatarMoeda(valorPago)} ("${desp.descricao}") baixado e debitado do Caixa!`, 'green');
    });
  }

  // Estornar Baixa
  function estornarBaixaDespesa(despesaId) {
    const desp = (db.despesasFixas || []).find(d => d.id === despesaId);
    if (!desp) return;

    if (confirm(`Deseja estornar a baixa de "${desp.descricao}"?\nA despesa voltará para Pendente e o débito no Caixa será removido.`)) {
      const valorEstornado = Number(desp.valorPago || desp.valor || desp.valorMensal) || 0;

      // Remover lançamento financeiro correspondente
      if (Array.isArray(db.lancamentosFinanceiros)) {
        db.lancamentosFinanceiros = db.lancamentosFinanceiros.filter(l => l.id !== desp.lancamentoId && l.despesaId !== desp.id);
      }

      // Reverter o mês atual do histórico se houver
      const mesAtual = db.historicoFinanceiroMensal?.find(h => h.isAtual);
      if (mesAtual && mesAtual.saidas >= valorEstornado) {
        mesAtual.saidas = Math.max(0, mesAtual.saidas - valorEstornado);
      }

      desp.status = 'Pendente';
      desp.dataPagamento = null;
      desp.valorPago = null;
      desp.formaPagamentoPago = null;
      desp.comprovanteDoc = null;
      desp.lancamentoId = null;

      salvarEstado();
      renderizarFinanceiro();
      mostrarToast(`Baixa estornada. "${desp.descricao}" reaberta como pendente.`, 'green');
    }
  }

  // Excluir Despesa
  function excluirDespesa(despesaId) {
    const desp = (db.despesasFixas || []).find(d => d.id === despesaId);
    if (!desp) return;

    if (confirm(`Deseja realmente excluir a despesa "${desp.descricao}"?\nEsta ação removerá o registro do sistema.`)) {
      // Se estava paga, remover o lançamento do livro caixa
      if (Array.isArray(db.lancamentosFinanceiros)) {
        db.lancamentosFinanceiros = db.lancamentosFinanceiros.filter(l => l.id !== desp.lancamentoId && l.despesaId !== desp.id);
      }

      db.despesasFixas = db.despesasFixas.filter(d => d.id !== despesaId);
      salvarEstado();
      renderizarFinanceiro();
      mostrarToast(`Despesa "${desp.descricao}" removida com sucesso.`, 'green');
    }
  }

  // Excluir Lançamento do Caixa
  function excluirLancamentoCaixa(lanId) {
    const lan = (db.lancamentosFinanceiros || []).find(l => l.id === lanId);
    if (!lan) return;

    if (confirm(`Deseja remover o lançamento "${lan.descricao}" de ${formatarMoeda(lan.valor)}?`)) {
      db.lancamentosFinanceiros = db.lancamentosFinanceiros.filter(l => l.id !== lanId);
      if (lan.despesaId) {
        const desp = (db.despesasFixas || []).find(d => d.id === lan.despesaId);
        if (desp && desp.status === 'Pago') {
          desp.status = 'Pendente';
          desp.dataPagamento = null;
          desp.valorPago = null;
          desp.lancamentoId = null;
        }
      }
      salvarEstado();
      renderizarFinanceiro();
      mostrarToast('Lançamento removido do Caixa com sucesso.', 'green');
    }
  }

  function abrirModalNovoLancamentoManual() {
    if (!modalContainer) return;

    const modalEl = criarModalCamada(`
      <div class="modal-overlay active">
        <div class="modal-box" style="max-width: 520px;">
          <div class="modal-header">
            <div class="modal-title">Novo Lançamento Manual no Caixa</div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Tipo de Movimento</label>
                <select id="lanTipo" class="form-select">
                  <option value="Entrada">Entrada (+) Recebimento</option>
                  <option value="Saida">Saída (-) Pagamento</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Forma de Pagamento</label>
                <select id="lanForma" class="form-select">
                  <option value="PIX">PIX</option>
                  <option value="Boleto">Boleto Bancário</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão">Cartão</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Cliente / Fornecedor / Favorecido</label>
              <input type="text" id="lanCliente" class="form-input" placeholder="Ex: Ferragens Central Ltda">
            </div>

            <div class="form-group">
              <label class="form-label">Descrição do Lançamento</label>
              <input type="text" id="lanDesc" class="form-input" placeholder="Ex: Compra de fita isolante e lubrificante singer">
            </div>

            <div class="form-group">
              <label class="form-label">Valor (R$)</label>
              <input type="number" id="lanValor" class="form-input" value="150.00" step="10.00">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.ERP.fecharModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btnSalvarLancamentoManual">Registrar no Caixa</button>
          </div>
        </div>
      </div>
    `);

    document.getElementById('btnSalvarLancamentoManual')?.addEventListener('click', () => {
      const tipo = document.getElementById('lanTipo')?.value;
      const forma = document.getElementById('lanForma')?.value;
      const cliente = document.getElementById('lanCliente')?.value || "Geral";
      const desc = document.getElementById('lanDesc')?.value || "Lançamento Avulso";
      const valor = parseFloat(document.getElementById('lanValor')?.value || 0);

      if (valor <= 0) {
        mostrarToast('Informe um valor válido.', 'red');
        return;
      }

      db.lancamentosFinanceiros.unshift({
        id: `LAN-${Math.floor(100 + Math.random() * 900)}`,
        data: new Date().toISOString().split('T')[0],
        tipo: tipo,
        descricao: desc,
        cliente: cliente,
        valor: valor,
        formaPagamento: forma,
        categoria: "Lançamento Manual"
      });

      salvarEstado();
      fecharModal(modalEl);
      renderizarFinanceiro();
      mostrarToast(`Lançamento de ${formatarMoeda(valor)} registrado com sucesso!`, 'green');
    });
  }

  function abrirModalRelatorioDRE() {
    if (!modalContainer) return;

    const pedidosOficiais = db.pedidos.filter(p => p.status !== 'Cancelado' && p.tipoRegistro !== 'Orcamento');
    const receitaBruta = pedidosOficiais.reduce((acc, p) => acc + p.valorTotalVenda, 0);
    const impostosDeducoes = receitaBruta * 0.065;
    const receitaLiquida = receitaBruta - impostosDeducoes;
    const cmvTotal = pedidosOficiais.reduce((acc, p) => acc + p.custoTotalEstimado, 0);
    const margemContribuicao = receitaLiquida - cmvTotal;
    const totalDespesasFixas = db.despesasFixas.reduce((acc, d) => acc + d.valorMensal, 0);
    const lucroLiquidoOperacional = margemContribuicao - totalDespesasFixas;

    const modalEl = criarModalCamada(`
      <div class="modal-overlay active">
        <div class="modal-box a4-print-sheet" style="max-width: 800px;">
          <div class="modal-header">
            <div class="modal-title">Relatório Gerencial DRE & Balanço Contábil</div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>

          <div class="modal-body" style="font-size: 12.5px; color: #0f172a;">
            <div style="border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 14px; display: flex; justify-content: space-between;">
              <div>
                <h2 style="font-size: 18px; font-weight: 800;">${db.empresa.razaoSocial}</h2>
                <div style="font-size: 11px; color: var(--text-gray-600);">
                  CNPJ: ${db.empresa.cnpj} • Inscrição Estadual: ${db.empresa.ie}<br>
                  ${db.empresa.endereco} - ${db.empresa.cidade}/${db.empresa.uf}
                </div>
              </div>
              <div style="text-align: right;">
                <span class="status-pill status-gray">RELATÓRIO DRE CONSOLIDADO</span>
                <div style="font-size: 11px; color: var(--text-gray-500); margin-top: 4px;">Gerado em: ${new Date().toLocaleDateString('pt-BR')}</div>
              </div>
            </div>

            <table class="dre-table" style="margin-bottom: 20px;">
              <tbody>
                <tr class="dre-row-header">
                  <td>1. RECEITA OPERACIONAL BRUTA DE VENDAS</td>
                  <td class="text-mono" style="text-align: right;">${formatarMoeda(receitaBruta)}</td>
                </tr>
                <tr class="dre-row-sub">
                  <td>(-) Tributos Sobre Vendas (Simples Nacional DAS)</td>
                  <td class="text-mono text-red" style="text-align: right;">- ${formatarMoeda(impostosDeducoes)}</td>
                </tr>
                <tr class="dre-row-total">
                  <td>(=) RECEITA OPERACIONAL LÍQUIDA</td>
                  <td class="text-mono" style="text-align: right;">${formatarMoeda(receitaLiquida)}</td>
                </tr>
                <tr class="dre-row-header">
                  <td>2. (-) CUSTOS DAS MERCADORIAS VENDIDAS (CMV)</td>
                  <td class="text-mono text-red" style="text-align: right;">- ${formatarMoeda(cmvTotal)}</td>
                </tr>
                <tr class="dre-row-total">
                  <td>(=) LUCRO BRUTO / MARGEM DE CONTRIBUIÇÃO</td>
                  <td class="text-mono text-green" style="text-align: right;">${formatarMoeda(margemContribuicao)}</td>
                </tr>
                <tr class="dre-row-header">
                  <td>3. (-) DESPESAS OPERACIONAIS FIXAS</td>
                  <td class="text-mono text-red" style="text-align: right;">- ${formatarMoeda(totalDespesasFixas)}</td>
                </tr>
                ${db.despesasFixas.map(d => `
                  <tr class="dre-row-sub-2">
                    <td>• ${d.descricao}</td>
                    <td class="text-mono" style="text-align: right;">- ${formatarMoeda(d.valorMensal)}</td>
                  </tr>
                `).join('')}
                <tr class="dre-row-lucro">
                  <td>(=) LUCRO LÍQUIDO OPERACIONAL DO EXERCÍCIO (EBITDA)</td>
                  <td class="text-mono" style="text-align: right; font-size: 15px;">${formatarMoeda(lucroLiquidoOperacional)}</td>
                </tr>
              </tbody>
            </table>

            <div style="font-size: 11px; color: var(--text-gray-500); text-align: center; border-top: 1px dashed var(--border-medium); padding-top: 10px;">
              Documento contábil emitido eletronicamente pelo Sistema TexPro Industrial ERP.
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.ERP.fecharModal()">Fechar</button>
            <button type="button" class="btn btn-primary" onclick="window.print()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Imprimir Relatório DRE (A4)
            </button>
          </div>
        </div>
      </div>
    `);
  }

  /* ==========================================================================
     MÓDULO 8: COMPRAS & LANÇAMENTOS AVULSOS
     ========================================================================== */
  function renderizarCompras() {
    pageTitleElem.textContent = 'Gestão de Compras & Suprimentos Têxteis';
    pageBreadcrumbElem.textContent = 'SISTEMA > COMPRAS';

    contentArea.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <p style="color: var(--text-gray-500);">Compras sincronizadas com o estoque e lançamentos avulsos de manutenção e consumíveis da fábrica.</p>
        <button class="btn btn-primary" id="btnNovaCompraAvulsa">
          + Nova Compra / Lançamento Avulso (ex: Fita Isolante)
        </button>
      </div>

      <div class="table-wrapper">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Código Compra</th>
              <th>Data</th>
              <th>Fornecedor</th>
              <th>Itens Comprados</th>
              <th>Categoria</th>
              <th>Valor Total</th>
              <th>Status</th>
              <th>Estoque</th>
            </tr>
          </thead>
          <tbody>
            ${db.compras.length ? db.compras.map(c => `
              <tr>
                <td class="text-mono"><strong>${c.id}</strong></td>
                <td class="text-mono">${c.data}</td>
                <td><strong>${c.fornecedor}</strong></td>
                <td>${c.itens}</td>
                <td>${c.categoria}</td>
                <td class="text-mono"><strong>${formatarMoeda(c.valorTotal)}</strong></td>
                <td>
                  <span class="status-pill ${c.status === 'Entregue' ? 'status-green' : 'status-gray'}">
                    ${c.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <span class="status-pill ${c.lancadoEstoque ? 'status-green' : 'status-gray'}">
                    ${c.lancadoEstoque ? 'ESTOQUE OK' : 'AVULSO'}
                  </span>
                </td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="8" style="text-align: center; padding: 40px 20px; color: var(--text-gray-500);">
                  Nenhum pedido de compra registrado. Clique em "+ Nova Compra / Lançamento Avulso" para registrar entradas de materiais ou insumos da fábrica.
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('btnNovaCompraAvulsa')?.addEventListener('click', abrirModalNovaCompraAvulsa);
  }

  function abrirModalNovaCompraAvulsa() {
    if (!modalContainer) return;

    const modalEl = criarModalCamada(`
      <div class="modal-overlay active">
        <div class="modal-box" style="max-width: 580px;">
          <div class="modal-header">
            <div>
              <div class="modal-title">Nova Compra ou Lançamento Avulso de Fábrica</div>
              <span style="font-size: 11px; color: var(--text-gray-500);">Para compras pontuais tipo fita isolante, peças de reposição ou material de limpeza</span>
            </div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>

          <div class="modal-body">
            <div class="form-row">
              <div class="form-group" style="flex: 2;">
                <label class="form-label">Fornecedor / Estabelecimento</label>
                <input type="text" id="comFornecedor" class="form-input" value="Eletro Ferragens Americana" placeholder="Nome da loja ou fornecedor">
              </div>

              <div class="form-group" style="flex: 1;">
                <label class="form-label">Categoria de Despesa</label>
                <select id="comCategoria" class="form-select">
                  <option value="Manutenção Fábrica">Manutenção Fábrica</option>
                  <option value="Aviamentos">Aviamentos</option>
                  <option value="Insumos DTF">Insumos DTF</option>
                  <option value="Matéria-Prima">Matéria-Prima</option>
                  <option value="Material de Escritório">Material de Escritório</option>
                  <option value="Limpeza & Higiene">Limpeza & Higiene</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Descrição Exata dos Itens Comprados</label>
              <textarea id="comDescricao" class="form-textarea" rows="3" placeholder="Ex: 5 rolos de fita isolante 3M, 1L óleo de máquina singer e pacote de agulhas DBx1"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Valor Total Pago (R$)</label>
                <input type="number" id="comValorTotal" class="form-input" style="font-weight: 800; font-size: 14px;" value="185.00" step="5.00">
              </div>

              <div class="form-group">
                <label class="form-label">Forma de Pagamento</label>
                <select id="comFormaPagamento" class="form-select">
                  <option value="PIX">PIX</option>
                  <option value="Dinheiro">Dinheiro em Espécie</option>
                  <option value="Cartão Corporativo">Cartão de Crédito</option>
                  <option value="Boleto">Boleto</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Status da Entrega</label>
                <select id="comStatusEntrega" class="form-select">
                  <option value="Entregue">Entregue / Em Mãos</option>
                  <option value="A Caminho">A Caminho</option>
                </select>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.ERP.fecharModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btnSalvarCompraAvulsa">Registrar Compra e Debitar no Financeiro</button>
          </div>
        </div>
      </div>
    `);

    document.getElementById('btnSalvarCompraAvulsa')?.addEventListener('click', () => {
      const fornecedor = document.getElementById('comFornecedor')?.value || "Fornecedor";
      const cat = document.getElementById('comCategoria')?.value || "Manutenção Fábrica";
      const itens = document.getElementById('comDescricao')?.value;
      const valor = parseFloat(document.getElementById('comValorTotal')?.value || 0);
      const forma = document.getElementById('comFormaPagamento')?.value || "PIX";
      const status = document.getElementById('comStatusEntrega')?.value || "Entregue";

      if (!itens || valor <= 0) {
        mostrarToast('Descreva os itens e informe o valor da compra.', 'red');
        return;
      }

      const novaCompra = {
        id: `COM-${Math.floor(510 + db.compras.length)}`,
        data: new Date().toISOString().split('T')[0],
        fornecedor: fornecedor,
        categoria: cat,
        itens: itens,
        valorTotal: valor,
        status: status,
        previsaoChegada: new Date().toISOString().split('T')[0],
        lancadoEstoque: false
      };

      db.compras.unshift(novaCompra);

      // Debita no Financeiro
      db.lancamentosFinanceiros.unshift({
        id: `LAN-${Math.floor(100 + Math.random() * 900)}`,
        data: new Date().toISOString().split('T')[0],
        tipo: "Saida",
        descricao: `Compra: ${itens}`,
        cliente: fornecedor,
        valor: valor,
        formaPagamento: forma,
        categoria: cat
      });

      salvarEstado();
      fecharModal(modalEl);
      renderizarCompras();
      mostrarToast(`Compra avulsa de ${formatarMoeda(valor)} registrada e debitada no Financeiro!`, 'green');
    });
  }

  /* ==========================================================================
     MÓDULO 9: CLIENTES (CRM TÊXTIL COM DADOS COMPLETOS E OBRIGATÓRIOS)
     ========================================================================== */
  function renderizarClientes() {
    pageTitleElem.textContent = 'Gestão de Clientes & CRM Têxtil';
    pageBreadcrumbElem.textContent = 'SISTEMA > CLIENTES';

    contentArea.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <p style="color: var(--text-gray-500);">Cadastro completo com CNPJ/CPF, WhatsApp direto, histórico de pedidos e alerta de recompra.</p>
        <button class="btn btn-primary" id="btnCadastrarClientePrincipal">+ Cadastrar Novo Cliente</button>
      </div>

      <div class="table-wrapper">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Nome Fantasia / Razão Social</th>
              <th>CNPJ / CPF</th>
              <th>Contato / Cargo</th>
              <th>WhatsApp Direto</th>
              <th>Cidade / UF</th>
              <th>Segmento</th>
              <th>Total Pedidos</th>
              <th>Faturamento</th>
              <th>Alerta Recompra</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${db.clientes.length ? db.clientes.map(cli => `
              <tr>
                <td>
                  <strong>${cli.nomeFantasia || cli.razaoSocial}</strong>
                  <span style="display: block; font-size: 11px; color: var(--text-gray-500);">${cli.razaoSocial}</span>
                </td>
                <td class="text-mono">${cli.cnpj}</td>
                <td>
                  <strong>${cli.contatoNome}</strong>
                  <span style="display: block; font-size: 11px; color: var(--text-gray-500);">${cli.cargoContato || 'Responsável'}</span>
                </td>
                <td class="text-mono">
                  <a href="https://api.whatsapp.com/send?phone=55${cli.telefone}&text=Ol%C3%A1%2C%20tudo%20bem%3F" target="_blank" style="color: var(--color-green); font-weight: 700; text-decoration: none;">
                    ${formatarTelefone(cli.telefone)}
                  </a>
                </td>
                <td>${cli.cidade} - ${cli.uf}</td>
                <td>${cli.ramoAtividade || 'Geral'}</td>
                <td class="text-mono">${cli.totalPedidosFeitos || 0} pedidos</td>
                <td class="text-mono"><strong>${formatarMoeda(cli.faturamentoAcumulado || 0)}</strong></td>
                <td>
                  <span class="status-pill ${cli.precisaRecompraAlerta ? 'status-red' : 'status-green'}">
                    ${cli.precisaRecompraAlerta ? 'RENOVAR UNIFORMES' : 'EM DIA'}
                  </span>
                </td>
                <td>
                  <button class="btn btn-secondary btn-sm btn-ver-historico-cliente" data-id="${cli.id}">Histórico</button>
                </td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="10" style="text-align: center; padding: 40px 20px; color: var(--text-gray-500);">
                  <div style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">Nenhum cliente cadastrado no CRM</div>
                  <div style="font-size: 12px; margin-bottom: 14px; color: var(--text-gray-500);">Cadastre seus clientes diretamente aqui ou de forma instantânea na criação de novos orçamentos.</div>
                  <button class="btn btn-primary btn-sm" id="btnCadastrarPrimeiroCliente">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Cadastrar Primeiro Cliente
                  </button>
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('btnCadastrarClientePrincipal')?.addEventListener('click', () => {
      abrirModalNovoClienteInline(() => renderizarClientes());
    });

    document.getElementById('btnCadastrarPrimeiroCliente')?.addEventListener('click', () => {
      abrirModalNovoClienteInline(() => renderizarClientes());
    });

    document.querySelectorAll('.btn-ver-historico-cliente').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        abrirModalHistoricoCliente(id);
      });
    });
  }

  function abrirModalNovoClienteInline(callback) {
    if (!modalContainer) return;

    const modalEl = criarModalCamada(`
      <div class="modal-overlay active" id="modalNovoClienteInlineOverlay">
        <div class="modal-box" style="max-width: 680px;">
          <div class="modal-header">
            <div>
              <div class="modal-title">Cadastrar Novo Cliente (Dados Obrigatórios)</div>
              <span style="font-size: 11px; color: var(--text-gray-500);">Preencha todos os campos obrigatórios para emissão de pedidos e NF-e</span>
            </div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>

          <div class="modal-body">
            <div class="form-row">
              <div class="form-group" style="flex: 2;">
                <label class="form-label">Razão Social Oficial *</label>
                <input type="text" id="cadCliRazao" class="form-input" placeholder="Ex: Confecções Industriais do Brasil Ltda">
              </div>
              <div class="form-group" style="flex: 2;">
                <label class="form-label">Nome Fantasia *</label>
                <input type="text" id="cadCliFantasia" class="form-input" placeholder="Ex: TexBrasil">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">CNPJ ou CPF *</label>
                <input type="text" id="cadCliCnpj" class="form-input text-mono" placeholder="00.000.000/0001-00">
              </div>
              <div class="form-group">
                <label class="form-label">Inscrição Estadual / RG</label>
                <input type="text" id="cadCliIe" class="form-input text-mono" placeholder="Isento ou Nº">
              </div>
              <div class="form-group">
                <label class="form-label">Ramo / Segmento *</label>
                <select id="cadCliRamo" class="form-select">
                  <option value="Indústria & Manufatura">Indústria & Manufatura</option>
                  <option value="Transporte & Logística">Transporte & Logística</option>
                  <option value="Saúde & Odontologia">Saúde & Odontologia</option>
                  <option value="Educação & Escolas">Educação & Escolas</option>
                  <option value="Alimentação & Gastronomia">Alimentação & Gastronomia</option>
                  <option value="Comércio & Serviços">Comércio & Serviços</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nome do Contato / Responsável *</label>
                <input type="text" id="cadCliContato" class="form-input" placeholder="Ex: Roberto Medeiros">
              </div>
              <div class="form-group">
                <label class="form-label">WhatsApp com DDD (Somente Números) *</label>
                <input type="text" id="cadCliTelefone" class="form-input text-mono" placeholder="11987654321">
              </div>
              <div class="form-group">
                <label class="form-label">E-mail Corporativo *</label>
                <input type="email" id="cadCliEmail" class="form-input" placeholder="contato@empresa.com.br">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">CEP *</label>
                <input type="text" id="cadCliCep" class="form-input text-mono" placeholder="13035-000">
              </div>
              <div class="form-group" style="flex: 3;">
                <label class="form-label">Endereço Completo (Rua / Av e Nº) *</label>
                <input type="text" id="cadCliEndereco" class="form-input" placeholder="Av. das Indústrias, 1000">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Bairro *</label>
                <input type="text" id="cadCliBairro" class="form-input" placeholder="Distrito Industrial">
              </div>
              <div class="form-group">
                <label class="form-label">Cidade *</label>
                <input type="text" id="cadCliCidade" class="form-input" placeholder="Campinas">
              </div>
              <div class="form-group">
                <label class="form-label">UF *</label>
                <input type="text" id="cadCliUf" class="form-input" value="SP" maxlength="2">
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.ERP.fecharModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btnSalvarClienteCompleto">Cadastrar Cliente</button>
          </div>
        </div>
      </div>
    `);

    document.getElementById('btnSalvarClienteCompleto')?.addEventListener('click', () => {
      const razao = document.getElementById('cadCliRazao')?.value.trim();
      const fantasia = document.getElementById('cadCliFantasia')?.value.trim();
      const cnpj = document.getElementById('cadCliCnpj')?.value.trim();
      const contato = document.getElementById('cadCliContato')?.value.trim();
      const tel = document.getElementById('cadCliTelefone')?.value.replace(/\D/g, '').trim();
      const email = document.getElementById('cadCliEmail')?.value.trim();
      const endereco = document.getElementById('cadCliEndereco')?.value.trim();
      const bairro = document.getElementById('cadCliBairro')?.value.trim();
      const cidade = document.getElementById('cadCliCidade')?.value.trim();
      const uf = document.getElementById('cadCliUf')?.value.trim();
      const cep = document.getElementById('cadCliCep')?.value.trim();
      const ramo = document.getElementById('cadCliRamo')?.value;

      // Validação de todos os campos obrigatórios
      if (!razao || !fantasia || !cnpj || !contato || !tel || !email || !endereco || !bairro || !cidade || !uf) {
        mostrarToast('Por favor, preencha todos os campos obrigatórios marcados com (*).', 'red');
        return;
      }

      if (tel.length < 10) {
        mostrarToast('Informe um número de WhatsApp com DDD válido (ex: 11987654321).', 'red');
        return;
      }

      const novoCli = {
        id: `CLI-${Math.floor(100 + db.clientes.length + 1)}`,
        razaoSocial: razao,
        nomeFantasia: fantasia,
        cnpj: cnpj,
        ie: document.getElementById('cadCliIe')?.value || 'Isento',
        contatoNome: contato,
        cargoContato: "Responsável",
        telefone: tel,
        email: email,
        endereco: endereco,
        bairro: bairro,
        cidade: cidade,
        uf: uf,
        cep: cep || "00000-000",
        ramoAtividade: ramo,
        totalPedidosFeitos: 0,
        faturamentoAcumulado: 0,
        dataUltimaCompra: new Date().toISOString().split('T')[0],
        intervaloRecompraMeses: 6,
        precisaRecompraAlerta: false
      };

      db.clientes.unshift(novoCli);
      salvarEstado();
      fecharModal(modalEl);
      mostrarToast(`Cliente "${novoCli.nomeFantasia}" cadastrado com sucesso!`, 'green');

      if (callback) callback(novoCli);
    });
  }

  function abrirModalHistoricoCliente(clienteId) {
    const cli = db.clientes.find(c => c.id === clienteId);
    if (!cli || !modalContainer) return;

    const pedidosCli = db.pedidos.filter(p => p.clienteId === cli.id || p.clienteNome === cli.nomeFantasia);

    const modalEl = criarModalCamada(`
      <div class="modal-overlay active">
        <div class="modal-box" style="max-width: 680px;">
          <div class="modal-header">
            <div>
              <div class="modal-title">Histórico de Compras • ${cli.nomeFantasia}</div>
              <span style="font-size: 11px; color: var(--text-gray-500);">${cli.razaoSocial} • CNPJ: ${cli.cnpj}</span>
            </div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>

          <div class="modal-body">
            <div class="grid-cards-3" style="margin-bottom: 16px;">
              <div class="card" style="padding: 10px;">
                <div class="kpi-title">Total de Pedidos</div>
                <div class="kpi-value text-primary">${pedidosCli.length}</div>
              </div>
              <div class="card" style="padding: 10px;">
                <div class="kpi-title">Faturamento Acumulado</div>
                <div class="kpi-value text-primary">${formatarMoeda(pedidosCli.reduce((a,b)=>a+b.valorTotalVenda, 0))}</div>
              </div>
              <div class="card" style="padding: 10px;">
                <div class="kpi-title">Contato WhatsApp</div>
                <div class="kpi-value text-green" style="font-size: 14px;">${formatarTelefone(cli.telefone)}</div>
              </div>
            </div>

            <table class="erp-table">
              <thead>
                <tr>
                  <th>Nº Pedido</th>
                  <th>Data</th>
                  <th>Produto</th>
                  <th>Grade</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${pedidosCli.length ? pedidosCli.map(p => `
                  <tr>
                    <td class="text-mono">#${p.numero}</td>
                    <td class="text-mono">${p.dataCriacao}</td>
                    <td>${p.produtoNome}</td>
                    <td class="text-mono">${p.grade?.total || 0} un</td>
                    <td class="text-mono"><strong>${formatarMoeda(p.valorTotalVenda)}</strong></td>
                    <td>
                      <span class="status-pill ${p.status === 'Em Producao' ? 'status-green' : 'status-gray'}">
                        ${p.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                `).join('') : `
                  <tr><td colspan="6" style="text-align: center; color: var(--text-gray-500); padding: 20px;">Nenhum pedido registrado para este cliente ainda.</td></tr>
                `}
              </tbody>
            </table>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.ERP.fecharModal()">Fechar</button>
            <a href="https://api.whatsapp.com/send?phone=55${cli.telefone}&text=Ol%C3%A1%2C%20${cli.contatoNome}!%20Tudo%20bem%3F" target="_blank" class="btn btn-green">
              Conversar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    `);
  }

  /* ==========================================================================
     MÓDULO 10: QUARENTENA DE PEDIDOS (CHECKLIST OBRIGATÓRIO DE 5 PONTOS)
     ========================================================================== */
  function renderizarQuarentena() {
    pageTitleElem.textContent = 'Mesa de Quarentena & Aprovação de Riscos';
    pageBreadcrumbElem.textContent = 'SISTEMA > QUARENTENA';

    const pedidosQuarentena = db.pedidos.filter(p => p.status === 'Quarentena');

    contentArea.innerHTML = `
      <div class="card" style="margin-bottom: 20px; border-left: 4px solid var(--color-red);">
        <h3 style="font-size: 14px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">Validação Técnica Obrigatória da Diretoria</h3>
        <p style="font-size: 12px; color: var(--text-gray-600);">
          Nenhum tecido é cortado sem que o administrador selecione <strong>obrigatoriamente cada um dos 5 pontos de atenção</strong> descritos na ficha de quarentena.
        </p>
      </div>

      <div class="table-wrapper">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Mockup 3x4</th>
              <th>Nº Pedido</th>
              <th>Cliente</th>
              <th>Produto Têxtil</th>
              <th>Grade</th>
              <th>Valor Total</th>
              <th>Margem Líquida</th>
              <th>Sinal</th>
              <th>Costureira</th>
              <th>Ação Obrigatória</th>
            </tr>
          </thead>
          <tbody>
            ${pedidosQuarentena.length ? pedidosQuarentena.map(p => {
              const mockup = p.mockupUrl || window.ERP_MOCKUPS.gerarMockupSvg(p.produtoNome, "#1e3a8a", "#ffffff", p.clienteNome.substring(0, 6));
              const margemOk = p.margemLucroPercentual >= 20.0;
              return `
                <tr>
                  <td>
                    <img src="${mockup}" class="mockup-thumb-3x4" data-pedido-id="${p.id}" alt="Mockup 3x4" title="Clique para abrir o mockup 3x4 na tela">
                  </td>
                  <td class="text-mono"><strong>#${p.numero}</strong></td>
                  <td><strong>${p.clienteNome}</strong></td>
                  <td>
                    <strong>${p.produtoNome}</strong>
                    <div style="font-size: 10px; color: #1e3a8a; margin-top: 2px;">
                      🎨 ${p.corTecido || 'A Definir'}
                    </div>
                    ${p.observacoesCoresDetalhes ? `
                      <span class="badge-obs-textil" title="${p.observacoesCoresDetalhes}">
                        <strong>Detalhes:</strong> ${p.observacoesCoresDetalhes}
                      </span>
                    ` : ''}
                  </td>
                  <td class="text-mono">${p.grade?.total || 0} pçs</td>
                  <td class="text-mono"><strong>${formatarMoeda(p.valorTotalVenda)}</strong></td>
                  <td class="text-mono">
                    <strong class="${margemOk ? 'text-green' : 'text-red'}">
                      ${(p.margemLucroPercentual || 0).toFixed(1)}%
                    </strong>
                  </td>
                  <td>
                    ${p.saldoPendente <= 0 && p.valorSinalPago >= p.valorTotalVenda ? `
                      <span class="status-pill status-green">100% QUITADO</span>
                    ` : p.valorSinalPago > 0 ? `
                      <span class="status-pill status-yellow" title="Saldo remanescente devedor: ${formatarMoeda(p.saldoPendente)}">
                        SINAL ${((p.valorSinalPago / (p.valorTotalVenda || 1)) * 100).toFixed(0)}%
                      </span>
                    ` : `
                      <span class="status-pill status-red">SEM SINAL</span>
                    `}
                  </td>
                  <td>${p.costureiraNome || 'Não atribuída'}</td>
                  <td>
                    <button class="btn btn-green btn-sm btn-inspecionar-quarentena" data-id="${p.id}" style="font-weight: 800;">
                      Conferir & Aprovar Pedido
                    </button>
                  </td>
                </tr>
              `;
            }).join('') : `
              <tr><td colspan="10" style="text-align: center; padding: 35px; color: var(--text-gray-500);">Nenhum pedido em quarentena no momento. Todas as ordens estão liberadas para a produção.</td></tr>
            `}
          </tbody>
        </table>
      </div>
    `;

    document.querySelectorAll('.btn-inspecionar-quarentena').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        abrirModalInspecaoQuarentena(id);
      });
    });
  }

  function abrirModalInspecaoQuarentena(pedidoId) {
    const p = db.pedidos.find(x => x.id === pedidoId);
    if (!p || !modalContainer) return;

    const modalEl = criarModalCamada(`
      <div class="modal-overlay active">
        <div class="modal-box" style="max-width: 680px;">
          <div class="modal-header">
            <div>
              <div class="modal-title">Conferência Rigorosa de Quarentena • Pedido #${p.numero}</div>
              <span style="font-size: 11px; color: var(--text-gray-500);">Aprovação final do administrador com checklist obrigatório</span>
            </div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>

          <div class="modal-body">
            <!-- Resumo do Pedido -->
            <div style="display: flex; gap: 14px; background: #f8fafc; border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 16px; align-items: center;">
              <img src="${p.mockupUrl}" class="mockup-thumb-3x4" data-pedido-id="${p.id}" style="width: 65px; height: 86px;" alt="Mockup 3x4" title="Clique para abrir o mockup 3x4 na tela">
              <div style="flex: 1;">
                <h4 style="font-size: 14px; font-weight: 800; color: #0f172a;">${p.clienteNome} • ${p.grade?.total || 0}x ${p.produtoNome}</h4>
                <div style="font-size: 12px; color: var(--text-gray-600); margin-top: 3px;">
                  🎨 Cor Principal: <strong>${p.corTecido || 'A Definir'}</strong>
                  ${p.observacoesCoresDetalhes ? ` • <span style="color: #b45309; font-weight: 700;">Detalhes: ${p.observacoesCoresDetalhes}</span>` : ''}<br>
                  Valor Total: <strong>${formatarMoeda(p.valorTotalVenda)}</strong> • Margem Líquida: <strong class="${p.margemLucroPercentual >= 20 ? 'text-green' : 'text-red'}">${(p.margemLucroPercentual || 0).toFixed(1)}%</strong><br>
                  Costureira: <strong>${p.costureiraNome || 'Oficina Interna'}</strong> • Artes Anexadas: <strong>${(p.artesAnexadas || []).length} locais</strong>
                </div>
              </div>
            </div>

            <div style="font-size: 12px; font-weight: 700; color: var(--color-red); margin-bottom: 10px;">
              VOCÊ DEVE SELECIONAR OBRIGATORIAMENTE CADA PONTO DE ATENÇÃO PARA CONFIRMAR QUE CONFERIU:
            </div>

            <!-- 5 Pontos de Atenção Obrigatórios -->
            <div class="quarentena-checklist">
              <div class="quarentena-item" id="itemCheck1">
                <input type="checkbox" id="chkQuarentena1" class="quarentena-checkbox">
                <div>
                  <label for="chkQuarentena1" class="quarentena-label">1. Sinal Financeiro Conferido na Conta Bancária</label>
                  <div class="quarentena-desc">
                    Confirmo que a entrada ou valor acordado foi compensado na conta da confecção ou há termo formal de faturamento assinado.
                    <div style="margin-top: 4px; font-weight: 700;">
                      ${p.valorSinalPago > 0 ? `
                        <span style="color: var(--color-green);">✓ Recebido: ${formatarMoeda(p.valorSinalPago)} (${((p.valorSinalPago / (p.valorTotalVenda || 1)) * 100).toFixed(0)}%)</span>
                        ${p.saldoPendente > 0 ? ` • <span style="color: var(--color-red);">Saldo Remanescente a Receber: ${formatarMoeda(p.saldoPendente)}</span>` : ' • <span style="color: var(--color-green);">100% Quitado</span>'}
                      ` : `
                        <span style="color: var(--color-red);">⚠️ Atenção: Nenhum sinal financeiro consta como pago no sistema ainda (Total do Pedido: ${formatarMoeda(p.valorTotalVenda)}).</span>
                      `}
                    </div>
                  </div>
                </div>
              </div>

              <div class="quarentena-item" id="itemCheck2">
                <input type="checkbox" id="chkQuarentena2" class="quarentena-checkbox">
                <div>
                  <label for="chkQuarentena2" class="quarentena-label">2. Mockup 3x4 e Artes de Alta Resolução Aprovadas</label>
                  <div class="quarentena-desc">Confirmo que o cliente aprovou formalmente por e-mail ou WhatsApp a disposição das estampas no peito, costas e mangas.</div>
                </div>
              </div>

              <div class="quarentena-item" id="itemCheck3">
                <input type="checkbox" id="chkQuarentena3" class="quarentena-checkbox">
                <div>
                  <label for="chkQuarentena3" class="quarentena-label">3. Estoque de Malha / Tecido, Golas e Lote de Cor Reservado</label>
                  <div class="quarentena-desc">Confirmo que as peças de tecido na cor principal e detalhes contrastantes (golas, punhos, frisos, recortes) estão fisicamente no galpão sem risco de variação de cor.</div>
                </div>
              </div>

              <div class="quarentena-item" id="itemCheck4">
                <input type="checkbox" id="chkQuarentena4" class="quarentena-checkbox">
                <div>
                  <label for="chkQuarentena4" class="quarentena-label">4. Viabilidade Matemática e Margem Mínima Confirmada</label>
                  <div class="quarentena-desc">Confirmo que a margem de contribuição do lote cobre todos os custos diretos, impostos do Simples e gera margem real positiva.</div>
                </div>
              </div>

              <div class="quarentena-item" id="itemCheck5">
                <input type="checkbox" id="chkQuarentena5" class="quarentena-checkbox">
                <div>
                  <label for="chkQuarentena5" class="quarentena-label">5. Costureira / Facção e Prazo de Entrega Alinhados</label>
                  <div class="quarentena-desc">Confirmo que a facção designada possui capacidade livre na linha de produção para entregar as ${p.grade?.total || 0} peças até ${p.dataPrevisaoEntrega}.</div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.ERP.fecharModal()">Cancelar</button>
            <button type="button" class="btn btn-green" id="btnAprovarParaOficina" disabled style="opacity: 0.5; cursor: not-allowed; font-weight: 800;">
              Aprovar para Produção na Oficina
            </button>
          </div>
        </div>
      </div>
    `);

    // Validador de checklist: só habilita o botão quando TODOS OS 5 forem marcados
    const checkboxes = [
      document.getElementById('chkQuarentena1'),
      document.getElementById('chkQuarentena2'),
      document.getElementById('chkQuarentena3'),
      document.getElementById('chkQuarentena4'),
      document.getElementById('chkQuarentena5')
    ];

    const btnAprovar = document.getElementById('btnAprovarParaOficina');

    function validarChecklist() {
      const todosMarcados = checkboxes.every(cb => cb && cb.checked);
      if (todosMarcados) {
        btnAprovar.disabled = false;
        btnAprovar.style.opacity = '1';
        btnAprovar.style.cursor = 'pointer';
      } else {
        btnAprovar.disabled = true;
        btnAprovar.style.opacity = '0.5';
        btnAprovar.style.cursor = 'not-allowed';
      }
    }

    checkboxes.forEach((cb, idx) => {
      cb?.addEventListener('change', () => {
        const item = document.getElementById(`itemCheck${idx + 1}`);
        if (cb.checked) {
          item?.classList.add('checked');
        } else {
          item?.classList.remove('checked');
        }
        validarChecklist();
      });
    });

    btnAprovar?.addEventListener('click', () => {
      p.status = 'Em Producao';
      p.etapaProducao = 'Corte';
      p.quarentenaAprovada = true;
      p.dataQuarentenaAprovada = new Date().toISOString().split('T')[0];

      // Sincroniza na OS
      const os = db.ordensServico.find(o => o.pedidoNumero === p.numero);
      if (os) {
        os.etapaAtual = 'Corte';
      }

      salvarEstado();
      atualizarBadges();
      fecharModal(modalEl);
      if (abaAtiva === 'quarentena') {
        renderizarQuarentena();
      } else {
        renderizarPedidos();
      }

      mostrarToast(`Pedido #${p.numero} APROVADO! Enviado para a mesa de corte.`, 'green');

      // Abre WhatsApp para notificar cliente
      abrirModalWhatsApp(p.id);
    });
  }

  /* ==========================================================================
     MÓDULO 11: EQUIPE & COLABORADORES FUNCIONAL
     ========================================================================== */
  function renderizarEquipe() {
    pageTitleElem.textContent = 'Gestão de Colaboradores & Equipe Têxtil';
    pageBreadcrumbElem.textContent = 'SISTEMA > EQUIPE';

    contentArea.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
        <p style="color: var(--text-gray-500); margin: 0;">Controle de colaboradores internos, costureiras, encarregados e permissões de acesso.</p>
        <button class="btn btn-primary" id="btnCadastrarColaborador">+ Cadastrar Colaborador / Costureira</button>
      </div>

      <div class="table-wrapper">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Nome Completo</th>
              <th>E-mail Corporativo</th>
              <th>Cargo / Função</th>
              <th>Nível de Acesso</th>
              <th>Capacidade Dia</th>
              <th>Remuneração / Salário</th>
              <th>Status</th>
              <th style="text-align: right; min-width: 140px;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${(db.equipe || []).length > 0 ? db.equipe.map((u, idx) => `
              <tr>
                <td><strong>${u.nome}</strong></td>
                <td class="text-mono">${u.email || '-'}</td>
                <td>${u.cargo || u.especialidade || '-'}</td>
                <td>
                  <span class="status-pill ${u.nivelAcesso === 'Admin' ? 'status-green' : 'status-gray'}">
                    ${(u.nivelAcesso || 'Producao').toUpperCase()}
                  </span>
                </td>
                <td class="text-mono">${u.capacidadeDiaPecas > 0 ? `${u.capacidadeDiaPecas} pçs/dia` : 'Setor Fixo'}</td>
                <td class="text-mono">${u.valorRemuneracao ? formatarMoeda(u.valorRemuneracao) : 'Por Produção'}</td>
                <td>
                  <span class="status-pill status-green">${u.status || 'Ativo'}</span>
                </td>
                <td style="text-align: right;">
                  <div style="display: flex; gap: 5px; justify-content: flex-end;">
                    <button class="btn btn-secondary btn-sm btn-editar-equipe" data-id="${u.id}">Editar</button>
                    <button class="btn btn-red btn-sm btn-excluir-equipe" data-id="${u.id}">Excluir</button>
                  </div>
                </td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="8" style="text-align: center; padding: 45px 15px; color: var(--text-gray-500);">
                  <div style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">Nenhum colaborador ou costureira cadastrada</div>
                  <p style="font-size: 12px; margin-bottom: 14px;">Cadastre seus costureiros, cortadores, encarregados e administradores para organizar a fábrica.</p>
                  <button class="btn btn-primary btn-sm" id="btnCadastrarPrimeiroColaborador">+ Cadastrar Primeiro Colaborador</button>
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('btnCadastrarColaborador')?.addEventListener('click', () => {
      abrirModalNovoColaboradorInline(() => renderizarEquipe());
    });
    document.getElementById('btnCadastrarPrimeiroColaborador')?.addEventListener('click', () => {
      abrirModalNovoColaboradorInline(() => renderizarEquipe());
    });

    document.querySelectorAll('.btn-editar-equipe').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const col = (db.equipe || []).find(u => u.id === id);
        if (col) abrirModalNovoColaboradorInline(() => renderizarEquipe(), col);
      });
    });

    document.querySelectorAll('.btn-excluir-equipe').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const col = (db.equipe || []).find(u => u.id === id);
        if (!col) return;
        if (confirm(`Deseja realmente excluir "${col.nome}" da equipe?`)) {
          db.equipe = (db.equipe || []).filter(u => u.id !== id);
          db.costureiras = (db.costureiras || []).filter(c => c.id !== id);
          salvarEstado();
          renderizarEquipe();
          mostrarToast(`Colaborador "${col.nome}" removido.`, 'green');
        }
      });
    });
  }

  function abrirModalNovoColaboradorInline(callback, colaboradorParaEditar = null) {
    if (!modalContainer) return;
    const isEdit = !!colaboradorParaEditar;
    const col = colaboradorParaEditar || {
      nome: '',
      telefone: '',
      cargo: '',
      nivelAcesso: 'Producao',
      capacidadeDiaPecas: 100,
      valorRemuneracao: 2800
    };

    const modalEl = criarModalCamada(`
      <div class="modal-overlay active" id="modalNovoColaboradorInlineOverlay">
        <div class="modal-box" style="max-width: 580px;">
          <div class="modal-header">
            <div class="modal-title">${isEdit ? 'Editar Colaborador / Costureira' : 'Cadastrar Novo Colaborador ou Costureira'}</div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group" style="flex: 2;">
                <label class="form-label">Nome Completo / Oficina *</label>
                <input type="text" id="cadColNome" class="form-input" placeholder="Ex: Maria Aparecida Santos" value="${col.nome || ''}">
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Telefone / WhatsApp</label>
                <input type="text" id="cadColTel" class="form-input text-mono" placeholder="19987654321" value="${col.telefone || ''}">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Cargo / Especialidade</label>
                <input type="text" id="cadColCargo" class="form-input" placeholder="Ex: Costureira Especialista Polo e Camisaria" value="${col.cargo || col.especialidade || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Nível de Permissão</label>
                <select id="cadColAcesso" class="form-select">
                  <option value="Producao" ${col.nivelAcesso === 'Producao' ? 'selected' : ''}>Produção / Oficina</option>
                  <option value="Comercial" ${col.nivelAcesso === 'Comercial' ? 'selected' : ''}>Comercial / Vendas</option>
                  <option value="Financeiro" ${col.nivelAcesso === 'Financeiro' ? 'selected' : ''}>Financeiro</option>
                  <option value="Admin" ${col.nivelAcesso === 'Admin' ? 'selected' : ''}>Administrador Geral</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Capacidade Diária (Peças)</label>
                <input type="number" id="cadColCapacidade" class="form-input" value="${col.capacidadeDiaPecas !== undefined ? col.capacidadeDiaPecas : 100}" min="0">
              </div>
              <div class="form-group">
                <label class="form-label">Salário Mensal ou Custo p/ Peça (R$)</label>
                <input type="number" id="cadColRemun" class="form-input" value="${col.valorRemuneracao !== undefined ? col.valorRemuneracao : 2800.00}" step="100.00">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.ERP.fecharModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btnSalvarColaborador">
              ${isEdit ? 'Salvar Alterações' : 'Cadastrar Colaborador'}
            </button>
          </div>
        </div>
      </div>
    `);

    document.getElementById('btnSalvarColaborador')?.addEventListener('click', () => {
      const nome = document.getElementById('cadColNome')?.value.trim();
      if (!nome) {
        mostrarToast('Informe o nome do colaborador.', 'red');
        return;
      }

      if (isEdit) {
        col.nome = nome;
        col.responsavel = nome;
        col.telefone = document.getElementById('cadColTel')?.value || '';
        col.cargo = document.getElementById('cadColCargo')?.value || 'Colaborador';
        col.especialidade = col.cargo;
        col.nivelAcesso = document.getElementById('cadColAcesso')?.value || 'Producao';
        col.capacidadeDiaPecas = parseInt(document.getElementById('cadColCapacidade')?.value || 0, 10);
        col.valorRemuneracao = parseFloat(document.getElementById('cadColRemun')?.value || 0);

        // Atualizar também na lista de costureiras se existir
        const costMatch = (db.costureiras || []).find(c => c.id === col.id);
        if (costMatch) {
          costMatch.nome = col.nome;
          costMatch.responsavel = col.responsavel;
          costMatch.telefone = col.telefone;
          costMatch.especialidade = col.especialidade;
          costMatch.capacidadeDiaPecas = col.capacidadeDiaPecas;
        }

        salvarEstado();
        fecharModal(modalEl);
        mostrarToast(`Colaborador "${col.nome}" atualizado com sucesso!`, 'green');
        if (callback) callback(col);
      } else {
        const novoCol = {
          id: `COST-${Date.now().toString().slice(-6)}`,
          nome: nome,
          responsavel: nome,
          email: `${nome.toLowerCase().replace(/[^a-z0-9]/g, '')}@texpro.com.br`,
          telefone: document.getElementById('cadColTel')?.value || '',
          cargo: document.getElementById('cadColCargo')?.value || 'Costureira Especialista',
          especialidade: document.getElementById('cadColCargo')?.value || 'Costura Geral',
          nivelAcesso: document.getElementById('cadColAcesso')?.value || 'Producao',
          capacidadeDiaPecas: parseInt(document.getElementById('cadColCapacidade')?.value || 100, 10),
          valorMedioPorPeca: 8.00,
          valorRemuneracao: parseFloat(document.getElementById('cadColRemun')?.value || 2800),
          status: 'Ativo'
        };

        if (!Array.isArray(db.equipe)) db.equipe = [];
        if (!Array.isArray(db.costureiras)) db.costureiras = [];
        db.equipe.unshift(novoCol);
        db.costureiras.unshift(novoCol);
        salvarEstado();
        fecharModal(modalEl);
        mostrarToast(`Colaborador "${novoCol.nome}" cadastrado com sucesso!`, 'green');
        if (callback) callback(novoCol);
      }
    });
  }

  /* ==========================================================================
     MÓDULO 12: NOTAS FISCAIS ELETRÔNICAS (SEFAZ)
     ========================================================================== */
  function renderizarNotasFiscais() {
    pageTitleElem.textContent = 'Emissor & Gestor Fiscal NF-e (SEFAZ)';
    pageBreadcrumbElem.textContent = 'SISTEMA > NOTAS FISCAIS';

    contentArea.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <p style="color: var(--text-gray-500);">Emissão e autorização de notas fiscais eletrônicas modelo 55 integradas com a SEFAZ.</p>
        <span class="status-pill status-green text-mono">Ambiente SEFAZ: Produção Conectada</span>
      </div>

      <div class="table-wrapper">
        <table class="erp-table">
          <thead>
            <tr>
              <th>NF-e Nº</th>
              <th>Série</th>
              <th>Data Emissão</th>
              <th>Destinatário</th>
              <th>CNPJ</th>
              <th>CFOP</th>
              <th>Valor Total</th>
              <th>Impostos</th>
              <th>Status SEFAZ</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${db.notasFiscais.length ? db.notasFiscais.map(nf => `
              <tr>
                <td class="text-mono"><strong>#${nf.numero}</strong></td>
                <td class="text-mono">${nf.serie}</td>
                <td class="text-mono">${nf.dataEmissao}</td>
                <td><strong>${nf.cliente}</strong></td>
                <td class="text-mono">${nf.cnpj}</td>
                <td class="text-mono">${nf.cfop}</td>
                <td class="text-mono"><strong>${formatarMoeda(nf.valorTotal)}</strong></td>
                <td class="text-mono">${formatarMoeda(nf.valorImpostos)}</td>
                <td>
                  <span class="status-pill status-green">${nf.statusSefaz.toUpperCase()}</span>
                </td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick="alert('Chave de acesso: ${nf.chaveAcesso}\\nProtocolo: ${nf.protocolo}')">
                    DANFE / XML
                  </button>
                </td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="10" style="text-align: center; padding: 40px 20px; color: var(--text-gray-500);">
                  Nenhuma Nota Fiscal emitida. Conforme os pedidos forem concluídos, as NF-e modelo 55 autorizadas pela SEFAZ serão listadas aqui.
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ==========================================================================
     MODAL DE DISPARO DE WHATSAPP AUTOMÁTICO COM LINK DIRETO
     ========================================================================== */
  function abrirModalWhatsApp(pedidoId) {
    const pedido = db.pedidos.find(p => p.id === pedidoId);
    if (!pedido || !modalContainer) return;

    const descCor = pedido.corTecido ? `\n🎨 *Cor Principal:* ${pedido.corTecido}` : '';
    const descDetalhes = pedido.observacoesCoresDetalhes ? `\n🧵 *Detalhes de Confecção:* ${pedido.observacoesCoresDetalhes}` : '';
    const mensagemPadrao = `Olá, *${pedido.clienteNome}*!\n\nAqui é da equipe da *${db.empresa.nomeFantasia}*.\n\nInformamos que seu pedido *#${pedido.numero}* (${pedido.grade?.total || 0} peças de ${pedido.produtoNome}) acabou de avançar para a etapa de: *${(pedido.etapaProducao || pedido.status).toUpperCase()}*.${descCor}${descDetalhes}\n\n📅 *Previsão de Entrega:* ${pedido.dataPrevisaoEntrega}\n💰 *Saldo Pendente na Retirada:* ${formatarMoeda(pedido.saldoPendente)}\n\nEstamos acompanhando cada detalhe da produção do seu uniforme!`;
    const mensagemEncoded = encodeURIComponent(mensagemPadrao);
    const telNumeros = (pedido.clienteTelefone || '').toString().replace(/\D/g, '');
    const linkWhatsApp = `https://api.whatsapp.com/send?phone=55${telNumeros}&text=${mensagemEncoded}`;

    const modalEl = criarModalCamada(`
      <div class="modal-overlay active">
        <div class="modal-box" style="max-width: 580px;">
          <div class="modal-header">
            <div>
              <div class="modal-title">Notificação Instantânea pelo WhatsApp</div>
              <span style="font-size: 11px; color: var(--text-gray-500);">Mensagem oficial de atualização de etapa do pedido</span>
            </div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>

          <div class="modal-body">
            <div style="margin-bottom: 12px; background: #f8fafc; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-medium);">
              <span class="form-label" style="font-size: 11px;">Destinatário:</span>
              <strong style="color: #0f172a; font-size: 13px;">${pedido.clienteNome}</strong> • 
              <span class="text-mono" style="color: var(--color-green); font-weight: 700;">${formatarTelefone(pedido.clienteTelefone)}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Texto da Mensagem (Você pode editar antes de enviar):</label>
              <textarea id="wppTextoMensagemEdit" class="form-textarea" rows="7" style="font-family: var(--font-mono); font-size: 12px;">${mensagemPadrao}</textarea>
            </div>

            <div style="font-size: 11px; color: var(--text-gray-500);">
              Ao clicar no botão verde abaixo, uma conversa direta será aberta imediatamente no WhatsApp oficial deste cliente com a mensagem preenchida.
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.ERP.fecharModal()">Fechar</button>
            <a href="${linkWhatsApp}" target="_blank" class="btn btn-green" id="btnDispararWhatsAppReal" style="font-weight: 800;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              Enviar pelo WhatsApp Agora
            </a>
          </div>
        </div>
      </div>
    `);

    const txtArea = document.getElementById('wppTextoMensagemEdit');
    const btnLink = document.getElementById('btnDispararWhatsAppReal');
    txtArea?.addEventListener('input', () => {
      const novoEncoded = encodeURIComponent(txtArea.value);
      btnLink.href = `https://api.whatsapp.com/send?phone=55${telNumeros}&text=${novoEncoded}`;
    });

    btnLink?.addEventListener('click', () => {
      fecharModal(modalEl);
      mostrarToast(`Mensagem enviada com sucesso para o WhatsApp de ${pedido.clienteNome}!`, 'green');
    });
  }

  // Delegação Universal de Clique para Abertura de Mockups 3x4 na Tela
  function configurarCliqueGlobalMockups() {
    document.addEventListener('click', (e) => {
      const thumb = e.target.closest('.mockup-thumb-3x4');
      if (thumb) {
        e.preventDefault();
        e.stopPropagation();
        const pedidoId = thumb.getAttribute('data-pedido-id');
        const osId = thumb.getAttribute('data-os-id');
        const src = thumb.getAttribute('src');
        abrirModalVisualizarMockup({ pedidoId, osId, src });
      }
    });
  }

  // Modal de Visualização de Mockup 3x4 Ampliado na Tela do Sistema
  function abrirModalVisualizarMockup(params) {
    if (!modalContainer) return;

    let pedido = null;
    let os = null;
    let mockupSrc = "";
    let tituloModal = "Visualização Técnica de Mockup 3x4";
    let produtoNome = "Peça Conforme Pedido";
    let clienteNome = "Cliente Corporativo";
    let clienteTelefone = "";
    let costureiraNome = "Oficina Interna";
    let tecnicaPersonalizacao = "Bordado / Estampa Conforme Arte";
    let grade = { pp: 0, p: 0, m: 0, g: 0, gg: 0, xg: 0, total: 0 };
    let precoUnit = 0;
    let valorTotal = 0;
    let margem = 0;
    let statusEtapa = "Em Produção";
    let numeroPedido = "---";
    let sinalPago = false;
    let saldoPendente = 0;

    if (params) {
      if (typeof params === 'string') {
        pedido = db.pedidos.find(p => p.id === params || p.numero.toString() === params);
        if (!pedido) {
          os = db.ordensServico.find(o => o.id === params);
        }
      } else {
        if (params.pedidoId) {
          pedido = db.pedidos.find(p => p.id === params.pedidoId || p.numero.toString() === params.pedidoId);
        }
        if (!pedido && params.osId) {
          os = db.ordensServico.find(o => o.id === params.osId);
        }
        if (params.src) {
          mockupSrc = params.src;
        }
      }
    }

    if (pedido) {
      mockupSrc = pedido.mockupUrl || mockupSrc || window.ERP_MOCKUPS.gerarMockupSvg(pedido.produtoNome, "#1e3a8a", "#ffffff", pedido.clienteNome.substring(0, 6));
      tituloModal = `Mockup Técnico Oficial • Pedido #${pedido.numero}`;
      produtoNome = pedido.produtoNome || produtoNome;
      clienteNome = pedido.clienteNome || clienteNome;
      clienteTelefone = pedido.clienteTelefone || "";
      costureiraNome = pedido.costureiraNome || costureiraNome;
      tecnicaPersonalizacao = pedido.tipoPersonalizacao || tecnicaPersonalizacao;
      grade = pedido.grade || grade;
      precoUnit = pedido.precoUnitarioVenda || 0;
      valorTotal = pedido.valorTotalVenda || 0;
      margem = pedido.margemLucroPercentual || 0;
      statusEtapa = pedido.etapaAtual || pedido.status || statusEtapa;
      numeroPedido = pedido.numero;
      sinalPago = !!pedido.sinalPago;
      saldoPendente = pedido.saldoPendente || 0;
    } else if (os) {
      mockupSrc = os.mockupUrl || mockupSrc || window.ERP_MOCKUPS.gerarMockupSvg(os.produto, "#1e3a8a", "#ffffff", os.cliente.substring(0, 6));
      tituloModal = `Mockup Técnico Oficial • Ordem de Serviço ${os.id}`;
      produtoNome = os.produto || produtoNome;
      clienteNome = os.cliente || clienteNome;
      costureiraNome = os.costureiraDesignada || costureiraNome;
      grade = { total: os.quantidadeTotal || 0 };
      statusEtapa = os.etapaAtual || statusEtapa;
      numeroPedido = os.pedidoNumero || "---";
    }

    if (!mockupSrc) {
      mockupSrc = window.ERP_MOCKUPS.gerarMockupSvg("polo", "#1e3a8a", "#ffffff", "TEXPRO");
    }

    const modalEl = criarModalCamada(`
      <div class="modal-overlay active" id="modalMockupOverlay">
        <div class="modal-box" style="max-width: 820px;">
          <div class="modal-header">
            <div>
              <div class="modal-title" style="display: flex; align-items: center; gap: 8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <span>${tituloModal}</span>
              </div>
              <span style="font-size: 11px; color: var(--text-gray-500); font-family: var(--font-mono);">
                ENQUADRAMENTO DE PRODUÇÃO • PROPORÇÃO TÊXTIL 3:4
              </span>
            </div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>

          <div class="modal-body">
            <div class="mockup-modal-grid">
              <!-- Coluna 1: Mockup Ampliado 3x4 -->
              <div>
                <div class="mockup-large-frame">
                  <span class="mockup-large-badge">PROPORÇÃO 3:4</span>
                  <img src="${mockupSrc}" class="mockup-large-img" alt="Mockup Oficial 3x4">
                </div>
                
                <div style="display: flex; gap: 8px; margin-top: 12px;">
                  <a href="${mockupSrc}" download="Mockup_Pedido_${numeroPedido}.svg" class="btn btn-secondary btn-sm" style="flex: 1;" title="Baixar vetor do mockup em formato SVG">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Baixar SVG
                  </a>
                  <button type="button" class="btn btn-secondary btn-sm" id="btnCopiarMockup" style="flex: 1;" title="Copiar código do mockup">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    Copiar Arte
                  </button>
                </div>
              </div>

              <!-- Coluna 2: Especificações Técnicas e Comerciais -->
              <div>
                <div class="mockup-spec-card">
                  <div class="mockup-spec-title">Dados Comerciais & Cliente</div>
                  <div class="mockup-spec-row">
                    <span class="mockup-spec-label">Cliente / Razão Social:</span>
                    <span class="mockup-spec-value">${clienteNome}</span>
                  </div>
                  ${clienteTelefone ? `
                    <div class="mockup-spec-row">
                      <span class="mockup-spec-label">WhatsApp Contato:</span>
                      <span class="mockup-spec-value text-mono">${formatarTelefone(clienteTelefone)}</span>
                    </div>
                  ` : ''}
                  <div class="mockup-spec-row">
                    <span class="mockup-spec-label">Nº do Pedido:</span>
                    <span class="mockup-spec-value text-mono">#${numeroPedido}</span>
                  </div>
                  <div class="mockup-spec-row">
                    <span class="mockup-spec-label">Etapa na Fábrica:</span>
                    <span class="status-pill status-green" style="font-size: 10px;">${statusEtapa.toUpperCase()}</span>
                  </div>
                </div>

                <div class="mockup-spec-card">
                  <div class="mockup-spec-title">Ficha Técnica da Modelagem</div>
                  <div class="mockup-spec-row">
                    <span class="mockup-spec-label">Modelo Têxtil:</span>
                    <span class="mockup-spec-value">${produtoNome}</span>
                  </div>
                  <div class="mockup-spec-row">
                    <span class="mockup-spec-label">Cor Principal:</span>
                    <span class="mockup-spec-value" style="font-weight: 700; color: #1e3a8a;">${(pedido && pedido.corTecido) || (os && os.corTecido) || 'A Definir'}</span>
                  </div>
                  ${((pedido && pedido.observacoesCoresDetalhes) || (os && os.observacoesCoresDetalhes)) ? `
                    <div style="margin-top: 6px; margin-bottom: 6px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 4px; padding: 6px 8px; font-size: 11px; color: #92400e; line-height: 1.35; white-space: normal !important; word-break: break-word; overflow-wrap: anywhere; box-sizing: border-box;">
                      <strong>Detalhes de Cores / Confecção:</strong> ${(pedido && pedido.observacoesCoresDetalhes) || (os && os.observacoesCoresDetalhes)}
                    </div>
                  ` : ''}
                  <div class="mockup-spec-row">
                    <span class="mockup-spec-label">Técnica de Aplicação:</span>
                    <span class="mockup-spec-value">${tecnicaPersonalizacao}</span>
                  </div>
                  <div class="mockup-spec-row">
                    <span class="mockup-spec-label">Costureira / Oficina:</span>
                    <span class="mockup-spec-value" style="color: var(--color-green);">${costureiraNome}</span>
                  </div>
                  <div class="mockup-spec-row">
                    <span class="mockup-spec-label">Total de Peças:</span>
                    <span class="mockup-spec-value text-mono" style="font-size: 13px;">${grade.total || 0} peças</span>
                  </div>

                  <!-- Grade de Tamanhos -->
                  <div style="margin-top: 10px; background: #ffffff; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 8px;">
                    <div style="font-size: 10.5px; font-weight: 700; color: var(--text-gray-500); margin-bottom: 6px; text-transform: uppercase;">Grade de Tamanhos Programada</div>
                    <div style="display: flex; gap: 8px; justify-content: space-between; text-align: center; font-size: 11px;">
                      <div><span style="color: var(--text-gray-500); display: block;">PP</span><strong class="text-mono">${grade.pp || 0}</strong></div>
                      <div><span style="color: var(--text-gray-500); display: block;">P</span><strong class="text-mono">${grade.p || 0}</strong></div>
                      <div><span style="color: var(--text-gray-500); display: block;">M</span><strong class="text-mono">${grade.m || 0}</strong></div>
                      <div><span style="color: var(--text-gray-500); display: block;">G</span><strong class="text-mono">${grade.g || 0}</strong></div>
                      <div><span style="color: var(--text-gray-500); display: block;">GG</span><strong class="text-mono">${grade.gg || 0}</strong></div>
                      <div><span style="color: var(--text-gray-500); display: block;">XG</span><strong class="text-mono">${grade.xg || 0}</strong></div>
                      <div><span style="color: var(--text-gray-500); display: block;">TOTAL</span><strong class="text-mono text-green">${grade.total || 0}</strong></div>
                    </div>
                  </div>
                </div>

                ${valorTotal > 0 ? `
                  <div class="mockup-spec-card">
                    <div class="mockup-spec-title">Fechamento Comercial</div>
                    <div class="mockup-spec-row">
                      <span class="mockup-spec-label">Preço Unitário:</span>
                      <span class="mockup-spec-value text-mono">${formatarMoeda(precoUnit)}</span>
                    </div>
                    <div class="mockup-spec-row">
                      <span class="mockup-spec-label">Valor Total do Pedido:</span>
                      <span class="mockup-spec-value text-mono" style="font-size: 13.5px; color: var(--text-primary);">${formatarMoeda(valorTotal)}</span>
                    </div>
                    <div class="mockup-spec-row">
                      <span class="mockup-spec-label">Sinal Financeiro:</span>
                      <span class="status-pill ${sinalPago ? 'status-green' : 'status-red'}" style="font-size: 10px;">
                        ${sinalPago ? (saldoPendente <= 0 ? '100% QUITADO' : 'SINAL 50% PAGO') : 'PENDENTE DE SINAL'}
                      </span>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>

          <div class="modal-footer">
            ${pedido ? `
              <button type="button" class="btn btn-secondary btn-sm" id="btnModalMockupWpp">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                Disparar Mockup no WhatsApp
              </button>
              <button type="button" class="btn btn-secondary btn-sm" id="btnModalMockupFicha">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Ver Ficha Técnica / OS
              </button>
            ` : ''}
            <button type="button" class="btn btn-primary btn-sm" onclick="window.ERP.fecharModal()">
              Fechar
            </button>
          </div>
        </div>
      </div>
    `);

    document.getElementById('btnCopiarMockup')?.addEventListener('click', () => {
      navigator.clipboard?.writeText(mockupSrc).then(() => {
        mostrarToast('Código vetorial do mockup copiado com sucesso!', 'green');
      }).catch(() => {
        mostrarToast('Mockup selecionado pronto para uso!', 'green');
      });
    });

    if (pedido) {
      document.getElementById('btnModalMockupWpp')?.addEventListener('click', () => {
        abrirModalWhatsApp(pedido.id);
      });
      document.getElementById('btnModalMockupFicha')?.addEventListener('click', () => {
        const os = db.ordensServico.find(o => o.pedidoNumero === pedido.numero);
        if (os) {
          abrirFichaTecnica(os.id);
        } else {
          abrirFichaTecnicaPorPedido(pedido);
        }
      });
    }
  }

  /* ==========================================================================
     MODAIS DE CONFIGURAÇÃO E DADOS REAIS DO DASHBOARD
     ========================================================================== */

  // Modal 1: Edição da Performance Financeira Semestral (Entradas e Saídas)
  function abrirModalEditarFinanceiro() {
    const historico = JSON.parse(JSON.stringify(db.historicoFinanceiroMensal || []));
    
    const modalEl = criarModalCamada(`
      <div class="modal-overlay active" id="modalEditarFinOverlay">
        <div class="modal-box" style="max-width: 820px;">
          <div class="modal-header">
            <div>
              <div class="modal-title">Editar Performance Financeira Semestral</div>
              <div style="font-size: 12px; color: var(--text-gray-500); margin-top: 2px;">
                Ajuste os valores reais de Entradas (Faturamento) e Saídas (Despesas/Custos) para análise executiva
              </div>
            </div>
            <button class="modal-close-btn" onclick="window.ERP.fecharModal()">&times;</button>
          </div>

          <div class="modal-body" style="padding: 20px;">
            <div style="background: #f8fafc; border: 1px solid var(--border-medium); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 13px; color: var(--text-primary);">Sincronização com o Livro Caixa Real:</strong>
                <div style="font-size: 11.5px; color: var(--text-gray-500); margin-top: 2px;">
                  Ao manter ativo, o mês atual somará automaticamente as receitas e despesas registradas nos Lançamentos Financeiros do ERP.
                </div>
              </div>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;">
                <input type="checkbox" id="chkSincronizarCaixa" ${historico.some(h => h.isAtual && h.sincronizarComCaixa) ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
                <span style="font-size: 12px; font-weight: 700; color: #047857;">Sincronizar Caixa</span>
              </label>
            </div>

            <div class="table-wrapper" style="margin-bottom: 14px; max-height: 380px; overflow-y: auto;">
              <table class="erp-table">
                <thead>
                  <tr>
                    <th>Mês</th>
                    <th>Rótulo / Descrição</th>
                    <th>Entradas / Receitas (R$)</th>
                    <th>Saídas / Custos (R$)</th>
                    <th>Saldo Líquido (R$)</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody id="corpoTabelaMeses">
                  ${historico.map((m, idx) => {
                    const saldo = (Number(m.entradas) || 0) - (Number(m.saidas) || 0);
                    return `
                      <tr>
                        <td>
                          <input type="text" class="input-cell text-mono" style="width: 60px; font-weight: 700;" value="${m.mes}" data-idx="${idx}" data-campo="mes">
                        </td>
                        <td>
                          <input type="text" class="input-cell" style="width: 140px;" value="${m.mesCompleto}" data-idx="${idx}" data-campo="mesCompleto">
                        </td>
                        <td>
                          <div style="position: relative;">
                            <span style="position: absolute; left: 8px; top: 7px; font-size: 11px; color: #047857; font-weight: 700;">R$</span>
                            <input type="number" step="100" class="input-cell text-mono inp-entradas" style="width: 125px; padding-left: 28px; font-weight: 700; color: #047857;" value="${m.entradas}" data-idx="${idx}" data-campo="entradas">
                          </div>
                        </td>
                        <td>
                          <div style="position: relative;">
                            <span style="position: absolute; left: 8px; top: 7px; font-size: 11px; color: #dc2626; font-weight: 700;">R$</span>
                            <input type="number" step="100" class="input-cell text-mono inp-saidas" style="width: 125px; padding-left: 28px; font-weight: 700; color: #dc2626;" value="${m.saidas}" data-idx="${idx}" data-campo="saidas">
                          </div>
                        </td>
                        <td class="text-mono" style="font-weight: 700; font-size: 12px; white-space: nowrap;">
                          <span id="saldoLinha_${idx}" class="${saldo >= 0 ? 'text-green' : 'text-red'}">
                            ${saldo >= 0 ? '+' : ''}${formatarMoeda(saldo)}
                          </span>
                        </td>
                        <td>
                          ${m.isAtual ? '<span class="status-pill status-green">Mês Atual</span>' : (m.isPrevisto ? '<span class="status-pill status-gray">Previsão</span>' : '<span class="status-pill status-gray">Histórico</span>')}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <div style="font-size: 11.5px; color: var(--text-gray-500); display: flex; justify-content: space-between; align-items: center; padding-top: 4px;">
              <span>💡 Os números são formatados automaticamente em milhares (k) no gráfico para proporcionar leitura limpa.</span>
              <button class="btn btn-secondary btn-xs" id="btnRestaurarFinPadrao">Restaurar Médias Padrão</button>
            </div>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px;">
            <button class="btn btn-secondary" onclick="window.ERP.fecharModal()">Cancelar</button>
            <button class="btn btn-primary" id="btnSalvarDadosFinanceiros">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    `);

    // Recalcular saldo dinamicamente ao digitar nas inputs
    const inputsValor = modalEl.querySelectorAll('.inp-entradas, .inp-saidas');
    inputsValor.forEach(inp => {
      inp.addEventListener('input', () => {
        const idx = inp.getAttribute('data-idx');
        const inVal = Number(modalEl.querySelector(`.inp-entradas[data-idx="${idx}"]`)?.value) || 0;
        const outVal = Number(modalEl.querySelector(`.inp-saidas[data-idx="${idx}"]`)?.value) || 0;
        const saldo = inVal - outVal;
        const spanSaldo = document.getElementById(`saldoLinha_${idx}`);
        if (spanSaldo) {
          spanSaldo.className = saldo >= 0 ? 'text-green' : 'text-red';
          spanSaldo.textContent = (saldo >= 0 ? '+' : '') + formatarMoeda(saldo);
        }
      });
    });

    // Salvar
    document.getElementById('btnSalvarDadosFinanceiros')?.addEventListener('click', () => {
      const inputs = modalEl.querySelectorAll('#corpoTabelaMeses input[data-campo]');
      const sincCaixa = document.getElementById('chkSincronizarCaixa')?.checked || false;

      inputs.forEach(inp => {
        const idx = Number(inp.getAttribute('data-idx'));
        const campo = inp.getAttribute('data-campo');
        if (historico[idx]) {
          if (campo === 'entradas' || campo === 'saidas') {
            historico[idx][campo] = Math.max(0, Number(inp.value) || 0);
          } else {
            historico[idx][campo] = inp.value;
          }
        }
      });

      historico.forEach(h => {
        if (h.isAtual) {
          h.sincronizarComCaixa = sincCaixa;
        }
      });

      db.historicoFinanceiroMensal = historico;
      salvarEstado();
      fecharModal(modalEl);
      mostrarToast('Performance financeira semestral atualizada com sucesso!', 'green');
      renderizarAbertura();
    });

    // Restaurar Padrão
    document.getElementById('btnRestaurarFinPadrao')?.addEventListener('click', () => {
      if (confirm('Deseja restaurar as médias históricas padrão do gráfico financeiro?')) {
        db.historicoFinanceiroMensal = JSON.parse(JSON.stringify(window.ERP_INITIAL_DATA.historicoFinanceiroMensal || []));
        salvarEstado();
        fecharModal(modalEl);
        mostrarToast('Valores padrão restaurados com sucesso!', 'green');
        renderizarAbertura();
      }
    });
  }

  // Modal 2: Edição das Capacidades de Produção por Setor
  function abrirModalEditarCapacidades() {
    const setores = JSON.parse(JSON.stringify(db.capacidadesProducao || []));

    function renderizarLinhasModal() {
      const tbody = document.getElementById('corpoTabelaCapacidades');
      if (!tbody) return;
      tbody.innerHTML = setores.map((s, idx) => `
        <tr>
          <td>
            <input type="text" class="input-cell" style="font-weight: 600;" value="${s.nome}" data-idx="${idx}" data-campo="nome">
          </td>
          <td>
            <input type="number" step="1" min="1" class="input-cell text-mono" style="width: 90px; font-weight: 700;" value="${s.capacidadeDiaria}" data-idx="${idx}" data-campo="capacidadeDiaria">
          </td>
          <td>
            <input type="text" class="input-cell" style="width: 130px;" value="${s.unidade}" data-idx="${idx}" data-campo="unidade" placeholder="ex: peças/dia">
          </td>
          <td>
            <input type="number" step="1" min="0" class="input-cell text-mono" style="width: 90px; font-weight: 700;" value="${s.atualProduzido}" data-idx="${idx}" data-campo="atualProduzido">
          </td>
          <td>
            <select class="form-control" style="font-size: 11.5px; padding: 4px 6px;" data-idx="${idx}" data-campo="modoCalculo">
              <option value="auto" ${s.modoCalculo === 'auto' ? 'selected' : ''}>Auto (Pelas OS ativas)</option>
              <option value="manual" ${s.modoCalculo === 'manual' ? 'selected' : ''}>Manual (Valor fixo)</option>
            </select>
          </td>
          <td style="text-align: center;">
            <button class="btn btn-secondary btn-xs btn-excluir-setor" data-idx="${idx}" title="Excluir este setor" style="color: #dc2626;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('.btn-excluir-setor').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-idx'));
          if (setores.length <= 1) {
            mostrarToast('É necessário manter ao menos um setor produtivo.', 'red');
            return;
          }
          setores.splice(idx, 1);
          renderizarLinhasModal();
        });
      });
    }

    const modalEl = criarModalCamada(`
      <div class="modal-overlay active" id="modalEditarCapOverlay">
        <div class="modal-box" style="max-width: 860px;">
          <div class="modal-header">
            <div>
              <div class="modal-title">Capacidade de Produção por Setor</div>
              <div style="font-size: 12px; color: var(--text-gray-500); margin-top: 2px;">
                Configure os limites de produtividade diária de corte, bordado, DTF, costura e outros processos
              </div>
            </div>
            <button class="modal-close-btn" onclick="window.ERP.fecharModal()">&times;</button>
          </div>

          <div class="modal-body" style="padding: 20px;">
            <div style="background: #f8fafc; border: 1px solid var(--border-medium); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 16px; font-size: 12px; color: var(--text-gray-600); line-height: 1.5;">
              💡 <strong>Monitoramento da Capacidade:</strong> Quando o modo for <em>"Auto (Pelas OS ativas)"</em>, a ocupação é calculada dinamicamente com base nas ordens em andamento em cada setor (Corte, Bordado, DTF ou Costura). Caso queira fixar o apontamento do turno manualmente, selecione <em>"Manual"</em>.
            </div>

            <div class="table-wrapper" style="margin-bottom: 14px; max-height: 380px; overflow-y: auto;">
              <table class="erp-table">
                <thead>
                  <tr>
                    <th>Nome do Setor / Processo</th>
                    <th>Capacidade Diária</th>
                    <th>Unidade</th>
                    <th>Produção Real / Apontada</th>
                    <th>Modo de Cálculo</th>
                    <th style="width: 50px; text-align: center;">Ação</th>
                  </tr>
                </thead>
                <tbody id="corpoTabelaCapacidades">
                </tbody>
              </table>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 4px;">
              <button class="btn btn-secondary btn-sm" id="btnAdicionarNovoSetor">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                + Adicionar Outro Setor (ex: Silk, Sublimação)
              </button>
              <button class="btn btn-secondary btn-xs" id="btnRestaurarCapPadrao">Restaurar 4 Setores Padrão</button>
            </div>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px;">
            <button class="btn btn-secondary" onclick="window.ERP.fecharModal()">Cancelar</button>
            <button class="btn btn-primary" id="btnSalvarCapacidades">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Salvar Capacidades
            </button>
          </div>
        </div>
      </div>
    `);

    renderizarLinhasModal();

    // Adicionar novo setor
    document.getElementById('btnAdicionarNovoSetor')?.addEventListener('click', () => {
      setores.push({
        id: `setor_${Date.now()}`,
        nome: "Novo Setor de Produção",
        capacidadeDiaria: 200,
        unidade: "peças/dia",
        atualProduzido: 0,
        modoCalculo: "auto"
      });
      renderizarLinhasModal();
    });

    // Salvar
    document.getElementById('btnSalvarCapacidades')?.addEventListener('click', () => {
      const inputs = modalEl.querySelectorAll('#corpoTabelaCapacidades input[data-campo], #corpoTabelaCapacidades select[data-campo]');
      inputs.forEach(el => {
        const idx = Number(el.getAttribute('data-idx'));
        const campo = el.getAttribute('data-campo');
        if (setores[idx]) {
          if (campo === 'capacidadeDiaria' || campo === 'atualProduzido') {
            setores[idx][campo] = Math.max(0, Number(el.value) || 0);
          } else {
            setores[idx][campo] = el.value.trim();
          }
        }
      });

      db.capacidadesProducao = setores;
      salvarEstado();
      fecharModal(modalEl);
      mostrarToast('Capacidades produtivas atualizadas com sucesso!', 'green');
      renderizarAbertura();
    });

    // Restaurar Padrão
    document.getElementById('btnRestaurarCapPadrao')?.addEventListener('click', () => {
      if (confirm('Deseja restaurar as capacidades padrão de fábrica (Mesa de Corte, Bordado, DTF, Costura)?')) {
        db.capacidadesProducao = JSON.parse(JSON.stringify(window.ERP_INITIAL_DATA.capacidadesProducao || []));
        salvarEstado();
        fecharModal(modalEl);
        mostrarToast('Capacidades padrão restauradas!', 'green');
        renderizarAbertura();
      }
    });
  }

  /* ==========================================================================
     MÓDULO 13: MINHA EMPRESA, CONTROLE DE PERFIS & GESTÃO DE BACKUP
     ========================================================================== */
  function configurarIdentidadeEPerfis() {
    if (!window.ERP_CLOUD) return;

    const empConfig = window.ERP_CLOUD.obterEmpresaConfig();
    window.ERP_CLOUD.atualizarElementosVisuaisEmpresa(empConfig);

    const perfilAtual = window.ERP_CLOUD.obterPerfilAtivo();
    window.ERP_CLOUD.atualizarVisuaisPerfil(perfilAtual);

    const selPerfil = document.getElementById('selectPerfilUsuario');
    if (selPerfil) {
      selPerfil.value = perfilAtual.id;
      selPerfil.addEventListener('change', (e) => {
        const novoId = e.target.value;
        const p = window.ERP_CLOUD.definirPerfilAtivo(novoId);
        mostrarToast('Perfil ativo alterado para: ' + p.cargo, 'green');
        if (!p.abasPermitidas.includes(abaAtiva)) {
          navegarPara(p.abasPermitidas[0] || 'pedidos');
        } else {
          navegarPara(abaAtiva);
        }
      });
    }

    const footerUser = document.getElementById('sidebarUserFooter');
    if (footerUser) {
      footerUser.addEventListener('click', () => {
        abrirModalTrocarPerfil();
      });
    }
  }

  function abrirModalTrocarPerfil() {
    if (!window.ERP_CLOUD) return;
    const perfilAtual = window.ERP_CLOUD.obterPerfilAtivo();

    const modalEl = criarModalCamada(`
      <div class="modal-overlay active">
        <div class="modal-box" style="max-width: 680px;">
          <div class="modal-header">
            <div>
              <div class="modal-title">Alternar Perfil de Acesso Industrial</div>
              <div style="font-size: 11.5px; color: var(--text-gray-500); margin-top: 2px;">
                Selecione o nível de permissão operacional para simular ou operar o sistema
              </div>
            </div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>

          <div class="modal-body" style="padding: 20px;">
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div class="perfil-card-option ${perfilAtual.id === 'dono' ? 'selected' : ''}" data-perfil-id="dono" style="border: 2px solid ${perfilAtual.id === 'dono' ? '#0f172a' : '#cbd5e1'}; background: ${perfilAtual.id === 'dono' ? '#f8fafc' : '#ffffff'}; border-radius: 6px; padding: 14px; cursor: pointer;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 38px; height: 38px; border-radius: 4px; background: #0f172a; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px;">ADM</div>
                    <div>
                      <strong style="font-size: 14px; color: #0f172a;">👑 Diretoria / Dono (Acesso Total)</strong>
                      <div style="font-size: 11.5px; color: #475569; margin-top: 2px;">Acesso irrestrito a todas as 14 áreas, DRE gerencial, margens de lucro, faturamento e parametrização.</div>
                    </div>
                  </div>
                  ${perfilAtual.id === 'dono' ? '<span class="status-pill status-green" style="font-weight: 700;">ATIVO</span>' : '<button class="btn btn-secondary btn-xs">Selecionar</button>'}
                </div>
              </div>

              <div class="perfil-card-option ${perfilAtual.id === 'vendedor' ? 'selected' : ''}" data-perfil-id="vendedor" style="border: 2px solid ${perfilAtual.id === 'vendedor' ? '#0f172a' : '#cbd5e1'}; background: ${perfilAtual.id === 'vendedor' ? '#f8fafc' : '#ffffff'}; border-radius: 6px; padding: 14px; cursor: pointer;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 38px; height: 38px; border-radius: 4px; background: #0284c7; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px;">VND</div>
                    <div>
                      <strong style="font-size: 14px; color: #0f172a;">💼 Vendedor / Atendimento Comercial</strong>
                      <div style="font-size: 11.5px; color: #475569; margin-top: 2px;">Foco em orçamentos rápidos, propostas no WhatsApp e catálogo. Oculta DRE e margem interna de lucro.</div>
                    </div>
                  </div>
                  ${perfilAtual.id === 'vendedor' ? '<span class="status-pill status-green" style="font-weight: 700;">ATIVO</span>' : '<button class="btn btn-secondary btn-xs">Selecionar</button>'}
                </div>
              </div>

              <div class="perfil-card-option ${perfilAtual.id === 'oficina' ? 'selected' : ''}" data-perfil-id="oficina" style="border: 2px solid ${perfilAtual.id === 'oficina' ? '#0f172a' : '#cbd5e1'}; background: ${perfilAtual.id === 'oficina' ? '#f8fafc' : '#ffffff'}; border-radius: 6px; padding: 14px; cursor: pointer;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 38px; height: 38px; border-radius: 4px; background: #b45309; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px;">OFC</div>
                    <div>
                      <strong style="font-size: 14px; color: #0f172a;">✂️ Oficina / Chão de Fábrica & Corte</strong>
                      <div style="font-size: 11.5px; color: #475569; margin-top: 2px;">Foco em Ordens de Produção, Nesting DTF e Estoque de tecidos. Oculta dados de faturamento e valores monetários.</div>
                    </div>
                  </div>
                  ${perfilAtual.id === 'oficina' ? '<span class="status-pill status-green" style="font-weight: 700;">ATIVO</span>' : '<button class="btn btn-secondary btn-xs">Selecionar</button>'}
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="window.ERP.fecharModal()">Fechar</button>
          </div>
        </div>
      </div>
    `);

    modalEl.querySelectorAll('.perfil-card-option').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-perfil-id');
        const p = window.ERP_CLOUD.definirPerfilAtivo(id);
        fecharModal(modalEl);
        mostrarToast('Perfil ativado: ' + p.cargo, 'green');
        if (!p.abasPermitidas.includes(abaAtiva)) {
          navegarPara(p.abasPermitidas[0] || 'pedidos');
        } else {
          navegarPara(abaAtiva);
        }
      });
    });
  }

  function abrirModalBackup() {
    const modalEl = criarModalCamada(`
      <div class="modal-overlay active">
        <div class="modal-box" style="max-width: 640px;">
          <div class="modal-header">
            <div>
              <div class="modal-title">Central de Backup & Nuvem</div>
              <div style="font-size: 11.5px; color: var(--text-gray-500); margin-top: 2px;">
                Proteja as informações da confecção com exportação e restauração segura
              </div>
            </div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>

          <div class="modal-body" style="padding: 20px;">
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 12px; margin-bottom: 16px; display: flex; align-items: center; gap: 10px;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#047857" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <div>
                <strong style="color: #047857; font-size: 13px;">Armazenamento Seguro em Arquivo JSON</strong>
                <div style="font-size: 11.5px; color: #065f46; margin-top: 2px;">Seus dados ficam 100% sob seu controle. Você pode baixar cópias de segurança a qualquer momento e restaurar em outro computador ou navegador.</div>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="color: #0f172a; font-size: 13px;">1. Exportar Backup do Sistema (Download JSON)</strong>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Salva todos os pedidos, clientes, estoque, histórico financeiro e dados cadastrais.</div>
                </div>
                <button class="btn btn-primary btn-sm" id="btnExportarBackupModal">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Baixar Backup
                </button>
              </div>

              <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="color: #0f172a; font-size: 13px;">2. Restaurar Backup de Arquivo</strong>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Importe um arquivo .json gerado previamente para carregar todos os dados.</div>
                </div>
                <div>
                  <input type="file" id="inpArquivoRestoreModal" accept=".json" style="display: none;">
                  <button class="btn btn-secondary btn-sm" id="btnDispararRestoreModal">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    Restaurar JSON
                  </button>
                </div>
              </div>

              <div style="border: 1.5px solid #a7f3d0; background: #ecfdf5; border-radius: 6px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="color: #047857; font-size: 13px;">☁️ Banco de Dados na Nuvem (Firebase / Firestore)</strong>
                  <div style="font-size: 11px; color: #065f46; margin-top: 2px;">Sincronização multi-dispositivo em tempo real (celular do vendedor, PC do dono e oficina).</div>
                </div>
                <button class="btn btn-primary btn-sm" id="btnConfigurarNuvemBackupModal" style="background: #047857; border-color: #047857; font-weight: 700;">
                  Configurar Nuvem
                </button>
              </div>

              <div style="border: 1px solid #bae6fd; background: #f0f9ff; border-radius: 6px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="color: #0369a1; font-size: 13px;">✨ Carregar Showroom de Vendas (Demo Completo)</strong>
                  <div style="font-size: 11px; color: #0284c7; margin-top: 2px;">Preenche pedidos, estoque e financeiro com dados de fábrica modelo para demonstrações.</div>
                </div>
                <button class="btn btn-secondary btn-sm" id="btnShowroomModal" style="border-color: #0284c7; color: #0369a1; font-weight: 700;">
                  Carregar Demo
                </button>
              </div>

              <div style="border: 1px solid #fecaca; background: #fff5f5; border-radius: 6px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="color: #b91c1c; font-size: 13px;">⚠️ Zerar Sistema para Produção Real</strong>
                  <div style="font-size: 11px; color: #991b1b; margin-top: 2px;">Limpa todos os pedidos de teste e deixa as tabelas limpas para começar a operar.</div>
                </div>
                <button class="btn btn-secondary btn-sm" id="btnZerarProducaoModal" style="border-color: #b91c1c; color: #b91c1c; font-weight: 700;">
                  Zerar Fábrica
                </button>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="window.ERP.fecharModal()">Fechar</button>
          </div>
        </div>
      </div>
    `);

    document.getElementById('btnConfigurarNuvemBackupModal')?.addEventListener('click', () => {
      fecharModal(modalEl);
      if (window.ERP_CLOUD && typeof window.ERP_CLOUD.abrirModalConfigNuvem === 'function') {
        window.ERP_CLOUD.abrirModalConfigNuvem();
      }
    });

    document.getElementById('btnExportarBackupModal')?.addEventListener('click', () => {
      window.ERP_CLOUD.exportarBackupJson(db);
      mostrarToast('Arquivo de backup gerado com sucesso!', 'green');
    });

    const fileInp = document.getElementById('inpArquivoRestoreModal');
    document.getElementById('btnDispararRestoreModal')?.addEventListener('click', () => {
      fileInp?.click();
    });

    fileInp?.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        const conteudo = evt.target.result;
        window.ERP_CLOUD.restaurarBackupJson(conteudo, (novoBanco) => {
          db = novoBanco;
          salvarEstado();
          atualizarBadges();
          fecharModal(modalEl);
          mostrarToast('Backup restaurado com sucesso! Dados atualizados.', 'green');
          navegarPara(abaAtiva);
        });
      };
      reader.readAsText(file);
    });

    document.getElementById('btnShowroomModal')?.addEventListener('click', () => {
      if (confirm('Deseja carregar a demonstração completa de showroom da fábrica?')) {
        fecharModal(modalEl);
        carregarDemonstracaoShowroom();
      }
    });

    document.getElementById('btnZerarProducaoModal')?.addEventListener('click', () => {
      if (confirm('Atenção: deseja zerar todos os pedidos e dados de teste para iniciar a produção real da confecção?')) {
        fecharModal(modalEl);
        zerarBancoProducaoReal();
      }
    });
  }

  function carregarDemonstracaoShowroom() {
    const hoje = new Date().toISOString().split('T')[0];
    
    const empDemo = {
      razaoSocial: "TexPro Indústria e Comércio de Confecções Ltda",
      nomeFantasia: "TexPro Uniformes Profissionais",
      cnpj: "34.582.910/0001-44",
      inscricaoEstadual: "123.456.789.110",
      telefone: "11987654321",
      email: "comercial@texprouniformes.com.br",
      chavePix: "34.582.910/0001-44",
      tipoChavePix: "CNPJ",
      endereco: "Rua Têxtil Industrial, 450",
      bairro: "Distrito Industrial",
      cidade: "Americana",
      uf: "SP",
      cep: "13465-000",
      logoUrl: null,
      rodapeProposta: "Proposta válida por 15 dias corridos. 50% de sinal na aprovação e 50% na entrega.",
      rodapeFicha: "Ordem de Produção Oficial. Tolerância industrial de 2mm. Confirme o encaixe antes do corte."
    };
    if (window.ERP_CLOUD && !isDemo) {
      window.ERP_CLOUD.salvarEmpresaConfig(empDemo);
    }

    function dataRelativa(diasOffset) {
      const d = new Date();
      d.setDate(d.getDate() + diasOffset);
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const ano = d.getFullYear();
      return `${dia}/${mes}/${ano}`;
    }

    const mockupPolo = window.ERP_MOCKUPS ? window.ERP_MOCKUPS.gerarMockupSvg('polo', '#1e3a8a', '#ffffff', 'TRANSBRASIL') : '';
    const mockupDry = window.ERP_MOCKUPS ? window.ERP_MOCKUPS.gerarMockupSvg('camiseta', '#0f172a', '#eab308', 'ALPHA') : '';
    const mockupOp = window.ERP_MOCKUPS ? window.ERP_MOCKUPS.gerarMockupSvg('operacional', '#334155', '#eab308', 'HORIZONTE') : '';
    const mockupJaleco = window.ERP_MOCKUPS ? window.ERP_MOCKUPS.gerarMockupSvg('jaleco', '#ffffff', '#0ea5e9', 'HOSPITAL') : '';
    const mockupAvental = window.ERP_MOCKUPS ? window.ERP_MOCKUPS.gerarMockupSvg('avental', '#991b1b', '#f59e0b', 'FOGO') : '';
    const mockupAgasalho = window.ERP_MOCKUPS ? window.ERP_MOCKUPS.gerarMockupSvg('agasalho', '#1e3a8a', '#ffffff', 'OBJETIVO') : '';

    db.pedidos = [
      {
        id: "PED-101",
        numero: "101",
        clienteNome: "TransBrasil Logística Integrada Ltda",
        clienteTelefone: "11988887777",
        produtoNome: "Camisa Polo Tradicional Piquet",
        corTecido: "Azul Marinho",
        observacoesCoresDetalhes: "Gola e punhos brancos com 2 frisos laranjas (2mm). Peitilho interno branco.",
        tecidoEspecificacao: "Piquet PA (50% Algodão / 50% Poliéster) Azul Marinho",
        tipoPersonalizacao: "Bordado Computadorizado Peito + DTF Costas",
        dtfLarguraRolo: 58,
        grade: { pp: 10, p: 30, m: 50, g: 40, gg: 15, xg: 5, total: 150 },
        precoUnitarioVenda: 58.00,
        valorTotalVenda: 8700.00,
        sinalPago: true,
        valorSinalPago: 4350.00,
        valorPago: 4350.00,
        saldoPendente: 4350.00,
        status: "Em Producao",
        etapa: "Costura",
        etapaProducao: "Costura",
        costureiraNome: "Dona Maria Facção Especial",
        tipoRegistro: "Pedido",
        prazoPedidoDias: 14,
        prazoInternoDias: 10,
        dataCriacao: dataRelativa(-3),
        dataPrevisaoEntrega: dataRelativa(12),
        dataMetaInterna: dataRelativa(8),
        mockupUrl: mockupPolo,
        margemLucroPercentual: 42.5,
        custoTotalProducao: 5002.50
      },
      {
        id: "PED-102",
        numero: "102",
        clienteNome: "Academia Alpha Cross & Fitness",
        clienteTelefone: "11977776666",
        produtoNome: "Camiseta Dry Fit Confort Esportiva",
        corTecido: "Preto Reativo",
        observacoesCoresDetalhes: "Recortes laterais e vivos em amarelo ouro dry fit.",
        tecidoEspecificacao: "Malha Dry Fit Poliéster 130g Preto com Detalhe Dourado",
        tipoPersonalizacao: "Impressão DTF Digital Frente e Costas",
        dtfLarguraRolo: 58,
        grade: { pp: 5, p: 25, m: 45, g: 35, gg: 10, xg: 0, total: 120 },
        precoUnitarioVenda: 38.00,
        valorTotalVenda: 4560.00,
        sinalPago: false,
        valorSinalPago: 0.00,
        valorPago: 0.00,
        saldoPendente: 4560.00,
        status: "Quarentena",
        etapa: "Quarentena",
        etapaProducao: "Quarentena",
        tipoRegistro: "Pedido",
        motivoQuarentena: "Aguardando aprovação final da arte vetorizada do cliente para impressão DTF",
        prazoPedidoDias: 8,
        prazoInternoDias: 5,
        dataCriacao: dataRelativa(-3),
        dataPrevisaoEntrega: dataRelativa(5),
        dataMetaInterna: dataRelativa(3),
        mockupUrl: mockupDry,
        margemLucroPercentual: 48.0,
        custoTotalProducao: 2371.20
      },
      {
        id: "PED-103",
        numero: "103",
        clienteNome: "Construtora Horizonte Engenharia",
        clienteTelefone: "11966665555",
        produtoNome: "Camisa Operacional Brim c/ Faixa Refletiva",
        corTecido: "Cinza Chumbo",
        observacoesCoresDetalhes: "Faixa refletiva de 50mm e gola italiana reforçada com pesponto duplo.",
        tecidoEspecificacao: "Tecido Brim Pesado Sarja 260g Cinza Chumbo com Faixa Alta Visibilidade",
        tipoPersonalizacao: "Bordado Bolso Frente + Silk Screen Costas",
        dtfLarguraRolo: 58,
        grade: { pp: 0, p: 20, m: 40, g: 40, gg: 20, xg: 10, total: 130 },
        precoUnitarioVenda: 74.50,
        valorTotalVenda: 9685.00,
        sinalPago: false,
        valorSinalPago: 0.00,
        valorPago: 0.00,
        saldoPendente: 9685.00,
        status: "Orcamento",
        etapa: "Orcamento",
        etapaProducao: "Orcamento",
        tipoRegistro: "Orcamento",
        prazoPedidoDias: 7,
        prazoInternoDias: 5,
        dataCriacao: dataRelativa(-5),
        dataPrevisaoEntrega: null,
        dataMetaInterna: null,
        mockupUrl: mockupOp,
        margemLucroPercentual: 39.0,
        custoTotalProducao: 5907.85
      },
      {
        id: "PED-105",
        numero: "105",
        clienteNome: "Restaurante e Churrascaria Fogo Nobre",
        clienteTelefone: "11944443333",
        produtoNome: "Avental Master Chef Sarja Pesada",
        corTecido: "Vinho Tinto",
        observacoesCoresDetalhes: "Alças e detalhes dos bolsos em couro sintético marrom café.",
        tecidoEspecificacao: "Sarja Tinto Vinho Tinto com Alças em Couro Sintético",
        tipoPersonalizacao: "Bordado Central 3D Alta Definição",
        dtfLarguraRolo: 58,
        grade: { pp: 0, p: 20, m: 30, g: 25, gg: 5, xg: 0, total: 80 },
        precoUnitarioVenda: 45.00,
        valorTotalVenda: 3600.00,
        sinalPago: true,
        valorSinalPago: 1800.00,
        valorPago: 1800.00,
        saldoPendente: 1800.00,
        status: "Em Producao",
        etapa: "Estamparia / DTF",
        etapaProducao: "Estamparia / DTF",
        costureiraNome: "Oficina Interna",
        tipoRegistro: "Pedido",
        prazoPedidoDias: 10,
        prazoInternoDias: 6,
        dataCriacao: dataRelativa(-10),
        dataPrevisaoEntrega: dataRelativa(0),
        dataMetaInterna: dataRelativa(-1),
        mockupUrl: mockupAvental,
        margemLucroPercentual: 46.5,
        custoTotalProducao: 1926.00
      },
      {
        id: "PED-106",
        numero: "106",
        clienteNome: "Colégio Objetivo Sul & Esportes",
        clienteTelefone: "11933332222",
        produtoNome: "Conjunto Agasalho Helanca Escolar",
        corTecido: "Azul Royal",
        observacoesCoresDetalhes: "Mangas raglan com 2 listras brancas aplicadas e punho canelado azul e branco.",
        tecidoEspecificacao: "Helanca Flanelada 100% Poliéster Azul Royal com Detalhes Brancos",
        tipoPersonalizacao: "Silk Screen Peito + DTF Costas",
        dtfLarguraRolo: 58,
        grade: { pp: 15, p: 35, m: 40, g: 15, gg: 5, xg: 0, total: 110 },
        precoUnitarioVenda: 95.00,
        valorTotalVenda: 10450.00,
        sinalPago: true,
        valorSinalPago: 5225.00,
        valorPago: 5225.00,
        saldoPendente: 5225.00,
        status: "Em Producao",
        etapa: "Corte",
        etapaProducao: "Corte",
        costureiraNome: "Oficina Interna",
        tipoRegistro: "Pedido",
        prazoPedidoDias: 12,
        prazoInternoDias: 8,
        dataCriacao: dataRelativa(-14),
        dataPrevisaoEntrega: dataRelativa(-2),
        dataMetaInterna: dataRelativa(-4),
        mockupUrl: mockupAgasalho,
        margemLucroPercentual: 44.0,
        custoTotalProducao: 5852.00
      },
      {
        id: "PED-104",
        numero: "104",
        clienteNome: "Hospital Santa Clara & Diagnósticos",
        clienteTelefone: "11955554444",
        produtoNome: "Jaleco Hospitalar Manga Longa Oxford",
        corTecido: "Branco Neve",
        observacoesCoresDetalhes: "Vivo azul celeste na gola e borda dos bolsos frontais.",
        tecidoEspecificacao: "Tecido Oxford 100% Poliéster Branco Alvejado",
        tipoPersonalizacao: "Bordado Especial no Bolso Superior com Brasão e Especialidade",
        dtfLarguraRolo: 28,
        grade: { pp: 10, p: 25, m: 35, g: 15, gg: 5, xg: 0, total: 90 },
        precoUnitarioVenda: 89.00,
        valorTotalVenda: 8010.00,
        sinalPago: true,
        valorSinalPago: 8010.00,
        valorPago: 8010.00,
        saldoPendente: 0.00,
        status: "Entregue",
        etapa: "Entregue",
        etapaProducao: "Entregue",
        tipoRegistro: "Pedido",
        prazoPedidoDias: 15,
        prazoInternoDias: 10,
        dataCriacao: dataRelativa(-20),
        dataPrevisaoEntrega: dataRelativa(-5),
        dataMetaInterna: dataRelativa(-8),
        mockupUrl: mockupJaleco,
        margemLucroPercentual: 52.0,
        custoTotalProducao: 3844.80
      }
    ];

    db.clientes = [
      { id: "CLI-01", razaoSocial: "TransBrasil Logística Integrada Ltda", nomeFantasia: "TransBrasil Logística", cidade: "Campinas", uf: "SP", contatoNome: "Carlos Mendes (Comprador)", telefone: "11988887777", email: "carlos@transbrasil.com.br", cnpj: "12.345.678/0001-90", totalPedidosFeitos: 1, faturamentoAcumulado: 8700.00 },
      { id: "CLI-02", razaoSocial: "Academia Alpha Cross & Fitness Ltda", nomeFantasia: "Academia Alpha Cross", cidade: "São Paulo", uf: "SP", contatoNome: "Juliana Ferreira", telefone: "11977776666", email: "comercial@alphacross.com.br", cnpj: "98.765.432/0001-11", totalPedidosFeitos: 1, faturamentoAcumulado: 4560.00 },
      { id: "CLI-03", razaoSocial: "Construtora Horizonte Engenharia S/A", nomeFantasia: "Construtora Horizonte", cidade: "Curitiba", uf: "PR", contatoNome: "Eng. Roberto Albuquerque", telefone: "11966665555", email: "obras@horizonte.eng.br", cnpj: "45.678.910/0001-22", totalPedidosFeitos: 1, faturamentoAcumulado: 9685.00 },
      { id: "CLI-04", razaoSocial: "Hospital Santa Clara & Diagnósticos Ltda", nomeFantasia: "Hospital Santa Clara", cidade: "Americana", uf: "SP", contatoNome: "Dra. Patrícia Silveira", telefone: "11955554444", email: "compras@santaclara.org.br", cnpj: "23.456.789/0001-33", totalPedidosFeitos: 1, faturamentoAcumulado: 8010.00 },
      { id: "CLI-05", razaoSocial: "Restaurante e Churrascaria Fogo Nobre Ltda", nomeFantasia: "Restaurante Fogo Nobre", cidade: "Belo Horizonte", uf: "MG", contatoNome: "Chef Marcelo Alcantara", telefone: "11944443333", email: "marcelo@fogonobre.com.br", cnpj: "67.890.123/0001-44", totalPedidosFeitos: 1, faturamentoAcumulado: 3600.00 },
      { id: "CLI-06", razaoSocial: "Colégio Objetivo Sul & Esportes Ltda", nomeFantasia: "Colégio Objetivo Sul", cidade: "Maringá", uf: "PR", contatoNome: "Diretora Helena Ramos", telefone: "11933332222", email: "secretaria@objetivosul.com.br", cnpj: "78.901.234/0001-55", totalPedidosFeitos: 1, faturamentoAcumulado: 10450.00 }
    ];

    db.ordensServico = [
      {
        id: "OS-101",
        pedidoNumero: "101",
        cliente: "TransBrasil Logística Integrada Ltda",
        produto: "Camisa Polo Tradicional Piquet",
        corTecido: "Azul Marinho",
        observacoesCoresDetalhes: "Gola e punhos brancos com 2 frisos laranjas (2mm). Peitilho interno branco.",
        quantidadeTotal: 150,
        grade: { pp: 10, p: 30, m: 50, g: 40, gg: 15, xg: 5 },
        dataEntradaCorte: dataRelativa(-3),
        dataPrevisaoEntrega: dataRelativa(12),
        dataMetaInterna: dataRelativa(8),
        etapaAtual: "Costura",
        costureiraDesignada: "Dona Maria Facção Especial",
        responsavelCorte: "Mestre Antônio (Mesa 1)",
        tecidoConsumidoKg: 42.0,
        status: "Em Producao",
        mockupUrl: mockupPolo,
        prazoPedidoDias: 14,
        prazoInternoDias: 10,
        dtfLarguraRolo: 58,
        instrucoesCorte: "Enfesto com folga de 2mm. Atenção especial ao alinhamento da gola retilínea branca com frisos laranjas.",
        instrucoesCostura: "Costura pespontada reforçada ombro a ombro e aplicação de botões brancos com 2 furos.",
        artesAplicacao: [
          { local: "Peito Esquerdo", dimensao: "9x4 cm", tecnica: "Bordado Computadorizado 8.500 pontos", arquivoNome: "logo_transbrasil_peito.dst" },
          { local: "Costas", dimensao: "26x12 cm", tecnica: "DTF Têxtil Digital Termocolado", arquivoNome: "transbrasil_costas_58cm.png" }
        ]
      },
      {
        id: "OS-105",
        pedidoNumero: "105",
        cliente: "Restaurante e Churrascaria Fogo Nobre",
        produto: "Avental Master Chef Sarja Pesada",
        corTecido: "Vinho Tinto",
        observacoesCoresDetalhes: "Alças e detalhes dos bolsos em couro sintético marrom café.",
        quantidadeTotal: 80,
        grade: { pp: 0, p: 20, m: 30, g: 25, gg: 5, xg: 0 },
        dataEntradaCorte: dataRelativa(-10),
        dataPrevisaoEntrega: dataRelativa(0),
        dataMetaInterna: dataRelativa(-1),
        etapaAtual: "Estamparia / DTF",
        costureiraDesignada: "Oficina Interna",
        responsavelCorte: "Mestre Antônio (Mesa 1)",
        tecidoConsumidoKg: 28.0,
        status: "Em Producao",
        mockupUrl: mockupAvental,
        prazoPedidoDias: 10,
        prazoInternoDias: 6,
        dtfLarguraRolo: 58,
        instrucoesCorte: "Corte sarja com margem para bainha larga e tiras reforçadas em couro sintético.",
        instrucoesCostura: "Costura pesada dupla com acabamento em rebites nos bolsos.",
        artesAplicacao: [
          { local: "Peito Central", dimensao: "18x12 cm", tecnica: "Bordado Computadorizado 3D", arquivoNome: "logo_fogonobre.dst" }
        ]
      },
      {
        id: "OS-106",
        pedidoNumero: "106",
        cliente: "Colégio Objetivo Sul & Esportes",
        produto: "Conjunto Agasalho Helanca Escolar",
        corTecido: "Azul Royal",
        observacoesCoresDetalhes: "Mangas raglan com 2 listras brancas aplicadas e punho canelado azul e branco.",
        quantidadeTotal: 110,
        grade: { pp: 15, p: 35, m: 40, g: 15, gg: 5, xg: 0 },
        dataEntradaCorte: dataRelativa(-14),
        dataPrevisaoEntrega: dataRelativa(-2),
        dataMetaInterna: dataRelativa(-4),
        etapaAtual: "Corte",
        costureiraDesignada: "Oficina Interna",
        responsavelCorte: "Mestre Antônio (Mesa 1)",
        tecidoConsumidoKg: 55.0,
        status: "Em Producao",
        mockupUrl: mockupAgasalho,
        prazoPedidoDias: 12,
        prazoInternoDias: 8,
        dtfLarguraRolo: 58,
        instrucoesCorte: "Corte com alinhamento das faixas laterais brancas.",
        instrucoesCostura: "Inserção de elástico 4cm no cós e zíper destacável na jaqueta.",
        artesAplicacao: [
          { local: "Peito Esquerdo", dimensao: "8x8 cm", tecnica: "Silk Screen 2 Cores", arquivoNome: "brasao_objetivo.ai" },
          { local: "Costas", dimensao: "28x10 cm", tecnica: "DTF Digital", arquivoNome: "objetivo_costas.png" }
        ]
      }
    ];

    if (db.estoque && db.estoque.length > 0) {
      db.estoque.forEach(item => {
        if (item.codigo.includes('PIQ-AZUL')) item.saldoAtual = 145;
        else if (item.codigo.includes('PIQ-BRANCO')) item.saldoAtual = 80;
        else if (item.codigo.includes('301')) item.saldoAtual = 95;
        else if (item.codigo.includes('DRY')) item.saldoAtual = 110;
        else if (item.codigo.includes('BRIM')) item.saldoAtual = 250;
        else if (item.codigo.includes('OXFORD')) item.saldoAtual = 120;
        else if (item.codigo.includes('GOLA')) item.saldoAtual = 220;
        else if (item.codigo.includes('PUNHO')) item.saldoAtual = 220;
        else if (item.codigo.includes('BOT')) item.saldoAtual = 12;
        else if (item.codigo.includes('DTF-FILME')) item.saldoAtual = 65;
        else if (item.codigo.includes('POLIAM')) item.saldoAtual = 15;
        else if (item.codigo.includes('TINTA')) item.saldoAtual = 4;
        else if (item.codigo.includes('REFLETIVO')) item.saldoAtual = 85;
        else item.saldoAtual = Math.max(10, (item.estoqueMinimo || 10) * 2);
      });
    }

    db.lancamentosFinanceiros = [
      { id: "LANC-01", data: hoje, tipo: "Receita", categoria: "Venda de Uniformes", descricao: "Sinal 50% Pedido #101 - TransBrasil Logística", valor: 4350.00, formaPagamento: "PIX", status: "Confirmado" },
      { id: "LANC-02", data: hoje, tipo: "Receita", categoria: "Venda de Uniformes", descricao: "Quitação Integral Pedido #104 - Hospital Santa Clara", valor: 8010.00, formaPagamento: "Boleto 15dd", status: "Confirmado" },
      { id: "LANC-03", data: hoje, tipo: "Despesa", categoria: "Matéria-Prima", descricao: "Compra Malha Piquet e Dry - Malharia Sul", valor: 3800.00, formaPagamento: "PIX", status: "Confirmado" },
      { id: "LANC-04", data: hoje, tipo: "Despesa", categoria: "Insumos DTF", descricao: "Bobinas Filme DTF 60cm e Poliamida - DTF Pro", valor: 1250.00, formaPagamento: "Cartão", status: "Confirmado" }
    ];

    db.despesasFixas = [
      { id: "DESP-01", descricao: "Aluguel Galpão Industrial 600m²", categoria: "Aluguel & Instalações", valor: 4500.00, dataVencimento: hoje.substring(0,7) + '-10', status: "Pendente", favorecido: "Imobiliária Central" },
      { id: "DESP-02", descricao: "Energia Elétrica Trifásica Industrial", categoria: "Utilidades", valor: 1850.00, dataVencimento: hoje.substring(0,7) + '-15', status: "Pendente", favorecido: "CPFL Energia" },
      { id: "DESP-03", descricao: "Manutenção Preventiva das Máquinas de Costura e DTF", categoria: "Manutenção", valor: 650.00, dataVencimento: hoje.substring(0,7) + '-25', status: "Pendente", favorecido: "Técnica Têxtil Ltda" }
    ];

    db.equipe = [
      { id: "EQ-01", nome: "Mestre Antônio Silva", cargo: "Chefe de Corte & Enfesto", setor: "Corte", telefone: "11911112222", status: "Ativo" },
      { id: "EQ-02", nome: "Dona Maria Aparecida", cargo: "Costureira Piloto & Facção", setor: "Costura", telefone: "11922223333", status: "Ativo" },
      { id: "EQ-03", nome: "Lucas Rodrigues", cargo: "Operador de Impressão DTF", setor: "Estamparia", telefone: "11933334444", status: "Ativo" },
      { id: "EQ-04", nome: "Fátima Santos", cargo: "Acabamento & Embalagem", setor: "Revisão", telefone: "11944445555", status: "Ativo" }
    ];

    db.costureiras = [
      { id: "COST-01", nome: "Dona Maria Facção Especial", tipo: "Oficina Externa", especialidade: "Polo e Camisaria", capacidadeDiariaPecas: 80, telefone: "11988881111", status: "Ativa", pecasEmProducao: 150 },
      { id: "COST-02", nome: "Oficina Interna da Fábrica", tipo: "Interna", especialidade: "Brim Operacional e Aventais", capacidadeDiariaPecas: 120, telefone: "11988882222", status: "Ativa", pecasEmProducao: 190 },
      { id: "COST-03", nome: "Facção Irmãos Santos", tipo: "Oficina Externa", especialidade: "Agasalhos e Helanca", capacidadeDiariaPecas: 70, telefone: "11988883333", status: "Ativa", pecasEmProducao: 0 }
    ];

    db.capacidadesProducao = [
      { id: "corte", nome: "Mesa de Corte", capacidadeDiaria: 400, unidade: "peças/dia", atualProduzido: 260, modoCalculo: "auto" },
      { id: "bordado", nome: "Bordado Computadorizado", capacidadeDiaria: 250, unidade: "peças/dia", atualProduzido: 180, modoCalculo: "auto" },
      { id: "estamparia", nome: "Estamparia & Silk/DTF", capacidadeDiaria: 200, unidade: "peças/dia", atualProduzido: 140, modoCalculo: "auto" },
      { id: "costura", nome: "Linha de Costura & Fechamento", capacidadeDiaria: 300, unidade: "peças/dia", atualProduzido: 210, modoCalculo: "auto" }
    ];

    db.historicoFinanceiroMensal = [
      { mes: "MAI", mesCompleto: "Maio/2026", entradas: 38500, saidas: 24200, isAtual: false, isPrevisto: false, sincronizarComCaixa: false },
      { mes: "JUN", mesCompleto: "Junho/2026", entradas: 42100, saidas: 26800, isAtual: false, isPrevisto: false, sincronizarComCaixa: false },
      { mes: "JUL", mesCompleto: "Julho/2026", entradas: 39800, saidas: 25100, isAtual: false, isPrevisto: false, sincronizarComCaixa: false },
      { mes: "AGO", mesCompleto: "Agosto/2026", entradas: 46500, saidas: 28900, isAtual: false, isPrevisto: false, sincronizarComCaixa: false },
      { mes: "SET", mesCompleto: "Setembro/2026", entradas: 34405, saidas: 18050, isAtual: true, isPrevisto: false, sincronizarComCaixa: true },
      { mes: "OUT", mesCompleto: "Outubro/2026", entradas: 48000, saidas: 29500, isAtual: false, isPrevisto: true, sincronizarComCaixa: false }
    ];

    salvarEstado();
    atualizarBadges();
    navegarPara('abertura');
    mostrarToast('✨ Showroom da Fábrica Carregado com Sucesso! Demonstração pronta para apresentação.', 'green');
  }

  function zerarBancoProducaoReal() {
    db.pedidos = [];
    db.ordensServico = [];
    db.clientes = [];
    db.lancamentosFinanceiros = [];
    db.despesasFixas = [];
    db.nestingFila = [];
    db.notasFiscais = [];
    db.compras = [];
    if (db.estoque && db.estoque.length > 0) {
      db.estoque.forEach(item => item.saldoAtual = 0);
    }
    salvarEstado();
    atualizarBadges();
    navegarPara('abertura');
    mostrarToast('Sistema 100% zerado e pronto para produção real da confecção!', 'green');
  }

  function renderizarConfiguracoesEmpresa() {
    pageTitleElem.textContent = 'Minha Empresa & Identidade Visual';
    pageBreadcrumbElem.textContent = 'SISTEMA > MINHA EMPRESA';

    const emp = (window.ERP_CLOUD && typeof window.ERP_CLOUD.obterEmpresaConfig === 'function')
      ? window.ERP_CLOUD.obterEmpresaConfig()
      : (db.empresa || {});

    contentArea.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
        <div>
          <p style="color: var(--text-gray-500); font-size: 13px;">
            Personalize a identidade da confecção: logotipo em alta resolução, dados cadastrais, dados para pagamento via PIX e segurança.
          </p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-secondary btn-sm" id="btnExportarBackupEmpresa">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Exportar Backup JSON
          </button>
          <button class="btn btn-primary btn-sm" id="btnSalvarEmpresaTopo">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Salvar Alterações
          </button>
        </div>
      </div>

      <!-- Banner de Aplicação Universal -->
      <div style="background: #f8fafc; border: 1px solid var(--border-medium); border-left: 4px solid #0f172a; border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 12.5px; color: var(--text-gray-600); line-height: 1.5;">
          🏛️ <strong>Parametrização Oficial da Fábrica:</strong> Os dados e o logotipo configurados nesta tela são refletidos instantaneamente no menu superior, no cabeçalho das <strong>Propostas Comerciais</strong> enviadas aos clientes via WhatsApp/PDF e nas <strong>Ordens de Produção A4</strong> impressas para o chão de fábrica.
        </div>
      </div>

      <div class="grid-cards-2" style="gap: 20px; margin-bottom: 24px;">
        <!-- Card 1: Logotipo & Identidade Visual -->
        <div class="card">
          <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
            <div class="card-title">1. Logotipo & Identidade da Confecção</div>
            <span class="status-pill status-gray">IDENTIDADE VISUAL</span>
          </div>
          <div class="card-body">
            <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 18px; padding-bottom: 16px; border-bottom: 1px solid var(--border-subtle);">
              <div id="boxPreviewLogoEmpresa" style="width: 100px; height: 100px; border: 2px dashed var(--border-medium); border-radius: 6px; display: flex; align-items: center; justify-content: center; background: #ffffff; overflow: hidden; padding: 4px;">
                ${emp.logoUrl ? `<img src="${emp.logoUrl}" style="width: 100%; height: 100%; object-fit: contain;" alt="Logo">` : `<span style="font-weight: 800; font-size: 26px; color: #64748b;">${(emp.nomeFantasia || 'TP').substring(0, 2).toUpperCase()}</span>`}
              </div>
              <div style="flex: 1;">
                <input type="file" id="inpUploadLogoEmpresa" accept="image/*" style="display: none;">
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <button type="button" class="btn btn-primary btn-xs" id="btnEscolherLogoEmpresa">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    Carregar Arquivo de Logo (PNG, JPG, SVG)
                  </button>
                  <button type="button" class="btn btn-secondary btn-xs" id="btnRemoverLogoEmpresa" style="color: #dc2626;">
                    Remover Imagem
                  </button>
                </div>
                <div style="font-size: 11px; color: var(--text-gray-500); margin-top: 6px;">
                  Recomendado: Fundo transparente, formato horizontal ou quadrado (mínimo 300x300px).
                </div>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label">Nome Fantasia (Como a fábrica é conhecida comercialmente):</label>
              <input type="text" class="form-control" id="inpEmpNomeFantasia" value="${emp.nomeFantasia || ''}" placeholder="ex: TexPro Uniformes">
            </div>

            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label">Razão Social Completa:</label>
              <input type="text" class="form-control" id="inpEmpRazaoSocial" value="${emp.razaoSocial || ''}" placeholder="ex: TexPro Indústria e Comércio Têxtil Ltda">
            </div>

            <div class="grid-cards-2" style="gap: 10px; margin-bottom: 12px;">
              <div class="form-group">
                <label class="form-label">CNPJ:</label>
                <input type="text" class="form-control text-mono" id="inpEmpCnpj" value="${emp.cnpj || ''}" placeholder="00.000.000/0000-00">
              </div>
              <div class="form-group">
                <label class="form-label">Inscrição Estadual (IE):</label>
                <input type="text" class="form-control text-mono" id="inpEmpIe" value="${emp.inscricaoEstadual || ''}" placeholder="ex: 123.456.789.110">
              </div>
            </div>

            <div class="grid-cards-2" style="gap: 10px;">
              <div class="form-group">
                <label class="form-label">WhatsApp Comercial:</label>
                <input type="text" class="form-control text-mono" id="inpEmpTelefone" value="${emp.telefone || ''}" placeholder="11999998888">
              </div>
              <div class="form-group">
                <label class="form-label">E-mail Comercial:</label>
                <input type="email" class="form-control" id="inpEmpEmail" value="${emp.email || ''}" placeholder="contato@minhaconfeccao.com.br">
              </div>
            </div>
          </div>
        </div>

        <!-- Card 2: Pagamentos PIX & Regras Comerciais -->
        <div class="card">
          <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
            <div class="card-title">2. Chave PIX da Fábrica & Regras Comerciais</div>
            <span class="status-pill status-green">FATURAMENTO & RECEBIMENTOS</span>
          </div>
          <div class="card-body">
            <div style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 6px; padding: 12px; margin-bottom: 16px;">
              <div style="font-size: 11px; font-weight: 700; color: #15803d; text-transform: uppercase; margin-bottom: 4px;">Recebimento de Sinal & Quitação via PIX</div>
              <div style="font-size: 11.5px; color: #166534; line-height: 1.4;">
                Esta chave PIX é impressa nas <strong>Propostas Comerciais</strong> e enviada nos textos prontos do <strong>WhatsApp</strong> para que seu cliente pague a entrada com 1 clique.
              </div>
            </div>

            <div class="grid-cards-2" style="gap: 10px; margin-bottom: 12px;">
              <div class="form-group">
                <label class="form-label">Tipo de Chave PIX:</label>
                <select class="form-select" id="inpEmpTipoChavePix">
                  <option value="CNPJ" ${emp.tipoChavePix === 'CNPJ' ? 'selected' : ''}>CNPJ</option>
                  <option value="Telefone/Celular" ${emp.tipoChavePix === 'Telefone/Celular' ? 'selected' : ''}>Telefone / Celular</option>
                  <option value="E-mail" ${emp.tipoChavePix === 'E-mail' ? 'selected' : ''}>E-mail</option>
                  <option value="Chave Aleatória (EVP)" ${emp.tipoChavePix === 'Chave Aleatória (EVP)' ? 'selected' : ''}>Chave Aleatória</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Chave PIX da Confecção:</label>
                <input type="text" class="form-control text-mono" id="inpEmpChavePix" value="${emp.chavePix || ''}" placeholder="Insira a chave oficial">
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label">Endereço da Fábrica (Rua, Bairro, Cidade/UF):</label>
              <input type="text" class="form-control" id="inpEmpEndereco" value="${emp.endereco || ''}" placeholder="Rua das Confecções, 100 - Bairro Industrial - Americana/SP">
            </div>

            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label">Texto Padrão de Condições na Proposta Comercial:</label>
              <textarea class="form-control" id="inpEmpRodapeProposta" rows="2" style="font-size: 11.5px;">${emp.rodapeProposta || 'Proposta válida por 15 dias corridos. Pagamento de 50% de sinal na aprovação e saldo restante na retirada.'}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Instrução Geral no Rodapé da Ordem de Produção (A4):</label>
              <textarea class="form-control" id="inpEmpRodapeFicha" rows="2" style="font-size: 11.5px;">${emp.rodapeFicha || 'Ordem de Produção Oficial. Tolerância industrial de corte de 2mm. Em caso de divergência de cor, contate a gerência.'}</textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 3: Central de Backup, Restauração e Demonstração -->
      <div class="card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <div class="card-title">3. Central de Backup Seguro, Nuvem & Demonstração Comercial (Showroom)</div>
          <span class="status-pill status-blue">GESTÃO DE DADOS</span>
        </div>
        <div class="card-body">
          <div class="grid-cards-2" style="gap: 16px;">
            <div style="border: 1px solid var(--border-medium); border-radius: var(--radius-md); padding: 14px; background: #ffffff;">
              <strong style="display: block; color: var(--text-primary); font-size: 13.5px; margin-bottom: 4px;">📦 Backup Completo em Arquivo JSON</strong>
              <p style="font-size: 11.5px; color: var(--text-gray-500); line-height: 1.4; margin-bottom: 12px;">
                Baixe um arquivo seguro com todos os pedidos, clientes, orçamentos, estoque e finanças para seu computador ou pen drive.
              </p>
              <div style="display: flex; gap: 8px;">
                <button type="button" class="btn btn-primary btn-sm" id="btnExportarJsonCard">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Exportar Backup Agora
                </button>
                <input type="file" id="inpRestaurarArquivoCard" accept=".json" style="display: none;">
                <button type="button" class="btn btn-secondary btn-sm" id="btnRestaurarJsonCard">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  Restaurar de Arquivo
                </button>
              </div>
            </div>

            <div style="border: 1.5px solid #bae6fd; background: #f0f9ff; border-radius: var(--radius-md); padding: 14px;">
              <strong style="display: block; color: #0369a1; font-size: 13.5px; margin-bottom: 4px;">✨ Showroom de Vendas (Demonstração 1-Clique)</strong>
              <p style="font-size: 11.5px; color: #0284c7; line-height: 1.4; margin-bottom: 12px;">
                Vai apresentar o sistema para uma confecção ou cliente? Carregue dados modelo com polos, jalecos, camisetas, mockups 3x4 e fluxo financeiro completo.
              </p>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button type="button" class="btn btn-secondary btn-sm" id="btnCarregarShowroomCard" style="border-color: #0284c7; color: #0369a1; font-weight: 700;">
                  Carregar Showroom Demo
                </button>
                <button type="button" class="btn btn-secondary btn-sm" id="btnZerarFabricaCard" style="border-color: #f87171; color: #b91c1c; font-weight: 700;">
                  Zerar para Produção Real
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    function salvarFormularioEmpresa() {
      const novosDados = {
        nomeFantasia: document.getElementById('inpEmpNomeFantasia')?.value.trim() || 'Minha Confecção',
        razaoSocial: document.getElementById('inpEmpRazaoSocial')?.value.trim() || 'Minha Confecção Ltda',
        cnpj: document.getElementById('inpEmpCnpj')?.value.trim() || '',
        inscricaoEstadual: document.getElementById('inpEmpIe')?.value.trim() || '',
        telefone: document.getElementById('inpEmpTelefone')?.value.trim() || '',
        email: document.getElementById('inpEmpEmail')?.value.trim() || '',
        tipoChavePix: document.getElementById('inpEmpTipoChavePix')?.value || 'CNPJ',
        chavePix: document.getElementById('inpEmpChavePix')?.value.trim() || '',
        endereco: document.getElementById('inpEmpEndereco')?.value.trim() || '',
        rodapeProposta: document.getElementById('inpEmpRodapeProposta')?.value.trim() || '',
        rodapeFicha: document.getElementById('inpEmpRodapeFicha')?.value.trim() || '',
        logoUrl: emp.logoUrl || null
      };

      if (window.ERP_CLOUD) {
        window.ERP_CLOUD.salvarEmpresaConfig(novosDados);
      }
      db.empresa = Object.assign({}, db.empresa, novosDados);
      salvarEstado();
      mostrarToast('Dados cadastrais da empresa atualizados com sucesso!', 'green');
    }

    document.getElementById('btnSalvarEmpresaTopo')?.addEventListener('click', salvarFormularioEmpresa);

    const inpLogo = document.getElementById('inpUploadLogoEmpresa');
    document.getElementById('btnEscolherLogoEmpresa')?.addEventListener('click', () => inpLogo?.click());

    inpLogo?.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        mostrarToast('A imagem selecionada é muito pesada (máximo 2MB).', 'red');
        return;
      }
      const reader = new FileReader();
      reader.onload = function(evt) {
        const base64 = evt.target.result;
        emp.logoUrl = base64;
        salvarFormularioEmpresa();
        renderizarConfiguracoesEmpresa();
        mostrarToast('Logotipo atualizado e salvo com sucesso!', 'green');
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('btnRemoverLogoEmpresa')?.addEventListener('click', () => {
      if (confirm('Deseja remover o logotipo personalizado?')) {
        emp.logoUrl = null;
        salvarFormularioEmpresa();
        renderizarConfiguracoesEmpresa();
        mostrarToast('Logotipo removido!', 'green');
      }
    });

    document.getElementById('btnExportarBackupEmpresa')?.addEventListener('click', () => {
      window.ERP_CLOUD.exportarBackupJson(db);
      mostrarToast('Arquivo de backup baixado com sucesso!', 'green');
    });

    document.getElementById('btnExportarJsonCard')?.addEventListener('click', () => {
      window.ERP_CLOUD.exportarBackupJson(db);
      mostrarToast('Arquivo de backup baixado com sucesso!', 'green');
    });

    const fileInpCard = document.getElementById('inpRestaurarArquivoCard');
    document.getElementById('btnRestaurarJsonCard')?.addEventListener('click', () => fileInpCard?.click());

    fileInpCard?.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        const conteudo = evt.target.result;
        window.ERP_CLOUD.restaurarBackupJson(conteudo, (novoBanco) => {
          db = novoBanco;
          salvarEstado();
          atualizarBadges();
          mostrarToast('Backup restaurado com sucesso! Dados atualizados.', 'green');
          navegarPara('empresa');
        });
      };
      reader.readAsText(file);
    });

    document.getElementById('btnCarregarShowroomCard')?.addEventListener('click', () => {
      if (confirm('Deseja carregar a demonstração completa de showroom da fábrica?')) {
        carregarDemonstracaoShowroom();
      }
    });

    document.getElementById('btnZerarFabricaCard')?.addEventListener('click', () => {
      if (confirm('Atenção: deseja zerar todos os pedidos e dados de teste para iniciar a produção real da confecção?')) {
        zerarBancoProducaoReal();
      }
    });
  }

  /* ==========================================================================
     MÓDULO 14: GUIA DE VENDAS, PITCH COMERCIAL & CALCULADORA DE ROI
     ========================================================================== */
  function abrirModalRoteiroVendas() {
    const modalEl = criarModalCamada(`
      <div class="modal-overlay active">
        <div class="modal-box" style="max-width: 860px; max-height: 90vh; display: flex; flex-direction: column;">
          <div class="modal-header" style="background: #0f172a; color: #ffffff;">
            <div>
              <div class="modal-title" style="color: #ffffff; display: flex; align-items: center; gap: 8px;">
                <span>🚀 Acelerador Comercial • TexPro Uniformes ERP</span>
                <span class="status-pill status-green" style="font-size: 10px; background: #10b981; color: #ffffff;">PRONTO P/ VENDER</span>
              </div>
              <div style="font-size: 11.5px; color: #94a3b8; margin-top: 2px;">
                Roteiro de demonstração de 15 minutos, calculadora de ROI e scripts para fechar clientes em confecções
              </div>
            </div>
            <button class="modal-close" onclick="window.ERP.fecharModal()" style="color: #ffffff;">&times;</button>
          </div>

          <!-- Abas Internas do Roteiro -->
          <div style="display: flex; background: #f1f5f9; border-bottom: 1px solid #cbd5e1; padding: 6px 16px; gap: 8px; overflow-x: auto;">
            <button class="btn btn-xs tab-btn-pitch active" data-tab-pitch="roteiro" style="font-weight: 700; padding: 6px 12px; background: #0f172a; color: #ffffff;">🎙️ Roteiro 15 Min (Script)</button>
            <button class="btn btn-xs tab-btn-pitch" data-tab-pitch="roi" style="font-weight: 700; padding: 6px 12px; background: transparent; color: var(--text-primary);">💰 Calculadora de ROI</button>
            <button class="btn btn-xs tab-btn-pitch" data-tab-pitch="planos" style="font-weight: 700; padding: 6px 12px; background: transparent; color: var(--text-primary);">🏷️ Modelos de Precificação</button>
            <button class="btn btn-xs tab-btn-pitch" data-tab-pitch="objecoes" style="font-weight: 700; padding: 6px 12px; background: transparent; color: var(--text-primary);">🛡️ Quebra de Objeções</button>
          </div>

          <div class="modal-body" style="padding: 20px; overflow-y: auto; flex: 1;" id="corpoModalPitch">
            <!-- Conteúdo da Aba Roteiro (Padrão) -->
            <div id="painelTabPitch_roteiro">
              <div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 4px; margin-bottom: 16px;">
                <strong style="color: #0369a1; font-size: 13px;">O Segredo da Apresentação:</strong>
                <p style="font-size: 12px; color: #334155; margin-top: 2px; line-height: 1.4;">
                  Não mostre o sistema como um "software burocrático". Mostre como uma <strong>ferramenta de estancar prejuízos operacionais</strong> e fazer a confecção vender o dobro de uniformes no WhatsApp.
                </p>
              </div>

              <div style="display: flex; flex-direction: column; gap: 14px;">
                <!-- Passo 1 -->
                <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; background: #ffffff;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <strong style="color: #0f172a; font-size: 13px;">1. Minuto 0 a 3: As 3 Maiores Dores do Dono da Fábrica</strong>
                    <span class="status-pill status-gray">ABERTURA</span>
                  </div>
                  <p style="font-size: 12px; color: #475569; line-height: 1.45;">
                    <em>"Seu [Nome do Dono], deixa eu te fazer uma pergunta rápida: quantas vezes você já cortou um lote de uniformes e o cliente demorou pra pagar ou sumiu? E quanto de retalho de tecido ou bobina DTF você joga fora todo mês sem saber o custo exato?"</em><br>
                    <strong>Objetivo:</strong> Fazer ele admitir que perde dinheiro na gestão manual ou em planilhas soltas.
                  </p>
                </div>

                <!-- Passo 2 -->
                <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; background: #ffffff;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <strong style="color: #0f172a; font-size: 13px;">2. Minuto 3 a 7: Orçamento Rápido com Mockup 3x4 e WhatsApp</strong>
                    <span class="status-pill status-blue">DEMO AO VIVO</span>
                  </div>
                  <p style="font-size: 12px; color: #475569; line-height: 1.45;">
                    Abra o botão <strong>Novo Orçamento</strong>. Escolha a Polo Piquet ou Camisa Operacional com Faixa Refletiva.<br>
                    <em>"Olha aqui: seu vendedor preenche a grade em 30 segundos, o sistema gera o mockup vetorial proporcional 3x4 automaticamente e calcula o consumo exato de tecido e DTF. Ele clica em 'Enviar Proposta no WhatsApp' com a chave PIX já preenchida!"</em>
                  </p>
                </div>

                <!-- Passo 3 -->
                <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; background: #ffffff;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <strong style="color: #0f172a; font-size: 13px;">3. Minuto 7 a 10: A Trava de Segurança da Quarentena</strong>
                    <span class="status-pill status-red">SEGURANÇA FINANCEIRA</span>
                  </div>
                  <p style="font-size: 12px; color: #475569; line-height: 1.45;">
                    Mostre a aba <strong>Quarentena</strong> e o Kanban.<br>
                    <em>"Nenhum cortador toca na tesoura ou na enfestadeira se o pedido estiver em quarentena ou sem o sinal de 50%! O sistema bloqueia a alteração de etapa no Kanban. O dono só libera quando confirma o PIX na conta."</em>
                  </p>
                </div>

                <!-- Passo 4 -->
                <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; background: #ffffff;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <strong style="color: #0f172a; font-size: 13px;">4. Minuto 10 a 13: Bobina DTF 58cm & Ficha Técnica A4 Isolada</strong>
                    <span class="status-pill status-green">CHÃO DE FÁBRICA</span>
                  </div>
                  <p style="font-size: 12px; color: #475569; line-height: 1.45;">
                    Clique em <strong>Ver Ficha Técnica / OS</strong> e no botão de impressão isolada.<br>
                    <em>"Olha a impressão: sai em folha A4 limpa, sem preços de venda (para a costureira não ver seus valores), com campo de assinatura para o cortador, impressor e costureira. E o Nesting organiza os logotipos para aproveitar 98% da bobina de 58cm."</em>
                  </p>
                </div>

                <!-- Passo 5 -->
                <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; background: #ffffff;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <strong style="color: #0f172a; font-size: 13px;">5. Minuto 13 a 15: DRE Gerencial & Fechamento da Venda</strong>
                    <span class="status-pill status-yellow">FECHAMENTO</span>
                  </div>
                  <p style="font-size: 12px; color: #475569; line-height: 1.45;">
                    Vá na aba <strong>Abertura</strong> ou <strong>Financeiro</strong>.<br>
                    <em>"No fim do mês, você sabe sua margem média líquida por polo e por camiseta, suas despesas fixas de galpão e quanto sobrou limpo. Quanto custa você não ter esse controle hoje?"</em>
                  </p>
                </div>
              </div>
            </div>

            <!-- Conteúdo da Aba ROI -->
            <div id="painelTabPitch_roi" style="display: none;">
              <div style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 6px; padding: 14px; margin-bottom: 18px;">
                <strong style="color: #15803d; font-size: 13.5px; display: block; margin-bottom: 4px;">Simulação de Retorno sobre o Investimento (ROI)</strong>
                <p style="font-size: 12px; color: #166534; line-height: 1.4;">
                  Preencha os dados da confecção com o cliente para demonstrar que o sistema se paga sozinho logo no primeiro mês de uso.
                </p>
              </div>

              <div class="grid-cards-2" style="gap: 16px; margin-bottom: 20px;">
                <div class="form-group">
                  <label class="form-label">Quantidade Média de Peças / Mês:</label>
                  <input type="number" id="roiInpPecas" class="form-control text-mono" value="2500" step="100" style="font-weight: 700; font-size: 14px;">
                </div>
                <div class="form-group">
                  <label class="form-label">Preço Médio de Venda por Peça (R$):</label>
                  <input type="number" id="roiInpPreco" class="form-control text-mono" value="52.00" step="1" style="font-weight: 700; font-size: 14px;">
                </div>
              </div>

              <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 16px;">
                <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 10px;">Economia Direta Estimada Mensal:</div>

                <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px;">
                  <div style="display: flex; justify-content: space-between; padding-bottom: 6px; border-bottom: 1px solid #f1f5f9;">
                    <span>1. Redução de Desperdício em Tecido e Malha (3.5%):</span>
                    <strong class="text-mono text-green" id="roiEconTecido">R$ 4.550,00</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding-bottom: 6px; border-bottom: 1px solid #f1f5f9;">
                    <span>2. Otimização de Rolo DTF 58cm & Retrabalhos (1.5%):</span>
                    <strong class="text-mono text-green" id="roiEconDtf">R$ 1.950,00</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding-bottom: 6px; border-bottom: 1px solid #f1f5f9;">
                    <span>3. Prevenção de Calotes com Trava de Sinal 50%:</span>
                    <strong class="text-mono text-green" id="roiEconCalote">R$ 3.000,00</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 800; padding-top: 8px; border-top: 2px solid #0f172a; margin-top: 4px;">
                    <span>ECONOMIA TOTAL MENSAL GERADA:</span>
                    <span class="text-mono" style="color: #047857;" id="roiEconTotal">R$ 9.500,00 / mês</span>
                  </div>
                </div>

                <div style="margin-top: 14px; background: #f8fafc; border-radius: 4px; padding: 10px; font-size: 12px; color: #334155; line-height: 1.45;">
                  💡 <strong>Conclusão do Pitch:</strong> Se você cobrar uma mensalidade de <strong>R$ 350,00/mês</strong>, a confecção estará lucrando <strong>27x</strong> o valor investido todo mês só com a redução de perdas operacionais!
                </div>
              </div>
            </div>

            <!-- Conteúdo da Aba Planos -->
            <div id="painelTabPitch_planos" style="display: none;">
              <div style="font-size: 12.5px; color: #475569; margin-bottom: 16px;">
                Escolha o formato comercial ideal para o perfil do cliente (fábricas menores costumam preferir mensalidade simples; fábricas maiores contratam com implantação presencial).
              </div>

              <div class="grid-cards-2" style="gap: 16px;">
                <!-- Opção 1 -->
                <div style="border: 2px solid #0284c7; background: #f0f9ff; border-radius: 6px; padding: 16px;">
                  <span class="status-pill status-blue" style="font-size: 10px; font-weight: 700;">MAIS POPULAR (SAAS)</span>
                  <h3 style="font-size: 16px; font-weight: 800; color: #0369a1; margin-top: 6px;">Plano Fábrica Mensal</h3>
                  <div class="text-mono" style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 8px 0;">
                    R$ 297 a R$ 490 <span style="font-size: 12px; font-weight: 400; color: #64748b;">/mês</span>
                  </div>
                  <ul style="font-size: 11.5px; color: #334155; line-height: 1.5; padding-left: 18px; margin-bottom: 12px;">
                    <li>Acesso ilimitado a todas as 14 áreas</li>
                    <li>Perfis de Dono, Vendedor e Oficina</li>
                    <li>Gerador de Mockups e Fichas A4</li>
                    <li>Suporte direto via WhatsApp</li>
                    <li>Sem fidelidade ou carência</li>
                  </ul>
                  <div style="font-size: 11px; color: #0369a1; font-weight: 700;">Fácil adesão e receita recorrente previsível.</div>
                </div>

                <!-- Opção 2 -->
                <div style="border: 1px solid #cbd5e1; background: #ffffff; border-radius: 6px; padding: 16px;">
                  <span class="status-pill status-gray" style="font-size: 10px; font-weight: 700;">ALTO TICKET</span>
                  <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 6px;">Setup + Mensalidade</h3>
                  <div class="text-mono" style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 8px 0;">
                    R$ 1.200 <span style="font-size: 12px; font-weight: 400; color: #64748b;">setup</span> + R$ 250/mês
                  </div>
                  <ul style="font-size: 11.5px; color: #334155; line-height: 1.5; padding-left: 18px; margin-bottom: 12px;">
                    <li>Cadastro inicial do catálogo da fábrica</li>
                    <li>Configuração da logo e chave PIX</li>
                    <li>Treinamento de 1h com a equipe de vendas</li>
                    <li>Acompanhamento dos 3 primeiros pedidos</li>
                  </ul>
                  <div style="font-size: 11px; color: #047857; font-weight: 700;">Gera caixa imediato com a taxa de implantação.</div>
                </div>
              </div>
            </div>

            <!-- Conteúdo da Aba Objeções -->
            <div id="painelTabPitch_objecoes" style="display: none;">
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; background: #ffffff;">
                  <strong style="color: #b91c1c; font-size: 13px;">❌ "Já controlo tudo pelo Excel ou caderno."</strong>
                  <p style="font-size: 12px; color: #334155; margin-top: 4px; line-height: 1.45;">
                    <strong>✅ O que responder:</strong> <em>"O Excel é bom para somar números, mas ele não gera mockup 3x4 em 2 minutos pro seu cliente aprovar no WhatsApp, não avisa o cortador sobre a grade e qualquer um pode apagar uma fórmula por engano. Com o sistema, você profissionaliza sua fábrica na frente dos clientes corporativos."</em>
                  </p>
                </div>

                <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; background: #ffffff;">
                  <strong style="color: #b91c1c; font-size: 13px;">❌ "Minha equipe de costura não sabe mexer em computador."</strong>
                  <p style="font-size: 12px; color: #334155; margin-top: 4px; line-height: 1.45;">
                    <strong>✅ O que responder:</strong> <em>"Elas não precisam mexer! O encarregado imprime a Ficha Técnica A4 com 1 clique. Na folha já vem tudo mastigado: tamanho, modelo, foto da polo e onde assinar. O sistema foi desenhado exatamente para quem vive no chão de fábrica."</em>
                  </p>
                </div>

                <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; background: #ffffff;">
                  <strong style="color: #b91c1c; font-size: 13px;">❌ "E se a internet cair aqui no galpão?"</strong>
                  <p style="font-size: 12px; color: #334155; margin-top: 4px; line-height: 1.45;">
                    <strong>✅ O que responder:</strong> <em>"O TexPro ERP funciona em modo Local Seguro Offline. Se a internet cair, você continua tirando pedidos e imprimindo fichas normalmente sem travar nada."</em>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-sm" id="btnAtivarShowroomNoPitch" style="border-color: #0284c7; color: #0369a1; font-weight: 700;">
                ✨ Carregar Showroom de Demonstração
              </button>
            </div>
            <button class="btn btn-primary btn-sm" onclick="window.ERP.fecharModal()">
              Fechar Roteiro
            </button>
          </div>
        </div>
      </div>
    `);

    const tabBtns = modalEl.querySelectorAll('.tab-btn-pitch');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => {
          b.classList.remove('active');
          b.style.background = 'transparent';
          b.style.color = 'var(--text-primary)';
        });
        btn.classList.add('active');
        btn.style.background = '#0f172a';
        btn.style.color = '#ffffff';

        const tabKey = btn.getAttribute('data-tab-pitch');
        ['roteiro', 'roi', 'planos', 'objecoes'].forEach(k => {
          const panel = document.getElementById('painelTabPitch_' + k);
          if (panel) panel.style.display = (k === tabKey) ? 'block' : 'none';
        });
      });
    });

    function recalcularRoi() {
      const pecas = Math.max(1, Number(document.getElementById('roiInpPecas')?.value) || 2000);
      const preco = Math.max(1, Number(document.getElementById('roiInpPreco')?.value) || 50);
      const faturamento = pecas * preco;

      const econTecido = faturamento * 0.035;
      const econDtf = faturamento * 0.015;
      const econCalote = Math.min(6000, faturamento * 0.025);
      const econTotal = econTecido + econDtf + econCalote;

      const spTec = document.getElementById('roiEconTecido');
      if (spTec) spTec.textContent = formatarMoeda(econTecido);

      const spDtf = document.getElementById('roiEconDtf');
      if (spDtf) spDtf.textContent = formatarMoeda(econDtf);

      const spCal = document.getElementById('roiEconCalote');
      if (spCal) spCal.textContent = formatarMoeda(econCalote);

      const spTot = document.getElementById('roiEconTotal');
      if (spTot) spTot.textContent = formatarMoeda(econTotal) + ' / mês';
    }

    document.getElementById('roiInpPecas')?.addEventListener('input', recalcularRoi);
    document.getElementById('roiInpPreco')?.addEventListener('input', recalcularRoi);

    document.getElementById('btnAtivarShowroomNoPitch')?.addEventListener('click', () => {
      fecharModal(modalEl);
      carregarDemonstracaoShowroom();
    });
  }

  // Exposição Global das Funções Públicas da API TexPro ERP
  window.ERP = {
    obterDb: () => db,
    salvarOrcamentoOuPedido,
    navegarPara,
    calcularContagemRegressivaPedido,
    fecharModal,
    fecharTodosModais,
    abrirFichaTecnica,
    imprimirFichaTecnicaIsolada,
    abrirModalPropostaComercial,
    imprimirPropostaComercialIsolada,
    imprimirDocumentoIsolado,
    carregarPadroesSistema,
    salvarPadroesSistema,
    abrirModalWhatsApp,
    abrirModalVisualizarMockup,
    abrirModalNovoOrcamento,
    abrirModalNovoClienteInline,
    abrirModalNovoModeloInline,
    abrirModalInspecaoQuarentena,
    abrirModalReceberPagamento,
    abrirModalEntradaEstoque,
    abrirModalEditarFinanceiro,
    abrirModalEditarCapacidades,
    renderizarConfiguracoesEmpresa,
    abrirModalBackup,
    abrirModalTrocarPerfil,
    abrirModalRoteiroVendas,
    carregarDemonstracaoShowroom,
    zerarBancoProducaoReal,
    forcarResetarBanco: function() {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('texpro_erp_prod_v8');
        localStorage.removeItem('texpro_erp_prod_v7');
        localStorage.removeItem('texpro_erp_prod_v6');
        localStorage.removeItem('texpro_erp_database_v5');
        localStorage.removeItem('texpro_erp_database_v4');
        localStorage.removeItem('texpro_erp_database_v3');
        localStorage.removeItem('texpro_erp_database_v2');
        localStorage.removeItem('texpro_erp_database_v1');
      } catch (e) {}
      db = JSON.parse(JSON.stringify(window.ERP_INITIAL_DATA));
      db.versao = ERP_VERSION;
      salvarEstado();
      atualizarBadges();
      navegarPara(abaAtiva);
      mostrarToast('Sistema 100% zerado e pronto para operação real!', 'green');
    }
  };

  // Inicialização no DOM Ready
  document.addEventListener('DOMContentLoaded', init);
})();
