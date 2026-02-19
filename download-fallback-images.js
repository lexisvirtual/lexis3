import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PIXABAY_API_KEY = '54644686-7efa1461402a91a56a1f92e8b';
const IMAGES_DIR = path.join(__dirname, 'assets', 'images');
const FALLBACK_TOPICS = [
  'technology',
  'business',
  'education',
  'health',
  'nature',
  'science',
  'art',
  'travel',
  'food',
  'sports',
  'music',
  'design',
  'innovation',
  'success',
  'learning',
  'growth',
  'creativity',
  'teamwork',
  'future',
  'digital'
];

// Criar diretório se não existir
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  console.log(`✓ Diretório criado: ${IMAGES_DIR}`);
}

async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(IMAGES_DIR, filename);
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✓ Baixado: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

async function fetchPixabayImages() {
  return new Promise((resolve, reject) => {
    const query = FALLBACK_TOPICS[Math.floor(Math.random() * FALLBACK_TOPICS.length)];
    const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${query}&image_type=photo&per_page=20&safesearch=true`;

    https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.hits && result.hits.length > 0) {
            resolve(result.hits);
          } else {
            reject(new Error('Nenhuma imagem encontrada'));
          }
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    console.log('🔄 Buscando imagens do Pixabay...');
    const images = await fetchPixabayImages();
    
    console.log(`📥 Baixando ${Math.min(20, images.length)} imagens...`);
    
    for (let i = 0; i < Math.min(20, images.length); i++) {
      const image = images[i];
      const filename = `fallback-${String(i + 1).padStart(2, '0')}.jpg`;
      await downloadImage(image.webformatURL, filename);
    }
    
    console.log('\n✅ Todas as imagens foram baixadas com sucesso!');
    console.log(`📁 Localização: ${IMAGES_DIR}`);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();
