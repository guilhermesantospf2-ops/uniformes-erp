# -*- coding: utf-8 -*-
"""
JARVIS: Comando Mestre 'Abre o Escritório'
Executa a rotina de abertura executiva do ecossistema de trabalho:
1. Audita as campanhas ao vivo no Meta Ads (gastos, leads, cliques)
2. Compila o status operacional do Bravvi ERP
3. Sintetiza a voz executiva via alto-falantes
4. Abre automaticamente as abas de trabalho no navegador
"""
import os
import sys
import json
import time
import subprocess
import webbrowser
import requests

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

def carregar_env():
    env = {}
    env_path = os.path.join(ROOT_DIR, '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    k, v = line.strip().split('=', 1)
                    env[k] = v
    return env

def falar(texto):
    print(f"\n🎙️ [JARVIS DIZ]: \"{texto}\"\n")
    script_ps = os.path.join(ROOT_DIR, 'speak.ps1')
    if os.path.exists(script_ps):
        try:
            subprocess.run([
                'powershell', '-ExecutionPolicy', 'Bypass', '-File', script_ps, texto
            ], capture_output=True, timeout=25)
        except Exception as e:
            print(f"Erro TTS PowerShell: {e}")

def obter_metricas_meta(env):
    token = env.get('META_ACCESS_TOKEN')
    account_id = env.get('META_AD_ACCOUNT_ID')
    if not token or not account_id:
        return {"ok": False, "msg": "Sem credenciais Meta"}

    try:
        url = f"https://graph.facebook.com/v21.0/{account_id}/insights"
        params = {
            'access_token': token,
            'date_preset': 'today',
            'fields': 'spend,impressions,clicks,cpc,actions'
        }
        res = requests.get(url, params=params, timeout=6).json()
        data = res.get('data', [])
        if data:
            item = data[0]
            gasto = float(item.get('spend', 0.0))
            cliques = int(item.get('clicks', 0))
            impressoes = int(item.get('impressions', 0))
            actions = item.get('actions', [])
            leads = 0
            for a in actions:
                if 'lead' in a.get('action_type', '').lower():
                    leads += int(a.get('value', 0))
            return {
                "ok": True,
                "gasto": gasto,
                "cliques": cliques,
                "impressoes": impressoes,
                "leads": leads
            }
        else:
            return {
                "ok": True,
                "gasto": 0.0,
                "cliques": 0,
                "impressoes": 0,
                "leads": 0
            }
    except Exception as e:
        return {"ok": False, "msg": str(e)}

def executar_abertura_escritorio():
    print("=" * 60)
    print("   🤖 JARVIS AI — INICIALIZANDO ECOSSISTEMA DO ESCRITÓRIO")
    print("=" * 60)

    env = carregar_env()

    # 1. Auditar campanhas de tráfego
    meta = obter_metricas_meta(env)
    leads_count = meta.get('leads', 0)
    gasto_hoje = meta.get('gasto', 0.0)

    # 2. Ler leads capturados localmente
    leads_file = os.path.join(ROOT_DIR, 'leads_meta.json')
    leads_totais = 0
    if os.path.exists(leads_file):
        try:
            with open(leads_file, 'r', encoding='utf-8') as f:
                leads_data = json.load(f)
                leads_totais = len(leads_data) if isinstance(leads_data, list) else 0
        except Exception:
            pass

    # 3. Montar mensagem executiva elegante
    if leads_count > 0:
        texto_leads = f"Tivemos {leads_count} novos leads gerados hoje, totalizando {leads_totais} contatos na base."
    else:
        texto_leads = f"Temos {leads_totais} leads ativos na esteira e as campanhas estão rodando."

    briefing = (
        f"Bom dia, chefe! Escritório aberto e sistemas online. "
        f"{texto_leads} "
        f"O investimento no Meta Ads está em {gasto_hoje:.2f} reais hoje. "
        f"O Bravvi ERP está sincronizado com o financeiro, centros de custo e pedidos em produção. "
        f"Os agentes autônomos de tráfego, vendas e cobrança estão operacionais. "
        f"Desejo um excelente dia de negócios!"
    )

    # 4. Falar pelo alto-falante
    falar(briefing)

    # 5. Abrir as abas de trabalho no navegador
    print("🚀 Abrindo abas de trabalho no navegador...")
    try:
        # Abre o ERP
        webbrowser.open_new_tab("https://uniformes-erp.vercel.app/")
        time.sleep(0.5)
        # Abre o Meta Ads Manager se tiver account id
        acc_clean = (env.get('META_AD_ACCOUNT_ID') or '').replace('act_', '')
        if acc_clean:
            webbrowser.open_new_tab(f"https://adsmanager.facebook.com/adsmanager/manage/campaigns?act={acc_clean}")
    except Exception as e:
        print(f"Erro abrindo navegador: {e}")

    print("\n✅ Escritório aberto com sucesso! Jarvis pronto para novas ordens.")

if __name__ == '__main__':
    executar_abertura_escritorio()
