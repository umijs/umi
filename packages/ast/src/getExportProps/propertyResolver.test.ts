import { parser, t } from '@umijs/utils';
import { LITERAL_NODE_RESOLVERS, NODE_RESOLVERS } from './propertyResolver';

test('literal', () => {
  const node = parser.parseExpression(`{
    a: 0,
    b: '1',
    c: true,
    d: null,
    e: undefined,
    f() {},
    g: () => {},
    h: [0, '1', function () {}, ...arr],
    i: {
      aa() {},
      bb: 1,
    },
    ...obj,
  }`);
  expect(t.isObjectExpression(node)).toBe(true);
  if (!t.isObjectExpression(node)) return;

  const resolver = LITERAL_NODE_RESOLVERS.find((resolver) => resolver.is(node));
  expect(resolver && resolver.get(node as any)).toEqual({
    a: 0,
    b: '1',
    c: true,
    d: null,
    e: undefined,
    h: [0, '1'],
    i: {
      bb: 1,
    },
  });
});

test('normal', () => {
  const node = parser.parseExpression(`{
    a: 0,
    b: '1',
    c: true,
    d: null,
    e: undefined,
    f() {},
    g: () => {},
    h: [0, '1', function () {}, ...arr],
    i: {
      aa() {},
      bb: 1,
    },
    ...obj,
  }`);
  expect(t.isObjectExpression(node)).toBe(true);
  if (!t.isObjectExpression(node)) return;

  const resolver = NODE_RESOLVERS.find((resolver) => resolver.is(node));
  expect(resolver && resolver.get(node as any)).toEqual({
    a: 0,
    b: '1',
    c: true,
    d: null,
    e: undefined,
    f: expect.any(Function),
    g: expect.any(Function),
    h: [0, '1', expect.any(Function)],
    i: {
      aa: expect.any(Function),
      bb: 1,
    },
  });
});
