import http from "http";

const endpoints = [
  { path: "/api/admin/verification/firebase", method: "POST" },
  { path: "/api/admin/verification/auth", method: "GET" },
  { path: "/api/admin/verification/create-admin", method: "POST" },
  { path: "/api/admin/verification/collections", method: "POST" },
  { path: "/api/admin/verification/code-scan", method: "GET" },
  { path: "/api/admin/verification/button-trace", method: "GET" },
  { path: "/api/admin/verification/multi-tenant", method: "POST" },
  { path: "/api/admin/verification/readiness-report", method: "GET" },
  { path: "/api/admin/verification/gemini", method: "POST" },
  { path: "/api/admin/verification/email", method: "POST" },
  { path: "/api/admin/verification/cpanel", method: "POST" },
  { path: "/api/admin/verification/social", method: "GET" },
  { path: "/api/admin/verification/storage", method: "POST" },
  { path: "/api/admin/verification/security-scan", method: "GET" },
  { path: "/api/admin/verification/secrets", method: "GET" }
];

async function runRequest(endpoint: typeof endpoints[0]): Promise<any> {
  return new Promise((resolve) => {
    const req = http.request(
      `http://localhost:3000${endpoint.path}`,
      {
        method: endpoint.method,
        headers: {
          "Content-Type": "application/json"
        }
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => { data += chunk; });
        res.on("end", () => {
          try {
            resolve({ path: endpoint.path, status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ path: endpoint.path, status: res.statusCode, raw: data.substring(0, 500) });
          }
        });
      }
    );
    req.on("error", (err) => {
      resolve({ path: endpoint.path, error: err.message });
    });
    req.end();
  });
}

async function main() {
  console.log("=================== RUNNING ALL VERIFICATION ENDPOINTS ===================");
  for (const ep of endpoints) {
    const result = await runRequest(ep);
    console.log(`\nEndpoint: ${ep.method} ${ep.path}`);
    console.log(`Status: ${result.status || "ERROR"}`);
    if (result.error) {
      console.log(`Error: ${result.error}`);
    } else if (result.data) {
      if (result.data.success === false || (result.data.error && String(result.data.error).includes("credentials"))) {
        console.log("❌ FAILED WITH DETAIL:", JSON.stringify(result.data, null, 2));
      } else {
        console.log("✅ SUCCESS (Subset of response):", JSON.stringify(result.data, null, 2).substring(0, 300) + "...");
      }
    } else {
      console.log("Raw Response:", result.raw);
    }
  }
  console.log("\n==========================================================================");
}

main();
