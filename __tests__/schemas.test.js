import { noticiaSchema, historiaSchema } from '@/lib/schemas';

describe('Validación de Esquemas (El Contrato)', () => {

  // --- PRUEBAS DE NOTICIAS ---
  test('Debe aceptar una noticia válida', () => {
    const data = {
      titulo: "Nueva IA revoluciona el mercado",
      link: "https://biobiochile.cl/tecnologia/ia",
      content: "Contenido de prueba...",
      fuente: "BioBio",
      fecha: "2026-02-09T15:00:00Z"
    };
    
    const resultado = noticiaSchema.safeParse(data);
    expect(resultado.success).toBe(true);
  });

  test('Debe rechazar una noticia sin título o link inválido', () => {
    const data = {
      titulo: "", // Vacío (Error)
      link: "esto-no-es-una-url", // URL rota (Error)
    };
    
    const resultado = noticiaSchema.safeParse(data);
    expect(resultado.success).toBe(false);
    // Verificamos que Zod detecte ambos errores
    expect(resultado.error.issues.length).toBeGreaterThanOrEqual(2);
  });

  // --- PRUEBAS DE HISTORIAS ---
  test('Debe convertir y validar vectores correctamente', () => {
    const data = {
      titulo_generado: "Resumen semanal",
      // Simulamos un vector real
      vector_centro: [0.123, -0.555, 1.05] 
    };

    const resultado = historiaSchema.safeParse(data);
    expect(resultado.success).toBe(true);
  });
  
  test('Debe fallar si el vector no es un array de números', () => {
    const data = {
      titulo_generado: "Error Vector",
      vector_centro: "esto es un string, no un array" 
    };
    const resultado = historiaSchema.safeParse(data);
    expect(resultado.success).toBe(false);
  });

});