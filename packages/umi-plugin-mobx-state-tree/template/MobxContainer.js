import { Component } from "react";
import { Provider } from "mobx-react";
import DevTools from "mobx-react-devtools";

class MobxContainer extends Component {
  render() {
    return (
      <Provider stores={window.mobx_app.mobx_stores}>
        <div>
          {this.props.children}
          {window.mobx_app.devTools && <DevTools />}
        </div>
      </Provider>
    );
  }
}

export default MobxContainer;
