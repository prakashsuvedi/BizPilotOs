import fs from 'fs';
import path from 'path';

let fixedCount = 0;
let checkedCount = 0;

function cleanFileEncoding(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    checkedCount++;
    let contentStr = '';
    let needsRewrite = false;

    // Check for UTF-8 BOM (0xEF 0xBB 0xBF)
    if (buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
      contentStr = buf.subarray(3).toString('utf8');
      needsRewrite = true;
      console.log(`[Fix Encoding] Stripped UTF-8 BOM from: ${filePath}`);
    } 
    // Check for UTF-16 LE BOM (0xFF 0xFE)
    else if (buf.length >= 2 && buf[0] === 0xFF && buf[1] === 0xFE) {
      contentStr = buf.subarray(2).toString('utf16le');
      needsRewrite = true;
      console.log(`[Fix Encoding] Converted UTF-16 LE to UTF-8: ${filePath}`);
    } 
    // Check for UTF-16 BE BOM (0xFE 0xFF)
    else if (buf.length >= 2 && buf[0] === 0xFE && buf[1] === 0xFF) {
      contentStr = buf.subarray(2).swap16().toString('utf16le');
      needsRewrite = true;
      console.log(`[Fix Encoding] Converted UTF-16 BE to UTF-8: ${filePath}`);
    } 
    // Regular UTF-8 decode
    else {
      contentStr = buf.toString('utf8');
    }

    // Strip Unicode BOM character if present at string start or anywhere
    if (contentStr.charCodeAt(0) === 0xFEFF || contentStr.includes('\uFEFF')) {
      contentStr = contentStr.replace(/\uFEFF/g, '');
      needsRewrite = true;
      console.log(`[Fix Encoding] Stripped embedded \\uFEFF character from: ${filePath}`);
    }

    // Strip any null bytes that might corrupt UTF-8 streams
    if (contentStr.includes('\0')) {
      contentStr = contentStr.replace(/\0/g, '');
      needsRewrite = true;
      console.log(`[Fix Encoding] Removed null bytes from: ${filePath}`);
    }

    // Rewrite file as explicit clean UTF-8
    const cleanBuf = Buffer.from(contentStr, 'utf8');
    if (needsRewrite || !buf.equals(cleanBuf)) {
      fs.writeFileSync(filePath, cleanBuf);
      fixedCount++;
    }
  } catch (err) {
    console.error(`[Fix Encoding] Error processing file ${filePath}:`, err);
  }
}

function traverseDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist' && entry.name !== '.vite') {
        traverseDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      if (/\.(tsx?|jsx?|json|css|html|md|js|cjs|mjs|svg|txt)$/i.test(entry.name)) {
        cleanFileEncoding(fullPath);
      }
    }
  }
}

console.log('[Fix Encoding] Starting source file encoding verification and cleanup...');

// 1. Process src/ directory recursively
traverseDirectory(path.join(process.cwd(), 'src'));

// 2. Process root configuration files
const rootFiles = ['index.html', 'vite.config.ts', 'server.ts', 'package.json', 'version.json'];
for (const file of rootFiles) {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    cleanFileEncoding(fullPath);
  }
}

console.log(`[Fix Encoding] Completed! Checked ${checkedCount} files. Fixed/rewritten ${fixedCount} files as pure UTF-8 without BOM.`);
