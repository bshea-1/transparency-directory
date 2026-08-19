const fs = require("fs");
const path = require("path");
const { parse } = require("yaml");

const ROOT = path.resolve(__dirname, "..");
const CACHE_DIR = path.join(ROOT, ".cache");
const PEOPLE_DIR = process.env.OPENSTATES_PEOPLE_DIR || path.join(CACHE_DIR, "openstates-people");
const OUTPUT = path.join(ROOT, "src", "data", "representatives.json");
const COUNTIES = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "data", "counties.json"), "utf8"));

const RELATION_FILES = {
  lower: {
    file: path.join(CACHE_DIR, "sldl-county.txt"),
    url: "https://www2.census.gov/geo/docs/maps-data/data/rel2020/cd-sld/tab20_sldl202420_county20_natl.txt",
  },
  upper: {
    file: path.join(CACHE_DIR, "sldu-county.txt"),
    url: "https://www2.census.gov/geo/docs/maps-data/data/rel2020/cd-sld/tab20_sldu202420_county20_natl.txt",
  },
};

function normalizeDistrict(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/^(state )?(house|senate|assembly|legislative)?\s*district\s*/, "")
    .replace(/\s*(state )?(house|senate|assembly|legislative)?\s*district$/, "")
    .replace(/^0+(?=\d)/, "")
    .replace(/[^a-z0-9]/g, "");
}

function parseRelationshipFile(file) {
  const [headerLine, ...lines] = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/);
  const headers = headerLine.split("|");
  const districtIndex = headers.findIndex((header) => header.startsWith("GEOID_SLD"));
  const districtNameIndex = headers.findIndex((header) => header.startsWith("NAMELSAD_SLD"));
  const countyIndex = headers.findIndex((header) => header.startsWith("GEOID_COUNTY"));
  const result = new Map();

  for (const line of lines) {
    if (!line) continue;
    const fields = line.split("|");
    const districtGeoid = fields[districtIndex];
    const districtName = fields[districtNameIndex];
    const countyFips = fields[countyIndex];
    if (!districtGeoid || !countyFips || districtGeoid.endsWith("ZZZ")) continue;
    if (!result.has(countyFips)) result.set(countyFips, new Set());
    const districtCodes = [
      normalizeDistrict(districtGeoid.slice(2)),
      normalizeDistrict(districtName),
    ].filter(Boolean);
    for (const district of districtCodes) result.get(countyFips).add(district);
  }
  return result;
}

function pickOfficialUrl(links) {
  const urls = (links || []).map((link) => link?.url).filter(Boolean);
  return urls.find((url) => !/(ballotpedia|wikipedia|facebook|instagram|twitter|x\.com|linkedin|votesmart)/i.test(url)) || urls[0] || "";
}

function compactPerson(person, role, stateCode, sourcePath = "") {
  const office = (person.offices || []).find((item) => item.classification === "district") ||
    (person.offices || []).find((item) => item.classification === "capitol") ||
    (person.offices || [])[0];
  const party = Array.isArray(person.party) ? person.party.at(-1)?.name : person.party;
  const chamber = role.type === "lower" ? "State House" : role.type === "upper" ? "State Senate" : "State Legislature";
  return {
    id: person.id,
    name: person.name,
    party: party || "",
    chamber,
    district: String(role.district || ""),
    stateCode,
    email: person.email || "",
    phone: office?.voice || "",
    address: office?.address || "",
    officialUrl: pickOfficialUrl(person.links),
    sourcePath,
  };
}

function getCurrentRole(person) {
  const roles = (person.roles || []).filter((role) => ["lower", "upper", "legislature"].includes(role.type));
  return roles.find((role) => !role.end_date) || roles.at(-1);
}

function loadPeople() {
  const dataDir = path.join(PEOPLE_DIR, "data");
  if (!fs.existsSync(dataDir)) {
    throw new Error(`Open States people data not found at ${dataDir}. Clone https://github.com/openstates/people there or set OPENSTATES_PEOPLE_DIR.`);
  }

  const index = new Map();
  const allByState = new Map();
  for (const stateCode of fs.readdirSync(dataDir)) {
    if (!/^[a-z]{2}$/.test(stateCode)) continue;
    const legislatureDir = path.join(dataDir, stateCode, "legislature");
    if (!fs.existsSync(legislatureDir)) continue;
    const statePeople = [];
    for (const filename of fs.readdirSync(legislatureDir)) {
      if (!filename.endsWith(".yml")) continue;
      const fullPath = path.join(legislatureDir, filename);
      const person = parse(fs.readFileSync(fullPath, "utf8"));
      const role = getCurrentRole(person);
      if (!role?.district) continue;
      const compact = compactPerson(
        person,
        role,
        stateCode.toUpperCase(),
        path.relative(PEOPLE_DIR, fullPath).split(path.sep).join("/"),
      );
      const normalized = normalizeDistrict(role.district);
      const chambers = role.type === "legislature" ? ["upper", "lower"] : [role.type];
      for (const chamber of chambers) {
        const key = `${stateCode.toUpperCase()}:${chamber}:${normalized}`;
        if (!index.has(key)) index.set(key, []);
        index.get(key).push(compact);
      }
      statePeople.push(compact);
    }
    allByState.set(stateCode.toUpperCase(), statePeople);
  }
  return { index, allByState };
}

function ensureInputs() {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  for (const config of Object.values(RELATION_FILES)) {
    if (!fs.existsSync(config.file)) {
      throw new Error(`Missing ${config.file}. Download it from ${config.url}`);
    }
  }
}

function build() {
  ensureInputs();
  const lowerRelations = parseRelationshipFile(RELATION_FILES.lower.file);
  const upperRelations = parseRelationshipFile(RELATION_FILES.upper.file);
  const { index, allByState } = loadPeople();
  const people = {};
  const countyRepresentatives = {};
  let countiesWithMatches = 0;

  for (const county of COUNTIES) {
    const ids = new Set();
    const addMatches = (chamber, districts) => {
      for (const district of districts || []) {
        for (const person of index.get(`${county.stateCode}:${chamber}:${district}`) || []) {
          people[person.id] = person;
          ids.add(person.id);
        }
      }
    };
    addMatches("lower", lowerRelations.get(county.fips));
    addMatches("upper", upperRelations.get(county.fips));

    if (county.stateCode === "DC" && ids.size === 0) {
      for (const person of allByState.get("DC") || []) {
        people[person.id] = person;
        ids.add(person.id);
      }
    }

    const sortedIds = [...ids].sort((a, b) => {
      const left = people[a];
      const right = people[b];
      return left.chamber.localeCompare(right.chamber) || left.district.localeCompare(right.district, undefined, { numeric: true }) || left.name.localeCompare(right.name);
    });
    countyRepresentatives[county.fips] = sortedIds;
    if (sortedIds.length) countiesWithMatches++;
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    legislativeDistrictVintage: "2024",
    people,
    counties: countyRepresentatives,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(payload)}\n`);
  console.log(`Wrote ${Object.keys(people).length} legislators across ${countiesWithMatches}/${COUNTIES.length} counties to ${OUTPUT}`);
}

build();
