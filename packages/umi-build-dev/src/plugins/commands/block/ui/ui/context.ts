import { createContext } from 'react';
import { IUiApi } from 'umi-types';

const UIContext = createContext({} as { api: IUiApi });

export default UIContext;
