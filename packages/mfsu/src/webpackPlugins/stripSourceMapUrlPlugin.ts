import type { Compiler, Compilation } from 'webpack';

interface IOpts {
  webpack: any;
}

export class StripSourceMapUrlPlugin {
  opts: IOpts;
  constructor(opts: IOpts) {
    this.opts = opts;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(
      'StripSourceMapUrlPlugin',
      (compilation: Compilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: 'StripSourceMapUrlPlugin',
            stage: this.opts.webpack.Compilation.PROCESS_ASSETS_STAGE_DERIVE,
          },
          (assets: any) => {
            Object.keys(assets)
              .filter((filename) => /\.js$/.test(filename))
              .forEach((filename) => {
                const asset = assets[filename];
                const source = asset
                  .source()
                  .toString()
                  .replace(/# sourceMappingURL=(.+?\.map)/g, '# $1');
                compilation.updateAsset(
                  filename,
                  new this.opts.webpack.sources.RawSource(source),
                );
              });
          },
        );
      },
    );
  }
}
