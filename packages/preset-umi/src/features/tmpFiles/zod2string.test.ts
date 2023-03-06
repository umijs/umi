import { z } from '@umijs/utils/compiled/zod';
import { zod2string } from './zod2string';

test('normal', async () => {
  const zodProperties = z.object({
    hello: z.object({
      abc: z.array(z.string().max(22)),
      efg: z.optional(z.number()),
    }),
  });
  const str = zod2string(zodProperties);
  expect(str).toBe(
    'z.object({hello: z.object({abc: z.array(z.string().max(22)), efg: z.optional(z.number())})})',
  );
});
