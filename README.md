# CocinIA 🍳

**Tu nevera y tu Thermomix hablan entre sí.** Prototipo funcional completo (React + Vite + Tailwind) con datos de demostración, sin backend: todo vive en `localStorage` del navegador.

## Funcionalidades incluidas

- **Login / registro** con creación de hogar o unión mediante código de invitación familiar.
- **Despensa**: inventario por nevera/congelador/despensa, con 4 formas de añadir productos (foto de tique simulada con OCR, foto de nevera simulada, código de barras, manual con autocompletado).
- **Recetas** (Thermomix y "a fuego/sartén"), importación simulada desde un enlace de Cookidoo, favoritos e historial valorado.
- **Ficha de receta**: raciones ajustables, modo invitados, ingredientes con disponibilidad en tiempo real y botón para añadir lo que falta a la compra.
- **Modo guiado tipo Thermomix**: pasos con temporizador, velocidad/temperatura y asistente de voz (Web Speech API con fallback simulado).
- Al terminar de cocinar, **se descuenta automáticamente el stock** de la despensa.
- **"¿Qué cocino hoy?"**: motor de recomendación basado en caducidades, stock disponible, favoritos e historial.
- **Plan semanal** (comida/cena) con aviso de variedad y generación automática de la lista de la compra.
- **Lista de la compra** agrupada por pasillo, con "pedir online" simulado por supermercado.
- **Reconocimiento de sobras** y **racha sin desperdicio** (gamificación) en la pantalla de Inicio.
- **Ajustes**: perfiles del hogar (alergias/dietas), grupo familiar con código de invitación compartible, súper conectado.

## Desarrollo local

```bash
npm install
npm run dev
```

## Build de producción

```bash
npm run build
npm run preview
```

## Desplegar gratis en internet

El proyecto ya incluye `vercel.json` y `netlify.toml`/`public/_redirects` para que el enrutado de React Router funcione en hosting estático.

**Opción A — Vercel (recomendado):**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Opción B — Netlify:**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

Ambos son gratuitos para proyectos personales y detectan automáticamente `npm run build` → carpeta `dist/`.

> Nota: es una demo con datos ficticios (sin conexión a servicios reales de Mercadona/Carrefour/Cookidoo). Las contraseñas se guardan en `localStorage` solo a efectos de la demo, no uses credenciales reales.

