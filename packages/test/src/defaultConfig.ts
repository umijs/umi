export default {
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': require.resolve('identity-obj-proxy'),
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': require.resolve(
      '../helpers/mock/file',
    ),
  },
  setupFiles: [require.resolve('../helpers/setupFiles/shim')],
  setupFilesAfterEnv: [require.resolve('../helpers/setupFiles/jasmine')],
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': require.resolve(
      '../helpers/transformers/javascript',
    ),
    '\\.svg$': require.resolve('../helpers/transformers/file'),
  },
  // transformIgnorePatterns: [
  //   // 加 [^/]*? 是为了兼容 tnpm 的目录结构
  //   // 比如：_umi-test@1.5.5@umi-test
  //   `node_modules/(?!([^/]*?umi|[^/]*?umi-test)/)`,
  // ],
};
