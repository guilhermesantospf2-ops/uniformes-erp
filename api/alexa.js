// ============================================================================
// BRAVVI / JARVIS — ALEXA CUSTOM SKILL BACKEND (GEMINI 2.5 / 3.0 VOICE)
// Rota Serverless Vercel: POST /api/alexa
// Transforma a Echo Dot em um assistente de voz executivo com IA conversacional
// ============================================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || Buffer.from('QVEuQWI4Uk42THZYbktYeHNLZDNPTUxjUDhLVmE3dTVVWS1wY3FMb3huZ0lmNzVQSExIQkE=', 'base64').toString('utf8');

// Prompt executivo desenhado para RESPOSTAS DE VOZ (sem markdown, fluida e concisa)
const SYSTEM_PROMPT_VOZ = `Você é o Jarvis, assistente executivo e de inteligência artificial pessoal do Comandante Guilherme Silva.
Suas respostas serão FALADAS EM VOZ ALTA por uma Echo Dot (Alexa).

DIRETRIZES FUNDAMENTAIS PARA RESPOSTA DE VOZ:
1. NUNCA use formatação Markdown como asteriscos (**negrito**), cerquilhas (# títulos), listas com traços (-) ou tabelas, pois o sintetizador de voz da Alexa lê esses símbolos literalmente.
2. Seja direto, conciso, inteligente e natural (máximo de 2 a 4 frases por resposta, a menos que o Comandante peça uma explicação detalhada).
3. Responda em português brasileiro de forma polida, elegante e prestativa ("Comandante Guilherme", "Pois não", "Certamente").
4. Se o Guilherme perguntar sobre a Bravvi ou sobre a fábrica de uniformes, você sabe que ele é o fundador do Bravvi ERP Têxtil, o melhor sistema para confecções de uniformes no Brasil.`;

async function consultarGemini(pergunta) {
  if (!GEMINI_API_KEY) {
    return 'Chave do Gemini não configurada no servidor. Por favor, verifique o arquivo de configuração.';
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT_VOZ }] },
      contents: [{ role: 'user', parts: [{ text: pergunta }] }],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 250
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    let texto = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Desculpe Comandante, não consegui formular uma resposta no momento.';

    // Limpeza profunda de qualquer caractere de markdown para a voz da Alexa ficar perfeita
    texto = texto
      .replace(/[*_#`~>\[\]\(\)]/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    return texto;
  } catch (err) {
    console.error('Erro ao chamar Gemini para Alexa:', err);
    return 'Houve uma falha de conexão com os servidores da inteligência artificial.';
  }
}

function buildAlexaResponse(speechText, shouldEndSession = false, repromptText = null) {
  const response = {
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'PlainText',
        text: speechText
      },
      shouldEndSession: shouldEndSession
    }
  };

  if (repromptText && !shouldEndSession) {
    response.response.reprompt = {
      outputSpeech: {
        type: 'PlainText',
        text: repromptText
      }
    };
  }

  return response;
}

module.exports = async function handler(req, res) {
  // CORS e verificação de método
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'online', service: 'Jarvis Alexa Skill Gateway' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const alexaReq = req.body || {};
    const requestType = alexaReq.request?.type;

    console.log(`[ALEXA] Tipo de requisição: ${requestType}`);

    // 1. Quando o usuário diz: "Alexa, abra o Jarvis"
    if (requestType === 'LaunchRequest') {
      const falaInicial = 'Jarvis online, Comandante Guilherme. O que deseja saber ou executar hoje?';
      return res.status(200).json(buildAlexaResponse(falaInicial, false, 'Estou ouvindo, Comandante. O que precisa?'));
    }

    // 2. Quando o usuário faz uma pergunta ou aciona um Intent
    if (requestType === 'IntentRequest') {
      const intentName = alexaReq.request.intent?.name;
      console.log(`[ALEXA] Intent detectado: ${intentName}`);

      // Comandos nativos de encerramento
      if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        return res.status(200).json(buildAlexaResponse('Até logo, Comandante. Estarei em prontidão.', true));
      }

      if (intentName === 'AMAZON.HelpIntent') {
        const ajuda = 'Você pode me fazer qualquer pergunta sobre negócios, mercado têxtil, resumos de vendas ou conhecimentos gerais. O que gostaria de saber?';
        return res.status(200).json(buildAlexaResponse(ajuda, false, 'Pode perguntar qualquer coisa.'));
      }

      // Extrai o que o usuário falou (slot livre ou fallback)
      const slots = alexaReq.request.intent?.slots || {};
      let perguntaUsuario = '';

      if (slots.query?.value) {
        perguntaUsuario = slots.query.value;
      } else if (slots.pergunta?.value) {
        perguntaUsuario = slots.pergunta.value;
      } else if (slots.comando?.value) {
        perguntaUsuario = slots.comando.value;
      } else {
        // Tenta capturar qualquer slot disponível
        const firstSlot = Object.values(slots)[0];
        if (firstSlot && firstSlot.value) {
          perguntaUsuario = firstSlot.value;
        }
      }

      if (!perguntaUsuario) {
        return res.status(200).json(buildAlexaResponse('Não compreendi o que você disse, Comandante. Poderia repetir?', false, 'Estou ouvindo.'));
      }

      console.log(`[ALEXA] Pergunta do usuário: "${perguntaUsuario}"`);

      // Consulta a IA
      const respostaIA = await consultarGemini(perguntaUsuario);
      return res.status(200).json(buildAlexaResponse(respostaIA, false, 'Mais alguma coisa, Comandante?'));
    }

    // 3. Fim da sessão
    if (requestType === 'SessionEndedRequest') {
      return res.status(200).json(buildAlexaResponse('', true));
    }

    // Fallback padrão
    return res.status(200).json(buildAlexaResponse('Estou conectado, Comandante. Como posso ajudar?', false));
  } catch (err) {
    console.error('[ALEXA] Erro fatal no processamento:', err);
    return res.status(200).json(buildAlexaResponse('Ocorreu um erro interno ao processar sua solicitação no Jarvis.', true));
  }
};
