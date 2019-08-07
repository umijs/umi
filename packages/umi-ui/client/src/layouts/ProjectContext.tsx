import { createContext } from 'react';
import { IUi } from 'umi-types';
import { IProjectStatus } from '@/enums';

export interface IProjectContext extends IUi.IContext {
  current: IProjectStatus;
  setCurrent: (current: IProjectStatus) => void;
}

const ProjectContext = createContext({} as IProjectContext);

export default ProjectContext;
