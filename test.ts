import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const _require = typeof require !== 'undefined' ? require : createRequire(import.meta.url);
const _filename = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const _dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(_filename);

console.log(_dirname);
