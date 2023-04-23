import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export interface RouteComponentProps<T = ReturnType<typeof useParams>> {
  history?: {
    back: () => void;
    goBack: () => void;
    location: ReturnType<typeof useLocation>;
    push: (url: string, state?: any) => void;
  };
  location?: ReturnType<typeof useLocation>;
  match?: {
    params: T;
  };
  params?: T;
  navigate?: ReturnType<typeof useNavigate>;
}

export function withRouter<P extends RouteComponentProps<P>>(
  Component: React.ComponentType<P>,
) {
  function ComponentWithRouterProp(props: P) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    const match = { params };
    const history = {
      back: () => navigate(-1),
      goBack: () => navigate(-1),
      location,
      push: (url: string, state?: any) => navigate(url, { state }),
      replace: (url: string, state?: any) =>
        navigate(url, {
          replace: true,
          state,
        }),
    };

    return (
      <Component
        {...props}
        history={history}
        location={location}
        match={match}
        params={params}
        navigate={navigate}
      />
    );
  }

  return ComponentWithRouterProp;
}
