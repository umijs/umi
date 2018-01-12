import { Router as DefaultRouter, Route, Switch } from 'react-router-dom';
import dynamic from '<%= libraryName %>/dynamic';
import { default as event, Events } from '<%= libraryName %>/event';
<%= codeForPlugin %>

const Router = window.g_CustomRouter || DefaultRouter;

export default function() {

  function hoc(Component) {
    class App extends React.Component {
      componentDidMount() {
        event.emit(Events.PAGE_INITIALIZED);
      }
      render() {
        return <Component {...this.props} />
      }
    }
    return App;
  }

  return (
<%= routeComponents %>
  );
}
