import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const domain = 'https://striking-fitness.com';
const pages = [
  { path: '/', title: 'Striking Fitness | Academia de deportes de combate en Cali', description: 'Academia de boxeo, kick boxing, Brazilian Jiu Jitsu y MMA en Cali. Entrena en Striking Fitness.' },
  { path: '/boxeo/', title: 'Academia de boxeo en Cali | Striking Fitness', description: 'Clases de boxeo en Cali para niños y adultos, desde nivel recreativo hasta competencia. Entrena con campeones en Striking Fitness.' },
  { path: '/brazilian-jiu-jitsu/', title: 'Academia de Brazilian Jiu Jitsu en Cali | Striking Fitness', description: 'Clases de Brazilian Jiu Jitsu en Cali para principiantes y practicantes de todos los niveles.' },
  { path: '/kick-boxing/', title: 'Academia de Kick Boxing en Cali | Striking Fitness', description: 'Clases de Kick Boxing en Cali para todos los niveles. Mejora tu striking, condición física, coordinación y confianza.' },
  { path: '/mma/', title: 'Academia de MMA en Cali | Striking Fitness', description: 'Clases de MMA en Cali para todos los niveles. Aprende striking, derribos y grappling con acompañamiento profesional.' },
  { path: '/eventos/', title: 'Eventos de deportes de combate en Cali | Striking Fitness', description: 'Consulta competencias, seminarios y actividades de Boxeo, BJJ, Kick Boxing y MMA de Striking Fitness.' },
  { path: '/sedes-contacto/', title: 'Sedes y contacto | Striking Fitness Cali', description: 'Encuentra las sedes Cedro y Cámbulos de Striking Fitness en Cali y agenda una clase por WhatsApp.' },
  { path: '/privacidad/', title: 'Aviso de privacidad | Striking Fitness', description: 'Información sobre el tratamiento de datos y los canales de contacto de Striking Fitness.' },
  { path: '/terminos/', title: 'Términos de uso | Striking Fitness', description: 'Condiciones generales para utilizar el sitio web de Striking Fitness.' },
];

const template = await readFile(join('dist', 'index.html'), 'utf8');
const escapeHtml = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

function render(page, robots = 'index,follow') {
  const canonical = `${domain}${page.path}`;
  return template
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(page.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(page.description)}" />`)
    .replace(/<meta name="robots" content="[^"]*"\s*\/>/, `<meta name="robots" content="${robots}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escapeHtml(page.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeHtml(page.description)}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`);
}

for (const page of pages) {
  if (page.path === '/') continue;
  const directory = join('dist', page.path.slice(1));
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'index.html'), render(page), 'utf8');
}

const notFound = { path: '/404/', title: 'Página no encontrada | Striking Fitness', description: 'La página solicitada no existe.' };
await writeFile(join('dist', '404.html'), render(notFound, 'noindex,follow'), 'utf8');

const lastmod = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((page) => `  <url><loc>${domain}${page.path}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`;
await writeFile(join('dist', 'sitemap.xml'), sitemap, 'utf8');
await writeFile(join('dist', 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${domain}/sitemap.xml\n`, 'utf8');
