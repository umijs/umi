export default {
  plugins: [
    [
      '../../../../../umi-plugin-auto-externals/lib/index.js',
      {
        packages: ['antd'],
        urlTemplate: `https://unpkg.alibaba-inc.com/{{ library }}@{{ version }}/{{ path }}`,
      },
    ],
  ],
};
