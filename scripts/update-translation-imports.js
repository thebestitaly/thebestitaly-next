#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '..', 'src');

// Funzione per trovare tutti i file che importano getTranslations
function findFilesWithOldImports(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      findFilesWithOldImports(fullPath, files);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('getTranslations') && content.includes('@/lib/directus')) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

// Funzione per aggiornare un file
function updateFile(filePath) {
  console.log(`\n🔄 Aggiornando: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  // Sostituisci import con getTranslations
  if (content.includes("import { getTranslations } from '@/lib/directus'")) {
    content = content.replace(
      "import { getTranslations } from '@/lib/directus'",
      "import { useSectionTranslations } from '@/hooks/useTranslations'"
    );
    updated = true;
  }
  
  if (content.includes("import directusClient, { getTranslations } from '@/lib/directus'")) {
    content = content.replace(
      "import directusClient, { getTranslations } from '@/lib/directus'",
      "import directusClient from '@/lib/directus';\nimport { useSectionTranslations } from '@/hooks/useTranslations'"
    );
    updated = true;
  }
  
  // Per i file server-side (page.tsx), usa la versione server
  if (filePath.includes('/page.tsx') && !content.includes('"use client"')) {
    content = content.replace(
      "import { useSectionTranslations } from '@/hooks/useTranslations'",
      "import { getTranslationsForSection } from '@/lib/translations-server'"
    );
    
    // Sostituisci chiamate a getTranslations con getTranslationsForSection
    content = content.replace(
      /getTranslations\(([^,]+),\s*['"`]([^'"`]+)['"`]\)/g,
      "getTranslationsForSection('$2', $1)"
    );
  } else {
    // Per i componenti client-side
    // Sostituisci useQuery con useSectionTranslations
    content = content.replace(
      /const\s+{\s*data:\s*(\w+)\s*}\s*=\s*useQuery\(\s*{\s*queryKey:\s*\[[^\]]*\],\s*queryFn:\s*\(\)\s*=>\s*getTranslations\([^,]+,\s*['"`]([^'"`]+)['"`]\)\s*}\s*\);/g,
      "const { translations: $1 } = useSectionTranslations('$2', lang);"
    );
    
    // Rimuovi import useQuery se non più necessario
    if (!content.includes('useQuery') || content.match(/useQuery/g)?.length === 1) {
      content = content.replace(/import\s+{\s*[^}]*useQuery[^}]*}\s+from\s+['"`]@tanstack\/react-query['"`];\s*\n/g, '');
    }
  }
  
  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Aggiornato: ${filePath}`);
  } else {
    console.log(`⚠️  Nessuna modifica necessaria: ${filePath}`);
  }
}

// Trova e aggiorna tutti i file
const filesToUpdate = findFilesWithOldImports(srcDir);

console.log(`🔍 Trovati ${filesToUpdate.length} file da aggiornare:`);
filesToUpdate.forEach(file => console.log(`  - ${file}`));

if (filesToUpdate.length > 0) {
  console.log('\n🚀 Inizio aggiornamento...');
  filesToUpdate.forEach(updateFile);
  console.log('\n✅ Aggiornamento completato!');
} else {
  console.log('\n✅ Tutti i file sono già aggiornati!');
} 