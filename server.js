// server.js
// Production entry point for cPanel Node.js (Phusion Passenger) deployments.
// Compatible with Node.js ES Modules ("type": "module" in package.json).

import fs from "fs";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function bootstrap() {
  try {
    console.log("[cPanel Entry] Bootstrapping production environment...");
    
    const distServerPath = path.join(__dirname, "dist", "server.cjs");
    if (!fs.existsSync(distServerPath)) {
      const missingError = new Error(
        "The production bundle './dist/server.cjs' is missing. Please ensure you build the application first by running 'npm run build'."
      );
      missingError.code = "BUNDLE_MISSING";
      throw missingError;
    }
    
    // Use dynamic import for loading the bundled CommonJS production server
    await import("./dist/server.cjs");
  } catch (startupError) {
    console.error("[cPanel Entry] FATAL STARTUP EXCEPTION ENCOUNTERED:", startupError);

    // Diagnostic HTTP server if bootstrap fails
    const server = http.createServer((req, res) => {
      res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
      
      const errorCode = startupError.code || "UNKNOWN_ERROR";
      const errorMessage = startupError.message || String(startupError);
      const errorStack = startupError.stack || "No stack trace available.";
      
      let advice = "Verify that all backend production dependencies are correctly installed.";
      if (errorCode === "BUNDLE_MISSING") {
        advice = `<strong>Production bundle missing!</strong> The compiled backend code (<code>dist/server.cjs</code>) was not found. Please log in to your server or build directory, and run <code>npm run build</code> to compile the frontend and bundle the backend before starting.`;
      } else if (errorCode === "MODULE_NOT_FOUND") {
        advice = `<strong>Missing dependency detected!</strong> One of the external libraries required by the production bundle could not be found. Open cPanel Terminal and run <code>npm install</code>.`;
      } else if (errorMessage.includes("EADDRINUSE")) {
        advice = `<strong>Port conflicts:</strong> The specified socket or port is locked. Try restarting the Node.js application in your cPanel dashboard.`;
      } else if (errorMessage.includes("permission") || errorMessage.includes("EACCES")) {
        advice = `<strong>Permission failure:</strong> Node.js does not have permission to access files or listen on this socket.`;
      }

      res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>MarketForge AI — Production Forensic Diagnostics</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 2.5rem; background: #f8fafc; color: #1e293b; line-height: 1.5; }
              .container { max-width: 800px; margin: 0 auto; background: #ffffff; padding: 2.5rem; border-radius: 12px; border: 1px solid #e2e8f0; }
              h1 { color: #dc2626; font-size: 24px; font-weight: 700; margin-bottom: 0.5rem; }
              .lead { color: #64748b; font-size: 16px; margin-bottom: 1.5rem; }
              .advice-card { background: #fef2f2; border-left: 4px solid #dc2626; padding: 1rem 1.25rem; border-radius: 4px; margin-bottom: 2rem; color: #991b1b; }
              pre { background: #0f172a; color: #38bdf8; padding: 1.25rem; border-radius: 8px; overflow-x: auto; font-family: monospace; font-size: 13.5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>⚠️ Production Startup Exception</h1>
              <p class="lead">The Node.js server failed to bootstrap.</p>
              <div class="advice-card"><strong>Actionable Remediation:</strong><br/>${advice}</div>
              <div style="font-weight:600; margin-bottom:0.5rem; color:#475569;">Exception Stack Trace</div>
              <pre><code>${errorStack}</code></pre>
            </div>
          </body>
        </html>
      `);
    });

    const rawPort = process.env.PORT || 3000;
    const isNumeric = typeof rawPort === "number" || (typeof rawPort === "string" && !isNaN(Number(rawPort)) && rawPort.trim() !== "");
    const finalPort = isNumeric ? Number(rawPort) : rawPort;

    server.listen(finalPort, () => {
      console.log("[cPanel Entry] Diagnostic HTTP server actively listening on:", finalPort);
    });
  }
}

bootstrap();
