import { createContext } from 'react';
import { IUiApi } from 'umi-types';

const UIApiContext = createContext({} as { api: IUiApi });

export default UIApiContext;
