// fix-imports.js
// Ejecuta con: node fix-imports.js
// Este script corrige automáticamente las importaciones de pool

const fs = require('fs');
const path = require('path');

const archivosParaArreglar = [
  {
    ruta: 'src/app/laboratorio/actions.js',
    buscar: "import { pool } from '@/lib/db';",
    reemplazar: "import pool from '@/lib/db';"
  },
  {
    ruta: 'src/app/laboratorio_old/actions.js',
    buscar: "import { pool } from '@/lib/db';",
    reemplazar: "import pool from '@/lib/db';"
  },
  {
    ruta: 'src/lib/data.js',
    buscar: "import { pool } from './db';",
    reemplazar: "import pool from './db';"
  }
];

console.log('🔧 Arreglando importaciones de pool...\n');

let arreglosHechos = 0;
let errores = 0;

for (const { ruta, buscar, reemplazar } of archivosParaArreglar) {
  const rutaCompleta = path.join(process.cwd(), ruta);
  
  try {
    // Verificar si el archivo existe
    if (!fs.existsSync(rutaCompleta)) {
      console.log(`⚠️  ${ruta} - No existe (skip)`);
      continue;
    }
    
    // Leer el archivo
    let contenido = fs.readFileSync(rutaCompleta, 'utf8');
    
    // Verificar si necesita el cambio
    if (!contenido.includes(buscar)) {
      console.log(`✅ ${ruta} - Ya está correcto`);
      continue;
    }
    
    // Hacer el reemplazo
    contenido = contenido.replace(buscar, reemplazar);
    
    // Guardar el archivo
    fs.writeFileSync(rutaCompleta, contenido, 'utf8');
    
    console.log(`✅ ${ruta} - ARREGLADO`);
    arreglosHechos++;
    
  } catch (error) {
    console.log(`❌ ${ruta} - Error: ${error.message}`);
    errores++;
  }
}

console.log(`\n📊 Resumen:`);
console.log(`   ✅ Archivos arreglados: ${arreglosHechos}`);
console.log(`   ❌ Errores: ${errores}`);

if (arreglosHechos > 0) {
  console.log(`\n🎉 ¡Listo! Ahora ejecuta:`);
  console.log(`   npm run build`);
} else if (errores === 0) {
  console.log(`\n✨ Todos los archivos ya están correctos`);
}

// Verificar el archivo de noticias
const rutaNoticias = path.join(process.cwd(), 'src/app/api/noticias/route.js');
if (fs.existsSync(rutaNoticias)) {
  console.log(`\n⚠️  ATENCIÓN: src/app/api/noticias/route.js existe`);
  console.log(`   Este archivo importa '@/utils/supabase/server' que no existe`);
  console.log(`   Opciones:`);
  console.log(`   1. Elimínalo si no lo usas: rm src/app/api/noticias/route.js`);
  console.log(`   2. O arréglalo manualmente para usar pool en lugar de supabase`);
}
