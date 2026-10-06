// ============================================================================
// BRAVVI ERP TÊXTIL — WEBHOOK SERVERLESS CAKTO (VERCEL FUNCTION)
// Rota: POST /api/webhook-cakto
// ============================================================================

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'online',
      gateway: 'Cakto (Checkout de Alta Conversão)',
      service: 'Bravvi ERP Têxtil Webhook Handler',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let payload = req.body || {};
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch (parseErr) {
        payload = {};
      }
    }
    console.log('[Cakto Webhook] Evento recebido:', JSON.stringify(payload, null, 2));

    const status = (payload.status || (payload.data && payload.data.status) || payload.event || '').toUpperCase();
    const isPaid = status === 'PAID' || status === 'APPROVED' || status === 'PURCHASE_APPROVED' || status === 'COMPLETED';

    const orderId = payload.id || (payload.data && payload.data.id) || payload.order_id || 'cakto_' + Date.now();
    const valor = payload.amount || (payload.data && payload.data.amount) || payload.price || 397.00;
    const customer = payload.customer || (payload.data && payload.data.customer) || {};
    const email = customer.email || payload.email || '';
    const nome = customer.name || payload.name || '';
    const phone = customer.phone || customer.cellphone || '';

    // Gera um token criptograficamente seguro e aleatório para a ativação do cliente
    const crypto = require('crypto');
    const randomHex = crypto.randomBytes(8).toString('hex');
    const token = 'bravvi_' + randomHex;

    // Calcula 30 dias de acesso padrão (ou 365 se for anual acima de R$ 500)
    const diasAcesso = valor >= 500 ? 365 : 30;
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + diasAcesso);

    const registro = {
      token: token,
      order_nsu: String(orderId),
      gateway: 'cakto',
      email: email,
      nome_cliente: nome,
      telefone: phone,
      valor: valor,
      plano: diasAcesso === 365 ? 'anual' : 'mensal',
      dias_acesso: diasAcesso,
      data_vencimento: dataVencimento.toISOString(),
      status: isPaid ? 'aprovado' : 'processando',
      usado: false,
      criado_em: new Date().toISOString()
    };

    console.log('[Cakto Webhook] Registro preparado:', registro);

    // Persistir no Supabase se as variáveis de ambiente existirem
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const fetch = global.fetch || require('node-fetch');
        const cleanEmail = (email || '').toLowerCase().trim();
        const tenantHash = crypto.createHash('sha256').update('tenant_bravvi_' + cleanEmail).digest('hex').substring(0, 24);
        const tenantId = 'tenant_' + tenantHash;

        // 1. Grava o token
        await fetch(`${process.env.SUPABASE_URL}/rest/v1/erp_tokens`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({ ...registro, tenant_id: tenantId })
        });

        // 2. Grava ou atualiza a assinatura ativa
        await fetch(`${process.env.SUPABASE_URL}/rest/v1/erp_subscriptions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            tenant_id: tenantId,
            email: cleanEmail,
            whatsapp: phone,
            plano: diasAcesso === 365 ? 'anual' : 'mensal',
            status: isPaid ? 'ativa' : 'pendente',
            valor: valor,
            data_inicio: new Date().toISOString(),
            data_vencimento: dataVencimento.toISOString(),
            gateway: 'cakto',
            order_nsu: String(orderId)
          })
        });

        console.log('[Cakto Webhook] Salvo com sucesso no Supabase (tokens + subscriptions)!');
      } catch (dbErr) {
        console.warn('[Cakto Webhook] Erro ao gravar no Supabase:', dbErr.message);
      }
    }

    // Retorna SEMPRE 200 OK para a Cakto com dados de login oficial
    return res.status(200).json({
      received: true,
      order_id: orderId,
      status: isPaid ? 'approved' : 'received',
      login_url: 'https://uniformes-erp.vercel.app',
      email: email,
      senha_temporaria: 'Bravvi@2026',
      instrucoes: 'Acesse https://uniformes-erp.vercel.app com seu e-mail e a senha temporária Bravvi@2026.'
    });

  } catch (err) {
    console.error('[Cakto Webhook] Erro ao processar:', err);
    return res.status(200).json({ received: true, error: err.message });
  }
};
