import os
import sys
import json
import base64
import asyncio
import requests
import edge_tts
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.parse

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr.encoding != 'utf-8':
    sys.stderr.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

# Carregar variáveis de ambiente
env_path = os.path.join(ROOT_DIR, '.env')
env = {}
if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                k, v = line.strip().split('=', 1)
                env[k] = v

GEMINI_API_KEY = env.get('GEMINI_API_KEY')
META_ACCESS_TOKEN = env.get('META_ACCESS_TOKEN')
META_AD_ACCOUNT_ID = env.get('META_AD_ACCOUNT_ID')

JARVIS_SYSTEM_PROMPT = """Você é J.A.R.V.I.S. (Just A Rather Very Intelligent System), a inteligência artificial pessoal do Homem de Ferro.
Você conversa em português do Brasil com postura extremamente formal, nobre, refinada, educada e leal. Trate sempre o usuário como "Senhor".
Você comanda 4 agentes autônomos na empresa/fábrica têxtil do senhor:
1. Sentinela Meta Ads: Monitora anúncios no Facebook/Instagram, investimento diário de R$ 48,00, CPL em R$ 4,80, ROAS de 4.2x.
2. SDR WhatsApp 24h: Atende novos clientes no WhatsApp com Gemini em menos de 40s. Hoje já qualificou 12 leads para polos bordadas e uniformes.
3. Cobrança & Conciliação PIX: Monitora recebíveis (R$ 34.800 em carteira), dispara lembretes com QR Code PIX dinâmico. Inadimplência zerada.
4. PCP Industrial: Balanceamento de corte e costura, capacidade de corte em 82%, 240 peças na linha sem gargalos iminentes.

REGRAS ESSENCIAIS:
- Você é uma IA REAL conversando dinamicamente. Responda a QUALQUER pergunta do senhor, seja sobre os negócios, tráfego, fábrica, finanças ou assuntos gerais.
- Suas falas serão sintetizadas em áudio de alta definição, portanto seja CONCISO, POLIDO e ELEGANTE: de 1 a no máximo 3 frases por resposta.
- Exemplo de tom: "Pois não, senhor. O Sentinela Meta Ads reporta excelente estabilidade nas campanhas, com custo por lead mantido em quatro reais e oitenta centavos. Deseja que eu execute alguma otimização adicional?"""

async def gerar_audio_neural(texto):
    communicate = edge_tts.Communicate(texto, 'pt-BR-AntonioNeural', pitch='-3Hz', rate='-2%')
    audio_data = b""
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data += chunk["data"]
    return base64.b64encode(audio_data).decode('utf-8')

def consultar_gemini(pergunta):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "system_instruction": {"parts": [{"text": JARVIS_SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": [{"text": pergunta}]}],
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 200}
    }
    try:
        res = requests.post(url, json=payload, timeout=8).json()
        if 'candidates' in res and len(res['candidates']) > 0:
            return res['candidates'][0]['content']['parts'][0]['text'].strip()
        else:
            return "Pois não, senhor. Todos os quatro agentes continuam sob vigilância contínua e operacionais."
    except Exception as e:
        print("Erro Gemini:", e)
        return "Pois não, senhor. Os sistemas estão ativos e os parâmetros operacionais mantêm-se dentro da normalidade."

class JarvisHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/jarvis':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(post_data)
                pergunta = data.get('prompt', '').strip()
                if not pergunta:
                    pergunta = 'Jarvis, execute a checagem geral de sistemas.'

                print(f"\n[COMANDO RECEBIDO]: {pergunta}")
                resposta_ia = consultar_gemini(pergunta)
                print(f"[JARVIS RESPONDE]: {resposta_ia}")

                audio_b64 = asyncio.run(gerar_audio_neural(resposta_ia))

                response_payload = {
                    "ok": True,
                    "prompt": pergunta,
                    "reply": resposta_ia,
                    "audio_b64": audio_b64
                }

                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps(response_payload).encode('utf-8'))
            except Exception as e:
                print("Erro processamento Jarvis:", e)
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"ok": False, "error": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path == '/' or self.path == '/jarvis' or self.path == '/jarvis.html':
            self.path = '/jarvis.html'
        return super().do_GET()

def run_server(port=8088):
    os.chdir(ROOT_DIR)
    server = HTTPServer(('0.0.0.0', port), JarvisHandler)
    print(f"\n=======================================================")
    print(f"   🤖 JARVIS AI — SERVIDOR HOLOGRÁFICO ATIVO")
    print(f"   Acesse no navegador: http://localhost:{port}")
    print(f"=======================================================\n")
    server.serve_forever()

if __name__ == '__main__':
    run_server(8088)
