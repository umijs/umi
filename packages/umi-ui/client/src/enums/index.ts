export enum PROJECT_STATUS {
  /** 项目列表 */
  list = 'list',
  /** 导入项目 */
  import = 'import',
  /** 创建项目 */
  create = 'create',
}

export type IProjectStatus = keyof typeof PROJECT_STATUS;
