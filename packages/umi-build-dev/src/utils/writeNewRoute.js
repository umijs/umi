import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { parseModule, parse } from 'esprima';
import escodegen from 'escodegen';
import esquery from 'esquery';
import prettier from 'prettier';

const debug = require('debug')('umi-build-dev:writeNewRoute');

/**
 * 将路由写入路由文件
 * @param {*} newRoute 新的路由配置: { path, component, ... }
 * @param {*} configPath 配置路径
 * @param {*} absSrcPath 代码路径
 */
export default function writeNewRoute(newRoute, configPath, absSrcPath) {
  const { code, routesPath } = getNewRouteCode(
    configPath,
    newRoute,
    absSrcPath,
  );
  writeFileSync(routesPath, code, 'utf-8');
}

/**
 * 获取目标
 * @param {*} configPath
 * @param {*} newRoute
 */
export function getNewRouteCode(configPath, newRoute, absSrcPath) {
  debug(configPath);
  const ast = parseModule(readFileSync(configPath, 'utf-8'), {
    attachComment: true,
  });
  // 查询当前配置文件是否导出 routes 属性
  const [routes] = esquery(
    ast,
    `ExportDefaultDeclaration > ObjectExpression > [key.name="routes"],\
  AssignmentExpression[left.object.name="exports"][left.property.name="routes"]`, // like: exports.routes = {}
  );

  if (routes) {
    const routesNode = routes.value || routes.right;
    // routes 配置不在当前文件, 需要 load 对应的文件  export default { routes: pageRoutes } case 1
    if (routesNode.type !== 'ArrayExpression') {
      const [source] = esquery(
        ast,
        `ImportDeclaration:has([local.name="${routesNode.name}"])`,
      );
      if (source) {
        const newConfigPath = getModulePath(
          configPath,
          source.source.value,
          absSrcPath,
        );
        return getNewRouteCode(newConfigPath, newRoute, absSrcPath);
      }
    } else {
      // 配置在当前文件 // export default { routes: [] } case 2
      writeRouteNode(routesNode, newRoute);
    }
  } else {
    // 从其他文件导入 export default [] case 3
    const [node] = esquery(ast, 'ExportDefaultDeclaration > ArrayExpression');
    writeRouteNode(node, newRoute);
  }
  const code = generateCode(ast);
  debug(code, configPath);
  return { code, routesPath: configPath };
}

/**
 * 写入节点
 * @param {*} node 找到的节点
 * @param {*} newRoute 新的路由配置
 */
function writeRouteNode(targetNode, newRoute) {
  const { level, target } = findLayoutNode(targetNode, 0, newRoute.path);
  debug(target);
  if (target) {
    // 如果插入到 layout, 组件地址是否正确
    const newRouteAst = parse(`(${JSON.stringify(newRoute)})`).body[0]
      .expression;
    if (level === 0) {
      // 如果是第一级那么插入到上面，避免被 / 覆盖
      // 后面应该做更加智能的判断，如果可能被覆盖就插入到前面。如果可能覆盖别人就插入到后面。
      target.elements.unshift(newRouteAst);
    } else {
      target.elements.push(newRouteAst);
    }
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
export function findLayoutNode(targetNode, level, path) {
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

    if (process.env.BIGFISH_COMPAT) {
      query = `${query},${query.replace(/\"routes\"/g, '"childRoutes"')}`;
    }

    const [layoutNode] = esquery.query(targetNode, query);
    if (layoutNode) {
      debug(layoutNode);
      return {
        level: level + 1,
        target: layoutNode,
      };
    } else if (index === 0) {
      // 执行到 / 后跳出
      return {
        level,
        target: targetNode,
      };
    } else {
      return findLayoutNode(targetNode, level + 1, path);
    }
  } else {
    return {
      level,
      target: targetNode,
    };
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
  return prettier.format(newCode, {
    // format same as ant-design-pro
    singleQuote: true,
    trailingComma: 'es5',
    printWidth: 100,
    parser: 'babylon',
  });
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
