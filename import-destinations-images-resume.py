#!/usr/bin/env python3
"""
Script per riprendere l'importazione delle immagini delle destinazioni in Directus
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
error_count = 0
skipped_count = 0

def get_existing_files(session, headers):
    """Ottiene la lista di tutti i file già presenti su Directus"""
    print("📋 Recupero lista file esistenti su Directus...")
    
    existing_files = set()
    limit = 100
    offset = 0
    
    while True:
        params = {
            'limit': limit,
            'offset': offset,
            'fields': 'filename_download'
        }
        
        response = session.get(f"{DIRECTUS_URL}/files", headers=headers, params=params)
        
        if response.status_code != 200:
            print(f"❌ Errore nel recuperare file esistenti: {response.status_code}")
            break
            
        data = response.json().get('data', [])
        
        if not data:
            break
            
        for file_info in data:
            existing_files.add(file_info['filename_download'])
            
        offset += limit
        
        if len(data) < limit:
            break
    
    print(f"📁 Trovati {len(existing_files)} file già esistenti su Directus")
    return existing_files

def upload_image(file_path, session, headers):
    """Carica una singola immagine su Directus"""
    global uploaded_count, error_count, skipped_count
    
    # Estrae il nome del file
    filename = os.path.basename(file_path)
    
    # Prepara il file per l'upload
    try:
        with open(file_path, 'rb') as f:
            files = {
                'file': (filename, f, mimetypes.guess_type(file_path)[0] or 'image/webp')
            }
            
            data = {
                'folder': FOLDER_ID,
                'title': filename.replace('.webp', '').replace('_', ' ')
            }
            
            # Upload del file
            response = session.post(f"{DIRECTUS_URL}/files", headers=headers, files=files, data=data)
            
            if response.status_code in [200, 201]:
                uploaded_count += 1
                print(f"✅ Caricato: {filename} ({uploaded_count})")
                return True
            else:
                error_count += 1
                print(f"❌ Errore upload {filename}: {response.status_code}")
                if response.status_code != 413:  # Non mostrare response per file troppo grandi
                    print(f"   Response: {response.text[:200]}")
                return False
                
    except Exception as e:
        error_count += 1
        print(f"❌ Errore file {filename}: {str(e)}")
        return False

def main():
    print("🚀 RIPRENDO IMPORTAZIONE IMMAGINI DESTINAZIONI")
    print(f"📁 Cartella: {IMAGES_DIR}")
    print(f"🎯 Directus: {DIRECTUS_URL}")
    print(f"📂 Folder ID: {FOLDER_ID}")
    
    # Prepara headers con token
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
    
    # Ottiene lista dei file
    print(f"\n📂 Scansione cartella...")
    images_dir = Path(IMAGES_DIR)
    
    if not images_dir.exists():
        print(f"❌ Cartella non trovata: {IMAGES_DIR}")
        return
    
    image_files = list(images_dir.glob("*.webp"))
    total_files = len(image_files)
    
    print(f"📸 Trovate {total_files} immagini totali")
    
    # Crea sessione persistente
    session = requests.Session()
    
    # Ottiene file già esistenti
    existing_files = get_existing_files(session, headers)
    
    # Filtra file da caricare (solo quelli non esistenti)
    files_to_upload = []
    for image_file in image_files:
        if image_file.name not in existing_files:
            files_to_upload.append(image_file)
        else:
            skipped_count += 1
    
    remaining_files = len(files_to_upload)
    
    print(f"📤 File da caricare: {remaining_files}")
    print(f"⏭️  File già esistenti: {skipped_count}")
    
    if remaining_files == 0:
        print("🎉 Tutti i file sono già stati caricati!")
        return
    
    # Conferma prima di procedere
    response = input(f"\n🤔 Vuoi procedere con l'upload di {remaining_files} file rimanenti? (y/N): ")
    if response.lower() != 'y':
        print("❌ Upload annullato.")
        return
    
    # Carica le immagini rimanenti
    print(f"\n📤 Riprendo upload...")
    start_time = time.time()
    
    for i, image_file in enumerate(files_to_upload, 1):
        print(f"\n[{i}/{remaining_files}] Processando: {image_file.name}")
        
        success = upload_image(str(image_file), session, headers)
        
        # Pausa breve per non sovraccaricare il server
        if i % 10 == 0:
            time.sleep(1)
            print(f"💤 Pausa... ({i}/{remaining_files} processati)")
    
    # Statistiche finali
    end_time = time.time()
    duration = end_time - start_time
    
    print(f"\n🏁 IMPORTAZIONE COMPLETATA!")
    print(f"✅ Caricati ora: {uploaded_count}")
    print(f"⏭️  Già esistenti: {skipped_count}")
    print(f"❌ Errori: {error_count}")
    print(f"⏱️  Tempo impiegato: {duration:.1f} secondi")
    if remaining_files > 0:
        print(f"📊 Media: {remaining_files/duration:.1f} file/sec")

if __name__ == "__main__":
    main() 