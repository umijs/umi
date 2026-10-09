import type { IncomingMessage, ServerResponse } from 'http';
import { Readable } from 'stream';
import type { IApi } from 'umi';
import { pathToFileURL } from 'url';
import {
  createUmiDevframe,
  notifyUmiSourceChanged,
} from './devframe/umiDevframe';

const HUB_BASE = '/__devframes/';

// @umijs/plugins is published as CommonJS. Keep native import() so Node can
// load Devframe's ESM-only packages after the feature is enabled.
const nativeImport = new Function('specifier', 'return import(specifier)') as (
  specifier: string,
) => Promise<any>;
const importEsm = (specifier: string) =>
  nativeImport(pathToFileURL(require.resolve(specifier)).href);

let activeHub:
  | {
      close: () => void | Promise<void>;
    }
  | undefined;

process.once('exit', () => {
  // The process owns the sidecar socket. close() also releases its resources
  // during an in-process dev-server restart below.
  void activeHub?.close();
});

export default (api: IApi) => {
  api.describe({
    key: 'devframe',
    enableBy({ userConfig, env }) {
      return (
        api.name === 'dev' && env === 'development' && !!userConfig.devframe
      );
    },
    config: {
      schema({ zod }) {
        return zod.object({});
      },
      onChange: api.ConfigChangeType.reload,
    },
  });

  api.addHTMLHeadScripts(() => [
    { type: 'module', src: `${HUB_BASE}embedded.js` },
  ]);

  api.onDevCompileDone(() => notifyUmiSourceChanged());
  api.onGenerateFiles(() => notifyUmiSourceChanged());

  api.addBeforeMiddlewares(async () => {
    const [nodeMajor, nodeMinor] = process.versions.node.split('.').map(Number);
    if (
      nodeMajor < 20 ||
      (nodeMajor === 20 && nodeMinor < 19) ||
      typeof globalThis.Request !== 'function' ||
      typeof globalThis.Response !== 'function' ||
      typeof globalThis.Headers !== 'function' ||
      typeof globalThis.ReadableStream !== 'function'
    ) {
      throw new Error(
        'Umi Devframe requires Node.js 20.19 or later with the global Fetch API. Upgrade Node or remove devframe: {} from your Umi config.',
      );
    }

    await activeHub?.close();
    activeHub = undefined;

    const [hubModule, uiModule, inspector, registry, a11yModule] =
      await Promise.all([
        importEsm('@devframes/hub/initiate') as Promise<
          typeof import('@devframes/hub/initiate')
        >,
        importEsm('@devframes/hub-ui') as Promise<
          typeof import('@devframes/hub-ui')
        >,
        importEsm('@devframes/plugin-data-inspector'),
        importEsm('@devframes/plugin-data-inspector/registry'),
        importEsm('@devframes/plugin-a11y') as Promise<
          typeof import('@devframes/plugin-a11y')
        >,
      ]);

    const hub = hubModule.initHub({
      base: HUB_BASE,
      devframes: [
        createUmiDevframe(api, { inspector, registry }),
        a11yModule.createA11yDevframe(),
      ],
      ui: uiModule.createUi({
        branding: { productName: 'Umi DevTools' },
      }),
      // Umi's bundler middleware API does not expose the HTTP upgrade event.
      ws: { sidecar: true },
      mcp: false,
    });
    await hub.ready;
    activeHub = hub;

    // h3's Node response adapter does not write headers correctly to Umi's
    // Express response object. Bridge the standard handler explicitly.
    return [
      (
        req: IncomingMessage & { originalUrl?: string },
        res: ServerResponse,
        next: (error?: unknown) => void,
      ) => {
        const path = new URL(req.url || '/', 'http://localhost').pathname;
        if (path !== HUB_BASE.slice(0, -1) && !path.startsWith(HUB_BASE)) {
          return next();
        }

        const abort = new AbortController();
        req.on('aborted', () => abort.abort());
        res.on('close', () => abort.abort());

        void (async () => {
          const protocol = (
            req.socket as typeof req.socket & { encrypted?: boolean }
          ).encrypted
            ? 'https'
            : 'http';
          const url = new URL(
            req.originalUrl || req.url || '/',
            `${protocol}://${req.headers.host || 'localhost'}`,
          );
          const headers = new Headers();
          for (const [name, value] of Object.entries(req.headers)) {
            if (Array.isArray(value)) {
              value.forEach((item) => headers.append(name, item));
            } else if (value !== undefined) {
              headers.set(name, value);
            }
          }
          const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
          const request = new Request(url, {
            method: req.method,
            headers,
            signal: abort.signal,
            ...(hasBody ? { body: req, duplex: 'half' } : {}),
          } as RequestInit);
          const response = await hub.handler(request);

          res.statusCode = response.status;
          if (response.statusText) res.statusMessage = response.statusText;
          response.headers.forEach((value, name) => {
            if (name !== 'set-cookie') res.setHeader(name, value);
          });
          const cookies = (
            response.headers as Headers & { getSetCookie?: () => string[] }
          ).getSetCookie?.();
          if (cookies?.length) res.setHeader('set-cookie', cookies);
          else if (response.headers.has('set-cookie')) {
            res.setHeader('set-cookie', response.headers.get('set-cookie')!);
          }

          if (req.method === 'HEAD' || !response.body) {
            res.end();
            return;
          }

          const body = Readable.fromWeb(response.body as any);
          body.on('error', (error) => res.destroy(error));
          res.on('close', () => body.destroy());
          res.flushHeaders();
          body.pipe(res);
        })().catch(next);
      },
    ];
  });
};
