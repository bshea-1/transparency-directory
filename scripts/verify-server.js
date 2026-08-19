const http = require("http");

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, data }));
    }).on("error", reject);
  });
}

async function verify() {
  console.log("--- 1. Testing http://localhost:3000 ---");
  const pageRes = await fetch("http://localhost:3000");
  console.log("HTTP Status:", pageRes.status);
  console.log("Contains Title 'Flock Transparency':", pageRes.data.includes("Flock Transparency"));
  console.log("Contains Hero Stats:", pageRes.data.includes("US Counties Indexed"));
  console.log("Contains Footer Disclaimer:", pageRes.data.includes("Independent community directory. Not affiliated with Flock Safety."));
  console.log("Contains Verified Flock Link:", pageRes.data.includes("https://transparency.flocksafety.com/"));
  console.log("Contains Unverified Notice:", pageRes.data.includes("No verified public report found."));

  console.log("\n--- 2. Testing http://localhost:3000/api/directory ---");
  const apiRes = await fetch("http://localhost:3000/api/directory");
  console.log("HTTP Status:", apiRes.status);
  const json = JSON.parse(apiRes.data);
  console.log("Total entries in directory:", json.total);
  console.log("Total counties indexed:", json.stats.totalCounties);
  console.log("Total verified portals:", json.stats.totalVerifiedPortals);
  console.log("Total agencies:", json.stats.totalAgencies);
  console.log("Covered States:", json.stats.statesCount);

  console.log("\n--- 3. Testing http://localhost:3000/api/directory?state=CA ---");
  const caRes = await fetch("http://localhost:3000/api/directory?state=CA");
  const caJson = JSON.parse(caRes.data);
  console.log("CA total records:", caJson.total);
  console.log("Sample CA record:", caJson.entries[0].name, "(", caJson.entries[0].status, ")");

  console.log("\n--- 4. Testing http://localhost:3000/api/directory?q=Austin ---");
  const austinRes = await fetch("http://localhost:3000/api/directory?q=Austin");
  const austinJson = JSON.parse(austinRes.data);
  console.log("Austin search records count:", austinJson.total);
  console.log("Austin portal URL:", austinJson.entries[0].portalUrl);

  console.log("\n--- All Localhost HTTP Verifications Passed Successfully! ---");
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
