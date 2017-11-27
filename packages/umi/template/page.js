<% if (umi.useClass) { %>import { Component } from 'react';<% } %>
import styles from './<%= umi.fileName %>.css';

<% if (umi.useClass) { %>
class <%= umi.componentName %> extends Component () {
  return (
    <div className={styles.normal}>
      <%= umi.componentName %>
    </div>
  );
}

export default <%= umi.componentName %>;
<% } else { %>
export default function () {
  return (
    <div className={styles.normal}>
      <%= umi.componentName %>
    </div>
  );
}
<% } %>
