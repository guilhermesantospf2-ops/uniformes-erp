import os
import json
import urllib.request

def pausar():
    env = {}
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                k, v = line.strip().split('=', 1)
                env[k] = v

    token = env.get('WHATSAPP_API_TOKEN') or env.get('META_ACCESS_TOKEN')
    waba_id = env.get('WHATSAPP_WABA_ID') or env.get('WHATSAPP_BUSINESS_ACCOUNT_ID')

    req = urllib.request.Request(
        f'https://graph.facebook.com/v21.0/{waba_id}/subscribed_apps',
        method='DELETE',
        headers={'Authorization': f'Bearer {token}'}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            res = json.loads(resp.read().decode('utf-8'))
            print('✓ CARLOS PAUSADO COM SUCESSO NA META:', res)
    except Exception as e:
        print('Erro ao pausar:', e)

if __name__ == '__main__':
    pausar()
