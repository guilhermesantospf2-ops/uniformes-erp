// ============================================================================
// BRAVVI ERP TÊXTIL — WEBHOOK SERVERLESS WHATSAPP CLOUD API OFICIAL (META)
// Rota: GET/POST /api/webhook-whatsapp
// Atua como SDR com Inteligência Artificial (Gemini) para Qualificação de Confecções
// ============================================================================

const https = require('https');

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'bravvi_sdr_webhook_2026';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_AUTHORIZED_CHAT_ID;

// Prompt Industrial de Alta Conversão do SDR da Bravvi
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
   - Otimizador de encaixe de filme DTF.
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

// Função auxiliar para requisições HTTPS
function postJson(urlStr, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const bodyStr = JSON.stringify(data);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch (e) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });

    req.on('error', err => reject(err));
    req.write(bodyStr);
    req.end();
  });
}

// Disparo de mensagem de texto no WhatsApp Cloud API
async function enviarMensagemWhatsApp(phoneId, to, text) {
  if (!phoneId || !WHATSAPP_TOKEN) {
    console.warn('[WhatsApp SDR] Phone ID ou Token não configurados.');
    return;
  }
  const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
  return postJson(url, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: to,
    type: 'text',
    text: { preview_url: true, body: text }
  }, {
    'Authorization': `Bearer ${WHATSAPP_TOKEN}`
  });
}

// Notificação ao Telegram do Guilherme
async function notificarTelegramGuilherme(msg) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    await postJson(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: msg,
      parse_mode: 'Markdown'
    });
  } catch (err) {
    console.error('[Telegram Notify Error]', err);
  }
}

// Chamada do Gemini
async function gerarRespostaSDR(mensagemLead, historico = []) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
  
  const contents = [];
  if (historico && Array.isArray(historico)) {
    historico.slice(-6).forEach(h => contents.push(h));
  }
  contents.push({
    role: 'user',
    parts: [{ text: mensagemLead }]
  });

  const payload = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT_SDR }] },
    contents: contents,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 500
    }
  };

  try {
    const res = await postJson(url, payload);
    const candidate = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidate || "Olá! Tudo bem? Aqui é da equipe Bravvi ERP. Como posso ajudar a sua confecção hoje?";
  } catch (err) {
    console.error('[Gemini SDR Error]', err);
    return "Olá! Tudo bem? Aqui é da equipe Bravvi ERP Têxtil. Me conta: que tipo de uniformes vocês mais produzem por aí hoje?";
  }
}

module.exports = async function handler(req, res) {
  // CORS
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
      console.warn('[WhatsApp Webhook] Falha de token de verificação Meta:', token);
      return res.status(403).json({ error: 'Verification token mismatch' });
    }
  }

  // 2. Recebimento de Mensagens (POST)
  if (req.method === 'POST') {
    const body = req.body || {};
    
    // A Meta exige resposta 200 imediata para não reenviar mensagens
    res.status(200).json({ status: 'EVENT_RECEIVED' });

    try {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0]?.value;
      const metadata = change?.metadata;
      const phoneId = metadata?.phone_number_id || WHATSAPP_PHONE_NUMBER_ID;
      const messages = change?.messages;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        // Notificações de status (enviado, entregue, lido) ignoradas
        return;
      }

      const msgObj = messages[0];
      const from = msgObj.from; // Número do lead (ex: 5544999998888)
      const msgType = msgObj.type;

      let leadTexto = '';
      if (msgType === 'text') {
        leadTexto = msgObj.text?.body || '';
      } else if (msgType === 'button') {
        leadTexto = msgObj.button?.text || '';
      } else if (msgType === 'interactive') {
        leadTexto = msgObj.interactive?.button_reply?.title || msgObj.interactive?.list_reply?.title || '';
      } else {
        // Áudios ou imagens: mensagem padrão
        leadTexto = '[Mensagem de mídia/áudio enviada pelo cliente]';
      }

      if (!leadTexto.trim()) return;

      console.log(`[WhatsApp SDR] Mensagem de ${from}: "${leadTexto}"`);

      // Gera resposta com a IA SDR (Gemini)
      let respostaIA = await gerarRespostaSDR(leadTexto);

      // Checa se o lead foi qualificado
      const leadQualificado = respostaIA.includes('[LEAD_QUALIFICADO]');
      if (leadQualificado) {
        respostaIA = respostaIA.replace('[LEAD_QUALIFICADO]', '').trim();

        // Notifica Guilherme imediatamente no Telegram
        const alertaTelegram = `🔥 *NOVO LEAD QUALIFICADO NO WHATSAPP!* 🔥\n\n` +
          `📱 *WhatsApp:* [https://wa.me/${from}](https://wa.me/${from}) (${from})\n` +
          `💬 *Última Mensagem:* "${leadTexto}"\n\n` +
          `👉 *Ação Recomendada:* Chame esse dono de confecção agora no seu WhatsApp pessoal para fechar a implantação!`;

        await notificarTelegramGuilherme(alertaTelegram);
      }

      // Envia a resposta de volta ao lead pelo WhatsApp Cloud API
      await enviarMensagemWhatsApp(phoneId, from, respostaIA);

    } catch (err) {
      console.error('[WhatsApp Webhook Handler Error]', err);
    }
  }
};
