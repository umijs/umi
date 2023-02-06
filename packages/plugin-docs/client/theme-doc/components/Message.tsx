import cx from 'classnames';
import React, { PropsWithChildren } from 'react';

enum MessageType {
  Info = 'info',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
}

interface MessageProps {
  type?: MessageType;
  emoji?: string | boolean;
  title?: string;
  fontsize?: 'small';
}

function Message(props: PropsWithChildren<MessageProps>) {
  const messageType = props.type || MessageType.Info;
  const messageTitle = props.title;
  const propsChildren = props.children;

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

  let messageEmoji = props.emoji;
  if (!messageEmoji && messageEmoji !== false) {
    switch (messageType) {
      case MessageType.Success:
        messageEmoji = '🏆︎';
        break;
      case MessageType.Warning:
        messageEmoji = '🛎️';
        break;
      case MessageType.Error:
        messageEmoji = '⚠️';
        break;
      default:
        messageEmoji = '💡';
    }
  }

  return (
    <div
      className={cx(
        `flex w-full py-5 px-4 rounded-lg my-4 mdx-message ${messageClass}`,
        props.fontsize === 'small' && 'text-sm',
      )}
    >
      <span role="img" className="mr-3 dark:text-white">
        {messageEmoji}
      </span>
      <div className="flex-grow">
        {messageTitle && <h5 className="mt-0 mb-3">{messageTitle}</h5>}
        <div className="mdx-message-text">{propsChildren}</div>
      </div>
    </div>
  );
}

export default Message;
