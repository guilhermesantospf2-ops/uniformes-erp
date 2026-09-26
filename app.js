/**
 * UNIFORMES ERP - CONTROLADOR PRINCIPAL DA APLICAÇÃO
 * Sistema de Gestão Industrial e Comercial para Confecção de Uniformes
 */

(function () {
  'use strict';

  // Inicializa o Estado com dados mock ou do localStorage
  const STORAGE_KEY = 'texpro_erp_database_v1';
  let db = null;

  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) {
      db = JSON.parse(salvo);
    }
  } catch (e) {}

  if (!db) {
    db = window.ERP_INITIAL_DATA;
    salvarEstado();
  }

  function salvarEstado() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {}
  }

  // Estado da Navegação Atual
  let abaAtiva = 'abertura';

  // Elementos Centrais
  const contentArea = document.getElementById('contentArea');
  const pageTitleElem = document.getElementById('pageTitle');
  const pageBreadcrumbElem = document.getElementById('pageBreadcrumb');
  const toastElem = document.getElementById('erpToast');

  // Inicialização do Sistema
  function init() {
    configurarMenuNavegacao();
    atualizarBadges();
    navegarPara(abaAtiva);
  }

  // Notificações Toast do Sistema
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
    }, 4000);
  }

  // Formatação Monetária Brasileira
  function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
  }

  // Formatação de Número
  function formatarNumero(valor) {
    return new Intl.NumberFormat('pt-BR').format(valor || 0);
  }

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

  // Roteador de Abas
  function navegarPara(aba) {
    abaAtiva = aba;

    // Atualiza classes ativas na sidebar
    document.querySelectorAll('.menu-item[data-aba]').forEach(item => {
      if (item.getAttribute('data-aba') === aba) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    atualizarBadges();

    // Renderiza a tela correspondente
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
      default:
        renderizarAbertura();
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
     MÓDULO 1: ABERTURA / DASHBOARD & ANALYTICS
     ========================================================================== */
  function renderizarAbertura() {
    pageTitleElem.textContent = 'Abertura & Visão Geral da Fábrica';
    pageBreadcrumbElem.textContent = 'SISTEMA > ABERTURA';

    // Cálculos Métricos
    const faturamentoMes = db.pedidos
      .filter(p => p.status !== 'Cancelado')
      .reduce((acc, p) => acc + p.valorTotalVenda, 0);

    const pedidosEmProducao = db.pedidos.filter(p => p.status === 'Em Producao');
    const totalPecasProducao = pedidosEmProducao.reduce((acc, p) => acc + p.grade.total, 0);
    const pedidosQuarentena = db.pedidos.filter(p => p.status === 'Quarentena');
    
    const saldoReceberPendente = db.pedidos
      .filter(p => p.status === 'Em Producao' || p.status === 'Quarentena')
      .reduce((acc, p) => acc + p.saldoPendente, 0);

    const margemMediaPercentual = (
      db.pedidos.reduce((acc, p) => acc + p.margemLucroPercentual, 0) / (db.pedidos.length || 1)
    ).toFixed(1);

    contentArea.innerHTML = `
      <!-- Cards Métricos Superiores -->
      <div class="grid-cards-4">
        <div class="card">
          <div class="kpi-title">
            <span>Faturamento em Carteira</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div class="kpi-value text-white">${formatarMoeda(faturamentoMes)}</div>
          <div class="kpi-desc">
            <span class="text-green">+14.2%</span>
            <span>vs. mês anterior</span>
          </div>
        </div>

        <div class="card">
          <div class="kpi-title">
            <span>Carga da Fábrica (Peças)</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
          </div>
          <div class="kpi-value text-white">${formatarNumero(totalPecasProducao)} un</div>
          <div class="kpi-desc">
            <span class="text-gray">${pedidosEmProducao.length} ordens ativas na oficina</span>
          </div>
        </div>

        <div class="card">
          <div class="kpi-title">
            <span>Quarentena (Aprovação)</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <div class="kpi-value ${pedidosQuarentena.length > 0 ? 'text-red' : 'text-white'}">${pedidosQuarentena.length} pedidos</div>
          <div class="kpi-desc">
            <span class="${pedidosQuarentena.length > 0 ? 'text-red' : 'text-gray'}">Aguardando liberação de sinal/margem</span>
          </div>
        </div>

        <div class="card">
          <div class="kpi-title">
            <span>Margem Média Bruta</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
          </div>
          <div class="kpi-value text-green">${margemMediaPercentual}%</div>
          <div class="kpi-desc">
            <span class="text-green">Acima da média industrial</span>
          </div>
        </div>
      </div>

      <!-- Gráficos Financeiros e de Produção -->
      <div class="grid-cards-2">
        <div class="card">
          <div class="table-header-bar" style="padding: 0 0 12px 0;">
            <div class="table-title">Performance Financeira Semestral (R$)</div>
            <span class="status-pill status-gray">Valores em Milhares</span>
          </div>
          <div class="chart-container">
            <div class="bar-col">
              <span class="bar-val text-mono">R$ 38k</span>
              <div class="bar-fill" style="height: 60%;"></div>
              <span class="bar-label">MAI</span>
            </div>
            <div class="bar-col">
              <span class="bar-val text-mono">R$ 44k</span>
              <div class="bar-fill" style="height: 70%;"></div>
              <span class="bar-label">JUN</span>
            </div>
            <div class="bar-col">
              <span class="bar-val text-mono">R$ 41k</span>
              <div class="bar-fill" style="height: 65%;"></div>
              <span class="bar-label">JUL</span>
            </div>
            <div class="bar-col">
              <span class="bar-val text-mono">R$ 52k</span>
              <div class="bar-fill" style="height: 82%;"></div>
              <span class="bar-label">AGO</span>
            </div>
            <div class="bar-col">
              <span class="bar-val text-mono text-green">R$ 68k</span>
              <div class="bar-fill bar-green" style="height: 100%;"></div>
              <span class="bar-label text-green">SET (ATUAL)</span>
            </div>
            <div class="bar-col">
              <span class="bar-val text-mono">R$ 75k</span>
              <div class="bar-fill" style="height: 90%; border-style: dashed;"></div>
              <span class="bar-label">OUT (PREV)</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="table-header-bar" style="padding: 0 0 12px 0;">
            <div class="table-title">Capacidade de Produção por Setor</div>
            <span class="status-pill status-green">Oficina em Ritmo Normal</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 14px;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px;">
                <span>Mesa de Corte (Capacidade: 400 peças/dia)</span>
                <span class="text-mono text-white">280 peças cortadas (70%)</span>
              </div>
              <div style="width: 100%; height: 6px; background: #1c2130; border-radius: 3px;">
                <div style="width: 70%; height: 100%; background: #ffffff; border-radius: 3px;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px;">
                <span>Bordado Computadorizado (Capacidade: 250 peças/dia)</span>
                <span class="text-mono text-white">215 peças produzidas (86%)</span>
              </div>
              <div style="width: 100%; height: 6px; background: #1c2130; border-radius: 3px;">
                <div style="width: 86%; height: 100%; background: var(--color-green); border-radius: 3px;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px;">
                <span>Impressão DTF Digital (Capacidade: 40m/dia)</span>
                <span class="text-mono text-white">24 metros lineares (60%)</span>
              </div>
              <div style="width: 100%; height: 6px; background: #1c2130; border-radius: 3px;">
                <div style="width: 60%; height: 100%; background: #ffffff; border-radius: 3px;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px;">
                <span>Linha de Costura & Fechamento (Capacidade: 300 peças/dia)</span>
                <span class="text-mono text-white">240 peças costuradas (80%)</span>
              </div>
              <div style="width: 100%; height: 6px; background: #1c2130; border-radius: 3px;">
                <div style="width: 80%; height: 100%; background: #ffffff; border-radius: 3px;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela Resumo dos Pedidos em Andamento -->
      <div class="table-wrapper">
        <div class="table-header-bar">
          <div class="table-title">Últimos Pedidos Movimentados na Indústria</div>
          <button class="btn btn-secondary btn-sm" id="btnIrParaPedidos">Ver Todos os Pedidos</button>
        </div>
        <table class="erp-table">
          <thead>
            <tr>
              <th>Nº Pedido</th>
              <th>Cliente</th>
              <th>Produto Têxtil</th>
              <th>Grade Total</th>
              <th>Valor Total</th>
              <th>Sinal (50%)</th>
              <th>Status do Pedido</th>
              <th>Etapa na Oficina</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${db.pedidos.slice(0, 5).map(p => `
              <tr>
                <td class="text-mono text-white">#${p.numero}</td>
                <td><strong>${p.clienteNome}</strong></td>
                <td>${p.produtoNome}</td>
                <td class="text-mono">${p.grade.total} peças</td>
                <td class="text-mono text-white">${formatarMoeda(p.valorTotalVenda)}</td>
                <td>
                  <span class="status-pill ${p.sinalPago ? 'status-green' : 'status-red'}">
                    ${p.sinalPago ? 'PAGO' : 'PENDENTE'}
                  </span>
                </td>
                <td>
                  <span class="status-pill ${p.status === 'Quarentena' ? 'status-red' : p.status === 'Em Producao' ? 'status-green' : 'status-gray'}">
                    ${p.status.toUpperCase()}
                  </span>
                </td>
                <td class="text-mono">${p.etapaProducao}</td>
                <td>
                  <button class="btn btn-secondary btn-sm btn-ver-pedido" data-id="${p.id}">Detalhes</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('btnIrParaPedidos')?.addEventListener('click', () => navegarPara('pedidos'));
    document.querySelectorAll('.btn-ver-pedido').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        abrirDetalhesPedido(id);
      });
    });
  }

  /* ==========================================================================
     MÓDULO 2: PEDIDOS & ORÇAMENTOS COM BENCHMARK NACIONAL
     ========================================================================== */
  function renderizarPedidos() {
    pageTitleElem.textContent = 'Gestão Comercial & Orçamentos';
    pageBreadcrumbElem.textContent = 'SISTEMA > PEDIDOS & ORÇAMENTOS';

    contentArea.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div style="display: flex; gap: 10px;">
          <input type="text" id="filtroPedidoBusca" class="form-input" style="width: 280px;" placeholder="Buscar cliente, número ou produto...">
          <select id="filtroPedidoStatus" class="form-select" style="width: 180px;">
            <option value="TODOS">Todos os Status</option>
            <option value="Em Producao">Em Produção</option>
            <option value="Quarentena">Em Quarentena</option>
            <option value="Finalizado">Finalizados</option>
            <option value="Orcamento">Apenas Orçamento</option>
          </select>
        </div>
        <button class="btn btn-primary" id="btnAbrirNovoOrcamento">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Novo Orçamento com Benchmark Brasil
        </button>
      </div>

      <div class="table-wrapper">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Nº</th>
              <th>Data</th>
              <th>Cliente / Razão</th>
              <th>Produto</th>
              <th>Grade (Tamanhos)</th>
              <th>Preço Unit.</th>
              <th>Total Pedido</th>
              <th>Margem Real</th>
              <th>Sinal (50%)</th>
              <th>Status</th>
              <th>Etapa Fábrica</th>
              <th>Notificação WhatsApp</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="tabelaPedidosBody">
            ${gerarLinhasTabelaPedidos(db.pedidos)}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('btnAbrirNovoOrcamento')?.addEventListener('click', abrirModalNovoOrcamento);
    configurarEventosTabelaPedidos();
  }

  function gerarLinhasTabelaPedidos(pedidos) {
    if (!pedidos.length) {
      return `<tr><td colspan="13" style="text-align: center; padding: 30px; color: var(--text-gray-500);">Nenhum pedido encontrado.</td></tr>`;
    }

    return pedidos.map(p => `
      <tr>
        <td class="text-mono text-white">#${p.numero}</td>
        <td class="text-mono">${p.dataCriacao}</td>
        <td>
          <strong class="text-white">${p.clienteNome}</strong>
          <span style="display: block; font-size: 11px; color: var(--text-gray-500);">${p.clienteTelefone}</span>
        </td>
        <td>${p.produtoNome}</td>
        <td class="text-mono">
          <span style="font-size: 11px;">P:${p.grade.p} M:${p.grade.m} G:${p.grade.g} GG:${p.grade.gg}</span>
          <strong style="display: block; color: var(--text-white);">${p.grade.total} pçs</strong>
        </td>
        <td class="text-mono">${formatarMoeda(p.precoUnitarioVenda)}</td>
        <td class="text-mono text-white"><strong>${formatarMoeda(p.valorTotalVenda)}</strong></td>
        <td>
          <span class="text-mono ${p.margemLucroPercentual >= 25 ? 'text-green' : 'text-red'}">
            <strong>${p.margemLucroPercentual.toFixed(1)}%</strong>
          </span>
        </td>
        <td>
          <span class="status-pill ${p.sinalPago ? 'status-green' : 'status-red'}">
            ${p.sinalPago ? '50% OK' : 'PENDENTE'}
          </span>
        </td>
        <td>
          <span class="status-pill ${p.status === 'Quarentena' ? 'status-red' : p.status === 'Em Producao' ? 'status-green' : 'status-gray'}">
            ${p.status.toUpperCase()}
          </span>
        </td>
        <td class="text-mono">${p.etapaProducao}</td>
        <td>
          <button class="btn btn-secondary btn-sm btn-disparar-wpp" data-id="${p.id}" title="Disparar status no WhatsApp do cliente">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            WhatsApp
          </button>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-secondary btn-sm btn-ver-pedido" data-id="${p.id}">OS</button>
            <button class="btn btn-secondary btn-sm btn-emitir-nfe" data-id="${p.id}">NF-e</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function configurarEventosTabelaPedidos() {
    document.querySelectorAll('.btn-disparar-wpp').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        abrirModalWhatsApp(id);
      });
    });

    document.querySelectorAll('.btn-ver-pedido').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        abrirDetalhesPedido(id);
      });
    });

    document.querySelectorAll('.btn-emitir-nfe').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        abrirModalEmitirNfe(id);
      });
    });
  }

  /* ==========================================================================
     MÓDULO 3: OS & FICHAS TÉCNICAS (OFICINA)
     ========================================================================== */
  function renderizarOrdensServico() {
    pageTitleElem.textContent = 'Ordens de Serviço & Fichas de Produção';
    pageBreadcrumbElem.textContent = 'SISTEMA > OS & FICHAS TÉCNICAS';

    contentArea.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <p style="color: var(--text-gray-400);">Fichas de chão de fábrica liberadas para corte, bordado, estamparia e costura.</p>
        <span class="status-pill status-gray text-mono">${db.ordensServico.length} OPs Ativas na Fábrica</span>
      </div>

      <div class="kanban-board">
        <div class="kanban-col">
          <div class="kanban-col-header">
            <span>1. AGUARDANDO TECIDO</span>
            <span class="kanban-col-count">0</span>
          </div>
          <div class="kanban-items">
            <div style="font-size: 11px; color: var(--text-gray-600); text-align: center; padding: 20px;">Nenhuma OP parada</div>
          </div>
        </div>

        <div class="kanban-col">
          <div class="kanban-col-header">
            <span>2. NO CORTE</span>
            <span class="kanban-col-count">1</span>
          </div>
          <div class="kanban-items">
            <div class="kanban-card">
              <span class="status-pill status-gray" style="font-size: 9.5px; margin-bottom: 6px;">OS-8402 • PED #1085</span>
              <div class="kanban-card-title">Nova Era Metalúrgica</div>
              <div class="kanban-card-sub">70 Camisas Operacionais Brim</div>
              <div style="font-size: 11px; color: var(--text-gray-300); margin-bottom: 8px;">
                Mesa: 1 • Fio reto c/ reforço
              </div>
              <button class="btn btn-secondary btn-sm" style="width: 100%;" onclick="window.ERP.abrirFichaTecnica('OS-8402')">Imprimir Ficha Técnica</button>
            </div>
          </div>
        </div>

        <div class="kanban-col">
          <div class="kanban-col-header">
            <span>3. BORDADO / DTF</span>
            <span class="kanban-col-count">0</span>
          </div>
          <div class="kanban-items">
            <div style="font-size: 11px; color: var(--text-gray-600); text-align: center; padding: 20px;">Fila liberada</div>
          </div>
        </div>

        <div class="kanban-col">
          <div class="kanban-col-header">
            <span>4. COSTURA & FECHAMENTO</span>
            <span class="kanban-col-count">1</span>
          </div>
          <div class="kanban-items">
            <div class="kanban-card">
              <span class="status-pill status-green" style="font-size: 9.5px; margin-bottom: 6px;">OS-8401 • PED #1084</span>
              <div class="kanban-card-title">Expresso Paulista</div>
              <div class="kanban-card-sub">100 Camisas Polo Azul Marinho</div>
              <div style="font-size: 11px; color: var(--color-green); margin-bottom: 8px;">
                62/100 costuradas (Linha 2)
              </div>
              <button class="btn btn-secondary btn-sm" style="width: 100%;" onclick="window.ERP.abrirFichaTecnica('OS-8401')">Imprimir Ficha Técnica</button>
            </div>
          </div>
        </div>

        <div class="kanban-col">
          <div class="kanban-col-header">
            <span>5. REVISÃO & EXPEDIÇÃO</span>
            <span class="kanban-col-count">0</span>
          </div>
          <div class="kanban-items">
            <div style="font-size: 11px; color: var(--text-gray-600); text-align: center; padding: 20px;">Aguardando finalização</div>
          </div>
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     MÓDULO 4: NESTING DTF (GESTOR DE ARTES E OTIMIZADOR DE IMPRESSÃO)
     ========================================================================== */
  function renderizarNestingDTF() {
    pageTitleElem.textContent = 'Gestor de Artes DTF & Nesting Automático';
    pageBreadcrumbElem.textContent = 'SISTEMA > NESTING DE ARTES';

    // Executa o motor algorítmico com as artes cadastradas
    const resultado = window.DtfNestingEngine.processarNesting(db.nestingFila);

    contentArea.innerHTML = `
      <div class="grid-cards-4">
        <div class="card">
          <div class="kpi-title">Metros Lineares de Rolo</div>
          <div class="kpi-value text-white">${resultado.metrosLinearesTotais} m</div>
          <div class="kpi-desc">Largura útil de ${resultado.larguraRoloCm} cm</div>
        </div>

        <div class="card">
          <div class="kpi-title">Taxa de Aproveitamento</div>
          <div class="kpi-value text-green">${resultado.taxaAproveitamentoPercentual}%</div>
          <div class="kpi-desc">Desperdício mínimo: ${resultado.taxaDesperdicioPercentual}%</div>
        </div>

        <div class="card">
          <div class="kpi-title">Custo Total de DTF</div>
          <div class="kpi-value text-white">${formatarMoeda(resultado.custoTotalRolo)}</div>
          <div class="kpi-desc">Base: R$ 60,00 por metro linear</div>
        </div>

        <div class="card">
          <div class="kpi-title">Total de Cópias Encaixadas</div>
          <div class="kpi-value text-white">${resultado.totalItensProcessados} un</div>
          <div class="kpi-desc">Custo médio por estampa: ${formatarMoeda(resultado.custoMedioPorArte)}</div>
        </div>
      </div>

      <div class="grid-cards-2">
        <div class="card">
          <div class="table-header-bar" style="padding: 0 0 12px 0;">
            <div class="table-title">Fila de Artes para Encaixe no Rolo</div>
            <button class="btn btn-secondary btn-sm" id="btnAdicionarArteNesting">+ Adicionar Arte</button>
          </div>
          <table class="erp-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Descrição da Arte</th>
                <th>Dimensões (LxA)</th>
                <th>Cópias</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${db.nestingFila.map((art, idx) => `
                <tr>
                  <td><strong>${art.cliente}</strong></td>
                  <td>${art.descricao}</td>
                  <td class="text-mono text-white">${art.larguraCm} x ${art.alturaCm} cm</td>
                  <td class="text-mono">${art.copias}</td>
                  <td>
                    <button class="btn btn-red btn-sm btn-remover-arte" data-index="${idx}">Remover</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="card">
          <div class="table-header-bar" style="padding: 0 0 12px 0;">
            <div class="table-title">Mapa Visual do Rolo de Impressão (Escala 1:1)</div>
            <button class="btn btn-primary btn-sm" id="btnExportarPlanoCorte">Exportar Plano RIP</button>
          </div>
          <div class="nesting-canvas-container">
            <canvas id="nestingCanvas"></canvas>
          </div>
        </div>
      </div>
    `;

    // Renderiza o Canvas após inserir no DOM
    setTimeout(() => {
      const canvas = document.getElementById('nestingCanvas');
      if (canvas) {
        window.DtfNestingEngine.renderizarCanvas(canvas, resultado);
      }
    }, 50);

    document.getElementById('btnAdicionarArteNesting')?.addEventListener('click', abrirModalAdicionarArteNesting);
    document.querySelectorAll('.btn-remover-arte').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        db.nestingFila.splice(idx, 1);
        salvarEstado();
        renderizarNestingDTF();
        mostrarToast('Arte removida da fila de impressão.', 'green');
      });
    });

    document.getElementById('btnExportarPlanoCorte')?.addEventListener('click', () => {
      mostrarToast(`Plano de corte gerado: ${resultado.metrosLinearesTotais}m lineares prontos para envio ao RIP.`, 'green');
    });
  }

  /* ==========================================================================
     MÓDULO 5: ESTOQUE TÊXTIL
     ========================================================================== */
  function renderizarEstoque() {
    pageTitleElem.textContent = 'Estoque de Malhas, Tecidos & Aviamentos';
    pageBreadcrumbElem.textContent = 'SISTEMA > ESTOQUE';

    contentArea.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <p style="color: var(--text-gray-400);">Controle rigoroso por quilo (kg), metro (m) e unidades de aviamento.</p>
        <button class="btn btn-primary" id="btnNovoItemEstoque">+ Cadastrar Insumo</button>
      </div>

      <div class="table-wrapper">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Descrição do Material</th>
              <th>Categoria</th>
              <th>Unidade</th>
              <th>Saldo Físico</th>
              <th>Estoque Mínimo</th>
              <th>Custo Médio Unitário</th>
              <th>Valor Total em Estoque</th>
              <th>Status do Estoque</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${db.estoque.map(item => {
              const estaCritico = item.saldoAtual <= item.estoqueMinimo;
              const valorTotalItem = item.saldoAtual * item.custoMedioUnitario;
              return `
                <tr>
                  <td class="text-mono text-white">${item.codigo}</td>
                  <td><strong>${item.descricao}</strong></td>
                  <td>${item.categoria}</td>
                  <td class="text-mono">${item.unidade}</td>
                  <td class="text-mono text-white"><strong>${item.saldoAtual} ${item.unidade}</strong></td>
                  <td class="text-mono">${item.estoqueMinimo} ${item.unidade}</td>
                  <td class="text-mono">${formatarMoeda(item.custoMedioUnitario)}</td>
                  <td class="text-mono text-white">${formatarMoeda(valorTotalItem)}</td>
                  <td>
                    <span class="status-pill ${estaCritico ? 'status-red' : 'status-green'}">
                      ${estaCritico ? 'COMPRA URGENTE' : 'NORMAL'}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-secondary btn-sm" onclick="window.ERP.ajustarEstoque('${item.id}')">Ajustar Saldo</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('btnNovoItemEstoque')?.addEventListener('click', () => {
      mostrarToast('Formulário de cadastro de insumos têxteis aberto.', 'green');
    });
  }

  /* ==========================================================================
     MÓDULO 6: PRODUTOS & CATÁLOGO DE MODELAGEM
     ========================================================================== */
  function renderizarProdutos() {
    pageTitleElem.textContent = 'Catálogo de Modelagens & Fichas Técnicas Base';
    pageBreadcrumbElem.textContent = 'SISTEMA > PRODUTOS';

    contentArea.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <p style="color: var(--text-gray-400);">Modelagens padrão com consumo médio de tecido e mão de obra por peça.</p>
        <button class="btn btn-primary">+ Nova Modelagem</button>
      </div>

      <div class="grid-cards-3">
        ${db.produtosBase.map(prod => `
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="status-pill status-gray">${prod.codigo}</span>
              <span class="text-mono" style="font-size: 11px; color: var(--text-gray-500);">${prod.categoria}</span>
            </div>
            <h3 style="font-size: 15px; color: var(--text-white); margin-bottom: 8px;">${prod.nome}</h3>
            
            <div style="font-size: 12px; color: var(--text-gray-400); margin-bottom: 12px; display: flex; flex-direction: column; gap: 4px;">
              <div><strong>Malha/Tecido:</strong> ${prod.tipoMalhaPadrao}</div>
              <div><strong>Consumo Médio:</strong> <span class="text-mono text-white">${prod.consumoMalhaKgPorPeca} ${prod.codigo.includes('OP') || prod.codigo.includes('JAL') ? 'metros' : 'kg'} / peça</span></div>
              <div><strong>Mão de Obra de Costura:</strong> <span class="text-mono text-white">${formatarMoeda(prod.custoMaoDeObraBase)}</span></div>
            </div>

            <div style="border-top: 1px solid var(--border-subtle); padding-top: 10px; font-size: 11.5px;">
              <strong style="color: var(--text-gray-400); display: block; margin-bottom: 4px;">Aviamentos Fixos:</strong>
              <ul style="list-style: none; padding-left: 0; color: var(--text-gray-500);">
                ${prod.aviamentosPadrao.map(a => `<li>• ${a.nome} (${a.qtd}x) - ${formatarMoeda(a.custoUnitario)}</li>`).join('')}
              </ul>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* ==========================================================================
     MÓDULO 7: FINANCEIRO TÊXTIL
     ========================================================================== */
  function renderizarFinanceiro() {
    pageTitleElem.textContent = 'Gestão Financeira & DRE Têxtil';
    pageBreadcrumbElem.textContent = 'SISTEMA > FINANCEIRO';

    const faturamentoBruto = db.pedidos.reduce((acc, p) => acc + p.valorTotalVenda, 0);
    const custoProdutos = db.pedidos.reduce((acc, p) => acc + p.custoTotalEstimado, 0);
    const lucroLiquido = db.pedidos.reduce((acc, p) => acc + p.lucroLiquidoEstimado, 0);
    const saldoPendente = db.pedidos.reduce((acc, p) => acc + p.saldoPendente, 0);

    contentArea.innerHTML = `
      <div class="grid-cards-4">
        <div class="card">
          <div class="kpi-title">Faturamento Emitido</div>
          <div class="kpi-value text-white">${formatarMoeda(faturamentoBruto)}</div>
          <div class="kpi-desc">Total acumulado de pedidos ativos</div>
        </div>

        <div class="card">
          <div class="kpi-title">Custo das Mercadorias (CMV)</div>
          <div class="kpi-value text-red">${formatarMoeda(custoProdutos)}</div>
          <div class="kpi-desc">Tecidos, aviamentos, costura e DTF</div>
        </div>

        <div class="card">
          <div class="kpi-title">Lucro Líquido Projetado</div>
          <div class="kpi-value text-green">${formatarMoeda(lucroLiquido)}</div>
          <div class="kpi-desc">Margem média consolidada: ${(lucroLiquido / (faturamentoBruto || 1) * 100).toFixed(1)}%</div>
        </div>

        <div class="card">
          <div class="kpi-title">Saldo a Receber na Retirada</div>
          <div class="kpi-value text-white">${formatarMoeda(saldoPendente)}</div>
          <div class="kpi-desc">50% restante a receber na entrega</div>
        </div>
      </div>

      <div class="table-wrapper">
        <div class="table-header-bar">
          <div class="table-title">Controle de Sinais e Faturamento por Pedido</div>
        </div>
        <table class="erp-table">
          <thead>
            <tr>
              <th>Nº Pedido</th>
              <th>Cliente</th>
              <th>Valor Total</th>
              <th>Sinal 50%</th>
              <th>Status Sinal</th>
              <th>Saldo na Retirada</th>
              <th>Previsão Entrega</th>
              <th>NF-e Emitida</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${db.pedidos.map(p => `
              <tr>
                <td class="text-mono text-white">#${p.numero}</td>
                <td><strong>${p.clienteNome}</strong></td>
                <td class="text-mono text-white">${formatarMoeda(p.valorTotalVenda)}</td>
                <td class="text-mono">${formatarMoeda(p.valorSinalPago)}</td>
                <td>
                  <span class="status-pill ${p.sinalPago ? 'status-green' : 'status-red'}">
                    ${p.sinalPago ? 'RECEBIDO' : 'AGUARDANDO PIX'}
                  </span>
                </td>
                <td class="text-mono text-white"><strong>${formatarMoeda(p.saldoPendente)}</strong></td>
                <td class="text-mono">${p.dataPrevisaoEntrega}</td>
                <td>
                  <span class="status-pill ${p.notaFiscalEmitida ? 'status-green' : 'status-gray'}">
                    ${p.notaFiscalEmitida ? 'EMITIDA' : 'PENDENTE'}
                  </span>
                </td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick="window.ERP.abrirModalEmitirNfe('${p.id}')">Gerar NF-e</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ==========================================================================
     MÓDULO 8: COMPRAS DE INSUMOS
     ========================================================================== */
  function renderizarCompras() {
    pageTitleElem.textContent = 'Gestão de Compras & Fornecedores Têxteis';
    pageBreadcrumbElem.textContent = 'SISTEMA > COMPRAS';

    contentArea.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <p style="color: var(--text-gray-400);">Pedidos de compra de malhas, tecidos, aviamentos e suprimentos DTF.</p>
        <button class="btn btn-primary">+ Nova Ordem de Compra</button>
      </div>

      <div class="table-wrapper">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Código Compra</th>
              <th>Data</th>
              <th>Fornecedor</th>
              <th>Itens Comprados</th>
              <th>Valor Total</th>
              <th>Previsão de Chegada</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${db.compras.map(c => `
              <tr>
                <td class="text-mono text-white">${c.id}</td>
                <td class="text-mono">${c.data}</td>
                <td><strong>${c.fornecedor}</strong></td>
                <td>${c.itens}</td>
                <td class="text-mono text-white">${formatarMoeda(c.valorTotal)}</td>
                <td class="text-mono">${c.previsaoChegada}</td>
                <td>
                  <span class="status-pill ${c.status === 'Entregue' ? 'status-green' : 'status-red'}">
                    ${c.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick="alert('Detalhes da Ordem de Compra ${c.id}')">Ver Detalhes</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ==========================================================================
     MÓDULO 9: CLIENTES (CRM TÊXTIL COM GATILHO DE RECOMPRA)
     ========================================================================== */
  function renderizarClientes() {
    pageTitleElem.textContent = 'Gestão de Clientes & CRM Têxtil';
    pageBreadcrumbElem.textContent = 'SISTEMA > CLIENTES';

    contentArea.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <p style="color: var(--text-gray-400);">Base de clientes com histórico de compras e gatilhos automáticos de renovação de uniforme.</p>
        <button class="btn btn-primary">+ Cadastrar Cliente</button>
      </div>

      <div class="table-wrapper">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Razão Social / Nome Fantasia</th>
              <th>CNPJ / CPF</th>
              <th>Contato Principal</th>
              <th>WhatsApp</th>
              <th>Cidade / UF</th>
              <th>Total Pedidos</th>
              <th>Faturamento Acumulado</th>
              <th>Última Compra</th>
              <th>Alerta Recompra (6 meses)</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${db.clientes.map(cli => `
              <tr>
                <td>
                  <strong class="text-white">${cli.nomeFantasia}</strong>
                  <span style="display: block; font-size: 11px; color: var(--text-gray-500);">${cli.razaoSocial}</span>
                </td>
                <td class="text-mono">${cli.cnpj}</td>
                <td>${cli.contatoNome}</td>
                <td class="text-mono">
                  <a href="https://api.whatsapp.com/send?phone=55${cli.telefone}&text=Ol%C3%A1%2C%20tudo%20bem%3F" target="_blank" style="color: var(--color-green); text-decoration: none;">
                    ${cli.telefone}
                  </a>
                </td>
                <td>${cli.cidade} - ${cli.uf}</td>
                <td class="text-mono">${cli.totalPedidosFeitos} pedidos</td>
                <td class="text-mono text-white">${formatarMoeda(cli.faturamentoAcumulado)}</td>
                <td class="text-mono">${cli.dataUltimaCompra}</td>
                <td>
                  <span class="status-pill ${cli.precisaRecompraAlerta ? 'status-red' : 'status-green'}">
                    ${cli.precisaRecompraAlerta ? 'RENOVAR PEDIDO' : 'EM DIA'}
                  </span>
                </td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick="alert('Abrindo histórico de compras de ${cli.nomeFantasia}')">Histórico</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ==========================================================================
     MÓDULO 10: QUARENTENA DE PEDIDOS (MESA DE APROVAÇÃO DO ADMINISTRADOR)
     ========================================================================== */
  function renderizarQuarentena() {
    pageTitleElem.textContent = 'Mesa de Quarentena & Aprovação de Riscos';
    pageBreadcrumbElem.textContent = 'SISTEMA > QUARENTENA';

    const pedidosQuarentena = db.pedidos.filter(p => p.status === 'Quarentena');

    contentArea.innerHTML = `
      <div class="card" style="margin-bottom: 20px; border-left: 4px solid var(--color-red);">
        <h3 style="font-size: 14px; color: var(--text-white); margin-bottom: 4px;">Área de Validação de Riscos Têxteis</h3>
        <p style="font-size: 12px; color: var(--text-gray-400);">
          Nenhum corte de tecido ou gravação de matriz de bordado é iniciado sem a aprovação administrativa dos 3 critérios:
          <strong>1) Sinal de 50% confirmado</strong>, <strong>2) Margem de lucro líquida saudável (mínimo 20%)</strong> e <strong>3) Ficha técnica conferida</strong>.
        </p>
      </div>

      <div class="table-wrapper">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Nº Pedido</th>
              <th>Cliente</th>
              <th>Vendedor</th>
              <th>Produto</th>
              <th>Grade</th>
              <th>Valor Total</th>
              <th>Margem Líquida</th>
              <th>Critério 1: Sinal (50%)</th>
              <th>Critério 2: Margem >= 20%</th>
              <th>Ações do Administrador</th>
            </tr>
          </thead>
          <tbody>
            ${pedidosQuarentena.length ? pedidosQuarentena.map(p => {
              const margemOk = p.margemLucroPercentual >= 20.0;
              return `
                <tr>
                  <td class="text-mono text-white">#${p.numero}</td>
                  <td><strong>${p.clienteNome}</strong></td>
                  <td>${p.vendedorResponsavel}</td>
                  <td>${p.produtoNome}</td>
                  <td class="text-mono">${p.grade.total} pçs</td>
                  <td class="text-mono text-white">${formatarMoeda(p.valorTotalVenda)}</td>
                  <td class="text-mono">
                    <strong class="${margemOk ? 'text-green' : 'text-red'}">
                      ${p.margemLucroPercentual.toFixed(1)}%
                    </strong>
                  </td>
                  <td>
                    <span class="status-pill ${p.sinalPago ? 'status-green' : 'status-red'}">
                      ${p.sinalPago ? 'CONFIRMADO' : 'SEM SINAL'}
                    </span>
                  </td>
                  <td>
                    <span class="status-pill ${margemOk ? 'status-green' : 'status-red'}">
                      ${margemOk ? 'APROVADA' : 'MARGEM BAIXA'}
                    </span>
                  </td>
                  <td>
                    <div style="display: flex; gap: 6px;">
                      <button class="btn btn-green btn-sm btn-aprovar-quarentena" data-id="${p.id}">
                        Aprovar para Oficina
                      </button>
                      <button class="btn btn-red btn-sm btn-rejeitar-quarentena" data-id="${p.id}">
                        Devolver p/ Vendedor
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('') : `
              <tr><td colspan="10" style="text-align: center; padding: 30px; color: var(--text-gray-500);">Nenhum pedido em quarentena no momento. Todos foram aprovados ou processados.</td></tr>
            `}
          </tbody>
        </table>
      </div>
    `;

    document.querySelectorAll('.btn-aprovar-quarentena').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        aprovarPedidoQuarentena(id);
      });
    });

    document.querySelectorAll('.btn-rejeitar-quarentena').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        devolverPedidoQuarentena(id);
      });
    });
  }

  function aprovarPedidoQuarentena(pedidoId) {
    const pedido = db.pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;

    pedido.status = 'Em Producao';
    pedido.etapaProducao = 'Corte';

    // Cria a Ordem de Serviço técnica para o chão de fábrica
    const novaOS = {
      id: `OS-${Math.floor(1000 + Math.random() * 9000)}`,
      pedidoNumero: pedido.numero,
      cliente: pedido.clienteNome,
      produto: pedido.produtoNome,
      quantidadeTotal: pedido.grade.total,
      grade: pedido.grade,
      etapaAtual: 'Corte',
      setorResponsavel: 'Mesa de Corte 1',
      responsavelCorte: 'Vanderlei Souza',
      dataEntradaCorte: new Date().toISOString().split('T')[0],
      dataConclusaoCorte: null,
      tecidoConsumidoKg: (pedido.grade.total * 0.28).toFixed(1),
      arteDtfMetrosLineares: 0,
      instrucoesCorte: `Corte padrão para ${pedido.grade.total} peças de ${pedido.produtoNome}.`,
      instrucoesBordado: pedido.tipoPersonalizacao,
      statusBordado: 'Pendente',
      statusCostura: 'Pendente',
      statusAcabamento: 'Pendente'
    };

    db.ordensServico.push(novaOS);
    salvarEstado();
    atualizarBadges();
    renderizarQuarentena();

    mostrarToast(`Pedido #${pedido.numero} APROVADO! Gerada ${novaOS.id} para a mesa de corte.`, 'green');

    // Abre o simulador de disparo de WhatsApp informando o cliente da aprovação
    abrirModalWhatsApp(pedido.id);
  }

  function devolverPedidoQuarentena(pedidoId) {
    const pedido = db.pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;

    pedido.status = 'Orcamento';
    pedido.etapaProducao = 'Devolvido para Revisao de Margem';
    salvarEstado();
    atualizarBadges();
    renderizarQuarentena();
    mostrarToast(`Pedido #${pedido.numero} devolvido ao vendedor para renegociação de preços.`, 'red');
  }

  /* ==========================================================================
     MÓDULO 11: EQUIPE & PERMISSÕES
     ========================================================================== */
  function renderizarEquipe() {
    pageTitleElem.textContent = 'Gestão de Usuários & Níveis de Acesso';
    pageBreadcrumbElem.textContent = 'SISTEMA > EQUIPE';

    contentArea.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <p style="color: var(--text-gray-400);">Controle de permissões para Comercial, Produção/PCP, Financeiro e Administração.</p>
        <button class="btn btn-primary">+ Convidar Colaborador</button>
      </div>

      <div class="table-wrapper">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Nome Completo</th>
              <th>E-mail Corporativo</th>
              <th>Cargo / Função</th>
              <th>Nível de Permissão</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${db.equipe.map(u => `
              <tr>
                <td><strong>${u.nome}</strong></td>
                <td class="text-mono">${u.email}</td>
                <td>${u.cargo}</td>
                <td>
                  <span class="status-pill ${u.nivelAcesso === 'Admin' ? 'status-green' : 'status-gray'}">
                    ${u.nivelAcesso.toUpperCase()}
                  </span>
                </td>
                <td>
                  <span class="status-pill status-green">${u.status}</span>
                </td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick="alert('Editar perfil de ${u.nome}')">Permissões</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ==========================================================================
     MÓDULO 12: NOTA FISCAL (NFE / SEFAZ)
     ========================================================================== */
  function renderizarNotasFiscais() {
    pageTitleElem.textContent = 'Emissor & Gestor Fiscal NF-e (SEFAZ)';
    pageBreadcrumbElem.textContent = 'SISTEMA > NOTAS FISCAIS';

    contentArea.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <p style="color: var(--text-gray-400);">Emissão de NF-e conjugada (Produtos Têxteis + Serviços de Estamparia/Bordado).</p>
        <button class="btn btn-primary" id="btnNovaNfeManual">+ Emitir NF-e Avulsa</button>
      </div>

      <div class="table-wrapper">
        <table class="erp-table">
          <thead>
            <tr>
              <th>NF-e Nº</th>
              <th>Série</th>
              <th>Data Emissão</th>
              <th>Destinatário (Razão Social)</th>
              <th>CNPJ</th>
              <th>CFOP</th>
              <th>Valor Total</th>
              <th>Impostos</th>
              <th>Status SEFAZ</th>
              <th>Chave de Acesso</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${db.notasFiscais.map(nf => `
              <tr>
                <td class="text-mono text-white">#${nf.numero}</td>
                <td class="text-mono">${nf.serie}</td>
                <td class="text-mono">${nf.dataEmissao}</td>
                <td><strong>${nf.cliente}</strong></td>
                <td class="text-mono">${nf.cnpj}</td>
                <td class="text-mono">${nf.cfop}</td>
                <td class="text-mono text-white">${formatarMoeda(nf.valorTotal)}</td>
                <td class="text-mono">${formatarMoeda(nf.valorImpostos)}</td>
                <td>
                  <span class="status-pill status-green">
                    ${nf.statusSefaz.toUpperCase()}
                  </span>
                </td>
                <td class="text-mono" style="font-size: 10px; color: var(--text-gray-500);">${nf.chaveAcesso}</td>
                <td>
                  <div style="display: flex; gap: 6px;">
                    <button class="btn btn-secondary btn-sm" onclick="window.ERP.visualizarDanfe('${nf.id}')">DANFE</button>
                    <button class="btn btn-secondary btn-sm" onclick="alert('Baixando XML da NF-e ${nf.numero}')">XML</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('btnNovaNfeManual')?.addEventListener('click', () => {
      mostrarToast('Selecione um pedido faturado para emitir a NF-e correspondente.', 'green');
    });
  }

  /* ==========================================================================
     MODAIS DE INTERAÇÃO (ORÇAMENTO, BENCHMARK, WHATSAPP, FICHA TÉCNICA)
     ========================================================================== */

  // Modal 1: Novo Orçamento com Benchmark Nacional de Preços
  function abrirModalNovoOrcamento() {
    const modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="modal-overlay active" id="modalNovoOrcamentoOverlay">
        <div class="modal-box">
          <div class="modal-header">
            <div class="modal-title">Novo Orçamento Têxtil com Inteligência de Mercado Brasil</div>
            <button class="modal-close" id="btnFecharModalOrcamento">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group" style="flex: 2;">
                <label class="form-label">Cliente / Razão Social</label>
                <select id="orcClienteSelect" class="form-select">
                  ${db.clientes.map(c => `<option value="${c.id}">${c.nomeFantasia} (${c.cnpj})</option>`).join('')}
                </select>
              </div>

              <div class="form-group" style="flex: 2;">
                <label class="form-label">Modelo Têxtil</label>
                <select id="orcProdutoSelect" class="form-select">
                  ${db.produtosBase.map(p => `<option value="${p.id}">${p.nome} - ${p.tipoMalhaPadrao}</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- Grade de Tamanhos -->
            <div class="form-group">
              <label class="form-label">Grade de Tamanhos (Distribuição de Peças)</label>
              <div class="grade-table-input">
                <div class="grade-col"><div class="grade-label">PP</div><input type="number" id="gradePP" class="grade-input" value="0" min="0"></div>
                <div class="grade-col"><div class="grade-label">P</div><input type="number" id="gradeP" class="grade-input" value="10" min="0"></div>
                <div class="grade-col"><div class="grade-label">M</div><input type="number" id="gradeM" class="grade-input" value="20" min="0"></div>
                <div class="grade-col"><div class="grade-label">G</div><input type="number" id="gradeG" class="grade-input" value="15" min="0"></div>
                <div class="grade-col"><div class="grade-label">GG</div><input type="number" id="gradeGG" class="grade-input" value="5" min="0"></div>
                <div class="grade-col"><div class="grade-label">XG</div><input type="number" id="gradeXG" class="grade-input" value="0" min="0"></div>
                <div class="grade-col"><div class="grade-label">TOTAL</div><input type="text" id="gradeTotal" class="grade-input text-white" value="50" readonly></div>
              </div>
            </div>

            <!-- Painel de Inserção de Custos da Fábrica -->
            <div style="background: #0d101a; padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-bottom: 16px;">
              <span class="form-label" style="color: var(--text-white); margin-bottom: 10px;">Custos Reais de Produção desta Confecção:</span>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Custo Malha/Tecido (R$/kg ou m)</label>
                  <input type="number" id="inputCustoTecido" class="form-input" value="48.50" step="0.50">
                </div>

                <div class="form-group">
                  <label class="form-label">Aviamentos p/ Peça (R$)</label>
                  <input type="number" id="inputCustoAviamento" class="form-input" value="4.80" step="0.20">
                </div>

                <div class="form-group">
                  <label class="form-label">Bordado/DTF p/ Peça (R$)</label>
                  <input type="number" id="inputCustoEstampa" class="form-input" value="6.50" step="0.50">
                </div>

                <div class="form-group">
                  <label class="form-label">Costura p/ Peça (R$)</label>
                  <input type="number" id="inputCustoCostura" class="form-input" value="7.50" step="0.50">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Preço que pretende cobrar (R$ un)</label>
                  <input type="number" id="inputPrecoPretendido" class="form-input" value="54.00" step="1.00">
                </div>

                <div class="form-group">
                  <label class="form-label">Margem Desejada (%)</label>
                  <input type="number" id="inputMargemDesejada" class="form-input" value="30" step="1">
                </div>

                <div class="form-group">
                  <label class="form-label">Alíquota Imposto / NF-e (%)</label>
                  <input type="number" id="inputAliquotaImposto" class="form-input" value="6.5" step="0.1">
                </div>
              </div>
            </div>

            <!-- RESULTADO DO BENCHMARK BRASIL & VIABILIDADE -->
            <div id="painelBenchmarkResultado" class="benchmark-container">
              <!-- Preenchido dinamicamente via JS -->
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" id="btnCancelarOrcamento">Cancelar</button>
            <button class="btn btn-primary" id="btnSalvarEnviarQuarentena">Salvar & Enviar para Quarentena</button>
          </div>
        </div>
      </div>
    `;

    // Conecta eventos de recálculo em tempo real
    const inputsRecalculo = [
      'gradePP', 'gradeP', 'gradeM', 'gradeG', 'gradeGG', 'gradeXG',
      'inputCustoTecido', 'inputCustoAviamento', 'inputCustoEstampa',
      'inputCustoCostura', 'inputPrecoPretendido', 'inputMargemDesejada',
      'inputAliquotaImposto', 'orcProdutoSelect'
    ];

    inputsRecalculo.forEach(id => {
      document.getElementById(id)?.addEventListener('input', recalcularBenchmarkModal);
      document.getElementById(id)?.addEventListener('change', recalcularBenchmarkModal);
    });

    document.getElementById('btnFecharModalOrcamento')?.addEventListener('click', fecharModal);
    document.getElementById('btnCancelarOrcamento')?.addEventListener('click', fecharModal);
    document.getElementById('btnSalvarEnviarQuarentena')?.addEventListener('click', salvarNovoOrcamentoQuarentena);

    recalcularBenchmarkModal();
  }

  function recalcularBenchmarkModal() {
    const pp = parseInt(document.getElementById('gradePP')?.value || 0, 10);
    const p = parseInt(document.getElementById('gradeP')?.value || 0, 10);
    const m = parseInt(document.getElementById('gradeM')?.value || 0, 10);
    const g = parseInt(document.getElementById('gradeG')?.value || 0, 10);
    const gg = parseInt(document.getElementById('gradeGG')?.value || 0, 10);
    const xg = parseInt(document.getElementById('gradeXG')?.value || 0, 10);
    const totalPecas = Math.max(1, pp + p + m + g + gg + xg);

    const gradeTotalInput = document.getElementById('gradeTotal');
    if (gradeTotalInput) gradeTotalInput.value = totalPecas;

    const produtoId = document.getElementById('orcProdutoSelect')?.value || 'PROD-001';
    const prod = db.produtosBase.find(pr => pr.id === produtoId) || db.produtosBase[0];

    const custoTecidoKgOuMetro = parseFloat(document.getElementById('inputCustoTecido')?.value || 48.50);
    const custoAviamentos = parseFloat(document.getElementById('inputCustoAviamento')?.value || 4.80);
    const custoPersonalizacao = parseFloat(document.getElementById('inputCustoEstampa')?.value || 6.50);
    const custoCostura = parseFloat(document.getElementById('inputCustoCostura')?.value || 7.50);
    const precoPretendido = parseFloat(document.getElementById('inputPrecoPretendido')?.value || 54.00);
    const margemDesejada = parseFloat(document.getElementById('inputMargemDesejada')?.value || 30.0);
    const aliquotaImposto = parseFloat(document.getElementById('inputAliquotaImposto')?.value || 6.5);

    const analise = window.MarketBenchmark.calcularViabilidadeOrcamento({
      produtoId: produtoId,
      quantidade: totalPecas,
      custoTecidoKgOuMetro: custoTecidoKgOuMetro,
      consumoPorPeca: prod.consumoMalhaKgPorPeca,
      custoAviamentosTotal: custoAviamentos,
      custoPersonalizacaoUnitario: custoPersonalizacao,
      custoMaoDeObraCostura: custoCostura,
      custoEmbalagemEtiqueta: 1.50,
      aliquotaImpostoPercentual: aliquotaImposto,
      margemDesejadaPercentual: margemDesejada,
      precoVendaPretendido: precoPretendido
    });

    const painel = document.getElementById('painelBenchmarkResultado');
    if (!painel) return;

    painel.innerHTML = `
      <div class="benchmark-header">
        <div>
          <strong style="color: var(--text-white); font-size: 13px;">Média Nacional Cobrada no Brasil (${totalPecas} peças de ${prod.nome}):</strong>
          <span style="display: block; font-size: 11px; color: var(--text-gray-500);">Base de dados consolidada da indústria têxtil</span>
        </div>
        <span class="status-pill status-gray text-mono">Lote: ${totalPecas} peças</span>
      </div>

      <div class="benchmark-grid-3">
        <div class="benchmark-stat-box">
          <div class="benchmark-stat-label">Mínimo de Mercado</div>
          <div class="benchmark-stat-val text-gray">${formatarMoeda(analise.mercado.precoMinimo)}</div>
          <span style="font-size: 10px; color: var(--text-gray-600);">Guerra de preço predatória</span>
        </div>

        <div class="benchmark-stat-box" style="border-color: #3b82f6;">
          <div class="benchmark-stat-label" style="color: #60a5fa;">Média Geral no Brasil</div>
          <div class="benchmark-stat-val text-white">${formatarMoeda(analise.mercado.precoMedioBrasil)}</div>
          <span style="font-size: 10px; color: var(--text-gray-400);">Preço de equilíbrio nacional</span>
        </div>

        <div class="benchmark-stat-box">
          <div class="benchmark-stat-label">Topo de Mercado</div>
          <div class="benchmark-stat-val text-gray">${formatarMoeda(analise.mercado.precoMaximo)}</div>
          <span style="font-size: 10px; color: var(--text-gray-600);">Confecções de grife/alta gama</span>
        </div>
      </div>

      <div class="benchmark-grid-3">
        <div class="benchmark-stat-box">
          <div class="benchmark-stat-label">Seu Custo Real de Produção</div>
          <div class="benchmark-stat-val text-red">${formatarMoeda(analise.custoProducaoUnitario)} / peça</div>
          <span style="font-size: 10px; color: var(--text-gray-500);">Matéria-prima + Costura + Aviamentos</span>
        </div>

        <div class="benchmark-stat-box">
          <div class="benchmark-stat-label">Preço Sugerido para 30% Margem</div>
          <div class="benchmark-stat-val text-green">${formatarMoeda(analise.precoSugeridoCalculado)}</div>
          <span style="font-size: 10px; color: var(--text-gray-500);">Cobre impostos e lucro líquido</span>
        </div>

        <div class="benchmark-stat-box">
          <div class="benchmark-stat-label">Margem Líquida Real do Pedido</div>
          <div class="benchmark-stat-val ${analise.margemLiquidaReal >= 20 ? 'text-green' : 'text-red'}">
            ${analise.margemLiquidaReal.toFixed(1)}% (${formatarMoeda(analise.lucroLiquidoUnitario)}/un)
          </div>
          <span style="font-size: 10px; color: var(--text-gray-500);">Lucro total: ${formatarMoeda(analise.totaisPedido.lucroLiquidoTotal)}</span>
        </div>
      </div>

      <div class="viability-banner ${analise.classeCor}" style="margin-top: 10px;">
        <div>
          <strong style="display: block;">Diagnóstico: ${analise.statusTexto}</strong>
          <span style="font-size: 11.5px;">${analise.recomendacao}</span>
        </div>
        <div class="text-mono" style="font-size: 11px; text-align: right;">
          <span>Custo Teto p/ bater Média Brasil:</span><br>
          <strong class="text-white">${formatarMoeda(analise.custoTetoParaMediaBrasil)} / peça</strong>
        </div>
      </div>
    `;
  }

  function salvarNovoOrcamentoQuarentena() {
    const clienteId = document.getElementById('orcClienteSelect')?.value;
    const cliente = db.clientes.find(c => c.id === clienteId) || db.clientes[0];
    const produtoId = document.getElementById('orcProdutoSelect')?.value;
    const prod = db.produtosBase.find(p => p.id === produtoId) || db.produtosBase[0];

    const pp = parseInt(document.getElementById('gradePP')?.value || 0, 10);
    const p = parseInt(document.getElementById('gradeP')?.value || 0, 10);
    const m = parseInt(document.getElementById('gradeM')?.value || 0, 10);
    const g = parseInt(document.getElementById('gradeG')?.value || 0, 10);
    const gg = parseInt(document.getElementById('gradeGG')?.value || 0, 10);
    const xg = parseInt(document.getElementById('gradeXG')?.value || 0, 10);
    const totalPecas = pp + p + m + g + gg + xg;

    const precoVendaUnitario = parseFloat(document.getElementById('inputPrecoPretendido')?.value || 54.00);
    const valorTotal = totalPecas * precoVendaUnitario;
    const custoEstimado = totalPecas * 32.50;
    const lucroLiquido = valorTotal - custoEstimado;
    const margem = (lucroLiquido / valorTotal) * 100;

    const novoPedido = {
      id: `PED-${Math.floor(1088 + Math.random() * 500)}`,
      numero: Math.floor(1088 + db.pedidos.length),
      dataCriacao: new Date().toISOString().split('T')[0],
      clienteId: cliente.id,
      clienteNome: cliente.nomeFantasia,
      clienteTelefone: cliente.telefone,
      status: 'Quarentena', // Vai direto para quarentena
      etapaProducao: 'Aguardando Aprovacao',
      produtoId: prod.id,
      produtoNome: prod.nome,
      corTecido: 'A Definir',
      tecidoEspecificacao: prod.tipoMalhaPadrao,
      tipoPersonalizacao: 'Personalização Conforme Pedido',
      grade: { pp, p, m, g, gg, xg, total: totalPecas },
      precoUnitarioVenda: precoVendaUnitario,
      valorTotalVenda: valorTotal,
      custoTotalEstimado: custoEstimado,
      lucroLiquidoEstimado: lucroLiquido,
      margemLucroPercentual: margem,
      condicaoPagamento: '50% Sinal + 50% na Entrega',
      sinalPago: false,
      valorSinalPago: 0,
      saldoPendente: valorTotal,
      dataPrevisaoEntrega: '2026-10-20',
      notaFiscalEmitida: false,
      chaveNFe: null,
      vendedorResponsavel: 'Marcos Paulo'
    };

    db.pedidos.unshift(novoPedido);
    salvarEstado();
    atualizarBadges();
    fecharModal();
    navegarPara('quarentena');
    mostrarToast(`Orçamento #${novoPedido.numero} criado e enviado para Quarentena com sucesso!`, 'green');
  }

  // Modal 2: Adicionar Arte para Nesting DTF
  function abrirModalAdicionarArteNesting() {
    const modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="modal-overlay active" id="modalNestingOverlay">
        <div class="modal-box" style="max-width: 520px;">
          <div class="modal-header">
            <div class="modal-title">Adicionar Arte na Fila de Impressão DTF</div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Cliente / Pedido</label>
              <input type="text" id="nestCliente" class="form-input" value="Expresso Paulista" placeholder="Nome do cliente">
            </div>

            <div class="form-group">
              <label class="form-label">Descrição da Arte</label>
              <input type="text" id="nestDesc" class="form-input" value="Logo Manga Patrocínio" placeholder="Ex: Peito 9x8cm">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Largura (cm)</label>
                <input type="number" id="nestLargura" class="form-input" value="8" step="0.5" min="1">
              </div>

              <div class="form-group">
                <label class="form-label">Altura (cm)</label>
                <input type="number" id="nestAltura" class="form-input" value="5" step="0.5" min="1">
              </div>

              <div class="form-group">
                <label class="form-label">Quantidade de Cópias</label>
                <input type="number" id="nestQtd" class="form-input" value="50" min="1">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="window.ERP.fecharModal()">Cancelar</button>
            <button class="btn btn-primary" id="btnSalvarArteNesting">Calcular Encaixe no Rolo</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btnSalvarArteNesting')?.addEventListener('click', () => {
      const cliente = document.getElementById('nestCliente')?.value || 'Cliente Geral';
      const desc = document.getElementById('nestDesc')?.value || 'Arte Têxtil';
      const w = parseFloat(document.getElementById('nestLargura')?.value || 8);
      const h = parseFloat(document.getElementById('nestAltura')?.value || 5);
      const copias = parseInt(document.getElementById('nestQtd')?.value || 10, 10);

      db.nestingFila.push({
        id: `ART-${Math.floor(10 + Math.random() * 90)}`,
        cliente: cliente,
        descricao: desc,
        larguraCm: w,
        alturaCm: h,
        copias: copias,
        roloLarguraCm: 58
      });

      salvarEstado();
      fecharModal();
      renderizarNestingDTF();
      mostrarToast('Arte adicionada! Rolo de DTF recalculado com aproveitamento máximo.', 'green');
    });
  }

  // Modal 3: Disparo de Notificação no WhatsApp
  function abrirModalWhatsApp(pedidoId) {
    const pedido = db.pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;

    const modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) return;

    const mensagemPadrao = `Olá, *${pedido.clienteNome}*!\n\nAqui é da *${db.empresa.nomeFantasia}*.\n\nInformamos que seu pedido *#${pedido.numero}* (${pedido.grade.total}x ${pedido.produtoNome}) acabou de avançar para a etapa de: *${pedido.etapaProducao.toUpperCase()}*.\n\n📅 *Previsão de Entrega:* ${pedido.dataPrevisaoEntrega}\n💰 *Saldo na Retirada:* ${formatarMoeda(pedido.saldoPendente)}\n\nQualquer dúvida estamos à disposição!`;
    const mensagemEncoded = encodeURIComponent(mensagemPadrao);
    const linkWhatsApp = `https://api.whatsapp.com/send?phone=55${pedido.clienteTelefone}&text=${mensagemEncoded}`;

    modalContainer.innerHTML = `
      <div class="modal-overlay active" id="modalWppOverlay">
        <div class="modal-box" style="max-width: 580px;">
          <div class="modal-header">
            <div class="modal-title">Disparo Automático no WhatsApp do Cliente</div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div style="margin-bottom: 14px;">
              <span class="form-label">Destinatário:</span>
              <strong class="text-white">${pedido.clienteNome}</strong> • <span class="text-mono">${pedido.clienteTelefone}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Mensagem Formatada (Atualização de Etapa Têxtil):</label>
              <textarea id="wppTextoMensagem" class="form-textarea" rows="8" style="font-family: var(--font-mono); font-size: 12px;">${mensagemPadrao}</textarea>
            </div>

            <div style="font-size: 11px; color: var(--text-gray-500);">
              Ao clicar no botão abaixo, a mensagem é enviada diretamente para o WhatsApp oficial do cliente mantendo histórico registrado.
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="window.ERP.fecharModal()">Fechar</button>
            <a href="${linkWhatsApp}" target="_blank" class="btn btn-green" id="btnDispararWhatsAppReal">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              Enviar pelo WhatsApp Agora
            </a>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btnDispararWhatsAppReal')?.addEventListener('click', () => {
      fecharModal();
      mostrarToast(`Mensagem enviada com sucesso para o WhatsApp de ${pedido.clienteNome}!`, 'green');
    });
  }

  // Modal 4: Visualização e Impressão de Ficha Técnica / OS
  function abrirFichaTecnica(osId) {
    const os = db.ordensServico.find(o => o.id === osId);
    if (!os) return;

    const modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-box" style="max-width: 680px;">
          <div class="modal-header">
            <div class="modal-title">Ficha Técnica & Ordem de Serviço Industrial (${os.id})</div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>
          <div class="modal-body" style="font-size: 12.5px;">
            <div style="border-bottom: 2px solid #ffffff; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between;">
              <div>
                <h2 style="font-size: 16px; color: white;">${db.empresa.nomeFantasia}</h2>
                <span class="text-mono" style="color: var(--text-gray-500);">ORDEM DE PRODUÇÃO: ${os.id} • PEDIDO #${os.pedidoNumero}</span>
              </div>
              <div class="text-mono text-white" style="text-align: right;">
                DATA: ${os.dataEntradaCorte}
              </div>
            </div>

            <div class="grid-cards-2" style="margin-bottom: 14px;">
              <div><strong>Cliente:</strong> ${os.cliente}</div>
              <div><strong>Produto:</strong> ${os.produto}</div>
              <div><strong>Total de Peças:</strong> ${os.quantidadeTotal} un</div>
              <div><strong>Setor Responsável:</strong> ${os.setorResponsavel}</div>
            </div>

            <div style="background: #0b0d13; padding: 12px; border-radius: var(--radius-sm); margin-bottom: 14px;">
              <strong style="color: white; display: block; margin-bottom: 6px;">Grade de Corte Oficial:</strong>
              <div class="text-mono text-white" style="display: flex; gap: 14px;">
                <span>PP: ${os.grade.pp || 0}</span>
                <span>P: ${os.grade.p || 0}</span>
                <span>M: ${os.grade.m || 0}</span>
                <span>G: ${os.grade.g || 0}</span>
                <span>GG: ${os.grade.gg || 0}</span>
                <span>XG: ${os.grade.xg || 0}</span>
              </div>
            </div>

            <div style="margin-bottom: 14px;">
              <strong style="color: white; display: block; margin-bottom: 4px;">Instruções de Corte & Tecido:</strong>
              <p style="color: var(--text-gray-400);">${os.instrucoesCorte}</p>
            </div>

            <div style="margin-bottom: 14px;">
              <strong style="color: white; display: block; margin-bottom: 4px;">Instruções de Estamparia / Bordado:</strong>
              <p style="color: var(--text-gray-400);">${os.instrucoesBordado}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="window.ERP.fecharModal()">Fechar</button>
            <button class="btn btn-primary" onclick="window.print()">Imprimir Ficha para Fábrica</button>
          </div>
        </div>
      </div>
    `;
  }

  // Modal 5: Emissão de Nota Fiscal
  function abrirModalEmitirNfe(pedidoId) {
    const pedido = db.pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;

    const modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) return;

    const valorImposto = pedido.valorTotalVenda * (db.empresa.aliquotaImpostoPadrao / 100);

    modalContainer.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-box" style="max-width: 600px;">
          <div class="modal-header">
            <div class="modal-title">Emissão de NF-e Conjugada (SEFAZ)</div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div style="background: #0b0d13; padding: 12px; border-radius: var(--radius-sm); margin-bottom: 16px;">
              <div style="font-size: 11px; color: var(--text-gray-500); text-transform: uppercase;">Emitente:</div>
              <strong class="text-white">${db.empresa.razaoSocial}</strong> • CNPJ: <span class="text-mono">${db.empresa.cnpj}</span>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Destinatário</label>
                <input type="text" class="form-input" value="${pedido.clienteNome}" readonly>
              </div>

              <div class="form-group">
                <label class="form-label">Natureza da Operação</label>
                <input type="text" class="form-input" value="Venda de Produção Têxtil (CFOP 5101)" readonly>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Valor dos Produtos (R$)</label>
                <input type="text" class="form-input text-mono text-white" value="${formatarMoeda(pedido.valorTotalVenda)}" readonly>
              </div>

              <div class="form-group">
                <label class="form-label">Impostos Simples (6.5%)</label>
                <input type="text" class="form-input text-mono text-red" value="${formatarMoeda(valorImposto)}" readonly>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Chave de Acesso Simulada SEFAZ:</label>
              <input type="text" class="form-input text-mono" value="352609${db.empresa.cnpj.replace(/\D/g,'')}55001000000${pedido.numero}1098234710" readonly style="font-size: 11px;">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="window.ERP.fecharModal()">Cancelar</button>
            <button class="btn btn-green" id="btnConfirmarEmissaoNfe">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Transmitir e Autorizar na SEFAZ
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btnConfirmarEmissaoNfe')?.addEventListener('click', () => {
      pedido.notaFiscalEmitida = true;
      pedido.chaveNFe = `352609${db.empresa.cnpj.replace(/\D/g,'')}55001000000${pedido.numero}1098234710`;

      // Adiciona na lista de notas emitidas
      db.notasFiscais.unshift({
        id: `NFE-${Math.floor(1000 + Math.random() * 9000)}`,
        numero: pedido.numero,
        serie: '1',
        dataEmissao: new Date().toISOString().split('T')[0],
        cliente: pedido.clienteNome,
        cnpj: '18.394.819/0001-92',
        cfop: '5101',
        naturezaOperacao: 'Venda de Produção do Estabelecimento',
        valorTotal: pedido.valorTotalVenda,
        valorImpostos: valorImposto,
        statusSefaz: 'Autorizada',
        chaveAcesso: pedido.chaveNFe,
        protocolo: `1352600${Math.floor(100000 + Math.random() * 900000)}`
      });

      salvarEstado();
      fecharModal();
      mostrarToast(`NF-e #${pedido.numero} autorizada com sucesso na SEFAZ!`, 'green');
      navegarPara('nfe');
    });
  }

  function fecharModal() {
    const modalContainer = document.getElementById('modalContainer');
    if (modalContainer) modalContainer.innerHTML = '';
  }

  function abrirDetalhesPedido(id) {
    const p = db.pedidos.find(item => item.id === id);
    if (!p) return;
    abrirModalWhatsApp(p.id);
  }

  // Exposição global das funções públicas
  window.ERP = {
    navegarPara,
    abrirFichaTecnica,
    abrirModalEmitirNfe,
    abrirModalWhatsApp,
    fecharModal,
    visualizarDanfe: function(nfeId) {
      alert(`Visualizando DANFE da Nota Fiscal ${nfeId}`);
    },
    ajustarEstoque: function(estoqueId) {
      const item = db.estoque.find(e => e.id === estoqueId);
      if (!item) return;
      const novo = prompt(`Informe o novo saldo para ${item.descricao} (${item.unidade}):`, item.saldoAtual);
      if (novo !== null && !isNaN(parseFloat(novo))) {
        item.saldoAtual = parseFloat(novo);
        salvarEstado();
        renderizarEstoque();
        mostrarToast(`Estoque de ${item.descricao} atualizado para ${item.saldoAtual} ${item.unidade}.`, 'green');
      }
    }
  };

  // Disparo inicial quando DOM carregar
  document.addEventListener('DOMContentLoaded', init);
})();
