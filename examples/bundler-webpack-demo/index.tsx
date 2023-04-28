import { BrowserHistory, createBrowserHistory } from 'history';
import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Router, Routes, useRoutes } from 'react-router-dom';
import { TodoList } from './pages/todoList';
import { useTraceUpdate } from './useTraceUpdate';

function App(props: any) {
  let historyRef = React.useRef<BrowserHistory>();
  if (historyRef.current == null) {
    historyRef.current = createBrowserHistory({ window });
  }

  let history = historyRef.current;
  let [state, setState] = React.useState({
    action: history.action,
    location: history.location,
  });
  React.useLayoutEffect(() => history.listen(setState), [history]);
  return (
    <div>
      {/*<Browser navigator={history} location={state.location} />*/}
      <Router navigator={history} location={state.location}>
        {props.children}
      </Router>
    </div>
  );
}

function Loading() {
  return <div>Loading...</div>;
}

export function BrowserRouter({ basename, children, window }: any) {
  let historyRef = React.useRef<BrowserHistory>();
  if (historyRef.current == null) {
    historyRef.current = createBrowserHistory({ window });
  }

  let history = historyRef.current;
  let [state, setState] = React.useState({
    action: history.action,
    location: history.location,
  });

  React.useLayoutEffect(() => history.listen(setState), [history]);

  console.log('browser router render', state.location);

  return (
    <Router
      basename={basename}
      children={children}
      // @ts-ignore
      action={state.action}
      location={state.location}
      navigator={history}
    />
  );
}

// @ts-ignore
function Browser(props: any) {
  useTraceUpdate({ ...props, name: 'browser' });

  return (
    <Router navigator={props.navigator} location={props.location}>
      <Routes>
        <Route
          path="/"
          element={
            <React.Suspense fallback={<Loading />}>
              <Layout />
            </React.Suspense>
          }
        >
          <Route path="/foo" element={<Foo />} />
          <Route path="/bar" element={<Bar />} />
        </Route>
      </Routes>
    </Router>
  );
}

function Foo() {
  return <div>Foo</div>;
}

function Bar() {
  return <div>Bar</div>;
}

function SuspenseLayout() {
  const Layout = React.lazy(() => import('./Layout'));
  return (
    <React.Suspense fallback={<Loading />}>
      <Layout />
    </React.Suspense>
  );
}

const routes = [
  {
    path: '/',
    element: <SuspenseLayout />,
    children: [
      {
        path: '/foo',
        element: <Foo />,
      },
      {
        path: '/bar',
        element: <Bar />,
      },
      {
        path: '/todolist',
        element: <TodoList />,
      },
    ],
  },
];

function Routes2() {
  console.log('routes 2 render');
  return useRoutes(routes);
}

function Routes3() {
  console.log('routes 3 render');
  return (
    <Routes>
      <Route path="/" element={<SuspenseLayout />}>
        <Route path="/foo" element={<Foo />} />
        <Route path="/bar" element={<Bar />} />
      </Route>
    </Routes>
  );
}

function Entry() {
  return (
    <App>
      <Routes4 />
      {/*<Routes4>*/}
      {/*  <Route path="/" element={<SuspenseLayout />}>*/}
      {/*    <Route path="/foo" element={<Foo />} />*/}
      {/*    <Route path="/bar" element={<Bar />} />*/}
      {/*  </Route>*/}
      {/*</Routes4>*/}
    </App>
  );
}

export function Routes4() {
  return useRoutes(routes);
}

// @ts-ignore
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Entry />);
