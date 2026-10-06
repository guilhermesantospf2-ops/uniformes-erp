/**
 * BRAVVI ERP TÊXTIL - INSTALADOR DE APLICATIVO DESKTOP (PWA)
 * Permite instalar e rodar o ERP como programa nativo no Windows, Mac e Linux
 */

(function() {
  'use strict';

  let deferredPrompt = null;
  let isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  // 1. Registra o Service Worker com auto-update forçado e limpeza de caches legados
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swPath = './sw.js?v=8.7.2';
      navigator.serviceWorker.register(swPath)
        .then(reg => {
          console.log('[PWA] Service Worker registrado. Escopo:', reg.scope);
          // Força verificação imediata de nova versão
          reg.update();

          // Se um novo worker for instalado, atualiza para refletir mudanças do cabeçalho
          reg.addEventListener('updatefound', () => {
            const novoWorker = reg.installing;
            if (novoWorker) {
              novoWorker.addEventListener('statechange', () => {
                if (novoWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] Nova versão do app instalada em segundo plano. Recarregando caches...');
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch(err => {
          console.warn('[PWA] Falha ao registrar Service Worker:', err);
        });

      // Limpeza agressiva de qualquer cache antigo mantido no navegador
      if ('caches' in window) {
        caches.keys().then(keys => {
          keys.forEach(key => {
            if (key !== 'bravvi-erp-desktop-v8.7.1') {
              console.log('[PWA] Purgando cache antigo de versão anterior:', key);
              caches.delete(key);
            }
          });
        });
      }
    });
  }

  // 2. Captura o evento nativo de instalação do navegador
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA] Evento beforeinstallprompt capturado. Aplicativo pronto para instalação imediata.');
    atualizarBotoesInstalacao(true, false);
  });

  // 3. Notifica quando a instalação for concluída com sucesso
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    isStandalone = true;
    console.log('[PWA] Aplicativo Bravvi ERP instalado com sucesso no PC!');
    atualizarBotoesInstalacao(false, true);

    if (window.ERP && typeof window.ERP.mostrarToast === 'function') {
      window.ERP.mostrarToast('🎉 Bravvi ERP instalado com sucesso na sua Área de Trabalho e Barra de Tarefas!', 'green');
    } else {
      alert('🎉 Parabéns! O Bravvi ERP foi instalado com sucesso no seu computador e já está disponível no seu Menu Iniciar e Área de Trabalho.');
    }
  });

  function atualizarBotoesInstalacao(podeInstalar = true, instalado = isStandalone) {
    const botoes = document.querySelectorAll('#btnInstalarAppDesktop, .btn-instalar-app-desktop');
    botoes.forEach(btn => {
      if (instalado) {
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>✓ App Instalado</span>
        `;
        btn.title = 'Bravvi ERP instalado como aplicativo no computador';
        btn.style.opacity = '0.9';
        btn.style.background = '#047857';
        btn.style.borderColor = '#059669';
        btn.style.color = '#ffffff';
      } else {
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
          <span>💻 Baixar no PC</span>
        `;
        btn.title = 'Instalar Bravvi ERP como aplicativo na Área de Trabalho e Barra de Tarefas';
      }
    });
  }

  // 4. Ação disparada ao clicar no botão "Baixar App no PC"
  async function solicitarInstalacaoApp() {
    if (isStandalone) {
      abrirModalJaInstalado();
      return;
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('[PWA] Escolha do usuário na instalação:', outcome);
        if (outcome === 'accepted') {
          if (window.ERP && typeof window.ERP.mostrarToast === 'function') {
            window.ERP.mostrarToast('Instalando aplicativo no seu computador...', 'blue');
          }
        }
        deferredPrompt = null;
      } catch (err) {
        console.warn('[PWA] Erro ao disparar prompt nativo:', err);
        abrirModalInstrucoesInstalacao();
      }
    } else {
      // Quando o navegador requer clique pelo menu ou barra de endereços
      abrirModalInstrucoesInstalacao();
    }
  }

  // Modal com Instruções Ilustradas de Instalação no Computador
  function abrirModalInstrucoesInstalacao() {
    const modalExistente = document.getElementById('modalInstalarPwa');
    if (modalExistente) modalExistente.remove();

    const overlay = document.createElement('div');
    overlay.id = 'modalInstalarPwa';
    overlay.className = 'modal-overlay active';
    overlay.style.zIndex = '999999';
    overlay.innerHTML = `
      <div class="modal-box" style="max-width: 600px; border-radius: 12px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45); margin: 30px auto;">
        <!-- Header do Modal -->
        <div class="modal-header" style="background: linear-gradient(135deg, #032b35 0%, #064e3b 100%); padding: 18px 22px; color: #ffffff; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="assets/bravvi-icon.png" alt="Bravvi" style="width: 40px; height: 40px; object-fit: contain; border-radius: 8px; background: rgba(255,255,255,0.1); padding: 2px;">
            <div>
              <div class="modal-title" style="color: #ffffff; font-size: 16px; font-weight: 800;">Instalar Bravvi ERP no Computador</div>
              <div style="font-size: 11.5px; color: #2dd4bf; margin-top: 2px; font-weight: 600;">
                Sistema direto na sua Área de Trabalho e Barra de Tarefas
              </div>
            </div>
          </div>
          <button class="modal-close" id="btnFecharModalInstalarPwa" style="color: #ffffff; opacity: 0.8; font-size: 24px; background: none; border: none; cursor: pointer; line-height: 1;">&times;</button>
        </div>

        <!-- Corpo do Modal -->
        <div class="modal-body" style="padding: 22px; line-height: 1.5; color: #1e293b;">
          <!-- Vantagens do App -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 10px; text-align: center;">
              <div style="font-size: 20px; margin-bottom: 4px;">⚡</div>
              <strong style="display: block; font-size: 12px; color: #0f172a;">Janela Própria</strong>
              <span style="font-size: 11px; color: #64748b;">Sem abas para não distrair</span>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 10px; text-align: center;">
              <div style="font-size: 20px; margin-bottom: 4px;">📌</div>
              <strong style="display: block; font-size: 12px; color: #0f172a;">Barra de Tarefas</strong>
              <span style="font-size: 11px; color: #64748b;">Fixe ao lado do WhatsApp</span>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 10px; text-align: center;">
              <div style="font-size: 20px; margin-bottom: 4px;">🚀</div>
              <strong style="display: block; font-size: 12px; color: #0f172a;">1 Clique</strong>
              <span style="font-size: 11px; color: #64748b;">Início instantâneo no PC</span>
            </div>
          </div>

          <!-- Passo a Passo Ilustrado -->
          <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 14px 16px; margin-bottom: 16px;">
            <strong style="color: #166534; font-size: 13px; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
              <span>💡 Como instalar em 2 passos pelo seu navegador:</span>
            </strong>
            
            <div style="font-size: 12px; color: #1e293b; margin-bottom: 10px; line-height: 1.5;">
              <strong>Passo 1 (Pela Barra de Endereços):</strong> Olhe para o topo do seu navegador, no final da barra onde digita o site. Procure o ícone de computador com uma seta para baixo ou o ícone <strong>(+) Instalar</strong> e clique nele.
            </div>

            <div style="font-size: 12px; color: #1e293b; line-height: 1.5;">
              <strong>Passo 2 (Pelo Menu do Navegador):</strong>
              <ul style="margin: 6px 0 0 16px; padding: 0;">
                <li><strong>No Google Chrome:</strong> Clique nos 3 pontinhos no canto superior direito &rarr; <em>Transmitir, salvar e compartilhar</em> (ou <em>Instalar Bravvi ERP</em>) &rarr; <strong>Instalar página como aplicativo</strong>.</li>
                <li><strong>No Microsoft Edge:</strong> Clique nos 3 pontinhos no canto superior direito &rarr; <em>Aplicativos</em> &rarr; <strong>Instalar este site como um aplicativo</strong>.</li>
              </ul>
            </div>
          </div>

          <div style="font-size: 11.5px; color: #64748b; background: #f8fafc; border-radius: 6px; padding: 10px 12px; display: flex; align-items: center; gap: 8px;">
            <span>🛡️</span>
            <span><strong>Totalmente Seguro & Leve:</strong> O aplicativo utiliza a tecnologia oficial PWA da Microsoft e Google, ocupando menos de 5MB no seu computador.</span>
          </div>
        </div>

        <!-- Rodapé do Modal -->
        <div class="modal-footer" style="padding: 14px 22px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 10px;">
          <button type="button" class="btn btn-secondary" id="btnEntendiPwa" style="padding: 9px 18px; font-weight: 700;">
            Fechar
          </button>
          <button type="button" class="btn btn-primary" id="btnTentarInstalarNovamente" style="padding: 9px 18px; font-weight: 800; background: #047857; border-color: #047857;">
            💻 Tentar Instalação Automática
          </button>
        </div>
      </div>
    `;

    const container = document.getElementById('modalContainer') || document.body;
    container.appendChild(overlay);

    const fechar = () => overlay.remove();
    overlay.querySelector('#btnFecharModalInstalarPwa')?.addEventListener('click', fechar);
    overlay.querySelector('#btnEntendiPwa')?.addEventListener('click', fechar);
    overlay.querySelector('#btnTentarInstalarNovamente')?.addEventListener('click', () => {
      if (deferredPrompt) {
        fechar();
        deferredPrompt.prompt();
      } else {
        alert('Por favor, olhe para o topo direito do seu navegador e clique no ícone (+) ou no menu de 3 pontinhos > Instalar aplicativo.');
      }
    });
  }

  function abrirModalJaInstalado() {
    alert('✓ O Bravvi ERP já está instalado e ativo como aplicativo no seu computador! Você pode abri-lo diretamente pelo Menu Iniciar ou pelo atalho na sua Área de Trabalho.');
  }

  // Inicialização na montagem do DOM
  document.addEventListener('DOMContentLoaded', () => {
    atualizarBotoesInstalacao(!!deferredPrompt, isStandalone);
  });

  // Expõe no escopo global garantido
  window.solicitarInstalacaoBravviApp = solicitarInstalacaoApp;
  window.BRAVVI_PWA = {
    solicitarInstalacaoApp,
    isStandalone: () => isStandalone,
    atualizarBotoesInstalacao
  };

  if (!window.ERP) window.ERP = {};
  window.ERP.solicitarInstalacaoApp = solicitarInstalacaoApp;

})();
