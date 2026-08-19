const fs = require('fs');
const path = require('path');
const https = require('https');

const TARGET_URL = 'https://footnote4a.org/news/transparency-portals';
const OUTPUT_FILE = path.resolve(__dirname, '../src/data/fallbackPortals.json');

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, timeout: 10000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchHtml(res.headers.location));
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractFlockUrls(html) {
  const urls = new Set();
  const hrefRegex = /href=["'](https:\/\/transparency\.flocksafety\.com\/[^"'>]+)["']/gi;
  let match;
  while ((match = hrefRegex.exec(html)) !== null) {
    const cleaned = match[1].trim().toLowerCase();
    const withSlash = cleaned.endsWith('/') ? cleaned : cleaned + '/';
    urls.add(withSlash);
  }

  const textRegex = /https:\/\/transparency\.flocksafety\.com\/[a-zA-Z0-9_\-]+(\/[a-zA-Z0-9_\-]*)*/gi;
  while ((match = textRegex.exec(html)) !== null) {
    const cleaned = match[0].trim().toLowerCase();
    const withSlash = cleaned.endsWith('/') ? cleaned : cleaned + '/';
    urls.add(withSlash);
  }

  return Array.from(urls).sort();
}

async function main() {
  console.log(`Fetching transparency portals from ${TARGET_URL}...`);
  const html = await fetchHtml(TARGET_URL);
  const urls = extractFlockUrls(html);
  console.log(`Extracted ${urls.length} valid Flock Transparency portal URLs.`);

  if (urls.length === 0) {
    throw new Error('No transparency portal URLs could be extracted.');
  }

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(urls, null, 2), 'utf8');
  console.log(`Saved static dataset to ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error('Error refreshing fallback portals:', err);
  process.exit(1);
});
