import React from 'react';
import { formatMessage } from 'umi-plugin-locale';

interface ProjectProps {}

class Project extends React.PureComponent {
  render() {
    return (
      <div>
        <h1>UmiJS 项目管理器</h1>
        <div>{this.props.children}</div>
      </div>
    );
  }
}

export default Project;
