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
      const user = obterUsuarioLogado();
      if (user && user.user_metadata && user.user_metadata.perfil) {
        const pId = user.user_metadata.perfil;
        return PERFIS_PERMISSOES[pId] || PERFIS_PERMISSOES.dono;
      }
      const perfilId = localStorage.getItem(STORAGE_KEY_PERFIL) || localStorage.getItem('TEXPRO_ERP_PERFIL_ATIVO') || 'dono';
      return PERFIS_PERMISSOES[perfilId] || PERFIS_PERMISSOES.dono;
    } catch (e) {
      return PERFIS_PERMISSOES.dono;
    }
  }

  function definirPerfilAtivo(perfilId) {
    const user = obterUsuarioLogado();
    // Bloqueio de segurança: se o usuário logado possui perfil atribuído pelo admin (ex: vendedor, oficina), ele não pode alterar seu perfil
    if (user && user.user_metadata && user.user_metadata.perfil && user.user_metadata.perfil !== 'dono') {
      perfilId = user.user_metadata.perfil;
    }
    const p = PERFIS_PERMISSOES[perfilId] || PERFIS_PERMISSOES.dono;
    try {
      localStorage.setItem(STORAGE_KEY_PERFIL, p.id);
    } catch (e) {}
    atualizarVisuaisPerfil(p);
    return p;
  }

  function atualizarVisuaisPerfil(perfil) {
    // Atualiza o badge oficial na barra superior (navbar)
    const roleBadgeText = document.getElementById('navbarUserRoleText');
    if (roleBadgeText) {
      roleBadgeText.textContent = perfil.cargo || perfil.nome;
    }

    const sel = document.getElementById('selectPerfilUsuario');
    if (sel && sel.value !== perfil.id) {
      sel.value = perfil.id;
    }

    const user = obterUsuarioLogado();
    const nomeExibicao = (user && user.user_metadata && (user.user_metadata.full_name || user.user_metadata.company_name)) || perfil.nome;

    const av = document.getElementById('sidebarUserAvatar');
    if (av) {
      const iniciais = (nomeExibicao.replace(/[^a-zA-Z]/g, '').substring(0, 2) || perfil.avatar || 'US').toUpperCase();
      av.textContent = iniciais;
    }

    const un = document.getElementById('sidebarUserName');
    if (un) un.textContent = nomeExibicao;

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

    // Verifica a assinatura e status de pagamento da confecção
    verificarStatusAssinaturaEmpresa(empresa);
  }

  // ==========================================================================
  // ESCUDO DE INADIMPLÊNCIA & GESTÃO DE ASSINATURAS (CAKTO)
  // ==========================================================================
  const LINK_PAGAMENTO_ASSINATURA = 'https://pay.cakto.com.br/rb6atzs_1178556';

  function verificarStatusAssinaturaEmpresa(empresa) {
    if (isModoDemo()) return; // Modo demonstração não possui bloqueio

    const dadosEmp = empresa || obterEmpresaConfig();
    const vencimentoStr = dadosEmp.dataVencimento || 
                          localStorage.getItem('BRAVVI_ERP_ASSINATURA_VENCIMENTO') || 
                          dadosEmp.vencimento;

    if (!vencimentoStr) return;

    const agora = new Date();
    const dataVenc = new Date(vencimentoStr);
    if (isNaN(dataVenc.getTime())) return;

    const diffMs = agora.getTime() - dataVenc.getTime();
    const diasAtraso = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Se está em dia (vencimento no futuro)
    if (diasAtraso < 0) {
      removerAvisosAssinatura();
      return;
    }

    // Se está nos 3 primeiros dias de atraso: Carência Amigável (Não trava o chão de fábrica)
    if (diasAtraso <= 3) {
      exibirBannerCarencia(dataVenc, 3 - diasAtraso);
      return;
    }

    // Mais de 3 dias de atraso: BLOQUEIO TOTAL OPERACIONAL (PAYWALL)
    exibirModalBloqueioInadimplencia(dadosEmp, diasAtraso);
  }

  function removerAvisosAssinatura() {
    const banner = document.getElementById('bravviBannerCarencia');
    if (banner) banner.remove();
    const modal = document.getElementById('bravviModalPaywall');
    if (modal) modal.remove();
  }

  function exibirBannerCarencia(dataVenc, diasRestantes) {
    if (document.getElementById('bravviBannerCarencia')) return;
    const banner = document.createElement('div');
    banner.id = 'bravviBannerCarencia';
    banner.style.cssText = `
      background: #fef3c7;
      color: #92400e;
      border-bottom: 2px solid #f59e0b;
      padding: 10px 18px;
      font-size: 13px;
      font-weight: 700;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 99999;
      font-family: 'Plus Jakarta Sans', sans-serif;
    `;
    banner.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>⚠️</span>
        <span>Atenção: A mensalidade da sua fábrica venceu em ${dataVenc.toLocaleDateString('pt-BR')}. Você tem <strong>${diasRestantes} dia(s) de tolerância</strong> antes do bloqueio das fichas técnicas.</span>
      </div>
      <a href="${LINK_PAGAMENTO_ASSINATURA}" target="_blank" style="background: #0d9488; color: #ffffff; padding: 5px 14px; border-radius: 9999px; text-decoration: none; font-size: 12px; font-weight: 800;">
        Regularizar Mensalidade &rarr;
      </a>
    `;
    document.body.prepend(banner);
  }

  function exibirModalBloqueioInadimplencia(empresa, diasAtraso) {
    if (document.getElementById('bravviModalPaywall')) return;

    // Desativa rolagem do fundo
    document.body.style.overflow = 'hidden';

    const overlay = document.createElement('div');
    overlay.id = 'bravviModalPaywall';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(3, 43, 53, 0.96);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      z-index: 9999999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #ffffff;
    `;

    overlay.innerHTML = `
      <div style="background: #ffffff; color: #0f172a; border-radius: 20px; max-width: 520px; width: 100%; padding: 40px 32px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4); border: 2px solid #cbd5e1;">
        <img src="assets/bravvi-logo.png" style="height: 48px; width: auto; object-fit: contain; margin-bottom: 20px;" alt="Bravvi ERP">
        
        <div style="display: inline-flex; align-items: center; gap: 6px; background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; padding: 4px 12px; border-radius: 9999px; font-size: 11.5px; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 16px;">
          ACESSO OPERACIONAL SUSPENSO
        </div>

        <h2 style="font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 800; color: #032b35; margin-bottom: 10px;">
          Mensalidade Pendente
        </h2>

        <p style="font-size: 14px; color: #475569; line-height: 1.55; margin-bottom: 24px;">
          A assinatura da confecção <strong>${empresa.nomeFantasia || empresa.razaoSocial || 'sua confecção'}</strong> venceu há <strong>${diasAtraso} dias</strong>.<br><br>
          Seus dados, pedidos e fichas técnicas continuam <strong>100% salvos e protegidos</strong>. Para retomar a emissão de orçamentos e a produção no chão de fábrica, efetue o pagamento da mensalidade.
        </p>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <a href="${LINK_PAGAMENTO_ASSINATURA}" target="_blank" style="background: #0d9488; color: #ffffff; padding: 14px 20px; border-radius: 9999px; text-decoration: none; font-weight: 800; font-size: 15px; box-shadow: 0 4px 14px rgba(13, 148, 136, 0.4); display: flex; align-items: center; justify-content: center; gap: 8px;">
            💳 Pagar Mensalidade via Cartão ou Pix (Desbloqueio Automático) &rarr;
          </a>

          <a href="https://wa.me/5544998071870?text=Ol%C3%A1!%20Minha%20mensalidade%20do%20Bravvi%20ERP%20venceu%20e%20quero%20enviar%20o%20comprovante%20para%20desbloqueio." target="_blank" style="background: #f1f5f9; color: #334155; padding: 12px 20px; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 13.5px; border: 1px solid #cbd5e1; display: flex; align-items: center; justify-content: center; gap: 8px;">
            💬 Enviar Comprovante de Pagamento no WhatsApp
          </a>

          <button onclick="window.location.reload()" style="background: transparent; border: none; color: #64748b; font-size: 12.5px; font-weight: 600; cursor: pointer; padding: 8px; text-decoration: underline;">
            🔄 Já efetuei o pagamento, verificar desbloqueio agora
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
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
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });

      // Escuta eventos de login/logout explícitos
      supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session && session.user) {
          definirUsuarioLogado(session.user);
        } else if (event === 'SIGNED_OUT') {
          definirUsuarioLogado(null);
        }
        atualizarStatusNuvem();
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

  // ==========================================================================
  // VALIDAÇÃO RIGOROSA DE SENHA FORTE (LETRAS MAIÚSCULAS, MINÚSCULAS, NÚMEROS E ESPECIAIS)
  // ==========================================================================
  function validarSenhaForte(senha) {
    const s = (senha || '').trim();
    const temTamanhoMin = s.length >= 8;
    const temMaiuscula = /[A-Z]/.test(s);
    const temMinuscula = /[a-z]/.test(s);
    const temNumero = /[0-9]/.test(s);
    const temEspecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`§±]/.test(s);

    const pontuacao = (temTamanhoMin ? 1 : 0) + 
                      (temMaiuscula ? 1 : 0) + 
                      (temMinuscula ? 1 : 0) + 
                      (temNumero ? 1 : 0) + 
                      (temEspecial ? 1 : 0);

    let nivel = 'fraca';
    if (pontuacao === 5) {
      nivel = 'forte';
    } else if (pontuacao >= 3) {
      nivel = 'media';
    }

    return {
      valida: pontuacao === 5,
      pontuacao,
      nivel,
      criterios: {
        tamanho: temTamanhoMin,
        maiuscula: temMaiuscula,
        minuscula: temMinuscula,
        numero: temNumero,
        especial: temEspecial
      }
    };
  }

  // ==========================================================================
  // AUTENTICAÇÃO CRIPTOGRÁFICA OFICIAL & GESTÃO MULTI-TENANT ISOLADA
  // ==========================================================================
  const STORAGE_KEY_AUTH_USER = 'BRAVVI_ERP_AUTH_USER';
  let usuarioAutenticado = null;
  let tenantAuthAtivo = null;

  // Utilitários Criptográficos Nativos (SHA-256 e Salt Determinístico por Tenant)
  async function gerarHashSha256(texto) {
    if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
      const encoder = new TextEncoder();
      const data = encoder.encode(texto);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback caso Web Crypto não esteja disponível
    let h1 = 0xdeadbeef ^ 0, h2 = 0x41c64e6d ^ 0;
    for (let i = 0, ch; i < texto.length; i++) {
      ch = texto.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0') + '0123456789abcdef';
  }

  function gerarSaltAleatorio() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const arr = new Uint8Array(16);
      crypto.getRandomValues(arr);
      return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  async function obterTenantIdPorEmail(email) {
    const clean = (email || '').toLowerCase().trim();
    const hash = await gerarHashSha256('tenant_bravvi_' + clean);
    return 'tenant_' + hash.substring(0, 24);
  }

  function obterUsuarioLogado() {
    if (usuarioAutenticado) return usuarioAutenticado;
    try {
      // Limpa chave legada de localStorage se presente
      if (localStorage.getItem(STORAGE_KEY_AUTH_USER)) {
        localStorage.removeItem(STORAGE_KEY_AUTH_USER);
      }
      // Sessão ativa da aba: persiste no F5 (recarregar página), mas expira ao fechar a aba/navegador
      const raw = sessionStorage.getItem(STORAGE_KEY_AUTH_USER);
      if (raw) {
        const sessao = JSON.parse(raw);
        if (sessao && sessao.user) {
          usuarioAutenticado = sessao.user;
          if (sessao.auth) {
            tenantAuthAtivo = sessao.auth;
          }
          atualizarVisuaisUsuarioLogado();
          return usuarioAutenticado;
        }
      }
    } catch (e) {
      console.warn('Erro ao restaurar sessão da aba:', e);
    }
    return null;
  }

  function definirUsuarioLogado(user, authData) {
    usuarioAutenticado = user;
    if (authData) {
      tenantAuthAtivo = authData;
    }
    try {
      if (user) {
        const sessao = {
          user: user,
          auth: authData || tenantAuthAtivo || null,
          salvoEm: Date.now()
        };
        // Salva em sessionStorage para permitir F5 sem pedir senha novamente
        sessionStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(sessao));
        // Guarda o e-mail em localStorage para vir pré-preenchido no próximo acesso
        if (user.email) {
          localStorage.setItem('BRAVVI_REMEMBERED_EMAIL', user.email);
        }
      } else {
        sessionStorage.removeItem(STORAGE_KEY_AUTH_USER);
      }
    } catch (e) {}
    atualizarVisuaisUsuarioLogado();
  }

  function atualizarVisuaisUsuarioLogado() {
    const user = obterUsuarioLogado();
    const avatarEl = document.getElementById('sidebarUserAvatar');
    const nameEl = document.getElementById('sidebarUserName');
    const roleEl = document.getElementById('sidebarUserRole');
    const headerNome = document.getElementById('headerEmpresaNome');
    const roleBadgeText = document.getElementById('navbarUserRoleText');

    if (user) {
      const meta = user.user_metadata || {};
      const nome = meta.full_name || meta.company_name || user.email.split('@')[0];
      const empresa = meta.company_name || 'Minha Confecção';
      const perfilId = meta.perfil || 'dono';
      const perfilObj = PERFIS_PERMISSOES[perfilId] || PERFIS_PERMISSOES.dono;

      if (avatarEl) {
        const iniciais = (nome.replace(/[^a-zA-Z]/g, '').substring(0, 2) || perfilObj.avatar || 'CF').toUpperCase();
        avatarEl.textContent = iniciais;
      }
      if (nameEl) nameEl.textContent = nome;
      if (roleEl) {
        if (perfilId === 'dono') {
          roleEl.textContent = '👑 ' + (meta.role || 'Dono / Diretor');
        } else if (perfilId === 'vendedor') {
          roleEl.textContent = '💼 ' + (meta.role || 'Vendedor Comercial');
        } else {
          roleEl.textContent = '✂️ ' + (meta.role || 'Oficina / Fábrica');
        }
      }
      if (roleBadgeText) {
        roleBadgeText.textContent = perfilObj.cargo || perfilObj.nome;
      }
      if (headerNome && meta.company_name) {
        headerNome.textContent = meta.company_name;
      }
      atualizarVisuaisPerfil(perfilObj);
    } else if (isModoDemo()) {
      if (avatarEl) avatarEl.textContent = 'DEMO';
      if (nameEl) nameEl.textContent = 'Showroom';
      if (roleEl) roleEl.textContent = 'Modo Demonstração';
      if (roleBadgeText) roleBadgeText.textContent = '👑 Dono / Diretor (Demo)';
    }
  }

  async function fazerLogin(email, senha) {
    if (!supabaseClient) inicializarSupabase();
    if (!supabaseClient) return { sucesso: false, erro: 'Sistema de autenticação não inicializado. Verifique sua conexão.' };

    let cleanEmail = (email || '').toLowerCase().trim();
    // Correção inteligente de erros comuns de digitação em domínios populares (.cor -> .com, .con -> .com, etc.)
    cleanEmail = cleanEmail
      .replace(/@(gmail|hotmail|outlook|yahoo)\.co[rn]$/i, '@$1.com')
      .replace(/@(gmail|hotmail|outlook|yahoo)\.com\.b[rn]$/i, '@$1.com.br');

    const senhaStr = senha || '';

    if (!cleanEmail || !senhaStr) {
      return { sucesso: false, erro: 'Por favor, informe seu e-mail e senha de acesso.' };
    }

    const tenantId = await obterTenantIdPorEmail(cleanEmail);

    // Camada 1: Autenticação Criptográfica Direta do Dono / Diretor no Banco erp_tenants
    try {
      const { data: tenantRow, error: errBusca } = await supabaseClient
        .from('erp_tenants')
        .select('tenant_id, empresa, db')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (!errBusca && tenantRow && tenantRow.empresa) {
        const emp = tenantRow.empresa;
        const auth = emp.auth;

        if (auth && auth.salt && auth.hash) {
          const testHash = await gerarHashSha256(auth.salt + ':' + senhaStr);
          if (testHash === auth.hash) {
            tenantAuthAtivo = auth;
            const userObj = {
              id: tenantId,
              tenant_id: tenantId,
              email: cleanEmail,
              user_metadata: {
                company_name: emp.nomeFantasia || emp.razaoSocial || 'Minha Confecção',
                full_name: auth.nomeResponsavel || 'Administrador',
                phone: auth.whatsapp || emp.telefone || '',
                perfil: 'dono',
                role: 'Dono / Diretor',
                tenant_id: tenantId
              }
            };

            salvarEmpresaConfig(emp);
            definirPerfilAtivo('dono');
            definirUsuarioLogado(userObj, auth);

            return { sucesso: true, user: userObj, precisaTrocarSenha: false };
          } else if (senhaStr === 'Bravvi@2026' && auth.precisaTrocarSenha !== true) {
            return {
              sucesso: false,
              erro: 'Sua conta já possui uma senha pessoal definitiva cadastrada. Por favor, acesse com a sua senha pessoal ou clique em "Esqueceu a senha".'
            };
          } else {
            return { sucesso: false, erro: 'E-mail ou senha incorretos. Verifique suas credenciais.' };
          }
        }
      }
    } catch (errDb) {
      console.warn('Aviso na verificação de autenticação de tenant:', errDb);
    }

    // Camada 1.2: Primeiro Acesso com Senha Temporária Oficial (Pós-compra Cakto / Asaas)
    if (senhaStr === 'Bravvi@2026') {
      try {
        let aprovado = null;

        // 1. Busca se este e-mail tem token aprovado na Cakto
        if (supabaseClient) {
          try {
            const { data: tokData } = await supabaseClient
              .from('erp_tokens')
              .select('*')
              .eq('email', cleanEmail)
              .eq('status', 'aprovado')
              .maybeSingle();
            if (tokData) aprovado = tokData;
          } catch(eTok) {}

          if (!aprovado) {
            try {
              const { data: subData } = await supabaseClient
                .from('erp_subscriptions')
                .select('*')
                .eq('email', cleanEmail)
                .in('status', ['ativa', 'aprovado'])
                .maybeSingle();
              if (subData) aprovado = subData;
            } catch(eSub) {}
          }
        }

        // 2. Fallback de verificação local (tokens gerados manualmente ou compras locais)
        if (!aprovado) {
          try {
            const tokensLocal = JSON.parse(localStorage.getItem('BRAVVI_TOKENS_X1') || '[]');
            const achouLocal = tokensLocal.find(t => (t.email || '').toLowerCase().trim() === cleanEmail);
            if (achouLocal) aprovado = achouLocal;
          } catch(eLoc) {}
        }

        // Se o e-mail estiver aprovado (comprou na Cakto ou recebeu liberação)
        if (aprovado) {
          const nomeDono = aprovado.nome_cliente || 'Administrador';
          const telDono = aprovado.telefone || aprovado.whatsapp || '';
          const planoDono = aprovado.plano || 'mensal';

          const userObj = {
            id: tenantId,
            tenant_id: tenantId,
            email: cleanEmail,
            primeiroAcessoDono: true,
            user_metadata: {
              company_name: 'Minha Confecção',
              full_name: nomeDono,
              phone: telDono,
              perfil: 'dono',
              role: 'Dono / Diretor',
              tenant_id: tenantId,
              plano: planoDono
            }
          };

          const empConfig = {
            razaoSocial: 'Minha Confecção',
            nomeFantasia: 'Minha Confecção',
            email: cleanEmail,
            telefone: telDono,
            plano: planoDono,
            statusAssinatura: 'ativa',
            dataVencimento: aprovado.data_vencimento || new Date(Date.now() + (planoDono === 'anual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
            tenantId: tenantId,
            auth: {
              email: cleanEmail,
              nomeResponsavel: nomeDono,
              whatsapp: telDono,
              precisaTrocarSenha: true
            }
          };

          salvarEmpresaConfig(empConfig);
          definirPerfilAtivo('dono');
          definirUsuarioLogado(userObj, empConfig.auth);

          return {
            sucesso: true,
            user: userObj,
            precisaTrocarSenha: true,
            primeiroAcessoDono: true
          };
        } else {
          return {
            sucesso: false,
            erro: 'E-mail não localizado entre as compras aprovadas. Verifique se digitou o mesmo e-mail informado na compra na Cakto.'
          };
        }
      } catch (errTemp) {
        console.warn('Erro ao autenticar senha temporária:', errTemp);
      }
    }

    // Camada 1.5: Autenticação de Colaborador / Funcionário criado pelo Diretor no Supabase
    try {
      const filter = JSON.stringify([{ email: cleanEmail }]);
      const { data: rowsColab, error: errColab } = await supabaseClient
        .from('erp_tenants')
        .select('tenant_id, empresa, db')
        .filter('db->equipe', 'cs', filter);

      if (!errColab && rowsColab && rowsColab.length > 0) {
        const tRow = rowsColab[0];
        const equipe = (tRow.db && Array.isArray(tRow.db.equipe)) ? tRow.db.equipe : [];
        const colab = equipe.find(c => (c.email || '').toLowerCase().trim() === cleanEmail);

        if (colab) {
          if (colab.status && colab.status.toLowerCase() === 'inativo') {
            return { sucesso: false, erro: 'Este usuário está inativo no sistema. Contate a diretoria da empresa.' };
          }

          let senhaCorreta = false;
          if (colab.auth && colab.auth.salt && colab.auth.hash) {
            const testHash = await gerarHashSha256(colab.auth.salt + ':' + senhaStr);
            if (testHash === colab.auth.hash) senhaCorreta = true;
          } else if (colab.senha && colab.senha === senhaStr) {
            senhaCorreta = true;
          }

          if (senhaCorreta) {
            const perfilEscolhido = colab.perfil || (colab.nivelAcesso === 'Admin' ? 'dono' : (colab.nivelAcesso === 'Comercial' ? 'vendedor' : 'oficina'));
            const userObj = {
              id: colab.id || ('colab_' + Date.now()),
              tenant_id: tRow.tenant_id,
              email: cleanEmail,
              colaboradorId: colab.id,
              user_metadata: {
                company_name: tRow.empresa?.nomeFantasia || tRow.empresa?.razaoSocial || 'Minha Confecção',
                full_name: colab.nome || 'Colaborador',
                phone: colab.telefone || '',
                perfil: perfilEscolhido, // Travado pelo que o diretor escolheu!
                role: colab.cargo || colab.especialidade || (perfilEscolhido === 'dono' ? 'Dono / Diretor' : (perfilEscolhido === 'vendedor' ? 'Vendedor Comercial' : 'Oficina & Produção')),
                tenant_id: tRow.tenant_id
              }
            };

            if (tRow.empresa) salvarEmpresaConfig(tRow.empresa);
            definirPerfilAtivo(perfilEscolhido);
            definirUsuarioLogado(userObj, colab.auth || null);

            return {
              sucesso: true,
              user: userObj,
              colaborador: colab,
              colaboradorId: colab.id,
              tenant_id: tRow.tenant_id,
              precisaTrocarSenha: colab.precisaTrocarSenha === true
            };
          } else {
            return { sucesso: false, erro: 'E-mail ou senha incorretos. Verifique sua senha.' };
          }
        }
      }
    } catch (errColab) {
      console.warn('Aviso ao autenticar colaborador na nuvem:', errColab);
    }

    // 1.5.2: Fallback para autenticação de colaborador local (offline / localStorage)
    try {
      const localDbRaw = localStorage.getItem('UNIFORMES_ERP_DATABASE_V8');
      if (localDbRaw) {
        const localDb = JSON.parse(localDbRaw);
        if (localDb && Array.isArray(localDb.equipe)) {
          const colab = localDb.equipe.find(c => (c.email || '').toLowerCase().trim() === cleanEmail);
          if (colab) {
            if (colab.status && colab.status.toLowerCase() === 'inativo') {
              return { sucesso: false, erro: 'Este usuário está inativo no sistema. Contate a diretoria da empresa.' };
            }

            let senhaCorreta = false;
            if (colab.auth && colab.auth.salt && colab.auth.hash) {
              const testHash = await gerarHashSha256(colab.auth.salt + ':' + senhaStr);
              if (testHash === colab.auth.hash) senhaCorreta = true;
            } else if (colab.senha && colab.senha === senhaStr) {
              senhaCorreta = true;
            }

            if (senhaCorreta) {
              const emp = obterEmpresaConfig();
              const perfilEscolhido = colab.perfil || (colab.nivelAcesso === 'Admin' ? 'dono' : (colab.nivelAcesso === 'Comercial' ? 'vendedor' : 'oficina'));
              const tId = localStorage.getItem('BRAVVI_ERP_TENANT_ID') || 'local';
              const userObj = {
                id: colab.id,
                tenant_id: tId,
                email: cleanEmail,
                colaboradorId: colab.id,
                user_metadata: {
                  company_name: emp.nomeFantasia || emp.razaoSocial || 'Minha Confecção',
                  full_name: colab.nome,
                  phone: colab.telefone || '',
                  perfil: perfilEscolhido,
                  role: colab.cargo || perfilEscolhido,
                  tenant_id: tId
                }
              };
              definirPerfilAtivo(perfilEscolhido);
              definirUsuarioLogado(userObj, colab.auth || null);

              return {
                sucesso: true,
                user: userObj,
                colaborador: colab,
                colaboradorId: colab.id,
                tenant_id: tId,
                precisaTrocarSenha: colab.precisaTrocarSenha === true
              };
            } else {
              return { sucesso: false, erro: 'E-mail ou senha incorretos. Verifique sua senha.' };
            }
          }
        }
      }
    } catch (e) {}

    // Camada 2: Fallback para contas criadas via Supabase Auth
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: cleanEmail,
        password: senhaStr
      });

      if (!error && data && data.user) {
        const tId = data.user.user_metadata?.tenant_id || tenantId || ('tenant_' + data.user.id.replace(/-/g, '_'));
        data.user.tenant_id = tId;

        definirUsuarioLogado(data.user);
        if (data.user.user_metadata && data.user.user_metadata.company_name) {
          const emp = obterEmpresaConfig();
          emp.nomeFantasia = data.user.user_metadata.company_name;
          emp.razaoSocial = data.user.user_metadata.company_name;
          salvarEmpresaConfig(emp);
        }
        return { sucesso: true, user: data.user, session: data.session };
      }

      if (error) {
        const msg = error.message ? error.message.toLowerCase() : '';
        if (msg.includes('invalid login credentials')) {
          return { sucesso: false, erro: 'E-mail ou senha incorretos.' };
        }
        if (msg.includes('email not confirmed')) {
          return {
            sucesso: false,
            codigo: 'email_not_confirmed',
            erro: 'E-mail cadastrado, mas ainda aguardando ativação.'
          };
        }
        return { sucesso: false, erro: error.message };
      }
    } catch (errAuth) {
      console.warn('Erro no fallback do Supabase Auth:', errAuth);
    }

    return {
      sucesso: false,
      erro: 'E-mail ou senha incorretos. Se ainda não possui conta, clique na aba "Cadastrar Minha Confecção".'
    };
  }

  async function atualizarSenhaColaborador(colaboradorId, novaSenha, tenantIdOpcional) {
    if (!colaboradorId || !novaSenha || novaSenha.length < 6) {
      return { sucesso: false, erro: 'A nova senha deve ter no mínimo 6 caracteres.' };
    }

    const salt = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const hash = await gerarHashSha256(salt + ':' + novaSenha);
    const novaAuth = { salt, hash };

    // 1. Atualiza no banco local se estiver em window.ERP ou localStorage
    try {
      if (window.ERP && typeof window.ERP.obterDb === 'function') {
        const dbLocal = window.ERP.obterDb();
        if (dbLocal && Array.isArray(dbLocal.equipe)) {
          const colab = dbLocal.equipe.find(u => u.id === colaboradorId);
          if (colab) {
            colab.auth = novaAuth;
            colab.precisaTrocarSenha = false;
            colab.senhaAlteradaEm = new Date().toISOString();
            delete colab.senha;
            delete colab.senhaTemporaria;
          }
        }
      }
      const raw = localStorage.getItem('UNIFORMES_ERP_DATABASE_V8');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.equipe)) {
          const colab = parsed.equipe.find(u => u.id === colaboradorId);
          if (colab) {
            colab.auth = novaAuth;
            colab.precisaTrocarSenha = false;
            colab.senhaAlteradaEm = new Date().toISOString();
            delete colab.senha;
            delete colab.senhaTemporaria;
            localStorage.setItem('UNIFORMES_ERP_DATABASE_V8', JSON.stringify(parsed));
          }
        }
      }
    } catch (e) {
      console.warn('Aviso ao atualizar senha local:', e);
    }

    // 2. Atualiza no Supabase erp_tenants
    const tId = tenantIdOpcional || obterTenantId();
    if (tId && supabaseClient) {
      try {
        const { data: tRow, error: errGet } = await supabaseClient
          .from('erp_tenants')
          .select('tenant_id, db')
          .eq('tenant_id', tId)
          .maybeSingle();

        if (!errGet && tRow && tRow.db && Array.isArray(tRow.db.equipe)) {
          const colab = tRow.db.equipe.find(u => u.id === colaboradorId);
          if (colab) {
            colab.auth = novaAuth;
            colab.precisaTrocarSenha = false;
            colab.senhaAlteradaEm = new Date().toISOString();
            delete colab.senha;
            delete colab.senhaTemporaria;

            await supabaseClient
              .from('erp_tenants')
              .update({
                db: tRow.db,
                atualizado_em: new Date().toISOString()
              })
              .eq('tenant_id', tId);
          }
        }
      } catch (errSync) {
        console.warn('Aviso ao sincronizar nova senha com Supabase:', errSync);
      }
    }

    // 3. Atualiza também as credenciais master do Dono / Administrador da fábrica
    try {
      const empAtual = obterEmpresaConfig() || {};
      if (!empAtual.auth) empAtual.auth = {};
      empAtual.auth.salt = salt;
      empAtual.auth.hash = hash;
      empAtual.auth.precisaTrocarSenha = false;
      salvarEmpresaConfig(empAtual);

      if (tId && supabaseClient) {
        await supabaseClient
          .from('erp_tenants')
          .upsert({
            tenant_id: tId,
            empresa: empAtual,
            ultima_atualizacao_ms: Date.now()
          });

        // Marca token como consumido para não permitir reuso
        await supabaseClient
          .from('erp_tokens')
          .update({ usado: true, usado_em: new Date().toISOString() })
          .eq('tenant_id', tId);
      }
    } catch (eDono) {
      console.warn('Aviso ao sincronizar credenciais master do dono:', eDono);
    }

    return { sucesso: true, auth: novaAuth };
  }

  async function cadastrarConfeccao(dados) {
    if (!supabaseClient) inicializarSupabase();
    if (!supabaseClient) return { sucesso: false, erro: 'Sistema de autenticação não inicializado. Verifique sua conexão.' };

    const cleanEmail = (dados.email || '').toLowerCase().trim();
    const nomeEmpresa = (dados.nomeEmpresa || '').trim();
    const nomeResponsavel = (dados.nomeResponsavel || '').trim();
    const whatsapp = (dados.whatsapp || '').trim();
    const senha = dados.senha || '';

    // 1. Validação rigorosa de senha forte
    const validacaoSenha = validarSenhaForte(senha);
    if (!validacaoSenha.valida) {
      return {
        sucesso: false,
        erro: 'A senha escolhida não atende a todos os critérios de segurança (mínimo 8 caracteres, maiúscula, minúscula, número e caractere especial).'
      };
    }

    // 2. Tenant ID único e determinístico baseado no e-mail
    const tenantId = await obterTenantIdPorEmail(cleanEmail);

    // 3. Verifica se este e-mail já possui cadastro existente
    try {
      const { data: tenantExistente, error: errBusca } = await supabaseClient
        .from('erp_tenants')
        .select('tenant_id, empresa')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (!errBusca && tenantExistente && tenantExistente.empresa && tenantExistente.empresa.auth) {
        return {
          sucesso: false,
          erro: 'Este e-mail já possui uma fábrica cadastrada. Para sua segurança, cada e-mail é vinculado a uma única confecção. Faça Login com sua senha pessoal.'
        };
      }
    } catch (e) {
      console.warn('Verificação de tenant pré-existente:', e);
    }

    // 3.1 Verifica se o e-mail possui compra ou adesão aprovada na Cakto / Supabase
    let aprovado = false;
    if (supabaseClient) {
      try {
        const { data: tok } = await supabaseClient
          .from('erp_tokens')
          .select('id')
          .eq('email', cleanEmail)
          .eq('status', 'aprovado')
          .maybeSingle();
        if (tok) aprovado = true;
      } catch(eTok) {}

      if (!aprovado) {
        try {
          const { data: sub } = await supabaseClient
            .from('erp_subscriptions')
            .select('id')
            .eq('email', cleanEmail)
            .in('status', ['ativa', 'aprovado'])
            .maybeSingle();
          if (sub) aprovado = true;
        } catch(eSub) {}
      }
    }

    if (!aprovado) {
      try {
        const tokensLocal = JSON.parse(localStorage.getItem('BRAVVI_TOKENS_X1') || '[]');
        if (tokensLocal.some(t => (t.email || '').toLowerCase().trim() === cleanEmail)) {
          aprovado = true;
        }
      } catch(eLoc) {}
    }

    if (!aprovado) {
      return {
        sucesso: false,
        erro: 'Este e-mail ainda não possui assinatura ou pagamento aprovado na Cakto. Realize a adesão na página de planos ou use a senha temporária Bravvi@2026 caso tenha acabado de comprar.'
      };
    }

    // 4. Cria salt e hash criptográfico SHA-256
    const salt = gerarSaltAleatorio();
    const passHash = await gerarHashSha256(salt + ':' + senha);

    const authData = {
      email: cleanEmail,
      salt: salt,
      hash: passHash,
      nomeResponsavel: nomeResponsavel || 'Administrador',
      whatsapp: whatsapp,
      criadoEm: new Date().toISOString()
    };
    tenantAuthAtivo = authData;

    const empNova = {
      razaoSocial: nomeEmpresa || 'Minha Confecção',
      nomeFantasia: nomeEmpresa || 'Minha Confecção',
      cnpj: '',
      inscricaoEstadual: '',
      telefone: whatsapp,
      email: cleanEmail,
      chavePix: '',
      tipoChavePix: 'CNPJ',
      endereco: '',
      bairro: '',
      cidade: '',
      uf: '',
      cep: '',
      logoUrl: null,
      rodapeProposta: 'Proposta válida por 15 dias corridos. Pagamento de 50% de sinal na aprovação.',
      rodapeFicha: 'Ordem de Produção Oficial. Tolerância industrial de 2mm.',
      auth: authData
    };

    // 5. Prepara banco inicial vazio exclusivo para este tenant
    const bancoLimpo = (typeof window !== 'undefined' && window.ERP_INITIAL_DATA)
      ? JSON.parse(JSON.stringify(window.ERP_INITIAL_DATA))
      : { pedidos: [] };
    bancoLimpo.pedidos = [];
    bancoLimpo.ordensServico = [];
    bancoLimpo.lancamentosFinanceiros = [];
    bancoLimpo.quarentena = [];
    bancoLimpo.clientes = [];
    bancoLimpo.despesasFixas = [];
    bancoLimpo.nestingFila = [];
    bancoLimpo.notasFiscais = [];
    bancoLimpo.compras = [];
    bancoLimpo.empresa = empNova;

    // 6. Grava imediatamente o novo tenant no Supabase PostgreSQL
    try {
      const { error: errUpsert } = await supabaseClient.from('erp_tenants').upsert({
        tenant_id: tenantId,
        db: bancoLimpo,
        empresa: empNova,
        ultima_atualizacao_ms: Date.now(),
        versao_erp: '8.5.0',
        updated_at: new Date().toISOString()
      }, { onConflict: 'tenant_id' });

      if (errUpsert) {
        console.error('Erro ao registrar tenant no Supabase:', errUpsert);
        return { sucesso: false, erro: 'Falha ao provisionar banco na nuvem: ' + errUpsert.message };
      }
    } catch (errDb) {
      console.error('Exceção ao provisionar tenant no Supabase:', errDb);
      return { sucesso: false, erro: 'Erro de comunicação com o servidor.' };
    }

    // 7. Tenta registro opcional em background no Supabase Auth (ignora qualquer erro de rate limit de e-mail)
    try {
      supabaseClient.auth.signUp({
        email: cleanEmail,
        password: senha,
        options: {
          data: {
            company_name: nomeEmpresa,
            full_name: nomeResponsavel,
            phone: whatsapp,
            tenant_id: tenantId
          }
        }
      }).catch(err => {
        // Ignora silenciosamente rate limit de email do Supabase Auth
        console.log('Notificação background Supabase Auth:', err?.message);
      });
    } catch (e) {
      // Ignora
    }

    // 8. Atualiza configuração local e ativa sessão
    salvarEmpresaConfig(empNova);

    const userObj = {
      id: tenantId,
      tenant_id: tenantId,
      email: cleanEmail,
      user_metadata: {
        company_name: nomeEmpresa,
        full_name: nomeResponsavel,
        phone: whatsapp,
        tenant_id: tenantId
      }
    };

    definirUsuarioLogado(userObj, authData);

    return {
      sucesso: true,
      user: userObj
    };
  }

  async function reenviarEmailConfirmacao(email) {
    if (!supabaseClient) inicializarSupabase();
    if (!supabaseClient) return false;
    try {
      const { error } = await supabaseClient.auth.resend({
        type: 'signup',
        email: (email || '').trim()
      });
      return !error;
    } catch (e) {
      return false;
    }
  }

  async function fazerLogout() {
    definirUsuarioLogado(null);
    tenantAuthAtivo = null;
    if (supabaseClient) {
      try {
        await supabaseClient.auth.signOut();
      } catch (e) {}
    }
    try {
      localStorage.removeItem('BRAVVI_ERP_USER_SESSION');
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
      localStorage.removeItem(STORAGE_KEY_EMPRESA);
      localStorage.removeItem('bravvi_erp_prod_v8');
      sessionStorage.clear();
    } catch (e) {}
    window.location.reload();
  }

  async function carregarBancoTenant(onSucesso) {
    if (isModoDemo() || !supabaseClient) return null;
    const tenantId = obterTenantId();
    if (!tenantId) return null;

    try {
      const { data, error } = await supabaseClient
        .from('erp_tenants')
        .select('db, empresa, ultima_atualizacao_ms')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (!error && data && data.db) {
        if (data.empresa) {
          if (data.empresa.auth) {
            tenantAuthAtivo = data.empresa.auth;
          }
          salvarEmpresaConfig(data.empresa);
        }
        if (typeof onSucesso === 'function') {
          onSucesso(data.db);
        }
        return data.db;
      } else if (!error && !data) {
        // Tenant recém-criado sem registros anteriores: inicializa banco isolado e exclusivo
        const user = obterUsuarioLogado();
        const nomeEmpresa = user?.user_metadata?.company_name || 'Minha Confecção';
        const empNova = {
          razaoSocial: nomeEmpresa,
          nomeFantasia: nomeEmpresa,
          cnpj: '',
          inscricaoEstadual: '',
          telefone: user?.user_metadata?.phone || '',
          email: user?.email || '',
          chavePix: '',
          tipoChavePix: 'CNPJ',
          endereco: '',
          bairro: '',
          cidade: '',
          uf: '',
          cep: '',
          logoUrl: null,
          rodapeProposta: 'Proposta válida por 15 dias corridos. Pagamento de 50% de sinal na aprovação.',
          rodapeFicha: 'Ordem de Produção Oficial. Tolerância industrial de 2mm.'
        };
        const bancoLimpo = (typeof window !== 'undefined' && window.ERP_INITIAL_DATA)
          ? JSON.parse(JSON.stringify(window.ERP_INITIAL_DATA))
          : { pedidos: [] };
        bancoLimpo.pedidos = [];
        bancoLimpo.ordensServico = [];
        bancoLimpo.lancamentosFinanceiros = [];
        bancoLimpo.quarentena = [];
        bancoLimpo.clientes = [];
        bancoLimpo.despesasFixas = [];
        bancoLimpo.nestingFila = [];
        bancoLimpo.notasFiscais = [];
        bancoLimpo.compras = [];
        bancoLimpo.empresa = empNova;

        salvarEmpresaConfig(empNova);

        await supabaseClient.from('erp_tenants').upsert({
          tenant_id: tenantId,
          db: bancoLimpo,
          empresa: empNova,
          ultima_atualizacao_ms: Date.now(),
          versao_erp: '8.5.0'
        }, { onConflict: 'tenant_id' });

        if (typeof onSucesso === 'function') {
          onSucesso(bancoLimpo);
        }
        return bancoLimpo;
      }
    } catch (e) {
      console.warn('Erro ao carregar banco remoto do tenant:', e);
    }
    return null;
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

  // --- TENANT & PROVEDORES (ISOLAMENTO MULTI-TENANT RIGOROSO POR USUÁRIO) ---
  function obterTenantId() {
    if (isModoDemo()) {
      return 'empresa_demo_showroom';
    }
    const user = obterUsuarioLogado();
    if (user) {
      if (user.tenant_id) return user.tenant_id;
      if (user.id) {
        if (user.id.startsWith('tenant_')) return user.id;
        return 'tenant_' + user.id.replace(/-/g, '_');
      }
    }
    return null; // NUNCA retorna fallback de outra empresa! Se não estiver logado, é null.
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
    const tenantId = obterTenantId();
    if (!tenantId) {
      // Bloqueio rigoroso: nada é sincronizado sem tenant autenticado
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
        const empParaSalvar = Object.assign({}, obterEmpresaConfig());
        if (tenantAuthAtivo) {
          empParaSalvar.auth = tenantAuthAtivo;
        }
        supabaseClient
          .from('erp_tenants')
          .upsert({
            tenant_id: tenantId,
            db: dbAtual,
            empresa: empParaSalvar,
            ultima_atualizacao_ms: agora,
            versao_erp: "8.5.0",
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
    const tenantId = obterTenantId();
    if (!tenantId) {
      // Bloqueio rigoroso: não inicia escuta nem carrega dados sem usuário logado
      return;
    }
    const provedor = obterProvedorAtivo();

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
    // Autenticação & Multi-Tenancy Oficial
    validarSenhaForte,
    gerarHashSha256,
    obterTenantIdPorEmail,
    obterTenantId,
    obterUsuarioLogado,
    definirUsuarioLogado,
    atualizarVisuaisUsuarioLogado,
    fazerLogin,
    atualizarSenhaColaborador,
    cadastrarConfeccao,
    reenviarEmailConfirmacao,
    fazerLogout,
    carregarBancoTenant,
    // Estado Geral da Nuvem
    obterProvedorAtivo,
    isNuvemAtiva,
    sincronizarComNuvem,
    iniciarEscutaRealtime,
    abrirModalConfigNuvem,
    atualizarStatusNuvem
  };
})();

