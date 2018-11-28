import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { parseModule, parse } from 'esprima';
import escodegen from 'escodegen';
import esquery from 'esquery';
const debug = require('debug')('umi-build-dev:writeNewRoute');

/**
 * 将路由写入路由文件
 * @param {*} path 路由名
 * @param {*} configPath 配置路径
 * @param {*} absSrcPath 代码路径
 */
export default function writeNewRoute(path, configPath, absSrcPath) {
  const { code, routesPath } = getNewRouteCode(configPath, path, absSrcPath);
  writeFileSync(routesPath, code, 'utf-8');
}

/**
 * 获取目标
 * @param {*} configPath
 * @param {*} path
 */
export function getNewRouteCode(configPath, path, absSrcPath) {
  debug(configPath);
  const ast = parseModule(readFileSync(configPath, 'utf-8'), {
    attachComment: true,
  });
  // 查询当前配置文件是否导出 routes 属性
  const [routes] = esquery(
    ast,
    'ExportDefaultDeclaration > ObjectExpression > [key.name="routes"]',
  );
  if (routes) {
    // routes 配置不在当前文件, 需要 load 对应的文件  export default { routes: pageRoutes } case 1
    if (routes.value.type !== 'ArrayExpression') {
      const [source] = esquery(
        ast,
        `ImportDeclaration:has([local.name="${routes.value.name}"])`,
      );
      if (source) {
        const newConfigPath = getModulePath(
          configPath,
          source.source.value,
          absSrcPath,
        );
        return getNewRouteCode(newConfigPath, path, absSrcPath);
      }
    } else {
      // 配置在当前文件 // export default { routes: [] } case 2
      writeRouteNode(routes.value, path);
    }
  } else {
    // 从其他文件导入 export default [] case 3
    const [node] = esquery(ast, 'ExportDefaultDeclaration > ArrayExpression');
    writeRouteNode(node, path);
  }
  const code = generateCode(ast);
  debug(code, configPath);
  return { code, routesPath: configPath };
}

/**
 * 写入节点
 * @param {*} node 找到的节点
 * @param {*} path 路由名
 */
function writeRouteNode(targetNode, path) {
  targetNode = findLayoutNode(targetNode, path);
  debug(targetNode);
  if (targetNode) {
    // 如果插入到 layout, 组件地址是否正确
    const newRoute = parse(
      `({ path: '${path.toLowerCase()}', component: '.${path}' })`,
    ).body[0].expression;
    targetNode.elements.push(newRoute);
  } else {
    throw new Error('route path not found.');
  }
}

/**
 * 查找 path 是否有 layout 节点 // like: /users/settings/profile
 * 会依次查找 /users/settings /users/ /
 * @param {*} targetNode
 * @param {*} path
 */
export function findLayoutNode(targetNode, path) {
  debug(path, targetNode);
  const index = path && path.lastIndexOf('/');
  if (index !== -1) {
    path = index === 0 ? '/' : path.slice(0, index).toLowerCase();
    let query = `[key.name="path"][value.value="${path}"] ~ [key.name="routes"] > ArrayExpression`;

    if (index !== 0) {
      // 兼容 antd pro 相对路径路由
      const relativePath = path.split('/').pop();
      query = `${query},[key.name="path"][value.value="${relativePath}"] ~ [key.name="routes"] > ArrayExpression`;
    }

    const [layoutNode] = esquery.query(targetNode, query);
    if (layoutNode) {
      debug(layoutNode);
      return layoutNode;
    } else if (index === 0) {
      // 执行到 / 后跳出
      return targetNode;
    } else {
      return findLayoutNode(targetNode, path);
    }
  } else {
    return targetNode;
  }
}

/**
 * 生成代码
 * @param {*} ast
 */
function generateCode(ast) {
  const newCode = escodegen.generate(ast, {
    format: {
      indent: {
        style: '  ',
      },
    },
    comment: true,
  });
  return `${newCode}\n`;
}

/**
 * 获取路由配置的真实路径
 * @param {*} modulePath
 */
function getModulePath(configPath, modulePath, absSrcPath) {
  // like @/route.config
  if (/^@\//.test(modulePath)) {
    modulePath = join(absSrcPath, modulePath.replace(/^@\//, ''));
  } else {
    modulePath = join(dirname(configPath), modulePath);
  }
  if (!/\.js$/.test(modulePath)) {
    modulePath = `${modulePath}.js`;
  }
  return modulePath;
}
