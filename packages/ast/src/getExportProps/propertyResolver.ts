import { t } from '@umijs/utils';

interface IResolver<U> {
  is(src: any): boolean;
  get(src: U): any;
}

const StringResolver: IResolver<t.StringLiteral> = {
  is(src) {
    return t.isStringLiteral(src);
  },
  get(src) {
    return src.value;
  },
};

const NumberResolver: IResolver<t.NumericLiteral> = {
  is(src) {
    return t.isNumericLiteral(src);
  },
  get(src) {
    return src.value;
  },
};

const BooleanResolver: IResolver<t.BooleanLiteral> = {
  is(src) {
    return t.isBooleanLiteral(src);
  },
  get(src) {
    return src.value;
  },
};

const NullResolver: IResolver<t.NullLiteral> = {
  is(src) {
    return t.isNullLiteral(src);
  },
  get(src) {
    return null;
  },
};

const UndefinedResolver: IResolver<t.Identifier> = {
  is(src) {
    return t.isIdentifier(src) && src.name === 'undefined';
  },
  get(src) {
    return undefined;
  },
};

const ObjectLiteralResolver: IResolver<t.ObjectExpression> = {
  is(src) {
    return t.isObjectExpression(src);
  },
  get(src) {
    return findObjectLiteralProperties(src);
  },
};

const ObjectResolver: IResolver<t.ObjectExpression> = {
  is(src) {
    return t.isObjectExpression(src);
  },
  get(src) {
    return findObjectMembers(src);
  },
};

const ClassResolver: IResolver<t.Class> = {
  is(src) {
    return t.isClass(src);
  },
  get(src) {
    return findClassStaticProperty(src);
  },
};

const ArrayLiteralResolver: IResolver<t.ArrayExpression> = {
  is(src) {
    return t.isArrayExpression(src);
  },
  get(src) {
    return findArrayLiteralElements(src);
  },
};

const ArrayResolver: IResolver<t.ArrayExpression> = {
  is(src) {
    return t.isArrayExpression(src);
  },
  get(src) {
    return findArrayElements(src);
  },
};

const FunctionResolver: IResolver<t.FunctionExpression> = {
  is(src) {
    return t.isFunctionExpression(src);
  },
  get(src) {
    return function () {};
  },
};

const ArrowFunctionResolver: IResolver<t.ArrowFunctionExpression> = {
  is(src) {
    return t.isArrowFunctionExpression(src);
  },
  get(src) {
    return () => {};
  },
};

export const LITERAL_NODE_RESOLVERS = [
  StringResolver,
  NumberResolver,
  BooleanResolver,
  NullResolver,
  UndefinedResolver,
  ObjectLiteralResolver,
  ArrayLiteralResolver,
];

export const NODE_RESOLVERS = [
  StringResolver,
  NumberResolver,
  BooleanResolver,
  NullResolver,
  UndefinedResolver,
  ObjectResolver,
  ArrayResolver,
  ClassResolver,
  FunctionResolver,
  ArrowFunctionResolver,
];

export function findObjectLiteralProperties(node: t.ObjectExpression) {
  const target = {};
  node.properties.forEach((p) => {
    if (t.isObjectProperty(p) && t.isIdentifier(p.key)) {
      const resolver = LITERAL_NODE_RESOLVERS.find((resolver) =>
        resolver.is(p.value),
      );
      if (resolver) {
        target[p.key.name] = resolver.get(p.value as any);
      }
    }
  });
  return target;
}

export function findObjectMembers(node: t.ObjectExpression) {
  const target = {};
  node.properties.forEach((p) => {
    if (t.isObjectMember(p) && t.isIdentifier(p.key)) {
      if (t.isObjectMethod(p)) {
        target[(p.key as any).name] = () => {};
      } else {
        const resolver = NODE_RESOLVERS.find((resolver) =>
          resolver.is(p.value),
        );
        if (resolver) {
          target[(p.key as any).name] = resolver.get(p.value as any);
        }
      }
    }
  });
  return target;
}

export function findClassStaticProperty(node: t.Class) {
  function isStaticNode(
    p: any,
  ): p is
    | t.ClassMethod
    | t.ClassPrivateMethod
    | t.ClassProperty
    | t.ClassPrivateProperty
    | t.TSDeclareMethod {
    return 'static' in p && p.static === true;
  }

  let body = node.body;
  if (!t.isClassBody(body)) return;

  const target = {};
  body.body.forEach((p) => {
    if (isStaticNode(p) && t.isIdentifier(p.key)) {
      if (t.isMethod(p) || t.isTSDeclareMethod(p)) {
        target[(p.key as t.Identifier).name] = () => {};
      } else {
        const resolver = NODE_RESOLVERS.find((resolver) =>
          resolver.is(p.value),
        );
        if (resolver) {
          target[(p.key as t.Identifier).name] = resolver.get(p.value as any);
        }
      }
    }
  });
  return target;
}

export function findArrayLiteralElements(node: t.ArrayExpression) {
  const target: any[] = [];
  node.elements.forEach((p) => {
    const resolver = LITERAL_NODE_RESOLVERS.find((resolver) => resolver.is(p));
    if (resolver) {
      target.push(resolver.get(p as any));
    }
  });
  return target;
}

export function findArrayElements(node: t.ArrayExpression) {
  const target: any[] = [];
  node.elements.forEach((p) => {
    const resolver = NODE_RESOLVERS.find((resolver) => resolver.is(p));
    if (resolver) {
      target.push(resolver.get(p as any));
    }
  });
  return target;
}
