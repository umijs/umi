import React, { type FC, type ReactNode } from 'react';

// fake provider for renderer-react
export const HelmetProvider: FC<{ children: ReactNode }> = (props) => (
  <>{props.children}</>
);

// fake component for user import
export const Helmet: FC = () => {
  throw new Error(
    '`Helmet` component is not available now, because this project has `helmet: false` set in config file.',
  );
};
