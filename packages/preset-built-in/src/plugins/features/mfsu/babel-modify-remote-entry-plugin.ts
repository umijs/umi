// @ts-nocheck
import { t } from '@umijs/utils';

export interface Opts {
  hash: string;
}

export default function () {
  return {
    visitor: {
      AssignmentExpression(path, { opts }: { opts: Opts }) {
        const parent = path.findParent(
          (path) =>
            t.isArrowFunctionExpression(path) &&
            t.isAssignmentExpression(path.parent) &&
            path.parent.operator === '=' &&
            t.isMemberExpression(path.parent.left) &&
            path.parent.left.object.name === '__webpack_require__' &&
            path.parent.left.property.name === 'l',
        );
        if (
          !!parent &&
          t.isArrowFunctionExpression(parent.node) &&
          t.isAssignmentExpression(path.node) &&
          t.isMemberExpression(path.node.left) &&
          path.node.left.object.name === 'script' &&
          path.node.left.property.name === 'src' &&
          path.node.right.name === 'url'
        ) {
          path.node.right = t.identifier(`url + "?hash=${opts.hash}"`);
        }
      },
    },
  };
}
