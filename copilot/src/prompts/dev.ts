const DEV_PROMPT = `
umi dev 命令用于启动本地开发服务器.有以下功能:
- 通过PORT 环境变量指定开发服务器启动指定端口
- 通过MOCK 环境变量为none,来去除mock

环境变量的使用方法是在命令之前加入环境变量,如:
PORT=10 umi dev
MOCK=none umi dev

基于以上知识,根据我的要求,返回我应该使用的命令,只需返回这条命令,不包括任何其他信息,不做任何提示
`;

export default DEV_PROMPT;
