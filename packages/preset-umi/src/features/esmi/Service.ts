import { axios } from '@umijs/utils';
import type { IApi } from '../../types';

export interface IImportmapData {
  importMap: {
    imports: Record<string, string>;
    scopes: Record<string, any>;
  };
  deps: {
    name: string;
    version: string;
    type: string;
  }[];
}

export interface IPkgData {
  pkgJsonContent: IApi['pkg'];
  pkgInfo: {
    name: string;
    version: string;
    type: 'esm';
    exports: {
      name: string;
      path: string;
      from: string;
      deps: {
        name: string;
        version: string;
        usedMap: Record<
          string,
          {
            usedNamespace?: boolean;
            usedDefault?: boolean;
            usedNames: string[];
          }
        >;
      }[];
    }[];
    assets: any[];
  };
}

/**
 * class for connect esmi server
 */
export default class ESMIService {
  cdnOrigin: string = '';

  constructor(opts: { cdnOrigin: string }) {
    this.cdnOrigin = opts.cdnOrigin;
  }

  /**
   * build importmap from deps tree
   * @param data  package data
   * @returns ticketId
   */
  async build(data: IPkgData) {
    return axios
      .post<{ success: boolean; data?: { ticketId?: string } }>(
        `${this.cdnOrigin}/api/v1/esm/build`,
        data,
      )
      .then((a) => a.data.data?.ticketId);
  }

  /**
   * get importmap from deps tree
   * @param data  package data
   * @returns importmap
   */
  async getImportmap(data: IPkgData) {
    // get the build ticket id
    const ticketId = await this.build(data);
    // continue to the next request after 1s
    const next = () =>
      new Promise<IImportmapData | undefined>((resolve) =>
        setTimeout(() => resolve(deferrer()), 2000),
      );
    const deferrer = (): Promise<IImportmapData | undefined> => {
      return axios
        .get<{ success: boolean; data?: IImportmapData }>(
          `${this.cdnOrigin}/api/v1/esm/importmap/${ticketId}`,
        )
        .then((res) => (res.data.success ? res.data.data : next()), next);
    };

    // TODO: timeout + time spend log

    return deferrer();
  }
}
