import { readFileSync, existsSync } from 'fs';
import { parse } from 'dotenv';
import { expand } from 'dotenv-expand';

/**
 * dotenv wrapper
 * @param envPath string
 */
export default function loadDotEnv(envPath: string): void {
  if (existsSync(envPath)) {
    const parsed = parse(readFileSync(envPath, 'utf-8')) || {};
    expand({ parsed });
    Object.keys(parsed).forEach((key) => {
      // eslint-disable-next-line no-prototype-builtins
      if (!process.env.hasOwnProperty(key)) {
        process.env[key] = parsed[key];
      }
    });
  }
}
