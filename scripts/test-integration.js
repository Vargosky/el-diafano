// scripts/test-integration.js
const API_URL = 'http://localhost:3000/api';
// Esta clave debe coincidir con la que pusiste en .env.local
const SECRET = 'diafano_super_secreto_2026_vargas'; 

async function probarEndpoint(nombre, endpoint, payload) {
  console.log(`\n--- Probando ${nombre} ---`);
  
  try {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-secret': SECRET
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ÉXITO: ID creado/actualizado: ${data.id}`);
      if(data.medio) console.log(`   Medio: ${data.medio}`);
    } else {
      console.error(`❌ ERROR (${response.status}):`, JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.error(`❌ ERROR DE RED:`, e.message);
    console.error(`   ¿Está corriendo el servidor en localhost:3000?`);
  }
}

// DATOS DE PRUEBA
const noticiaFake = {
  titulo: "[TEST] Alcaldesa confirma recuperación",
  link: "https://biobiochile.cl/test/noticia-fake-" + Date.now(), // Random para no duplicar
  content: "Esta es una noticia de prueba generada por el script de validación.",
  fecha: new Date().toISOString(),
  fuente: "ScriptTest"
};

const historiaFake = {
  titulo_generado: "[TEST] Historia generada por Script",
  fecha_primer_reporte: new Date().toISOString(),
  vector_centro: [0.1, 0.2, 0.3, -0.5]
};

const medioFake = {
  nombre: "[TEST] Diario El Valparaíso",
  slug: "diario-test-valpo",
  sitio_web: "https://test-valpo.cl"
};

// EJECUTAR LAS PRUEBAS
(async () => {
  console.log("Iniciando pruebas de integración contra: " + API_URL);
  await probarEndpoint('MEDIOS (Crear/Upsert)', 'medios', medioFake);
  await probarEndpoint('HISTORIAS', 'historias', historiaFake);
  await probarEndpoint('NOTICIAS', 'noticias', noticiaFake);
})();