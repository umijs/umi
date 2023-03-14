import { zod as z } from '@umijs/utils';
import ts from 'typescript';
import { printNode, withGetType, zodToTs } from '.';

export const printNodeTest = (node: ts.Node) =>
  printNode(node, { newLine: ts.NewLineKind.LineFeed });

test('zod default', () => {
  enum Fruits {
    Apple = 'apple',
    Banana = 'banana',
    Cantaloupe = 'cantaloupe',
    A = 5,
  }

  const example2 = z.object({
    a: z.string(),
    b: z.number(),
    c: z.array(z.string()).nonempty().length(10),
    d: z.object({
      e: z.string(),
    }),
  });

  const pickedSchema = example2.partial();

  const nativeEnum = withGetType(z.nativeEnum(Fruits), (ts, _, options) => {
    const identifier = ts.factory.createIdentifier('Fruits');

    if (options.resolveNativeEnums) return identifier;

    return ts.factory.createTypeReferenceNode(identifier, undefined);
  });

  type ELazy = {
    a: string;
    b: ELazy;
  };

  const eLazy: z.ZodSchema<ELazy> = withGetType(
    z.lazy(() => e3),
    (ts, identifier) =>
      ts.factory.createIndexedAccessTypeNode(
        ts.factory.createTypeReferenceNode(
          ts.factory.createIdentifier(identifier),
          undefined,
        ),
        ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral('b')),
      ),
  );

  const e3 = z.object({
    a: z.string(),
    b: eLazy,
  });

  const dateType = withGetType(z.instanceof(Date), (ts) =>
    ts.factory.createIdentifier('Date'),
  );

  const example = z.object({
    a: z.string(),
    b: z.number(),
    c: z.array(
      z.object({
        a: z.string(),
      }),
    ),
    d: z.boolean(),
    e: eLazy,
    f: z.union([z.object({ a: z.number() }), z.literal('hi')]),
    g: z.enum(['hi', 'bye']),
    h: z
      .number()
      .and(z.bigint())
      .and(z.number().and(z.string()))
      .transform((arg) => console.log(arg)),
    i: z.date(),
    j: z.undefined(),
    k: z.null(),
    l: z.void(),
    m: z.any(),
    n: z.unknown(),
    o: z.never(),
    p: z.optional(z.string()),
    q: z.nullable(pickedSchema),
    r: z.tuple([z.string(), z.number(), z.object({ name: z.string() })]),
    s: z.record(
      z.object({
        de: z.object({
          me: z
            .union([
              z.tuple([z.string(), z.object({ a: z.string() })]),
              z.bigint(),
            ])
            .array(),
        }),
      }),
    ),
    t: z.map(z.string(), z.array(z.object({ p: z.string() }))),
    u: z.set(z.string()),
    v: z.intersection(z.string(), z.number()).or(z.bigint()),
    w: z.promise(z.number()),
    x: z
      .function()
      .args(z.string().nullish().default('heo'), z.boolean(), z.boolean())
      .returns(z.string()),
    y: z.string().optional().default('hi'),
    z: z
      .string()
      .refine((val) => val.length > 10)
      .or(z.number())
      .and(z.bigint().nullish().default(1000n)),
    aa: nativeEnum,
    bb: dateType,
    cc: z.lazy(() => z.string()),
    dd: z.nativeEnum(Fruits),
    ee: z.discriminatedUnion('kind', [
      z.object({ kind: z.literal('circle'), radius: z.number() }),
      z.object({ kind: z.literal('square'), x: z.number() }),
      z.object({ kind: z.literal('triangle'), x: z.number(), y: z.number() }),
    ]),
  });

  const { node } = zodToTs(example, 'Example', { resolveNativeEnums: true });

  expect(printNodeTest(node)).toMatchSnapshot();
});

test('zod.discriminatedUnion()', () => {
  const ShapeSchema = z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('circle'), radius: z.number() }),
    z.object({ kind: z.literal('square'), x: z.number() }),
    z.object({ kind: z.literal('triangle'), x: z.number(), y: z.number() }),
  ]);

  const { node } = zodToTs(ShapeSchema, 'Shape');

  expect(printNodeTest(node)).toMatchSnapshot();
});

test('zod.object()', () => {
  const userSchema = z.object({
    username: z.string(),
    age: z.number(),
    isAdmin: z.boolean(),
    createdAt: z.date(),
    undef: z.undefined(),
    nu: z.null(),
    vo: z.void(),
    an: z.any(),
    unknow: z.unknown(),
    nev: z.never(),
  });

  const { node } = zodToTs(userSchema, 'User');

  expect(printNodeTest(node)).toMatchSnapshot();
});

test('zod.describe()', () => {
  const schema = z.object({
    name: z.string().describe('The name of the item'),
    price: z.number().describe('The price of the item'),
  });

  const { node } = zodToTs(schema);

  expect(printNodeTest(node)).toMatchSnapshot();
});

test('zod.optional()', () => {
  const OptionalStringSchema = z.string().optional();
  const schema = z.object({
    optional: OptionalStringSchema,
    required: z.string(),
    transform: z
      .number()
      .optional()
      .transform((arg) => arg),
    or: z.number().optional().or(z.string()),
    tuple: z
      .tuple([
        z.string().optional(),
        z.number(),
        z.object({
          optional: z.string().optional(),
          required: z.string(),
        }),
      ])
      .optional(),
  });

  const { node } = zodToTs(schema);

  expect(printNodeTest(node)).toMatchSnapshot();
});

test('zod.nullable()', () => {
  const schema = z.object({
    username: z.string().nullable(),
  });

  const { node } = zodToTs(schema);

  expect(printNodeTest(node)).toMatchSnapshot();
});

test('zod enum', () => {
  enum Fruit {
    Apple = 'apple',
    Banana = 'banana',
    Cantaloupe = 'cantaloupe',
  }

  enum Color {
    Red,
    Green,
    Blue,
  }

  const schema = z.object({
    fruit: withGetType(z.nativeEnum(Fruit), (ts) =>
      ts.factory.createIdentifier('Fruit'),
    ),
    color: withGetType(z.nativeEnum(Color), (ts) =>
      ts.factory.createIdentifier('Color'),
    ),
  });

  const { node, store } = zodToTs(schema);

  const enums = store.nativeEnums
    .map((item) => {
      return printNode(item);
    })
    .join('\n');

  expect(enums).toMatchSnapshot();
  expect(printNodeTest(node)).toMatchSnapshot();
});

test('zod.function()', () => {
  const schema = z
    .function()
    .args(z.string().nullish().default('name'), z.boolean(), z.boolean())
    .returns(z.string());
  const { node } = zodToTs(schema, 'Function');
  expect(printNodeTest(node)).toMatchSnapshot();
});

test('zod.function() 2', () => {
  const schema = z.object({
    h: z
      .function()
      .args(
        z.object({ name: z.string(), price: z.number(), comment: z.string() }),
      )
      .describe('create an item'),
  });

  const { node } = zodToTs(schema);
  expect(printNodeTest(node)).toMatchSnapshot();
});
