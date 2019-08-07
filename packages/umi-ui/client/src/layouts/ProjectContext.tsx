import { createContext } from 'react';
import { IUi } from 'umi-types';
import { IProjectStatus } from '@/enums';

export interface IProjectContext extends IUi.IContext {
  current: IProjectStatus;
  currentData?: object;
  setCurrent: (current: IProjectStatus, payload?: object) => void;
}

const ProjectContext = createContext({} as IProjectContext);

export default ProjectContext;
