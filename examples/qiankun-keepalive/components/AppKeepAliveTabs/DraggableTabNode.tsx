import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

interface DraggableTabNodeProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  children: React.ReactElement;
}

/** Draggable tab node for horizontal sorting */
const DraggableTabNode: React.FC<DraggableTabNodeProps> = (props) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(
      transform ? { ...transform, y: 0 } : null,
    ),
    transition,
    cursor: 'grab',
  };

  return React.cloneElement(props.children, {
    ref: setNodeRef,
    style,
    ...attributes,
    ...listeners,
  });
};

export default DraggableTabNode;
