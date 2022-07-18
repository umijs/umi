import { prepare } from './prepare';

export type Context = Awaited<ReturnType<typeof prepare>>;
export type ContextKey = keyof Context;
