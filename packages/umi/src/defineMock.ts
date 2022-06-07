import type { RequestHandler } from '@umijs/bundler-webpack/compiled/express';

type MockDeclare =
  | string
  | number
  | null
  | undefined
  | boolean
  | Record<string, any>
  | RequestHandler;

export function defineMock(mockData: { [key: string]: MockDeclare }) {
  return mockData;
}
