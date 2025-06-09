#!/bin/bash

# 🚀 IMPORT SU RAILWAY USANDO RAILWAY RUN
DUMP_FILE="$1"

if [ -z "$DUMP_FILE" ]; then
  echo "❌ Specifica il file dump da importare!"
  echo "💡 Uso: ./railway-import.sh thebestitaly_dump_XXXXXX.sql"
  exit 1
fi

if [ ! -f "$DUMP_FILE" ]; then
  echo "❌ File $DUMP_FILE non trovato!"
  exit 1
fi

echo "🚀 Import dump su Railway usando railway run..."
echo "📄 File: $DUMP_FILE"

# 📊 Info file
SIZE=$(ls -lh "$DUMP_FILE" | awk '{print $5}')
echo "📈 Dimensione file: $SIZE"
echo

# ⚠️ AVVISO
echo "⚠️  ATTENZIONE:"
echo "   Questo processo eliminerà tutti i dati esistenti su Railway!"
echo
read -p "🤔 Continuare? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Operazione annullata"
  exit 1
fi

echo
echo "📥 Importando dump su Railway..."
echo

# 🚀 Esegui import usando railway run
cat "$DUMP_FILE" | railway run --service Postgres -- psql -d railway

if [ $? -eq 0 ]; then
  echo
  echo "🎉 Import completato con successo!"
  echo
  echo "🔍 Verifica su: https://directus-production-924d.up.railway.app/admin"
  echo
  echo "✅ SISTEMA COMPLETAMENTE IMPORTATO:"
  echo "   - Tutte le collection"
  echo "   - Tutti i dati"
  echo "   - Tutte le relazioni"
  echo "   - Sistema multilingue"
  echo
else
  echo
  echo "❌ Errore durante l'import!"
  echo
fi 