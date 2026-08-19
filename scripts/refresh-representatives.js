const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CACHE_DIR = path.join(ROOT, ".cache");
const PEOPLE_DIR = path.join(CACHE_DIR, "openstates-people");
const SOURCES = [
  [
    "https://www2.census.gov/geo/docs/maps-data/data/rel2020/cd-sld/tab20_sldl202420_county20_natl.txt",
    path.join(CACHE_DIR, "sldl-county.txt"),
  ],
  [
    "https://www2.census.gov/geo/docs/maps-data/data/rel2020/cd-sld/tab20_sldu202420_county20_natl.txt",
    path.join(CACHE_DIR, "sldu-county.txt"),
  ],
];

async function download(url, output) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to download ${url}: ${response.status}`);
  await fs.promises.writeFile(output, Buffer.from(await response.arrayBuffer()));
}

async function main() {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  if (fs.existsSync(path.join(PEOPLE_DIR, ".git"))) {
    execFileSync("git", ["-C", PEOPLE_DIR, "pull", "--ff-only"], { stdio: "inherit" });
  } else {
    fs.rmSync(PEOPLE_DIR, { recursive: true, force: true });
    execFileSync("git", ["clone", "--depth", "1", "https://github.com/openstates/people.git", PEOPLE_DIR], { stdio: "inherit" });
  }

  for (const [url, output] of SOURCES) await download(url, output);
  execFileSync(process.execPath, [path.join(__dirname, "build-representatives.js")], { stdio: "inherit" });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
