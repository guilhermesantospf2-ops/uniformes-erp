/**
 * ============================================================================
 * BRAVVI ERP TÊXTIL — MOTOR DE PAGAMENTOS INFINITEPAY (CLOUDWALK)
 * ============================================================================
 * Integração oficial de pagamentos para assinaturas do ERP e cobranças:
 * - Plano Mensal: R$ 397,00 / mês
 * - Plano Anual Pro: R$ 3.564,00 / ano (ou 12x de R$ 297,00) • Economize R$ 1.200
 * - Implementação VIP Acompanhada (Setup Completo): R$ 997,00 avulso ou Combo Anual
 * 
 * Suporta:
 * 1. Links de Pagamento Diretos InfinitePay (Checkout Hospedado com Cartão até 12x e Pix)
 * 2. API REST InfinitePay Checkout (https://api.checkout.infinitepay.io)
 * 3. Modal de Checkout Integrado no ERP e Landing Page
 * ============================================================================
 */

(function () {
  'use strict';

  const WHATSAPP_SUPORTE = '5544998071870';
  const LINK_WHATSAPP_ANUAL = 'https://wa.me/5544998071870?text=' + encodeURIComponent('Olá! Quero contratar o Plano Anual Pro do Bravvi ERP Têxtil (R$ 3.970/ano à vista ou 12x no cartão).');
  const LINK_WHATSAPP_COMBO = 'https://wa.me/5544998071870?text=' + encodeURIComponent('Olá! Quero contratar o Combo Anual + Implementação VIP do Bravvi ERP Têxtil (12x R$ 397 / R$ 4.764).');
  const LINK_WHATSAPP_SETUP = 'https://wa.me/5544998071870?text=' + encodeURIComponent('Olá! Quero contratar a Implementação Especializada VIP da Bravvi.');

  // Configuração padrão dos planos e valores oficiais
  const PLANOS_CONFIG = {
    mensal: {
      id: 'plano_mensal_397',
      nome: 'Plano Fábrica Mensal',
      valor: 397.00,
      valorFormatado: 'R$ 397,00',
      periodo: '/mês',
      parcelamento: 'Sem fidelidade • Cancele quando quiser',
      destaque: false,
      badge: 'Flexibilidade Total',
      descricao: 'Acesso completo a todas as ferramentas industriais para a sua confecção.',
      itens: [
        'Usuários e computadores ilimitados',
        'Orçamentos com Mockups 3x4 dinâmicos',
        'Fichas Técnicas A4 com grade expandida (Infantil ao G5)',
        'Radar de Prazos Industrial com alertas visuais',
        'Emissor de NF-e Focus/SEFAZ Modelo 55 com DANFE A4',
        'Nesting DTF para otimização de rolo de impressão',
        'Módulo Financeiro, DRE e Custos Têxteis',
        'Suporte técnico via WhatsApp'
      ],
      linkPadrao: 'https://pay.cakto.com.br/rb6atzs_1178556'
    },
    anual: {
      id: 'plano_anual_3970',
      nome: 'Plano Anual Pro Industrial',
      valor: 3970.00,
      valorFormatado: 'R$ 3.970,00',
      periodo: '/ano à vista',
      parcelamento: 'Ou em até 12x de R$ 330,83 no cartão de crédito',
      destaque: true,
      badge: 'Mais Escolhido • Economize R$ 794 (2 meses grátis)',
      descricao: 'O melhor custo-benefício para indústrias têxteis com desconto anual garantido.',
      itens: [
        'Tudo do Plano Mensal incluso',
        'Economia de R$ 794,00 no ano (paga 10 meses, usa 12 meses)',
        'Parcelamento em até 12x sem complicação no cartão',
        'Suporte Prioritário VIP com fila acelerada no WhatsApp',
        'Atualizações contínuas de novos recursos',
        'Backup automático na nuvem'
      ],
      linkPadrao: LINK_WHATSAPP_ANUAL
    },
    anual_implementacao: {
      id: 'plano_anual_vip_setup',
      nome: 'Combo Anual Pro + Implementação VIP',
      valor: 4764.00,
      valorFormatado: 'R$ 4.764,00',
      periodo: '/ano à vista',
      parcelamento: 'Ou em até 12x de R$ 397,00 no cartão de crédito',
      destaque: false,
      badge: 'Chave na Mão • Setup Completo',
      descricao: 'Acesso anual completo com consultoria de implantação e fábrica rodando em 48h.',
      itens: [
        '12 meses de acesso completo ao Bravvi ERP',
        'Implementação VIP 100% assistida por especialista têxtil',
        'Parametrização de logotipo, CNPJ, NF-e SEFAZ e Chave Pix',
        'Cadastro do catálogo inicial de tecidos, custos e modelagens',
        'Calibração de Nesting DTF para o maquinário da sua estamparia',
        'Treinamento ao vivo com vendedores, encarregados e diretoria',
        'Acompanhamento assistido dos primeiros 10 pedidos reais'
      ],
      linkPadrao: LINK_WHATSAPP_COMBO
    },
    implementacao_avulsa: {
      id: 'setup_implementacao_997',
      nome: 'Implementação Operacional & Setup VIP',
      valor: 997.00,
      valorFormatado: 'R$ 997,00',
      periodo: 'taxa única',
      parcelamento: 'Ou em até 6x no cartão de crédito',
      destaque: false,
      badge: 'Serviço Consultivo Especializado',
      descricao: 'Colocamos a sua confecção para rodar pronta em menos de 48 horas.',
      itens: [
        'Parametrização da identidade visual (logo em alta resolução nas fichas e orçamentos)',
        'Configuração fiscal SEFAZ/Focus NFe e emissão de notas com 1 clique',
        'Mapeamento de custos: cálculo de rendimento por quilo de tecido e margens reais',
        'Ajuste fino de largura de bobina no motor Nesting DTF para corte sem desperdício',
        'Treinamento prático em vídeo/WhatsApp para vendedores e chão de fábrica',
        'Auditoria e acompanhamento dos primeiros pedidos lançados'
      ],
      linkPadrao: LINK_WHATSAPP_SETUP
    }
  };

  // O que é a Implementação (Detalhamento Técnico e Operacional)
  const DETALHAMENTO_IMPLEMENTACAO = [
    {
      titulo: '1. Parametrização & Identidade Visual Corporativa',
      icone: '🎨',
      descricao: 'Vetorização e aplicação do logotipo da sua confecção em alta definição em todos os documentos (Orçamentos 3x4 e Fichas Técnicas A4). Configuração de CNPJ, Inscrição Estadual, chave PIX e integração de NF-e (Focus / SEFAZ).'
    },
    {
      titulo: '2. Mapeamento & Cadastro de Custos Têxteis',
      icone: '🧵',
      descricao: 'Cadastro completo da grade de tecidos da fábrica (Poliéster, Dry Fit, Algodão 30.1, Piquet, Brim, Ripstop, Helanca). Parametrização de rendimento por metro/quilo, custos de estamparia (DTF, Silk, Bordado) e margem de contribuição.'
    },
    {
      titulo: '3. Calibração do Nesting DTF no Chão de Fábrica',
      icone: '🖨️',
      descricao: 'Ajuste da largura útil exata da bobina de impressão DTF (58cm ou 60cm), margem de corte entre artes e posicionamento de logos para economizar até 35% de filme em cada tiragem.'
    },
    {
      titulo: '4. Treinamento Ao Vivo da Equipe (Vendas + Fábrica)',
      icone: '👥',
      descricao: 'Sessão prática dedicada com sua equipe: vendedores aprendem a disparar propostas com mockup no WhatsApp em 2 minutos; encarregados aprendem a usar as Fichas A4 e o Radar de Prazos; gestores acompanham o DRE.'
    },
    {
      titulo: '5. Auditoria & Acompanhamento dos Primeiros Pedidos',
      icone: '🚀',
      descricao: 'Um especialista da Bravvi acompanha lado a lado os primeiros pedidos lançados até a entrega final ao cliente, garantindo que nenhum erro ou dúvida trave a sua produção.'
    }
  ];

  // Armazenamento de credenciais InfinitePay
  const STORAGE_KEY = 'bravvi_infinitepay_settings';

  function carregarConfiguracoes() {
    let data = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) data = JSON.parse(raw);
    } catch (e) {
      console.warn('[InfinitePay] Erro ao carregar config:', e);
    }
    const padrao = {
      handle: '', // ex: 'bravvitextil'
      linkMensal: 'https://pay.cakto.com.br/rb6atzs_1178556',
      linkAnual: LINK_WHATSAPP_ANUAL,
      linkCombo: LINK_WHATSAPP_COMBO,
      linkSetup: LINK_WHATSAPP_SETUP,
      apiKey: '',
      whatsappSuporte: WHATSAPP_SUPORTE
    };
    if (data) {
      // Se linkMensal estiver vazio ou não for da Cakto, atualiza para o link oficial da Cakto
      if (!data.linkMensal || !data.linkMensal.includes('cakto.com.br')) {
        data.linkMensal = padrao.linkMensal;
      }
      // Sempre garante que o Anual e Combo abram o WhatsApp oficial para negociação direta
      data.linkAnual = LINK_WHATSAPP_ANUAL;
      data.linkCombo = LINK_WHATSAPP_COMBO;
      data.linkSetup = LINK_WHATSAPP_SETUP;
      data.whatsappSuporte = WHATSAPP_SUPORTE;
      return { ...padrao, ...data };
    }
    return padrao;
  }

  function salvarConfiguracoes(novaConfig) {
    const atual = carregarConfiguracoes();
    const mesclado = { ...atual, ...novaConfig };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mesclado));
    return mesclado;
  }

  /**
   * Obtém a URL final de pagamento ou negociação no WhatsApp
   */
  function obterLinkPagamentoPlano(planoKey) {
    const plano = PLANOS_CONFIG[planoKey] || PLANOS_CONFIG.mensal;
    const config = carregarConfiguracoes();

    // 1. Mensal vai direto para o checkout da Cakto
    if (planoKey === 'mensal') {
      return config.linkMensal || 'https://pay.cakto.com.br/rb6atzs_1178556';
    }

    // 2. Anual e Combo vão direto para o WhatsApp do suporte/vendas
    if (planoKey === 'anual') return LINK_WHATSAPP_ANUAL;
    if (planoKey === 'anual_implementacao') return LINK_WHATSAPP_COMBO;
    if (planoKey === 'implementacao_avulsa') return LINK_WHATSAPP_SETUP;

    return plano.linkPadrao || LINK_WHATSAPP_ANUAL;
  }

  /**
   * Redireciona diretamente para o checkout de pagamento da InfinitePay
   * (Sem abrir nenhum modal no sistema ou no site)
   */
  function irParaCheckout(planoKey = 'mensal') {
    const link = obterLinkPagamentoPlano(planoKey);
    if (link) {
      window.open(link, '_blank');
    }
  }

  // Alias para retrocompatibilidade total: abre direto o link de pagamento sem modal
  function abrirModalCheckout(planoKey = 'mensal') {
    irParaCheckout(planoKey);
  }

  /**
   * Modal administrativo para configurar os links / API da InfinitePay
   */
  function abrirModalConfiguracoesInfinitePay(retornarPlano = 'mensal') {
    const modalExistente = document.getElementById('modalConfigIP');
    if (modalExistente) modalExistente.remove();

    const config = carregarConfiguracoes();

    const overlay = document.createElement('div');
    overlay.id = 'modalConfigIP';
    overlay.className = 'modal-overlay active';
    overlay.style.zIndex = '999999';
    overlay.innerHTML = `
      <div class="modal-box" style="max-width: 580px; border-radius: 12px; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.5); margin: 30px auto; background: #ffffff;">
        <div style="background: #032b35; padding: 16px 20px; color: #ffffff; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-weight: 800; font-size: 15px; color: #2dd4bf;">Configurar API & Links de Pagamento InfinitePay</div>
          <button id="btnFecharConfigIP" style="color: #ffffff; background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
        </div>

        <div style="padding: 20px; max-height: calc(85vh - 120px); overflow-y: auto;">
          <p style="font-size: 12px; color: #475569; margin-top: 0;">
            Insira o seu <strong>Handle InfinitePay</strong> (ex: <code>suaempresa</code>) ou cole os links de pagamento de cada produto gerados no app da InfinitePay para ativar o checkout com 1 clique.
          </p>

          <div style="margin-bottom: 12px;">
            <label style="display: block; font-size: 11.5px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">Handle Público InfinitePay (Opcional):</label>
            <div style="display: flex; align-items: center; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0 8px;">
              <span style="font-size: 12px; color: #64748b;">https://infinitepay.io/pay/</span>
              <input type="text" id="cfgIpHandle" value="${config.handle || ''}" placeholder="seu-nome-de-usuario" style="border: none; padding: 8px; width: 100%; font-size: 12px; outline: none;">
            </div>
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: block; font-size: 11.5px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">Link do Plano Mensal (R$ 397,00):</label>
            <input type="url" id="cfgIpLinkMensal" value="${config.linkMensal || ''}" placeholder="https://pay.infinitepay.io/..." style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; font-size: 12px; box-sizing: border-box;">
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: block; font-size: 11.5px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">Link do Plano Anual (R$ 3.970,00 em até 12x):</label>
            <input type="url" id="cfgIpLinkAnual" value="${config.linkAnual || ''}" placeholder="https://pay.infinitepay.io/..." style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; font-size: 12px; box-sizing: border-box;">
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: block; font-size: 11.5px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">Link Combo Anual + Implementação (R$ 4.764,00 em até 12x):</label>
            <input type="url" id="cfgIpLinkCombo" value="${config.linkCombo || ''}" placeholder="https://pay.infinitepay.io/..." style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; font-size: 12px; box-sizing: border-box;">
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 11.5px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">WhatsApp Comercial de Suporte (DDD + Número):</label>
            <input type="text" id="cfgIpWhatsapp" value="${config.whatsappSuporte || '5544998071870'}" placeholder="5544998071870" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; font-size: 12px; box-sizing: border-box;">
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; font-size: 11px; color: #64748b; line-height: 1.4;">
            💡 <em>Dica:</em> No app de pagamentos ou WhatsApp, defina os canais de recebimento e suporte.
          </div>
        </div>

        <div style="padding: 14px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 10px;">
          <button type="button" id="btnCancelarConfigIP" style="padding: 8px 16px; border: 1px solid #cbd5e1; background: #ffffff; border-radius: 6px; font-weight: 700; cursor: pointer;">Cancelar</button>
          <button type="button" id="btnSalvarConfigIP" style="padding: 8px 18px; border: none; background: #047857; color: #ffffff; border-radius: 6px; font-weight: 800; cursor: pointer;">Salvar Configurações</button>
        </div>
      </div>
    `;

    const container = document.getElementById('modalContainer') || document.body;
    container.appendChild(overlay);

    const fechar = () => overlay.remove();
    overlay.querySelector('#btnFecharConfigIP')?.addEventListener('click', fechar);
    overlay.querySelector('#btnCancelarConfigIP')?.addEventListener('click', fechar);

    overlay.querySelector('#btnSalvarConfigIP')?.addEventListener('click', () => {
      const novaCfg = {
        handle: overlay.querySelector('#cfgIpHandle').value.trim(),
        linkMensal: overlay.querySelector('#cfgIpLinkMensal').value.trim(),
        linkAnual: overlay.querySelector('#cfgIpLinkAnual').value.trim(),
        linkCombo: overlay.querySelector('#cfgIpLinkCombo').value.trim(),
        whatsappSuporte: overlay.querySelector('#cfgIpWhatsapp').value.replace(/\D/g, '') || '5544998071870'
      };
      salvarConfiguracoes(novaCfg);
      fechar();
      if (window.ERP && typeof window.ERP.toast === 'function') {
        window.ERP.toast('Configurações de pagamento salvas com sucesso!', 'success');
      }
    });
  }

  function obterLinkAtivacao(email = '') {
    const base = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
    return `${base}index.html?ativar=1${email ? '&email=' + encodeURIComponent(email) : ''}`;
  }

  // Inicialização e Exposição Global
  window.InfinitePayEngine = {
    PLANOS_CONFIG,
    DETALHAMENTO_IMPLEMENTACAO,
    carregarConfiguracoes,
    salvarConfiguracoes,
    obterLinkPagamentoPlano,
    obterLinkAtivacao,
    irParaCheckout,
    abrirModalCheckout,
    abrirModalConfiguracoes: abrirModalConfiguracoesInfinitePay
  };

  // Atalho global direto
  window.abrirModalCheckoutInfinitePay = irParaCheckout;
  if (!window.ERP) window.ERP = {};
  // No ERP, o clique direciona direto para a escolha de planos no site oficial
  window.ERP.abrirModalPlanosAssinatura = () => window.open('vendas.html#planos', '_blank');
  window.ERP.abrirModalCheckoutInfinitePay = (planoKey) => irParaCheckout(planoKey);

})();
