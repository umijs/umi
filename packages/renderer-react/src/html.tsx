import React from 'react';
import { IHtmlProps, IScript } from './types';

const RE_URL = /^(http:|https:)?\/\//;

function isUrl(str: string) {
  return (
    RE_URL.test(str) ||
    (str.startsWith('/') && !str.startsWith('/*')) ||
    str.startsWith('./') ||
    str.startsWith('../')
  );
}
const EnableJsScript = () => (
  <noscript
    dangerouslySetInnerHTML={{
      __html: `<b>Enable JavaScript to run this app.</b>`,
    }}
  />
);

function normalizeClientCssPaths(css: any): string[] {
  if (Array.isArray(css)) {
    return css.filter(Boolean);
  }

  return css ? [css] : [];
}

function isCssAsset(asset: string) {
  return (
    /\.css(?:[?#].*)?$/.test(asset) && !/\.css\.map(?:[?#].*)?$/.test(asset)
  );
}

function isUtoopackSingleCss(asset: string) {
  return /\.single\.css(?:[?#].*)?$/.test(asset);
}

export function getClientCssPaths(manifest: any): string[] {
  const assets = manifest?.assets || {};
  const umiCss = normalizeClientCssPaths(assets['umi.css']);

  if (umiCss.length) {
    return umiCss;
  }

  return Object.values(assets).filter((asset): asset is string => {
    return (
      typeof asset === 'string' &&
      isCssAsset(asset) &&
      !isUtoopackSingleCss(asset)
    );
  });
}

function serializeInlineScriptValue(value: unknown) {
  // JSON string escaping alone does not protect the HTML script boundary.
  return (JSON.stringify(value) ?? 'undefined')
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

const GlobalDataScript = (
  props: Omit<IHtmlProps, '__INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED'>,
) => {
  const { loaderData, htmlPageOpts, manifest } = props;
  const clientCssPaths = getClientCssPaths(manifest);
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `window.__UMI_LOADER_DATA__ = ${serializeInlineScriptValue(
          loaderData || {},
        )}; window.__UMI_METADATA_LOADER_DATA__ = ${serializeInlineScriptValue(
          htmlPageOpts || {},
        )}; window.__UMI_BUILD_ClIENT_CSS__ = ${serializeInlineScriptValue(
          clientCssPaths.length <= 1 ? clientCssPaths[0] || '' : clientCssPaths,
        )}`,
      }}
    />
  );
};
function normalizeScripts(script: IScript, extraProps = {}) {
  if (typeof script === 'string') {
    return isUrl(script)
      ? {
          src: script,
          ...extraProps,
        }
      : { content: script };
  } else if (typeof script === 'object') {
    return {
      ...script,
      ...extraProps,
    };
  } else {
    throw new Error(`Invalid script type: ${typeof script}`);
  }
}

function normalizeStyle(style: string | Record<string, string>) {
  if (typeof style !== 'string') return style;
  return isUrl(style) ? { src: style } : { content: style };
}

const styleAttributes = new Map([
  ['blocking', 'blocking'],
  ['class', 'className'],
  ['classname', 'className'],
  ['dir', 'dir'],
  ['id', 'id'],
  ['lang', 'lang'],
  ['media', 'media'],
  ['nonce', 'nonce'],
  ['title', 'title'],
  ['type', 'type'],
]);

const stylesheetLinkAttributes = new Map([
  ['crossorigin', 'crossOrigin'],
  ['disabled', 'disabled'],
  ['fetchpriority', 'fetchpriority'],
  ['hreflang', 'hrefLang'],
  ['integrity', 'integrity'],
  ['referrerpolicy', 'referrerPolicy'],
]);

function getStylesheetAttributes(
  attrs: Record<string, string>,
  linked: boolean,
) {
  return Object.fromEntries(
    Object.entries(attrs).flatMap(([key, value]) => {
      const name = key.toLowerCase();
      const attr =
        styleAttributes.get(name) ??
        (linked ? stylesheetLinkAttributes.get(name) : undefined) ??
        (/^(?:aria|data)-[a-z0-9_.:-]+$/.test(name) ? name : undefined);
      return attr ? [[attr, value]] : [];
    }),
  );
}

function escapeStyleText(css: string) {
  // Escape the tag name as CSS so the HTML parser keeps reading style text.
  return css.replace(/<\/(s)(tyle)/gi, (_, first, rest) => {
    const escaped = first === 's' ? '\\73 ' : '\\53 ';
    return `</${escaped}${rest}`;
  });
}

const HydrateMetadata = (
  props: Omit<IHtmlProps, '__INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED'>,
) => {
  const { htmlPageOpts } = props;
  return (
    <>
      {htmlPageOpts?.title && <title>{htmlPageOpts.title}</title>}
      {htmlPageOpts?.favicons?.map((favicon: string, key: number) => {
        return <link key={key} rel="shortcut icon" href={favicon} />;
      })}
      {htmlPageOpts?.description && (
        <meta name="description" content={htmlPageOpts.description} />
      )}
      {htmlPageOpts?.keywords?.length && (
        <meta name="keywords" content={htmlPageOpts.keywords.join(',')} />
      )}
      {htmlPageOpts?.metas?.map((em: any) => (
        <meta
          key={em.name}
          name={em.name}
          property={em.property}
          content={em.content}
        />
      ))}

      {htmlPageOpts?.links?.map((link: Record<string, string>, key: number) => {
        return <link key={key} {...link} />;
      })}
      {htmlPageOpts?.styles?.map((style, key) => {
        const { src, content, ...attrs } = normalizeStyle(style);
        const linked = typeof src === 'string' && !!src;
        const stylesheetAttrs = getStylesheetAttributes(attrs, linked);
        return linked ? (
          <link key={key} {...stylesheetAttrs} rel="stylesheet" href={src} />
        ) : (
          <style
            key={key}
            {...stylesheetAttrs}
            dangerouslySetInnerHTML={{
              __html:
                typeof content === 'string' ? escapeStyleText(content) : '',
            }}
          />
        );
      })}
      {htmlPageOpts?.headScripts?.map((script: IScript, key: number) => {
        const { content, ...rest } = normalizeScripts(script);
        return (
          <script
            dangerouslySetInnerHTML={{
              __html: content,
            }}
            key={key}
            {...(rest as any)}
          />
        );
      })}
    </>
  );
};

export function Html({
  children,
  loaderData,
  manifest,
  htmlPageOpts,
  __INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  mountElementId,
}: React.PropsWithChildren<IHtmlProps>) {
  // TODO: 处理 head 标签，比如 favicon.ico 的一致性
  // TODO: root 支持配置
  if (__INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.pureHtml) {
    return (
      <html>
        <head>
          <HydrateMetadata htmlPageOpts={htmlPageOpts} />
        </head>
        <body>
          <EnableJsScript />
          <div id={mountElementId}>{children}</div>
          <GlobalDataScript
            manifest={manifest}
            loaderData={loaderData}
            htmlPageOpts={htmlPageOpts}
          />
        </body>
      </html>
    );
  }

  if (__INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.pureApp) {
    return <>{children}</>;
  }

  const clientCssPaths =
    typeof window === 'undefined'
      ? getClientCssPaths(manifest)
      : normalizeClientCssPaths(window.__UMI_BUILD_ClIENT_CSS__);
  return (
    // FIXME: Resolve the hydrate warning for suppressHydrationWarning(3)
    <html suppressHydrationWarning lang={htmlPageOpts?.lang || 'en'}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {clientCssPaths.map((clientCss) => (
          <link
            key={clientCss}
            suppressHydrationWarning
            rel="stylesheet"
            href={clientCss}
          />
        ))}
        <HydrateMetadata htmlPageOpts={htmlPageOpts} />
      </head>
      <body>
        <EnableJsScript />
        <div id={mountElementId}>{children}</div>
        <GlobalDataScript
          manifest={manifest}
          loaderData={loaderData}
          htmlPageOpts={htmlPageOpts}
        />

        {htmlPageOpts?.scripts?.map((script: IScript, key: number) => {
          const { content, ...rest } = normalizeScripts(script);
          return (
            <script
              dangerouslySetInnerHTML={{
                __html: content,
              }}
              key={key}
              {...(rest as any)}
            />
          );
        })}
      </body>
    </html>
  );
}
