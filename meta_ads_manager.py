"""
Meta Ads Autonomous Manager - Texfy
Gerenciador 100% automatizado de tráfego pago para Meta Ads (Facebook & Instagram).
"""
import os
import sys
import json
import urllib.request
import urllib.parse
from pathlib import Path

# Suporte total a caracteres UTF-8 no terminal Windows
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Carrega credenciais do .env
def carregar_env():
    env_path = Path(__file__).parent / '.env'
    config = {}
    if env_path.exists():
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    config[k.strip()] = v.strip()
    return config

ENV = carregar_env()
TOKEN = ENV.get('META_ACCESS_TOKEN')
API_VERSION = 'v21.0'
BASE_URL = f'https://graph.facebook.com/{API_VERSION}'

def meta_request(endpoint, method='GET', data=None, params=None):
    if params is None:
        params = {}
    params['access_token'] = TOKEN

    query_str = urllib.parse.urlencode(params)
    url = f'{BASE_URL}/{endpoint}?{query_str}'

    req_data = None
    if data and method in ['POST', 'PUT']:
        req_data = urllib.parse.urlencode(data).encode('utf-8')

    req = urllib.request.Request(url, data=req_data, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        try:
            err_json = json.loads(err_body)
            print(f"[Meta API Error {e.code}]:", json.dumps(err_json, indent=2, ensure_ascii=False))
            return err_json
        except Exception:
            print(f"[Meta API Error {e.code}]:", err_body)
            return {'error': {'message': err_body, 'code': e.code}}
    except Exception as e:
        print("[Network Error]:", str(e))
        return {'error': {'message': str(e)}}

def listar_contas():
    res = meta_request('me', params={'fields': 'id,name,adaccounts{id,name,account_status,currency,amount_spent},accounts{id,name}'})
    return res

def listar_campanhas(ad_account_id):
    if not ad_account_id.startswith('act_'):
        ad_account_id = f'act_{ad_account_id}'
    res = meta_request(f'{ad_account_id}/campaigns', params={
        'fields': 'id,name,status,objective,daily_budget,lifetime_budget,created_time'
    })
    return res

def obter_metricas(ad_account_id, date_preset='last_7d'):
    if not ad_account_id.startswith('act_'):
        ad_account_id = f'act_{ad_account_id}'
    res = meta_request(f'{ad_account_id}/insights', params={
        'fields': 'campaign_name,spend,impressions,clicks,cpc,ctr,actions',
        'date_preset': date_preset
    })
    return res

def pausar_campanha(campaign_id):
    res = meta_request(campaign_id, method='POST', data={'status': 'PAUSED'})
    return res

def ativar_campanha(campaign_id):
    res = meta_request(campaign_id, method='POST', data={'status': 'ACTIVE'})
    return res

def upload_imagem(ad_account_id, image_path):
    import mimetypes
    if not ad_account_id.startswith('act_'):
        ad_account_id = f'act_{ad_account_id}'
    
    with open(image_path, 'rb') as f:
        img_bytes = f.read()

    # Upload multipart
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    body = bytearray()
    
    # Campo access_token
    body.extend(f'--{boundary}\r\nContent-Disposition: form-data; name="access_token"\r\n\r\n{TOKEN}\r\n'.encode('utf-8'))
    
    # Campo filename
    fname = os.path.basename(image_path)
    mime = mimetypes.guess_type(image_path)[0] or 'image/png'
    body.extend(f'--{boundary}\r\nContent-Disposition: form-data; name="filename"; filename="{fname}"\r\nContent-Type: {mime}\r\n\r\n'.encode('utf-8'))
    body.extend(img_bytes)
    body.extend(f'\r\n--{boundary}--\r\n'.encode('utf-8'))

    url = f'{BASE_URL}/{ad_account_id}/adimages'
    req = urllib.request.Request(url, data=body, method='POST')
    req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
    
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            images = data.get('images', {})
            for k, v in images.items():
                return v.get('hash')
            return data
    except Exception as e:
        print("[Upload Image Error]:", str(e))
        return None

def upload_video(ad_account_id, video_path, title="Texfy ERP - Pitch Guilherme"):
    """
    Faz upload de vídeo para a conta de anúncios da Meta usando o protocolo oficial Resumable Video Upload.
    Suporta arquivos grandes em chunks sem risco de timeout.
    """
    import time
    import requests

    if not ad_account_id.startswith('act_'):
        ad_account_id = f'act_{ad_account_id}'

    file_size = os.path.getsize(video_path)
    file_size_mb = file_size / (1024 * 1024)
    print(f"\n🎬 Iniciando upload de vídeo (Resumable): {video_path}")
    print(f"📦 Tamanho do arquivo: {file_size_mb:.2f} MB")

    url = f"{BASE_URL}/{ad_account_id}/advideos"

    # FASE 1: START
    print("⏳ [Fase 1/3] Iniciando sessão de upload na Meta...")
    start_payload = {
        'upload_phase': 'start',
        'file_size': file_size,
        'access_token': TOKEN
    }
    start_res = requests.post(url, data=start_payload, timeout=60).json()
    if 'error' in start_res:
        print("❌ Erro ao iniciar sessão de upload:", start_res)
        return None

    video_id = start_res.get('video_id')
    upload_session_id = start_res.get('upload_session_id')
    start_offset = int(start_res.get('start_offset', 0))
    end_offset = int(start_res.get('end_offset', 0))
    print(f"✓ Sessão iniciada! Video ID: {video_id} | Session ID: {upload_session_id}")

    # FASE 2: TRANSFER
    print("⏳ [Fase 2/3] Transferindo blocos (chunks) do vídeo...")
    with open(video_path, 'rb') as f:
        while start_offset < file_size:
            chunk_length = end_offset - start_offset
            f.seek(start_offset)
            chunk_data = f.read(chunk_length)
            
            percent = (start_offset / file_size) * 100
            print(f"   ⬆️ Enviando chunk: {start_offset / (1024*1024):.1f}MB a {end_offset / (1024*1024):.1f}MB ({percent:.1f}%)...")

            transfer_data = {
                'upload_phase': 'transfer',
                'upload_session_id': upload_session_id,
                'start_offset': start_offset,
                'access_token': TOKEN
            }
            files = {'video_file_chunk': ('chunk.mp4', chunk_data, 'application/octet-stream')}
            
            success = False
            for tentativa in range(3):
                try:
                    t_res = requests.post(url, data=transfer_data, files=files, timeout=120).json()
                    if 'error' in t_res:
                        print(f"⚠️ Erro no chunk, tentativa {tentativa+1}:", t_res)
                        time.sleep(2)
                        continue
                    start_offset = int(t_res.get('start_offset', file_size))
                    end_offset = int(t_res.get('end_offset', file_size))
                    success = True
                    break
                except Exception as e:
                    print(f"⚠️ Timeout no chunk, tentativa {tentativa+1}: {e}")
                    time.sleep(2)
            if not success:
                print("❌ Falha na transferência do bloco de vídeo.")
                return None

    # FASE 3: FINISH
    print("⏳ [Fase 3/3] Finalizando upload e registrando vídeo...")
    finish_data = {
        'upload_phase': 'finish',
        'upload_session_id': upload_session_id,
        'title': title,
        'description': 'Pitch Texfy ERP - Guilherme Silva',
        'access_token': TOKEN
    }
    finish_res = requests.post(url, data=finish_data, timeout=60).json()
    if 'error' in finish_res:
        print("❌ Erro ao finalizar vídeo:", finish_res)
        return None

    print(f"✓ Upload concluído com sucesso! Video ID: {video_id}")
    print("⏳ Aguardando renderização do vídeo pela Meta...")
    for i in range(25):
        time.sleep(4)
        c_url = f"{BASE_URL}/{video_id}?fields=status,picture&access_token={TOKEN}"
        c_res = requests.get(c_url).json()
        status_obj = c_res.get('status', {})
        v_status = status_obj.get('video_status')
        picture = c_res.get('picture')
        print(f"   [Status {i+1}/25]: {v_status}")
        if v_status == 'ready':
            print(f"✓ Vídeo 100% pronto para uso em anúncios! Thumbnail: {picture}")
            return {'video_id': video_id, 'picture': picture}

    return {'video_id': video_id, 'picture': None}

def criar_campanha_video_completa(
    ad_account_id,
    page_id,
    video_path,
    whatsapp_number,
    nome_campanha="[TEXFY ERP] Trafego WhatsApp - Video 1017",
    orcamento_diario_reais=30.0,
    instagram_id=None,
    video_id=None,
    thumbnail_url=None
):
    """
    Cria uma campanha de alta conversão em vídeo para WhatsApp:
    1. Campanha (Tráfego)
    2. Upload e processamento do vídeo (ou reuso do video_id existente)
    3. Ad Set com segmentação B2B (Confecções, Indústria Têxtil, Silk, DTF)
    4. Ad Creative com vídeo e link direto para WhatsApp
    5. Anúncio ativo
    """
    if not ad_account_id.startswith('act_'):
        ad_account_id = f'act_{ad_account_id}'

    # Normalizar número de WhatsApp
    clean_whats = ''.join(filter(str.isdigit, whatsapp_number))
    if not clean_whats.startswith('55'):
        clean_whats = f'55{clean_whats}'

    msg_whats = urllib.parse.quote("Olá Guilherme! Vi o vídeo do Texfy ERP e quero conhecer o sistema para minha confecção.")
    link_whatsapp = f"https://wa.me/{clean_whats}?text={msg_whats}"

    print(f"\n🚀 [1/5] Criando Campanha: {nome_campanha}...")
    camp_res = meta_request(f'{ad_account_id}/campaigns', method='POST', data={
        'name': nome_campanha,
        'objective': 'OUTCOME_TRAFFIC',
        'status': 'ACTIVE',
        'special_ad_categories': '[]',
        'is_adset_budget_sharing_enabled': 'false'
    })

    camp_id = camp_res.get('id')
    if not camp_id:
        print("❌ Falha ao criar campanha:", camp_res)
        return False
    print(f"✓ Campanha criada com sucesso! ID: {camp_id}")

    # 2. Upload / Obtenção do Vídeo
    if not video_id:
        video_id = ENV.get('META_VIDEO_ID')
    
    if not video_id:
        print(f"\n🎬 [2/5] Processando vídeo do pitch: {video_path}...")
        video_info = upload_video(ad_account_id, video_path, title="Texfy ERP - Pitch Fundador")
        if not video_info or not video_info.get('video_id'):
            print("❌ Falha ao carregar vídeo na Meta")
            return False
        video_id = video_info['video_id']
        thumbnail_url = video_info.get('picture')
    else:
        print(f"\n🎬 [2/5] Reutilizando vídeo já publicado na Meta: ID {video_id}")
        if not thumbnail_url:
            # Buscar thumbnail do vídeo existente
            v_data = meta_request(video_id, params={'fields': 'picture'})
            thumbnail_url = v_data.get('picture')
            print(f"✓ Thumbnail obtida: {thumbnail_url}")

    # 3. Conjunto de Anúncios (Ad Set)
    print(f"\n🎯 [3/5] Configurando Público-Alvo e Orçamento...")
    orcamento_centavos = int(orcamento_diario_reais * 100)

    # Segmentação B2B de Alta Conversão com Advantage+ Audience da Meta
    targeting = {
        'geo_locations': {
            'countries': ['BR']
        },
        'age_min': 23,
        'targeting_automation': {
            'advantage_audience': 1
        }
    }

    adset_payload = {
        'name': f'{nome_campanha} - Donos de Confecção / Têxtil (Advantage+)',
        'campaign_id': camp_id,
        'daily_budget': str(orcamento_centavos),
        'billing_event': 'IMPRESSIONS',
        'optimization_goal': 'LINK_CLICKS',
        'bid_strategy': 'LOWEST_COST_WITHOUT_CAP',
        'targeting': json.dumps(targeting),
        'status': 'ACTIVE'
    }

    adset_res = meta_request(f'{ad_account_id}/adsets', method='POST', data=adset_payload)
    adset_id = adset_res.get('id')

    if not adset_id:
        print("❌ Falha ao criar conjunto de anúncios:", adset_res)
        return False
    print(f"✓ Conjunto de anúncios criado! ID: {adset_id}")

    # 4. Criativo do Anúncio (Ad Creative com Vídeo)
    print(f"\n✍️ [4/5] Criando Criativo com Copy de Alta Conversão...")
    copy_texto = (
        "Você ainda perde horas tentando controlar sua confecção de uniformes em planilhas que não batem?\n\n"
        "O Texfy ERP foi desenhado exclusivamente para a realidade de quem fabrica uniformes, estampa e borda: "
        "ficha técnica completa, cálculo exato de custo por peça, controle de grade, faturamento e ordens de produção sem dor de cabeça.\n\n"
        "E o melhor: sem aquela taxa abusiva de R$ 15.000 de implantação que os sistemas engessados cobram.\n\n"
        "👉 Toque no botão abaixo e fale direto comigo no WhatsApp para agendar sua demonstração sem custo!"
    )

    titulo_anuncio = "Texfy ERP | O Sistema para Confecção de Uniformes"

    if not thumbnail_url:
        v_data = meta_request(video_id, params={'fields': 'picture'})
        thumbnail_url = v_data.get('picture')

    video_data = {
        'video_id': video_id,
        'image_url': thumbnail_url,
        'title': titulo_anuncio,
        'message': copy_texto,
        'call_to_action': {
            'type': 'LEARN_MORE',
            'value': {
                'link': link_whatsapp
            }
        }
    }

    object_story_spec = {
        'page_id': page_id,
        'video_data': video_data
    }
    if instagram_id:
        object_story_spec['instagram_actor_id'] = instagram_id

    creative_res = meta_request(f'{ad_account_id}/adcreatives', method='POST', data={
        'name': f'Criativo Video - {titulo_anuncio}',
        'object_story_spec': json.dumps(object_story_spec)
    })

    creative_id = creative_res.get('id')
    if not creative_id:
        print("❌ Falha ao criar criativo de vídeo:", creative_res)
        return False
    print(f"✓ Criativo de vídeo registrado com sucesso! ID: {creative_id}")

    # 5. Publicação do Anúncio
    print(f"\n📢 [5/5] Publicando Anúncio...")
    ad_res = meta_request(f'{ad_account_id}/ads', method='POST', data={
        'name': f'Anúncio Vídeo - Pitch Texfy ERP',
        'adset_id': adset_id,
        'creative': json.dumps({'creative_id': creative_id}),
        'status': 'ACTIVE'
    })

    ad_id = ad_res.get('id')
    if not ad_id:
        print("❌ Falha ao publicar anúncio:", ad_res)
        return False

    print(f"\n🎉 SUCESSO! Campanha de vídeo no ar!")
    print(f"🆔 ID da Campanha: {camp_id}")
    print(f"🆔 ID do Conjunto: {adset_id}")
    print(f"🆔 ID do Anúncio: {ad_id}")
    print(f"📲 Destino WhatsApp: {clean_whats}")
    print(f"📊 Orçamento Diário: R$ {orcamento_diario_reais:.2f}")
    return True

if __name__ == '__main__':
    args = sys.argv[1:]
    if not args or args[0] == 'status':
        print("\n🔍 Consultando status das contas Meta Ads...")
        dados = listar_contas()
        print(json.dumps(dados, indent=2, ensure_ascii=False))
    elif args[0] == 'metricas':
        act = args[1] if len(args) > 1 else 'act_26129932073302872'
        print(f"\n📊 Métricas da conta {act}:")
        print(json.dumps(obter_metricas(act), indent=2, ensure_ascii=False))
    elif args[0] == 'subir_video':
        # python meta_ads_manager.py subir_video [numero_whats] [orcamento] [video_path]
        whats = args[1] if len(args) > 1 else ENV.get('META_WHATSAPP_NUMBER', '554499856245')
        orc = float(args[2]) if len(args) > 2 else 30.0
        vpath = args[3] if len(args) > 3 else r'C:\Users\rrenx\Downloads\1017.mp4'
        act_id = ENV.get('META_AD_ACCOUNT_ID', 'act_2320262458814661')
        page_id = ENV.get('META_PAGE_ID', '320117504509859')
        vid_id = ENV.get('META_VIDEO_ID', '1630493205207764')
        criar_campanha_video_completa(
            act_id,
            page_id,
            vpath,
            whats,
            orcamento_diario_reais=orc,
            instagram_id=None,
            video_id=vid_id
        )

