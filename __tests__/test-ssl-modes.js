// test-ssl-modes.js
// Ejecuta con: node test-ssl-modes.js
// Este script prueba diferentes configuraciones SSL para encontrar la correcta

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

// Extraer la URL base sin parámetros SSL
const baseUrl = process.env.DATABASE_URL?.split('?')[0];

const configuraciones = [
  {
    nombre: '1. SSL con sslmode=require',
    config: {
      connectionString: `${baseUrl}?sslmode=require`,
      ssl: { rejectUnauthorized: false }
    }
  },
  {
    nombre: '2. SSL con sslmode=disable',
    config: {
      connectionString: `${baseUrl}?sslmode=disable`,
      ssl: false
    }
  },
  {
    nombre: '3. SSL básico (rejectUnauthorized: false)',
    config: {
      connectionString: baseUrl,
      ssl: { rejectUnauthorized: false }
    }
  },
  {
    nombre: '4. Sin SSL',
    config: {
      connectionString: baseUrl,
      ssl: false
    }
  },
  {
    nombre: '5. SSL con sslmode=prefer',
    config: {
      connectionString: `${baseUrl}?sslmode=prefer`,
      ssl: { rejectUnauthorized: false }
    }
  }
];

async function probarConfiguracion(config, nombre) {
  console.log(`\n🔍 Probando: ${nombre}`);
  console.log(`   URL: ${config.connectionString.substring(0, 50)}...`);
  
  const pool = new Pool(config);
  
  try {
    const res = await pool.query('SELECT NOW(), current_database()');
    console.log(`   ✅ ¡ÉXITO! Conectado a base: ${res.rows[0].current_database}`);
    console.log(`   ⏰ Hora del servidor: ${res.rows[0].now}`);
    
    // Probar query a historias
    const historias = await pool.query('SELECT COUNT(*) FROM historias');
    console.log(`   📊 Historias encontradas: ${historias.rows[0].count}`);
    
    await pool.end();
    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    await pool.end();
    return false;
  }
}

async function ejecutarPruebas() {
  console.log('🚀 DIAGNÓSTICO DE CONEXIÓN SSL A SUPABASE');
  console.log('='.repeat(60));
  
  if (!baseUrl) {
    console.log('❌ ERROR: DATABASE_URL no está definido en .env.local');
    return;
  }
  
  console.log(`\n📍 URL Base: ${baseUrl}`);
  
  let exito = false;
  
  for (const { config, nombre } of configuraciones) {
    const resultado = await probarConfiguracion(config, nombre);
    
    if (resultado && !exito) {
      exito = true;
      console.log('\n' + '='.repeat(60));
      console.log('🎉 CONFIGURACIÓN GANADORA:');
      console.log('='.repeat(60));
      console.log(`\nUsa esta configuración en tu .env.local:\n`);
      console.log(`DATABASE_URL="${config.connectionString}"`);
      console.log('\nY en tu lib/db.js usa:');
      console.log(JSON.stringify({ ssl: config.ssl }, null, 2));
      console.log('\n' + '='.repeat(60));
      
      // No hacer break, seguir probando para ver todas las que funcionan
    }
  }
  
  if (!exito) {
    console.log('\n❌ NINGUNA CONFIGURACIÓN FUNCIONÓ');
    console.log('\n💡 Posibles causas:');
    console.log('   1. La contraseña cambió en Supabase');
    console.log('   2. El proyecto de Supabase está pausado');
    console.log('   3. Tu IP está bloqueada en Supabase');
    console.log('   4. Las tablas no existen todavía');
    console.log('\n🔧 Soluciones:');
    console.log('   1. Verifica en Supabase Dashboard → Settings → Database');
    console.log('   2. Copia la "Connection string" exacta desde allí');
    console.log('   3. Verifica que el proyecto esté activo (no pausado)');
  }
}

ejecutarPruebas().catch(console.error);
