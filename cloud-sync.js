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

  // Monitoramento de Status de Rede
  function atualizarStatusNuvem() {
    const badge = document.getElementById('cloudStatusBadge');
    const txt = document.getElementById('cloudStatusText');
    if (!badge || !txt) return;

    if (navigator.onLine) {
      badge.style.background = '#ecfdf5';
      badge.style.color = '#047857';
      badge.style.borderColor = '#a7f3d0';
      badge.querySelector('span:first-child').style.background = '#10b981';
      txt.textContent = 'Online • Nuvem Ativa';
    } else {
      badge.style.background = '#fffbeb';
      badge.style.color = '#b45309';
      badge.style.borderColor = '#fde68a';
      badge.querySelector('span:first-child').style.background = '#f59e0b';
      txt.textContent = 'Modo Local Offline Seguro';
    }
  }

  window.addEventListener('online', atualizarStatusNuvem);
  window.addEventListener('offline', atualizarStatusNuvem);

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
    perfis: PERFIS_PERMISSOES
  };
})();
