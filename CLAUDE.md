# Product360.video - AI Product Asset Generator

## Descripción del Proyecto

Web app que replica el flujo de n8n "The Recap AI - eCommerce Product Asset Generator":
1. Recibe URL de producto eCommerce
2. Scraping con Firecrawl para extraer imagen principal
3. Genera 4 vistas rotadas del producto con Gemini (grid 2x2)
4. Extrae los 4 cuadrantes como imágenes individuales
5. Genera video 360° con Veo 3.1
6. Almacena resultados en Cloudflare R2

## Stack Tecnológico

- **Frontend**: SvelteKit 5 + Svelte 5 (runes: $state, $derived, $effect, $props)
- **Styling**: TailwindCSS 4 con dark mode
- **Backend**: SvelteKit API Routes
- **Database**: Drizzle ORM + SQLite (local) / Turso (producción)
- **Storage**: Cloudflare R2 (compatible con S3)
- **APIs Externas**: Firecrawl, Google Gemini, Google Veo

## Estructura del Proyecto

```
src/
├── lib/
│   ├── components/
│   │   ├── landing/           # 9 componentes de landing page
│   │   │   ├── Hero.svelte
│   │   │   ├── ShowcaseGrid.svelte
│   │   │   ├── HowItWorks.svelte
│   │   │   ├── Features.svelte
│   │   │   ├── SocialProof.svelte
│   │   │   ├── Pricing.svelte
│   │   │   ├── FAQ.svelte
│   │   │   ├── FinalCTA.svelte
│   │   │   └── Footer.svelte
│   │   ├── ProductForm.svelte
│   │   ├── ProcessingStatus.svelte
│   │   ├── ImageGallery.svelte
│   │   └── VideoPlayer.svelte
│   └── server/
│       ├── db/
│       │   ├── schema.js      # Tablas: generation, generatedImage
│       │   └── index.js       # Conexión DB
│       └── services/
│           ├── firecrawl.js   # Scraping de productos
│           ├── gemini.js      # Generación de imágenes
│           ├── veo.js         # Generación de video
│           └── r2.js          # Cloudflare R2 storage
├── routes/
│   ├── +page.svelte           # Landing page
│   ├── +layout.svelte
│   ├── layout.css             # Estilos globales + animaciones
│   ├── generate/
│   │   └── [id]/
│   │       ├── +page.svelte   # Página de generación/resultados
│   │       └── +page.server.js
│   └── api/
│       ├── generation/+server.js        # CRUD generaciones
│       ├── scrape/+server.js            # Scraping producto
│       ├── generate-canvas/+server.js   # Generar grid 2x2
│       ├── extract-quadrant/+server.js  # Extraer cuadrante
│       ├── generate-video/+server.js    # Iniciar video
│       └── check-video-status/+server.js # Polling video
```

## Modelo de Datos

### Tabla `generation`
- `id` - UUID
- `productUrl` - URL del producto
- `productImageUrl` - Imagen extraída
- `status` - pending | payment_required | processing | completed | failed
- `currentStep` - Paso actual del proceso
- `paymentStatus` - pending | completed (placeholder)
- `paymentIntentId` - Para Stripe futuro
- `canvasImageUrl` - URL del canvas 2x2 en R2
- `videoOperationName` - ID operación de Veo
- `videoUrl` - URL del video final en R2
- `error` - Mensaje de error si falla
- `createdAt`, `updatedAt`

### Tabla `generatedImage`
- `id` - UUID
- `generationId` - FK a generation
- `position` - top-left | top-right | bottom-left | bottom-right
- `imageUrl` - URL en R2
- `createdAt`

## Flujo de la Aplicación

1. **Landing (/)** - Usuario ingresa URL de producto
2. **Crear generación** - POST /api/generation → status: payment_required
3. **Pago (placeholder)** - Botón "Skip Payment (Demo)" para testing
4. **Procesamiento** - 4 pasos con polling:
   - Scraping producto (Firecrawl)
   - Generando canvas (Gemini)
   - Extrayendo imágenes (Gemini)
   - Generando video (Veo)
5. **Resultados** - Galería de imágenes + video player

## Variables de Entorno

```env
DATABASE_URL="file:local.db"
DATABASE_AUTH_TOKEN=""        # Solo para Turso

FIRECRAWL_API_KEY=""
GOOGLE_GEMINI_API_KEY=""

R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME=""
R2_PUBLIC_URL=""              # URL pública del bucket
```

## Comandos

```bash
pnpm install          # Instalar dependencias
pnpm dev              # Servidor desarrollo
pnpm build            # Build producción
pnpm db:push          # Push schema a DB
pnpm db:studio        # Drizzle Studio
```

## Tareas Pendientes

- [ ] **Implementar Stripe** - Cobro real antes de generación
- [ ] **Mejorar scraping** - Manejo de más tipos de páginas de producto
- [ ] **Optimizar polling** - Server-Sent Events o WebSockets
- [ ] **Añadir autenticación** - Para historial de usuario
- [ ] **Tests** - Unit tests y e2e
- [ ] **Deploy** - Vercel/Cloudflare Pages

## Notas de Desarrollo

### Landing Page
- Diseño dark mode inspirado en PhotoAI (Variant A: "Showcase First")
- Animaciones CSS: fade-up, gradient-shift, pulse
- Gradientes: indigo → purple → fuchsia
- Clases personalizadas en layout.css: `.gradient-animated`, `.gradient-text`, `.noise`

### APIs Gemini/Veo
- Modelo Gemini: `gemini-2.0-flash-exp-image-generation`
- Modelo Veo: `veo-2.0-generate-001`
- Veo es asíncrono - requiere polling con operationName

### Cloudflare R2
- Usa AWS SDK S3 compatible
- Estructura: `generations/{id}/canvas.png`, `generations/{id}/quadrant-{position}.png`, `generations/{id}/video.mp4`

---

## Svelte MCP Tools

Para desarrollo con Svelte 5:

### 1. list-sections
Descubre secciones de documentación disponibles. Usar PRIMERO.

### 2. get-documentation
Obtiene documentación completa de secciones específicas.

### 3. svelte-autofixer
Analiza código Svelte y retorna issues/sugerencias. USAR SIEMPRE antes de enviar código.

### 4. playground-link
Genera link a Svelte Playground. Solo usar si el usuario lo pide.
