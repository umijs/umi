
interface IGetBabelConfigOpts {
  target: 'browser' | 'node';
}

export default function (opts: IGetBabelConfigOpts) {
  const { target } = opts;
  const isBrowser = target === 'browser';
  const targets = isBrowser
    ? { browsers: ['last 2 versions', 'IE 10'] }
    : { node: 6 };

  return {
    presets: [
      require.resolve('@babel/preset-typescript'),
      [
        require.resolve('@babel/preset-env'),
        { targets },
      ],
      ...(isBrowser ? [require.resolve('@babel/preset-react')] : []),
    ],
    plugins: [
      require.resolve('@babel/plugin-proposal-export-default-from'),
      require.resolve('@babel/plugin-proposal-do-expressions'),
      require.resolve('@babel/plugin-proposal-class-properties'),
    ],
  };
}
