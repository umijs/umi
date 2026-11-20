import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import React from 'react';
import { runInNewContext } from 'vm';
import type { IApi } from '../../types';
import mpa from './mpa';

test.each([
  { version: '17.0.2', layout: undefined },
  { version: '18.3.1', layout: '@/Layout' },
])(
  'generates a valid .ts entry for React $version',
  async ({ version, layout }) => {
    const pages = mkdtempSync(join(tmpdir(), 'umi-mpa-'));
    try {
      const entryFile = join(pages, 'reports', 'index.ts');
      mkdirSync(join(pages, 'reports'));
      writeFileSync(
        entryFile,
        'export default function App() { return null; }',
      );
      const api = {
        EnableBy: { config: 'config' },
        appData: { react: { version } },
        paths: { absPagesPath: pages },
        config: { mpa: { layout } },
        userConfig: { mountElementId: 'reports-root' },
        describe: jest.fn(),
        onStart: jest.fn(),
        modifyAppData: jest.fn(),
        onGenerateFiles: jest.fn(),
        writeTmpFile: jest.fn(),
        modifyEntry: jest.fn(),
        chainWebpack: jest.fn(),
      };
      mpa(api as unknown as IApi);
      await api.modifyAppData.mock.calls[0][0](api.appData);
      await api.onGenerateFiles.mock.calls[0][0]({ isFirstTime: true });

      const files = api.writeTmpFile.mock.calls.map(([file]) => file);
      const entry = files.find((file) => file.path === 'mpa/reports.ts');
      expect(entry).toBeDefined();
      const { code } = esbuild.transformSync(entry.content, {
        loader: 'ts',
        format: 'cjs',
        sourcefile: entry.path,
      });

      const App = () => null;
      const Layout = () => null;
      const root = {};
      const render = jest.fn();
      const createRoot = jest.fn(() => ({ render }));
      const getElementById = jest.fn(() => root);
      const modules: Record<string, unknown> = {
        react: React,
        'react-dom': { render },
        'react-dom/client': { createRoot },
        [entryFile.replace(/\\/g, '/')]: App,
        '@/Layout': Layout,
      };

      runInNewContext(code, {
        require: (specifier: string) => modules[specifier],
        document: { getElementById },
      });

      expect(getElementById).toHaveBeenCalledWith('reports-root');
      if (layout) {
        expect(createRoot).toHaveBeenCalledWith(root);
        expect(render).toHaveBeenCalledWith(
          expect.objectContaining({
            type: Layout,
            props: { children: expect.objectContaining({ type: App }) },
          }),
        );
      } else {
        expect(render).toHaveBeenCalledWith(
          expect.objectContaining({ type: App }),
          root,
        );
      }
    } finally {
      rmSync(pages, { recursive: true, force: true });
    }
  },
);
