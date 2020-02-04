import { IProjectList, IProjectStatus } from '@/enums';

export { default as create } from './create';
export { default as import } from './import';
export { default as list } from './list';
export { default as progress } from './progress';

export interface IProjectProps {
  cwd?: string;
  files: string[];
  current?: IProjectStatus;
  currentData?: object;
  projectList: IProjectList;
}
