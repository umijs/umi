const { readFileSync } = require('fs');
const { resolve } = require('path');
const semver = require('@umijs/utils/compiled/semver');
const transformRuntimeModule = require('@babel/plugin-transform-runtime');

const transformRuntime =
  transformRuntimeModule.default || transformRuntimeModule;

// Keep Babel 7 semantics where runtime 8 changed observable behavior:
// construct must not call a constructor's own bind method without Reflect,
// and object rest must not enumerate a Proxy's prototype chain. Include the
// helpers that call them internally so those imports cannot bypass the fallback.
const inlineHelpers = new Set([
  'construct',
  'wrapNativeSuper',
  'objectWithoutProperties',
  'objectWithoutPropertiesLoose',
]);

function getRuntime(options, dirname) {
  const corejs =
    typeof options.corejs === 'object' && options.corejs !== null
      ? options.corejs.version
      : options.corejs;
  const corejsVersion = corejs ? Number(corejs) : false;
  const name =
    corejsVersion === 2 || corejsVersion === 3
      ? `@babel/runtime-corejs${corejsVersion}`
      : '@babel/runtime';
  const basedir = resolve(
    dirname,
    typeof options.absoluteRuntime === 'string'
      ? options.absoluteRuntime
      : '.',
  );

  try {
    const packagePath = require.resolve(`${name}/package.json`, {
      paths: [basedir],
    });
    const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
    return { name, pkg };
  } catch (error) {
    // Let Babel report its usual error if the selected runtime cannot resolve.
    if (error.code === 'MODULE_NOT_FOUND') return;
    throw error;
  }
}

function normalizeLegacyVersion(options, runtime) {
  const range = semver.validRange(options.version);
  if (
    range &&
    !semver.intersects(range, `${semver.major(runtime.pkg.version)}.x`)
  ) {
    // Umi's default version may belong to its own runtime while absoluteRuntime
    // selects a project's older runtime. Keep that existing configuration valid.
    return { ...options, version: `^${runtime.pkg.version}` };
  }
  return options;
}

function createCompatibility(api, options, dirname, runtime) {
  if (runtime.name !== '@babel/runtime') {
    throw new Error(
      'Babel 7 corejs options require @babel/runtime-corejs2 or ' +
        '@babel/runtime-corejs3 version 7. Keep that polyfill runtime on ' +
        'version 7 when using @babel/runtime version 8.',
    );
  }
  // Preserve the original option validation before normalizing the options
  // whose Babel 7 implementation cannot represent a runtime 8 dependency.
  transformRuntime(api, options, dirname);
  const original = transformRuntime(
    api,
    {
      ...options,
      // Babel 7 rejects >=8 in availableHelper(), although unchanged helpers
      // still work. Its own version describes the helpers it knows how to emit.
      version: `^${api.version}`,
      // Runtime 8 selects ESM/CJS through exports and removed helpers/esm/*.
      useESModules: false,
      // The old polyfill plugin imports the removed runtime/regenerator entry.
      regenerator: false,
    },
    dirname,
  );

  function install(file) {
    if (options.helpers === false) return;
    original.pre.call(this, file);
    const generate = file.get('helperGenerator');
    file.set('helperGenerator', (name) => {
      if (
        !inlineHelpers.has(name) &&
        Object.prototype.hasOwnProperty.call(
          runtime.pkg.exports,
          `./helpers/${name}`,
        )
      ) {
        return generate(name);
      }
      // Babel 8 removed or changed helpers with Babel 7-specific behavior.
      // Returning undefined lets this compiler inline its matching helper,
      // including regeneratorRuntime, without changing the source or targets.
      return undefined;
    });
  }

  function rewriteRegenerator(path, file) {
    if (options.regenerator === false) return;
    // Run before the inherited Babel 7 polyfill visitors in father. Replacing
    // unbound references also preserves old code that explicitly uses this
    // global when its browser targets need no generator syntax transform.
    path.traverse({
      ReferencedIdentifier(reference) {
        if (
          reference.node.name === 'regeneratorRuntime' &&
          !reference.scope.getBinding('regeneratorRuntime')
        ) {
          reference.replaceWith(
            api.types.callExpression(file.addHelper('regeneratorRuntime'), []),
          );
        }
      },
    });
  }

  return { original, install, rewriteRegenerator };
}

module.exports = function (api, options, dirname) {
  const runtime = getRuntime(options, dirname);
  if (!runtime || semver.major(runtime.pkg.version) < 8) {
    return transformRuntime(
      api,
      runtime ? normalizeLegacyVersion(options, runtime) : options,
      dirname,
    );
  }

  const { original, install, rewriteRegenerator } = createCompatibility(
    api,
    options,
    dirname,
    runtime,
  );
  return {
    ...original,
    pre: install,
    visitor: {
      Program(path, state) {
        rewriteRegenerator(path, state.file);
      },
    },
  };
};

// Father uses a separately bundled Babel 7 preset. Its extra plugins enter the
// Program after all preset pre-hooks, so install the same compatibility there.
module.exports.runtime8Compat = function (api, options, dirname) {
  const runtimeBaseDir = options.runtimeBaseDir || dirname;
  const runtime = getRuntime(options, runtimeBaseDir);
  if (!runtime || semver.major(runtime.pkg.version) < 8) return {};
  const { install, rewriteRegenerator } = createCompatibility(
    api,
    options,
    runtimeBaseDir,
    runtime,
  );
  return {
    name: 'umi-runtime-8-compat',
    visitor: {
      Program(path, state) {
        install.call(this, state.file);
        rewriteRegenerator(path, state.file);
      },
    },
  };
};
