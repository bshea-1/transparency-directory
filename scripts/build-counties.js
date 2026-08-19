const fs = require('fs');
const path = require('path');
const https = require('https');

async function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchText(res.headers.location));
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Building counties dataset...');
  const censusUrl = 'https://www2.census.gov/geo/docs/reference/codes2020/national_county2020.txt';
  console.log('Fetching from Census:', censusUrl);
  const data = await fetchText(censusUrl);
  const lines = data.split('\n').filter(l => l.trim().length > 0);
  
  const counties = [];
  
  const stateNames = {
    AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
    CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
    HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
    KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
    MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
    MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
    NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
    OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
    SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
    VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
    DC: "District of Columbia"
  };

  for (const line of lines) {
    const parts = line.split('|');
    if (parts.length >= 5 && parts[0] !== 'STATE') {
      const stateCode = parts[0].trim();
      const stateFips = parts[1].trim();
      const countyFips = parts[2].trim();
      const rawCountyName = parts[4].trim();
      const fullFips = stateFips + countyFips;
      
      let cleanedRawName = rawCountyName
        .replace(/ County$/i, '')
        .replace(/ Parish$/i, '')
        .replace(/ Borough$/i, '')
        .replace(/ Census Area$/i, '')
        .replace(/ Municipality$/i, '')
        .replace(/ City and Borough$/i, '')
        .replace(/ City$/i, '')
        .trim();

      if (stateNames[stateCode]) {
        counties.push({
          fips: fullFips,
          name: rawCountyName,
          rawName: cleanedRawName,
          stateCode: stateCode,
          stateName: stateNames[stateCode],
        });
      }
    }
  }

  console.log(`Successfully parsed ${counties.length} US counties.`);
  const outPath = path.resolve(__dirname, '../src/data/counties.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(counties, null, 2), 'utf8');
  console.log(`Wrote counties to ${outPath}`);
}

main().catch(console.error);
