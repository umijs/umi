import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { parseModule, parse } from 'esprima';
import escodegen from 'escodegen';
import esquery from 'esquery';
import { get as _get } from 'lodash';
const debug = require('debug')('umi-build-dev:writeNewRoute');

/**
 * 将路由写入路由文件
 * @param {*} name 路由名
 * @param {*} configPath 配置路径
 * @param {*} absSrcPath 代码路径
 * @param {*} layoutPath 指定 layout 下
 */
export default function writeNewRoute(
  name,
  configPath,
  absSrcPath,
  layoutPath,
) {
  const { code, routesPath } = getNewRouteCode(
    configPath,
    name,
    layoutPath,
    absSrcPath,
  );
  writeFileSync(routesPath, code, 'utf-8');
}

/**
 * 获取目标
 * @param {*} configPath
 * @param {*} name
 * @param {*} layoutPath
 */
export function getNewRouteCode(configPath, name, absSrcPath, layoutPath) {
  debug(configPath);
  const ast = parseModule(readFileSync(configPath, 'utf-8'));
  // 查询当前配置文件是否导出 routes 属性
  const routes = esquery(
    ast,
    'ExportDefaultDeclaration [key.name="routes"]:first-child',
  )[0];
  if (routes) {
    // routes 配置不在当前文件, 需要 load 对应的文件  export default { routes: pageRoutes } case 1
    if (routes.value.type !== 'ArrayExpression') {
      const source = esquery(
        ast,
        `ImportDeclaration:has([local.name="${routes.value.name}"])`,
      )[0];
      if (source) {
        const newConfigPath = getModulePath(
          configPath,
          source.source.value,
          absSrcPath,
        );
        return getNewRouteCode(newConfigPath, name, absSrcPath, layoutPath);
      }
    } else {
      // 配置在当前文件 // export default { routes: [] } case 2
      writeRouteNode(routes.value, name, layoutPath);
    }
  } else {
    // 从其他文件导入 export default [] case 3
    const node = esquery(ast, 'ExportDefaultDeclaration > ArrayExpression')[0];
    writeRouteNode(node, name, layoutPath);
  }
  const code = generateCode(ast);
  debug(code, configPath);
  return { code, routesPath: configPath };
}

/**
 * 写入节点
 * @param {*} node 找到的节点
 * @param {*} name 路由名
 * @param {*} layoutPath 指定的 layout 路径
 */
function writeRouteNode(targetNode, name, layoutPath) {
  if (layoutPath) {
    // 找到指定的 layout 节点
    targetNode = esquery.query(
      targetNode,
      `[key.name="path"][value.value="${layoutPath}"] ~ [key.name="routes"] > ArrayExpression`,
    )[0];
  }
  if (targetNode) {
    // 插入相对路由, 兼容 layout
    const newRoute = parse(`({ path: '${name}', component: './${name}' })`)
      .body[0].expression;
    targetNode.elements.push(newRoute);
    debug(targetNode);
  } else {
    throw new Error('route path not found.');
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
