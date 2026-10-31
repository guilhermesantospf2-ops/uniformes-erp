// ============================================================================
// BRAVVI ERP TÊXTIL — WEBHOOK SERVERLESS WHATSAPP CLOUD API OFICIAL (META)
// Rota: GET/POST /api/webhook-whatsapp
// SDR com Memória Persistente (Supabase) + Inteligência Artificial (Gemini)
// ============================================================================

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'bravvi_sdr_webhook_2026';
const PERMANENT_TOKEN = Buffer.from('RUFBTk54WkN4SmtDc0JTN0tFbnc1ZHBtSFZDVmtaQmpoc0hMS1B4bnMyc1gwZkExOVJqZnk5ZG1aQ1VFNzZJUnJSbWltbGQ5YVpBVGxTeWQ1WUNDWkNaQ3lEQzE1TnlyaWh3QTFYbXFPN0ZaQVdOVWRrOFZBM0swQUdRV0hYN0ZLSHZmS0QzZVlKblZ0Y1FYRnlUY2JIS2hPblA3RUpZR2V5Q2lDak11Q0dVelZVRlB4bThlRlpDbWhha09kb2haQnd4UVpEWkQ=', 'base64').toString('utf8');
const WHATSAPP_TOKEN = PERMANENT_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = '1324183054119560';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || Buffer.from('QVEuQWI4Uk42THZYbktYeHNLZDNPTUxjUDhLVmE3dTVVWS1wY3FMb3huZ0lmNzVQSExIQkE=', 'base64').toString('utf8');
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || Buffer.from('ODg4ODU3MDY5ODpBQUd0elpKdjlWaTBsVDhUMVpCa1NOV2Qzbi1LcTMzRmdyYw==', 'base64').toString('utf8');
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_AUTHORIZED_CHAT_ID || '8365248711';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nrhygqygcfjyniogjegq.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yaHlncXlnY2ZqeW5pb2dqZWdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDQ3NTUxMywiZXhwIjoyMTA2MDUxNTEzfQ.O3qqAwPQCEVRh11hUC5QBCSY9Nf4qFQTKrMvGYU4EwU';

// Cache em memória para deduplicação instantânea de retentativas da Meta (evita loops)
const processedMessageIds = new Map();

// Prompt do SDR Carlos com diretrizes anti-repetição
const SYSTEM_PROMPT_SDR = `Você é o Carlos, consultor comercial especialista da Bravvi ERP Têxtil.
Você está conversando no WhatsApp com um dono ou gestor de confecção de uniformes, estamparia ou facção.

REGRAS DE OURO DE CONVERSAÇÃO NO WHATSAPP:
1. NUNCA se reapresente e NUNCA diga saudações como "Olá! Aqui é o Carlos" se a conversa já começou ou se o cliente já respondeu. Vá DIRETO ao ponto respondendo ao que ele falou.
2. Responda de forma curta, natural e conversacional (1 a 2 parágrafos curtos, no máximo 3 frases por mensagem). Linguagem de chão de fábrica, sem juridiquês, sem termos técnicos de programação.
3. Não use emojis em excesso (máximo 1). Nunca mande blocos gigantescos de texto.
4. Seu objetivo como SDR:
   - Identificar o nicho do cliente (polo, brim operacional, esportivo, camisetas, jalecos).
   - Identificar o volume mensal de peças cortadas.
   - Apresentar como o Bravvi ERP elimina as maiores dores (desperdício de tecido/filme DTF com encaixe inteligente, ficha técnica A4 automática sem expor custos pro cortador, portal do cliente para preenchimento de nomes/tamanhos).
5. Quando o lead pedir demonstração, preço ou demonstrar interesse em conhecer:
   - Convide para ver o showroom ao vivo: https://uniformes-erp.vercel.app/demo
   - Avise que o Guilherme Silva (nosso especialista de implantação) vai chamá-lo para liberar o teste.
   - Adicione a tag oculta [LEAD_QUALIFICADO] no final da resposta.`;

// Busca histórico do lead no Supabase
async function buscarHistoricoLead(phone) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/erp_tenants?tenant_id=eq.sdr_lead_${phone}&select=db`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    const data = await res.json();
    if (data && data[0] && data[0].db) {
      return data[0].db;
    }
  } catch (err) {
    console.error('[Supabase Read Error]', err.message);
  }
  return { history: [], last_message_id: null, last_processed_at: 0 };
}

// Salva histórico do lead no Supabase
async function salvarHistoricoLead(phone, dbData) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/erp_tenants`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        tenant_id: `sdr_lead_${phone}`,
        db: dbData,
        ultima_atualizacao_ms: Date.now()
      })
    });
  } catch (err) {
    console.error('[Supabase Save Error]', err.message);
  }
}

// Envio oficial via Meta Cloud API
async function enviarMensagemWhatsApp(phoneId, to, text) {
  const targetPhoneId = phoneId || WHATSAPP_PHONE_NUMBER_ID;
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
    return await res.json();
  } catch (err) {
    console.error('[WhatsApp Send Error]', err.message);
    return { error: err.message };
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
        text: msg
      })
    });
  } catch (err) {
    console.error('[Telegram Error]', err.message);
  }
}

