// server.cjs
// CommonJS Production entry point for cPanel Node.js (Phusion Passenger).
// Explicitly uses .cjs extension to force CommonJS mode regardless of "type": "module" in package.json.

const fs = require("fs");
const path = require("path");
const http = require("http");

function bootstrap() {
  try {
    console.log("[cPanel CommonJS Entry] Bootstrapping production environment...");
    
    const distServerPath = path.join(__dirname, "dist", "server.cjs");
    if (!fs.existsSync(distServerPath)) {
      const missingError = new Error(
        "The production bundle './dist/server.cjs' is missing. Please run 'npm run build' first."
      );
      missingError.code = "BUNDLE_MISSING";
      throw missingError;
    }
    
    require("./dist/server.cjs");
  } catch (startupError) {
    console.error("[cPanel Entry] FATAL STARTUP EXCEPTION ENCOUNTERED:", startupError);

    const server = http.createServer((req, res) => {
      res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
      
      const errorCode = startupError.code || "UNKNOWN_ERROR";
      const errorMessage = startupError.message || String(startupError);
      const errorStack = startupError.stack || "No stack trace available.";
      
      let advice = "Verify that all backend production dependencies are installed.";
      if (errorCode === "BUNDLE_MISSING") {
        advice = `<strong>Production bundle missing!</strong> The file <code>dist/server.cjs</code> was not found. Please run <code>npm run build</code> in cPanel Terminal.`;
      } else if (errorCode === "MODULE_NOT_FOUND") {
        advice = `<strong>Missing dependency!</strong> Run <code>npm install</code> in cPanel Terminal.`;
      }

      res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>MarketForge AI — Production Diagnostics</title>
            <style>
              body { font-family: sans-serif; padding: 2rem; background: #f8fafc; color: #1e293b; }
              .container { max-width: 750px; margin: 0 auto; background: #fff; padding: 2rem; border-radius: 8px; border: 1px solid #cbd5e1; }
              h1 { color: #dc2626; }
              pre { background: #0f172a; color: #38bdf8; padding: 1rem; border-radius: 6px; overflow-x: auto; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>⚠️ Production Startup Error</h1>
              <p>${advice}</p>
              <pre><code>${errorStack}</code></pre>
            </div>
          </body>
        </html>
      `);
    });

    const rawPort = process.env.PORT || 3000;
    const finalPort = (!isNaN(Number(rawPort))) ? Number(rawPort) : rawPort;

    server.listen(finalPort, () => {
      console.log("[cPanel Entry] Diagnostic server running on port:", finalPort);
    });
  }
}

bootstrap();
