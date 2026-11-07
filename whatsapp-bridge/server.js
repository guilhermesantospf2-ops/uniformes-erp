const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Carregar .env da raiz
const envPath = path.join(__dirname, '..', '.env');
const env = {};
if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
        if (line.includes('=') && !line.startsWith('#')) {
            const [k, ...v] = line.trim().split('=');
            env[k.trim()] = v.join('=').trim();
        }
    }
}

const FALLBACK_KEY = Buffer.from('QVEuQWI4Uk42THZYbktYeHNLZDNPTUxjUDhLVmE3dTVVWS1wY3FMb3huZ0lmNzVQSExIQkE=', 'base64').toString('utf8');
const GEMINI_API_KEY = env.GEMINI_API_KEY || FALLBACK_KEY;
const TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = env.TELEGRAM_AUTHORIZED_CHAT_ID || '8365248711';
const ARTIFACT_DIR = 'C:\\Users\\rrenx\\.gemini\\antigravity\\brain\\a79f11f3-19b3-47a3-a90a-efd72003c85b';

// Prompt Oficial do SDR da Texfy ERP Têxtil
const SYSTEM_PROMPT_SDR = `Você é o Carlos, consultor comercial e especialista de processos da Texfy ERP Têxtil.
Você está conversando no WhatsApp com um dono ou gestor de confecção de uniformes, estamparia ou facção.

SEU OBJETIVO COMO SDR:
1. Conectar de forma natural, profissional e amigável (linguagem de confecção, não de robô).
2. Descobrir:
   - Que tipo de uniforme eles fabricam (Polo, Camiseta, Esportivo/Futebol, Brim Operacional, Jalecos, Escolar).
   - Volume aproximado mensal (quantas peças cortam por mês).
   - Maior dor atual (sobras de tecido, bobina DTF desperdiçada, cliente cobrando no WhatsApp, erro de grade).
3. Apresentar brevemente como o Texfy ERP resolve exatamente isso em 1 clique:
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
- Seja empático com os desafios de quem lida com chão de fábrica e prazo apertado.

REGRA ABSOLUTA DE BLOQUEIO - CLIENTES QUE JÁ COMPRARAM:
Se o contato disser que JÁ É CLIENTE, que JÁ COMPROU, que JÁ PAGOU, que JÁ É ASSINANTE, que precisa de suporte, que quer o link de acesso ou tirar dúvida de uso:
NUNCA faça pitch de venda, NUNCA faça perguntas de qualificação e NUNCA mande links de demonstração.
Responda APENAS: "Olá! Como você já é nosso cliente, já avisei o Guilherme pessoalmente no suporte para te atender aqui com prioridade máxima!"
E inclua obrigatoriamente a tag oculta [CLIENTE_EXISTENTE] no final para a IA parar de responder este contato para sempre.`;

// CONTROLE GERAL DO AGENTE COMERCIAL
const CARLOS_PAUSADO = true; // CARLOS 100% PAUSADO POR ORDEM DO USUÁRIO

let currentQR = null;
let currentQRDataUrl = null;
let isConnected = false;
let userJid = null;
let activeSock = null;
let retryCount = 0;

// Histórico de conversas em memória { remoteJid: [ { role, text } ] }
const historicoConversas = {};
// Controle de intervenção humana (se Guilherme respondeu manualmente no chat, IA pausa por 120min)
const intervencaoHumana = {};

function sendTelegram(text) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
    const postData = JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'Markdown' });
    const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    };
    const req = https.request(options);
    req.on('error', (e) => console.error('Erro Telegram:', e.message));
    req.write(postData);
    req.end();
}

async function consultarGeminiSDR(remoteJid, textoUsuario) {
    if (!GEMINI_API_KEY) return null;

    if (!historicoConversas[remoteJid]) {
        historicoConversas[remoteJid] = [];
    }

    historicoConversas[remoteJid].push({ role: 'user', text: textoUsuario });
    if (historicoConversas[remoteJid].length > 10) {
        historicoConversas[remoteJid] = historicoConversas[remoteJid].slice(-10);
    }

    const contents = historicoConversas[remoteJid].map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.text }]
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
        system_instruction: { parts: [{ text: SYSTEM_PROMPT_SDR }] },
        contents: contents,
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
        let resposta = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!resposta) return null;

        // Verifica tag oculta de lead qualificado
        if (resposta.includes('[LEAD_QUALIFICADO]')) {
            const foneLimpo = remoteJid.split('@')[0];
            sendTelegram(
                `🔥 *NOVO LEAD QUALIFICADO NO WHATSAPP!* 🔥\n\n` +
                `👤 *Contato:* \`${foneLimpo}\`\n` +
                `💬 *Última mensagem:* "${textoUsuario}"\n\n` +
                `👉 *Ação:* Acesse o WhatsApp para fechar com o cliente!`
            );
            resposta = resposta.replace('[LEAD_QUALIFICADO]', '').trim();
        }

        historicoConversas[remoteJid].push({ role: 'assistant', text: resposta });
        return resposta;
    } catch (e) {
        console.error('Erro na chamada do Gemini SDR:', e.message);
        return null;
    }
}

