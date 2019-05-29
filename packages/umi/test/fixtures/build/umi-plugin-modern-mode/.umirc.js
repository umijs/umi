export default {
  treeShaking: true,
  minimizer: 'terserjs',
  plugins: [
    [
      '../../../../../umi-plugin-modern-mode/lib/index.js',
    ],
  ],
}
