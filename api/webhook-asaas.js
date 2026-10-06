// ============================================================================
// BRAVVI ERP TÊXTIL — WEBHOOK SERVERLESS ASAAS (VERCEL FUNCTION)
// Rota: POST /api/webhook-asaas
// ============================================================================

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, asaas-access-token'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'online',
      gateway: 'Asaas (Gestão Inteligente de Assinaturas)',
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
    console.log('[Asaas Webhook] Evento recebido:', payload.event, JSON.stringify(payload, null, 2));

    const evento = (payload.event || '').toUpperCase();
    const payment = payload.payment || {};

    const isPaid = evento === 'PAYMENT_RECEIVED' || evento === 'PAYMENT_CONFIRMED';
    const isOverdue = evento === 'PAYMENT_OVERDUE';

    const orderId = payment.id || 'asaas_' + Date.now();
    const valor = payment.value || 397.00;
    const customerId = payment.customer || '';
    const billingType = payment.billingType || 'PIX_OR_CREDIT_CARD';

    // Gera um token criptograficamente seguro e aleatório para a ativação do cliente
    const crypto = require('crypto');
    const randomHex = crypto.randomBytes(8).toString('hex');
    const token = 'bravvi_' + randomHex;

    // Calcula 30 dias de acesso (ou 365 se for anual acima de R$ 500)
    const diasAcesso = valor >= 500 ? 365 : 30;
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + diasAcesso);

    const registro = {
      token: token,
      order_nsu: String(orderId),
      customer_id: customerId,
      valor: valor,
      billing_type: billingType,
      plano: diasAcesso === 365 ? 'anual' : 'mensal',
      dias_acesso: diasAcesso,
      data_vencimento: dataVencimento.toISOString(),
      evento_asaas: evento,
      status: isPaid ? 'aprovado' : (isOverdue ? 'inadimplente' : 'processando'),
      usado: false,
      criado_em: new Date().toISOString()
    };

    console.log('[Asaas Webhook] Registro preparado:', registro);

    // Opcional: Persistir no Supabase se as variáveis de ambiente existirem
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const fetch = global.fetch || require('node-fetch');
        await fetch(`${process.env.SUPABASE_URL}/rest/v1/erp_tokens`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(registro)
        });
        console.log('[Asaas Webhook] Salvo com sucesso no Supabase!');
      } catch (dbErr) {
        console.warn('[Asaas Webhook] Erro ao gravar no Supabase:', dbErr.message);
      }
    }

    // Retorna SEMPRE 200 OK para o Asaas saber que a notificação foi processada
    return res.status(200).json({
      received: true,
      event: evento,
      payment_id: orderId,
      status: isPaid ? 'approved' : 'received',
      activation_token: token,
      activation_url: `https://uniformes-erp.vercel.app/ativar.html?token=${token}`
    });

  } catch (err) {
    console.error('[Asaas Webhook] Erro ao processar:', err);
    return res.status(200).json({ received: true, error: err.message });
  }
};
