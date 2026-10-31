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

// Prompt do SDR Carlos: ULTRA ENXUTO, sem textão e sem despejar link de demonstração
const SYSTEM_PROMPT_SDR = `Você é o Carlos, consultor comercial da Bravvi ERP Têxtil no WhatsApp.
Você fala como um vendedor de verdade teclando no WhatsApp pelo celular: ULTRA ENXUTO, direto, simpático e sem enrolação.

REGRAS OBRIGATÓRIAS (NUNCA QUEBRE):
1. MÁXIMO 1 OU 2 BALÕES CURTOS separados pelo delimitador '|||'.
   - Cada balão deve ter NO MÁXIMO 10 a 16 palavras (1 frase curta por ideia).
   - NUNCA mande 3 balões. Mande no máximo 2 balões.
2. REGRA DO LINK (PROIBIDO MANDAR LINK DE DEMONSTRAÇÃO DE GRAÇA):
   - NUNCA envie o link https://uniformes-erp.vercel.app/demo por conta própria!
   - O link da demonstração é ESTRITAMENTE PROIBIDO a menos que o cliente PEÇA COM TODAS AS LETRAS ("manda o link", "onde eu vejo?", "quero testar", "tem demo?", "como vejo funcionando?").
   - Se o cliente NÃO pediu o link explicitamente, NUNCA envie URL nenhuma. Apenas responda a dúvida dele em 1 frase e faça 1 pergunta curta.
3. NUNCA se reapresente e NUNCA repita saudações como "Olá! Aqui é o Carlos" se a conversa já começou. Vá direto ao ponto.
4. Responda em 1 frase curta o que ele perguntou, e no segundo balão faça 1 pergunta rápida para entender a confecção dele.
5. Quando o cliente EXPLICITAMENTE pedir o link da demo:
   - Balão 1: "Show! O showroom ao vivo tá liberado aqui: https://uniformes-erp.vercel.app/demo"
   - Balão 2: "Qualquer dúvida, o Guilherme Silva da nossa equipe técnica te dá um toque aqui!"
   - Adicione a tag [LEAD_QUALIFICADO] no final.`;

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
      temperature: 0.5,
      maxOutputTokens: 90
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

      // 3. Fracionamento em no máximo 2 balões ultra enxutos
      let textoBase = respostaIA.replace('[LEAD_QUALIFICADO]', '').trim();

      // Blindagem estrita: Se o cliente NÃO pediu link expressamente, remove qualquer URL
      const pediuLink = /(manda|passa|tem|qual|onde).*(link|demo|demonstra|teste|ver)/i.test(leadTexto) || /quero testar|onde vejo/i.test(leadTexto);
      if (!pediuLink) {
        textoBase = textoBase.replace(/https?:\/\/[^\s]+/gi, '').replace(/\s{2,}/g, ' ').trim();
      }

      let baloes = textoBase
        .split(/\|\|\||\n\n+/)
        .map(b => b.trim())
        .filter(b => b.length > 0);

      // Se não veio com |||, quebra se for maior que 120 caracteres
      if (baloes.length === 1 && baloes[0].length > 120) {
        const frases = baloes[0].match(/[^.!?]+[.!?]+(\s|$)/g);
        if (frases && frases.length > 1) {
          baloes = frases.map(f => f.trim()).filter(Boolean);
        }
      }

      // Trava rígida: Máximo 2 balões curtos (nada de falar demais)
      baloes = baloes.slice(0, 2);
      if (baloes.length === 0) baloes = [textoBase];

      // Atualiza histórico com a resposta consolidada
      const updatedHistory = [...(leadState.history || [])];
      updatedHistory.push({ role: 'user', parts: [{ text: leadTexto }] });
      updatedHistory.push({ role: 'model', parts: [{ text: baloes.join(' ') }] });

      await salvarHistoricoLead(from, {
        history: updatedHistory.slice(-10),
        last_message_id: msgId,
        last_processed_at: Date.now()
      });

      // 4. Se for lead qualificado, alerta o Telegram
      if (respostaIA.includes('[LEAD_QUALIFICADO]')) {
        const alerta = `🔥 NOVO LEAD QUALIFICADO NO WHATSAPP! 🔥\n\nContato: https://wa.me/${from} (${from})\nMensagem: "${leadTexto}"\n\nAcesse o WhatsApp para fechar com o cliente!`;
        notificarTelegramGuilherme(alerta);
      }

      // 5. Envia cada balão em sequência com pequeno delay simulando digitação humana
      let sendResult = null;
      for (let i = 0; i < baloes.length; i++) {
        const balao = baloes[i];
        sendResult = await enviarMensagemWhatsApp(phoneId, from, balao);
        if (i < baloes.length - 1) {
          await new Promise(r => setTimeout(r, 700));
        }
      }

      // 6. Log informativo no Telegram (não-bloqueante)
      notificarTelegramGuilherme(`💬 CONVERSA SDR ATIVA\nLead (${from}): "${leadTexto}"\nCarlos (${baloes.length} balões):\n${baloes.map(b => '• ' + b).join('\n')}`);

      return res.status(200).json({ status: 'REPLY_SENT', to: from, baloesCount: baloes.length, metaResult: sendResult });
    } catch (err) {
      console.error('[WhatsApp Webhook Handler Error]', err);
      return res.status(200).json({ status: 'ERROR', message: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
