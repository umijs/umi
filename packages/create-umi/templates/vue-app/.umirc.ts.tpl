import { defineConfig } from "umi";

export default defineConfig({
  npmClient: '{{{ npmClient }}}',
  presets: [require.resolve('@umijs/preset-vue')],
});
