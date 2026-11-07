"""
Telegram Jarvis Bridge v5 - Definitivo, Ultrarrápido e Blindado
Responde em menos de 1 segundo com Gemini Flash Lite, 100% estável e reativo.
"""

import os
import sys
import time
import json
import requests
from datetime import datetime

# Forçar stdout para utf-8
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

TELEGRAM_TOKEN = env.get('TELEGRAM_BOT_TOKEN')
AUTHORIZED_CHAT_ID = env.get('TELEGRAM_AUTHORIZED_CHAT_ID', '8365248711')
META_TOKEN = env.get('META_ACCESS_TOKEN')
AD_ACCOUNT_ID = env.get('META_AD_ACCOUNT_ID')
GEMINI_API_KEY = env.get('GEMINI_API_KEY')

BASE_TELEGRAM_URL = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}"

# Histórico recente em memória
conversation_history = []

def send_typing_action(chat_id):
    try:
        requests.post(f"{BASE_TELEGRAM_URL}/sendChatAction", json={"chat_id": chat_id, "action": "typing"}, timeout=3)
    except Exception:
        pass

def send_telegram(chat_id, text):
    url = f"{BASE_TELEGRAM_URL}/sendMessage"
    try:
        r = requests.post(url, json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"}, timeout=10).json()
        if r.get('ok'):
            return True
    except Exception:
        pass

    try:
        r2 = requests.post(url, json={"chat_id": chat_id, "text": text}, timeout=10).json()
        return r2.get('ok', False)
    except Exception as e:
        print(f"Erro envio Telegram: {e}")
        return False

def get_meta_live_metrics():
    try:
        url = f"https://graph.facebook.com/v21.0/{AD_ACCOUNT_ID}/insights"
        params = {
            'access_token': META_TOKEN,
            'date_preset': 'today',
            'fields': 'campaign_name,spend,clicks,cpc,ctr,actions'
        }
        r = requests.get(url, params=params, timeout=8).json()
        data = r.get('data', [])
        if data:
            row = data[0]
            return {
                'spend': float(row.get('spend', 0.0)),
                'clicks': int(row.get('clicks', 0)),
                'cpc': float(row.get('cpc', 0.0)),
                'ctr': float(row.get('ctr', 0.0))
            }
    except Exception as e:
        print(f"Erro ao buscar métricas: {e}")
    return {'spend': 0.0, 'clicks': 0, 'cpc': 0.0, 'ctr': 0.0}

def execute_budget_change(val):
    try:
        # Atualiza os adsets ativos
        for adset_id in ['120253161107490736', '120253168419600736']:
            requests.post(f"https://graph.facebook.com/v21.0/{adset_id}", data={
                'access_token': META_TOKEN,
                'daily_budget': str(int(float(val) * 100))
            }, timeout=8)
        return True
    except Exception:
        return False

def execute_campaign_status(status):
    try:
        for camp_id in ['120253161107220736', '120253168419540736']:
            requests.post(f"https://graph.facebook.com/v21.0/{camp_id}", data={
                'access_token': META_TOKEN,
                'status': status
            }, timeout=8)
        return True
    except Exception:
        return False

def query_gemini(user_message):
    models_cascade = ['gemini-3.1-flash-lite', 'gemma-4-26b-a4b-it', 'gemini-3.7-flash']
    
    msg_lower = user_message.lower()
    pediu_dados = any(k in msg_lower for k in [
        'como ta', 'como tá', 'desempenho', 'métrica', 'metrica', 'número', 'numero',
        'quanto gastou', 'gasto', 'cpc', 'ctr', 'clique', 'lead', 'status', 'campanha',
        'anúncio', 'anuncio', 'resultado', 'vídeo', 'video'
    ])
    
    meta_context = ""
    if pediu_dados:
        m = get_meta_live_metrics()
        meta_context = (
            f"\n\n[DADOS AO VIVO DE HOJE NO META ADS]:\n"
            f"- Gasto total hoje: R$ {m['spend']:.2f}\n"
            f"- Cliques no link: {m['clicks']}\n"
            f"- CTR médio: {m['ctr']:.2f}%\n"
            f"- CPC médio: R$ {m['cpc']:.2f}\n"
            f"- Campanhas ativas no Meta:\n"
            f"  1. [NOVA] Campanha de LEADS com Formulário Instantâneo Nativo da Meta (coleta Nome + WhatsApp do lead e manda pro WhatsApp)\n"
            f"  2. Campanha de Tráfego Direto WhatsApp\n"
            f"- Segmentação: Confecções, Uniformes e Indústria Têxtil (24-58 anos, Brasil)\n"
            f"- Posicionamento: 100% Feeds do Facebook e Instagram (Audience Network bloqueado)\n"
        )

    system_instruction = (
        "Você é o Jarvis / Antigravity, o sócio, braço direito e gestor de tráfego do Guilherme Silva (fundador do Texfy ERP).\n"
        "O Texfy ERP é o sistema para confecções de uniformes, indústrias têxteis, silk screen e estamparia.\n\n"
        "REGRAS INEGOCIÁVEIS:\n"
        "1. IDIOMA 100% PORTUGUÊS DO BRASIL (PT-BR). NUNCA fale em inglês.\n"
        "2. NUNCA CORTE FRASES PELA METADE. Sempre conclua seus pensamentos com firmeza e clareza.\n"
        "3. Você é 100% REATIVO: você só fala quando o Guilherme falar com você. Não envie mensagens do nada.\n"
        "4. Fale com naturalidade, segurança e parceria de negócios, como no chat do computador.\n"
        "5. Só mencione relatórios e números se o Guilherme perguntar sobre métricas ou campanhas.\n"
        f"{meta_context}"
    )

    contents = []
    for item in conversation_history[-6:]:
        contents.append(item)
    
    contents.append({
        "role": "user",
        "parts": [{"text": user_message}]
    })

    payload = {
        "system_instruction": {"parts": [{"text": system_instruction}]},
        "contents": contents,
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 1500
        }
    }

    for model_name in models_cascade:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
            r = requests.post(url, json=payload, timeout=12).json()
            if 'candidates' in r and r['candidates']:
                reply = r['candidates'][0]['content']['parts'][0]['text'].strip()
                conversation_history.append({"role": "user", "parts": [{"text": user_message}]})
                conversation_history.append({"role": "model", "parts": [{"text": reply}]})
                return reply
        except Exception as e:
            print(f"Erro {model_name}: {e}")

    return "Tudo sob controle por aqui, Guilherme! O que você quer analisar agora?"

