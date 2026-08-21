import React from 'react';

/**
 * Wraps dynamic React.lazy imports with an automatic retry & cache-bust recovery handler.
 * When Vite/Rollup rebuilds chunks and the client holds a stale HTML bundle, dynamic imports
 * throw "Failed to fetch dynamically imported module". This utility catches that and reloads
 * the page once cleanly to pull the latest asset hashes.
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  componentName = 'Component'
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    const pageHasBeenForceRefreshed = window.sessionStorage.getItem(`retry_chunk_${componentName}`);

    try {
      const component = await componentImport();
      window.sessionStorage.removeItem(`retry_chunk_${componentName}`);
      return component;
    } catch (error: any) {
      console.warn(`[DynamicChunk] Failed to load lazy module '${componentName}':`, error);
      
      const isChunkError = 
        error?.message?.includes('dynamically imported module') ||
        error?.message?.includes('Importing a module script failed') ||
        error?.name === 'ChunkLoadError' ||
        error?.message?.includes('Failed to fetch');

      if (isChunkError && !pageHasBeenForceRefreshed) {
        window.sessionStorage.setItem(`retry_chunk_${componentName}`, 'true');
        // Force refresh to grab updated bundle manifests
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }

      throw error;
    }
  });
}
