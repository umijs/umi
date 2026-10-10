import { history, useLocation } from '@umijs/max';
import React, { type MouseEvent } from 'react';

export interface TabNode {
  /** react-activation cache name, e.g. qiankun_/app1/ */
  name: string;
  /** route to open when clicking the tab */
  path: string;
  title: string;
}

interface TabProps {
  node: TabNode;
  nodes: TabNode[];
  onDropTab: (names: string[]) => void;
}

export default function Tab({ node, nodes, onDropTab }: TabProps) {
  const location = useLocation();
  const isActive = location.pathname === node.path;

  function dropTab(e: MouseEvent) {
    e.stopPropagation();
    if (isActive) {
      const rest = nodes.filter((d) => d.name !== node.name);
      const next = rest[rest.length - 1];
      history.push(next?.path || '/');
      setTimeout(() => onDropTab([node.name]), 16);
    } else {
      onDropTab([node.name]);
    }
  }

  return (
    <span
      className={`keepalive-tab${isActive ? ' active' : ''}`}
      onClick={() => history.push(node.path)}
    >
      <span className="keepalive-tab__title">{node.title}</span>
      {nodes.length > 1 || !isActive ? (
        <button
          type="button"
          className="keepalive-tab__close"
          onClick={dropTab}
          aria-label="close"
        >
          ×
        </button>
      ) : null}
    </span>
  );
}