// Geração de Resposta Gemini 3.5 com Contexto de Histórico
async function gerarRespostaSDRComContexto(history, novaMensagem) {
  // Limita histórico recente às últimas 6 interações para máxima velocidade e relevância
  const contents = (history || []).slice(-6).map(item => ({
    role: item.role,
    parts: item.parts
  }));

  contents.push({ role: 'user', parts: [{ text: novaMensagem }] });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
  const payload = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT_SDR }] },
    contents: contents,
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 200
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
    if (candidate && candidate.trim()) {
      return candidate.trim();
    }
  } catch (err) {
    console.error('[Gemini Context Error]', err.message);
  }

  // Se falhar e já houver histórico, resposta contextual sem saudação repetitiva
  if (history && history.length > 0) {
    return 'Entendido! Me conta: qual o volume de peças que vocês costumam produzir por mês hoje?';
  }
  return 'Olá! Aqui é o Carlos da Bravvi ERP Têxtil. Me conta: que tipo de uniformes vocês fabricam aí na sua confecção?';
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Verificação Webhook Meta (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).json({ error: 'Verification token mismatch' });
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
      let allMessages = [];
      let phoneId = WHATSAPP_PHONE_NUMBER_ID;

      if (body.entry && Array.isArray(body.entry)) {
        for (const e of body.entry) {
          for (const ch of e.changes || []) {
            if (ch.value) {
              if (ch.value.metadata?.phone_number_id && ch.value.metadata.phone_number_id !== '123456123') {
                phoneId = ch.value.metadata.phone_number_id;
              }
              if (Array.isArray(ch.value.messages)) {
                allMessages.push(...ch.value.messages);
              }
            }
          }
        }
      } else if (body.value?.messages && Array.isArray(body.value.messages)) {
        allMessages.push(...body.value.messages);
      } else if (Array.isArray(body.messages)) {
        allMessages.push(...body.messages);
      }

      if (allMessages.length === 0) {
        // Ignora status de leitura/entrega sem gastar processamento
        return res.status(200).json({ status: 'STATUS_IGNORED' });
      }

      const msgObj = allMessages[0];
      const msgId = msgObj.id;
      const from = msgObj.from;
      const msgType = msgObj.type;

      // 🛡️ DEDUPLICAÇÃO IMEDIATA (Evita loop de mensagens repetidas causadas por retentativas da Meta)
      if (processedMessageIds.has(msgId)) {
        return res.status(200).json({ status: 'DUPLICATE_IGNORED', msgId });
      }
      processedMessageIds.set(msgId, Date.now());
      // Limpeza de cache antigo (> 10 minutos)
      if (processedMessageIds.size > 200) {
        const dezMinAtras = Date.now() - 600000;
        for (const [k, v] of processedMessageIds.entries()) {
          if (v < dezMinAtras) processedMessageIds.delete(k);
        }
      }

      // Ignora mensagens enviadas pelo próprio bot se houver echo
      if (from === WHATSAPP_PHONE_NUMBER_ID || from === '554499856245') {
        return res.status(200).json({ status: 'SELF_ECHO_IGNORED' });
      }

      let leadTexto = '';
      if (msgType === 'text') {
        leadTexto = msgObj.text?.body || '';
      } else if (msgType === 'button') {
        leadTexto = msgObj.button?.text || '';
      } else if (msgType === 'interactive') {
        leadTexto = msgObj.interactive?.button_reply?.title || msgObj.interactive?.list_reply?.title || '';
      }

      if (!leadTexto.trim()) {
        return res.status(200).json({ status: 'EMPTY_TEXT' });
      }

      // 1. Busca memória da conversa no Supabase
      const leadState = await buscarHistoricoLead(from);

      // Trava contra duplicação persistente no banco
      if (leadState.last_message_id === msgId) {
        return res.status(200).json({ status: 'DB_DUPLICATE_IGNORED', msgId });
      }

      // 2. Gera resposta inteligente com contexto (sem repetir saudações)
      let respostaIA = await gerarRespostaSDRComContexto(leadState.history || [], leadTexto);

      // 3. Atualiza histórico da conversa
      const updatedHistory = [...(leadState.history || [])];
      updatedHistory.push({ role: 'user', parts: [{ text: leadTexto }] });
      updatedHistory.push({ role: 'model', parts: [{ text: respostaIA.replace('[LEAD_QUALIFICADO]', '').trim() }] });

      await salvarHistoricoLead(from, {
        history: updatedHistory.slice(-10),
        last_message_id: msgId,
        last_processed_at: Date.now()
      });

      // 4. Se for lead qualificado, alerta o Telegram
      if (respostaIA.includes('[LEAD_QUALIFICADO]')) {
        respostaIA = respostaIA.replace('[LEAD_QUALIFICADO]', '').trim();
        const alerta = `🔥 NOVO LEAD QUALIFICADO NO WHATSAPP! 🔥\n\nContato: https://wa.me/${from} (${from})\nMensagem: "${leadTexto}"\n\nAcesse o WhatsApp para fechar com o cliente!`;
        notificarTelegramGuilherme(alerta); // Disparo não bloqueante
      }

      // 5. Envia resposta oficial pelo WhatsApp
      const sendResult = await enviarMensagemWhatsApp(phoneId, from, respostaIA);

      // 6. Log informativo no Telegram (não-bloqueante)
      notificarTelegramGuilherme(`💬 CONVERSA SDR ATIVA\nLead (${from}): "${leadTexto}"\nCarlos: "${respostaIA}"`);

      return res.status(200).json({ status: 'REPLY_SENT', to: from, metaResult: sendResult });
    } catch (err) {
      console.error('[WhatsApp Webhook Handler Error]', err);
      return res.status(200).json({ status: 'ERROR', message: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
