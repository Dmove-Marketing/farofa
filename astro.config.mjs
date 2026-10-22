import { defineConfig } from 'astro/config';

// Ajuste `site` para o domínio do projeto (usado em canonical/OG).
export default defineConfig({
  site: 'https://farofabrasaeprosa.com.br',
  output: 'static',
  prefetch: true,
  // fotos do CDN de mídia são baixadas no build e servidas otimizadas em /_astro (edge do Cloudflare)
  image: {
    domains: ['media.dmove.com.br'],
  },
  build: {
    inlineStylesheets: 'always',
  },
  server: {
    port: 4321,
  },
});
