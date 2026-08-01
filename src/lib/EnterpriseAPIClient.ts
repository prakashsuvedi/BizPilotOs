/**
 * MarketForge AI™ — Enterprise HTTP Client
 * Secure wrapper for API communications, embedding retry policies, correlation traces, and telemetries.
 */

import { telemetry } from './telemetry/index.ts';
import {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  TimeoutError,
  BaseEnterpriseError,
  DatabaseError,
} from './errors/index.ts';

export interface RequestOptions extends RequestInit {
  timeout?: number;
  maxRetries?: number;
  correlationId?: string;
  skipErrorNormalization?: boolean;
}

class EnterpriseAPIClient {
  private static instance: EnterpriseAPIClient;
  private readonly defaultTimeout = 30000; // 30 seconds
  private readonly defaultRetries = 2;

  private constructor() {}

  public static getInstance(): EnterpriseAPIClient {
    if (!EnterpriseAPIClient.instance) {
      EnterpriseAPIClient.instance = new EnterpriseAPIClient();
    }
    return EnterpriseAPIClient.instance;
  }

  /**
   * Universal fetch with timeout, correlation headers, and automated retries
   */
  public async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const correlationId = options.correlationId || `corr_${Math.random().toString(36).substr(2, 9)}`;
    const maxRetries = options.maxRetries ?? this.defaultRetries;
    const timeout = options.timeout ?? this.defaultTimeout;

    // Standard headers for all corporate enterprise calls
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    
    // Inject secure telemetry & tracer metadata
    headers.set('X-Correlation-ID', correlationId);
    headers.set('X-Client-Timestamp', new Date().toISOString());

    // Automatically inject JWT if available in local state
    if (typeof window !== 'undefined') {
      const tenant = localStorage.getItem('mf_simulated_tenant') || 'demo-tenant';
      const role = localStorage.getItem('mf_simulated_role') || 'owner';
      headers.set('Authorization', 'Bearer MOCK_ENTERPRISE_JWT_TOKEN_123');
      headers.set('x-simulated-tenant', tenant);
      headers.set('x-simulated-role', role);
    }

    let attempt = 0;
    
    const executeAttempt = async (): Promise<T> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const requestConfig: RequestInit = {
        ...options,
        headers,
        signal: options.signal || controller.signal,
      };

      try {
        const response = await fetch(path, requestConfig);
        clearTimeout(timeoutId);

        if (!response.ok) {
          const bodyText = await response.text();
          let parsedError;
          try {
            parsedError = JSON.parse(bodyText);
          } catch {
            parsedError = { message: bodyText };
          }

          const errMsg = parsedError.message || parsedError.error || `HTTP ${response.status} Error`;
          
          if (response.status === 401) {
            throw new AuthenticationError(errMsg, correlationId);
          } else if (response.status === 403) {
            throw new AuthorizationError(errMsg, correlationId);
          } else if (response.status === 429) {
            throw new RateLimitError(errMsg, correlationId);
          } else if (response.status === 400) {
            throw new ValidationError(errMsg, correlationId);
          } else {
            throw new BaseEnterpriseError(errMsg, `HTTP_${response.status}_FAULT`, 'medium', response.status >= 500, correlationId);
          }
        }

        const dataText = await response.text();
        if (!dataText) return {} as T;
        return JSON.parse(dataText) as T;
      } catch (err: any) {
        clearTimeout(timeoutId);
        
        if (err.name === 'AbortError') {
          throw new TimeoutError(`Request to ${path} exceeded timeout limit of ${timeout}ms`, correlationId);
        }
        throw err;
      }
    };

    const runRetryLoop = async (): Promise<T> => {
      try {
        return await telemetry.instrument('api', `HTTP_${options.method || 'GET'}_${path}`, () => executeAttempt(), `Correlation: ${correlationId}`);
      } catch (err: any) {
        if (err instanceof BaseEnterpriseError && err.retryable && attempt < maxRetries) {
          attempt++;
          const backoffDelay = Math.pow(2, attempt) * 1000;
          console.warn(`[EnterpriseAPIClient] Retrying ${path} (Attempt ${attempt}/${maxRetries}) in ${backoffDelay}ms due to: ${err.message}`);
          await new Promise((res) => setTimeout(res, backoffDelay));
          return runRetryLoop();
        }
        throw err;
      }
    };

    return runRetryLoop();
  }

  // Sugar wrappers for HTTP verbs
  public get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  public post<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  public put<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  public patch<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  public delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const api = EnterpriseAPIClient.getInstance();
export default api;
