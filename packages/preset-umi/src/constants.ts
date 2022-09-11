import { join } from 'path';

export const DEFAULT_PORT = '8000';
export const DEFAULT_HOST = '0.0.0.0';
export const CACHE_DIR_NAME = '.cache';
export const TEMPLATES_DIR = join(__dirname, '../templates');

// see ../../bundler-webpack/src/constant.ts
export const DEFAULT_BROWSER_TARGETS = {
  chrome: 80,
};
