import React, { PropsWithChildren } from 'react';

enum MessageType {
  Info = 'info',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
}

interface MessageProps {
  type?: MessageType;
  emoji?: string;
}

function Message(props: PropsWithChildren<MessageProps>) {
  const messageType = props.type || 'info';

  let messageClass: string;
  switch (messageType) {
    case MessageType.Success:
      messageClass = 'mdx-message-success';
      break;
    case MessageType.Warning:
      messageClass = 'mdx-message-warning';
      break;
    case MessageType.Error:
      messageClass = 'mdx-message-error';
      break;
    default:
      messageClass = 'mdx-message-info';
  }

  const messageText =
    typeof props.children === 'string'
      ? props.children
      : (props.children as React.ReactElement).props.children;

  return (
    <>
      <div
        className={`w-full py-3 px-4 rounded-lg my-4 mdx-message ${messageClass}`}
      >
        <p>
          {props.emoji && (
            <span role="img" className="mr-3 inline">
              {props.emoji}
            </span>
          )}
          {messageText}
        </p>
      </div>
    </>
  );
}

export default Message;
