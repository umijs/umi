import enhancedResolve from 'enhanced-resolve';

type Resolver = ReturnType<typeof enhancedResolve.create>;

const ORDERED_MAIN_FIELDS = ['browser', 'module', 'main'];
const SUPPORTED_EXTS = ['.wasm', '.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'];
const EXPORTS_FIELDS = ['exports'];

const browserResolver = enhancedResolve.create({
  mainFields: ORDERED_MAIN_FIELDS,
  extensions: SUPPORTED_EXTS,
  exportsFields: EXPORTS_FIELDS,
  conditionNames: ['browser', 'import'],
  symlinks: false,
});

const esmResolver = enhancedResolve.create({
  mainFields: ORDERED_MAIN_FIELDS,
  extensions: SUPPORTED_EXTS,
  exportsFields: EXPORTS_FIELDS,
  conditionNames: ['module'],
  symlinks: false,
});

const cjsResolver = enhancedResolve.create({
  mainFields: ORDERED_MAIN_FIELDS,
  extensions: SUPPORTED_EXTS,
  exportsFields: EXPORTS_FIELDS,
  conditionNames: ['require', 'node'],
  symlinks: false,
});

async function resolveWith(
  resolver: Resolver,
  context: string,
  path: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    resolver(context, path, (err: Error, result: string) =>
      err ? reject(err) : resolve(result),
    );
  });
}

async function tryResolvers(rs: Resolver[], context: string, path: string) {
  let result = '';
  let lastError: any = null;
  for (const r of rs) {
    try {
      result = await resolveWith(r, context, path);
      return result;
    } catch (e) {
      lastError = e;
    }
  }
  if (!result) {
    throw lastError || Error(`can't resolve ${path} from ${context}`);
  }
  return result;
}

async function resolve(context: string, path: string): Promise<string> {
  return await tryResolvers(
    [browserResolver, esmResolver, cjsResolver],
    context,
    path,
  );
}

export async function resolveFromContexts(
  contexts: string[],
  path: string,
): Promise<string> {
  for (const context of contexts) {
    try {
      return await resolve(context, path);
    } catch (e) {
      // ignore
    }
  }
  throw new Error(`Can't resolve ${path} from ${contexts.join(', ')}`);
}
