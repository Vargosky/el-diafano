¡Claro que sí! Aquí tienes un README.md profesional y completo para tu proyecto "El Diáfano".

Está redactado para que cualquier desarrollador (o tu yo del futuro) entienda rápidamente qué es el proyecto, cómo está construido y cómo funciona la lógica de datos e IA.

Puedes copiar y pegar este contenido directamente en un archivo README.md en la raíz de tu repositorio.

📰 El Diáfano
Transparencia en las noticias. Un agregador de medios chilenos impulsado por IA que analiza sesgos, detecta entidades y ofrece resúmenes neutrales.

📖 Descripción
El Diáfano es una plataforma diseñada para centralizar, limpiar y analizar el flujo de noticias de múltiples medios de comunicación en Chile. Inspirado en conceptos como Ground News, el proyecto busca romper las burbujas de filtro mediante el análisis automático de contenido.

El sistema utiliza n8n para la orquestación de datos (ETL), Supabase como backend en tiempo real y modelos de lenguaje locales (Ollama / Llama 3.2) para procesar cada noticia, detectando su tono y orientación política antes de presentarla en un frontend moderno construido con Next.js.

🚀 Características Principales
Ingesta Multi-Fuente: Capacidad para extraer noticias vía Scraping (HTML) y RSS Feeds.

Limpieza de Contenido Inteligente: Algoritmos de sanitización que eliminan publicidad, widgets, formularios de suscripción y código basura del HTML original.

Análisis de IA Local: Cada noticia es procesada por un LLM (Llama 3.2) para generar:

Un título neutralizado.

Un resumen ejecutivo.

Detección de Sesgo (Izquierda, Centro, Derecha).

Detección de Tono (Crítico, Informativo, Satírico).

Extracción de Entidades y Tags.

Persistencia Estructurada: Almacenamiento relacional en PostgreSQL con soporte para Embeddings vectoriales (búsqueda semántica).

🛠 Tech Stack
Orquestación & ETL: n8n (Self-hosted)

Base de Datos: Supabase (PostgreSQL)

Inteligencia Artificial: Ollama ejecutando Llama 3.2

Frontend: Next.js (React)

Infraestructura: Docker / VPS

⚙️ Arquitectura de Datos
Flujo de Trabajo (Workflow n8n)
El sistema opera mediante flujos automatizados que se ejecutan periódicamente:

Fetching (Extracción):

T13: Scraping directo de la sección Política/Nacional. Selectores CSS específicos (a.card).

El País: Ingesta vía RSS Feed. Extracción de imágenes mediante Regex sobre content:encoded.

El Ciudadano: Scraping de portadas.

Sanitización (Limpieza):

Unificación de bajadas y cuerpo de la noticia.

Eliminación agresiva de nodos DOM basura (scripts, iframes, formularios "Brevo", widgets de video).

Upsert (Persistencia):

Inserción o actualización en Supabase basada en la URL única de la noticia.

Recuperación robusta de IDs para mantener la integridad referencial.

Análisis IA:

El contenido limpio se envía a Ollama.

El LLM retorna un objeto JSON estructurado con el análisis.

Actualización final en la base de datos con los metadatos generados.

Esquema de Base de Datos (Supabase)
Tabla: medios
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| id | int8 | PK. Identificador del medio (ej: 14 para T13). |
| nombre | text | Nombre público. |
| linea_editorial | text | Descripción de la postura editorial. |
| sesgo_politico | text | Clasificación general (ej: "derecha", "izquierda"). |

Tabla: noticias
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| id | int8 | PK. Identificador único de la noticia. |
| titulo | text | Título original del medio. |
| titulo_limpio | text | Título neutralizado por IA. |
| content | text | Cuerpo de la noticia sanitizado (texto plano). |
| link | text | URL original (Unique Constraint). |
| medio_id | int8 | FK hacia tabla medios. |
| sesgo_ia | text | Output del modelo (ej: "Centro-Derecha"). |
| tags | text[]| Array de etiquetas temáticas. |
| embedding | vector| Vector para búsqueda semántica (futuro). |

🔧 Configuración y Despliegue
Requisitos Previos
Instancia de Supabase activa.

Instancia de n8n corriendo (local o servidor).

Servidor de Ollama accesible desde n8n.

Instalación (Frontend)
Bash
# Clonar repositorio
git clone https://github.com/tu-usuario/el-diafano.git

# Instalar dependencias
cd el-diafano
npm install

# Configurar variables de entorno (.env.local)
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key

# Correr servidor de desarrollo
npm run dev
🧩 Retos Técnicos Resueltos
Pérdida de Contexto en n8n: Implementación de referencias directas $node["Loop"].json para mantener el ID de la noticia a través de nodos asíncronos (IA).

Imágenes en RSS: Solución híbrida para El País que extrae imágenes incrustadas en el HTML cuando el feed XML no las expone.

Limpieza de T13: Desarrollo de expresiones regulares específicas para eliminar "ruido" publicitario y bloques de "Lee También" que contaminaban el análisis de la IA.

🔮 Roadmap
[x] Ingesta de T13, El País, El Ciudadano.

[x] Análisis de Sentimiento y Sesgo con Llama 3.2.

[ ] Frontend público en Next.js.

[ ] Implementación de Búsqueda Semántica (Vector Search).

[ ] Dashboard de estadísticas de medios.

Licencia: MIT

Desarrollado por Vargosky