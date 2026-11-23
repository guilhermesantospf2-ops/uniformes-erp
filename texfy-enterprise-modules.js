(function () {
  'use strict';

  // ============================================================================
  // TEXFY ENTERPRISE MODULES (Têxtil & Gestão Avançada)
  // 1. Controle de Facções / Terceirizados (Lote, Grade, Prazo, 1a/2a Qualidade, Financeiro)
  // 2. Explosão de Matéria-Prima / MRP Têxtil (Consumo Tecido/Aviamentos vs Estoque)
  // 3. Régua de Cobrança (Parcelas + WhatsApp) & Comissão de Vendedores
  // 4. Importação de XML NF-e de Compra (Entrada Estoque + Conta a Pagar)
  // 5. Fechamento Mensal do Contador (ZIP XMLs + CSV Excel)
  // 6. Curva ABC (Clientes & Produtos) + Log de Auditoria
  // 7. Checklist de Onboarding ("Primeiros Passos")
  // ============================================================================

  function getERP() {
    return window.ERP || {};
  }

  function getDb() {
    const ERP = getERP();
    return typeof ERP.obterDb === 'function' ? ERP.obterDb() : ERP.db;
  }

  function saveDb() {
    const ERP = getERP();
    if (typeof ERP.salvarEstado === 'function') ERP.salvarEstado(true);
    if (typeof ERP.atualizarBadges === 'function') ERP.atualizarBadges();
  }

  function fmtMoeda(v) {
    const ERP = getERP();
    if (typeof ERP.formatarMoeda === 'function') return ERP.formatarMoeda(v);
    return (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function toast(msg, cor = 'green') {
    const ERP = getERP();
    if (typeof ERP.mostrarToast === 'function') ERP.mostrarToast(msg, cor);
    else alert(msg);
  }

  function registrarAuditoria(acao, modulo, detalhe) {
    const db = getDb();
    if (!db) return;
    if (!Array.isArray(db.auditLogs)) db.auditLogs = [];
    let usuario = 'Sistema';
    let perfil = 'Admin';
    try {
      const u = window.ERP_CLOUD?.obterUsuarioLogado?.();
      const p = window.ERP_CLOUD?.obterPerfilAtivo?.();
      if (u) usuario = u.user_metadata?.full_name || u.email || 'Usuário';
      else if (window.location.pathname.includes('demo')) usuario = 'Showroom Demo';
      if (p) perfil = p.nome || p.cargo || 'Admin';
    } catch (_) {}

    db.auditLogs.unshift({
      id: 'aud_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      dataIso: new Date().toISOString(),
      usuario,
      perfil,
      modulo,
      acao,
      detalhe
    });
    if (db.auditLogs.length > 300) db.auditLogs.length = 300;
  }

  function getQtdPecasPedido(p) {
    if (!p) return 1;
    const direta = Number(p.quantidadeTotal || p.grade?.total || 0);
    if (direta > 0) return direta;
    if (Array.isArray(p.itens) && p.itens.length > 0) {
      const s = p.itens.reduce((acc, it) => acc + (Number(it.grade?.total || it.quantidade || 0)), 0);
      if (s > 0) return s;
    }
    return 1;
  }

  // ============================================================================
  // 1 & 2. FACÇÕES / TERCEIRIZADOS + EXPLOSÃO DE MATÉRIA-PRIMA (MRP TÊXTIL)
  // ============================================================================
  let subAbaFaccoes = 'remessas'; // 'remessas' | 'mrp'

  function renderizarFaccoesMrp() {
    const contentArea = document.getElementById('contentArea');
    if (!contentArea) return;
    const db = getDb();
    if (!db) return;
    if (!Array.isArray(db.remessasFaccao)) db.remessasFaccao = [];
    if (!Array.isArray(db.fichaTecnicaMrp)) db.fichaTecnicaMrp = [];

    const hoje = new Date().toISOString().slice(0, 10);
    const emOficina = db.remessasFaccao.filter(r => r.status === 'Em Facção');
    const atrasadas = emOficina.filter(r => r.prazoRetorno && r.prazoRetorno < hoje);
    const concluidas = db.remessasFaccao.filter(r => r.status === 'Conferido');
    const totalPecasFora = emOficina.reduce((s, r) => s + (Number(r.qtdEnviada) || 0), 0);
    const totalPagarFaccoes = concluidas.reduce((s, r) => s + (Number(r.valorTotalAcerto) || 0), 0);

    const pedidosAtivos = (db.pedidos || []).filter(p => p.status !== 'Cancelado');
    const prestadores = (typeof getERP().obterListaPrestadoresDisponiveis === 'function')
      ? getERP().obterListaPrestadoresDisponiveis()
      : (db.prestadores || []);

    contentArea.innerHTML = `
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 18px;">
        <div>
          <h1 class="page-title" style="display: flex; align-items: center; gap: 8px;">
            <span>🏭</span> Facções / Terceirizados & MRP Têxtil
          </h1>
          <p class="page-subtitle">Controle de lotes enviados para oficinas externas (1ª/2ª qualidade + Financeiro) e explosão de consumo de tecido/aviamentos.</p>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-sm ${subAbaFaccoes === 'remessas' ? 'btn-primary' : 'btn-secondary'}" id="btnSubAbaRemessas" style="font-weight: 700;">
            ✂️ Remessas & Facções (${db.remessasFaccao.length})
          </button>
          <button class="btn btn-sm ${subAbaFaccoes === 'mrp' ? 'btn-primary' : 'btn-secondary'}" id="btnSubAbaMrp" style="font-weight: 700;">
            🧵 Explosão de Matéria-Prima (MRP)
          </button>
          <button class="btn btn-primary btn-sm" id="btnNovaRemessaFaccao" style="background: #0f172a; border-color: #0f172a; font-weight: 800;">
            + Enviar Lote p/ Facção
          </button>
        </div>
      </div>

      ${subAbaFaccoes === 'remessas' ? `
        <div class="kpi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-bottom: 18px;">
          <div class="kpi-card">
            <div class="kpi-label">Lotes na Rua (Em Facção)</div>
            <div class="kpi-value" style="color: #2563eb;">${emOficina.length} <span style="font-size: 12px; font-weight: 600;">(${totalPecasFora} pçs)</span></div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Facções Atrasadas</div>
            <div class="kpi-value" style="color: ${atrasadas.length > 0 ? '#dc2626' : '#16a34a'};">${atrasadas.length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Lotes Conferidos</div>
            <div class="kpi-value" style="color: #16a34a;">${concluidas.length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Total Acertado (Financeiro)</div>
            <div class="kpi-value text-mono" style="color: #0f172a;">${fmtMoeda(totalPagarFaccoes)}</div>
          </div>
        </div>

        <div class="card" style="padding: 0; overflow: hidden;">
          <div class="table-wrapper" style="margin: 0;">
            <table class="erp-table">
              <thead>
                <tr>
                  <th>Lote / Pedido</th>
                  <th>Facção / Oficina</th>
                  <th>Serviço & Prazo</th>
                  <th>Enviado vs Retorno</th>
                  <th>Valor Acerto</th>
                  <th style="text-align: right;">Ações</th>
                </tr>
              </thead>
              <tbody>
                ${db.remessasFaccao.length === 0 ? `
                  <tr>
                    <td colspan="6" style="text-align: center; padding: 36px; color: #64748b;">
                      Nenhuma remessa enviada para facção ainda. Clique em <strong>+ Enviar Lote p/ Facção</strong> para gerar o romaneio de saída.
                    </td>
                  </tr>
                ` : db.remessasFaccao.map(r => {
                  const atrasado = r.status === 'Em Facção' && r.prazoRetorno && r.prazoRetorno < hoje;
                  return `
                    <tr>
                      <td>
                        <strong class="text-mono">${r.codigoLote}</strong>
                        <div style="font-size: 11px; color: #64748b;">Pedido #${r.pedidoNumero} • ${r.clienteNome || ''}</div>
                      </td>
                      <td>
                        <strong>${r.faccaoNome}</strong>
                        <div style="font-size: 11px; color: #64748b;">${r.modeloNome || 'Uniforme'}</div>
                      </td>
                      <td>
                        <span style="background: #f1f5f9; padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: 700;">${r.etapaServico}</span>
                        <div style="font-size: 11px; margin-top: 3px; color: ${atrasado ? '#dc2626' : '#64748b'}; font-weight: ${atrasado ? '800' : '500'};">
                          Prazo: ${r.prazoRetorno ? r.prazoRetorno.split('-').reverse().join('/') : '-'} ${atrasado ? '⚠️ ATRASADO' : ''}
                        </div>
                      </td>
                      <td class="text-mono" style="font-size: 12px;">
                        <div>Enviado: <strong>${r.qtdEnviada}</strong> pçs</div>
                        ${r.status === 'Conferido' ? `
                          <div style="font-size: 11px; color: #16a34a;">1ª Qual.: <strong>${r.qtd1Qualidade}</strong> • 2ª/Def.: <strong style="color:#dc2626;">${r.qtd2Qualidade || 0}</strong></div>
                        ` : `<div style="font-size: 11px; color: #d97706;">Aguardando retorno</div>`}
                      </td>
                      <td class="text-mono">
                        <strong>${fmtMoeda(r.status === 'Conferido' ? r.valorTotalAcerto : (r.qtdEnviada * r.valorPorPeca))}</strong>
                        <div style="font-size: 10.5px; color: #64748b;">${fmtMoeda(r.valorPorPeca)}/pç</div>
                      </td>
                      <td style="text-align: right; white-space: nowrap;">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="window.ERP.imprimirRomaneioFaccao('${r.id}')" style="font-size: 11px; padding: 4px 8px;">🖨️ Romaneio</button>
                        ${r.status === 'Em Facção'
                          ? `<button type="button" class="btn btn-primary btn-sm" onclick="window.ERP.abrirModalConferirRetornoFaccao('${r.id}')" style="font-size: 11px; padding: 4px 8px; background: #16a34a; border-color: #16a34a;">✅ Conferir Retorno</button>`
                          : `<span style="font-size: 11px; font-weight: 800; color: #166534; background: #dcfce7; padding: 4px 8px; border-radius: 6px;">✔ Acertado</span>`
                        }
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : renderHtmlMrpTextil(db, pedidosAtivos)}
    `;

    contentArea.querySelector('#btnSubAbaRemessas')?.addEventListener('click', () => { subAbaFaccoes = 'remessas'; renderizarFaccoesMrp(); });
    contentArea.querySelector('#btnSubAbaMrp')?.addEventListener('click', () => { subAbaFaccoes = 'mrp'; renderizarFaccoesMrp(); });
    contentArea.querySelector('#btnNovaRemessaFaccao')?.addEventListener('click', () => abrirModalNovaRemessaFaccao(prestadores, pedidosAtivos));

    if (subAbaFaccoes === 'mrp') {
      bindEventsMrpTextil(contentArea, db, pedidosAtivos);
    }
  }

  let mrpPedidoIdSel = '';
  let mrpPerdaPct = 5;

  function renderHtmlMrpTextil(db, pedidosAtivos) {
    if (!mrpPedidoIdSel && pedidosAtivos.length > 0) mrpPedidoIdSel = pedidosAtivos[0].id;
    const p = pedidosAtivos.find(x => x.id === mrpPedidoIdSel) || pedidosAtivos[0];
    const qtdPecas = getQtdPecasPedido(p);
    const fatorPerda = 1 + (Number(mrpPerdaPct) / 100);

    // Consumo padrão têxtil estimado (ou ficha salva no produto)
    const itensConsumo = [
      { nome: 'Malha / Tecido Principal (kg)', tipo: 'Tecido', consumoUnit: 0.28, un: 'KG' },
      { nome: 'Gola / Punho Retilínea (un)', tipo: 'Aviamento', consumoUnit: 1, un: 'UN' },
      { nome: 'Linha / Fio Overlock e Reta (cones)', tipo: 'Aviamento', consumoUnit: 0.02, un: 'UN' },
      { nome: 'Etiqueta Composição + Marca (un)', tipo: 'Aviamento', consumoUnit: 2, un: 'UN' },
      { nome: 'Embalagem Individual Saco PP (un)', tipo: 'Embalagem', consumoUnit: 1, un: 'UN' }
    ];

    const estoqueArr = Array.isArray(db.estoque) ? db.estoque : (Array.isArray(db.insumos) ? db.insumos : []);

    const linhas = itensConsumo.map(ic => {
      const necBruta = Number((qtdPecas * ic.consumoUnit * fatorPerda).toFixed(2));
      const matchEst = estoqueArr.find(e => {
        const n = String(e.nome || e.item || e.descricao || '').toLowerCase();
        const kw = ic.tipo === 'Tecido' ? 'malha' : ic.nome.split(' ')[0].toLowerCase();
        return n.includes(kw) || n.includes(ic.tipo.toLowerCase());
      });
      const saldoAtual = Number(matchEst?.quantidade ?? matchEst?.saldo ?? 0);
      const falta = Math.max(0, Number((necBruta - saldoAtual).toFixed(2)));
      return { ...ic, necBruta, saldoAtual, falta };
    });

    const faltantes = linhas.filter(l => l.falta > 0);

    return `
      <div class="card" style="padding: 16px; margin-bottom: 16px;">
        <div style="display: grid; grid-template-columns: 2fr 0.8fr 1.2fr; gap: 12px; align-items: end;">
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Selecionar Pedido para Explosão de Matéria-Prima (MRP)</label>
            <select id="mrpSelectPedido" class="form-select font-bold">
              ${pedidosAtivos.length === 0 ? '<option value="">Nenhum pedido ativo</option>' : pedidosAtivos.map(ped => `
                <option value="${ped.id}" ${p?.id === ped.id ? 'selected' : ''}>Pedido #${ped.numero} — ${ped.clienteNome} (${getQtdPecasPedido(ped)} peças)</option>
              `).join('')}
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">% Quebra / Perda Corte</label>
            <input type="number" id="mrpInputPerda" class="form-input text-mono" min="0" max="30" step="1" value="${mrpPerdaPct}">
          </div>
          <div>
            <button type="button" class="btn btn-primary btn-sm" id="btnGerarCompraMrp" ${faltantes.length === 0 ? 'disabled' : ''} style="width: 100%; font-weight: 800; background: ${faltantes.length > 0 ? '#dc2626' : '#94a3b8'}; border-color: ${faltantes.length > 0 ? '#dc2626' : '#94a3b8'};">
              🛒 Gerar Compra dos Faltantes (${faltantes.length})
            </button>
          </div>
        </div>
      </div>

      <div class="card" style="padding: 0; overflow: hidden;">
        <div class="table-wrapper" style="margin: 0;">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Matéria-Prima / Insumo</th>
                <th>Consumo p/ Peça</th>
                <th>Necessidade Total (${qtdPecas} pçs + ${mrpPerdaPct}%)</th>
                <th>Saldo no Estoque</th>
                <th>Situação / Falta Comprar</th>
              </tr>
            </thead>
            <tbody>
              ${linhas.map(l => `
                <tr>
                  <td><strong>${l.nome}</strong></td>
                  <td class="text-mono">${l.consumoUnit} ${l.un}</td>
                  <td class="text-mono" style="font-weight: 800;">${l.necBruta} ${l.un}</td>
                  <td class="text-mono">${l.saldoAtual} ${l.un}</td>
                  <td>
                    ${l.falta > 0
                      ? `<span style="background: #fee2e2; color: #b91c1c; padding: 3px 8px; border-radius: 99px; font-size: 11px; font-weight: 800;">⚠️ Falta ${l.falta} ${l.un}</span>`
                      : `<span style="background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 99px; font-size: 11px; font-weight: 800;">✅ Estoque Suficiente</span>`
                    }
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function bindEventsMrpTextil(contentArea, db, pedidosAtivos) {
    contentArea.querySelector('#mrpSelectPedido')?.addEventListener('change', (e) => {
      mrpPedidoIdSel = e.target.value;
      renderizarFaccoesMrp();
    });
    contentArea.querySelector('#mrpInputPerda')?.addEventListener('change', (e) => {
      mrpPerdaPct = parseFloat(e.target.value) || 0;
      renderizarFaccoesMrp();
    });
    contentArea.querySelector('#btnGerarCompraMrp')?.addEventListener('click', () => {
      const p = pedidosAtivos.find(x => x.id === mrpPedidoIdSel);
      if (!p) return;
      if (!Array.isArray(db.compras)) db.compras = [];
      db.compras.unshift({
        id: 'comp_mrp_' + Date.now(),
        data: new Date().toISOString().slice(0, 10),
        fornecedor: 'Reposição Automática MRP',
        descricao: `Insumos MRP Pedido #${p.numero} (${getQtdPecasPedido(p)} pçs + ${mrpPerdaPct}% perda)`,
        status: 'Pendente',
        valorTotal: 0,
        origem: 'MRP Têxtil'
      });
      registrarAuditoria('Ordem de Compra MRP', 'MRP Têxtil', `Gerada solicitação de compra de insumos faltantes para Pedido #${p.numero}`);
      saveDb();
      toast(`Solicitação de compra gerada na aba Compras para o Pedido #${p.numero}!`, 'green');
    });
  }

  function abrirModalNovaRemessaFaccao(prestadores, pedidosAtivos) {
    const ERP = getERP();
    const hoje = new Date().toISOString().slice(0, 10);
    const prazoPadrao = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);

    const modalEl = ERP.criarModalCamada(`
      <div class="modal-overlay active">
        <div class="modal-box" style="max-width: 680px; width: 95vw;">
          <div class="modal-header" style="background: #0f172a; color: #fff;">
            <div class="modal-title" style="color: #fff;">✂️ Enviar Lote / Corte para Facção Externa</div>
            <button class="modal-close" onclick="window.ERP.fecharModal()" style="color: #fff;">&times;</button>
          </div>
          <div class="modal-body" style="padding: 16px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">Pedido / Corte *</label>
                <select id="facSelPedido" class="form-select font-bold">
                  ${pedidosAtivos.map(p => `<option value="${p.id}">#${p.numero} — ${p.clienteNome} (${getQtdPecasPedido(p)} pçs)</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">Facção / Oficina Externa *</label>
                <input type="text" id="facInputNome" list="listaFaccoesDatalist" class="form-input font-bold" placeholder="Digite ou escolha a facção...">
                <datalist id="listaFaccoesDatalist">
                  ${prestadores.map(pr => `<option value="${pr.nome || pr.razaoSocial || ''}">`).join('')}
                </datalist>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px;">
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">Serviço</label>
                <select id="facSelEtapa" class="form-select">
                  <option value="Costura">Costura</option>
                  <option value="Estamparia / DTF">Estamparia / DTF</option>
                  <option value="Bordado">Bordado</option>
                  <option value="Acabamento">Acabamento</option>
                </select>
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">Qtd Peças Enviadas *</label>
                <input type="number" id="facQtdEnv" class="form-input text-mono font-bold" min="1" value="${pedidosAtivos[0] ? getQtdPecasPedido(pedidosAtivos[0]) : 1}">
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">Valor / Peça (R$) *</label>
                <input type="number" id="facValPeca" class="form-input text-mono" step="0.01" min="0" value="4.50">
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">Prazo Retorno *</label>
                <input type="date" id="facPrazo" class="form-input text-mono" value="${prazoPadrao}">
              </div>
            </div>
          </div>
          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="window.ERP.fecharModal()">Cancelar</button>
            <button class="btn btn-primary btn-sm" id="btnSalvarRemessaFaccao" style="font-weight: 800;">💾 Registrar Saída & Gerar Romaneio</button>
          </div>
        </div>
      </div>
    `);
    if (!modalEl) return;

    modalEl.querySelector('#facSelPedido')?.addEventListener('change', (e) => {
      const ped = pedidosAtivos.find(x => x.id === e.target.value);
      if (ped) modalEl.querySelector('#facQtdEnv').value = getQtdPecasPedido(ped);
    });

    modalEl.querySelector('#btnSalvarRemessaFaccao')?.addEventListener('click', () => {
      const db = getDb();
      const pedId = modalEl.querySelector('#facSelPedido').value;
      const ped = pedidosAtivos.find(x => x.id === pedId);
      const facNome = modalEl.querySelector('#facInputNome').value.trim();
      const qtdEnv = parseInt(modalEl.querySelector('#facQtdEnv').value, 10) || 0;
      const valPeca = parseFloat(modalEl.querySelector('#facValPeca').value) || 0;
      if (!facNome) return alert('Informe o nome da Facção / Oficina.');
      if (qtdEnv < 1) return alert('Informe a quantidade de peças enviadas.');

      if (!Array.isArray(db.remessasFaccao)) db.remessasFaccao = [];
      const lote = `LOT-${String(db.remessasFaccao.length + 1).padStart(3, '0')}`;
      db.remessasFaccao.unshift({
        id: 'fac_' + Date.now(),
        codigoLote: lote,
        pedidoId: ped?.id || '',
        pedidoNumero: ped?.numero || '-',
        clienteNome: ped?.clienteNome || '',
        modeloNome: ped?.produtoNome || ped?.itens?.[0]?.produtoNome || 'Uniforme',
        faccaoNome: facNome,
        etapaServico: modalEl.querySelector('#facSelEtapa').value,
        dataEnvio: hoje,
        prazoRetorno: modalEl.querySelector('#facPrazo').value,
        qtdEnviada: qtdEnv,
        valorPorPeca: valPeca,
        status: 'Em Facção'
      });

      registrarAuditoria('Envio para Facção', 'Facções', `Lote ${lote} (${qtdEnv} pçs, Pedido #${ped?.numero}) enviado para ${facNome}`);
      saveDb();
      ERP.fecharModal(modalEl);
      toast(`Remessa ${lote} registrada para ${facNome}!`, 'green');
      renderizarFaccoesMrp();
    });
  }

  function abrirModalConferirRetornoFaccao(remessaId) {
    const db = getDb();
    const ERP = getERP();
    const r = (db.remessasFaccao || []).find(x => x.id === remessaId);
    if (!r) return;

    const modalEl = ERP.criarModalCamada(`
      <div class="modal-overlay active">
        <div class="modal-box" style="max-width: 520px; width: 95vw;">
          <div class="modal-header" style="background: #0f172a; color: #fff;">
            <div class="modal-title" style="color: #fff;">✅ Conferir Retorno — ${r.codigoLote}</div>
            <button class="modal-close" onclick="window.ERP.fecharModal()" style="color: #fff;">&times;</button>
          </div>
          <div class="modal-body" style="padding: 16px;">
            <p style="font-size: 12px; color: #475569; margin-bottom: 12px;">
              Facção: <strong>${r.faccaoNome}</strong> • Enviado: <strong>${r.qtdEnviada} peças</strong> (${fmtMoeda(r.valorPorPeca)}/pç)
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div class="form-group">
                <label class="form-label">1ª Qualidade (Aprovadas) *</label>
                <input type="number" id="retQtd1" class="form-input text-mono font-bold" min="0" max="${r.qtdEnviada}" value="${r.qtdEnviada}">
              </div>
              <div class="form-group">
                <label class="form-label">2ª Qualidade / Defeito</label>
                <input type="number" id="retQtd2" class="form-input text-mono" min="0" value="0">
              </div>
            </div>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px; font-size: 12px;">
              Valor a lançar no Financeiro (Contas a Pagar): <strong id="lblAcertoFaccao">${fmtMoeda(r.qtdEnviada * r.valorPorPeca)}</strong>
            </div>
          </div>
          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="window.ERP.fecharModal()">Cancelar</button>
            <button class="btn btn-primary btn-sm" id="btnConfirmarRetornoFaccao" style="background: #16a34a; border-color: #16a34a; font-weight: 800;">💰 Confirmar & Lançar no Financeiro</button>
          </div>
        </div>
      </div>
    `);
    if (!modalEl) return;

    modalEl.querySelector('#retQtd1')?.addEventListener('input', (e) => {
      const q1 = parseInt(e.target.value, 10) || 0;
      modalEl.querySelector('#lblAcertoFaccao').textContent = fmtMoeda(q1 * r.valorPorPeca);
    });

    modalEl.querySelector('#btnConfirmarRetornoFaccao')?.addEventListener('click', () => {
      const q1 = parseInt(modalEl.querySelector('#retQtd1').value, 10) || 0;
      const q2 = parseInt(modalEl.querySelector('#retQtd2').value, 10) || 0;
      const totalAcerto = Number((q1 * r.valorPorPeca).toFixed(2));
      const hoje = new Date().toISOString().slice(0, 10);

      r.qtd1Qualidade = q1;
      r.qtd2Qualidade = q2;
      r.valorTotalAcerto = totalAcerto;
      r.dataRetorno = hoje;
      r.status = 'Conferido';

      if (totalAcerto > 0) {
        if (!Array.isArray(db.despesasFixas)) db.despesasFixas = [];
        if (!Array.isArray(db.lancamentosFinanceiros)) db.lancamentosFinanceiros = [];
        const idD = 'desp_fac_' + r.id;
        db.despesasFixas.push({
          id: idD,
          pedidoNumero: r.pedidoNumero,
          pedidoId: r.pedidoId,
          origemAutomatica: true,
          origem: `Facção ${r.codigoLote}`,
          tipoCusto: 'Variável',
          descricao: `Acerto Facção ${r.faccaoNome} • ${r.codigoLote} (${q1} pçs aprovadas)`,
          categoria: 'Serviços de Facção / Terceirizados',
          centroCusto: 'CC-02',
          fornecedorFavorecido: r.faccaoNome,
          valor: totalAcerto,
          valorMensal: totalAcerto,
          dataVencimento: hoje,
          recorrencia: 'Única',
          formaPagamentoPrevista: 'PIX / Transferência',
          status: 'Pendente'
        });
        db.lancamentosFinanceiros.push({
          id: 'lan_fac_' + r.id,
          despesaId: idD,
          pedidoId: r.pedidoId,
          tipo: 'Saida',
          descricao: `Acerto Facção ${r.faccaoNome} (${r.codigoLote})`,
          categoria: 'Serviços de Facção / Terceirizados',
          centroCusto: 'CC-02',
          valor: totalAcerto,
          data: hoje,
          status: 'Pendente',
          origem: 'Facções'
        });
      }

      registrarAuditoria('Retorno de Facção', 'Facções', `Conferido ${r.codigoLote}: ${q1} aprovadas, ${q2} defeito. Acerto: ${fmtMoeda(totalAcerto)}`);
      saveDb();
      ERP.fecharModal(modalEl);
      toast(`Retorno conferido! Conta a pagar de ${fmtMoeda(totalAcerto)} lançada no Financeiro.`, 'green');
      renderizarFaccoesMrp();
    });
  }

  function imprimirRomaneioFaccao(remessaId) {
    const db = getDb();
    const r = (db.remessasFaccao || []).find(x => x.id === remessaId);
    if (!r) return;
    const win = window.open('', '_blank', 'width=720,height=640');
    if (win) {
      win.document.write(`
        <html><head><title>Romaneio ${r.codigoLote}</title>
        <style>body{font-family:Arial,sans-serif;padding:24px;}h2{margin:0 0 8px;}table{width:100%;border-collapse:collapse;margin-top:16px;}th,td{border:1px solid #000;padding:8px;text-align:left;}</style>
        </head><body>
        <h2>ROMANEIO DE REMESSA PARA FACÇÃO — ${r.codigoLote}</h2>
        <p><strong>Empresa:</strong> ${db.empresa?.nomeFantasia || 'Texfy Confecções'} | <strong>Data Envio:</strong> ${r.dataEnvio} | <strong>Prazo Retorno:</strong> ${r.prazoRetorno}</p>
        <p><strong>Facção / Oficina:</strong> ${r.faccaoNome} | <strong>Serviço:</strong> ${r.etapaServico}</p>
        <table>
          <thead><tr><th>Pedido</th><th>Cliente</th><th>Modelo</th><th>Qtd Enviada</th><th>Valor/Peça</th><th>Total Previsto</th></tr></thead>
          <tbody><tr><td>#${r.pedidoNumero}</td><td>${r.clienteNome}</td><td>${r.modeloNome}</td><td><strong>${r.qtdEnviada} pçs</strong></td><td>${fmtMoeda(r.valorPorPeca)}</td><td>${fmtMoeda(r.qtdEnviada * r.valorPorPeca)}</td></tr></tbody>
        </table>
        <br><br><br>
        <div style="display:flex;justify-content:space-between;">
          <div>___________________________________<br>Responsável Fábrica</div>
          <div>___________________________________<br>Recebido por (${r.faccaoNome})</div>
        </div>
        <script>window.onload=function(){window.print();}</script>
        </body></html>
      `);
      win.document.close();
    }
  }

  // ============================================================================
  // 3, 4, 5, 6. GESTÃO & CONTADOR (Cobrança, Comissões, XML Compra, Contador, ABC, Auditoria)
  // ============================================================================
  let subAbaGestao = 'cobranca'; // 'cobranca' | 'xmlcompra' | 'contador' | 'abc' | 'auditoria'
  let pctComissaoPadrao = 5;

  function renderizarGestaoContador() {
    const contentArea = document.getElementById('contentArea');
    if (!contentArea) return;
    const db = getDb();
    if (!db) return;

    contentArea.innerHTML = `
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 18px;">
        <div>
          <h1 class="page-title" style="display: flex; align-items: center; gap: 8px;">
            <span>📊</span> Gestão Comercial, Fiscal & Contador
          </h1>
          <p class="page-subtitle">Régua de cobrança, comissões, entrada por XML de compra, fechamento contábil, Curva ABC e auditoria.</p>
        </div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button class="btn btn-sm ${subAbaGestao === 'cobranca' ? 'btn-primary' : 'btn-secondary'}" data-gsub="cobranca">📲 Cobrança & Comissões</button>
          <button class="btn btn-sm ${subAbaGestao === 'xmlcompra' ? 'btn-primary' : 'btn-secondary'}" data-gsub="xmlcompra">📥 Importar XML Compra</button>
          <button class="btn btn-sm ${subAbaGestao === 'contador' ? 'btn-primary' : 'btn-secondary'}" data-gsub="contador">📦 Contador (ZIP/Excel)</button>
          <button class="btn btn-sm ${subAbaGestao === 'abc' ? 'btn-primary' : 'btn-secondary'}" data-gsub="abc">📈 Curva ABC</button>
          <button class="btn btn-sm ${subAbaGestao === 'auditoria' ? 'btn-primary' : 'btn-secondary'}" data-gsub="auditoria">🛡️ Auditoria</button>
        </div>
      </div>
      <div id="gestaoSubConteudo"></div>
    `;

    contentArea.querySelectorAll('[data-gsub]').forEach(btn => {
      btn.addEventListener('click', () => {
        subAbaGestao = btn.getAttribute('data-gsub');
        renderizarGestaoContador();
      });
    });

    const box = contentArea.querySelector('#gestaoSubConteudo');
    if (subAbaGestao === 'cobranca') renderSubCobrancaComissoes(box, db);
    else if (subAbaGestao === 'xmlcompra') renderSubImportarXmlCompra(box, db);
    else if (subAbaGestao === 'contador') renderSubContador(box, db);
    else if (subAbaGestao === 'abc') renderSubCurvaAbc(box, db);
    else renderSubAuditoria(box, db);
  }

  function renderSubCobrancaComissoes(box, db) {
    const hoje = new Date().toISOString().slice(0, 10);
    const parcelasPendentes = [];
    const comissaoPorVendedor = {};

    (db.pedidos || []).filter(p => p.status !== 'Cancelado').forEach(p => {
      const vend = p.vendedor || p.atendente || 'Direto / Fábrica';
      const valPed = Number(p.valorTotalVenda || p.valorTotal || 0);
      if (!comissaoPorVendedor[vend]) comissaoPorVendedor[vend] = { vendedor: vend, qtd: 0, faturamento: 0 };
      comissaoPorVendedor[vend].qtd += 1;
      comissaoPorVendedor[vend].faturamento += valPed;

      const parcs = p.pagamentoDetalhes?.parcelas || p.parcelas || [];
      parcs.forEach((pc, idx) => {
        if (pc.status !== 'Pago' && Number(pc.valor || 0) > 0) {
          const venc = String(pc.vencimento || '').slice(0, 10);
          parcelasPendentes.push({
            pedido: p,
            idx,
            numero: pc.numero || `${p.numero}-${idx + 1}`,
            vencimento: venc,
            valor: Number(pc.valor || 0),
            situacao: venc && venc < hoje ? 'Atrasada' : (venc === hoje ? 'Vence Hoje' : 'A Vencer')
          });
        }
      });
    });

    parcelasPendentes.sort((a, b) => (a.vencimento || '9999').localeCompare(b.vencimento || '9999'));
    const listaVend = Object.values(comissaoPorVendedor).sort((a, b) => b.faturamento - a.faturamento);

    box.innerHTML = `
      <div class="card" style="padding: 16px; margin-bottom: 16px;">
        <h3 style="margin: 0 0 10px; font-size: 14px; font-weight: 800;">📲 Régua de Cobrança de Parcelas (${parcelasPendentes.length} em aberto)</h3>
        <div class="table-wrapper" style="margin: 0;">
          <table class="erp-table">
            <thead><tr><th>Pedido / Parcela</th><th>Cliente</th><th>Vencimento</th><th>Valor</th><th>Situação</th><th style="text-align:right;">Ação</th></tr></thead>
            <tbody>
              ${parcelasPendentes.length === 0 ? '<tr><td colspan="6" style="text-align:center;padding:24px;color:#64748b;">Nenhuma parcela em aberto encontrada nos pedidos.</td></tr>' : parcelasPendentes.map(item => `
                <tr>
                  <td><strong class="text-mono">#${item.pedido.numero}</strong> (${item.numero})</td>
                  <td>${item.pedido.clienteNome}</td>
                  <td class="text-mono">${item.vencimento ? item.vencimento.split('-').reverse().join('/') : '-'}</td>
                  <td class="text-mono"><strong>${fmtMoeda(item.valor)}</strong></td>
                  <td><span style="padding:2px 8px;border-radius:99px;font-size:11px;font-weight:800;background:${item.situacao === 'Atrasada' ? '#fee2e2;color:#b91c1c' : (item.situacao === 'Vence Hoje' ? '#fef3c7;color:#92400e' : '#dbeafe;color:#1e40af')};">${item.situacao}</span></td>
                  <td style="text-align:right;white-space:nowrap;">
                    <button class="btn btn-secondary btn-sm btn-cobrar-wpp" data-ped="${item.pedido.id}" data-val="${item.valor}" data-venc="${item.vencimento}" style="font-size:11px;">💬 Cobrar WhatsApp</button>
                    <button class="btn btn-primary btn-sm btn-baixar-parc" data-ped="${item.pedido.id}" data-idx="${item.idx}" style="font-size:11px;background:#16a34a;border-color:#16a34a;">💰 Dar Baixa</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" style="padding: 16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
          <h3 style="margin:0;font-size:14px;font-weight:800;">🏆 Fechamento de Comissões por Vendedor</h3>
          <div style="display:flex;align-items:center;gap:6px;font-size:12px;">
            <span>% Comissão:</span>
            <input type="number" id="inpPctComissao" class="form-input text-mono" style="width:70px;padding:4px 6px;" min="0" max="50" step="0.5" value="${pctComissaoPadrao}">
          </div>
        </div>
        <table class="erp-table">
          <thead><tr><th>Vendedor</th><th>Pedidos</th><th>Faturamento</th><th>Comissão (${pctComissaoPadrao}%)</th></tr></thead>
          <tbody>
            ${listaVend.map(v => `
              <tr>
                <td><strong>${v.vendedor}</strong></td>
                <td class="text-mono">${v.qtd}</td>
                <td class="text-mono">${fmtMoeda(v.faturamento)}</td>
                <td class="text-mono" style="color:#047857;font-weight:800;">${fmtMoeda(v.faturamento * (pctComissaoPadrao / 100))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    box.querySelector('#inpPctComissao')?.addEventListener('change', (e) => {
      pctComissaoPadrao = parseFloat(e.target.value) || 0;
      renderSubCobrancaComissoes(box, db);
    });

    box.querySelectorAll('.btn-cobrar-wpp').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = (db.pedidos || []).find(x => x.id === btn.getAttribute('data-ped'));
        if (!p) return;
        const fone = String(p.clienteTelefone || '').replace(/\D/g, '');
        const venc = (btn.getAttribute('data-venc') || '').split('-').reverse().join('/');
        const msg = encodeURIComponent(`Olá ${p.clienteNome}! Passando para lembrar da parcela do Pedido #${p.numero} no valor de ${fmtMoeda(btn.getAttribute('data-val'))} com vencimento em ${venc}. Qualquer dúvida estamos à disposição!`);
        window.open(`https://wa.me/${fone ? '55' + fone : ''}?text=${msg}`, '_blank');
      });
    });

    box.querySelectorAll('.btn-baixar-parc').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = (db.pedidos || []).find(x => x.id === btn.getAttribute('data-ped'));
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const parcs = p?.pagamentoDetalhes?.parcelas || p?.parcelas;
        if (parcs && parcs[idx]) {
          parcs[idx].status = 'Pago';
          parcs[idx].dataPagamento = new Date().toISOString().slice(0, 10);
          registrarAuditoria('Baixa de Parcela', 'Financeiro', `Parcela do Pedido #${p.numero} (${fmtMoeda(parcs[idx].valor)}) marcada como Paga`);
          saveDb();
          toast('Parcela baixada como Paga!', 'green');
          renderSubCobrancaComissoes(box, db);
        }
      });
    });
  }

  let xmlCompraPreview = null;

  function renderSubImportarXmlCompra(box, db) {
    box.innerHTML = `
      <div class="card" style="padding: 16px;">
        <h3 style="margin: 0 0 6px; font-size: 14px; font-weight: 800;">📥 Importar XML da NF-e de Compra (Fornecedor)</h3>
        <p style="font-size: 12px; color: #64748b; margin-bottom: 12px;">Suba o arquivo <code>.xml</code> da nota fiscal do seu fornecedor de tecidos/aviamentos para dar entrada automática no Estoque e lançar a Conta a Pagar no Financeiro.</p>
        <input type="file" id="inpFileXmlCompra" accept=".xml" class="form-input" style="max-width: 420px; margin-bottom: 14px;">
        <div id="previewXmlCompraBox">
          ${xmlCompraPreview ? `
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
              <div><strong>Fornecedor:</strong> ${xmlCompraPreview.fornecedor} (${xmlCompraPreview.cnpj}) • <strong>NF-e:</strong> #${xmlCompraPreview.numero} • <strong>Total:</strong> ${fmtMoeda(xmlCompraPreview.total)}</div>
              <div style="font-size: 12px; color: #475569; margin-top: 4px;">${xmlCompraPreview.itens.length} item(ns) prontos para dar entrada no Estoque.</div>
            </div>
            <table class="erp-table" style="margin-bottom: 12px;">
              <thead><tr><th>Produto / Insumo</th><th>UN</th><th>Qtd</th><th>Valor Unit.</th><th>Total</th></tr></thead>
              <tbody>
                ${xmlCompraPreview.itens.map(it => `<tr><td>${it.descricao}</td><td>${it.un}</td><td class="text-mono">${it.qtd}</td><td class="text-mono">${fmtMoeda(it.vUnit)}</td><td class="text-mono">${fmtMoeda(it.vProd)}</td></tr>`).join('')}
              </tbody>
            </table>
            <button type="button" class="btn btn-primary btn-sm" id="btnConfirmarXmlCompra" style="background: #16a34a; border-color: #16a34a; font-weight: 800;">✅ Dar Entrada no Estoque & Lançar Conta a Pagar</button>
          ` : ''}
        </div>
      </div>
    `;

    box.querySelector('#inpFileXmlCompra')?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const doc = new DOMParser().parseFromString(String(reader.result), 'text/xml');
          const txt = (parent, tag) => parent?.getElementsByTagName(tag)?.[0]?.textContent?.trim() || '';
          const emit = doc.getElementsByTagName('emit')[0];
          const ide = doc.getElementsByTagName('ide')[0];
          const icmsTot = doc.getElementsByTagName('ICMSTot')[0];
          const dets = Array.from(doc.getElementsByTagName('det'));
          const itens = dets.map(d => {
            const prod = d.getElementsByTagName('prod')[0];
            return {
              codigo: txt(prod, 'cProd'),
              descricao: txt(prod, 'xProd'),
              un: txt(prod, 'uCom') || 'UN',
              qtd: parseFloat(txt(prod, 'qCom')) || 1,
              vUnit: parseFloat(txt(prod, 'vUnCom')) || 0,
              vProd: parseFloat(txt(prod, 'vProd')) || 0
            };
          });
          xmlCompraPreview = {
            fornecedor: txt(emit, 'xNome') || 'Fornecedor XML',
            cnpj: txt(emit, 'CNPJ'),
            numero: txt(ide, 'nNF') || 'S/N',
            total: parseFloat(txt(icmsTot, 'vNF')) || itens.reduce((s, i) => s + i.vProd, 0),
            itens
          };
          renderSubImportarXmlCompra(box, db);
        } catch (err) {
          alert('Erro ao ler XML da NF-e: ' + err.message);
        }
      };
      reader.readAsText(file);
    });

    box.querySelector('#btnConfirmarXmlCompra')?.addEventListener('click', () => {
      if (!xmlCompraPreview) return;
      if (!Array.isArray(db.estoque)) db.estoque = [];
      if (!Array.isArray(db.despesasFixas)) db.despesasFixas = [];
      if (!Array.isArray(db.lancamentosFinanceiros)) db.lancamentosFinanceiros = [];
      const hoje = new Date().toISOString().slice(0, 10);

      xmlCompraPreview.itens.forEach(it => {
        const ex = db.estoque.find(e => String(e.nome || e.item || '').toLowerCase() === it.descricao.toLowerCase());
        if (ex) {
          ex.quantidade = Number((Number(ex.quantidade || 0) + it.qtd).toFixed(2));
          if (typeof ex.saldo === 'number') ex.saldo = ex.quantidade;
        } else {
          db.estoque.push({
            id: 'est_xml_' + Date.now() + '_' + Math.floor(Math.random() * 999),
            nome: it.descricao,
            item: it.descricao,
            unidade: it.un,
            quantidade: it.qtd,
            saldo: it.qtd,
            custoUnitario: it.vUnit,
            categoria: 'Matéria-Prima (XML)'
          });
        }
      });

      const idDesp = 'desp_xml_' + Date.now();
      db.despesasFixas.push({
        id: idDesp,
        origemAutomatica: true,
        origem: `XML Compra NF-e #${xmlCompraPreview.numero}`,
        tipoCusto: 'Variável',
        descricao: `Compra NF-e #${xmlCompraPreview.numero} — ${xmlCompraPreview.fornecedor}`,
        categoria: 'Compra de Matéria-Prima / Insumos',
        centroCusto: 'CC-02',
        fornecedorFavorecido: xmlCompraPreview.fornecedor,
        valor: xmlCompraPreview.total,
        valorMensal: xmlCompraPreview.total,
        dataVencimento: hoje,
        recorrencia: 'Única',
        status: 'Pendente'
      });
      db.lancamentosFinanceiros.push({
        id: 'lan_xml_' + Date.now(),
        despesaId: idDesp,
        tipo: 'Saida',
        descricao: `Compra NF-e #${xmlCompraPreview.numero} — ${xmlCompraPreview.fornecedor}`,
        categoria: 'Compra de Matéria-Prima / Insumos',
        centroCusto: 'CC-02',
        valor: xmlCompraPreview.total,
        data: hoje,
        status: 'Pendente',
        origem: 'Importação XML'
      });

      registrarAuditoria('Importação XML Compra', 'Estoque / Financeiro', `NF-e #${xmlCompraPreview.numero} (${xmlCompraPreview.fornecedor}) — ${xmlCompraPreview.itens.length} itens, ${fmtMoeda(xmlCompraPreview.total)}`);
      xmlCompraPreview = null;
      saveDb();
      toast('XML importado! Estoque atualizado e Conta a Pagar lançada no Financeiro.', 'green');
      renderSubImportarXmlCompra(box, db);
    });
  }

  function renderSubContador(box, db) {
    const mesAtual = new Date().toISOString().slice(0, 7);
    const notas = db.notasFiscais || [];
    box.innerHTML = `
      <div class="card" style="padding: 18px;">
        <h3 style="margin: 0 0 8px; font-size: 15px; font-weight: 800;">📦 Fechamento Mensal para o Contador (1 Clique)</h3>
        <p style="font-size: 12px; color: #64748b; margin-bottom: 14px;">Exporte todos os XMLs das NF-es emitidas e o resumo financeiro do mês para enviar direto para a contabilidade.</p>
        <div style="display: flex; gap: 12px; align-items: end; flex-wrap: wrap;">
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Mês de Referência</label>
            <input type="month" id="inpMesContador" class="form-input text-mono" value="${mesAtual}">
          </div>
          <button type="button" class="btn btn-primary btn-sm" id="btnBaixarZipXmlContador" style="font-weight: 800;">🗜️ Baixar ZIP dos XMLs (${notas.length} NF-es)</button>
          <button type="button" class="btn btn-secondary btn-sm" id="btnBaixarCsvContador" style="font-weight: 800;">📊 Exportar Planilha Excel (.CSV)</button>
        </div>
      </div>
    `;

    box.querySelector('#btnBaixarZipXmlContador')?.addEventListener('click', async () => {
      if (typeof JSZip === 'undefined') return alert('Biblioteca JSZip não carregada.');
      const mes = box.querySelector('#inpMesContador').value;
      const filtradas = notas.filter(n => !mes || String(n.dataEmissaoIso || '').startsWith(mes) || true);
      if (filtradas.length === 0) return alert('Nenhuma NF-e encontrada para exportar.');
      const zip = new JSZip();
      filtradas.forEach(n => {
        const xml = n.xmlGerado || (typeof getERP().gerarXmlNfePadrao400 === 'function' ? getERP().gerarXmlNfePadrao400(n, db.empresa) : `<nfe numero="${n.numero}"/>`);
        zip.file(`NFe_${n.numero}_${n.statusSefaz || 'autorizada'}.xml`, xml);
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `XMLs_Texfy_${mes || 'todos'}.zip`;
      a.click();
      toast(`ZIP com ${filtradas.length} XML(s) gerado!`, 'green');
    });

    box.querySelector('#btnBaixarCsvContador')?.addEventListener('click', () => {
      const linhas = ['Numero;Serie;Status;Data;Cliente;CNPJ_CPF;Valor_Total'];
      notas.forEach(n => {
        linhas.push(`${n.numero};${n.serie || 1};${n.statusSefaz || 'autorizada'};${n.dataEmissao || ''};"${n.cliente?.nome || ''}";${n.cliente?.documento || ''};${Number(n.totais?.valorTotal || 0).toFixed(2)}`);
      });
      const blob = new Blob(['\uFEFF' + linhas.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `Relatorio_Fiscal_Texfy_${box.querySelector('#inpMesContador').value || 'geral'}.csv`;
      a.click();
      toast('Planilha CSV exportada para Excel!', 'green');
    });
  }

  function renderSubCurvaAbc(box, db) {
    const porCliente = {};
    const porProduto = {};
    (db.pedidos || []).filter(p => p.status !== 'Cancelado').forEach(p => {
      const v = Number(p.valorTotalVenda || p.valorTotal || 0);
      const cli = p.clienteNome || 'Consumidor';
      porCliente[cli] = (porCliente[cli] || 0) + v;
      const prod = p.produtoNome || p.itens?.[0]?.produtoNome || 'Uniformes';
      porProduto[prod] = (porProduto[prod] || 0) + v;
    });

    const topCli = Object.entries(porCliente).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const topProd = Object.entries(porProduto).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const totalCli = topCli.reduce((s, x) => s + x[1], 0) || 1;
    const totalProd = topProd.reduce((s, x) => s + x[1], 0) || 1;

    box.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">
        <div class="card" style="padding: 16px;">
          <h3 style="margin:0 0 12px;font-size:14px;font-weight:800;">🏆 Curva ABC — Top Clientes</h3>
          ${topCli.map(([nome, val], i) => {
            const pct = ((val / totalCli) * 100).toFixed(1);
            return `<div style="margin-bottom:10px;">
              <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px;">
                <span><strong>${i + 1}. ${nome}</strong></span>
                <span class="text-mono"><strong>${fmtMoeda(val)}</strong> (${pct}%)</span>
              </div>
              <div style="height:7px;background:#e2e8f0;border-radius:99px;overflow:hidden;"><div style="width:${pct}%;height:100%;background:#0f172a;"></div></div>
            </div>`;
          }).join('') || '<div style="color:#64748b;font-size:12px;">Sem dados de pedidos.</div>'}
        </div>
        <div class="card" style="padding: 16px;">
          <h3 style="margin:0 0 12px;font-size:14px;font-weight:800;">👕 Curva ABC — Top Produtos</h3>
          ${topProd.map(([nome, val], i) => {
            const pct = ((val / totalProd) * 100).toFixed(1);
            return `<div style="margin-bottom:10px;">
              <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px;">
                <span><strong>${i + 1}. ${nome}</strong></span>
                <span class="text-mono"><strong>${fmtMoeda(val)}</strong> (${pct}%)</span>
              </div>
              <div style="height:7px;background:#e2e8f0;border-radius:99px;overflow:hidden;"><div style="width:${pct}%;height:100%;background:#0d9488;"></div></div>
            </div>`;
          }).join('') || '<div style="color:#64748b;font-size:12px;">Sem dados de produtos.</div>'}
        </div>
      </div>
    `;
  }

  function renderSubAuditoria(box, db) {
    const logs = db.auditLogs || [];
    box.innerHTML = `
      <div class="card" style="padding: 0; overflow: hidden;">
        <div style="padding: 14px 16px; border-bottom: 1px solid var(--border-medium); font-weight: 800; font-size: 13px;">
          🛡️ Log de Auditoria ("Quem alterou o quê?") — Últimos ${logs.length} registros
        </div>
        <div class="table-wrapper" style="margin: 0; max-height: 440px; overflow-y: auto;">
          <table class="erp-table">
            <thead><tr><th>Data/Hora</th><th>Usuário</th><th>Módulo</th><th>Ação</th><th>Detalhes</th></tr></thead>
            <tbody>
              ${logs.length === 0 ? '<tr><td colspan="5" style="text-align:center;padding:28px;color:#64748b;">Nenhuma alteração auditada registrada ainda nesta sessão.</td></tr>' : logs.map(l => `
                <tr>
                  <td class="text-mono" style="font-size:11px;">${new Date(l.dataIso).toLocaleString('pt-BR')}</td>
                  <td><strong>${l.usuario}</strong> <span style="font-size:10px;color:#64748b;">(${l.perfil})</span></td>
                  <td><span style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:700;">${l.modulo}</span></td>
                  <td><strong>${l.acao}</strong></td>
                  <td style="font-size:12px;color:#475569;">${l.detalhe}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ============================================================================
  // 7. CHECKLIST DE ONBOARDING ("Primeiros Passos" na Abertura)
  // ============================================================================
  function renderizarChecklistOnboarding() {
    const db = getDb();
    if (!db || localStorage.getItem('TEXFY_HIDE_ONBOARDING') === '1') return;
    const contentArea = document.getElementById('contentArea');
    if (!contentArea || document.getElementById('texfyOnboardingCard')) return;

    const cnpjOk = Boolean(db.empresa?.cnpj && String(db.empresa.cnpj).replace(/\D/g, '').length >= 11);
    const certOk = Boolean(db.configFiscal?.certificadoA1?.instalado);
    const prodOk = Array.isArray(db.produtos) ? db.produtos.length > 0 : (Array.isArray(db.estoque) && db.estoque.length > 0);
    const pedOk = Array.isArray(db.pedidos) && db.pedidos.length > 0;
    const passos = [
      { ok: cnpjOk, label: '1. Dados & CNPJ da Confecção', aba: 'empresa' },
      { ok: certOk, label: '2. Certificado A1 (NF-e)', aba: 'nfe' },
      { ok: prodOk, label: '3. Produtos / Estoque', aba: 'produtos' },
      { ok: pedOk, label: '4. Primeiro Pedido', aba: 'pedidos' }
    ];
    const concluidos = passos.filter(p => p.ok).length;
    const pct = Math.round((concluidos / passos.length) * 100);

    const card = document.createElement('div');
    card.id = 'texfyOnboardingCard';
    card.className = 'card';
    card.style.cssText = 'padding: 14px 16px; margin-bottom: 16px; border: 1px solid #bae6fd; background: linear-gradient(90deg, #f0f9ff 0%, #ffffff 100%);';
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;">
        <div>
          <strong style="font-size:13px;color:#0369a1;">🚀 Primeiros Passos da Sua Confecção (${pct}% concluído)</strong>
          <div style="font-size:11.5px;color:#475569;">Complete os 4 passos para operar pedidos, facções, etiquetas e NF-e sem atrito.</div>
        </div>
        <button type="button" id="btnFecharOnboarding" style="background:transparent;border:none;color:#64748b;cursor:pointer;font-size:12px;">Ocultar &times;</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px;">
        ${passos.map(ps => `
          <button type="button" onclick="window.ERP.navegarPara('${ps.aba}')" style="text-align:left;padding:8px 10px;border-radius:6px;border:1px solid ${ps.ok ? '#86efac' : '#cbd5e1'};background:${ps.ok ? '#f0fdf4' : '#ffffff'};cursor:pointer;font-size:11.5px;font-weight:700;color:${ps.ok ? '#166534' : '#0f172a'};">
            ${ps.ok ? '✅' : '⬜'} ${ps.label}
          </button>
        `).join('')}
      </div>
    `;
    contentArea.prepend(card);
    card.querySelector('#btnFecharOnboarding')?.addEventListener('click', () => {
      localStorage.setItem('TEXFY_HIDE_ONBOARDING', '1');
      card.remove();
    });
  }

  window.ERP = Object.assign(window.ERP || {}, {
    renderizarFaccoesMrp,
    renderizarGestaoContador,
    abrirModalConferirRetornoFaccao,
    imprimirRomaneioFaccao,
    registrarAuditoria,
    renderizarChecklistOnboarding
  });
})();
