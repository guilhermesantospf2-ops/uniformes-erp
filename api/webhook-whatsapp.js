// ============================================================================
// BRAVVI ERP TÊXTIL — WEBHOOK SERVERLESS WHATSAPP CLOUD API OFICIAL (META)
// Rota: GET/POST /api/webhook-whatsapp
// Atua como SDR com Inteligência Artificial (Gemini) para Qualificação de Confecções
// ============================================================================

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'bravvi_sdr_webhook_2026';
const PERMANENT_TOKEN = Buffer.from('RUFBTk54WkN4SmtDc0JTN0tFbndGZHBtSFZDVmtaQmpoc0hMS1B4bnMyc1gwZkExOVJqZnk5ZG1aQ1VFNzZJUnJtaW1sZDlhWkFUbFN5ZDVZQ0NaQ1pDeURDMTVOeXJpaHdBMVhtcU83RlpBV05VZGs4VkEzSzBBR1FXSFg3RktIdmZLRDNlWUpuVnRjUVhGeVRjYkhLaE9uUDdFSllHZXlDaUNqTXVDR1V6VlVGUHhtOGVGWkNtaGFrT2RvaFpCd3hRWkRaRA==', 'base64').toString('utf8');
const WHATSAPP_TOKEN = process.env.WHATSAPP_API_TOKEN || process.env.WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN || PERMANENT_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '1324183054119560';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || Buffer.from('QVEuQWI4Uk42THZYbktYeHNLZDNPTUxjUDhLVmE3dTVVWS1wY3FMb3huZ0lmNzVQSExIQkE=', 'base64').toString('utf8');
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_AUTHORIZED_CHAT_ID || '8365248711';

// Prompt Oficial do Consultor Comercial SDR da Bravvi
const SYSTEM_PROMPT_SDR = `Você é o Carlos, consultor comercial e especialista de processos da Bravvi ERP Têxtil.
Você está conversando no WhatsApp com um dono ou gestor de confecção de uniformes, estamparia ou facção.

SEU OBJETIVO COMO SDR:
1. Conectar de forma natural, profissional e amigável (linguagem de confecção, não de robô).
2. Descobrir:
   - Que tipo de uniforme eles fabricam (Polo, Camiseta, Esportivo/Futebol, Brim Operacional, Jalecos, Escolar).
   - Volume aproximado mensal (quantas peças cortam por mês).
   - Maior dor atual (sobras de tecido, bobina DTF desperdiçada, cliente cobrando no WhatsApp, erro de grade).
3. Apresentar brevemente como o Bravvi ERP resolve exatamente isso em 1 clique:
   - Ficha técnica A4 automática sem expor os custos ao cortador.
   - Cálculo automático de kg de tecido por peça com margem de segurança.
   - Otimizador de encaixe de filme DTF (reduz até 38% do desperdício de filme).
   - Proposta comercial com foto real da peça enviada no WhatsApp com chave PIX.
   - Portal do Cliente onde o cliente preenche a relação de nomes e tamanhos direto do celular.
4. Quando o lead mostrar interesse ("quero testar", "quanto custa?", "como funciona?", "me manda uma demonstração"):
   - Forneça o link do showroom ao vivo: https://uniformes-erp.vercel.app/demo
   - Diga que o Guilherme Silva (nosso especialista de implantação) vai chamá-lo para liberar o acesso e tirar dúvidas técnicas.
   - Inclua a tag oculta [LEAD_QUALIFICADO] no final da sua resposta para acionar o alerta no Telegram do Guilherme.

REGRAS DE RESPOSTA NO WHATSAPP:
- Respostas curtas e conversacionais (máximo 2 a 3 parágrafos curtos por mensagem).
- Nunca mande textões gigantescos nem fale termos técnicos de programação.
- Não use emojis em excesso. Use no máximo 1 ou 2 por mensagem.
- Seja empático com os desafios de quem lida com chão de fábrica e prazo apertado.`;

