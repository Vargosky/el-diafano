import { NextResponse } from 'next/server';
import { createClient } from '@/utils/server'; 
import { noticiaSchema } from '@/lib/schemas'; // Asumiendo que ya creaste el archivo de esquemas

export async function POST(request) {
  try {
    // 1. Seguridad
    const authHeader = request.headers.get('x-api-secret');
    if (authHeader !== process.env.API_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Recibir JSON directo (sin envoltorio "data" ni "tipo")
    const body = await request.json();

    // 3. Validar solo con esquema de Noticia
    const datosValidados = noticiaSchema.parse(body);

    // 4. Guardar
    const supabase = createClient();
    const { data, error } = await supabase
      .from('noticias')
      .insert([datosValidados]) // Pasamos el objeto directo
      .select();

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, id: data[0].id });

  } catch (error) {
    // Manejo de error limpio
    const status = error.issues ? 400 : 500;
    return NextResponse.json({ 
      error: error.issues || error.message 
    }, { status });
  }
}