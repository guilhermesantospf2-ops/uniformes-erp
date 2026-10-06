/**
 * ============================================================================
 * BRAVVI ERP TÊXTIL — MOTOR PIX & SISTEMATIZAÇÃO DE COBRANÇAS
 * ============================================================================
 * Geração de Payload BR Code (Padrão Oficial BACEN EMVCo), QR Code Vetorial SVG
 * e Mensagens de Cobrança com 1 clique para WhatsApp.
 * 100% Offline, direto no navegador, sem taxas de gateways terceiros.
 * ============================================================================
 */

(function () {
  'use strict';

  const PixEngine = {
    /**
     * Formata um campo no padrão TLV (Tag-Length-Value)
     */
    formatTLV: function (id, value) {
      if (value === null || value === undefined) return '';
      const strVal = String(value);
      const len = String(strVal.length).padStart(2, '0');
      return `${id}${len}${strVal}`;
    },

    /**
     * Remove acentos e caracteres não suportados pelo BACEN (maxLen opcional)
     */
    sanitizeText: function (str, maxLen) {
      if (!str) return '';
      const clean = str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .trim();
      return maxLen ? clean.substring(0, maxLen) : clean;
    },

    /**
     * Normaliza a chave PIX de acordo com o tipo
     */
    normalizarChave: function (chave, tipo) {
      if (!chave) return '';
      const c = chave.trim();
      const t = (tipo || '').toUpperCase();

      if (t.includes('CNPJ') || t.includes('CPF')) {
        return c.replace(/\D/g, '');
      }
      if (t.includes('TELEFONE') || t.includes('CELULAR')) {
        let digits = c.replace(/\D/g, '');
        if (digits.length <= 11 && !digits.startsWith('55')) {
          digits = '55' + digits;
        }
        return '+' + digits;
      }
      if (t.includes('E-MAIL') || t.includes('EMAIL')) {
        return c.toLowerCase();
      }
      // Chave aleatória / EVP
      return c;
    },

    /**
     * Calcula o CRC16-CCITT (Polinômio 0x1021, valor inicial 0xFFFF)
     */
    calcularCRC16: function (payload) {
      let crc = 0xFFFF;
      for (let i = 0; i < payload.length; i++) {
        crc ^= payload.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
          if ((crc & 0x8000) !== 0) {
            crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
          } else {
            crc = (crc << 1) & 0xFFFF;
          }
        }
      }
      return crc.toString(16).toUpperCase().padStart(4, '0');
    },

    /**
     * Gera o código BR Code oficial do BACEN para Copia e Cola
     */
    gerarPayload: function ({
      chave,
      tipoChave = 'CNPJ',
      nome = 'Bravvi Industria Textil',
      cidade = 'Americana',
      valor = null,
      txId = '***',
      descricao = ''
    }) {
      if (!chave) {
        throw new Error('Chave PIX não informada');
      }

      const chaveLimpa = this.normalizarChave(chave, tipoChave);
      const nomeLimpo = this.sanitizeText(nome, 25) || 'BRAVVI TEXTIL';
      const cidadeLimpa = this.sanitizeText(cidade, 15) || 'SAO PAULO';
      const txIdLimpo = this.sanitizeText(txId, 25) || '***';

      // 26 - Merchant Account Information
      let merchantAccount = this.formatTLV('00', 'br.gov.bcb.pix');
      merchantAccount += this.formatTLV('01', chaveLimpa);
      if (descricao) {
        const descLimpa = this.sanitizeText(descricao, 40);
        if (descLimpa) merchantAccount += this.formatTLV('02', descLimpa);
      }

      let payload = '';
      payload += this.formatTLV('00', '01'); // Payload Format Indicator
      payload += this.formatTLV('01', valor ? '12' : '11'); // Point of Initiation: 12 (dinâmico/único) ou 11 (reutilizável)
      payload += this.formatTLV('26', merchantAccount);
      payload += this.formatTLV('52', '0000'); // Merchant Category Code
      payload += this.formatTLV('53', '986'); // Moeda Real BRL

      if (valor !== null && valor !== undefined && Number(valor) > 0) {
        payload += this.formatTLV('54', Number(valor).toFixed(2));
      }

      payload += this.formatTLV('58', 'BR'); // País
      payload += this.formatTLV('59', nomeLimpo); // Nome do Recebedor
      payload += this.formatTLV('60', cidadeLimpa); // Cidade do Recebedor

      // 62 - Additional Data Field Template
      const additionalData = this.formatTLV('05', txIdLimpo);
      payload += this.formatTLV('62', additionalData);

      // 63 - CRC16
      payload += '6304';
      const crc = this.calcularCRC16(payload);
      return payload + crc;
    },

    /**
     * Gera o elemento SVG do QR Code a partir do payload
     */
    gerarQrCodeSvg: function (payload, { cellSize = 4, margin = 2 } = {}) {
      const qrGen = (typeof window !== 'undefined' && window.qrcode) ||
                    (typeof qrcode !== 'undefined' ? qrcode : null) ||
                    (typeof global !== 'undefined' && global.qrcode ? global.qrcode : null) ||
                    (typeof require === 'function' ? (function(){ try { return require('./pix-qrcode.min.js'); } catch(e){ return null; } })() : null);

      if (typeof qrGen !== 'function') {
        console.error('Biblioteca qrcode-generator não carregada');
        return '<div style="color:red; padding:10px;">Erro: Gerador QR Code não disponível.</div>';
      }

      try {
        const qr = qrGen(0, 'M');
        qr.addData(payload);
        qr.make();
        return qr.createSvgTag({
          cellSize: cellSize,
          margin: margin,
          scalable: true
        });
      } catch (err) {
        console.error('Erro ao gerar SVG do QR Code:', err);
        return `<div style="color:red; font-size:11px;">Erro ao gerar QR Code: ${err.message}</div>`;
      }
    },

    /**
     * Formata mensagem amigável para envio de cobrança via WhatsApp
     */
    gerarMensagemWhatsApp: function ({
      pedido,
      empresa,
      clienteNome,
      valor,
      tipoCobranca = 'Quitação do Pedido',
      payloadPix = ''
    }) {
      const nomeEmp = empresa?.nomeFantasia || empresa?.razaoSocial || 'Bravvi Indústria Têxtil';
      const numPed = pedido?.numero || pedido?.id || '';
      const prodResumo = pedido?.produtoNome
        ? `${pedido.grade?.total || ''}x ${pedido.produtoNome}`
        : 'Confecção de Uniformes';

      const valorFmt = Number(valor).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });

      const chavePix = empresa?.chavePix || '';
      const tipoChave = empresa?.tipoChavePix || 'Chave PIX';

      let msg = `Olá, *${clienteNome || 'Cliente'}*! Tudo bem? Aqui é da *${nomeEmp}*.\n\n`;
      msg += `Referente ao pedido *#${numPed}* (${prodResumo}):\n`;
      msg += `📌 Cobrança: *${tipoCobranca}*\n`;
      msg += `💰 Valor: *${valorFmt}*\n\n`;

      if (chavePix) {
        msg += `Para realizar o pagamento via *PIX*:\n`;
        msg += `🔑 Chave (${tipoChave}): *${chavePix}*\n`;
        msg += `🏢 Favorecido: *${nomeEmp}*\n\n`;
      }

      if (payloadPix) {
        msg += `Você também pode usar o *PIX Copia e Cola* no seu aplicativo do banco:\n`;
        msg += `\`\`\`${payloadPix}\`\`\`\n\n`;
      }

      msg += `Assim que efetuar o pagamento, por gentileza nos envie o comprovante por aqui para atualizarmos seu pedido no sistema! 🚀👕`;

      return msg;
    },

    /**
     * Abre Modal Completo de Cobrança PIX Industrial
     */
    abrirModalCobrancaPix: function ({
      pedidoId,
      valorInicial = null,
      tipoSugerido = null,
      onBaixaConfirmada = null
    }) {
      const db = window.ERP?.db;
      if (!db || !pedidoId) return;

      const p = db.pedidos.find(x => x.id === pedidoId);
      if (!p) {
        window.ERP.mostrarToast?.('Pedido não encontrado para cobrança PIX.', 'red');
        return;
      }

      const emp = db.empresa || {};
      const totalVenda = Number(p.valorTotalVenda) || 0;
      const jaPago = Number(p.valorSinalPago) || 0;
      const saldoDevedor = Math.max(0, totalVenda - jaPago);
      const isQuitado = saldoDevedor <= 0;

      // Se não passou valor, define o padrão
      let valorAtual = valorInicial !== null ? Number(valorInicial) : (saldoDevedor > 0 ? saldoDevedor : totalVenda);
      if (valorAtual <= 0) valorAtual = totalVenda;

      // Busca dados de contato do cliente
      const cliDb = (db.clientes || []).find(c => c.nome === p.clienteNome || c.id === p.clienteId);
      const telCliente = (cliDb?.telefone || p.clienteTelefone || '').replace(/\D/g, '');

      // Cria container do modal
      const modalEl = window.ERP.criarModalCamada(`
        <div class="modal-overlay active" id="modalPixOverlay">
          <div class="modal-box" style="max-width: 620px; border-radius: 12px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);">
            <!-- Top Header com Gradiente Industrial -->
            <div class="modal-header" style="background: linear-gradient(135deg, #032b35 0%, #064e3b 100%); color: #ffffff; padding: 16px 20px; border-bottom: 1px solid rgba(45, 212, 191, 0.2);">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 38px; height: 38px; border-radius: 8px; background: rgba(45, 212, 191, 0.15); border: 1px solid #2dd4bf; display: flex; align-items: center; justify-content: center; color: #2dd4bf; font-size: 20px; font-weight: 800;">
                  ⚡
                </div>
                <div>
                  <div class="modal-title" style="color: #ffffff; font-size: 15px; font-weight: 800; letter-spacing: -0.3px;">
                    Cobrança Instantânea PIX • Pedido #${p.numero}
                  </div>
                  <div style="font-size: 11.5px; color: #a7f3d0;">
                    Cliente: <strong>${p.clienteNome}</strong> • ${p.grade?.total || 0}x ${p.produtoNome}
                  </div>
                </div>
              </div>
              <button class="modal-close" style="color: #ffffff; opacity: 0.8; font-size: 22px;" onclick="window.ERP.fecharModal()">&times;</button>
            </div>

            <div class="modal-body" style="padding: 18px 20px; background: #f8fafc; max-height: 80vh; overflow-y: auto;">
              <!-- Alerta de Chave PIX Ausente (se houver) -->
              ${!emp.chavePix ? `
                <div style="background: #fef2f2; border: 1px solid #f87171; border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 11.5px; color: #991b1b;">
                  <strong style="display: block; font-size: 12.5px; margin-bottom: 4px;">⚠️ Chave PIX da Confecção não configurada</strong>
                  Defina a chave PIX da sua empresa nas configurações para gerar QR Codes dinâmicos com a conta bancária da fábrica.
                  <div style="margin-top: 8px; display: flex; gap: 8px;">
                    <input type="text" id="pixInpChaveRapida" class="form-input text-mono" placeholder="Ex: CNPJ ou Telefone da Fábrica" style="font-size: 11px; padding: 4px 8px; background: #ffffff;">
                    <button type="button" class="btn btn-sm btn-primary" id="btnSalvarChaveRapida">Salvar Chave</button>
                  </div>
                </div>
              ` : ''}

              <!-- Seleção do Tipo de Cobrança / Valor -->
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span style="font-size: 11.5px; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">
                    Opções de Cobrança:
                  </span>
                  <span class="text-mono" style="font-size: 11px; color: #64748b;">
                    Total Pedido: <strong>${window.ERP.formatarMoeda(totalVenda)}</strong>
                  </span>
                </div>

                <!-- Botões de Atalho de Cobrança -->
                <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
                  ${saldoDevedor > 0 ? `
                    <button type="button" class="btn btn-secondary btn-sm btn-pix-preset ${valorAtual === saldoDevedor ? 'btn-green' : ''}" data-valor="${saldoDevedor.toFixed(2)}" data-desc="Quitação do Saldo">
                      Quitação Saldo (${window.ERP.formatarMoeda(saldoDevedor)})
                    </button>
                  ` : ''}
                  <button type="button" class="btn btn-secondary btn-sm btn-pix-preset ${valorAtual === (totalVenda * 0.5) ? 'btn-green' : ''}" data-valor="${(totalVenda * 0.5).toFixed(2)}" data-desc="Sinal de Entrada 50%">
                    Sinal 50% (${window.ERP.formatarMoeda(totalVenda * 0.5)})
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm btn-pix-preset ${valorAtual === (totalVenda * 0.3) ? 'btn-green' : ''}" data-valor="${(totalVenda * 0.3).toFixed(2)}" data-desc="Sinal de Entrada 30%">
                    Sinal 30% (${window.ERP.formatarMoeda(totalVenda * 0.3)})
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm btn-pix-preset ${valorAtual === totalVenda ? 'btn-green' : ''}" data-valor="${totalVenda.toFixed(2)}" data-desc="Pagamento Integral 100%">
                    Total 100% (${window.ERP.formatarMoeda(totalVenda)})
                  </button>
                </div>

                <div class="form-row" style="margin: 0; gap: 10px;">
                  <div class="form-group" style="flex: 1.2; margin-bottom: 0;">
                    <label class="form-label" style="font-size: 11px;">Valor da Cobrança PIX (R$)</label>
                    <input type="number" id="pixInpValor" class="form-input text-mono" style="font-size: 16px; font-weight: 800; color: #047857; background: #f0fdf4;" step="1.00" min="0.01" value="${valorAtual.toFixed(2)}">
                  </div>
                  <div class="form-group" style="flex: 1.8; margin-bottom: 0;">
                    <label class="form-label" style="font-size: 11px;">Identificação da Parcela / Motivo</label>
                    <input type="text" id="pixInpDesc" class="form-input" style="font-size: 12px;" value="${tipoSugerido || (saldoDevedor > 0 && jaPago > 0 ? 'Saldo Final na Retirada' : 'Sinal de 50% para Produção')}" placeholder="Ex: Sinal 50%, Quitação...">
                  </div>
                </div>
              </div>

              <!-- Card Principal: QR Code + Copia e Cola -->
              <div style="display: grid; grid-template-columns: 200px 1fr; gap: 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 16px; align-items: center;">
                <!-- QR Code Box -->
                <div style="text-align: center;">
                  <div id="pixQrContainer" style="width: 190px; height: 190px; padding: 8px; background: #ffffff; border: 2px dashed #059669; border-radius: 10px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08);">
                    <!-- SVG do QR Code inserido dinamicamente -->
                  </div>
                  <div style="font-size: 10.5px; color: #059669; font-weight: 700; margin-top: 6px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                    Aponte a câmera do banco
                  </div>
                </div>

                <!-- Detalhes do PIX & Copia e Cola -->
                <div>
                  <div style="font-size: 11.5px; color: #64748b; margin-bottom: 4px;">
                    Beneficiário: <strong style="color: #0f172a;">${emp.nomeFantasia || emp.razaoSocial || 'Bravvi Têxtil'}</strong>
                  </div>
                  <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
                    Chave: <span class="text-mono" style="color: #0f172a; font-weight: 700;">${emp.chavePix || 'Não informada'}</span> (${emp.tipoChavePix || 'PIX'})
                  </div>

                  <label class="form-label" style="font-size: 10.5px; text-transform: uppercase; font-weight: 800; color: #475569; display: flex; justify-content: space-between; align-items: center;">
                    <span>Código PIX Copia e Cola:</span>
                    <span id="pixCopiadoFeedback" style="color: #059669; font-weight: 700; display: none;">✓ Copiado com sucesso!</span>
                  </label>
                  <textarea id="pixTxtPayload" readonly class="form-input text-mono" rows="3" style="font-size: 10.5px; resize: none; background: #f1f5f9; color: #334155; line-height: 1.35; padding: 6px 8px; margin-bottom: 8px;"></textarea>

                  <button type="button" class="btn btn-secondary btn-sm" id="btnCopiarPix" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 700; color: #047857; border-color: #a7f3d0; background: #ecfdf5;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    <span>Copiar Código PIX Copia e Cola</span>
                  </button>
                </div>
              </div>

              <!-- Ação de Envio no WhatsApp -->
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px solid #6ee7b7; border-radius: 10px; padding: 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 12px; font-weight: 800; color: #065f46; display: flex; align-items: center; gap: 6px;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    Enviar Cobrança Direto no WhatsApp do Cliente
                  </span>
                  <span class="text-mono" style="font-size: 11px; color: #047857;">
                    ${telCliente ? `Tel: ${telCliente}` : 'Sem número salvo'}
                  </span>
                </div>

                <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                  <input type="text" id="pixInpWhatsApp" class="form-input text-mono" value="${telCliente}" placeholder="DDD + Número (ex: 11988887777)" style="flex: 1; font-size: 12px; padding: 6px 10px; background: #ffffff;">
                  <button type="button" class="btn btn-green btn-sm" id="btnEnviarWhatsApp" style="font-weight: 800; padding: 6px 14px; display: flex; align-items: center; gap: 6px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    <span>Enviar Cobrança WhatsApp</span>
                  </button>
                </div>
                <div style="font-size: 10.5px; color: #047857; line-height: 1.3;">
                  Abre o WhatsApp Web/App com a mensagem formatada contendo o resumo do pedido, valor da cobrança e o código PIX Copia e Cola pronto para o cliente colar no banco.
                </div>
              </div>
            </div>

            <!-- Footer com Botão de Baixa Imediata -->
            <div class="modal-footer" style="background: #ffffff; border-top: 1px solid #e2e8f0; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center;">
              <button type="button" class="btn btn-secondary" onclick="window.ERP.fecharModal()">Fechar</button>

              <button type="button" class="btn btn-primary" id="btnDarBaixaDoPix" style="font-weight: 800; display: flex; align-items: center; gap: 6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Cliente já pagou? Dar Baixa no Caixa</span>
              </button>
            </div>
          </div>
        </div>
      `);

      // Elementos do DOM do modal
      const inpValor = document.getElementById('pixInpValor');
      const inpDesc = document.getElementById('pixInpDesc');
      const qrContainer = document.getElementById('pixQrContainer');
      const txtPayload = document.getElementById('pixTxtPayload');
      const btnCopiar = document.getElementById('btnCopiarPix');
      const feedbackCopiado = document.getElementById('pixCopiadoFeedback');
      const btnWhatsApp = document.getElementById('btnEnviarWhatsApp');
      const inpWhatsApp = document.getElementById('pixInpWhatsApp');
      const btnSalvarChave = document.getElementById('btnSalvarChaveRapida');
      const inpChaveRapida = document.getElementById('pixInpChaveRapida');
      const btnDarBaixa = document.getElementById('btnDarBaixaDoPix');

      // Função para recalcular o QR Code e Payload
      const recalcularPix = () => {
        const val = parseFloat(inpValor?.value) || 0;
        const desc = inpDesc?.value || 'Cobranca Uniformes';
        const chave = (emp.chavePix || inpChaveRapida?.value || '34582910000144').trim();

        try {
          const payload = PixEngine.gerarPayload({
            chave: chave,
            tipoChave: emp.tipoChavePix || 'CNPJ',
            nome: emp.nomeFantasia || emp.razaoSocial || 'Bravvi Textil',
            cidade: emp.cidade || 'Americana',
            valor: val > 0 ? val : null,
            txId: `PED${p.numero || '101'}`,
            descricao: desc
          });

          if (txtPayload) txtPayload.value = payload;

          if (qrContainer) {
            const svgHtml = PixEngine.gerarQrCodeSvg(payload, { cellSize: 4, margin: 1 });
            qrContainer.innerHTML = svgHtml;
            const svgEl = qrContainer.querySelector('svg');
            if (svgEl) {
              svgEl.style.width = '100%';
              svgEl.style.height = '100%';
              svgEl.style.display = 'block';
            }
          }
        } catch (err) {
          console.error('Erro gerando PIX:', err);
          if (qrContainer) {
            qrContainer.innerHTML = `<div style="color:#dc2626; font-size:11px; padding:8px;">⚠️ ${err.message}</div>`;
          }
        }
      };

      // Inicializa cálculos
      recalcularPix();

      // Listeners de input
      inpValor?.addEventListener('input', recalcularPix);
      inpDesc?.addEventListener('input', recalcularPix);

      // Listeners de botões de preset
      document.querySelectorAll('.btn-pix-preset').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.btn-pix-preset').forEach(b => b.classList.remove('btn-green'));
          btn.classList.add('btn-green');
          const val = parseFloat(btn.getAttribute('data-valor')) || 0;
          const desc = btn.getAttribute('data-desc') || '';
          if (inpValor) inpValor.value = val.toFixed(2);
          if (inpDesc && desc) inpDesc.value = desc;
          recalcularPix();
        });
      });

      // Salvar chave rápida se fornecida no modal
      btnSalvarChave?.addEventListener('click', () => {
        const novaChave = inpChaveRapida?.value?.trim();
        if (!novaChave) {
          window.ERP.mostrarToast?.('Informe a chave PIX da fábrica.', 'yellow');
          return;
        }
        emp.chavePix = novaChave;
        if (db.empresa) db.empresa.chavePix = novaChave;
        window.ERP.salvarEstado?.();
        window.ERP.mostrarToast?.('Chave PIX salva nas configurações!', 'green');
        recalcularPix();
      });

      // Botão Copiar PIX Copia e Cola
      btnCopiar?.addEventListener('click', async () => {
        const payload = txtPayload?.value || '';
        if (!payload) return;

        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(payload);
          } else {
            txtPayload.select();
            document.execCommand('copy');
          }

          if (feedbackCopiado) {
            feedbackCopiado.style.display = 'inline';
            setTimeout(() => {
              feedbackCopiado.style.display = 'none';
            }, 3000);
          }
          window.ERP.mostrarToast?.('Código PIX Copia e Cola copiado com sucesso!', 'green');
        } catch (err) {
          window.ERP.mostrarToast?.('Não foi possível copiar automaticamente. Selecione e copie o texto.', 'yellow');
        }
      });

      // Botão Enviar Cobrança via WhatsApp
      btnWhatsApp?.addEventListener('click', () => {
        const payload = txtPayload?.value || '';
        const val = parseFloat(inpValor?.value) || 0;
        const desc = inpDesc?.value || 'Quitação do Pedido';
        const fone = (inpWhatsApp?.value || '').replace(/\D/g, '');

        if (!fone || fone.length < 10) {
          window.ERP.mostrarToast?.('Por favor, informe um número de telefone/WhatsApp válido com DDD.', 'yellow');
          inpWhatsApp?.focus();
          return;
        }

        const msgTexto = PixEngine.gerarMensagemWhatsApp({
          pedido: p,
          empresa: emp,
          clienteNome: p.clienteNome,
          valor: val,
          tipoCobranca: desc,
          payloadPix: payload
        });

        // Formata link do WhatsApp
        const foneFormatado = fone.length <= 11 ? `55${fone}` : fone;
        const urlWa = `https://wa.me/${foneFormatado}?text=${encodeURIComponent(msgTexto)}`;
        window.open(urlWa, '_blank');
        window.ERP.mostrarToast?.('Abrindo WhatsApp com mensagem e PIX formatados...', 'green');
      });

      // Botão Dar Baixa no Caixa a partir do PIX
      btnDarBaixa?.addEventListener('click', () => {
        window.ERP.fecharModal();
        if (typeof onBaixaConfirmada === 'function') {
          onBaixaConfirmada(p.id, parseFloat(inpValor?.value) || 0);
        } else if (typeof window.ERP.abrirModalReceberPagamento === 'function') {
          window.ERP.abrirModalReceberPagamento(p.id);
        }
      });
    }
  };

  // Exporta globalmente para uso pelo Bravvi ERP
  window.PixEngine = PixEngine;
})();
