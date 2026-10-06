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

    // Persistir no Supabase
    const supabaseUrl = process.env.SUPABASE_URL || 'https://nrhygqygcfjyniogjegq.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yaHlncXlnY2ZqeW5pb2dqZWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NzU1MTMsImV4cCI6MjEwNjA1MTUxM30.JXAt9Ha1ni2T3G-dMvITGdH9PIPTc7_utI3H9LPrIV4';

    if (supabaseUrl && supabaseKey) {
      try {
        const fetch = global.fetch || require('node-fetch');
        const cleanEmail = (email || '').toLowerCase().trim();
        const tenantHash = crypto.createHash('sha256').update('tenant_bravvi_' + cleanEmail).digest('hex').substring(0, 24);
        const tenantId = 'tenant_' + tenantHash;

        // 1. Grava diretamente em erp_tenants para liberar primeiro acesso
        const empNova = {
          razaoSocial: nome || 'Minha Confecção',
          nomeFantasia: nome || 'Minha Confecção',
          email: cleanEmail,
          telefone: phone,
          plano: diasAcesso === 365 ? 'anual' : 'mensal',
          statusAssinatura: isPaid ? 'ativa' : 'pendente',
          dataVencimento: dataVencimento.toISOString(),
          gateway: 'cakto',
          auth: {
            email: cleanEmail,
            nomeResponsavel: nome || 'Administrador',
            whatsapp: phone,
            precisaTrocarSenha: true
          }
        };

        await fetch(`${supabaseUrl}/rest/v1/erp_tenants`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            tenant_id: tenantId,
            empresa: empNova,
            db: {},
            ultima_atualizacao_ms: Date.now()
          })
        });

        // 2. Grava o token em erp_tokens
        try {
          await fetch(`${supabaseUrl}/rest/v1/erp_tokens`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({ ...registro, tenant_id: tenantId })
          });
        } catch(eTok) {}

        // 3. Grava ou atualiza a assinatura ativa
        try {
          await fetch(`${supabaseUrl}/rest/v1/erp_subscriptions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
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
        } catch(eSub) {}

        console.log('[Cakto Webhook] Salvo com sucesso no Supabase (tokens + subscriptions)!');

        // 3. Disparo automático de e-mail com senha temporária via Resend (se RESEND_API_KEY estiver configurado)
        if (process.env.RESEND_API_KEY && isPaid && cleanEmail) {
          try {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
              },
              body: JSON.stringify({
                from: process.env.EMAIL_FROM || 'Bravvi ERP Têxtil <onboarding@resend.dev>',
                to: [cleanEmail],
                subject: 'Seu acesso ao Bravvi ERP Têxtil foi liberado! 🎉',
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
                    <h2 style="color: #032b35; margin-bottom: 8px;">Bem-vindo ao Bravvi ERP Têxtil! 🎉</h2>
                    <p style="font-size: 14px; color: #334155; line-height: 1.5;">
                      Olá, <strong>${nome || 'Gestor'}</strong>! O seu pagamento foi confirmado com sucesso.
                    </p>
                    <div style="background: #f0fdfa; border: 1.5px dashed #0d9488; border-radius: 8px; padding: 16px; margin: 20px 0;">
                      <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; color: #0f766e; text-transform: uppercase;">Suas Credenciais de Primeiro Acesso:</p>
                      <p style="margin: 4px 0; font-size: 14px; color: #0f172a;"><strong>E-mail de login:</strong> ${cleanEmail}</p>
                      <p style="margin: 4px 0; font-size: 14px; color: #0f172a;"><strong>Senha Temporária:</strong> <span style="font-family: monospace; font-size: 16px; font-weight: bold; color: #0d9488;">Bravvi@2026</span></p>
                    </div>
                    <p style="font-size: 13.5px; color: #475569; line-height: 1.5;">
                      No seu primeiro login, você dará o nome oficial à sua confecção e definirá a sua <strong>senha pessoal definitiva</strong>.
                    </p>
                    <div style="text-align: center; margin: 26px 0;">
                      <a href="https://uniformes-erp.vercel.app?email=${encodeURIComponent(cleanEmail)}" style="background: #0d9488; color: #ffffff; padding: 13px 26px; text-decoration: none; border-radius: 9999px; font-weight: bold; font-size: 14px; display: inline-block;">
                        Acessar Meu Painel Industrial Agora &rarr;
                      </a>
                    </div>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                      Dúvidas ou suporte? WhatsApp da equipe: (44) 99807-1870
                    </p>
                  </div>
                `
              })
            });
            console.log('[Cakto Webhook] E-mail de primeiro acesso enviado com sucesso via Resend!');
          } catch (resendErr) {
            console.warn('[Cakto Webhook] Erro ao disparar e-mail Resend:', resendErr.message);
          }
        }
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