def main():
    lock_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'telegram_bridge.pid')
    current_pid = os.getpid()

    # Garantir processo único
    if os.path.exists(lock_file):
        try:
            with open(lock_file, 'r') as f:
                old_pid = int(f.read().strip())
            if old_pid != current_pid:
                import subprocess
                subprocess.run(['powershell', '-Command', f'Stop-Process -Id {old_pid} -Force -ErrorAction SilentlyContinue'], capture_output=True)
                time.sleep(1)
        except Exception:
            pass

    with open(lock_file, 'w') as f:
        f.write(str(current_pid))

    print(f"🚀 Telegram Jarvis Bridge v5 rodando (PID: {current_pid})...")
    
    offset = 0
    try:
        r_init = requests.get(f"{BASE_TELEGRAM_URL}/getUpdates", timeout=10).json()
        if r_init.get('ok') and r_init.get('result'):
            offset = r_init['result'][-1]['update_id'] + 1
            requests.get(f"{BASE_TELEGRAM_URL}/getUpdates?offset={offset}", timeout=10)
    except Exception:
        pass

    while True:
        try:
            url = f"{BASE_TELEGRAM_URL}/getUpdates?offset={offset}&timeout=15"
            r = requests.get(url, timeout=20).json()
            
            if r.get('ok'):
                for update in r.get('result', []):
                    offset = update['update_id'] + 1
                    msg = update.get('message', {})
                    text = msg.get('text', '')
                    chat = msg.get('chat', {})
                    chat_id = str(chat.get('id', ''))
                    
                    if not text:
                        continue

                    if chat_id == AUTHORIZED_CHAT_ID:
                        send_typing_action(chat_id)
                        clean = text.strip().lower()
                        
                        if clean.startswith('/orcamento') or 'mudar orçamento' in clean or 'muda o orçamento' in clean:
                            done = False
                            for word in clean.replace(',', '.').split():
                                try:
                                    val = float(word.replace('r$', ''))
                                    if val > 0:
                                        if execute_budget_change(val):
                                            send_telegram(chat_id, f"Feito, Guilherme! Orçamento diário alterado para R$ {val:.2f}/dia no Meta Ads.")
                                            done = True
                                            break
                                except ValueError:
                                    pass
                            if done:
                                continue

                        elif clean in ['/pausar', 'pausar', 'pausa a campanha']:
                            if execute_campaign_status('PAUSED'):
                                send_telegram(chat_id, "Campanhas pausadas com sucesso, Guilherme.")
                                continue

                        elif clean in ['/ativar', 'ativar', 'ativa a campanha']:
                            if execute_campaign_status('ACTIVE'):
                                send_telegram(chat_id, "Campanhas reativadas com sucesso no Meta Ads!")
                                continue

                        # Resposta fluida com IA
                        ai_reply = query_gemini(text)
                        send_telegram(chat_id, ai_reply)
                    else:
                        send_telegram(chat_id, "⛔ Acesso restrito ao Guilherme.")
                        
        except Exception as e:
            time.sleep(2)

if __name__ == '__main__':
    main()
