import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// 1. Esquema de validación (El Portero)
const noticiaSchema = z.object({
  titulo: z.string().min(1, "El título es obligatorio"),
  link: z.string().url("El link debe ser una URL válida"),
  content: z.string().optional(),
  fecha: z.string().optional().or(z.date()), // Acepta texto o fecha
  fuente: z.string().optional(),
  medio_id: z.number().optional()
});

export async function POST(request) {
  try {
    // 2. Verificar la clave secreta (Seguridad)
    const authHeader = request.headers.get('x-api-secret');
    if (authHeader !== process.env.API_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Leer y Validar los datos que llegan
    const body = await request.json();
    const validation = noticiaSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { titulo, link, content, fecha, fuente, medio_id } = validation.data;

    // 4. Conectar a Supabase
    const supabase = await createClient();

    // 5. Preparar la fecha (Si no viene, usamos la actual)
    const fechaFinal = fecha ? new Date(fecha).toISOString() : new Date().toISOString();

    // 6. GUARDAR EN BASE DE DATOS (La parte clave: UPSERT)
    // .upsert() intenta insertar, pero si choca con un link existente, actualiza.
    const { data, error } = await supabase
      .from('noticias')
      .upsert(
        {
          titulo,
          link,          // Esta es la llave única
          content: content || '',
          fecha: fechaFinal,
          fuente: fuente || 'Desconocido',
          medio_id: medio_id || null, // Opcional
          estado: 'pendiente'         // Estado por defecto
        },
        { onConflict: 'link' } // <--- ESTO EVITA EL ERROR DE DUPLICADOS
      )
      .select()
      .single();

    if (error) {
      console.error('❌ Error Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 7. Responder Éxito
    return NextResponse.json({
      success: true,
      id: data.id,
      mensaje: 'Noticia procesada correctamente'
    });

  } catch (error) {
    console.error('❌ Error General:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}