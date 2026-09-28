/**
 * BRAVVI ERP TÊXTIL - MOTOR DE NUVEM, BACKUP & IDENTIDADE EMPRESARIAL
 * Gerenciamento de Multi-tenant (Empresas), Sincronização e Backup Seguro
 */

(function() {
  'use strict';

  const STORAGE_KEY_EMPRESA = 'BRAVVI_ERP_EMPRESA_CONFIG';
  const STORAGE_KEY_PERFIL = 'BRAVVI_ERP_PERFIL_ATIVO';

  function isModoDemo() {
    return (window.BRAVVI_IS_DEMO === true) ||
           (window.TEXPRO_IS_DEMO === true) || 
           (window.location && window.location.search && window.location.search.includes('demo=1')) || 
           (window.location && window.location.pathname && (window.location.pathname.includes('/demo') || window.location.pathname.includes('demo.html')));
  }

  // Configuração Padrão Inicial da Empresa
  const EMPRESA_PADRAO = {
    razaoSocial: "Bravvi Confecções e Uniformes Industriais Ltda",
    nomeFantasia: "Bravvi Indústria Têxtil",
    cnpj: "34.582.910/0001-44",
    inscricaoEstadual: "123.456.789.110",
    telefone: "11987654321",
    email: "contato@bravvi.com.br",
    chavePix: "financeiro@bravvi.com.br",
    tipoChavePix: "E-mail",
    endereco: "Rua Têxtil Industrial, 450",
    bairro: "Distrito Industrial",
    cidade: "Americana",
    uf: "SP",
    cep: "13465-000",
    logoUrl: "assets/bravvi-logo.png", // Logotipo oficial Bravvi em alta resolução
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
    if (isModoDemo()) {
      return Object.assign({}, EMPRESA_PADRAO, {
        razaoSocial: "Bravvi Confecções e Uniformes Industriais Ltda",
        nomeFantasia: "Bravvi Indústria Têxtil",
        cnpj: "34.582.910/0001-44",
        telefone: "11987654321",
        email: "contato@bravvi.com.br",
        cidade: "Americana",
        uf: "SP",
        logoUrl: "assets/bravvi-logo.png"
      });
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY_EMPRESA) || localStorage.getItem('TEXPRO_ERP_EMPRESA_CONFIG');
      if (raw) {
        return Object.assign({}, EMPRESA_PADRAO, JSON.parse(raw));
      }
    } catch (e) {
      console.warn('Erro ao carregar dados da empresa:', e);
    }
    return Object.assign({}, EMPRESA_PADRAO);
  }

  function salvarEmpresaConfig(dados) {
    if (isModoDemo()) {
      const atual = obterEmpresaConfig();
      const novo = Object.assign({}, atual, dados);
      atualizarElementosVisuaisEmpresa(novo);
      return novo;
    }
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
      const perfilId = localStorage.getItem(STORAGE_KEY_PERFIL) || localStorage.getItem('TEXPRO_ERP_PERFIL_ATIVO') || 'dono';
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
    // Header da sidebar (Marca Oficial do Sistema ou Marca Própria Customizada)
    const title = document.getElementById('sidebarBrandTitle');
    if (title) {
      if (empresa.nomeFantasia && !empresa.nomeFantasia.toLowerCase().includes('bravvi')) {
        title.textContent = empresa.nomeFantasia.toUpperCase();
      } else {
        title.textContent = 'BRAVVI';
      }
    }

    const sub = document.getElementById('sidebarBrandSubtitle');
    if (sub) sub.textContent = 'ERP TÊXTIL';

    const icon = document.getElementById('sidebarBrandIcon');
    if (icon) {
      if (empresa.logoUrl && empresa.logoUrl.startsWith('data:image')) {
        icon.innerHTML = `<img src="${empresa.logoUrl}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 4px;" alt="Logo">`;
        icon.style.background = 'transparent';
        icon.style.padding = '0';
      } else if (!empresa.nomeFantasia || empresa.nomeFantasia.toLowerCase().includes('bravvi')) {
        icon.innerHTML = `<img src="assets/bravvi-icon.png" style="width: 100%; height: 100%; object-fit: contain; border-radius: 4px;" alt="Bravvi">`;
        icon.style.background = 'transparent';
        icon.style.padding = '0';
      } else {
        const sigla = empresa.nomeFantasia.substring(0, 2).toUpperCase();
        icon.textContent = sigla;
      }
    }

    // Top navbar (Identificação da Fábrica/Empresa operando no momento)
    const headerNome = document.getElementById('headerEmpresaNome');
    if (headerNome) headerNome.textContent = empresa.nomeFantasia || empresa.razaoSocial || 'Bravvi Indústria Têxtil';

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
  // ==========================================================================
  // MOTOR DE CONEXÃO SUPABASE (POSTGRESQL REALTIME) & FIREBASE
  // ==========================================================================
  const STORAGE_KEY_SUPABASE = 'BRAVVI_ERP_SUPABASE_CONFIG';
  const STORAGE_KEY_FIREBASE = 'BRAVVI_ERP_FIREBASE_CONFIG';
  const STORAGE_KEY_PROVEDOR = 'BRAVVI_ERP_CLOUD_PROVEDOR_ATIVO';

  let supabaseClient = null;
  let supabaseChannel = null;
  let firestoreDb = null;
  let unsubscribeRealtimeFirebase = null;
  let syncDebounceTimer = null;
  let ultimaAtualizacaoRemota = 0;

  // Script SQL Oficial para o Banco de Dados Supabase
  const SQL_SCHEMA_SUPABASE = `-- ==============================================================
-- BRAVVI ERP TÊXTIL - SCHEMA DO SUPABASE (POSTGRESQL REALTIME)
-- Cole e execute este script no "SQL Editor" do seu Supabase
-- ==============================================================

-- 1. Cria a tabela principal de multi-tenants e estado operacional
create table if not exists public.erp_tenants (
  tenant_id text primary key,
  db jsonb not null,
  empresa jsonb,
  ultima_atualizacao_ms bigint,
  versao_erp text default '8.4.0',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilita o canal de Realtime (WebSockets) para a tabela
alter publication supabase_realtime add table public.erp_tenants;

-- 3. Habilita Row Level Security (RLS)
alter table public.erp_tenants enable row level security;

-- 4. Cria política de acesso público para o ERP
create policy "Acesso livre anonimo ao ERP"
on public.erp_tenants
for all
using (true)
with check (true);
`;

  function obterSqlCriacaoTabelasSupabase() {
    return SQL_SCHEMA_SUPABASE;
  }

  // --- SUPABASE CONFIG (CONEXÃO NATIVA AUTOMÁTICA) ---
  const SUPABASE_CONFIG_PADRAO = {
    url: "https://nrhygqygcfjyniogjegq.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yaHlncXlnY2ZqeW5pb2dqZWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NzU1MTMsImV4cCI6MjEwNjA1MTUxM30.JXAt9Ha1ni2T3G-dMvITGdH9PIPTc7_utI3H9LPrIV4"
  };

  function obterSupabaseConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SUPABASE) || localStorage.getItem('TEXPRO_ERP_SUPABASE_CONFIG');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.url && parsed.anonKey) {
          parsed.url = parsed.url.replace(/\/rest\/v1\/?$/, '').trim();
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar credenciais do Supabase:', e);
    }
    if (window.BRAVVI_SUPABASE_CONFIG || window.TEXPRO_SUPABASE_CONFIG) {
      return window.BRAVVI_SUPABASE_CONFIG || window.TEXPRO_SUPABASE_CONFIG;
    }
    return Object.assign({}, SUPABASE_CONFIG_PADRAO);
  }

  function salvarSupabaseConfig(config) {
    try {
      if (!config) {
        localStorage.removeItem(STORAGE_KEY_SUPABASE);
        supabaseClient = null;
        if (supabaseChannel) {
          supabaseChannel.unsubscribe();
          supabaseChannel = null;
        }
        atualizarStatusNuvem();
        return true;
      }
      if (config.url) {
        config.url = config.url.replace(/\/rest\/v1\/?$/, '').trim();
      }
      localStorage.setItem(STORAGE_KEY_SUPABASE, JSON.stringify(config));
      localStorage.setItem(STORAGE_KEY_PROVEDOR, 'supabase');
      return inicializarSupabase();
    } catch (e) {
      console.error('Erro ao salvar credenciais do Supabase:', e);
      return false;
    }
  }

  function inicializarSupabase() {
    const config = obterSupabaseConfig();
    if (!config || !config.url || !config.anonKey) {
      supabaseClient = null;
      atualizarStatusNuvem();
      return false;
    }

    if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
      console.warn('SDK do Supabase ainda não carregou do CDN.');
      atualizarStatusNuvem();
      return false;
    }

    try {
      const cleanUrl = config.url.replace(/\/rest\/v1\/?$/, '').trim();
      supabaseClient = window.supabase.createClient(cleanUrl, config.anonKey.trim(), {
        auth: { persistSession: false, autoRefreshToken: false }
      });
      atualizarStatusNuvem();
      return true;
    } catch (err) {
      console.error('Falha ao inicializar Supabase:', err);
      supabaseClient = null;
      atualizarStatusNuvem();
      return false;
    }
  }

  // --- FIREBASE CONFIG (LEGACY / FALLBACK) ---
  function obterFirebaseConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FIREBASE) || localStorage.getItem('TEXPRO_ERP_FIREBASE_CONFIG');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Erro ao carregar credenciais do Firebase:', e);
    }
    if (window.BRAVVI_FIREBASE_CONFIG || window.TEXPRO_FIREBASE_CONFIG) {
      return window.BRAVVI_FIREBASE_CONFIG || window.TEXPRO_FIREBASE_CONFIG;
    }
    return null;
  }

  function salvarFirebaseConfig(config) {
    try {
      if (!config) {
        localStorage.removeItem(STORAGE_KEY_FIREBASE);
        firestoreDb = null;
        if (unsubscribeRealtimeFirebase) unsubscribeRealtimeFirebase();
        atualizarStatusNuvem();
        return true;
      }
      localStorage.setItem(STORAGE_KEY_FIREBASE, JSON.stringify(config));
      localStorage.setItem(STORAGE_KEY_PROVEDOR, 'firebase');
      return inicializarFirebase();
    } catch (e) {
      console.error('Erro ao salvar credenciais do Firebase:', e);
      return false;
    }
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

  // --- TENANT & PROVEDORES ---
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

  function obterProvedorAtivo() {
    const pref = localStorage.getItem(STORAGE_KEY_PROVEDOR);
    if (pref === 'supabase' && supabaseClient) return 'supabase';
    if (pref === 'firebase' && firestoreDb) return 'firebase';
    if (supabaseClient) return 'supabase';
    if (firestoreDb) return 'firebase';
    return 'local';
  }

  function isNuvemAtiva() {
    return (supabaseClient !== null || firestoreDb !== null) && navigator.onLine;
  }

  // --- SINCRONIZAÇÃO EM NUVEM (DEBOUNCE 1.2s) ---
  function sincronizarComNuvem(dbAtual) {
    if (isModoDemo()) {
      atualizarStatusNuvem();
      return;
    }
    const provedor = obterProvedorAtivo();
    if (provedor === 'local' || !navigator.onLine) {
      atualizarStatusNuvem();
      return;
    }

    if (syncDebounceTimer) clearTimeout(syncDebounceTimer);

    definirTextoStatusNuvem('🔄 Sincronizando...', '#dbeafe', '#1d4ed8');

    syncDebounceTimer = setTimeout(() => {
      const tenantId = obterTenantId();
      const agora = Date.now();
      ultimaAtualizacaoRemota = agora;

      if (provedor === 'supabase' && supabaseClient) {
        supabaseClient
          .from('erp_tenants')
          .upsert({
            tenant_id: tenantId,
            db: dbAtual,
            empresa: obterEmpresaConfig(),
            ultima_atualizacao_ms: agora,
            versao_erp: "8.4.0",
            updated_at: new Date().toISOString()
          }, { onConflict: 'tenant_id' })
          .then(({ error }) => {
            if (error) {
              console.warn('Erro ao salvar no Supabase (mantendo local):', error);
            }
            atualizarStatusNuvem();
          })
          .catch(err => {
            console.warn('Exceção ao sincronizar Supabase:', err);
            atualizarStatusNuvem();
          });
      } else if (provedor === 'firebase' && firestoreDb) {
        try {
          const docRef = firestoreDb.collection('empresas_erp').doc(tenantId);
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
          console.warn('Exceção ao sincronizar Firebase:', e);
          atualizarStatusNuvem();
        }
      }
    }, 1200);
  }

  // --- ESCUTA EM TEMPO REAL ---
  function iniciarEscutaRealtime(onAtualizacaoRemota) {
    if (isModoDemo()) {
      return;
    }
    const provedor = obterProvedorAtivo();
    const tenantId = obterTenantId();

    if (provedor === 'supabase' && supabaseClient) {
      if (supabaseChannel) {
        supabaseChannel.unsubscribe();
      }

      try {
        // Carga inicial do Supabase para garantir sincronização de boot
        supabaseClient
          .from('erp_tenants')
          .select('db, ultima_atualizacao_ms')
          .eq('tenant_id', tenantId)
          .maybeSingle()
          .then(({ data, error }) => {
            if (!error && data && data.db && data.ultima_atualizacao_ms) {
              if (data.ultima_atualizacao_ms > (ultimaAtualizacaoRemota + 500)) {
                ultimaAtualizacaoRemota = data.ultima_atualizacao_ms;
                if (typeof onAtualizacaoRemota === 'function') {
                  onAtualizacaoRemota(data.db);
                }
              }
            }
          })
          .catch(e => console.warn('Aviso no fetch inicial Supabase:', e));

        // Subscrição Realtime via WebSocket do Supabase
        supabaseChannel = supabaseClient
          .channel('realtime_erp_' + tenantId)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'erp_tenants',
              filter: `tenant_id=eq.${tenantId}`
            },
            (payload) => {
              const reg = payload.new;
              if (reg && reg.db && reg.ultima_atualizacao_ms && reg.ultima_atualizacao_ms > (ultimaAtualizacaoRemota + 500)) {
                ultimaAtualizacaoRemota = reg.ultima_atualizacao_ms;
                if (typeof onAtualizacaoRemota === 'function') {
                  onAtualizacaoRemota(reg.db);
                }
                definirTextoStatusNuvem('Nuvem Sincronizada', '#ecfdf5', '#047857');
                setTimeout(atualizarStatusNuvem, 2000);
              }
            }
          )
          .subscribe();
      } catch (e) {
        console.warn('Falha ao abrir realtime Supabase:', e);
      }
    } else if (provedor === 'firebase' && firestoreDb) {
      if (unsubscribeRealtimeFirebase) unsubscribeRealtimeFirebase();

      try {
        const docRef = firestoreDb.collection('empresas_erp').doc(tenantId);
        unsubscribeRealtimeFirebase = docRef.onSnapshot(doc => {
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

  // --- STATUS DA BARRA SUPERIOR (DISCRETO & WHITE-LABEL CORPORATIVO) ---
  function atualizarStatusNuvem() {
    const badge = document.getElementById('cloudStatusBadge');
    const txt = document.getElementById('cloudStatusText');
    if (!badge || !txt) return;

    if (isModoDemo()) {
      badge.style.background = '#eff6ff';
      badge.style.color = '#1d4ed8';
      badge.style.borderColor = '#bfdbfe';
      const dot = badge.querySelector('span:first-child');
      if (dot) dot.style.background = '#3b82f6';
      txt.textContent = '🧪 Test Drive Ativo';
      badge.title = 'Modo de teste: dados de demonstração interativos, nenhuma alteração é salva na nuvem.';
      return;
    }

    if (!navigator.onLine) {
      badge.style.background = '#fffbeb';
      badge.style.color = '#b45309';
      badge.style.borderColor = '#fde68a';
      const dot = badge.querySelector('span:first-child');
      if (dot) dot.style.background = '#f59e0b';
      txt.textContent = 'Modo Offline';
      badge.title = 'Sem conexão com a internet. Gravando dados com segurança no dispositivo.';
      return;
    }

    if (isNuvemAtiva()) {
      badge.style.background = '#ecfdf5';
      badge.style.color = '#047857';
      badge.style.borderColor = '#a7f3d0';
      const dot = badge.querySelector('span:first-child');
      if (dot) dot.style.background = '#10b981';
      txt.textContent = 'Nuvem Ativa';
      badge.title = 'Sistema conectado à nuvem em tempo real com backup contínuo.';
    } else {
      badge.style.background = '#f8fafc';
      badge.style.color = '#475569';
      badge.style.borderColor = '#cbd5e1';
      const dot = badge.querySelector('span:first-child');
      if (dot) dot.style.background = '#64748b';
      txt.textContent = 'Modo Seguro';
      badge.title = 'Armazenamento local seguro ativo.';
    }
  }

  window.addEventListener('online', () => {
    inicializarSupabase();
    inicializarFirebase();
    atualizarStatusNuvem();
  });
  window.addEventListener('offline', atualizarStatusNuvem);

  // --- MODAL DE CONFIGURAÇÃO DA NUVEM (SUPABASE / FIREBASE) ---
  function abrirModalConfigNuvem() {
    const supabaseCfg = obterSupabaseConfig() || {};
    const firebaseCfg = obterFirebaseConfig() || {};
    const provedorAtivo = obterProvedorAtivo();
    const isAtivo = isNuvemAtiva();
    const tenantId = obterTenantId();

    const modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-layer';
    overlay.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-box" style="max-width: 680px;">
          <div class="modal-header">
            <div>
              <div class="modal-title">Configurar Banco de Dados na Nuvem</div>
              <div style="font-size: 11.5px; color: var(--text-gray-500); margin-top: 2px;">
                Sincronize pedidos e estoque em tempo real entre celular, tablet e computador
              </div>
            </div>
            <button class="modal-close" id="btnFecharModalNuvem">&times;</button>
          </div>

          <div class="modal-body" style="padding: 20px;">
            <!-- Status Card -->
            <div style="background: ${isAtivo ? '#ecfdf5' : '#f0f9ff'}; border: 1.5px solid ${isAtivo ? '#a7f3d0' : '#bae6fd'}; border-radius: 6px; padding: 12px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <strong style="color: ${isAtivo ? '#047857' : '#0369a1'}; font-size: 13px;">
                  ${isAtivo 
                    ? `🟢 Conectado via ${provedorAtivo === 'supabase' ? 'Supabase (PostgreSQL)' : 'Firebase Firestore'}` 
                    : '🔵 Modo Local Offline-First Ativo (Zero Risco)'}
                </strong>
                <div style="font-size: 11.5px; color: ${isAtivo ? '#065f46' : '#0c4a6e'}; margin-top: 2px;">
                  ${isAtivo 
                    ? `Fábrica: <strong>${tenantId}</strong> • Atualização instantânea multi-telas ativada.`
                    : 'Conecte seu banco de dados na nuvem para compartilhar dados com seus vendedores.'}
                </div>
              </div>
              <span class="status-pill ${isAtivo ? 'status-green' : 'status-blue'}" style="font-size: 10px; font-weight: 800;">
                ${isAtivo ? 'SINCRONIZADO' : 'PRONTO'}
              </span>
            </div>

            <!-- Abas de Seleção de Provedor -->
            <div style="display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
              <button type="button" id="tabSupabase" class="btn btn-sm ${provedorAtivo === 'supabase' || provedorAtivo === 'local' ? 'btn-primary' : 'btn-secondary'}" style="display: flex; align-items: center; gap: 6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                Supabase (PostgreSQL - Recomendado)
              </button>
              <button type="button" id="tabFirebase" class="btn btn-sm ${provedorAtivo === 'firebase' ? 'btn-primary' : 'btn-secondary'}" style="display: flex; align-items: center; gap: 6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L3 19h18L12 2z"/></svg>
                Firebase (Firestore)
              </button>
            </div>

            <!-- PAINEL SUPABASE -->
            <div id="painelSupabase" style="display: ${provedorAtivo === 'firebase' ? 'none' : 'block'};">
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 14px; font-size: 11.5px; color: #334155; line-height: 1.5;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <strong style="color: #0f172a; font-size: 12px;">Passo 1: Criar tabela no Supabase</strong>
                  <a href="https://supabase.com/dashboard" target="_blank" style="color: #0284c7; text-decoration: underline; font-weight: 600;">Abrir Supabase Dashboard &rarr;</a>
                </div>
                Crie um projeto grátis no Supabase, abra o <strong>SQL Editor</strong> e rode o script oficial com 1 clique:
                <div style="margin-top: 8px;">
                  <button type="button" id="btnCopiarSqlSupabase" class="btn btn-secondary btn-sm" style="font-size: 11px;">
                    📋 Copiar Script SQL do Supabase
                  </button>
                  <span id="msgSqlCopiado" style="display: none; margin-left: 8px; color: #16a34a; font-weight: 700; font-size: 11px;">✓ SQL Copiado para a Área de Transferência!</span>
                </div>
              </div>

              <div class="form-group" style="margin-bottom: 12px;">
                <label class="form-label" style="font-size: 11.5px;">Project URL (URL do Projeto Supabase):</label>
                <input type="text" id="txtSupabaseUrl" class="form-input" style="font-family: var(--font-mono); font-size: 12px;" placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co" value="${supabaseCfg.url || ''}">
              </div>

              <div class="form-group" style="margin-bottom: 14px;">
                <label class="form-label" style="font-size: 11.5px;">API Key (chave anon / public):</label>
                <input type="password" id="txtSupabaseKey" class="form-input" style="font-family: var(--font-mono); font-size: 12px;" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." value="${supabaseCfg.anonKey || ''}">
              </div>
            </div>

            <!-- PAINEL FIREBASE -->
            <div id="painelFirebase" style="display: ${provedorAtivo === 'firebase' ? 'block' : 'none'};">
              <div class="form-group" style="margin-bottom: 14px;">
                <label class="form-label" style="display: flex; justify-content: space-between; align-items: center;">
                  <span>Cole aqui o objeto de configuração do Firebase (firebaseConfig):</span>
                  <a href="https://console.firebase.google.com/" target="_blank" style="font-size: 11px; color: #0284c7; text-decoration: underline;">Console Firebase &rarr;</a>
                </label>
                <textarea id="txtFirebaseConfig" class="form-input" style="height: 120px; font-family: var(--font-mono); font-size: 11px; line-height: 1.4;" placeholder='{\n  "apiKey": "AIzaSy...",\n  "projectId": "seuerp"\n}'>${firebaseCfg && firebaseCfg.apiKey ? JSON.stringify(firebaseCfg, null, 2) : ''}</textarea>
              </div>
            </div>

            <!-- Vantagens -->
            <div style="background: #f1f5f9; border-radius: 6px; padding: 10px 12px; font-size: 11px; color: #475569; line-height: 1.4;">
              💡 <strong>Segurança Total:</strong> Toda gravação é offline-first. Se a internet cair no meio da confecção, tudo continua funcionando no computador e sincroniza automaticamente assim que a conexão retornar.
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

    // Troca de Abas
    const tabSupabase = overlay.querySelector('#tabSupabase');
    const tabFirebase = overlay.querySelector('#tabFirebase');
    const painelSupabase = overlay.querySelector('#painelSupabase');
    const painelFirebase = overlay.querySelector('#painelFirebase');

    let abaAtual = (provedorAtivo === 'firebase') ? 'firebase' : 'supabase';

    tabSupabase?.addEventListener('click', () => {
      abaAtual = 'supabase';
      tabSupabase.className = 'btn btn-sm btn-primary';
      tabFirebase.className = 'btn btn-sm btn-secondary';
      painelSupabase.style.display = 'block';
      painelFirebase.style.display = 'none';
    });

    tabFirebase?.addEventListener('click', () => {
      abaAtual = 'firebase';
      tabFirebase.className = 'btn btn-sm btn-primary';
      tabSupabase.className = 'btn btn-sm btn-secondary';
      painelFirebase.style.display = 'block';
      painelSupabase.style.display = 'none';
    });

    // Copiar Script SQL do Supabase
    overlay.querySelector('#btnCopiarSqlSupabase')?.addEventListener('click', () => {
      const sql = obterSqlCriacaoTabelasSupabase();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(sql).then(() => {
          const msg = overlay.querySelector('#msgSqlCopiado');
          if (msg) {
            msg.style.display = 'inline';
            setTimeout(() => { msg.style.display = 'none'; }, 4000);
          }
        });
      } else {
        prompt('Copie o script SQL abaixo e cole no SQL Editor do Supabase:', sql);
      }
    });

    // Desconectar Nuvem
    overlay.querySelector('#btnDesconectarNuvem')?.addEventListener('click', () => {
      if (confirm('Deseja desconectar da nuvem? O sistema voltará a salvar apenas no computador atual.')) {
        salvarSupabaseConfig(null);
        salvarFirebaseConfig(null);
        localStorage.setItem(STORAGE_KEY_PROVEDOR, 'local');
        fechar();
        alert('Nuvem desconectada com sucesso. Modo Local Seguro ativo.');
      }
    });

    // Salvar e Conectar
    overlay.querySelector('#btnSalvarConectarNuvem')?.addEventListener('click', () => {
      if (abaAtual === 'supabase') {
        const url = overlay.querySelector('#txtSupabaseUrl')?.value.trim();
        const anonKey = overlay.querySelector('#txtSupabaseKey')?.value.trim();

        if (!url || !anonKey) {
          alert('Por favor, informe a URL do projeto Supabase e a API Key (anon).');
          return;
        }

        if (!url.startsWith('http')) {
          alert('A URL do Supabase deve começar com https://');
          return;
        }

        const ok = salvarSupabaseConfig({ url, anonKey });
        if (ok) {
          fechar();
          alert('Conexão com o Supabase estabelecida com sucesso! O sistema agora utiliza PostgreSQL com sincronização em tempo real.');
        } else {
          alert('Não foi possível conectar ao Supabase. Verifique se o script SQL foi executado e se as chaves estão corretas.');
        }
      } else {
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
            const cleanStr = raw.replace(/const\s+firebaseConfig\s*=\s*/, '').replace(/;\s*$/, '');
            configObj = Function('"use strict"; return (' + cleanStr + ')')();
          }

          if (!configObj || !configObj.apiKey || !configObj.projectId) {
            throw new Error('As chaves apiKey e projectId são obrigatórias.');
          }

          const ok = salvarFirebaseConfig(configObj);
          if (ok) {
            fechar();
            alert('Conexão com o Firebase estabelecida com sucesso!');
          } else {
            alert('Não foi possível conectar ao Firebase.');
          }
        } catch (err) {
          alert('Erro ao interpretar configuração do Firebase: ' + err.message);
        }
      }
    });
  }

  // Inicialização Automática da Nuvem no Boot
  document.addEventListener('DOMContentLoaded', () => {
    inicializarSupabase();
    inicializarFirebase();
    atualizarStatusNuvem();
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
    // Supabase
    obterSupabaseConfig,
    salvarSupabaseConfig,
    obterSqlCriacaoTabelasSupabase,
    // Firebase
    obterFirebaseConfig,
    salvarFirebaseConfig,
    // Estado Geral da Nuvem
    obterProvedorAtivo,
    isNuvemAtiva,
    sincronizarComNuvem,
    iniciarEscutaRealtime,
    abrirModalConfigNuvem,
    atualizarStatusNuvem
  };
})();

