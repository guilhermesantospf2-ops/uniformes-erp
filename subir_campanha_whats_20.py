"""
Script para Subir Campanha de WhatsApp - Texfy ERP (R$ 20,00/dia)
Usa o vídeo validado do fundador e direciona direto para o WhatsApp.
"""
import sys
import json
import urllib.parse
from pathlib import Path

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import meta_ads_manager

AD_ACCOUNT_ID = 'act_2320262458814661'
PAGE_ID = '320117504509859'
VIDEO_ID = '1630493205207764'
WHATSAPP_NUMBER = '5544999856245'
BUDGET_REAIS = 20.0

def verificar_status_conta():
    res = meta_ads_manager.meta_request(AD_ACCOUNT_ID, params={'fields': 'id,name,account_status,balance,currency'})
    status = res.get('account_status')
    balance = float(res.get('balance', 0)) / 100
    if status == 3:
        print(f"⚠️ ATENÇÃO: A conta de anúncios possui uma pendência financeira de R$ {balance:.2f}.")
        print("A Meta bloqueia criação e edição de anúncios até a liquidação desse valor.")
        return False, balance
    return True, balance

def subir_campanha():
    ok, balance = verificar_status_conta()
    if not ok:
        print(f"\n❌ Não é possível subir agora: Liquide os R$ {balance:.2f} no Gerenciador de Anúncios e execute novamente.")
        return False

    print(f"\n🚀 [1/3] Criando Campanha Tráfego WhatsApp (R$ {BUDGET_REAIS:.2f}/dia)...")
    camp_res = meta_ads_manager.meta_request(f'{AD_ACCOUNT_ID}/campaigns', method='POST', data={
        'name': f'[TEXFY ERP] WhatsApp Direto - Pitch Fundador (R$ {int(BUDGET_REAIS)}/dia)',
        'objective': 'OUTCOME_TRAFFIC',
        'status': 'ACTIVE',
        'special_ad_categories': '[]'
    })
    camp_id = camp_res.get('id')
    if not camp_id:
        print("❌ Erro ao criar campanha:", camp_res)
        return False
    print(f"✓ Campanha criada: ID {camp_id}")

    print("\n🎯 [2/3] Criando Conjunto de Anúncios com Público Campeão B2B...")
    targeting = {
        'geo_locations': {'countries': ['BR']},
        'age_min': 24,
        'age_max': 58,
        'targeting_automation': {'advantage_audience': 0},
        'flexible_spec': [
            {
                'interests': [
                    {'id': '6002923522121', 'name': 'Uniforme'},
                    {'id': '6002957337050', 'name': 'Indústria têxtil'},
                    {'id': '6003142329161', 'name': 'Costura (artesanato)'},
                    {'id': '6003342585787', 'name': 'Máquina de costura'},
                    {'id': '6003719177983', 'name': 'Impressão'}
                ]
            }
        ]
    }

    adset_res = meta_ads_manager.meta_request(f'{AD_ACCOUNT_ID}/adsets', method='POST', data={
        'name': f'[TEXFY ERP] B2B Confecções e Uniformes - R${int(BUDGET_REAIS)}',
        'campaign_id': camp_id,
        'daily_budget': str(int(BUDGET_REAIS * 100)),
        'billing_event': 'IMPRESSIONS',
        'optimization_goal': 'LINK_CLICKS',
        'bid_strategy': 'LOWEST_COST_WITHOUT_CAP',
        'targeting': json.dumps(targeting),
        'status': 'ACTIVE'
    })
    adset_id = adset_res.get('id')
    if not adset_id:
        print("❌ Erro ao criar conjunto de anúncios:", adset_res)
        return False
    print(f"✓ Conjunto criado: ID {adset_id}")

    print("\n✍️ [3/3] Criando Anúncio com Vídeo e Link Direto WhatsApp...")
    v_data = meta_ads_manager.meta_request(VIDEO_ID, params={'fields': 'picture'})
    thumb = v_data.get('picture')

    copy_text = (
        "Você ainda perde horas tentando controlar sua confecção de uniformes em planilhas que não batem?\n\n"
        "O Texfy ERP foi desenhado exclusivamente para a realidade de quem fabrica uniformes, estampa e borda: "
        "ficha técnica completa, cálculo exato de custo por peça, controle de grade, faturamento e ordens de produção sem dor de cabeça.\n\n"
        "E o melhor: sem aquela taxa abusiva de R$ 15.000 de implantação que os sistemas engessados cobram.\n\n"
        "👉 Toque no botão abaixo e fale direto comigo no WhatsApp para agendar sua demonstração sem custo!"
    )
    msg = urllib.parse.quote("Olá Guilherme! Vi o vídeo do Texfy ERP e quero conhecer o sistema para minha confecção.")
    wa_url = f"https://wa.me/{WHATSAPP_NUMBER}?text={msg}"

    creative_res = meta_ads_manager.meta_request(f'{AD_ACCOUNT_ID}/adcreatives', method='POST', data={
        'name': f'Criativo Video Pitch Fundador - R${int(BUDGET_REAIS)}',
        'object_story_spec': json.dumps({
            'page_id': PAGE_ID,
            'video_data': {
                'video_id': VIDEO_ID,
                'image_url': thumb,
                'title': 'Texfy ERP | O Sistema para Confecção de Uniformes',
                'message': copy_text,
                'call_to_action': {
                    'type': 'LEARN_MORE',
                    'value': {'link': wa_url}
                }
            }
        })
    })
    creative_id = creative_res.get('id')
    if not creative_id:
        print("❌ Erro ao criar criativo:", creative_res)
        return False

    ad_res = meta_ads_manager.meta_request(f'{AD_ACCOUNT_ID}/ads', method='POST', data={
        'name': '[TEXFY ERP] Vídeo Pitch Fundador - WhatsApp',
        'adset_id': adset_id,
        'creative': json.dumps({'creative_id': creative_id}),
        'status': 'ACTIVE'
    })
    ad_id = ad_res.get('id')
    if not ad_id:
        print("❌ Erro ao ativar anúncio:", ad_res)
        return False

    print(f"\n🎉 CAMPANHA PUBLICADA E ATIVADA COM SUCESSO!")
    print(f"🆔 Campanha: {camp_id}")
    print(f"🆔 Conjunto: {adset_id}")
    print(f"🆔 Anúncio: {ad_id}")
    print(f"💰 Orçamento: R$ {BUDGET_REAIS:.2f} / dia")
    print(f"📲 WhatsApp Destino: {WHATSAPP_NUMBER}")
    return True

if __name__ == '__main__':
    subir_campanha()

