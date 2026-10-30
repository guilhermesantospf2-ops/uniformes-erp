// ============================================================================
// BRAVVI ERP TÊXTIL — MOTOR DE SEGURANÇA BANCÁRIA & GATEWAY MULTI-TENANT
// Rota: POST /api/erp-security
// Protege: Autenticação, Isolamento de Tenants, Filtro de Cargos (RBAC),
// Ocultação de Hashes de Senha e Gerador de Acessos X1 com Senha Master.
// ============================================================================

const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nrhygqygcfjyniogjegq.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yaHlncXlnY2ZqeW5pb2dqZWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NzU1MTMsImV4cCI6MjEwNjA1MTUxM30.JXAt9Ha1ni2T3G-dMvITGdH9PIPTc7_utI3H9LPrIV4';

// Chave secreta de assinatura HMAC dos tokens de sessão (usa env ou chave derivada exclusiva do servidor)
const JWT_SECRET = process.env.BRAVVI_JWT_SECRET || process.env.WEBHOOK_SECRET || crypto.createHash('sha256').update('bravvi_erp_master_hmac_secret_2026_' + SUPABASE_KEY).digest('hex');

// Senha Master do Dono do SaaS para o painel /gerar-acesso (pode ser customizada via ADMIN_MASTER_PASSWORD na Vercel)
const ADMIN_MASTER_PASSWORD = process.env.ADMIN_MASTER_PASSWORD || 'BravviMaster@2026';

// Proteção contra Força Bruta em memória por instância
const loginAttempts = new Map();

function checkRateLimit(key) {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry) {
    loginAttempts.set(key, { count: 1, firstAt: now });
    return true;
  }
  if (now - entry.firstAt > 15 * 60 * 1000) {
    loginAttempts.set(key, { count: 1, firstAt: now });
    return true;
  }
  entry.count += 1;
  if (entry.count > 12) {
    return false;
  }
  return true;
}

function sha256(text) {
  return crypto.createHash('sha256').update(String(text)).digest('hex');
}

function getTenantIdByEmail(email) {
  const clean = (email || '').toLowerCase().trim();
  const hash = sha256('tenant_bravvi_' + clean);
  return 'tenant_' + hash.substring(0, 24);
}

