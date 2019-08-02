import { createContext } from 'react';
import { IProjectStatus } from '@/enums';

export interface IProjectContext {
  current: IProjectStatus;
  setCurrent: (current: IProjectStatus) => void;
}

const ProjectContext = createContext({} as IProjectContext);

export default ProjectContext;
