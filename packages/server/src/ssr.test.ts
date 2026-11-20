import React from 'react';
import { createMarkupGenerator, ServerInsertedHTMLHook } from './ssr';
import type { IhtmlPageOpts } from './types';

test('renders nested metadata in route order and keeps it local to the page', async () => {
  let finishParent!: () => void;
  const parentPending = new Promise<void>((resolve) => {
    finishParent = resolve;
  });
  let finishChildMetadata!: () => void;
  const childMetadataReady = new Promise<void>((resolve) => {
    finishChildMetadata = resolve;
  });

  const parentMetadataLoader = jest.fn((title: string) => ({
    title,
    metas: [{ name: 'section', content: title }],
  }));
  const childMetadataLoader = jest.fn((title: string) => {
    finishChildMetadata();
    return { title, metas: [{ name: 'chapter', content: title }] };
  });
  const render = createMarkupGenerator({
    routesWithServerLoader: {
      section: async () => ({
        serverLoader: async () => {
          await parentPending;
          return 'Documentation';
        },
        metadataLoader: parentMetadataLoader,
      }),
      chapter: async () => ({
        serverLoader: async () => 'Installation',
        metadataLoader: childMetadataLoader,
      }),
    },
    pluginManager: { applyPlugins: jest.fn() },
    manifest: { assets: {} },
    getRoutes: () => ({
      routes: {
        section: {
          id: 'section',
          path: 'docs',
          hasServerLoader: true,
          hasMetadataLoader: true,
        },
        chapter: {
          id: 'chapter',
          parentId: 'section',
          path: 'install',
          hasServerLoader: true,
          hasMetadataLoader: true,
        },
        about: { id: 'about', path: 'about' },
      },
      routeComponents: {},
    }),
    getClientRootComponent: ({
      htmlPageOpts,
    }: {
      htmlPageOpts: IhtmlPageOpts;
    }) =>
      React.createElement(
        'html',
        null,
        React.createElement(
          'head',
          null,
          React.createElement('title', null, htmlPageOpts.title),
          htmlPageOpts.metas?.map((meta) =>
            React.createElement('meta', { ...meta, key: meta.name }),
          ),
        ),
        React.createElement('body'),
      ),
    createHistory: jest.fn(),
    reactVersion: React.version,
    ServerInsertedHTMLContext:
      React.createContext<ServerInsertedHTMLHook | null>(null),
    htmlPageOpts: { title: 'Default title' },
    __INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
      pureApp: false,
      pureHtml: false,
    },
    mountElementId: 'root',
  });

  const pendingHtml = render('/docs/install');
  await childMetadataReady;
  expect(parentMetadataLoader).not.toHaveBeenCalled();
  finishParent();

  const html = await pendingHtml;
  expect(parentMetadataLoader).toHaveBeenCalledWith('Documentation');
  expect(childMetadataLoader).toHaveBeenCalledWith('Installation');
  expect(html).toContain('<title>Installation</title>');
  expect(html).toMatch(/name="section".*name="chapter"/);

  const aboutHtml = await render('/about');
  expect(aboutHtml).toContain('<title>Default title</title>');
  expect(aboutHtml).not.toContain('name="chapter"');
});
