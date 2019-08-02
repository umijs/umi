import React from 'react';
import { Divider, PageHeader } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import { PROJECT_STATUS, IProjectStatus } from '@/enums';
import ProjectContext from './ProjectContext';
import styles from './Project.less';

interface IProjectProps {}

interface IProjectState {
  /** current step in project */
  current: IProjectStatus;
}

const projectMap = {};

class Project extends React.PureComponent<IProjectProps, IProjectState> {
  constructor(props) {
    super(props);
    this.state = {
      current: PROJECT_STATUS.list,
    };
  }
  setCurrent = (current: IProjectStatus) => {
    this.setState({
      current,
    });
  };
  handleBackClick = () => {
    const { current } = this.state;
    if (current !== 'list') {
      this.setCurrent('list');
    }
  };
  render() {
    const { current } = this.state;
    return (
      <ProjectContext.Provider
        value={{
          current,
          setCurrent: this.setCurrent,
        }}
      >
        <div className={styles['project-l']}>
          {current !== 'list' && (
            <PageHeader
              title={formatMessage({ id: `org.umi.ui.global.project.${current}.title` })}
              onBack={() => {}}
            />
          )}
          <div>{this.props.children}</div>
        </div>
      </ProjectContext.Provider>
    );
  }
}

export default Project;
