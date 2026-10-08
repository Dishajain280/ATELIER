/**
 * Database Abstraction & Client Provider
 */
import { storage } from '../server/db/storage.js';

export interface DatabaseStatus {
  isConfigured: boolean;
  provider: 'postgresql' | 'development_memory';
  connectionStatus: 'connected' | 'development_fallback';
}

export function getDatabaseStatus(): DatabaseStatus {
  const url = process.env.DATABASE_URL;
  const isConfigured = Boolean(url && !url.includes('placeholder') && !url.includes('example'));

  return {
    isConfigured,
    provider: isConfigured ? 'postgresql' : 'development_memory',
    connectionStatus: isConfigured ? 'connected' : 'development_fallback',
  };
}

export const db = storage;
