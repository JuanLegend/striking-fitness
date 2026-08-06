# Striking Fitness — sitio web nativo

Sitio multipágina de Striking Fitness construido con React, Vite, Three.js y MapLibre. Incluye las páginas de Inicio, Boxeo, Brazilian Jiu Jitsu, Kick Boxing, MMA, Eventos, Sedes y Contacto, además del aviso de privacidad, términos de uso y página 404.

## Desarrollo local

```bash
npm install
npm run dev
```

## Compilación de producción

```bash
npm run build
npm run preview
```

La compilación genera en `dist/`:

- HTML independiente con SEO para cada ruta.
- Sitemap y robots propios.
- Página 404 con `noindex`.
- Metadatos Open Graph y Twitter.
- Datos estructurados de la organización y sus dos sedes.

## Publicar con GitHub Pages

El workflow `.github/workflows/deploy-pages.yml` publica automáticamente cada actualización de la rama `main`.

1. Crear un repositorio en GitHub.
2. Subir el proyecto a la rama `main`.
3. En **Settings → Pages**, seleccionar **GitHub Actions** como fuente.
4. Esperar a que finalice la acción `Deploy Striking Fitness to GitHub Pages`.

La compilación detecta automáticamente si GitHub Pages sirve el proyecto desde `/` o desde una subcarpeta con el nombre del repositorio.

## Información que debe confirmarse antes de conectar el dominio

- Horarios vigentes de cada disciplina.
- Nombres, cargos y certificaciones de los profesores.
- Dirección, teléfono y correo oficiales.
- Próximos eventos.
- Texto legal definitivo si el formulario comienza a almacenar datos.
- Dominio final usado en canonical, sitemap y datos estructurados.

El formulario actual no guarda datos en una base propia: prepara el mensaje y deja al visitante confirmar su envío en WhatsApp.
