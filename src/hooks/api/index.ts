/**
 * API hooks for external integrations.
 * @module hooks/api
 */

// API implementation
export { useScoreAPI } from './useScoreAPI';
export { useAPISubscriptions } from './useAPISubscriptions';
export { useExport, type ExportFormat } from './useExport';

// API domain modules
export * from './types';
export * from './navigation';
export * from './selection';
export * from './entry';
export * from './modification';
export * from './history';
export * from './playback';
export * from './io';
export * from './events';
