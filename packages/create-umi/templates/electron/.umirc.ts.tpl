import { defineConfig } from 'umi';
import { Platform, Arch } from '@umijs/plugin-electron';

export default defineConfig({
  npmClient: 'yarn',
  plugins: ["@umijs/plugin-electron"],
  electron: {
    builder: {
      targets: Platform.MAC.createTarget(['dmg'], Arch.arm64),
    },
  },
});
