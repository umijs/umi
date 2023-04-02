const GEN_PROMPT = `
umi g 用于增量生成文件或启用功能,有以下功能:
- 不加任何参数,直接执行选择
- 通过参数tsconfig,启用typescript

基于以上知识,根据我的要求,返回我应该使用的命令,只需返回这条命令,不包括任何其他信息,不做任何提示
`;

export default GEN_PROMPT;
