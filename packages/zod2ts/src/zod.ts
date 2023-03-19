/**
 * @refer Fork from https://github.com/sachinraja/zod-to-ts
 */
import type { ZodTypeAny } from '@umijs/utils/compiled/zod';
import { IZodToTsOpts, LiteralType } from './types';

export const zodToTs = (opts: IZodToTsOpts): string => {
  const { zod, identifier = 'Identifier', options = {} } = opts;
  const { typeName } = zod?._def;
  const props = { identifier, options } as Partial<IZodToTsOpts>;

  switch (typeName) {
    case 'ZodString':
      return 'string';
    case 'ZodNumber':
      return 'number';
    case 'ZodBigInt':
      return 'bigint';
    case 'ZodBoolean':
      return 'boolean';
    case 'ZodDate':
      return 'Date';
    case 'ZodUndefined':
      return 'undefined';
    case 'ZodNull':
      return 'null';
    case 'ZodVoid':
      return '(void | undefined)';
    case 'ZodAny':
      return 'any';
    case 'ZodUnknown':
      return 'unknown';
    case 'ZodNever':
      return 'never';
    case 'ZodLazy': {
      return 'any';
    }
    case 'ZodLiteral': {
      // z.literal('hi') -> 'hi'
      let literal: string;

      const literalValue = zod._def.value as LiteralType;
      switch (typeof literalValue) {
        case 'number':
          literal = 'number';
          break;
        case 'boolean':
          if (literalValue === true) {
            literal = 'true';
          } else {
            literal = 'false';
          }
          break;
        default:
          literal = `"${literalValue}"`;
          break;
      }

      return literal;
    }
    case 'ZodObject': {
      const properties = Object.entries(zod._def.shape());

      const members: Array<[string, string, string | undefined]> =
        properties.map(([key, value]) => {
          const nextZodNode = value as ZodTypeAny;

          const type = zodToTs({
            zod: nextZodNode,
            ...props,
          });

          const { typeName: nextZodNodeTypeName } = nextZodNode._def;
          const isOptional =
            nextZodNodeTypeName === 'ZodOptional' || nextZodNode.isOptional();

          let desc: string | undefined;
          if (nextZodNode.description) {
            desc = nextZodNode.description;
          }

          if (key.includes('-')) {
            key = `"${key}"`;
          }
          if (isOptional) {
            key = `${key}?`;
          }

          return [key, type, desc];
        });
      return `{\n${members
        .map(([key, type, desc]) => {
          return [
            desc?.length && `    /** ${desc} */`,
            /*           */ `    ${key}: ${type};`,
          ]
            .filter(Boolean)
            .join('\n');
        })
        .join('\n')}\n}`;
    }

    case 'ZodArray': {
      const type = zodToTs({ zod: zod._def.type, ...props });
      const node = `Array<${type}>`;
      return node;
    }

    case 'ZodEnum': {
      // z.enum['a', 'b', 'c'] -> 'a' | 'b' | 'c'
      const types = zod._def.values.map((value: string) => {
        return `"${value}"`;
      });
      const union = types.join(' | ');
      return union;
    }

    case 'ZodUnion': {
      // z.union([z.string(), z.number()]) -> string | number
      const options: ZodTypeAny[] = zod._def.options;

      const types: string[] = options.map((option) => zodToTs({ zod: option }));
      return types.join(' | ');
    }

    case 'ZodDiscriminatedUnion': {
      // z.discriminatedUnion('kind', [z.object({ kind: z.literal('a'), a: z.string() }), z.object({ kind: z.literal('b'), b: z.number() })]) -> { kind: 'a', a: string } | { kind: 'b', b: number }
      const options: ZodTypeAny[] = [...zod._def.options.values()];
      const types: string[] = options.map((option) =>
        zodToTs({ zod: option, ...props }),
      );
      return types.join(' | ');
    }

    case 'ZodEffects': {
      // ignore any effects, they won't factor into the types
      const node = zodToTs({
        zod: zod._def.schema,
        ...props,
      });
      return node;
    }

    case 'ZodNativeEnum': {
      return 'any';
    }

    case 'ZodOptional': {
      const innerType = zodToTs({
        zod: zod._def.innerType,
        ...props,
      });
      return `(${innerType} | undefined)`;
    }

    case 'ZodNullable': {
      const innerType = zodToTs({
        zod: zod._def.innerType,
        ...props,
      });
      return `(${innerType} | null)`;
    }

    case 'ZodTuple': {
      // z.tuple([z.string(), z.number()]) -> [string, number]
      const types = zod._def.items.map((option: ZodTypeAny) =>
        zodToTs({ zod: option, ...props }),
      );
      return `[${types.join(', ')}]`;
    }

    case 'ZodRecord': {
      // z.record(z.number()) -> { [x: string]: number }
      const valueType = zodToTs({
        zod: zod._def.valueType,
        ...props,
      });

      return `{ [x: string]: ${valueType} }`;
    }

    case 'ZodMap': {
      // z.map(z.string()) -> Map<string>
      const valueType = zodToTs({
        zod: zod._def.valueType,
        ...props,
      });
      const keyType = zodToTs({
        zod: zod._def.keyType,
        ...props,
      });

      return `Map<${keyType}, ${valueType}>`;
    }

    case 'ZodSet': {
      // z.set(z.string()) -> Set<string>
      const type = zodToTs({
        zod: zod._def.valueType,
        ...props,
      });
      return `Set<${type}>`;
    }

    case 'ZodIntersection': {
      // z.number().and(z.string()) -> number & string
      const left = zodToTs({
        zod: zod._def.left,
        ...props,
      });
      const right = zodToTs({
        zod: zod._def.right,
        ...props,
      });
      return `${left} & ${right}`;
    }

    case 'ZodPromise': {
      // z.promise(z.string()) -> Promise<string>
      const type = zodToTs({
        zod: zod._def.type,
        ...props,
      });
      return `Promise<${type}>`;
    }

    case 'ZodFunction': {
      // z.function().args(z.string()).returns(z.number()) -> (args_0: string) => number
      const argTypes = zod._def.args._def.items.map(
        (arg: ZodTypeAny, index: number) => {
          const argType = zodToTs({
            zod: arg,
            ...props,
          });
          return `args_${index}: ${argType}`;
        },
      );

      argTypes.push('...args: any[]');

      const returnType = zodToTs({
        zod: zod._def.returns,
        ...props,
      });

      return `((${argTypes.join(', ')}) => ${returnType})`;
    }

    case 'ZodDefault': {
      // z.string().optional().default('hi') -> string
      const type = zodToTs({
        zod: zod._def.innerType,
        ...props,
      });
      return type;
    }
  }

  return 'any';
};
