"""
Script dedicado para upload completo do vídeo 1017.mp4 via Resumable Video Upload API.
"""
import os
import sys
import time
import requests
from pathlib import Path

# Suporte total a UTF-8 no Windows
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Carregar .env
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
AD_ACCOUNT_ID = 'act_2320262458814661'
VIDEO_PATH = r'C:\Users\rrenx\Downloads\1017.mp4'
BASE_URL = 'https://graph.facebook.com/v21.0'

def upload():
    file_size = os.path.getsize(VIDEO_PATH)
    file_size_mb = file_size / (1024 * 1024)
    print(f"🎬 Iniciando Resumable Upload de {VIDEO_PATH} ({file_size_mb:.2f} MB)...", flush=True)

    url = f"{BASE_URL}/{AD_ACCOUNT_ID}/advideos"

    # FASE 1: START
    print("⏳ [1/3] Iniciando sessão...", flush=True)
    start_res = requests.post(url, data={
        'upload_phase': 'start',
        'file_size': file_size,
        'access_token': TOKEN
    }, timeout=60).json()

    if 'error' in start_res:
        print("❌ Erro no Start:", start_res, flush=True)
        return None

    video_id = start_res['video_id']
    upload_session_id = start_res['upload_session_id']
    start_offset = int(start_res.get('start_offset', 0))
    end_offset = int(start_res.get('end_offset', 0))
    print(f"✓ Sessão aberta! Video ID: {video_id} | Session ID: {upload_session_id}", flush=True)

    # FASE 2: TRANSFER
    print("⏳ [2/3] Transferindo chunks...", flush=True)
    with open(VIDEO_PATH, 'rb') as f:
        while start_offset < file_size:
            chunk_len = end_offset - start_offset
            f.seek(start_offset)
            chunk_data = f.read(chunk_len)
            pct = (start_offset / file_size) * 100
            print(f"   ⬆️ [{pct:5.1f}%] Enviando {chunk_len / (1024*1024):.1f} MB (Offset: {start_offset})...", flush=True)

            transfer_data = {
                'upload_phase': 'transfer',
                'upload_session_id': upload_session_id,
                'start_offset': start_offset,
                'access_token': TOKEN
            }
            files = {'video_file_chunk': ('chunk.mp4', chunk_data, 'application/octet-stream')}

            sucesso = False
            for tentativa in range(4):
                try:
                    res = requests.post(url, data=transfer_data, files=files, timeout=90).json()
                    if 'error' in res:
                        print(f"   ⚠️ Erro na tentativa {tentativa+1}: {res}", flush=True)
                        time.sleep(2)
                        continue
                    start_offset = int(res.get('start_offset', file_size))
                    end_offset = int(res.get('end_offset', file_size))
                    sucesso = True
                    break
                except Exception as e:
                    print(f"   ⚠️ Timeout tentativa {tentativa+1}: {e}", flush=True)
                    time.sleep(2)

            if not sucesso:
                print("❌ Falha crítica no envio do chunk.", flush=True)
                return None

    print("✓ [2/3] 100% dos bytes transferidos com sucesso!", flush=True)

    # FASE 3: FINISH
    print("⏳ [3/3] Finalizando e registrando o vídeo...", flush=True)
    finish_res = requests.post(url, data={
        'upload_phase': 'finish',
        'upload_session_id': upload_session_id,
        'title': 'Texfy ERP - Pitch Guilherme Silva',
        'description': 'Sistema para Confecção de Uniformes e Estamparia',
        'access_token': TOKEN
    }, timeout=60).json()

    if 'error' in finish_res:
        print("❌ Erro no Finish:", finish_res, flush=True)
        return None

    print(f"🎉 VÍDEO PUBLICADO NA BIBLIOTECA DA META! Video ID: {video_id}", flush=True)
    
    # Salvar video_id no .env para reuso
    env_content = Path(__file__).parent / '.env'
    with open(env_content, 'a', encoding='utf-8') as f:
        f.write(f"\nMETA_VIDEO_ID={video_id}\n")

    return video_id

if __name__ == '__main__':
    upload()
