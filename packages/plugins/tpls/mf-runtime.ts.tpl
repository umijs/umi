const remotes = {
{{{ remoteCodeString }}}
};
const scriptLoadedMap: Record<string, Promise<void> | 0 | undefined> = {};

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

    const element = document.createElement('script');
    element.src = entry;
    element.type = 'text/javascript';
    element.async = true;

    const loadScriptQ = new Promise<void>((resolve, reject) => {
      element.onload = () => {
        scriptLoadedMap[remoteName] = 0;
        document.head.removeChild(element);
        resolve();
      };
      element.onerror = (e) => {
        reject(e);
        scriptLoadedMap[remoteName] = undefined;
        document.head.removeChild(element);
      };
    });
    document.head.appendChild(element);

    scriptLoadedMap[remoteName] = loadScriptQ;

    await loadScriptQ;

    // @ts-ignore
    await __webpack_init_sharing__('default');
    const container = window[remoteName]; // or get the container somewhere else
    // Initialize the container, it may provide shared modules
    // @ts-ignore
    await container.init(__webpack_share_scopes__.default);
    // @ts-ignore
    const factory = await window[remoteName].get(`./${module}`);
    return factory();
  } catch (e) {
    console.error('safeMfImport: Module', moduleSpecifier, 'failed', e);
    return fallback;
  }
}

export function toDynamicModule() {
  return {};
}
