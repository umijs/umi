import enhancedResolve from 'enhanced-resolve';

type Resolver = ReturnType<typeof enhancedResolve.create>;

const browserResolver = enhancedResolve.create({
  mainFields: ['browser', 'module', 'main'],
  extensions: ['.wasm', '.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
  exportsFields: ['exports'],
  conditionNames: ['browser', 'import', 'module'],
  symlinks: false,
});

const cjsResolver = enhancedResolve.create({
  mainFields: ['browser', 'module', 'main'],
  extensions: ['.wasm', '.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
  exportsFields: ['exports'],
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

async function resolve(context: string, path: string): Promise<string> {
  let result: string = '';
  try {
    result = await resolveWith(browserResolver, context, path);
    if (result) return result;
  } catch (e) {}
  result = await resolveWith(cjsResolver, context, path);
  return result;
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
