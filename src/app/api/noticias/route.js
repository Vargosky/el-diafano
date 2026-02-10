// import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const noticiaSchema = z.object({
  titulo: z.string().min(1),
  link: z.string().url(),
  content: z.string().optional(),
  fecha: z.string().optional(),
  fuente: z.string().optional(),
  medio_id: z.number().optional()
});

export async function POST(request) {
  try {
    // 1. Validar Clave Secreta
    const authHeader = request.headers.get('x-api-secret');
    if (authHeader !== process.env.API_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validar Datos
    const body = await request.json();
    const validation = noticiaSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { titulo, link, content, fecha, fuente } = validation.data;
    const fechaFinal = fecha ? new Date(fecha).toISOString() : new Date().toISOString();

    // 3. Conectar a Base de Datos
    const supabase = await createClient();

    // 4. UPSERT (La parte mágica que evita el error)
    // "onConflict: 'link'" le dice que si el link existe, ACTUALICE en vez de fallar.
    const { data, error } = await supabase
      .from('noticias')
      .upsert({
        titulo,
        link,
        content: content || '',
        fecha: fechaFinal,
        fuente,
        estado: 'pendiente'
      }, { onConflict: 'link' }) 
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, id: data?.[0]?.id });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


// FORZANDO ACTUALIZACION FINAL v3