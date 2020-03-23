import { t } from '@umijs/utils';

interface IResolver<U> {
  is(src: any): boolean;
  get(src: U): any;
}

const StringResolver: IResolver<t.StringLiteral> = {
  is(src: any) {
    return t.isStringLiteral(src);
  },
  get(src) {
    return src.value;
  },
};

const NumberResolver: IResolver<t.NumericLiteral> = {
  is(src: any) {
    return t.isNumericLiteral(src);
  },
  get(src) {
    return src.value;
  },
};

const BooleanResolver: IResolver<t.BooleanLiteral> = {
  is(src: any) {
    return t.isBooleanLiteral(src);
  },
  get(src) {
    return src.value;
  },
};

const NullResolver: IResolver<t.NullLiteral> = {
  is(src: any) {
    return t.isNullLiteral(src);
  },
  get(src) {
    return null;
  },
};

const UndefinedResolver: IResolver<t.Identifier> = {
  is(src: any) {
    return t.isIdentifier(src) && src.name === 'undefined';
  },
  get(src) {
    return undefined;
  },
};

const ObjectResolver: IResolver<t.ObjectExpression> = {
  is(src: any) {
    return t.isObjectExpression(src);
  },
  get(src) {
    return findObjectProperties(src);
  },
};

const ArrayResolver: IResolver<t.ArrayExpression> = {
  is(src: any) {
    return t.isArrayExpression(src);
  },
  get(src) {
    return findArrayProperties(src);
  },
};

export const RESOLVABLE_WHITELIST = [
  StringResolver,
  NumberResolver,
  BooleanResolver,
  NullResolver,
  UndefinedResolver,
  ObjectResolver,
  ArrayResolver,
];

function findObjectProperties(node: t.ObjectExpression) {
  const target = {};
  node.properties.forEach((p) => {
    if (t.isObjectProperty(p) && t.isIdentifier(p.key)) {
      const resolver = RESOLVABLE_WHITELIST.find((resolver) =>
        resolver.is(p.value),
      );
      if (resolver) {
        target[p.key.name] = resolver.get(p.value as any);
      }
    }
  });
  return target;
}

function findArrayProperties(node: t.ArrayExpression) {
  const target: any[] = [];
  node.elements.forEach((p) => {
    const resolver = RESOLVABLE_WHITELIST.find((resolver) => resolver.is(p));
    if (resolver) {
      target.push(resolver.get(p as any));
    }
  });
  return target;
}
