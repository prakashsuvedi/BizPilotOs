// copy-build.js
const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Determine target public path
const publicDir = path.join(__dirname, 'public');
const distDir = path.join(__dirname, 'dist');

console.log("[Asset Mirror] Mirroring built files into 'public' directory...");

try {
  // Ensure clean target directory
  if (fs.existsSync(publicDir)) {
    fs.rmSync(publicDir, { recursive: true, force: true });
  }
  fs.mkdirSync(publicDir, { recursive: true });

  // Copy dist contents into public
  if (fs.existsSync(distDir)) {
    fs.readdirSync(distDir).forEach(file => {
      const srcPath = path.join(distDir, file);
      const destPath = path.join(publicDir, file);
      copyRecursive(srcPath, destPath);
    });
    console.log("✨ Successfully mirrored 'dist/' into 'public/' for native cPanel Passenger static asset handling!");
  } else {
    console.warn("⚠️ No dist directory found to copy. Please run vite build first.");
  }
} catch (err) {
  console.error("❌ Failed to mirror assets into 'public':", err.message || err);
}
