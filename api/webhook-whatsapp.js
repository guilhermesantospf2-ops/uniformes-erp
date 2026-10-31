// ============================================================================
// BRAVVI ERP TÊXTIL — WEBHOOK SERVERLESS WHATSAPP CLOUD API OFICIAL (META)
// Rota: GET/POST /api/webhook-whatsapp
// SDR Closer de Alta Performance (Metodologia Formação Closer Diamond)
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

// Cache em memória para deduplicação instantânea de retentativas da Meta
const processedMessageIds = new Map();

// Prompt do Closer Carlos (Metodologia Formação Closer Diamond B2B + Pente Fino do ERP)
const SYSTEM_PROMPT_SDR = `Você é o Carlos, Closer comercial da Bravvi ERP Têxtil no WhatsApp.
Sua comunicação segue a Formação Closer Diamond: postura consultiva de alto padrão, ultra-enxuto, direto e NUNCA promete o que o sistema não faz.

TABELA DA REALIDADE DO SISTEMA (O QUE O BRAVVI ERP REALMENTE FAZ):
1. Fichas Técnicas A4 e Ordens de Serviço: calcula o consumo exato de tecido por peça (kg/metros), lista grades (Infantil ao G5) e ESCONDE o preço de venda e os custos do cortador/costureira.
2. Proposta Comercial com PIX: gera PDF com foto do mockup e QR Code PIX para receber sinal na aprovação (50% entrada).
3. Portal do Cliente: link onde o próprio cliente final preenche a lista de nomes e tamanhos direto pelo WhatsApp dele, zerando erros de grade.
4. Otimizador de Bobina Nesting DTF (Plano Pro): encaixa as estampas automaticamente na largura da bobina (30cm/60cm) e reduz até 38% do desperdício de filme DTF.
5. Gestão de Fábrica: controle de estoque de tecidos e aviamentos, radar de prazos de entrega, quarentena de qualidade e emissão de NF-e (Plano Pro).

O QUE O SISTEMA NÃO FAZ (JAMAIS PROMETA):
- NÃO é máquina de corte físico nem pilota laser/CNC.
- NÃO faz modelagem CAD 3D de moldes (não é Audaces/Gerber). O foco é GESTÃO, CUSTOS, FICHAS TÉCNICAS E PEDIDOS.

PLANOS E VALORES OFICIAIS:
- Plano Básico: R$ 107/mês (sem fidelidade, até 2 usuários, fichas A4, pedidos, estoque, financeiro).
- Plano Pro Industrial: R$ 227/mês (usuários ilimitados, otimizador de DTF Nesting, Portal do Cliente, NF-e).
- Plano Anual Pro: R$ 1.890/ano (12x no cartão, equivale a R$ 157/mês, 2 meses grátis).

REGRA DE OURO CLOSER DIAMOND: QUEM PERGUNTA CONTROLA A CONVERSA.
- Nunca mande textão de IA.
- Toda mensagem sua DEVE ter OBRIGATORIAMENTE 2 frases curtas:
  Frase 1: Resposta ou validação direta ao que o cliente falou.
  Frase 2: Uma pergunta cirúrgica para avançar o funil de qualificação.

FUNIL DE QUALIFICAÇÃO PASSO A PASSO (SIGA A ORDEM EXATA):
1. PRIMEIRO CONTATO (ou quando perguntarem "como funciona?"):
   - Explique em 1 frase resumida o sistema e pergunte OBRIGATORIAMENTE se já usam sistema ou não:
   - "O Bravvi ERP organiza desde o cálculo de tecido por peça até os pedidos e fichas técnicas da confecção. Hoje vocês já usam algum sistema aí ou controlam tudo em planilha e no papel?"

2. SE O CLIENTE RESPONDER QUE JÁ USA UM SISTEMA (ex: Bling, Tiny, outro):
   - Valide que sistemas comuns são genéricos e não atendem confecção, e descubra o gargalo do sistema atual:
   - "Esses sistemas genéricos não entendem as dores de confecção. O que você sente que mais falta nele hoje que te dá dor de cabeça aí na produção?"

3. SE O CLIENTE RESPONDER QUE NÃO USA SISTEMA (está em planilha, caderno ou WhatsApp):
   - Valide que o controle manual custa caro em tempo e erros, e pergunte pelo gargalo operacional:
   - "Fazer na mão consome horas e sempre gera erro. E hoje o que mais toma o seu tempo ou gera retrabalho: calcular o tecido e custos ou organizar a grade dos pedidos?"

4. APÓS O CLIENTE REVELAR O GARGALO DELE (seja do sistema atual ou da planilha):
   - Mostre como o Bravvi resolve essa dor específica e ofereça o vídeo curto:
   - "O Bravvi foi feito exatamente pra travar esse erro. Quer que eu te mande um vídeo de 1 minuto mostrando ele funcionando na prática aí na sua confecção?"

5. SE O CLIENTE PERGUNTAR O PREÇO ANTES DE VER O SISTEMA:
   - Ancore o valor acessível e puxe para qualificação:
   - "Temos planos a partir de R$ 107/mês, super acessível. Mas antes de ver o plano ideal: hoje vocês já usam algum sistema aí ou tá tudo na planilha?"

6. QUANDO O CLIENTE PEDIR DEMONSTRAÇÃO, TESTE, VÍDEO OU LINK:
   - Envie com entusiasmo o link de demonstração ao vivo e devolva com a pergunta de fechamento:
   - "Dá uma olhada no sistema funcionando ao vivo aqui: https://uniformes-erp.vercel.app/demo - Depois de ver, me diz: faz mais sentido pra você o Plano Básico de R$ 107 ou o Pro com DTF de R$ 227?"

7. PROIBIÇÕES RÍGIDAS:
   - NUNCA pergunte sobre estoque/tecido no primeiro contato antes de saber se ele já usa sistema.
   - NUNCA peça o WhatsApp do cliente.
   - NUNCA envie links por conta própria se o cliente NÃO pediu demonstração, teste ou vídeo.
   - Se o cliente disser que quer fechar, pedir chave PIX ou chamar o Guilherme, diga apenas: "Fechado! Já passei pro Guilherme aqui no privado com urgência, ele já vai assumir a conversa com você agora para fechar."`;

