/**
 * MarketForge AI™ — Enterprise Offline & Sync Engine
 * Highly resilient offline sync daemon tracking state, queue inspection, and conflict resolution.
 */

import { api } from './EnterpriseAPIClient.ts';
import { telemetry } from './telemetry/index.ts';

export interface SyncTask {
  id: string;
  category: string;
  action: string;
  path: string;
  payload: any;
  timestamp: string;
  retries: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  error?: string;
}

export interface SyncEngineListener {
  onQueueChanged?: (queue: SyncTask[]) => void;
  onSyncStatusChanged?: (status: 'idle' | 'syncing' | 'offline' | 'error') => void;
  onConflictDetected?: (details: string) => void;
}

class EnterpriseSyncEngine {
  private static instance: EnterpriseSyncEngine;
  private queue: SyncTask[] = [];
  private isPaused: boolean = false;
  private syncStatus: 'idle' | 'syncing' | 'offline' | 'error' = 'idle';
  private listeners: Set<SyncEngineListener> = new Set();
  private timerId: any = null;

  private constructor() {
    this.restoreQueue();
    this.initializeNetworkListeners();
    this.startSyncDaemon();
  }

  public static getInstance(): EnterpriseSyncEngine {
    if (!EnterpriseSyncEngine.instance) {
      EnterpriseSyncEngine.instance = new EnterpriseSyncEngine();
    }
    return EnterpriseSyncEngine.instance;
  }

  private initializeNetworkListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        telemetry.trackMetric('sync', 'network_status', 1, 'count', true, 'Network online, restarting sync daemon');
        this.setSyncStatus('idle');
        this.processQueue();
      });
      window.addEventListener('offline', () => {
        telemetry.trackMetric('sync', 'network_status', 0, 'count', false, 'Network offline, caching sync queue');
        this.setSyncStatus('offline');
      });
    }
  }

  private startSyncDaemon() {
    if (typeof window !== 'undefined') {
      this.timerId = setInterval(() => {
        if (!this.isPaused && this.isOnline()) {
          this.processQueue();
        }
      }, 10000); // Poll/process queue every 10 seconds if idle
    }
  }

  public isOnline(): boolean {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  }

  private restoreQueue() {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('mf_sync_queue');
        if (cached) {
          this.queue = JSON.parse(cached);
        }
      } catch (err) {
        console.error('Failed to restore sync queue from localStorage:', err);
      }
    }
  }

  private saveQueue() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mf_sync_queue', JSON.stringify(this.queue));
      } catch (err) {
        console.error('Failed to save sync queue to localStorage:', err);
      }
    }
    this.notifyQueueChanged();
  }

  private notifyQueueChanged() {
    this.listeners.forEach(l => l.onQueueChanged?.(this.queue));
  }

  private setSyncStatus(status: typeof this.syncStatus) {
    this.syncStatus = status;
    this.listeners.forEach(l => l.onSyncStatusChanged?.(status));
  }

  /**
   * Registers listener callbacks for reactive dashboard UI indicators
   */
  public subscribe(listener: SyncEngineListener) {
    this.listeners.add(listener);
    listener.onQueueChanged?.(this.queue);
    listener.onSyncStatusChanged?.(this.syncStatus);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Enqueues a new sync operation (e.g. background autosave) with automatic deduplication
   */
  public enqueue(category: string, action: string, path: string, payload: any) {
    // If there's an existing pending task for this category and action, merge/deduplicate it to avoid write spam
    const existingIdx = this.queue.findIndex(t => t.category === category && t.action === action && t.status === 'pending');
    
    if (existingIdx !== -1) {
      this.queue[existingIdx].payload = payload;
      this.queue[existingIdx].timestamp = new Date().toISOString();
      telemetry.trackMetric('sync', 'task_deduplicated', 1, 'count', true, `Merged task ${category}:${action}`);
    } else {
      const task: SyncTask = {
        id: `tsk_${Math.random().toString(36).substr(2, 9)}`,
        category,
        action,
        path,
        payload,
        timestamp: new Date().toISOString(),
        retries: 0,
        status: 'pending'
      };
      this.queue.push(task);
      telemetry.trackMetric('sync', 'task_enqueued', 1, 'count', true, `Enqueued task ${category}:${action}`);
    }

    this.saveQueue();
    
    if (this.isOnline() && !this.isPaused) {
      this.processQueue();
    }
  }

  /**
   * Processes the pending task queue sequentially with error backoffs
   */
  public async processQueue() {
    if (this.queue.length === 0 || this.isPaused || this.syncStatus === 'syncing') {
      return;
    }

    if (!this.isOnline()) {
      this.setSyncStatus('offline');
      return;
    }

    this.setSyncStatus('syncing');
    telemetry.trackMetric('sync', 'sync_cycle_started', this.queue.length, 'count');

    for (const task of this.queue) {
      if (task.status !== 'pending' && task.status !== 'failed') {
        continue;
      }

      task.status = 'syncing';
      this.saveQueue();

      try {
        // Execute HTTP request using enterprise client
        await api.post(task.path, task.payload);
        
        task.status = 'completed';
        telemetry.trackMetric('sync', 'task_synchronized', 1, 'count', true, `Sync success for ${task.category}`);
      } catch (err: any) {
        task.retries += 1;
        task.error = err.message || 'Unknown synchronization fault';
        
        if (task.retries >= 3) {
          task.status = 'failed';
          telemetry.trackMetric('sync', 'task_failed_permanently', 1, 'count', false, `Task ${task.category} failed: ${err.message}`);
        } else {
          task.status = 'pending'; // Allow retry in next cycle
          telemetry.trackMetric('sync', 'task_retry', task.retries, 'count', false, `Task ${task.category} retry scheduled`);
        }
        
        this.setSyncStatus('error');
        this.saveQueue();
        break; // Stop sequential execution on error to preserve FIFO ordering
      }
    }

    // Purge completed tasks from history log, preserving failed tasks for developer diagnostics
    this.queue = this.queue.filter(t => t.status !== 'completed');
    this.saveQueue();

    if ((this.syncStatus as string) === 'syncing') {
      this.setSyncStatus('idle');
    }
  }

  // System controls
  public pause() {
    this.isPaused = true;
    telemetry.trackMetric('sync', 'engine_paused', 1, 'count');
  }

  public resume() {
    this.isPaused = false;
    telemetry.trackMetric('sync', 'engine_resumed', 1, 'count');
    this.processQueue();
  }

  public cancel(taskId: string) {
    this.queue = this.queue.filter(t => t.id !== taskId);
    this.saveQueue();
    telemetry.trackMetric('sync', 'task_cancelled', 1, 'count');
  }

  public clearQueue() {
    this.queue = [];
    this.saveQueue();
    telemetry.trackMetric('sync', 'queue_cleared', 1, 'count');
  }

  public getQueue(): SyncTask[] {
    return this.queue;
  }

  public getStatus(): typeof this.syncStatus {
    return this.syncStatus;
  }
}

export const syncEngine = EnterpriseSyncEngine.getInstance();
export default syncEngine;
