import React from 'react';
import { MobXProviderContext } from 'mobx-react';

export default (name: string) => React.useContext(MobXProviderContext)[name];
