"""
Jarvis Lead Sync - Sentinela Automática de Leads Meta Ads
Monitora a cada 60 segundos os formulários da Meta e envia alerta instantâneo no Telegram de qualquer novo lead que preencher o anúncio.
"""

import os
import sys
import time
import json
import urllib.request
from datetime import datetime

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

META_TOKEN = env.get('META_ACCESS_TOKEN')
TELEGRAM_TOKEN = env.get('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = env.get('TELEGRAM_AUTHORIZED_CHAT_ID', '8365248711')
AD_ID = '120253168424470736'

SEEN_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'seen_leads.json')

def load_seen():
    if os.path.exists(SEEN_FILE):
        try:
            with open(SEEN_FILE, 'r', encoding='utf-8') as f:
                return set(json.load(f))
        except Exception:
            return set()
    return set()

def save_seen(seen_set):
    with open(SEEN_FILE, 'w', encoding='utf-8') as f:
        json.dump(list(seen_set), f, indent=2)

def send_telegram(text):
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    payload = json.dumps({"chat_id": TELEGRAM_CHAT_ID, "text": text, "parse_mode": "Markdown"}).encode()
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    try:
        urllib.request.urlopen(req, timeout=10)
    except Exception as e:
        print(f"Erro Telegram: {e}")

def check_leads():
    seen = load_seen()
    url = f"https://graph.facebook.com/v21.0/{AD_ID}/leads?access_token={META_TOKEN}&limit=50"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=15) as res:
            data = json.loads(res.read().decode())
            leads = data.get('data', [])
            
            new_leads = []
            for l in leads:
                lid = l['id']
                if lid not in seen:
                    seen.add(lid)
                    new_leads.append(l)

            if new_leads:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] {len(new_leads)} novo(s) lead(s) detectado(s)!")
                save_seen(seen)
                for nl in new_leads:
                    nome = next((x['values'][0] for x in nl.get('field_data', []) if x['name'] == 'full_name'), 'Sem Nome')
                    tel = next((x['values'][0] for x in nl.get('field_data', []) if x['name'] == 'whatsapp_number'), '')
                    clean_tel = tel.replace('+', '').replace('-', '').replace(' ', '')
                    if not clean_tel.startswith('55') and len(clean_tel) in [10, 11]:
                        clean_tel = '55' + clean_tel

                    alerta = (
                        f"🚨 *NOVO LEAD DETECTADO NO FORMULÁRIO META!* 🚨\n\n"
                        f"👤 *Nome:* {nome}\n"
                        f"📱 *WhatsApp:* [{tel}](https://wa.me/{clean_tel})\n"
                        f"🕒 *Preenchido em:* {nl.get('created_time')}\n\n"
                        f"👉 [Clique aqui para abrir a conversa no WhatsApp](https://wa.me/{clean_tel})\n"
                        f"*(Aja rápido: o lead acabou de enviar o formulário e está com a dor fresca!)*"
                    )
                    send_telegram(alerta)
            else:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Checagem concluída: nenhum lead novo.")
    except Exception as e:
        print(f"Erro na checagem: {e}")

if __name__ == '__main__':
    print("Iniciando Jarvis Lead Sync...")
    check_leads()
