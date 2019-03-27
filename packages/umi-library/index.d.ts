import { IBundleOptions, IOpts } from './src/types';

export { IBundleOptions, IOpts };
export function build(opts: IOpts): Promise<any>;

export interface IDocOpts {
  cwd: string;
  cmd: string;
  params?: any;
  userConfig?: any;
}

interface IDoc {
  devOrBuild(opts: IDocOpts): Promise<any>;
}

export const doc: IDoc;
