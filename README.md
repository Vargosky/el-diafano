# 🗞️ El Diáfano

> **Crónica de Consensos** - Visualizador de sesgos mediáticos en Chile usando IA

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)
![Claude AI](https://img.shields.io/badge/Claude-Anthropic-purple)
![License](https://img.shields.io/badge/license-MIT-blue)

**El Diáfano** es una plataforma de agregación de noticias que utiliza inteligencia artificial para detectar, analizar y visualizar el sesgo político en la cobertura mediática chilena. El proyecto agrupa automáticamente noticias similares de múltiples medios, identifica personajes políticos mencionados, y presenta una visualización única del espectro ideológico de cada historia.

---

## 🎯 Características Principales

### ✅ **BiasBar™** - Visualización de Sesgo Político
Barra interactiva que muestra cómo cada medio del espectro político cubre una historia:
- **Izquierda** → **Centro-Izquierda** → **Centro** → **Centro-Derecha** → **Derecha**
- Permite identificar narrativas divergentes en tiempo real

### 📊 **Agrupación Inteligente**
- Clustering automático de noticias usando embeddings (Claude + Anthropic API)
- Genera títulos y resúmenes de consenso
- Identifica historias huérfanas para curación manual

### 👥 **Tracking de Personajes**
- Análisis automático de entidades políticas mencionadas
- Sentimiento por personaje (positivo/neutro/negativo)
- Perfiles detallados con cobertura histórica

### 📈 **Dashboard de Estadísticas**
- Temas principales de los últimos 7 días
- Personajes más mencionados
- Tendencias por categoría (Política, Economía, Sociedad, etc.)

### 💹 **Ticker Financiero**
- Datos en tiempo real: USD/CLP, EUR/CLP
- Índices bursátiles: IPSA, S&P 500, IBOVESPA, MERVAL
- Integración con APIs públicas

---

## 🏗️ Arquitectura
```
┌─────────────────────────────────────────────────────────────┐
│                    SCRAPING LAYER                           │
│  n8n workflows → 6 medios chilenos → 70 noticias/hora      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  PROCESSING LAYER                           │
│  Claude API → Embeddings + Clustering + Entity Extraction  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                            │
│     Supabase (PostgreSQL) + Edge Functions + RLS           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND LAYER                             │
│  Next.js 16 + Server Components + Tailwind CSS + Vercel    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Técnico

### **Frontend**
- **Framework**: Next.js 16 (App Router, Server Components, RSC)
- **Styling**: Tailwind CSS
- **Hosting**: Vercel (edge functions)
- **Analytics**: Plausible (privacy-first)

### **Backend**
- **Database**: Supabase (PostgreSQL 15)
- **APIs**: Anthropic Claude (Sonnet 4.5)
- **Automation**: n8n (self-hosted workflows)
- **Scraping**: Puppeteer + custom parsers

### **Inteligencia Artificial**
- **Embeddings**: Claude Sonnet 4.5 (1024 dimensions)
- **Clustering**: DBSCAN + cosine similarity
- **NER**: Claude para extracción de entidades
- **Summarization**: Claude para títulos/resúmenes consensuados

---

## 📂 Estructura del Proyecto
```
newFrontEnd/my-app/
├── src/
│   ├── app/
│   │   ├── page.js                    # Homepage (feed principal)
│   │   ├── personaje/[nombre]/page.js # Perfil de personaje
│   │   ├── historia/[id]/page.js      # Detalle de historia
│   │   └── api/
│   │       └── markets/route.js       # API de mercados financieros
│   ├── components/
│   │   ├── BiasBar.jsx                # Visualización de sesgo
│   │   ├── FeedController.jsx         # Feed de historias
│   │   ├── TopPersonajes.jsx          # Widget de personajes
│   │   ├── CategoryPieChart.jsx       # Gráfico de categorías
│   │   ├── SentimentPieChart.jsx      # Torta de sentimientos
│   │   └── MarketTicker.jsx           # Barra de mercados
│   └── lib/
│       └── supabase.js                # Cliente de Supabase
└── back-door/                         # Admin dashboard (Express.js)

n8n-docker/workflows/
├── 1-scraper-noticias.json            # Scraping de medios
├── 2-agrupar-historias.json           # Clustering con Claude
└── 3-actualizar-historias.json        # Regeneración de resúmenes
```

---

## 🚀 Instalación y Setup

### **Prerrequisitos**
- Node.js 18+
- PostgreSQL 15+ (o cuenta de Supabase)
- Cuenta de Anthropic (API key)
- n8n (opcional, para scraping)

### **1. Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/eldiafano.git
cd eldiafano/newFrontEnd/my-app
```

### **2. Instalar dependencias**
```bash
npm install
```

### **3. Configurar variables de entorno**
Crea un archivo `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key

# Anthropic (opcional, solo para backend)
ANTHROPIC_API_KEY=sk-ant-...
```

### **4. Setup de base de datos**
Ejecuta los scripts SQL en Supabase SQL Editor:
```sql
-- Ver /database/schema.sql para el esquema completo
-- Incluye tablas: medios, noticias, historias, personajes
-- Y funciones: get_stories_with_bias, get_top_personajes, etc.
```

### **5. Ejecutar en desarrollo**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 📊 Medios Scraped

| Medio | Sesgo | URL |
|-------|-------|-----|
| **BioBío** | Centro | biobiochile.cl |
| **Emol** | Centro-Derecha | emol.com |
| **La Tercera** | Centro-Derecha | latercera.com |
| **El Mostrador** | Centro-Izquierda | elmostrador.cl |
| **Cooperativa** | Centro | cooperativa.cl |
| **El Siglo** | Izquierda | elsiglo.cl |

**Próximos medios**: CIPER, El Mercurio, Radio ADN, The Clinic

---

## 🗺️ Roadmap

### **Q1 2026** (En desarrollo)
- [x] Frontend responsive con BiasBar
- [x] Página de perfiles de personajes
- [x] Gráfico de personajes más mencionados
- [x] Ticker financiero
- [ ] Agregar 4 medios más (total: 10)
- [ ] Página de detalle de historia
- [ ] SEO optimization

### **Q2 2026**
- [ ] Dashboard B2B para campañas políticas
- [ ] API pública (freemium)
- [ ] Sistema de alertas personalizadas
- [ ] Newsletter semanal automatizado

### **Q3 2026**
- [ ] Expansión regional (Argentina, Perú)
- [ ] Features premium (análisis histórico)
- [ ] Mobile app (React Native)

### **2027-2029**
- [ ] Cobertura de elecciones presidenciales 2029
- [ ] 50k+ usuarios mensuales
- [ ] Partnerships con medios grandes
- [ ] Exit o Serie A

---

## 💰 Modelo de Negocio

### **B2C** (Futuro)
- Tier gratuito con ads
- Premium ($10/mes): Sin ads, alertas, archivo histórico

### **B2B** (Core)
- **Campañas políticas**: $200-500/mes
  - Monitoreo de reputación en tiempo real
  - Alertas de menciones
  - Análisis de sentimiento por medio
  - Reportes semanales

- **Agencias de PR**: $300-1k/mes
  - API access
  - Dashboard multi-cliente
  - Webhooks

- **Consultorías**: $500-2k one-time
  - Análisis pre-electoral
  - Estrategia de cobertura mediática

---

## 🤝 Contribuir

¡Contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: nueva feature increíble'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### **Áreas que necesitan ayuda**
- [ ] Scrapers para nuevos medios
- [ ] Mejoras en algoritmo de clustering
- [ ] Tests unitarios y E2E
- [ ] Documentación técnica
- [ ] Diseño UI/UX

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver [LICENSE](LICENSE) para detalles.

---

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- LinkedIn: [Tu Perfil](https://linkedin.com/in/tu-perfil)
- Email: tu@email.com

---

## 🙏 Agradecimientos

- [Anthropic](https://anthropic.com) por Claude API
- [Supabase](https://supabase.com) por la infraestructura de BD
- [Vercel](https://vercel.com) por el hosting
- Comunidad open-source de Chile 🇨🇱

---

## 📸 Screenshots

### Homepage
![Homepage](docs/screenshots/homepage.png)
*Feed principal con BiasBar y filtros*

### Perfil de Personaje
![Personaje](docs/screenshots/personaje.png)
*Análisis de cobertura de Gabriel Boric*

### Dashboard de Stats
![Stats](docs/screenshots/stats.png)
*Temas principales y personajes más mencionados*

---

## 📈 Status del Proyecto

- **Versión**: Alpha 1.0
- **Estado**: En desarrollo activo
- **Usuarios**: Privado (beta cerrado)
- **Medios scraped**: 6
- **Historias procesadas**: ~5,000
- **Uptime**: 99.2%

---

## 🔗 Links Útiles

- [Documentación técnica](docs/TECHNICAL.md)
- [Guía de contribución](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
- [Roadmap detallado](docs/ROADMAP.md)

---

<p align="center">
  Hecho con ❤️ en Valparaíso, Chile 🇨🇱
</p>

📝 ARCHIVOS ADICIONALES RECOMENDADOS
CONTRIBUTING.md
markdown# Guía de Contribución

## Code Style
- ESLint + Prettier
- Componentes funcionales con hooks
- Tailwind para estilos (no CSS custom)

## Git Workflow
- main: producción
- develop: desarrollo
- feature/*: nuevas features
- fix/*: bug fixes

## Pull Requests
- Descripción clara del cambio
- Screenshots si aplica
- Tests pasando
CHANGELOG.md
markdown# Changelog

## [1.0.0] - 2026-02-15
### Added
- BiasBar visualization
- Personajes tracking
- Financial ticker
- Mobile responsive layout

### Fixed
- searchParams Promise handling
- SQL type casting issues
