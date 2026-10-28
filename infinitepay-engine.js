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

  const WHATSAPP_SUPORTE = '5544999856245';
  const LINK_CAKTO_BASICO_107 = 'https://pay.cakto.com.br/ecrfqfr_1178654';
  const LINK_CAKTO_PRO_227 = 'https://pay.cakto.com.br/rb6atzs_1178556';
  const LINK_WHATSAPP_BASICO = 'https://wa.me/5544999856245?text=' + encodeURIComponent('Olá Guilherme! Quero assinar o Plano Básico do Bravvi ERP Têxtil por R$ 107/mês com Implantação Grátis.');
  const LINK_WHATSAPP_MENSAL = 'https://wa.me/5544999856245?text=' + encodeURIComponent('Olá Guilherme! Quero assinar o Plano Pro Industrial do Bravvi ERP Têxtil por R$ 227/mês com Implantação Grátis.');
  const LINK_WHATSAPP_ANUAL = 'https://wa.me/5544999856245?text=' + encodeURIComponent('Olá Guilherme! Quero contratar o Plano Anual Pro do Bravvi ERP Têxtil (12x de R$ 189 ou R$ 1.890/ano à vista).');
  const LINK_WHATSAPP_TREINAMENTO = 'https://wa.me/5544999856245?text=' + encodeURIComponent('Olá Guilherme! Quero contratar o Treinamento Dedicado VIP da Equipe (R$ 297 taxa única).');

  // Paraguai 🇵🇾 ($19 / $39 USD)
  const LINK_WHATSAPP_BASICO_PY = 'https://wa.me/5544999856245?text=' + encodeURIComponent('¡Hola! Escribo desde Paraguay y quiero contratar el Plan Básico ($19 USD/mes) para mi taller de confección.');
  const LINK_WHATSAPP_PRO_PY = 'https://wa.me/5544999856245?text=' + encodeURIComponent('¡Hola! Escribo desde Paraguay y quiero contratar el Plan Pro Industrial ($39 USD/mes) del ERP Bravvi.');

  // Portugal 🇵🇹 (€ 19 / € 39)
  const LINK_WHATSAPP_BASICO_PT = 'https://wa.me/5544999856245?text=' + encodeURIComponent('Olá! Escrevo de Portugal e pretendo aderir ao Plano Básico (€ 19/mês) para a minha confeção têxtil.');
  const LINK_WHATSAPP_PRO_PT = 'https://wa.me/5544999856245?text=' + encodeURIComponent('Olá! Escrevo de Portugal e pretendo aderir ao Plano Pro Industrial (€ 39/mês) do Bravvi ERP Têxtil.');

  // Configuração padrão dos planos e valores oficiais
  const PLANOS_CONFIG = {
    basico: {
      id: 'plano_basico_107',
      nome: 'Plano Básico Confecção',
      valor: 107.00,
      valorFormatado: 'R$ 107,00',
      periodo: '/mês',
      parcelamento: 'Sem fidelidade • Cancele quando quiser • Implantação R$ 0',
      destaque: false,
      badge: 'Mais Acessível • Para Começar Rápido',
      descricao: 'Ideal para oficinas, pequenas confecções e facções que precisam organizar pedidos, fichas e orçamentos sem complicação.',
      itens: [
        'Até 2 usuários de acesso',
        'Taxa de Implantação: R$ 0 (100% Gratuita)',
        'Orçamentos rápidos com fotos e mockups',
        'Fichas Técnicas básicas (P ao GG)',
        'Controle essencial de pedidos e entregas',
        'Catálogo de produtos e tecidos',
        'Tutoriais em vídeo inclusos',
        'Suporte técnico via WhatsApp'
      ],
      linkPadrao: LINK_CAKTO_BASICO_107
    },
    pro: {
      id: 'plano_pro_227',
      nome: 'Plano Pro Industrial',
      valor: 227.00,
      valorFormatado: 'R$ 227,00',
      periodo: '/mês',
      parcelamento: 'Sem fidelidade • Cancele quando quiser • Implantação R$ 0',
      destaque: true,
      badge: 'Mais Completo • Automatização Total',
      descricao: 'Todas as ferramentas industriais liberadas para confecções e fábricas que querem escalar e zerar desperdícios.',
      itens: [
        'Usuários e computadores ILIMITADOS',
        'Taxa de Implantação: R$ 0 (100% Gratuita)',
        'Radar de Prazos Industrial com alertas anti-atraso',
        'Fichas Técnicas A4 com Grade Infantil ao G5',
        'Otimizador de Bobina DTF Nesting (economia de tecido)',
        'Emissor de NF-e Focus/SEFAZ Modelo 55 integrado',
        'Portal do Cliente (nomes e números no celular)',
        'DRE Gerencial & Lucro Real por Pedido',
        'Gestão de Facções e Terceirizados',
        'Suporte Prioritário VIP no WhatsApp'
      ],
      linkPadrao: LINK_CAKTO_PRO_227
    },
    mensal: {
      id: 'plano_pro_227',
      nome: 'Plano Pro Industrial',
      valor: 227.00,
      valorFormatado: 'R$ 227,00',
      periodo: '/mês',
      parcelamento: 'Sem fidelidade • Cancele quando quiser • Implantação R$ 0',
      destaque: true,
      badge: 'Mais Completo • Automatização Total',
      descricao: 'Todas as ferramentas industriais liberadas para confecções e fábricas que querem escalar e zerar desperdícios.',
      itens: [
        'Usuários e computadores ILIMITADOS',
        'Taxa de Implantação: R$ 0 (100% Gratuita)',
        'Radar de Prazos Industrial com alertas anti-atraso',
        'Fichas Técnicas A4 com Grade Infantil ao G5',
        'Otimizador de Bobina DTF Nesting (economia de tecido)',
        'Emissor de NF-e Focus/SEFAZ Modelo 55 integrado',
        'Portal do Cliente (nomes e números no celular)',
        'DRE Gerencial & Lucro Real por Pedido',
        'Gestão de Facções e Terceirizados',
        'Suporte Prioritário VIP no WhatsApp'
      ],
      linkPadrao: LINK_CAKTO_PRO_227
    },
    anual: {
      id: 'plano_anual_1890',
      nome: 'Plano Anual Pro Industrial',
      valor: 1890.00,
      valorFormatado: 'R$ 1.890,00',
      periodo: '/ano à vista',
      parcelamento: 'Ou 12x de R$ 189,00 no cartão de crédito',
      destaque: true,
      badge: 'Mais Escolhido • Economize R$ 834 no ano',
      descricao: 'O melhor custo-benefício para confecções com desconto anual garantido (menos de R$ 158/mês).',
      itens: [
        'Tudo do Plano Mensal incluso',
        'Taxa de Implantação: R$ 0 (100% Gratuita)',
        'Economia de R$ 834,00 no ano (paga 10 meses, usa 12 meses)',
        'Parcelamento em até 12x no cartão de crédito ou Pix',
        'Otimizador de Bobina DTF Nesting Avançado',
        'Portal do Cliente ilimitado para equipes e facções',
        'Suporte Prioritário VIP com fila acelerada no WhatsApp',
        'Backup automático na nuvem'
      ],
      linkPadrao: LINK_CAKTO_PRO_227
    },
    treinamento_equipe: {
      id: 'treinamento_vip_equipe_297',
      nome: 'Treinamento Dedicado VIP da Equipe (Opcional)',
      valor: 297.00,
      valorFormatado: 'R$ 297,00',
      periodo: 'taxa única (opcional)',
      parcelamento: 'Sessão ao vivo de 2 horas (Vendas + Chão de Fábrica)',
      destaque: false,
      badge: 'Add-on Opcional • Só se a empresa quiser',
      descricao: 'A implantação do sistema é 100% grátis com tutoriais guiados. Se a sua fábrica quiser uma consultoria ao vivo com especialista têxtil para treinar seus vendedores e chão de fábrica em videoconferência, adicione este treinamento opcional.',
      itens: [
        'Sessão ao vivo de 2 horas com Especialista Têxtil',
        'Treinamento prático de Vendas (orçamento com foto em 2 min)',
        'Treinamento de Produção (leitura de Ficha A4 e Radar)',
        'Parametrização assistida do catálogo inicial de tecidos',
        'Tira-dúvidas ao vivo com a sua equipe no Google Meet/WhatsApp'
      ],
      linkPadrao: LINK_WHATSAPP_TREINAMENTO
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
      linkBasico: LINK_CAKTO_BASICO_107,
      linkMensal: LINK_CAKTO_PRO_227,
      linkPro: LINK_CAKTO_PRO_227,
      linkAnual: LINK_CAKTO_PRO_227,
      linkCombo: LINK_WHATSAPP_COMBO,
      linkSetup: LINK_WHATSAPP_SETUP,
      apiKey: '',
      whatsappSuporte: WHATSAPP_SUPORTE
    };
    if (data) {
      data.linkBasico = LINK_CAKTO_BASICO_107;
      data.linkMensal = LINK_CAKTO_PRO_227;
      data.linkPro = LINK_CAKTO_PRO_227;
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

    // 1. Plano Básico R$ 107
    if (planoKey === 'basico' || planoKey === 'plano_basico_107') {
      return config.linkBasico || LINK_CAKTO_BASICO_107;
    }

    // 2. Plano Pro R$ 227 / Mensal
    if (planoKey === 'pro' || planoKey === 'mensal' || planoKey === 'plano_pro_227') {
      return config.linkPro || config.linkMensal || LINK_CAKTO_PRO_227;
    }

    // 3. Anual Pro
    if (planoKey === 'anual') {
      return config.linkAnual || LINK_CAKTO_PRO_227;
    }

    // 4. Planos Paraguai 🇵🇾 ($19 / $39 USD)
    if (planoKey === 'basico_py') return LINK_WHATSAPP_BASICO_PY;
    if (planoKey === 'pro_py') return LINK_WHATSAPP_PRO_PY;

    // 5. Planos Portugal 🇵🇹 (€ 19 / € 39)
    if (planoKey === 'basico_pt') return LINK_WHATSAPP_BASICO_PT;
    if (planoKey === 'pro_pt') return LINK_WHATSAPP_PRO_PT;

    // 6. Treinamento VIP opcional
    if (planoKey === 'treinamento' || planoKey === 'treinamento_equipe') return LINK_WHATSAPP_TREINAMENTO;

    // 7. Combos e legado
    if (planoKey === 'anual_implementacao') return LINK_WHATSAPP_COMBO;
    if (planoKey === 'implementacao_avulsa') return LINK_WHATSAPP_SETUP;

    return plano.linkPadrao || LINK_CAKTO_BASICO_107;
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
            <label style="display: block; font-size: 11.5px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">Link do Plano Mensal (R$ 227,00):</label>
            <input type="url" id="cfgIpLinkMensal" value="${config.linkMensal || ''}" placeholder="https://pay.infinitepay.io/..." style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; font-size: 12px; box-sizing: border-box;">
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: block; font-size: 11.5px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">Link do Plano Anual (R$ 1.890,00 ou 12x de R$ 189):</label>
            <input type="url" id="cfgIpLinkAnual" value="${config.linkAnual || ''}" placeholder="https://pay.infinitepay.io/..." style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; font-size: 12px; box-sizing: border-box;">
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: block; font-size: 11.5px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">Link Treinamento VIP Equipe Opcional (R$ 297,00):</label>
            <input type="url" id="cfgIpLinkCombo" value="${config.linkCombo || ''}" placeholder="https://pay.infinitepay.io/..." style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; font-size: 12px; box-sizing: border-box;">
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 11.5px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">WhatsApp Comercial de Suporte (DDD + Número):</label>
            <input type="text" id="cfgIpWhatsapp" value="${config.whatsappSuporte || '5544999856245'}" placeholder="5544999856245" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; font-size: 12px; box-sizing: border-box;">
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
        whatsappSuporte: overlay.querySelector('#cfgIpWhatsapp').value.replace(/\D/g, '') || '5544999856245'
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
