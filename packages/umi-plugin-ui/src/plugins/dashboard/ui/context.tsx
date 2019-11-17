import { createContext } from 'react';
import { IUiApi, IUi } from 'umi-types';

const UIContext = createContext({} as { api: IUiApi });

export default UIContext;
