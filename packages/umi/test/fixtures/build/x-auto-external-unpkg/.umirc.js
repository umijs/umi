export default {
  plugins: [
    [
      '../../../../../umi-plugin-auto-externals/lib/index.js',
      {
        packages: ['antd'],
        urlTemplate: `https://unpkg.com/{{ library }}@{{ version }}/{{ path }}`,
      },
    ],
  ],
};
