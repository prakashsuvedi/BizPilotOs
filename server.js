// server.js
// This is the production entry point for cPanel Node.js (Phusion Passenger) deployments.
// It executes the fully bundled and optimized application server from the dist folder.

const fs = require("fs");
const path = require("path");

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
  
  require("./dist/server.cjs");
} catch (startupError) {
  console.error("[cPanel Entry] FATAL STARTUP EXCEPTION ENCOUNTERED:", startupError);

  // In production cPanel environments, Passenger returns a generic "503 Service Unavailable"
  // if Node crashes on startup. To prevent this black-box failure, we spawn a zero-dependency
  // diagnostic server that binds to the assigned port and displays the exact traceback.
  const http = require("http");

  const server = http.createServer((req, res) => {
    // Only intercept and render diagnosis page
    res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
    
    // Construct rich forensic information
    const errorCode = startupError.code || "UNKNOWN_ERROR";
    const errorMessage = startupError.message || String(startupError);
    const errorStack = startupError.stack || "No stack trace available.";
    
    let advice = "Verify that all backend production dependencies are correctly installed.";
    if (errorCode === "BUNDLE_MISSING") {
      advice = `<strong>Production bundle missing!</strong> The compiled backend code (<code>dist/server.cjs</code>) was not found. Please log in to your server or build directory, and run <code>npm install && npm run build</code> to compile the frontend and bundle the backend before starting.`;
    } else if (errorCode === "MODULE_NOT_FOUND") {
      advice = `<strong>Missing dependency detected!</strong> One of the external libraries required by the production bundle could not be found. Open the cPanel Terminal, navigate to the application folder, and run <code>npm install</code> to restore all node_modules packages.`;
    } else if (errorMessage.includes("EADDRINUSE")) {
      advice = `<strong>Port conflicts:</strong> The specified socket or port is already locked by another running Node process. Try restarting the Node.js application in your cPanel dashboard to release bound resources.`;
    } else if (errorMessage.includes("permission") || errorMessage.includes("EACCES")) {
      advice = `<strong>Permission failure:</strong> Node.js does not have access permissions to write to the requested directory or listen on this socket. Inspect files ownership and permissions.`;
    }

    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MarketForge AI — Production Forensic Diagnostics</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              padding: 2.5rem;
              background-color: #f8fafc;
              color: #1e293b;
              margin: 0;
              line-height: 1.5;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: #ffffff;
              padding: 2.5rem;
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
              border: 1px solid #e2e8f0;
            }
            .header {
              border-bottom: 2px solid #f1f5f9;
              padding-bottom: 1.5rem;
              margin-bottom: 2rem;
            }
            h1 {
              color: #dc2626;
              font-size: 24px;
              font-weight: 700;
              margin: 0 0 0.5rem 0;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
            p.lead {
              color: #64748b;
              font-size: 16px;
              margin: 0;
            }
            .advice-card {
              background-color: #fef2f2;
              border-left: 4px solid #dc2626;
              padding: 1rem 1.25rem;
              border-radius: 4px;
              margin-bottom: 2rem;
              color: #991b1b;
              font-size: 14.5px;
            }
            .trace-header {
              font-weight: 600;
              font-size: 14px;
              color: #475569;
              margin-bottom: 0.5rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            pre {
              background-color: #0f172a;
              color: #38bdf8;
              padding: 1.25rem;
              border-radius: 8px;
              overflow-x: auto;
              font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
              font-size: 13.5px;
              line-height: 1.6;
              margin: 0 0 2rem 0;
              border: 1px solid #1e293b;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 1rem;
              background-color: #f8fafc;
              padding: 1.25rem;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
              font-size: 13px;
              color: #475569;
            }
            .meta-item strong {
              color: #0f172a;
            }
            .footer {
              margin-top: 3rem;
              text-align: center;
              font-size: 12px;
              color: #94a3b8;
              border-top: 1px solid #f1f5f9;
              padding-top: 1.5rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Production Startup Exception</h1>
              <p class="lead">The Node.js server failed to bootstrap. Phusion Passenger has routed requests to this forensic diagnostic page.</p>
            </div>

            <div class="advice-card">
              <strong>Actionable Remediation:</strong><br/>
              ${advice}
            </div>

            <div class="trace-header">Exception Stack Trace</div>
            <pre><code>${errorStack}</code></pre>

            <div class="trace-header">System Environment Context</div>
            <div class="meta-grid">
              <div class="meta-item"><strong>Node Version:</strong> ${process.version}</div>
              <div class="meta-item"><strong>Platform:</strong> ${process.platform}</div>
              <div class="meta-item"><strong>Working Directory:</strong> ${process.cwd()}</div>
              <div class="meta-item"><strong>Script Path:</strong> ${__filename}</div>
              <div class="meta-item"><strong>Environment Class:</strong> ${process.env.NODE_ENV || "Not Set"}</div>
              <div class="meta-item"><strong>Assigned Port/Socket:</strong> ${process.env.PORT || "Default (3000)"}</div>
            </div>

            <div class="footer">
              MarketForge AI™ Production Engine • Diagnostics Core v1.1 • SOC2 Observability Layer Enforced
            </div>
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

