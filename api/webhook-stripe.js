// ============================================================================
// BRAVVI ERP TÊXTIL — WEBHOOK SERVERLESS STRIPE (PARAGUAI & INTERNACIONAL USD)
// Rota: POST /api/webhook-stripe
// Libera automaticamente o acesso do cliente no Supabase após pagamento USD
// ============================================================================

const crypto = require('crypto');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Stripe-Signature'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'online',
      gateway: 'Stripe International (USD - Paraguay & LatAm)',
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
      } catch (e) {
        payload = {};
      }
    }

    const eventType = String(payload.type || '').toLowerCase();
    const obj = (payload.data && payload.data.object) ? payload.data.object : {};

    const isPaid =
      eventType === 'checkout.session.completed' ||
      eventType === 'invoice.paid' ||
      eventType === 'invoice.payment_succeeded' ||
      eventType === 'payment_intent.succeeded';

    if (!isPaid) {
      return res.status(200).json({ received: true, ignored: eventType });
    }

    const customerDetails = obj.customer_details || {};
    const email = String(
      customerDetails.email ||
      obj.customer_email ||
      obj.receipt_email ||
      ''
    ).trim().toLowerCase();

    const nome = String(
      customerDetails.name ||
      obj.customer_name ||
      'Taller de Confección'
    ).trim();

    const phone = String(customerDetails.phone || '').trim();
    const orderId = String(obj.id || payload.id || ('stripe_' + Date.now()));
    const amountCents = Number(obj.amount_total || obj.amount_paid || obj.amount || 0);
    const valorUSD = amountCents > 0 ? amountCents / 100 : 39;

    if (!email || !email.includes('@')) {
      return res.status(200).json({ received: true, warning: 'No customer email in event' });
    }

    const diasAcesso = valorUSD >= 200 ? 365 : 30;
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + diasAcesso);

    const token = 'bravvi_py_' + crypto.randomBytes(8).toString('hex');
    const tenantHash = crypto.createHash('sha256').update('tenant_bravvi_' + email).digest('hex').substring(0, 24);
    const tenantId = 'tenant_' + tenantHash;

    const supabaseUrl = process.env.SUPABASE_URL || 'https://nrhygqygcfjyniogjegq.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (supabaseUrl && supabaseKey) {
      const fetchFn = global.fetch || require('node-fetch');

      const empNova = {
        razaoSocial: nome,
        nomeFantasia: nome,
        email: email,
        telefone: phone,
        plano: diasAcesso === 365 ? 'anual' : 'mensal',
        statusAssinatura: 'ativa',
        dataVencimento: dataVencimento.toISOString(),
        gateway: 'stripe_usd',
        moeda: 'USD',
        pais: 'PY',
        auth: {
          email: email,
          nomeResponsavel: nome,
          whatsapp: phone,
          precisaTrocarSenha: true
        }
      };

      // 1. Provisiona o tenant no Supabase se ainda não existir (ou preserva dados se já existir)
      const existingRes = await fetchFn(
        `${supabaseUrl}/rest/v1/erp_tenants?tenant_id=eq.${encodeURIComponent(tenantId)}&select=tenant_id,empresa,db`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`
          }
        }
      );
      const existingRows = await existingRes.json().catch(() => []);
      const existingRow = Array.isArray(existingRows) && existingRows.length > 0 ? existingRows[0] : null;

      await fetchFn(`${supabaseUrl}/rest/v1/erp_tenants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          tenant_id: tenantId,
          empresa: existingRow && existingRow.empresa ? { ...existingRow.empresa, statusAssinatura: 'ativa', dataVencimento: dataVencimento.toISOString() } : empNova,
          db: existingRow && existingRow.db ? existingRow.db : { pedidos: [] },
          ultima_atualizacao_ms: Date.now(),
          versao_erp: '8.5.0_BLINDADO'
        })
      });

      // 2. Grava token em erp_tokens
      await fetchFn(`${supabaseUrl}/rest/v1/erp_tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          token,
          tenant_id: tenantId,
          order_nsu: orderId,
          gateway: 'stripe_usd',
          email,
          nome_cliente: nome,
          telefone: phone,
          valor: valorUSD,
          plano: diasAcesso === 365 ? 'anual' : 'mensal',
          dias_acesso: diasAcesso,
          data_vencimento: dataVencimento.toISOString(),
          status: 'aprovado',
          usado: false,
          criado_em: new Date().toISOString()
        })
      }).catch(() => {});

      // 3. Grava assinatura em erp_subscriptions
      await fetchFn(`${supabaseUrl}/rest/v1/erp_subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          tenant_id: tenantId,
          email,
          whatsapp: phone,
          plano: diasAcesso === 365 ? 'anual' : 'mensal',
          status: 'ativa',
          valor: valorUSD,
          data_inicio: new Date().toISOString(),
          data_vencimento: dataVencimento.toISOString(),
          gateway: 'stripe_usd',
          order_nsu: orderId
        })
      }).catch(() => {});
    }

    return res.status(200).json({
      received: true,
      status: 'approved',
      tenant_id: tenantId
    });
  } catch (err) {
    console.error('[Stripe Webhook] Erro:', err);
    return res.status(200).json({ received: true, error: err.message });
  }
};
