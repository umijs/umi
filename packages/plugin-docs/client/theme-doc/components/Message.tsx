import React, { PropsWithChildren } from "react"

enum MessageType {
  Info = "info",
  Success = "success",
  Warning = "warning",
  Error = "error",
}

interface MessageProps {
  type?: MessageType
  emoji?: string
}

function Message(props: PropsWithChildren<MessageProps>) {
  let bgColor = 'bg-blue-50';
  let textColor = 'text-blue-900';

  switch (props.type) {
    case MessageType.Success:
      bgColor = 'bg-green-50';
      textColor = 'text-green-900';
      break;
    case MessageType.Warning:
      bgColor = 'bg-orange-50';
      textColor = 'text-orange-900';
      break;
    case MessageType.Error:
      bgColor = 'bg-red-50';
      textColor = 'text-red-900';
      break;
  }

  return <>
    <div
      className={`w-full py-3 px-4 ${bgColor} ${textColor} rounded-lg my-2`}>
      {props.emoji && <span role="img" className="mr-3">
        {props.emoji}
      </span>}
      {props.children}
    </div>
  </>
}

export default Message
