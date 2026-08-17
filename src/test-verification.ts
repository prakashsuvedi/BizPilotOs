import http from "http";
import https from "https";

const apiBase = process.env.VITE_API_URL || process.env.API_BASE_URL || "http://localhost:3000";

function testVerificationFirebase() {
  const url = new URL("/api/admin/verification/firebase", apiBase);
  const client = url.protocol === "https:" ? https : http;
  const req = client.request(
    url.toString(),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    },
    (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          console.log("=================== VERIFICATION RESPONSE ===================");
          console.log(JSON.stringify(JSON.parse(data), null, 2));
          console.log("=============================================================");
        } catch (e) {
          console.log("Raw response:", data);
        }
      });
    }
  );

  req.on("error", (e) => {
    console.error("Request error:", e);
  });

  req.end();
}

testVerificationFirebase();
