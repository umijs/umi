const BUILD_PROMPT = `
umi build 命令用于构建项目.有以下功能:
- 通过COMPRESS环境变量值为 none,让构建不进行压缩。

环境变量需要在命令前传递,如:COMPRESS=none umi build

基于以上知识,根据我的要求,返回我应该使用的命令,只需返回这条命令,不包括任何其他信息,不做任何提示
`;

export default BUILD_PROMPT;
