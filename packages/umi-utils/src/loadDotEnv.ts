import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { parse } from 'dotenv';

export default function loadDotEnv({ cwd }) {
  const baseEnvPath = join(cwd, '.env');
  const localEnvPath = `${baseEnvPath}.local`;

  const loadEnv = envPath => {
    if (existsSync(envPath)) {
      const parsed = parse(readFileSync(envPath, 'utf-8'));
      Object.keys(parsed).forEach(key => {
        // eslint-disable-next-line no-prototype-builtins
        if (!process.env.hasOwnProperty(key)) {
          process.env[key] = parsed[key];
        }
      });
    }
  };

  loadEnv(baseEnvPath);
  loadEnv(localEnvPath);
}
