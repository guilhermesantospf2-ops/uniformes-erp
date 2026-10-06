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
      linkPadrao: 'https://infinitepay.io/pay'
    },
    anual: {
      id: 'plano_anual_3564',
      nome: 'Plano Anual Pro Industrial',
      valor: 3564.00,
      valorFormatado: 'R$ 3.564,00',
      periodo: '/ano à vista',
      parcelamento: 'Ou em até 12x de R$ 297,00 no cartão via InfinitePay',
      destaque: true,
      badge: 'Mais Escolhido • Economize R$ 1.200 (3 meses grátis)',
      descricao: 'O melhor custo-benefício para indústrias têxteis com desconto anual garantido.',
      itens: [
        'Tudo do Plano Mensal incluso',
        'Economia de R$ 1.200,00 no ano (paga 9 meses, usa 12 meses)',
        'Parcelamento em até 12x sem complicação no cartão',
        'Suporte Prioritário VIP com fila acelerada no WhatsApp',
        'Atualizações contínuas de novos recursos',
        'Backup automático na nuvem'
      ],
      linkPadrao: 'https://infinitepay.io/pay'
    },
    anual_implementacao: {
      id: 'plano_anual_vip_setup',
      nome: 'Combo Anual Pro + Implementação VIP',
      valor: 4290.00,
      valorFormatado: 'R$ 4.290,00',
      periodo: '/ano à vista',
      parcelamento: 'Ou em até 12x de R$ 397,00 no cartão via InfinitePay',
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
      linkPadrao: 'https://infinitepay.io/pay'
    },
    implementacao_avulsa: {
      id: 'setup_implementacao_997',
      nome: 'Implementação Operacional & Setup VIP',
      valor: 997.00,
      valorFormatado: 'R$ 997,00',
      periodo: 'taxa única',
      parcelamento: 'Ou em até 6x no cartão via InfinitePay',
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
      linkPadrao: 'https://infinitepay.io/pay'
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
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('[InfinitePay] Erro ao carregar config:', e);
    }
    return {
      handle: '', // ex: 'bravvitextil'
      linkMensal: '', // Link direto de pagamento InfinitePay para R$ 397
      linkAnual: '', // Link direto de pagamento InfinitePay para R$ 3.564
      linkCombo: '', // Link direto de pagamento InfinitePay para R$ 4.290
      linkSetup: '', // Link direto de pagamento InfinitePay para R$ 997
      apiKey: '',
      whatsappSuporte: '5511987654321'
    };
  }

  function salvarConfiguracoes(novaConfig) {
    const atual = carregarConfiguracoes();
    const mesclado = { ...atual, ...novaConfig };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mesclado));
    return mesclado;
  }

  /**
   * Obtém a URL final de pagamento da InfinitePay para um plano específico
   */
  function obterLinkPagamentoPlano(planoKey) {
    const plano = PLANOS_CONFIG[planoKey] || PLANOS_CONFIG.mensal;
    const config = carregarConfiguracoes();

    // 1. Link direto configurado para o plano
    if (planoKey === 'mensal' && config.linkMensal) return config.linkMensal;
    if (planoKey === 'anual' && config.linkAnual) return config.linkAnual;
    if (planoKey === 'anual_implementacao' && config.linkCombo) return config.linkCombo;
    if (planoKey === 'implementacao_avulsa' && config.linkSetup) return config.linkSetup;

    // 2. Se o usuário informou um handle da InfinitePay (ex: 'minhaconfeccao')
    if (config.handle) {
      const handleLimpo = config.handle.trim().replace(/^@/, '');
      return `https://infinitepay.io/pay/${handleLimpo}?amount=${(plano.valor).toFixed(2)}&description=${encodeURIComponent(plano.nome)}`;
    }

    // 3. Fallback inteligente: redireciona para o checkout oficial InfinitePay ou WhatsApp comercial
    return `https://wa.me/${config.whatsappSuporte}?text=${encodeURIComponent(
      `Olá! Quero assinar o ${plano.nome} no valor de ${plano.valorFormatado} via InfinitePay (Cartão de Crédito em até 12x ou Pix). Pode me enviar o link de pagamento?`
    )}`;
  }

  /**
   * Abre o Modal de Checkout Oficial InfinitePay no sistema
   */
  function abrirModalCheckout(planoKey = 'mensal') {
    const modalExistente = document.getElementById('modalCheckoutInfinitePay');
    if (modalExistente) modalExistente.remove();

    const plano = PLANOS_CONFIG[planoKey] || PLANOS_CONFIG.mensal;
    const linkPagamento = obterLinkPagamentoPlano(planoKey);
    const config = carregarConfiguracoes();

    const overlay = document.createElement('div');
    overlay.id = 'modalCheckoutInfinitePay';
    overlay.className = 'modal-overlay active';
    overlay.style.zIndex = '999999';
    overlay.innerHTML = `
      <div class="modal-box" style="max-width: 640px; border-radius: 14px; overflow: hidden; box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.5); margin: 20px auto; background: #ffffff;">
        
        <!-- Header InfinitePay + Bravvi -->
        <div style="background: linear-gradient(135deg, #032b35 0%, #044343 100%); padding: 18px 24px; color: #ffffff; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2dd4bf;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="background: rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 6px 10px; display: flex; align-items: center; gap: 6px;">
              <span style="font-weight: 900; font-size: 15px; color: #2dd4bf; letter-spacing: -0.5px;">BRAVVI</span>
              <span style="color: #94a3b8; font-size: 12px;">×</span>
              <span style="font-weight: 800; font-size: 13px; color: #ffffff;">InfinitePay</span>
            </div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #ffffff;">Checkout Seguro de Assinatura</div>
              <div style="font-size: 11.5px; color: #a7f3d0;">Cartão de Crédito até 12x ou Pix Instantâneo</div>
            </div>
          </div>
          <button id="btnFecharCheckoutIP" style="color: #94a3b8; font-size: 26px; background: none; border: none; cursor: pointer; line-height: 1; padding: 4px;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#94a3b8'">&times;</button>
        </div>

        <!-- Conteúdo do Modal -->
        <div style="padding: 22px 24px; max-height: calc(85vh - 120px); overflow-y: auto;">
          
          <!-- Seletor de Planos Rápido -->
          <div style="margin-bottom: 18px;">
            <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
              Selecione a Modalidade Desejada:
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <button type="button" class="btn-trocar-plano ${planoKey === 'mensal' ? 'ativo' : ''}" data-plano="mensal" style="text-align: left; padding: 12px 14px; border: 2px solid ${planoKey === 'mensal' ? '#0d9488' : '#e2e8f0'}; background: ${planoKey === 'mensal' ? '#f0fdfa' : '#ffffff'}; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong style="font-size: 13px; color: #0f172a;">Mensal Flexível</strong>
                  <span style="font-size: 9px; font-weight: 800; background: #e2e8f0; color: #475569; padding: 2px 6px; border-radius: 4px;">SEM FIDELIDADE</span>
                </div>
                <div style="font-size: 16px; font-weight: 900; color: #0f766e; margin-top: 4px;">R$ 397 <span style="font-size: 11px; font-weight: 500; color: #64748b;">/mês</span></div>
              </button>

              <button type="button" class="btn-trocar-plano ${planoKey === 'anual' ? 'ativo' : ''}" data-plano="anual" style="text-align: left; padding: 12px 14px; border: 2px solid ${planoKey === 'anual' ? '#0d9488' : '#e2e8f0'}; background: ${planoKey === 'anual' ? '#f0fdfa' : '#ffffff'}; border-radius: 8px; cursor: pointer; transition: all 0.2s; position: relative;">
                <span style="position: absolute; top: -8px; right: 8px; font-size: 8.5px; font-weight: 800; background: #059669; color: #ffffff; padding: 2px 6px; border-radius: 10px;">MAIS ESCOLHIDO</span>
                <strong style="font-size: 13px; color: #0f172a;">Anual Pro Econômico</strong>
                <div style="font-size: 16px; font-weight: 900; color: #047857; margin-top: 4px;">12x R$ 297 <span style="font-size: 11px; font-weight: 500; color: #64748b;">(R$ 3.564/ano)</span></div>
              </button>
            </div>

            <!-- Botão Opção com Implementação -->
            <div style="margin-top: 10px;">
              <button type="button" class="btn-trocar-plano ${planoKey === 'anual_implementacao' ? 'ativo' : ''}" data-plano="anual_implementacao" style="width: 100%; text-align: left; padding: 10px 14px; border: 2px solid ${planoKey === 'anual_implementacao' ? '#0d9488' : '#e2e8f0'}; background: ${planoKey === 'anual_implementacao' ? '#f0fdfa' : '#f8fafc'}; border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 12px;">⭐</span>
                    <strong style="font-size: 12.5px; color: #0f172a;">Combo Anual + Implementação VIP Acompanhada</strong>
                  </div>
                  <span style="font-size: 11px; color: #64748b;">Acesso de 1 ano + setup completo por especialista e equipe treinada</span>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 14px; font-weight: 900; color: #0f766e;">12x R$ 397</span>
                  <span style="display: block; font-size: 10px; color: #64748b;">(R$ 4.290 à vista)</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Card Resumo do Plano Selecionado -->
          <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <div>
                <span style="display: inline-block; font-size: 10px; font-weight: 800; background: #047857; color: #ffffff; padding: 2px 8px; border-radius: 4px; margin-bottom: 4px;">
                  ${plano.badge}
                </span>
                <h3 style="font-size: 17px; font-weight: 800; color: #0f172a; margin: 0;">${plano.nome}</h3>
                <p style="font-size: 11.5px; color: #64748b; margin: 2px 0 0 0;">${plano.descricao}</p>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 24px; font-weight: 900; color: #032b35; line-height: 1.1;">${plano.valorFormatado}</div>
                <div style="font-size: 11px; font-weight: 700; color: #0d9488;">${plano.periodo}</div>
              </div>
            </div>

            <div style="font-size: 11.5px; color: #047857; font-weight: 700; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 6px 10px; border-radius: 6px; margin-bottom: 14px; display: flex; align-items: center; gap: 6px;">
              <span>💳</span>
              <span>${plano.parcelamento}</span>
            </div>

            <!-- O que está incluso -->
            <div style="font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; margin-bottom: 8px;">
              Incluso nesta contratação:
            </div>
            <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #334155; line-height: 1.6;">
              ${plano.itens.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>

          <!-- Seção Explicativa: O que é a Implementação -->
          <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;" id="toggleExplicacaoImplementacao">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">💡</span>
                <strong style="font-size: 13px; color: #115e59;">O que é a Implementação Acompanhada? (Clique para ver detalhes)</strong>
              </div>
              <span id="setaToggleImplementacao" style="font-size: 12px; font-weight: 800; color: #0d9488;">▼</span>
            </div>

            <div id="corpoExplicacaoImplementacao" style="display: none; margin-top: 14px; border-top: 1px solid #ccfbf1; padding-top: 12px;">
              <p style="font-size: 12px; color: #134e4a; margin: 0 0 12px 0; line-height: 1.45;">
                A Implementação é um serviço consultivo em que um especialista sênior da Bravvi coloca a sua confecção para operar com o sistema em <strong>menos de 48 horas</strong>, sem que você precise perder tempo cadastrando do zero:
              </p>
              
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${DETALHAMENTO_IMPLEMENTACAO.map(d => `
                  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px;">
                    <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 800; color: #0f172a;">
                      <span>${d.icone}</span>
                      <span>${d.titulo}</span>
                    </div>
                    <p style="font-size: 11.5px; color: #475569; margin: 4px 0 0 0; line-height: 1.4;">${d.descricao}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Métodos de Pagamento InfinitePay Aceitos -->
          <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 11px; font-weight: 800; color: #475569;">PAGUE COM:</span>
              <span style="font-size: 11px; font-weight: 700; color: #047857; background: #ecfdf5; padding: 2px 6px; border-radius: 4px;">⚡ PIX Instantâneo</span>
              <span style="font-size: 11px; font-weight: 700; color: #1d4ed8; background: #eff6ff; padding: 2px 6px; border-radius: 4px;">💳 Cartão até 12x</span>
            </div>
            <div style="font-size: 10.5px; color: #64748b; font-weight: 600;">
              Processamento Criptografado InfinitePay
            </div>
          </div>

          <!-- Botões de Ação Final -->
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <a href="${linkPagamento}" target="_blank" id="btnIrParaCheckoutInfinitePay" style="display: flex; align-items: center; justify-content: center; gap: 8px; background: #047857; color: #ffffff; padding: 14px 20px; border-radius: 8px; font-size: 14px; font-weight: 800; text-decoration: none; box-shadow: 0 4px 12px rgba(4, 120, 87, 0.3); transition: all 0.2s;" onmouseover="this.style.background='#065f46'" onmouseout="this.style.background='#047857'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              <span>Pagar ${plano.valorFormatado} com InfinitePay &rarr;</span>
            </a>

            <div style="display: flex; gap: 10px;">
              <a href="https://wa.me/${config.whatsappSuporte}?text=${encodeURIComponent(
                `Olá! Estou finalizando a contratação do ${plano.nome} (${plano.valorFormatado}) e gostaria de tirar uma dúvida sobre a forma de pagamento via InfinitePay.`
              )}" target="_blank" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; background: #ffffff; border: 1.5px solid #cbd5e1; color: #334155; padding: 10px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; text-decoration: none;">
                💬 Tirar Dúvidas pelo WhatsApp
              </a>

              <button type="button" id="btnConfigurarLinksIP" style="display: flex; align-items: center; justify-content: center; gap: 6px; background: #f8fafc; border: 1px solid #cbd5e1; color: #64748b; padding: 10px 14px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer;">
                ⚙️ Configurar Links
              </button>
            </div>
          </div>

        </div>

      </div>
    `;

    const container = document.getElementById('modalContainer') || document.body;
    container.appendChild(overlay);

    // Eventos do Modal
    const fechar = () => overlay.remove();
    overlay.querySelector('#btnFecharCheckoutIP')?.addEventListener('click', fechar);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) fechar();
    });

    // Troca de planos interativa
    overlay.querySelectorAll('.btn-trocar-plano').forEach(btn => {
      btn.addEventListener('click', () => {
        const novoPlano = btn.getAttribute('data-plano');
        fechar();
        abrirModalCheckout(novoPlano);
      });
    });

    // Toggle da explicação de Implementação
    const toggleImp = overlay.querySelector('#toggleExplicacaoImplementacao');
    const corpoImp = overlay.querySelector('#corpoExplicacaoImplementacao');
    const setaImp = overlay.querySelector('#setaToggleImplementacao');
    if (toggleImp && corpoImp) {
      toggleImp.addEventListener('click', () => {
        const aberto = corpoImp.style.display !== 'none';
        corpoImp.style.display = aberto ? 'none' : 'block';
        if (setaImp) setaImp.textContent = aberto ? '▼' : '▲';
      });
    }

    // Configurar credenciais InfinitePay
    overlay.querySelector('#btnConfigurarLinksIP')?.addEventListener('click', () => {
      fechar();
      abrirModalConfiguracoesInfinitePay(planoKey);
    });
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
            <label style="display: block; font-size: 11.5px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">Link do Plano Anual (R$ 3.564,00 em até 12x):</label>
            <input type="url" id="cfgIpLinkAnual" value="${config.linkAnual || ''}" placeholder="https://pay.infinitepay.io/..." style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; font-size: 12px; box-sizing: border-box;">
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: block; font-size: 11.5px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">Link Combo Anual + Implementação (R$ 4.290,00):</label>
            <input type="url" id="cfgIpLinkCombo" value="${config.linkCombo || ''}" placeholder="https://pay.infinitepay.io/..." style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; font-size: 12px; box-sizing: border-box;">
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 11.5px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">WhatsApp Comercial de Suporte (DDD + Número):</label>
            <input type="text" id="cfgIpWhatsapp" value="${config.whatsappSuporte || '5511987654321'}" placeholder="5511999999999" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; font-size: 12px; box-sizing: border-box;">
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; font-size: 11px; color: #64748b; line-height: 1.4;">
            💡 <em>Dica:</em> No app da InfinitePay no seu celular, vá em <strong>Cobrar &rarr; Link de Pagamento</strong>, crie os links com os valores e cole aqui.
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
        whatsappSuporte: overlay.querySelector('#cfgIpWhatsapp').value.replace(/\D/g, '') || '5511987654321'
      };
      salvarConfiguracoes(novaCfg);
      fechar();
      abrirModalCheckout(retornarPlano);
    });
  }

  // Inicialização e Exposição Global
  window.InfinitePayEngine = {
    PLANOS_CONFIG,
    DETALHAMENTO_IMPLEMENTACAO,
    carregarConfiguracoes,
    salvarConfiguracoes,
    obterLinkPagamentoPlano,
    abrirModalCheckout,
    abrirModalConfiguracoes: abrirModalConfiguracoesInfinitePay
  };

  // Atalho global direto
  window.abrirModalCheckoutInfinitePay = abrirModalCheckout;
  if (!window.ERP) window.ERP = {};
  window.ERP.abrirModalPlanosAssinatura = () => abrirModalCheckout('mensal');
  window.ERP.abrirModalCheckoutInfinitePay = abrirModalCheckout;

})();
