"""
Bravvi ERP — Jarvis SDR Manager (WhatsApp Cloud API & Prospecção Ativa)
Permite disparar templates de prospecção fria, simular o cérebro da IA e monitorar a qualidade do número.
"""

import os
import sys
import json
import requests

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
env = {}
if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                k, v = line.strip().split('=', 1)
                env[k] = v

META_TOKEN = env.get('WHATSAPP_TOKEN') or env.get('META_ACCESS_TOKEN')
PHONE_NUMBER_ID = env.get('WHATSAPP_PHONE_NUMBER_ID')
GEMINI_API_KEY = env.get('GEMINI_API_KEY')
TELEGRAM_BOT_TOKEN = env.get('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = env.get('TELEGRAM_AUTHORIZED_CHAT_ID', '8365248711')

SYSTEM_PROMPT = """Você é o Carlos, consultor comercial e especialista de processos da Bravvi ERP Têxtil.
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
- Seja empático com os desafios de quem lida com chão de fábrica e prazo apertado."""

def testar_resposta_ia(mensagem_usuario):
    print(f"\n📩 Mensagem recebida do lead: '{mensagem_usuario}'")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": [{"text": mensagem_usuario}]}],
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 400}
    }
    r = requests.post(url, json=payload, timeout=12).json()
    try:
        texto = r['candidates'][0]['content']['parts'][0]['text']
        print(f"\n🤖 Resposta da IA SDR:\n{texto}\n")
        if '[LEAD_QUALIFICADO]' in texto:
            print("🚨 [ALERTA DISPARADO]: Lead qualificado! O bot enviaria notificação para o Telegram do Guilherme.")
    except Exception as e:
        print(f"Erro ao chamar Gemini: {e}")
        print("Resposta bruta:", r)

def enviar_mensagem_whatsapp(numero_destino, texto):
    if not PHONE_NUMBER_ID or not META_TOKEN:
        print("❌ Erro: WHATSAPP_PHONE_NUMBER_ID ou META_ACCESS_TOKEN não configurados no .env")
        return False
    url = f"https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/messages"
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": numero_destino.replace('+', '').replace('-', '').replace(' ', ''),
        "type": "text",
        "text": {"preview_url": True, "body": texto}
    }
    headers = {"Authorization": f"Bearer {META_TOKEN}", "Content-Type": "application/json"}
    r = requests.post(url, json=payload, headers=headers).json()
    print("Resultado WhatsApp API:", json.dumps(r, indent=2))
    return r

def main():
    if len(sys.argv) < 2:
        print("""
USO DO JARVIS SDR MANAGER:
  python jarvis_sdr_manager.py test-ai "<mensagem do lead>"
  python jarvis_sdr_manager.py send "<numero>" "<texto>"
  python jarvis_sdr_manager.py status
        """)
        return

    cmd = sys.argv[1].lower()
    if cmd == 'test-ai':
        msg = sys.argv[2] if len(sys.argv) > 2 else "Olá, vi o anúncio. Quanto custa o sistema de vocês?"
        testar_resposta_ia(msg)
    elif cmd == 'send':
        if len(sys.argv) < 4:
            print("Informe o número e o texto. Ex: python jarvis_sdr_manager.py send 5544999998888 'Olá!'")
            return
        enviar_mensagem_whatsapp(sys.argv[2], sys.argv[3])
    elif cmd == 'status':
        print(f"Phone ID: {PHONE_NUMBER_ID or 'Aguardando configuração'}")
        print(f"Meta Token: {'Configurado' if META_TOKEN else 'Não configurado'}")
        print(f"Gemini Key: {'Configurada' if GEMINI_API_KEY else 'Não configurada'}")
        print(f"Telegram Bot: {'Configurado' if TELEGRAM_BOT_TOKEN else 'Não configurado'}")

if __name__ == '__main__':
    main()
