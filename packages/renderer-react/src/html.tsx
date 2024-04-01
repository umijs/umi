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

function generatorStyle(style: string) {
  return isUrl(style)
    ? { type: 'link', href: style }
    : { type: 'style', content: style };
}

const HydrateMetadata = (props: IHtmlProps) => {
  const { tplOpts } = props;
  return (
    <>
      {tplOpts?.title && <title>{tplOpts.title}</title>}
      {tplOpts?.favicons?.map((favicon: string, key: number) => {
        return <link key={key} rel="shortcut icon" href={favicon} />;
      })}
      {tplOpts?.description && (
        <meta name="description" content={tplOpts.description} />
      )}
      {tplOpts?.keywords?.length && (
        <meta name="keywords" content={tplOpts.keywords.join(',')} />
      )}
      {tplOpts?.metas?.map((em: any) => (
        <meta key={em.name} name={em.name} content={em.content} />
      ))}

      {tplOpts?.links?.map((link: Record<string, string>, key: number) => {
        return <link key={key} {...link} />;
      })}
      {tplOpts?.styles?.map((style: string, key: number) => {
        const { type, href, content } = generatorStyle(style);
        if (type === 'link') {
          return <link key={key} rel="stylesheet" href={href} />;
        } else if (type === 'style') {
          return <style key={key}>{content}</style>;
        }
      })}
      {tplOpts?.headScripts?.map((script: IScript, key: number) => {
        const { content, ...rest } = normalizeScripts(script);
        return (
          <script key={key} {...(rest as any)}>
            {content}
          </script>
        );
      })}
    </>
  );
};

export function Html({
  children,
  loaderData,
  manifest,
  tplOpts,
  renderFromRoot,
  mountElementId,
}: React.PropsWithChildren<IHtmlProps>) {
  // TODO: 处理 head 标签，比如 favicon.ico 的一致性
  // TODO: root 支持配置
  if (renderFromRoot) {
    return (
      <>
        <HydrateMetadata tplOpts={tplOpts} />
        <div id={mountElementId}>{children}</div>
      </>
    );
  }
  // @ts-ignore
  const serverBuildManifest =
    typeof window === 'undefined'
      ? manifest
      : // @ts-ignore
        window.__UMI_BUILD_MANIFEST_DATA__;
  return (
    <html suppressHydrationWarning lang={tplOpts?.lang || 'en'}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {serverBuildManifest?.assets['umi.css'] && (
          <link
            suppressHydrationWarning
            rel="stylesheet"
            href={manifest?.assets['umi.css']}
          />
        )}
        <HydrateMetadata tplOpts={tplOpts} />
      </head>
      <body>
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<b>Enable JavaScript to run this app.</b>`,
          }}
        />

        <div id={mountElementId}>{children}</div>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `window.__UMI_LOADER_DATA__ = ${JSON.stringify(
              loaderData || {},
            )}; window.__UMI_METADATA_LOADER_DATA__ = ${JSON.stringify(
              tplOpts || {},
            )}; window.__UMI_BUILD_MANIFEST_DATA__ = ${
              JSON.stringify(manifest) || {}
            }`,
          }}
        />

        {tplOpts?.scripts?.map((script: IScript, key: number) => {
          const { content, ...rest } = normalizeScripts(script);
          return (
            <script key={key} {...(rest as any)}>
              {content}
            </script>
          );
        })}
      </body>
    </html>
  );
}
