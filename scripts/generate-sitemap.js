import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSitemap() {
  const baseUrl = 'https://slotify232.onrender.com';
  const apiUrl = 'https://movie-slotify-be.onrender.com/api/Movie';

  const staticRoutes = [
    '/',
    '/movies',
    '/login',
    '/register'
  ];

  let dynamicRoutes = [];
  try {
    const response = await fetch(apiUrl);
    if (response.ok) {
        const result = await response.json();
        const movies = result.data || [];
        if (Array.isArray(movies)) {
            // Include both available and soon-to-be available movies
            dynamicRoutes = movies.map(movie => `/movie/${movie.id}`);
        }
    } else {
        console.error('Failed to fetch movies with status:', response.status);
    }
  } catch (error) {
    console.error('Error fetching movies for sitemap:', error);
  }

  const allRoutes = [...staticRoutes, ...dynamicRoutes];

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)){
      fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.resolve(publicDir, 'sitemap.xml'), sitemapContent);
  console.log(`Sitemap generated successfully with ${allRoutes.length} urls`);
}

generateSitemap();
