import type { DragEndEvent } from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable';
import { history, useAliveController, useLocation } from '@umijs/max';
import React, { useEffect, useMemo, useState } from 'react';
import DraggableTabNode from './DraggableTabNode';
import Tab, { type TabNode } from './Tab';
import './index.less';

declare global {
  interface Window {
    closeKeepAliveTab?: (pathName: string) => void;
  }
}

const MICRO_APP_PREFIXES = ['/app1', '/app2'] as const;

function titleFromPath(pathname: string) {
  for (const prefix of MICRO_APP_PREFIXES) {
    const label = prefix === '/app1' ? 'App1' : 'App2';
    if (pathname === prefix || pathname === `${prefix}/`) return label;
    if (pathname.startsWith(`${prefix}/`)) {
      return `${label} ${pathname.slice(prefix.length)}`;
    }
  }
  return pathname;
}

function toTabNode(pathname: string): TabNode {
  return {
    name: pathname,
    path: pathname,
    title: titleFromPath(pathname),
  };
}

function appPrefixOf(pathname: string) {
  return MICRO_APP_PREFIXES.find(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function qiankunCacheOf(prefix: string) {
  return `qiankun_${prefix}/`;
}

function dispatchDropSubNodes(tabNames: string[]) {
  if (typeof window !== 'undefined' && window.CustomEvent) {
    window.dispatchEvent(new CustomEvent('dropTab', { detail: tabNames }));
  }
}

/**
 * Master tab bar for page caches (pathname KeepAlive placeholders).
 * Ignores `qiankun_*` caches — those hold the real micro-app trees.
 */
export function AppKeepAliveTabs() {
  const { getCachingNodes, dropScope } = useAliveController();
  const caches = getCachingNodes();
  const location = useLocation();
  const [order, setOrder] = useState<string[]>([]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const cacheNames = useMemo(
    () =>
      (caches || [])
        .map((d) => d?.name)
        .filter(
          (name): name is string =>
            !!name && !name.includes('qiankun_') && !!appPrefixOf(name),
        ),
    [caches],
  );

  useEffect(() => {
    setOrder((prev) => [
      ...prev.filter((name) => cacheNames.includes(name)),
      ...cacheNames.filter((name) => !prev.includes(name)),
    ]);
  }, [cacheNames.join('|')]);

  useEffect(() => {
    if (!appPrefixOf(location.pathname)) return;
    setOrder((prev) =>
      prev.includes(location.pathname) ? prev : [...prev, location.pathname],
    );
  }, [location.pathname]);

  const onDropTab = (names: string[]) => {
    setOrder((prev) => {
      const next = prev.filter((n) => !names.includes(n));
      names.forEach((name) => {
        const prefix = appPrefixOf(name);
        if (!prefix) return;
        const stillHas = next.some((n) => appPrefixOf(n) === prefix);
        if (!stillHas) {
          dropScope(qiankunCacheOf(prefix));
        }
      });
      return next;
    });
    names.forEach((name) => dropScope(name));
    dispatchDropSubNodes(names);
  };

  const closeTab = (pathName: string) => {
    // Slave cleared its pages → drop the micro-app tree and leftover page tabs.
    if (pathName.includes('qiankun_')) {
      dropScope(pathName);
      const prefix =
        '/' + pathName.replace(/^qiankun_\/?/, '').replace(/\/$/, '');
      const toDrop = order.filter((n) => appPrefixOf(n) === prefix);
      if (toDrop.length) {
        onDropTab(toDrop);
      }
      if (appPrefixOf(location.pathname) === prefix) {
        history.push('/');
      }
      return;
    }

    if (!order.includes(pathName)) return;

    if (location.pathname === pathName) {
      const rest = order.filter((n) => n !== pathName);
      history.push(rest[rest.length - 1] || '/');
      setTimeout(() => onDropTab([pathName]), 16);
    } else {
      onDropTab([pathName]);
    }
  };

  useEffect(() => {
    window.closeKeepAliveTab = closeTab;
    return () => {
      window.closeKeepAliveTab = undefined;
    };
  });

  const nodes = order.map(toTabNode);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setOrder((prev) => {
      const oldIndex = prev.indexOf(String(active.id));
      const newIndex = prev.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  if (!nodes.length) return null;

  return (
    <div className="alive-tabs" data-tour="keep-alive-tabs">
      <DndContext
        sensors={sensors}
        onDragEnd={onDragEnd}
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
      >
        <SortableContext
          items={nodes.map((n) => n.name)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="alive-tabs__list">
            {nodes.map((node) => (
              <DraggableTabNode key={node.name} id={node.name}>
                <div className="alive-tabs__item">
                  <Tab node={node} nodes={nodes} onDropTab={onDropTab} />
                </div>
              </DraggableTabNode>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {nodes.length > 1 ? (
        <button
          type="button"
          className="alive-tabs__clear"
          onClick={() => {
            onDropTab(nodes.map((n) => n.name));
            history.push('/');
          }}
        >
          Close all
        </button>
      ) : null}
    </div>
  );
}
