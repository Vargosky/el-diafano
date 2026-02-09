// lib/schemas.js
import { z } from 'zod';

// 1. Exportar Noticia
export const noticiaSchema = z.object({
  titulo: z.string().min(1, "El título es obligatorio"),
  link: z.string().url("El link debe ser una URL válida"),
  content: z.string().optional(),
  fecha: z.string().datetime().optional(),
  medio_id: z.number().int().optional(),
  embedding: z.array(z.number()).optional(),
});

// 2. Exportar Historia (Asegúrate de tener este también)
export const historiaSchema = z.object({
  titulo_generado: z.string().min(1),
  fecha_primer_reporte: z.string().datetime().optional(),
  vector_centro: z.array(z.number()).optional(), 
  resumen: z.string().optional()
});

// 3. Exportar Medio
export const medioSchema = z.object({
  nombre: z.string().min(1),
  slug: z.string().min(1),
  linea_editorial: z.string().optional(),
  grupo_empresarial: z.string().optional(),
  sitio_web: z.string().url().optional().nullable(),
  logo_url: z.string().url().optional().nullable()
});