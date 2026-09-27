/**
 * TEXPRO UNIFORMES ERP - MOTOR DE NUVEM, BACKUP & IDENTIDADE EMPRESARIAL
 * Gerenciamento de Multi-tenant (Empresas), Sincronização e Backup Seguro
 */

(function() {
  'use strict';

  const STORAGE_KEY_EMPRESA = 'TEXPRO_ERP_EMPRESA_CONFIG';
  const STORAGE_KEY_PERFIL = 'TEXPRO_ERP_PERFIL_ATIVO';

  // Configuração Padrão Inicial da Empresa
  const EMPRESA_PADRAO = {
    razaoSocial: "TexPro Indústria e Comércio de Confecções Ltda",
    nomeFantasia: "TexPro Uniformes",
    cnpj: "34.582.910/0001-44",
    inscricaoEstadual: "123.456.789.110",
    telefone: "11987654321",
    email: "comercial@texprouniformes.com.br",
    chavePix: "financeiro@texprouniformes.com.br",
    tipoChavePix: "E-mail",
    endereco: "Rua Têxtil Industrial, 450",
    bairro: "Distrito Industrial",
    cidade: "Americana",
    uf: "SP",
    cep: "13465-000",
    logoUrl: null, // Base64 ou URL da imagem
    rodapeProposta: "Proposta válida por 15 dias. Pagamento de 50% de sinal na aprovação e saldo na retirada.",
    rodapeFicha: "Ordem de Produção Oficial. Tolerância de corte de 2mm. Em caso de dúvidas, contate o encarregado."
  };

  // Perfis de Acesso e Permissões
  const PERFIS_PERMISSOES = {
    dono: {
      id: "dono",
      nome: "Diretoria / Dono",
      cargo: "👑 Dono / Gerente Geral",
      avatar: "ADM",
      podeVerFinanceiro: true,
      podeVerDRE: true,
      podeVerCustosMargem: true,
      podeVerConfiguracoes: true,
      abasPermitidas: ["abertura", "pedidos", "os", "nesting", "estoque", "produtos", "financeiro", "dre", "compras", "clientes", "quarentena", "equipe", "nfe", "empresa"]
    },
    vendedor: {
      id: "vendedor",
      nome: "Vendedor / Comercial",
      cargo: "💼 Vendedor / Atendimento",
      avatar: "VND",
      podeVerFinanceiro: false,
      podeVerDRE: false,
      podeVerCustosMargem: false,
      podeVerConfiguracoes: false,
      abasPermitidas: ["abertura", "pedidos", "produtos", "estoque", "clientes", "quarentena"]
    },
    oficina: {
      id: "oficina",
      nome: "Encarregado de Corte & Costura",
      cargo: "✂️ Oficina / Chão de Fábrica",
      avatar: "OFC",
      podeVerFinanceiro: false,
      podeVerDRE: false,
      podeVerCustosMargem: false,
      podeVerConfiguracoes: false,
      abasPermitidas: ["pedidos", "os", "nesting", "estoque", "quarentena"]
    }
  };

  function obterEmpresaConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_EMPRESA);
      if (raw) {
        return Object.assign({}, EMPRESA_PADRAO, JSON.parse(raw));
      }
    } catch (e) {
      console.warn('Erro ao carregar dados da empresa:', e);
    }
    return Object.assign({}, EMPRESA_PADRAO);
  }

  function salvarEmpresaConfig(dados) {
    try {
      const atual = obterEmpresaConfig();
      const novo = Object.assign({}, atual, dados);
      localStorage.setItem(STORAGE_KEY_EMPRESA, JSON.stringify(novo));
      atualizarElementosVisuaisEmpresa(novo);
      return novo;
    } catch (e) {
      console.error('Erro ao salvar dados da empresa:', e);
      return null;
    }
  }

  function obterPerfilAtivo() {
    try {
      const perfilId = localStorage.getItem(STORAGE_KEY_PERFIL) || 'dono';
      return PERFIS_PERMISSOES[perfilId] || PERFIS_PERMISSOES.dono;
    } catch (e) {
      return PERFIS_PERMISSOES.dono;
    }
  }

  function definirPerfilAtivo(perfilId) {
    const p = PERFIS_PERMISSOES[perfilId] || PERFIS_PERMISSOES.dono;
    try {
      localStorage.setItem(STORAGE_KEY_PERFIL, p.id);
    } catch (e) {}
    atualizarVisuaisPerfil(p);
    return p;
  }

  function atualizarVisuaisPerfil(perfil) {
    const sel = document.getElementById('selectPerfilUsuario');
    if (sel && sel.value !== perfil.id) {
      sel.value = perfil.id;
    }

    const av = document.getElementById('sidebarUserAvatar');
    if (av) av.textContent = perfil.avatar;

    const un = document.getElementById('sidebarUserName');
    if (un) un.textContent = perfil.nome;

    const ur = document.getElementById('sidebarUserRole');
    if (ur) ur.textContent = perfil.cargo;

    // Controla visibilidade dos itens do menu lateral conforme as permissões do perfil
    document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
      const aba = item.getAttribute('data-aba');
      if (aba) {
        if (perfil.abasPermitidas.includes(aba)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      }
    });
  }

  function atualizarElementosVisuaisEmpresa(empresa) {
    // Header da sidebar
    const title = document.getElementById('sidebarBrandTitle');
    if (title) title.textContent = empresa.nomeFantasia || 'CONFECÇÃO';

    const sub = document.getElementById('sidebarBrandSubtitle');
    if (sub) sub.textContent = 'UNIFORMES ERP';

    const icon = document.getElementById('sidebarBrandIcon');
    if (icon) {
      if (empresa.logoUrl) {
        icon.innerHTML = `<img src="${empresa.logoUrl}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 4px;" alt="Logo">`;
        icon.style.background = 'transparent';
        icon.style.padding = '0';
      } else {
        const sigla = (empresa.nomeFantasia || 'TP').substring(0, 2).toUpperCase();
        icon.textContent = sigla;
      }
    }

    // Top navbar
    const headerNome = document.getElementById('headerEmpresaNome');
    if (headerNome) headerNome.textContent = empresa.nomeFantasia || empresa.razaoSocial;

    const headerCnpj = document.getElementById('headerEmpresaCnpj');
    if (headerCnpj) headerCnpj.textContent = `CNPJ: ${empresa.cnpj || 'Não Informado'}`;
  }

  // Backup & Restauração Completa do Banco
  function exportarBackupJson(dbAtual) {
    const dadosCompletos = {
      versao: "8.4.0",
      dataExportacao: new Date().toISOString(),
      empresa: obterEmpresaConfig(),
      padroesCustos: JSON.parse(localStorage.getItem('UNIFORMES_ERP_PADROES_CUSTOS') || '{}'),
      banco: dbAtual
    };

    const str = JSON.stringify(dadosCompletos, null, 2);
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dataFormatada = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `backup_confeccao_erp_${dataFormatada}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function restaurarBackupJson(conteudoJson, callbackSucesso) {
    try {
      const obj = JSON.parse(conteudoJson);
      if (!obj.banco || !obj.banco.pedidos) {
        throw new Error('Arquivo de backup inválido ou incompatível.');
      }
      if (obj.empresa) {
        salvarEmpresaConfig(obj.empresa);
      }
      if (obj.padroesCustos) {
        localStorage.setItem('UNIFORMES_ERP_PADROES_CUSTOS', JSON.stringify(obj.padroesCustos));
      }
      if (typeof callbackSucesso === 'function') {
        callbackSucesso(obj.banco);
      }
      return true;
    } catch (err) {
      console.error('Erro na restauração:', err);
      alert('Erro ao restaurar arquivo de backup: ' + err.message);
      return false;
    }
  }

  // ==========================================================================
  // MOTOR DE CONEXÃO FIREBASE & BANCO DE DADOS EM NUVEM (FIRESTORE REALTIME)
  // ==========================================================================
  const STORAGE_KEY_FIREBASE = 'TEXPRO_ERP_FIREBASE_CONFIG';
  let firestoreDb = null;
  let unsubscribeRealtime = null;
  let syncDebounceTimer = null;
  let ultimaAtualizacaoRemota = 0;

  function obterFirebaseConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FIREBASE);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Erro ao carregar credenciais do Firebase:', e);
    }
    if (window.TEXPRO_FIREBASE_CONFIG) {
      return window.TEXPRO_FIREBASE_CONFIG;
    }
    return null;
  }

  function salvarFirebaseConfig(config) {
    try {
      if (!config) {
        localStorage.removeItem(STORAGE_KEY_FIREBASE);
        firestoreDb = null;
        if (unsubscribeRealtime) unsubscribeRealtime();
        atualizarStatusNuvem();
        return true;
      }
      localStorage.setItem(STORAGE_KEY_FIREBASE, JSON.stringify(config));
      return inicializarFirebase();
    } catch (e) {
      console.error('Erro ao salvar credenciais do Firebase:', e);
      return false;
    }
  }

  function obterTenantId() {
    const emp = obterEmpresaConfig();
    if (emp && emp.cnpj) {
      const num = emp.cnpj.replace(/\D/g, '');
      if (num.length >= 8) return 'empresa_' + num;
    }
    if (emp && emp.nomeFantasia) {
      const slug = emp.nomeFantasia.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 24);
      if (slug.length >= 3) return 'empresa_' + slug;
    }
    return 'empresa_principal';
  }

  function inicializarFirebase() {
    const config = obterFirebaseConfig();
    if (!config || !config.apiKey || !config.projectId) {
      firestoreDb = null;
      atualizarStatusNuvem();
      return false;
    }

    if (typeof firebase === 'undefined') {
      console.warn('SDK do Firebase ainda não carregou.');
      atualizarStatusNuvem();
      return false;
    }

    try {
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(config);
      }
      firestoreDb = firebase.firestore();
      atualizarStatusNuvem();
      return true;
    } catch (err) {
      console.error('Falha ao inicializar Firebase:', err);
      firestoreDb = null;
      atualizarStatusNuvem();
      return false;
    }
  }

  function isNuvemAtiva() {
    return firestoreDb !== null && navigator.onLine;
  }

  function sincronizarComNuvem(dbAtual) {
    if (!firestoreDb || !navigator.onLine) {
      atualizarStatusNuvem();
      return;
    }

    if (syncDebounceTimer) clearTimeout(syncDebounceTimer);

    definirTextoStatusNuvem('🔄 Sincronizando...', '#dbeafe', '#1d4ed8');

    syncDebounceTimer = setTimeout(() => {
      try {
        const tenantId = obterTenantId();
        const docRef = firestoreDb.collection('empresas_erp').doc(tenantId);
        const agora = Date.now();
        ultimaAtualizacaoRemota = agora;

        docRef.set({
          db: dbAtual,
          empresa: obterEmpresaConfig(),
          ultimaAtualizacaoMs: agora,
          versaoErp: "8.4.0",
          dispositivo: navigator.userAgent.substring(0, 40)
        }, { merge: true }).then(() => {
          atualizarStatusNuvem();
        }).catch(err => {
          console.warn('Erro ao salvar no Firestore (mantendo local):', err);
          atualizarStatusNuvem();
        });
      } catch (e) {
        console.warn('Exceção ao sincronizar:', e);
        atualizarStatusNuvem();
      }
    }, 1200);
  }

  function iniciarEscutaRealtime(onAtualizacaoRemota) {
    if (!firestoreDb) return;
    if (unsubscribeRealtime) unsubscribeRealtime();

    try {
      const tenantId = obterTenantId();
      const docRef = firestoreDb.collection('empresas_erp').doc(tenantId);

      unsubscribeRealtime = docRef.onSnapshot(doc => {
        if (!doc.exists) return;
        const data = doc.data();
        if (data && data.db && data.ultimaAtualizacaoMs && data.ultimaAtualizacaoMs > (ultimaAtualizacaoRemota + 500)) {
          ultimaAtualizacaoRemota = data.ultimaAtualizacaoMs;
          if (typeof onAtualizacaoRemota === 'function') {
            onAtualizacaoRemota(data.db);
          }
        }
      }, err => {
        console.warn('Aviso no listener Firestore:', err);
      });
    } catch (e) {
      console.warn('Falha ao abrir realtime Firestore:', e);
    }
  }

  function definirTextoStatusNuvem(texto, bg, cor) {
    const badge = document.getElementById('cloudStatusBadge');
    const txt = document.getElementById('cloudStatusText');
    if (!badge || !txt) return;
    badge.style.background = bg;
    badge.style.color = cor;
    badge.style.borderColor = cor;
    txt.textContent = texto;
  }

  // Monitoramento de Status de Rede e Nuvem
  function atualizarStatusNuvem() {
    const badge = document.getElementById('cloudStatusBadge');
    const txt = document.getElementById('cloudStatusText');
    if (!badge || !txt) return;

    if (!navigator.onLine) {
      badge.style.background = '#fffbeb';
      badge.style.color = '#b45309';
      badge.style.borderColor = '#fde68a';
      badge.querySelector('span:first-child').style.background = '#f59e0b';
      txt.textContent = 'Modo Local Offline Seguro';
      return;
    }

    if (isNuvemAtiva()) {
      badge.style.background = '#ecfdf5';
      badge.style.color = '#047857';
      badge.style.borderColor = '#a7f3d0';
      badge.querySelector('span:first-child').style.background = '#10b981';
      txt.textContent = `Online • Firestore Ativo (${obterTenantId().replace('empresa_', '')})`;
    } else {
      badge.style.background = '#f0f9ff';
      badge.style.color = '#0369a1';
      badge.style.borderColor = '#bae6fd';
      badge.querySelector('span:first-child').style.background = '#0ea5e9';
      txt.textContent = 'Modo Local Seguro (LocalStorage)';
    }
  }

  window.addEventListener('online', () => {
    inicializarFirebase();
    atualizarStatusNuvem();
  });
  window.addEventListener('offline', atualizarStatusNuvem);

  // Modal para Conexão com Firebase / Banco na Nuvem
  function abrirModalConfigNuvem() {
    const configAtual = obterFirebaseConfig() || {};
    const tenantId = obterTenantId();
    const isAtivo = isNuvemAtiva();

    const configFormatada = (configAtual && configAtual.apiKey) 
      ? JSON.stringify(configAtual, null, 2)
      : '';

    const modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-layer';
    overlay.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-box" style="max-width: 660px;">
          <div class="modal-header">
            <div>
              <div class="modal-title">Configurar Banco na Nuvem (Firebase / Firestore)</div>
              <div style="font-size: 11.5px; color: var(--text-gray-500); margin-top: 2px;">
                Permite acesso multi-dispositivo (celular, tablet e computador) com sincronização em tempo real
              </div>
            </div>
            <button class="modal-close" id="btnFecharModalNuvem">&times;</button>
          </div>

          <div class="modal-body" style="padding: 20px;">
            <div style="background: ${isAtivo ? '#ecfdf5' : '#f0f9ff'}; border: 1.5px solid ${isAtivo ? '#a7f3d0' : '#bae6fd'}; border-radius: 6px; padding: 12px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <strong style="color: ${isAtivo ? '#047857' : '#0369a1'}; font-size: 13px;">
                  ${isAtivo ? '🟢 Nuvem Ativa e Conectada ao Firestore' : '🔵 Sistema em Modo Local Seguro (Offline-First)'}
                </strong>
                <div style="font-size: 11.5px; color: ${isAtivo ? '#065f46' : '#0c4a6e'}; margin-top: 2px;">
                  ${isAtivo 
                    ? `Identificador da Fábrica: <strong>${tenantId}</strong> • Gravando pedidos em tempo real.`
                    : 'Cole abaixo as chaves do seu projeto Firebase para ativar o banco em nuvem multi-dispositivo.'}
                </div>
              </div>
              <span class="status-pill ${isAtivo ? 'status-green' : 'status-blue'}" style="font-size: 10px; font-weight: 800;">
                ${isAtivo ? 'SINCRONIZADO' : 'PRONTO PARA CONECTAR'}
              </span>
            </div>

            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label" style="display: flex; justify-content: space-between; align-items: center;">
                <span>Cole aqui o objeto de configuração do Firebase (firebaseConfig):</span>
                <a href="https://console.firebase.google.com/" target="_blank" style="font-size: 11px; color: #0284c7; text-decoration: underline;">Como pegar no Firebase Console?</a>
              </label>
              <textarea id="txtFirebaseConfig" class="form-input" style="height: 140px; font-family: var(--font-mono); font-size: 11.5px; line-height: 1.4;" placeholder='{\n  "apiKey": "AIzaSy...",\n  "authDomain": "seuerp.firebaseapp.com",\n  "projectId": "seuerp",\n  "storageBucket": "seuerp.appspot.com",\n  "messagingSenderId": "...",\n  "appId": "..."\n}'>${configFormatada}</textarea>
            </div>

            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; font-size: 11.5px; color: #475569; line-height: 1.5;">
              <strong style="color: #0f172a;">Como funciona na prática:</strong><br>
              • <strong>Zero risco:</strong> Seus dados continuam salvos no computador mesmo se a internet cair.<br>
              • <strong>Multi-dispositivo:</strong> Vendedor lança orçamento no WhatsApp do celular e a fábrica recebe no mesmo instante.<br>
              • <strong>Plano gratuito:</strong> O Firebase oferece 50.000 leituras e 20.000 gravações por dia sem custo.
            </div>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              ${isAtivo ? `
                <button type="button" class="btn btn-secondary btn-sm" id="btnDesconectarNuvem" style="color: #dc2626; border-color: #fca5a5;">
                  Desconectar Nuvem
                </button>
              ` : ''}
            </div>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn btn-secondary" id="btnCancelarNuvem">Cancelar</button>
              <button type="button" class="btn btn-primary" id="btnSalvarConectarNuvem">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Salvar & Conectar Nuvem
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    modalContainer.appendChild(overlay);

    const fechar = () => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    };

    overlay.querySelector('#btnFecharModalNuvem')?.addEventListener('click', fechar);
    overlay.querySelector('#btnCancelarNuvem')?.addEventListener('click', fechar);

    overlay.querySelector('#btnDesconectarNuvem')?.addEventListener('click', () => {
      if (confirm('Deseja desconectar da nuvem? O sistema voltará a salvar apenas no computador atual.')) {
        salvarFirebaseConfig(null);
        fechar();
        alert('Nuvem desconectada com sucesso. Modo Local Seguro ativo.');
      }
    });

    overlay.querySelector('#btnSalvarConectarNuvem')?.addEventListener('click', () => {
      const raw = overlay.querySelector('#txtFirebaseConfig')?.value.trim();
      if (!raw) {
        alert('Por favor, cole as credenciais do Firebase.');
        return;
      }

      try {
        let configObj = null;
        if (raw.startsWith('{') && raw.endsWith('}')) {
          configObj = JSON.parse(raw);
        } else {
          // Tentativa de parsing de objeto JS colado direto
          const cleanStr = raw.replace(/const\s+firebaseConfig\s*=\s*/, '').replace(/;\s*$/, '');
          configObj = Function('"use strict"; return (' + cleanStr + ')')();
        }

        if (!configObj || !configObj.apiKey || !configObj.projectId) {
          throw new Error('As chaves apiKey e projectId são obrigatórias.');
        }

        const ok = salvarFirebaseConfig(configObj);
        if (ok) {
          fechar();
          alert('Conexão com o Firebase estabelecida com sucesso! O sistema agora sincroniza em nuvem em tempo real.');
        } else {
          alert('Não foi possível conectar ao Firebase. Verifique se o Firestore está habilitado no seu console Firebase.');
        }
      } catch (err) {
        alert('Erro ao interpretar configuração do Firebase: ' + err.message);
      }
    });
  }

  // Inicialização Automática da Nuvem se houver chaves salvas
  document.addEventListener('DOMContentLoaded', () => {
    inicializarFirebase();
  });

  // Exposição Global do Módulo
  window.ERP_CLOUD = {
    obterEmpresaConfig,
    salvarEmpresaConfig,
    obterPerfilAtivo,
    definirPerfilAtivo,
    atualizarVisuaisPerfil,
    atualizarElementosVisuaisEmpresa,
    exportarBackupJson,
    restaurarBackupJson,
    perfis: PERFIS_PERMISSOES,
    // Métodos de Nuvem Firebase
    obterFirebaseConfig,
    salvarFirebaseConfig,
    isNuvemAtiva,
    sincronizarComNuvem,
    iniciarEscutaRealtime,
    abrirModalConfigNuvem,
    atualizarStatusNuvem
  };
})();