// Gera Token Assinado (HMAC-SHA256) impossível de falsificar no Front-End (F12)
function signSessionToken(payload) {
  const data = {
    ...payload,
    iat: Date.now(),
    exp: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 dias
  };
  const base64Payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(base64Payload).digest('base64url');
  return `${base64Payload}.${signature}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  try {
    const [base64Payload, signature] = token.split('.');
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(base64Payload).digest('base64url');
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf-8'));
    if (!payload || !payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

// Remove hashes e salts antes de enviar dados para o navegador
function sanitizeEmpresaForClient(empresa) {
  if (!empresa || typeof empresa !== 'object') return {};
  const clone = JSON.parse(JSON.stringify(empresa));
  if (clone.auth) {
    delete clone.auth.salt;
    delete clone.auth.hash;
  }
  return clone;
}

// Filtra o banco de acordo com o cargo (RBAC no Servidor) e remove hashes da equipe
function sanitizeDbForClient(db, perfil) {
  if (!db || typeof db !== 'object') return { pedidos: [] };
  const clone = JSON.parse(JSON.stringify(db));

  if (clone.empresa) {
    clone.empresa = sanitizeEmpresaForClient(clone.empresa);
  }

  if (Array.isArray(clone.equipe)) {
    clone.equipe = clone.equipe.map(colab => {
      const c = { ...colab };
      if (c.auth) {
        c.temSenhaCadastrada = Boolean(c.auth.hash);
        delete c.auth;
      }
      delete c.senha;
      delete c.senhaTemporaria;
      return c;
    });
  }

  // Se NÃO for dono (ex: vendedor ou oficina), oculta dados financeiros estratégicos no servidor
  if (perfil && perfil !== 'dono') {
    clone.lancamentosFinanceiros = [];
    clone.despesasFixas = [];
    clone.notasFiscais = [];
    clone.compras = [];
  }

  return clone;
}

async function sbFetch(path, options = {}) {
  const fetchFn = global.fetch || require('node-fetch');
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    ...(options.headers || {})
  };
  const res = await fetchFn(url, { ...options, headers });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (e) {
    json = null;
  }
  return { ok: res.ok, status: res.status, data: json, raw: text };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Bravvi-Token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ sucesso: false, erro: 'Método não permitido.' });
  }

  try {
    let body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    const action = body.action || '';
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';

    // ========================================================================
    // 1. LOGIN SEGURO NO SERVIDOR (NUNCA EXPÕE HASHES AO NAVEGADOR)
    // ========================================================================
    if (action === 'login') {
      let cleanEmail = (body.email || '').toLowerCase().trim();
      cleanEmail = cleanEmail
        .replace(/@(gmail|hotmail|outlook|yahoo)\.co[rn]$/i, '@$1.com')
        .replace(/@(gmail|hotmail|outlook|yahoo)\.com\.b[rn]$/i, '@$1.com.br');
      const senhaStr = body.senha || '';

      if (!cleanEmail || !senhaStr) {
        return res.status(400).json({ sucesso: false, erro: 'Informe seu e-mail e senha de acesso.' });
      }

      if (!checkRateLimit(`${clientIp}:${cleanEmail}`)) {
        return res.status(429).json({
          sucesso: false,
          erro: 'Muitas tentativas de login seguidas. Aguarde 15 minutos por segurança.'
        });
      }

      const tenantId = getTenantIdByEmail(cleanEmail);

      // 1.1 Verifica Dono / Diretor em erp_tenants
      const { data: rows } = await sbFetch(`erp_tenants?tenant_id=eq.${encodeURIComponent(tenantId)}&select=tenant_id,empresa,db`);
      const tenantRow = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

      if (tenantRow && tenantRow.empresa && tenantRow.empresa.auth) {
        const emp = tenantRow.empresa;
        const auth = emp.auth;

        if (auth.salt && auth.hash) {
          const testHash = sha256(auth.salt + ':' + senhaStr);
          if (testHash === auth.hash) {
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
            const sessionToken = signSessionToken({
              tenant_id: tenantId,
              email: cleanEmail,
              perfil: 'dono',
              role: 'Dono / Diretor'
            });
            return res.status(200).json({
              sucesso: true,
              user: userObj,
              empresa: sanitizeEmpresaForClient(emp),
              sessionToken,
              precisaTrocarSenha: false
            });
          } else if (senhaStr === 'Bravvi@2026' && auth.precisaTrocarSenha !== true) {
            return res.status(401).json({
              sucesso: false,
              erro: 'Sua conta já possui uma senha pessoal definitiva cadastrada. Acesse com a sua senha pessoal.'
            });
          } else {
            return res.status(401).json({ sucesso: false, erro: 'E-mail ou senha incorretos.' });
          }
        } else if (auth.precisaTrocarSenha === true && senhaStr === 'Bravvi@2026') {
          const userObj = {
            id: tenantId,
            tenant_id: tenantId,
            email: cleanEmail,
            primeiroAcessoDono: true,
            precisaTrocarSenha: true,
            user_metadata: {
              company_name: emp.nomeFantasia || emp.razaoSocial || 'Minha Confecção',
              full_name: auth.nomeResponsavel || 'Administrador',
              phone: auth.whatsapp || emp.telefone || '',
              perfil: 'dono',
              role: 'Dono / Diretor',
              tenant_id: tenantId
            }
          };
          const sessionToken = signSessionToken({
            tenant_id: tenantId,
            email: cleanEmail,
            perfil: 'dono',
            precisaTrocarSenha: true
          });
          return res.status(200).json({
            sucesso: true,
            user: userObj,
            empresa: sanitizeEmpresaForClient(emp),
            sessionToken,
            precisaTrocarSenha: true,
            primeiroAcessoDono: true
          });
        }
      }

      // 1.2 Primeiro Acesso com Senha Temporária Oficial (Pós-compra Cakto / X1)
      if (senhaStr === 'Bravvi@2026') {
        let aprovado = null;
        const { data: tokRows } = await sbFetch(`erp_tokens?email=eq.${encodeURIComponent(cleanEmail)}&status=eq.aprovado&select=*`);
        if (Array.isArray(tokRows) && tokRows.length > 0) aprovado = tokRows[0];

        if (!aprovado) {
          const { data: subRows } = await sbFetch(`erp_subscriptions?email=eq.${encodeURIComponent(cleanEmail)}&select=*`);
          if (Array.isArray(subRows)) {
            aprovado = subRows.find(s => s.status === 'ativa' || s.status === 'aprovado') || null;
          }
        }

        if (aprovado) {
          const nomeDono = aprovado.nome_cliente || 'Administrador';
          const telDono = aprovado.telefone || aprovado.whatsapp || '';
          const planoDono = aprovado.plano || 'mensal';

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

          const userObj = {
            id: tenantId,
            tenant_id: tenantId,
            email: cleanEmail,
            primeiroAcessoDono: true,
            precisaTrocarSenha: true,
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

          const sessionToken = signSessionToken({
            tenant_id: tenantId,
            email: cleanEmail,
            perfil: 'dono',
            precisaTrocarSenha: true
          });

          return res.status(200).json({
            sucesso: true,
            user: userObj,
            empresa: sanitizeEmpresaForClient(empConfig),
            sessionToken,
            precisaTrocarSenha: true,
            primeiroAcessoDono: true
          });
        }
      }

      // 1.3 Autenticação de Colaborador (Vendedor / Oficina) sem expor outros tenants ao navegador!
      const { data: allTenants } = await sbFetch('erp_tenants?select=tenant_id,empresa,db');
      if (Array.isArray(allTenants)) {
        for (const tRow of allTenants) {
          const equipe = (tRow.db && Array.isArray(tRow.db.equipe)) ? tRow.db.equipe : [];
          const colab = equipe.find(c => (c.email || '').toLowerCase().trim() === cleanEmail);
          if (colab) {
            if (colab.status && colab.status.toLowerCase() === 'inativo') {
              return res.status(403).json({ sucesso: false, erro: 'Este usuário está inativo. Contate a diretoria da empresa.' });
            }

            let senhaCorreta = false;
            let precisaTrocar = colab.precisaTrocarSenha === true;

            if (colab.auth && colab.auth.salt && colab.auth.hash) {
              const testHash = sha256(colab.auth.salt + ':' + senhaStr);
              if (testHash === colab.auth.hash) senhaCorreta = true;
            } else if (colab.senha && colab.senha === senhaStr) {
              senhaCorreta = true;
            } else if (!colab.auth && !colab.senha && (senhaStr === 'Bravvi@2026' || senhaStr === 'Temp@2026')) {
              senhaCorreta = true;
              precisaTrocar = true;
            }

            if (!senhaCorreta) {
              return res.status(401).json({ sucesso: false, erro: 'E-mail ou senha incorretos.' });
            }

            const perfilEscolhido = colab.perfil || (colab.nivelAcesso === 'Admin' ? 'dono' : (colab.nivelAcesso === 'Comercial' ? 'vendedor' : 'oficina'));
            const userObj = {
              id: colab.id || ('colab_' + Date.now()),
              tenant_id: tRow.tenant_id,
              email: cleanEmail,
              colaboradorId: colab.id,
              precisaTrocarSenha: precisaTrocar,
              user_metadata: {
                company_name: tRow.empresa?.nomeFantasia || tRow.empresa?.razaoSocial || 'Minha Confecção',
                full_name: colab.nome || 'Colaborador',
                phone: colab.telefone || '',
                perfil: perfilEscolhido,
                role: colab.cargo || colab.especialidade || (perfilEscolhido === 'dono' ? 'Dono / Diretor' : (perfilEscolhido === 'vendedor' ? 'Vendedor Comercial' : 'Oficina & Produção')),
                tenant_id: tRow.tenant_id
              }
            };

            const sessionToken = signSessionToken({
              tenant_id: tRow.tenant_id,
              email: cleanEmail,
              perfil: perfilEscolhido,
              colaboradorId: colab.id
            });

            return res.status(200).json({
              sucesso: true,
              user: userObj,
              empresa: sanitizeEmpresaForClient(tRow.empresa),
              sessionToken,
              colaboradorId: colab.id,
              tenant_id: tRow.tenant_id,
              precisaTrocarSenha: precisaTrocar
            });
          }
        }
      }

      return res.status(401).json({
        sucesso: false,
        erro: 'E-mail ou senha incorretos. Se acabou de adquirir o sistema, utilize o mesmo e-mail informado na compra.'
      });
    }

    // ========================================================================
    // 2. TROCA DE SENHA SEGURA NO SERVIDOR (DONO OU COLABORADOR)
    // ========================================================================
    if (action === 'update_password') {
      const tokenPayload = verifySessionToken(body.sessionToken || req.headers['x-bravvi-token']);
      if (!tokenPayload || !tokenPayload.tenant_id) {
        return res.status(401).json({ sucesso: false, erro: 'Sessão inválida ou expirada. Faça login novamente.' });
      }

      const novaSenha = (body.novaSenha || '').trim();
      if (novaSenha.length < 8) {
        return res.status(400).json({ sucesso: false, erro: 'A nova senha deve ter pelo menos 8 caracteres.' });
      }

      const salt = crypto.randomBytes(16).toString('hex');
      const hash = sha256(salt + ':' + novaSenha);
      const novaAuth = { salt, hash };
      const tId = tokenPayload.tenant_id;
      const colaboradorId = body.colaboradorId || tokenPayload.colaboradorId;

      const { data: rows } = await sbFetch(`erp_tenants?tenant_id=eq.${encodeURIComponent(tId)}&select=tenant_id,empresa,db`);
      const tRow = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

      if (tokenPayload.perfil === 'dono' && (!colaboradorId || colaboradorId === tId)) {
        const empAtual = (tRow && tRow.empresa) ? tRow.empresa : (body.empresa || {});
        if (body.nomeEmpresa) {
          empAtual.razaoSocial = body.nomeEmpresa;
          empAtual.nomeFantasia = body.nomeEmpresa;
        }
        empAtual.auth = {
          ...(empAtual.auth || {}),
          email: tokenPayload.email,
          salt,
          hash,
          precisaTrocarSenha: false,
          senhaAlteradaEm: new Date().toISOString()
        };

        const dbAtual = (tRow && tRow.db) ? tRow.db : (body.db || { pedidos: [] });
        dbAtual.empresa = sanitizeEmpresaForClient(empAtual);

        await sbFetch('erp_tenants', {
          method: 'POST',
          headers: { 'Prefer': 'resolution=merge-duplicates' },
          body: JSON.stringify({
            tenant_id: tId,
            empresa: empAtual,
            db: dbAtual,
            ultima_atualizacao_ms: Date.now(),
            versao_erp: '8.5.0_BLINDADO',
            updated_at: new Date().toISOString()
          })
        });

        await sbFetch(`erp_tokens?tenant_id=eq.${encodeURIComponent(tId)}`, {
          method: 'PATCH',
          body: JSON.stringify({ usado: true })
        });

        const newToken = signSessionToken({
          tenant_id: tId,
          email: tokenPayload.email,
          perfil: 'dono',
          precisaTrocarSenha: false
        });

        return res.status(200).json({
          sucesso: true,
          sessionToken: newToken,
          empresa: sanitizeEmpresaForClient(empAtual)
        });
      } else if (tRow && tRow.db && Array.isArray(tRow.db.equipe)) {
        const colab = tRow.db.equipe.find(u => u.id === colaboradorId || (u.email || '').toLowerCase() === tokenPayload.email);
        if (colab) {
          colab.auth = novaAuth;
          colab.precisaTrocarSenha = false;
          colab.senhaAlteradaEm = new Date().toISOString();
          delete colab.senha;
          delete colab.senhaTemporaria;

          await sbFetch(`erp_tenants?tenant_id=eq.${encodeURIComponent(tId)}`, {
            method: 'PATCH',
            body: JSON.stringify({
              db: tRow.db,
              ultima_atualizacao_ms: Date.now(),
              updated_at: new Date().toISOString()
            })
          });

          const newToken = signSessionToken({
            tenant_id: tId,
            email: tokenPayload.email,
            perfil: tokenPayload.perfil,
            colaboradorId: colab.id,
            precisaTrocarSenha: false
          });

          return res.status(200).json({ sucesso: true, sessionToken: newToken });
        }
      }

      return res.status(404).json({ sucesso: false, erro: 'Registro da conta não localizado para atualização.' });
    }

    // ========================================================================
    // 2.5 CADASTRO DE NOVA CONFECÇÃO NO SERVIDOR (REGISTER)
    // ========================================================================
    if (action === 'register') {
      const cleanEmail = (body.email || '').toLowerCase().trim();
      const nomeEmpresa = (body.nomeEmpresa || 'Minha Confecção').trim();
      const nomeResponsavel = (body.nomeResponsavel || 'Administrador').trim();
      const whatsapp = (body.whatsapp || '').trim();
      const senha = body.senha || '';

      if (!cleanEmail || !senha || senha.length < 8) {
        return res.status(400).json({ sucesso: false, erro: 'Informe um e-mail válido e uma senha forte (mínimo 8 caracteres).' });
      }

      const tenantId = getTenantIdByEmail(cleanEmail);
      const { data: existing } = await sbFetch(`erp_tenants?tenant_id=eq.${encodeURIComponent(tenantId)}&select=tenant_id,empresa`);
      if (Array.isArray(existing) && existing.length > 0 && existing[0].empresa?.auth?.hash) {
        return res.status(409).json({
          sucesso: false,
          erro: 'Este e-mail já possui uma fábrica cadastrada. Faça Login com sua senha pessoal.'
        });
      }

      // Verifica se possui compra aprovada na Cakto / X1
      let aprovado = false;
      const { data: tokRows } = await sbFetch(`erp_tokens?email=eq.${encodeURIComponent(cleanEmail)}&status=eq.aprovado&select=id`);
      if (Array.isArray(tokRows) && tokRows.length > 0) aprovado = true;

      if (!aprovado) {
        const { data: subRows } = await sbFetch(`erp_subscriptions?email=eq.${encodeURIComponent(cleanEmail)}&select=id,status`);
        if (Array.isArray(subRows) && subRows.some(s => s.status === 'ativa' || s.status === 'aprovado')) {
          aprovado = true;
        }
      }

      if (!aprovado) {
        return res.status(403).json({
          sucesso: false,
          erro: 'Este e-mail ainda não possui assinatura aprovada. Realize a adesão na página de planos ou utilize o mesmo e-mail da compra.'
        });
      }

      const salt = crypto.randomBytes(16).toString('hex');
      const hash = sha256(salt + ':' + senha);
      const authData = {
        email: cleanEmail,
        salt,
        hash,
        nomeResponsavel,
        whatsapp,
        precisaTrocarSenha: false,
        criadoEm: new Date().toISOString()
      };

      const empNova = {
        razaoSocial: nomeEmpresa,
        nomeFantasia: nomeEmpresa,
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

      const bancoLimpo = body.bancoInicial && typeof body.bancoInicial === 'object'
        ? body.bancoInicial
        : { pedidos: [], ordensServico: [], lancamentosFinanceiros: [], quarentena: [], clientes: [], despesasFixas: [], nestingFila: [], notasFiscais: [], compras: [] };
      bancoLimpo.empresa = sanitizeEmpresaForClient(empNova);

      await sbFetch('erp_tenants', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({
          tenant_id: tenantId,
          empresa: empNova,
          db: bancoLimpo,
          ultima_atualizacao_ms: Date.now(),
          versao_erp: '8.5.0_BLINDADO',
          updated_at: new Date().toISOString()
        })
      });

      const userObj = {
        id: tenantId,
        tenant_id: tenantId,
        email: cleanEmail,
        user_metadata: {
          company_name: nomeEmpresa,
          full_name: nomeResponsavel,
          phone: whatsapp,
          perfil: 'dono',
          role: 'Dono / Diretor',
          tenant_id: tenantId
        }
      };

      const sessionToken = signSessionToken({
        tenant_id: tenantId,
        email: cleanEmail,
        perfil: 'dono'
      });

      return res.status(200).json({
        sucesso: true,
        user: userObj,
        empresa: sanitizeEmpresaForClient(empNova),
        sessionToken
      });
    }

    // ========================================================================
    // 3. LEITURA ISOLADA DO BANCO DO TENANT (LOAD) COM RBAC NO SERVIDOR
    // ========================================================================
    if (action === 'load_tenant') {
      const tokenPayload = verifySessionToken(body.sessionToken || req.headers['x-bravvi-token']);
      if (!tokenPayload || !tokenPayload.tenant_id) {
        return res.status(401).json({ sucesso: false, erro: 'Sessão não autenticada.' });
      }

      const tId = tokenPayload.tenant_id;
      const { data: rows } = await sbFetch(`erp_tenants?tenant_id=eq.${encodeURIComponent(tId)}&select=tenant_id,empresa,db,ultima_atualizacao_ms`);
      const tRow = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

      if (!tRow) {
        return res.status(200).json({ sucesso: true, found: false });
      }

      return res.status(200).json({
        sucesso: true,
        found: true,
        perfilAssinado: tokenPayload.perfil,
        empresa: sanitizeEmpresaForClient(tRow.empresa),
        db: sanitizeDbForClient(tRow.db, tokenPayload.perfil),
        ultima_atualizacao_ms: tRow.ultima_atualizacao_ms || Date.now()
      });
    }

    // ========================================================================
    // 4. GRAVAÇÃO SEGURA DO TENANT (SYNC) PRESERVANDO HASHES E DADOS DO DONO
    // ========================================================================
    if (action === 'sync_tenant') {
      const tokenPayload = verifySessionToken(body.sessionToken || req.headers['x-bravvi-token']);
      if (!tokenPayload || !tokenPayload.tenant_id) {
        return res.status(401).json({ sucesso: false, erro: 'Sessão não autenticada.' });
      }

      const tId = tokenPayload.tenant_id;
      const dbCliente = body.db;
      const empCliente = body.empresa || {};

      if (!dbCliente || !Array.isArray(dbCliente.pedidos)) {
        return res.status(400).json({ sucesso: false, erro: 'Estrutura de dados inválida.' });
      }

      // Busca estado atual no Supabase para preservar hashes de senha e coleções restritas
      const { data: rows } = await sbFetch(`erp_tenants?tenant_id=eq.${encodeURIComponent(tId)}&select=tenant_id,empresa,db`);
      const tRow = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

      const empExistente = (tRow && tRow.empresa) ? tRow.empresa : {};
      const dbExistente = (tRow && tRow.db) ? tRow.db : {};

      // Preserva o objeto criptográfico empExistente.auth (nunca aceita sobrescrita crua vinda do client)
      const empFinal = {
        ...empExistente,
        ...(tokenPayload.perfil === 'dono' ? empCliente : {}),
        auth: empExistente.auth || empCliente.auth || null
      };

      const dbFinal = { ...dbExistente, ...dbCliente };

      // Preserva os hashes de senha de cada funcionário na equipe
      if (Array.isArray(dbCliente.equipe)) {
        const equipeAntiga = Array.isArray(dbExistente.equipe) ? dbExistente.equipe : [];
        dbFinal.equipe = await Promise.all(dbCliente.equipe.map(async (colabNovo) => {
          const antigo = equipeAntiga.find(a => a.id === colabNovo.id || (a.email && colabNovo.email && a.email.toLowerCase() === colabNovo.email.toLowerCase()));
          const item = { ...colabNovo };
          // Se o diretor definiu uma nova senha em texto ao criar/editar funcionário, gera hash no servidor!
          const novaSenhaTexto = item.senha || item.senhaTemporaria;
          if (novaSenhaTexto && tokenPayload.perfil === 'dono') {
            const salt = crypto.randomBytes(16).toString('hex');
            const hash = sha256(salt + ':' + String(novaSenhaTexto).trim());
            item.auth = { salt, hash };
            delete item.senha;
            delete item.senhaTemporaria;
          } else if (antigo && antigo.auth) {
            item.auth = antigo.auth;
          }
          return item;
        }));
      }

      // Se quem está salvando NÃO é o dono (ex: vendedor ou oficina), impede alteração de Financeiro, DRE, Despesas, Compras e Equipe
      if (tokenPayload.perfil !== 'dono') {
        dbFinal.lancamentosFinanceiros = dbExistente.lancamentosFinanceiros || [];
        dbFinal.despesasFixas = dbExistente.despesasFixas || [];
        dbFinal.notasFiscais = dbExistente.notasFiscais || [];
        dbFinal.compras = dbExistente.compras || [];
        dbFinal.equipe = dbExistente.equipe || [];
      }

      // BLINDAGEM DE BANCO DE DADOS: Remove binários pesados de artes (somente Mockups 3x4/A4 ficam salvos)
      if (Array.isArray(dbFinal.pedidos)) {
        dbFinal.pedidos.forEach(p => {
          if (Array.isArray(p.artesAnexadas)) {
            p.artesAnexadas.forEach(a => {
              delete a.arquivoDataUrl;
              delete a.arquivoDataUrlOriginal;
            });
          }
        });
      }
      if (Array.isArray(dbFinal.ordensServico)) {
        dbFinal.ordensServico.forEach(os => {
          if (Array.isArray(os.artesAplicacao)) {
            os.artesAplicacao.forEach(a => {
              delete a.arquivoDataUrl;
              delete a.arquivoDataUrlOriginal;
            });
          }
          if (os.mockupUrl && os.mockupUrl.startsWith('data:') && Array.isArray(dbFinal.pedidos)) {
            const p = dbFinal.pedidos.find(ped => ped.numero == os.pedidoNumero || ped.id === os.pedidoId);
            if (p && p.mockupUrl === os.mockupUrl) {
              os.mockupUrl = '__REF_MOCKUP_PEDIDO__';
            }
          }
        });
      }

      const agora = Date.now();
      await sbFetch('erp_tenants', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({
          tenant_id: tId,
          empresa: empFinal,
          db: dbFinal,
          ultima_atualizacao_ms: agora,
          versao_erp: '8.5.0_BLINDADO',
          updated_at: new Date().toISOString()
        })
      });

      return res.status(200).json({ sucesso: true, ultima_atualizacao_ms: agora });
    }

    // ========================================================================
    // 5. PAINEL DO DONO (/gerar-acesso) PROTEGIDO POR SENHA MASTER NO SERVIDOR
    // ========================================================================
    if (action === 'admin_create_token') {
      const masterPass = (body.masterPassword || '').trim();
      if (!masterPass || masterPass !== ADMIN_MASTER_PASSWORD) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Senha Master do Administrador incorreta. Acesso negado.'
        });
      }

      const nome = (body.nome || '').trim();
      const email = (body.email || '').toLowerCase().trim();
      const dias = parseInt(body.dias, 10) || 30;

      if (!nome || !email) {
        return res.status(400).json({ sucesso: false, erro: 'Informe o nome da confecção e o e-mail do cliente.' });
      }

      const tenantId = getTenantIdByEmail(email);
      const token = 'bravvi_x1_' + crypto.randomBytes(8).toString('hex');
      const dataVencimento = new Date(Date.now() + dias * 24 * 60 * 60 * 1000);

      const empNova = {
        razaoSocial: nome,
        nomeFantasia: nome,
        email: email,
        plano: dias >= 365 ? 'anual' : 'mensal',
        statusAssinatura: 'ativa',
        dataVencimento: dataVencimento.toISOString(),
        gateway: 'manual_x1',
        auth: {
          email: email,
          nomeResponsavel: nome,
          precisaTrocarSenha: true
        }
      };

      // 1. Provisiona o tenant no Supabase se ainda não existir
      const { data: existing } = await sbFetch(`erp_tenants?tenant_id=eq.${encodeURIComponent(tenantId)}&select=tenant_id,empresa`);
      if (!Array.isArray(existing) || existing.length === 0) {
        await sbFetch('erp_tenants', {
          method: 'POST',
          headers: { 'Prefer': 'resolution=merge-duplicates' },
          body: JSON.stringify({
            tenant_id: tenantId,
            empresa: empNova,
            db: { pedidos: [] },
            ultima_atualizacao_ms: Date.now(),
            versao_erp: '8.5.0_BLINDADO'
          })
        });
      }

      // 2. Grava em erp_tokens e erp_subscriptions
      await sbFetch('erp_tokens', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({
          token,
          tenant_id: tenantId,
          order_nsu: 'x1_' + Date.now(),
          gateway: 'manual_x1',
          email,
          nome_cliente: nome,
          valor: dias >= 365 ? 1997 : 227,
          plano: dias >= 365 ? 'anual' : 'mensal',
          dias_acesso: dias,
          data_vencimento: dataVencimento.toISOString(),
          status: 'aprovado',
          usado: false,
          criado_em: new Date().toISOString()
        })
      });

      await sbFetch('erp_subscriptions', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({
          tenant_id: tenantId,
          email,
          plano: dias >= 365 ? 'anual' : 'mensal',
          status: 'ativa',
          valor: dias >= 365 ? 1997 : 227,
          data_inicio: new Date().toISOString(),
          data_vencimento: dataVencimento.toISOString(),
          gateway: 'manual_x1',
          order_nsu: 'x1_' + Date.now()
        })
      });

      return res.status(200).json({
        sucesso: true,
        token,
        tenant_id: tenantId,
        email,
        senhaTemporaria: 'Bravvi@2026'
      });
    }

    return res.status(400).json({ sucesso: false, erro: 'Ação desconhecida.' });
  } catch (err) {
    console.error('[ERP Security API] Erro interno:', err);
    return res.status(500).json({ sucesso: false, erro: 'Erro interno no servidor de segurança.' });
  }
};
