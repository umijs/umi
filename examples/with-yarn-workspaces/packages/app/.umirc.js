import { defineConfig } from 'umi';
import { join } from 'path';

export default defineConfig({
  extraBabelIncludes: [
    join(__dirname, '../head'),
    join(__dirname, '../footer'),
  ],
})
