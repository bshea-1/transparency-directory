const fs = require('fs');
const path = require('path');
const https = require('https');

const CENSUS_ZCTA_URL = 'https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt';
const OUTPUT_FILE = path.resolve(__dirname, '../src/data/zipToCounty.json');

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchText(res.headers.location));
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Downloading Census ZCTA to County Crosswalk...');
  const text = await fetchText(CENSUS_ZCTA_URL);
  const lines = text.replace(/^\uFEFF/, '').split('\n');
  const header = lines[0].split('|');
  const zctaIdx = header.indexOf('GEOID_ZCTA5_20');
  const countyIdx = header.indexOf('GEOID_COUNTY_20');
  const landPartIdx = header.indexOf('AREALAND_PART');

  if (zctaIdx === -1 || countyIdx === -1) {
    throw new Error('Failed to find column headers in Census dataset.');
  }

  const zipMap = {};
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('|');
    if (parts.length > Math.max(zctaIdx, countyIdx)) {
      const zip = parts[zctaIdx]?.trim();
      const fips = parts[countyIdx]?.trim();
      const land = parseInt(parts[landPartIdx] || '0', 10) || 0;
      if (zip && fips && zip.length === 5 && fips.length === 5) {
        if (!zipMap[zip] || land > zipMap[zip].land) {
          zipMap[zip] = { fips, land };
        }
      }
    }
  }

  const cleanMap = {};
  for (const [z, obj] of Object.entries(zipMap)) {
    cleanMap[z] = obj.fips;
  }

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cleanMap), 'utf8');
  console.log(`Generated zip to county mapping with ${Object.keys(cleanMap).length} ZIP codes at ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
