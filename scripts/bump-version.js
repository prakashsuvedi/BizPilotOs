import fs from 'fs';
import path from 'path';

const versionFilePath = path.join(process.cwd(), 'version.json');
const packageFilePath = path.join(process.cwd(), 'package.json');

try {
  let versionData = { version: '1.0.0', build: 100, stage: 'production-ready', lastUpdated: new Date().toISOString() };
  if (fs.existsSync(versionFilePath)) {
    versionData = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
  }

  versionData.build += 1;
  versionData.lastUpdated = new Date().toISOString();

  fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2), 'utf8');

  if (fs.existsSync(packageFilePath)) {
    const pkg = JSON.parse(fs.readFileSync(packageFilePath, 'utf8'));
    pkg.version = versionData.version;
    fs.writeFileSync(packageFilePath, JSON.stringify(pkg, null, 2), 'utf8');
  }

  console.log(`[Version Auto-Increment] Version ${versionData.version} (Build #${versionData.build}) - Updated ${versionData.lastUpdated}`);
} catch (err) {
  console.error('[Version Auto-Increment] Failed to auto-increment version:', err);
}
