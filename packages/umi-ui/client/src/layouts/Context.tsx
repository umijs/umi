import { createContext, Context } from 'react';
import { IUi } from 'umi-types';

const UIContext = createContext({} as IUi.IContext);

export default UIContext;
