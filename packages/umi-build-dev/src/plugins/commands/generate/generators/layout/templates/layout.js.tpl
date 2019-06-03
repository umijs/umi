<% if (isTypeScript) { %>
import React from 'react';
<% } %>
import styles from './<%= name %>.<%= cssExt %>';

export default function(props) {
  return (
    <div className={styles.normal}>
      <h1><%= title %></h1>
      {
        props.children
      }
    </div>
  );
}