// Busca histórico e estado do lead no Supabase
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
  return { history: [], last_message_id: null, last_processed_at: 0, handoff: false };
}

// Salva histórico e estado do lead no Supabase
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
        text: { preview_url: false, body: text }
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

// Geração de Resposta Gemini com Contexto Closer Diamond
async function gerarRespostaSDRComContexto(history, novaMensagem) {
  const contents = (history || []).slice(-4).map(item => ({
    role: item.role,
    parts: item.parts
  }));

  contents.push({ role: 'user', parts: [{ text: novaMensagem }] });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
  const payload = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT_SDR }] },
    contents: contents,
    generationConfig: {
      temperature: 0.35, // Mais preciso, persuasivo e disciplinado
      maxOutputTokens: 140  // Espaço perfeito para resposta + pergunta de condução
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

  return 'Perfeito! Já chamei o Guilherme aqui no privado com urgência para fechar os detalhes com você.';
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
        return res.status(200).json({ status: 'STATUS_IGNORED' });
      }

      const msgObj = allMessages[0];
      const msgId = msgObj.id;
      const from = msgObj.from;
      const msgType = msgObj.type;

      // 🛡️ 1. DEDUPLICAÇÃO IMEDIATA (Anti-retentativas Meta)
      if (processedMessageIds.has(msgId)) {
        return res.status(200).json({ status: 'DUPLICATE_IGNORED', msgId });
      }
      processedMessageIds.set(msgId, Date.now());
      if (processedMessageIds.size > 200) {
        const dezMinAtras = Date.now() - 600000;
        for (const [k, v] of processedMessageIds.entries()) {
          if (v < dezMinAtras) processedMessageIds.delete(k);
        }
      }

      // Ignora mensagens enviadas pelo próprio número oficial
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

      // 🛡️ 2. BUSCA MEMÓRIA NO SUPABASE
      const leadState = await buscarHistoricoLead(from);

      if (leadState.last_message_id === msgId) {
        return res.status(200).json({ status: 'DB_DUPLICATE_IGNORED', msgId });
      }

      // 🛑 3. MODO SILÊNCIO / HANDOFF HUMANO
      // Se o lead já pediu para fechar ou chamou o Guilherme antes, o robô FICA MUDO!
      if (leadState.handoff === true) {
        await notificarTelegramGuilherme(`🚨 LEAD AGUARDANDO NO WHATSAPP:\nDe: https://wa.me/${from} (${from})\nFala: "${leadTexto}"\n(Bot em silêncio. Assuma a conversa no WhatsApp!)`);
        return res.status(200).json({ status: 'HANDOFF_MUTED' });
      }

      // 🛑 4. GATILHO DE FECHAMENTO OU CHAMADA DO GUILHERME
      const querFecharOuChamar = /(fechar|comprar|assinar|contratar|guilherme|chama ele|urgente|atender|falar com|humano|atendente|vendedor|ligar|demora|cadê|pix|cartão|pagamento|link de pagamento)/i.test(leadTexto);
      if (querFecharOuChamar) {
        const respostaHandoff = 'Fechado! Já passei pro Guilherme aqui no privado com urgência, ele já vai assumir a conversa com você agora para fechar.';
        
        // Delay humano (2.5 segundos)
        await new Promise(r => setTimeout(r, 2500));
        await enviarMensagemWhatsApp(phoneId, from, respostaHandoff);

        await salvarHistoricoLead(from, {
          history: [
            ...(leadState.history || []),
            { role: 'user', parts: [{ text: leadTexto }] },
            { role: 'model', parts: [{ text: respostaHandoff }] }
          ],
          last_message_id: msgId,
          last_processed_at: Date.now(),
          handoff: true // MUTA O BOT DEFINITIVAMENTE PARA ESTE CLIENTE
        });

        await notificarTelegramGuilherme(`🔥 LEAD PRONTO PARA FECHAR NO WHATSAPP! 🔥\nContato: https://wa.me/${from} (${from})\nMensagem: "${leadTexto}"\n\n👉 ASSUMA A CONVERSA NO WHATSAPP AGORA! O bot foi mutado.`);
        return res.status(200).json({ status: 'HANDOFF_TRIGGERED' });
      }

      // 🛡️ 5. COOLDOWN ANTI-METRALHADORA (Não atropela cliente que manda 3 frases seguidas)
      const agora = Date.now();
      if (leadState.last_processed_at && (agora - leadState.last_processed_at < 10000)) {
        console.log(`[Cooldown] Ignorando rajada de ${from}`);
        return res.status(200).json({ status: 'COOLDOWN_IGNORED' });
      }

      // 💬 6. GERA RESPOSTA CLOSER DIAMOND (1 A 2 FRASES CURTAS)
      let respostaIA = await gerarRespostaSDRComContexto(leadState.history || [], leadTexto);

      // Se o cliente pediu demonstração, teste, vídeo ou link
      const pediuLink = /(link|demo|demonstra|teste|testar|ver|vídeo|video|apresenta|mostrar|conhecer)/i.test(leadTexto);
      if (!pediuLink) {
        respostaIA = respostaIA.replace(/https?:\/\/[^\s]+/gi, '').replace(/\s{2,}/g, ' ').trim();
      } else if (!respostaIA.includes('http')) {
        // Se pediu demonstração e a IA esqueceu o link, injeta suavemente
        respostaIA = `Dá uma olhada no sistema funcionando ao vivo aqui: https://uniformes-erp.vercel.app/demo - Depois de ver, me diz: faz mais sentido pra você o Plano Básico de R$ 107 ou o Pro de R$ 227?`;
      }

      respostaIA = respostaIA
        .replace(/\[LEAD_QUALIFICADO\]/g, '')
        .replace(/\|\|\|/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Trava de segurança: preserva a resposta e a pergunta de condução sem cortar a pergunta
      if (respostaIA.length > 260) {
        const frases = respostaIA.match(/[^.!?]+[.!?]+/g);
        if (frases && frases.length >= 2) {
          respostaIA = (frases[0].trim() + ' ' + frases[1].trim()).trim();
        }
      }

      // ⏳ 7. CADÊNCIA HUMANA DE DIGITAÇÃO (3.5 segundos antes de disparar)
      await new Promise(r => setTimeout(r, 3500));

      // 8. Envia a mensagem pelo WhatsApp
      const sendResult = await enviarMensagemWhatsApp(phoneId, from, respostaIA);

      // 9. Salva no Supabase
      const updatedHistory = [...(leadState.history || [])];
      updatedHistory.push({ role: 'user', parts: [{ text: leadTexto }] });
      updatedHistory.push({ role: 'model', parts: [{ text: respostaIA }] });

      await salvarHistoricoLead(from, {
        history: updatedHistory.slice(-6),
        last_message_id: msgId,
        last_processed_at: Date.now(),
        handoff: false
      });

      // 10. Alerta no Telegram
      notificarTelegramGuilherme(`💬 CLOSER DIAMOND\nLead (${from}): "${leadTexto}"\nCarlos: "${respostaIA}"`);

      return res.status(200).json({ status: 'REPLY_SENT', to: from, metaResult: sendResult });
    } catch (err) {
      console.error('[WhatsApp Webhook Handler Error]', err);
      return res.status(200).json({ status: 'ERROR', message: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
