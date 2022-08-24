import { lazy, Suspense } from 'react'
import type { Component, ReactNode } from 'react'
const remotes = {
{{{ remoteCodeString }}}
};
const scriptLoadedMap: Record<string, Promise<void> | 0 | undefined> = {};

type MFModuleImportRequest = { entry: string; remoteName: string; moduleName: string; }
type MFModuleRegisterRequest = { entry: string; remoteName: string; aliasName?:string; }

export async function rawMfImport(opts: MFModuleImportRequest) {
  await loadRemoteScriptWithCache(opts.remoteName, opts.entry);
  return getRemoteModule(opts.remoteName, opts.moduleName);
}

export function registerMfRemote (opts: MFModuleRegisterRequest) {
  const aliasName = opts.aliasName || opts.remoteName;
  if( remotes[aliasName] ){
    return console.warn(`registerMfRemote: ${aliasName} is already registered as`, remotes[aliasName]);
  }
  remotes[aliasName] ={
    ...opts,
    aliasName,
  }
}

export async function safeMfImport(moduleSpecifier: any, fallback: any) {
  try {
    const i = moduleSpecifier.indexOf('/');
    if (i < 0) {
      console.error(
        `safeMfImport: bad Module Name ${moduleSpecifier}, should match pattern 'remote/moduleName'`,
        moduleSpecifier,
      );

      return fallback;
    }

    const aliasName = moduleSpecifier.slice(0, i);
    const module = moduleSpecifier.slice(i + 1);
    const entry = remotes[aliasName]?.entry;
    const remoteName = remotes[aliasName]?.remoteName;

    if(!entry){
      console.error(
        `safeMfImport: bad Module Name ${moduleSpecifier}, no remote for "aliasName"`,
        moduleSpecifier,
      );
      return fallback;
    }

    await loadRemoteScriptWithCache(remoteName, entry);

    return getRemoteModule(remoteName, module);
  } catch (e) {
    console.error('safeMfImport: Module', moduleSpecifier, 'failed', e);
    return fallback;
  }
}

async function loadScript(url): Promise<void> {
  const element = document.createElement('script');
  element.src = url;
  element.type = 'text/javascript';
  element.async = true;

  const loadScriptQ = new Promise<void>((resolve, reject) => {
    element.onload = () => {
      document.head.removeChild(element);
      resolve();
    };
    element.onerror = (e) => {
      document.head.removeChild(element);
      reject(e);
    };
  });
  document.head.appendChild(element);

  return loadScriptQ;
}

async function getRemoteModule(remoteName:string, moduleName: string): any {
  // @ts-ignore
  await __webpack_init_sharing__('default');
  const container = window[remoteName]; // or get the container somewhere else
  // Initialize the container, it may provide shared modules
  // @ts-ignore
  await container.init(__webpack_share_scopes__.default);
  // @ts-ignore
  const factory = await window[remoteName].get(`./${moduleName}`);
  return factory();
}

async function loadRemoteScriptWithCache(remoteName:string, url: string): Promise<void> {

  const loadCache = scriptLoadedMap[remoteName];
  let scriptLoadQ: Promise<void> | null = null;

  if(loadCache === 0){
    // script Already loaded
    return;
  } else if(loadCache) {
    await loadCache
  }else{
    let p = loadScript(url).then(()=>{
      scriptLoadedMap[remoteName] = 0;
    },(e)=>{
      scriptLoadedMap[remoteName] = undefined;
      throw e;
    });
    scriptLoadedMap[remoteName] = p;
    await p;
  }
}

type SafeRemoteComponentOpts ={
  moduleSpecifier:string;
  fallbackComponent: ComponentType<any>;
  loadingElement: ReactNode
}

export function safeRemoteComponent<T extends ComponentType<any>>(opts: SafeRemoteComponentOpts): T {
  const Lazy = lazy<T>(()=>safeMfImport(opts.moduleSpecifier, { default: opts.fallbackComponent }));
  return (props)=> (<Suspense fallback={opts.loadingElement}>
     <Lazy {...props} />
  </Suspense>)
}

type RawRemoteComponentOpts ={
  mfConfig:{
    entry:string;
    remoteName: string;
    moduleName: string;
  };
  fallbackComponent: ComponentType<any>;
  loadingElement: ReactNode;
}

export function safeRemoteComponentWithMfConfig<T extends ComponentType<any>>(opts: RawRemoteComponentOpts): T {
  const Lazy = lazy<T>(()=>{
    return rawMfImport(opts.mfConfig)
      .catch(()=>{
        return { default: opts.fallbackComponent };
      })
  })
  return (props)=> (<Suspense fallback={opts.loadingElement}>
     <Lazy {...props} />
  </Suspense>)
}
