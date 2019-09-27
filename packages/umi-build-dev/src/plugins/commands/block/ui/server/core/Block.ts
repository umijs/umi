import { IApi } from 'umi-types';
import { Resource } from '../../../data.d';
import Flow from './Flow';

import { getFolderTreeData, getBlockList } from '../util';
import { routeExists, depthRouterConfig } from '../../../util';

class Block {
  public api: IApi;
  public flow: Flow;
  public send;
  public initFlag: boolean = false;

  constructor(api: IApi) {
    this.api = api;
  }

  public async run(args) {
    this.flow = new Flow({
      api: this.api,
    });
    this.flow.on('log', ({ data }) => {
      this.send({
        type: 'org.umi.block.add-blocks-log',
        payload: {
          data,
          id: this.flow.logger.id,
          success: true,
        },
      });
    });
    return this.flow.run(args);
  }

  public async cancel() {
    if (!this.flow) {
      return;
    }
    this.flow.cancel();
  }

  public getLog() {
    if (!this.flow) {
      return '';
    }
    return this.flow.getLog();
  }

  /**
   * 获取项目的路由
   */
  public depthRouterConfig() {
    return depthRouterConfig(this.api.getRoutes());
  }

  /**
   * 获取 page 下的目录结构
   */
  public getFolderTreeData() {
    const folderTreeData = getFolderTreeData(this.api.paths.absPagesPath);
    folderTreeData.unshift({
      title: '/',
      value: '/',
      key: '/',
    });
    return folderTreeData;
  }

  public async getBlockList(resourceId: string, list: Resource[]) {
    return getBlockList(resourceId, list);
  }

  public routeExists(path: string) {
    return routeExists(path, this.api.config.routes);
  }

  public getBlockUrl() {
    if (this.flow) {
      return this.flow.getBlockUrl();
    }
    return '';
  }

  public init(send) {
    if (this.initFlag) {
      return;
    }
    this.send = send;
    this.initFlag = true;
  }
}

export default Block;
