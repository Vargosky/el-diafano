// test-connection.js
// Ejecuta este archivo con: node test-connection.js
// Para verificar que tu conexión a Supabase funciona

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testConnection() {
  console.log('🔄 Probando conexión a Supabase...\n');
  
  try {
    // Test 1: Conexión básica
    console.log('1️⃣ Test de conexión básica...');
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Conectado! Hora del servidor:', res.rows[0].now);
    console.log('');

    // Test 2: Contar historias
    console.log('2️⃣ Contando historias en la base de datos...');
    const historias = await pool.query('SELECT COUNT(*) FROM historias');
    console.log(`✅ Total de historias: ${historias.rows[0].count}`);
    console.log('');

    // Test 3: Historias activas
    console.log('3️⃣ Contando historias activas...');
    const activas = await pool.query("SELECT COUNT(*) FROM historias WHERE estado = 'activo'");
    console.log(`✅ Historias activas: ${activas.rows[0].count}`);
    console.log('');

    // Test 4: Contar noticias
    console.log('4️⃣ Contando noticias...');
    const noticias = await pool.query('SELECT COUNT(*) FROM noticias');
    console.log(`✅ Total de noticias: ${noticias.rows[0].count}`);
    console.log('');

    // Test 5: Obtener una historia de ejemplo
    console.log('5️⃣ Obteniendo una historia de ejemplo...');
    const ejemploQuery = `
      SELECT 
        h.id, 
        h.titulo_generado, 
        h.resumen_ia,
        (SELECT COUNT(*) FROM noticias n WHERE n.historia_id = h.id) as total_noticias
      FROM historias h
      WHERE h.estado = 'activo'
      LIMIT 1
    `;
    const ejemplo = await pool.query(ejemploQuery);
    
    if (ejemplo.rows.length > 0) {
      const historia = ejemplo.rows[0];
      console.log('✅ Historia encontrada:');
      console.log(`   ID: ${historia.id}`);
      console.log(`   Título: ${historia.titulo_generado}`);
      console.log(`   Noticias vinculadas: ${historia.total_noticias}`);
      console.log(`   Tiene resumen IA: ${historia.resumen_ia ? 'Sí' : 'No'}`);
    } else {
      console.log('⚠️  No se encontraron historias activas');
      console.log('   Ejecuta tus flujos n8n primero para crear contenido');
    }
    console.log('');

    console.log('🎉 ¡TODAS LAS PRUEBAS PASARON!');
    console.log('Tu frontend debería funcionar correctamente con Supabase');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.log('\n🔍 Detalles del error:');
    console.log(error);
    
    console.log('\n💡 Posibles soluciones:');
    console.log('1. Verifica que DATABASE_URL en .env.local sea correcto');
    console.log('2. Asegúrate de que Supabase esté accesible');
    console.log('3. Revisa que las tablas "historias" y "noticias" existan');
  } finally {
    await pool.end();
    console.log('\n👋 Conexión cerrada');
  }
}

testConnection();
