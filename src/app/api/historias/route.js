import { NextResponse } from 'next/server';
import { createClient } from '@/utils/server'; 
import { historiaSchema } from '@/lib/schemas';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('x-api-secret');
    if (authHeader !== process.env.API_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // PEQUEÑO TRUCO: Si n8n manda el vector como string "[0.1, ...]", lo parseamos
    if (typeof body.vector_centro === 'string') {
      try {
        body.vector_centro = JSON.parse(body.vector_centro);
      } catch (e) {
        // Si falla, dejamos que Zod se queje después
      }
    }

    const datosValidados = historiaSchema.parse(body);

    const supabase = createClient();
    const { data, error } = await supabase
      .from('historias')
      .upsert(datosValidados, { onConflict: 'id' }) // Upsert por si actualizas
      .select();

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, id: data[0].id });

  } catch (error) {
    const status = error.issues ? 400 : 500;
    return NextResponse.json({ error: error.issues || error.message }, { status });
  }
}