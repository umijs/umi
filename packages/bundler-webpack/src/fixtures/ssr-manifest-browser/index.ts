function getVersion() {
  const env = process.env;
  return env.SSR_MANIFEST || 'client';
}

(globalThis as any).__manifest = getVersion();