// Envio oficial via Meta Cloud API usando native fetch
async function enviarMensagemWhatsApp(phoneId, to, text) {
  const targetPhoneId = phoneId || WHATSAPP_PHONE_NUMBER_ID;
  console.log(`[WhatsApp API] Enviando para ${to} via Phone ID ${targetPhoneId}...`);
  try {
    const url = `https://graph.facebook.com/v21.0/${targetPhoneId}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: { preview_url: true, body: text }
      })
    });
    const data = await res.json();
    console.log('[WhatsApp API Result]', JSON.stringify(data));
    return data;
  } catch (err) {
    console.error('[WhatsApp Send Error]', err.message);
  }
}

// Alerta Telegram
async function notificarTelegramGuilherme(msg) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: msg,
        parse_mode: 'Markdown'
      })
    });
  } catch (err) {
    console.error('[Telegram Error]', err.message);
  }
}

// Geração de Resposta Gemini 3.1 Flash-Lite
async function gerarRespostaSDR(mensagemLead) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
  const payload = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT_SDR }] },
    contents: [{ role: 'user', parts: [{ text: mensagemLead }] }],
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 350
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidate || 'Olá! Aqui é o Carlos da Bravvi ERP Têxtil. Me conta: que tipo de uniformes vocês fabricam aí na sua confecção?';
  } catch (err) {
    console.error('[Gemini SDR Error]', err.message);
    return 'Olá! Aqui é o Carlos da Bravvi ERP Têxtil. Como posso ajudar a sua confecção hoje?';
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Verificação do Webhook pela Meta (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
      console.log('[WhatsApp Webhook] Verificação da Meta bem-sucedida!');
      return res.status(200).send(challenge);
    } else {
      console.warn('[WhatsApp Webhook] Falha de token de verificação:', token);
      return res.status(403).json({ error: 'Verification token mismatch' });
    }
  }

  // 2. Recebimento de Mensagens da Meta (POST)
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    } else if (Buffer.isBuffer(body)) {
      try { body = JSON.parse(body.toString('utf8')); } catch (e) {}
    }
    body = body || {};

    try {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0]?.value || body.value || body;
      const metadata = change?.metadata;
      const phoneId = metadata?.phone_number_id || WHATSAPP_PHONE_NUMBER_ID;
      const messages = change?.messages;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        // Notificação de entrega/leitura
        return res.status(200).json({ status: 'STATUS_IGNORED' });
      }

      const msgObj = messages[0];
      const from = msgObj.from;
      const msgType = msgObj.type;

      let leadTexto = '';
      if (msgType === 'text') {
        leadTexto = msgObj.text?.body || '';
      } else if (msgType === 'button') {
        leadTexto = msgObj.button?.text || '';
      } else if (msgType === 'interactive') {
        leadTexto = msgObj.interactive?.button_reply?.title || msgObj.interactive?.list_reply?.title || '';
      } else {
        leadTexto = 'Olá, quero conhecer o sistema Bravvi ERP.';
      }

      if (!leadTexto.trim()) {
        return res.status(200).json({ status: 'EMPTY_TEXT' });
      }

      console.log(`[WhatsApp SDR] Mensagem recebida de ${from}: "${leadTexto}"`);

      // 1. Gera resposta com o Gemini 3.1 Flash-Lite
      let respostaIA = await gerarRespostaSDR(leadTexto);

      // 2. Se for lead qualificado, avisa o Telegram
      if (respostaIA.includes('[LEAD_QUALIFICADO]')) {
        respostaIA = respostaIA.replace('[LEAD_QUALIFICADO]', '').trim();
        const alerta = `🔥 *NOVO LEAD QUALIFICADO NO WHATSAPP!* 🔥\n\n` +
          `📱 *Contato:* [https://wa.me/${from}](https://wa.me/${from}) (\`${from}\`)\n` +
          `💬 *Mensagem do Lead:* "${leadTexto}"\n\n` +
          `👉 Acesse o WhatsApp para fechar com o cliente!`;
        await notificarTelegramGuilherme(alerta);
      }

      // 3. Envia a resposta de volta ao lead via Meta API
      await enviarMensagemWhatsApp(phoneId, from, respostaIA);

      // 4. Finaliza a requisição respondendo 200 à Meta APÓS concluir todo o trabalho
      return res.status(200).json({ status: 'REPLY_SENT', to: from });
    } catch (err) {
      console.error('[WhatsApp Webhook Handler Error]', err);
      return res.status(200).json({ status: 'ERROR', message: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
