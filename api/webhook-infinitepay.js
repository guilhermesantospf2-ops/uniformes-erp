// ============================================================================
// BRAVVI ERP TÊXTIL — WEBHOOK SERVERLESS INFINITEPAY (VERCEL FUNCTION)
// Rota: POST /api/webhook-infinitepay
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sua-url-supabase.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sua-chave-anonima';

module.exports = async function handler(req, res) {
  // Configuração de CORS
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
      gateway: 'InfinitePay (CloudWalk)',
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
    console.log('[InfinitePay Webhook] Recebido:', JSON.stringify(payload, null, 2));

    // A InfinitePay envia eventos de pagamento/transação
    // Exemplo de campos comuns: status, order_nsu, amount, transaction_id, customer, data
    const status = (payload.status || (payload.data && payload.data.status) || '').toUpperCase();
    const isPaid = status === 'PAID' || status === 'APPROVED' || status === 'COMPLETED' || payload.event === 'payment.succeeded';

    // Identificadores da compra
    const orderNsu = payload.order_nsu || (payload.data && payload.data.order_nsu) || payload.id || 'inf_' + Date.now();
    const valor = payload.amount || (payload.data && payload.data.amount) || 97.00;
    const email = (payload.customer && payload.customer.email) || (payload.data && payload.data.customer && payload.data.customer.email) || '';
    const nome = (payload.customer && payload.customer.name) || (payload.data && payload.data.customer && payload.data.customer.name) || '';

    // Gera um token criptograficamente seguro e aleatório para a ativação do cliente
    const crypto = require('crypto');
    const randomHex = crypto.randomBytes(8).toString('hex');
    const token = 'bravvi_' + randomHex;

    // Calcula 30 dias de acesso padrão (ou 365 se for anual acima de R$ 500)
    const diasAcesso = valor >= 500 ? 365 : 30;
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + diasAcesso);

    // Estrutura do registro no banco de dados
    const registroAssinatura = {
      token: token,
      order_nsu: String(orderNsu),
      email: email,
      nome_cliente: nome,
      valor: valor,
      plano: diasAcesso === 365 ? 'anual' : 'mensal',
      dias_acesso: diasAcesso,
      data_vencimento: dataVencimento.toISOString(),
      status: isPaid ? 'aprovado' : 'pendente',
      usado: false,
      criado_em: new Date().toISOString()
    };

    console.log('[InfinitePay Webhook] Registro preparado:', registroAssinatura);

    // Opcional: Persistir no Supabase se as credenciais estiverem no ambiente
    // Caso contrário, o fallback usa a verificação pelo comprovante/token na tela ativar.html
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
          body: JSON.stringify(registroAssinatura)
        });
        console.log('[InfinitePay Webhook] Salvo com sucesso no Supabase!');
      } catch (dbErr) {
        console.warn('[InfinitePay Webhook] Erro ao gravar no Supabase:', dbErr.message);
      }
    }

    // Retorna SEMPRE 200 OK para a InfinitePay saber que a notificação foi recebida
    return res.status(200).json({
      received: true,
      order_nsu: orderNsu,
      status: 'processed',
      activation_token: token,
      activation_url: `https://uniformes-erp.vercel.app/ativar.html?token=${token}`
    });

  } catch (err) {
    console.error('[InfinitePay Webhook] Erro ao processar:', err);
    // Mesmo com erro de parsing, responde 200 com log de erro para não travar a fila do gateway
    return res.status(200).json({ received: true, error: err.message });
  }
};
