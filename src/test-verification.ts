import http from "http";

function testVerificationFirebase() {
  const req = http.request(
    "http://localhost:3000/api/admin/verification/firebase",
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
