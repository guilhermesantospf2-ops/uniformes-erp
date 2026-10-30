/**
 * BRAVVI ERP TÊXTIL - MOTOR DE MOEDA MULTI-PAÍS (SEM TRADUÇÃO DE TEXTO)
 * 100% em Português nativo. Altera exclusivamente a formatação monetária (R$, US$, Gs., €).
 */
(function() {
  'use strict';

  const CATALOGO = [
    {
      code: 'BRL',
      legacyCodes: ['pt-BR', 'BRL'],
      nome: 'Real Brasileiro (Brasil)',
      flag: '🇧🇷',
      moeda: 'BRL',
      simbolo: 'R$',
      locale: 'pt-BR',
      casasDecimais: 2
    },
    {
      code: 'USD',
      legacyCodes: ['en', 'es', 'USD'],
      nome: 'Dólar Americano (Paraguai / Internacional)',
      flag: '🇺🇸',
      moeda: 'USD',
      simbolo: 'US$',
      locale: 'en-US',
      casasDecimais: 2
    },
    {
      code: 'PYG',
      legacyCodes: ['es-PY', 'PYG'],
      nome: 'Guarani Paraguaio (Paraguai)',
      flag: '🇵🇾',
      moeda: 'PYG',
      simbolo: 'Gs.',
      locale: 'es-PY',
      casasDecimais: 0
    },
    {
      code: 'EUR',
      legacyCodes: ['pt-PT', 'fr', 'de', 'it', 'EUR'],
      nome: 'Euro (Portugal / Europa)',
      flag: '🇪🇺',
      moeda: 'EUR',
      simbolo: '€',
      locale: 'pt-PT',
      casasDecimais: 2
    }
  ];

  function resolverCodigoMoeda(valorSalvo) {
    if (!valorSalvo) return 'BRL';
    const encontrado = CATALOGO.find(
      c => c.code === valorSalvo || (c.legacyCodes && c.legacyCodes.includes(valorSalvo))
    );
    return encontrado ? encontrado.code : 'BRL';
  }

  let moedaAtual = resolverCodigoMoeda(
    localStorage.getItem('bravvi_currency') || localStorage.getItem('bravvi_language')
  );

  function obterConfig() {
    return CATALOGO.find(c => c.code === moedaAtual) || CATALOGO[0];
  }

  function formatarMoeda(valor) {
    const cfg = obterConfig();
    const num = Number(valor) || 0;
    if (cfg.moeda === 'PYG') {
      const formatado = new Intl.NumberFormat('es-PY', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(Math.round(num));
      return `Gs. ${formatado}`;
    }
    try {
      return new Intl.NumberFormat(cfg.locale, {
        style: 'currency',
        currency: cfg.moeda,
        minimumFractionDigits: cfg.casasDecimais,
        maximumFractionDigits: cfg.casasDecimais
      }).format(num);
    } catch (e) {
      return `${cfg.simbolo} ${num.toFixed(cfg.casasDecimais)}`;
    }
  }

  function formatarNumero(valor) {
    const cfg = obterConfig();
    return new Intl.NumberFormat(cfg.locale).format(valor || 0);
  }

  function formatarK(valor) {
    const cfg = obterConfig();
    if (valor === undefined || valor === null || isNaN(valor)) return `${cfg.simbolo} 0`;
    const num = Number(valor);
    const absVal = Math.abs(num);
    if (absVal === 0) return `${cfg.simbolo} 0`;
    const prefix = num < 0 ? '-' : '';
    if (absVal >= 1000) {
      const milhar = (absVal / 1000).toFixed(absVal % 1000 === 0 ? 0 : 1).replace('.0', '');
      return `${prefix}${cfg.simbolo} ${milhar}k`;
    }
    return `${prefix}${cfg.simbolo} ${absVal.toFixed(0)}`;
  }

  // Funções de tradução desativadas intencionalmente: mantém 100% em Português sem bugs
  function traduzirTexto(textoOriginal) {
    return textoOriginal;
  }

  function traduzirElemento() {
    // Sem mutação de texto no DOM
  }

  function atualizarBotaoHeader() {
    const cfg = obterConfig();
    document.documentElement.lang = 'pt-BR';
    const flagEl = document.getElementById('headerLangFlag');
    const textEl = document.getElementById('headerLangText');
    if (flagEl) flagEl.textContent = cfg.flag;
    if (textEl) textEl.textContent = `${cfg.simbolo} (${cfg.moeda})`;
  }

  function traduzirPaginaCompleta() {
    atualizarBotaoHeader();
  }

  function abrirModalIdioma() {
    let modal = document.getElementById('bravviLanguageModal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'bravviLanguageModal';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); z-index: 999999; display: flex; align-items: center; justify-content: center; padding: 16px;';

    const cardsHtml = CATALOGO.map(c => {
      const isAtivo = c.code === moedaAtual;
      return `
        <div class="lang-option" onclick="window.ERP_I18N.selecionarIdioma('${c.code}')" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-radius: 10px; border: 1.5px solid ${isAtivo ? '#0d9488' : '#e2e8f0'}; background: ${isAtivo ? '#f0fdfa' : '#ffffff'}; cursor: pointer; transition: all 0.15s ease;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">${c.flag}</span>
            <div>
              <div style="font-size: 14px; font-weight: ${isAtivo ? '800' : '700'}; color: ${isAtivo ? '#0f766e' : '#0f172a'};">${c.nome}</div>
              <div style="font-size: 12px; color: #64748b;">Símbolo no sistema: <strong>${c.simbolo} (${c.moeda})</strong></div>
            </div>
          </div>
          ${isAtivo ? '<span style="color: #0d9488; font-weight: 800; font-size: 13px;">✓ Ativa</span>' : '<span style="font-size: 12px; color: #64748b; font-weight: 700;">Usar Moeda &rarr;</span>'}
        </div>
      `;
    }).join('');

    modal.innerHTML = `
      <div class="modal-box" style="background: #ffffff; border-radius: 14px; max-width: 480px; width: 100%; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid #e2e8f0; overflow: hidden;">
        <div style="padding: 18px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div>
            <div style="font-size: 16px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px;">
              <span>💵</span> Moeda do Sistema
            </div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
              Escolha a moeda exibida nos pedidos, orçamentos e financeiro
            </div>
          </div>
          <button type="button" id="btnCloseLangModal" style="background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; padding: 4px 8px;">&times;</button>
        </div>

        <div style="padding: 16px 24px; display: flex; flex-direction: column; gap: 10px;">
          ${cardsHtml}
        </div>

        <div style="padding: 14px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #64748b;">
          <div>O idioma do sistema permanece 100% em Português.</div>
          <button type="button" id="btnCancelLangModal" class="btn btn-secondary btn-sm" style="padding: 6px 14px; font-size: 12px;">Fechar</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('btnCloseLangModal').onclick = () => modal.remove();
    document.getElementById('btnCancelLangModal').onclick = () => modal.remove();
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
  }

  function selecionarIdioma(code) {
    if (!code) return;
    const resolvido = resolverCodigoMoeda(code);
    const item = CATALOGO.find(c => c.code === resolvido);
    if (!item) return;

    moedaAtual = item.code;
    localStorage.setItem('bravvi_currency', moedaAtual);
    localStorage.setItem('bravvi_language', 'pt-BR');

    const modal = document.getElementById('bravviLanguageModal');
    if (modal) modal.remove();

    atualizarBotaoHeader();

    let aba = 'abertura';
    if (window.ERP && typeof window.ERP.obterAbaAtiva === 'function') {
      aba = window.ERP.obterAbaAtiva();
    } else if (window.ERP && typeof window.ERP.abaAtiva === 'function') {
      aba = window.ERP.abaAtiva();
    } else {
      const activeMenu = document.querySelector('.menu-item.active[data-aba]');
      if (activeMenu) aba = activeMenu.getAttribute('data-aba');
    }

    if (window.ERP && typeof window.ERP.navegarPara === 'function') {
      window.ERP.navegarPara(aba);
    }

    if (window.ERP && typeof window.ERP.mostrarToast === 'function') {
      window.ERP.mostrarToast(`Moeda alterada para ${item.nome} (${item.simbolo})`, 'sucesso');
    }
  }

  function instalarObserver() {
    // Sem observer de tradução DOM
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', atualizarBotaoHeader);
  } else {
    setTimeout(atualizarBotaoHeader, 20);
  }

  window.ERP_I18N = {
    idiomaAtual: () => 'pt-BR',
    moedaAtual: () => moedaAtual,
    obterConfig,
    formatarMoeda,
    formatarNumero,
    formatarK,
    traduzirTexto,
    traduzirElemento,
    traduzirPaginaCompleta,
    abrirModalIdioma,
    selecionarIdioma,
    instalarObserver,
    catalogo: CATALOGO
  };
})();