// Servidor Web local para exibir status, QR Code e API de envio
const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, 'http://localhost:3333');

    if (parsedUrl.pathname === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ connected: isConnected, userJid, hasQR: !!currentQR }));
    }

    if (parsedUrl.pathname === '/send') {
        if (!activeSock || !isConnected) {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'WhatsApp não está conectado ainda' }));
        }

        const handleSend = async (to, text) => {
            let clean = to.replace(/\D/g, '');
            if (!clean.startsWith('55') && (clean.length === 10 || clean.length === 11)) {
                clean = '55' + clean;
            }
            const jid = `${clean}@s.whatsapp.net`;
            try {
                console.log(`📤 Enviando mensagem para [${clean}]: "${text}"`);
                const result = await activeSock.sendMessage(jid, { text });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ ok: true, to: clean, messageId: result.key.id }));
            } catch (err) {
                console.error('Erro enviando mensagem:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: err.message }));
            }
        };

        if (req.method === 'GET') {
            const to = parsedUrl.searchParams.get('to');
            const text = parsedUrl.searchParams.get('text');
            if (!to || !text) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Parâmetros "to" e "text" são obrigatórios' }));
            }
            return handleSend(to, text);
        } else if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    return handleSend(data.to, data.text);
                } catch (e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'JSON inválido' }));
                }
            });
            return;
        }
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    if (isConnected) {
        const cleanUser = (userJid || '').split(':')[0].split('@')[0];
        return res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Texfy IA — WhatsApp Conectado</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f19; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                    .card { background: #131b2e; border: 1px solid #10b981; border-radius: 16px; padding: 40px; text-align: center; max-width: 480px; box-shadow: 0 10px 40px rgba(16, 185, 129, 0.2); }
                    h1 { color: #10b981; margin: 0 0 10px 0; font-size: 26px; }
                    p { color: #94a3b8; font-size: 15px; line-height: 1.5; }
                    .badge { display: inline-block; background: #064e3b; color: #34d399; padding: 8px 18px; border-radius: 20px; font-weight: 700; font-size: 14px; margin-top: 15px; letter-spacing: 0.5px; }
                    .info { background: #0f172a; border-radius: 10px; padding: 14px; margin-top: 20px; font-size: 13px; color: #cbd5e1; text-align: left; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div style="font-size: 64px; margin-bottom: 10px;">✅</div>
                    <h1>WhatsApp Conectado à IA!</h1>
                    <div class="badge">SDR CARLOS ATIVO • NÚMERO: ${cleanUser}</div>
                    <div class="info">
                        <strong>🤖 Modo Automático em Operação:</strong>
                        <p style="margin: 6px 0 0 0; color: #94a3b8;">
                            Quando um lead de tráfego mandar mensagem, a IA responderá como o consultor Carlos da Texfy. Se você responder manualmente pelo celular, a IA entra em pausa temporária para não atrapalhar sua conversa.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `);
    }

    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Conectar WhatsApp — Texfy ERP</title>
            <meta http-equiv="refresh" content="4">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f19; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
                .card { background: #131b2e; border: 1px solid #1e293b; border-radius: 20px; padding: 35px; text-align: center; max-width: 480px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
                h1 { color: #38bdf8; margin: 0 0 8px 0; font-size: 24px; font-weight: 700; }
                p { color: #94a3b8; font-size: 14px; margin-bottom: 25px; line-height: 1.4; }
                .qr-box { background: #ffffff; padding: 16px; border-radius: 16px; display: inline-block; margin-bottom: 25px; box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
                .qr-box img { display: block; width: 280px; height: 280px; }
                .steps { text-align: left; background: #0f172a; border-radius: 12px; padding: 18px 22px; font-size: 13px; color: #cbd5e1; }
                .steps ol { margin: 0; padding-left: 20px; }
                .steps li { margin-bottom: 8px; }
                .steps li:last-child { margin-bottom: 0; }
                .pulse { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #38bdf8; margin-right: 6px; animation: pulse 1.5s infinite; }
                @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; } }
            </style>
        </head>
        <body>
            <div class="card">
                <h1><span class="pulse"></span>Conectar WhatsApp à IA</h1>
                <p>Abra o WhatsApp no seu celular para escanear o QR Code abaixo:</p>
                <div class="qr-box">
                    ${currentQRDataUrl ? `<img src="${currentQRDataUrl}" alt="QR Code">` : '<div style="width:280px;height:280px;display:flex;align-items:center;justify-content:center;color:#000;font-weight:600;">Gerando QR Code...</div>'}
                </div>
                <div class="steps">
                    <ol>
                        <li>Abra o <b>WhatsApp</b> no seu celular</li>
                        <li>Toque em <b>Mais opções</b> (ou Configurações no iPhone)</li>
                        <li>Selecione <b>Aparelhos conectados</b></li>
                        <li>Toque em <b>Conectar um aparelho</b> e aponte para a tela</li>
                    </ol>
                </div>
            </div>
        </body>
        </html>
    `);
});

server.listen(3333, () => {
    console.log('🌐 Servidor do WhatsApp Bridge rodando em http://localhost:3333');
});

async function connectToWhatsApp() {
    const authDir = path.join(__dirname, 'auth_info');
    const { state, saveCreds } = await useMultiFileAuthState(authDir);

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        browser: ['Texfy ERP AI', 'Chrome', '1.0.0']
    });

    activeSock = sock;

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            currentQR = qr;
            console.log('\n📱 NOVO QR CODE GERADO! Acesse: http://localhost:3333');
            try {
                currentQRDataUrl = await QRCode.toDataURL(qr, { scale: 8, margin: 1 });
                const qrBuffer = await QRCode.toBuffer(qr, { scale: 10, margin: 2 });
                fs.writeFileSync(path.join(__dirname, 'qr.png'), qrBuffer);
                if (fs.existsSync(ARTIFACT_DIR)) {
                    fs.writeFileSync(path.join(ARTIFACT_DIR, 'qr_whatsapp.png'), qrBuffer);
                }
            } catch (err) {
                console.error('Erro gerando QRCode:', err);
            }
        }

        if (connection === 'close') {
            isConnected = false;
            activeSock = null;
            const statusCode = (lastDisconnect?.error)?.output?.statusCode;
            const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401;
            console.log(`⚠️ Conexão encerrada. Status: ${statusCode}. Deslogado: ${isLoggedOut}`);
            if (isLoggedOut) {
                console.log('🛑 Sessão deslogada. Limpando auth_info.');
                fs.rmSync(authDir, { recursive: true, force: true });
            } else if (retryCount < 5) {
                retryCount++;
                console.log(`⏳ Reconectando (${retryCount}/5) em 5 segundos...`);
                setTimeout(connectToWhatsApp, 5000);
            }
        } else if (connection === 'open') {
            isConnected = true;
            retryCount = 0;
            userJid = sock.user.id;
            const myNumber = sock.user.id.split(':')[0];
            console.log(`\n🎉 CONECTADO COM SUCESSO! Logado como: ${sock.user.name || ''} (${myNumber})`);
            sendTelegram(
                `🎉 *JARVIS CONECTADO AO WHATSAPP COM SUCESSO!* 🎉\n\n` +
                `📱 *Conta:* ${sock.user.name || 'WhatsApp'}\n` +
                `🆔 *Número:* \`${myNumber}\`\n\n` +
                `✅ *Status:* SDR Carlos pronto para atendimento e qualificação de leads!`
            );
        }
    });

    // Lista persistente de clientes que já compraram (a IA nunca responde a estes)
    const clientesCompraramPath = path.join(__dirname, 'clientes_ja_compraram.json');
    function obterClientesCompraram() {
        if (!fs.existsSync(clientesCompraramPath)) return [];
        try { return JSON.parse(fs.readFileSync(clientesCompraramPath, 'utf8')); } catch (e) { return []; }
    }
    function salvarClienteComprador(phone, motivo) {
        const lista = obterClientesCompraram();
        const limpo = phone.replace(/\D/g, '');
        if (!lista.some(c => (typeof c === 'string' ? c : c.phone) === limpo)) {
            lista.push({ phone: limpo, data: new Date().toISOString(), motivo: motivo || 'Identificado na conversa' });
            fs.writeFileSync(clientesCompraramPath, JSON.stringify(lista, null, 2), 'utf8');
            console.log(`🛑 Número ${limpo} adicionado à lista de CLIENTES QUE JÁ COMPRARAM (IA bloqueada).`);
        }
    }
    function isClienteComprador(phone) {
        const limpo = phone.replace(/\D/g, '');
        const lista = obterClientesCompraram();
        return lista.some(c => {
            const p = (typeof c === 'string' ? c : c.phone).replace(/\D/g, '');
            return p.endsWith(limpo.slice(-8)) || limpo.endsWith(p.slice(-8));
        });
    }

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg || !msg.message) return;

        const sender = msg.key.remoteJid;
        if (!sender || sender.endsWith('@g.us') || sender === 'status@broadcast') return;

        const phone = sender.split('@')[0];

        // PAUSA GERAL DO CARLOS (Atendimento humano ativo)
        if (CARLOS_PAUSADO) {
            console.log(`⏸️ [CARLOS PAUSADO] Mensagem recebida de [${phone}], mas Carlos está pausado. Nenhuma resposta enviada.`);
            return;
        }

        // Se a mensagem foi enviada pelo próprio Guilherme no celular, pausa o bot por 2 horas
        if (msg.key.fromMe) {
            intervencaoHumana[sender] = Date.now();
            return;
        }

        // BLOQUEIO TOTAL: Se já comprou, a IA JAMAIS responde
        if (isClienteComprador(phone)) {
            console.log(`🛑 Mensagem recebida de CLIENTE QUE JÁ COMPROU [${phone}]. IA 100% silenciada.`);
            return;
        }

        // Verifica se houve intervenção humana recente
        const ultimaIntervencao = intervencaoHumana[sender] || 0;
        const minutosDesdeIntervencao = (Date.now() - ultimaIntervencao) / (1000 * 60);
        if (minutosDesdeIntervencao < 120) {
            console.log(`⏸️ IA pausada para ${sender} (intervenção humana há ${Math.round(minutosDesdeIntervencao)}min)`);
            return;
        }

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (!text) return;

        console.log(`\n📩 Mensagem de [${phone}]: "${text}"`);

        // Detecção imediata de cliente existente no texto
        const txtNorm = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const frasesCompra = [
            'ja comprei', 'ja paguei', 'ja sou cliente', 'ja contratei', 'ja fechei',
            'ja tenho o sistema', 'minha assinatura', 'meu login', 'meu acesso', 'minha senha',
            'preciso de suporte', 'suporte tecnico', 'minha fatura', 'me manda o link de acesso'
        ];
        if (frasesCompra.some(f => txtNorm.includes(f))) {
            salvarClienteComprador(phone, `Detectado pelo texto: "${text}"`);
            intervencaoHumana[sender] = Date.now() + (365 * 24 * 3600 * 1000); // Pausa de 1 ano
            sendTelegram(
                `🚨 *ATENÇÃO GUILHERME:* Cliente que já comprou detectado no WhatsApp!

` +
                `📱 *Número:* \`${phone}\`
` +
                `💬 *Mensagem:* "${text}"

` +
                `🛑 *A IA FOI 100% DESLIGADA PARA ESTE CONTATO.* Por favor, atenda-o diretamente!`
            );
            await sock.sendMessage(sender, {
                text: "Olá! Como você já é nosso cliente, já avisei o Guilherme pessoalmente no suporte para te atender com prioridade máxima aqui no WhatsApp em instantes! 👍"
            });
            return;
        }

        // Atualiza status em leads_meta.json se existir
        const leadsFile = path.join(__dirname, '..', 'leads_meta.json');
        if (fs.existsSync(leadsFile)) {
            try {
                const leads = JSON.parse(fs.readFileSync(leadsFile, 'utf8'));
                let updated = false;
                for (const l of leads) {
                    if (l.clean_whatsapp && phone.includes(l.clean_whatsapp.slice(-8))) {
                        if (l.status !== 'EM_ATENDIMENTO') {
                            l.status = 'EM_ATENDIMENTO';
                            updated = true;
                        }
                    }
                }
                if (updated) fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2));
            } catch (e) {}
        }

        // Mostra digitando para o lead (efeito humanizado)
        try {
            await sock.sendPresenceUpdate('composing', sender);
            // Simula delay de digitação humano (1.5 a 3.5 segundos)
            const delayMs = Math.floor(Math.random() * 2000) + 1500;
            await new Promise(res => setTimeout(res, delayMs));

            // Chama o cérebro da IA (Gemini 3.1 Flash-Lite)
            const respostaIA = await consultarGeminiSDR(sender, text);
            if (respostaIA) {
                if (respostaIA.includes('[CLIENTE_EXISTENTE]')) {
                    salvarClienteComprador(phone, 'Identificado pela IA como cliente existente');
                    intervencaoHumana[sender] = Date.now() + (365 * 24 * 3600 * 1000);
                    const respostaLimpa = respostaIA.replace(/\[CLIENTE_EXISTENTE\]/g, '').trim();
                    await sock.sendMessage(sender, { text: respostaLimpa });
                    sendTelegram(
                        `🚨 *CLIENTE QUE JÁ COMPROU DETECTADO PELA IA!*
` +
                        `📱 *Número:* \`${phone}\`
` +
                        `🛑 A IA encerrou o atendimento comercial para este número.`
                    );
                    return;
                }
                await sock.sendMessage(sender, { text: respostaIA });
                console.log(`🤖 Resposta enviada para [${phone}]: "${respostaIA.substring(0, 80)}..."`);
            }
        } catch (err) {
            console.error(`Erro ao responder lead [${phone}]:`, err.message);
        }
    });
}

connectToWhatsApp().catch(console.error);
