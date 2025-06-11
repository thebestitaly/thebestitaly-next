#!/usr/bin/env python3
"""
Script per cancellare tutti i file della cartella destinations e reimportare tutto
"""

import os
import requests
import json
import time
from pathlib import Path
import mimetypes

# CONFIGURAZIONE
DIRECTUS_URL = 'https://directus-production-93f0.up.railway.app'
ACCESS_TOKEN = "1NtlZnWWAJ0phQWWxCMpRPWCfw3UcO_L"
IMAGES_DIR = "/Users/massimo/Documents/thebest/hugo/thebestscript/thebestitaly/importazione_directus/WIKI/images/destinations/_giafatte"
FOLDER_ID = "f433db10-4ad1-4a52-989f-253d074dfb18"  # ID della cartella destination su Directus

# Statistiche
uploaded_count = 0
deleted_count = 0
error_count = 0

def delete_all_files_in_folder(session, headers):
    """Cancella tutti i file dalla cartella destinations"""
    print("🗑️  CANCELLAZIONE file esistenti nella cartella destinations...")
    
    deleted = 0
    limit = 100
    
    while True:
        # Ottiene file della cartella
        params = {
            'filter[folder][_eq]': FOLDER_ID,
            'limit': limit,
            'fields': 'id,filename_download'
        }
        
        response = session.get(f"{DIRECTUS_URL}/files", headers=headers, params=params)
        
        if response.status_code != 200:
            print(f"❌ Errore nel recuperare file: {response.status_code}")
            break
            
        files = response.json().get('data', [])
        
        if not files:
            print("✅ Nessun file da cancellare")
            break
        
        print(f"🗑️  Trovati {len(files)} file da cancellare...")
        
        # Cancella ogni file
        for file_info in files:
            file_id = file_info['id']
            filename = file_info['filename_download']
            
            delete_response = session.delete(f"{DIRECTUS_URL}/files/{file_id}", headers=headers)
            
            if delete_response.status_code in [200, 204]:
                deleted += 1
                print(f"🗑️  Cancellato: {filename} ({deleted})")
            else:
                print(f"❌ Errore cancellazione {filename}: {delete_response.status_code}")
        
        # Pausa per non sovraccaricare
        time.sleep(0.5)
    
    print(f"🗑️  Cancellati {deleted} file totali")
    return deleted

def upload_image(file_path, session, headers):
    """Carica una singola immagine su Directus"""
    global uploaded_count, error_count
    
    filename = os.path.basename(file_path)
    
    try:
        with open(file_path, 'rb') as f:
            files = {
                'file': (filename, f, mimetypes.guess_type(file_path)[0] or 'image/webp')
            }
            
            data = {
                'folder': FOLDER_ID,
                'title': filename.replace('.webp', '').replace('_', ' ')
            }
            
            response = session.post(f"{DIRECTUS_URL}/files", headers=headers, files=files, data=data)
            
            if response.status_code in [200, 201]:
                uploaded_count += 1
                print(f"✅ Caricato: {filename} ({uploaded_count})")
                return True
            else:
                error_count += 1
                print(f"❌ Errore upload {filename}: {response.status_code}")
                return False
                
    except Exception as e:
        error_count += 1
        print(f"❌ Errore file {filename}: {str(e)}")
        return False

def main():
    print("🚀 PULIZIA E REIMPORTAZIONE IMMAGINI DESTINAZIONI")
    print(f"📁 Cartella locale: {IMAGES_DIR}")
    print(f"🎯 Directus: {DIRECTUS_URL}")
    print(f"📂 Folder ID: {FOLDER_ID}")
    
    # Prepara headers
    headers = {
        'Authorization': f'Bearer {ACCESS_TOKEN}'
    }
    
    # Testa il token
    print("\n🔐 Verifica token...")
    test_response = requests.get(f"{DIRECTUS_URL}/users/me", headers=headers)
    
    if test_response.status_code != 200:
        print(f"❌ Token non valido: {test_response.status_code}")
        return
    
    print("✅ Token valido!")
    
    # Conta file locali
    images_dir = Path(IMAGES_DIR)
    if not images_dir.exists():
        print(f"❌ Cartella non trovata: {IMAGES_DIR}")
        return
    
    image_files = list(images_dir.glob("*.webp"))
    total_files = len(image_files)
    print(f"📸 File locali da importare: {total_files}")
    
    # Conferma operazione
    print("\n⚠️  ATTENZIONE: Questa operazione:")
    print("   1. Cancellerà TUTTI i file dalla cartella destinations su Directus")
    print("   2. Reimporterà tutti i file dalla cartella locale")
    
    response = input(f"\n🤔 Vuoi procedere? (digita 'CONFERMA' per continuare): ")
    if response != 'CONFERMA':
        print("❌ Operazione annullata.")
        return
    
    # Crea sessione
    session = requests.Session()
    
    # FASE 1: Cancellazione
    print(f"\n🗑️  FASE 1: CANCELLAZIONE")
    deleted_count = delete_all_files_in_folder(session, headers)
    
    # Pausa tra cancellazione e upload
    print("\n💤 Pausa di 3 secondi...")
    time.sleep(3)
    
    # FASE 2: Reimportazione
    print(f"\n📤 FASE 2: REIMPORTAZIONE")
    print(f"Inizio upload di {total_files} file...")
    
    start_time = time.time()
    
    for i, image_file in enumerate(image_files, 1):
        print(f"\n[{i}/{total_files}] Processando: {image_file.name}")
        
        success = upload_image(str(image_file), session, headers)
        
        # Pausa ogni 10 file
        if i % 10 == 0:
            time.sleep(1)
            print(f"💤 Pausa... ({i}/{total_files} processati)")
    
    # Statistiche finali
    end_time = time.time()
    duration = end_time - start_time
    
    print(f"\n🏁 OPERAZIONE COMPLETATA!")
    print(f"🗑️  File cancellati: {deleted_count}")  
    print(f"✅ File caricati: {uploaded_count}")
    print(f"❌ Errori: {error_count}")
    print(f"⏱️  Tempo upload: {duration:.1f} secondi")
    if total_files > 0:
        print(f"📊 Media upload: {total_files/duration:.1f} file/sec")

if __name__ == "__main__":
    main() 