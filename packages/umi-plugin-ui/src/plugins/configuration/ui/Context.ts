import { createContext } from 'react';
import { IUiApi, IUi } from 'umi-types';

const UIContext = createContext({} as { api: IUiApi; theme: IUi.ITheme });

export default UIContext;
