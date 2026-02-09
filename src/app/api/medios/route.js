import { NextResponse } from 'next/server';
import { createClient } from '@/utils/server'; 
import { medioSchema } from '@/lib/schemas';

export async function POST(request) {
  try {
    // 1. Seguridad
    const authHeader = request.headers.get('x-api-secret');
    if (authHeader !== process.env.API_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Recibir datos
    const body = await request.json();

    // 3. Validar
    // Zod se encargará de que 'sitio_web' sea una URL válida o null, tal como en tu JSON
    const datosValidados = medioSchema.parse(body);

    // 4. Guardar en Supabase
    const supabase = await createClient();
    
    // Usamos UPSERT: Si ya existe un medio con ese ID (o slug si lo configuras como unique), 
    // lo actualiza en vez de crear uno nuevo.
    const { data, error } = await supabase
      .from('medios')
      .upsert(datosValidados, { onConflict: 'slug' }) // O 'id', dependiendo de tu llave única en DB
      .select();

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, id: data[0].id, medio: data[0].nombre });

  } catch (error) {
    const status = error.issues ? 400 : 500;
    return NextResponse.json({ 
      error: error.issues || error.message 
    }, { status });
  }
}