#!/usr/bin/env python3
"""
Script per importare tutte le immagini delle destinazioni in Directus
"""

import os
import requests
import json
import time
from pathlib import Path
import mimetypes

# CONFIGURAZIONE
DIRECTUS_URL = "https://directus-production-93f0.up.railway.app"
IMAGES_DIR = "/Users/massimo/Documents/thebest/hugo/thebestscript/thebestitaly/importazione_directus/WIKI/images/destinations/_giafatte"
FOLDER_ID = "f433db10-4ad1-4a52-989f-253d074dfb18"  # ID della cartella destination su Directus
ADMIN_EMAIL = "io@massimomorgante.it"  # INSERIRE EMAIL ADMIN
ADMIN_PASSWORD = "NuovaPassword123"  # INSERIRE PASSWORD ADMIN

# Statistiche
uploaded_count = 0
error_count = 0
skipped_count = 0

def get_auth_token():
    """Ottiene il token di autenticazione da Directus"""
    auth_url = f"{DIRECTUS_URL}/auth/login"
    
    payload = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    response = requests.post(auth_url, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        return data['data']['access_token']
    else:
        print(f"❌ Errore autenticazione: {response.status_code}")
        print(response.text)
        return None

def upload_image(file_path, token, session):
    """Carica una singola immagine su Directus"""
    global uploaded_count, error_count, skipped_count
    
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    # Estrae il nome del file
    filename = os.path.basename(file_path)
    
    # Controlla se il file esiste già
    check_url = f"{DIRECTUS_URL}/files"
    params = {
        'filter[filename_download][_eq]': filename,
        'limit': 1
    }
    
    check_response = session.get(check_url, headers=headers, params=params)
    
    if check_response.status_code == 200:
        existing_files = check_response.json().get('data', [])
        if existing_files:
            print(f"⏭️  File già esistente: {filename}")
            skipped_count += 1
            return True
    
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
            upload_url = f"{DIRECTUS_URL}/files"
            response = session.post(upload_url, headers=headers, files=files, data=data)
            
            if response.status_code in [200, 201]:
                uploaded_count += 1
                print(f"✅ Caricato: {filename} ({uploaded_count})")
                return True
            else:
                error_count += 1
                print(f"❌ Errore upload {filename}: {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                return False
                
    except Exception as e:
        error_count += 1
        print(f"❌ Errore file {filename}: {str(e)}")
        return False

def main():
    print("🚀 AVVIO IMPORTAZIONE IMMAGINI DESTINAZIONI")
    print(f"📁 Cartella: {IMAGES_DIR}")
    print(f"🎯 Directus: {DIRECTUS_URL}")
    print(f"📂 Folder ID: {FOLDER_ID}")
    
    # Verifica credenziali
    if not ADMIN_EMAIL or not ADMIN_PASSWORD:
        print("❌ ERRORE: Inserire EMAIL e PASSWORD admin nelle variabili!")
        print("Modifica lo script e aggiungi:")
        print("ADMIN_EMAIL = 'tua-email@example.com'")
        print("ADMIN_PASSWORD = 'tua-password'")
        return
    
    # Ottiene token di autenticazione
    print("\n🔐 Autenticazione...")
    token = get_auth_token()
    if not token:
        return
    
    print("✅ Autenticazione riuscita!")
    
    # Ottiene lista dei file
    print(f"\n📂 Scansione cartella...")
    images_dir = Path(IMAGES_DIR)
    
    if not images_dir.exists():
        print(f"❌ Cartella non trovata: {IMAGES_DIR}")
        return
    
    image_files = list(images_dir.glob("*.webp"))
    total_files = len(image_files)
    
    print(f"📸 Trovate {total_files} immagini da processare")
    
    if total_files == 0:
        print("❌ Nessuna immagine trovata!")
        return
    
    # Conferma prima di procedere
    response = input(f"\n🤔 Vuoi procedere con l'upload di {total_files} file? (y/N): ")
    if response.lower() != 'y':
        print("❌ Upload annullato.")
        return
    
    # Crea sessione persistente
    session = requests.Session()
    
    # Carica le immagini
    print(f"\n📤 Inizio upload...")
    start_time = time.time()
    
    for i, image_file in enumerate(image_files, 1):
        print(f"\n[{i}/{total_files}] Processando: {image_file.name}")
        
        success = upload_image(str(image_file), token, session)
        
        # Pausa breve per non sovraccaricare il server
        if i % 10 == 0:
            time.sleep(1)
            print(f"💤 Pausa... ({i}/{total_files} processati)")
    
    # Statistiche finali
    end_time = time.time()
    duration = end_time - start_time
    
    print(f"\n🏁 IMPORTAZIONE COMPLETATA!")
    print(f"✅ Caricati: {uploaded_count}")
    print(f"⏭️  Saltati (già esistenti): {skipped_count}")
    print(f"❌ Errori: {error_count}")
    print(f"⏱️  Tempo impiegato: {duration:.1f} secondi")
    print(f"📊 Media: {total_files/duration:.1f} file/sec")

if __name__ == "__main__":
    main() 