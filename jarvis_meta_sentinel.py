"""
Jarvis Meta Sentinel - Agente Autônomo de Monitoramento e Otimização da Texfy ERP
Executa auditoria das campanhas, detecta anomalias e propõe/aplica ações corretivas.
"""

import os
import sys
import json
import requests
from datetime import datetime

def load_env():
    env = {}
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    k, v = line.strip().split('=', 1)
                    env[k] = v
    return env

def run_audit():
    env = load_env()
    token = env.get('META_ACCESS_TOKEN')
    account_id = env.get('META_AD_ACCOUNT_ID')

    if not token or not account_id:
        return {"error": "Credenciais da Meta não encontradas no .env"}

    # 1. Obter status das campanhas
    url_camps = f"https://graph.facebook.com/v21.0/{account_id}/campaigns"
    params_camps = {
        'access_token': token,
        'fields': 'name,status,effective_status,objective,daily_budget'
    }
    r_camps = requests.get(url_camps, params=params_camps).json()

    # 2. Obter métricas de hoje
    url_insights = f"https://graph.facebook.com/v21.0/{account_id}/insights"
    params_insights = {
        'access_token': token,
        'date_preset': 'today',
        'fields': 'spend,impressions,reach,clicks,cpc,ctr,actions'
    }
    r_insights = requests.get(url_insights, params=params_insights).json()

    # Se ainda for de madrugada e hoje não tiver gasto, pega 'yesterday' + 'today'
    data_today = r_insights.get('data', [])
    metrics = {
        'date': 'today',
        'spend': '0.00',
        'impressions': 0,
        'reach': 0,
        'clicks': 0,
        'cpc': '0.00',
        'ctr': '0.00',
        'actions': []
    }

    if data_today:
        row = data_today[0]
        metrics['spend'] = row.get('spend', '0.00')
        metrics['impressions'] = int(row.get('impressions', 0))
        metrics['reach'] = int(row.get('reach', 0))
        metrics['clicks'] = int(row.get('clicks', 0))
        metrics['cpc'] = row.get('cpc', '0.00')
        metrics['ctr'] = row.get('ctr', '0.00')
        metrics['actions'] = row.get('actions', [])
    else:
        # Puxa últimas 24h / yesterday para análise comparativa
        params_insights['date_preset'] = 'yesterday'
        r_yest = requests.get(url_insights, params=params_insights).json()
        if r_yest.get('data'):
            row = r_yest['data'][0]
            metrics['date'] = 'yesterday'
            metrics['spend'] = row.get('spend', '0.00')
            metrics['impressions'] = int(row.get('impressions', 0))
            metrics['reach'] = int(row.get('reach', 0))
            metrics['clicks'] = int(row.get('clicks', 0))
            metrics['cpc'] = row.get('cpc', '0.00')
            metrics['ctr'] = row.get('ctr', '0.00')
            metrics['actions'] = row.get('actions', [])

    # 3. Verificar posicionamento e auto-corrigir se o Meta tentar reativar Audience Network
    url_adsets = f"https://graph.facebook.com/v21.0/{account_id}/adsets"
    params_adsets = {
        'access_token': token,
        'fields': 'name,status,targeting,daily_budget'
    }
    r_adsets = requests.get(url_adsets, params=params_adsets).json()

    adsets_health = []
    actions_taken = []
    for adset in r_adsets.get('data', []):
        adset_id = adset.get('id')
        targeting = adset.get('targeting', {})
        platforms = targeting.get('publisher_platforms', [])
        
        # Guardrail 1: Se Audience Network for detectado, expulsa imediatamente
        if 'audience_network' in platforms or not platforms:
            targeting['publisher_platforms'] = ['facebook', 'instagram']
            if 'facebook_positions' in targeting:
                del targeting['facebook_positions']
            if 'instagram_positions' in targeting:
                del targeting['instagram_positions']
            
            requests.post(f"https://graph.facebook.com/v21.0/{adset_id}", data={
                'access_token': token,
                'targeting': json.dumps(targeting)
            })
            actions_taken.append(f"Auto-correção: Audience Network bloqueado no conjunto {adset.get('name')}")
            platforms = ['facebook', 'instagram']

        adsets_health.append({
            'name': adset.get('name'),
            'status': adset.get('status'),
            'platforms': platforms,
            'audience_network_blocked': True
        })

    return {
        'timestamp': datetime.now().isoformat(),
        'campaigns': r_camps.get('data', []),
        'metrics': metrics,
        'adsets_health': adsets_health,
        'actions_taken': actions_taken
    }

if __name__ == '__main__':
    result = run_audit()
    print(json.dumps(result, indent=2, ensure_ascii=False))
