/**
 * MarketForge OS - Transparent API Interceptor
 * Automatically routes relative `/api/*` requests to the configured production API base URL
 * (e.g. https://marketforge-api-vpgj.onrender.com or VITE_API_URL) when running on separate frontend hosting.
 */

import { getApiBaseUrl, getApiRoutingMode } from './platformConfig';

let interceptorInstalled = false;

export function initApiInterceptors() {
  if (interceptorInstalled || typeof window === 'undefined') {
    return;
  }

  try {
    const rawFetch = window.fetch || (typeof globalThis !== 'undefined' ? globalThis.fetch : null);
    if (!rawFetch || typeof rawFetch !== 'function') {
      return;
    }

    const originalFetch = rawFetch.bind(typeof window !== 'undefined' ? window : globalThis);

    const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      // In SAME_ORIGIN_API mode: leave all /api/* requests completely untouched without rewriting or modifying headers/credentials
      const routingMode = getApiRoutingMode();
      if (routingMode !== 'EXTERNAL_API') {
        return originalFetch(input, init);
      }

      let url: string;
      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof URL) {
        url = input.toString();
      } else if (input && typeof (input as any).url === 'string') {
        url = (input as any).url;
      } else {
        url = String(input);
      }

      // Check if this is a relative API request (e.g. "/api/..." or "api/...")
      const isRelativeApi = /^\/?api\//.test(url);

      if (isRelativeApi) {
        const apiBaseUrl = getApiBaseUrl();
        const currentOrigin = typeof window !== 'undefined' && window.location ? window.location.origin : '';

        // In EXTERNAL_API mode: rewrite relative path to point to external backend API
        if (apiBaseUrl && currentOrigin && apiBaseUrl !== currentOrigin) {
          const cleanPath = url.startsWith('/') ? url : `/${url}`;
          const targetUrl = `${apiBaseUrl.replace(/\/+$/, '')}${cleanPath}`;

          const modifiedInit: RequestInit = {
            ...init,
            credentials: init?.credentials || 'include'
          };

          if (typeof Request !== 'undefined' && input instanceof Request) {
            try {
              const newRequest = new Request(targetUrl, {
                method: input.method,
                headers: input.headers,
                body: (input.method !== 'GET' && input.method !== 'HEAD') ? input.body : undefined,
                mode: 'cors',
                credentials: input.credentials || 'include',
                cache: input.cache,
                redirect: input.redirect,
                referrer: input.referrer,
                integrity: input.integrity,
                signal: input.signal,
                ...init
              });
              return originalFetch(newRequest);
            } catch {
              return originalFetch(targetUrl, modifiedInit);
            }
          }

          return originalFetch(targetUrl, modifiedInit);
        }
      }

      return originalFetch(input, init);
    };

    // Safely attempt to install interceptor without throwing if window.fetch has only a getter
    let installed = false;
    try {
      (window as any).fetch = customFetch;
      installed = true;
    } catch {
      // Ignore assignment error and try defineProperty
    }

    if (!installed) {
      try {
        Object.defineProperty(window, 'fetch', {
          value: customFetch,
          writable: true,
          configurable: true,
          enumerable: true
        });
        installed = true;
      } catch {
        // Fallback or ignore if environment restricts window modification
      }
    }

    if (!installed && typeof globalThis !== 'undefined') {
      try {
        (globalThis as any).fetch = customFetch;
      } catch {
        // Ignore if globalThis is also sealed
      }
    }

    interceptorInstalled = true;
  } catch (err) {
    console.warn("[API Interceptor] Could not install global fetch interceptor:", err);
  }
}
