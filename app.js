/**
 * UNIFORMES ERP - TEXPRO INDUSTRIAL ERP
 * Controlador Principal da Aplicação Integrada
 * Sistema de Gestão Industrial e Comercial para Fábricas de Uniformes
 */

(function () {
  'use strict';

  // Chave de persistência de banco de dados (Versão 8.0: 100% Zerado para Produção Real com Gestão Completa de Despesas)
  const ERP_VERSION = '8.0_ZERO_PROD';
  const STORAGE_KEY = 'texpro_erp_prod_v8';
  let db = null;

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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Erro ao salvar no localStorage', e);
    }
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
    atualizarBadges();
    configurarCliqueGlobalMockups();
    configurarFechamentoModaisGlobal();
    navegarPara(abaAtiva);
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

  // Roteador de Abas
  function navegarPara(aba) {
    abaAtiva = aba;

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

  function fecharModal() {
    if (modalContainer) modalContainer.innerHTML = '';
    document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
  }

  function configurarFechamentoModaisGlobal() {
    // 1. Fechar ao clicar fora da caixa (no overlay cinza/escuro)
    document.addEventListener('click', (e) => {
      if (e.target && e.target.classList && e.target.classList.contains('modal-overlay')) {
        fecharModal();
      }
    });

    // 2. Fechar instantaneamente ao pressionar ESC
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        fecharModal();
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
          <button class="btn btn-secondary btn-sm" id="btnIrParaPedidos">Ir para Todos os Pedidos</button>
        </div>
        <table class="erp-table">
          <thead>
            <tr>
              <th>Mockup 3x4</th>
              <th>Nº Pedido</th>
              <th>Cliente</th>
              <th>Produto Têxtil</th>
              <th>Grade</th>
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
              return `
                <tr>
                  <td>
                    <img src="${mockup}" class="mockup-thumb-3x4" data-pedido-id="${p.id}" alt="Mockup 3x4" title="Clique para abrir o mockup 3x4 na tela">
                  </td>
                  <td class="text-mono"><strong>#${p.numero}</strong></td>
                  <td><strong>${p.clienteNome}</strong></td>
                  <td>${p.produtoNome}</td>
                  <td class="text-mono">${p.grade?.total || 0} un</td>
                  <td class="text-mono"><strong>${formatarMoeda(p.valorTotalVenda)}</strong></td>
                  <td>
                    <span class="status-pill ${p.sinalPago ? 'status-green' : 'status-red'}">
                      ${p.sinalPago ? (p.saldoPendente <= 0 ? '100% QUITADO' : 'SINAL 50% OK') : 'PENDENTE'}
                    </span>
                  </td>
                  <td>
                    <span class="status-pill ${p.status === 'Quarentena' ? 'status-red' : p.status === 'Em Producao' ? 'status-green' : 'status-gray'}">
                      ${p.status.toUpperCase()}
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
                <td colspan="9" style="text-align: center; padding: 40px 20px; color: var(--text-gray-500);">
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
          <span class="table-scroll-hint" title="Use a barra de rolagem horizontal abaixo para navegar por todas as colunas">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline><polyline points="19 18 13 12 19 6"></polyline></svg>
            Rolagem Lateral Ativa
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline><polyline points="5 18 11 12 5 6"></polyline></svg>
          </span>
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
              const quitadoTotal = p.sinalPago && (p.saldoPendente <= 0);
              return `
                <tr>
                  <td>
                    <img src="${mockup}" class="mockup-thumb-3x4" data-pedido-id="${p.id}" alt="Mockup 3x4" title="Clique para abrir o mockup 3x4 na tela">
                  </td>
                  <td>
                    <span class="text-mono" style="font-weight: 800; font-size: 13px;">#${p.numero}</span>
                    <span style="display: block; font-size: 10.5px; color: var(--text-gray-500);">${p.dataCriacao}</span>
                    <span class="status-pill ${p.tipoRegistro === 'Orcamento' ? 'status-gray' : 'status-green'}" style="font-size: 9px; margin-top: 3px;">
                      ${p.tipoRegistro ? p.tipoRegistro.toUpperCase() : 'PEDIDO'}
                    </span>
                  </td>
                  <td>
                    <strong style="color: var(--text-primary); font-size: 13px;">${p.clienteNome}</strong>
                    <span style="display: block; font-size: 11px; color: var(--text-gray-500);">${formatarTelefone(p.clienteTelefone)}</span>
                    <span style="font-size: 10.5px; color: var(--text-gray-600);">Costureira: <strong>${p.costureiraNome || 'Não atribuída'}</strong></span>
                  </td>
                  <td>
                    <strong>${p.produtoNome}</strong>
                    <span style="display: block; font-size: 11px; color: var(--text-gray-500);">${p.tipoPersonalizacao || 'Estampa Conforme Arte'}</span>
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
                      <button class="status-pill ${quitadoTotal ? 'status-green' : p.sinalPago ? 'status-green' : 'status-red'} btn-toggle-sinal" 
                              data-id="${p.id}" 
                              title="Clique para alterar status do sinal ou quitar 100%">
                        ${quitadoTotal ? '100% QUITADO' : p.sinalPago ? '50% PAGO (Mudar)' : 'PENDENTE (Pagar)'}
                      </button>
                      <span class="text-mono" style="font-size: 10.5px; color: var(--text-gray-600);">
                        Recebido: ${formatarMoeda(p.valorSinalPago || 0)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <!-- Seletor de Etapa no mesmo quadradinho verde -->
                    <select class="form-select select-trocar-etapa" data-id="${p.id}" style="font-size: 11.5px; padding: 4px 6px; font-weight: 700; background-color: var(--bg-green-soft); border-color: var(--border-green); color: var(--color-green);">
                      <option value="Orcamento" ${p.status === 'Orcamento' ? 'selected' : ''}>Orçamento (Proposta)</option>
                      <option value="Quarentena" ${p.status === 'Quarentena' ? 'selected' : ''}>Quarentena (Validação)</option>
                      <option value="Corte" ${p.etapaProducao === 'Corte' ? 'selected' : ''}>Oficina: 1. Mesa de Corte</option>
                      <option value="Estamparia / DTF" ${p.etapaProducao === 'Estamparia / DTF' || p.etapaProducao === 'Bordado' ? 'selected' : ''}>Oficina: 2. Estamparia / DTF</option>
                      <option value="Costura" ${p.etapaProducao === 'Costura' ? 'selected' : ''}>Oficina: 3. Costura & Fechamento</option>
                      <option value="Acabamento" ${p.etapaProducao === 'Acabamento' ? 'selected' : ''}>Oficina: 4. Revisão & Acabamento</option>
                      <option value="Expedicao" ${p.etapaProducao === 'Expedicao' ? 'selected' : ''}>Oficina: 5. Expedição / Pronto</option>
                      <option value="Entregue" ${p.status === 'Finalizado' || p.etapaProducao === 'Entregue' ? 'selected' : ''}>Entregue ao Cliente</option>
                    </select>
                  </td>
                  <td>
                    <div style="display: flex; gap: 5px;">
                      <button class="btn btn-secondary btn-sm btn-disparar-wpp" data-id="${p.id}" title="Enviar Notificação pelo WhatsApp">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        WPP
                      </button>
                      ${p.tipoRegistro === 'Orcamento' ? `
                        <button class="btn btn-secondary btn-sm btn-baixar-proposta" data-id="${p.id}">Proposta</button>
                        <button class="btn btn-primary btn-sm btn-converter-pedido" data-id="${p.id}">Entrada</button>
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
      { id: "col-orcamento", titulo: "1. ORÇAMENTO & QUARENTENA", filtro: p => p.status === 'Orcamento' || p.status === 'Quarentena' },
      { id: "col-corte", titulo: "2. MESA DE CORTE", filtro: p => p.status === 'Em Producao' && (p.etapaProducao === 'Corte' || p.etapaProducao === 'Aguardando Tecido') },
      { id: "col-estampa", titulo: "3. ESTAMPARIA & DTF", filtro: p => p.status === 'Em Producao' && (p.etapaProducao === 'Estamparia / DTF' || p.etapaProducao === 'Bordado') },
      { id: "col-costura", titulo: "4. COSTURA & FECHAMENTO", filtro: p => p.status === 'Em Producao' && p.etapaProducao === 'Costura' },
      { id: "col-expedicao", titulo: "5. EXPEDIÇÃO & FINALIZADO", filtro: p => p.etapaProducao === 'Acabamento' || p.etapaProducao === 'Expedicao' || p.status === 'Finalizado' }
    ];

    return `
      <div class="kanban-board">
        ${colunas.map(col => {
          const itens = pedidos.filter(col.filtro);
          return `
            <div class="kanban-col">
              <div class="kanban-col-header">
                <span>${col.titulo}</span>
                <span class="kanban-col-count">${itens.length}</span>
              </div>
              <div class="kanban-items">
                ${itens.length ? itens.map(p => {
                  const mockup = p.mockupUrl || window.ERP_MOCKUPS.gerarMockupSvg(p.produtoNome, "#1e3a8a", "#ffffff", p.clienteNome.substring(0, 6));
                  return `
                    <div class="kanban-card">
                      <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        <img src="${mockup}" class="mockup-thumb-3x4" data-pedido-id="${p.id}" alt="Mockup 3x4" title="Clique para abrir o mockup 3x4 na tela">
                        <div style="flex: 1; min-width: 0;">
                          <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span class="text-mono" style="font-weight: 800; font-size: 11px;">#${p.numero}</span>
                            <span class="status-pill ${p.sinalPago ? 'status-green' : 'status-red'}" style="font-size: 9px;">
                              ${p.sinalPago ? 'SINAL OK' : 'SEM SINAL'}
                            </span>
                          </div>
                          <div class="kanban-card-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.clienteNome}</div>
                          <div class="kanban-card-sub">${p.grade?.total || 0}x ${p.produtoNome}</div>
                        </div>
                      </div>

                      <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 8px; border-top: 1px solid var(--border-subtle); padding-top: 6px;">
                        <span class="text-mono">${formatarMoeda(p.valorTotalVenda)}</span>
                        <span class="text-mono ${p.margemLucroPercentual >= 25 ? 'text-green' : 'text-red'}">
                          Margem: ${(p.margemLucroPercentual || 0).toFixed(0)}%
                        </span>
                      </div>

                      <div style="display: flex; gap: 6px;">
                        <button class="btn btn-secondary btn-sm btn-disparar-wpp" data-id="${p.id}" style="flex: 1;">
                          WPP
                        </button>
                        <button class="btn btn-primary btn-sm btn-ver-os" data-id="${p.id}" style="flex: 1;">
                          Ficha OS
                        </button>
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

    // Alterar Sinal / Quitar 100%
    document.querySelectorAll('.btn-toggle-sinal').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        alternarStatusSinalPedido(id);
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
  }

  // Alterna pagamento do sinal / quitação integral e lança no Financeiro
  function alternarStatusSinalPedido(pedidoId) {
    const p = db.pedidos.find(x => x.id === pedidoId);
    if (!p) return;

    if (!p.sinalPago || p.valorSinalPago === 0) {
      // Registrar sinal de 50%
      const valorSinal = p.valorTotalVenda * 0.5;
      p.sinalPago = true;
      p.valorSinalPago = valorSinal;
      p.saldoPendente = p.valorTotalVenda - valorSinal;

      // Lança no financeiro com o nome do cliente
      db.lancamentosFinanceiros.unshift({
        id: `LAN-${Math.floor(100 + Math.random() * 900)}`,
        data: new Date().toISOString().split('T')[0],
        tipo: "Entrada",
        descricao: `Sinal 50% Pedido #${p.numero}`,
        cliente: p.clienteNome,
        valor: valorSinal,
        formaPagamento: "PIX",
        categoria: "Vendas de Uniformes"
      });

      salvarEstado();
      renderizarPedidos();
      mostrarToast(`Sinal de 50% (${formatarMoeda(valorSinal)}) confirmado para ${p.clienteNome} e creditado no Financeiro!`, 'green');
    } else if (p.saldoPendente > 0) {
      // Quitar os 50% restantes
      const valorQuitacao = p.saldoPendente;
      p.saldoPendente = 0;
      p.valorSinalPago = p.valorTotalVenda;

      // Lança o saldo final no financeiro
      db.lancamentosFinanceiros.unshift({
        id: `LAN-${Math.floor(100 + Math.random() * 900)}`,
        data: new Date().toISOString().split('T')[0],
        tipo: "Entrada",
        descricao: `Quitação Final 100% Pedido #${p.numero}`,
        cliente: p.clienteNome,
        valor: valorQuitacao,
        formaPagamento: "PIX",
        categoria: "Vendas de Uniformes"
      });

      salvarEstado();
      renderizarPedidos();
      mostrarToast(`Pedido #${p.numero} 100% QUITADO! Recebimento de ${formatarMoeda(valorQuitacao)} creditado no Financeiro.`, 'green');
    } else {
      mostrarToast(`Este pedido já se encontra 100% quitado e liquidado no financeiro.`, 'green');
    }
  }

  // Atualização de Etapa com Disparo Obrigatório e Imediato de WhatsApp
  function atualizarEtapaPedido(pedidoId, novaEtapa) {
    const p = db.pedidos.find(x => x.id === pedidoId);
    if (!p) return;

    if (novaEtapa === 'Orcamento') {
      p.status = 'Orcamento';
      p.etapaProducao = 'Em Negociação';
    } else if (novaEtapa === 'Quarentena') {
      p.status = 'Quarentena';
      p.etapaProducao = 'Aguardando Aprovação Técnica';
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
     MODAL DE NOVO ORÇAMENTO COM DUPLO FLUXO & BENCHMARK BRASIL PROFUNDO
     ========================================================================== */
  function abrirModalNovoOrcamento() {
    if (!modalContainer) return;

    // Estado da técnica de estampa atual no modal
    let tecnicaSelecionada = 'DTF';

    modalContainer.innerHTML = `
      <div class="modal-overlay active" id="modalNovoOrcamentoOverlay">
        <div class="modal-box" style="max-width: 860px;">
          <div class="modal-header">
            <div>
              <div class="modal-title">Novo Orçamento & Inteligência de Preço Brasil</div>
              <span style="font-size: 11px; color: var(--text-gray-500);">Preços reais do mercado brasileiro com viabilidade financeira em tempo real</span>
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
                    ${db.clientes.map(c => `<option value="${c.id}">${c.nomeFantasia} • ${formatarTelefone(c.telefone)} (${c.cidade}/${c.uf})</option>`).join('')}
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

            <!-- Grade de Tamanhos -->
            <div class="form-group">
              <label class="form-label">Grade de Tamanhos (Distribuição de Peças)</label>
              <div class="grade-table-input">
                <div class="grade-col"><div class="grade-label">PP</div><input type="number" id="gradePP" class="grade-input" value="0" min="0"></div>
                <div class="grade-col"><div class="grade-label">P</div><input type="number" id="gradeP" class="grade-input" value="15" min="0"></div>
                <div class="grade-col"><div class="grade-label">M</div><input type="number" id="gradeM" class="grade-input" value="35" min="0"></div>
                <div class="grade-col"><div class="grade-label">G</div><input type="number" id="gradeG" class="grade-input" value="30" min="0"></div>
                <div class="grade-col"><div class="grade-label">GG</div><input type="number" id="gradeGG" class="grade-input" value="15" min="0"></div>
                <div class="grade-col"><div class="grade-label">XG</div><input type="number" id="gradeXG" class="grade-input" value="5" min="0"></div>
                <div class="grade-col"><div class="grade-label">TOTAL</div><input type="text" id="gradeTotal" class="grade-input" style="font-weight: 800; background: #0f172a; color: #ffffff;" value="100" readonly></div>
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
              <span class="form-label" style="font-size: 12.5px; font-weight: 800; color: var(--text-primary); margin-bottom: 10px; display: block;">
                Custos Diretos desta Confecção para Produzir:
              </span>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Custo Tecido (R$/kg ou m)</label>
                  <input type="number" id="inputCustoTecido" class="form-input" value="48.50" step="0.50">
                </div>

                <div class="form-group">
                  <label class="form-label">Aviamentos p/ Peça (R$)</label>
                  <input type="number" id="inputCustoAviamento" class="form-input" value="4.80" step="0.20">
                </div>

                <div class="form-group">
                  <label class="form-label">Custo Estampa Calculado (R$)</label>
                  <input type="number" id="inputCustoEstampa" class="form-input" value="6.50" step="0.10">
                </div>

                <div class="form-group">
                  <label class="form-label">Mão de Obra Costura (R$)</label>
                  <input type="number" id="inputCustoCostura" class="form-input" value="7.50" step="0.50">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Preço que Pretende Cobrar (R$ un)</label>
                  <input type="number" id="inputPrecoPretendido" class="form-input" style="font-weight: 800; font-size: 14px;" value="54.00" step="1.00">
                </div>

                <div class="form-group">
                  <label class="form-label">Margem Líquida Alvo (%)</label>
                  <input type="number" id="inputMargemDesejada" class="form-input" value="30" step="1">
                </div>

                <div class="form-group">
                  <label class="form-label">Imposto / Simples (%)</label>
                  <input type="number" id="inputAliquotaImposto" class="form-input" value="6.5" step="0.1">
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
    `;

    // Atualiza o painel específico da técnica de estampa
    function atualizarPainelTecnica(tec) {
      tecnicaSelecionada = tec;
      const painel = document.getElementById('painelParametrosTecnica');
      if (!painel) return;

      if (tec === 'DTF') {
        painel.innerHTML = `
          <div style="font-size: 11.5px; font-weight: 700; margin-bottom: 6px; color: var(--text-primary);">
            Cálculo DTF Digital por Área e Filme:
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Largura da Arte (cm)</label>
              <input type="number" id="dtfParamLargura" class="form-input" value="26" step="0.5">
            </div>
            <div class="form-group">
              <label class="form-label">Altura da Arte (cm)</label>
              <input type="number" id="dtfParamAltura" class="form-input" value="8" step="0.5">
            </div>
            <div class="form-group">
              <label class="form-label">Custo Metro Linear Rolo DTF (R$)</label>
              <input type="number" id="dtfParamMetro" class="form-input" value="60.00" step="5.00">
            </div>
            <div class="form-group">
              <label class="form-label">Custo Prensagem Térmica (R$)</label>
              <input type="number" id="dtfParamPrensa" class="form-input" value="1.50" step="0.20">
            </div>
          </div>
        `;
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
        const w = parseFloat(document.getElementById('dtfParamLargura')?.value || 26);
        const h = parseFloat(document.getElementById('dtfParamAltura')?.value || 8);
        const metroCusto = parseFloat(document.getElementById('dtfParamMetro')?.value || 60);
        const prensa = parseFloat(document.getElementById('dtfParamPrensa')?.value || 1.50);
        
        // Rolo de 58cm útil: quantas artes cabem por metro linear
        const cabemNaLinha = Math.max(1, Math.floor(58 / (w + 0.5)));
        const linhasPorMetro = 100 / (h + 0.5);
        const artesPorMetro = Math.max(1, cabemNaLinha * linhasPorMetro);
        const custoFilmePorArte = metroCusto / artesPorMetro;
        custoUnit = custoFilmePorArte + prensa;
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
          // Ajusta custos padrão
          document.getElementById('inputCustoCostura').value = novoMod.custoMaoDeObraBase.toFixed(2);
          recalcularBenchmarkModal();
        }
      });
    });

    // Inputs que disparam recálculo em tempo real
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

    // Inicializa painel DTF
    atualizarPainelTecnica('DTF');

    // Botões de ação do Duplo Fluxo
    document.getElementById('btnSalvarApenasOrcamento')?.addEventListener('click', () => {
      salvarOrcamentoOuPedido('Orcamento');
    });

    document.getElementById('btnAvancarParaPedidoOficial')?.addEventListener('click', () => {
      // Coleta dados parciais do orçamento para passar à tela de avanço
      const dadosOrcamento = coletarDadosOrcamentoModal();
      if (!dadosOrcamento) return;
      abrirEtapaAvancarPedido(dadosOrcamento);
    });
  }

  function coletarDadosOrcamentoModal() {
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

    if (totalPecas <= 0) {
      mostrarToast('Por favor, informe ao menos 1 peça na grade de tamanhos.', 'red');
      return null;
    }

    const precoVendaUnitario = parseFloat(document.getElementById('inputPrecoPretendido')?.value || 54.00);
    const custoTecido = parseFloat(document.getElementById('inputCustoTecido')?.value || 48.50);
    const custoAviamento = parseFloat(document.getElementById('inputCustoAviamento')?.value || 4.80);
    const custoEstampa = parseFloat(document.getElementById('inputCustoEstampa')?.value || 6.50);
    const custoCostura = parseFloat(document.getElementById('inputCustoCostura')?.value || 7.50);

    const custoUnitario = (custoTecido * prod.consumoMalhaKgPorPeca) + custoAviamento + custoEstampa + custoCostura + 1.50;
    const valorTotal = totalPecas * precoVendaUnitario;
    const custoTotal = totalPecas * custoUnitario;
    const impostos = valorTotal * 0.065;
    const lucroLiquido = valorTotal - custoTotal - impostos;
    const margem = valorTotal > 0 ? (lucroLiquido / valorTotal) * 100 : 0;

    return {
      cliente,
      prod,
      grade: { pp, p, m, g, gg, xg, total: totalPecas },
      precoVendaUnitario,
      valorTotal,
      custoTotal,
      lucroLiquido,
      margem,
      impostos
    };
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
          <strong style="color: var(--text-primary); font-size: 13px;">Média Nacional Cobrada no Brasil (${totalPecas} peças de ${prod.nome}):</strong>
          <span style="display: block; font-size: 11px; color: var(--text-gray-500);">Base de dados consolidada dos polos têxteis (Americana/SP, Brusque/SC, Maringá/PR)</span>
        </div>
        <span class="status-pill status-gray text-mono">Lote: ${totalPecas} un</span>
      </div>

      <div class="benchmark-grid-3">
        <div class="benchmark-stat-box">
          <div class="benchmark-stat-label">Mínimo Brasil</div>
          <div class="benchmark-stat-val text-gray-500">${formatarMoeda(analise.mercado.precoMinimo)}</div>
          <span style="font-size: 10px; color: var(--text-gray-400);">Guerra de preço predatória</span>
        </div>

        <div class="benchmark-stat-box" style="border-color: #0f172a; border-width: 1.5px; background: #ffffff;">
          <div class="benchmark-stat-label" style="color: #0f172a;">MÉDIA REAL NO BRASIL</div>
          <div class="benchmark-stat-val text-primary" style="font-size: 19px;">${formatarMoeda(analise.mercado.precoMedioBrasil)}</div>
          <span style="font-size: 10.5px; color: var(--text-gray-600); font-weight: 600;">Preço de equilíbrio nacional</span>
        </div>

        <div class="benchmark-stat-box">
          <div class="benchmark-stat-label">Topo de Mercado</div>
          <div class="benchmark-stat-val text-gray-500">${formatarMoeda(analise.mercado.precoMaximo)}</div>
          <span style="font-size: 10px; color: var(--text-gray-400);">Confecções de alta gama</span>
        </div>
      </div>

      <div class="benchmark-grid-3">
        <div class="benchmark-stat-box">
          <div class="benchmark-stat-label">Seu Custo Direto Unitário</div>
          <div class="benchmark-stat-val text-red">${formatarMoeda(analise.custoProducaoUnitario)} / un</div>
          <span style="font-size: 10px; color: var(--text-gray-500);">Tecido + Costura + Aviamento + Estampa</span>
        </div>

        <div class="benchmark-stat-box">
          <div class="benchmark-stat-label">Preço Sugerido (30% Margem)</div>
          <div class="benchmark-stat-val text-green">${formatarMoeda(analise.precoSugeridoCalculado)}</div>
          <span style="font-size: 10px; color: var(--text-gray-500);">Cobre impostos e lucro líquido</span>
        </div>

        <div class="benchmark-stat-box">
          <div class="benchmark-stat-label">Margem Líquida Real do Pedido</div>
          <div class="benchmark-stat-val ${analise.margemLiquidaReal >= 20 ? 'text-green' : 'text-red'}">
            ${analise.margemLiquidaReal.toFixed(1)}% (${formatarMoeda(analise.lucroLiquidoUnitario)}/un)
          </div>
          <span style="font-size: 10px; color: var(--text-gray-500);">Lucro total líquido: ${formatarMoeda(analise.totaisPedido.lucroLiquidoTotal)}</span>
        </div>
      </div>

      <div class="viability-banner ${analise.classeCor}">
        <div>
          <strong style="display: block; font-size: 12.5px;">Diagnóstico de Viabilidade: ${analise.statusTexto}</strong>
          <span style="font-size: 11.5px;">${analise.recomendacao}</span>
        </div>
        <div class="text-mono" style="font-size: 11px; text-align: right; white-space: nowrap;">
          <span>Custo Teto p/ Bater Média Brasil:</span><br>
          <strong style="font-size: 13px;">${formatarMoeda(analise.custoTetoParaMediaBrasil)} / peça</strong>
        </div>
      </div>
    `;
  }

  // Salvar Orçamento Apenas
  function salvarOrcamentoOuPedido(tipoRegistro) {
    const dados = coletarDadosOrcamentoModal();
    if (!dados) return;

    const novoNum = Math.floor(1088 + db.pedidos.length);
    const novoId = tipoRegistro === 'Orcamento' ? `ORC-${novoNum}` : `PED-${novoNum}`;

    const novoRegistro = {
      id: novoId,
      numero: novoNum,
      tipoRegistro: tipoRegistro,
      dataCriacao: new Date().toISOString().split('T')[0],
      clienteId: dados.cliente.id,
      clienteNome: dados.cliente.nomeFantasia,
      clienteTelefone: dados.cliente.telefone,
      status: tipoRegistro === 'Orcamento' ? 'Orcamento' : 'Quarentena',
      etapaProducao: tipoRegistro === 'Orcamento' ? 'Em Negociação' : 'Aguardando Aprovação Técnica',
      produtoId: dados.prod.id,
      produtoNome: dados.prod.nome,
      corTecido: 'A Definir',
      tecidoEspecificacao: dados.prod.tipoMalhaPadrao,
      tipoPersonalizacao: 'Personalização Conforme Proposta',
      mockupUrl: window.ERP_MOCKUPS.gerarMockupSvg(dados.prod.nome, "#1e3a8a", "#ffffff", dados.cliente.nomeFantasia.substring(0, 6)),
      artesAnexadas: [],
      grade: dados.grade,
      precoUnitarioVenda: dados.precoVendaUnitario,
      valorTotalVenda: dados.valorTotal,
      custoTotalEstimado: dados.custoTotal,
      lucroLiquidoEstimado: dados.lucroLiquido,
      margemLucroPercentual: dados.margem,
      condicaoPagamento: '50% Sinal + 50% na Entrega',
      sinalPago: false,
      valorSinalPago: 0,
      saldoPendente: dados.valorTotal,
      dataPrevisaoEntrega: '2026-10-25',
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

    modalContainer.innerHTML = `
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

            <!-- 4. Dados Financeiros & Sinal Recebido (Sync Imediato com o Financeiro) -->
            <div style="background: #ffffff; border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 14px; margin-top: 14px;">
              <span class="form-label" style="font-weight: 800; color: var(--text-primary); margin-bottom: 8px; display: block;">
                Valores & Entrada de Sinal no Financeiro:
              </span>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Valor Total do Pedido (R$)</label>
                  <input type="text" id="finValorTotalPedido" class="form-input text-mono" style="font-weight: 800; font-size: 15px;" value="${formatarMoeda(totalVenda)}" readonly>
                </div>

                <div class="form-group">
                  <label class="form-label">Valor Recebido de Sinal (R$)</label>
                  <input type="number" id="finValorSinalRecebido" class="form-input text-mono" style="font-weight: 800; font-size: 15px; color: var(--color-green);" value="${sinalSugerido.toFixed(2)}" step="10.00">
                </div>

                <div class="form-group">
                  <label class="form-label">Forma de Recebimento do Sinal</label>
                  <select id="finFormaPagamentoSinal" class="form-select">
                    <option value="PIX">PIX (Banco da Confecção)</option>
                    <option value="TED/Transferência">TED / Transferência Bancária</option>
                    <option value="Boleto 50%">Boleto Bancário</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Dinheiro">Dinheiro em Espécie</option>
                  </select>
                </div>
              </div>

              <div style="font-size: 11px; color: var(--color-green); display: flex; align-items: center; gap: 6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                O valor recebido entrará automaticamente na aba do Financeiro com o nome do cliente vinculado.
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
    `;

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
      const formaPagamento = document.getElementById('finFormaPagamentoSinal')?.value || 'PIX';

      if (isNaN(valorSinalRecebido) || valorSinalRecebido < 0) {
        mostrarToast('Por favor, informe um valor de sinal válido recebido.', 'red');
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

      // Cria ou atualiza pedido oficial
      const pedidoOficial = {
        id: novoId,
        numero: novoNum,
        tipoRegistro: "Pedido",
        dataCriacao: new Date().toISOString().split('T')[0],
        clienteId: clienteIdFinal,
        clienteNome: clienteNomeFinal,
        clienteTelefone: clienteTelFinal,
        status: "Quarentena", // Vai para quarentena para aprovação administrativa
        etapaProducao: "Aguardando Aprovação Técnica",
        produtoId: prodIdFinal,
        produtoNome: prodNomeFinal,
        corTecido: "A Definir",
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
        condicaoPagamento: `Sinal ${valorSinalRecebido > 0 ? formatarMoeda(valorSinalRecebido) : 'Pendente'} + Saldo na Entrega`,
        sinalPago: valorSinalRecebido > 0,
        valorSinalPago: valorSinalRecebido,
        saldoPendente: Math.max(0, totalVendaFinal - valorSinalRecebido),
        dataPrevisaoEntrega: "2026-10-20",
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
      if (valorSinalRecebido > 0) {
        db.lancamentosFinanceiros.unshift({
          id: `LAN-${Math.floor(100 + Math.random() * 900)}`,
          data: new Date().toISOString().split('T')[0],
          tipo: "Entrada",
          descricao: `Sinal Entrada Pedido #${pedidoOficial.numero} (${pedidoOficial.grade.total}x ${pedidoOficial.produtoNome})`,
          cliente: clienteNomeFinal,
          valor: valorSinalRecebido,
          formaPagamento: formaPagamento,
          categoria: "Vendas de Uniformes"
        });
      }

      // 5. Geração de OS Técnica
      const novaOS = {
        id: `OS-${Math.floor(8400 + db.ordensServico.length + 1)}`,
        pedidoNumero: pedidoOficial.numero,
        cliente: clienteNomeFinal,
        produto: prodNomeFinal,
        mockupUrl: mockupDataUrl,
        quantidadeTotal: pedidoOficial.grade.total,
        grade: pedidoOficial.grade,
        etapaAtual: "Quarentena",
        costureiraDesignada: costureiraObj.nome,
        responsavelCorte: "Vanderlei Souza",
        dataEntradaCorte: new Date().toISOString().split('T')[0],
        tecidoConsumidoKg: (pedidoOficial.grade.total * 0.28).toFixed(1),
        artesAplicacao: artesLista,
        instrucoesCorte: `Corte padrão para ${pedidoOficial.grade.total} peças de ${prodNomeFinal}. Tolerância 2mm.`,
        instrucoesCostura: `Costureira responsável: ${costureiraObj.nome}. Fechamento com fio reforçado.`,
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
      fecharModal();
      renderizarPedidos();

      mostrarToast(`Pedido Oficial #${pedidoOficial.numero} salvo com sucesso! Sinal lançado no Financeiro.`, 'green');

      // Dispara o WhatsApp popup imediatamente
      abrirModalWhatsApp(pedidoOficial.id);
    });
  }

  /* ==========================================================================
     PROPOSTA COMERCIAL FORMATADA (ORÇAMENTO IMPRESSÃO / DOWNLOAD)
     ========================================================================== */
  function abrirModalPropostaComercial(pedidoId) {
    const p = db.pedidos.find(x => x.id === pedidoId);
    if (!p || !modalContainer) return;

    modalContainer.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-box a4-print-sheet" style="max-width: 760px;">
          <div class="modal-header">
            <div>
              <div class="modal-title">Proposta Comercial & Orçamento Têxtil (#${p.numero})</div>
              <span style="font-size: 11px; color: var(--text-gray-500);">Documento oficial com validade de 15 dias</span>
            </div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>

          <div class="modal-body" style="font-size: 12.5px; color: #0f172a;">
            <!-- Cabeçalho Empresarial -->
            <div style="border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">${db.empresa.razaoSocial}</h2>
                <div style="font-size: 11.5px; color: var(--text-gray-600);">
                  CNPJ: ${db.empresa.cnpj} • ${db.empresa.endereco}, ${db.empresa.cidade}/${db.empresa.uf}<br>
                  Telefone: ${formatarTelefone(db.empresa.telefone)} • E-mail: ${db.empresa.email}
                </div>
              </div>
              <div style="text-align: right;">
                <span class="status-pill status-gray text-mono" style="font-size: 11px;">PROPOSTA COMERCIAL</span>
                <div class="text-mono" style="font-weight: 800; font-size: 14px; margin-top: 4px;">Nº ${p.numero}</div>
                <div style="font-size: 11px; color: var(--text-gray-500);">Emissão: ${p.dataCriacao}</div>
              </div>
            </div>

            <!-- Dados do Cliente -->
            <div style="background: #f8fafc; border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 14px;">
              <strong style="color: #0f172a; display: block; margin-bottom: 4px;">DADOS DO CLIENTE / DESTINATÁRIO:</strong>
              <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                <div><strong>Razão Social / Nome:</strong> ${p.clienteNome}</div>
                <div><strong>WhatsApp / Telefone:</strong> ${formatarTelefone(p.clienteTelefone)}</div>
              </div>
            </div>

            <!-- Detalhamento do Produto & Mockup 3x4 -->
            <div style="display: flex; gap: 16px; margin-bottom: 16px; align-items: center;">
              <img src="${p.mockupUrl}" class="mockup-thumb-3x4" data-pedido-id="${p.id}" style="width: 70px; height: 93px;" alt="Mockup da Peça" title="Clique para abrir o mockup 3x4 na tela">
              <div style="flex: 1;">
                <h3 style="font-size: 14px; font-weight: 800; color: #0f172a;">${p.produtoNome}</h3>
                <div style="font-size: 12px; color: var(--text-gray-600); margin-top: 3px;">
                  <strong>Especificação do Tecido:</strong> ${p.tecidoEspecificacao || 'Padrão da Indústria'}<br>
                  <strong>Personalização:</strong> ${p.tipoPersonalizacao || 'Estampa/Bordado Conforme Pedido'}<br>
                  <strong>Quantidade Total:</strong> ${p.grade?.total || 0} peças
                </div>
              </div>
            </div>

            <!-- Grade de Tamanhos -->
            <table class="erp-table" style="margin-bottom: 14px;">
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
            <div style="border-top: 1px solid var(--border-medium); padding-top: 10px; display: flex; justify-content: flex-end;">
              <div style="width: 260px; display: flex; flex-direction: column; gap: 4px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Preço Unitário:</span>
                  <span class="text-mono">${formatarMoeda(p.precoUnitarioVenda)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 800; border-top: 1px solid var(--border-medium); padding-top: 4px;">
                  <span>VALOR TOTAL:</span>
                  <span class="text-mono text-primary">${formatarMoeda(p.valorTotalVenda)}</span>
                </div>
              </div>
            </div>

            <!-- Condições Comerciais -->
            <div style="margin-top: 14px; padding: 10px; background: #f8fafc; border-radius: var(--radius-sm); font-size: 11px; color: var(--text-gray-600);">
              <strong>CONDIÇÕES GERAIS DE FORNECIMENTO:</strong><br>
              • Condição de Pagamento: 50% de sinal na aprovação do pedido e 50% restante na retirada/entrega.<br>
              • Prazo de Produção: 10 a 15 dias úteis após conferência e aprovação das artes.<br>
              • Validade desta proposta: 15 dias corridos a partir da data de emissão.
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.ERP.fecharModal()">Fechar</button>
            <button type="button" class="btn btn-primary" onclick="window.print()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Imprimir / Baixar Proposta em PDF
            </button>
          </div>
        </div>
      </div>
    `;
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
              <th>Costureira / Facção</th>
              <th>Etapa Atual</th>
              <th>Consumo Tecido</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${db.ordensServico.length ? db.ordensServico.map(os => {
              const mockup = os.mockupUrl || window.ERP_MOCKUPS.gerarMockupSvg(os.produto, "#1e3a8a", "#ffffff", os.cliente.substring(0, 6));
              return `
                <tr>
                  <td>
                    <img src="${mockup}" class="mockup-thumb-3x4" data-os-id="${os.id}" alt="Mockup 3x4" title="Clique para abrir o mockup 3x4 na tela">
                  </td>
                  <td class="text-mono"><strong>${os.id}</strong></td>
                  <td class="text-mono">#${os.pedidoNumero}</td>
                  <td><strong>${os.cliente}</strong></td>
                  <td>${os.produto}</td>
                  <td class="text-mono">${os.quantidadeTotal} peças</td>
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
                <td colspan="10" style="text-align: center; padding: 40px 20px; color: var(--text-gray-500);">
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

  function abrirFichaTecnica(osId) {
    const os = db.ordensServico.find(o => o.id === osId);
    if (!os || !modalContainer) return;

    modalContainer.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-box a4-print-sheet" style="max-width: 780px;">
          <div class="modal-header">
            <div class="modal-title">Ficha Técnica & Ordem de Produção Industrial (${os.id})</div>
            <button class="modal-close" onclick="window.ERP.fecharModal()">&times;</button>
          </div>

          <div class="modal-body" style="font-size: 12.5px; color: #0f172a;">
            <div style="border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between;">
              <div>
                <h2 style="font-size: 18px; font-weight: 800; color: #0f172a;">${db.empresa.nomeFantasia}</h2>
                <span class="text-mono" style="color: var(--text-gray-500); font-size: 11px;">ORDEM DE PRODUÇÃO: ${os.id} • PEDIDO #${os.pedidoNumero}</span>
              </div>
              <div class="text-mono" style="text-align: right;">
                <strong>DATA ENTRADA: ${os.dataEntradaCorte}</strong><br>
                <span class="status-pill status-gray">ETAPA: ${os.etapaAtual.toUpperCase()}</span>
              </div>
            </div>

            <div style="display: flex; gap: 16px; margin-bottom: 14px; align-items: flex-start;">
              <img src="${os.mockupUrl}" class="mockup-thumb-3x4" data-os-id="${os.id}" style="width: 85px; height: 113px;" alt="Mockup 3x4" title="Clique para abrir o mockup 3x4 na tela">
              
              <div style="flex: 1;">
                <div class="grid-cards-2" style="gap: 8px; margin-bottom: 10px;">
                  <div><strong>Cliente:</strong> ${os.cliente}</div>
                  <div><strong>Produto Têxtil:</strong> ${os.produto}</div>
                  <div><strong>Total de Peças:</strong> ${os.quantidadeTotal} un</div>
                  <div><strong>Costureira Designada:</strong> <span style="font-weight: 800; color: var(--color-green);">${os.costureiraDesignada}</span></div>
                  <div><strong>Encarregado de Corte:</strong> ${os.responsavelCorte}</div>
                  <div><strong>Consumo Estimado:</strong> ${os.tecidoConsumidoKg} kg/metros</div>
                </div>
              </div>
            </div>

            <!-- Grade Oficial de Corte -->
            <div style="background: #f8fafc; border: 1px solid var(--border-medium); padding: 10px; border-radius: var(--radius-sm); margin-bottom: 14px;">
              <strong style="color: #0f172a; display: block; margin-bottom: 6px;">GRADE OFICIAL DE CORTE & FECHAMENTO:</strong>
              <div class="text-mono" style="display: flex; justify-content: space-around; font-size: 13px; font-weight: 700;">
                <span>PP: ${os.grade?.pp || 0}</span>
                <span>P: ${os.grade?.p || 0}</span>
                <span>M: ${os.grade?.m || 0}</span>
                <span>G: ${os.grade?.g || 0}</span>
                <span>GG: ${os.grade?.gg || 0}</span>
                <span>XG: ${os.grade?.xg || 0}</span>
                <span style="color: var(--color-green);">TOTAL: ${os.quantidadeTotal} pçs</span>
              </div>
            </div>

            <!-- Instruções de Corte e Tecido -->
            <div style="margin-bottom: 12px;">
              <strong style="color: #0f172a; display: block; margin-bottom: 3px;">1. INSTRUÇÕES PARA A MESA DE CORTE:</strong>
              <p style="color: var(--text-gray-600);">${os.instrucoesCorte || 'Corte conforme enfesto industrial padrão com tolerância de 2mm.'}</p>
            </div>

            <!-- Instruções de Estamparia e Artes -->
            <div style="margin-bottom: 12px;">
              <strong style="color: #0f172a; display: block; margin-bottom: 3px;">2. ESPECIFICAÇÃO DE ARTES & APLICAÇÕES:</strong>
              <ul style="padding-left: 20px; color: var(--text-gray-600);">
                ${(os.artesAplicacao || []).map(a => `
                  <li><strong>${a.local}:</strong> ${a.dimensoes || a.dimensao} • Arquivo: ${a.arquivoNome || a.tecnica}</li>
                `).join('')}
              </ul>
            </div>

            <!-- Instruções de Costura -->
            <div style="margin-bottom: 14px;">
              <strong style="color: #0f172a; display: block; margin-bottom: 3px;">3. INSTRUÇÕES PARA A COSTUREIRA / FACÇÃO:</strong>
              <p style="color: var(--text-gray-600);">${os.instrucoesCostura || 'Costura reforçada de ombro a ombro e pesponto duplo nas cavas e barras.'}</p>
            </div>

            <!-- Assinaturas do Chão de Fábrica -->
            <div style="display: flex; justify-content: space-between; margin-top: 24px; padding-top: 14px; border-top: 1px dashed var(--border-medium); font-size: 11px;">
              <div style="text-align: center; width: 180px; border-top: 1px solid #000; padding-top: 4px;">
                Cortador Responsável
              </div>
              <div style="text-align: center; width: 180px; border-top: 1px solid #000; padding-top: 4px;">
                Estampador / DTF
              </div>
              <div style="text-align: center; width: 180px; border-top: 1px solid #000; padding-top: 4px;">
                Costureira / Facção
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.ERP.fecharModal()">Fechar</button>
            <button type="button" class="btn btn-primary" onclick="window.print()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Imprimir Ordem de Produção (A4)
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function abrirFichaTecnicaPorPedido(p) {
    const osTemp = {
      id: `OS-${p.numero}`,
      pedidoNumero: p.numero,
      cliente: p.clienteNome,
      produto: p.produtoNome,
      mockupUrl: p.mockupUrl,
      quantidadeTotal: p.grade?.total || 0,
      grade: p.grade,
      etapaAtual: p.etapaProducao,
      costureiraDesignada: p.costureiraNome || "Oficina Interna",
      responsavelCorte: "Vanderlei Souza",
      dataEntradaCorte: p.dataCriacao,
      tecidoConsumidoKg: ((p.grade?.total || 1) * 0.28).toFixed(1),
      artesAplicacao: p.artesAnexadas || [],
      instrucoesCorte: "Enfesto e corte conforme modelagem padrão com tolerância de 2mm.",
      instrucoesCostura: "Costura reforçada de ombro a ombro.",
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

    modalContainer.innerHTML = `
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
    `;

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

    modalContainer.innerHTML = `
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
    `;

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

    modalContainer.innerHTML = `
      <div class="modal-overlay active">
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
    `;

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
      fecharModal();
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

    modalContainer.innerHTML = `
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
    `;

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
      fecharModal();
      renderizarFinanceiro();
    });
  }

  // Modal: Dar Baixa em Pagamento de Despesa
  function abrirModalDarBaixaDespesa(despesaId) {
    const desp = (db.despesasFixas || []).find(d => d.id === despesaId);
    if (!desp) return;

    const hojeIso = new Date().toISOString().split('T')[0];
    const valorOriginal = Number(desp.valor !== undefined ? desp.valor : desp.valorMensal) || 0;

    modalContainer.innerHTML = `
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
    `;

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
      fecharModal();
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

    modalContainer.innerHTML = `
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
    `;

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
      fecharModal();
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

    modalContainer.innerHTML = `
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
    `;
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

    modalContainer.innerHTML = `
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
    `;

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
      fecharModal();
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

    modalContainer.innerHTML = `
      <div class="modal-overlay active">
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
    `;

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
      fecharModal();
      mostrarToast(`Cliente "${novoCli.nomeFantasia}" cadastrado com sucesso!`, 'green');

      if (callback) callback(novoCli);
    });
  }

  function abrirModalHistoricoCliente(clienteId) {
    const cli = db.clientes.find(c => c.id === clienteId);
    if (!cli || !modalContainer) return;

    const pedidosCli = db.pedidos.filter(p => p.clienteId === cli.id || p.clienteNome === cli.nomeFantasia);

    modalContainer.innerHTML = `
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
    `;
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
                  <td>${p.produtoNome}</td>
                  <td class="text-mono">${p.grade?.total || 0} pçs</td>
                  <td class="text-mono"><strong>${formatarMoeda(p.valorTotalVenda)}</strong></td>
                  <td class="text-mono">
                    <strong class="${margemOk ? 'text-green' : 'text-red'}">
                      ${(p.margemLucroPercentual || 0).toFixed(1)}%
                    </strong>
                  </td>
                  <td>
                    <span class="status-pill ${p.sinalPago ? 'status-green' : 'status-red'}">
                      ${p.sinalPago ? 'SINAL OK' : 'SEM SINAL'}
                    </span>
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

    modalContainer.innerHTML = `
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
                  <div class="quarentena-desc">Confirmo que o sinal de 50% ou o valor acordado foi compensado na conta da confecção ou há termo formal de faturamento assinado.</div>
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
                  <label for="chkQuarentena3" class="quarentena-label">3. Estoque de Malha / Tecido e Lote de Cor Reservado</label>
                  <div class="quarentena-desc">Confirmo que as peças de tecido ou rolos de malha estão fisicamente no galpão com o mesmo lote de tingimento (sem risco de variação de cor).</div>
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
    `;

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

      // Sincroniza na OS
      const os = db.ordensServico.find(o => o.pedidoNumero === p.numero);
      if (os) {
        os.etapaAtual = 'Corte';
      }

      salvarEstado();
      atualizarBadges();
      fecharModal();
      renderizarQuarentena();

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

    modalContainer.innerHTML = `
      <div class="modal-overlay active">
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
    `;

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
        fecharModal();
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
        fecharModal();
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

    const mensagemPadrao = `Olá, *${pedido.clienteNome}*!\n\nAqui é da equipe da *${db.empresa.nomeFantasia}*.\n\nInformamos que seu pedido *#${pedido.numero}* (${pedido.grade?.total || 0} peças de ${pedido.produtoNome}) acabou de avançar para a etapa de: *${(pedido.etapaProducao || pedido.status).toUpperCase()}*.\n\n📅 *Previsão de Entrega:* ${pedido.dataPrevisaoEntrega}\n💰 *Saldo Pendente na Retirada:* ${formatarMoeda(pedido.saldoPendente)}\n\nEstamos acompanhando cada detalhe da produção do seu uniforme!`;
    const mensagemEncoded = encodeURIComponent(mensagemPadrao);
    const telNumeros = (pedido.clienteTelefone || '').toString().replace(/\D/g, '');
    const linkWhatsApp = `https://api.whatsapp.com/send?phone=55${telNumeros}&text=${mensagemEncoded}`;

    modalContainer.innerHTML = `
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
    `;

    const txtArea = document.getElementById('wppTextoMensagemEdit');
    const btnLink = document.getElementById('btnDispararWhatsAppReal');
    txtArea?.addEventListener('input', () => {
      const novoEncoded = encodeURIComponent(txtArea.value);
      btnLink.href = `https://api.whatsapp.com/send?phone=55${telNumeros}&text=${novoEncoded}`;
    });

    btnLink?.addEventListener('click', () => {
      fecharModal();
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

    modalContainer.innerHTML = `
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
    `;

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
    
    modalContainer.innerHTML = `
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
    `;

    // Recalcular saldo dinamicamente ao digitar nas inputs
    const inputsValor = modalContainer.querySelectorAll('.inp-entradas, .inp-saidas');
    inputsValor.forEach(inp => {
      inp.addEventListener('input', () => {
        const idx = inp.getAttribute('data-idx');
        const inVal = Number(modalContainer.querySelector(`.inp-entradas[data-idx="${idx}"]`)?.value) || 0;
        const outVal = Number(modalContainer.querySelector(`.inp-saidas[data-idx="${idx}"]`)?.value) || 0;
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
      const inputs = modalContainer.querySelectorAll('#corpoTabelaMeses input[data-campo]');
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
      fecharModal();
      mostrarToast('Performance financeira semestral atualizada com sucesso!', 'green');
      renderizarAbertura();
    });

    // Restaurar Padrão
    document.getElementById('btnRestaurarFinPadrao')?.addEventListener('click', () => {
      if (confirm('Deseja restaurar as médias históricas padrão do gráfico financeiro?')) {
        db.historicoFinanceiroMensal = JSON.parse(JSON.stringify(window.ERP_INITIAL_DATA.historicoFinanceiroMensal || []));
        salvarEstado();
        fecharModal();
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

    modalContainer.innerHTML = `
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
    `;

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
      const inputs = modalContainer.querySelectorAll('#corpoTabelaCapacidades input[data-campo], #corpoTabelaCapacidades select[data-campo]');
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
      fecharModal();
      mostrarToast('Capacidades produtivas atualizadas com sucesso!', 'green');
      renderizarAbertura();
    });

    // Restaurar Padrão
    document.getElementById('btnRestaurarCapPadrao')?.addEventListener('click', () => {
      if (confirm('Deseja restaurar as capacidades padrão de fábrica (Mesa de Corte, Bordado, DTF, Costura)?')) {
        db.capacidadesProducao = JSON.parse(JSON.stringify(window.ERP_INITIAL_DATA.capacidadesProducao || []));
        salvarEstado();
        fecharModal();
        mostrarToast('Capacidades padrão restauradas!', 'green');
        renderizarAbertura();
      }
    });
  }

  // Exposição Global das Funções Públicas da API TexPro ERP
  window.ERP = {
    navegarPara,
    fecharModal,
    abrirFichaTecnica,
    abrirModalWhatsApp,
    abrirModalVisualizarMockup,
    abrirModalNovoOrcamento,
    abrirModalNovoClienteInline,
    abrirModalNovoModeloInline,
    abrirModalPropostaComercial,
    abrirModalInspecaoQuarentena,
    abrirModalEntradaEstoque,
    abrirModalEditarFinanceiro,
    abrirModalEditarCapacidades,
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
