/**
 * Utility to process uploaded image files/Data URLs while preserving crisp vector/raster quality.
 * Prevents LocalStorage QuotaExceededError while ensuring zero blurriness for logos.
 */
export async function compressImageDataUrl(
  dataUrl: string,
  maxDimension = 1800,
  quality = 0.95
): Promise<string> {
  // If it's SVG or under 450KB (~450,000 chars), return original dataUrl without touching a single pixel
  if (dataUrl.startsWith('data:image/svg+xml') || dataUrl.length < 450000) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width <= 0 || height <= 0) {
        resolve(dataUrl);
        return;
      }

      // Maintain crisp high resolution up to maxDimension (default 1800px)
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      } else {
        // If dimensions are within maxDimension and image is small enough, resolve original
        resolve(dataUrl);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      // Enable high quality image smoothing for canvas scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Attempt high-quality PNG export first to preserve transparency and sharp vector text
      try {
        const compressedPng = canvas.toDataURL('image/png');
        if (compressedPng.length < dataUrl.length) {
          resolve(compressedPng);
          return;
        }
      } catch (e) {}

      // Fallback to high-quality WebP
      try {
        const compressedWebp = canvas.toDataURL('image/webp', quality);
        if (compressedWebp.length < dataUrl.length) {
          resolve(compressedWebp);
          return;
        }
      } catch (e) {}

      resolve(dataUrl);
    };

    img.onerror = () => {
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}

/**
 * Clears non-essential heavy local storage entries if quota is exceeded.
 */
export function clearStaleLocalStorageCache(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToClean = [
      'mf_telemetry_metrics',
      'aios_eventLog',
      'aios_dlq',
      'aios_memory',
      'marketforge_sa_audits'
    ];

    keysToClean.forEach((key) => {
      try {
        const val = localStorage.getItem(key);
        if (val && val.length > 50000) {
          // If array, trim to last 5 items
          if (val.startsWith('[')) {
            const arr = JSON.parse(val);
            if (Array.isArray(arr)) {
              localStorage.setItem(key, JSON.stringify(arr.slice(-5)));
            } else {
              localStorage.removeItem(key);
            }
          } else {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {}
    });
  } catch (e) {
    console.warn('Error cleaning stale localStorage cache:', e);
  }
}
